<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <p class="text-gray-600 mt-1">Gestiona el catálogo de productos</p>
      </div>
      <button v-if="can('create_products')" @click="openCreateModal" class="btn-primary">
        + Nuevo Producto
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre, SKU o código de barras..."
          class="input"
          @input="handleSearch"
        />
        <select v-model="filterCategory" @change="handleFilterChange" class="input">
          <option value="">Todas las categorías</option>
          <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select v-model="filterBrand" @change="handleFilterChange" class="input">
          <option value="">Todas las marcas</option>
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
        <select v-model="filterStatus" @change="handleFilterChange" class="input">
          <option value="">Todos los estados</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Products Grid/Table -->
    <div class="card">
      <div v-if="productStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando productos...</p>
      </div>

      <div v-else-if="productStore.products.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay productos registrados</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU/Código</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marca</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in productStore.products" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-12 w-12 flex-shrink-0 rounded overflow-hidden">
                    <img
                      v-if="product.image"
                      :src="getImageUrl(product.image)"
                      :alt="product.name"
                      class="h-12 w-12 object-cover"
                      @error="handleImageError"
                    />
                    <div v-else class="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="font-medium text-gray-900">{{ product.name }}</div>
                    <div v-if="product.description" class="text-sm text-gray-500 truncate max-w-xs">
                      {{ product.description }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ product.sku || '-' }}</div>
                <div class="text-sm text-gray-500">{{ product.barcode || '-' }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ product.category?.name || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ product.brand?.name || '-' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="text-sm font-medium text-gray-900">L {{ formatPrice(product.price) }}</div>
                <div class="text-xs text-gray-500">Costo: L {{ formatPrice(product.cost) }}</div>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="text-sm">
                  <span :class="getStockClass(product.total_stock, product.stock_min)" class="font-semibold">
                    {{ product.total_stock || 0 }}
                  </span>
                  <div v-if="product.stock_min > 0" class="text-xs text-gray-500 mt-1">
                    Mín: {{ product.stock_min }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <span v-if="product.is_active" class="badge-success">Activo</span>
                <span v-else class="badge-danger">Inactivo</span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button v-if="can('edit_products')" @click="goToVariants(product)" class="text-purple-600 hover:text-purple-800" title="Gestionar variantes">
                  Variantes
                </button>
                <button v-if="can('edit_products')" @click="openEditModal(product)" class="text-blue-600 hover:text-blue-800">
                  Editar
                </button>
                <button v-if="can('delete_products')" @click="confirmDelete(product)" class="text-red-600 hover:text-red-800">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="productStore.pagination.total > productStore.pagination.per_page" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ productStore.products.length }} de {{ productStore.pagination.total }} productos
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(productStore.pagination.current_page - 1)"
            :disabled="productStore.pagination.current_page === 1"
            class="btn-secondary"
          >
            Anterior
          </button>
          <button
            @click="changePage(productStore.pagination.current_page + 1)"
            :disabled="productStore.pagination.current_page * productStore.pagination.per_page >= productStore.pagination.total"
            class="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-lg max-w-5xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingProduct ? 'Editar Producto' : 'Nuevo Producto' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Image Upload Section -->
          <div class="border-b pb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Imagen del Producto</label>
            <div class="flex items-center gap-4">
              <div v-if="imagePreview || form.image" class="relative">
                <img :src="imagePreview || getImageUrl(form.image)" class="w-32 h-32 object-cover rounded-lg border" />
                <button
                  type="button"
                  @click="removeImage"
                  class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
              <div v-else class="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div class="flex-1">
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  @change="handleImageSelect"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="$refs.imageInput.click()"
                  class="btn-secondary"
                  :disabled="uploadingImage"
                >
                  {{ uploadingImage ? 'Subiendo...' : 'Seleccionar Imagen' }}
                </button>
                <p class="text-xs text-gray-500 mt-1">PNG, JPG o GIF (máx. 2MB)</p>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Producto *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input w-full"
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
              <select v-model="form.category_id" required class="input w-full">
                <option value="">Seleccionar categoría</option>
                <option v-for="cat in categoryStore.categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Marca</label>
              <select v-model="form.brand_id" class="input w-full">
                <option value="">Sin marca</option>
                <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                  {{ brand.name }}
                </option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
              <input
                v-model="form.sku"
                type="text"
                class="input w-full"
                placeholder="Código SKU"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Código de Barras</label>
              <input
                v-model="form.barcode"
                type="text"
                class="input w-full"
                placeholder="Código de barras"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Precio de Venta (L) *</label>
              <input
                v-model.number="form.price"
                type="number"
                step="0.01"
                min="0"
                required
                class="input w-full"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Costo (L)</label>
              <input
                v-model.number="form.cost"
                type="number"
                step="0.01"
                min="0"
                class="input w-full"
                placeholder="0.00"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Impuesto (%)</label>
              <input
                v-model.number="form.tax_rate"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="input w-full"
                placeholder="15"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stock Disponible</label>
              <input
                v-model.number="form.stock"
                type="number"
                min="0"
                class="input w-full"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stock Mínimo</label>
              <input
                v-model.number="form.stock_min"
                type="number"
                min="0"
                class="input w-full"
                placeholder="0"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Stock Máximo</label>
              <input
                v-model.number="form.stock_max"
                type="number"
                min="0"
                class="input w-full"
                placeholder="0"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <textarea
                v-model="form.description"
                rows="3"
                class="input w-full"
                placeholder="Descripción del producto"
              ></textarea>
            </div>

            <div class="md:col-span-2 space-y-2">
              <div class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  id="is_active"
                  class="mr-2"
                />
                <label for="is_active" class="text-sm text-gray-700">Producto activo</label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.manage_stock"
                  type="checkbox"
                  id="manage_stock"
                  class="mr-2"
                />
                <label for="manage_stock" class="text-sm text-gray-700">Controlar inventario</label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.is_service"
                  type="checkbox"
                  id="is_service"
                  class="mr-2"
                />
                <label for="is_service" class="text-sm text-gray-700">Es un servicio (no producto físico)</label>
              </div>
            </div>
          </div>

          <!-- Units Section -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-3">
              <h3 class="text-sm font-medium text-gray-700">Unidades de Medida</h3>
              <button
                type="button"
                @click="addUnit"
                class="text-sm bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
              >
                + Agregar Unidad
              </button>
            </div>

            <div v-if="form.units.length === 0" class="text-sm text-gray-500 italic text-center py-4 bg-gray-50 rounded">
              No hay unidades configuradas. Haga clic en "Agregar Unidad" para agregar una.
            </div>

            <div v-else class="space-y-3">
              <div
                v-for="(unit, index) in form.units"
                :key="index"
                class="border rounded-lg p-3 bg-gray-50"
              >
                <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Unidad *</label>
                    <select v-model="unit.unit_id" required class="input w-full text-sm">
                      <option value="">Seleccionar</option>
                      <option v-for="u in unitStore.units" :key="u.id" :value="u.id">
                        {{ u.name }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Cantidad *</label>
                    <input
                      v-model.number="unit.quantity"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      class="input w-full text-sm"
                      placeholder="1"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Precio (L) *</label>
                    <input
                      v-model.number="unit.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="input w-full text-sm"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">Código de Barras</label>
                    <input
                      v-model="unit.barcode"
                      type="text"
                      class="input w-full text-sm"
                      placeholder="Opcional"
                    />
                  </div>

                  <div class="flex items-end gap-2">
                    <div class="flex items-center">
                      <input
                        v-model="unit.is_base_unit"
                        type="checkbox"
                        :id="`base-unit-${index}`"
                        class="mr-1"
                      />
                      <label :for="`base-unit-${index}`" class="text-xs text-gray-600">Base</label>
                    </div>
                    <button
                      type="button"
                      @click="removeUnit(index)"
                      class="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button type="submit" :disabled="productStore.loading" class="btn-primary flex-1">
              <span v-if="productStore.loading">Guardando...</span>
              <span v-else>{{ editingProduct ? 'Actualizar' : 'Crear' }}</span>
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
          ¿Estás seguro de eliminar el producto <strong>{{ productToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="productStore.loading" class="btn-danger flex-1">
            <span v-if="productStore.loading">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
          <button @click="closeDeleteModal" class="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useCategoryStore } from '@/stores/category'
import { useUnitStore } from '@/stores/unit'
import { uploadService } from '@/services/uploadService'
import brandService from '@/services/brandService'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const productStore = useProductStore()
const categoryStore = useCategoryStore()
const unitStore = useUnitStore()
const { can } = usePermissions()

const brands = ref([])

const searchQuery = ref('')
const filterCategory = ref('')
const filterBrand = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingProduct = ref(null)
const productToDelete = ref(null)

const imagePreview = ref(null)
const uploadingImage = ref(false)

const form = ref({
  name: '',
  category_id: '',
  brand_id: '',
  sku: '',
  barcode: '',
  description: '',
  image: '',
  price: 0,
  cost: 0,
  tax_rate: 15,
  stock: 0,
  stock_min: 0,
  stock_max: 0,
  is_active: true,
  is_service: false,
  manage_stock: true,
  units: []
})

onMounted(() => {
  loadProducts()
  loadBrands()
  categoryStore.fetchCategories({ per_page: 100 })
  unitStore.fetchUnits()
})

async function loadBrands() {
  try {
    const response = await brandService.getAll({ all: true })
    if (response.data.success) {
      brands.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading brands:', error)
  }
}

async function loadProducts() {
  const params = {
    page: productStore.pagination.current_page,
    per_page: productStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  if (filterCategory.value) {
    params.category_id = filterCategory.value
  }

  if (filterBrand.value) {
    params.brand_id = filterBrand.value
  }

  if (filterStatus.value !== '') {
    params.is_active = filterStatus.value
  }

  await productStore.fetchProducts(params)

  // Debug: log first product to verify data
  if (productStore.products.length > 0) {
    const firstProduct = productStore.products[0]
    console.log('First product loaded:', {
      name: firstProduct.name,
      total_stock: firstProduct.total_stock,
      stock_min: firstProduct.stock_min,
      stock_max: firstProduct.stock_max,
      image: firstProduct.image,
      imageUrl: getImageUrl(firstProduct.image)
    })
  }
}

function handleSearch() {
  productStore.pagination.current_page = 1
  loadProducts()
}

function handleFilterChange() {
  productStore.pagination.current_page = 1
  loadProducts()
}

function changePage(page) {
  productStore.pagination.current_page = page
  loadProducts()
}

function openCreateModal() {
  editingProduct.value = null
  imagePreview.value = null
  form.value = {
    name: '',
    category_id: '',
    brand_id: '',
    sku: '',
    barcode: '',
    description: '',
    image: '',
    price: 0,
    cost: 0,
    tax_rate: 15,
    stock: 0,
    stock_min: 0,
    stock_max: 0,
    is_active: true,
    is_service: false,
    manage_stock: true,
    units: []
  }
  showModal.value = true
}

function openEditModal(product) {
  editingProduct.value = product
  imagePreview.value = null
  form.value = {
    name: product.name,
    category_id: product.category_id,
    brand_id: product.brand_id || '',
    sku: product.sku || '',
    barcode: product.barcode || '',
    description: product.description || '',
    image: product.image || '',
    price: product.price,
    cost: product.cost,
    tax_rate: product.tax_rate,
    stock: product.total_stock || 0,
    stock_min: product.stock_min,
    stock_max: product.stock_max,
    is_active: product.is_active,
    is_service: product.is_service,
    manage_stock: product.manage_stock,
    units: product.product_units ? product.product_units.map(pu => ({
      unit_id: pu.unit_id,
      quantity: pu.quantity,
      price: pu.price,
      barcode: pu.barcode || '',
      is_base_unit: pu.is_base_unit
    })) : []
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingProduct.value = null
}

async function handleSubmit() {
  try {
    const formData = { ...form.value }

    // Al editar, convertir stock a entero o eliminarlo
    if (editingProduct.value) {
      // El stock no se debe modificar directamente al editar
      // Se gestiona a través de ajustes de inventario
      delete formData.stock
      await productStore.updateProduct(editingProduct.value.id, formData)
    } else {
      // Al crear, asegurar que stock sea un entero
      formData.stock = parseInt(formData.stock) || 0
      await productStore.createProduct(formData)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function goToVariants(product) {
  router.push({ name: 'product-variants', params: { id: product.id } })
}

function confirmDelete(product) {
  productToDelete.value = product
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  productToDelete.value = null
}

async function handleDelete() {
  const success = await productStore.deleteProduct(productToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}

function formatPrice(price) {
  return parseFloat(price).toFixed(2)
}

function getStockClass(stock, minStock) {
  if (stock === 0) return 'text-red-600 font-semibold'
  if (stock <= minStock) return 'text-yellow-600 font-semibold'
  return 'text-green-600 font-semibold'
}

// Image upload functions
async function handleImageSelect(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('La imagen no debe superar 2MB')
    return
  }

  // Show preview
  const reader = new FileReader()
  reader.onload = (e) => {
    imagePreview.value = e.target.result
  }
  reader.readAsDataURL(file)

  // Upload image
  uploadingImage.value = true
  try {
    const result = await uploadService.uploadImage(file)
    if (result.success) {
      form.value.image = result.data.url
    }
  } catch (error) {
    console.error('Error uploading image:', error)
    alert('Error al subir la imagen')
    imagePreview.value = null
  } finally {
    uploadingImage.value = false
  }
}

function removeImage() {
  imagePreview.value = null
  form.value.image = ''
}

// Units management functions
function addUnit() {
  form.value.units.push({
    unit_id: '',
    quantity: 1,
    price: 0,
    barcode: '',
    is_base_unit: false
  })
}

function removeUnit(index) {
  form.value.units.splice(index, 1)
}

// Helper to get full image URL
function getImageUrl(imagePath) {
  if (!imagePath) return ''
  // Si ya es una URL completa, devuélvela tal cual
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  // Si es una ruta relativa, construye la URL completa del backend
  // Eliminar /api de la URL base si existe
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const backendUrl = apiUrl.replace('/api', '')
  const fullUrl = `${backendUrl}${imagePath}`
  console.log('Image URL:', fullUrl) // Debug
  return fullUrl
}

function handleImageError(event) {
  // Si la imagen falla al cargar, mostrar placeholder
  console.error('Error loading image:', event.target.src)
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"%3E%3Cpath d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/%3E%3C/svg%3E'
  event.target.classList.add('bg-gray-200', 'p-2')
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
