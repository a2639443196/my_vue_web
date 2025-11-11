import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import api from '@/api'
import type { Activity, ActivityStats } from '@/types/activity'

export const useActivityStore = defineStore('activity', () => {
  // State
  const activities = ref<Activity[]>([])
  const stats = ref<ActivityStats | null>(null)
  const loading = ref(false)
  const dateRange = ref<[Date, Date]>([
    subDays(new Date(), 30),
    new Date()
  ])

  // Getters
  const waterIntakes = computed(() =>
    activities.value.filter(a => a.category === 'water')
  )

  const todayWaterIntake = computed(() => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return waterIntakes.value
      .filter(a => a.date === today)
      .reduce((sum, a) => sum + (a.details.amount || 0), 0)
  })

  const weeklyWaterIntake = computed(() => {
    const weekAgo = subDays(new Date(), 7)
    return waterIntakes.value
      .filter(a => new Date(a.created_at) >= weekAgo)
      .reduce((sum, a) => sum + (a.details.amount || 0), 0)
  })

  const bowelMovements = computed(() =>
    activities.value.filter(a => a.category === 'bowel')
  )

  const smokingRecords = computed(() =>
    activities.value.filter(a => a.category === 'smoking')
  )

  const slackRecords = computed(() =>
    activities.value.filter(a => a.category === 'slack')
  )

  // Actions
  const fetchActivities = async (params?: {
    category?: string
    start_date?: string
    end_date?: string
    limit?: number
  }) => {
    loading.value = true
    try {
      const response = await api.get('/activities/', { params })
      activities.value = response.data.results || response.data
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/activities/stats/', {
        params: {
          start_date: format(dateRange.value[0], 'yyyy-MM-dd'),
          end_date: format(dateRange.value[1], 'yyyy-MM-dd')
        }
      })
      stats.value = response.data
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const addWaterIntake = async (amount: number, type: 'small' | 'medium' | 'large' | 'custom' = 'medium') => {
    try {
      const response = await api.post('/activities/water/', {
        amount,
        type,
        recorded_at: new Date().toISOString()
      })
      activities.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add water intake:', error)
      throw error
    }
  }

  const addBowelMovement = async (data: {
    type: string
    color: string
    difficulty: number
    notes?: string
  }) => {
    try {
      const response = await api.post('/activities/bowel/', {
        ...data,
        recorded_at: new Date().toISOString()
      })
      activities.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add bowel movement:', error)
      throw error
    }
  }

  const addSmokingRecord = async (data: {
    count?: number
    mood?: string
    location?: string
    notes?: string
  }) => {
    try {
      const response = await api.post('/activities/smoking/', {
        count: data.count || 1,
        ...data,
        recorded_at: new Date().toISOString()
      })
      activities.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add smoking record:', error)
      throw error
    }
  }

  const addSlackRecord = async (data: {
    duration?: number
    activity?: string
    productivity?: number
    notes?: string
  }) => {
    try {
      const response = await api.post('/activities/slack/', {
        ...data,
        recorded_at: new Date().toISOString()
      })
      activities.value.unshift(response.data)
      return response.data
    } catch (error) {
      console.error('Failed to add slack record:', error)
      throw error
    }
  }

  const deleteActivity = async (id: string) => {
    try {
      await api.delete(`/activities/${id}/`)
      activities.value = activities.value.filter(a => a.id !== id)
    } catch (error) {
      console.error('Failed to delete activity:', error)
      throw error
    }
  }

  const exportData = async (format: 'json' | 'csv' | 'excel' = 'json') => {
    try {
      const response = await api.get('/activities/export/', {
        params: {
          format,
          start_date: format(dateRange.value[0], 'yyyy-MM-dd'),
          end_date: format(dateRange.value[1], 'yyyy-MM-dd')
        },
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `activities.${format}`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  // Initialize
  const initialize = async () => {
    await Promise.all([
      fetchActivities(),
      fetchStats()
    ])
  }

  return {
    // State
    activities,
    stats,
    loading,
    dateRange,

    // Getters
    waterIntakes,
    todayWaterIntake,
    weeklyWaterIntake,
    bowelMovements,
    smokingRecords,
    slackRecords,

    // Actions
    fetchActivities,
    fetchStats,
    addWaterIntake,
    addBowelMovement,
    addSmokingRecord,
    addSlackRecord,
    deleteActivity,
    exportData,
    initialize
  }
})