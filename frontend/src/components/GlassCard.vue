<template>
  <div
    :class="[
      'bg-[rgb(var(--card))] rounded-[var(--radius-lg)] p-5 border border-white/5 shadow-card',
      hover ? 'shadow-card hover:shadow-card-hover active:scale-95 transition-base cursor-pointer' : '',
      className
    ]"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  hover?: boolean
  className?: string
  onClick?: () => void
}>()
</script>
