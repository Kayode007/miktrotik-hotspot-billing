<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Users, DollarSign, Wifi, TrendingUp, Activity, Clock, ArrowUpRight, Zap } from 'lucide-vue-next'
import { formatCurrency } from '../utils/formatters'
import type { DashboardStats } from '../types'

const props = defineProps<{
  stats: DashboardStats | null
  onRefresh?: () => void
}>()

const router = useRouter()

const statCards = computed(() => {
  if (!props.stats) return []
  return [
    {
      title: 'Total Users',
      value: props.stats.totalUsers.toLocaleString(),
      icon: Users,
      tone: 'info' as const,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(props.stats.totalRevenue),
      icon: DollarSign,
      tone: 'success' as const,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Active Sessions',
      value: props.stats.activeSessions.toString(),
      icon: Wifi,
      tone: 'accent' as const,
      change: props.stats.activeSessions > 0 ? 'Live' : 'None',
      changeType: props.stats.activeSessions > 0 ? ('positive' as const) : ('neutral' as const)
    },
    {
      title: "Today's Revenue",
      value: formatCurrency(props.stats.todayRevenue),
      icon: TrendingUp,
      tone: 'warning' as const,
      change: 'Today',
      changeType: 'neutral' as const
    }
  ]
})

const go = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div v-if="!stats" class="dash-loading">
    <div class="grid-auto-cards">
      <div v-for="i in 4" :key="i" class="card card--glass stat-card stat-card--skeleton">
        <div class="skeleton skeleton-line skeleton-line--label"></div>
        <div class="skeleton skeleton-line skeleton-line--value"></div>
      </div>
    </div>
  </div>

  <div v-else class="dash">
    <div class="page-head">
      <div>
        <h1 class="page-title text-gradient">Dashboard Overview</h1>
        <p class="muted page-subtitle">Monitor your WiFi billing system performance in real-time</p>
      </div>
    </div>

    <div class="dash-stats">
      <div v-for="stat in statCards" :key="stat.title" class="stat-card card card--glass" :class="`stat-card--${stat.tone}`">
        <div class="stat-card__top">
          <div class="stat-card__orb" :class="`stat-card__orb--${stat.tone}`">
            <component :is="stat.icon" class="stat-card__icon" />
          </div>
          <span class="badge" :class="stat.changeType === 'positive' ? 'badge--success' : 'badge--info'">
            {{ stat.change }}
          </span>
        </div>
        <div>
          <p class="stat-card__label muted">{{ stat.title }}</p>
          <p class="stat-card__value">{{ stat.value }}</p>
        </div>
      </div>
    </div>

    <div class="dash-columns">
      <div class="card card--glass dash-panel">
        <div class="dash-panel__head">
          <div class="dash-panel__title-wrap">
            <div class="dash-panel__orb dash-panel__orb--brand">
              <Zap class="dash-panel__orb-icon" />
            </div>
            <h3 class="dash-panel__title">Quick Actions</h3>
          </div>
        </div>
        <div class="dash-panel__body">
          <button class="quick-action quick-action--users" @click="go('/admin/users')">
            <div class="quick-action__orb quick-action__orb--users">
              <Users class="quick-action__icon" />
            </div>
            <div class="quick-action__text">
              <p class="quick-action__name">Manage Users</p>
              <p class="quick-action__desc">View and manage customer accounts</p>
            </div>
            <ArrowUpRight class="quick-action__arrow" />
          </button>
          <button class="quick-action quick-action--plans" @click="go('/admin/plans')">
            <div class="quick-action__orb quick-action__orb--plans">
              <DollarSign class="quick-action__icon" />
            </div>
            <div class="quick-action__text">
              <p class="quick-action__name">Create New Plan</p>
              <p class="quick-action__desc">Add new internet packages</p>
            </div>
            <ArrowUpRight class="quick-action__arrow" />
          </button>
          <button class="quick-action quick-action--sessions" @click="go('/admin/sessions')">
            <div class="quick-action__orb quick-action__orb--sessions">
              <Activity class="quick-action__icon" />
            </div>
            <div class="quick-action__text">
              <p class="quick-action__name">View Active Sessions</p>
              <p class="quick-action__desc">Monitor current connections</p>
            </div>
            <ArrowUpRight class="quick-action__arrow" />
          </button>
        </div>
      </div>

      <div class="card card--glass dash-panel">
        <div class="dash-panel__head">
          <div class="dash-panel__title-wrap">
            <div class="dash-panel__orb dash-panel__orb--success">
              <Activity class="dash-panel__orb-icon" />
            </div>
            <h3 class="dash-panel__title">System Status</h3>
          </div>
          <button v-if="onRefresh" class="link-btn" @click="onRefresh">
            Refresh
          </button>
        </div>
        <div class="dash-panel__body">
          <div class="status-row status-row--success">
            <div class="status-row__left">
              <span class="live-dot status-row__dot"></span>
              <span class="status-row__name">API Server</span>
            </div>
            <span class="badge badge--success">Online</span>
          </div>
          <div class="status-row status-row--success">
            <div class="status-row__left">
              <span class="live-dot status-row__dot"></span>
              <span class="status-row__name">Database</span>
            </div>
            <span class="badge badge--success">Connected</span>
          </div>
          <div class="status-row status-row--success">
            <div class="status-row__left">
              <span class="live-dot status-row__dot"></span>
              <span class="status-row__name">Paystack Integration</span>
            </div>
            <span class="badge badge--success">Active (Dev)</span>
          </div>
          <div class="status-row status-row--warning">
            <div class="status-row__left">
              <span class="live-dot status-row__dot"></span>
              <span class="status-row__name">Router Connection</span>
            </div>
            <span class="badge badge--warning">Checking...</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card card--glass dash-panel">
      <div class="dash-panel__head">
        <div class="dash-panel__title-wrap">
          <div class="dash-panel__orb dash-panel__orb--accent">
            <Clock class="dash-panel__orb-icon" />
          </div>
          <h3 class="dash-panel__title">Recent Activity</h3>
        </div>
        <button class="link-btn" @click="go('/admin/payments')">
          View All
        </button>
      </div>
      <div class="dash-panel__body">
        <div class="activity-row activity-row--success">
          <div class="activity-row__orb activity-row__orb--success">
            <Users class="activity-row__icon" />
          </div>
          <div class="activity-row__text">
            <p class="activity-row__title">New user registered</p>
            <p class="activity-row__meta">+2348012345678 • 2 minutes ago</p>
          </div>
          <ArrowUpRight class="quick-action__arrow" />
        </div>
        <div class="activity-row activity-row--info">
          <div class="activity-row__orb activity-row__orb--info">
            <DollarSign class="activity-row__icon" />
          </div>
          <div class="activity-row__text">
            <p class="activity-row__title">Payment completed</p>
            <p class="activity-row__meta">{{ formatCurrency(100) }} • Premium 24 Hours • 5 minutes ago</p>
          </div>
          <ArrowUpRight class="quick-action__arrow" />
        </div>
        <div class="activity-row activity-row--accent">
          <div class="activity-row__orb activity-row__orb--accent">
            <Wifi class="activity-row__icon" />
          </div>
          <div class="activity-row__text">
            <p class="activity-row__title">Session started</p>
            <p class="activity-row__meta">User connected to WiFi • 8 minutes ago</p>
          </div>
          <ArrowUpRight class="quick-action__arrow" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash,
