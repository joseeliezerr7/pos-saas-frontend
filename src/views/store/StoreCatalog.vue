<template>
  <div>
    <!-- Hero Banner (if no search/category) -->
    <div v-if="!searchQuery && !categoryFilter" class="mb-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
      <h1 class="text-3xl font-bold mb-2">Bienvenido a {{ store?.store_name }}</h1>
      <p class="text-blue-100">{{ store?.description || 'Encuentra los mejores productos aqui' }}</p>
    </div>

    <!-- Search Results Header -->
    <div v-if="searchQuery" class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Resultados para "{{ searchQuery }}"</h1>
      <p class="text-gray-600">{{ pagination.total }} productos encontrados</p>
    </div>

    <!-- Category Header -->
    <div v-if="categoryFilter && currentCategory" class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900">{{ currentCategory.name }}</h1>
      <p class="text-gray-600">{{ pagination.total }} productos</p>
    </div>

    <!-- Products Grid -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-12">
      <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">No hay productos disponibles</h3>
      <p class="text-gray-500">Intenta con otra busqueda o categoria</p>
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <div
        v-for="product in products"
        :key="product.id"
        class="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow group"
      >
        <router-link :to="`/store/${storeSlug}/product/${product.id}`">
          <div class="aspect-square bg-gray-100 relative overflow-hidden">
            <img
              v-if="product.image"
              :src="product.image"
              :alt="product.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <svg class="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <!-- Badges -->
            <div v-if="product.featured" class="absolute top-2 left-2">
              <span class="px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">Destacado</span>
            </div>
            <div v-if="product.stock <= 0" class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span class="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full">Agotado</span>
            </div>
          </div>
        </router-link>
        <div class="p-4">
          <router-link :to="`/store/${storeSlug}/product/${product.id}`">
            <h3 class="font-medium text-gray-900 mb-1 line-clamp-2 hover:text-blue-600">{{ product.name }}</h3>
          </router-link>
          <p class="text-sm text-gray-500 mb-2">{{ product.category?.name }}</p>
          <div class="flex items-center justify-between">
            <span class="text-lg font-bold text-gray-900">{{ formatCurrency(product.price) }}</span>
            <button
              v-if="product.stock > 0"
              @click="addToCart(product)"
              class="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              title="Agregar al carrito"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.lastPage > 1" class="mt-8 flex justify-center gap-2">
      <button
        @click="goToPage(pagination.currentPage - 1)"
        :disabled="pagination.currentPage === 1"
        class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Anterior
      </button>
      <span class="px-4 py-2 text-gray-600">
        Pagina {{ pagination.currentPage }} de {{ pagination.lastPage }}
      </span>
      <button
        @click="goToPage(pagination.currentPage + 1)"
        :disabled="pagination.currentPage === pagination.lastPage"
        class="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        Siguiente
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import publicStoreService from '@/services/publicStoreService'
import { toast } from 'vue3-toastify'

const props = defineProps({
  store: Object,
  storeSlug: String,
  categories: Array
})

const emit = defineEmits(['update-cart'])

const route = useRoute()
const router = useRouter()

const products = ref([])
const loading = ref(false)
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  total: 0
})

const searchQuery = computed(() => route.query.search || '')
const categoryFilter = computed(() => route.query.category || '')
const currentCategory = computed(() =>
  props.categories?.find(c => c.id == categoryFilter.value)
)

onMounted(() => {
  loadProducts()
})

watch([searchQuery, categoryFilter], () => {
  loadProducts()
})

const loadProducts = async (page = 1) => {
  loading.value = true
  try {
    const params = {
      page,
      search: searchQuery.value,
      category_id: categoryFilter.value
    }
    const response = await publicStoreService.getProducts(props.storeSlug, params)
    products.value = response.data.data || []
    if (response.data.meta) {
      pagination.value = {
        currentPage: response.data.meta.current_page,
        lastPage: response.data.meta.last_page,
        total: response.data.meta.total
      }
    }
  } catch (error) {
    console.error('Error loading products:', error)
    toast.error('Error al cargar productos')
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.lastPage) {
    loadProducts(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const addToCart = (product) => {
  // Use localStorage cart for guests
  const cartKey = `cart_${props.storeSlug}`
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')

  const existingIndex = cart.findIndex(item => item.product_id === product.id)

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += 1
  } else {
    cart.push({
      product_id: product.id,
      product_name: product.name,
      product_image: product.image,
      price: product.price,
      quantity: 1
    })
  }

  localStorage.setItem(cartKey, JSON.stringify(cart))

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  emit('update-cart', totalItems)

  toast.success('Producto agregado al carrito')
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(value || 0)
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
