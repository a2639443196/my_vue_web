import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { format } from 'date-fns'
import type {
  StoredUser,
  LoginCredentials,
  RegisterData,
  ProfileUpdateData,
  HydrationEntry,
  GameRecord,
  GameKey,
  OperationRecord
} from '@/types/user'

const USERS_KEY = 'yanzu-nav-users'
const SESSION_KEY = 'yanzu-nav-session'

const generateId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

const hashPassword = (password: string) =>
  typeof btoa !== 'undefined'
    ? btoa(unescape(encodeURIComponent(password)))
    : password

const verifyPassword = (hash: string, password: string) => hash === hashPassword(password)

const cloneUser = (user: StoredUser): StoredUser => JSON.parse(JSON.stringify(user))

export const useUserStore = defineStore('user', () => {
  const users = ref<StoredUser[]>([])
  const user = ref<StoredUser | null>(null)
  const token = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const persistUsers = () => {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(USERS_KEY, JSON.stringify(users.value))
  }

  const persistSession = () => {
    if (typeof localStorage === 'undefined') return
    if (user.value && token.value) {
      localStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ userId: user.value.id, token: token.value })
      )
    } else {
      localStorage.removeItem(SESSION_KEY)
    }
  }

  const loadPersisted = () => {
    if (typeof localStorage === 'undefined') return
    const storedUsers = localStorage.getItem(USERS_KEY)
    if (storedUsers) {
      try {
        const parsed: StoredUser[] = JSON.parse(storedUsers)
        users.value = parsed.map(cloneUser)
      } catch (error) {
        console.error('Failed to parse stored users', error)
        users.value = []
      }
    }

    const storedSession = localStorage.getItem(SESSION_KEY)
    if (storedSession) {
      try {
        const session = JSON.parse(storedSession) as { userId: string; token: string }
        const existing = users.value.find(u => u.id === session.userId)
        if (existing) {
          user.value = cloneUser(existing)
          token.value = session.token
        }
      } catch (error) {
        console.error('Failed to parse stored session', error)
      }
    }
  }

  const updateUser = (updated: StoredUser) => {
    const index = users.value.findIndex(u => u.id === updated.id)
    if (index !== -1) {
      users.value[index] = cloneUser(updated)
      user.value = cloneUser(updated)
      persistUsers()
      persistSession()
    }
  }

  const initialize = async () => {
    if (initialized.value) return
    loadPersisted()
    initialized.value = true
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const { email, password } = credentials
      const existing = users.value.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      )

      if (!existing || !verifyPassword(existing.passwordHash, password)) {
        throw new Error('邮箱或密码不正确')
      }

      existing.lastLoginAt = new Date().toISOString()
      existing.updatedAt = existing.lastLoginAt

      user.value = cloneUser(existing)
      token.value = generateId()

      updateUser(existing)

      return { success: true, user: user.value }
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

      if (users.value.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
        throw new Error('该邮箱已被注册')
      }

      if (users.value.some(u => u.username === data.username)) {
        throw new Error('用户名已存在')
      }

      const now = new Date().toISOString()

      const newUser: StoredUser = {
        id: generateId(),
        email: data.email.trim(),
        username: data.username.trim(),
        passwordHash: hashPassword(data.password),
        hydrationTarget: 2000,
        hydrationLog: {},
        gameRecords: [],
        operations: [],
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now
      }

      users.value.push(cloneUser(newUser))
      user.value = cloneUser(newUser)
      token.value = generateId()

      persistUsers()
      persistSession()

      return { success: true, user: user.value }
    } catch (error: any) {
      throw new Error(error.message || '注册失败，请稍后重试')
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    user.value = null
    token.value = null
    persistSession()
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    persistSession()
  }

  const recordOperation = (
    operation: Omit<OperationRecord, 'id' | 'createdAt'> & { createdAt?: string }
  ) => {
    if (!user.value) return null

    const createdAt = operation.createdAt ?? new Date().toISOString()
    const newOperation: OperationRecord = {
      id: generateId(),
      createdAt,
      ...operation
    }

    const updated: StoredUser = {
      ...cloneUser(user.value),
      operations: [newOperation, ...user.value.operations],
      updatedAt: createdAt
    }

    updateUser(updated)
    return newOperation
  }

  const logWater = (amount: number, note?: string, recordedAt: Date = new Date()) => {
    if (!user.value) throw new Error('用户未登录')

    const dateKey = format(recordedAt, 'yyyy-MM-dd')
    const entry: HydrationEntry = {
      id: generateId(),
      amount,
      recordedAt: recordedAt.toISOString(),
      note
    }

    const hydrationLog = { ...user.value.hydrationLog }
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

    const updated: StoredUser = {
      ...cloneUser(user.value),
      hydrationLog,
      updatedAt: new Date().toISOString()
    }

    updateUser(updated)

    recordOperation({
      type: 'water',
      title: `喝水 ${amount}ml`,
      description: `${format(recordedAt, 'HH:mm')} 喝了 ${amount}ml 水`,
      metadata: { amount, date: dateKey }
    })

    return entry
  }

  const updateHydrationTarget = (target: number) => {
    if (!user.value) return
    const updated: StoredUser = {
      ...cloneUser(user.value),
      hydrationTarget: target,
      updatedAt: new Date().toISOString()
    }
    updateUser(updated)
  }

  const recordGameResult = (
    game: GameKey,
    data: { score: number; unit: string; summary: string; details?: Record<string, any> }
  ) => {
    if (!user.value) return null

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

    const updated: StoredUser = {
      ...cloneUser(user.value),
      gameRecords: [newRecord, ...user.value.gameRecords],
      updatedAt: createdAt
    }

    updateUser(updated)

    recordOperation({
      type: 'game',
      title: game === 'schulte' ? '完成舒尔特方格训练' : '完成反应力测试',
      description: data.summary,
      metadata: { ...data, game }
    })

    return newRecord
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user.value) throw new Error('用户未登录')

    if (data.email && users.value.some(u => u.email === data.email && u.id !== user.value!.id)) {
      throw new Error('该邮箱已被其他用户使用')
    }

    if (
      data.username &&
      users.value.some(u => u.username === data.username && u.id !== user.value!.id)
    ) {
      throw new Error('该用户名已被占用')
    }

    const updated: StoredUser = {
      ...cloneUser(user.value),
      email: data.email?.trim() ?? user.value.email,
      username: data.username?.trim() ?? user.value.username,
      avatar: data.avatar?.trim() || user.value.avatar,
      hydrationTarget: data.hydrationTarget ?? user.value.hydrationTarget,
      updatedAt: new Date().toISOString()
    }

    updateUser(updated)

    return { success: true, user: user.value }
  }

  const hydrationTarget = computed(() => user.value?.hydrationTarget ?? 2000)

  const todayHydration = computed(() => {
    if (!user.value) return 0
    const dateKey = format(new Date(), 'yyyy-MM-dd')
    return user.value.hydrationLog[dateKey]?.total ?? 0
  })

  const hydrationHistory = computed(() => user.value?.hydrationLog ?? {})
  const operations = computed(() => user.value?.operations ?? [])
  const gameRecords = computed(() => user.value?.gameRecords ?? [])

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
    if (!user.value) return [] as HydrationEntry[]
    return Object.values(user.value.hydrationLog)
      .flatMap(day => day.entries)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime())
  })

  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const userDisplayName = computed(() => user.value?.username ?? '访客')
  const userAvatar = computed(() => user.value?.avatar ?? null)

  return {
    // State
    user: readonly(user),
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
    clearAuth,
    logWater,
    updateHydrationTarget,
    recordGameResult,
    updateProfile,
    recordOperation
  }
})
