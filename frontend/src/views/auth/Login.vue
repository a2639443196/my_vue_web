<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--card))]">
    <div class="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
      <div class="text-center mb-12">
        <div class="w-20 h-20 mx-auto mb-6 rounded-3xl gradient-primary flex items-center justify-center glow-primary">
          <span class="text-3xl">🧭</span>
        </div>
        <h1 class="mb-2">彦祖的导航站</h1>
        <p class="text-secondary">健康管理 · 高效生活</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for-id="username">用户名</Label>
          <div class="relative">
            <Icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <Input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="请输入用户名"
              class="pl-12 h-12"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for-id="password">密码</Label>
          <div class="relative">
            <Icon icon="lucide:lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <Input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="pl-12 h-12 pr-12"
            />
            <button
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted-foreground))] hover:text-white transition-base"
              @click="showPassword = !showPassword"
            >
              <Icon :icon="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div v-if="error" class="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p class="text-red-400 text-sm text-center">{{ error }}</p>
        </div>

        <Button type="submit" class="w-full h-12 gradient-primary glow-primary" :disabled="userStore.loading">
          <span v-if="userStore.loading">登录中...</span>
          <span v-else>登录</span>
        </Button>
      </form>

      <div class="text-center mt-8">
        <button class="text-[rgb(var(--primary))] hover:underline" @click="goRegister">
          还没有账号？立即注册
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const showPassword = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  password: ''
})

const handleSubmit = async () => {
  error.value = ''
  if (!form.username.trim() || !form.password) {
    error.value = '请填写所有字段'
    return
  }

  try {
    await userStore.login({
      username: form.username.trim(),
      password: form.password
    })
    notificationStore.showSuccess('登录成功，欢迎回来！')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (err: any) {
    error.value = err.message || '登录失败，请重试'
    notificationStore.showError(error.value)
  }
}

const goRegister = () => {
  router.push({ name: 'Register' })
}
</script>
