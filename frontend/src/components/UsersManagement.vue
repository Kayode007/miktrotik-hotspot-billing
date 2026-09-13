<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { Users, Search, Filter, MoreVertical, Phone, Mail, Calendar } from 'lucide-vue-next'
import { adminAPI } from '../services/api'
import { useToast } from '../composables/useToast'
import type { User } from '../types'

const toast = useToast()

const users = ref<User[]>([])
const loading = ref(true)
const searchTerm = ref('')
const currentPage = ref(1)
const totalPages = ref(1)

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await adminAPI.getUsers({
      page: currentPage.value,
      limit: 10,
      search: searchTerm.value || undefined
    })
    if (response.success && response.data) {
      users.value = response.data.data
      totalPages.value = response.data.pagination.pages
    }
  } catch (error) {
    toast.error('Failed to load users')
  } finally {
    loading.value = false
  }
}

watch([currentPage, searchTerm], () => fetchUsers())

onMounted(fetchUsers)

const handleSearch = (e: Event) => {
  searchTerm.value = (e.target as HTMLInputElement).value
  currentPage.value = 1
}

const displayName = (user: User) =>
  user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Unknown User'

const initials = (user: User) =>
  (user.firstName || user.phone)[0].toUpperCase()
</script>

<template>
  <div class="page">
    <div class="page-head head-row">
      <div>
        <h1 class="text-gradient">Users Management</h1>
        <p>Manage customer accounts and monitor activity</p>
      </div>
      <button class="btn btn--primary">
        Export Users
      </button>
    </div>

    <div class="card card--glass toolbar">
      <div class="input-wrap grow">
        <Search />
        <input
          type="text"
          class="input input--with-icon"
          placeholder="Search users by name, phone, or email..."
          :value="searchTerm"
          @input="handleSearch"
        />
      </div>
      <button class="btn btn--ghost">
        <Filter style="width: 16px; height: 16px" />
        Filters
      </button>
    </div>

    <div class="card card--glass table-card">
      <div class="card-head">
        <div class="head-icon">
          <Users style="width: 16px; height: 16px" />
        </div>
        <h3>All Users</h3>
      </div>

      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <p class="muted">Loading users...</p>
      </div>

      <template v-else-if="users.length">
        <div class="desktop-only">
          <table class="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <TransitionGroup name="row" tag="tbody">
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="cell-user">
                    <div class="avatar">{{ initials(user) }}</div>
                    <div>
                      <div class="cell-strong">{{ displayName(user) }}</div>
                      <div class="cell-sub">ID: {{ user.id.slice(0, 8) }}...</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="cell-stack">
                    <div class="cell-line">
                      <Phone style="width: 16px; height: 16px" />
                      <span>{{ user.phone }}</span>
                    </div>
                    <div v-if="user.email" class="cell-line cell-sub">
                      <Mail style="width: 16px; height: 16px" />
                      <span>{{ user.email }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span :class="user.isActive ? 'badge badge--success' : 'badge badge--danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>
                  <div class="cell-line cell-sub">
                    <Calendar style="width: 16px; height: 16px" />
                    <span>{{ new Date(user.createdAt).toLocaleDateString() }}</span>
                  </div>
                </td>
                <td>
                  <button class="icon-btn" aria-label="More actions">
                    <MoreVertical style="width: 16px; height: 16px" />
                  </button>
                </td>
              </tr>
            </TransitionGroup>
          </table>
        </div>

        <div class="mobile-only card-list">
          <TransitionGroup name="row">
            <div v-for="user in users" :key="user.id" class="mobile-row">
              <div class="mobile-row__top">
                <div class="cell-user">
                  <div class="avatar avatar--lg">{{ initials(user) }}</div>
                  <div>
                    <div class="cell-strong">{{ displayName(user) }}</div>
                    <div class="cell-line cell-sub">
                      <Phone style="width: 16px; height: 16px" />
                      <span>{{ user.phone }}</span>
                    </div>
                    <div v-if="user.email" class="cell-line cell-sub">
                      <Mail style="width: 16px; height: 16px" />
                      <span>{{ user.email }}</span>
                    </div>
                  </div>
                </div>
                <div class="mobile-row__aside">
                  <span :class="user.isActive ? 'badge badge--success' : 'badge badge--danger'">
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                  <button class="icon-btn" aria-label="More actions">
                    <MoreVertical style="width: 16px; height: 16px" />
                  </button>
                </div>
              </div>
              <div class="mobile-row__foot muted">
                Joined {{ new Date(user.createdAt).toLocaleDateString() }}
              </div>
            </div>
          </TransitionGroup>
        </div>
      </template>

      <div v-else class="state-block">
        <Users style="width: 32px; height: 32px; color: var(--text-muted)" />
        <p class="muted">No users found</p>
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
  display: flex; flex-direction: column; gap: 1rem;
  align-items: flex-start;
}
@media (min-width: 640px) {
  .head-row { flex-direction: row; align-items: center; justify-content: space-between; }
}

.toolbar {
  display: flex; flex-direction: column; gap: 0.85rem;
}
@media (min-width: 640px) {
  .toolbar { flex-direction: row; align-items: center; }
}
.grow { flex: 1; }

.table-card { padding: 0; overflow: hidden; }
.card-head {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 1.1rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  background: linear-gradient(90deg, rgba(91, 77, 251, 0.08), rgba(239, 123, 192, 0.06));
}
.card-head h3 { font-size: 1.15rem; }
.head-icon {
  width: 34px; height: 34px; border-radius: 10px;
  display: grid; place-items: center;
  color: #fff; background: var(--grad-brand);
  box-shadow: 0 6px 14px -6px rgba(91, 77, 251, 0.6);
}

.state-block {
  display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
  padding: 3.5rem 1.5rem; text-align: center;
}

.desktop-only { overflow-x: auto; }
.mobile-only { display: block; }
@media (min-width: 1024px) {
  .desktop-only { display: block; }
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
  font-weight: 700; background: var(--grad-brand);
  box-shadow: 0 8px 16px -8px rgba(91, 77, 251, 0.55);
}
.avatar--lg { width: 52px; height: 52px; border-radius: 16px; font-size: 1.05rem; }

.cell-stack { display: flex; flex-direction: column; gap: 0.3rem; }
.cell-line {
  display: flex; align-items: center; gap: 0.5rem;
}
.cell-line svg { color: var(--text-muted); }
.cell-strong { font-weight: 600; color: var(--text-strong); }
.cell-sub { font-size: 0.8rem; color: var(--text-muted); }

.icon-btn {
  border: 0; background: transparent;
  color: var(--text-muted); cursor: pointer;
  padding: 0.35rem; border-radius: 8px;
  display: grid; place-items: center;
  transition: color var(--speed), background var(--speed);
}
.icon-btn:hover { color: var(--brand-500); background: rgba(91, 77, 251, 0.08); }

.table-card :deep(tbody tr) { cursor: default; }
.table-card :deep(tbody tr:hover) { transform: none; }

.card-list { display: flex; flex-direction: column; }
.mobile-row {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--speed);
}
.mobile-row:hover { background: rgba(91, 77, 251, 0.05); }
.mobile-row__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem; }
.mobile-row__aside { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; }
.mobile-row__foot { margin-top: 0.75rem; font-size: 0.75rem; }

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
