<template>
  <transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
      @click="close"
    />
  </transition>

  <div
    :class="[
      'fixed top-0 left-0 bottom-0 w-72 bg-[rgb(var(--card))] border-r border-white/10 z-50 transition-transform',
      isOpen ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="safe-top p-6 h-full flex flex-col">
      <div class="flex items-center justify-between mb-8">
        <h3>彦祖的导航站</h3>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-base"
          @click="close"
        >
          <Icon icon="lucide:x" class="w-6 h-6" />
        </button>
      </div>

      <nav class="space-y-2 flex-1 overflow-y-auto pr-1">
        <button
          v-for="item in menuItems"
          :key="item.path"
          class="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-base text-left"
          @click="handleNavigate(item.path)"
        >
          <Icon :icon="item.icon" class="w-5 h-5" />
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <button
        class="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 active:scale-95 transition-base text-red-400"
      >
        <Icon icon="lucide:log-out" class="w-5 h-5" />
        <span>退出登录</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()

const menuItems = computed(() => [
  { icon: 'lucide:home', label: '首页', path: '/' },
  { icon: 'lucide:bar-chart-3', label: '数据看板', path: '/dashboard' },
  { icon: 'lucide:activity', label: '活动中心', path: '/activities' },
  { icon: 'lucide:droplets', label: '喝水打卡', path: '/water' },
  { icon: 'lucide:message-circle', label: '聊天室', path: '/chat' },
  { icon: 'lucide:gamepad-2', label: '训练游戏', path: '/games' },
  { icon: 'lucide:user', label: '个人中心', path: '/profile' }
])

const handleNavigate = (path: string) => {
  router.push(path)
  emit('close')
}

const close = () => emit('close')
</script>
