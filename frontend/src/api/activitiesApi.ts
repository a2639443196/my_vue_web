import http from './http'

export type ActivityMood = 'happy' | 'normal' | 'sad' | 'other'
export type ActivityCategory = 'health' | 'food' | 'study' | 'exercise' | 'other'

export interface Activity {
  id: number | string
  mood: ActivityMood
  category: ActivityCategory
  note: string
  createdAt: string
}

export interface CreateActivityPayload {
  mood: ActivityMood
  category: ActivityCategory
  note: string
}

export interface ActivityStats {
  total: number
  weekCount: number
  monthCount: number
  moods: Record<ActivityMood | string, number>
  categories: Record<ActivityCategory | string, number>
}

export const activitiesApi = {
  async fetchActivities(): Promise<Activity[]> {
    const { data } = await http.get<Activity[]>('/activities/')
    return data
  },

  async createActivity(payload: CreateActivityPayload): Promise<Activity> {
    const { data } = await http.post<Activity>('/activities/', payload)
    return data
  },

  async fetchActivityStats(): Promise<ActivityStats> {
    const { data } = await http.get<ActivityStats>('/activities/stats/')
    return data
  }
}

export default activitiesApi
