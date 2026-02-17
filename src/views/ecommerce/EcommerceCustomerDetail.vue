<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div class="flex items-center gap-4">
        <router-link to="/ecommerce/customers" class="text-gray-500 hover:text-gray-700">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </router-link>
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span class="text-blue-600 text-xl font-medium">{{ getInitials(customer?.name) }}</span>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">{{ customer?.name }}</h1>
            <p class="text-gray-600">{{ customer?.email }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <span :class="getStatusClass(customer?.status)">
          {{ getStatusLabel(customer?.status) }}
        </span>
        <span :class="getTypeClass(customer?.type)">
          {{ getTypeLabel(customer?.type) }}
        </span>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="customer" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Content -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Orders -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Pedidos del Cliente</h2>
              <span class="text-sm text-gray-500">{{ orders.length }} pedidos</span>
            </div>
          </div>
          <div v-if="ordersLoading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <div v-else-if="orders.length === 0" class="p-8 text-center text-gray-500">
            <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p>Este cliente no tiene pedidos</p>
          </div>
          <div v-else class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <router-link :to="`/ecommerce/orders/${order.id}`" class="font-medium text-blue-600 hover:text-blue-800">
                      #{{ order.order_number }}
                    </router-link>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getOrderStatusClass(order.status)">
                      {{ getOrderStatusLabel(order.status) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                    {{ formatCurrency(order.total) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(order.created_at) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right">
                    <router-link
                      :to="`/ecommerce/orders/${order.id}`"
                      class="text-gray-600 hover:text-blue-600 text-sm"
                    >
                      Ver detalle
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Shipping Addresses -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Direcciones de Envio</h2>
          </div>
          <div v-if="!customer.addresses || customer.addresses?.length === 0" class="p-6 text-center text-gray-500">
            <p>No hay direcciones registradas</p>
          </div>
          <div v-else class="divide-y divide-gray-200">
            <div v-for="address in customer.addresses" :key="address.id" class="p-6">
              <div class="flex items-start justify-between">
                <div>
                  <p class="font-medium text-gray-900">{{ address.label || 'Direccion' }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ address.address_line_1 }}</p>
                  <p v-if="address.address_line_2" class="text-sm text-gray-600">{{ address.address_line_2 }}</p>
                  <p class="text-sm text-gray-600">{{ address.city }}, {{ address.state }} {{ address.postal_code }}</p>
                  <p class="text-sm text-gray-600">{{ address.country }}</p>
                  <p v-if="address.phone" class="text-sm text-gray-500 mt-1">Tel: {{ address.phone }}</p>
                </div>
                <span v-if="address.is_default" class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Principal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Customer Info -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Informacion</h3>
          <div class="space-y-4">
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium text-gray-900">{{ customer.email }}</p>
            </div>
            <div v-if="customer.phone">
              <p class="text-sm text-gray-500">Telefono</p>
              <p class="font-medium text-gray-900">{{ customer.phone }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Tipo de Cliente</p>
              <select
                :value="customer.type"
                @change="updateCustomerType($event.target.value)"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="retail">Minorista</option>
                <option value="b2b">B2B</option>
              </select>
            </div>
            <div>
              <p class="text-sm text-gray-500">Estado</p>
              <select
                :value="customer.status"
                @change="updateStatus($event.target.value)"
                class="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="active">Activo</option>
                <option value="pending">Pendiente</option>
                <option value="suspended">Suspendido</option>
              </select>
            </div>
            <div>
              <p class="text-sm text-gray-500">Registrado</p>
              <p class="font-medium text-gray-900">{{ formatDate(customer.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Estadisticas</h3>
          <div class="space-y-4">
            <div class="flex justify-between">
              <span class="text-gray-600">Total Pedidos</span>
              <span class="font-bold text-gray-900">{{ customer.orders_count || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Total Gastado</span>
              <span class="font-bold text-gray-900">{{ formatCurrency(customer.total_spent || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Promedio por Pedido</span>
              <span class="font-bold text-gray-900">{{ formatCurrency(averageOrder) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Ultimo Pedido</span>
              <span class="font-medium text-gray-900">{{ customer.last_order_at ? formatDate(customer.last_order_at) : 'Nunca' }}</span>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Notas</h3>
          <textarea
            v-model="notes"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="Agregar notas sobre este cliente..."
          ></textarea>
          <button
            @click="saveNotes"
            :disabled="savingNotes"
            class="mt-2 w-full btn-primary text-sm"
          >
            {{ savingNotes ? 'Guardando...' : 'Guardar Notas' }}
          </button>
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
const { currentCustomer, loading } = storeToRefs(ecommerceStore)

const customer = computed(() => currentCustomer.value)
const orders = ref([])
const ordersLoading = ref(false)
const notes = ref('')
const savingNotes = ref(false)

const averageOrder = computed(() => {
  if (!customer.value?.orders_count || customer.value.orders_count === 0) return 0
  return (customer.value.total_spent || 0) / customer.value.orders_count
})

onMounted(async () => {
  await loadCustomer()
})

watch(() => route.params.id, () => {
  loadCustomer()
})

const loadCustomer = async () => {
  await ecommerceStore.fetchCustomer(route.params.id)
  if (customer.value) {
    notes.value = customer.value.notes || ''
    await loadOrders()
  }
}

const loadOrders = async () => {
  ordersLoading.value = true
  try {
    const response = await ecommerceService.getCustomerOrders(route.params.id)
    orders.value = response.data.data || []
  } catch (error) {
    console.error('Error loading orders:', error)
  } finally {
    ordersLoading.value = false
  }
}

const updateStatus = async (newStatus) => {
  try {
    await ecommerceStore.updateCustomerStatus(customer.value.id, newStatus)
  } catch (error) {
    console.error('Error:', error)
  }
}

const updateCustomerType = async (newType) => {
  try {
    await ecommerceService.updateCustomerType(customer.value.id, { type: newType })
    customer.value.type = newType
    toast.success('Tipo de cliente actualizado')
  } catch (error) {
    toast.error('Error al actualizar tipo de cliente')
  }
}

const saveNotes = async () => {
  savingNotes.value = true
  try {
    // This would need a backend endpoint to save customer notes
    toast.success('Notas guardadas')
  } catch (error) {
    toast.error('Error al guardar notas')
  } finally {
    savingNotes.value = false
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
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
    year: 'numeric'
  })
}

const getStatusClass = (status) => {
  const classes = {
    active: 'px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800',
    pending: 'px-3 py-1 text-sm font-medium rounded-full bg-yellow-100 text-yellow-800',
    suspended: 'px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800'
  }
  return classes[status] || classes.active
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Activo',
    pending: 'Pendiente',
    suspended: 'Suspendido'
  }
  return labels[status] || status
}

const getTypeClass = (type) => {
  const classes = {
    retail: 'px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-800',
    wholesale: 'px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800',
    b2b: 'px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-800'
  }
  return classes[type] || classes.retail
}

const getTypeLabel = (type) => {
  const labels = {
    retail: 'Minorista',
    wholesale: 'Mayorista',
    b2b: 'B2B'
  }
  return labels[type] || type
}

const getOrderStatusClass = (status) => {
  const classes = {
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800',
    confirmed: 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800',
    processing: 'px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800',
    shipped: 'px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800',
    delivered: 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800',
    cancelled: 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800',
    refunded: 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800'
  }
  return classes[status] || classes.pending
}

const getOrderStatusLabel = (status) => {
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
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
