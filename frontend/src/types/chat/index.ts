export interface ChatMessage {
  id: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  isSystem?: boolean
}

export interface ChatPresence {
  id: string
  name: string
  avatar?: string
  lastActive: string
  status: 'online' | 'away'
}

export interface ChatState {
  messages: ChatMessage[]
  onlineUsers: ChatPresence[]
}
