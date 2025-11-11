<template>
  <v-app :theme="isDark ? 'dark' : 'light'">
    <!-- System loading indicator -->
    <div v-if="systemLoading" class="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p class="mt-4 text-gray-600 dark:text-gray-400">{{ $t('app.loading') }}</p>
      </div>
    </div>

    <!-- Main app when not loading -->
    <template v-else>
      <!-- App bar for mobile -->
      <v-app-bar v-if="isMobile" color="primary" prominent>
        <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
        <v-toolbar-title class="text-white">{{ pageTitle }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- User menu -->
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn icon v-bind="props">
              <v-avatar size="32">
                <img v-if="userStore.user?.avatar" :src="userStore.user.avatar" :alt="userStore.user?.username" />
                <v-icon v-else>mdi-account</v-icon>
              </v-avatar>
            </v-btn>
          </template>
          <v-list>
            <v-list-item to="/profile">
              <v-list-item-title>个人资料</v-list-item-title>
            </v-list-item>
            <v-list-item @click="toggleTheme">
              <v-list-item-title>切换主题</v-list-item-title>
            </v-list-item>
            <v-divider></v-divider>
            <v-list-item @click="logout">
              <v-list-item-title>退出登录</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-app-bar>

      <!-- Navigation drawer for mobile -->
      <v-navigation-drawer v-model="drawer" v-if="isMobile">
        <v-list>
          <v-list-item to="/" title="首页" prepend-icon="mdi-home"></v-list-item>
          <v-list-item to="/chat" title="聊天室" prepend-icon="mdi-chat"></v-list-item>
          <v-list-item to="/water" title="饮水记录" prepend-icon="mdi-water"></v-list-item>
          <v-list-item to="/bowel" title="健康记录" prepend-icon="mdi-toilet"></v-list-item>
          <v-list-item to="/smoking" title="戒烟追踪" prepend-icon="mdi-smoking"></v-list-item>
          <v-list-item to="/slack" title="摸鱼记录" prepend-icon="mdi-coffee"></v-list-item>
          <v-list-item to="/games" title="小游戏" prepend-icon="mdi-gamepad"></v-list-item>
        </v-list>
      </v-navigation-drawer>

      <!-- Main content -->
      <v-main>
        <v-container fluid class="pa-0">
          <router-view v-slot="{ Component }">
            <transition name="fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </v-container>
      </v-main>

      <!-- Bottom navigation for mobile -->
      <v-bottom-navigation v-if="isMobile && showBottomNav" grow color="primary">
        <v-btn to="/" variant="text">
          <v-icon>mdi-home</v-icon>
          <span>首页</span>
        </v-btn>
        <v-btn to="/activities" variant="text">
          <v-icon>mdi-chart-line</v-icon>
          <span>活动</span>
        </v-btn>
        <v-btn to="/chat" variant="text">
          <v-icon>mdi-chat</v-icon>
          <span>聊天</span>
        </v-btn>
        <v-btn to="/games" variant="text">
          <v-icon>mdi-gamepad</v-icon>
          <span>游戏</span>
        </v-btn>
      </v-bottom-navigation>

      <!-- Desktop sidebar -->
      <v-navigation-drawer v-if="!isMobile" permanent width="280">
        <div class="pa-4">
          <h1 class="text-2xl font-bold text-primary">Wellness Hub</h1>
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

        <template v-slot:append>
          <div class="pa-4">
            <v-card v-if="userStore.user" class="text-center">
              <v-avatar size="64" class="mb-2">
                <img v-if="userStore.user.avatar" :src="userStore.user.avatar" :alt="userStore.user.username" />
                <v-icon v-else size="64">mdi-account</v-icon>
              </v-avatar>
              <p class="text-subtitle-1 font-weight-bold">{{ userStore.user.username }}</p>
              <p class="text-caption text-grey-500">{{ userStore.user.email }}</p>
              <v-btn class="mt-2" variant="outlined" size="small" @click="toggleTheme">
                <v-icon left>{{ isDark ? 'mdi-brightness-7' : 'mdi-brightness-4' }}</v-icon>
                主题
              </v-btn>
            </v-card>
          </div>
        </template>
      </v-navigation-drawer>
    </template>

    <!-- Global notifications -->
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

// Composables
const route = useRoute()
const router = useRouter()
const theme = useTheme()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

// State
const drawer = ref(false)
const systemLoading = ref(true)
const isDark = ref(false)

// Computed
const isMobile = computed(() => {
  return typeof window !== 'undefined' && window.innerWidth < 768
})

const pageTitle = computed(() => {
  return route.meta.title || 'Wellness Hub'
})

const showBottomNav = computed(() => {
  const hiddenRoutes = ['/login', '/register']
  return !hiddenRoutes.includes(route.path)
})

const navigationItems = computed(() => [
  { to: '/', title: '首页', icon: 'mdi-home' },
  { to: '/activities', title: '活动记录', icon: 'mdi-chart-line' },
  { to: '/water', title: '饮水追踪', icon: 'mdi-water' },
  { to: '/bowel', title: '健康记录', icon: 'mdi-toilet' },
  { to: '/smoking', title: '戒烟追踪', icon: 'mdi-smoking' },
  { to: '/slack', title: '摸鱼记录', icon: 'mdi-coffee' },
  { to: '/chat', title: '聊天室', icon: 'mdi-chat' },
  { to: '/games', title: '小游戏', icon: 'mdi-gamepad' },
])

// Computed notifications
const notification = computed(() => notificationStore.current)

// Methods
const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

const logout = async () => {
  try {
    await userStore.logout()
    router.push('/login')
    notificationStore.showSuccess('退出登录成功')
  } catch (error) {
    notificationStore.showError('退出登录失败')
  }
}

// Lifecycle
onMounted(async () => {
  // Check system theme
  const savedTheme = localStorage.getItem('theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  isDark.value = savedTheme === 'dark' || (!savedTheme && prefersDark)
  theme.global.name.value = isDark.value ? 'dark' : 'light'

  // Initialize user
  await userStore.initialize()

  // Hide system loading
  setTimeout(() => {
    systemLoading.value = false
  }, 500)
})

// Watch route changes
watch(route, () => {
  // Close drawer on mobile when route changes
  if (isMobile.value) {
    drawer.value = false
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>