<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Catalogo E-commerce</h1>
        <p class="text-gray-600">Gestiona que productos se muestran en tu tienda online</p>
      </div>
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <span class="px-3 py-1 bg-green-100 text-green-800 rounded-full">
          {{ stats.visible }} visibles
        </span>
        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
          {{ stats.featured }} destacados
        </span>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar productos..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="debouncedSearch"
          />
        </div>
        <div class="flex gap-2 flex-wrap">
          <select v-model="categoryFilter" @change="loadProducts" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Todas las categorias</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
          </select>
          <select v-model="visibilityFilter" @change="loadProducts" class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Todos</option>
            <option value="visible">Visibles</option>
            <option value="hidden">Ocultos</option>
            <option value="featured">Destacados</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
    <div v-else-if="products.length === 0" class="bg-white rounded-lg shadow-sm p-8 text-center text-gray-500">
      <svg class="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <p>No se encontraron productos</p>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
      >
        <div class="relative">
          <div class="aspect-square bg-gray-100">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <!-- Badges -->
          <div class="absolute top-2 left-2 flex flex-col gap-1">
            <span v-if="product.featured" class="px-2 py-1 text-xs font-medium rounded-full bg-yellow-500 text-white">
              Destacado
            </span>
            <span v-if="!product.show_in_ecommerce" class="px-2 py-1 text-xs font-medium rounded-full bg-gray-500 text-white">
              Oculto
            </span>
          </div>
          <!-- Quick Actions -->
          <div class="absolute top-2 right-2 flex flex-col gap-1">
            <button
              @click="toggleVisibility(product)"
              :class="[
                'p-2 rounded-full shadow-md transition-colors',
                product.show_in_ecommerce ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              ]"
              :title="product.show_in_ecommerce ? 'Ocultar de tienda' : 'Mostrar en tienda'"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="product.show_in_ecommerce" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path v-if="product.show_in_ecommerce" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
            <button
              @click="toggleFeatured(product)"
              :class="[
                'p-2 rounded-full shadow-md transition-colors',
                product.featured ? 'bg-yellow-500 text-white hover:bg-yellow-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              ]"
              :title="product.featured ? 'Quitar destacado' : 'Marcar como destacado'"
            >
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div class="p-4">
          <h3 class="font-medium text-gray-900 truncate">{{ product.name }}</h3>
          <p class="text-sm text-gray-500">{{ product.category?.name || 'Sin categoria' }}</p>
          <div class="mt-2 flex items-center justify-between">
            <span class="font-bold text-gray-900">{{ formatCurrency(product.price) }}</span>
            <span class="text-sm text-gray-500">Stock: {{ getProductStock(product) }}</span>
          </div>
          <button
            @click="openEditModal(product)"
            class="mt-3 w-full py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Editar Info E-commerce
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="flex items-center justify-center gap-2">
      <button
        @click="goToPage(pagination.currentPage - 1)"
        :disabled="pagination.currentPage === 1"
        class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      <span class="text-sm text-gray-600">
        Pagina {{ pagination.currentPage }} de {{ pagination.lastPage }}
      </span>
      <button
        @click="goToPage(pagination.currentPage + 1)"
        :disabled="pagination.currentPage === pagination.lastPage"
        class="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>

    <!-- Edit Modal -->
    <div v-if="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900">Editar Informacion E-commerce</h2>
            <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <form @submit.prevent="saveProduct" class="p-6 space-y-4">
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img v-if="editingProduct?.image" :src="editingProduct.image" class="w-full h-full object-cover" />
            </div>
            <div>
              <h3 class="font-medium text-gray-900">{{ editingProduct?.name }}</h3>
              <p class="text-sm text-gray-500">SKU: {{ editingProduct?.sku }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex items-center">
              <input type="checkbox" id="show_in_ecommerce" v-model="editForm.show_in_ecommerce" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label for="show_in_ecommerce" class="ml-2 text-sm text-gray-700">Mostrar en tienda</label>
            </div>
            <div class="flex items-center">
              <input type="checkbox" id="featured" v-model="editForm.featured" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <label for="featured" class="ml-2 text-sm text-gray-700">Producto destacado</label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion E-commerce</label>
            <textarea
              v-model="editForm.ecommerce_description"
              rows="4"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripcion detallada para la tienda online..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Meta Titulo (SEO)</label>
              <input
                type="text"
                v-model="editForm.meta_title"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Titulo para buscadores"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Orden de Visualizacion</label>
              <input
                type="number"
                v-model.number="editForm.ecommerce_sort_order"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Meta Descripcion (SEO)</label>
            <textarea
              v-model="editForm.meta_description"
              rows="2"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Descripcion para buscadores..."
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" @click="closeEditModal" class="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" :disabled="saving" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue'
import { useEcommerceStore } from '@/stores/ecommerce'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'

const ecommerceStore = useEcommerceStore()
const { products, categories, catalogPagination, loading } = storeToRefs(ecommerceStore)

const search = ref('')
const categoryFilter = ref('')
const visibilityFilter = ref('')
const showEditModal = ref(false)
const editingProduct = ref(null)
const saving = ref(false)

const editForm = reactive({
  show_in_ecommerce: false,
  featured: false,
  ecommerce_description: '',
  meta_title: '',
  meta_description: '',
  ecommerce_sort_order: 0
})

const pagination = computed(() => catalogPagination.value)
const stats = computed(() => {
  return {
    visible: products.value.filter(p => p.show_in_ecommerce).length,
    featured: products.value.filter(p => p.featured).length
  }
})

let searchTimeout = null
const debouncedSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadProducts()
  }, 300)
}

onMounted(() => {
  loadProducts()
  ecommerceStore.fetchCategories()
})

const loadProducts = async (page = 1) => {
  const params = {
    page,
    search: search.value,
    category_id: categoryFilter.value,
    visibility: visibilityFilter.value
  }
  await ecommerceStore.fetchProducts(params)
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.lastPage) {
    loadProducts(page)
  }
}

const toggleVisibility = async (product) => {
  try {
    await ecommerceStore.updateProductEcommerce(product.id, {
      show_in_ecommerce: !product.show_in_ecommerce
    })
    product.show_in_ecommerce = !product.show_in_ecommerce
  } catch (error) {
    console.error('Error:', error)
  }
}

const toggleFeatured = async (product) => {
  try {
    await ecommerceStore.updateProductEcommerce(product.id, {
      featured: !product.featured
    })
    product.featured = !product.featured
  } catch (error) {
    console.error('Error:', error)
  }
}

const openEditModal = (product) => {
  editingProduct.value = product
  editForm.show_in_ecommerce = product.show_in_ecommerce || false
  editForm.featured = product.featured || false
  editForm.ecommerce_description = product.ecommerce_description || ''
  editForm.meta_title = product.meta_title || ''
  editForm.meta_description = product.meta_description || ''
  editForm.ecommerce_sort_order = product.ecommerce_sort_order || 0
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingProduct.value = null
}

const saveProduct = async () => {
  saving.value = true
  try {
    await ecommerceStore.updateProductEcommerce(editingProduct.value.id, { ...editForm })
    // Update local product data
    Object.assign(editingProduct.value, editForm)
    closeEditModal()
  } catch (error) {
    console.error('Error:', error)
  } finally {
    saving.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(value || 0)
}

const getProductStock = (product) => {
  // If stock is an array (from multiple branches), sum the quantities
  if (Array.isArray(product.stock)) {
    return product.stock.reduce((sum, s) => sum + (s.quantity || 0), 0)
  }
  // If it's already a number or total_stock exists
  return product.total_stock ?? product.stock ?? 0
}
</script>
