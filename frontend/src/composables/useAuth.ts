import { ref, computed } from 'vue'
import { adminAPI } from '../services/api'
import type { User } from '../types'

// Module-level shared state (developer-defined singleton)
const user = ref<User | null>(null)
const loading = ref(true)
let initialized = false

export const useAuth = () => {
  const isAdmin = computed(
    () => user.value?.role === 'ADMIN' || user.value?.role === 'SUPER_ADMIN'
  )

  const initAuth = async () => {
    if (initialized) {
      loading.value = false
      return
    }
    initialized = true

    try {
      const token = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('user')
      const lastVerified = localStorage.getItem('last_token_verified')
      const now = Date.now()

      if (token && savedUser) {
        const parsedUser = JSON.parse(savedUser)
        user.value = parsedUser
        loading.value = false

        // Only verify token if it hasn't been verified in the last 5 minutes
        if (!lastVerified || now - parseInt(lastVerified) > 5 * 60 * 1000) {
          try {
            const response = await adminAPI.getProfile()
            if (response.success && response.data) {
              user.value = response.data
              localStorage.setItem('user', JSON.stringify(response.data))
              localStorage.setItem('last_token_verified', now.toString())
            }
          } catch (error: any) {
            // Only clear storage on auth errors, not rate limiting
            if (error.response?.status === 401 || error.response?.status === 403) {
              clearSession()
            }
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      loading.value = false
    }
  }

  const clearSession = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('last_token_verified')
    user.value = null
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await adminAPI.login({ email, password })
      if (response.success && response.data) {
        const { user: u, token } = response.data
        localStorage.setItem('auth_token', token)
        localStorage.setItem('user', JSON.stringify(u))
        localStorage.setItem('last_token_verified', Date.now().toString())
        user.value = u
        return { success: true }
      }
      return { success: false, error: 'Login failed' }
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      }
    }
  }

  const logout = () => {
    clearSession()
    initialized = false
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    login,
    logout,
    initAuth,
    isAuthenticated: computed(() => !!user.value),
    isAdmin,
  }
}

export default useAuth
