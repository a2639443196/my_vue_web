<template>
  <div class="auth-layout">
    <div class="auth-hero">
      <div class="hero-content">
        <h1>欢迎回到彦祖的导航站</h1>
        <p>集中你的健康数据、互动社区与专注训练，一站式开启高效的一天。</p>
        <ul>
          <li>💧 精准记录每日饮水进度</li>
          <li>🧠 舒尔特方格与反应力测试随时训练</li>
          <li>💬 实时聊天室，保持与伙伴们的连接</li>
        </ul>
      </div>
    </div>

    <v-card class="auth-card" elevation="12">
      <v-card-title class="text-h5 font-weight-bold mb-2">账号登录</v-card-title>
      <v-card-subtitle class="mb-6 text-medium-emphasis">
        首次访问请先注册账号，登录信息会保存在浏览器本地。
      </v-card-subtitle>

      <v-form @submit.prevent="handleSubmit" ref="formRef">
        <v-text-field
          v-model="form.email"
          label="邮箱"
          type="email"
          required
          prepend-inner-icon="mdi-email-outline"
          :rules="[rules.required, rules.email]"
        ></v-text-field>

        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
          required
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required, rules.minLength]"
        ></v-text-field>

        <div class="d-flex justify-space-between align-center mb-4">
          <v-checkbox
            v-model="remember"
            label="记住登录状态"
            hide-details
            density="compact"
          ></v-checkbox>
          <v-btn variant="text" size="small" @click="goRegister">还没有账号？去注册</v-btn>
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="userStore.loading"
        >
          登录
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const formRef = ref()
const showPassword = ref(false)
const remember = ref(true)

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  required: (value: string) => (!!value && value.length > 0) || '该字段不能为空',
  email: (value: string) => /.+@.+\..+/.test(value) || '请输入正确的邮箱',
  minLength: (value: string) => value.length >= 6 || '密码长度至少为 6 位'
}

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    await userStore.login({ ...form })
    notificationStore.showSuccess('登录成功，欢迎回来！')

    if (!remember.value) {
      localStorage.removeItem('yanzu-nav-session')
    }

    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (error: any) {
    notificationStore.showError(error.message)
  }
}

const goRegister = () => {
  router.push({ name: 'Register' })
}
</script>

<style scoped>
.auth-layout {
  min-height: 100vh;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 4rem);
  background: radial-gradient(circle at top, rgba(76, 110, 245, 0.15), transparent),
    radial-gradient(circle at bottom, rgba(142, 84, 233, 0.2), transparent);
}

.auth-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1f36;
  padding: clamp(1rem, 5vw, 4rem);
}

.hero-content {
  max-width: 420px;
}

.hero-content h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-content p {
  color: rgba(26, 31, 54, 0.7);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.hero-content ul {
  list-style: none;
  display: grid;
  gap: 0.75rem;
  color: rgba(26, 31, 54, 0.85);
}

.auth-card {
  max-width: 420px;
  margin: auto;
  backdrop-filter: blur(12px);
}

@media (max-width: 960px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    order: 2;
    text-align: center;
  }

  .hero-content {
    max-width: none;
  }
}
</style>
