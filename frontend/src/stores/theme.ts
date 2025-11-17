import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Force dark theme only - no theme switching
  const currentTheme = computed(() => 'dark' as const)
  const isDark = computed(() => true)
  const initialized = computed(() => true)

  const initialize = () => {
    // Always dark theme - no initialization needed
  }

  const setTheme = () => {
    // Theme switching disabled - always dark
  }

  const toggle = () => {
    // Theme switching disabled - always dark
  }

  return {
    currentTheme,
    isDark,
    initialized,
    initialize,
    setTheme,
    toggle
  }
})
