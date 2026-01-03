<template>
  <div class="accounts-receivable-page">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Cuentas por Cobrar</h1>
        <p class="text-gray-600 mt-1">Ventas al crédito pendientes de pago</p>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-600">Total por Cobrar</div>
        <div class="text-3xl font-bold text-blue-600">L {{ formatCurrency(totalReceivable) }}</div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Al Corriente</p>
            <p class="text-2xl font-bold text-green-600">{{ stats.current_count || 0 }}</p>
            <p class="text-xs text-gray-500 mt-1">L {{ formatCurrency(stats.current_amount || 0) }}</p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Parciales</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.partial_count || 0 }}</p>
            <p class="text-xs text-gray-500 mt-1">L {{ formatCurrency(stats.partial_amount || 0) }}</p>
          </div>
          <div class="bg-yellow-100 p-3 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Vencidas</p>
            <p class="text-2xl font-bold text-red-600">{{ stats.overdue_count || 0 }}</p>
            <p class="text-xs text-gray-500 mt-1">L {{ formatCurrency(stats.overdue_amount || 0) }}</p>
          </div>
          <div class="bg-red-100 p-3 rounded-full">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pagadas Hoy</p>
            <p class="text-2xl font-bold text-purple-600">{{ stats.paid_today_count || 0 }}</p>
            <p class="text-xs text-gray-500 mt-1">L {{ formatCurrency(stats.paid_today_amount || 0) }}</p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
          <select
            v-model="filters.customer_id"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los clientes</option>
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filters.status"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="partial">Parcial</option>
            <option value="overdue">Vencida</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
          <select
            v-model="filters.sort_by"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="due_date">Fecha Vencimiento</option>
            <option value="balance_due">Saldo Pendiente</option>
            <option value="created_at">Fecha Creación</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Orden</label>
          <select
            v-model="filters.sort_order"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Credit Sales Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">Cargando cuentas por cobrar...</p>
      </div>

      <div v-else-if="creditSales.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">No hay cuentas por cobrar</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No. Venta
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Venta
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Vencimiento
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Pagado
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Saldo
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="creditSale in creditSales" :key="creditSale.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-medium text-gray-900">{{ creditSale.sale?.sale_number }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ creditSale.customer?.name }}</div>
              <div class="text-sm text-gray-500">{{ creditSale.customer?.rtn || 'N/A' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ formatDate(creditSale.sale?.sold_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(creditSale.due_date) }}</div>
              <div v-if="creditSale.days_overdue > 0" class="text-xs text-red-600 font-medium">
                {{ creditSale.days_overdue }} días vencido
              </div>
              <div v-else-if="daysUntilDue(creditSale.due_date) <= 7 && daysUntilDue(creditSale.due_date) > 0" class="text-xs text-yellow-600">
                Vence en {{ daysUntilDue(creditSale.due_date) }} días
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
              L {{ formatCurrency(creditSale.original_amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-medium">
              L {{ formatCurrency(creditSale.amount_paid) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span class="text-sm font-semibold" :class="creditSale.balance_due > 0 ? 'text-red-600' : 'text-green-600'">
                L {{ formatCurrency(creditSale.balance_due) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span :class="getStatusBadge(creditSale.status)">
                {{ getStatusLabel(creditSale.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <div class="flex justify-center gap-2">
                <button
                  @click="viewSaleDetails(creditSale)"
                  class="text-blue-600 hover:text-blue-800"
                  title="Ver detalles"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  @click="viewCustomerStatement(creditSale.customer_id)"
                  class="text-purple-600 hover:text-purple-800"
                  title="Estado de cuenta"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Mostrando <span class="font-medium">{{ (pagination.current_page - 1) * pagination.per_page + 1 }}</span>
          a <span class="font-medium">{{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }}</span>
          de <span class="font-medium">{{ pagination.total }}</span> registros
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Anterior
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Credit Sale Details Modal -->
    <div v-if="showDetailsModal && selectedCreditSale" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeDetailsModal">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Detalles de Venta al Crédito</h2>
              <p class="text-gray-600">{{ selectedCreditSale.sale?.sale_number }}</p>
            </div>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Credit Sale Info -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="text-sm font-medium text-gray-500">Cliente</label>
              <p class="text-gray-900 font-medium">{{ selectedCreditSale.customer?.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Fecha de Venta</label>
              <p class="text-gray-900">{{ formatDate(selectedCreditSale.sale?.sold_at) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Fecha de Vencimiento</label>
              <p class="text-gray-900">{{ formatDate(selectedCreditSale.due_date) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Estado</label>
              <p>
                <span :class="getStatusBadge(selectedCreditSale.status)">
                  {{ getStatusLabel(selectedCreditSale.status) }}
                </span>
              </p>
            </div>
          </div>

          <!-- Amounts -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Monto Original</div>
              <div class="text-xl font-semibold text-blue-600">L {{ formatCurrency(selectedCreditSale.original_amount) }}</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Monto Pagado</div>
              <div class="text-xl font-semibold text-green-600">L {{ formatCurrency(selectedCreditSale.amount_paid) }}</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Saldo Pendiente</div>
              <div class="text-xl font-semibold text-red-600">L {{ formatCurrency(selectedCreditSale.balance_due) }}</div>
            </div>
          </div>

          <!-- Payment History -->
          <div v-if="selectedCreditSale.allocations?.length > 0">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Historial de Pagos</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">No. Recibo</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Monto</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="allocation in selectedCreditSale.allocations" :key="allocation.id">
                    <td class="px-4 py-2 text-sm text-gray-900">{{ formatDate(allocation.customer_payment?.payment_date) }}</td>
                    <td class="px-4 py-2 text-sm text-gray-900">{{ allocation.customer_payment?.payment_number }}</td>
                    <td class="px-4 py-2 text-sm text-right font-semibold text-green-600">L {{ formatCurrency(allocation.amount_allocated) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Actions -->
          <div class="mt-6 flex justify-end gap-3">
            <button
              @click="closeDetailsModal"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cerrar
            </button>
            <button
              @click="viewCustomerStatement(selectedCreditSale.customer_id)"
              class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              Estado de Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { useCustomerStore } from '@/stores/customer'
import { toast } from 'vue3-toastify'
import { format, differenceInDays } from 'date-fns'

const router = useRouter()
const creditStore = useCreditStore()
const customerStore = useCustomerStore()

const loading = ref(false)
const showDetailsModal = ref(false)
const selectedCreditSale = ref(null)

const filters = ref({
  customer_id: '',
  status: '',
  sort_by: 'due_date',
  sort_order: 'asc',
  page: 1
})

const creditSales = computed(() => creditStore.creditSales || [])
const customers = computed(() => customerStore.customers || [])
const pagination = computed(() => creditStore.pagination || { total: 0, current_page: 1, last_page: 1, per_page: 20 })

const stats = computed(() => {
  const sales = creditSales.value
  return {
    current_count: sales.filter(s => s.status === 'pending' && s.days_overdue === 0).length,
    current_amount: sales.filter(s => s.status === 'pending' && s.days_overdue === 0).reduce((sum, s) => sum + Number(s.balance_due), 0),
    partial_count: sales.filter(s => s.status === 'partial').length,
    partial_amount: sales.filter(s => s.status === 'partial').reduce((sum, s) => sum + Number(s.balance_due), 0),
    overdue_count: sales.filter(s => s.status === 'overdue').length,
    overdue_amount: sales.filter(s => s.status === 'overdue').reduce((sum, s) => sum + Number(s.balance_due), 0),
    paid_today_count: sales.filter(s => s.paid_at && format(new Date(s.paid_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length,
    paid_today_amount: sales.filter(s => s.paid_at && format(new Date(s.paid_at), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).reduce((sum, s) => sum + Number(s.original_amount), 0)
  }
})

const totalReceivable = computed(() => {
  return creditSales.value.reduce((sum, sale) => sum + Number(sale.balance_due || 0), 0)
})

onMounted(async () => {
  await loadCreditSales()
  await loadCustomers()
})

const loadCreditSales = async () => {
  loading.value = true
  try {
    await creditStore.fetchCreditSales(filters.value)
  } catch (error) {
    toast.error('Error al cargar las cuentas por cobrar')
  } finally {
    loading.value = false
  }
}

const loadCustomers = async () => {
  try {
    await customerStore.fetchCustomers()
  } catch (error) {
    console.error('Error loading customers:', error)
  }
}

const applyFilters = () => {
  filters.value.page = 1
  loadCreditSales()
}

const clearFilters = () => {
  filters.value = {
    customer_id: '',
    status: '',
    sort_by: 'due_date',
    sort_order: 'asc',
    page: 1
  }
  loadCreditSales()
}

const changePage = (page) => {
  filters.value.page = page
  loadCreditSales()
}

const viewSaleDetails = async (creditSale) => {
  try {
    const details = await creditStore.fetchCreditSaleById(creditSale.id)
    selectedCreditSale.value = details
    showDetailsModal.value = true
  } catch (error) {
    toast.error('Error al cargar los detalles')
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedCreditSale.value = null
}

const viewCustomerStatement = (customerId) => {
  router.push({ name: 'credit-customer-statement', params: { customerId } })
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd/MM/yyyy')
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const daysUntilDue = (dueDate) => {
  if (!dueDate) return 0
  return differenceInDays(new Date(dueDate), new Date())
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    partial: 'Parcial',
    paid: 'Pagada',
    overdue: 'Vencida'
  }
  return labels[status] || status
}

const getStatusBadge = (status) => {
  const badges = {
    pending: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
    partial: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    paid: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    overdue: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
  }
  return badges[status] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}
</script>

<style scoped>
.accounts-receivable-page {
  padding: 1.5rem;
}
</style>
