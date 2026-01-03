<template>
  <div>
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Iniciar Sesión</h2>

    <!-- Tenant Info from Domain -->
    <div v-if="tenantFromDomain && !tenantFromDomain.isLocal" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <div>
          <p class="text-sm font-medium text-blue-900">
            Ingresando a: <strong>{{ tenantFromDomain.slug }}</strong>
          </p>
          <p class="text-xs text-blue-700 mt-0.5">
            Asegúrate de usar una cuenta asociada a esta empresa
          </p>
        </div>
      </div>
    </div>

    <!-- Error Messages -->
    <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm text-red-900">{{ errorMessage }}</p>
      </div>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="input"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="input"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input type="checkbox" v-model="form.remember" class="mr-2" />
          <span class="text-sm text-gray-600">Recordarme</span>
        </label>
        <router-link to="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        <span v-if="loading">Iniciando sesión...</span>
        <span v-else>Iniciar Sesión</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <span class="text-sm text-gray-600">¿No tienes cuenta?</span>
      <router-link to="/auth/register" class="text-sm text-primary-600 hover:text-primary-700 ml-1">
        Regístrate aquí
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { getTenantFromDomain, debugTenantInfo } from '@/utils/tenant'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)
const tenantFromDomain = ref(null)
const errorMessage = ref('')

// Detect tenant from domain on mount
onMounted(() => {
  // Get tenant from domain
  tenantFromDomain.value = getTenantFromDomain()

  // Debug tenant info in development
  if (import.meta.env.DEV) {
    console.log('[Login] Tenant Debug Info:', debugTenantInfo())
  }

  // Check for error messages from router
  if (route.query.error) {
    const errorMessages = {
      tenant_mismatch: 'No tienes acceso a esta empresa',
      unauthorized_tenant: 'Acceso no autorizado a esta empresa',
      session_expired: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
    }
    errorMessage.value = route.query.message || errorMessages[route.query.error] || 'Error al iniciar sesión'

    // Clear query params
    router.replace({ name: 'login' })
  }
})

async function handleLogin() {
  loading.value = true
  errorMessage.value = ''

  try {
    const success = await authStore.login(form.value)

    if (success) {
      // Initialize tenant from user's company
      if (authStore.user?.company) {
        tenantStore.setTenant(authStore.user.company)

        // Skip tenant validation for Super Admin
        const isSuperAdmin = authStore.user?.is_super_admin || authStore.user?.roles?.includes('super_admin')

        // Validate tenant slug matches domain (if not local and not super admin)
        if (!isSuperAdmin && tenantFromDomain.value && !tenantFromDomain.value.isLocal) {
          const userTenantSlug = authStore.user.company.slug ||
                                 authStore.user.company.name.toLowerCase().replace(/\s+/g, '-')

          if (tenantFromDomain.value.slug !== userTenantSlug) {
            errorMessage.value = `Esta cuenta no pertenece a ${tenantFromDomain.value.slug}. Por favor usa una cuenta válida o accede desde el dominio correcto.`
            authStore.logout()
            loading.value = false
            return
          }
        }
      }

      // Redirect to dashboard - using window.location for clean reload
      window.location.href = '/dashboard'
    } else {
      errorMessage.value = 'Credenciales incorrectas. Por favor, verifica tu email y contraseña.'
    }
  } catch (error) {
    console.error('[Login] Error:', error)
    errorMessage.value = error.message || 'Error al iniciar sesión. Por favor, intenta nuevamente.'
  } finally {
    loading.value = false
  }
}
</script>
