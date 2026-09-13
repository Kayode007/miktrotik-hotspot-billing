<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Wifi, Activity, Clock, User, Power } from 'lucide-vue-next'
import { adminAPI } from '../services/api'
import { formatCurrency, formatSessionStatus } from '../utils/formatters'
import { useToast } from '../composables/useToast'
import type { Session } from '../types'

const toast = useToast()

const sessions = ref<Session[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const statusFilter = ref('all')

const fetchSessions = async () => {
  try {
    loading.value = true
    const response = await adminAPI.getSessions({
      page: currentPage.value,
      limit: 10,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value
    })
    if (response.success && response.data) {
      sessions.value = response.data.data
      totalPages.value = response.data.pagination.pages
    }
  } catch (error) {
    toast.error('Failed to load sessions')
  } finally {
    loading.value = false
  }
}

watch([currentPage, statusFilter], () => fetchSessions())

onMounted(fetchSessions)

const handleTerminateSession = async (sessionId: string) => {
  if (confirm('Are you sure you want to terminate this session?')) {
    try {
      await adminAPI.terminateSession(sessionId)
      toast.success('Session terminated successfully')
      fetchSessions()
    } catch (error) {
      toast.error('Failed to terminate session')
    }
  }
}

const formatDuration = (start: string, end?: string) => {
  const startTime = new Date(start)
  const endTime = end ? new Date(end) : new Date()
  const diff = endTime.getTime() - startTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

const displayUser = (session: Session) =>
  session.user?.firstName && session.user?.lastName
    ? `${session.user.firstName} ${session.user.lastName}`
    : session.user?.phone || 'Unknown User'

const formatData = (session: Session) =>
  session.dataUsed ? `${(Number(session.dataUsed) / (1024 * 1024)).toFixed(2)} MB` : '0 MB'
</script>

<template>
  <div class="page">
    <div class="page-head head-row">
      <div>
        <h1 class="text-gradient">Sessions</h1>
        <p>Monitor and manage active user sessions</p>
      </div>
      <button class="btn btn--primary" @click="fetchSessions">
        <Activity style="width: 16px; height: 16px" />
        Refresh
      </button>
    </div>

    <div class="card card--glass filters">
      <div class="filter-field">
        <label class="label">Filter by Status</label>
        <div class="input-wrap">
          <Wifi />
          <select
            v-model="statusFilter"
            class="select"
            @change="currentPage = 1"
          >
            <option value="all">All Sessions</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="TERMINATED">Terminated</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card card--glass table-card">
      <div class="card-head">
        <div class="head-icon">
          <span class="live-dot" v-if="!loading"></span>
        </div>
        <h3>Active Sessions <span class="count-pill badge badge--brand">{{ sessions.length }}</span></h3>
      </div>

      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <p class="muted">Loading sessions...</p>
      </div>

      <template v-else-if="sessions.length">
        <div class="desktop-only">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Duration</th>
                <th>Data Used</th>
                <th>Actions</th>
              </tr>
            </thead>
            <TransitionGroup name="row" tag="tbody">
              <tr v-for="session in sessions" :key="session.id">
                <td>
                  <div class="cell-user">
                    <div class="avatar"><User style="width: 20px; height: 20px" /></div>
                    <div>
                      <div class="cell-strong">{{ displayUser(session) }}</div>
                      <div class="cell-sub">{{ session.ipAddress || 'No IP' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="cell-strong">{{ session.plan?.name || 'Unknown Plan' }}</div>
                  <div class="cell-sub">{{ session.plan?.price ? formatCurrency(session.plan.price) : 'N/A' }}</div>
                </td>
                <td>
                  <span :class="formatSessionStatus(session.status).className">
                    {{ formatSessionStatus(session.status).text }}
                  </span>
                </td>
                <td>
                  <div class="cell-line">
                    <Clock style="width: 16px; height: 16px" />
                    <span>{{ formatDuration(session.startTime, session.endTime) }}</span>
                  </div>
                  <div class="cell-sub">Started: {{ new Date(session.startTime).toLocaleTimeString() }}</div>
                </td>
                <td>{{ formatData(session) }}</td>
                <td>
                  <button
                    v-if="session.status === 'ACTIVE'"
                    class="btn btn--danger terminate-btn"
                    @click="handleTerminateSession(session.id)"
                  >
                    <Power style="width: 16px; height: 16px" />
                    Terminate
                  </button>
                </td>
              </tr>
            </TransitionGroup>
          </table>
        </div>

        <div class="mobile-only card-list">
          <TransitionGroup name="row">
            <div v-for="session in sessions" :key="session.id" class="mobile-row">
              <div class="mobile-row__top">
                <div class="cell-user">
                  <div class="avatar avatar--lg"><User style="width: 22px; height: 22px" /></div>
                  <div>
                    <div class="cell-strong">{{ displayUser(session) }}</div>
                    <div class="cell-sub">{{ session.ipAddress || 'No IP' }}</div>
                  </div>
                </div>
                <span :class="formatSessionStatus(session.status).className">
                  {{ formatSessionStatus(session.status).text }}
                </span>
              </div>

              <div class="mobile-grid">
                <div>
                  <div class="cell-sub">Plan</div>
                  <div class="cell-strong">{{ session.plan?.name || 'Unknown Plan' }}</div>
                  <div class="cell-sub">{{ session.plan?.price ? formatCurrency(session.plan.price) : 'N/A' }}</div>
                </div>
                <div>
                  <div class="cell-sub">Duration</div>
                  <div>{{ formatDuration(session.startTime, session.endTime) }}</div>
                  <div class="cell-sub">Started: {{ new Date(session.startTime).toLocaleTimeString() }}</div>
                </div>
              </div>

              <div class="mobile-row__foot">
                <span class="muted">Data: {{ formatData(session) }}</span>
                <button
                  v-if="session.status === 'ACTIVE'"
                  class="btn btn--danger terminate-btn"
                  @click="handleTerminateSession(session.id)"
                >
                  <Power style="width: 16px; height: 16px" />
                  Terminate
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </template>

      <div v-else class="state-block">
        <Wifi style="width: 32px; height: 32px; color: var(--text-muted)" />
        <p class="muted">No sessions found</p>
      </div>

      <div v-if="!loading && totalPages > 1" class="pagination">
        <div class="muted">Page {{ currentPage }} of {{ totalPages }}</div>
        <div class="pagination__btns">
          <button
            class="btn btn--ghost"
            :disabled="currentPage === 1"
            @click="currentPage = Math.max(1, currentPage - 1)"
          >
            Previous
          </button>
          <button
            class="btn btn--ghost"
            :disabled="currentPage === totalPages"
            @click="currentPage = Math.min(totalPages, currentPage + 1)"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page { display: flex; flex-direction: column; gap: 1.5rem; }
.head-row {
  display: flex; flex-direction: column; gap: 1rem; align-items: flex-start;
}
@media (min-width: 640px) {
  .head-row { flex-direction: row; align-items: center; justify-content: space-between; }
}

.filters { padding: 1.25rem 1.5rem; }
.filter-field { width: 100%; }
@media (min-width: 640px) {
  .filter-field { width: 260px; }
}

.table-card { padding: 0; overflow: hidden; }
.card-head {
  display: flex; align-items: center; gap: 0.85rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(90deg, rgba(91, 77, 251, 0.08), rgba(16, 185, 129, 0.05));
}
.card-head h3 {
  font-size: 1.15rem;
  display: flex; align-items: center; gap: 0.6rem;
}
.head-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center;
  background: rgba(16, 185, 129, 0.12);
}
.count-pill { font-variant-numeric: tabular-nums; }

.state-block {
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  padding: 3.5rem 1.5rem; text-align: center;
}

.desktop-only { overflow-x: auto; }
@media (min-width: 1024px) {
  .mobile-only { display: none; }
}
@media (max-width: 1023px) {
  .desktop-only { display: none; }
}

.cell-user { display: flex; align-items: center; gap: 0.9rem; }
.avatar {
  width: 44px; height: 44px; flex-shrink: 0;
  display: grid; place-items: center;
  border-radius: 14px; color: #fff;
  background: var(--grad-brand);
  box-shadow: 0 8px 16px -8px rgba(91, 77, 251, 0.55);
}
.avatar--lg { width: 52px; height: 52px; border-radius: 16px; }

.cell-line { display: flex; align-items: center; gap: 0.5rem; }
.cell-line svg { color: var(--text-muted); }
.cell-strong { font-weight: 600; color: var(--text-strong); }
.cell-sub { font-size: 0.8rem; color: var(--text-muted); }

.terminate-btn { padding: 0.4rem 0.8rem; font-size: 0.78rem; border-radius: var(--radius-pill); }

.card-list { display: flex; flex-direction: column; }
.mobile-row {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--speed);
}
.mobile-row:hover { background: rgba(91, 77, 251, 0.05); }
.mobile-row__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.mobile-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  margin: 1rem 0; font-size: 0.875rem;
}
.mobile-row__foot {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 0.875rem;
}

.pagination {
  display: flex; flex-direction: column; gap: 0.75rem;
  align-items: center; justify-content: space-between;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.85rem;
}
@media (min-width: 640px) {
  .pagination { flex-direction: row; }
}
.pagination__btns { display: flex; gap: 0.5rem; }

.row-enter-active, .row-leave-active { transition: all 240ms ease; }
.row-enter-from { opacity: 0; transform: translateY(8px); }
.row-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
