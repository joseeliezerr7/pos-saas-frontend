<template>
  <div>
    <!-- Header with filters -->
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold text-gray-800">Devoluciones</h1>
        <button
          v-if="can('create_sales')"
          @click="createReturn"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Nueva Devolución
        </button>
      </div>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="completed">Completada</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            v-model="filters.return_type"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Todos</option>
            <option value="full">Completa</option>
            <option value="partial">Parcial</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="loadReturns"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <loading-spinner v-if="loading && returns.length === 0" text="Cargando devoluciones..." />

    <!-- Returns Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Empty State -->
      <div v-if="returns.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
        </svg>
        <p class="text-lg font-medium">No hay devoluciones registradas</p>
        <p class="mt-2">Las devoluciones procesadas aparecerán aquí</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Devolución</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Venta Ref.</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="returnItem in returns" :key="returnItem.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ returnItem.return_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(returnItem.returned_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(returnItem.returned_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ returnItem.sale?.sale_number || 'N/A' }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ returnItem.customer_name || 'Cliente General' }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(returnItem.total) }}</div>
                <div class="text-xs text-gray-500">{{ returnItem.details?.length || 0 }} items</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getReturnTypeClass(returnItem.return_type)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getReturnTypeLabel(returnItem.return_type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(returnItem.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(returnItem.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button
                    @click="viewReturn(returnItem)"
                    class="text-primary-600 hover:text-primary-800"
                    title="Ver detalles"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    v-if="returnItem.status === 'pending' && can('create_sales')"
                    @click="confirmCompleteReturn(returnItem)"
                    class="text-green-600 hover:text-green-800"
                    title="Completar devolución"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    v-if="returnItem.status === 'pending' && can('create_sales')"
                    @click="confirmCancelReturn(returnItem)"
                    class="text-red-600 hover:text-red-800"
                    title="Cancelar devolución"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando
            <span class="font-medium">{{ ((pagination.current_page - 1) * pagination.per_page) + 1 }}</span>
            a
            <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
            de
            <span class="font-medium">{{ pagination.total }}</span>
            resultados
          </div>

          <div class="flex space-x-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
              class="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Return Details Modal -->
    <modal-dialog
      :show="showDetailsModal"
      :title="`Detalles de Devolución ${selectedReturn?.return_number || ''}`"
      @close="closeDetailsModal"
      size="large"
    >
      <div v-if="selectedReturn" class="space-y-6">
        <!-- Return Info -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <p class="text-sm text-gray-500">Fecha</p>
            <p class="font-medium">{{ formatDate(selectedReturn.returned_at) }} {{ formatTime(selectedReturn.returned_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Cliente</p>
            <p class="font-medium">{{ selectedReturn.customer_name || 'Cliente General' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Venta Referencia</p>
            <p class="font-medium">{{ selectedReturn.sale?.sale_number || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Método de Reembolso</p>
            <p class="font-medium">{{ getRefundMethodLabel(selectedReturn.refund_method) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Usuario</p>
            <p class="font-medium">{{ selectedReturn.user?.name || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Estado</p>
            <span :class="getStatusClass(selectedReturn.status)" class="px-2 py-1 text-xs font-medium rounded-full">
              {{ getStatusLabel(selectedReturn.status) }}
            </span>
          </div>
        </div>

        <!-- Return Items -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Productos Devueltos</h3>
          <table class="w-full">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="item in selectedReturn.details" :key="item.id">
                <td class="px-4 py-3">
                  <div class="font-medium">{{ item.product_name }}</div>
                  <div class="text-sm text-gray-500">SKU: {{ item.product_sku }}</div>
                  <div v-if="item.reason" class="text-xs text-gray-600 mt-1">Razón: {{ item.reason }}</div>
                </td>
                <td class="px-4 py-3 text-right">{{ item.quantity_returned }}</td>
                <td class="px-4 py-3 text-right">{{ formatCurrency(item.price) }}</td>
                <td class="px-4 py-3 text-right">{{ formatCurrency(item.discount) }}</td>
                <td class="px-4 py-3 text-right font-medium">{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Totals -->
        <div class="border-t pt-4">
          <div class="flex justify-end">
            <div class="w-64 space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">{{ formatCurrency(selectedReturn.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Descuento:</span>
                <span class="font-medium">{{ formatCurrency(selectedReturn.discount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Impuesto:</span>
                <span class="font-medium">{{ formatCurrency(selectedReturn.tax) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{{ formatCurrency(selectedReturn.total) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Monto Reembolsado:</span>
                <span>{{ formatCurrency(selectedReturn.refund_amount) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Reason -->
        <div v-if="selectedReturn.reason" class="border-t pt-4">
          <p class="text-sm text-gray-500">Razón de Devolución:</p>
          <p class="text-gray-900">{{ selectedReturn.reason }}</p>
        </div>

        <!-- Notes -->
        <div v-if="selectedReturn.notes" class="border-t pt-4">
          <p class="text-sm text-gray-500">Notas:</p>
          <p class="text-gray-900">{{ selectedReturn.notes }}</p>
        </div>
      </div>
    </modal-dialog>

    <!-- Complete Confirmation Modal -->
    <modal-dialog
      :show="showCompleteModal"
      title="Completar Devolución"
      @close="showCompleteModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de que deseas completar la devolución <strong>{{ returnToComplete?.return_number }}</strong>?
        </p>
        <p class="text-sm text-gray-600">
          Se procesará el reembolso de <strong>{{ formatCurrency(returnToComplete?.refund_amount || 0) }}</strong>
          y se actualizará el inventario.
        </p>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showCompleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="completeReturn"
            :disabled="loading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {{ loading ? 'Procesando...' : 'Completar Devolución' }}
          </button>
        </div>
      </div>
    </modal-dialog>

    <!-- Cancel Confirmation Modal -->
    <modal-dialog
      :show="showCancelModal"
      title="Cancelar Devolución"
      @close="showCancelModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de que deseas cancelar la devolución <strong>{{ returnToCancel?.return_number }}</strong>?
        </p>
        <p class="text-sm text-gray-600">
          Esta acción revertirá los cambios de inventario realizados.
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Motivo de Cancelación *</label>
          <textarea
            v-model="cancelReason"
            rows="3"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ingresa el motivo de la cancelación..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showCancelModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cerrar
          </button>
          <button
            @click="cancelReturn"
            :disabled="!cancelReason || loading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? 'Cancelando...' : 'Cancelar Devolución' }}
          </button>
        </div>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useReturnStore } from '@/stores/return'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { toast } from 'vue3-toastify'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const returnStore = useReturnStore()
const { can } = usePermissions()

const returns = ref([])
const loading = ref(false)
const showDetailsModal = ref(false)
const showCompleteModal = ref(false)
const showCancelModal = ref(false)
const selectedReturn = ref(null)
const returnToComplete = ref(null)
const returnToCancel = ref(null)
const cancelReason = ref('')

const filters = ref({
  date_from: '',
  date_to: '',
  status: '',
  return_type: '',
  page: 1
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
})

onMounted(() => {
  // Load all returns without date filters by default
  loadReturns()
})

async function loadReturns() {
  loading.value = true
  try {
    await returnStore.fetchReturns({
      ...filters.value,
      per_page: pagination.value.per_page
    })

    returns.value = returnStore.returns
    pagination.value = returnStore.pagination
  } catch (error) {
    console.error('Error loading returns:', error)
  } finally {
    loading.value = false
  }
}

async function viewReturn(returnItem) {
  loading.value = true
  try {
    const loadedReturn = await returnStore.fetchReturnById(returnItem.id)
    selectedReturn.value = loadedReturn
    showDetailsModal.value = true
  } catch (error) {
    console.error('Error loading return details:', error)
  } finally {
    loading.value = false
  }
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedReturn.value = null
}

function confirmCompleteReturn(returnItem) {
  returnToComplete.value = returnItem
  showCompleteModal.value = true
}

async function completeReturn() {
  loading.value = true
  try {
    await returnStore.completeReturn(returnToComplete.value.id)
    showCompleteModal.value = false
    returnToComplete.value = null
    loadReturns()
  } catch (error) {
    console.error('Error completing return:', error)
  } finally {
    loading.value = false
  }
}

function confirmCancelReturn(returnItem) {
  returnToCancel.value = returnItem
  cancelReason.value = ''
  showCancelModal.value = true
}

async function cancelReturn() {
  if (!cancelReason.value.trim()) {
    toast.error('Debes ingresar un motivo para cancelar la devolución')
    return
  }

  loading.value = true
  try {
    await returnStore.cancelReturn(returnToCancel.value.id, cancelReason.value)
    showCancelModal.value = false
    returnToCancel.value = null
    cancelReason.value = ''
    loadReturns()
  } catch (error) {
    console.error('Error cancelling return:', error)
  } finally {
    loading.value = false
  }
}

function createReturn() {
  router.push('/returns/create')
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    filters.value.page = page
    loadReturns()
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(amount || 0)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-HN')
}

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getRefundMethodLabel(method) {
  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit: 'Crédito',
    mixed: 'Mixto'
  }
  return labels[method] || method
}

function getReturnTypeLabel(type) {
  const labels = {
    full: 'Completa',
    partial: 'Parcial'
  }
  return labels[type] || type
}

function getReturnTypeClass(type) {
  const classes = {
    full: 'bg-purple-100 text-purple-800',
    partial: 'bg-blue-100 text-blue-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    completed: 'Completada',
    cancelled: 'Cancelada'
  }
  return labels[status] || status
}

function getStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
