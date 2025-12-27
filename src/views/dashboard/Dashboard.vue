<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <button @click="refreshDashboard" :disabled="dashboardStore.loading" class="btn-secondary text-sm">
        <span v-if="dashboardStore.loading">Actualizando...</span>
        <span v-else>Actualizar</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="dashboardStore.loading" class="text-center py-12">
      <p class="text-gray-500">Cargando datos...</p>
    </div>

    <template v-else>
      <!-- Stats Cards - Today -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Ventas Hoy</p>
              <p class="text-2xl font-bold text-gray-900">L {{ formatNumber(dashboardStore.stats.today.total) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ dashboardStore.stats.today.count }} transacciones</p>
            </div>
            <div class="bg-primary-100 rounded-full p-3">
              <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Ticket Promedio Hoy</p>
              <p class="text-2xl font-bold text-gray-900">L {{ formatNumber(dashboardStore.stats.today.average) }}</p>
              <p class="text-xs text-gray-500 mt-1">Efectivo: L {{ formatNumber(dashboardStore.stats.today.cash) }}</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Ventas del Mes</p>
              <p class="text-2xl font-bold text-gray-900">L {{ formatNumber(dashboardStore.stats.month.total) }}</p>
              <p class="text-xs mt-1" :class="dashboardStore.stats.month.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'">
                {{ dashboardStore.stats.month.change_percentage >= 0 ? '+' : '' }}{{ formatNumber(dashboardStore.stats.month.change_percentage) }}% vs mes anterior
              </p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Alertas</p>
              <p class="text-2xl font-bold text-gray-900">{{ dashboardStore.alerts.length }}</p>
              <p class="text-xs text-gray-500 mt-1">Stock bajo o agotado</p>
            </div>
            <div :class="dashboardStore.alerts.length > 0 ? 'bg-red-100' : 'bg-gray-100'" class="rounded-full p-3">
              <svg class="w-6 h-6" :class="dashboardStore.alerts.length > 0 ? 'text-red-600' : 'text-gray-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Sales Chart and Top Products -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sales Chart -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Ventas de los últimos 7 días</h2>
          <div class="h-64">
            <canvas ref="salesChartCanvas"></canvas>
          </div>
        </div>

        <!-- Top Products -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Productos más vendidos (últimos 30 días)</h2>
          <div v-if="dashboardStore.topProducts.length === 0" class="text-center py-8 text-gray-500">
            No hay datos de ventas
          </div>
          <div v-else class="space-y-3">
            <div v-for="(product, index) in dashboardStore.topProducts" :key="product.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex items-center space-x-3">
                <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                  {{ index + 1 }}
                </span>
                <div>
                  <p class="font-medium text-gray-900">{{ product.name }}</p>
                  <p class="text-sm text-gray-500">{{ product.sku }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ product.quantity_sold }} uds.</p>
                <p class="text-sm text-gray-500">L {{ formatNumber(product.revenue) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Alerts Section -->
      <div v-if="dashboardStore.alerts.length > 0" class="card">
        <h2 class="text-lg font-semibold mb-4 text-red-600">Alertas de Inventario</h2>
        <div class="space-y-2">
          <div v-for="alert in dashboardStore.alerts.slice(0, 10)" :key="alert.product_id"
               class="flex items-center justify-between p-3 rounded-lg"
               :class="alert.severity === 'danger' ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'">
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5" :class="alert.severity === 'danger' ? 'text-red-500' : 'text-yellow-500'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p class="font-medium" :class="alert.severity === 'danger' ? 'text-red-900' : 'text-yellow-900'">
                  {{ alert.message }}
                </p>
                <p v-if="alert.current_stock !== undefined" class="text-sm" :class="alert.severity === 'danger' ? 'text-red-700' : 'text-yellow-700'">
                  Stock actual: {{ alert.current_stock }} / Mínimo: {{ alert.min_stock }}
                </p>
              </div>
            </div>
            <router-link :to="`/products`" class="text-sm font-medium hover:underline"
                         :class="alert.severity === 'danger' ? 'text-red-600' : 'text-yellow-600'">
              Ver producto
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link to="/pos" class="btn-primary text-center">
            Abrir POS
          </router-link>
          <router-link to="/products" class="btn-secondary text-center">
            Gestionar Productos
          </router-link>
          <router-link to="/customers" class="btn-secondary text-center">
            Gestionar Clientes
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useDashboardStore } from '@/stores/dashboard'
import Chart from 'chart.js/auto'

const dashboardStore = useDashboardStore()
const salesChartCanvas = ref(null)
let salesChartInstance = null

onMounted(async () => {
  await dashboardStore.loadDashboard()
  await nextTick()
  renderSalesChart()
})

function refreshDashboard() {
  dashboardStore.loadDashboard().then(() => {
    renderSalesChart()
  })
}

function renderSalesChart() {
  if (!salesChartCanvas.value) return

  // Destroy previous chart instance
  if (salesChartInstance) {
    salesChartInstance.destroy()
  }

  const ctx = salesChartCanvas.value.getContext('2d')
  salesChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dashboardStore.salesChart.labels,
      datasets: [{
        label: 'Ventas (L)',
        data: dashboardStore.salesChart.values,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'L ' + value.toFixed(2)
            }
          }
        }
      }
    }
  })
}

function formatNumber(value) {
  return parseFloat(value || 0).toFixed(2)
}
</script>
