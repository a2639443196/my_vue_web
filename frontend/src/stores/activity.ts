import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { format, startOfDay, endOfDay, subDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { api, activityApi } from '@/api'
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
    activities.value.filter(a => a.type === 'water')
  )

  const todayWaterIntake = computed(() => {
    const today = new Date()
    return waterIntakes.value
      .filter(a => format(a.timestamp, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'))
      .reduce((sum, a) => sum + a.value, 0)
  })

  const weeklyWaterIntake = computed(() => {
    const weekAgo = subDays(new Date(), 7)
    return waterIntakes.value
      .filter(a => a.timestamp >= weekAgo)
      .reduce((sum, a) => sum + a.value, 0)
  })

  const bowelMovements = computed(() =>
    activities.value.filter(a => a.type === 'bowel')
  )

  const smokingRecords = computed(() =>
    activities.value.filter(a => a.type === 'smoking')
  )

  const slackRecords = computed(() =>
    activities.value.filter(a => a.type === 'slack')
  )

  // Actions
  const fetchActivities = async (params?: {
    type?: string
    start_date?: string
    end_date?: string
    limit?: number
  }) => {
    loading.value = true
    try {
      const response = await activityApi.getActivities()
      activities.value = response.results || response
    } catch (error) {
      console.error('Failed to fetch activities:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      // For now, create basic stats from activities
      stats.value = {
        total: activities.value.length,
        average: activities.value.length > 0
          ? activities.value.reduce((sum, a) => sum + a.value, 0) / activities.value.length
          : 0,
        streak: 0,
        lastActivity: activities.value.length > 0
          ? new Date(Math.max(...activities.value.map(a => a.timestamp.getTime())))
          : undefined
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const addWaterIntake = async (amount: number) => {
    try {
      const newActivity = await activityApi.createActivity({
        type: 'water',
        value: amount,
        unit: 'ml',
        timestamp: new Date(),
        note: ''
      })
      activities.value.unshift(newActivity)
      return newActivity
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

  const exportData = async (exportFormat: 'json' | 'csv' | 'excel' = 'json') => {
    try {
      // Create a simple client-side export
      const dataToExport = activities.value.map(a => ({
        type: a.type,
        value: a.value,
        unit: a.unit,
        note: a.note,
        timestamp: a.timestamp.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString()
      }))

      let content: string
      let mimeType: string
      let fileExtension: string

      switch (exportFormat) {
        case 'json':
          content = JSON.stringify(dataToExport, null, 2)
          mimeType = 'application/json'
          fileExtension = 'json'
          break
        case 'csv':
          // Simple CSV export
          const headers = ['type', 'value', 'unit', 'note', 'timestamp', 'createdAt', 'updatedAt']
          const csvRows = [
            headers.join(','),
            ...dataToExport.map(row =>
              headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(',')
            )
          ]
          content = csvRows.join('\n')
          mimeType = 'text/csv'
          fileExtension = 'csv'
          break
        default:
          content = JSON.stringify(dataToExport, null, 2)
          mimeType = 'application/json'
          fileExtension = 'json'
      }

      // Create download link
      const blob = new Blob([content], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `activities.${fileExtension}`)
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