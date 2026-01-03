<template>
  <div class="tenants-list">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Clientes</h1>
          <p class="text-gray-600 mt-2">Administra todos los clientes del sistema</p>
        </div>
        <div class="flex items-center space-x-3">
          <button @click="showCreateModal = true" class="btn-primary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Cliente
          </button>
          <button @click="exportData" class="btn-secondary">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar
          </button>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Búsqueda -->
        <div class="md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Nombre, email, RTN..."
            class="input"
            @input="debouncedSearch"
          />
        </div>

        <!-- Estado -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select v-model="filters.is_active" class="input" @change="loadTenants">
            <option value="">Todos</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        <!-- Plan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Plan</label>
          <select v-model="filters.plan_id" class="input" @change="loadTenants">
            <option value="">Todos</option>
            <option v-for="plan in plans" :key="plan.id" :value="plan.id">
              {{ plan.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando clientes...</div>
    </div>

    <!-- Tabla de Tenants -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contacto
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plan
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Suscripción
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuarios/Sucursales
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="tenant in tenants.data" :key="tenant.id" class="hover:bg-gray-50">
              <!-- Cliente -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div v-if="tenant.logo" class="h-10 w-10 rounded-full overflow-hidden">
                      <img :src="tenant.logo" :alt="tenant.name" class="h-full w-full object-cover" />
                    </div>
                    <div v-else class="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
                      <span class="text-white font-bold text-sm">{{ getInitials(tenant.name) }}</span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ tenant.name }}</div>
                    <div class="text-sm text-gray-500">{{ tenant.legal_name }}</div>
                    <div class="text-xs text-gray-400">RTN: {{ tenant.rtn }}</div>
                  </div>
                </div>
              </td>

              <!-- Contacto -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ tenant.email || 'N/A' }}</div>
                <div class="text-sm text-gray-500">{{ tenant.phone || 'N/A' }}</div>
              </td>

              <!-- Plan -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="tenant.subscription?.plan" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getPlanClass(tenant.subscription.plan.slug)">
                  {{ tenant.subscription.plan.name }}
                </span>
                <span v-else class="text-sm text-gray-400">Sin plan</span>
              </td>

              <!-- Suscripción -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span v-if="tenant.subscription" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getSubscriptionClass(tenant.subscription.status)">
                  {{ getSubscriptionLabel(tenant.subscription.status) }}
                </span>
                <div v-if="tenant.subscription?.expires_at" class="text-xs text-gray-500 mt-1">
                  Vence: {{ formatDate(tenant.subscription.expires_at) }}
                </div>
              </td>

              <!-- Usuarios/Sucursales -->
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ tenant.users_count || 0 }} usuarios
                </div>
                <div class="text-sm text-gray-500">
                  {{ tenant.branches_count || 0 }} sucursales
                </div>
                <div v-if="tenant.stats" class="text-xs text-gray-400 mt-1">
                  {{ tenant.stats.products_count || 0 }} productos
                </div>
              </td>

              <!-- Estado -->
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="tenant.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                  {{ tenant.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div class="flex items-center space-x-2">
                  <button
                    @click="viewDetails(tenant.id)"
                    class="text-primary-600 hover:text-primary-900"
                    title="Ver detalles"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <button
                    @click="toggleStatus(tenant)"
                    :class="tenant.is_active ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'"
                    :title="tenant.is_active ? 'Desactivar' : 'Activar'"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>

                  <button
                    @click="editSubscription(tenant)"
                    class="text-blue-600 hover:text-blue-900"
                    title="Editar suscripción"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>

                  <button
                    @click="confirmDelete(tenant)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div v-if="tenants.data && tenants.data.length > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando <span class="font-medium">{{ tenants.from }}</span> a <span class="font-medium">{{ tenants.to }}</span> de <span class="font-medium">{{ tenants.total }}</span> clientes
          </div>
          <div class="flex space-x-2">
            <button
              @click="changePage(tenants.current_page - 1)"
              :disabled="!tenants.prev_page_url"
              class="btn-secondary"
              :class="{ 'opacity-50 cursor-not-allowed': !tenants.prev_page_url }"
            >
              Anterior
            </button>
            <button
              @click="changePage(tenants.current_page + 1)"
              :disabled="!tenants.next_page_url"
              class="btn-secondary"
              :class="{ 'opacity-50 cursor-not-allowed': !tenants.next_page_url }"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <!-- Sin resultados -->
      <div v-else class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay clientes</h3>
        <p class="mt-1 text-sm text-gray-500">No se encontraron clientes con los filtros aplicados</p>
      </div>
    </div>

    <!-- Modal de Edición de Suscripción -->
    <EditSubscriptionModal
      v-if="showSubscriptionModal"
      :tenant="selectedTenant"
      :plans="plans"
      @close="showSubscriptionModal = false"
      @updated="handleSubscriptionUpdated"
    />

    <!-- Modal de Creación de Cliente -->
    <CreateTenantModal
      v-if="showCreateModal"
      :plans="plans"
      @close="showCreateModal = false"
      @created="handleTenantCreated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import superAdminService from '@/services/superAdminService'
