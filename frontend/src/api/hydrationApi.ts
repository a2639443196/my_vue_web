import http from './http'

export interface HydrationEntry {
  id: number | string
  amount: number
  drinkName?: string
  caffeineMg?: number | null
  recordedAt: string
  createdAt?: string
}

export interface HydrationStats {
  today: number
  goal: number
  completion: number
  remaining: number
  weekly: Array<{ date: string; total: number }>
  monthly?: Array<{ date: string; total: number }>
}

export interface CreateHydrationPayload {
  amount: number
  drinkName?: string
  caffeineMg?: number | null
  recordedAt?: string
}

export const hydrationApi = {
  async fetchEntries(): Promise<HydrationEntry[]> {
    const { data } = await http.get<HydrationEntry[]>('/activities/water/')
    return data
  },

  async createEntry(payload: CreateHydrationPayload): Promise<HydrationEntry> {
    const { data } = await http.post<HydrationEntry>('/activities/water/create/', payload)
    return data
  },

  async fetchHydrationStats(month?: string): Promise<HydrationStats> {
    const query = month ? `?month=${encodeURIComponent(month)}` : ''
    const { data } = await http.get<HydrationStats>(`/activities/water/summary/${query}`)
    return data
  }
}

export default hydrationApi
