import { createRouter, createWebHistory } from 'vue-router'
import CustomerPortal from '../pages/CustomerPortal.vue'
import AdminLogin from '../pages/AdminLogin.vue'
import AdminDashboard from '../pages/AdminDashboard.vue'

const routes = [
  { path: '/', redirect: '/portal' },
  { path: '/portal', component: CustomerPortal },
  { path: '/admin/login', component: AdminLogin },
  {
    path: '/admin',
    component: AdminDashboard,
    children: [
      { path: '', redirect: '/admin/dashboard' },
      { path: 'dashboard', component: () => import('../components/DashboardOverview.vue') },
      { path: 'users', component: () => import('../components/UsersManagement.vue') },
      { path: 'plans', component: () => import('../components/PlansManagement.vue') },
      { path: 'sessions', component: () => import('../components/SessionsManagement.vue') },
      { path: 'payments', component: () => import('../components/PaymentsManagement.vue') },
      { path: 'settings', component: () => import('../components/SettingsPage.vue') },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/portal' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
