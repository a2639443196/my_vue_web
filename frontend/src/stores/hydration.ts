import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/api'

export interface DrinkOption {
  id: number
  name: string
  amount: number
  icon?: string | null
  caffeine_mg?: number | null
  is_default?: boolean
}

export interface WaterEntry {
  id: number
  amount: number
  drink_name: string
  drink_icon?: string | null
  caffeine_mg?: number | null
  recorded_at: string
  created_at: string
}

export interface CalendarEntry {
  date: string
  total: number
}

export const useHydrationStore = defineStore('hydration', () => {
  const drinks = ref<DrinkOption[]>([])
  const entries = ref<WaterEntry[]>([])
  const calendar = ref<CalendarEntry[]>([])
  const loading = ref(false)

  const fetchDrinks = async () => {
    const data = await api.get('/activities/drinks/')
    drinks.value = data
  }

  const createDrink = async (payload: Partial<DrinkOption>) => {
    const data = await api.post('/activities/drinks/', payload)
    drinks.value = [...drinks.value, data]
    return data
  }

  const updateDrink = async (id: number, payload: Partial<DrinkOption>) => {
    const data = await api.put(`/activities/drinks/${id}/`, payload)
    drinks.value = drinks.value.map(drink => (drink.id === id ? data : drink))
    return data
  }

  const deleteDrink = async (id: number) => {
    await api.delete(`/activities/drinks/${id}/`)
    drinks.value = drinks.value.filter(drink => drink.id !== id)
  }

  const fetchEntries = async () => {
    loading.value = true
    try {
      const data = await api.get('/activities/water/')
      entries.value = data
    } finally {
      loading.value = false
    }
  }

  const addEntry = async (payload: Record<string, any>) => {
    const data = await api.post('/activities/water/create/', payload)
    entries.value = [data, ...entries.value]
    return data
  }

  const fetchCalendar = async (month?: string) => {
    const suffix = month ? `?month=${encodeURIComponent(month)}` : ''
    const data = await api.get(`/activities/water/summary/${suffix}`)
    calendar.value = data.entries
    return data
  }

  return {
    drinks,
    entries,
    calendar,
    loading,
    fetchDrinks,
    createDrink,
    updateDrink,
    deleteDrink,
    fetchEntries,
    addEntry,
    fetchCalendar
  }
})
