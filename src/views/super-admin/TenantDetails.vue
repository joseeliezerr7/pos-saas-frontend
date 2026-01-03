<template>
  <div class="tenant-details">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="$router.back()"
            class="text-gray-400 hover:text-gray-600"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ tenant?.name }}</h1>
            <p class="text-gray-600 mt-1">{{ tenant?.legal_name }}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <button
            @click="editSubscription"
            class="btn-secondary"
          >
            Editar Suscripción
          </button>
          <button
            @click="toggleStatus"
            :class="tenant?.is_active ? 'btn-secondary' : 'btn-primary'"
          >
            {{ tenant?.is_active ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando detalles...</div>
    </div>

    <!-- Content -->
    <div v-else-if="tenant">
      <!-- Información Básica y Estado -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Información de la Empresa -->
        <div class="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h2>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">RTN</label>
              <p class="mt-1 text-gray-900">{{ tenant.rtn }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="mt-1 text-gray-900">{{ tenant.email || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Teléfono</label>
              <p class="mt-1 text-gray-900">{{ tenant.phone || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Sitio Web</label>
              <p class="mt-1 text-gray-900">{{ tenant.website || 'N/A' }}</p>
            </div>
            <div class="col-span-2">
              <label class="text-sm font-medium text-gray-500">Dirección</label>
              <p class="mt-1 text-gray-900">{{ tenant.address || 'N/A' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Fecha de Registro</label>
              <p class="mt-1 text-gray-900">{{ formatDate(tenant.created_at) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Slug</label>
              <p class="mt-1 text-gray-900 font-mono text-sm">{{ tenant.slug }}</p>
            </div>
          </div>
        </div>

        <!-- Estado y Suscripción -->
        <div class="space-y-6">
          <!-- Estado -->
          <div class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Estado General</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </div>
              <div v-if="tenant.subscription" class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Suscripción</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :class="getSubscriptionClass(tenant.subscription.status)"
                >
                  {{ getSubscriptionLabel(tenant.subscription.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Suscripción -->
          <div v-if="tenant.subscription" class="bg-white rounded-lg shadow p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Suscripción</h3>
            <div class="space-y-3">
              <div>
                <label class="text-sm font-medium text-gray-500">Plan</label>
                <p class="mt-1 text-lg font-semibold text-gray-900">
                  {{ tenant.subscription.plan?.name }}
                </p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Fecha de Inicio</label>
                <p class="mt-1 text-gray-900">{{ formatDate(tenant.subscription.starts_at) }}</p>
              </div>
              <div>
                <label class="text-sm font-medium text-gray-500">Fecha de Expiración</label>
                <p class="mt-1 text-gray-900">{{ formatDate(tenant.subscription.expires_at) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas de Uso -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Usuarios</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ tenant.users_count || 0 }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Sucursales</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ tenant.branches_count || 0 }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Productos</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ statistics?.products_count || 0 }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Ventas Totales</p>
              <p class="text-2xl font-bold text-gray-900 mt-1">{{ statistics?.total_sales || 0 }}</p>
            </div>
            <div class="p-3 bg-emerald-100 rounded-full">
              <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Estadísticas Detalladas -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Ingresos -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Ingresos</h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-600">Total Histórico</span>
                <span class="text-lg font-bold text-gray-900">
                  L {{ formatCurrency(statistics?.revenue_total || 0) }}
                </span>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-600">Este Mes</span>
                <span class="text-lg font-bold text-emerald-600">
                  L {{ formatCurrency(statistics?.revenue_this_month || 0) }}
                </span>
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-gray-600">Mes Anterior</span>
                <span class="text-lg font-bold text-gray-600">
                  L {{ formatCurrency(statistics?.revenue_last_month || 0) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Otros Datos -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Otros Datos</h3>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Categorías</label>
              <p class="mt-1 text-xl font-bold text-gray-900">{{ statistics?.categories_count || 0 }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Clientes</label>
              <p class="mt-1 text-xl font-bold text-gray-900">{{ statistics?.customers_count || 0 }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Proveedores</label>
              <p class="mt-1 text-xl font-bold text-gray-900">{{ statistics?.suppliers_count || 0 }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Compras</label>
              <p class="mt-1 text-xl font-bold text-gray-900">{{ statistics?.total_purchases || 0 }}</p>
            </div>
            <div class="col-span-2">
              <label class="text-sm font-medium text-gray-500">Última Venta</label>
              <p class="mt-1 text-sm text-gray-900">
                {{ statistics?.last_sale_date ? formatDate(statistics.last_sale_date) : 'N/A' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tablas de Usuarios y Sucursales -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Usuarios -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Usuarios ({{ tenant.users?.length || 0 }})</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="user in tenant.users" :key="user.id">
                  <td class="px-4 py-3 text-sm text-gray-900">{{ user.name }}</td>
                  <td class="px-4 py-3 text-sm text-gray-600">{{ user.email }}</td>
                  <td class="px-4 py-3 text-sm">
                    <span
                      v-for="role in user.roles"
                      :key="role.id"
                      class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1"
                    >
                      {{ role.name }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Sucursales -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Sucursales ({{ tenant.branches?.length || 0 }})</h3>
          <div class="space-y-3">
            <div
              v-for="branch in tenant.branches"
              :key="branch.id"
              class="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div class="flex-1">
                <div class="flex items-center">
                  <h4 class="text-sm font-medium text-gray-900">{{ branch.name }}</h4>
                  <span
                    v-if="branch.is_main"
                    class="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    Principal
                  </span>
                </div>
                <p class="text-xs text-gray-500 mt-1">{{ branch.address }}</p>
                <p class="text-xs text-gray-500">{{ branch.phone }}</p>
              </div>
              <span
                class="px-2 py-1 rounded text-xs font-medium"
                :class="branch.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
              >
                {{ branch.is_active ? 'Activa' : 'Inactiva' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Edición de Suscripción -->
    <EditSubscriptionModal
      v-if="showSubscriptionModal"
      :tenant="tenant"
      :plans="plans"
      @close="showSubscriptionModal = false"
      @updated="handleSubscriptionUpdated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import superAdminService from '@/services/superAdminService'
import EditSubscriptionModal from '@/components/super-admin/EditSubscriptionModal.vue'
import { toast } from 'vue3-toastify'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const tenant = ref(null)
const statistics = ref(null)
const plans = ref([])
const showSubscriptionModal = ref(false)

onMounted(async () => {
  await loadPlans()
  await loadTenantDetails()
})

async function loadPlans() {
  try {
    const response = await superAdminService.getPlans()
    plans.value = response.data.data
  } catch (error) {
    console.error('Error loading plans:', error)
  }
}

async function loadTenantDetails() {
  loading.value = true
  try {
    const response = await superAdminService.getTenantDetails(route.params.id)
    tenant.value = response.data.data.tenant
    statistics.value = response.data.data.statistics
  } catch (error) {
    console.error('Error loading tenant details:', error)
    toast.error('Error al cargar los detalles del cliente')
  } finally {
    loading.value = false
  }
}

async function toggleStatus() {
  const action = tenant.value.is_active ? 'desactivar' : 'activar'

  if (!confirm(`¿Estás seguro de ${action} este cliente?`)) {
    return
  }

  try {
    await superAdminService.toggleTenantStatus(tenant.value.id)
    toast.success(`Cliente ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`)
    await loadTenantDetails()
  } catch (error) {
    console.error('Error toggling status:', error)
    toast.error(`Error al ${action} el cliente`)
  }
}

function editSubscription() {
  showSubscriptionModal.value = true
}

function handleSubscriptionUpdated() {
  showSubscriptionModal.value = false
  loadTenantDetails()
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getSubscriptionClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getSubscriptionLabel(status) {
  const labels = {
    active: 'Activa',
    trial: 'Prueba',
    expired: 'Expirada',
    canceled: 'Cancelada',
    suspended: 'Suspendida'
  }
  return labels[status] || status
}
</script>

<style scoped>
.tenant-details {
  @apply p-6;
}
</style>
