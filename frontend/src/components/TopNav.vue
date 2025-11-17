<template>
  <nav class="safe-top sticky top-0 z-50 glass-strong border-b border-white/5 px-4 py-3">
    <div class="flex items-center justify-between max-w-md mx-auto">
      <div class="w-10 h-10 flex items-center justify-center">
        <button
          v-if="showBack"
          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-base"
          @click="goBack"
        >
          <Icon icon="lucide:arrow-left" class="w-6 h-6" />
        </button>
        <button
          v-else-if="showMenu"
          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-base"
          @click="$emit('menu')"
        >
          <Icon icon="lucide:menu" class="w-6 h-6" />
        </button>
      </div>

      <h2 class="flex-1 text-center">{{ title }}</h2>

      <div class="w-10 h-10 flex items-center justify-center">
        <button
          v-if="showProfile"
          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/5 active:scale-95 transition-base"
          @click="goProfile"
        >
          <Icon icon="lucide:user" class="w-6 h-6" />
        </button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'

defineEmits<{
  (e: 'menu'): void
}>()

const props = withDefaults(
  defineProps<{
    title: string
    showBack?: boolean
    showMenu?: boolean
    showProfile?: boolean
  }>(),
  {
    showBack: false,
    showMenu: true,
    showProfile: false
  }
)

const router = useRouter()

const goBack = () => router.back()
const goProfile = () => router.push('/profile')
</script>
