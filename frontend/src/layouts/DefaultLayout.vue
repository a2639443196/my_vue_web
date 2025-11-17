<template>
  <div class="app-surface">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.app-surface {
  min-height: 100vh;
  background:
    radial-gradient(circle at 10% 15%, rgba(var(--primary), 0.08), transparent 38%),
    radial-gradient(circle at 85% 10%, rgba(var(--secondary), 0.08), transparent 40%),
    rgb(var(--background));
  color: rgb(var(--text-primary));
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
