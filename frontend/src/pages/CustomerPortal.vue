<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import {
  Wifi, Check, Clock, Zap, CreditCard, Download, Phone,
  AlertCircle, ShieldCheck, X
} from 'lucide-vue-next'
import { formatCurrency, formatDuration, isValidNigerianPhone } from '../utils/formatters'
import { publicAPI } from '../services/api'
import { useToast } from '../composables/useToast'
import type { Plan } from '../types'

const plans = ref<Plan[]>([])
const selectedPlan = ref<Plan | null>(null)
const showPayment = ref(false)
const phoneNumber = ref('')
const loading = ref(false)
const paymentStatus = ref<string | null>(null)
const connectionStatus = ref('disconnected')
const activeReference = ref<string | null>(null)

let pollTimer: ReturnType<typeof setTimeout> | null = null

const toast = useToast()

onMounted(fetchPlans)
onUnmounted(() => { if (pollTimer) clearTimeout(pollTimer) })

async function fetchPlans() {
  try {
    const response = await publicAPI.getPlans()
    if (response.success && response.data) {
      plans.value = response.data
    }
  } catch {
    toast.error('Failed to load plans')
  }
}

function selectPlan(plan: Plan) {
  selectedPlan.value = plan
  showPayment.value = true
  paymentStatus.value = null
}

async function handlePayment() {
  if (!selectedPlan.value) return
  if (!isValidNigerianPhone(phoneNumber.value)) {
    toast.error('Please enter a valid Nigerian phone number')
    return
  }

  loading.value = true
  try {
    const response = await publicAPI.makePayment({
      phone: phoneNumber.value,
      amount: selectedPlan.value.price,
      planId: selectedPlan.value.id,
    })

    if (response.success && response.data) {
      activeReference.value = response.data.paystackReference

      // If Paystack returned a hosted checkout URL, send the user there
      if (response.data.paymentUrl) {
        paymentStatus.value = 'pending'
        toast.info('Redirecting you to Paystack secure checkout…')
        window.location.href = response.data.paymentUrl
        return
      }

      // Dev mode: continue polling without redirect
      toast.success('Payment initiated')
      pollPaymentStatus(response.data.paystackReference)
    }
  } catch (error: any) {
    toast.error(error.response?.data?.error || 'Payment failed')
  } finally {
    loading.value = false
  }
}

async function pollPaymentStatus(reference: string, attempts = 0) {
  const maxAttempts = 60 // ~10 min window with return-from-checkout support

  try {
    const response = await publicAPI.getPaymentStatus(reference)
    if (response.success && response.data) {
      const { status, sessionToken } = response.data

      if (status === 'completed') {
        paymentStatus.value = 'completed'
        toast.success('Payment successful! You can now connect to the internet.')
        if (sessionToken) setTimeout(() => connectToInternet(sessionToken), 1500)
        return
      }
      if (status === 'failed') {
        paymentStatus.value = 'failed'
        toast.error('Payment failed or was cancelled. Please try again.')
        return
      }
    }
  } catch {
    /* keep polling */
  }

  if (attempts < maxAttempts) {
    pollTimer = setTimeout(() => pollPaymentStatus(reference, attempts + 1), 5000)
  } else {
    paymentStatus.value = 'timeout'
    toast.error('Payment timeout. Please check your email/phone and try again.')
  }
}

async function connectToInternet(sessionToken: string) {
  try {
    const response = await publicAPI.connect({ sessionToken })
    if (response.success) {
      paymentStatus.value = 'connected'
      connectionStatus.value = 'connected'
      toast.success('Connected to internet successfully!')
      setTimeout(() => {
        showPayment.value = false
        selectedPlan.value = null
        phoneNumber.value = ''
        paymentStatus.value = null
      }, 2500)
    }
  } catch {
    toast.error('Connection failed. Please contact support.')
  }
}
</script>

