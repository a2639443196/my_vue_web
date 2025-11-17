<template>
  <div class="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center px-6">
    <div class="max-w-md w-full text-center space-y-6">
      <div class="mb-4">
        <div class="w-32 h-32 mx-auto rounded-full bg-[rgb(var(--primary))]/10 flex items-center justify-center">
          <Icon icon="lucide:alert-circle" class="w-16 h-16 text-[rgb(var(--primary))]" />
        </div>
      </div>
      <div>
          <div class="text-6xl mb-4 bg-gradient-to-r from-[rgb(var(--primary))] to-[rgb(var(--secondary))] bg-clip-text text-transparent">
            404
          </div>
          <h2 class="mb-2">页面未找到</h2>
          <p class="text-secondary">抱歉，您访问的页面不存在或已被移除</p>
      </div>
      <div class="space-y-3">
        <Button class="w-full h-12 gradient-primary glow-primary" @click="goHome">
          <Icon icon="lucide:home" class="w-5 h-5 mr-2" />
          返回首页
        </Button>
        <Button variant="outline" class="w-full h-12 border-white/10" @click="goBack">
          返回上一页
        </Button>
      </div>
      <div class="mt-4 p-6 rounded-2xl bg-[rgb(var(--card))] border border-white/5 text-left">
        <h4 class="mb-3">您可能想要访问</h4>
        <div class="space-y-2">
          <button
            v-for="link in links"
            :key="link.path"
            class="w-full text-left py-2 px-3 rounded-lg hover:bg-white/5 transition-base text-[rgb(var(--primary))]"
            @click="navigateTo(link.path)"
          >
            {{ link.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

const links = [
  { label: '首页', path: '/' },
  { label: '数据看板', path: '/dashboard' },
  { label: '喝水打卡', path: '/water' },
  { label: '训练游戏', path: '/games' }
]

const goHome = () => router.push('/')
const goBack = () => router.back()
const navigateTo = (path: string) => router.push(path)
</script>
