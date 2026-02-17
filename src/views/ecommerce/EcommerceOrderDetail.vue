<template>
  <div class="space-y-6">
    <!-- Modal de Confirmación -->
    <Teleport to="body">
      <div v-if="showConvertModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
          <!-- Overlay -->
          <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="showConvertModal = false"></div>

          <!-- Modal -->
          <div class="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
            <div class="sm:flex sm:items-start">
              <div class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-green-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg font-medium leading-6 text-gray-900">Convertir a Venta POS</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Estás seguro de convertir el pedido <strong>#{{ order?.order_number }}</strong> a una venta en el POS?
                    Esta acción registrará la venta en el sistema.
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                :disabled="converting"
                @click="confirmConvertToSale"
                class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                <svg v-if="converting" class="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {{ converting ? 'Convirtiendo...' : 'Sí, convertir' }}
              </button>
              <button
                type="button"
                :disabled="converting"
                @click="showConvertModal = false"
                class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <router-link to="/ecommerce/orders" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Pedido #{{ order?.order_number }}</h1>
          <p class="text-gray-600">{{ formatDate(order?.created_at) }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button
          v-if="order?.status !== 'cancelled' && order?.payment_status === 'paid' && !order?.sale_id"
          @click="convertToSale"
          class="btn-secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Convertir a Venta POS
        </button>
        <button @click="printOrder" class="btn-secondary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="order" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Order Items -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Productos</h2>
          </div>
          <div class="divide-y divide-gray-200">
            <div v-for="item in order.items" :key="item.id" class="p-6 flex gap-4">
              <div class="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="item.product?.image"
                  :src="item.product.image"
                  :alt="item.product_name"
                  class="w-full h-full object-cover"
                />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                  <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <div class="flex-1">
                <h3 class="font-medium text-gray-900">{{ item.product_name }}</h3>
                <p v-if="item.variant_name" class="text-sm text-gray-500">{{ item.variant_name }}</p>
                <p class="text-sm text-gray-500">SKU: {{ item.product?.sku || 'N/A' }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">{{ formatCurrency(item.subtotal) }}</p>
                <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.unit_price) }}</p>
              </div>
            </div>
          </div>
          <div class="p-6 bg-gray-50 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="text-gray-900">{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div v-if="order.discount_amount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600">Descuento</span>
              <span class="text-green-600">-{{ formatCurrency(order.discount_amount) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Impuestos</span>
              <span class="text-gray-900">{{ formatCurrency(order.tax_amount) }}</span>
            </div>
            <div v-if="order.shipping_amount > 0" class="flex justify-between text-sm">
              <span class="text-gray-600">Envio</span>
              <span class="text-gray-900">{{ formatCurrency(order.shipping_amount) }}</span>
            </div>
            <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{{ formatCurrency(order.total) }}</span>
            </div>
          </div>
        </div>

        <!-- Order Notes -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Notas del Pedido</h2>
          </div>
          <div class="p-6">
            <div v-if="order.notes" class="mb-4 p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm text-yellow-800">{{ order.notes }}</p>
            </div>
            <div class="space-y-4">
              <div v-for="note in order.internal_notes || []" :key="note.id" class="p-4 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-800">{{ note.note }}</p>
                <p class="text-xs text-gray-500 mt-2">{{ note.user?.name }} - {{ formatDate(note.created_at) }}</p>
              </div>
            </div>
            <form @submit.prevent="addNote" class="mt-4">
              <textarea
                v-model="newNote"
                rows="3"
                placeholder="Agregar nota interna..."
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <button type="submit" :disabled="!newNote.trim()" class="mt-2 btn-primary text-sm">
                Agregar Nota
              </button>
            </form>
          </div>
        </div>

        <!-- Status History -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Historial de Estado</h2>
          </div>
          <div class="p-6">
            <div class="relative">
              <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div class="space-y-6">
                <div v-for="(history, index) in order.status_history || []" :key="index" class="relative pl-10">
                  <div class="absolute left-2.5 w-3 h-3 rounded-full" :class="index === 0 ? 'bg-blue-600' : 'bg-gray-400'"></div>
                  <div>
                    <p class="font-medium text-gray-900">{{ getStatusLabel(history.status) }}</p>
                    <p v-if="history.notes" class="text-sm text-gray-600">{{ history.notes }}</p>
                    <p class="text-xs text-gray-500">{{ formatDate(history.created_at) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Status Card -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Estado del Pedido</h3>
          <select
            v-model="selectedStatus"
            @change="updateStatus"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-medium"
          >
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <div class="mt-4 flex items-center gap-2">
            <span class="text-sm text-gray-600">Pago:</span>
            <span :class="getPaymentStatusClass(order.payment_status)">
              {{ getPaymentStatusLabel(order.payment_status) }}
            </span>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Cliente</h3>
          <div class="space-y-3">
            <div>
              <p class="font-medium text-gray-900">{{ order.customer?.name || order.customer_name || 'Cliente Anónimo' }}</p>
              <p class="text-sm text-gray-500">{{ order.customer?.email || order.customer_email }}</p>
              <p v-if="order.customer?.phone || order.customer_phone" class="text-sm text-gray-500">{{ order.customer?.phone || order.customer_phone }}</p>
            </div>
            <router-link
              v-if="order.ecommerce_customer_id"
              :to="`/ecommerce/customers/${order.ecommerce_customer_id}`"
              class="text-sm text-blue-600 hover:underline inline-block"
            >
              Ver perfil del cliente
            </router-link>
          </div>
        </div>

        <!-- Shipping Address -->
        <div v-if="order.shipping_address" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Direccion de Envio</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <!-- Handle both structured address and simple address string -->
            <template v-if="typeof order.shipping_address === 'string'">
              <p>{{ order.shipping_address }}</p>
            </template>
            <template v-else-if="order.shipping_address.address">
              <p>{{ order.shipping_address.address }}</p>
              <p v-if="order.shipping_address.notes" class="text-gray-500 italic mt-2">{{ order.shipping_address.notes }}</p>
            </template>
            <template v-else>
              <p v-if="order.shipping_address.name" class="font-medium text-gray-900">{{ order.shipping_address.name }}</p>
              <p v-if="order.shipping_address.address_line_1">{{ order.shipping_address.address_line_1 }}</p>
              <p v-if="order.shipping_address.address_line_2">{{ order.shipping_address.address_line_2 }}</p>
              <p v-if="order.shipping_address.city">{{ order.shipping_address.city }}<template v-if="order.shipping_address.state">, {{ order.shipping_address.state }}</template></p>
              <p v-if="order.shipping_address.postal_code">{{ order.shipping_address.postal_code }}</p>
              <p v-if="order.shipping_address.country">{{ order.shipping_address.country }}</p>
              <p v-if="order.shipping_address.phone" class="mt-2">Tel: {{ order.shipping_address.phone }}</p>
            </template>
          </div>
        </div>

        <!-- Billing Address -->
        <div v-if="order.billing_address" class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Direccion de Facturacion</h3>
          <div class="text-sm text-gray-600 space-y-1">
            <p class="font-medium text-gray-900">{{ order.billing_address.name }}</p>
            <p>{{ order.billing_address.address_line_1 }}</p>
            <p v-if="order.billing_address.address_line_2">{{ order.billing_address.address_line_2 }}</p>
            <p>{{ order.billing_address.city }}, {{ order.billing_address.state }}</p>
            <p>{{ order.billing_address.postal_code }}</p>
          </div>
        </div>

        <!-- Payment Info -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Informacion de Pago</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Metodo:</span>
              <span class="text-gray-900">{{ order.payment_method || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Estado:</span>
              <span :class="getPaymentStatusClass(order.payment_status)">
                {{ getPaymentStatusLabel(order.payment_status) }}
              </span>
            </div>
            <div v-if="order.payment?.transaction_id" class="flex justify-between">
              <span class="text-gray-600">Transaccion:</span>
              <span class="text-gray-900 text-xs">{{ order.payment.transaction_id }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useEcommerceStore } from '@/stores/ecommerce'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'
import ecommerceService from '@/services/ecommerceService'

const route = useRoute()
const ecommerceStore = useEcommerceStore()
const { currentOrder, loading } = storeToRefs(ecommerceStore)

const order = computed(() => currentOrder.value)
const selectedStatus = ref('')
const newNote = ref('')
const showConvertModal = ref(false)
const converting = ref(false)

onMounted(async () => {
  await loadOrder()
})

watch(() => route.params.id, () => {
  loadOrder()
})

const loadOrder = async () => {
  await ecommerceStore.fetchOrder(route.params.id)
  if (order.value) {
    selectedStatus.value = order.value.status
  }
}

const updateStatus = async () => {
  try {
    await ecommerceStore.updateOrderStatus(order.value.id, { status: selectedStatus.value })
    toast.success('Estado actualizado')
  } catch (error) {
    selectedStatus.value = order.value.status
  }
}

const addNote = async () => {
  if (!newNote.value.trim()) return

  try {
    await ecommerceService.addOrderNote(order.value.id, newNote.value)
    toast.success('Nota agregada')
    newNote.value = ''
    await loadOrder()
  } catch (error) {
    toast.error('Error al agregar nota')
  }
}

const convertToSale = () => {
  showConvertModal.value = true
}

const confirmConvertToSale = async () => {
  converting.value = true
  try {
    await ecommerceService.convertOrderToSale(order.value.id)
    toast.success('Pedido convertido a venta exitosamente')
    showConvertModal.value = false
    await loadOrder()
  } catch (error) {
    toast.error(error.response?.data?.error?.message || 'Error al convertir pedido')
  } finally {
    converting.value = false
  }
}

const printOrder = () => {
  window.print()
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(value || 0)
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-HN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    processing: 'Procesando',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
    refunded: 'Reembolsado'
  }
  return labels[status] || status
}

const getPaymentStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    failed: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
    refunded: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.pending
}

const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    paid: 'Pagado',
    failed: 'Fallido',
    refunded: 'Reembolsado'
  }
  return labels[status] || status
}
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors;
}
</style>
