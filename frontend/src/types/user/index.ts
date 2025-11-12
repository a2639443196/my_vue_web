export interface HydrationEntry {
  id: string
  amount: number
  recordedAt: string
  note?: string
}

export interface HydrationDay {
  date: string
  total: number
  entries: HydrationEntry[]
}

export type GameKey = 'schulte' | 'reaction'

export interface GameRecord {
  id: string
  game: GameKey
  score: number
  unit: string
  summary: string
  createdAt: string
  details?: Record<string, any>
}

export type OperationType = 'water' | 'game' | 'chat'

export interface OperationRecord {
  id: string
  type: OperationType
  title: string
  description: string
  createdAt: string
  metadata?: Record<string, any>
}

export interface StoredUser {
  id: string
  email: string
  username: string
  passwordHash: string
  avatar?: string
  hydrationTarget: number
  hydrationLog: Record<string, HydrationDay>
  gameRecords: GameRecord[]
  operations: OperationRecord[]
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  confirmPassword: string
}

export interface ProfileUpdateData {
  email?: string
  username?: string
  avatar?: string
  hydrationTarget?: number
}

export interface AuthState {
  user: StoredUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
