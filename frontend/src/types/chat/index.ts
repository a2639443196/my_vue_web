export interface ChatMessage {
  id: string | number
  userId: number | 'system'
  username: string
  avatar?: string | null
  content: string
  createdAt: string
  messageType: 'text' | 'system'
  isSystem?: boolean
}

export interface ChatPresence {
  id: number
  username: string
  avatar?: string | null
  lastActive: string
  status: 'online' | 'away'
}

export interface ChatState {
  messages: ChatMessage[]
  onlineUsers: ChatPresence[]
  connected: boolean
}
