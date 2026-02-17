<template>
  <div class="space-y-6">
    <!-- Header con estado de tienda -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">E-commerce Dashboard</h1>
          <p class="text-gray-600 mt-1">Gestiona tu tienda online y pedidos</p>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Estado:</span>
            <span
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                isStoreActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]"
            >
              {{ isStoreActive ? 'Tienda Activa' : 'Tienda Inactiva' }}
            </span>
          </div>
          <button
            v-if="isStoreActive && settings?.store_slug"
            @click="openStore"
            class="btn-secondary text-sm"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Ver Tienda
          </button>
          <router-link to="/ecommerce/settings" class="btn-primary text-sm">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configuración
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pedidos Hoy</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.orders_today || 0 }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <p class="text-sm text-green-600 mt-2">
          <span class="font-medium">{{ formatCurrency(stats.revenue_today || 0) }}</span> en ventas
        </p>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Pedidos Pendientes</p>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.pending_orders || 0 }}</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <router-link to="/ecommerce/orders?status=pending" class="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Ver pedidos pendientes
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Productos en Catálogo</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.products_count || 0 }}</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <router-link to="/ecommerce/catalog" class="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Gestionar catálogo
        </router-link>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Clientes Registrados</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.customers_count || 0 }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <router-link to="/ecommerce/customers" class="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Ver clientes
        </router-link>
      </div>
    </div>

    <!-- Quick Setup (si tienda no configurada) -->
    <div v-if="!isStoreActive && !loading" class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-8 text-white">
      <div class="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 class="text-2xl font-bold mb-2">Configura tu Tienda Online</h2>
          <p class="text-blue-100">
            Comienza a vender online en minutos. Configura tu tienda, agrega productos y empieza a recibir pedidos.
          </p>
        </div>
        <router-link to="/ecommerce/settings" class="btn bg-white text-blue-600 hover:bg-gray-100 whitespace-nowrap">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Comenzar Configuración
        </router-link>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Pedidos Recientes</h2>
          <router-link to="/ecommerce/orders" class="text-sm text-blue-600 hover:underline">
            Ver todos
          </router-link>
        </div>
      </div>
      <div v-if="loading" class="p-8 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="text-gray-500 mt-2">Cargando pedidos...</p>
      </div>
      <div v-else-if="recentOrders.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p>No hay pedidos recientes</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pedido</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-gray-900">#{{ order.order_number }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ order.customer?.name || 'Cliente Anónimo' }}</p>
                  <p class="text-sm text-gray-500">{{ order.customer?.email }}</p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)">
                  {{ getStatusLabel(order.status) }}
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
                  class="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Ver detalle
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useEcommerceStore } from '@/stores/ecommerce'
import { storeToRefs } from 'pinia'

const ecommerceStore = useEcommerceStore()
const { settings, dashboard, loading } = storeToRefs(ecommerceStore)

const stats = computed(() => dashboard.value || {})
const recentOrders = computed(() => dashboard.value?.recent_orders || [])
const isStoreActive = computed(() => settings.value?.is_active ?? false)

onMounted(async () => {
  await ecommerceStore.fetchDashboard()
})

const openStore = () => {
  if (settings.value?.store_slug) {
    const baseUrl = import.meta.env.VITE_STORE_URL || window.location.origin
    window.open(`${baseUrl}/store/${settings.value.store_slug}`, '_blank')
  }
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

const getStatusClass = (status) => {
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
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors;
}

.btn {
  @apply inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors;
}
</style>
