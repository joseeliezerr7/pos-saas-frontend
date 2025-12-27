<template>
  <div class="inventory-report">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Reporte de Inventario</h1>
      <p class="text-gray-600 mt-2">Consulte el estado actual del inventario por sucursal</p>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Branch (Required) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sucursal <span class="text-red-500">*</span>
          </label>
          <select
            v-model="filters.branch_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Seleccione una sucursal</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>

        <!-- Category -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            v-model="filters.category_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Todas las categorías</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            v-model="filters.status"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">Todos</option>
            <option value="in_stock">En stock</option>
            <option value="low_stock">Stock bajo</option>
            <option value="out_of_stock">Sin stock</option>
          </select>
        </div>

        <!-- Date Range (optional for movements) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Movimientos desde
          </label>
          <input
            v-model="filters.date_from"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Movimientos hasta
          </label>
          <input
            v-model="filters.date_to"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-3 mt-6">
        <button
          @click="generateReport"
          :disabled="loading || !filters.branch_id"
          class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
              <p class="text-sm text-gray-600">Total Productos</p>
              <p class="text-2xl font-bold text-gray-900">{{ summary.total_products }}</p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Valor Total</p>
              <p class="text-2xl font-bold text-green-600">L {{ formatCurrency(summary.total_value) }}</p>
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
              <p class="text-sm text-gray-600">Stock Bajo</p>
              <p class="text-2xl font-bold text-orange-600">{{ summary.low_stock_count }}</p>
            </div>
            <div class="p-3 bg-orange-100 rounded-full">
              <svg class="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Sin Stock</p>
              <p class="text-2xl font-bold text-red-600">{{ summary.out_of_stock_count }}</p>
            </div>
            <div class="p-3 bg-red-100 rounded-full">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Products Table -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Productos en Inventario</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Mín.</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="product in products" :key="product.product_id" :class="getRowClass(product.status)">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ product.sku }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ product.product_name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ product.category || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold" :class="getQuantityClass(product.status)">{{ product.quantity }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ product.min_stock }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">L {{ formatCurrency(product.cost) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">L {{ formatCurrency(product.price) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">L {{ formatCurrency(product.total_value) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusBadgeClass(product.status)">
                    {{ getStatusLabel(product.status) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Stock Movements (if date range provided) -->
      <div v-if="movements" class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Resumen de Movimientos</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-for="(data, type) in movements" :key="type" class="border rounded-lg p-4">
            <p class="text-sm text-gray-600 capitalize">{{ type }}</p>
            <p class="text-xl font-bold text-gray-900">{{ data.count }} movimientos</p>
            <p class="text-lg text-blue-600">{{ data.total_quantity }} unidades</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay datos</h3>
      <p class="mt-1 text-sm text-gray-500">Seleccione una sucursal y genere el reporte para ver los resultados.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useReportStore } from '../../stores/report'
import { useBranchStore } from '../../stores/branch'
import { useCategoryStore } from '../../stores/category'

const reportStore = useReportStore()
const branchStore = useBranchStore()
const categoryStore = useCategoryStore()

const filters = ref({
  branch_id: '',
  category_id: '',
  status: 'all',
  date_from: '',
  date_to: ''
})

const loading = computed(() => reportStore.loading)
const inventoryData = computed(() => reportStore.inventoryData)
const summary = computed(() => reportStore.inventorySummary || {})
const products = computed(() => reportStore.inventoryProducts || [])
const movements = computed(() => reportStore.inventoryMovements)
const hasData = computed(() => reportStore.hasInventoryData)
const branches = computed(() => branchStore.branches || [])
const categories = computed(() => categoryStore.categories || [])

async function generateReport() {
  await reportStore.fetchInventoryReport(filters.value)
}

function getStatusLabel(status) {
  const labels = {
    in_stock: 'En Stock',
    low_stock: 'Stock Bajo',
    out_of_stock: 'Sin Stock'
  }
  return labels[status] || status
}

function getStatusBadgeClass(status) {
  const classes = {
    in_stock: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    low_stock: 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800',
    out_of_stock: 'px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800'
  }
  return classes[status] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
}

function getRowClass(status) {
  if (status === 'out_of_stock') return 'bg-red-50'
  if (status === 'low_stock') return 'bg-orange-50'
  return ''
}

function getQuantityClass(status) {
  if (status === 'out_of_stock') return 'text-red-600'
  if (status === 'low_stock') return 'text-orange-600'
  return 'text-green-600'
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
}

onMounted(async () => {
  await Promise.all([
    branchStore.fetchBranches(),
    categoryStore.fetchCategories()
  ])

  // Auto-select first branch if available
  if (branchStore.branches && branchStore.branches.length > 0) {
    filters.value.branch_id = branchStore.branches[0].id
    // Generate report automatically with first branch
    await generateReport()
  }
})
</script>

<style scoped>
.inventory-report {
  @apply p-6;
}
</style>
