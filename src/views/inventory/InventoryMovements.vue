<template>
  <div class="inventory-movements p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Movimientos de Inventario</h1>
      <p class="text-gray-600 mt-2">Historial completo de entradas y salidas de productos</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
          <select
            v-model="filters.branch_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las sucursales</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Movimiento</label>
          <select
            v-model="filters.type"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="entry">Entrada</option>
            <option value="exit">Salida</option>
            <option value="adjustment">Ajuste</option>
            <option value="transfer_in">Transferencia Entrada</option>
            <option value="transfer_out">Transferencia Salida</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Desde</label>
          <input
            v-model="filters.date_from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Hasta</label>
          <input
            v-model="filters.date_to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div class="mt-4 flex gap-3">
        <button
          @click="fetchMovements"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
        >
          Filtrar
        </button>
        <button
          @click="clearFilters"
          class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          Limpiar
        </button>
      </div>
    </div>

    <!-- Movements Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Historial de Movimientos</h2>
          <span class="text-sm text-gray-600">{{ movements.length }} movimientos</span>
        </div>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
          <p class="mt-2 text-gray-600">Cargando movimientos...</p>
        </div>

        <div v-else-if="movements.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay movimientos</h3>
          <p class="mt-1 text-sm text-gray-500">No se encontraron movimientos con los filtros seleccionados.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Anterior</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Nuevo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="movement in movements" :key="movement.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(movement.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ movement.product?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getMovementTypeBadgeClass(movement.type)">
                    {{ getMovementTypeLabel(movement.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="getQuantityClass(movement.type)">
                  {{ formatQuantity(movement.quantity, movement.type) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ movement.previous_quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ movement.new_quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ movement.branch?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ movement.user?.name || 'Sistema' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ movement.notes || '-' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStockStore } from '../../stores/stock'
import { useBranchStore } from '../../stores/branch'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const stockStore = useStockStore()
const branchStore = useBranchStore()

const filters = ref({
  branch_id: '',
  type: '',
  date_from: '',
  date_to: ''
})

const loading = computed(() => stockStore.loading)
const movements = computed(() => stockStore.movements || [])
const branches = computed(() => branchStore.branches || [])

async function fetchMovements() {
  await stockStore.fetchMovements(filters.value)
}

function clearFilters() {
  filters.value = {
    branch_id: '',
    type: '',
    date_from: '',
    date_to: ''
  }
  fetchMovements()
}

function getMovementTypeLabel(type) {
  const labels = {
    entry: 'Entrada',
    exit: 'Salida',
    adjustment: 'Ajuste',
    transfer_in: 'Transferencia Entrada',
    transfer_out: 'Transferencia Salida',
    sale: 'Venta',
    purchase: 'Compra'
  }
  return labels[type] || type
}

function getMovementTypeBadgeClass(type) {
  const classes = {
    entry: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    purchase: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    exit: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
    sale: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800',
    adjustment: 'px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800',
    transfer_in: 'px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800',
    transfer_out: 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800'
  }
  return classes[type] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}

function getQuantityClass(type) {
  if (type === 'entry' || type === 'purchase' || type === 'transfer_in') return 'text-green-600'
  if (type === 'exit' || type === 'sale' || type === 'transfer_out') return 'text-red-600'
  return 'text-blue-600'
}

function formatQuantity(quantity, type) {
  const sign = (type === 'entry' || type === 'purchase' || type === 'transfer_in') ? '+' : (type === 'exit' || type === 'sale' || type === 'transfer_out') ? '-' : ''
  return `${sign}${Math.abs(quantity)}`
}

function formatDate(dateString) {
  try {
    return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
  } catch {
    return dateString
  }
}

onMounted(async () => {
  await Promise.all([
    branchStore.fetchBranches(),
    fetchMovements()
  ])
})
</script>
