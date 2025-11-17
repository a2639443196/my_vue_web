import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardApi, { type DashboardSummary } from '@/api/dashboardApi'

export const useDashboardStore = defineStore('dashboard', () => {
  const summary = ref<DashboardSummary | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchSummary = async () => {
    loading.value = true
    error.value = null
    try {
      summary.value = await dashboardApi.fetchSummary()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    loading,
    error,
    fetchSummary
  }
})
