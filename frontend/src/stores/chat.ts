import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ChatMessage, ChatPresence } from '@/types/chat'
import { chatApi } from '@/api'
import { useUserStore } from '@/stores/user'

const MAX_MESSAGES = 200

const buildWsUrl = (path: string, token?: string | null) => {
  const base = import.meta.env.VITE_WS_URL || window.location.origin.replace(/^http/, 'ws')
  let url = `${base}${path}`
  if (token) {
    const separator = url.includes('?') ? '&' : '?'
    url += `${separator}token=${token}`
  }
  return url
}

const normalizeMessage = (payload: any): ChatMessage => ({
  id: payload.id ?? payload.message_id ?? crypto.randomUUID(),
  userId: payload.user?.id ?? payload.user_id ?? 'system',
  username: payload.user?.username ?? payload.username ?? '系统',
  avatar: payload.user?.avatar ?? payload.avatar ?? null,
  content: payload.content,
  createdAt: payload.created_at ?? payload.createdAt ?? new Date().toISOString(),
  messageType: payload.message_type ?? (payload.isSystem ? 'system' : 'text'),
  isSystem: payload.message_type === 'system' || payload.isSystem === true
})

export const useChatStore = defineStore('chat', () => {
  const userStore = useUserStore()

  const room = ref<{ id: number; name: string } | null>(null)
  const messages = ref<ChatMessage[]>([])
  const onlineUsers = ref<ChatPresence[]>([])
  const connecting = ref(false)
  const presenceConnecting = ref(false)
  const error = ref<string | null>(null)

  let chatSocket: WebSocket | null = null
  let presenceSocket: WebSocket | null = null
  let reconnectTimer: number | null = null
  let presenceReconnectTimer: number | null = null

  const sortMessages = () => {
    messages.value = [...messages.value]
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .slice(-MAX_MESSAGES)
  }

  const prependHistory = (history: ChatMessage[]) => {
    messages.value = [...history, ...messages.value]
    sortMessages()
  }

  const appendMessage = (message: ChatMessage) => {
    messages.value = [...messages.value, message]
    sortMessages()
  }

  const fetchRoom = async () => {
    if (room.value) return room.value
    const data = await chatApi.getDefaultRoom()
    room.value = data
    return room.value
  }

  const fetchMessages = async () => {
    const response = await chatApi.getDefaultMessages({ page_size: 100 })
    const normalized = response.results
      .map((item: any) => normalizeMessage({
        id: item.id,
        content: item.content,
        message_type: item.message_type,
        created_at: item.created_at,
        user: item.user_info
      }))
      .reverse()
    prependHistory(normalized)
  }

  const handleChatMessage = (event: MessageEvent) => {
    const payload = JSON.parse(event.data)
    switch (payload.type) {
      case 'chat_message':
        appendMessage(normalizeMessage(payload.message))
        break
      case 'system_event':
        appendMessage(normalizeMessage({
          id: `sys-${payload.event}-${Date.now()}`,
          content: payload.message,
          message_type: 'system',
          created_at: new Date().toISOString(),
          user: { id: 'system', username: '系统' }
        }))
        break
      case 'error':
        error.value = payload.message
        break
      default:
        break
    }
  }

  const handlePresenceMessage = (event: MessageEvent) => {
    const payload = JSON.parse(event.data)
    if (payload.type === 'online_users') {
      onlineUsers.value = payload.users
      return
    }
    if (payload.type === 'user_online') {
      const existing = onlineUsers.value.filter(user => user.id !== payload.user.id)
      onlineUsers.value = [...existing, payload.user]
      return
    }
    if (payload.type === 'user_offline') {
      onlineUsers.value = onlineUsers.value.filter(user => user.id !== payload.user_id)
    }
  }

  const connectChatSocket = () => {
    if (!userStore.token) return
    if (chatSocket && chatSocket.readyState === WebSocket.OPEN) return
    connecting.value = true
    error.value = null
    chatSocket = new WebSocket(buildWsUrl('/ws/chat/', userStore.token))
    chatSocket.onopen = () => {
      connecting.value = false
    }
    chatSocket.onmessage = handleChatMessage
    chatSocket.onerror = () => {
      error.value = '聊天室连接异常'
    }
    chatSocket.onclose = () => {
      connecting.value = false
      scheduleReconnect()
    }
  }

  const connectPresenceSocket = () => {
    if (!userStore.token) return
    if (presenceSocket && presenceSocket.readyState === WebSocket.OPEN) return
    presenceConnecting.value = true
    presenceSocket = new WebSocket(buildWsUrl('/ws/online/', userStore.token))
    presenceSocket.onopen = () => {
      presenceConnecting.value = false
    }
    presenceSocket.onmessage = handlePresenceMessage
    presenceSocket.onclose = () => {
      presenceConnecting.value = false
      schedulePresenceReconnect()
    }
  }

  const scheduleReconnect = () => {
    if (reconnectTimer) return
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null
      connectChatSocket()
    }, 2000)
  }

  const schedulePresenceReconnect = () => {
    if (presenceReconnectTimer) return
    presenceReconnectTimer = window.setTimeout(() => {
      presenceReconnectTimer = null
      connectPresenceSocket()
    }, 3000)
  }

  const initialize = async () => {
    if (!userStore.isAuthenticated) return
    await fetchRoom()
    await fetchMessages()
    connectChatSocket()
    connectPresenceSocket()
  }

  const dispose = () => {
    chatSocket?.close()
    presenceSocket?.close()
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
      reconnectTimer = null
    }
    if (presenceReconnectTimer) {
      clearTimeout(presenceReconnectTimer)
      presenceReconnectTimer = null
    }
    messages.value = []
    onlineUsers.value = []
    room.value = null
  }

  const activeRoomId = computed(() => room.value?.id ?? 'global')

  const sendMessage = (content: string) => {
    if (!content.trim()) return
    if (!chatSocket || chatSocket.readyState !== WebSocket.OPEN) {
      throw new Error('聊天室尚未连接')
    }
    chatSocket.send(JSON.stringify({
      type: 'chat_message',
      room_id: activeRoomId.value,
      content: content.trim()
    }))
  }

  const fetchOnlineUsers = async () => {
    if (!userStore.token) return
    const data = await chatApi.getOnlineUsers()
    onlineUsers.value = data.users
  }

  watch(
    () => userStore.token,
    token => {
      if (token) {
        initialize()
      } else {
        dispose()
      }
    }
  )

  return {
    room: computed(() => room.value),
    messages,
    onlineUsers,
    connecting,
    presenceConnecting,
    error,
    initialize,
    dispose,
    sendMessage,
    fetchOnlineUsers
  }
})
