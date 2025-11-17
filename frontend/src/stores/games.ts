import { defineStore } from 'pinia'
import { ref } from 'vue'
import gamesApi, {
  type GameType,
  type GameResult,
  type GameResultPayload,
  type GameSummary,
  type UserGameSummary,
  type LeaderboardEntry
} from '@/api/gamesApi'

export const useGamesStore = defineStore('games', () => {
  const summaries = ref<Record<GameType, GameSummary | null>>({
    schulte: null,
    reaction: null,
    memory: null,
    sudoku: null
  })
  const userSummary = ref<UserGameSummary | null>(null)
  const leaderboards = ref<Record<GameType, LeaderboardEntry[]>>({
    schulte: [],
    reaction: [],
    memory: [],
    sudoku: []
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSummary = async (gameType: GameType) => {
    loading.value = true
    error.value = null
    try {
      summaries.value[gameType] = await gamesApi.fetchSummary(gameType)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchUserSummary = async () => {
    loading.value = true
    error.value = null
    try {
      userSummary.value = await gamesApi.fetchUserSummary()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchLeaderboard = async (gameType: GameType) => {
    loading.value = true
    error.value = null
    try {
      leaderboards.value[gameType] = await gamesApi.fetchLeaderboard(gameType)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const saveResult = async (payload: GameResultPayload): Promise<GameResult> => {
    loading.value = true
    error.value = null
    try {
      const result = await gamesApi.saveResult(payload)
      await Promise.all([fetchSummary(payload.gameType), fetchUserSummary()])
      return result
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    summaries,
    userSummary,
    leaderboards,
    loading,
    error,
    fetchSummary,
    fetchUserSummary,
    fetchLeaderboard,
    saveResult
  }
})
