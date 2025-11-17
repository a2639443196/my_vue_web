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

    <!-- Mobile: Top App Bar - 重新设计 -->
    <div
      v-if="shouldUseMobileLayout && !isFullBleed"
      class="mobile-toolbar"
    >
      <!-- 返回/菜单按钮 -->
      <button
        class="mobile-toolbar__icon"
        @click="drawer = !drawer"
        aria-label="菜单"
      >
        <v-icon size="24">mdi-menu</v-icon>
      </button>

      <!-- 标题 -->
      <h1 class="mobile-toolbar__title">
        {{ pageTitle }}
      </h1>

      <!-- 右侧按钮 -->
      <div class="flex--gap-2">
        <button
          class="mobile-toolbar__icon"
          to="/profile"
          aria-label="个人资料"
        >
          <v-icon size="24">mdi-account</v-icon>
        </button>
      </div>
    </div>

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

    <!-- Main content - 重新设计布局 -->
    <v-main
      class="layout-main"
      :class="{
        'mobile-main': shouldUseMobileLayout,
        'full-bleed': isFullBleed
      }"
    >
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
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
  background-color: var(--color-bg-primary);
}

.layout-sidebar {
  backdrop-filter: blur(20px);
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border-primary);
}

.sidebar-profile {
  background: rgba(59, 130, 246, 0.1);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.layout-main {
  background-color: var(--color-bg-primary);
  padding: 0;
}

.mobile-main {
  padding-top: var(--toolbar-height-safe);
}

.full-bleed {
  padding: 0 !important;
}

/* Vuetify 组件深色主题适配 */
:deep(.v-navigation-drawer) {
  background-color: var(--color-bg-surface) !important;
  border-right: 1px solid var(--color-border-primary) !important;
}

:deep(.v-navigation-drawer .v-list-item-title) {
  color: var(--color-text-primary) !important;
}

:deep(.v-navigation-drawer .v-list-item) {
  color: var(--color-text-secondary) !important;
}

:deep(.v-navigation-drawer .v-list-item:hover) {
  background-color: var(--color-bg-overlay) !important;
}

:deep(.v-main) {
  background-color: var(--color-bg-primary) !important;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .layout-shell {
    flex-direction: column;
  }
}

/* 桌面端优化 */
@media (min-width: 961px) {
  .layout-sidebar {
    width: 240px !important;
  }
}
</style>
