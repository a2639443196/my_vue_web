<template>
  <div class="layout-shell">
    <!-- Desktop/Tablet: Sidebar -->
    <v-navigation-drawer
      v-if="!shouldUseMobileLayout"
      permanent
      :width="240"
      class="border-r layout-sidebar"
    >
      <div class="pa-4">
        <h1 class="text-xl font-bold gradient-text">彦祖的导航</h1>
      </div>
      <v-divider></v-divider>

      <v-list nav>
        <v-list-item
          v-for="item in navigationItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
        ></v-list-item>
      </v-list>

      <template #append>
        <div class="pa-4">
          <v-card v-if="userStore.user" class="text-center sidebar-profile" elevation="0">
            <v-avatar size="48" class="mb-2">
              <v-img
                v-if="userStore.user.avatar"
                :src="userStore.user.avatar"
                :alt="userStore.user.username"
              />
              <v-icon v-else size="48">mdi-account</v-icon>
            </v-avatar>
            <p class="text-subtitle-2 font-weight-bold">
              {{ userStore.user.username }}
            </p>
            <p class="text-caption text-grey-500">
              {{ userContact }}
            </p>
            <div class="mt-2 d-flex gap-1 justify-center">
              <v-btn
                size="small"
                variant="outlined"
                to="/profile"
              >
                <v-icon size="16">mdi-account-cog</v-icon>
              </v-btn>
              <v-btn
                size="small"
                variant="outlined"
                color="error"
                @click="handleLogout"
              >
                <v-icon size="16">mdi-logout</v-icon>
              </v-btn>
            </div>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Mobile: Top App Bar -->
    <v-app-bar
      v-if="shouldUseMobileLayout && !isFullBleed"
      height="56"
      elevation="2"
      density="comfortable"
      :class="['mobile-app-bar', { 'mobile-app-bar--safe': hasSafeArea }]"
    >
      <template #prepend>
        <v-app-bar-nav-icon class="tap-target" @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title class="mobile-title text-body-1 font-weight-medium">
        {{ pageTitle }}
      </v-app-bar-title>

      <template #append>
        <v-btn
          icon
          class="tap-target"
          to="/profile"
        >
          <v-icon size="22">mdi-account</v-icon>
        </v-btn>
      </template>
    </v-app-bar>

    <!-- Mobile: Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      v-if="shouldUseMobileLayout"
      temporary
      location="left"
      :width="280"
    >
      <v-list>
        <v-list-item
          v-for="item in mobileNavItems"
          :key="item.to"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
        ></v-list-item>
      </v-list>

      <v-divider></v-divider>

      <v-list>
        <v-list-item to="/profile">
          <template #prepend>
            <v-icon>mdi-account-cog</v-icon>
          </template>
          <v-list-item-title>个人资料</v-list-item-title>
        </v-list-item>

        <v-list-item @click="handleLogout">
          <template #prepend>
            <v-icon color="error">mdi-logout</v-icon>
          </template>
          <v-list-item-title>退出登录</v-list-item-title>
        </v-list-item>
      </v-list>

      <template #append v-if="userStore.user">
        <div class="pa-4">
          <v-card class="text-center" elevation="0">
            <v-avatar size="48" class="mb-2 mx-auto">
              <v-img
                v-if="userStore.user.avatar"
                :src="userStore.user.avatar"
                :alt="userStore.user.username"
              />
              <v-icon v-else size="48">mdi-account</v-icon>
            </v-avatar>
            <p class="text-subtitle-2 font-weight-bold">
              {{ userStore.user.username }}
            </p>
            <p class="text-caption text-grey-500">
              {{ userContact }}
            </p>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main
      class="layout-main"
      :class="{ 'mobile-main': shouldUseMobileLayout }"
    >
      <div
        class="page-surface"
        :class="{
          'page-surface--mobile': shouldUseMobileLayout,
          'page-surface--safe-bottom': shouldUseMobileLayout && hasSafeArea,
          'page-surface--full': isFullBleed
        }"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </v-main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useThemeStore } from '@/stores/theme'
import { useDeviceDetection } from '@/composables/useDeviceDetection'

// Composables
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const themeStore = useThemeStore()
const { shouldUseMobileLayout, deviceType, hasSafeArea } = useDeviceDetection()

// State
const drawer = ref(false)
const isDark = computed(() => themeStore.isDark)

// Computed
const pageTitle = computed(() => route.meta.title || '彦祖的导航')
const userContact = computed(() => userStore.user?.phone || userStore.user?.email || '未填写联系方式')

const navigationItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/dashboard', title: '仪表盘', icon: 'mdi-view-dashboard' },
  { to: '/activities', title: '活动记录', icon: 'mdi-chart-line' },
  { to: '/water', title: '饮水追踪', icon: 'mdi-water' },
  { to: '/chat', title: '聊天室', icon: 'mdi-chat' },
  { to: '/games', title: '小游戏', icon: 'mdi-gamepad' },
])

