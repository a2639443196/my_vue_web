import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

const STORAGE_KEY = 'wellness-theme'

export type ThemeName = 'light' | 'dark'

export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeName>('light')
  const initialized = ref(false)

  const initialize = () => {
    if (initialized.value) return
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null
      if (saved === 'dark' || saved === 'light') {
        currentTheme.value = saved
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        currentTheme.value = 'dark'
      }
    }
    initialized.value = true
  }

  const setTheme = (theme: ThemeName) => {
    currentTheme.value = theme
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }

  const toggle = () => {
    setTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  const isDark = computed(() => currentTheme.value === 'dark')

  return {
    currentTheme,
    isDark,
    initialized,
    initialize,
    setTheme,
    toggle
  }
})
