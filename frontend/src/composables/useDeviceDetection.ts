import { computed } from 'vue'

export function useDeviceDetection() {
  // 设备类型检测
  const deviceType = computed(() => {
    const ua = navigator.userAgent.toLowerCase()
    const platform = navigator.platform.toLowerCase()

    // 检测是否为iPad（新版本iPad的userAgent标识为Macintosh）
    const isIPad = /macintosh/.test(ua) && 'ontouchend' in document

    // 检测是否为移动设备
    const isMobile = /android|webos|iphone|ipod|blackberry|windows phone/i.test(ua) || isIPad
    const isTablet = isIPad || (/ipad|android(?!.*mobile)/i.test(ua))

    if (isTablet) return 'tablet'
    if (isMobile) return 'mobile'
    return 'desktop'
  })

  // 是否为移动端浏览器（包括平板）
  const isMobileBrowser = computed(() =>
    deviceType.value !== 'desktop' &&
    'ontouchstart' in window
  )

  // 是否为小屏幕设备
  const isSmallScreen = computed(() => {
    return window.innerWidth < 768
  })

  // 是否为触摸设备
  const isTouchDevice = computed(() => {
    return 'ontouchstart' in window ||
           navigator.maxTouchPoints > 0 ||
           (navigator as any).msMaxTouchPoints > 0
  })

  // 是否应该使用移动端布局
  const shouldUseMobileLayout = computed(() => {
    // 小屏幕一定是移动端布局
    if (isSmallScreen.value) return true

    // 大屏幕但如果是触摸设备且是移动设备，也使用移动端布局
    if (isTouchDevice.value && deviceType.value !== 'desktop') return true

    // 其他情况使用桌面布局
    return false
  })

  // 安全区域支持
  const hasSafeArea = computed(() => {
    return CSS.supports('padding-top', 'env(safe-area-inset-top)') ||
           CSS.supports('padding-left', 'env(safe-area-inset-left)')
  })

  return {
    deviceType,
    isMobileBrowser,
    isSmallScreen,
    isTouchDevice,
    shouldUseMobileLayout,
    hasSafeArea
  }
}