import { ref, computed, readonly, onMounted, onUnmounted } from 'vue'

export interface Breakpoints {
  xs: number
  sm: number
  md: number
  lg: number
  xl: number
  xxl: number
}

const defaultBreakpoints: Breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400
}

export function useBreakpoints(customBreakpoints?: Partial<Breakpoints>) {
  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints }
  const windowWidth = ref(window.innerWidth)

  const updateWidth = () => {
    windowWidth.value = window.innerWidth
  }

  onMounted(() => {
    window.addEventListener('resize', updateWidth)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateWidth)
  })

  const current = computed(() => {
    if (windowWidth.value < breakpoints.sm) return 'xs'
    if (windowWidth.value < breakpoints.md) return 'sm'
    if (windowWidth.value < breakpoints.lg) return 'md'
    if (windowWidth.value < breakpoints.xl) return 'lg'
    if (windowWidth.value < breakpoints.xxl) return 'xl'
    return 'xxl'
  })

  const isMobile = computed(() => ['xs', 'sm'].includes(current.value))
  const isTablet = computed(() => current.value === 'md')
  const isDesktop = computed(() => ['lg', 'xl', 'xxl'].includes(current.value))
  const isLargeDesktop = computed(() => ['xl', 'xxl'].includes(current.value))

  // Responsive helpers
  const smAndDown = computed(() => windowWidth.value < breakpoints.md)
  const mdAndDown = computed(() => windowWidth.value < breakpoints.lg)
  const lgAndDown = computed(() => windowWidth.value < breakpoints.xl)
  const xlAndDown = computed(() => windowWidth.value < breakpoints.xxl)

  const smAndUp = computed(() => windowWidth.value >= breakpoints.sm)
  const mdAndUp = computed(() => windowWidth.value >= breakpoints.md)
  const lgAndUp = computed(() => windowWidth.value >= breakpoints.lg)
  const xlAndUp = computed(() => windowWidth.value >= breakpoints.xl)
  const xxlAndUp = computed(() => windowWidth.value >= breakpoints.xxl)

  // Current breakpoint value
  const bp = computed(() => breakpoints[current.value as keyof Breakpoints])

  return {
    windowWidth: readonly(windowWidth),
    current,
    bp,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    smAndDown,
    mdAndDown,
    lgAndDown,
    xlAndDown,
    smAndUp,
    mdAndUp,
    lgAndUp,
    xlAndUp,
    xxlAndUp
  }
}

// Use in setup:
// const { isMobile, isTablet, isDesktop } = useBreakpoints()

// Use outside setup:
// const breakpoints = useBreakpoints()
// const isMobile = computed(() => breakpoints.isMobile)