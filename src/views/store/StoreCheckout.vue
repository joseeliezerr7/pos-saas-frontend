<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">Finalizar Compra</h1>

    <div v-if="cartItems.length === 0" class="text-center py-12">
      <p class="text-gray-500 mb-4">No tienes productos en tu carrito</p>
      <router-link :to="`/store/${storeSlug}`" class="text-blue-600 hover:underline">
        Ver productos
      </router-link>
    </div>

    <div v-else-if="orderComplete" class="max-w-lg mx-auto text-center py-12">
      <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Pedido Realizado!</h2>
      <p class="text-gray-600 mb-6">
        Tu pedido #{{ orderNumber }} ha sido recibido. Te contactaremos pronto para confirmar los detalles.
      </p>
      <router-link
        :to="`/store/${storeSlug}`"
        class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
      >
        Continuar Comprando
      </router-link>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Checkout Form -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Customer Info -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Informacion de Contacto</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                v-model="form.customer_name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.customer_name }"
              />
              <p v-if="errors.customer_name" class="text-red-500 text-sm mt-1">{{ errors.customer_name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefono *</label>
              <input
                v-model="form.customer_phone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.customer_phone }"
              />
              <p v-if="errors.customer_phone" class="text-red-500 text-sm mt-1">{{ errors.customer_phone }}</p>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="form.customer_email"
                type="email"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Direccion de Entrega</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Direccion *</label>
              <textarea
                v-model="form.shipping_address"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :class="{ 'border-red-500': errors.shipping_address }"
                placeholder="Calle, numero, colonia, ciudad..."
              ></textarea>
              <p v-if="errors.shipping_address" class="text-red-500 text-sm mt-1">{{ errors.shipping_address }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Instrucciones de entrega, referencias..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Payment Method -->
        <div class="bg-white rounded-xl p-6 shadow-sm">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Metodo de Pago</h2>
          <div class="space-y-3">
            <label
              v-for="method in availablePaymentMethods"
              :key="method.value"
              class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              :class="{ 'border-blue-500 bg-blue-50': form.payment_method === method.value }"
            >
              <input
                v-model="form.payment_method"
                type="radio"
                :value="method.value"
                class="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <div class="ml-3">
                <span class="font-medium text-gray-900">{{ method.label }}</span>
                <p class="text-sm text-gray-500">{{ method.description }}</p>
              </div>
            </label>
          </div>
          <p v-if="errors.payment_method" class="text-red-500 text-sm mt-2">{{ errors.payment_method }}</p>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl p-6 shadow-sm sticky top-24">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Tu Pedido</h2>

          <div class="space-y-3 max-h-60 overflow-y-auto mb-4">
            <div
              v-for="item in cartItems"
              :key="item.product_id"
              class="flex items-center gap-3"
            >
              <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  v-if="item.product_image"
                  :src="item.product_image"
                  class="w-full h-full object-cover"
                />
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">{{ item.product_name }}</p>
                <p class="text-sm text-gray-500">{{ item.quantity }} x {{ formatCurrency(item.price) }}</p>
              </div>
              <span class="text-sm font-medium">{{ formatCurrency(item.price * item.quantity) }}</span>
            </div>
          </div>

          <div class="border-t border-gray-200 pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Subtotal</span>
              <span class="font-medium">{{ formatCurrency(subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Envio</span>
              <span class="font-medium" :class="{ 'text-green-600': shippingCost === 0 }">
                {{ shippingCost === 0 ? 'Gratis' : formatCurrency(shippingCost) }}
              </span>
            </div>
            <div class="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{{ formatCurrency(total) }}</span>
            </div>
          </div>

          <button
            @click="submitOrder"
            :disabled="submitting"
            class="w-full mt-6 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="submitting" class="flex items-center justify-center gap-2">
              <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Procesando...
            </span>
            <span v-else>Confirmar Pedido</span>
          </button>

          <p class="text-xs text-gray-500 text-center mt-4">
            Al confirmar, aceptas nuestros terminos y condiciones
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import publicStoreService from '@/services/publicStoreService'
import { toast } from 'vue3-toastify'

const props = defineProps({
  store: Object,
  storeSlug: String
})

const emit = defineEmits(['update-cart'])

const router = useRouter()

const cartItems = ref([])
const submitting = ref(false)
const orderComplete = ref(false)
const orderNumber = ref('')
const errors = ref({})

const form = ref({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  shipping_address: '',
  notes: '',
  payment_method: 'cash_on_delivery'
})

const paymentMethodLabels = {
  cash_on_delivery: { label: 'Pago contra entrega', description: 'Paga cuando recibas tu pedido' },
  bank_transfer: { label: 'Transferencia bancaria', description: 'Transfiere a nuestra cuenta' },
  card: { label: 'Tarjeta', description: 'Pago con tarjeta de credito/debito' }
}

const availablePaymentMethods = computed(() => {
  const methods = props.store?.payment_methods || ['cash_on_delivery']
  return methods.map(m => ({
    value: m,
    ...paymentMethodLabels[m] || { label: m, description: '' }
  }))
})

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
  // Set default payment method
  if (availablePaymentMethods.value.length > 0) {
    form.value.payment_method = availablePaymentMethods.value[0].value
  }
})

const loadCart = () => {
  const cartKey = `cart_${props.storeSlug}`
  cartItems.value = JSON.parse(localStorage.getItem(cartKey) || '[]')
}

const validateForm = () => {
  errors.value = {}

  if (!form.value.customer_name.trim()) {
    errors.value.customer_name = 'El nombre es requerido'
  }
  if (!form.value.customer_phone.trim()) {
    errors.value.customer_phone = 'El telefono es requerido'
  }
  if (!form.value.shipping_address.trim()) {
    errors.value.shipping_address = 'La direccion es requerida'
  }
  if (!form.value.payment_method) {
    errors.value.payment_method = 'Selecciona un metodo de pago'
  }

  return Object.keys(errors.value).length === 0
}

const submitOrder = async () => {
  if (!validateForm()) {
    toast.error('Por favor completa los campos requeridos')
    return
  }

  submitting.value = true

  try {
    const orderData = {
      ...form.value,
      items: cartItems.value.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      })),
      subtotal: subtotal.value,
      shipping_cost: shippingCost.value,
      total: total.value
    }

    const response = await publicStoreService.processCheckout(props.storeSlug, orderData)

    // Clear cart
    const cartKey = `cart_${props.storeSlug}`
    localStorage.removeItem(cartKey)
    emit('update-cart', 0)

    orderNumber.value = response.data.data?.order_number || response.data.order_number || 'N/A'
    orderComplete.value = true

    toast.success('Pedido realizado con exito!')
  } catch (error) {
    console.error('Error submitting order:', error)
    const message = error.response?.data?.message || 'Error al procesar el pedido'
    toast.error(message)
  } finally {
    submitting.value = false
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(value || 0)
}
</script>
