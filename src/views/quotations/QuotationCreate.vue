<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Cotización' : 'Nueva Cotización' }}
        </h1>
        <p class="text-gray-600 mt-1">
          {{ isEditing ? 'Modifica los datos de la cotización' : 'Crea una nueva cotización para tus clientes' }}
        </p>
      </div>
      <router-link to="/quotations" class="btn-secondary">
        Volver
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Customer Information -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Información del Cliente</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
            <select
              v-model="form.customer_id"
              @change="handleCustomerChange"
              class="input w-full"
            >
              <option value="">Cliente nuevo / Sin registro</option>
              <option v-for="customer in customerStore.customers" :key="customer.id" :value="customer.id">
                {{ customer.name }} {{ customer.rtn ? `- ${customer.rtn}` : '' }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Cliente *</label>
            <input
              v-model="form.customer_name"
              type="text"
              required
              class="input w-full"
              placeholder="Nombre completo del cliente"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">RTN / Identificación</label>
            <input
              v-model="form.customer_rtn"
              type="text"
              class="input w-full"
              placeholder="RTN o número de identificación"
              maxlength="14"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              v-model="form.customer_email"
              type="email"
              class="input w-full"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input
              v-model="form.customer_phone"
              type="tel"
              class="input w-full"
              placeholder="9999-9999"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Válido Hasta</label>
            <input
              v-model="form.valid_until"
              type="date"
              class="input w-full"
              :min="tomorrow"
            />
          </div>
        </div>
      </div>

      <!-- Product Search -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Buscar Productos</h2>
        <div class="flex gap-4">
          <input
            v-model="productSearch"
            type="text"
            class="input flex-1"
            placeholder="Buscar producto por nombre, SKU o código de barras..."
            @input="handleProductSearch"
          />
        </div>

        <!-- Product Search Results -->
        <div v-if="searchResults.length > 0" class="mt-4 border rounded-lg overflow-hidden max-h-60 overflow-y-auto">
          <div
            v-for="product in searchResults"
            :key="product.id"
            class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
            @click="addProduct(product)"
          >
            <div>
              <div class="font-medium">{{ product.name }}</div>
              <div class="text-sm text-gray-500">
                SKU: {{ product.sku }} | Precio: L {{ formatCurrency(product.price) }}
              </div>
            </div>
            <button type="button" class="btn-primary text-sm">Agregar</button>
          </div>
        </div>
      </div>

      <!-- Quotation Items -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Productos de la Cotización</h2>

        <div v-if="form.items.length === 0" class="text-center py-8 text-gray-500">
          No hay productos agregados. Busca y agrega productos arriba.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impuesto %</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in form.items" :key="index">
                <td class="px-4 py-3">
                  <div class="font-medium text-sm">{{ item.product_name }}</div>
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="0.01"
                    step="0.01"
                    class="input w-20 text-sm"
                    @input="calculateItemSubtotal(index)"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.price"
                    type="number"
                    min="0"
                    step="0.01"
                    class="input w-24 text-sm"
                    @input="calculateItemSubtotal(index)"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.tax_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    class="input w-20 text-sm"
                    @input="calculateItemSubtotal(index)"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.discount"
                    type="number"
                    min="0"
                    step="0.01"
                    class="input w-24 text-sm"
                    @input="calculateItemSubtotal(index)"
                  />
                </td>
                <td class="px-4 py-3 text-right font-medium">
                  L {{ formatCurrency(item.subtotal || 0) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals & Notes -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Notes -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Notas y Condiciones</h2>
          <textarea
            v-model="form.notes"
            rows="6"
            class="input w-full"
            placeholder="Notas adicionales, términos y condiciones de la cotización..."
          ></textarea>
        </div>

        <!-- Totals -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Resumen</h2>
          <dl class="space-y-2">
            <div class="flex justify-between text-sm">
              <dt class="text-gray-600">Subtotal:</dt>
              <dd class="font-medium">L {{ formatCurrency(totals.subtotal) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-600">Descuento:</dt>
              <dd class="font-medium text-red-600">- L {{ formatCurrency(totals.discount) }}</dd>
            </div>
            <div class="flex justify-between text-sm">
              <dt class="text-gray-600">Impuestos:</dt>
              <dd class="font-medium">L {{ formatCurrency(totals.tax) }}</dd>
            </div>
            <div class="border-t pt-2 flex justify-between text-lg font-bold">
              <dt>Total:</dt>
              <dd class="text-primary-600">L {{ formatCurrency(totals.total) }}</dd>
            </div>
          </dl>

          <div class="mt-6 space-y-3">
            <button
              type="submit"
              :disabled="loading || form.items.length === 0"
              class="btn-primary w-full"
            >
              <span v-if="loading">Guardando...</span>
              <span v-else>{{ isEditing ? 'Actualizar Cotización' : 'Crear Cotización' }}</span>
            </button>
            <router-link to="/quotations" class="btn-secondary w-full block text-center">
              Cancelar
            </router-link>
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuotationStore } from '@/stores/quotation'
import { useCustomerStore } from '@/stores/customer'
import { useProductStore } from '@/stores/product'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const quotationStore = useQuotationStore()
const customerStore = useCustomerStore()
const productStore = useProductStore()
const authStore = useAuthStore()

const { loading } = storeToRefs(quotationStore)

const isEditing = computed(() => !!route.params.id)
const productSearch = ref('')
const searchResults = ref([])

const form = ref({
  branch_id: null,
  customer_id: null,
  customer_name: '',
  customer_rtn: '',
  customer_email: '',
  customer_phone: '',
  valid_until: '',
  items: [],
  notes: '',
  discount: 0
})

const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
})

const totals = computed(() => {
  const subtotal = form.value.items.reduce((sum, item) => {
    const itemSubtotal = (item.price * item.quantity) - (item.discount || 0)
    return sum + itemSubtotal
  }, 0)

  const tax = form.value.items.reduce((sum, item) => {
    const itemSubtotal = (item.price * item.quantity) - (item.discount || 0)
    const itemTax = itemSubtotal * ((item.tax_rate || 0) / 100)
    return sum + itemTax
  }, 0)

  const discount = form.value.items.reduce((sum, item) => sum + (item.discount || 0), 0)
  const total = subtotal + tax

  return { subtotal, discount, tax, total }
})

onMounted(async () => {
  // Load data
  await Promise.all([
    customerStore.fetchCustomers(),
    productStore.fetchProducts()
  ])

  // Set default branch (fallback to 1 if user doesn't have branch_id)
  form.value.branch_id = authStore.currentUser?.branch_id || 1

  // Load quotation if editing
  if (isEditing.value) {
    await loadQuotation()
  }
})

async function loadQuotation() {
  try {
    const quotation = await quotationStore.fetchQuotationById(route.params.id)

    form.value = {
      branch_id: quotation.branch_id,
      customer_id: quotation.customer_id,
      customer_name: quotation.customer_name,
      customer_rtn: quotation.customer_rtn || '',
      customer_email: quotation.customer_email || '',
      customer_phone: quotation.customer_phone || '',
      valid_until: quotation.valid_until ? quotation.valid_until.split('T')[0] : '',
      items: quotation.details.map(detail => ({
        product_id: detail.product_id,
        variant_id: detail.variant_id,
        product_name: detail.product_name,
        quantity: detail.quantity,
        price: detail.price,
        discount: detail.discount || 0,
        tax_rate: detail.tax_rate || 0,
        subtotal: detail.subtotal
      })),
      notes: quotation.notes || '',
      discount: quotation.discount || 0
    }
  } catch (error) {
    console.error('Error loading quotation:', error)
  }
}

function handleCustomerChange() {
  if (form.value.customer_id) {
    const customer = customerStore.customers.find(c => c.id === form.value.customer_id)
    if (customer) {
      form.value.customer_name = customer.name
      form.value.customer_rtn = customer.rtn || ''
      form.value.customer_email = customer.email || ''
      form.value.customer_phone = customer.phone || ''
    }
  }
}

function handleProductSearch() {
  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }

  const search = productSearch.value.toLowerCase()
  searchResults.value = productStore.products.filter(product =>
    product.name.toLowerCase().includes(search) ||
    product.sku?.toLowerCase().includes(search) ||
    product.barcode?.toLowerCase().includes(search)
  ).slice(0, 10)
}

function addProduct(product) {
  const existingIndex = form.value.items.findIndex(item => item.product_id === product.id)

  if (existingIndex >= 0) {
    form.value.items[existingIndex].quantity += 1
    calculateItemSubtotal(existingIndex)
  } else {
    form.value.items.push({
      product_id: product.id,
      variant_id: null,
      product_name: product.name,
      quantity: 1,
      price: product.price || 0,
      discount: 0,
      tax_rate: product.tax_rate || 15,
      subtotal: product.price || 0
    })
    calculateItemSubtotal(form.value.items.length - 1)
  }

  productSearch.value = ''
  searchResults.value = []
}

function calculateItemSubtotal(index) {
  const item = form.value.items[index]
  const subtotal = (item.price * item.quantity) - (item.discount || 0)
  const tax = subtotal * ((item.tax_rate || 0) / 100)
  item.subtotal = subtotal + tax
}

function removeItem(index) {
  form.value.items.splice(index, 1)
}

async function handleSubmit() {
  if (form.value.items.length === 0) {
    alert('Debes agregar al menos un producto a la cotización')
    return
  }

  try {
    if (isEditing.value) {
      await quotationStore.updateQuotation(route.params.id, form.value)
    } else {
      await quotationStore.createQuotation(form.value)
    }
    router.push('/quotations')
  } catch (error) {
    console.error('Error saving quotation:', error)
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value || 0)
}
</script>
