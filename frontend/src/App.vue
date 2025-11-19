<template>
  <div class="app-root">
    <div v-if="systemLoading" class="app-loading">
      <div class="loader">
        <div class="spinner"></div>
        <p class="mt-4 text-secondary text-sm">加载中...</p>
      </div>
    </div>

    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>

    <AppToast
      :notification="notification"
      @close="notificationStore.hide()"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppToast from '@/components/AppToast.vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const systemLoading = ref(true)

const notification = computed(() => notificationStore.current)

watch(
  () => themeStore.currentTheme,
  value => {
    document.documentElement.setAttribute('data-theme', value)
  },
  { immediate: true }
)

onMounted(async () => {
  themeStore.initialize()
  await userStore.initialize()
  setTimeout(() => {
    systemLoading.value = false
  }, 400)
})
</script>

<style scoped>
.app-root {
  min-height: 100vh;
  background: rgb(var(--background));
  color: rgb(var(--text-primary));
}

.app-loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(12, 18, 30, 0.92);
  backdrop-filter: blur(12px);
}

.loader {
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(96, 165, 250, 0.18);
  border-top-color: #60a5fa;
  animation: spin 0.8s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
