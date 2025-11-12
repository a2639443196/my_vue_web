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
        只需三步，立即加入彦祖的导航站。
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
          v-model="form.email"
          label="邮箱"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :rules="[rules.required, rules.email]"
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
  email: '',
  password: '',
  confirmPassword: ''
})

const rules = {
  required: (value: string) => (!!value && value.length > 0) || '该字段不能为空',
  email: (value: string) => /.+@.+\..+/.test(value) || '请输入正确的邮箱格式',
  minLength: (value: string) => value.length >= 6 || '密码长度至少为 6 位',
  minUser: (value: string) => value.length >= 2 || '用户名不少于 2 个字符'
}

const matchPassword = (value: string) => value === form.password || '两次密码输入不一致'

const handleSubmit = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    await userStore.register({ ...form })
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
  min-height: 100vh;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  padding: clamp(1.5rem, 4vw, 4rem);
  background: radial-gradient(circle at top, rgba(67, 160, 71, 0.18), transparent),
    radial-gradient(circle at bottom, rgba(47, 136, 255, 0.18), transparent);
}

.auth-hero {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a1f36;
  padding: clamp(1rem, 5vw, 4rem);
}

.hero-content {
  max-width: 460px;
}

.hero-content h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 700;
  margin-bottom: 1rem;
}

.hero-content p {
  color: rgba(26, 31, 54, 0.7);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-grid {
  display: grid;
  gap: 1.5rem;
}

.hero-grid h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
}

.hero-grid p {
  margin: 0;
  color: rgba(26, 31, 54, 0.75);
  line-height: 1.5;
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
