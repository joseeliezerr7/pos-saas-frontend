<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm px-6 py-5 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-900">Punto de Venta</h1>
        <span v-if="authStore.currentUser" class="text-base text-gray-600">
          Cajero: {{ authStore.currentUser.name }}
        </span>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="clearSale" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-base">
          Nueva Venta
        </button>
        <router-link to="/dashboard" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-base">
          Salir
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Products Section -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Search Bar -->
        <div class="p-5 bg-white border-b">
          <input
            v-model="searchQuery"
            @input="searchProducts"
            type="text"
            placeholder="Buscar productos por nombre, SKU o código de barras..."
            class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            autofocus
          />
        </div>

        <!-- Product Grid -->
        <div class="flex-1 overflow-y-auto p-5">
          <div v-if="productStore.loading" class="text-center py-12">
            <p class="text-gray-500 text-lg">Cargando productos...</p>
          </div>
          <div v-else-if="productStore.products.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <button
              v-for="product in productStore.products"
              :key="product.id"
              @click="addProductToCart(product)"
              class="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-primary-500 hover:scale-105 transition-all active:scale-95 touch-manipulation"
            >
              <div v-if="product.image" class="h-36 mb-3 flex items-center justify-center bg-gray-100 rounded-lg">
                <img :src="getImageUrl(product.image)" :alt="product.name" class="max-h-full max-w-full object-contain" @error="handleImageError" />
              </div>
              <div v-else class="h-36 mb-3 flex items-center justify-center bg-gray-100 rounded-lg">
                <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 text-base mb-2 line-clamp-2 min-h-[3rem]">{{ product.name }}</h3>
              <div v-if="product.total_stock !== undefined" class="text-xs text-gray-500 mb-2">
                Stock: <span :class="product.total_stock > 0 ? 'text-green-600' : 'text-red-600'">{{ product.total_stock }}</span>
              </div>
              <p class="text-2xl font-bold text-primary-600">L {{ formatMoney(product.price) }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Section -->
      <div class="w-[28rem] bg-white border-l flex flex-col">
        <!-- Customer Selection -->
        <div class="p-5 border-b">
          <label class="block text-base font-semibold text-gray-700 mb-3">Cliente</label>
          <div class="flex space-x-2">
            <input
              v-model="customerSearchQuery"
              @input="searchCustomers"
              type="text"
              placeholder="Buscar cliente..."
              class="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <button @click="showCustomerModal = true" class="px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-lg">
              +
            </button>
          </div>
          <div v-if="saleStore.customer" class="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p class="text-base font-semibold text-gray-900">{{ saleStore.customer.name }}</p>
            <p v-if="saleStore.customer.rtn" class="text-sm text-gray-600 mt-1">RTN: {{ saleStore.customer.rtn }}</p>
            <button @click="saleStore.setCustomer(null)" class="mt-2 text-sm text-red-600 font-medium hover:text-red-700">
              Remover
            </button>
          </div>
          <div v-else-if="customerSearchResults.length > 0" class="mt-3 max-h-48 overflow-y-auto border-2 rounded-lg">
            <button
              v-for="customer in customerSearchResults"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 border-b last:border-b-0 touch-manipulation"
            >
              <p class="text-base font-medium">{{ customer.name }}</p>
              <p v-if="customer.rtn" class="text-sm text-gray-600">RTN: {{ customer.rtn }}</p>
            </button>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-5">
          <h3 class="font-bold text-lg text-gray-900 mb-4">Carrito ({{ saleStore.cartItems.length }})</h3>

          <div v-if="saleStore.cartItems.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="text-gray-500 text-base">El carrito está vacío</p>
            <p class="text-gray-400 text-sm mt-1">Toca un producto para agregar</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in saleStore.cartItems"
              :key="index"
              class="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
            >
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-base text-gray-900 flex-1 pr-2">{{ item.product.name }}</h4>
                <button
                  @click="saleStore.removeFromCart(index)"
                  class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 rounded-lg touch-manipulation active:scale-95 transition-all"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Quantity Controls -->
              <div class="mb-3">
                <label class="text-sm font-medium text-gray-600 mb-2 block">Cantidad</label>
                <div class="flex items-center space-x-2">
                  <button
                    @click="decrementQuantity(index)"
                    class="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg text-xl font-bold touch-manipulation active:scale-95 transition-all"
                  >
                    −
                  </button>
                  <input
                    v-model.number="item.quantity"
                    @change="saleStore.updateCartItemQuantity(index, item.quantity)"
                    type="number"
                    min="1"
                    step="1"
                    class="flex-1 text-center px-3 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <button
                    @click="incrementQuantity(index)"
                    class="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xl font-bold touch-manipulation active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Price -->
              <div class="mb-3">
                <label class="text-sm font-medium text-gray-600 mb-2 block">Precio Unitario</label>
                <div class="flex items-center">
                  <span class="text-lg font-medium mr-2">L</span>
                  <input
                    v-model.number="item.price"
                    @change="saleStore.updateCartItemPrice(index, item.price)"
                    type="number"
                    min="0"
                    step="0.01"
                    class="flex-1 px-3 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <!-- Subtotal -->
              <div class="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span class="text-sm font-medium text-gray-600">Subtotal:</span>
                <span class="font-bold text-lg text-gray-900">L {{ formatMoney(item.quantity * item.price) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t-2 p-5 bg-gray-50">
          <div class="space-y-3 mb-5">
            <div class="flex justify-between text-base">
              <span class="font-medium text-gray-600">Subtotal:</span>
              <span class="font-semibold text-gray-900">L {{ formatMoney(cartTotals.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-base">
              <span class="font-medium text-gray-600">Impuesto:</span>
              <span class="font-semibold text-gray-900">L {{ formatMoney(cartTotals.tax) }}</span>
            </div>
            <div class="flex justify-between text-2xl font-bold border-t-2 pt-3">
              <span>Total:</span>
              <span class="text-primary-600">L {{ formatMoney(cartTotals.total) }}</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="mb-4">
            <label class="block text-base font-semibold text-gray-700 mb-3">Método de Pago</label>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                @click="paymentMethod = method.value"
                :class="[
                  'py-3 px-4 rounded-lg font-medium text-base touch-manipulation active:scale-95 transition-all',
                  paymentMethod === method.value
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-300'
                ]"
              >
                {{ method.label }}
              </button>
            </div>
          </div>

          <!-- Amount Paid (for cash) -->
          <div v-if="paymentMethod === 'cash'" class="mb-5">
            <label class="block text-base font-semibold text-gray-700 mb-3">Monto Recibido</label>
            <input
              v-model.number="amountPaid"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-4 py-4 text-xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="0.00"
            />
            <!-- Quick Amount Buttons -->
            <div class="grid grid-cols-4 gap-2 mt-3">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                @click="amountPaid = cartTotals.total + amount"
                class="py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm touch-manipulation active:scale-95 transition-all"
              >
                +{{ amount }}
              </button>
            </div>
            <div v-if="amountPaid >= cartTotals.total && amountPaid > 0" class="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p class="text-lg font-bold text-green-700 text-center">
                Cambio: L {{ formatMoney(amountPaid - cartTotals.total) }}
              </p>
            </div>
          </div>

          <!-- Complete Sale Button -->
          <button
            @click="completeSale"
            :disabled="saleStore.cartItems.length === 0 || saleStore.loading"
            class="w-full py-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-all"
          >
            <span v-if="saleStore.loading">Procesando...</span>
            <span v-else>💰 Completar Venta</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Invoice Ticket Modal -->
    <invoice-ticket
      :show="showInvoiceTicket"
      :sale="completedSale"
      :company="companyData"
      :cai="caiData"
      :invoice-number="completedSale?.sale_number || ''"
      @close="closeInvoiceTicket"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import { useCustomerStore } from '@/stores/customer'
import { useSaleStore } from '@/stores/sale'
import { toast } from 'vue3-toastify'
import InvoiceTicket from '@/components/pos/InvoiceTicket.vue'
import cashRegisterService from '@/services/cashRegisterService'

const authStore = useAuthStore()
const productStore = useProductStore()
const customerStore = useCustomerStore()
const saleStore = useSaleStore()

const searchQuery = ref('')
const customerSearchQuery = ref('')
const customerSearchResults = ref([])
const paymentMethod = ref('cash')
const amountPaid = ref(0)
const showCustomerModal = ref(false)
const showInvoiceTicket = ref(false)
const completedSale = ref({})
const currentCashOpening = ref(null)

// Company and CAI data
const companyData = computed(() => ({
  name: authStore.currentUser?.company?.name || 'Mi Empresa',
  legal_name: authStore.currentUser?.company?.legal_name || 'Mi Empresa S.A. de C.V.',
  rtn: authStore.currentUser?.company?.rtn || '0000000000000',
  address: authStore.currentUser?.company?.address || 'Tegucigalpa, Honduras',
  city: authStore.currentUser?.company?.city || 'Tegucigalpa',
  phone: authStore.currentUser?.company?.phone || '+504 0000-0000',
  email: authStore.currentUser?.company?.email || 'info@empresa.hn'
}))

const caiData = ref(null) // Will be fetched from backend in future

const paymentMethods = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'qr', label: 'QR' },
  { value: 'credit', label: 'Crédito' }
]

const quickAmounts = [0, 10, 20, 50, 100, 200, 500, 1000]

const cartTotals = computed(() => saleStore.getCartTotal())

onMounted(async () => {
  await checkCashRegister()
  loadProducts()
})

async function checkCashRegister() {
  try {
    // Buscar todas las cajas y filtrar la que esté abierta
    const response = await cashRegisterService.getAll()
    if (response.data.success) {
      const cashRegisters = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data.data || []

      // Buscar si alguna caja tiene una apertura activa
      for (const cashRegister of cashRegisters) {
        try {
          const openingResponse = await cashRegisterService.getCurrentOpening(cashRegister.id)
          if (openingResponse.data.success && openingResponse.data.data && openingResponse.data.data.status === 'open') {
            currentCashOpening.value = openingResponse.data.data
            toast.success(`Caja abierta: ${cashRegister.name}`)
            return
          }
        } catch (err) {
          // Esta caja no tiene apertura activa, continuar con la siguiente
          continue
        }
      }

      // No se encontró ninguna caja abierta
      toast.warning('⚠️ No tienes una caja abierta. Por favor, abre una caja en el módulo de Cajas Registradoras antes de realizar ventas.', {
        autoClose: false
      })
    }
  } catch (error) {
    console.error('Error checking cash register:', error)
    toast.error('Error al verificar el estado de la caja')
  }
}

async function loadProducts() {
  await productStore.fetchProducts({ per_page: 50, is_active: true })
}

async function searchProducts() {
  if (searchQuery.value.length >= 2) {
    await productStore.fetchProducts({
      search: searchQuery.value,
      per_page: 50,
      is_active: true
    })
  } else if (searchQuery.value.length === 0) {
    await loadProducts()
  }
}

function addProductToCart(product) {
  saleStore.addToCart(product, 1)
  toast.success(`${product.name} agregado al carrito`)
}

async function searchCustomers() {
  if (customerSearchQuery.value.length >= 2) {
    try {
      const response = await customerStore.searchCustomers(customerSearchQuery.value)
      customerSearchResults.value = response
    } catch (error) {
      console.error(error)
    }
  } else {
    customerSearchResults.value = []
  }
}

function selectCustomer(customer) {
  saleStore.setCustomer(customer)
  customerSearchQuery.value = customer.name
  customerSearchResults.value = []
}

async function completeSale() {
  if (saleStore.cartItems.length === 0) {
    toast.error('El carrito está vacío')
    return
  }

  // Verificar que haya una caja abierta
  if (!currentCashOpening.value) {
    toast.error('No hay una caja abierta. Por favor, abre una caja antes de realizar ventas.')
    return
  }

  if (paymentMethod.value === 'cash' && amountPaid.value < cartTotals.value.total) {
    toast.error('El monto recibido es menor al total')
    return
  }

  const saleData = {
    branch_id: authStore.currentUser.branch_id,
    cash_opening_id: currentCashOpening.value.id,
    customer_id: saleStore.customer?.id || null,
    customer_name: saleStore.customer?.name || 'Consumidor Final',
    customer_rtn: saleStore.customer?.rtn || null,
    items: saleStore.cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      tax_rate: item.tax_rate || 0
    })),
    discount: saleStore.discount,
    payment_method: paymentMethod.value,
    amount_paid: paymentMethod.value === 'cash' ? amountPaid.value : cartTotals.value.total,
    amount_change: paymentMethod.value === 'cash' ? (amountPaid.value - cartTotals.value.total) : 0,
    notes: saleStore.notes
  }

  try {
    const sale = await saleStore.createSale(saleData)
    toast.success(`Venta #${sale.sale_number || sale.id} completada exitosamente`)

    // Prepare sale data for invoice with all details
    completedSale.value = {
      ...sale,
      customer_name: saleData.customer_name,
      customer_rtn: saleData.customer_rtn,
      payment_method: saleData.payment_method,
      amount_paid: saleData.amount_paid,
      amount_change: saleData.amount_change,
      sold_at: new Date().toISOString(),
      details: saleStore.cartItems.map(item => ({
        product: item.product,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        tax_rate: item.tax_rate || 0
      })),
      user: authStore.currentUser,
      branch: authStore.currentUser?.branch
    }

    // Show invoice ticket
    showInvoiceTicket.value = true
  } catch (error) {
    console.error('Error al completar la venta:', error)
  }
}

function closeInvoiceTicket() {
  showInvoiceTicket.value = false
  clearSale()
}

function clearSale() {
  saleStore.clearCart()
  customerSearchQuery.value = ''
  customerSearchResults.value = []
  paymentMethod.value = 'cash'
  amountPaid.value = 0
  searchQuery.value = ''
  loadProducts()
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toFixed(2)
}

// Quantity controls
function incrementQuantity(index) {
  const item = saleStore.cartItems[index]
  saleStore.updateCartItemQuantity(index, item.quantity + 1)
}

function decrementQuantity(index) {
  const item = saleStore.cartItems[index]
  if (item.quantity > 1) {
    saleStore.updateCartItemQuantity(index, item.quantity - 1)
  }
}

// Image helper functions
function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const backendUrl = apiUrl.replace('/api', '')
  return `${backendUrl}${imagePath}`
}

function handleImageError(event) {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/%3E%3C/svg%3E'
  event.target.classList.add('bg-gray-200', 'p-3')
}
</script>
