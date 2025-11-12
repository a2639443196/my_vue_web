import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { format } from 'date-fns'
import { api } from '@/api'
import type {
  CombinedUser,
  LocalUserData,
  LoginCredentials,
  RegisterData,
  ProfileUpdateData,
  HydrationEntry,
  GameRecord,
  GameKey,
  OperationRecord,
  StoredUser
} from '@/types/user'

const TOKEN_KEY = 'yanzu-nav-token'
const PROFILE_CACHE_KEY = 'yanzu-nav-profile'
const LOCAL_DATA_KEY = 'yanzu-nav-local-data'
const LEGACY_USERS_KEY = 'yanzu-nav-users'
const LEGACY_SESSION_KEY = 'yanzu-nav-session'

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const defaultLocalData = (): LocalUserData => {
  const now = new Date().toISOString()
  return {
    hydrationTarget: 2000,
    hydrationLog: {},
    gameRecords: [],
    operations: [],
    createdAt: now,
    updatedAt: now
  }
}

const loadLocalData = (): Record<string, LocalUserData> => {
  if (typeof localStorage === 'undefined') return {}
  try {
    const stored = localStorage.getItem(LOCAL_DATA_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch (error) {
    console.error('Failed to parse local hydration data', error)
    return {}
  }
}

const migrateLegacyData = (target: Record<string, LocalUserData>) => {
  if (typeof localStorage === 'undefined') return
  const legacy = localStorage.getItem(LEGACY_USERS_KEY)
  if (!legacy) return

  try {
    const parsed = JSON.parse(legacy) as Array<Record<string, any>>
    parsed.forEach(entry => {
      if (!entry?.username) return
      target[entry.username] = {
        hydrationTarget: entry.hydrationTarget ?? 2000,
        hydrationLog: entry.hydrationLog ?? {},
        gameRecords: entry.gameRecords ?? [],
        operations: entry.operations ?? [],
        createdAt: entry.createdAt ?? new Date().toISOString(),
        updatedAt: entry.updatedAt ?? new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('Failed to migrate legacy user data', error)
  } finally {
    localStorage.removeItem(LEGACY_USERS_KEY)
    localStorage.removeItem(LEGACY_SESSION_KEY)
  }
}

export const useUserStore = defineStore('user', () => {
  const profile = ref<StoredUser | null>(null)
  const token = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)
  const localData = ref<Record<string, LocalUserData>>(loadLocalData())

  if (Object.keys(localData.value).length === 0) {
    migrateLegacyData(localData.value)
  }

  const persistLocalData = () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(LOCAL_DATA_KEY, JSON.stringify(localData.value))
  }

  const persistSession = () => {
    if (typeof localStorage === 'undefined') return
    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
      if (profile.value) {
        localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(profile.value))
      }
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(PROFILE_CACHE_KEY)
    }
  }

  const ensureLocalSlot = (username?: string | null) => {
    if (!username) return defaultLocalData()
    if (!localData.value[username]) {
      localData.value[username] = defaultLocalData()
      persistLocalData()
    }
    return localData.value[username]
  }

  const currentUser = computed<CombinedUser | null>(() => {
    if (!profile.value) return null
    const slot = ensureLocalSlot(profile.value.username)
    return { ...profile.value, ...slot }
  })

  const requireLocalSlot = () => {
    if (!profile.value?.username) {
      throw new Error('用户未登录')
    }
    return ensureLocalSlot(profile.value.username)
  }

  const clearSession = () => {
    token.value = null
    profile.value = null
    api.clearAuthToken()
    persistSession()
  }

  const fetchProfile = async () => {
    const data = await api.get('/auth/profile/')
    ensureLocalSlot(data.username)
    profile.value = data
    persistSession()
  }

  const initialize = async () => {
    if (initialized.value) return
    if (typeof localStorage !== 'undefined') {
      const storedToken = localStorage.getItem(TOKEN_KEY)
      if (storedToken) {
        token.value = storedToken
        api.setAuthToken(storedToken)
        try {
          await fetchProfile()
        } catch (error) {
          console.error('Failed to restore profile', error)
          clearSession()
        }
      } else {
        const cachedProfile = localStorage.getItem(PROFILE_CACHE_KEY)
        if (cachedProfile) {
          try {
            const parsed = JSON.parse(cachedProfile)
            profile.value = parsed
          } catch (error) {
            console.error('Failed to parse cached profile', error)
          }
        }
      }
    }
    initialized.value = true
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const payload = {
        username: credentials.username.trim(),
        password: credentials.password
      }
      const response = await api.post('/auth/login/', payload)
      token.value = response.token
      api.setAuthToken(response.token)
      ensureLocalSlot(response.user.username)
      profile.value = response.user
      persistSession()
      return { success: true, user: profile.value }
    } catch (error: any) {
      throw new Error(error.message || '登录失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    try {
      if (data.password !== data.confirmPassword) {
        throw new Error('两次输入的密码不一致')
      }

      const payload = {
        username: data.username.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() || '',
        password: data.password,
        password_confirm: data.confirmPassword
      }

      const response = await api.post('/auth/register/', payload)
      token.value = response.token
      api.setAuthToken(response.token)
      ensureLocalSlot(response.user.username)
      profile.value = response.user
      persistSession()
      return { success: true, user: profile.value }
    } catch (error: any) {
      throw new Error(error.message || '注册失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout/', {})
    } catch {
      // Ignore API errors on logout
    }
    clearSession()
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!profile.value) throw new Error('用户未登录')
    const payload = { ...data }
    if (!payload.email) delete payload.email
    if (!payload.phone) delete payload.phone

    const response = await api.put('/auth/profile/', payload)
    ensureLocalSlot(response.user.username)
    profile.value = response.user
    persistSession()
    return { success: true, user: profile.value }
  }

  const recordOperation = (
    operation: Omit<OperationRecord, 'id' | 'createdAt'> & { createdAt?: string }
  ) => {
    if (!profile.value) return null

    const slot = requireLocalSlot()
    const createdAt = operation.createdAt ?? new Date().toISOString()
    const newOperation: OperationRecord = {
      id: generateId(),
      createdAt,
      ...operation
    }

    slot.operations = [newOperation, ...slot.operations]
    slot.updatedAt = createdAt
    persistLocalData()
    return newOperation
  }

  const logWater = (amount: number, note?: string, recordedAt: Date = new Date()) => {
    if (!profile.value) throw new Error('用户未登录')

    const slot = requireLocalSlot()
    const dateKey = format(recordedAt, 'yyyy-MM-dd')
    const entry: HydrationEntry = {
      id: generateId(),
      amount,
      recordedAt: recordedAt.toISOString(),
      note
    }

    const hydrationLog = { ...slot.hydrationLog }
    const day = hydrationLog[dateKey]
      ? {
          date: dateKey,
          total: hydrationLog[dateKey].total,
          entries: [...hydrationLog[dateKey].entries]
        }
      : { date: dateKey, total: 0, entries: [] as HydrationEntry[] }

    day.entries = [entry, ...day.entries]
    day.total += amount
    hydrationLog[dateKey] = day

    slot.hydrationLog = hydrationLog
    slot.updatedAt = new Date().toISOString()
    persistLocalData()

    recordOperation({
      type: 'water',
      title: `喝水 ${amount}ml`,
      description: `${format(recordedAt, 'HH:mm')} 喝了 ${amount}ml 水`,
      metadata: { amount, date: dateKey }
    })

    return entry
  }

  const updateHydrationTarget = (target: number) => {
    if (!profile.value) return
    const slot = requireLocalSlot()
    slot.hydrationTarget = target
    slot.updatedAt = new Date().toISOString()
    persistLocalData()
  }

  const recordGameResult = (
    game: GameKey,
    data: { score: number; unit: string; summary: string; details?: Record<string, any> }
  ) => {
    if (!profile.value) return null

    const slot = requireLocalSlot()
    const createdAt = new Date().toISOString()
    const newRecord: GameRecord = {
      id: generateId(),
      game,
      score: data.score,
      unit: data.unit,
      summary: data.summary,
      createdAt,
      details: data.details
    }

    slot.gameRecords = [newRecord, ...slot.gameRecords]
    slot.updatedAt = createdAt
    persistLocalData()

    recordOperation({
      type: 'game',
      title: game === 'schulte' ? '完成舒尔特方格训练' : '完成反应力测试',
      description: data.summary,
      metadata: { ...data, game }
    })

    return newRecord
  }

  const hydrationTarget = computed(() => currentUser.value?.hydrationTarget ?? 2000)

  const todayHydration = computed(() => {
    if (!currentUser.value) return 0
    const dateKey = format(new Date(), 'yyyy-MM-dd')
    return currentUser.value.hydrationLog[dateKey]?.total ?? 0
  })

  const hydrationHistory = computed(() => currentUser.value?.hydrationLog ?? {})
  const operations = computed(() => currentUser.value?.operations ?? [])
  const gameRecords = computed(() => currentUser.value?.gameRecords ?? [])

  const bestSchulteRecord = computed(() => {
    const records = gameRecords.value.filter(record => record.game === 'schulte')
    if (!records.length) return null
    return records.reduce((best, record) => (record.score < best.score ? record : best))
  })

  const bestReactionRecord = computed(() => {
    const records = gameRecords.value.filter(record => record.game === 'reaction')
    if (!records.length) return null
    return records.reduce((best, record) => (record.score < best.score ? record : best))
  })

  const hydrationEntries = computed(() => {
    if (!currentUser.value) return [] as HydrationEntry[]
    return Object.values(currentUser.value.hydrationLog)
      .flatMap(day => day.entries)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
  })

  const isAuthenticated = computed(() => !!token.value && !!profile.value)
  const userDisplayName = computed(() => profile.value?.username ?? '访客')
  const userAvatar = computed(() => profile.value?.avatar_url ?? profile.value?.avatar ?? null)

  return {
    // State
    user: currentUser,
    profile: readonly(profile),
    token: readonly(token),
    initialized: readonly(initialized),
    loading: readonly(loading),

    // Getters
    isAuthenticated,
    userDisplayName,
    userAvatar,
    hydrationTarget,
    todayHydration,
    hydrationHistory,
    hydrationEntries,
    operations,
    gameRecords,
    bestSchulteRecord,
    bestReactionRecord,

    // Actions
    initialize,
    login,
    register,
    logout,
    updateProfile,
    logWater,
    updateHydrationTarget,
    recordGameResult,
    recordOperation,
    clearAuth: clearSession
  }
})
