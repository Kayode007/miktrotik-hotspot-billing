<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { CircleDollarSign, Search, Download, Calendar, CreditCard, XCircle } from 'lucide-vue-next'
import { adminAPI } from '../services/api'
import { formatCurrency, formatPaymentStatus } from '../utils/formatters'
import { useToast } from '../composables/useToast'
import type { Payment } from '../types'

const toast = useToast()

const payments = ref<Payment[]>([])
const loading = ref(true)
const currentPage = ref(1)
const totalPages = ref(1)
const statusFilter = ref('all')

const fetchPayments = async () => {
  try {
    loading.value = true
    const response = await adminAPI.getPayments({
      page: currentPage.value,
      limit: 10,
      status: statusFilter.value === 'all' ? undefined : statusFilter.value
    })
    if (response.success && response.data) {
      payments.value = response.data.data
      totalPages.value = response.data.pagination.pages
    }
  } catch (error) {
    toast.error('Failed to load payments')
  } finally {
    loading.value = false
  }
}

watch([currentPage, statusFilter], () => fetchPayments())

onMounted(fetchPayments)

const totalRevenue = computed(() =>
  payments.value
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + p.amount, 0)
)

const displayName = (payment: Payment) =>
  payment.user?.firstName && payment.user?.lastName
    ? `${payment.user.firstName} ${payment.user.lastName}`
    : payment.user?.phone || 'Unknown'
</script>

<template>
  <div class="page">
    <div class="page-head head-row">
      <div>
        <h1 class="text-gradient">Payments Management</h1>
        <p>Track and manage all payment transactions</p>
      </div>
      <button class="btn btn--pay">
        <Download style="width: 16px; height: 16px" />
        Export Report
      </button>
    </div>

    <div class="stat-grid">
      <div class="card card--glass stat stat--revenue">
        <div class="stat__top">
          <div class="stat__icon stat__icon--revenue">
            <CircleDollarSign style="width: 22px; height: 22px" />
          </div>
          <span class="badge badge--success">Total</span>
        </div>
        <p class="muted">Total Revenue</p>
        <p class="stat__value">{{ formatCurrency(totalRevenue) }}</p>
      </div>

      <div class="card card--glass stat stat--count">
        <div class="stat__top">
          <div class="stat__icon stat__icon--count">
            <CreditCard style="width: 22px; height: 22px" />
          </div>
          <span class="badge badge--info">Count</span>
        </div>
        <p class="muted">Total Payments</p>
        <p class="stat__value">{{ payments.length }}</p>
      </div>

      <div class="card card--glass stat stat--pending">
        <div class="stat__top">
          <div class="stat__icon stat__icon--pending">
            <Calendar style="width: 22px; height: 22px" />
          </div>
          <span class="badge badge--warning">Pending</span>
        </div>
        <p class="muted">Pending</p>
        <p class="stat__value">{{ payments.filter(p => p.status === 'PENDING').length }}</p>
      </div>

      <div class="card card--glass stat stat--failed">
        <div class="stat__top">
          <div class="stat__icon stat__icon--failed">
            <XCircle style="width: 22px; height: 22px" />
          </div>
          <span class="badge badge--danger">Failed</span>
        </div>
        <p class="muted">Failed</p>
        <p class="stat__value">{{ payments.filter(p => p.status === 'FAILED').length }}</p>
      </div>
    </div>

    <div class="card card--glass filters">
      <div class="filter-field">
        <label class="label">Filter by Status</label>
        <div class="input-wrap">
          <Search />
          <select
            v-model="statusFilter"
            class="select"
            @change="currentPage = 1"
          >
            <option value="all">All Payments</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card card--glass table-card">
      <div class="card-head">
        <div class="head-icon">
          <CircleDollarSign style="width: 16px; height: 16px" />
        </div>
        <h3>Payment History</h3>
      </div>

      <div v-if="loading" class="state-block">
        <div class="spinner"></div>
        <p class="muted">Loading payments...</p>
      </div>

      <template v-else-if="payments.length">
        <div class="desktop-only">
          <table class="table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Customer</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <TransitionGroup name="row" tag="tbody">
              <tr v-for="payment in payments" :key="payment.id">
                <td>
                  <div class="cell-strong">{{ payment.id.slice(0, 8) }}...</div>
                  <div v-if="payment.paystackReference" class="cell-sub">
                    Ref: {{ payment.paystackReference }}
                  </div>
                </td>
                <td>
                  <div class="cell-strong">{{ displayName(payment) }}</div>
                  <div class="cell-sub">{{ payment.user?.phone }}</div>
                </td>
                <td>{{ payment.plan?.name || 'Unknown Plan' }}</td>
                <td>
                  <span class="cell-strong">{{ formatCurrency(payment.amount) }}</span>
                </td>
                <td>
                  <span class="badge badge--brand">
                    <CreditCard style="width: 12px; height: 12px" />
                    {{ payment.paymentMethod }}
                  </span>
                </td>
                <td>
                  <span :class="formatPaymentStatus(payment.status).className">
                    {{ formatPaymentStatus(payment.status).text }}
                  </span>
                </td>
                <td>
                  <div>{{ new Date(payment.createdAt).toLocaleDateString() }}</div>
                  <div class="cell-sub">{{ new Date(payment.createdAt).toLocaleTimeString() }}</div>
                </td>
              </tr>
            </TransitionGroup>
          </table>
        </div>

        <div class="mobile-only card-list">
          <TransitionGroup name="row">
            <div v-for="payment in payments" :key="payment.id" class="mobile-row">
              <div class="mobile-row__top">
                <div>
                  <div class="cell-strong">{{ displayName(payment) }}</div>
                  <div class="cell-sub">{{ payment.user?.phone }}</div>
                </div>
                <span :class="formatPaymentStatus(payment.status).className">
                  {{ formatPaymentStatus(payment.status).text }}
                </span>
              </div>

              <div class="mobile-grid">
                <div>
                  <div class="cell-sub">Plan</div>
                  <div class="cell-strong">{{ payment.plan?.name || 'Unknown Plan' }}</div>
                </div>
                <div>
                  <div class="cell-sub">Amount</div>
                  <div class="cell-strong">{{ formatCurrency(payment.amount) }}</div>
                </div>
                <div>
                  <div class="cell-sub">Method</div>
                  <div>{{ payment.paymentMethod }}</div>
                </div>
                <div>
                  <div class="cell-sub">Date</div>
                  <div>{{ new Date(payment.createdAt).toLocaleDateString() }}</div>
                </div>
              </div>

              <div class="mobile-row__foot muted">
                Transaction: {{ payment.id.slice(0, 8) }}...
                <span v-if="payment.paystackReference">Ref: {{ payment.paystackReference }}</span>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </template>

      <div v-else class="state-block">
        <CircleDollarSign style="width: 32px; height: 32px; color: var(--text-muted)" />
        <p class="muted">No payments found</p>
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

