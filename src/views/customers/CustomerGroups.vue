<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Grupos de Clientes</h1>
        <p class="text-gray-600 mt-1">Gestiona segmentación y precios especiales por grupo</p>
      </div>
      <div class="flex gap-2">
        <button @click="calculateRFM" class="btn-secondary" :disabled="groupStore.loading">
          <span v-if="groupStore.loading">Calculando...</span>
          <span v-else>🔄 Calcular RFM</span>
        </button>
        <button @click="openCreateModal" class="btn-primary">
          + Nuevo Grupo
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div v-if="stats" class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">Total Clientes</h3>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stats.total_customers || 0 }}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">Grupos Activos</h3>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ groupStore.groups.filter(g => g.is_active).length }}</p>
      </div>
      <div class="card">
        <h3 class="text-sm font-medium text-gray-500">Valor Promedio de Vida</h3>
        <p class="text-2xl font-bold text-gray-900 mt-1">L {{ formatNumber(stats.avg_lifetime_value) }}</p>
      </div>
    </div>

    <!-- Groups Table -->
    <div class="card">
      <div v-if="groupStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando grupos...</p>
      </div>

      <div v-else-if="groupStore.groups.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay grupos registrados</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clientes</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prioridad</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="group in groupStore.groups" :key="group.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div
                    class="w-3 h-3 rounded-full mr-2"
                    :style="{ backgroundColor: group.color }"
                  ></div>
                  <span class="font-medium text-gray-900">{{ group.name }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ group.description || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 font-medium">
                {{ group.discount_percentage }}%
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ group.customers_count || 0 }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ group.priority }}
              </td>
              <td class="px-6 py-4">
                <span v-if="group.is_active" class="badge-success">Activo</span>
                <span v-else class="badge-danger">Inactivo</span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button @click="openPricesModal(group)" class="text-purple-600 hover:text-purple-800">
                  Precios
                </button>
                <button @click="openEditModal(group)" class="text-blue-600 hover:text-blue-800">
                  Editar
                </button>
                <button @click="confirmDelete(group)" class="text-red-600 hover:text-red-800">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingGroup ? 'Editar Grupo' : 'Nuevo Grupo' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input w-full"
              placeholder="Nombre del grupo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="form.description"
              rows="2"
              class="input w-full"
              placeholder="Descripción del grupo"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
              <input
                v-model.number="form.discount_percentage"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="input w-full"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
              <input
                v-model.number="form.priority"
                type="number"
                min="0"
                class="input w-full"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              v-model="form.color"
              type="color"
              class="h-10 w-full"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="mr-2"
            />
            <label for="is_active" class="text-sm text-gray-700">Grupo activo</label>
          </div>

          <div class="flex gap-2 pt-4">
            <button type="submit" :disabled="groupStore.loading" class="btn-primary flex-1">
              <span v-if="groupStore.loading">Guardando...</span>
              <span v-else>{{ editingGroup ? 'Actualizar' : 'Crear' }}</span>
            </button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4 text-red-600">Confirmar Eliminación</h2>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de eliminar el grupo <strong>{{ groupToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="groupStore.loading" class="btn-danger flex-1">
            <span v-if="groupStore.loading">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
          <button @click="closeDeleteModal" class="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Prices Modal -->
    <div v-if="showPricesModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          Precios Especiales - {{ selectedGroup?.name }}
        </h2>

        <p class="text-gray-600 mb-4">
          Configura precios especiales para productos específicos en este grupo
        </p>

        <!-- Add New Price Form -->
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-3">Agregar Precio Especial</h3>
          <form @submit.prevent="handleAddPrice" class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="relative product-search-container">
                <label class="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
                <input
                  v-model="searchProduct"
                  type="text"
                  placeholder="Buscar producto..."
                  class="input w-full"
                  @input="handleProductSearch"
                  @focus="showProductDropdown = true"
                />
                <!-- Product Dropdown -->
                <div v-if="showProductDropdown && filteredProducts.length > 0"
                     class="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <button
                    type="button"
                    v-for="product in filteredProducts"
                    :key="product.id"
                    @click="selectProduct(product)"
                    class="w-full px-4 py-2 text-left hover:bg-gray-100 flex justify-between items-center"
                  >
                    <span class="text-sm text-gray-900">{{ product.name }}</span>
                    <span class="text-xs text-gray-500">L {{ formatNumber(product.price) }}</span>
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio Especial (L) *</label>
                <input
                  v-model.number="priceForm.price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  class="input w-full"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Válido Desde</label>
                <input
                  v-model="priceForm.valid_from"
                  type="date"
                  class="input w-full"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Válido Hasta</label>
                <input
                  v-model="priceForm.valid_until"
                  type="date"
                  class="input w-full"
                />
              </div>
            </div>

            <div class="flex gap-2">
              <button type="submit" :disabled="!priceForm.product_id || groupStore.loading" class="btn-primary">
                <span v-if="groupStore.loading">Agregando...</span>
                <span v-else>+ Agregar Precio</span>
              </button>
              <button type="button" @click="clearPriceForm" class="btn-secondary">
                Limpiar
              </button>
            </div>
          </form>
        </div>

        <!-- Prices List -->
        <div v-if="groupStore.prices.length === 0" class="text-center py-8 text-gray-500">
          No hay precios especiales configurados
        </div>

        <div v-else class="overflow-x-auto mb-4">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Normal</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Precio Especial</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vigencia</th>
                <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="price in groupStore.prices" :key="price.id">
                <td class="px-4 py-2 text-sm text-gray-900">{{ price.product?.name }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">{{ price.product?.sku || '-' }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">L {{ formatNumber(price.product?.price) }}</td>
                <td class="px-4 py-2 text-sm font-medium text-green-600">L {{ formatNumber(price.price) }}</td>
                <td class="px-4 py-2 text-sm text-gray-500">
                  <div v-if="price.valid_from || price.valid_until">
                    {{ formatDate(price.valid_from) || 'Desde siempre' }} - {{ formatDate(price.valid_until) || 'Sin límite' }}
                  </div>
                  <div v-else class="text-gray-400">Sin restricción</div>
                </td>
                <td class="px-4 py-2 text-right">
                  <button @click="removePrice(price.id)" class="text-red-600 hover:text-red-800 text-sm">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex gap-2 pt-4 border-t">
          <button @click="closePricesModal" class="btn-secondary flex-1">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCustomerGroupStore } from '@/stores/customerGroup'
