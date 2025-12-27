<template>
  <div class="inventory-stock p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Stock Actual</h1>
      <p class="text-gray-600 mt-2">Consulte las existencias actuales por sucursal</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
          <select
            v-model="filters.branch_id"
            @change="loadStock"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las sucursales</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
          <select
            v-model="filters.category_id"
            @change="loadStock"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
          <select
            v-model="filters.status"
            @change="loadStock"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todos</option>
            <option value="in_stock">En Stock</option>
            <option value="low_stock">Stock Bajo</option>
            <option value="out_of_stock">Sin Stock</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Total Productos</p>
            <p class="text-2xl font-bold text-gray-900">{{ stockItems.length }}</p>
          </div>
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Valor Total</p>
            <p class="text-2xl font-bold text-gray-900">L {{ formatCurrency(totalValue) }}</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Stock Bajo</p>
            <p class="text-2xl font-bold text-orange-600">{{ lowStockCount }}</p>
          </div>
          <div class="p-3 bg-orange-100 rounded-full">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-gray-600">Sin Stock</p>
            <p class="text-2xl font-bold text-red-600">{{ outOfStockCount }}</p>
          </div>
          <div class="p-3 bg-red-100 rounded-full">
            <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Stock Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <h2 class="text-lg font-semibold mb-4">Inventario de Productos</h2>

        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
          <p class="mt-2 text-gray-600">Cargando stock...</p>
        </div>

        <div v-else-if="stockItems.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
          <p class="mt-1 text-sm text-gray-500">No se encontraron productos en el inventario.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sucursal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mín.</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unit.</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in stockItems" :key="`${item.product_id}-${item.branch_id}`" :class="getRowClass(item)">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img v-if="item.product.image" :src="item.product.image" :alt="item.product.name" class="h-10 w-10 rounded-full object-cover">
                      <div v-else class="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-gray-500 text-xs">{{ item.product.name.charAt(0) }}</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ item.product.name }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ item.product.sku }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ item.product.category?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ item.branch?.name || 'N/A' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="getQuantityClass(item)">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ item.product.stock_min }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  L {{ formatCurrency(item.product.cost) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  L {{ formatCurrency(item.product.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  L {{ formatCurrency(item.quantity * item.product.price) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(item)">
                    {{ getStatusLabel(item) }}
                  </span>
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
import { useCategoryStore } from '../../stores/category'

const stockStore = useStockStore()
const branchStore = useBranchStore()
const categoryStore = useCategoryStore()

const filters = ref({
  branch_id: '',
  category_id: '',
  status: ''
})

const loading = computed(() => stockStore.loading)
const stockItems = computed(() => stockStore.stockByBranch || [])
const branches = computed(() => branchStore.branches || [])
const categories = computed(() => categoryStore.categories || [])

const totalValue = computed(() => {
  return stockItems.value.reduce((sum, item) => {
    return sum + (item.quantity * item.product.price)
  }, 0)
})

const lowStockCount = computed(() => {
  return stockItems.value.filter(item => {
    return item.quantity <= item.product.stock_min && item.quantity > 0
  }).length
})

const outOfStockCount = computed(() => {
  return stockItems.value.filter(item => item.quantity <= 0).length
})

async function loadStock() {
  const params = {}

  if (filters.value.branch_id) {
    await stockStore.fetchStockByBranch(filters.value.branch_id)
  } else {
    await stockStore.fetchStock(params)
  }
}

function getStatusLabel(item) {
  if (item.quantity <= 0) return 'Sin Stock'
  if (item.quantity <= item.product.stock_min) return 'Stock Bajo'
  return 'En Stock'
}

function getStatusBadgeClass(item) {
  if (item.quantity <= 0) {
    return 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
  }
  if (item.quantity <= item.product.stock_min) {
    return 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800'
  }
  return 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800'
}

function getRowClass(item) {
  if (item.quantity <= 0) return 'bg-red-50'
  if (item.quantity <= item.product.stock_min) return 'bg-orange-50'
  return ''
}

function getQuantityClass(item) {
  if (item.quantity <= 0) return 'text-red-600'
  if (item.quantity <= item.product.stock_min) return 'text-orange-600'
  return 'text-green-600'
}

function formatCurrency(value) {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

onMounted(async () => {
  await Promise.all([
    branchStore.fetchBranches(),
    categoryStore.fetchCategories()
  ])
  await loadStock()
})
</script>

<style scoped>
.inventory-stock {
  min-height: calc(100vh - 200px);
}
</style>