.dash-loading {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.page-title {
  font-size: 1.875rem;
  font-weight: 800;
  line-height: 1.15;
  margin: 0;
}
.page-subtitle {
  margin: 0.3rem 0 0;
  font-size: 0.95rem;
}
.muted { color: var(--text-muted); }

.stat-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.4rem;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}
.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.stat-card__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat-card__orb {
  width: 2.85rem;
  height: 2.85rem;
  display: grid;
  place-items: center;
  border-radius: 14px;
  box-shadow: var(--shadow-md, 0 8px 20px rgba(0, 0, 0, 0.15));
}
.stat-card__orb--info { background: var(--info); }
.stat-card__orb--success { background: var(--success); }
.stat-card__orb--accent { background: var(--accent); }
.stat-card__orb--warning { background: var(--warning, #f59e0b); }
.stat-card__icon { width: 1.4rem; height: 1.4rem; color: var(--on-brand, #fff); }
.stat-card__label {
  margin: 0 0 0.25rem;
  font-size: 0.85rem;
  font-weight: 500;
}
.stat-card__value {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--text-strong);
}
.stat-card--skeleton {
  gap: 0.9rem;
}
.skeleton-line {
  border-radius: var(--radius-sm, 8px);
  height: 0.85rem;
}
.skeleton-line--label { width: 50%; }
.skeleton-line--value { width: 70%; height: 1.6rem; }

.dash-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
}
.dash-panel {
  padding: 1.5rem;
}
.dash-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.dash-panel__title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.dash-panel__orb {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 10px;
}
.dash-panel__orb--brand { background: var(--grad-brand); }
.dash-panel__orb--success { background: var(--success); }
.dash-panel__orb--accent { background: var(--accent); }
.dash-panel__orb-icon { width: 1rem; height: 1rem; color: var(--on-brand, #fff); }
.dash-panel__title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text-strong);
}
.dash-panel__body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.link-btn {
  padding: 0.4rem 0.8rem;
  border: 1px solid transparent;
  border-radius: 10px;
  background: none;
  color: var(--brand-500);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.link-btn:hover {
  background: color-mix(in srgb, var(--brand-500) 10%, transparent);
}

.quick-action,
.activity-row {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  text-align: left;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--surface);
  color: inherit;
  font: inherit;
  cursor: pointer;
  width: 100%;
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.25s ease;
}
.quick-action:hover,
.activity-row:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md, 0 8px 20px rgba(0, 0, 0, 0.12));
}
.quick-action--users:hover { border-color: color-mix(in srgb, var(--info) 40%, transparent); }
.quick-action--plans:hover { border-color: color-mix(in srgb, var(--success) 40%, transparent); }
.quick-action--sessions:hover { border-color: color-mix(in srgb, var(--accent) 40%, transparent); }