<template>
  <div class="portal">
    <!-- Header -->
    <header class="portal-header">
      <div class="portal-header__inner">
        <div class="brand-row">
          <div class="logo-box"><Wifi class="logo-icon" /></div>
          <h1>COLLOSPOT</h1>
        </div>
        <p class="tagline">Smart WiFi Billing for the Modern Nigerian Network</p>
        <p class="tagline-sub">Connect. Pay via Paystack. Browse — Seamlessly.</p>

        <div class="conn-pill">
          <span class="conn-dot" :class="{ 'conn-dot--on': connectionStatus === 'connected' }"></span>
          <span>{{ connectionStatus === 'connected' ? 'Connected to Internet' : 'Not Connected' }}</span>
        </div>
      </div>
    </header>

    <!-- Plans -->
    <section class="plans-section">
      <h2>Choose Your Internet Plan</h2>
      <p class="muted">Select a plan, pay securely with Paystack, and get instant internet access</p>

      <div class="grid-auto-cards plans-grid">
        <article v-for="plan in plans" :key="plan.id" class="plan-card card">
          <div class="plan-card__icon">
            <Wifi style="width: 20px; height: 20px" />
          </div>
          <h3>{{ plan.name }}</h3>
          <p v-if="plan.description" class="plan-desc">{{ plan.description }}</p>

          <div class="plan-price">
            <span class="price">{{ formatCurrency(plan.price) }}</span>
            <span class="per muted">/{{ formatDuration(plan.duration) }}</span>
          </div>

          <ul class="plan-specs">
            <li><Zap class="spec-icon spec-icon--speed" /><span>Speed: <strong>{{ plan.speedLimit }}</strong></span></li>
            <li><Download class="spec-icon spec-icon--data" /><span>Data: <strong>{{ plan.dataLimit }}</strong></span></li>
            <li><Clock class="spec-icon spec-icon--time" /><span>Valid for <strong>{{ formatDuration(plan.duration) }}</strong></span></li>
          </ul>

          <button class="btn btn--primary btn--block btn--lg" @click="selectPlan(plan)">
            Select Plan
          </button>
        </article>
        <p v-if="!plans.length" class="muted plans-empty">No plans available right now.</p>
      </div>

      <!-- How it works -->
      <div class="how card card--glass">
        <h2>How It Works</h2>
        <div class="how-grid">
          <div v-for="(step, i) in [
            { t: 'Choose Plan', d: 'Select the internet plan that suits your needs' },
            { t: 'Pay with Paystack', d: 'Card, bank transfer, USSD or your bank app' },
            { t: 'Auto Connect', d: 'System automatically connects you to internet' },
            { t: 'Start Browsing', d: 'Enjoy high-speed internet access immediately' },
          ]" :key="step.t" class="how-step">
            <div class="how-num" :class="`how-num--${i}`">{{ i + 1 }}</div>
            <h3>{{ step.t }}</h3>
            <p>{{ step.d }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Payment Modal -->
    <Teleport to="body">
      <div v-if="showPayment && selectedPlan" class="modal-overlay" @click.self="showPayment = false">
        <div class="modal modal--payment">
          <div class="modal__head">
            <h2>Complete Payment</h2>
            <button class="modal__close" aria-label="Close" @click="showPayment = false">
              <X style="width: 18px; height: 18px" />
            </button>
          </div>

          <!-- Step: form -->
          <form v-if="paymentStatus === null" @submit.prevent="handlePayment">
            <div class="pay-summary">
              <h3>{{ selectedPlan.name }}</h3>
              <p class="pay-amount">{{ formatCurrency(selectedPlan.price) }}</p>
              <p class="muted">{{ formatDuration(selectedPlan.duration) }} • {{ selectedPlan.dataLimit }}</p>
            </div>

            <label class="label" for="phone">Phone Number</label>
            <div class="input-wrap">
              <Phone />
              <input
                id="phone"
                v-model="phoneNumber"
                class="input input--with-icon"
                type="tel"
                required
                placeholder="08012345678"
              />
            </div>
            <p class="hint">Enter your phone number — we'll use it to track your payment & session</p>

            <button class="btn btn--pay btn--lg btn--block pay-btn" type="submit" :disabled="loading">
              <span v-if="loading" class="spinner spinner--inline"></span>
              <CreditCard v-else style="width: 16px; height: 16px" />
              {{ loading ? 'Processing…' : `Pay ${formatCurrency(selectedPlan.price)}` }}
            </button>

            <p class="pay-trust"><ShieldCheck style="width: 14px; height: 14px" /> Secured by Paystack — cards, transfers, USSD</p>
          </form>

          <!-- Step: pending -->
          <div v-else-if="paymentStatus === 'pending'" class="pay-state">
            <div class="spinner"></div>
            <h3>Payment Pending</h3>
            <p class="muted">Complete your payment on the Paystack secure checkout page. This page updates automatically.</p>
          </div>

          <!-- Step: completed -->
          <div v-else-if="paymentStatus === 'completed'" class="pay-state">
            <div class="state-icon state-icon--ok"><Check style="width: 30px; height: 30px" /></div>
            <h3>Payment Successful!</h3>
            <p class="muted">Connecting you to the internet…</p>
          </div>

          <!-- Step: connected -->
          <div v-else-if="paymentStatus === 'connected'" class="pay-state">
            <div class="state-icon state-icon--ok"><Wifi style="width: 30px; height: 30px" /></div>
            <h3>Connected!</h3>
            <p class="muted">You are now online. Enjoy browsing!</p>
          </div>

          <!-- Step: failed / timeout -->
          <div v-else-if="paymentStatus === 'failed' || paymentStatus === 'timeout'" class="pay-state">
            <div class="state-icon state-icon--bad"><AlertCircle style="width: 30px; height: 30px" /></div>
            <h3>{{ paymentStatus === 'timeout' ? 'Payment Timed Out' : 'Payment Failed' }}</h3>
            <p class="muted">Your payment could not be processed. Please try again.</p>
            <button class="btn btn--primary btn--lg" @click="paymentStatus = null">Try Again</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Footer -->
    <footer class="portal-footer">
      <div class="brand-row brand-row--footer">
        <Wifi style="width: 20px; height: 20px; color: var(--brand-500)" />
        <span>COLLOSPOT</span>
      </div>
      <p class="muted">Smart WiFi Billing for the Modern Nigerian Network</p>
      <div class="footer-contacts">
        <span>📞 Support: +234 801 234 5678</span>
        <span>📧 support@collospot.com</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.portal { min-height: 100vh; display: flex; flex-direction: column; }

.portal-header { padding: 2.4rem 1.2rem 1.4rem; text-align: center; }
.portal-header__inner { max-width: 760px; margin: 0 auto; }
.brand-row { display: flex; align-items: center; justify-content: center; gap: 0.7rem; }
.logo-box {
  width: 46px; height: 46px;
  border-radius: var(--radius-lg);
  background: var(--grad-brand);
  display: grid; place-items: center;
  box-shadow: 0 14px 30px -10px rgba(91, 77, 251, .6);
}
.logo-icon { width: 22px; height: 22px; color: #fff; }
.brand-row h1 { font-size: 2rem; font-family: var(--font-display); letter-spacing: -0.03em; }
.tagline { color: var(--text); margin-top: 0.5rem; font-weight: 500; }
.tagline-sub { color: var(--text-muted); font-size: 0.85rem; font-style: italic; }

.conn-pill {
  display: inline-flex; align-items: center; gap: 0.55rem;
  margin-top: 1.3rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--surface);
  border: 1px solid var(--border-subtle);
  font-size: 0.8rem; font-weight: 600;
  box-shadow: var(--shadow-sm);
}
.conn-dot {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--text-muted);
  display: inline-block;
}
.conn-dot--on { background: var(--accent); box-shadow: 0 0 0 4px rgba(16,185,129,.2); }

