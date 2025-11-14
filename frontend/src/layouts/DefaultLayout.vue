<template>
  <div class="layout-shell">
    <!-- Mobile top app bar -->
    <v-app-bar
      v-if="isMobile"
      :color="isDark ? 'grey-900' : 'primary'"
      prominent
      elevation="2"
    >
      <template #prepend>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      </template>

      <v-app-bar-title class="text-white">
        {{ pageTitle }}
      </v-app-bar-title>

      <template #append>
        <!-- User avatar -->
        <v-menu>
          <template #activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="32">
                <v-img
                  v-if="userStore.user?.avatar"
                  :src="userStore.user.avatar"
                  :alt="userStore.user.username"
                />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-list-item-title>个人资料</v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleTheme">
              <v-list-item-title>
                <v-icon left>{{ isDark ? 'mdi-brightness-7' : 'mdi-brightness-4' }}</v-icon>
                {{ isDark ? '浅色模式' : '深色模式' }}
              </v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="handleLogout">
              <v-list-item-title>
                <v-icon left color="error">mdi-logout</v-icon>
                退出登录
              </v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
    </v-app-bar>

    <!-- Navigation drawer for mobile -->
    <v-navigation-drawer
      v-model="drawer"
      v-if="isMobile"
      temporary
      :width="280"
    >
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
    </v-navigation-drawer>

    <!-- Desktop sidebar -->
    <v-navigation-drawer
      v-if="!isMobile"
      permanent
      :width="280"
      class="border-r layout-sidebar"
    >
      <div class="pa-4">
        <h1 class="text-2xl font-bold gradient-text">Wellness Hub</h1>
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
            <v-avatar size="64" class="mb-2">
              <v-img
                v-if="userStore.user.avatar"
                :src="userStore.user.avatar"
                :alt="userStore.user.username"
              />
              <v-icon v-else size="64">mdi-account</v-icon>
            </v-avatar>
            <p class="text-subtitle-1 font-weight-bold">
              {{ userStore.user.username }}
            </p>
            <p class="text-caption text-grey-500">
              {{ userContact }}
            </p>
            <v-btn
              class="mt-2"
              variant="outlined"
              size="small"
              @click="toggleTheme"
            >
              <v-icon left>{{ isDark ? 'mdi-brightness-7' : 'mdi-brightness-4' }}</v-icon>
              主题
            </v-btn>
          </v-card>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Main content -->
    <v-main class="layout-main">
      <v-container
        class="layout-container"
        :fluid="isMobile"
      >
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Bottom navigation for mobile -->
    <v-bottom-navigation
      v-if="isMobile && showBottomNav"
      :model-value="currentActiveTab"
      grow
      color="primary"
      class="border-t"
      @update:model-value="handleNavChange"
    >
      <v-btn
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
        :value="item.to"
        variant="text"
      >
        <v-icon>{{ item.icon }}</v-icon>
        <span>{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useBreakpoints } from '@/composables/useBreakpoints'
import { useThemeStore } from '@/stores/theme'

// Composables
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const { isMobile } = useBreakpoints()
const themeStore = useThemeStore()

// State
const drawer = ref(false)
const isDark = computed(() => themeStore.isDark)

// Computed
const pageTitle = computed(() => route.meta.title || 'Wellness Hub')
const showBottomNav = computed(() => {
  const hiddenRoutes = ['/login', '/register']
  return !hiddenRoutes.includes(route.path)
})

const userContact = computed(() => userStore.user?.phone || userStore.user?.email || '未填写联系方式')

const navigationItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/dashboard', title: '仪表盘', icon: 'mdi-view-dashboard' },
  { to: '/activities', title: '活动记录', icon: 'mdi-chart-line' },
  { to: '/water', title: '饮水追踪', icon: 'mdi-water' },
  { to: '/chat', title: '聊天室', icon: 'mdi-chat' },
  { to: '/games', title: '小游戏', icon: 'mdi-gamepad' },
])

const bottomNavItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/activities', title: '活动', icon: 'mdi-chart-line' },
  { to: '/chat', title: '聊天', icon: 'mdi-chat' },
  { to: '/games', title: '游戏', icon: 'mdi-gamepad' },
])

// 计算当前激活的Tab
const currentActiveTab = computed(() => {
  const path = route.path
  // 精确匹配
  const exactMatch = bottomNavItems.value.find(item => item.to === path)
  if (exactMatch) return exactMatch.to

  // 首页特殊处理，只有完全匹配才选中
  if (path === '/') return '/'

  // 其他路径检查是否匹配子路径
  const match = bottomNavItems.value.find(item => {
    if (item.to === '/') return false
    return path.startsWith(item.to)
  })

  return match ? match.to : null
})

// 处理导航变化
const handleNavChange = (value: string) => {
  if (value && value !== route.path) {
    router.push(value)
  }
}

const toggleTheme = () => {
  themeStore.toggle()
}

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
    if (isMobile.value) {
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
  background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.08), transparent 45%),
    radial-gradient(circle at 90% 0%, rgba(59, 130, 246, 0.08), transparent 40%),
    #f7f8fc;
}

.layout-sidebar {
  backdrop-filter: blur(18px);
  background-color: rgba(255, 255, 255, 0.85);
}

.sidebar-profile {
  background: rgba(99, 102, 241, 0.08);
  border-radius: 16px;
}

.layout-main {
  background: transparent;
  padding-bottom: 2rem;
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
