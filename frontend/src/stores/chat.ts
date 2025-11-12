import { defineStore, storeToRefs } from 'pinia'
import { ref, computed, readonly, watch } from 'vue'
import type { ChatMessage, ChatPresence } from '@/types/chat'
import { useUserStore } from '@/stores/user'

const CHANNEL_NAME = 'yanzu-chat-channel'
const MESSAGES_KEY = 'yanzu-chat-messages'
const PRESENCE_INTERVAL = 5000
const PRESENCE_TIMEOUT = 15000

const companions: ChatPresence[] = [
  {
    id: 'companion-yanzu',
    name: '彦祖小助手',
    status: 'online',
    lastActive: new Date().toISOString()
  },
  {
    id: 'companion-focus',
    name: '专注训练官',
    status: 'online',
    lastActive: new Date().toISOString()
  }
]

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const loadMessages = (): ChatMessage[] => {
  if (typeof localStorage === 'undefined') return []
  const raw = localStorage.getItem(MESSAGES_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as ChatMessage[]
    return parsed
  } catch (error) {
    console.error('Failed to parse chat messages', error)
    return []
  }
}

const persistMessages = (messages: ChatMessage[]) => {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages))
}

const supportsBroadcast = typeof window !== 'undefined' && 'BroadcastChannel' in window

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore()
  const { user } = storeToRefs(userStore)

  const messages = ref<ChatMessage[]>(loadMessages())
  const onlineUsers = ref<ChatPresence[]>([])
  const initialized = ref(false)

  let channel: BroadcastChannel | null = null
  let presenceTimer: number | null = null

  const ensureSystemWelcome = () => {
    if (messages.value.length === 0) {
      addSystemMessage('欢迎来到彦祖的导航站聊天室，和大家打个招呼吧！')
    }
  }

  const broadcast = (type: string, payload: any) => {
    if (!supportsBroadcast) return
    if (!channel) {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = handleChannelMessage
    }
    channel.postMessage({ type, payload })
  }

  const handleChannelMessage = (event: MessageEvent) => {
    const { type, payload } = event.data as { type: string; payload: any }
    if (type === 'message') {
      if (messages.value.some(message => message.id === payload.id)) return
      messages.value.push(payload)
      messages.value.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      persistMessages(messages.value)
    }

    if (type === 'presence') {
      updatePresence(payload)
    }
  }

  const updatePresence = (presence: ChatPresence) => {
    const now = Date.now()
    const list = onlineUsers.value.filter(user => now - new Date(user.lastActive).getTime() < PRESENCE_TIMEOUT)
    const index = list.findIndex(item => item.id === presence.id)
    if (index !== -1) {
      list[index] = { ...presence }
    } else {
      list.push({ ...presence })
    }
    onlineUsers.value = list
  }

  const prunePresence = () => {
    const now = Date.now()
    onlineUsers.value = onlineUsers.value.filter(
      presence => now - new Date(presence.lastActive).getTime() < PRESENCE_TIMEOUT
    )
  }

  const addSystemMessage = (content: string) => {
    const message: ChatMessage = {
      id: generateId(),
      authorId: 'system',
      authorName: '系统',
      content,
      createdAt: new Date().toISOString(),
      isSystem: true
    }
    messages.value.push(message)
    messages.value.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    persistMessages(messages.value)
    broadcast('message', message)
  }

  const sendMessage = (content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return

    const authorId = user.value?.id ?? 'guest'
    const authorName = user.value?.username ?? '游客'

    const message: ChatMessage = {
      id: generateId(),
      authorId,
      authorName,
      content: trimmed,
      createdAt: new Date().toISOString()
    }

    messages.value.push(message)
    messages.value.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    persistMessages(messages.value)
    broadcast('message', message)
    scheduleCompanionReply(message)
  }

  const scheduleCompanionReply = (message: ChatMessage) => {
    if (message.authorId === 'system') return
    const replies = [
      '保持水分，健康每一天！',
      '记得也去玩玩小游戏放松一下～',
      '今天的目标完成了吗？坚持就是胜利！',
      '好消息要记得打卡分享给大家哦！'
    ]
    const reply = replies[Math.floor(Math.random() * replies.length)]
    setTimeout(() => {
      addSystemMessage(reply)
    }, 1500 + Math.random() * 2000)
  }

  const announcePresence = (status: 'online' | 'away' = 'online') => {
    if (!user.value) return
    const presence: ChatPresence = {
      id: user.value.id,
      name: user.value.username,
      avatar: user.value.avatar,
      status,
      lastActive: new Date().toISOString()
    }
    updatePresence(presence)
    broadcast('presence', presence)
  }

  const initialize = () => {
    if (initialized.value) return
    ensureSystemWelcome()

    if (supportsBroadcast) {
      channel = new BroadcastChannel(CHANNEL_NAME)
      channel.onmessage = handleChannelMessage
    }

    companions.forEach(companion =>
      updatePresence({ ...companion, lastActive: new Date().toISOString() })
    )

    announcePresence()

    if (typeof window !== 'undefined') {
      presenceTimer = window.setInterval(() => {
        prunePresence()
        announcePresence()
        companions.forEach(companion =>
          updatePresence({ ...companion, lastActive: new Date().toISOString() })
        )
      }, PRESENCE_INTERVAL)

      window.addEventListener('beforeunload', () => announcePresence('away'))
    }

    initialized.value = true
  }

  const dispose = () => {
    if (channel) {
      channel.close()
      channel = null
    }
    if (presenceTimer) {
      clearInterval(presenceTimer)
      presenceTimer = null
    }
  }

  watch(
    () => user.value?.id,
    () => {
      announcePresence()
    }
  )

  const orderedMessages = computed(() =>
    [...messages.value].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  )

  const recentMessages = computed(() => orderedMessages.value.slice(-100))

  return {
    // State
    messages: readonly(messages),
    onlineUsers: readonly(onlineUsers),
    initialized: readonly(initialized),

    // Getters
    orderedMessages,
    recentMessages,

    // Actions
    initialize,
    dispose,
    sendMessage,
    addSystemMessage,
    announcePresence
  }
})
