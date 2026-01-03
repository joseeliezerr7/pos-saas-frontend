<template>
  <div v-if="loading" class="flex justify-center items-center py-8">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>

  <div v-else-if="!summary || !summary.enrolled" class="bg-white rounded-lg shadow p-6">
    <div class="text-center py-6">
      <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
        </svg>
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        No Inscrito en Programa de Lealtad
      </h3>
      <p class="text-sm text-gray-500 mb-4">
        Este cliente no está inscrito en el programa de puntos
      </p>
      <button
        v-if="can('enroll_customers_loyalty')"
        @click="handleEnroll"
        :disabled="enrolling"
        class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {{ enrolling ? 'Inscribiendo...' : 'Inscribir Ahora' }}
      </button>
      <p v-else class="text-sm text-gray-500">
        No tienes permisos para inscribir clientes en el programa de lealtad.
      </p>
    </div>
  </div>

  <div v-else class="bg-white rounded-lg shadow">
    <!-- Header with Tier Badge -->
    <div class="p-6 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div
            v-if="summary.current_tier"
            class="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
            :style="{ backgroundColor: summary.current_tier.color }"
          >
            {{ summary.current_tier.name.charAt(0) }}
          </div>
          <div>
            <h3 class="text-xl font-semibold text-gray-900">
              {{ summary.current_tier?.name || 'Sin Nivel' }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ summary.lifetime_points.toLocaleString() }} puntos totales
            </p>
          </div>
        </div>
        <div class="text-right">
          <div class="text-3xl font-bold text-blue-600">
            {{ summary.points.toLocaleString() }}
          </div>
          <div class="text-sm text-gray-500">Puntos disponibles</div>
          <div class="text-xs text-gray-400 mt-1">
            ≈ L. {{ summary.points_value?.toFixed(2) || '0.00' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900">
          {{ summary.purchases_count || 0 }}
        </div>
        <div class="text-xs text-gray-500">Compras</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900">
          L. {{ (summary.total_spent || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 }) }}
        </div>
        <div class="text-xs text-gray-500">Total Gastado</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-900">
          {{ summary.points_redeemed || 0 }}
        </div>
        <div class="text-xs text-gray-500">Puntos Canjeados</div>
      </div>
      <div class="text-center">
        <div class="text-2xl font-bold text-green-600">
          {{ summary.tier_discount || 0 }}%
        </div>
        <div class="text-xs text-gray-500">Descuento Actual</div>
      </div>
    </div>

    <!-- Next Tier Progress -->
    <div v-if="summary.next_tier" class="p-6 border-t border-gray-200">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">
          Progreso hacia {{ summary.next_tier.name }}
        </span>
        <span class="text-sm text-gray-500">
          {{ summary.points_to_next_tier }} puntos restantes
        </span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{
            width: `${Math.min(100, (summary.lifetime_points / summary.next_tier.min_points) * 100)}%`
          }"
        ></div>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="showActions" class="p-6 border-t border-gray-200">
      <div class="flex space-x-3">
        <button
          v-if="can('redeem_points')"
          @click="$emit('redeem-points')"
          :disabled="summary.points === 0"
          class="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Canjear Puntos
        </button>
        <button
          v-if="can('view_points_transactions')"
          @click="showTransactions = !showTransactions"
          class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
        >
          {{ showTransactions ? 'Ocultar' : 'Ver' }} Historial
        </button>
      </div>
    </div>

    <!-- Transactions History -->
    <div v-if="showTransactions" class="border-t border-gray-200">
      <div class="p-6">
        <h4 class="text-sm font-semibold text-gray-900 mb-4">Historial de Transacciones</h4>

        <div v-if="loadingTransactions" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>

        <div v-else-if="transactions.length === 0" class="text-center py-6 text-gray-500">
          No hay transacciones registradas
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="flex items-center space-x-2">
                <span
                  class="text-xs font-semibold px-2 py-1 rounded"
                  :class="{
                    'bg-green-100 text-green-800': transaction.type === 'earn',
                    'bg-red-100 text-red-800': transaction.type === 'redeem',
                    'bg-gray-100 text-gray-800': transaction.type === 'expire',
                    'bg-blue-100 text-blue-800': transaction.type === 'adjust'
                  }"
                >
                  {{ transactionTypeLabel(transaction.type) }}
                </span>
                <span class="text-sm text-gray-600">
                  {{ transaction.description || 'Sin descripción' }}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                {{ formatDate(transaction.created_at) }}
              </div>
            </div>
            <div class="text-right ml-4">
              <div
                class="text-lg font-semibold"
                :class="{
                  'text-green-600': transaction.points > 0,
                  'text-red-600': transaction.points < 0
                }"
              >
                {{ transaction.points > 0 ? '+' : '' }}{{ transaction.points }}
              </div>
              <div class="text-xs text-gray-500">
                Balance: {{ transaction.balance_after }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'
import { usePermissions } from '@/composables/usePermissions'

const { can } = usePermissions()

const props = defineProps({
  customerId: {
    type: Number,
    required: true
  },
  showActions: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['redeem-points', 'enrolled'])

const loyaltyStore = useLoyaltyStore()

const loading = ref(false)
const enrolling = ref(false)
const showTransactions = ref(false)
const loadingTransactions = ref(false)

const summary = ref(null)
const transactions = ref([])

onMounted(async () => {
  await loadCustomerLoyalty()
})

watch(() => props.customerId, async () => {
  await loadCustomerLoyalty()
})

async function loadCustomerLoyalty() {
  loading.value = true
  try {
    summary.value = await loyaltyStore.fetchCustomerSummary(props.customerId)
  } catch (error) {
    console.error('Error loading loyalty:', error)
  } finally {
    loading.value = false
  }
}

async function handleEnroll() {
  enrolling.value = true
  try {
    await loyaltyStore.enrollCustomer(props.customerId)
    await loadCustomerLoyalty()
    emit('enrolled')
  } catch (error) {
    console.error('Error enrolling customer:', error)
  } finally {
    enrolling.value = false
  }
}

watch(showTransactions, async (newValue) => {
  if (newValue && transactions.value.length === 0) {
    loadingTransactions.value = true
    try {
      transactions.value = await loyaltyStore.fetchCustomerTransactions(props.customerId)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      loadingTransactions.value = false
    }
  }
})

function transactionTypeLabel(type) {
  const labels = {
    earn: 'Ganado',
    redeem: 'Canjeado',
    expire: 'Expirado',
    adjust: 'Ajuste'
  }
  return labels[type] || type
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

defineExpose({
  refresh: loadCustomerLoyalty
})
</script>
