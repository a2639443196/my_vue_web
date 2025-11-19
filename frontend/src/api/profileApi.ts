import http from './http'

export interface Profile {
  id: string
  username: string
  email?: string | null
  avatar?: string | null
  bio?: string | null
  joinedAt?: string | null
}

export interface ProfileUpdatePayload {
  username?: string
  email?: string
  avatar?: string
  bio?: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon?: string
  earnedAt: string
}

export interface ProfileStats {
  streakDays: number
  activities: number
  hydrationLiters: number
  gamesPlayed: number
}

export const profileApi = {
  async fetchProfile(): Promise<Profile> {
    const { data } = await http.get<Profile>('/auth/profile/')
    return data
  },

  async updateProfile(payload: ProfileUpdatePayload): Promise<Profile> {
    const { data } = await http.put<Profile>('/auth/profile/', payload)
    return data
  },

  async fetchAchievements(): Promise<Achievement[]> {
    const { data } = await http.get<Achievement[]>('/auth/profile/achievements')
    return data
  },

  async fetchProfileStats(): Promise<ProfileStats> {
    const { data } = await http.get<ProfileStats>('/profile/stats')
    return data
  }
}

export default profileApi
