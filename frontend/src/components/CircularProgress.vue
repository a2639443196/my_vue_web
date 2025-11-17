<template>
  <div class="relative inline-flex items-center justify-center">
    <svg :width="size" :height="size" class="transform -rotate-90" aria-hidden="true">
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke="`rgb(${muted})`"
        :stroke-width="strokeWidth"
        fill="none"
      />
      <circle
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        stroke="url(#gradient)"
        :stroke-width="strokeWidth"
        fill="none"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="offset"
        stroke-linecap="round"
        class="transition-all duration-500"
      />
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" :stop-color="`rgb(${accent})`" />
          <stop offset="100%" :stop-color="`rgb(${primary})`" />
        </linearGradient>
      </defs>
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center">
      <div v-if="label" class="text-3xl font-bold">{{ label }}</div>
      <div v-if="subLabel" class="caption mt-1">{{ subLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    max: number
    size?: number
    strokeWidth?: number
    label?: string
    subLabel?: string
  }>(),
  {
    size: 200,
    strokeWidth: 12
  }
)

const primary = 'var(--primary)'
const accent = 'var(--accent)'
const muted = 'var(--muted)'

const radius = computed(() => (props.size - props.strokeWidth) / 2)
const circumference = computed(() => radius.value * 2 * Math.PI)
const percentage = computed(() => (props.value / props.max) * 100)
const offset = computed(() => circumference.value - (percentage.value / 100) * circumference.value)
</script>
