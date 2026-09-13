<script setup lang="ts">
import { useToast } from '../composables/useToast'
import { CheckCircle2, XCircle, Info, X } from 'lucide-vue-next'

const { toasts, dismiss } = useToast()
</script>

<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="toast-host" aria-live="polite">
      <div v-for="t in toasts" :key="t.id" class="toast" :class="`toast--${t.type}`">
        <component
          :is="t.type === 'success' ? CheckCircle2 : t.type === 'error' ? XCircle : Info"
          class="toast__icon"
        />
        <span class="toast__msg">{{ t.message }}</span>
        <button class="toast__close" aria-label="Dismiss" @click="dismiss(t.id)">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<style scoped>
.toast-host {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: min(92vw, 380px);
}
.toast {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-strong);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-subtle);
  border-left: 4px solid var(--accent);
}
.toast--success { border-left-color: var(--success); }
.toast--error   { border-left-color: var(--danger); }
.toast--info    { border-left-color: var(--info); }
.toast__icon { width: 18px; height: 18px; flex: none; }
.toast--success .toast__icon { color: var(--success); }
.toast--error   .toast__icon { color: var(--danger); }
.toast--info    .toast__icon { color: var(--info); }
.toast__msg { font-size: 0.875rem; font-weight: 500; flex: 1; }
.toast__close {
  background: none; border: 0; cursor: pointer; color: var(--text-muted);
  display: grid; place-items: center; padding: 2px; border-radius: 6px;
}
.toast__close:hover { color: var(--text-strong); }

.toast-enter-active, .toast-leave-active { transition: all .35s cubic-bezier(.22,1,.36,1); }
.toast-enter-from { opacity: 0; transform: translateX(24px) scale(.95); }
.toast-leave-to   { opacity: 0; transform: translateY(-8px); }
.toast-move { transition: transform .3s ease; }
</style>
