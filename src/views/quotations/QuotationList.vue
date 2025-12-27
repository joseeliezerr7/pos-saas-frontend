<template>
  <div class="quotations p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Cotizaciones</h1>
        <p class="text-gray-600 mt-2">Gestione las cotizaciones y conviértalas en ventas</p>
      </div>
      <router-link to="/quotations/create" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        + Nueva Cotización
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Búsqueda</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Número, cliente, RTN..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="accepted">Aceptada</option>
            <option value="rejected">Rechazada</option>
            <option value="expired">Expirada</option>
            <option value="converted">Convertida</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div class="flex gap-3 mt-4">
        <button
          @click="applyFilters"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Filtrar
        </button>
        <button
          @click="clearFilters"
          class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Quotations Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-4">Cotizaciones Registradas</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
          <p class="mt-2 text-gray-600">Cargando cotizaciones...</p>
        </div>

        <div v-else-if="quotations.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay cotizaciones</h3>
          <p class="mt-1 text-sm text-gray-500">Comience creando una nueva cotización.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Válida Hasta</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="quotation in quotations" :key="quotation.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ quotation.quotation_number }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ formatDate(quotation.quoted_at) }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  <div class="font-medium">{{ quotation.customer_name }}</div>
                  <div v-if="quotation.customer_rtn" class="text-gray-500">RTN: {{ quotation.customer_rtn }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right text-gray-900">
                  L {{ formatMoney(quotation.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ quotation.valid_until ? formatDate(quotation.valid_until) : 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(quotation.status)">
                    {{ getStatusLabel(quotation.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div class="flex justify-end gap-2">
                    <router-link
                      :to="`/quotations/${quotation.id}`"
                      class="text-blue-600 hover:text-blue-800"
                    >
                      Ver
                    </router-link>

                    <button
                      v-if="canConvert(quotation)"
                      @click="showConvertModal(quotation)"
                      class="text-green-600 hover:text-green-800"
                    >
                      Convertir
                    </button>

                    <button
                      v-if="canEdit(quotation)"
                      @click="$router.push(`/quotations/${quotation.id}/edit`)"
                      class="text-indigo-600 hover:text-indigo-800"
                    >
                      Editar
                    </button>

                    <button
                      v-if="canDelete(quotation)"
                      @click="confirmDelete(quotation)"
                      class="text-red-600 hover:text-red-800"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > pagination.per_page" class="mt-4 flex justify-between items-center border-t pt-4">
          <div class="text-sm text-gray-700">
            Mostrando {{ quotations.length }} de {{ pagination.total }} cotizaciones
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page >= pagination.last_page"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Convert to Sale Modal -->
    <div v-if="showConvertToSaleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">Convertir a Venta</h2>
        <p class="text-gray-600 mb-4">
          ¿Desea convertir la cotización <strong>{{ selectedQuotation?.quotation_number }}</strong> en una venta?
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
          <select
            v-model="convertData.payment_method"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccione un método</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="qr">QR</option>
            <option value="credit">Crédito</option>
          </select>
        </div>

        <div class="flex gap-2">
          <button
            @click="confirmConvert"
            :disabled="!convertData.payment_method || quotationStore.loading"
            class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ quotationStore.loading ? 'Convirtiendo...' : 'Confirmar' }}
          </button>
          <button
            @click="closeConvertModal"
            class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4 text-red-600">Confirmar Eliminación</h2>
        <p class="text-gray-600 mb-6">
          ¿Está seguro de eliminar la cotización <strong>{{ selectedQuotation?.quotation_number }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button
            @click="handleDelete"
            :disabled="quotationStore.loading"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ quotationStore.loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button
            @click="closeDeleteModal"
            class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuotationStore } from '../../stores/quotation'
import { usePermissions } from '@/composables/usePermissions'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'vue3-toastify'

const router = useRouter()
const quotationStore = useQuotationStore()
const { can } = usePermissions()

const filters = ref({
  search: '',
  status: '',
  date_from: '',
  date_to: ''
})

const showConvertToSaleModal = ref(false)
const showDeleteModal = ref(false)
const selectedQuotation = ref(null)
const convertData = ref({
  payment_method: ''
})

const loading = computed(() => quotationStore.loading)
const quotations = computed(() => quotationStore.quotations || [])
const pagination = computed(() => quotationStore.pagination)

function applyFilters() {
  const params = { page: 1 }

  if (filters.value.search) params.search = filters.value.search
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to

  quotationStore.fetchQuotations(params)
}

function clearFilters() {
  filters.value = {
    search: '',
    status: '',
    date_from: '',
    date_to: ''
  }
  quotationStore.fetchQuotations()
}

function changePage(page) {
  const params = { page }

  if (filters.value.search) params.search = filters.value.search
  if (filters.value.status) params.status = filters.value.status
  if (filters.value.date_from) params.date_from = filters.value.date_from
  if (filters.value.date_to) params.date_to = filters.value.date_to

  quotationStore.fetchQuotations(params)
}

function canConvert(quotation) {
  return quotation.status === 'pending' || quotation.status === 'accepted'
}

function canEdit(quotation) {
  return quotation.status !== 'converted' && quotation.status !== 'expired'
}

function canDelete(quotation) {
  return quotation.status !== 'converted'
}

function showConvertModal(quotation) {
  selectedQuotation.value = quotation
  convertData.value.payment_method = ''
  showConvertToSaleModal.value = true
}

function closeConvertModal() {
  showConvertToSaleModal.value = false
  selectedQuotation.value = null
  convertData.value.payment_method = ''
}

async function confirmConvert() {
  if (!convertData.value.payment_method) {
    toast.error('Por favor seleccione un método de pago')
    return
  }

  try {
    const sale = await quotationStore.convertToSale(selectedQuotation.value.id, convertData.value)
    closeConvertModal()
    applyFilters() // Reload list

    // Navigate to sale detail
    router.push(`/sales/${sale.id}`)
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(quotation) {
  selectedQuotation.value = quotation
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  selectedQuotation.value = null
}

async function handleDelete() {
  await quotationStore.deleteQuotation(selectedQuotation.value.id)
  closeDeleteModal()
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Expirada',
    converted: 'Convertida'
  }
  return labels[status] || status
}

function getStatusBadgeClass(status) {
  const classes = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    accepted: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    rejected: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
    expired: 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800',
    converted: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'
  }
  return classes[status] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}

function formatDate(dateString) {
  if (!dateString) return '-'
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
  } catch {
    return dateString
  }
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toFixed(2)
}

onMounted(() => {
  quotationStore.fetchQuotations()
})
</script>
