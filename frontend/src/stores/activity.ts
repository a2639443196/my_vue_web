import { defineStore } from 'pinia'
import { ref } from 'vue'
import activitiesApi, { type Activity, type ActivityStats, type CreateActivityPayload } from '@/api/activitiesApi'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<Activity[]>([])
  const stats = ref<ActivityStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchActivities = async () => {
    loading.value = true
    error.value = null
    try {
      activities.value = await activitiesApi.fetchActivities()
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
      stats.value = await activitiesApi.fetchActivityStats()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createActivity = async (payload: CreateActivityPayload) => {
    loading.value = true
    error.value = null
    try {
      const activity = await activitiesApi.createActivity(payload)
      activities.value = [activity, ...activities.value]
      await fetchStats()
      return activity
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    activities,
    stats,
    loading,
    error,
    fetchActivities,
    fetchStats,
    createActivity
  }
})
