import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'
import type { ActivityEntry, SmokingRecord, SlackRecord } from '@/types/activity'

export const useActivityStore = defineStore('activity', () => {
  const activities = ref<ActivityEntry[]>([])
  const smokingRecords = ref<SmokingRecord[]>([])
  const slackRecords = ref<SlackRecord[]>([])
  const loading = ref(false)

  const fetchTimeline = async () => {
    loading.value = true
    try {
      const data = await api.get('/activities/')
      activities.value = Array.isArray(data) ? data : data.results || []
    } finally {
      loading.value = false
    }
  }

  const fetchSmokingRecords = async () => {
    const data = await api.get('/activities/smoking/')
    smokingRecords.value = data
  }

  const fetchSlackRecords = async () => {
    const data = await api.get('/activities/slack/')
    slackRecords.value = data
  }

  const createSmokingRecord = async (payload: { count: number; mood?: string | null; notes?: string | null }) => {
    const body = {
      ...payload,
      recorded_at: new Date().toISOString()
    }
    const data = await api.post('/activities/smoking/create/', body)
    smokingRecords.value = [data, ...smokingRecords.value]
    return data
  }

  const createSlackRecord = async (payload: { duration: number; mood?: string | null; notes?: string | null }) => {
    const body = {
      ...payload,
      recorded_at: new Date().toISOString()
    }
    const data = await api.post('/activities/slack/create/', body)
    slackRecords.value = [data, ...slackRecords.value]
    return data
  }

  const initialize = async () => {
    await Promise.all([fetchTimeline(), fetchSmokingRecords(), fetchSlackRecords()])
  }

  return {
    activities,
    smokingRecords,
    slackRecords,
    loading,
    initialize,
    fetchTimeline,
    fetchSmokingRecords,
    fetchSlackRecords,
    createSmokingRecord,
    createSlackRecord
  }
})
