<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Historial de Caja</h1>
        <p v-if="selectedRegister" class="text-sm text-gray-600 mt-1">
          {{ selectedRegister.name }} - {{ selectedRegister.code }}
        </p>
      </div>
      <button @click="$router.back()"
              class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
        Volver
      </button>
    </div>

    <!-- Alert Messages -->
    <alert-message v-if="error"
                   type="error"
                   :message="error"
                   @close="cashRegisterStore.clearError()"
                   class="mb-4" />

    <!-- Loading State -->
    <loading-spinner v-if="loading && !historyData.length" text="Cargando historial..." />

    <!-- History List -->
    <div v-else class="space-y-4">
      <div v-if="historyData.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Sin historial</h3>
        <p class="mt-1 text-sm text-gray-500">No hay aperturas registradas para esta caja</p>
      </div>

      <div v-for="opening in historyData" :key="opening.id"
           class="bg-white rounded-lg shadow overflow-hidden">
        <!-- Opening Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-gray-900">
                Apertura #{{ opening.id }}
                <span v-if="opening.is_open"
                      class="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  Abierta
                </span>
                <span v-else
                      class="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                  Cerrada
                </span>
              </h3>
              <p class="text-xs text-gray-600 mt-1">
                Abierta por: {{ opening.user?.name }} el {{ formatDateTime(opening.opened_at) }}
              </p>
              <p v-if="opening.closing" class="text-xs text-gray-600">
                Cerrada por: {{ opening.closing.user?.name }} el {{ formatDateTime(opening.closing.closed_at) }}
              </p>
            </div>
            <div class="text-right">
              <p class="text-xs text-gray-600">Monto Inicial</p>
              <p class="text-lg font-bold text-gray-900">L {{ formatMoney(opening.opening_amount) }}</p>
            </div>
          </div>
        </div>

        <!-- Opening Stats -->
        <div v-if="opening.stats" class="px-6 py-4">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p class="text-xs text-gray-600">Ventas Efectivo</p>
              <p class="text-sm font-semibold text-gray-900">L {{ formatMoney(opening.stats.total_cash_sales) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Ventas Tarjeta</p>
              <p class="text-sm font-semibold text-gray-900">L {{ formatMoney(opening.stats.total_card_sales) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Total Ventas</p>
              <p class="text-sm font-semibold text-gray-900">L {{ formatMoney(opening.stats.total_sales) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Esperado</p>
              <p class="text-sm font-semibold text-gray-900">L {{ formatMoney(opening.stats.expected_amount) }}</p>
            </div>
          </div>
        </div>

        <!-- Closing Info -->
        <div v-if="opening.closing" class="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p class="text-xs text-gray-600">Monto Real</p>
              <p class="text-sm font-semibold text-gray-900">L {{ formatMoney(opening.closing.actual_amount) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Diferencia</p>
              <p class="text-sm font-semibold"
                 :class="opening.closing.difference === 0 ? 'text-green-600' : 'text-red-600'">
                L {{ formatMoney(Math.abs(opening.closing.difference)) }}
                {{ opening.closing.difference === 0 ? '' : opening.closing.difference > 0 ? '(Sobrante)' : '(Faltante)' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-600">Estado</p>
              <p class="text-sm font-semibold"
                 :class="opening.closing.difference === 0 ? 'text-green-600' : 'text-yellow-600'">
                {{ opening.closing.difference === 0 ? 'Correcto' : 'Con diferencia' }}
              </p>
            </div>
          </div>
          <div v-if="opening.closing.closing_notes" class="mt-3">
            <p class="text-xs text-gray-600">Notas de Cierre:</p>
            <p class="text-sm text-gray-900 mt-1">{{ opening.closing.closing_notes }}</p>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="meta && meta.last_page > 1" class="flex items-center justify-between bg-white px-6 py-3 rounded-lg shadow">
        <div class="text-sm text-gray-700">
          Mostrando {{ meta.from }} a {{ meta.to }} de {{ meta.total }} registros
        </div>
        <div class="flex space-x-2">
          <button @click="changePage(meta.current_page - 1)"
                  :disabled="meta.current_page === 1"
                  class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            Anterior
          </button>
          <button @click="changePage(meta.current_page + 1)"
                  :disabled="meta.current_page === meta.last_page"
                  class="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCashRegisterStore } from '@/stores/cashRegister'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

const route = useRoute()
const router = useRouter()
const cashRegisterStore = useCashRegisterStore()

const historyData = ref([])
const meta = ref(null)
const selectedRegister = ref(null)
const currentPage = ref(1)

const loading = computed(() => cashRegisterStore.loading)
const error = computed(() => cashRegisterStore.error)

const formatMoney = (value) => {
  return parseFloat(value || 0).toFixed(2)
}

const formatDateTime = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('es-HN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadHistory = async (page = 1) => {
  try {
    const cashRegisterId = route.params.id
    const response = await cashRegisterStore.fetchHistory(cashRegisterId, {
      page,
      per_page: 15
    })
    historyData.value = response.data
    meta.value = response.meta
    currentPage.value = page
  } catch (error) {
    console.error('Error loading history:', error)
  }
}

const changePage = (page) => {
  if (page >= 1 && page <= meta.value.last_page) {
    loadHistory(page)
  }
}

onMounted(async () => {
  const cashRegisterId = route.params.id

  // Load cash register details
  try {
    selectedRegister.value = await cashRegisterStore.fetchCashRegister(cashRegisterId)
  } catch (error) {
    console.error('Error loading cash register:', error)
  }

  // Load history
  await loadHistory()
})
</script>
