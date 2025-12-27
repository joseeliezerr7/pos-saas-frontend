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
            Venta #{{ sale?.sale_number }}
          </h1>
          <p class="text-gray-600 mt-1">{{ formatDate(sale?.sold_at) }}</p>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          v-if="!sale?.has_invoice"
          @click="generateInvoice"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Generar Factura
        </button>
        <button
          v-else
          @click="router.push(`/invoices/${sale.invoice?.id}`)"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Ver Factura
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando venta...</p>
    </div>

    <!-- Sale Content -->
    <div v-else-if="sale" class="space-y-6">
      <!-- Status Badge -->
      <div v-if="sale.status === 'voided'" class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Venta Anulada</h3>
            <p class="text-sm text-red-700">{{ sale.void_reason }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sale Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información de Venta</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Número de Venta</dt>
              <dd class="text-base text-gray-900">{{ sale.sale_number }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha</dt>
              <dd class="text-base text-gray-900">{{ formatDate(sale.sold_at) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Método de Pago</dt>
              <dd class="text-base text-gray-900">{{ getPaymentMethodLabel(sale.payment_method) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Estado</dt>
              <dd>
                <span
                  :class="getStatusClass(sale.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusLabel(sale.status) }}
                </span>
              </dd>
            </div>
            <div v-if="sale.has_invoice">
              <dt class="text-sm font-medium text-gray-500">Factura</dt>
              <dd class="text-base text-green-600 font-medium">Facturada</dd>
            </div>
          </dl>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información del Cliente</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Nombre</dt>
              <dd class="text-base text-gray-900">{{ sale.customer_name || 'Cliente General' }}</dd>
            </div>
            <div v-if="sale.customer_rtn">
              <dt class="text-sm font-medium text-gray-500">RTN</dt>
              <dd class="text-base text-gray-900">{{ sale.customer_rtn }}</dd>
            </div>
            <div v-if="sale.customer?.email">
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="text-base text-gray-900">{{ sale.customer.email }}</dd>
            </div>
            <div v-if="sale.customer?.phone">
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="text-base text-gray-900">{{ sale.customer.phone }}</dd>
            </div>
            <div v-if="sale.customer?.address">
              <dt class="text-sm font-medium text-gray-500">Dirección</dt>
              <dd class="text-base text-gray-900">{{ sale.customer.address }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Sale Items -->
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
              <tr v-for="item in sale.details" :key="item.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ item.product_name }}</div>
                  <div class="text-xs text-gray-500">{{ item.product?.code }}</div>
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">{{ item.quantity }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">L {{ formatMoney(item.unit_price) }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">L {{ formatMoney(item.discount) }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  L {{ formatMoney(item.tax_amount) }}
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
            <span class="font-medium text-gray-900">L {{ formatMoney(sale.subtotal) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Descuento:</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(sale.discount) }}</span>
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Impuesto:</span>
            <span class="font-medium text-gray-900">L {{ formatMoney(sale.tax) }}</span>
          </div>
          <div class="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold">
            <span class="text-gray-900">Total:</span>
            <span class="text-gray-900">L {{ formatMoney(sale.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSaleStore } from '@/stores/sale'
import { useInvoiceStore } from '@/stores/invoice'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'vue3-toastify'

const router = useRouter()
const route = useRoute()
const saleStore = useSaleStore()
const invoiceStore = useInvoiceStore()

const sale = computed(() => saleStore.currentSale)
const loading = computed(() => saleStore.loading)

onMounted(() => {
  loadSale()
})

async function loadSale() {
  const id = route.params.id
  await saleStore.fetchSaleById(id)
  console.log('Sale loaded:', sale.value)
  console.log('Sale details:', sale.value?.details)
}

async function generateInvoice() {
  try {
    const invoice = await invoiceStore.createInvoice({
      sale_id: sale.value.id
    })
    toast.success('Factura generada exitosamente')
    router.push(`/invoices/${invoice.id}`)
  } catch (error) {
    console.error('Error generating invoice:', error)
  }
}

function formatDate(date) {
  if (!date) return '-'
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: es })
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function getPaymentMethodLabel(method) {
  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit: 'Crédito'
  }
  return labels[method] || method
}

function getStatusClass(status) {
  const classes = {
    completed: 'bg-green-100 text-green-800',
    voided: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status) {
  const labels = {
    completed: 'Completada',
    voided: 'Anulada',
    pending: 'Pendiente'
  }
  return labels[status] || status
}
</script>
