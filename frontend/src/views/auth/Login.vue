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
        使用手机号即可登录，所有数据仅保存在你的浏览器本地。
      </v-card-subtitle>

      <v-form @submit.prevent="handleSubmit" ref="formRef">
        <v-text-field
          v-model="form.phone"
          label="手机号 / 邮箱"
          type="text"
          inputmode="tel"
          required
          prepend-inner-icon="mdi-cellphone"
          :rules="[rules.required, rules.phone]"
          hint="老用户可继续使用邮箱登录"
          persistent-hint
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
  phone: '',
  password: ''
})

const rules = {
  required: (value: string) => (!!value && value.length > 0) || '该字段不能为空',
  phone: (value: string) => {
    const trimmed = value.trim()
    if (!trimmed) return '请输入手机号或邮箱'
    const numeric = trimmed.replace(/\D/g, '')
    const isPhone = /^\d{6,15}$/.test(numeric)
    const isEmail = /.+@.+\..+/.test(trimmed)
    return (isPhone || isEmail) || '请输入有效的手机号或邮箱'
  },
  minLength: (value: string) => value.length >= 6 || '密码长度至少为 6 位'
}

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    await userStore.login({
      username: form.phone.trim(),
      password: form.password
    })
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
  min-height: calc(100vh - 80px);
  width: min(1200px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: clamp(1.5rem, 4vw, 3.5rem);
  padding: clamp(1.5rem, 5vw, 4rem);
  align-items: center;
}

.auth-hero {
  border-radius: 32px;
  padding: clamp(1.5rem, 5vw, 4rem);
  background: radial-gradient(circle at 20% 20%, rgba(99, 102, 241, 0.15), transparent 60%),
    radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.12), transparent 60%),
    #ffffff;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.1);
}

.hero-content {
  max-width: 460px;
}

.hero-content h1 {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: #0f172a;
}

.hero-content p {
  color: rgba(15, 23, 42, 0.75);
  margin-bottom: 1.75rem;
  line-height: 1.7;
}

.hero-content ul {
  list-style: none;
  display: grid;
  gap: 0.85rem;
  color: rgba(15, 23, 42, 0.85);
  padding-left: 0;
  margin: 0;
}

.auth-card {
  max-width: 440px;
  margin: auto;
  border-radius: 28px;
  padding: 1.5rem;
  backdrop-filter: blur(14px);
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.08);
}

@media (max-width: 960px) {
  .auth-layout {
    grid-template-columns: 1fr;
    padding-top: 3rem;
    padding-bottom: 3rem;
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
