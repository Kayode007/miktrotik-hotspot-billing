<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Edit, Trash2, Zap, Clock, Download, X } from 'lucide-vue-next'
import { adminAPI } from '../services/api'
import { formatCurrency, formatDuration } from '../utils/formatters'
import { useToast } from '../composables/useToast'
import type { Plan } from '../types'

const toast = useToast()

const plans = ref<Plan[]>([])
const loading = ref(true)
const showModal = ref(false)
const editingPlan = ref<Plan | null>(null)
const submitting = ref(false)
const formData = ref({
  name: '',
  description: '',
  price: '',
  duration: '',
  dataLimit: '',
  speedLimit: ''
})

const fetchPlans = async () => {
  try {
    const response = await adminAPI.getPlans()
    if (response.success && response.data) {
      plans.value = response.data
    }
  } catch {
    toast.error('Failed to load plans')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlans()
})

const handleCreatePlan = () => {
  editingPlan.value = null
  formData.value = {
    name: '',
    description: '',
    price: '',
    duration: '',
    dataLimit: '',
    speedLimit: ''
  }
  showModal.value = true
}

const handleEditPlan = (plan: Plan) => {
  editingPlan.value = plan
  formData.value = {
    name: plan.name,
    description: plan.description || '',
    price: plan.price.toString(),
    duration: plan.duration.toString(),
    dataLimit: plan.dataLimit,
    speedLimit: plan.speedLimit
  }
  showModal.value = true
}

const handleSubmit = async () => {
  if (submitting.value) return
  submitting.value = true

  try {
    const planData = {
      name: formData.value.name,
      description: formData.value.description,
      price: parseFloat(formData.value.price),
      duration: parseInt(formData.value.duration),
      dataLimit: formData.value.dataLimit,
      speedLimit: formData.value.speedLimit
    }

    if (editingPlan.value) {
      await adminAPI.updatePlan(editingPlan.value.id, planData)
      toast.success('Plan updated successfully')
    } else {
      await adminAPI.createPlan(planData)
      toast.success('Plan created successfully')
    }

    showModal.value = false
    await fetchPlans()
  } catch {
    toast.error('Failed to save plan')
  } finally {
    submitting.value = false
  }
}

const handleDeletePlan = async (planId: string) => {
  if (confirm('Are you sure you want to delete this plan?')) {
    try {
      await adminAPI.deletePlan(planId)
      toast.success('Plan deleted successfully')
      await fetchPlans()
    } catch {
      toast.error('Failed to delete plan')
    }
  }
}
</script>

