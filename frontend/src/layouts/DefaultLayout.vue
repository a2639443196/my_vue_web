<template>
  <div class="layout">
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
      class="border-r"
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
          <v-card v-if="userStore.user" class="text-center" elevation="0">
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
              {{ userStore.user.email }}
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
    <v-main>
      <v-container
        :class="[
          'pa-4',
          { 'pa-2': isMobile }
        ]"
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
      grow
      color="primary"
      class="border-t"
    >
      <v-btn
        v-for="item in bottomNavItems"
        :key="item.to"
        :to="item.to"
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
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'
import { useBreakpoints } from '@/composables/useBreakpoints'

// Composables
const route = useRoute()
const theme = useTheme()
const userStore = useUserStore()
const notificationStore = useNotificationStore()
const { isMobile } = useBreakpoints()

// State
const drawer = ref(false)
const isDark = ref(false)

// Computed
const pageTitle = computed(() => route.meta.title || 'Wellness Hub')
const showBottomNav = computed(() => {
  const hiddenRoutes = ['/login', '/register']
  return !hiddenRoutes.includes(route.path)
})

const navigationItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/dashboard', title: '仪表盘', icon: 'mdi-view-dashboard' },
  { to: '/activities', title: '活动记录', icon: 'mdi-chart-line' },
  { to: '/water', title: '饮水追踪', icon: 'mdi-water' },
  { to: '/bowel', title: '健康记录', icon: 'mdi-toilet' },
  { to: '/smoking', title: '戒烟追踪', icon: 'mdi-smoking' },
  { to: '/slack', title: '摸鱼记录', icon: 'mdi-coffee' },
  { to: '/chat', title: '聊天室', icon: 'mdi-chat' },
  { to: '/games', title: '小游戏', icon: 'mdi-gamepad' },
])

const bottomNavItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/activities', title: '活动', icon: 'mdi-chart-line' },
  { to: '/chat', title: '聊天', icon: 'mdi-chat' },
  { to: '/games', title: '游戏', icon: 'mdi-gamepad' },
])

// Methods
const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    notificationStore.showSuccess('退出登录成功')
  } catch (error) {
    notificationStore.showError('退出登录失败')
  }
}

// Initialize theme
const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  theme.global.name.value = isDark.value ? 'dark' : 'light'
}

// Watch route changes to close drawer on mobile
watch(route, () => {
  if (isMobile.value) {
    drawer.value = false
  }
})

// Lifecycle
initializeTheme()
</script>

<style scoped>
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
</style>