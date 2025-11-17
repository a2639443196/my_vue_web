<template>
  <button
    class="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[rgb(var(--card))] border border-white/5 hover:bg-[rgb(var(--card-elevated))] active:scale-95 transition-base"
    @click="$emit('click')"
  >
    <div
      class="w-12 h-12 rounded-xl flex items-center justify-center text-white"
      :style="{ background: `linear-gradient(135deg, ${color}, ${color}dd)` }"
    >
      <Icon :icon="icon" class="w-6 h-6" />
    </div>
    <span class="caption">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'

defineEmits<{ (e: 'click'): void }>()

withDefaults(
  defineProps<{
    icon: string
    label: string
    color?: string
  }>(),
  {
    color: 'rgb(var(--primary))'
  }
)
</script>