<template>
  <div class="plans-page">
    <div class="page-head">
      <div>
        <h1 class="page-title text-gradient">Plans Management</h1>
        <p class="muted page-subtitle">Create and manage internet packages</p>
      </div>
      <button class="btn btn--primary btn--lg plans-create" @click="handleCreatePlan">
        <Plus class="icon-sm" />
        Create Plan
      </button>
    </div>

    <div v-if="loading" class="grid-auto-cards">
      <div v-for="i in 6" :key="i" class="card card--glass plan-card plan-card--skeleton">
        <div class="skeleton skeleton-line skeleton-line--sm"></div>
        <div class="skeleton skeleton-line skeleton-line--lg"></div>
        <div class="plan-specs">
          <div v-for="j in 3" :key="j" class="skeleton skeleton-line"></div>
        </div>
      </div>
    </div>

    <div v-else class="grid-auto-cards">
      <div v-for="plan in plans" :key="plan.id" class="card card--glass plan-card">
        <div class="plan-head">
          <div class="plan-id">
            <div class="plan-orb">
              <Zap class="plan-orb__icon" />
            </div>
            <div>
              <h3 class="plan-name">{{ plan.name }}</h3>
              <span class="badge" :class="plan.isActive ? 'badge--success' : 'badge--danger'">
                {{ plan.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
          <div class="plan-actions">
            <button class="icon-btn" aria-label="Edit plan" @click="handleEditPlan(plan)">
              <Edit class="icon-md" />
            </button>
            <button class="icon-btn icon-btn--danger" aria-label="Delete plan" @click="handleDeletePlan(plan.id)">
              <Trash2 class="icon-md" />
            </button>
          </div>
        </div>

        <div class="plan-price">
          <div class="text-gradient plan-price__value">{{ formatCurrency(plan.price) }}</div>
          <div class="muted plan-price__per">per {{ formatDuration(plan.duration) }}</div>
        </div>

        <div class="plan-specs">
          <div class="plan-spec plan-spec--success">
            <div class="plan-spec__orb plan-spec__orb--success">
              <Zap class="plan-spec__icon" />
            </div>
            <div>
              <div class="plan-spec__label">Speed</div>
              <div class="plan-spec__value">{{ plan.speedLimit }}</div>
            </div>
          </div>
          <div class="plan-spec plan-spec--info">
            <div class="plan-spec__orb plan-spec__orb--info">
              <Download class="plan-spec__icon" />
            </div>
            <div>
              <div class="plan-spec__label">Data Limit</div>
              <div class="plan-spec__value">{{ plan.dataLimit }}</div>
            </div>
          </div>
          <div class="plan-spec plan-spec--accent">
            <div class="plan-spec__orb plan-spec__orb--accent">
              <Clock class="plan-spec__icon" />
            </div>
            <div>
              <div class="plan-spec__label">Duration</div>
              <div class="plan-spec__value">{{ formatDuration(plan.duration) }}</div>
            </div>
          </div>
        </div>

        <div v-if="plan.description" class="plan-desc">
          <p class="muted">{{ plan.description }}</p>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal plan-modal">
            <div class="modal__head">
              <h2 class="modal__title">{{ editingPlan ? 'Edit Plan' : 'Create New Plan' }}</h2>
              <button class="modal__close" aria-label="Close" @click="showModal = false">
                <X class="icon-md" />
              </button>
            </div>

            <form class="plan-form" @submit.prevent="handleSubmit">
              <div class="field">
                <label class="label" for="plan-name">Plan Name</label>
                <input
                  id="plan-name"
                  v-model="formData.name"
                  type="text"
                  required
                  class="input"
                  placeholder="e.g., Premium 24 Hours"
                />
              </div>

              <div class="field">
                <label class="label" for="plan-desc">Description</label>
                <textarea
                  id="plan-desc"
                  v-model="formData.description"
                  class="input plan-form__textarea"
                  rows="2"
                  placeholder="Brief description of the plan"
                ></textarea>
              </div>

              <div class="plan-form__row">
                <div class="field">
                  <label class="label" for="plan-price">Price (₦ NGN)</label>
                  <input
                    id="plan-price"
                    v-model="formData.price"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    class="input"
                    placeholder="1000"
                  />
                </div>

                <div class="field">
                  <label class="label" for="plan-duration">Duration (hours)</label>
                  <input
                    id="plan-duration"
                    v-model="formData.duration"
                    type="number"
                    required
                    min="1"
                    class="input"
                    placeholder="24"
                  />
                </div>
              </div>

              <div class="plan-form__row">
                <div class="field">
                  <label class="label" for="plan-data">Data Limit</label>
                  <input
                    id="plan-data"
                    v-model="formData.dataLimit"
                    type="text"
                    required
                    class="input"
                    placeholder="10GB"
                  />
                </div>

                <div class="field">
                  <label class="label" for="plan-speed">Speed Limit</label>
                  <input
                    id="plan-speed"
                    v-model="formData.speedLimit"
                    type="text"
                    required
                    class="input"
                    placeholder="20Mbps"
                  />
                </div>
              </div>

              <div class="plan-form__footer">
                <button type="button" class="btn btn--ghost" @click="showModal = false">
                  Cancel
                </button>
                <button type="submit" class="btn btn--primary" :disabled="submitting">
                  <span v-if="submitting" class="spinner spinner--sm"></span>
                  {{ editingPlan ? 'Update Plan' : 'Create Plan' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.plans-page {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
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
.plans-create {
  white-space: nowrap;
}
.page-head,
.plans-page > .page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.icon-sm { width: 1rem; height: 1rem; }
.icon-md { width: 1.15rem; height: 1.15rem; }

.plan-card {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.5rem;
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}
.plan-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}
.plan-card--skeleton {
  gap: 1rem;
}
.skeleton-line {
  border-radius: var(--radius-sm, 8px);
  height: 0.85rem;
}
.skeleton-line--sm { width: 65%; }
.skeleton-line--lg { width: 50%; height: 2rem; }
.plan-card--skeleton .plan-specs .skeleton-line {
  width: 100%;
}

.plan-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}
.plan-id {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}
.plan-orb {
  width: 2.85rem;
  height: 2.85rem;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--grad-brand);
  box-shadow: var(--shadow-md, 0 8px 20px rgba(0, 0, 0, 0.15));
}
.plan-orb__icon { width: 1.4rem; height: 1.4rem; color: var(--on-brand, #fff); }
.plan-name {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-strong);
}
.plan-actions {
  display: flex;
  gap: 0.35rem;
}
.icon-btn {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 1px solid transparent;
  border-radius: 12px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.icon-btn:hover {
  color: var(--brand-500);
  background: color-mix(in srgb, var(--brand-500) 10%, transparent);
}
.icon-btn--danger:hover {
  color: var(--danger);
  background: color-mix(in srgb, var(--danger) 10%, transparent);
}

.plan-price {
  text-align: center;
  padding: 0.4rem 0 0.2rem;
}
.plan-price__value {
  font-size: 1.9rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}
.plan-price__per {
  margin-top: 0.2rem;
  font-size: 0.85rem;
  font-weight: 500;
}

.plan-specs {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.plan-spec {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--surface);
  transition: border-color 0.2s ease, transform 0.2s ease;
}
.plan-spec:hover { transform: translateX(3px); }
.plan-spec--success { border-color: color-mix(in srgb, var(--success) 28%, transparent); }
.plan-spec--info { border-color: color-mix(in srgb, var(--info) 28%, transparent); }
.plan-spec--accent { border-color: color-mix(in srgb, var(--accent) 28%, transparent); }
.plan-spec__orb {
  width: 2rem;
  height: 2rem;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: 10px;
}
.plan-spec__orb--success { background: var(--success); }
.plan-spec__orb--info { background: var(--info); }
.plan-spec__orb--accent { background: var(--accent); }
.plan-spec__icon { width: 1rem; height: 1rem; color: var(--on-brand, #fff); }
.plan-spec__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}
.plan-spec__value {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-strong);
}

.plan-desc {
  padding: 0.75rem 0.9rem;
  border-radius: var(--radius-md);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
}
.plan-desc p {
  margin: 0;
  font-size: 0.875rem;
  font-style: italic;
}

.plan-modal { max-width: 460px; width: calc(100% - 2rem); }
.modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-strong);
}
.plan-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}
.plan-form__textarea { resize: vertical; min-height: 3.5rem; }
.plan-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.plan-form__footer {
  display: flex;
  gap: 0.75rem;
  padding-top: 0.5rem;
}
.plan-form__footer .btn {
  flex: 1;
  justify-content: center;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.spinner--sm { width: 1rem; height: 1rem; border-width: 2px; }

.modal-enter-active, .modal-leave-active { transition: opacity 0.25s ease; }
.modal-enter-active .modal, .modal-leave-active .modal { transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.25s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(14px) scale(0.97); opacity: 0; }

@media (max-width: 640px) {
  .page-head {
    flex-direction: column;
    align-items: stretch;
  }
  .plans-create {
    width: 100%;
    justify-content: center;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
  }
  .plan-form__row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .plan-form__footer {
    flex-direction: column;
  }
}
</style>
