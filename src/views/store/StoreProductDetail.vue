<template>
  <div>
    <!-- Breadcrumb -->
    <nav class="mb-6 text-sm">
      <ol class="flex items-center gap-2 text-gray-500">
        <li>
          <router-link :to="`/store/${storeSlug}`" class="hover:text-blue-600">Inicio</router-link>
        </li>
        <li>/</li>
        <li v-if="product?.category">
          <router-link :to="`/store/${storeSlug}?category=${product.category.id}`" class="hover:text-blue-600">
            {{ product.category.name }}
          </router-link>
        </li>
        <li v-if="product?.category">/</li>
        <li class="text-gray-900 font-medium truncate">{{ product?.name }}</li>
      </ol>
    </nav>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="!product" class="text-center py-12">
      <h2 class="text-xl font-bold text-gray-900 mb-2">Producto no encontrado</h2>
      <router-link :to="`/store/${storeSlug}`" class="text-blue-600 hover:underline">
        Volver al catalogo
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Images -->
      <div class="space-y-4">
        <div class="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            :alt="product.name"
            class="w-full h-full object-contain"
          />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
            <svg class="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        <!-- Thumbnails -->
        <div v-if="productImages.length > 1" class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="(img, index) in productImages"
            :key="index"
            @click="selectedImage = img"
            :class="[
              'w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0',
              selectedImage === img ? 'border-blue-600' : 'border-transparent'
            ]"
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Product Info -->
      <div class="space-y-6">
        <div>
          <p v-if="product.category" class="text-sm text-blue-600 mb-2">{{ product.category.name }}</p>
          <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ product.name }}</h1>
          <p class="text-sm text-gray-500">SKU: {{ product.sku }}</p>
        </div>

        <div class="flex items-baseline gap-4">
          <span class="text-3xl font-bold text-gray-900">{{ formatCurrency(product.price) }}</span>
          <span v-if="product.stock > 0" class="text-green-600 text-sm font-medium">En stock</span>
          <span v-else class="text-red-600 text-sm font-medium">Agotado</span>
        </div>

        <div v-if="product.ecommerce_description || product.description" class="prose prose-sm text-gray-600">
          <p>{{ product.ecommerce_description || product.description }}</p>
        </div>

        <!-- Quantity & Add to Cart -->
        <div v-if="product.stock > 0" class="space-y-4">
          <div class="flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Cantidad:</label>
            <div class="flex items-center border border-gray-300 rounded-lg">
              <button
                @click="quantity = Math.max(1, quantity - 1)"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                </svg>
              </button>
              <input
                v-model.number="quantity"
                type="number"
                min="1"
                :max="product.stock"
                class="w-16 text-center border-0 focus:ring-0"
              />
              <button
                @click="quantity = Math.min(product.stock, quantity + 1)"
                class="px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <span class="text-sm text-gray-500">{{ product.stock }} disponibles</span>
          </div>

          <div class="flex gap-4">
            <button
              @click="addToCart"
              class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Agregar al Carrito
            </button>
            <button
              @click="buyNow"
              class="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Comprar Ahora
            </button>
          </div>
        </div>

        <div v-else class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <p class="font-medium">Producto agotado</p>
          <p class="text-sm">Este producto no esta disponible actualmente</p>
        </div>

        <!-- Product Details -->
        <div class="border-t border-gray-200 pt-6 space-y-4">
          <h3 class="font-medium text-gray-900">Detalles del producto</h3>
          <dl class="grid grid-cols-2 gap-4 text-sm">
            <div v-if="product.brand">
              <dt class="text-gray-500">Marca</dt>
              <dd class="font-medium text-gray-900">{{ product.brand.name }}</dd>
            </div>
            <div v-if="product.unit">
              <dt class="text-gray-500">Unidad</dt>
              <dd class="font-medium text-gray-900">{{ product.unit.name }}</dd>
            </div>
            <div v-if="product.weight">
              <dt class="text-gray-500">Peso</dt>
              <dd class="font-medium text-gray-900">{{ product.weight }} kg</dd>
            </div>
          </dl>
        </div>
      </div>
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
  storeSlug: String
})

const emit = defineEmits(['update-cart'])

const route = useRoute()
const router = useRouter()

const product = ref(null)
const loading = ref(false)
const quantity = ref(1)
const selectedImage = ref(null)

const productImages = computed(() => {
  const images = []
  if (product.value?.image) images.push(product.value.image)
  if (product.value?.ecommerce_images) {
    images.push(...product.value.ecommerce_images)
  }
  return images
})

onMounted(() => {
  loadProduct()
})

watch(() => route.params.productId, () => {
  loadProduct()
})

const loadProduct = async () => {
  loading.value = true
  try {
    const response = await publicStoreService.getProduct(props.storeSlug, route.params.productId)
    product.value = response.data.data
    selectedImage.value = product.value?.image || null
    quantity.value = 1
  } catch (error) {
    console.error('Error loading product:', error)
    product.value = null
  } finally {
    loading.value = false
  }
}

const addToCart = () => {
  const cartKey = `cart_${props.storeSlug}`
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')

  const existingIndex = cart.findIndex(item => item.product_id === product.value.id)

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += quantity.value
  } else {
    cart.push({
      product_id: product.value.id,
      product_name: product.value.name,
      product_image: product.value.image,
      price: product.value.price,
      quantity: quantity.value
    })
  }

  localStorage.setItem(cartKey, JSON.stringify(cart))

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
  emit('update-cart', totalItems)

  toast.success('Producto agregado al carrito')
}

const buyNow = () => {
  addToCart()
  router.push(`/store/${props.storeSlug}/cart`)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(value || 0)
}
</script>
