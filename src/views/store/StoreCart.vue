<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Tu Carrito</h1>

    <div v-if="cartItems.length === 0" class="text-center py-12">
      <svg class="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <h2 class="text-xl font-medium text-gray-900 mb-2">Tu carrito esta vacio</h2>
      <p class="text-gray-500 mb-6">Agrega productos para comenzar tu compra</p>
      <router-link
        :to="`/store/${storeSlug}`"
        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Ver Productos
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="lg:col-span-2 space-y-4">
        <div
          v-for="item in cartItems"
          :key="item.product_id"
          class="bg-white rounded-xl p-4 shadow-sm flex gap-4"
        >
          <div class="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            <img
              v-if="item.product_image"
              :src="item.product_image"
              :alt="item.product_name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex items-center justify-center text-gray-300">
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <router-link
              :to="`/store/${storeSlug}/product/${item.product_id}`"
              class="font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {{ item.product_name }}
            </router-link>
            <p class="text-lg font-bold text-gray-900 mt-1">{{ formatCurrency(item.price) }}</p>
          </div>

          <div class="flex flex-col items-end justify-between">
            <button
              @click="removeItem(item.product_id)"
              class="text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            <div class="flex items-center border border-gray-300 rounded-lg">
              <button
                @click="updateQuantity(item.product_id, item.quantity - 1)"
                class="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                -
              </button>
              <span class="px-3 py-1 text-center min-w-[40px]">{{ item.quantity }}</span>
              <button
                @click="updateQuantity(item.product_id, item.quantity + 1)"
                class="px-3 py-1 text-gray-600 hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between items-center pt-4">
          <button
            @click="clearCart"
            class="text-red-600 hover:text-red-700 font-medium"
          >
            Vaciar carrito
          </button>
          <router-link
            :to="`/store/${storeSlug}`"
            class="text-blue-600 hover:text-blue-700 font-medium"
          >
            Seguir comprando
          </router-link>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl p-6 shadow-sm sticky top-24">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h2>

          <div class="space-y-3 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal ({{ totalItems }} items)</span>
              <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div v-if="shippingCost > 0" class="flex justify-between text-sm">
              <span class="text-gray-600">Envio</span>
              <span class="font-medium">{{ formatCurrency(shippingCost) }}</span>
            </div>
            <div v-else class="flex justify-between text-sm text-green-600">
              <span>Envio</span>
              <span class="font-medium">Gratis</span>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 mb-6">
            <div class="flex justify-between">
              <span class="text-lg font-bold text-gray-900">Total</span>
              <span class="text-lg font-bold text-gray-900">{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <router-link
            :to="`/store/${storeSlug}/checkout`"
            class="w-full block text-center bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Proceder al Checkout
          </router-link>

          <div v-if="store?.min_order_amount && subtotal < store.min_order_amount" class="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
            <p>Pedido minimo: {{ formatCurrency(store.min_order_amount) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'

const props = defineProps({
  store: Object,
  storeSlug: String
})

const emit = defineEmits(['update-cart'])

const cartItems = ref([])

const totalItems = computed(() =>
  cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
)

const subtotal = computed(() =>
  cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity), 0)
)

const shippingCost = computed(() => {
  if (!props.store?.shipping_cost) return 0
  if (props.store?.free_shipping_threshold && subtotal.value >= props.store.free_shipping_threshold) {
    return 0
  }
  return parseFloat(props.store.shipping_cost) || 0
})

const total = computed(() => subtotal.value + shippingCost.value)

onMounted(() => {
  loadCart()
})

const loadCart = () => {
  const cartKey = `cart_${props.storeSlug}`
  cartItems.value = JSON.parse(localStorage.getItem(cartKey) || '[]')
}

const updateQuantity = (productId, newQuantity) => {
  if (newQuantity < 1) {
    removeItem(productId)
    return
  }

  const cartKey = `cart_${props.storeSlug}`
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
  const index = cart.findIndex(item => item.product_id === productId)

  if (index >= 0) {
    cart[index].quantity = newQuantity
    localStorage.setItem(cartKey, JSON.stringify(cart))
    cartItems.value = cart
    emit('update-cart', cart.reduce((sum, item) => sum + item.quantity, 0))
  }
}

const removeItem = (productId) => {
  const cartKey = `cart_${props.storeSlug}`
  const cart = JSON.parse(localStorage.getItem(cartKey) || '[]')
  const newCart = cart.filter(item => item.product_id !== productId)

  localStorage.setItem(cartKey, JSON.stringify(newCart))
  cartItems.value = newCart
  emit('update-cart', newCart.reduce((sum, item) => sum + item.quantity, 0))
  toast.success('Producto eliminado del carrito')
}

const clearCart = () => {
  const cartKey = `cart_${props.storeSlug}`
  localStorage.removeItem(cartKey)
  cartItems.value = []
  emit('update-cart', 0)
  toast.success('Carrito vaciado')
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
