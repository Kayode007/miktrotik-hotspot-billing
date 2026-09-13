<script setup lang="ts">
import { ref } from 'vue'
import { Settings, CreditCard, Wifi, Bell, Shield, Database, Save } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const toast = useToast()

const activeTab = ref('general')

const settings = ref({
  general: {
    systemName: 'COLLOSPOT',
    companyName: 'COLLOSPOT Ltd',
    supportEmail: 'support@collospot.com',
    supportPhone: '+2348000000000',
    timezone: 'Africa/Lagos'
  },
  paystack: {
    publicKey: '',
    secretKey: '',
    environment: 'sandbox'
  },
  router: {
    host: '192.168.1.1',
    username: 'admin',
    password: '',
    port: '8728'
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: true,
    paymentAlerts: true,
    sessionAlerts: false
  }
})

const tabs = [
  { id: 'general', name: 'General', icon: Settings },
  { id: 'paystack', name: 'Paystack', icon: CreditCard },
  { id: 'router', name: 'Router', icon: Wifi },
  { id: 'notifications', name: 'Notifications', icon: Bell },
  { id: 'security', name: 'Security', icon: Shield },
  { id: 'database', name: 'Database', icon: Database }
] as const

const handleSave = (section: string) => {
  toast.success(`${section} settings saved successfully`)
}

const handleTestConnection = () => {
  toast.success('Router connection tested successfully')
}
</script>

