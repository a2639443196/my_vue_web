import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useRouter } from 'vue-router'
import { api, userApi } from '@/api'
import type { User, UserFormData, ProfileUpdateData, AuthState, LoginCredentials, RegisterData } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const router = useRouter()

  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const initialized = ref(false)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userDisplayName = computed(() => user.value?.username || 'Guest')
  const userAvatar = computed(() => user.value?.avatar || null)

  // Actions
  const initialize = async () => {
    if (initialized.value) return

    const savedToken = localStorage.getItem('token')
    if (savedToken) {
      token.value = savedToken
      api.setAuthToken(savedToken)

      try {
        const userData = await userApi.getProfile()
        user.value = userData
      } catch (error) {
        // Token invalid, clear it
        clearAuth()
      }
    }

    initialized.value = true
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const response = await api.post('/auth/login', credentials)
      const { user: userData, token: userToken } = response

      user.value = userData
      token.value = userToken

      // Save to localStorage
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set token for API
      api.setAuthToken(userToken)

      return { success: true, user: userData }
    } catch (error: any) {
      const message = error.message || '登录失败，请检查用户名和密码'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const register = async (data: RegisterData) => {
    loading.value = true
    try {
      const response = await api.post('/auth/register', data)
      const { user: userData, token: userToken } = response

      user.value = userData
      token.value = userToken

      // Save to localStorage
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))

      // Set token for API
      api.setAuthToken(userToken)

      return { success: true, user: userData }
    } catch (error: any) {
      const errors = error.response?.data || {}
      const firstError = Object.values(errors).flat()[0] || '注册失败'
      throw new Error(firstError as string)
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await api.post('/auth/logout')
      }
    } catch (error) {
      // Ignore logout errors
      console.error('Logout error:', error)
    } finally {
      clearAuth()
      router.push('/login')
    }
  }

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!user.value || !token.value) throw new Error('User not authenticated')

    loading.value = true
    try {
      const updatedUser = await userApi.updateProfile(data)
      user.value = { ...user.value, ...updatedUser }

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(user.value))

      return { success: true, user: user.value }
    } catch (error: any) {
      const message = error.message || '更新失败'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const changePassword = async (data: { old_password: string; new_password: string }) => {
    loading.value = true
    try {
      await api.post('/auth/change-password', data)
      return { success: true }
    } catch (error: any) {
      const message = error.message || '密码修改失败'
      throw new Error(message)
    } finally {
      loading.value = false
    }
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    api.clearAuthToken()
  }

  const refreshToken = async () => {
    if (!token.value) return false

    try {
      const response = await api.post('/auth/refresh', { token: token.value })
      const { token: newToken } = response

      token.value = newToken
      localStorage.setItem('token', newToken)
      api.setAuthToken(newToken)

      return true
    } catch (error) {
      clearAuth()
      return false
    }
  }

  // Watch for token expiration
  setInterval(() => {
    if (token.value) {
      // Check if token is expired (you might want to decode JWT to check exp)
      // For now, just refresh if getting auth errors
      refreshToken()
    }
  }, 55 * 60 * 1000) // Refresh every 55 minutes

  return {
    // State
    user: readonly(user),
    token: readonly(token),
    loading: readonly(loading),
    initialized: readonly(initialized),

    // Getters
    isAuthenticated,
    userDisplayName,
    userAvatar,

    // Actions
    initialize,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshToken,
    clearAuth
  }
})