// 移动端导航项（简化版）
const mobileNavItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/activities', title: '活动记录', icon: 'mdi-chart-line' },
  { to: '/water', title: '饮水追踪', icon: 'mdi-water' },
  { to: '/chat', title: '聊天室', icon: 'mdi-chat' },
  { to: '/games', title: '小游戏', icon: 'mdi-gamepad' },
  { to: '/dashboard', title: '仪表盘', icon: 'mdi-view-dashboard' },
])


const isFullBleed = computed(() => route.meta.fullBleed === true)

const handleLogout = async () => {
  try {
    await userStore.logout()
    router.push({ name: 'Login' })
    notificationStore.showSuccess('退出登录成功')
  } catch (error) {
    notificationStore.showError('退出登录失败')
  }
}

// Watch route changes to close drawer on mobile
watch(
  () => route.fullPath,
  () => {
    if (shouldUseMobileLayout.value) {
      drawer.value = false
    }
  }
)

watch(
  () => themeStore.currentTheme,
  value => {
    document.documentElement.setAttribute('data-theme', value)
  },
  { immediate: true }
)
</script>

<style scoped>
.layout-shell {
  min-height: 100vh;
  display: flex;
  background: #0f172a;
}

.layout-sidebar {
  backdrop-filter: blur(18px);
  background-color: rgba(30, 41, 59, 0.95);
  border-right: 1px solid rgba(71, 85, 105, 0.3);
}

.sidebar-profile {
  background: rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.layout-main {
  background: transparent;
  padding: 0;
}

.page-surface {
  width: 100%;
  margin: 0 auto;
  padding: clamp(1.5rem, 4vw, 2.5rem);
  display: flex;
  flex-direction: column;
  gap: clamp(1.5rem, 2vw, 2.5rem);
  min-height: 100%;
  transition: padding 0.2s ease;
}

.page-surface--mobile {
  padding: calc(12px + env(safe-area-inset-top, 0px)) clamp(16px, 6vw, 24px)
    calc(20px + env(safe-area-inset-bottom, 0px));
  gap: 1.25rem;
}

.page-surface--safe-bottom {
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.page-surface--full {
  max-width: none;
  padding: 0;
  gap: 0;
  height: 100%;
}

/* 移动端主内容区 */
.mobile-main {
  padding-top: calc(56px + env(safe-area-inset-top, 0px));
}

.layout-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: clamp(1rem, 2vw, 2rem);
}

.layout-container.pa-2,
.layout-container.pa-4 {
  padding: clamp(0.75rem, 4vw, 1.5rem) !important;
}

.mobile-app-bar {
  padding: 6px 10px;
  backdrop-filter: blur(12px);
  background: rgba(15, 23, 42, 0.95) !important;
  border-bottom: 1px solid rgba(71, 85, 105, 0.3);
}

.mobile-app-bar--safe {
  padding-top: calc(6px + env(safe-area-inset-top));
  min-height: calc(56px + env(safe-area-inset-top));
}

.mobile-title {
  text-align: center;
  font-weight: 600 !important;
  color: #f1f5f9 !important;
  font-size: 1.1rem !important;
}

:deep(.tap-target) {
  min-width: 42px;
  min-height: 42px;
}

.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式优化 */
@media (max-width: 600px) {
  .layout-sidebar {
    width: 100% !important;
  }

  .gradient-text {
    font-size: 1.25rem;
  }
}

/* 移动端边距优化 */
@media (max-width: 768px) {
  .mobile-main {
    padding-top: calc(56px + env(safe-area-inset-top, 0px));
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  .mobile-main .v-container {
    padding-left: 12px !important;
    padding-right: 12px !important;
  }
}

/* 超小屏幕优化 */
@media (max-width: 375px) {
  .mobile-main .v-container {
    padding-left: 8px !important;
    padding-right: 8px !important;
  }
}

@media (min-width: 960px) {
  .layout-sidebar {
    width: 220px !important;
  }
}

@media (min-width: 1200px) {
  .layout-sidebar {
    width: 240px !important;
  }
}

/* Dark theme app bar styles */
:deep(.v-app-bar) {
  background-color: rgba(15, 23, 42, 0.95) !important;
  color: #f1f5f9 !important;
}

/* Navigation drawer dark theme */
:deep(.v-navigation-drawer) {
  background-color: rgba(30, 41, 59, 0.95) !important;
  border-right: 1px solid rgba(71, 85, 105, 0.3);
}

:deep(.v-navigation-drawer .v-list-item-title) {
  color: #f1f5f9 !important;
}

:deep(.v-navigation-drawer .v-list-item) {
  color: #cbd5e1 !important;
}

:deep(.v-navigation-drawer .v-list-item:hover) {
  background-color: rgba(59, 130, 246, 0.1) !important;
}

/* Add safe area support for mobile devices */
@supports (padding: max(0px)) {
  .v-bottom-navigation {
    padding-bottom: max(env(safe-area-inset-bottom), 0px);
  }
}

@media (max-width: 960px) {
  .layout-shell {
    flex-direction: column;
    min-height: 100vh;
  }

  .layout-main {
    padding-bottom: 4rem;
  }
}
</style>