<template>
  <div class="settings-page">
    <div class="page-head">
      <div>
        <h1 class="page-title text-gradient">System Settings</h1>
        <p class="muted page-subtitle">Configure your WiFi billing system</p>
      </div>
    </div>

    <div class="card card--glass settings-card">
      <nav class="settings-tabs" aria-label="Settings sections">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="settings-tab"
          :class="{ 'settings-tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" class="settings-tab__icon" />
          {{ tab.name }}
        </button>
      </nav>

      <div class="settings-body">
        <div v-if="activeTab === 'general'" class="settings-panel">
          <div class="settings-grid">
            <div class="field">
              <label class="label" for="sett-system-name">System Name</label>
              <input
                id="sett-system-name"
                v-model="settings.general.systemName"
                type="text"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label" for="sett-company-name">Company Name</label>
              <input
                id="sett-company-name"
                v-model="settings.general.companyName"
                type="text"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label" for="sett-support-email">Support Email</label>
              <input
                id="sett-support-email"
                v-model="settings.general.supportEmail"
                type="email"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label" for="sett-support-phone">Support Phone</label>
              <input
                id="sett-support-phone"
                v-model="settings.general.supportPhone"
                type="tel"
                class="input"
              />
            </div>
          </div>
          <button class="btn btn--primary settings-save" @click="handleSave('General')">
            <Save class="icon-sm" />
            Save Changes
          </button>
        </div>

        <div v-else-if="activeTab === 'paystack'" class="settings-panel">
          <div class="settings-warning">
            <p>
              <strong>Warning:</strong> These are sensitive credentials. Make sure to keep them secure.
            </p>
          </div>
          <div class="settings-grid">
            <div class="field">
              <label class="label" for="sett-paystack-public">Public Key</label>
              <input
                id="sett-paystack-public"
                v-model="settings.paystack.publicKey"
                type="password"
                class="input"
                placeholder="pk_test_..."
              />
            </div>
            <div class="field">
              <label class="label" for="sett-paystack-secret">Secret Key</label>
              <input
                id="sett-paystack-secret"
                v-model="settings.paystack.secretKey"
                type="password"
                class="input"
                placeholder="sk_test_..."
              />
            </div>
            <div class="field">
              <label class="label" for="sett-paystack-env">Environment</label>
              <select id="sett-paystack-env" v-model="settings.paystack.environment" class="select">
                <option value="sandbox">Sandbox</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
          <button class="btn btn--primary settings-save" @click="handleSave('Paystack')">
            <Save class="icon-sm" />
            Save Paystack Settings
          </button>
        </div>

        <div v-else-if="activeTab === 'router'" class="settings-panel">
          <div class="settings-grid">
            <div class="field">
              <label class="label" for="sett-router-host">Router IP Address</label>
              <input
                id="sett-router-host"
                v-model="settings.router.host"
                type="text"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label" for="sett-router-port">API Port</label>
              <input
                id="sett-router-port"
                v-model="settings.router.port"
                type="text"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label" for="sett-router-user">Username</label>
              <input
                id="sett-router-user"
                v-model="settings.router.username"
                type="text"
                class="input"
              />
            </div>
            <div class="field">
              <label class="label" for="sett-router-pass">Password</label>
              <input
                id="sett-router-pass"
                v-model="settings.router.password"
                type="password"
                class="input"
              />
            </div>
          </div>
          <div class="settings-actions-row">
            <button class="btn btn--ghost" @click="handleTestConnection">
              Test Connection
            </button>
            <button class="btn btn--primary" @click="handleSave('Router')">
              <Save class="icon-sm" />
              Save Settings
            </button>
          </div>
        </div>

        <div v-else-if="activeTab === 'notifications'" class="settings-panel">
          <div class="settings-toggles">
            <div class="settings-toggle">
              <div>
                <h4 class="settings-toggle__title">Email Notifications</h4>
                <p class="muted settings-toggle__hint">Receive email alerts for important events</p>
              </div>
              <label class="switch">
                <input
                  v-model="settings.notifications.emailNotifications"
                  type="checkbox"
                  class="switch__input"
                />
                <span class="switch__track"><span class="switch__thumb"></span></span>
              </label>
            </div>

            <div class="settings-toggle">
              <div>
                <h4 class="settings-toggle__title">SMS Notifications</h4>
                <p class="muted settings-toggle__hint">Send SMS alerts to customers</p>
              </div>
              <label class="switch">
                <input
                  v-model="settings.notifications.smsNotifications"
                  type="checkbox"
                  class="switch__input"
                />
                <span class="switch__track"><span class="switch__thumb"></span></span>
              </label>
            </div>
          </div>

          <button class="btn btn--primary settings-save" @click="handleSave('Notification')">
            <Save class="icon-sm" />
            Save Preferences
          </button>
        </div>

        <div v-else-if="activeTab === 'security'" class="settings-empty">
          <Shield class="settings-empty__icon" />
          <p class="muted">Security settings coming soon...</p>
        </div>

        <div v-else-if="activeTab === 'database'" class="settings-empty">
          <Database class="settings-empty__icon" />
          <p class="muted">Database management coming soon...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.settings-page {
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
.icon-sm { width: 1rem; height: 1rem; }

.settings-card {
  overflow: hidden;
  padding: 0;
}
.settings-tabs {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  padding: 0 1rem;
  border-bottom: 1px solid var(--border-subtle);
  scrollbar-width: none;
}
.settings-tabs::-webkit-scrollbar { display: none; }
.settings-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.25rem;
  background: none;
  border: 0;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.settings-tab:hover {
  color: var(--text-strong);
}
.settings-tab--active {
  color: var(--brand-500);
  border-bottom-color: var(--brand-500);
}
.settings-tab__icon { width: 1.1rem; height: 1.1rem; flex: none; }

.settings-body {
  padding: 1.75rem;
}
.settings-panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: panel-in 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes panel-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.settings-save {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}
.settings-warning {
  padding: 0.9rem 1.1rem;
  border-radius: var(--radius-md);
  border: 1px solid color-mix(in srgb, var(--warning, #f59e0b) 35%, transparent);
  background: color-mix(in srgb, var(--warning, #f59e0b) 8%, transparent);
}
.settings-warning p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--text-strong);
}
.settings-actions-row {
  display: flex;
  gap: 0.75rem;
}

.settings-toggles {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
.settings-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  background: var(--surface);
  transition: border-color 0.2s ease;
}
.settings-toggle:hover { border-color: color-mix(in srgb, var(--brand-500) 30%, transparent); }
.settings-toggle__title {
  margin: 0 0 0.15rem;
  font-size: 0.925rem;
  font-weight: 700;
  color: var(--text-strong);
}
.settings-toggle__hint {
  margin: 0;
  font-size: 0.85rem;
}

.switch {
  position: relative;
  display: inline-flex;
  cursor: pointer;
}
.switch__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}
.switch__track {
  display: block;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 999px;
  background: var(--border-subtle);
  padding: 2px;
  transition: background 0.25s ease;
}
.switch__thumb {
  display: block;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: var(--surface-raised);
  box-shadow: var(--shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.15));
  transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
.switch__input:checked + .switch__track {
  background: var(--brand-500);
}
.switch__input:checked + .switch__track .switch__thumb {
  transform: translateX(1.25rem);
}
.switch__input:focus-visible + .switch__track {
  outline: 2px solid var(--brand-500);
  outline-offset: 2px;
}

.settings-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  text-align: center;
}
.settings-empty__icon {
  width: 3rem;
  height: 3rem;
  color: var(--text-muted);
  opacity: 0.6;
}
.settings-empty p { margin: 0; }

@media (max-width: 640px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }
  .settings-body {
    padding: 1.25rem;
  }
}
</style>
