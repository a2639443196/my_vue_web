<template>
  <input
    v-bind="$attrs"
    :class="[
      'w-full rounded-xl bg-[rgb(var(--card))] border border-white/10 text-white placeholder:text-[rgb(var(--muted-foreground))]',
      'focus:outline-none focus:border-[rgb(var(--primary))] focus:ring-2 focus:ring-[rgb(var(--primary))]/40',
      sizeClass,
      className
    ]"
    :type="type"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    type?: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
  }>(),
  {
    type: 'text',
    size: 'md',
    className: ''
  }
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'h-10 px-3 text-sm'
  if (props.size === 'lg') return 'h-12 px-4'
  return 'h-11 px-4'
})
</script>
