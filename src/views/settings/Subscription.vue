<template>
  <div>
    <!-- Loading State -->
    <loading-spinner v-if="settingsStore.loading && !company" text="Cargando suscripción..." />

    <!-- Subscription Details -->
    <div v-else-if="company">
      <!-- Current Plan Card -->
      <div class="bg-white rounded-lg shadow p-6 mb-6">
        <div class="flex justify-between items-start mb-6">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ planName }}</h2>
            <p class="text-gray-600">{{ planDescription }}</p>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold text-primary-600">{{ planPrice }}</div>
            <div class="text-sm text-gray-500">{{ billingCycle }}</div>
          </div>
        </div>

        <!-- Subscription Status -->
        <div class="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
          <div class="flex-1">
            <div class="text-sm font-medium text-gray-700 mb-1">Estado de Suscripción</div>
            <div class="flex items-center">
              <span :class="subscriptionStatusClass" class="px-3 py-1 text-sm font-medium rounded-full">
                {{ subscriptionStatusLabel }}
              </span>
            </div>
          </div>
          <div v-if="subscription?.expires_at" class="flex-1">
            <div class="text-sm font-medium text-gray-700 mb-1">
              {{ isTrialPeriod ? 'Fin del Período de Prueba' : 'Próxima Renovación' }}
            </div>
            <div class="text-lg font-semibold text-gray-900">{{ formatDate(subscription.expires_at) }}</div>
            <div class="text-xs text-gray-500">{{ daysRemaining }}</div>
          </div>
        </div>

        <!-- Plan Features -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Características del Plan</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="feature in planFeatures" :key="feature.name" class="flex items-start">
              <svg class="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <div class="text-sm font-medium text-gray-900">{{ feature.name }}</div>
                <div class="text-xs text-gray-500">{{ feature.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Usage Statistics -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Uso del Plan</h3>
          <div class="space-y-4">
            <!-- Users -->
            <div v-if="planLimits.max_users">
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium text-gray-700">Usuarios</span>
                <span class="text-gray-600">
                  {{ currentUsage.users || 0 }} / {{ planLimits.max_users === -1 ? 'Ilimitado' : planLimits.max_users }}
                </span>
              </div>
              <div v-if="planLimits.max_users !== -1" class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full"
                     :style="{ width: `${getUsagePercentage(currentUsage.users, planLimits.max_users)}%` }">
                </div>
              </div>
            </div>

            <!-- Products -->
            <div v-if="planLimits.max_products">
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium text-gray-700">Productos</span>
                <span class="text-gray-600">
                  {{ currentUsage.products || 0 }} / {{ planLimits.max_products === -1 ? 'Ilimitado' : planLimits.max_products }}
                </span>
              </div>
              <div v-if="planLimits.max_products !== -1" class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full"
                     :style="{ width: `${getUsagePercentage(currentUsage.products, planLimits.max_products)}%` }">
                </div>
              </div>
            </div>

            <!-- Branches -->
            <div v-if="planLimits.max_branches">
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium text-gray-700">Sucursales</span>
                <span class="text-gray-600">
                  {{ currentUsage.branches || 0 }} / {{ planLimits.max_branches === -1 ? 'Ilimitado' : planLimits.max_branches }}
                </span>
              </div>
              <div v-if="planLimits.max_branches !== -1" class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full"
                     :style="{ width: `${getUsagePercentage(currentUsage.branches, planLimits.max_branches)}%` }">
                </div>
              </div>
            </div>

            <!-- Monthly Sales -->
            <div v-if="planLimits.max_monthly_sales">
              <div class="flex justify-between text-sm mb-2">
                <span class="font-medium text-gray-700">Ventas Mensuales</span>
                <span class="text-gray-600">
                  {{ currentUsage.monthly_sales || 0 }} / {{ planLimits.max_monthly_sales === -1 ? 'Ilimitado' : planLimits.max_monthly_sales }}
                </span>
              </div>
              <div v-if="planLimits.max_monthly_sales !== -1" class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-600 h-2 rounded-full"
                     :style="{ width: `${getUsagePercentage(currentUsage.monthly_sales, planLimits.max_monthly_sales)}%` }">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex space-x-3">
          <button class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  disabled>
            Actualizar Plan
          </button>
          <button class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  disabled>
            Ver Historial de Facturación
          </button>
        </div>
      </div>

      <!-- Billing Information (if available) -->
      <div v-if="subscription?.payment_method" class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Información de Pago</h3>
        <div class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-gray-600">Método de Pago</span>
            <span class="font-medium text-gray-900">{{ subscription.payment_method }}</span>
          </div>
          <div v-if="subscription.last_payment_date" class="flex justify-between text-sm">
            <span class="text-gray-600">Último Pago</span>
            <span class="font-medium text-gray-900">{{ formatDate(subscription.last_payment_date) }}</span>
          </div>
          <div v-if="subscription.last_payment_amount" class="flex justify-between text-sm">
            <span class="text-gray-600">Monto del Último Pago</span>
            <span class="font-medium text-gray-900">{{ formatCurrency(subscription.last_payment_amount) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- No subscription -->
    <div v-else class="bg-white rounded-lg shadow p-8 text-center">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-lg font-medium text-gray-900">No hay información de suscripción</p>
      <p class="mt-2 text-gray-600">No se pudo cargar la información de tu plan</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const settingsStore = useSettingsStore()

const company = computed(() => settingsStore.companySettings)
const subscription = computed(() => company.value?.subscription)
const plan = computed(() => company.value?.plan)

onMounted(async () => {
  await loadSubscription()
})

async function loadSubscription() {
  try {
    await settingsStore.fetchCompanySettings()
  } catch (error) {
    console.error('Error loading subscription:', error)
  }
}

const planName = computed(() => plan.value?.name || 'Plan Gratuito')
const planDescription = computed(() => plan.value?.description || 'Plan básico sin costo')
const planPrice = computed(() => {
  if (!plan.value?.price) return 'Gratis'
  return formatCurrency(plan.value.price)
})

const billingCycle = computed(() => {
  if (!plan.value?.billing_cycle) return ''
  const cycles = {
    monthly: 'por mes',
    yearly: 'por año',
    quarterly: 'por trimestre'
  }
  return cycles[plan.value.billing_cycle] || plan.value.billing_cycle
})

const planLimits = computed(() => {
  const features = plan.value?.features || {}
  return {
    max_users: features.max_users || null,
    max_products: features.max_products || null,
    max_branches: features.max_branches || null,
    max_monthly_sales: features.max_monthly_sales || null
  }
})

const planFeatures = computed(() => {
  const features = []
  const planFeats = plan.value?.features || {}

  if (planFeats.max_users) {
    features.push({
      name: 'Usuarios',
      description: planFeats.max_users === -1 ? 'Usuarios ilimitados' : `Hasta ${planFeats.max_users} usuarios`
    })
  }

  if (planFeats.max_products) {
    features.push({
      name: 'Productos',
      description: planFeats.max_products === -1 ? 'Productos ilimitados' : `Hasta ${planFeats.max_products} productos`
    })
  }

  if (planFeats.max_branches) {
    features.push({
      name: 'Sucursales',
      description: planFeats.max_branches === -1 ? 'Sucursales ilimitadas' : `Hasta ${planFeats.max_branches} sucursales`
    })
  }

  if (planFeats.max_monthly_sales) {
    features.push({
      name: 'Ventas Mensuales',
      description: planFeats.max_monthly_sales === -1 ? 'Ventas ilimitadas' : `Hasta ${planFeats.max_monthly_sales} ventas al mes`
    })
  }

  if (planFeats.pos_terminals) {
    features.push({
      name: 'Terminales POS',
      description: planFeats.pos_terminals === -1 ? 'Terminales ilimitadas' : `Hasta ${planFeats.pos_terminals} terminales`
    })
  }

  if (planFeats.reports) {
    features.push({
      name: 'Reportes',
      description: 'Reportes y estadísticas avanzadas'
    })
  }

  if (planFeats.api_access) {
    features.push({
      name: 'API Access',
      description: 'Acceso a API para integraciones'
    })
  }

  if (planFeats.support_level) {
    const levels = {
      basic: 'Soporte básico por email',
      priority: 'Soporte prioritario',
      premium: 'Soporte premium 24/7'
    }
    features.push({
      name: 'Soporte',
      description: levels[planFeats.support_level] || 'Soporte incluido'
    })
  }

  return features
})

const currentUsage = computed(() => {
  return {
    users: company.value?.users_count || 0,
    products: company.value?.products_count || 0,
    branches: company.value?.branches?.length || 0,
    monthly_sales: company.value?.monthly_sales_count || 0
  }
})

const subscriptionStatusLabel = computed(() => {
  if (!subscription.value) return 'Sin Suscripción'

  const status = subscription.value.status
  const labels = {
    active: 'Activa',
    trial: 'Período de Prueba',
    expired: 'Vencida',
    canceled: 'Cancelada',
    suspended: 'Suspendida'
  }
  return labels[status] || status
})

const subscriptionStatusClass = computed(() => {
  if (!subscription.value) return 'bg-gray-100 text-gray-800'

  const status = subscription.value.status
  const classes = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

const isTrialPeriod = computed(() => subscription.value?.status === 'trial')

const daysRemaining = computed(() => {
  if (!subscription.value?.expires_at) return ''

  const expiresAt = new Date(subscription.value.expires_at)
  const today = new Date()
  const diffTime = expiresAt - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return 'Vencida'
  if (diffDays === 0) return 'Vence hoy'
  if (diffDays === 1) return 'Vence mañana'
  return `${diffDays} días restantes`
})

function getUsagePercentage(current, max) {
  if (!max || max === -1) return 0
  return Math.min((current / max) * 100, 100)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(amount)
}
</script>
