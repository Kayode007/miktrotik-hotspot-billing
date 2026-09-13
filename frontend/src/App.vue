<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAuth } from './composables/useAuth'
import ToastHost from './components/ToastHost.vue'

const { loading, initAuth } = useAuth()
initAuth()
</script>

<template>
  <div class="app-shell">
    <div v-if="loading" class="app-loader">
      <div class="spinner"></div>
    </div>
    <RouterView v-else />
    <ToastHost />
  </div>
</template>

<style scoped>
.app-loader {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: var(--bg-base);
}
</style>
