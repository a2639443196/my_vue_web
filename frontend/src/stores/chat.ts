import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { io, type Socket } from 'socket.io-client'
import { api, chatApi } from '@/api'
import type { ChatRoom, Message, ChatUser, TypingUser } from '@/types/chat'

export const useChatStore = defineStore('chat', () => {
  // State
  const socket = ref<Socket | null>(null)
  const connected = ref(false)
  const rooms = ref<ChatRoom[]>([])
  const currentRoom = ref<ChatRoom | null>(null)
  const messages = ref<ChatMessage[]>([])
  const onlineUsers = ref<OnlineUser[]>([])
  const typingUsers = ref<Set<string>>(new Set())
  const unreadCounts = ref<Record<string, number>>({})

  // Getters
  const globalMessages = computed(() =>
    messages.value.filter(m => m.room_id === 'global')
  )

  const hasUnreadMessages = computed(() =>
    Object.values(unreadCounts.value).some(count => count > 0)
  )

  const totalUnreadCount = computed(() =>
    Object.values(unreadCounts.value).reduce((sum, count) => sum + count, 0)
  )

  // Actions
  const connect = (token: string) => {
    if (socket.value?.connected) return

    socket.value = io(`${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/chat/`, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    socket.value.on('connect', () => {
      connected.value = true
      console.log('Connected to chat server')
      fetchOnlineUsers()
    })

    socket.value.on('disconnect', () => {
      connected.value = false
      console.log('Disconnected from chat server')
    })

    socket.value.on('chat_message', (data) => {
      handleMessage(data)
    })

    socket.value.on('typing', (data) => {
      handleTyping(data)
    })

    socket.value.on('user_joined', (data) => {
      handleUserJoined(data)
    })

    socket.value.on('user_left', (data) => {
      handleUserLeft(data)
    })

    socket.value.on('error', (error) => {
      console.error('Chat error:', error)
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      connected.value = false
    }
  }

  const joinRoom = (roomId: string) => {
    if (!socket.value?.connected) return

    socket.value.emit('join_room', { room_id: roomId })
    loadRoomMessages(roomId)
  }

  const leaveRoom = (roomId: string) => {
    if (!socket.value?.connected) return

    socket.value.emit('leave_room', { room_id: roomId })
    if (currentRoom.value?.id === roomId) {
      currentRoom.value = null
      messages.value = []
    }
  }

  const sendMessage = (content: string, roomId: string = 'global', type: 'text' | 'image' | 'file' = 'text') => {
    if (!socket.value?.connected || !content.trim()) return

    socket.value.emit('chat_message', {
      room_id: roomId,
      content: content.trim(),
      message_type: type
    })
  }

  const sendTyping = (roomId: string, isTyping: boolean) => {
    if (!socket.value?.connected) return

    socket.value.emit('typing', {
      room_id: roomId,
      is_typing: isTyping
    })
  }

  const handleMessage = (data: any) => {
    messages.value.push({
      ...data.message,
      created_at: new Date(data.message.created_at)
    })

    // Update unread count if not in current room
    if (currentRoom.value?.id !== data.message.room_id) {
      const roomId = data.message.room_id
      unreadCounts.value[roomId] = (unreadCounts.value[roomId] || 0) + 1
    }

    // Scroll to bottom after a short delay
    setTimeout(() => {
      const container = document.querySelector('.chat-messages')
      if (container) {
        container.scrollTop = container.scrollHeight
      }
    }, 100)
  }

  const handleTyping = (data: any) => {
    if (data.is_typing) {
      typingUsers.value.add(data.user.username)
    } else {
      typingUsers.value.delete(data.user.username)
    }

    // Remove typing indicator after 3 seconds
    if (data.is_typing) {
      setTimeout(() => {
        typingUsers.value.delete(data.user.username)
      }, 3000)
    }
  }

  const handleUserJoined = (data: any) => {
    // Update room member list
    if (currentRoom.value?.id === data.room_id) {
      // Add user to room members
      console.log(`${data.user.username} joined the room`)
    }
  }

  const handleUserLeft = (data: any) => {
    // Update room member list
    if (currentRoom.value?.id === data.room_id) {
      // Remove user from room members
      console.log(`${data.user.username} left the room`)
    }
  }

  const fetchRooms = async () => {
    try {
      const response = await api.get('/chat/rooms/')
      rooms.value = response.data.results || response.data
    } catch (error) {
      console.error('Failed to fetch rooms:', error)
    }
  }

  const loadRoomMessages = async (roomId: string) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages/`)
      messages.value = response.data.results || response.data
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const fetchOnlineUsers = async () => {
    try {
      const response = await api.get('/chat/online/')
      onlineUsers.value = response.data.users || response.data
    } catch (error) {
      console.error('Failed to fetch online users:', error)
    }
  }

  const createRoom = async (data: {
    name: string
    description?: string
    is_public: boolean
    max_members?: number
  }) => {
    try {
      const response = await api.post('/chat/rooms/', data)
      rooms.value.push(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to create room:', error)
      throw error
    }
  }

  const markAsRead = (roomId: string) => {
    unreadCounts.value[roomId] = 0
  }

  // Connect to online users WebSocket
  const connectOnlineUsers = (token: string) => {
    const onlineSocket = io(`${import.meta.env.VITE_WS_URL || 'ws://localhost:8000'}/ws/online/`, {
      auth: { token },
      transports: ['websocket', 'polling']
    })

    onlineSocket.on('connect', () => {
      console.log('Connected to online users')
    })

    onlineSocket.on('online_users', (data) => {
      onlineUsers.value = data.users
    })

    onlineSocket.on('user_online', (data) => {
      const index = onlineUsers.value.findIndex(u => u.id === data.user.id)
      if (index === -1) {
        onlineUsers.value.push(data.user)
      }
    })

    onlineSocket.on('user_offline', (data) => {
      onlineUsers.value = onlineUsers.value.filter(u => u.id !== data.user_id)
    })
  }

  // Initialize
  const initialize = async (token: string) => {
    await Promise.all([
      fetchRooms(),
      connect(token),
      connectOnlineUsers(token)
    ])
  }

  return {
    // State
    socket: readonly(socket),
    connected: readonly(connected),
    rooms: readonly(rooms),
    currentRoom: readonly(currentRoom),
    messages: readonly(messages),
    onlineUsers: readonly(onlineUsers),
    typingUsers: readonly(typingUsers),
    unreadCounts: readonly(unreadCounts),

    // Getters
    globalMessages,
    hasUnreadMessages,
    totalUnreadCount,

    // Actions
    connect,
    disconnect,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    fetchRooms,
    fetchOnlineUsers,
    createRoom,
    markAsRead,
    initialize
  }
})