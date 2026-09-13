import { reactive, readonly } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

let uid = 0
const state = reactive<{ toasts: Toast[] }>({ toasts: [] })

function push(message: string, type: Toast['type'], duration = 3500) {
  const id = ++uid
  state.toasts.push({ id, message, type })
  setTimeout(() => dismiss(id), duration)
}

function dismiss(id: number) {
  const idx = state.toasts.findIndex(t => t.id === id)
  if (idx > -1) state.toasts.splice(idx, 1)
}

export function useToast() {
  return {
    toasts: readonly(state).toasts,
    dismiss,
    success: (msg: string) => push(msg, 'success'),
    error: (msg: string) => push(msg, 'error'),
    info: (msg: string) => push(msg, 'info'),
  }
}
