import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createHead } from '@vueuse/head'
import { vuetify } from '@/plugins/vuetify'
import naive from 'naive-ui'

import App from './App.vue'
import router from './router'

// Import styles
import '@/styles/main.css'
import 'vuetify/styles'
import 'naive-ui/es/style'

// Create i18n instance
const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': {
      app: {
        title: '健康生活管理平台',
        description: '追踪和管理您的健康生活'
      }
    },
    en: {
      app: {
        title: 'Wellness Hub',
        description: 'Track and manage your wellness journey'
      }
    }
  }
})

// Create head instance
const head = createHead()

// Create app instance
const app = createApp(App)

// Use plugins
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(head)
app.use(vuetify)
app.use(naive)

// Global properties
app.config.globalProperties.$head = head

// Mount app
app.mount('#app')