<template>
  <transition name="toast-fade">
    <div
      v-if="notification.show"
      class="toast"
      role="status"
      aria-live="assertive"
    >
      <div class="icon-wrap" :class="typeStyle.iconBg">
        <Icon :icon="typeStyle.icon" class="w-5 h-5" />
      </div>
      <div class="flex-1">
        <p class="text-sm font-semibold text-primary">{{ typeStyle.label }}</p>
        <p class="text-xs text-secondary mt-1">{{ notification.message }}</p>
      </div>
      <button
        type="button"
        class="close-btn"
        aria-label="关闭通知"
        @click="$emit('close')"
      >
        <Icon icon="lucide:x" class="w-4 h-4" />
      </button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

type NotificationPayload = {
  show: boolean
  type: string
  message: string
  timeout?: number
}

const props = defineProps<{
  notification: NotificationPayload
}>()

defineEmits<{
  (e: 'close'): void
}>()

const typeStyle = computed(() => {
  const map = {
    success: {
      label: '成功',
      icon: 'lucide:check-circle-2',
      iconBg: 'bg-green-500/15 text-green-300'
    },
    error: {
      label: '错误',
      icon: 'lucide:alert-triangle',
      iconBg: 'bg-red-500/15 text-red-300'
    },
    warning: {
      label: '提醒',
      icon: 'lucide:alert-circle',
      iconBg: 'bg-amber-500/15 text-amber-200'
    },
    info: {
      label: '提示',
      icon: 'lucide:info',
      iconBg: 'bg-cyan-500/15 text-cyan-200'
    }
  }

  return map[(props.notification.type as keyof typeof map) || 'info'] ?? map.info
})
</script>

<style scoped>
.toast {
  position: fixed;
  right: 1.5rem;
  bottom: 1.5rem;
  z-index: 90;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 20rem;
  padding: 0.9rem 1rem;
  border-radius: 16px;
  border: 1px solid rgba(var(--border), 0.5);
  background: rgba(var(--card), 0.8);
  backdrop-filter: blur(16px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35);
}

.icon-wrap {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.close-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: transparent;
  color: rgb(var(--text-secondary));
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: rgb(var(--text-primary));
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 640px) {
  .toast {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
  }
}
</style>
