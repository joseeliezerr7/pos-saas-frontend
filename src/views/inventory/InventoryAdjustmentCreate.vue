<template>
  <div class="p-6 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Nuevo Ajuste de Inventario</h1>
        <p class="text-gray-600 mt-1">Registra diferencias entre inventario físico y sistema</p>
      </div>
      <router-link to="/inventory/adjustments" class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors">
        Cancelar
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Información General</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sucursal *</label>
            <select
              v-model="form.branch_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una sucursal</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Razón del Ajuste *</label>
            <select
              v-model="form.reason"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una razón</option>
              <option value="physical_count">Conteo Físico</option>
              <option value="damage">Daño/Deterioro</option>
              <option value="theft">Robo/Pérdida</option>
              <option value="expiration">Caducidad</option>
              <option value="correction">Corrección</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Observaciones adicionales sobre el ajuste"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Product Search -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Buscar Productos</h2>
        <div class="flex gap-4">
          <input
            v-model="productSearch"
            type="text"
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar producto por nombre, SKU o código de barras..."
            @input="handleProductSearch"
          />
        </div>

        <!-- Product Search Results -->
        <div v-if="searchResults.length > 0" class="mt-4 border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
          <div
            v-for="product in searchResults"
            :key="product.id"
            class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
            @click="addProduct(product)"
          >
            <div>
              <div class="font-medium">{{ product.name }}</div>
              <div class="text-sm text-gray-500">SKU: {{ product.sku }} | Stock: {{ product.stock || 0 }}</div>
            </div>
            <button type="button" class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm">
              Agregar
            </button>
          </div>
        </div>
      </div>

      <!-- Adjustment Items -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-lg font-semibold mb-4">Productos para Ajustar</h2>

        <div v-if="form.items.length === 0" class="text-center py-8 text-gray-500">
          No hay productos agregados. Busca y agrega productos arriba.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant. Sistema</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cant. Física *</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Diferencia</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Ajuste</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in form.items" :key="index">
                <td class="px-4 py-3">
                  <div class="font-medium text-sm">{{ item.product_name }}</div>
                  <div class="text-xs text-gray-500">SKU: {{ item.product_sku }}</div>
                </td>
                <td class="px-4 py-3 text-sm">
                  {{ item.system_quantity }}
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.physical_quantity"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    class="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    @input="calculateDifference(index)"
                  />
                </td>
                <td class="px-4 py-3">
                  <span
                    :class="{
                      'text-red-600 font-semibold': item.difference < 0,
                      'text-green-600 font-semibold': item.difference > 0,
                      'text-gray-600': item.difference === 0
                    }"
                    class="text-sm"
                  >
                    {{ item.difference >= 0 ? '+' : '' }}{{ item.difference }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.cost"
                    type="number"
                    min="0"
                    step="0.01"
                    class="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    @input="calculateDifference(index)"
                  />
                </td>
                <td class="px-4 py-3 text-right">
                  <span
                    :class="{
                      'text-red-600': item.total < 0,
                      'text-green-600': item.total > 0,
                      'text-gray-600': item.total === 0
                    }"
                    class="font-semibold text-sm"
                  >
                    L {{ formatMoney(Math.abs(item.total)) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    type="button"
                    @click="removeProduct(index)"
                    class="text-red-600 hover:text-red-900"
                    title="Eliminar"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="5" class="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                  Total del Ajuste:
                </td>
                <td class="px-4 py-3 text-right">
                  <span
                    :class="{
                      'text-red-600': totalAdjustment < 0,
                      'text-green-600': totalAdjustment > 0,
                      'text-gray-900': totalAdjustment === 0
                    }"
                    class="font-bold text-base"
                  >
                    L {{ formatMoney(Math.abs(totalAdjustment)) }}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex justify-end gap-3">
        <router-link
          to="/inventory/adjustments"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </router-link>
        <button
          type="submit"
          :disabled="loading || form.items.length === 0"
          class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Guardando...' : 'Crear Ajuste' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import inventoryAdjustmentService from '@/services/inventoryAdjustmentService'
import productService from '@/services/productService'
import branchService from '@/services/branchService'
import stockService from '@/services/stockService'
import { toast } from 'vue3-toastify'

const router = useRouter()
const loading = ref(false)
const branches = ref([])
const productSearch = ref('')
const searchResults = ref([])
const searchTimeout = ref(null)

const form = ref({
  branch_id: '',
  reason: '',
  notes: '',
  items: []
})

onMounted(async () => {
  await loadBranches()
})

async function loadBranches() {
  try {
    const response = await branchService.getAllBranches()
    if (response.data.success) {
      branches.value = response.data.data
      // Auto-select first branch if only one exists
      if (branches.value.length === 1) {
        form.value.branch_id = branches.value[0].id
      }
    }
  } catch (error) {
    console.error('Error loading branches:', error)
    toast.error('Error al cargar las sucursales')
  }
}

function handleProductSearch() {
  clearTimeout(searchTimeout.value)

  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout.value = setTimeout(async () => {
    try {
      const response = await productService.search(productSearch.value)
      if (response.data.success) {
        // Filter out products already added
        const addedIds = form.value.items.map(item => item.product_id)
        searchResults.value = response.data.data.filter(p => !addedIds.includes(p.id))
      }
    } catch (error) {
      console.error('Error searching products:', error)
      toast.error('Error al buscar productos')
    }
  }, 300)
}

async function addProduct(product) {
  if (!form.value.branch_id) {
    toast.warning('Selecciona una sucursal primero')
    return
  }

  // Get current stock for this product in the selected branch
  let systemQuantity = 0
  try {
    const response = await stockService.getByBranch(form.value.branch_id)
    if (response.data.success) {
      const stockItem = response.data.data.find(s => s.product_id === product.id)
      systemQuantity = stockItem ? parseFloat(stockItem.quantity) : 0
    }
  } catch (error) {
    console.error('Error getting stock:', error)
    toast.warning('No se pudo obtener el stock actual, se usará 0')
  }

  form.value.items.push({
    product_id: product.id,
    variant_id: null,
    product_name: product.name,
    product_sku: product.sku,
    system_quantity: systemQuantity,
    physical_quantity: systemQuantity,
    difference: 0,
    cost: parseFloat(product.cost || 0),
    total: 0
  })

  // Clear search
  productSearch.value = ''
  searchResults.value = []
}

function removeProduct(index) {
  form.value.items.splice(index, 1)
}

function calculateDifference(index) {
  const item = form.value.items[index]
  item.difference = (item.physical_quantity || 0) - (item.system_quantity || 0)
  item.total = item.difference * (item.cost || 0)
}

const totalAdjustment = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.total || 0), 0)
})

async function handleSubmit() {
  if (!form.value.branch_id) {
    toast.error('Selecciona una sucursal')
    return
  }

  if (!form.value.reason) {
    toast.error('Selecciona una razón para el ajuste')
    return
  }

  if (form.value.items.length === 0) {
    toast.error('Agrega al menos un producto')
    return
  }

  loading.value = true
  try {
    const response = await inventoryAdjustmentService.create(form.value)
    if (response.data.success) {
      toast.success('Ajuste de inventario creado exitosamente')
      router.push('/inventory/adjustments')
    }
  } catch (error) {
    console.error('Error creating adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al crear el ajuste de inventario')
  } finally {
    loading.value = false
  }
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>
