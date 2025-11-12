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
  id: number
  username: string
  email?: string | null
  phone?: string | null
  avatar?: string | null
  avatar_url?: string | null
  first_name?: string | null
  last_name?: string | null
  last_login_at?: string | null
}

export interface LocalUserData {
  hydrationTarget: number
  hydrationLog: Record<string, HydrationDay>
  gameRecords: GameRecord[]
  operations: OperationRecord[]
  createdAt: string
  updatedAt: string
}

export type CombinedUser = StoredUser & LocalUserData

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  phone: string
  email?: string
  password: string
  confirmPassword: string
}

export interface ProfileUpdateData {
  username?: string
  phone?: string
  email?: string
  avatar?: string
  first_name?: string
  last_name?: string
  hydrationTarget?: number
}

export interface AuthState {
  user: StoredUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
