<template>
  <label :for="forId" class="block text-sm text-secondary mb-2">
    <slot />
  </label>
</template>

<script setup lang="ts">
defineProps<{ forId?: string }>()
</script>
