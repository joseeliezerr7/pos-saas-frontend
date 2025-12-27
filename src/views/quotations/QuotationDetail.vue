<template>
  <div class="p-6">
    <!-- Header with actions -->
    <div class="mb-6 flex justify-between items-center no-print">
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
            Cotización #{{ quotation?.quotation_number }}
          </h1>
          <p class="text-gray-600 mt-1">{{ formatDate(quotation?.quoted_at) }}</p>
        </div>
      </div>

      <div class="flex gap-3">
        <!-- Convert to Sale -->
        <button
          v-if="quotation?.status === 'pending' && !quotation?.sale_id"
          @click="handleConvertClick"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Convertir a Venta
        </button>

        <!-- View Sale if converted -->
        <router-link
          v-if="quotation?.sale_id"
          :to="`/sales/${quotation.sale_id}`"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver Venta
        </router-link>

        <!-- Edit -->
        <router-link
          v-if="!quotation?.sale_id"
          :to="`/quotations/${quotation?.id}/edit`"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Editar
        </router-link>

        <!-- Print -->
        <button
          @click="printQuotation"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando cotización...</p>
    </div>

    <!-- Quotation Content -->
    <div v-else-if="quotation" class="space-y-6">
      <!-- Status Badge -->
      <div v-if="quotation.status !== 'pending'" class="p-4 rounded-lg no-print" :class="getStatusBgClass(quotation.status)">
        <div class="flex items-center">
          <svg class="w-6 h-6 mr-3" :class="getStatusIconClass(quotation.status)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold" :class="getStatusTextClass(quotation.status)">
              {{ getStatusLabel(quotation.status) }}
            </h3>
            <p class="text-sm" :class="getStatusTextClass(quotation.status)">
              {{ getStatusDescription(quotation.status) }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        <!-- Quotation Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información de Cotización</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Número de Cotización</dt>
              <dd class="text-base text-gray-900">{{ quotation.quotation_number }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Cotización</dt>
              <dd class="text-base text-gray-900">{{ formatDate(quotation.quoted_at) }}</dd>
            </div>
            <div v-if="quotation.valid_until">
              <dt class="text-sm font-medium text-gray-500">Válida Hasta</dt>
              <dd class="text-base text-gray-900">{{ formatDate(quotation.valid_until) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Estado</dt>
              <dd>
                <span
                  :class="getStatusClass(quotation.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusLabel(quotation.status) }}
                </span>
              </dd>
            </div>
            <div v-if="quotation.sale_id">
              <dt class="text-sm font-medium text-gray-500">Venta Generada</dt>
              <dd class="text-base text-green-600 font-medium">#{{ quotation.sale?.sale_number }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Vendedor</dt>
              <dd class="text-base text-gray-900">{{ quotation.user?.name }}</dd>
            </div>
          </dl>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información del Cliente</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Nombre</dt>
              <dd class="text-base text-gray-900">{{ quotation.customer_name }}</dd>
            </div>
            <div v-if="quotation.customer_rtn">
              <dt class="text-sm font-medium text-gray-500">RTN / Identificación</dt>
              <dd class="text-base text-gray-900">{{ quotation.customer_rtn }}</dd>
            </div>
            <div v-if="quotation.customer_email">
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="text-base text-gray-900">{{ quotation.customer_email }}</dd>
            </div>
            <div v-if="quotation.customer_phone">
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="text-base text-gray-900">{{ quotation.customer_phone }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden no-print">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Productos Cotizados</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Impuesto</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="detail in quotation.details" :key="detail.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ detail.product_name }}</div>
                </td>
                <td class="px-6 py-4 text-center whitespace-nowrap text-sm text-gray-900">
                  {{ detail.quantity }}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900">
                  L {{ formatCurrency(detail.price) }}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap text-sm text-red-600">
                  {{ detail.discount > 0 ? `- L ${formatCurrency(detail.discount)}` : '-' }}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap text-sm text-gray-900">
                  L {{ formatCurrency(detail.tax_amount || 0) }}
                </td>
                <td class="px-6 py-4 text-right whitespace-nowrap text-sm font-medium text-gray-900">
                  L {{ formatCurrency(detail.subtotal) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals & Notes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        <!-- Notes -->
        <div v-if="quotation.notes" class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Notas y Condiciones</h2>
          <p class="text-gray-700 whitespace-pre-line">{{ quotation.notes }}</p>
        </div>

        <!-- Totals -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Resumen de Totales</h2>
          <dl class="space-y-2">
            <div class="flex justify-between text-base">
              <dt class="text-gray-600">Subtotal:</dt>
              <dd class="font-medium">L {{ formatCurrency(quotation.subtotal) }}</dd>
            </div>
            <div v-if="quotation.discount > 0" class="flex justify-between text-base">
              <dt class="text-gray-600">Descuento:</dt>
              <dd class="font-medium text-red-600">- L {{ formatCurrency(quotation.discount) }}</dd>
            </div>
            <div class="flex justify-between text-base">
              <dt class="text-gray-600">Impuestos:</dt>
              <dd class="font-medium">L {{ formatCurrency(quotation.tax) }}</dd>
            </div>
            <div class="border-t pt-3 flex justify-between text-2xl font-bold">
              <dt>Total:</dt>
              <dd class="text-primary-600">L {{ formatCurrency(quotation.total) }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>

    <!-- Print-only Ticket Format -->
    <div v-if="quotation" class="hidden print:block print-ticket-content">
      <div class="print-header">
        <h1>COTIZACIÓN</h1>
        <div>#{{ quotation.quotation_number }}</div>
        <div>{{ formatDate(quotation.quoted_at) }}</div>
      </div>

      <div class="print-section">
        <div class="print-row">
          <span class="print-label">Cliente:</span>
          <span>{{ quotation.customer_name }}</span>
        </div>
        <div v-if="quotation.customer_rtn" class="print-row">
          <span class="print-label">RTN:</span>
          <span>{{ quotation.customer_rtn }}</span>
        </div>
        <div v-if="quotation.customer_phone" class="print-row">
          <span class="print-label">Tel:</span>
          <span>{{ quotation.customer_phone }}</span>
        </div>
        <div v-if="quotation.valid_until" class="print-row">
          <span class="print-label">Válida hasta:</span>
          <span>{{ formatDate(quotation.valid_until) }}</span>
        </div>
      </div>

      <div class="print-items">
        <div v-for="detail in quotation.details" :key="detail.id" class="print-item">
          <div class="print-item-name">{{ detail.product_name }}</div>
          <div class="print-item-details">
            <span>{{ detail.quantity }} x L {{ formatCurrency(detail.price) }}</span>
            <span>L {{ formatCurrency(detail.subtotal + (detail.tax_amount || 0)) }}</span>
          </div>
          <div v-if="detail.discount > 0" class="print-item-details">
            <span>Descuento:</span>
            <span>- L {{ formatCurrency(detail.discount) }}</span>
          </div>
        </div>
      </div>

      <div class="print-totals">
        <div class="print-total-row">
          <span>Subtotal:</span>
          <span>L {{ formatCurrency(quotation.subtotal) }}</span>
        </div>
        <div v-if="quotation.discount > 0" class="print-total-row">
          <span>Descuento:</span>
          <span>- L {{ formatCurrency(quotation.discount) }}</span>
        </div>
        <div class="print-total-row">
          <span>Impuestos:</span>
          <span>L {{ formatCurrency(quotation.tax) }}</span>
        </div>
        <div class="print-total-row grand-total">
          <span>TOTAL:</span>
          <span>L {{ formatCurrency(quotation.total) }}</span>
        </div>
      </div>

      <div v-if="quotation.notes" class="print-section">
        <div class="print-label">Notas:</div>
        <div style="font-size: 8pt; white-space: pre-wrap;">{{ quotation.notes }}</div>
      </div>

      <div class="print-footer">
        <div>Vendedor: {{ quotation.user?.name }}</div>
        <div style="margin-top: 3mm;">¡Gracias por su preferencia!</div>
      </div>
    </div>

    <!-- Convert to Sale Modal -->
    <div v-if="showConvertModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center no-print">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Convertir a Venta</h3>
        <p class="text-gray-600 mb-4">
          ¿Estás seguro de convertir esta cotización en una venta? Esta acción no se puede deshacer.
        </p>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
          <select v-model="convertForm.payment_method" class="input w-full" required>
            <option value="">Selecciona método</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="credit">Crédito</option>
            <option value="qr">QR/Digital</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>

        <div class="flex gap-3">
          <button
            @click="handleConvertToSale"
            :disabled="!convertForm.payment_method || converting"
            class="btn-primary flex-1"
          >
            {{ converting ? 'Convirtiendo...' : 'Confirmar' }}
          </button>
          <button
            @click="showConvertModal = false"
            :disabled="converting"
            class="btn-secondary flex-1"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuotationStore } from '@/stores/quotation'
import { useCashRegisterStore } from '@/stores/cashRegister'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'vue3-toastify'

const router = useRouter()
const route = useRoute()
const quotationStore = useQuotationStore()
const cashRegisterStore = useCashRegisterStore()
const authStore = useAuthStore()

const { loading } = storeToRefs(quotationStore)
const { currentOpening } = storeToRefs(cashRegisterStore)
const quotation = ref(null)
const showConvertModal = ref(false)
const converting = ref(false)
const convertForm = ref({
  payment_method: '',
  cash_opening_id: null
})

onMounted(async () => {
  await loadQuotation()
  await loadCurrentOpening()
})

async function loadQuotation() {
  quotation.value = await quotationStore.fetchQuotationById(route.params.id)
}

async function loadCurrentOpening() {
  try {
    // First fetch all cash registers
    await cashRegisterStore.fetchCashRegisters()
    console.log('Cash registers loaded:', cashRegisterStore.cashRegisters)

    // Then try to find one with an active opening
    if (cashRegisterStore.cashRegisters && cashRegisterStore.cashRegisters.length > 0) {
      console.log(`Checking ${cashRegisterStore.cashRegisters.length} cash registers for active opening...`)

      for (const register of cashRegisterStore.cashRegisters) {
        console.log(`Checking register ${register.id} - ${register.name}`)
        try {
          await cashRegisterStore.fetchCurrentOpening(register.id)
          console.log(`After fetch for register ${register.id}, currentOpening:`, cashRegisterStore.currentOpening)

          // If we found an active opening, stop searching
          if (cashRegisterStore.currentOpening && cashRegisterStore.currentOpening.is_open) {
            console.log('✓ Found active cash register opening:', cashRegisterStore.currentOpening)
            return
          } else {
            console.log(`✗ Register ${register.id} - No active opening or is_open is false`)
          }
        } catch (err) {
          console.log(`✗ Register ${register.id} - Error:`, err.response?.status)
          // If 404, continue with next register
          continue
        }
      }
    }
    console.log('❌ No active cash register opening found in any register')
  } catch (error) {
    // Silently handle - user will see error when trying to convert
    console.log('Error loading cash register:', error)
  }
}

function handleConvertClick() {
  // Set cash_opening_id if available, otherwise backend will handle the error
  convertForm.value.cash_opening_id = currentOpening.value?.id || null
  showConvertModal.value = true
}

async function handleConvertToSale() {
  converting.value = true
  try {
    await quotationStore.convertToSale(quotation.value.id, convertForm.value)
    showConvertModal.value = false
    await loadQuotation()
  } catch (error) {
    console.error('Error converting to sale:', error)
  } finally {
    converting.value = false
  }
}

function printQuotation() {
  window.print()
}

function formatDate(date) {
  if (!date) return ''
  return format(new Date(date), "d 'de' MMMM 'de' yyyy", { locale: es })
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}

function getStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    accepted: 'Aceptada',
    rejected: 'Rechazada',
    expired: 'Expirada',
    converted: 'Convertida a Venta'
  }
  return labels[status] || status
}

function getStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    converted: 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusBgClass(status) {
  const classes = {
    accepted: 'bg-green-50 border-l-4 border-green-400',
    rejected: 'bg-red-50 border-l-4 border-red-400',
    expired: 'bg-gray-50 border-l-4 border-gray-400',
    converted: 'bg-blue-50 border-l-4 border-blue-400'
  }
  return classes[status] || 'bg-gray-50 border-l-4 border-gray-400'
}

function getStatusIconClass(status) {
  const classes = {
    accepted: 'text-green-400',
    rejected: 'text-red-400',
    expired: 'text-gray-400',
    converted: 'text-blue-400'
  }
  return classes[status] || 'text-gray-400'
}

function getStatusTextClass(status) {
  const classes = {
    accepted: 'text-green-800',
    rejected: 'text-red-800',
    expired: 'text-gray-800',
    converted: 'text-blue-800'
  }
  return classes[status] || 'text-gray-800'
}

function getStatusDescription(status) {
  const descriptions = {
    accepted: 'El cliente ha aceptado esta cotización',
    rejected: 'El cliente ha rechazado esta cotización',
    expired: 'Esta cotización ha expirado',
    converted: 'Esta cotización fue convertida en una venta'
  }
  return descriptions[status] || ''
}
</script>

<style scoped>
@media print {
  /* Hide screen content, show only ticket */
  .p-6 > *:not(.print-ticket-content) {
    display: none !important;
  }

  .print-ticket-content {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 80mm;
    margin: 0;
    padding: 5mm;
    font-family: 'Courier New', monospace;
    font-size: 10pt;
  }

  /* Reset page margins */
  @page {
    margin: 0;
    size: 80mm auto;
  }

  body {
    margin: 0;
    padding: 0;
  }

  /* Hide non-printable elements */
  .no-print {
    display: none !important;
  }

  /* Ticket styles */
  .print-header {
    text-align: center;
    margin-bottom: 3mm;
    border-bottom: 1px dashed #000;
    padding-bottom: 3mm;
  }

  .print-header h1 {
    font-size: 14pt;
    font-weight: bold;
    margin: 0 0 2mm 0;
  }

  .print-section {
    margin: 3mm 0;
    border-bottom: 1px dashed #000;
    padding-bottom: 3mm;
  }

  .print-row {
    display: flex;
    justify-content: space-between;
    margin: 1mm 0;
    font-size: 9pt;
  }

  .print-label {
    font-weight: bold;
  }

  .print-items {
    margin: 3mm 0;
  }

  .print-item {
    margin: 2mm 0;
    font-size: 9pt;
  }

  .print-item-name {
    font-weight: bold;
    margin-bottom: 1mm;
  }

  .print-item-details {
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
  }

  .print-totals {
    margin-top: 3mm;
    border-top: 1px dashed #000;
    padding-top: 3mm;
  }

  .print-total-row {
    display: flex;
    justify-content: space-between;
    margin: 1mm 0;
    font-size: 10pt;
  }

  .print-total-row.grand-total {
    font-size: 12pt;
    font-weight: bold;
    border-top: 2px solid #000;
    padding-top: 2mm;
    margin-top: 2mm;
  }

  .print-footer {
    text-align: center;
    margin-top: 5mm;
    font-size: 8pt;
    border-top: 1px dashed #000;
    padding-top: 3mm;
  }

  /* Remove colors for printing */
  * {
    color: #000 !important;
    background: #fff !important;
  }
}
</style>
