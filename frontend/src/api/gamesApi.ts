import http from './http'

export type GameType = 'schulte' | 'reaction' | 'memory' | 'sudoku'

export interface GameResultPayload {
  gameType: GameType
  score: number
  durationMs?: number
  attempts?: number
  metadata?: Record<string, any>
}

export interface GameResult {
  id: string
  userId: string
  gameType: GameType
  score: number
  durationMs?: number | null
  attempts?: number | null
  metadata?: Record<string, any> | null
  createdAt: string
}

export interface GameSummary {
  gameType: GameType
  bestScore: number | null
  averageScore: number | null
  totalPlays: number
  lastPlayed?: string | null
}

export interface UserGameSummary {
  totals: {
    plays: number
    durationMs?: number | null
  }
  byGame: Record<GameType, GameSummary>
}

export interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  avatar?: string | null
  score: number
  createdAt: string
}

export const gamesApi = {
  async saveResult(payload: GameResultPayload): Promise<GameResult> {
    const { data } = await http.post<GameResult>('/games/results', payload)
    return data
  },

  async fetchSummary(gameType: GameType): Promise<GameSummary> {
    const { data } = await http.get<GameSummary>(`/games/results/summary?gameType=${gameType}`)
    return data
  },

  async fetchUserSummary(): Promise<UserGameSummary> {
    const { data } = await http.get<UserGameSummary>('/games/results/summary/user')
    return data
  },

  async fetchLeaderboard(gameType: GameType): Promise<LeaderboardEntry[]> {
    const { data } = await http.get<LeaderboardEntry[]>(`/games/leaderboard?gameType=${gameType}`)
    return data
  }
}

export default gamesApi
