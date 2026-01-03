<template>
  <div class="payments-page">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Gestión de Pagos</h1>
        <p class="text-gray-600 mt-1">Registro y seguimiento de pagos de clientes</p>
      </div>
      <button
        @click="openPaymentModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Registrar Pago
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
          <input
            v-model="filters.date_from"
            type="date"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
          <input
            v-model="filters.date_to"
            type="date"
            @change="applyFilters"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="clearFilters"
            class="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Payments Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">Cargando pagos...</p>
      </div>

      <div v-else-if="payments.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">No se encontraron pagos</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No. Recibo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Método
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm font-medium text-gray-900">{{ payment.payment_number }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ formatDateTime(payment.payment_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ payment.customer?.name }}</div>
              <div class="text-sm text-gray-500">{{ payment.customer?.rtn || 'N/A' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getPaymentMethodBadge(payment.payment_method)">
                {{ getPaymentMethodLabel(payment.payment_method) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <span class="text-sm font-semibold text-green-600">
                L {{ formatCurrency(payment.amount) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              {{ payment.user?.name || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <div class="flex justify-center gap-2">
                <button
                  @click="viewPaymentDetails(payment)"
                  class="text-blue-600 hover:text-blue-800"
                  title="Ver detalles"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  @click="downloadReceipt(payment.id)"
                  class="text-green-600 hover:text-green-800"
                  title="Descargar recibo"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
          de <span class="font-medium">{{ pagination.total }}</span> pagos
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

    <!-- Payment Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closeDetailsModal">
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-start mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Detalles del Pago</h2>
              <p class="text-gray-600">{{ selectedPayment?.payment_number }}</p>
            </div>
            <button @click="closeDetailsModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Payment Info -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label class="text-sm font-medium text-gray-500">Cliente</label>
              <p class="text-gray-900 font-medium">{{ selectedPayment?.customer?.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Fecha de Pago</label>
              <p class="text-gray-900">{{ formatDateTime(selectedPayment?.payment_date) }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Método de Pago</label>
              <p>
                <span :class="getPaymentMethodBadge(selectedPayment?.payment_method)">
                  {{ getPaymentMethodLabel(selectedPayment?.payment_method) }}
                </span>
              </p>
            </div>
            <div v-if="selectedPayment?.transaction_reference">
              <label class="text-sm font-medium text-gray-500">Referencia de Transacción</label>
              <p class="text-gray-900 font-mono">{{ selectedPayment?.transaction_reference }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Recibido por</label>
              <p class="text-gray-900">{{ selectedPayment?.user?.name || 'N/A' }}</p>
            </div>
          </div>

          <!-- Amount Box -->
          <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6 text-center">
            <div class="text-sm text-gray-600 mb-1">Monto Recibido</div>
            <div class="text-3xl font-bold text-blue-600">L {{ formatCurrency(selectedPayment?.amount) }}</div>
          </div>

          <!-- Balance Info -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Balance Anterior</div>
              <div class="text-xl font-semibold text-gray-900">L {{ formatCurrency(selectedPayment?.balance_before) }}</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600 mb-1">Nuevo Balance</div>
              <div class="text-xl font-semibold text-green-600">L {{ formatCurrency(selectedPayment?.balance_after) }}</div>
            </div>
          </div>

          <!-- Allocations -->
          <div v-if="selectedPayment?.allocations?.length > 0">
            <h3 class="text-lg font-semibold text-gray-800 mb-3">Aplicación del Pago</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">No. Venta</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Total Venta</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Pago Aplicado</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Saldo Restante</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="allocation in selectedPayment.allocations" :key="allocation.id">
                    <td class="px-4 py-2 text-sm text-gray-900">{{ allocation.credit_sale?.sale?.sale_number }}</td>
                    <td class="px-4 py-2 text-sm text-right">L {{ formatCurrency(allocation.credit_sale?.original_amount) }}</td>
                    <td class="px-4 py-2 text-sm text-right font-semibold text-green-600">L {{ formatCurrency(allocation.amount_allocated) }}</td>
                    <td class="px-4 py-2 text-sm text-right">L {{ formatCurrency(allocation.credit_sale?.balance_due) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Notes -->
          <div v-if="selectedPayment?.notes" class="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <div class="text-sm font-medium text-gray-700 mb-1">Notas</div>
            <p class="text-gray-600">{{ selectedPayment.notes }}</p>
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
              @click="downloadReceipt(selectedPayment.id)"
              class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Descargar Recibo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Register Payment Modal -->
    <div v-if="showPaymentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="closePaymentModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div class="p-6">
          <h2 class="text-2xl font-bold text-gray-800 mb-6">Registrar Pago</h2>

          <!-- Payment Form -->
          <form @submit.prevent="submitPayment">
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Cliente *</label>
                <select
                  v-model="paymentForm.customer_id"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cliente</option>
                  <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                    {{ customer.name }} - Saldo: L {{ formatCurrency(customer.current_balance || 0) }}
                  </option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Monto *</label>
                <input
                  v-model.number="paymentForm.amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
                <select
                  v-model="paymentForm.payment_method"
                  required
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="check">Cheque</option>
                  <option value="qr">QR</option>
                </select>
              </div>

              <!-- Transaction Reference (for card, transfer, qr) -->
              <div v-if="['card', 'transfer', 'qr'].includes(paymentForm.payment_method)">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Referencia de Transacción
                  <span class="text-xs font-normal text-gray-500">(Recomendado)</span>
                </label>
                <input
                  v-model="paymentForm.transaction_reference"
                  type="text"
                  maxlength="100"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="getReferencePlaceholder(paymentForm.payment_method)"
                />
                <p class="text-xs text-gray-500 mt-1">
                  {{ getReferenceHelpText(paymentForm.payment_method) }}
                </p>
              </div>

              <div class="col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  v-model="paymentForm.notes"
                  rows="3"
                  class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales (opcional)"
                ></textarea>
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button
                type="button"
                @click="closePaymentModal"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ submitting ? 'Guardando...' : 'Registrar Pago' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCreditStore } from '@/stores/credit'
import { useCustomerStore } from '@/stores/customer'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'

const creditStore = useCreditStore()
const customerStore = useCustomerStore()
const authStore = useAuthStore()

const loading = ref(false)
const submitting = ref(false)
const showDetailsModal = ref(false)
const showPaymentModal = ref(false)
const selectedPayment = ref(null)

const filters = ref({
  customer_id: '',
  date_from: '',
  date_to: '',
  page: 1
})

const paymentForm = ref({
  customer_id: '',
  branch_id: null,
  amount: 0,
  payment_method: 'cash',
  transaction_reference: '',
  notes: '',
  allocation_type: 'fifo'
})

const payments = computed(() => creditStore.payments || [])
const customers = computed(() => customerStore.customers || [])
const pagination = computed(() => creditStore.pagination || { total: 0, current_page: 1, last_page: 1, per_page: 20 })

onMounted(async () => {
  await loadPayments()
  await loadCustomers()

  // Set default branch from auth
  if (authStore.user?.branch_id) {
    paymentForm.value.branch_id = authStore.user.branch_id
  }
})

const loadPayments = async () => {
  loading.value = true
  try {
    await creditStore.fetchPayments(filters.value)
  } catch (error) {
    toast.error('Error al cargar los pagos')
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
  loadPayments()
}

const clearFilters = () => {
  filters.value = {
    customer_id: '',
    date_from: '',
    date_to: '',
    page: 1
  }
  loadPayments()
}

const changePage = (page) => {
  filters.value.page = page
  loadPayments()
}

const openPaymentModal = () => {
  paymentForm.value = {
    customer_id: '',
    branch_id: authStore.user?.branch_id || null,
    amount: 0,
    payment_method: 'cash',
    transaction_reference: '',
    notes: '',
    allocation_type: 'fifo'
  }
  showPaymentModal.value = true
}

const closePaymentModal = () => {
  showPaymentModal.value = false
}

const submitPayment = async () => {
  submitting.value = true
  try {
    await creditStore.createPayment(paymentForm.value)
    toast.success('Pago registrado exitosamente')
    closePaymentModal()
    loadPayments()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Error al registrar el pago')
  } finally {
    submitting.value = false
  }
}

const viewPaymentDetails = async (payment) => {
  try {
    const details = await creditStore.fetchPaymentById(payment.id)
    selectedPayment.value = details
    showDetailsModal.value = true
  } catch (error) {
    toast.error('Error al cargar los detalles del pago')
  }
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedPayment.value = null
}

const downloadReceipt = async (paymentId) => {
  try {
    await creditStore.downloadReceipt(paymentId)
    toast.success('Recibo descargado exitosamente')
  } catch (error) {
    toast.error('Error al descargar el recibo')
  }
}

const formatDateTime = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd/MM/yyyy HH:mm')
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    check: 'Cheque',
    qr: 'QR'
  }
  return labels[method] || method
}

const getPaymentMethodBadge = (method) => {
  const badges = {
    cash: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    card: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
    transfer: 'px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800',
    check: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
    qr: 'px-2 py-1 text-xs font-semibold rounded-full bg-pink-100 text-pink-800'
  }
  return badges[method] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}

// Transaction reference helper functions
const getReferencePlaceholder = (method) => {
  const placeholders = {
    card: 'Ej: AUTH-123456, últimos 4 dígitos',
    transfer: 'Ej: TRANSF-789012, número de operación',
    qr: 'Ej: QR-345678, ID de transacción'
  }
  return placeholders[method] || 'Número de referencia'
}

const getReferenceHelpText = (method) => {
  const helpTexts = {
    card: 'Ingresa el código de autorización o los últimos 4 dígitos de la tarjeta',
    transfer: 'Ingresa el número de operación o referencia del banco',
    qr: 'Ingresa el ID de transacción o referencia del sistema QR'
  }
  return helpTexts[method] || 'Ingresa la referencia de la transacción para fines de auditoría'
}
</script>

<style scoped>
.payments-page {
  padding: 1.5rem;
}
</style>
