export interface User {
  id: string
  email: string
  username: string
  firstName?: string
  lastName?: string
  avatar?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  height?: number // in cm
  weight?: number // in kg
  preferences: UserPreferences
  stats: UserStats
  createdAt: Date
  updatedAt: Date
  lastLoginAt?: Date
  emailVerified: boolean
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  notifications: NotificationPreferences
  privacy: PrivacyPreferences
  units: UnitPreferences
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  inApp: boolean
  reminders: boolean
  achievements: boolean
  social: boolean
}

export interface PrivacyPreferences {
  profileVisible: boolean
  activityVisible: boolean
  showInLeaderboards: boolean
  allowFriendRequests: boolean
}

export interface UnitPreferences {
  weight: 'kg' | 'lbs'
  height: 'cm' | 'ft'
  temperature: 'celsius' | 'fahrenheit'
  distance: 'km' | 'miles'
}

export interface UserStats {
  totalActivities: number
  currentStreak: number
  longestStreak: number
  joinDate: Date
  lastActiveDate: Date
  achievements: Achievement[]
  level: number
  experience: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  category: 'water' | 'bowel' | 'smoking' | 'slack' | 'social' | 'general'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

export interface UserFormData {
  email: string
  username: string
  password: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: 'male' | 'female' | 'other'
}

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  avatar?: string
  dateOfBirth?: Date
  gender?: 'male' | 'female' | 'other'
  height?: number
  weight?: number
  preferences?: Partial<UserPreferences>
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData extends UserFormData {
  confirmPassword: string
}