<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <router-link :to="`/store/${storeSlug}`" class="flex items-center gap-3">
            <img
              v-if="store?.logo_url"
              :src="store.logo_url"
              :alt="store?.store_name"
              class="h-10 w-10 object-contain rounded-lg"
            />
            <div v-else class="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span class="text-xl font-bold text-gray-900">{{ store?.store_name || 'Tienda' }}</span>
          </router-link>

          <!-- Search (Desktop) -->
          <div class="hidden md:flex flex-1 max-w-lg mx-8">
            <div class="relative w-full">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Buscar productos..."
                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                @keyup.enter="handleSearch"
              />
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-4">
            <!-- Cart -->
            <router-link
              :to="`/store/${storeSlug}/cart`"
              class="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span
                v-if="cartItemCount > 0"
                class="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ cartItemCount > 9 ? '9+' : cartItemCount }}
              </span>
            </router-link>

            <!-- Mobile Menu Toggle -->
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 text-gray-600 hover:text-gray-900">
              <svg v-if="!mobileMenuOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Search -->
        <div class="md:hidden pb-4">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar productos..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              @keyup.enter="handleSearch"
            />
            <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Categories Nav (Desktop) -->
      <div class="hidden md:block border-t border-gray-200 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-6 overflow-x-auto py-3 scrollbar-hide">
            <router-link
              :to="`/store/${storeSlug}`"
              class="text-sm font-medium text-gray-600 hover:text-blue-600 whitespace-nowrap"
              :class="{ 'text-blue-600': !selectedCategory }"
            >
              Todos
            </router-link>
            <router-link
              v-for="category in categories"
              :key="category.id"
              :to="`/store/${storeSlug}?category=${category.id}`"
              class="text-sm font-medium text-gray-600 hover:text-blue-600 whitespace-nowrap"
            >
              {{ category.name }}
            </router-link>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Panel -->
      <transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 -translate-y-1"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-gray-200 bg-white">
          <div class="px-4 py-4 space-y-3">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categorias</p>
            <router-link
              :to="`/store/${storeSlug}`"
              @click="mobileMenuOpen = false"
              class="block py-2 text-gray-700 hover:text-blue-600 font-medium"
              :class="{ 'text-blue-600': !selectedCategory }"
            >
              Todos los productos
            </router-link>
            <router-link
              v-for="category in categories"
              :key="category.id"
              :to="`/store/${storeSlug}?category=${category.id}`"
              @click="mobileMenuOpen = false"
              class="block py-2 text-gray-700 hover:text-blue-600"
            >
              {{ category.name }}
            </router-link>
            <div class="border-t border-gray-200 pt-3 mt-3">
              <router-link
                :to="`/store/${storeSlug}/cart`"
                @click="mobileMenuOpen = false"
                class="flex items-center gap-2 py-2 text-gray-700 hover:text-blue-600"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Mi Carrito
                <span v-if="cartItemCount > 0" class="bg-blue-600 text-white text-xs font-bold rounded-full px-2 py-0.5">
                  {{ cartItemCount }}
                </span>
              </router-link>
            </div>
          </div>
        </div>
      </transition>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view
        :store="store"
        :store-slug="storeSlug"
        :categories="categories"
        @update-cart="updateCartCount"
      />
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="font-bold text-gray-900 mb-4">{{ store?.store_name }}</h3>
            <p class="text-sm text-gray-600">{{ store?.description }}</p>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-4">Contacto</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <p v-if="store?.contact_email">Email: {{ store.contact_email }}</p>
              <p v-if="store?.contact_phone">Tel: {{ store.contact_phone }}</p>
            </div>
          </div>
          <div>
            <h3 class="font-bold text-gray-900 mb-4">Metodos de Pago</h3>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="method in store?.payment_methods || []"
                :key="method"
                class="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
              >
                {{ getPaymentMethodLabel(method) }}
              </span>
            </div>
          </div>
        </div>
        <div class="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {{ new Date().getFullYear() }} {{ store?.store_name }}. Todos los derechos reservados.</p>
          <p class="mt-2">Powered by POS SaaS</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import publicStoreService from '@/services/publicStoreService'

const route = useRoute()
const router = useRouter()

const storeSlug = computed(() => route.params.storeSlug)
const store = ref(null)
const categories = ref([])
const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const cartItemCount = ref(0)
const selectedCategory = computed(() => route.query.category)

onMounted(async () => {
  await loadStoreInfo()
  loadCartCount()
})

watch(storeSlug, () => {
  loadStoreInfo()
})

const loadStoreInfo = async () => {
  try {
    const response = await publicStoreService.getStoreInfo(storeSlug.value)
    store.value = response.data.data
    categories.value = response.data.data?.categories || []
  } catch (error) {
    console.error('Error loading store:', error)
    // Store not found or inactive
    if (error.response?.status === 404) {
      router.push('/store-not-found')
    }
  }
}

const loadCartCount = () => {
  // Load from localStorage for guest cart
  const cart = JSON.parse(localStorage.getItem(`cart_${storeSlug.value}`) || '[]')
  cartItemCount.value = cart.reduce((sum, item) => sum + item.quantity, 0)
}

const updateCartCount = (count) => {
  cartItemCount.value = count
}

const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: `/store/${storeSlug.value}`,
      query: { search: searchQuery.value }
    })
  }
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash_on_delivery: 'Pago contra entrega',
    bank_transfer: 'Transferencia',
    card: 'Tarjeta'
  }
  return labels[method] || method
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
