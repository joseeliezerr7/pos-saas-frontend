<template>
  <div class="inventory-transfers p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Transferencias de Inventario</h1>
      <p class="text-gray-600 mt-2">Transfiera productos entre sucursales</p>
    </div>

    <!-- Transfer Form -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Nueva Transferencia</h2>

      <form @submit.prevent="submitTransfer" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- From Branch -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Sucursal Origen <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.from_branch_id"
              @change="onFromBranchChange"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Seleccione sucursal origen</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>

          <!-- To Branch -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Sucursal Destino <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.to_branch_id"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Seleccione sucursal destino</option>
              <option
                v-for="branch in availableDestinationBranches"
                :key="branch.id"
                :value="branch.id"
              >
                {{ branch.name }}
              </option>
            </select>
            <p v-if="!form.from_branch_id" class="text-xs text-gray-500 mt-1">
              Primero seleccione la sucursal de origen
            </p>
          </div>

          <!-- Product Search -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Producto <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <input
                v-model="productSearch"
                @input="searchProducts"
                type="text"
                placeholder="Buscar producto por nombre, SKU o código..."
                required
                :disabled="!form.from_branch_id"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
              />

              <!-- Search Results Dropdown -->
              <div
                v-if="searchResults.length > 0 && !selectedProduct"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                <button
                  v-for="product in searchResults"
                  :key="product.id"
                  type="button"
                  @click="selectProduct(product)"
                  class="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  <div class="font-medium">{{ product.name }}</div>
                  <div class="text-sm text-gray-600">
                    SKU: {{ product.sku || 'N/A' }} | Stock disponible en origen: {{ getProductStockInBranch(product) }}
                  </div>
                </button>
              </div>
            </div>

            <!-- Selected Product Display -->
            <div v-if="selectedProduct" class="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-medium text-gray-900">{{ selectedProduct.name }}</p>
                  <p class="text-sm text-gray-600">
                    SKU: {{ selectedProduct.sku || 'N/A' }}
                  </p>
                  <p class="text-sm font-semibold mt-1">
                    <span class="text-gray-700">Stock en origen:</span>
                    <span :class="availableStock > 0 ? 'text-green-600' : 'text-red-600'">
                      {{ availableStock }} unidades
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  @click="clearProduct"
                  class="text-red-600 hover:text-red-800 text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <p v-if="!form.from_branch_id" class="text-xs text-gray-500 mt-1">
              Primero seleccione la sucursal de origen
            </p>
          </div>

          <!-- Quantity -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Cantidad a Transferir <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.quantity"
              type="number"
              step="0.01"
              min="0.01"
              :max="availableStock"
              required
              :disabled="!selectedProduct"
              placeholder="0.00"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-100"
            />
            <p v-if="selectedProduct && availableStock > 0" class="text-xs text-gray-500 mt-1">
              Máximo disponible: {{ availableStock }}
            </p>
            <p v-if="selectedProduct && availableStock <= 0" class="text-xs text-red-500 mt-1">
              No hay stock disponible en la sucursal origen
            </p>
          </div>

          <!-- Notes -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Notas (Opcional)
            </label>
            <textarea
              v-model="form.notes"
              rows="3"
              maxlength="500"
              placeholder="Describa el motivo de la transferencia..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            ></textarea>
            <p class="text-xs text-gray-500 mt-1">{{ form.notes.length }}/500 caracteres</p>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            @click="resetForm"
            class="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Limpiar
          </button>
          <button
            type="submit"
            :disabled="loading || !canSubmit"
            class="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Procesando...' : 'Registrar Transferencia' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Recent Transfers -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-semibold">Transferencias Recientes</h2>

        <!-- Filter by Branch -->
        <div class="flex gap-2 items-center">
          <label class="text-sm text-gray-600">Filtrar por sucursal:</label>
          <select
            v-model="filterBranchId"
            @change="loadTransfers"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Todas</option>
            <option v-for="branch in branches" :key="branch.id" :value="branch.id">
              {{ branch.name }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="loadingTransfers" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-primary"></div>
        <p class="mt-2 text-gray-600">Cargando transferencias...</p>
      </div>

      <div v-else-if="transfers.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No hay transferencias recientes</h3>
        <p class="mt-1 text-sm text-gray-500">Las transferencias que registre aparecerán aquí.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origen</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destino</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notas</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="transfer in transfers" :key="transfer.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(transfer.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ transfer.product?.name || 'N/A' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ getBranchName(transfer.from_branch_id) || transfer.branch?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ getBranchName(transfer.to_branch_id) || transfer.branch?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                {{ transfer.quantity }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTransferTypeBadgeClass(transfer.type)">
                  {{ getTransferTypeLabel(transfer.type) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                {{ transfer.notes || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useStockStore } from '../../stores/stock'
import { useBranchStore } from '../../stores/branch'
import { useProductStore } from '../../stores/product'
import { toast } from 'vue3-toastify'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const stockStore = useStockStore()
const branchStore = useBranchStore()
const productStore = useProductStore()

const loading = ref(false)
const loadingTransfers = ref(false)
const productSearch = ref('')
const searchResults = ref([])
const selectedProduct = ref(null)
const availableStock = ref(0)
const filterBranchId = ref('')
const branchStocks = ref([])

const form = ref({
  from_branch_id: '',
  to_branch_id: '',
  product_id: '',
  quantity: 0,
  notes: ''
})

const branches = computed(() => branchStore.branches || [])
const availableDestinationBranches = computed(() => {
  if (!form.value.from_branch_id) return []
  return branches.value.filter(b => b.id !== form.value.from_branch_id)
})

const transfers = computed(() => {
  return (stockStore.movements || []).filter(m =>
    m.type === 'transfer_in' || m.type === 'transfer_out'
  )
})

const canSubmit = computed(() => {
  return form.value.from_branch_id &&
         form.value.to_branch_id &&
         form.value.product_id &&
         form.value.quantity > 0 &&
         form.value.quantity <= availableStock.value &&
         availableStock.value > 0
})

async function onFromBranchChange() {
  // Clear product selection when changing origin branch
  if (selectedProduct.value) {
    clearProduct()
  }

  // Reset destination branch if it's the same as origin
  if (form.value.from_branch_id === form.value.to_branch_id) {
    form.value.to_branch_id = ''
  }
}

async function searchProducts() {
  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }

  if (!form.value.from_branch_id) {
    toast.error('Primero seleccione la sucursal de origen')
    return
  }

  try {
    await productStore.fetchProducts({
      search: productSearch.value,
      per_page: 10,
      is_active: true
    })
    searchResults.value = productStore.products
  } catch (error) {
    console.error('Error searching products:', error)
  }
}

function getProductStockInBranch(product) {
  // This is a simplified version - ideally should fetch actual stock per branch
  return product.total_stock || 0
}

async function selectProduct(product) {
  selectedProduct.value = product
  form.value.product_id = product.id
  productSearch.value = product.name
  searchResults.value = []

  // Fetch actual stock for this product in the origin branch
  await fetchProductStockInBranch()
}

async function fetchProductStockInBranch() {
  if (!form.value.from_branch_id || !form.value.product_id) return

  try {
    const response = await stockStore.fetchStockByBranch(form.value.from_branch_id)
    const stockItem = response.find(s => s.product_id === form.value.product_id)
    availableStock.value = stockItem ? parseFloat(stockItem.quantity) : 0
  } catch (error) {
    console.error('Error fetching stock:', error)
    availableStock.value = 0
  }
}

function clearProduct() {
  selectedProduct.value = null
  form.value.product_id = ''
  productSearch.value = ''
  searchResults.value = []
  availableStock.value = 0
  form.value.quantity = 0
}

async function submitTransfer() {
  if (!canSubmit.value) {
    toast.error('Por favor complete todos los campos correctamente')
    return
  }

  if (form.value.quantity > availableStock.value) {
    toast.error(`Stock insuficiente. Disponible: ${availableStock.value}`)
    return
  }

  loading.value = true
  try {
    await stockStore.transferStock({
      from_branch_id: form.value.from_branch_id,
      to_branch_id: form.value.to_branch_id,
      product_id: form.value.product_id,
      quantity: form.value.quantity,
      notes: form.value.notes
    })

    toast.success('Transferencia registrada exitosamente')
    resetForm()
    await loadTransfers()
  } catch (error) {
    const message = error.response?.data?.message || 'Error al registrar la transferencia'
    toast.error(message)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.value = {
    from_branch_id: '',
    to_branch_id: '',
    product_id: '',
    quantity: 0,
    notes: ''
  }
  clearProduct()
}

async function loadTransfers() {
  loadingTransfers.value = true
  try {
    const params = { per_page: 50 }
    if (filterBranchId.value) {
      params.branch_id = filterBranchId.value
    }
    await stockStore.fetchMovements(params)
  } catch (error) {
    console.error('Error loading transfers:', error)
  } finally {
    loadingTransfers.value = false
  }
}

function getBranchName(branchId) {
  const branch = branches.value.find(b => b.id === branchId)
  return branch ? branch.name : 'N/A'
}

function getTransferTypeLabel(type) {
  const labels = {
    transfer_in: 'Entrada',
    transfer_out: 'Salida'
  }
  return labels[type] || type
}

function getTransferTypeBadgeClass(type) {
  const classes = {
    transfer_in: 'px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800',
    transfer_out: 'px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800'
  }
  return classes[type] || 'px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800'
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
    loadTransfers()
  ])
})
</script>
