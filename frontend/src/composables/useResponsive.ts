import { computed } from 'vue'
import { useBreakpoints } from './useBreakpoints'

export function useResponsive() {
  const { windowWidth, isMobile, isTablet, isDesktop } = useBreakpoints()

  // Grid columns based on screen size
  const gridCols = computed(() => {
    if (windowWidth.value < 600) return 1
    if (windowWidth.value < 960) return 2
    if (windowWidth.value < 1280) return 3
    return 4
  })

  // Card sizes
  const cardSize = computed(() => {
    if (isMobile.value) return 'small'
    if (isTablet.value) return 'medium'
    return 'large'
  })

  // Navigation mode
  const navMode = computed(() => {
    if (isMobile.value) return 'drawer'
    if (isTablet.value) return 'sidebar'
    return 'horizontal'
  })

  // Content width
  const contentWidth = computed(() => {
    if (isMobile.value) return '100%'
    if (isTablet.value) return '90%'
    if (windowWidth.value < 1440) return '85%'
    return '1200px'
  })

  // Sidebar width
  const sidebarWidth = computed(() => {
    if (isMobile.value) return 280
    if (isTablet.value) return 240
    return 260
  })

  // Spacing utilities
  const spacing = computed(() => ({
    xs: isMobile.value ? 2 : 4,
    sm: isMobile.value ? 4 : 8,
    md: isMobile.value ? 6 : 12,
    lg: isMobile.value ? 8 : 16,
    xl: isMobile.value ? 12 : 24,
    xxl: isMobile.value ? 16 : 32
  }))

  // Font sizes
  const fontSize = computed(() => ({
    xs: isMobile.value ? '0.75rem' : '0.875rem',
    sm: isMobile.value ? '0.875rem' : '1rem',
    base: isMobile.value ? '1rem' : '1.125rem',
    lg: isMobile.value ? '1.125rem' : '1.25rem',
    xl: isMobile.value ? '1.25rem' : '1.5rem',
    '2xl': isMobile.value ? '1.5rem' : '1.875rem',
    '3xl': isMobile.value ? '1.875rem' : '2.25rem'
  }))

  // Component density
  const density = computed(() => isMobile.value ? 'compact' : 'default')

  // Touch detection
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  })

  // Device orientation
  const orientation = computed(() => {
    if (!window.innerWidth) return 'unknown'
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  })

  // Platform detection
  const platform = computed(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    if (userAgent.includes('android')) return 'android'
    if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios'
    if (userAgent.includes('windows phone')) return 'windows-phone'

    return 'desktop'
  })

  // App bar height
  const appBarHeight = computed(() => {
    if (isMobile.value) {
      return platform.value === 'ios' ? 44 : 56
    }
    return 64
  })

  // Bottom nav height
  const bottomNavHeight = computed(() => {
    if (!isMobile.value) return 0
    return platform.value === 'ios' ? 70 : 56
  })

  // Safe area insets (for mobile devices with notches)
  const safeArea = computed(() => {
    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('--safe-area-inset-top') || '0'),
      right: parseInt(style.getPropertyValue('--safe-area-inset-right') || '0'),
      bottom: parseInt(style.getPropertyValue('--safe-area-inset-bottom') || '0'),
      left: parseInt(style.getPropertyValue('--safe-area-inset-left') || '0')
    }
  })

  return {
    windowWidth,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    orientation,
    platform,
    gridCols,
    cardSize,
    navMode,
    contentWidth,
    sidebarWidth,
    appBarHeight,
    bottomNavHeight,
    spacing,
    fontSize,
    density,
    safeArea
  }
}