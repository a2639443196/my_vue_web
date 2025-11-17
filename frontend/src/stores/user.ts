import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import http, { setAuthToken } from '@/api/http'
import { profileApi, type Profile, type ProfileUpdatePayload } from '@/api/profileApi'

interface AuthResponse {
  token: string
  user: Profile
}

const TOKEN_KEY = 'wellness-auth-token'

export const useUserStore = defineStore('user', () => {
  const profile = ref<Profile | null>(null)
  const token = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const user = computed(() => profile.value)
  const isAuthenticated = computed(() => !!token.value && !!profile.value)
  const userDisplayName = computed(() => profile.value?.username ?? '访客')
  const userAvatar = computed(() => profile.value?.avatar ?? null)

  const persistToken = () => {
    if (typeof localStorage === 'undefined') return
    if (token.value) {
      localStorage.setItem(TOKEN_KEY, token.value)
    } else {
      localStorage.removeItem(TOKEN_KEY)
    }
  }

  const loadToken = () => {
    if (typeof localStorage === 'undefined') return null
    return localStorage.getItem(TOKEN_KEY)
  }

  const initialize = async () => {
    if (initialized.value) return
    const saved = loadToken()
    if (saved) {
      token.value = saved
      setAuthToken(saved)
      try {
        profile.value = await profileApi.fetchProfile()
      } catch {
        token.value = null
        setAuthToken(null)
        persistToken()
      }
    }
    initialized.value = true
  }

  const login = async (payload: { username: string; password: string }) => {
    loading.value = true
    try {
      const { data } = await http.post<AuthResponse>('/auth/login/', payload)
      token.value = data.token
      setAuthToken(data.token)
      profile.value = data.user
      persistToken()
    } finally {
      loading.value = false
    }
  }

  const register = async (payload: { username: string; password: string; email?: string }) => {
    loading.value = true
    try {
      const { data } = await http.post<AuthResponse>('/auth/register/', payload)
      token.value = data.token
      setAuthToken(data.token)
      profile.value = data.user
      persistToken()
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    profile.value = null
    setAuthToken(null)
    persistToken()
  }

  const updateProfile = async (payload: ProfileUpdatePayload) => {
    loading.value = true
    try {
      const updated = await profileApi.updateProfile(payload)
      profile.value = updated
      return updated
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    token,
    initialized,
    loading,
    user,
    isAuthenticated,
    userDisplayName,
    userAvatar,
    initialize,
    login,
    register,
    logout,
    updateProfile
  }
})
