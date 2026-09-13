<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterView, RouterLink, useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, Users, CreditCard, Wifi, Settings, LogOut,
  Menu, X, Activity, TrendingUp, Bell, RefreshCw
} from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'
import { adminAPI } from '../services/api'
import { formatCurrency } from '../utils/formatters'
import { useToast } from '../composables/useToast'
import type { DashboardStats } from '../types'

const sidebarOpen = ref(false)
const stats = ref<DashboardStats | null>(null)
const loading = ref(true)
const refreshing = ref(false)
const { user, logout } = useAuth()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const navigation = [
  { name: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Users', to: '/admin/users', icon: Users },
  { name: 'Plans', to: '/admin/plans', icon: CreditCard },
  { name: 'Sessions', to: '/admin/sessions', icon: Wifi },
  { name: 'Payments', to: '/admin/payments', icon: Activity },
  { name: 'Settings', to: '/admin/settings', icon: Settings },
]

const initials = computed(() => (user.value?.firstName || 'A').charAt(0).toUpperCase())

onMounted(() => fetchStats())

async function fetchStats(showRefreshing = false) {
  try {
    if (showRefreshing) refreshing.value = true
    const response = await adminAPI.getDashboardStats()
    if (response.success && response.data) stats.value = response.data
  } catch {
    toast.error('Failed to load dashboard stats')
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function isActive(to: string) {
  return route.path.startsWith(to)
}

function handleLogout() {
  logout()
  router.push('/admin/login')
  toast.success('Logged out successfully')
}
</script>

<template>
  <div class="admin-shell">
    <Transition name="backdrop">
      <div v-if="sidebarOpen" class="sidebar-backdrop" @click="sidebarOpen = false" />
    </Transition>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ 'sidebar--open': sidebarOpen }">
      <div class="sidebar__brand">
        <div class="logo-box"><Wifi class="logo-icon" /></div>
        <div class="brand-text">
          <span class="brand-name text-gradient">COLLOSPOT</span>
          <p>Admin Portal</p>
        </div>
        <button class="icon-btn sidebar__close lg-hidden" aria-label="Close menu" @click="sidebarOpen = false">
          <X style="width: 18px; height: 18px" />
        </button>
      </div>

      <div class="sidebar__welcome card--glass">
        <div class="avatar">{{ initials }}</div>
        <div>
          <p class="welcome-title">Welcome back!</p>
          <p class="welcome-name">{{ user?.firstName || 'Admin' }}</p>
        </div>
      </div>

      <nav class="sidebar__nav">
        <RouterLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{ 'nav-item--active': isActive(item.to) }"
          @click="sidebarOpen = false"
        >
          <component :is="item.icon" class="nav-icon" />
          {{ item.name }}
        </RouterLink>
      </nav>

      <button class="signout" @click="handleLogout">
        <LogOut class="nav-icon" />
        Sign Out
      </button>
    </aside>

    <!-- Main -->
    <div class="main-col">
      <header class="topbar">
        <button class="icon-btn lg-hidden" aria-label="Open menu" @click="sidebarOpen = true">
          <Menu style="width: 20px; height: 20px" />
        </button>

        <div class="topbar__stats" v-if="stats">
          <div class="chip chip--revenue">
            <TrendingUp style="width: 14px; height: 14px" />
            <strong>{{ formatCurrency(stats.todayRevenue) }}</strong>
            <span>today</span>
          </div>
          <div class="chip chip--sessions">
            <Activity style="width: 14px; height: 14px" />
            <strong>{{ stats.activeSessions }}</strong>
            <span>active</span>
          </div>
        </div>

        <div class="topbar__actions">
          <button class="icon-btn" aria-label="Refresh data" :disabled="refreshing" @click="fetchStats(true)">
            <RefreshCw :class="{ 'spin': refreshing }" style="width: 18px; height: 18px" />
          </button>
          <button class="icon-btn icon-btn--dot" aria-label="Notifications">
            <Bell style="width: 18px; height: 18px" />
          </button>
        </div>
      </header>

      <main class="content">
        <div class="content__inner">
          <RouterView :key="route.path" :stats="stats" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-shell { min-height: 100vh; }

/* Sidebar */
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  width: 264px;
  z-index: 100;
  display: flex;
  flex-direction: column;
  background: var(--surface);
  border-right: 1px solid var(--border-subtle);
  transform: translateX(-100%);
  transition: transform 300ms var(--ease);
}
.sidebar--open { transform: translateX(0); }
@media (min-width: 1024px) {
  .sidebar {
    transform: none;
    width: 264px;
  }
}

.sidebar__brand {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border-subtle);
}
.logo-box {
  width: 40px; height: 40px; flex: none;
  border-radius: var(--radius-md);
  background: var(--grad-brand);
  display: grid; place-items: center;
}
.logo-icon { width: 20px; height: 20px; color: #fff; }
.brand-text { flex: 1; min-width: 0; }
.brand-name { font-family: var(--font-display); font-weight: 800; font-size: 1.05rem; display: block; }
.brand-text p { font-size: 0.68rem; color: var(--text-muted); }

.sidebar__welcome {
  display: flex; align-items: center; gap: 0.8rem;
  margin: 1.2rem 1rem 1rem;
  padding: 0.85rem;
  border-radius: var(--radius-lg);
}
.avatar {
  width: 40px; height: 40px; flex: none;
  border-radius: var(--radius-md);
  background: var(--grad-brand);
  color: #fff; font-weight: 700;
  display: grid; place-items: center;
}
.welcome-title { font-size: 0.8rem; font-weight: 700; color: var(--text-strong); }
.welcome-name { font-size: 0.72rem; color: var(--brand-500); font-weight: 600; }

.sidebar__nav {
  flex: 1;
  display: flex; flex-direction: column; gap: 2px;
  padding: 0 0.8rem;
  overflow-y: auto;
}
.nav-item {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.7rem 0.9rem;
  border-radius: var(--radius-md);
  color: var(--text);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: background var(--speed), color var(--speed);
}
.nav-item:hover { background: var(--bg-base); color: var(--brand-500); }
.nav-item--active,
.nav-item--active:hover {
  background: var(--grad-brand);
  color: #fff;
  box-shadow: 0 8px 18px -8px rgba(91, 77, 251, .55);
}
.nav-icon { width: 17px; height: 17px; flex: none; }

.signout {
  display: flex; align-items: center; gap: 0.7rem;
  margin: 0.8rem;
  padding: 0.75rem 0.9rem;
  border: 0; border-radius: var(--radius-md);
  background: transparent;
  color: var(--danger);
  font-size: 0.9rem; font-weight: 600;
  transition: background var(--speed);
}
.signout:hover { background: color-mix(in srgb, var(--danger) 10%, transparent); }

/* Main */
.main-col { min-height: 100vh; display: flex; flex-direction: column; }
@media (min-width: 1024px) { .main-col { padding-left: 264px; } }

.topbar {
  position: sticky; top: 0; z-index: 50;
  display: flex; align-items: center; justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 1.2rem;
  background: color-mix(in srgb, var(--surface) 82%, transparent);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-subtle);
}
.topbar__stats { display: flex; gap: 0.6rem; }
.chip {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: var(--radius-pill);
  font-size: 0.8rem;
}
.chip span { font-size: 0.68rem; opacity: .8; }
.chip--revenue { background: rgba(16, 185, 129, .12); color: var(--accent); }
.chip--sessions { background: rgba(47, 111, 237, .12); color: var(--info); }
@media (max-width: 640px) { .topbar__stats { display: none; } }

.topbar__actions { display: flex; gap: 0.4rem; margin-left: auto; }
.icon-btn {
  width: 38px; height: 38px;
  display: grid; place-items: center;
  border: 0; border-radius: var(--radius-md);
  background: transparent; color: var(--text-muted);
  transition: background var(--speed), color var(--speed);
  position: relative;
}
.icon-btn:hover { color: var(--brand-500); background: var(--bg-base); }
.icon-btn--dot::after {
  content: '';
  position: absolute; top: 8px; right: 8px;
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--danger);
  animation: ripple 2s infinite;
}
.lg-hidden { display: grid; }
@media (min-width: 1024px) { .lg-hidden { display: none; } }

.spin { animation: spin 1s linear infinite; }

.sidebar-backdrop {
  position: fixed; inset: 0; z-index: 90;
  background: var(--overlay);
  backdrop-filter: blur(4px);
}
.backdrop-enter-active, .backdrop-leave-active { transition: opacity 250ms; }
.backdrop-enter-from, .backdrop-leave-to { opacity: 0; }

.content { flex: 1; }
.content__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.6rem 1.2rem 2.5rem;
  animation: float-up 400ms var(--ease);
}
</style>
