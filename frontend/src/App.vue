<template>
  <v-app :theme="themeName">
    <div v-if="systemLoading" class="app-loading">
      <div class="loader">
        <div class="spinner"></div>
        <p class="mt-4 text-medium-emphasis">{{ $t('app.loading') }}</p>
      </div>
    </div>

    <template v-else>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </template>

    <v-snackbar
      v-model="notification.show"
      :color="notification.type"
      :timeout="notification.timeout"
      location="bottom right"
    >
      {{ notification.message }}
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useTheme } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'

const theme = useTheme()
const themeStore = useThemeStore()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const systemLoading = ref(true)

const notification = computed(() => notificationStore.current)
const themeName = computed(() => themeStore.currentTheme)

watch(
  () => themeStore.currentTheme,
  value => {
    theme.global.name.value = value
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
.app-loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(244, 245, 251, 0.95);
  backdrop-filter: blur(12px);
}

.loader {
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid rgba(99, 102, 241, 0.15);
  border-top-color: #6366f1;
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
