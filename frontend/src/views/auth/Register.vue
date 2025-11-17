<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-[rgb(var(--background))] to-[rgb(var(--card))]">
    <div class="flex-1 flex flex-col justify-center px-6 py-12 max-w-md mx-auto w-full">
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-4">
          <div :class="['h-1 flex-1 rounded-full', step >= 1 ? 'bg-[rgb(var(--primary))]' : 'bg-white/10']" />
          <div :class="['h-1 flex-1 rounded-full', step >= 2 ? 'bg-[rgb(var(--primary))]' : 'bg-white/10']" />
        </div>
        <p class="caption text-center">步骤 {{ step }} / 2</p>
      </div>

      <div class="text-center mb-8">
        <h1 class="mb-2">创建账号</h1>
        <p class="text-secondary">
          {{ step === 1 ? '输入基本信息' : '设置安全密码' }}
        </p>
      </div>

      <div v-if="step === 1" class="space-y-5">
        <div class="space-y-2">
          <Label for-id="username">用户名</Label>
          <div class="relative">
            <Icon icon="lucide:user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <Input
              id="username"
              v-model="form.username"
              type="text"
              placeholder="选择一个用户名"
              class="pl-12 h-12"
            />
          </div>
        </div>

        <div class="space-y-2">
          <Label for-id="email">邮箱</Label>
          <div class="relative">
            <Icon icon="lucide:mail" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <Input
              id="email"
              v-model="form.email"
              type="email"
              placeholder="your@email.com"
              class="pl-12 h-12"
            />
          </div>
        </div>
      </div>

      <div v-else class="space-y-5">
        <div class="space-y-2">
          <Label for-id="password">密码</Label>
          <div class="relative">
            <Icon icon="lucide:lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="设置密码"
              class="pl-12 h-12"
            />
          </div>
        </div>

        <div class="p-4 rounded-xl bg-[rgb(var(--card))] border border-white/5">
          <p class="caption mb-3">密码强度要求</p>
          <div class="space-y-2">
            <div v-for="req in passwordRequirements" :key="req.label" class="flex items-center gap-2">
              <Icon
                v-if="req.met"
                icon="lucide:check"
                class="w-4 h-4 text-green-400"
              />
              <Icon
                v-else
                icon="lucide:x"
                class="w-4 h-4 text-[rgb(var(--muted-foreground))]"
              />
              <span :class="['text-sm', req.met ? 'text-green-400' : 'text-[rgb(var(--muted-foreground))]']">
                {{ req.label }}
              </span>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <Label for-id="confirmPassword">确认密码</Label>
          <div class="relative">
            <Icon icon="lucide:lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            <Input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              class="pl-12 h-12"
            />
          </div>
        </div>
      </div>

      <div class="mt-8 space-y-4">
        <Button
          class="w-full h-12 gradient-primary glow-primary"
          :disabled="primaryDisabled || userStore.loading"
          @click="handleContinue"
        >
          {{ step === 1 ? '继续' : '完成注册' }}
        </Button>

        <Button
          v-if="step === 2"
          variant="outline"
          class="w-full h-12 border-white/10"
          @click="step = 1"
        >
          返回
        </Button>
      </div>

      <div class="text-center mt-8">
        <button class="text-[rgb(var(--primary))] hover:underline" @click="goLogin">
          已有账号？立即登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Button from '@/components/ui/Button.vue'
import { useUserStore } from '@/stores/user'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const userStore = useUserStore()
const notificationStore = useNotificationStore()

const step = ref(1)
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const passwordRequirements = computed(() => [
  { label: '至少 8 个字符', met: form.password.length >= 8 },
  { label: '包含数字', met: /\d/.test(form.password) },
  { label: '包含大写字母', met: /[A-Z]/.test(form.password) },
  { label: '包含小写字母', met: /[a-z]/.test(form.password) }
])

const primaryDisabled = computed(() => {
  if (step.value === 1) return !form.username.trim() || !form.email.trim()
  return !form.password || !form.confirmPassword
})

const handleContinue = async () => {
  if (step.value === 1) {
    if (!form.username.trim() || !form.email.trim()) return
    step.value = 2
    return
  }

  if (form.password !== form.confirmPassword) {
    notificationStore.showError('两次密码输入不一致')
    return
  }

  try {
    await userStore.register({
      username: form.username.trim(),
      phone: form.email.trim() || form.username.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      email: form.email.trim()
    })
    notificationStore.showSuccess('注册成功，已为你自动登录')
    router.replace('/')
  } catch (error: any) {
    notificationStore.showError(error.message)
  }
}

const goLogin = () => router.push({ name: 'Login' })
</script>
