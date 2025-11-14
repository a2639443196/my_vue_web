import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// Lazy load components
const Layout = () => import('@/layouts/DefaultLayout.vue')
const Home = () => import('@/views/Home.vue')
const Login = () => import('@/views/auth/Login.vue')
const Register = () => import('@/views/auth/Register.vue')
const Profile = () => import('@/views/user/Profile.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const WaterTracker = () => import('@/views/activities/WaterTracker.vue')
const ActivitiesHub = () => import('@/views/activities/ActivitiesHub.vue')
const ChatRoom = () => import('@/views/chat/ChatRoom.vue')
const Games = () => import('@/views/games/GamesHub.vue')
const SchulteGrid = () => import('@/views/games/SchulteGrid.vue')
const MemoryFlip = () => import('@/views/games/MemoryFlip.vue')
const ReactionTime = () => import('@/views/games/ReactionTime.vue')
const Sudoku = () => import('@/views/games/Sudoku.vue')
const NotFound = () => import('@/views/error/NotFound.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: Layout,
    children: [
      {
        path: '',
        name: 'Home',
        component: Home,
        meta: {
          title: '首页',
          requiresAuth: true
        }
      },
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: Dashboard,
        meta: {
          title: '仪表盘',
          requiresAuth: true
        }
      },
      {
        path: '/activities',
        name: 'Activities',
        component: ActivitiesHub,
        meta: {
          title: '活动记录',
          requiresAuth: true
        }
      },
      {
        path: '/water',
        name: 'WaterTracker',
        component: WaterTracker,
        meta: {
          title: '饮水追踪',
          requiresAuth: true
        }
      },
      {
        path: '/chat',
        name: 'ChatRoom',
        component: ChatRoom,
        meta: {
          title: '聊天室',
          requiresAuth: true,
          keepAlive: true,
          fullBleed: true
        }
      },
      {
        path: '/games',
        name: 'Games',
        component: Games,
        meta: {
          title: '小游戏',
          requiresAuth: true
        }
      },
      {
        path: '/games/schulte',
        name: 'SchulteGrid',
        component: SchulteGrid,
        meta: {
          title: '舒尔特方格',
          requiresAuth: true
        }
      },
      {
        path: '/games/memory',
        name: 'MemoryFlip',
        component: MemoryFlip,
        meta: {
          title: '记忆翻牌',
          requiresAuth: true
        }
      },
      {
        path: '/games/reaction',
        name: 'ReactionTime',
        component: ReactionTime,
        meta: {
          title: '反应时间',
          requiresAuth: true
        }
      },
      {
        path: '/games/sudoku',
        name: 'Sudoku',
        component: Sudoku,
        meta: {
          title: '数独',
          requiresAuth: true
        }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: {
          title: '个人资料',
          requiresAuth: true
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '登录',
      requiresAuth: false,
      hideForAuth: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '注册',
      requiresAuth: false,
      hideForAuth: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: {
      title: '页面未找到'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    // Keep scroll position for certain routes
    if (to.meta.keepAlive) {
      return false
    }
    return { top: 0 }
  }
})

// Navigation guards
router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  // Initialize user store if not initialized
  if (!userStore.initialized) {
    await userStore.initialize()
  }

  const isAuthenticated = userStore.isAuthenticated
  const requiresAuth = to.meta.requiresAuth
  const hideForAuth = to.meta.hideForAuth

  // Handle authentication
  if (requiresAuth && !isAuthenticated) {
    // Save intended destination
    const redirect = to.fullPath !== '/' ? to.fullPath : undefined
    next({
      name: 'Login',
      query: redirect ? { redirect } : undefined
    })
  } else if (hideForAuth && isAuthenticated) {
    // Redirect authenticated users away from auth pages
    next({ name: 'Home' })
  } else {
    // Proceed with navigation
    next()
  }
})

export default router