.quick-action__orb {
  width: 3rem;
  height: 3rem;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 14px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.12));
  transition: box-shadow 0.25s ease;
}
.quick-action:hover .quick-action__orb,
.activity-row:hover .activity-row__orb {
  box-shadow: var(--shadow-md, 0 8px 20px rgba(0, 0, 0, 0.18));
}
.quick-action__orb--users { background: var(--info); }
.quick-action__orb--plans { background: var(--success); }
.quick-action__orb--sessions { background: var(--accent); }
.quick-action__icon,
.activity-row__icon { width: 1.35rem; height: 1.35rem; color: var(--on-brand, #fff); }

.quick-action__text,
.activity-row__text {
  flex: 1;
  min-width: 0;
}
.quick-action__name {
  margin: 0 0 0.15rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-strong);
}
.quick-action__desc {
  margin: 0;
  font-size: 0.825rem;
}
.quick-action--users .quick-action__desc { color: var(--info); }
.quick-action--plans .quick-action__desc { color: var(--success); }
.quick-action--sessions .quick-action__desc { color: var(--accent); }
.quick-action__arrow { width: 1.15rem; height: 1.15rem; flex: none; color: var(--text-muted); }

.status-row,
.activity-row--info,
.activity-row--success,
.activity-row--accent {
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.25s ease, box-shadow 0.25s ease;
}
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--surface);
}
.status-row__left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}
.status-row__dot { flex: none; }
.status-row__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-strong);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.status-row--success { border-color: color-mix(in srgb, var(--success) 28%, transparent); }
.status-row--warning { border-color: color-mix(in srgb, var(--warning, #f59e0b) 28%, transparent); }

.activity-row__orb {
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 12px;
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.12));
}
.activity-row__orb--success { background: var(--success); }
.activity-row__orb--info { background: var(--info); }
.activity-row__orb--accent { background: var(--accent); }
.activity-row--success { border-color: color-mix(in srgb, var(--success) 28%, transparent); }
.activity-row--info { border-color: color-mix(in srgb, var(--info) 28%, transparent); }
.activity-row--accent { border-color: color-mix(in srgb, var(--accent) 28%, transparent); }
.activity-row__title {
  margin: 0 0 0.1rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-strong);
}
.activity-row__meta {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 500;
}
.activity-row--success .activity-row__meta { color: var(--success); }
.activity-row--info .activity-row__meta { color: var(--info); }
.activity-row--accent .activity-row__meta { color: var(--accent); }

@media (max-width: 1024px) {
  .dash-columns {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .quick-action__desc {
    display: none;
  }
}
</style>
