<template>
  <div class="aging-report-page">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Reporte de Antigüedad de Saldos</h1>
        <p class="text-gray-600 mt-1">Análisis de cuentas por cobrar por tiempo de vencimiento</p>
      </div>
      <button
        @click="exportReport"
        class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Exportar Excel
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <div class="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium opacity-90">Total por Cobrar</h3>
          <svg class="w-8 h-8 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p class="text-3xl font-bold">L {{ formatCurrency(totalReceivable) }}</p>
        <p class="text-sm opacity-80 mt-1">{{ totalCount }} facturas</p>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Al Corriente</h3>
          <div class="bg-green-100 p-2 rounded-full">
            <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">L {{ formatCurrency(agingData.current?.amount || 0) }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ agingData.current?.count || 0 }} facturas</p>
        <div class="mt-2 bg-green-100 rounded-full h-2">
          <div class="bg-green-500 h-2 rounded-full" :style="{ width: getPercentage(agingData.current?.amount) + '%' }"></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">1-30 Días</h3>
          <div class="bg-yellow-100 p-2 rounded-full">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">L {{ formatCurrency(agingData.days_1_30?.amount || 0) }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ agingData.days_1_30?.count || 0 }} facturas</p>
        <div class="mt-2 bg-yellow-100 rounded-full h-2">
          <div class="bg-yellow-500 h-2 rounded-full" :style="{ width: getPercentage(agingData.days_1_30?.amount) + '%' }"></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">31-60 Días</h3>
          <div class="bg-orange-100 p-2 rounded-full">
            <svg class="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">L {{ formatCurrency(agingData.days_31_60?.amount || 0) }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ agingData.days_31_60?.count || 0 }} facturas</p>
        <div class="mt-2 bg-orange-100 rounded-full h-2">
          <div class="bg-orange-500 h-2 rounded-full" :style="{ width: getPercentage(agingData.days_31_60?.amount) + '%' }"></div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
        <div class="flex items-center justify-between mb-2">
          <h3 class="text-sm font-medium text-gray-600">Más de 60 Días</h3>
          <div class="bg-red-100 p-2 rounded-full">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="text-2xl font-bold text-gray-900">L {{ formatCurrency(agingData.days_over_60?.amount || 0) }}</p>
        <p class="text-sm text-gray-500 mt-1">{{ agingData.days_over_60?.count || 0 }} facturas</p>
        <div class="mt-2 bg-red-100 rounded-full h-2">
          <div class="bg-red-500 h-2 rounded-full" :style="{ width: getPercentage(agingData.days_over_60?.amount) + '%' }"></div>
        </div>
      </div>
    </div>

    <!-- Chart Visualization -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">Distribución de Saldos por Antigüedad</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pie Chart -->
        <div class="flex items-center justify-center">
          <canvas ref="pieChartCanvas" width="300" height="300"></canvas>
        </div>
        <!-- Bar Chart -->
        <div>
          <canvas ref="barChartCanvas" width="400" height="300"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Breakdown by Customer -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Desglose por Cliente</h2>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">Cargando reporte...</p>
      </div>

      <div v-else-if="customerBreakdown.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">No hay datos para mostrar</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Facturas
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Al Corriente
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              1-30 Días
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              31-60 Días
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              +60 Días
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Total
            </th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="customer in customerBreakdown" :key="customer.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ customer.name }}</div>
              <div class="text-sm text-gray-500">{{ customer.rtn || 'N/A' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-900">
              {{ customer.invoice_count }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
              <span :class="customer.current > 0 ? 'font-medium text-green-600' : 'text-gray-400'">
                L {{ formatCurrency(customer.current) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
              <span :class="customer.days_1_30 > 0 ? 'font-medium text-yellow-600' : 'text-gray-400'">
                L {{ formatCurrency(customer.days_1_30) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
              <span :class="customer.days_31_60 > 0 ? 'font-medium text-orange-600' : 'text-gray-400'">
                L {{ formatCurrency(customer.days_31_60) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
              <span :class="customer.days_over_60 > 0 ? 'font-medium text-red-600' : 'text-gray-400'">
                L {{ formatCurrency(customer.days_over_60) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900">
              L {{ formatCurrency(customer.total) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
              <button
                @click="viewCustomerStatement(customer.id)"
                class="text-blue-600 hover:text-blue-800"
                title="Ver estado de cuenta"
              >
                <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100">
          <tr>
            <td colspan="2" class="px-6 py-4 text-sm font-bold text-gray-900">TOTALES</td>
            <td class="px-6 py-4 text-right text-sm font-bold text-green-600">
              L {{ formatCurrency(agingData.current?.amount || 0) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-yellow-600">
              L {{ formatCurrency(agingData.days_1_30?.amount || 0) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-orange-600">
              L {{ formatCurrency(agingData.days_31_60?.amount || 0) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-red-600">
              L {{ formatCurrency(agingData.days_over_60?.amount || 0) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-gray-900">
              L {{ formatCurrency(totalReceivable) }}
            </td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { toast } from 'vue3-toastify'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const router = useRouter()
const creditStore = useCreditStore()

const loading = ref(false)
const pieChartCanvas = ref(null)
const barChartCanvas = ref(null)
let pieChart = null
let barChart = null

const agingData = computed(() => creditStore.agingReport || {})
const customerBreakdown = computed(() => {
  // Agrupar datos por cliente
  const customers = {}

  Object.keys(agingData.value).forEach(bucket => {
    if (agingData.value[bucket]?.sales) {
      agingData.value[bucket].sales.forEach(sale => {
        const customerId = sale.customer_id
        if (!customers[customerId]) {
          customers[customerId] = {
            id: customerId,
            name: sale.customer?.name || 'N/A',
            rtn: sale.customer?.rtn || '',
            current: 0,
            days_1_30: 0,
            days_31_60: 0,
            days_over_60: 0,
            total: 0,
            invoice_count: 0
          }
        }

        customers[customerId][bucket] += Number(sale.balance_due || 0)
        customers[customerId].total += Number(sale.balance_due || 0)
        customers[customerId].invoice_count++
      })
    }
  })

  return Object.values(customers).sort((a, b) => b.total - a.total)
})

const totalReceivable = computed(() => {
  return (agingData.value.current?.amount || 0) +
         (agingData.value.days_1_30?.amount || 0) +
         (agingData.value.days_31_60?.amount || 0) +
         (agingData.value.days_over_60?.amount || 0)
})

const totalCount = computed(() => {
  return (agingData.value.current?.count || 0) +
         (agingData.value.days_1_30?.count || 0) +
         (agingData.value.days_31_60?.count || 0) +
         (agingData.value.days_over_60?.count || 0)
})

onMounted(async () => {
  await loadAgingReport()
  await nextTick()
  renderCharts()
})

const loadAgingReport = async () => {
  loading.value = true
  try {
    await creditStore.fetchAgingReport()
  } catch (error) {
    toast.error('Error al cargar el reporte de antigüedad')
  } finally {
    loading.value = false
  }
}

const renderCharts = () => {
  if (pieChartCanvas.value) {
    const ctx = pieChartCanvas.value.getContext('2d')

    if (pieChart) {
      pieChart.destroy()
    }

    pieChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Al Corriente', '1-30 Días', '31-60 Días', '+60 Días'],
        datasets: [{
          data: [
            agingData.value.current?.amount || 0,
            agingData.value.days_1_30?.amount || 0,
            agingData.value.days_31_60?.amount || 0,
            agingData.value.days_over_60?.amount || 0
          ],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#f97316',
            '#ef4444'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })
  }

  if (barChartCanvas.value) {
    const ctx = barChartCanvas.value.getContext('2d')

    if (barChart) {
      barChart.destroy()
    }

    barChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Al Corriente', '1-30 Días', '31-60 Días', '+60 Días'],
        datasets: [{
          label: 'Monto (L)',
          data: [
            agingData.value.current?.amount || 0,
            agingData.value.days_1_30?.amount || 0,
            agingData.value.days_31_60?.amount || 0,
            agingData.value.days_over_60?.amount || 0
          ],
          backgroundColor: [
            '#10b981',
            '#f59e0b',
            '#f97316',
            '#ef4444'
          ]
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
                return 'L ' + value.toLocaleString()
              }
            }
          }
        }
      }
    })
  }
}

const viewCustomerStatement = (customerId) => {
  router.push({ name: 'credit-customer-statement', params: { customerId } })
}

const exportReport = () => {
  toast.info('Funcionalidad de exportación en desarrollo')
  // TODO: Implementar exportación a Excel
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getPercentage = (amount) => {
  if (!totalReceivable.value || !amount) return 0
  return Math.round((amount / totalReceivable.value) * 100)
}
</script>

<style scoped>
.aging-report-page {
  padding: 1.5rem;
}
</style>
