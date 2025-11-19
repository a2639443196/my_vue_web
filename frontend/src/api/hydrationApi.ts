import http from './http'

export interface HydrationEntry {
  id: number | string
  amount: number
  drinkName?: string
  drinkIcon?: string
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
  drink_name?: string  // 修改为后端期望的字段名
  caffeine_mg?: number | null  // 修改为后端期望的字段名
  drink_id?: number | string  // 修改为后端期望的字段名
  recordedAt?: string
}

export const hydrationApi = {
  async fetchEntries(): Promise<HydrationEntry[]> {
    const { data } = await http.get<any[]>('/activities/water/')
    return data.map(entry => ({
      id: entry.id,
      amount: entry.amount,
      drinkName: entry.drink_name,
      drinkIcon: entry.drink_icon,
      caffeineMg: entry.caffeine_mg,
      recordedAt: entry.recorded_at,
      createdAt: entry.created_at
    }))
  },

  async createEntry(payload: CreateHydrationPayload): Promise<HydrationEntry> {
    const { data } = await http.post<any>('/activities/water/create/', payload)
    return {
      id: data.id,
      amount: data.amount,
      drinkName: data.drink_name,
      drinkIcon: data.drink_icon,
      caffeineMg: data.caffeine_mg,
      recordedAt: data.recorded_at,
      createdAt: data.created_at
    }
  },

  async fetchHydrationStats(month?: string): Promise<HydrationStats> {
    const query = month ? `?month=${encodeURIComponent(month)}` : ''
    const { data } = await http.get<any>(`/activities/water/summary/${query}`)

    // Transform backend response to match frontend interface
    const today = data.entries?.find((entry: any) => {
      const entryDate = new Date(entry.date).toISOString().split('T')[0]
      const todayDate = new Date().toISOString().split('T')[0]
      return entryDate === todayDate
    })?.total || 0

    const goal = 2000 // Default goal
    const completion = Math.min(Math.round((today / goal) * 100), 100)
    const remaining = Math.max(goal - today, 0)

    return {
      today,
      goal,
      completion,
      remaining,
      weekly: data.entries || []
    }
  }
}

export default hydrationApi
