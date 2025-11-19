import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Cookies from 'js-cookie'
import http, { setAuthToken } from '@/api/http'
import { profileApi, type Profile, type ProfileUpdatePayload } from '@/api/profileApi'

interface AuthResponse {
  token: string
  user: Profile
}

const TOKEN_KEY = 'wellness-auth-token'
const PROFILE_KEY = 'wellness-auth-profile'
const TOKEN_EXPIRES_DAYS = 7

export const useUserStore = defineStore('user', () => {
  const profile = ref<Profile | null>(null)
  const token = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  const user = computed(() => profile.value)
  const isAuthenticated = computed(() => !!token.value)
  const userDisplayName = computed(() => profile.value?.username ?? '访客')
  const userAvatar = computed(() => profile.value?.avatar ?? null)

  const persistSession = () => {
    if (token.value) {
      Cookies.set(TOKEN_KEY, token.value, {
        expires: TOKEN_EXPIRES_DAYS,
        sameSite: 'lax'
      })
      Cookies.set(PROFILE_KEY, JSON.stringify(profile.value ?? null), {
        expires: TOKEN_EXPIRES_DAYS,
        sameSite: 'lax'
      })
    } else {
      Cookies.remove(TOKEN_KEY)
      Cookies.remove(PROFILE_KEY)
    }
  }

  const loadSession = () => {
    const savedToken = Cookies.get(TOKEN_KEY) ?? null
    const savedProfile = Cookies.get(PROFILE_KEY)
    let parsedProfile: Profile | null = null

    if (savedProfile) {
      try {
        parsedProfile = JSON.parse(savedProfile)
      } catch {
        parsedProfile = null
      }
    }

    return { savedToken, parsedProfile }
  }

  const handleAuthError = (error: any) => {
    const message = error?.message ?? ''
    const isUnauthorized = error?.status === 401 || /token/i.test(message)
    if (isUnauthorized) {
      logout()
      return true
    }
    return false
  }

  const initialize = async () => {
    if (initialized.value) return

    const { savedToken, parsedProfile } = loadSession()
    if (savedToken) {
      token.value = savedToken
      profile.value = parsedProfile
      setAuthToken(savedToken)

      // Add timeout to prevent hanging
      try {
        const profilePromise = profileApi.fetchProfile()
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )

        profile.value = await Promise.race([profilePromise, timeoutPromise]) as Profile
      } catch (error: any) {
        console.warn('Profile fetch failed, using cached profile:', error)
        const handled = handleAuthError(error)
        if (!handled && !profile.value) {
          profile.value = null
        }
      } finally {
        persistSession()
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
      persistSession()
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
      persistSession()
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    profile.value = null
    setAuthToken(null)
    persistSession()
  }

  const updateProfile = async (payload: ProfileUpdatePayload) => {
    loading.value = true
    try {
      const updated = await profileApi.updateProfile(payload)
      profile.value = updated
      persistSession()
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