.stat-grid {
  display: grid; gap: 1.25rem;
  grid-template-columns: 1fr;
}
@media (min-width: 640px) { .stat-grid { grid-template-columns: 1fr 1fr; } }
@media (min-width: 1024px) { .stat-grid { grid-template-columns: repeat(4, 1fr); } }

.stat {
  transition: transform var(--speed) var(--ease), box-shadow var(--speed) var(--ease);
  border-top: 3px solid transparent;
}
.stat:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.stat--revenue { border-top-color: var(--accent); }
.stat--count { border-top-color: var(--info); }
.stat--pending { border-top-color: var(--warning); }
.stat--failed { border-top-color: var(--danger); }

.stat__top {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 1rem;
}
.stat__icon {
  width: 44px; height: 44px; border-radius: 14px;
  display: grid; place-items: center; color: #fff;
  box-shadow: var(--shadow-md);
}
.stat__icon--revenue { background: var(--accent); }
.stat__icon--count { background: var(--info); }
.stat__icon--pending { background: var(--warning); }
.stat__icon--failed { background: var(--danger); }
.stat__value {
  font-family: var(--font-display);
  font-size: 1.6rem; font-weight: 700;
  color: var(--text-strong);
  font-variant-numeric: tabular-nums;
}

.filters { padding: 1.25rem 1.5rem; }
.filter-field { width: 100%; }
@media (min-width: 640px) {
  .filter-field { width: 260px; }
}

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
@media (min-width: 1024px) {
  .mobile-only { display: none; }
}
@media (max-width: 1023px) {
  .desktop-only { display: none; }
}

.cell-strong { font-weight: 600; color: var(--text-strong); }
.cell-sub { font-size: 0.8rem; color: var(--text-muted); }

.card-list { display: flex; flex-direction: column; }
.mobile-row {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
  transition: background var(--speed);
}
.mobile-row:hover { background: rgba(91, 77, 251, 0.05); }
.mobile-row__top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem;
  margin-bottom: 1rem;
}
.mobile-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  font-size: 0.875rem;
}
.mobile-row__foot {
  margin-top: 0.85rem; padding-top: 0.85rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.75rem;
  display: flex; gap: 0.75rem; flex-wrap: wrap;
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
