<template>
  <div>
    <!-- Header with filters -->
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Ventas</h1>

      <!-- Filters -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <option value="completed">Completada</option>
            <option value="voided">Anulada</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="loadSales"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Buscar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <loading-spinner v-if="loading && sales.length === 0" text="Cargando ventas..." />

    <!-- Sales Table -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <!-- Empty State -->
      <div v-if="sales.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-lg font-medium">No hay ventas registradas</p>
        <p class="mt-2">Las ventas realizadas aparecerán aquí</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Venta</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Método de Pago</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sale in sales" :key="sale.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ sale.sale_number }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(sale.sold_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(sale.sold_at) }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ sale.customer_name || 'Cliente General' }}</div>
                <div v-if="sale.customer_rtn" class="text-xs text-gray-500">RTN: {{ sale.customer_rtn }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-semibold text-gray-900">{{ formatCurrency(sale.total) }}</div>
                <div class="text-xs text-gray-500">{{ sale.details?.length || 0 }} items</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm text-gray-900">{{ getPaymentMethodLabel(sale.payment_method) }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(sale.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(sale.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <div class="flex space-x-2">
                  <button
                    @click="viewSale(sale)"
                    class="text-primary-600 hover:text-primary-800"
                    title="Ver detalles"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    v-if="sale.status === 'completed' && can('void_sales')"
                    @click="confirmVoidSale(sale)"
                    class="text-red-600 hover:text-red-800"
                    title="Anular venta"
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

    <!-- Sale Details Modal -->
    <modal-dialog
      :show="showDetailsModal"
      :title="`Detalles de Venta ${selectedSale?.sale_number || ''}`"
      @close="closeDetailsModal"
      size="large"
    >
      <div v-if="selectedSale" class="space-y-6">
        <!-- Sale Info -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <p class="text-sm text-gray-500">Fecha</p>
            <p class="font-medium">{{ formatDate(selectedSale.sold_at) }} {{ formatTime(selectedSale.sold_at) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Cliente</p>
            <p class="font-medium">{{ selectedSale.customer_name || 'Cliente General' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">RTN</p>
            <p class="font-medium">{{ selectedSale.customer_rtn || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Método de Pago</p>
            <p class="font-medium">{{ getPaymentMethodLabel(selectedSale.payment_method) }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Vendedor</p>
            <p class="font-medium">{{ selectedSale.user?.name || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Estado</p>
            <span :class="getStatusClass(selectedSale.status)" class="px-2 py-1 text-xs font-medium rounded-full">
              {{ getStatusLabel(selectedSale.status) }}
            </span>
          </div>
        </div>

        <!-- Sale Items -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Productos</h3>
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
              <tr v-for="item in selectedSale.details" :key="item.id">
                <td class="px-4 py-3">
                  <div class="font-medium">{{ item.product_name }}</div>
                  <div class="text-sm text-gray-500">SKU: {{ item.product_sku }}</div>
                </td>
                <td class="px-4 py-3 text-right">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-right">{{ formatCurrency(item.unit_price) }}</td>
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
                <span class="font-medium">{{ formatCurrency(selectedSale.subtotal) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Descuento:</span>
                <span class="font-medium">{{ formatCurrency(selectedSale.discount) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Impuesto (15%):</span>
                <span class="font-medium">{{ formatCurrency(selectedSale.tax) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>{{ formatCurrency(selectedSale.total) }}</span>
              </div>
              <div v-if="selectedSale.payment_method === 'cash'" class="flex justify-between text-sm">
                <span class="text-gray-600">Pagado:</span>
                <span>{{ formatCurrency(selectedSale.amount_paid) }}</span>
              </div>
              <div v-if="selectedSale.payment_method === 'cash'" class="flex justify-between text-sm">
                <span class="text-gray-600">Cambio:</span>
                <span>{{ formatCurrency(selectedSale.amount_change) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="selectedSale.notes" class="border-t pt-4">
          <p class="text-sm text-gray-500">Notas:</p>
          <p class="text-gray-900">{{ selectedSale.notes }}</p>
        </div>
      </div>
    </modal-dialog>

    <!-- Void Confirmation Modal -->
    <modal-dialog
      :show="showVoidModal"
      title="Anular Venta"
      @close="showVoidModal = false"
    >
      <div class="space-y-4">
        <p class="text-gray-700">
          ¿Estás seguro de que deseas anular la venta <strong>{{ saleToVoid?.sale_number }}</strong>?
        </p>
        <p class="text-sm text-gray-600">
          Esta acción restaurará el inventario pero no se puede revertir.
        </p>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Motivo de Anulación *</label>
          <textarea
            v-model="voidReason"
            rows="3"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ingresa el motivo de la anulación..."
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            @click="showVoidModal = false"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="voidSale"
            :disabled="!voidReason || loading"
            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ loading ? 'Anulando...' : 'Anular Venta' }}
          </button>
        </div>
      </div>
    </modal-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import saleService from '@/services/saleService'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'
import { toast } from 'vue3-toastify'
import { usePermissions } from '@/composables/usePermissions'

const sales = ref([])
const loading = ref(false)
const showDetailsModal = ref(false)
const { can } = usePermissions()
const showVoidModal = ref(false)
const selectedSale = ref(null)
const saleToVoid = ref(null)
const voidReason = ref('')

const filters = ref({
  date_from: '',
  date_to: '',
  status: '',
  page: 1
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
})

onMounted(() => {
  // Set default dates (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  filters.value.date_to = today.toISOString().split('T')[0]
  filters.value.date_from = thirtyDaysAgo.toISOString().split('T')[0]

  loadSales()
})

async function loadSales() {
  loading.value = true
  try {
    const params = {
      ...filters.value,
      per_page: pagination.value.per_page
    }

    console.log('Loading sales with params:', params)
    const response = await saleService.getAll(params)
    console.log('Sales response:', response)
    console.log('Response data:', response.data)

    if (response.data.success) {
      console.log('Sales data:', response.data.data)
      console.log('Number of sales:', response.data.data.length)
      sales.value = response.data.data
      pagination.value = response.data.meta
    } else {
      console.error('Response not successful:', response.data)
    }
  } catch (error) {
    console.error('Error loading sales:', error)
    console.error('Error response:', error.response)
    toast.error('Error al cargar las ventas')
  } finally {
    loading.value = false
  }
}

async function viewSale(sale) {
  loading.value = true
  try {
    const response = await saleService.getById(sale.id)
    if (response.data.success) {
      selectedSale.value = response.data.data
      showDetailsModal.value = true
    }
  } catch (error) {
    console.error('Error loading sale details:', error)
    toast.error('Error al cargar los detalles de la venta')
  } finally {
    loading.value = false
  }
}

function closeDetailsModal() {
  showDetailsModal.value = false
  selectedSale.value = null
}

function confirmVoidSale(sale) {
  saleToVoid.value = sale
  voidReason.value = ''
  showVoidModal.value = true
}

async function voidSale() {
  if (!voidReason.value.trim()) {
    toast.error('Debes ingresar un motivo para anular la venta')
    return
  }

  loading.value = true
  try {
    const response = await saleService.void(saleToVoid.value.id, {
      reason: voidReason.value
    })

    if (response.data.success) {
      toast.success('Venta anulada exitosamente')
      showVoidModal.value = false
      saleToVoid.value = null
      voidReason.value = ''
      loadSales()
    }
  } catch (error) {
    console.error('Error voiding sale:', error)
    toast.error(error.response?.data?.error?.message || 'Error al anular la venta')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    filters.value.page = page
    loadSales()
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

function getPaymentMethodLabel(method) {
  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit: 'Crédito',
    qr: 'QR',
    mixed: 'Mixto'
  }
  return labels[method] || method
}

function getStatusLabel(status) {
  const labels = {
    completed: 'Completada',
    voided: 'Anulada'
  }
  return labels[status] || status
}

function getStatusClass(status) {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    voided: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
