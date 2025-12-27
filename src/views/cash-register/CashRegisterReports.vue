<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Reportes de Cajas</h1>
      <button @click="$router.back()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
        Volver
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow p-6 mb-6">
      <h2 class="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
          <input v-model="filters.start_date"
                 type="date"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
          <input v-model="filters.end_date"
                 type="date"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Caja</label>
          <select v-model="filters.cash_register_id"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">Todas</option>
            <option v-for="register in cashRegisters" :key="register.id" :value="register.id">
              {{ register.name }}
            </option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="generateReport"
                  :disabled="loading"
                  class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            Generar Reporte
          </button>
        </div>
      </div>
    </div>

    <!-- Alert Messages -->
    <alert-message v-if="error"
                   type="error"
                   :message="error"
                   @close="error = ''"
                   class="mb-4" />

    <!-- Loading State -->
    <loading-spinner v-if="loading" text="Generando reporte..." />

    <!-- Report Results -->
    <div v-else-if="reportData" class="space-y-6">
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total Aperturas</p>
              <p class="text-2xl font-bold text-gray-900">{{ reportData.total_openings || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Total Ventas</p>
              <p class="text-2xl font-bold text-gray-900">L {{ formatMoney(reportData.total_sales || 0) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Diferencias</p>
              <p class="text-2xl font-bold text-gray-900">{{ reportData.closings_with_difference || 0 }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">Promedio x Apertura</p>
              <p class="text-2xl font-bold text-gray-900">
                L {{ formatMoney(reportData.total_openings > 0 ? reportData.total_sales / reportData.total_openings : 0) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Details by Cash Register -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 class="text-lg font-semibold text-gray-900">Detalle por Caja</h2>
          <button @click="exportReport"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            Exportar Excel
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Caja</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aperturas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ventas</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Efectivo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ventas Tarjeta</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencias</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="detail in reportData.details_by_register" :key="detail.cash_register_id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ detail.cash_register_name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ detail.total_openings }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  L {{ formatMoney(detail.total_sales) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  L {{ formatMoney(detail.total_cash_sales) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  L {{ formatMoney(detail.total_card_sales) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="detail.closings_with_difference > 0 ? 'text-red-600' : 'text-green-600'"
                        class="text-sm font-medium">
                    {{ detail.closings_with_difference }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Users -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">Usuarios con Más Aperturas</h2>
        </div>
        <div class="p-6">
          <div class="space-y-3">
            <div v-for="user in reportData.top_users" :key="user.user_id"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p class="text-sm font-medium text-gray-900">{{ user.user_name }}</p>
                <p class="text-xs text-gray-500">{{ user.total_openings }} aperturas</p>
              </div>
              <div class="text-right">
                <p class="text-sm font-semibold text-gray-900">L {{ formatMoney(user.total_sales) }}</p>
                <p class="text-xs text-gray-500">Total vendido</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCashRegisterStore } from '@/stores/cashRegister'
import cashRegisterService from '@/services/cashRegisterService'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

const cashRegisterStore = useCashRegisterStore()

const filters = ref({
  start_date: '',
  end_date: '',
  cash_register_id: ''
})

const reportData = ref(null)
const error = ref('')
const loading = ref(false)

const cashRegisters = computed(() => cashRegisterStore.cashRegisters)

const formatMoney = (value) => {
  return parseFloat(value || 0).toFixed(2)
}

const generateReport = async () => {
  loading.value = true
  error.value = ''
  reportData.value = null

  try {
    const params = {
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    }

    if (filters.value.cash_register_id) {
      params.cash_register_id = filters.value.cash_register_id
    }

    const response = await cashRegisterService.getReports(params)
    reportData.value = response.data.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Error al generar reporte'
  } finally {
    loading.value = false
  }
}

const exportReport = () => {
  // TODO: Implement Excel export
  alert('Función de exportación en desarrollo')
}

onMounted(async () => {
  // Set default dates (last 30 days)
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

  filters.value.end_date = today.toISOString().split('T')[0]
  filters.value.start_date = thirtyDaysAgo.toISOString().split('T')[0]

  // Load cash registers
  await cashRegisterStore.fetchCashRegisters()
})
</script>
