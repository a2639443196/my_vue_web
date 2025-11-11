export interface Message {
  id: string
  roomId: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'system'
  timestamp: Date
  isEdited?: boolean
  editedAt?: Date
}

export interface ChatRoom {
  id: string
  name: string
  description?: string
  type: 'public' | 'private'
  memberCount: number
  lastMessage?: Message
  createdAt: Date
  updatedAt: Date
}

export interface ChatUser {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
  lastSeen?: Date
  role: 'member' | 'moderator' | 'admin'
}

export interface RoomMember extends ChatUser {
  joinedAt: Date
  isMuted?: boolean
}

export interface TypingUser {
  userId: string
  userName: string
  timestamp: Date
}

export interface MessageFormData {
  content: string
  type: 'text'
}

export interface ChatState {
  rooms: ChatRoom[]
  currentRoom: ChatRoom | null
  messages: Record<string, Message[]>
  onlineUsers: Record<string, boolean>
  typingUsers: Record<string, TypingUser[]>
  unreadCounts: Record<string, number>
}