.plans-section { max-width: 1200px; margin: 0 auto; padding: 1.5rem 1.2rem 2.5rem; text-align: center; }
.plans-section > h2 { font-size: 1.6rem; margin-bottom: 0.3rem; }
.plans-grid { margin-top: 1.8rem; text-align: left; }
.plans-empty { grid-column: 1 / -1; }

.plan-card {
  display: flex; flex-direction: column; align-items: center; text-align: center;
  gap: 0.65rem;
  transition: transform 260ms var(--ease), box-shadow 260ms var(--ease);
}
.plan-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
}
.plan-card__icon {
  width: 46px; height: 46px;
  border-radius: var(--radius-lg);
  background: rgba(91, 77, 251, .12);
  color: var(--brand-500);
  display: grid; place-items: center;
  margin-bottom: 0.25rem;
}
.plan-card h3 { font-size: 1.2rem; }
.plan-desc { color: var(--text-muted); font-size: 0.82rem; }
.plan-price { margin: 0.4rem 0 0.2rem; }
.price {
  font-family: var(--font-display);
  font-size: 1.9rem; font-weight: 800;
  background: var(--grad-brand);
  -webkit-background-clip: text; background-clip: text; color: transparent;
}
.per { font-size: 0.8rem; }

.plan-specs { list-style: none; padding: 0; margin: 0.5rem 0 1rem; display: grid; gap: 0.55rem; width: 100%; }
.plan-specs li {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  font-size: 0.85rem;
}
.plan-specs strong { color: var(--text-strong); }
.spec-icon { width: 15px; height: 15px; flex: none; }
.spec-icon--speed { color: var(--accent); }
.spec-icon--data  { color: var(--info); }
.spec-icon--time  { color: var(--brand-500); }

