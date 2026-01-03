<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Gift Cards</h1>
      <p class="text-gray-600">Gestiona las tarjetas de regalo de tu negocio</p>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Total Gift Cards</div>
        <div class="text-2xl font-bold text-blue-600">{{ statistics.total_cards }}</div>
        <div class="text-xs text-gray-500 mt-1">
          {{ statistics.active_cards }} activas
        </div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Total Emitido</div>
        <div class="text-2xl font-bold text-green-600">L. {{ formatNumber(statistics.total_issued) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Total Canjeado</div>
        <div class="text-2xl font-bold text-purple-600">L. {{ formatNumber(statistics.total_redeemed) }}</div>
      </div>
      <div class="bg-white rounded-lg shadow p-4">
        <div class="text-sm text-gray-600">Pendiente</div>
        <div class="text-2xl font-bold text-orange-600">L. {{ formatNumber(statistics.total_outstanding) }}</div>
        <div class="text-xs text-gray-500 mt-1">
          {{ statistics.redemption_rate.toFixed(1) }}% redención
        </div>
      </div>
    </div>

    <!-- Filters and Actions -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="flex flex-col md:flex-row gap-4 items-end">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar por código..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="debouncedSearch"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @change="loadGiftCards"
          >
            <option value="">Todos</option>
            <option value="active">Activas</option>
            <option value="redeemed">Canjeadas</option>
            <option value="expired">Expiradas</option>
            <option value="voided">Anuladas</option>
          </select>
        </div>
        <button
          v-if="can('sell_gift_cards')"
          @click="showCreateModal = true"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Nueva Gift Card
        </button>
      </div>
    </div>

    <!-- Gift Cards Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Cargando gift cards...</p>
      </div>

      <div v-else-if="giftCards.length === 0" class="p-8 text-center">
        <p class="text-gray-500">No hay gift cards registradas</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance Inicial
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance Actual
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expira
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="card in giftCards" :key="card.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ card.code }}</div>
              <div class="text-xs text-gray-500">{{ formatDate(card.issued_at) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div v-if="card.customer" class="text-sm text-gray-900">{{ card.customer.name }}</div>
              <div v-else class="text-sm text-gray-500">Sin asignar</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              L. {{ formatNumber(card.initial_balance) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium" :class="{
              'text-green-600': card.current_balance > 0,
              'text-gray-400': card.current_balance === 0
            }">
              L. {{ formatNumber(card.current_balance) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(card.status)" class="px-2 py-1 text-xs rounded-full">
                {{ getStatusLabel(card.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ card.expires_at ? formatDate(card.expires_at) : 'Sin expiración' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                v-if="can('check_gift_card_balance')"
                @click="viewDetails(card)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Ver
              </button>
              <button
                v-if="card.status === 'active' && can('reload_gift_cards')"
                @click="openAddBalanceModal(card)"
                class="text-green-600 hover:text-green-900 mr-3"
              >
                Agregar
              </button>
              <button
                v-if="card.status === 'active' && can('void_gift_cards')"
                @click="openVoidModal(card)"
                class="text-red-600 hover:text-red-900"
              >
                Anular
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.last_page > 1" class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }} a
            {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de
            {{ pagination.total }} resultados
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page === pagination.last_page"
              class="px-3 py-1 border rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Gift Card Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Nueva Gift Card</h2>
        <form @submit.prevent="createGiftCard">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto</label>
            <input
              v-model.number="newCard.amount"
              type="number"
              step="0.01"
              min="1"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Expiración (Opcional)</label>
            <input
              v-model="newCard.expires_at"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Notas (Opcional)</label>
            <textarea
              v-model="newCard.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="closeCreateModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Crear Gift Card
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Add Balance Modal -->
    <div v-if="showAddBalanceModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Agregar Balance</h2>
        <p class="text-sm text-gray-600 mb-4">
          Gift Card: <span class="font-semibold">{{ selectedCard?.code }}</span><br>
          Balance actual: <span class="font-semibold">L. {{ formatNumber(selectedCard?.current_balance || 0) }}</span>
        </p>
        <form @submit.prevent="addBalance">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Monto a Agregar</label>
            <input
              v-model.number="balanceForm.amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripción (Opcional)</label>
            <input
              v-model="balanceForm.description"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="closeAddBalanceModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Agregar Balance
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Void Modal -->
    <div v-if="showVoidModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4 text-red-600">Anular Gift Card</h2>
        <p class="text-sm text-gray-600 mb-4">
          ¿Estás seguro de anular la gift card <span class="font-semibold">{{ selectedCard?.code }}</span>?<br>
          Balance actual: <span class="font-semibold">L. {{ formatNumber(selectedCard?.current_balance || 0) }}</span>
        </p>
        <form @submit.prevent="voidCard">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Razón de Anulación</label>
            <textarea
              v-model="voidReason"
              rows="3"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Explica por qué se anula esta gift card..."
            ></textarea>
          </div>
          <div class="flex gap-2 justify-end">
            <button
              type="button"
              @click="closeVoidModal"
              class="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="loading"
              class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              Anular Gift Card
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">Detalles de Gift Card</h2>
          <button @click="showDetailsModal = false" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div v-if="selectedCard" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm text-gray-600">Código</label>
              <p class="font-semibold">{{ selectedCard.code }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Estado</label>
              <p>
                <span :class="getStatusClass(selectedCard.status)" class="px-2 py-1 text-xs rounded-full">
                  {{ getStatusLabel(selectedCard.status) }}
                </span>
              </p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Balance Inicial</label>
              <p class="font-semibold">L. {{ formatNumber(selectedCard.initial_balance) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Balance Actual</label>
              <p class="font-semibold text-green-600">L. {{ formatNumber(selectedCard.current_balance) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Emitida</label>
              <p>{{ formatDate(selectedCard.issued_at) }}</p>
            </div>
            <div>
              <label class="text-sm text-gray-600">Expira</label>
              <p>{{ selectedCard.expires_at ? formatDate(selectedCard.expires_at) : 'Sin expiración' }}</p>
            </div>
          </div>

          <div v-if="selectedCard.customer">
            <label class="text-sm text-gray-600">Cliente</label>
            <p class="font-semibold">{{ selectedCard.customer.name }}</p>
          </div>

          <div v-if="selectedCard.notes">
            <label class="text-sm text-gray-600">Notas</label>
            <p class="text-sm">{{ selectedCard.notes }}</p>
          </div>

          <div v-if="selectedCard.transactions && selectedCard.transactions.length > 0" class="mt-6">
            <h3 class="font-semibold mb-3">Transacciones</h3>
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Fecha</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Monto</th>
                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">Balance</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr v-for="txn in selectedCard.transactions" :key="txn.id">
                    <td class="px-4 py-2 text-sm">{{ formatDate(txn.created_at) }}</td>
                    <td class="px-4 py-2 text-sm">
                      <span :class="{
                        'text-green-600': txn.type === 'issue' || txn.type === 'add',
                        'text-red-600': txn.type === 'redeem' || txn.type === 'void'
                      }">
                        {{ getTransactionTypeLabel(txn.type) }}
                      </span>
                    </td>
                    <td class="px-4 py-2 text-sm text-right" :class="{
                      'text-green-600': txn.amount > 0,
                      'text-red-600': txn.amount < 0
                    }">
                      {{ txn.amount > 0 ? '+' : '' }}L. {{ formatNumber(Math.abs(txn.amount)) }}
                    </td>
                    <td class="px-4 py-2 text-sm text-right">L. {{ formatNumber(txn.balance_after) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useGiftCardStore } from '@/stores/giftCard'
import { usePermissions } from '@/composables/usePermissions'
import { storeToRefs } from 'pinia'

const { can } = usePermissions()
const giftCardStore = useGiftCardStore()
const { giftCards, loading, pagination, statistics } = storeToRefs(giftCardStore)

const filters = ref({
  search: '',
  status: ''
})

const showCreateModal = ref(false)
const showAddBalanceModal = ref(false)
const showVoidModal = ref(false)
const showDetailsModal = ref(false)
const selectedCard = ref(null)

const newCard = ref({
  amount: null,
  expires_at: null,
  notes: ''
})

const balanceForm = ref({
  amount: null,
  description: ''
})

const voidReason = ref('')

let searchTimeout = null

onMounted(async () => {
  await loadGiftCards()
  await giftCardStore.fetchStatistics()
})

async function loadGiftCards() {
  const params = {}
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.status) params.status = filters.value.status
  await giftCardStore.fetchGiftCards(params)
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadGiftCards()
  }, 500)
}

async function createGiftCard() {
  try {
    await giftCardStore.createGiftCard(newCard.value)
    closeCreateModal()
  } catch (error) {
    console.error('Error creating gift card:', error)
  }
}

function closeCreateModal() {
  showCreateModal.value = false
  newCard.value = { amount: null, expires_at: null, notes: '' }
}

function openAddBalanceModal(card) {
  selectedCard.value = card
  balanceForm.value = { amount: null, description: '' }
  showAddBalanceModal.value = true
}

function closeAddBalanceModal() {
  showAddBalanceModal.value = false
  selectedCard.value = null
  balanceForm.value = { amount: null, description: '' }
}

async function addBalance() {
  try {
    await giftCardStore.addBalance(
      selectedCard.value.id,
      balanceForm.value.amount,
      balanceForm.value.description
    )
    closeAddBalanceModal()
  } catch (error) {
    console.error('Error adding balance:', error)
  }
}

function openVoidModal(card) {
  selectedCard.value = card
  voidReason.value = ''
  showVoidModal.value = true
}

function closeVoidModal() {
  showVoidModal.value = false
  selectedCard.value = null
  voidReason.value = ''
}

async function voidCard() {
  try {
    await giftCardStore.voidGiftCard(selectedCard.value.id, voidReason.value)
    closeVoidModal()
  } catch (error) {
    console.error('Error voiding gift card:', error)
  }
}

async function viewDetails(card) {
  try {
    selectedCard.value = await giftCardStore.getGiftCard(card.id)
    showDetailsModal.value = true
  } catch (error) {
    console.error('Error loading details:', error)
  }
}

async function changePage(page) {
  const params = { page }
  if (filters.value.search) params.search = filters.value.search
  if (filters.value.status) params.status = filters.value.status
  await giftCardStore.fetchGiftCards(params)
}

function getStatusClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-800',
    redeemed: 'bg-gray-100 text-gray-800',
    expired: 'bg-yellow-100 text-yellow-800',
    voided: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function getStatusLabel(status) {
  const labels = {
    active: 'Activa',
    redeemed: 'Canjeada',
    expired: 'Expirada',
    voided: 'Anulada'
  }
  return labels[status] || status
}

function getTransactionTypeLabel(type) {
  const labels = {
    issue: 'Emisión',
    redeem: 'Canje',
    add: 'Recarga',
    void: 'Anulación'
  }
  return labels[type] || type
}

function formatNumber(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