import EditSubscriptionModal from '@/components/super-admin/EditSubscriptionModal.vue'
import CreateTenantModal from '@/components/super-admin/CreateTenantModal.vue'
import { toast } from 'vue3-toastify'

const router = useRouter()

const loading = ref(true)
const tenants = ref({ data: [] })
const plans = ref([])
const filters = ref({
  search: '',
  is_active: '',
  plan_id: '',
  page: 1
})

const showSubscriptionModal = ref(false)
const showCreateModal = ref(false)
const selectedTenant = ref(null)

let searchTimeout = null

onMounted(async () => {
  await loadPlans()
  await loadTenants()
})

async function loadTenants() {
  loading.value = true
  try {
    const response = await superAdminService.getTenants(filters.value)
    tenants.value = response.data.data
  } catch (error) {
    console.error('Error loading tenants:', error)
    toast.error('Error al cargar los clientes')
  } finally {
    loading.value = false
  }
}

async function loadPlans() {
  try {
    const response = await superAdminService.getPlans()
    plans.value = response.data.data
  } catch (error) {
    console.error('Error loading plans:', error)
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    loadTenants()
  }, 500)
}

function changePage(page) {
  filters.value.page = page
  loadTenants()
}

function viewDetails(tenantId) {
  router.push({ name: 'super-admin-tenant-details', params: { id: tenantId } })
}

async function toggleStatus(tenant) {
  const action = tenant.is_active ? 'desactivar' : 'activar'

  if (!confirm(`¿Estás seguro de ${action} este cliente?`)) {
    return
  }

  try {
    await superAdminService.toggleTenantStatus(tenant.id)
    toast.success(`Cliente ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`)
    await loadTenants()
  } catch (error) {
    console.error('Error toggling status:', error)
    toast.error(`Error al ${action} el cliente`)
  }
}

function editSubscription(tenant) {
  selectedTenant.value = tenant
  showSubscriptionModal.value = true
}

function handleSubscriptionUpdated() {
  showSubscriptionModal.value = false
  loadTenants()
}

function handleTenantCreated() {
  showCreateModal.value = false
  loadTenants()
}

async function confirmDelete(tenant) {
  if (!confirm(`¿Estás seguro de eliminar el cliente "${tenant.name}"?\n\nEsta acción no se puede deshacer.`)) {
    return
  }

  try {
    await superAdminService.deleteTenant(tenant.id)
    toast.success('Cliente eliminado exitosamente')
    await loadTenants()
  } catch (error) {
    console.error('Error deleting tenant:', error)
    toast.error(error.response?.data?.error?.message || 'Error al eliminar el cliente')
  }
}

async function exportData() {
  try {
    const response = await superAdminService.exportTenants(filters.value)

    // Convertir a CSV
    const data = response.data.data
    const csv = convertToCSV(data)

    // Descargar archivo
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`
    a.click()

    toast.success('Datos exportados exitosamente')
  } catch (error) {
    console.error('Error exporting:', error)
    toast.error('Error al exportar los datos')
  }
}

function convertToCSV(data) {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvRows = []

  csvRows.push(headers.join(','))

  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header]
      return `"${value}"`
    })
    csvRows.push(values.join(','))
  }

  return csvRows.join('\n')
}

function getInitials(name) {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)
}

function getPlanClass(planSlug) {
  const classes = {
    basic: 'bg-gray-100 text-gray-800',
    professional: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800',
    corporate: 'bg-emerald-100 text-emerald-800'
  }
  return classes[planSlug] || 'bg-gray-100 text-gray-800'
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

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.tenants-list {
  @apply p-6;
}
</style>
