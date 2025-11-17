import { defineStore } from 'pinia'
import { ref } from 'vue'
import { profileApi, type Profile, type Achievement, type ProfileStats, type ProfileUpdatePayload } from '@/api/profileApi'

export const useProfileStore = defineStore('profile', () => {
  const profile = ref<Profile | null>(null)
  const achievements = ref<Achievement[]>([])
  const stats = ref<ProfileStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchProfile = async () => {
    loading.value = true
    error.value = null
    try {
      profile.value = await profileApi.fetchProfile()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (payload: ProfileUpdatePayload) => {
    loading.value = true
    error.value = null
    try {
      profile.value = await profileApi.updateProfile(payload)
      return profile.value
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchAchievements = async () => {
    loading.value = true
    error.value = null
    try {
      achievements.value = await profileApi.fetchAchievements()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    loading.value = true
    error.value = null
    try {
      stats.value = await profileApi.fetchProfileStats()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    profile,
    achievements,
    stats,
    loading,
    error,
    fetchProfile,
    updateProfile,
    fetchAchievements,
    fetchStats
  }
})
