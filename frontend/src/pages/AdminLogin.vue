<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Wifi, Lock, Mail, Eye, EyeOff } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { useToast } from '../composables/useToast'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const { login, isAuthenticated, initAuth } = useAuth()
const router = useRouter()
const toast = useToast()

initAuth()

const goHome = () => {
  if (isAuthenticated.value) router.replace('/admin/dashboard')
}
goHome()

async function handleSubmit() {
  loading.value = true
  try {
    const result = await login(email.value, password.value)
    if (result.success) {
      toast.success('Login successful!')
      router.replace('/admin/dashboard')
    } else {
      toast.error(result.error || 'Login failed')
    }
  } catch {
    toast.error('Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-screen">
    <div class="login-card card card--glass">
      <div class="login-brand">
        <div class="logo-box">
          <Wifi class="logo-icon" />
        </div>
        <h1>COLLOSPOT</h1>
        <h2>Admin Dashboard</h2>
        <p class="muted">Sign in to manage your WiFi billing system</p>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div>
          <label class="label" for="email">Email Address</label>
          <div class="input-wrap">
            <Mail />
            <input
              id="email"
              v-model="email"
              class="input input--with-icon"
              type="email"
              autocomplete="email"
              required
              placeholder="admin@collospot.com"
            />
          </div>
        </div>

        <div>
          <label class="label" for="password">Password</label>
          <div class="input-wrap">
            <Lock />
            <input
              id="password"
              v-model="password"
              class="input input--with-icon input--password"
              :type="showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              required
              placeholder="Enter your password"
            />
            <button
              type="button"
              class="password-toggle"
              aria-label="Toggle password visibility"
              @click="showPassword = !showPassword"
            >
              <component :is="showPassword ? EyeOff : Eye" style="width: 16px; height: 16px" />
            </button>
          </div>
        </div>

        <button class="btn btn--primary btn--lg btn--block" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner spinner--inline"></span>
          {{ loading ? 'Signing in…' : 'Sign In' }}
        </button>
      </form>

      <p class="login-default muted">Default credentials: admin@collospot.com / admin123</p>

      <div class="text-center">
        <RouterLink to="/portal" class="back-link">← Back to Customer Portal</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-screen {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.25rem;
}
.login-card { width: min(100%, 420px); padding: 2.2rem; }
.login-brand { text-align: center; margin-bottom: 1.8rem; }
.logo-box {
  width: 3.4rem; height: 3.4rem;
  margin: 0 auto 0.8rem;
  border-radius: var(--radius-lg);
  background: var(--grad-brand);
  display: grid; place-items: center;
  box-shadow: 0 12px 28px -10px rgba(91, 77, 251, .6);
}
.logo-icon { width: 26px; height: 26px; color: #fff; }
.login-brand h1 { font-size: 1.6rem; }
.login-brand h2 { font-size: 1.05rem; font-weight: 600; margin-top: 0.4rem; }
.login-brand p { font-size: 0.85rem; margin-top: 0.2rem; }
.login-form { display: grid; gap: 1.1rem; }
.input--password { padding-right: 2.5rem; }
.password-toggle {
  position: absolute; right: 0.6rem; top: 50%; transform: translateY(-50%);
  background: none; border: 0; color: var(--text-muted); padding: 4px;
  border-radius: 6px; display: grid; place-items: center;
}
.password-toggle:hover { color: var(--text-strong); }
.spinner--inline { width: 15px; height: 15px; border-width: 2px; border-color: rgba(255,255,255,.4); border-top-color: #fff; }
.login-default { text-align: center; font-size: 0.72rem; margin: 1.2rem 0 0.9rem; }
.text-center { text-align: center; }
.back-link {
  color: var(--brand-500); font-size: 0.85rem; font-weight: 600;
  text-decoration: none; display: inline-block; margin-top: 0.2rem;
}
.back-link:hover { text-decoration: underline; }
</style>
