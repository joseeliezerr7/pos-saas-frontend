<template>
  <div class="sales-report">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Reporte de Ventas</h1>
      <p class="text-gray-600 mt-2">Genere reportes detallados de sus ventas con filtros personalizados</p>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Date From -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Inicial
          </label>
          <input
            v-model="filters.date_from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <!-- Date To -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Final
          </label>
          <input
            v-model="filters.date_to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          />
        </div>

        <!-- Branch -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sucursal
          </label>
          <select
            v-model="filters.branch_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas las sucursales</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Payment Method -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago
          </label>
          <select
            v-model="filters.payment_method"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todos los métodos</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjeta</option>
            <option value="transfer">Transferencia</option>
            <option value="credit">Crédito</option>
            <option value="qr">QR</option>
            <option value="mixed">Mixto</option>
          </select>
        </div>

        <!-- Group By -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Agrupar Por
          </label>
          <select
            v-model="filters.group_by"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Sin agrupación</option>
            <option value="day">Por día</option>
            <option value="week">Por semana</option>
            <option value="month">Por mes</option>
            <option value="user">Por cajero</option>
            <option value="branch">Por sucursal</option>
          </select>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6">
        <button
          @click="generateReport"
          :disabled="loading || !filters.date_from || !filters.date_to"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg v-if="loading" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{{ loading ? 'Generando...' : 'Generar Reporte' }}</span>
        </button>

        <button
          v-if="hasData"
          @click="exportPDF"
          class="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Exportar PDF</span>
        </button>

        <button
          v-if="hasData"
          @click="clearReport"
          class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasData" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total Ventas</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.total_sales }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Monto Total</p>
              <p class="text-2xl font-bold text-green-600">L {{ formatCurrency(summary.total_amount) }}</p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Promedio Venta</p>
              <p class="text-2xl font-bold text-purple-600">L {{ formatCurrency(summary.average_sale) }}</p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Items Vendidos</p>
              <p class="text-2xl font-bold text-orange-600">{{ summary.total_items_sold }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-if="salesData.grouped_data" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Ventas por {{ getGroupLabel() }}</h2>
        <div class="h-64">
          <canvas ref="salesChart"></canvas>
        </div>
      </div>

      <!-- Top Products -->
      <div v-if="topProducts && topProducts.length > 0" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Top 10 Productos Más Vendidos</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingresos</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(product, index) in topProducts" :key="product.product_id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ product.product_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ product.quantity_sold }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">L {{ formatCurrency(product.total_revenue) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Payment Methods -->
      <div v-if="paymentMethods" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Ventas por Método de Pago</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="(data, method) in paymentMethods" :key="method" class="border rounded-lg p-4">
            <p class="text-sm text-gray-600 capitalize">{{ getPaymentMethodLabel(method) }}</p>
            <p class="text-xl font-bold text-gray-900">{{ data.count }} ventas</p>
            <p class="text-lg text-green-600">L {{ formatCurrency(data.total) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
      <p class="mt-1 text-sm text-gray-500">Configure los filtros y genere un reporte para ver los resultados.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useReportStore } from '../../stores/report'
import { useBranchStore } from '../../stores/branch'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const reportStore = useReportStore()
const branchStore = useBranchStore()

const salesChart = ref(null)
let chartInstance = null

const filters = ref({
  date_from: getDefaultDateFrom(),
  date_to: getDefaultDateTo(),
  branch_id: '',
  payment_method: '',
  group_by: 'day'
})

const loading = computed(() => reportStore.loading)
const salesData = computed(() => reportStore.salesData)
const summary = computed(() => reportStore.salesSummary || {})
const topProducts = computed(() => reportStore.salesTopProducts || [])
const paymentMethods = computed(() => reportStore.salesPaymentMethods || {})
const hasData = computed(() => reportStore.hasSalesData)
const branches = computed(() => branchStore.branches || [])

function getDefaultDateFrom() {
  const date = new Date()
  date.setDate(date.getDate() - 30)
  return date.toISOString().split('T')[0]
}

function getDefaultDateTo() {
  return new Date().toISOString().split('T')[0]
}

async function generateReport() {
  await reportStore.fetchSalesReport(filters.value)
  await nextTick()
  renderChart()
}

function renderChart() {
  if (!salesData.value?.grouped_data || !salesChart.value) return

  if (chartInstance) {
    chartInstance.destroy()
  }

  const groupedData = salesData.value.grouped_data
  const labels = Object.keys(groupedData)
  const totals = Object.values(groupedData).map(item => item.total)

  const ctx = salesChart.value.getContext('2d')
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Ventas (L)',
        data: totals,
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'L ' + value.toLocaleString()
            }
          }
        }
      }
    }
  })
}

function getGroupLabel() {
  const labels = {
    day: 'Día',
    week: 'Semana',
    month: 'Mes',
    user: 'Cajero',
    branch: 'Sucursal'
  }
  return labels[filters.value.group_by] || 'Período'
}

function getPaymentMethodLabel(method) {
  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    credit: 'Crédito',
    qr: 'QR',
    mixed: 'Mixto'
  }
  return labels[method] || method
}

function formatCurrency(value) {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function exportPDF() {
  reportStore.exportAsPDF()
}

function clearReport() {
  reportStore.clearReports()
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
}

onMounted(async () => {
  await branchStore.fetchBranches()
  // Generate report automatically with default filters
  await generateReport()
})
</script>

<style scoped>
.sales-report {
  @apply p-6;
}
</style>
