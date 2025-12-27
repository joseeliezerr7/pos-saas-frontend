<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Facturas</h1>
        <p class="text-gray-600 mt-1">Gestión de facturas fiscales</p>
      </div>
      <button
        @click="openGenerateModal"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Generar Factura
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Número, CAI, cliente..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedSearch"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          >
            <option value="">Todos</option>
            <option value="active">Activas</option>
            <option value="voided">Anuladas</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="applyFilters"
          />
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">Cargando facturas...</p>
      </div>

      <div v-else-if="invoices.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg">No hay facturas registradas</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAI</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ invoice.invoice_number }}</div>
              <div class="text-xs text-gray-500">{{ invoice.invoice_series }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ invoice.cai }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ invoice.customer?.name || 'Cliente General' }}</div>
              <div class="text-xs text-gray-500">{{ invoice.customer?.rtn || 'Sin RTN' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(invoice.invoice_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-semibold text-gray-900">L {{ formatMoney(invoice.total) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="getStatusClass(invoice.status)"
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ getStatusLabel(invoice.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex gap-2">
                <button
                  @click="viewInvoice(invoice)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Ver detalles"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  @click="downloadInvoicePDF(invoice)"
                  class="text-green-600 hover:text-green-900"
                  title="Descargar PDF"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
                <button
                  @click="showEmailModal(invoice)"
                  class="text-purple-600 hover:text-purple-900"
                  title="Enviar por correo"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  v-if="invoice.status === 'active' && can('void_invoices')"
                  @click="showVoidModal(invoice)"
                  class="text-red-600 hover:text-red-900"
                  title="Anular factura"
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

      <!-- Pagination -->
      <div v-if="invoices.length > 0" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }} a {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de {{ pagination.total }} facturas
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Generate Invoice Modal -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold mb-4">Generar Factura desde Venta</h2>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar Venta</label>
          <input
            v-model="saleSearchTerm"
            type="text"
            placeholder="Número de venta, cliente..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="searchSales"
          />
        </div>

        <div v-if="loadingSales" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="availableSales.length === 0" class="text-center py-4 text-gray-500">
          No hay ventas sin facturar
        </div>

        <div v-else class="space-y-2 mb-4">
          <div
            v-for="sale in availableSales"
            :key="sale.id"
            @click="selectSale(sale)"
            :class="selectedSale?.id === sale.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'"
            class="border-2 rounded-lg p-3 cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-semibold text-gray-900">Venta #{{ sale.id }}</div>
                <div class="text-sm text-gray-600">{{ sale.customer?.name || 'Cliente General' }}</div>
                <div class="text-xs text-gray-500">{{ formatDate(sale.created_at) }}</div>
              </div>
              <div class="text-right">
                <div class="font-bold text-gray-900">L {{ formatMoney(sale.total) }}</div>
                <span class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  {{ sale.payment_method }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="closeGenerateModal"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="generateInvoice"
            :disabled="!selectedSale"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Generar Factura
          </button>
        </div>
      </div>
    </div>

    <!-- Void Invoice Modal -->
    <div v-if="showVoidConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4 text-red-600">Anular Factura</h2>
        <p class="text-gray-700 mb-4">
          ¿Está seguro que desea anular la factura <strong>{{ selectedInvoice?.invoice_number }}</strong>?
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Motivo de Anulación *</label>
          <textarea
            v-model="voidReason"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Ingrese el motivo de la anulación..."
          ></textarea>
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeVoidModal"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="confirmVoid"
            :disabled="!voidReason.trim()"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anular Factura
          </button>
        </div>
      </div>
    </div>

    <!-- Send Email Modal -->
    <div v-if="showEmailConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Enviar Factura por Correo</h2>
        <p class="text-gray-700 mb-4">
          Enviar factura <strong>{{ selectedInvoice?.invoice_number }}</strong>
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
          <input
            v-model="emailAddress"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="selectedInvoice?.customer?.email || 'correo@ejemplo.com'"
          />
        </div>

        <div class="flex justify-end gap-3">
          <button
            @click="closeEmailModal"
            class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            @click="confirmSendEmail"
            :disabled="!emailAddress.trim()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { useSaleStore } from '@/stores/sale'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const invoiceStore = useInvoiceStore()
const saleStore = useSaleStore()
const { can } = usePermissions()

const invoices = computed(() => invoiceStore.invoices)
const loading = computed(() => invoiceStore.loading)
const pagination = computed(() => invoiceStore.pagination)

const filters = ref({
  search: '',
  status: '',
  date_from: '',
  date_to: ''
})

const showGenerateModal = ref(false)
const showVoidConfirm = ref(false)
const showEmailConfirm = ref(false)
const selectedInvoice = ref(null)
const selectedSale = ref(null)
const voidReason = ref('')
const emailAddress = ref('')
const saleSearchTerm = ref('')
const availableSales = ref([])
const loadingSales = ref(false)

let searchTimeout = null

onMounted(() => {
  loadInvoices()
})

async function loadInvoices() {
  const params = {
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    ...filters.value
  }
  await invoiceStore.fetchInvoices(params)
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

function applyFilters() {
  pagination.value.current_page = 1
  loadInvoices()
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page
    loadInvoices()
  }
}

function viewInvoice(invoice) {
  router.push(`/invoices/${invoice.id}`)
}

async function downloadInvoicePDF(invoice) {
  await invoiceStore.downloadPDF(invoice.id, invoice.invoice_number)
}

function showVoidModal(invoice) {
  selectedInvoice.value = invoice
  voidReason.value = ''
  showVoidConfirm.value = true
}

function closeVoidModal() {
  showVoidConfirm.value = false
  selectedInvoice.value = null
  voidReason.value = ''
}

async function confirmVoid() {
  if (!voidReason.value.trim()) return

  const success = await invoiceStore.voidInvoice(selectedInvoice.value.id, voidReason.value)
  if (success) {
    closeVoidModal()
    loadInvoices()
  }
}

function showEmailModal(invoice) {
  selectedInvoice.value = invoice
  emailAddress.value = invoice.customer?.email || ''
  showEmailConfirm.value = true
}

function closeEmailModal() {
  showEmailConfirm.value = false
  selectedInvoice.value = null
  emailAddress.value = ''
}

async function confirmSendEmail() {
  if (!emailAddress.value.trim()) return

  const success = await invoiceStore.sendEmail(selectedInvoice.value.id, emailAddress.value)
  if (success) {
    closeEmailModal()
  }
}

async function searchSales() {
  loadingSales.value = true
  try {
    const params = {
      search: saleSearchTerm.value,
      without_invoice: true,
      per_page: 10
    }
    await saleStore.fetchSales(params)
    availableSales.value = saleStore.sales
  } catch (error) {
    console.error('Error searching sales:', error)
  } finally {
    loadingSales.value = false
  }
}

function selectSale(sale) {
  selectedSale.value = sale
}

async function generateInvoice() {
  if (!selectedSale.value) return

  try {
    const invoice = await invoiceStore.createInvoice({
      sale_id: selectedSale.value.id
    })
    closeGenerateModal()
    router.push(`/invoices/${invoice.id}`)
  } catch (error) {
    console.error('Error generating invoice:', error)
  }
}

function closeGenerateModal() {
  showGenerateModal.value = false
  selectedSale.value = null
  saleSearchTerm.value = ''
  availableSales.value = []
}

async function openGenerateModal() {
  showGenerateModal.value = true
  loadingSales.value = true
  try {
    const params = {
      without_invoice: true,
      per_page: 10
    }
    await saleStore.fetchSales(params)
    availableSales.value = saleStore.sales
  } catch (error) {
    console.error('Error loading sales:', error)
  } finally {
    loadingSales.value = false
  }
}

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd MMM yyyy', { locale: es })
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function getStatusClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-800',
    voided: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status) {
  const labels = {
    active: 'Activa',
    voided: 'Anulada'
  }
  return labels[status] || status
}
</script>
