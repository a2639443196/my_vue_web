<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center font-semibold rounded-xl transition-base',
      disabled ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.98]',
      sizeClass,
      variantClass,
      className
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(
  defineProps<{
    variant?: 'solid' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    className?: string
  }>(),
  {
    variant: 'solid',
    size: 'md',
    type: 'button',
    disabled: false,
    className: ''
  }
)

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-10 px-4 text-sm'
  if (props.size === 'lg') return 'h-12 px-5 text-base'
  return 'h-11 px-4 text-base'
})

const variantClass = computed(() => {
  if (props.variant === 'outline') {
    return 'border border-white/10 bg-transparent hover:bg-white/5 text-white'
  }
  if (props.variant === 'ghost') {
    return 'bg-transparent text-white hover:bg-white/5'
  }
  return 'gradient-primary text-white glow-primary'
})
</script>
