import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { hydrationApi, type HydrationEntry, type HydrationStats, type CreateHydrationPayload } from '@/api/hydrationApi'

export const useHydrationStore = defineStore('hydration', () => {
  const entries = ref<HydrationEntry[]>([])
  const stats = ref<HydrationStats | null>(null)
  const loading = ref(false)
  const creating = ref(false)
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
    creating.value = true
    error.value = null
    try {
      const entry = await hydrationApi.createEntry(payload)
      // Add to existing entries at the beginning
      entries.value = [entry, ...entries.value]

      // Update stats locally to avoid unnecessary API calls that could cause refreshes
      if (stats.value) {
        stats.value.today += entry.amount
        // Update weekly data if needed
        const today = new Date().toISOString().split('T')[0]
        const weeklyEntry = stats.value.weekly.find(w => w.date === today)
        if (weeklyEntry) {
          weeklyEntry.total += entry.amount
        }
      }

      return entry
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      creating.value = false
    }
  }

  return {
    entries,
    stats,
    loading,
    error,
    creating,
    todayTotal,
    goal,
    fetchEntries,
    fetchStats,
    createEntry
  }
})