.how { margin-top: 3rem; }
.how h2 { text-align: center; margin-bottom: 1.5rem; }
.how-grid {
  display: grid; gap: 1.2rem;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
}
.how-step { text-align: center; }
.how-num {
  width: 46px; height: 46px;
  margin: 0 auto 0.7rem;
  border-radius: 50%;
  display: grid; place-items: center;
  font-family: var(--font-display); font-weight: 700;
  color: #fff;
}
.how-num--0 { background: var(--grad-brand); }
.how-num--1 { background: linear-gradient(135deg, #0ea55f, #34d399); }
.how-num--2 { background: linear-gradient(135deg, #7c3aed, #ec4899); }
.how-num--3 { background: linear-gradient(135deg, #f59e0b, #f97316); }
.how-step h3 { font-size: 0.95rem; margin-bottom: 0.25rem; }
.how-step p { font-size: 0.8rem; color: var(--text-muted); }

.modal--payment { max-width: 420px; }
.modal--payment h2 { font-size: 1.15rem; }
.pay-summary {
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: 1rem;
  margin-bottom: 1.1rem;
}
.pay-summary h3 { font-size: 0.95rem; }
.pay-amount {
  font-family: var(--font-display);
  font-size: 1.6rem; font-weight: 800;
  color: var(--brand-500);
}
.pay-btn { margin-top: 1.1rem; }
.spinner--inline { width: 15px; height: 15px; border-width: 2px; border-color: rgba(255,255,255,.4); border-top-color: #fff; }
.pay-trust {
  display: flex; align-items: center; justify-content: center; gap: 0.35rem;
  margin-top: 0.8rem;
  font-size: 0.72rem; color: var(--text-muted);
}

.pay-state {
  text-align: center;
  padding: 1.5rem 0.5rem;
  display: grid; justify-items: center; gap: 0.6rem;
}
.state-icon {
  width: 64px; height: 64px;
  border-radius: 50%;
  display: grid; place-items: center;
}
.state-icon--ok { background: rgba(16,185,129,.14); color: var(--accent); }
.state-icon--bad { background: rgba(224,68,79,.12); color: var(--danger); }
.pay-state h3 { font-size: 1.05rem; }
.pay-state .muted { max-width: 280px; }

.brand-row--footer { margin-bottom: 0.4rem; }
.brand-row--footer span { font-family: var(--font-display); font-weight: 800; color: var(--text-strong); }

.portal-footer {
  margin-top: auto;
  background: var(--surface);
  border-top: 1px solid var(--border-subtle);
  text-align: center;
  padding: 2rem 1.2rem;
}
.portal-footer .muted { font-size: 0.85rem; }
.footer-contacts {
  display: flex; gap: 1.4rem; justify-content: center;
  margin-top: 0.8rem; font-size: 0.8rem; color: var(--text-muted);
  flex-wrap: wrap;
}
</style>
