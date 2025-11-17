import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'wellness-theme'

export type ThemeName = 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>('dark')
  const initialized = ref(false)

  const initialize = () => {
    if (initialized.value) return
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'dark')
    }
    currentTheme.value = 'dark'
    initialized.value = true
  }

  const setTheme = (_theme: ThemeName = 'dark') => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, 'dark')
    }
    currentTheme.value = 'dark'
  }

  const isDark = computed(() => currentTheme.value === 'dark')

  return {
    currentTheme,
    isDark,
    initialized,
    initialize,
    setTheme
  }
})
