<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Cajas Registradoras</h1>
      <div class="flex items-center space-x-3">
        <button @click="$router.push({ name: 'cash-register-reports' })"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500">
          Ver Reportes
        </button>
        <button v-if="(!currentOpening || !currentOpening.is_open) && can('open_cash_register')"
                @click="showOpenModal = true"
                class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500">
          Abrir Caja
        </button>
        <button v-else-if="currentOpening?.is_open && can('close_cash_register')"
                @click="showCloseModal = true"
                class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
          Cerrar Caja
        </button>
      </div>
    </div>

    <!-- Alert Messages -->
    <alert-message v-if="error"
                   type="error"
                   :message="error"
                   @close="cashRegisterStore.clearError()"
                   class="mb-4" />

    <alert-message v-if="successMessage"
                   type="success"
                   :message="successMessage"
                   @close="successMessage = ''"
                   class="mb-4" />

    <!-- Current Opening Status -->
    <div v-if="currentOpening" class="mb-6 bg-green-50 border border-green-200 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="text-lg font-bold text-green-900">Caja Abierta</h2>
          <p class="text-sm text-green-700">
            Abierta por: <span class="font-semibold">{{ currentOpening.user?.name || 'Usuario' }}</span>
          </p>
          <p class="text-sm text-green-700">
            Fecha: {{ formatDateTime(currentOpening.opened_at) }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-sm text-green-700">Monto Inicial</p>
          <p class="text-2xl font-bold text-green-900">L {{ formatMoney(currentOpening.opening_amount) }}</p>
        </div>
      </div>

      <!-- Summary Stats -->
      <div v-if="summary" class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-green-200">
        <div class="text-center">
          <p class="text-sm text-green-700">Ventas Efectivo</p>
          <p class="text-xl font-bold text-green-900">L {{ formatMoney(summary.total_cash_sales) }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-green-700">Ventas Tarjeta</p>
          <p class="text-xl font-bold text-green-900">L {{ formatMoney(summary.total_card_sales) }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-green-700">Total Ventas</p>
          <p class="text-xl font-bold text-green-900">L {{ formatMoney(summary.total_sales) }}</p>
        </div>
        <div class="text-center">
          <p class="text-sm text-green-700">Esperado en Caja</p>
          <p class="text-xl font-bold text-green-900">L {{ formatMoney(summary.expected_amount) }}</p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-4 pt-4 border-t border-green-200 flex space-x-3">
        <button @click="showTransactionModal = true"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
          Registrar Ingreso/Egreso
        </button>
        <button v-if="selectedRegister"
                @click="$router.push({ name: 'cash-register-history', params: { id: selectedRegister.id } })"
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
          Ver Historial
        </button>
        <button @click="loadSummary"
                class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm">
          Actualizar
        </button>
      </div>
    </div>

    <!-- No Cash Register Open -->
    <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div class="flex items-center">
        <svg class="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <div>
          <h3 class="font-semibold text-yellow-900">No hay caja abierta</h3>
          <p class="text-sm text-yellow-700">Debes abrir una caja antes de poder realizar ventas</p>
        </div>
      </div>
    </div>

    <!-- Cash Registers List -->
    <div v-if="cashRegisters.length > 0" class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Cajas Registradoras Disponibles</h2>
      </div>
      <div class="divide-y divide-gray-200">
        <div v-for="register in cashRegisters"
             :key="register.id"
             class="px-6 py-4 hover:bg-gray-50">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900">{{ register.name }}</h3>
              <p class="text-sm text-gray-500">Código: {{ register.code }}</p>
              <p class="text-sm text-gray-500">Sucursal: {{ register.branch?.name || 'N/A' }}</p>
            </div>
            <div class="flex items-center space-x-3">
              <span v-if="currentOpening && selectedRegister?.id === register.id"
                    class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                Abierta
              </span>
              <span v-else
                    :class="register.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                    class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ register.status === 'active' ? 'Activa' : register.status === 'inactive' ? 'Inactiva' : 'Mantenimiento' }}
              </span>
              <button v-if="(!currentOpening || selectedRegister?.id !== register.id) && can('open_cash_register')"
                      @click="selectCashRegister(register)"
                      :disabled="register.status !== 'active'"
                      class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                Abrir
              </button>
              <span v-else class="text-sm text-green-600 font-medium">
                En uso
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <loading-spinner v-if="loading" text="Cargando..." />

    <!-- Open Cash Modal -->
    <Teleport to="body">
      <div v-if="showOpenModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black bg-opacity-50" @click="showOpenModal = false"></div>

          <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Abrir Caja</h3>

            <form @submit.prevent="openCashRegister">
              <div v-if="selectedRegister" class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p class="text-sm font-medium text-blue-900">{{ selectedRegister.name }}</p>
                <p class="text-xs text-blue-700">{{ selectedRegister.code }} - {{ selectedRegister.branch?.name }}</p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Monto Inicial (L)
                </label>
                <input v-model="openForm.opening_amount"
                       type="number"
                       step="0.01"
                       required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="500.00" />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notas (Opcional)
                </label>
                <textarea v-model="openForm.opening_notes"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Notas sobre la apertura..."></textarea>
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button"
                        @click="showOpenModal = false"
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                        :disabled="loading"
                        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  Abrir Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Close Cash Modal -->
    <Teleport to="body">
      <div v-if="showCloseModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black bg-opacity-50" @click="showCloseModal = false"></div>

          <div class="relative bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Cerrar Caja - Arqueo</h3>

            <form @submit.prevent="closeCashRegister">
              <!-- Expected Amount -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <p class="text-sm text-gray-600">Monto Esperado</p>
                <p class="text-2xl font-bold text-gray-900">L {{ formatMoney(summary?.expected_amount || 0) }}</p>
              </div>

              <!-- Denomination Breakdown -->
              <div class="mb-6 border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-semibold text-gray-900">Desglose de Denominaciones</h4>
                  <button type="button"
                          @click="showDenominations = !showDenominations"
                          class="text-xs text-primary-600 hover:text-primary-700">
                    {{ showDenominations ? 'Ocultar' : 'Mostrar' }}
                  </button>
                </div>

                <div v-if="showDenominations" class="space-y-4">
                  <!-- Bills Section -->
                  <div>
                    <h5 class="text-xs font-semibold text-gray-700 mb-2 uppercase">Billetes</h5>
                    <div class="grid grid-cols-2 gap-3">
                      <div v-for="denom in billDenominations" :key="denom.value"
                           class="flex items-center space-x-2">
                        <label class="text-xs text-gray-600 w-16">L {{ denom.value }}</label>
                        <input v-model.number="closeForm.denominations.bills[denom.key]"
                               type="number"
                               min="0"
                               @input="calculateFromDenominations"
                               class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                               placeholder="0" />
                        <span class="text-xs text-gray-500 w-20 text-right">
                          L {{ formatMoney(denom.value * (closeForm.denominations.bills[denom.key] || 0)) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Coins Section -->
                  <div>
                    <h5 class="text-xs font-semibold text-gray-700 mb-2 uppercase">Monedas</h5>
                    <div class="grid grid-cols-2 gap-3">
                      <div v-for="denom in coinDenominations" :key="denom.value"
                           class="flex items-center space-x-2">
                        <label class="text-xs text-gray-600 w-16">L {{ denom.value }}</label>
                        <input v-model.number="closeForm.denominations.coins[denom.key]"
                               type="number"
                               min="0"
                               @input="calculateFromDenominations"
                               class="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                               placeholder="0" />
                        <span class="text-xs text-gray-500 w-20 text-right">
                          L {{ formatMoney(denom.value * (closeForm.denominations.coins[denom.key] || 0)) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Denomination Total -->
                  <div class="pt-3 border-t border-gray-200">
                    <div class="flex justify-between items-center">
                      <span class="text-sm font-semibold text-gray-700">Total del Desglose:</span>
                      <span class="text-lg font-bold text-primary-600">L {{ formatMoney(denominationTotal) }}</span>
                    </div>
                    <p v-if="denominationTotal > 0 && closeForm.actual_amount && Math.abs(denominationTotal - parseFloat(closeForm.actual_amount)) > 0.01"
                       class="text-xs text-red-600 mt-1">
                      ⚠ El desglose no coincide con el monto real contado
                    </p>
                  </div>
                </div>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Monto Real Contado (L) *
                </label>
                <input v-model="closeForm.actual_amount"
                       type="number"
                       step="0.01"
                       required
                       @input="calculateDifference"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="0.00" />
                <p class="text-xs text-gray-500 mt-1">
                  Puedes ingresar el monto manualmente o usar el desglose de denominaciones arriba
                </p>
              </div>

              <!-- Difference -->
              <div v-if="closeForm.actual_amount" class="mb-4 p-3 rounded-lg"
                   :class="difference === 0 ? 'bg-green-50' : 'bg-red-50'">
                <p class="text-sm" :class="difference === 0 ? 'text-green-700' : 'text-red-700'">
                  {{ difference === 0 ? 'Arqueo correcto' : difference > 0 ? 'Sobrante' : 'Faltante' }}
                </p>
                <p class="text-xl font-bold" :class="difference === 0 ? 'text-green-900' : 'text-red-900'">
                  L {{ formatMoney(Math.abs(difference)) }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notas de Cierre (Opcional)
                </label>
                <textarea v-model="closeForm.closing_notes"
                          rows="3"
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Explicar diferencias si las hay..."></textarea>
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button"
                        @click="showCloseModal = false"
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                        :disabled="loading"
                        class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50">
                  Cerrar Caja
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Transaction Modal -->
    <Teleport to="body">
      <div v-if="showTransactionModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black bg-opacity-50" @click="showTransactionModal = false"></div>

          <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
            <h3 class="text-lg font-bold text-gray-900 mb-4">Registrar Transacción</h3>

            <form @submit.prevent="addTransaction">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select v-model="transactionForm.type"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="deposit">Depósito / Ingreso</option>
                  <option value="withdrawal">Retiro / Egreso</option>
                  <option value="expense">Gasto</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Monto (L) *</label>
                <input v-model="transactionForm.amount"
                       type="number"
                       step="0.01"
                       required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="0.00" />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Método de Pago *</label>
                <select v-model="transactionForm.payment_method"
                        required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="check">Cheque</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Referencia</label>
                <input v-model="transactionForm.reference"
                       type="text"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="Ej: Recibo #123" />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">Notas *</label>
                <textarea v-model="transactionForm.notes"
                          rows="3"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Motivo de la transacción..."></textarea>
              </div>

              <div class="flex justify-end space-x-3">
                <button type="button"
                        @click="showTransactionModal = false"
                        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                  Cancelar
                </button>
                <button type="submit"
                        :disabled="loading"
                        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useCashRegisterStore } from '@/stores/cashRegister'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'
import { usePermissions } from '@/composables/usePermissions'

const cashRegisterStore = useCashRegisterStore()
const { can } = usePermissions()

const showOpenModal = ref(false)
const showCloseModal = ref(false)
const showTransactionModal = ref(false)
const showDenominations = ref(true)
const successMessage = ref('')
const selectedRegister = ref(null)

const openForm = ref({
  opening_amount: '',
  opening_notes: ''
})

const closeForm = ref({
  actual_amount: '',
  closing_notes: '',
  denominations: {
    bills: {
      b500: 0,
      b100: 0,
      b50: 0,
      b20: 0,
      b10: 0,
      b5: 0,
      b2: 0,
      b1: 0
    },
    coins: {
      c050: 0,
      c020: 0,
      c010: 0,
      c005: 0
    }
  }
})

const billDenominations = [
  { key: 'b500', value: 500 },
  { key: 'b100', value: 100 },
  { key: 'b50', value: 50 },
  { key: 'b20', value: 20 },
  { key: 'b10', value: 10 },
  { key: 'b5', value: 5 },
  { key: 'b2', value: 2 },
  { key: 'b1', value: 1 }
]

const coinDenominations = [
  { key: 'c050', value: 0.50 },
  { key: 'c020', value: 0.20 },
  { key: 'c010', value: 0.10 },
  { key: 'c005', value: 0.05 }
]

const transactionForm = ref({
  type: 'deposit',
  amount: '',
  payment_method: 'cash',
  reference: '',
  notes: ''
})

const cashRegisters = computed(() => cashRegisterStore.cashRegisters)
const currentOpening = computed(() => cashRegisterStore.currentOpening)
const summary = computed(() => cashRegisterStore.summary)
const loading = computed(() => cashRegisterStore.loading)
const error = computed(() => cashRegisterStore.error)

const difference = computed(() => {
  if (!closeForm.value.actual_amount || !summary.value) return 0
  return parseFloat(closeForm.value.actual_amount) - parseFloat(summary.value.expected_amount || 0)
})

const denominationTotal = computed(() => {
  let total = 0

  // Calculate bills total
  billDenominations.forEach(denom => {
    const quantity = closeForm.value.denominations.bills[denom.key] || 0
    total += denom.value * quantity
  })

  // Calculate coins total
  coinDenominations.forEach(denom => {
    const quantity = closeForm.value.denominations.coins[denom.key] || 0
    total += denom.value * quantity
  })

  return total
})

const calculateDifference = () => {
  // Force reactivity update
}

const calculateFromDenominations = () => {
  // Auto-fill the actual_amount field with the denomination total
  closeForm.value.actual_amount = denominationTotal.value.toFixed(2)
}

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

const selectCashRegister = (register) => {
  selectedRegister.value = register
  showOpenModal.value = true
}

const loadSummary = async () => {
  try {
    // Try to load current opening for all cash registers
    if (cashRegisters.value.length > 0) {
      // Check each cash register for an active opening
      for (const register of cashRegisters.value) {
        try {
          await cashRegisterStore.fetchCurrentOpening(register.id)
          // Verificar si encontramos una apertura después de hacer el fetch
          if (cashRegisterStore.currentOpening && cashRegisterStore.currentOpening.is_open) {
            selectedRegister.value = register
            console.log('Found active opening for register:', register.name, cashRegisterStore.currentOpening)
            return // Salir completamente cuando encontramos una apertura
          }
        } catch (err) {
          // Si es 404, continuar con la siguiente caja
          console.log('No active opening for register:', register.name)
          continue
        }
      }
    }
    console.log('No active opening found in any register')
  } catch (error) {
    console.error('Error loading cash register:', error)
  }
}

const openCashRegister = async () => {
  try {
    if (!selectedRegister.value) {
      cashRegisterStore.error = 'Debe seleccionar una caja registradora'
      return
    }
    await cashRegisterStore.openCashRegister(selectedRegister.value.id, openForm.value)
    successMessage.value = 'Caja abierta exitosamente'
    showOpenModal.value = false
    openForm.value = { opening_amount: '', opening_notes: '' }
    await loadSummary()
  } catch (error) {
    console.error('Error opening cash register:', error)
  }
}

const closeCashRegister = async () => {
  try {
    if (!selectedRegister.value) {
      cashRegisterStore.error = 'No hay caja seleccionada'
      return
    }

    // Prepare close data with denomination breakdown
    const closeData = {
      actual_amount: closeForm.value.actual_amount,
      closing_notes: closeForm.value.closing_notes,
      denomination_breakdown: {
        bills: closeForm.value.denominations.bills,
        coins: closeForm.value.denominations.coins,
        total: denominationTotal.value
      }
    }

    await cashRegisterStore.closeCashRegister(selectedRegister.value.id, closeData)
    successMessage.value = 'Caja cerrada exitosamente'
    showCloseModal.value = false

    // Reset form
    closeForm.value = {
      actual_amount: '',
      closing_notes: '',
      denominations: {
        bills: {
          b500: 0,
          b100: 0,
          b50: 0,
          b20: 0,
          b10: 0,
          b5: 0,
          b2: 0,
          b1: 0
        },
        coins: {
          c050: 0,
          c020: 0,
          c010: 0,
          c005: 0
        }
      }
    }
    selectedRegister.value = null
  } catch (error) {
    console.error('Error closing cash register:', error)
  }
}

const addTransaction = async () => {
  try {
    if (!selectedRegister.value) {
      cashRegisterStore.error = 'No hay caja seleccionada'
      return
    }
    await cashRegisterStore.addTransaction(selectedRegister.value.id, transactionForm.value)
    successMessage.value = 'Transacción registrada exitosamente'
    showTransactionModal.value = false
    transactionForm.value = {
      type: 'deposit',
      amount: '',
      payment_method: 'cash',
      reference: '',
      notes: ''
    }
  } catch (error) {
    console.error('Error adding transaction:', error)
  }
}

onMounted(async () => {
  console.log('Component mounted, loading data...')
  // Cargar lista de cajas registradoras
  await cashRegisterStore.fetchCashRegisters()
  console.log('Cash registers loaded:', cashRegisters.value)
  // Intentar cargar apertura actual
  await loadSummary()
  console.log('Current opening:', currentOpening.value)
  console.log('Current opening is_open value:', currentOpening.value?.is_open)
  console.log('Current opening type:', typeof currentOpening.value?.is_open)
  console.log('Selected register:', selectedRegister.value)
})
</script>
