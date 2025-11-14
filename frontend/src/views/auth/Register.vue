<template>
  <div class="auth-layout">
    <div class="auth-hero">
      <div class="hero-content">
        <h1>注册成为彦祖的伙伴</h1>
        <p>创建一个专属账号，记录你的健康旅程，每一次喝水、训练与互动都将沉淀成成长的足迹。</p>
        <div class="hero-grid">
          <div>
            <h3>个性化仪表盘</h3>
            <p>登陆后可自定义首页导航卡片，将常用入口一键放入首页。</p>
          </div>
          <div>
            <h3>数据本地安全存储</h3>
            <p>所有信息都会保存于浏览器本地，无需担心账号被盗。</p>
          </div>
        </div>
      </div>
    </div>

    <v-card class="auth-card" elevation="12">
      <v-card-title class="text-h5 font-weight-bold mb-2">创建新账号</v-card-title>
      <v-card-subtitle class="mb-6 text-medium-emphasis">
        创建用户名和密码即可完成注册，支持手机号作为联系方式。
      </v-card-subtitle>

      <v-form @submit.prevent="handleSubmit" ref="formRef">
        <v-text-field
          v-model="form.username"
          label="用户名"
          prepend-inner-icon="mdi-account-outline"
          :rules="[rules.required, rules.minUser]"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.phone"
          label="手机号"
          type="tel"
          inputmode="tel"
          prepend-inner-icon="mdi-cellphone"
          :rules="[rules.required, rules.phone]"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="密码"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required, rules.minLength]"
          required
        ></v-text-field>

        <v-text-field
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          label="确认密码"
          prepend-inner-icon="mdi-lock-check-outline"
          :rules="[rules.required, matchPassword]"
          required
        ></v-text-field>

        <div class="mb-4 text-body-2 text-medium-emphasis">
          点击注册表示你同意在浏览器本地保存账号数据。
        </div>

        <v-btn
          type="submit"
          color="primary"
          block
          size="large"
          :loading="userStore.loading"
        >
          注册
        </v-btn>

        <v-btn class="mt-4" variant="text" block @click="goLogin">
          已有账号？点击登录
        </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const formRef = ref()
const showPassword = ref(false)

const form = reactive({
  username: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  required: (value: string) => (!!value && value.length > 0) || '该字段不能为空',
  phone: (value: string) => /^\d{6,15}$/.test(value.replace(/\D/g, '')) || '请输入有效的手机号',
  minLength: (value: string) => value.length >= 6 || '密码长度至少为 6 位',
  minUser: (value: string) => value.length >= 2 || '用户名不少于 2 个字符'
}

const matchPassword = (value: string) => value === form.password || '两次密码输入不一致'

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    await userStore.register({
      username: form.username.trim(),
      phone: form.phone.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      email: ''
    })
    notificationStore.showSuccess('注册成功，已为你自动登录')
    router.replace('/')
  } catch (error: any) {
    notificationStore.showError(error.message)
  }
}

const goLogin = () => router.push({ name: 'Login' })
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
  background: radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.15), transparent 55%),
    radial-gradient(circle at 90% 0%, rgba(59, 130, 246, 0.12), transparent 55%),
    #ffffff;
  box-shadow: 0 25px 70px rgba(15, 23, 42, 0.08);
}

.hero-content {
  max-width: 500px;
}

.hero-content h1 {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  margin-bottom: 1rem;
  color: #064e3b;
}

.hero-content p {
  color: rgba(6, 78, 59, 0.75);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.hero-grid {
  display: grid;
  gap: 1.25rem;
}

.hero-grid h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
  color: #0f172a;
}

.hero-grid p {
  margin: 0;
  color: rgba(15, 23, 42, 0.7);
  line-height: 1.6;
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
