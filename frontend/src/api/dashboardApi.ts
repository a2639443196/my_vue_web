import http from './http'
import type { HydrationStats } from './hydrationApi'
import type { ActivityStats } from './activitiesApi'
import type { UserGameSummary } from './gamesApi'
import type { ProfileStats } from './profileApi'

export interface DashboardSummary {
  hydration: HydrationStats
  activities: ActivityStats
  games: UserGameSummary
  profile: ProfileStats
  caffeine?: {
    today: number
    limit: number
  }
}

export const dashboardApi = {
  async fetchSummary(): Promise<DashboardSummary> {
    const { data } = await http.get<DashboardSummary>('/dashboard/summary')
    return data
  }
}

export default dashboardApi
