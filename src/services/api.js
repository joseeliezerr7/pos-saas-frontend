import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import router from '@/router'
import { toast } from 'vue3-toastify'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const tenantStore = useTenantStore()

    // Add Authorization header
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // Add Tenant headers for multi-tenancy support
    // Backend uses these headers for additional validation and tenant identification
    if (authStore.isAuthenticated && authStore.user) {
      // X-Company-ID: ID de la empresa del usuario autenticado
      if (authStore.user.company_id) {
        config.headers['X-Company-ID'] = authStore.user.company_id
      }

      // X-Tenant-ID: ID del tenant desde el store (puede diferir en caso de multi-tenant user)
      if (tenantStore.tenantId) {
        config.headers['X-Tenant-ID'] = tenantStore.tenantId
      }

      // X-Branch-ID: Sucursal del usuario (opcional, útil para filtros)
      if (authStore.user.branch_id) {
        config.headers['X-Branch-ID'] = authStore.user.branch_id
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const authStore = useAuthStore()
    const originalRequest = error.config

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        const refreshed = await authStore.refreshAccessToken()

        if (refreshed) {
          // Retry original request
          return api(originalRequest)
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        authStore.logout()
        router.push({ name: 'login' })
        return Promise.reject(refreshError)
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      const errorData = error.response.data.error

      if (errorData?.code === 'SUBSCRIPTION_INACTIVE') {
        toast.error('Su suscripción está inactiva')
        router.push({ name: 'settings-subscription' })
      } else if (errorData?.code === 'NO_ACTIVE_CAI') {
        toast.error('No hay CAI vigente para facturar')
      } else {
        toast.error(errorData?.message || 'No tienes permisos para realizar esta acción')
      }
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      // Don't show error for endpoints where 404 is expected
      const url = originalRequest.url || ''
      const expectedNotFoundEndpoints = [
        '/current', // Cash register current opening
        '/summary'  // Cash register summary when no opening
      ]

      const isExpectedNotFound = expectedNotFoundEndpoints.some(endpoint =>
        url.includes(endpoint)
      )

      if (!isExpectedNotFound) {
        toast.error('Recurso no encontrado')
      }
    }

    // Handle 422 Validation Error
    if (error.response?.status === 422) {
      const errors = error.response.data.error?.errors
      if (errors) {
        // Show first validation error
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      }
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      toast.error('Error del servidor. Por favor, intenta nuevamente.')
    }

    return Promise.reject(error)
  }
)

export default api
