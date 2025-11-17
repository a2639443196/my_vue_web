import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hydrationApi, type HydrationEntry, type HydrationStats, type CreateHydrationPayload } from '@/api/hydrationApi'

export const useHydrationStore = defineStore('hydration', () => {
  const entries = ref<HydrationEntry[]>([])
  const stats = ref<HydrationStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const todayTotal = computed(() => stats.value?.today ?? 0)
  const goal = computed(() => stats.value?.goal ?? 2000)

  const fetchEntries = async () => {
    loading.value = true
    error.value = null
    try {
      entries.value = await hydrationApi.fetchEntries()
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async (month?: string) => {
    loading.value = true
    error.value = null
    try {
      stats.value = await hydrationApi.fetchHydrationStats(month)
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const createEntry = async (payload: CreateHydrationPayload) => {
    loading.value = true
    error.value = null
    try {
      const entry = await hydrationApi.createEntry(payload)
      entries.value = [entry, ...entries.value]
      await fetchStats()
      return entry
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    entries,
    stats,
    loading,
    error,
    todayTotal,
    goal,
    fetchEntries,
    fetchStats,
    createEntry
  }
})
