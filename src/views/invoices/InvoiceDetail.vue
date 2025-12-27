<template>
  <div class="p-6">
    <!-- Header with actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="text-gray-600 hover:text-gray-900"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Factura {{ invoice?.invoice_number }}
          </h1>
          <p class="text-gray-600 mt-1">{{ invoice?.invoice_series }}</p>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          @click="downloadPDF"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar PDF
        </button>
        <button
          @click="showEmailModal = true"
          class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Enviar Email
        </button>
        <button
          v-if="invoice?.status === 'active'"
          @click="showVoidModal = true"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Anular
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando factura...</p>
    </div>

    <!-- Invoice Content -->
    <div v-else-if="invoice" class="space-y-6">
      <!-- Status Badge -->
      <div v-if="invoice.status === 'voided'" class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Factura Anulada</h3>
            <p class="text-sm text-red-700">{{ invoice.void_reason }}</p>
            <p class="text-xs text-red-600 mt-1">Anulada el {{ formatDate(invoice.voided_at) }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Invoice Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información de Factura</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Número de Factura</dt>
              <dd class="text-base text-gray-900">{{ invoice.invoice_number }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Serie</dt>
              <dd class="text-base text-gray-900">{{ invoice.invoice_series }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">CAI</dt>
              <dd class="text-base text-gray-900 font-mono">{{ invoice.cai }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Emisión</dt>
              <dd class="text-base text-gray-900">{{ formatDate(invoice.invoice_date) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha Límite CAI</dt>
              <dd class="text-base text-gray-900">{{ formatDate(invoice.cai_expiration) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Estado</dt>
              <dd>
                <span
                  :class="getStatusClass(invoice.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusLabel(invoice.status) }}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información del Cliente</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Nombre</dt>
              <dd class="text-base text-gray-900">{{ invoice.customer?.name || 'Cliente General' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">RTN</dt>
              <dd class="text-base text-gray-900">{{ invoice.customer?.rtn || 'Sin RTN' }}</dd>
            </div>
            <div v-if="invoice.customer?.email">
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="text-base text-gray-900">{{ invoice.customer.email }}</dd>
            </div>
            <div v-if="invoice.customer?.phone">
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="text-base text-gray-900">{{ invoice.customer.phone }}</dd>
            </div>
            <div v-if="invoice.customer?.address">
              <dt class="text-sm font-medium text-gray-500">Dirección</dt>
              <dd class="text-base text-gray-900">{{ invoice.customer.address }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Invoice Items -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Detalle de Productos</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Impuesto</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in invoice.items" :key="item.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ item.product_name }}</div>
                  <div class="text-xs text-gray-500">{{ item.product_code }}</div>
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">{{ item.quantity }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">L {{ formatMoney(item.price) }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">L {{ formatMoney(item.discount) }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  L {{ formatMoney(item.tax) }}
                  <div class="text-xs text-gray-500">{{ item.tax_rate }}%</div>
                </td>
                <td class="px-6 py-4 text-right text-sm font-semibold text-gray-900">L {{ formatMoney(item.total) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="max-w-md ml-auto space-y-3">
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Subtotal:</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(invoice.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Descuento:</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(invoice.discount) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Subtotal Gravado:</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(invoice.taxable_subtotal) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Subtotal Exento:</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(invoice.exempt_subtotal) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">ISV (15%):</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(invoice.tax) }}</span>
          </div>
          <div class="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
            <span class="text-gray-900">Total:</span>
            <span class="text-gray-900">L {{ formatMoney(invoice.total) }}</span>
          </div>
        </div>
      </div>

      <!-- Sale Reference -->
      <div v-if="invoice.sale" class="bg-blue-50 rounded-lg p-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-medium text-blue-900">Venta Relacionada</h3>
            <p class="text-sm text-blue-700">Venta #{{ invoice.sale.id }} - {{ formatDate(invoice.sale.created_at) }}</p>
          </div>
          <button
            @click="router.push(`/sales/${invoice.sale.id}`)"
            class="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            Ver Venta →
          </button>
        </div>
      </div>
    </div>

    <!-- Send Email Modal -->
    <div v-if="showEmailModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4">Enviar Factura por Correo</h2>
        <p class="text-gray-700 mb-4">
          Enviar factura <strong>{{ invoice?.invoice_number }}</strong>
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
          <input
            v-model="emailAddress"
            type="email"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            :placeholder="invoice?.customer?.email || 'correo@ejemplo.com'"
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

    <!-- Void Invoice Modal -->
    <div v-if="showVoidModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-2xl font-bold mb-4 text-red-600">Anular Factura</h2>
        <p class="text-gray-700 mb-4">
          ¿Está seguro que desea anular la factura <strong>{{ invoice?.invoice_number }}</strong>?
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useInvoiceStore } from '@/stores/invoice'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const router = useRouter()
const route = useRoute()
const invoiceStore = useInvoiceStore()

const invoice = computed(() => invoiceStore.currentInvoice)
const loading = computed(() => invoiceStore.loading)

const showEmailModal = ref(false)
const showVoidModal = ref(false)
const emailAddress = ref('')
const voidReason = ref('')

onMounted(() => {
  loadInvoice()
})

async function loadInvoice() {
  const id = route.params.id
  await invoiceStore.fetchInvoiceById(id)
  if (invoice.value?.customer?.email) {
    emailAddress.value = invoice.value.customer.email
  }
}

async function downloadPDF() {
  await invoiceStore.downloadPDF(invoice.value.id, invoice.value.invoice_number)
}

function closeEmailModal() {
  showEmailModal.value = false
}

async function confirmSendEmail() {
  if (!emailAddress.value.trim()) return

  const success = await invoiceStore.sendEmail(invoice.value.id, emailAddress.value)
  if (success) {
    closeEmailModal()
  }
}

function closeVoidModal() {
  showVoidModal.value = false
  voidReason.value = ''
}

async function confirmVoid() {
  if (!voidReason.value.trim()) return

  const success = await invoiceStore.voidInvoice(invoice.value.id, voidReason.value)
  if (success) {
    closeVoidModal()
    await loadInvoice() // Reload to show updated status
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