import productService from '@/services/productService'

const groupStore = useCustomerGroupStore()

const showModal = ref(false)
const showDeleteModal = ref(false)
const showPricesModal = ref(false)
const editingGroup = ref(null)
const groupToDelete = ref(null)
const selectedGroup = ref(null)
const stats = ref(null)

const form = ref({
  name: '',
  description: '',
  discount_percentage: 0,
  color: '#3B82F6',
  priority: 0,
  is_active: true
})

// Price form
const priceForm = ref({
  product_id: null,
  price: 0,
  valid_from: null,
  valid_until: null
})

const searchProduct = ref('')
const filteredProducts = ref([])
const showProductDropdown = ref(false)

onMounted(async () => {
  await loadGroups()
  await loadStats()

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.product-search-container')) {
      showProductDropdown.value = false
    }
  })
})

async function loadGroups() {
  await groupStore.fetchGroups()
}

async function loadStats() {
  stats.value = await groupStore.fetchStats()
}

async function calculateRFM() {
  const success = await groupStore.calculateRFM()
  if (success) {
    await loadStats()
  }
}

function openCreateModal() {
  editingGroup.value = null
  form.value = {
    name: '',
    description: '',
    discount_percentage: 0,
    color: '#3B82F6',
    priority: 0,
    is_active: true
  }
  showModal.value = true
}

function openEditModal(group) {
  editingGroup.value = group
  form.value = {
    name: group.name,
    description: group.description || '',
    discount_percentage: group.discount_percentage || 0,
    color: group.color || '#3B82F6',
    priority: group.priority || 0,
    is_active: group.is_active
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingGroup.value = null
}

async function handleSubmit() {
  try {
    if (editingGroup.value) {
      await groupStore.updateGroup(editingGroup.value.id, form.value)
    } else {
      await groupStore.createGroup(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(group) {
  groupToDelete.value = group
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  groupToDelete.value = null
}

async function handleDelete() {
  const success = await groupStore.deleteGroup(groupToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}

async function openPricesModal(group) {
  selectedGroup.value = group
  await groupStore.fetchPrices(group.id)
  showPricesModal.value = true
}

function closePricesModal() {
  showPricesModal.value = false
  selectedGroup.value = null
}

async function removePrice(priceId) {
  const success = await groupStore.removePrice(selectedGroup.value.id, priceId)
  if (success) {
    // Prices already reloaded in store
  }
}

async function handleProductSearch() {
  if (searchProduct.value.length < 2) {
    filteredProducts.value = []
    return
  }

  try {
    const response = await productService.search(searchProduct.value)
    filteredProducts.value = response.data.data || []
  } catch (error) {
    console.error('Error searching products:', error)
    filteredProducts.value = []
  }
}

function selectProduct(product) {
  priceForm.value.product_id = product.id
  searchProduct.value = product.name
  showProductDropdown.value = false
  filteredProducts.value = []
}

async function handleAddPrice() {
  if (!priceForm.value.product_id) {
    return
  }

  try {
    await groupStore.setPrice(selectedGroup.value.id, priceForm.value)
    clearPriceForm()
  } catch (error) {
    // Error already handled in store
  }
}

function clearPriceForm() {
  priceForm.value = {
    product_id: null,
    price: 0,
    valid_from: null,
    valid_until: null
  }
  searchProduct.value = ''
  filteredProducts.value = []
}

function formatNumber(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  return date.toLocaleDateString('es-HN')
}
</script>

<style scoped>
.badge-success {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800;
}

.badge-danger {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
