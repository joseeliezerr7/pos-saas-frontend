<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Detalle de Compra</h1>
        <p class="text-gray-600 mt-1">{{ purchase?.purchase_number }}</p>
      </div>
      <div class="flex gap-2">
        <router-link
          v-if="can('edit_purchases') && purchase?.status === 'draft'"
          :to="`/purchases/${purchase?.id}/edit`"
          class="btn-secondary"
        >
          Editar
        </router-link>
        <button
          v-if="can('edit_purchases') && ['ordered', 'partial'].includes(purchase?.status)"
          @click="openReceiveModal"
          class="btn-primary"
        >
          Recibir Productos
        </button>
        <router-link to="/purchases" class="btn-secondary">
          Volver
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="purchaseStore.loading" class="card text-center py-8">
      <p class="text-gray-500">Cargando compra...</p>
    </div>

    <!-- Purchase Details -->
    <template v-else-if="purchase">
      <!-- Basic Information -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Información General</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="text-sm text-gray-600">Número de Compra</label>
            <p class="font-medium">{{ purchase.purchase_number }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Proveedor</label>
            <p class="font-medium">{{ purchase.supplier?.name }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Factura Proveedor</label>
            <p class="font-medium">{{ purchase.supplier_invoice_number || '-' }}</p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Estado</label>
            <p><span :class="getStatusBadge(purchase.status)">{{ getStatusLabel(purchase.status) }}</span></p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Estado de Pago</label>
            <p><span :class="getPaymentStatusBadge(purchase.payment_status)">{{ getPaymentStatusLabel(purchase.payment_status) }}</span></p>
          </div>
          <div>
            <label class="text-sm text-gray-600">Fecha de Creación</label>
            <p class="font-medium">{{ formatDate(purchase.created_at) }}</p>
          </div>
          <div v-if="purchase.expected_date">
            <label class="text-sm text-gray-600">Fecha Esperada</label>
            <p class="font-medium">{{ formatDate(purchase.expected_date) }}</p>
          </div>
          <div v-if="purchase.ordered_at">
            <label class="text-sm text-gray-600">Fecha de Orden</label>
            <p class="font-medium">{{ formatDate(purchase.ordered_at) }}</p>
          </div>
          <div v-if="purchase.received_at">
            <label class="text-sm text-gray-600">Fecha de Recepción</label>
            <p class="font-medium">{{ formatDate(purchase.received_at) }}</p>
          </div>
          <div v-if="purchase.notes" class="md:col-span-2 lg:col-span-3">
            <label class="text-sm text-gray-600">Notas</label>
            <p class="font-medium">{{ purchase.notes }}</p>
          </div>
        </div>
      </div>

      <!-- Purchase Items -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Productos</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibido</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impuesto %</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in purchase.details" :key="item.id">
                <td class="px-4 py-3">
                  <div class="font-medium text-sm">{{ item.product_name }}</div>
                </td>
                <td class="px-4 py-3 text-sm">{{ item.quantity }}</td>
                <td class="px-4 py-3 text-sm">
                  <span :class="item.quantity_received === item.quantity ? 'text-green-600' : 'text-yellow-600'">
                    {{ item.quantity_received || 0 }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">L {{ formatMoney(item.cost) }}</td>
                <td class="px-4 py-3 text-sm">{{ item.tax_rate }}%</td>
                <td class="px-4 py-3 text-sm">L {{ formatMoney(item.discount) }}</td>
                <td class="px-4 py-3 text-right font-medium">L {{ formatMoney(item.subtotal) }}</td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="mt-6 flex justify-end">
            <div class="w-full md:w-1/2 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">L {{ formatMoney(purchase.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Impuestos:</span>
                <span class="font-medium">L {{ formatMoney(purchase.tax) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Descuento:</span>
                <span class="font-medium">L {{ formatMoney(purchase.discount) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>L {{ formatMoney(purchase.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Receive Modal -->
    <div v-if="showReceiveModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">Recibir Productos</h2>

        <form @submit.prevent="handleReceive">
          <div class="overflow-x-auto mb-6">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ordenado</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibido</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recibir Ahora</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(item, index) in receiveForm.items" :key="item.id">
                  <td class="px-4 py-3">
                    <div class="font-medium text-sm">{{ item.product_name }}</div>
                  </td>
                  <td class="px-4 py-3 text-sm">{{ item.quantity }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.quantity_received || 0 }}</td>
                  <td class="px-4 py-3 text-sm">{{ item.pending }}</td>
                  <td class="px-4 py-3">
                    <input
                      v-model.number="item.receiving_quantity"
                      type="number"
                      min="0"
                      :max="item.pending"
                      class="input w-24 text-sm"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="flex gap-2">
            <button type="submit" :disabled="purchaseStore.loading" class="btn-primary flex-1">
              <span v-if="purchaseStore.loading">Procesando...</span>
              <span v-else>Confirmar Recepción</span>
            </button>
            <button type="button" @click="closeReceiveModal" class="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchase'
import { usePermissions } from '@/composables/usePermissions'

const route = useRoute()
const router = useRouter()
const purchaseStore = usePurchaseStore()
const { can } = usePermissions()

const purchase = ref(null)
const showReceiveModal = ref(false)
const receiveForm = reactive({
  items: []
})

onMounted(async () => {
  await loadPurchase()
})

async function loadPurchase() {
  purchase.value = await purchaseStore.fetchPurchaseById(route.params.id)
}

function openReceiveModal() {
  receiveForm.items = purchase.value.details.map(detail => ({
    id: detail.id,
    product_id: detail.product_id,
    variant_id: detail.variant_id,
    product_name: detail.product_name,
    quantity: detail.quantity,
    quantity_received: detail.quantity_received || 0,
    pending: detail.quantity - (detail.quantity_received || 0),
    receiving_quantity: detail.quantity - (detail.quantity_received || 0)
  }))
  showReceiveModal.value = true
}

function closeReceiveModal() {
  showReceiveModal.value = false
  receiveForm.items = []
}

async function handleReceive() {
  const data = {
    items: receiveForm.items
      .filter(item => item.receiving_quantity > 0)
      .map(item => ({
        detail_id: item.id,
        quantity_received: item.receiving_quantity
      }))
  }

  if (data.items.length === 0) {
    return
  }

  try {
    await purchaseStore.receivePurchase(route.params.id, data)
    closeReceiveModal()
    await loadPurchase()
  } catch (error) {
    // Error already handled in store
  }
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

function getStatusLabel(status) {
  const labels = {
    draft: 'Borrador',
    ordered: 'Ordenada',
    partial: 'Parcial',
    received: 'Recibida',
    canceled: 'Cancelada'
  }
  return labels[status] || status
}

function getStatusBadge(status) {
  const badges = {
    draft: 'badge-gray',
    ordered: 'badge-blue',
    partial: 'badge-yellow',
    received: 'badge-green',
    canceled: 'badge-red'
  }
  return badges[status] || 'badge-gray'
}

function getPaymentStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    partial: 'Parcial',
    paid: 'Pagada'
  }
  return labels[status] || status
}

function getPaymentStatusBadge(status) {
  const badges = {
    pending: 'badge-yellow',
    partial: 'badge-blue',
    paid: 'badge-green'
  }
  return badges[status] || 'badge-gray'
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50;
}

.card {
  @apply bg-white rounded-lg shadow p-6;
}

.badge-gray {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800;
}

.badge-blue {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800;
}

.badge-yellow {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800;
}

.badge-green {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800;
}

.badge-red {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800;
}
</style>
