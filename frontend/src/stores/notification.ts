import { defineStore } from 'pinia'
import { ref, reactive } from 'vue'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  timeout?: number
  persistent?: boolean
}

export const useNotificationStore = defineStore('notification', () => {
  // State
  const current = reactive<{
    show: boolean
    type: string
    message: string
    timeout: number
  }>({
    show: false,
    type: 'info',
    message: '',
    timeout: 3000
  })

  const queue = ref<Notification[]>([])

  // Actions
  const show = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString()

    // Add to queue if there's already one showing
    if (current.show) {
      queue.value.push({ id, ...notification })
      return
    }

    displayNotification({ id, ...notification })
  }

  const displayNotification = (notification: Notification) => {
    current.show = true
    current.type = notification.type
    current.message = notification.message
    current.timeout = notification.timeout ?? 3000

    if (!notification.persistent) {
      setTimeout(() => {
        hide()
      }, current.timeout)
    }
  }

  const hide = () => {
    current.show = false

    // Show next in queue
    if (queue.value.length > 0) {
      const next = queue.value.shift()!
      displayNotification(next)
    }
  }

  const clear = () => {
    current.show = false
    queue.value = []
  }

  // Helper methods
  const showSuccess = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    show({ type: 'success', message, ...options })
  }

  const showError = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    show({ type: 'error', message, timeout: 5000, ...options })
  }

  const showWarning = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    show({ type: 'warning', message, ...options })
  }

  const showInfo = (message: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'message'>>) => {
    show({ type: 'info', message, ...options })
  }

  return {
    // State
    current: readonly(current),
    queue: readonly(queue),

    // Actions
    show,
    hide,
    clear,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
})