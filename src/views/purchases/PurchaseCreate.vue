<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          {{ isEditing ? 'Editar Compra' : 'Nueva Compra' }}
        </h1>
        <p class="text-gray-600 mt-1">{{ isEditing ? 'Modifica los datos de la compra' : 'Crea una nueva orden de compra' }}</p>
      </div>
      <router-link to="/purchases" class="btn-secondary">
        Volver
      </router-link>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <!-- Basic Information -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Información General</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Proveedor *</label>
            <select
              v-model="form.supplier_id"
              required
              class="input w-full"
              :disabled="isEditing && form.status !== 'draft'"
            >
              <option value="">Selecciona un proveedor</option>
              <option v-for="supplier in supplierStore.suppliers" :key="supplier.id" :value="supplier.id">
                {{ supplier.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Factura del Proveedor</label>
            <input
              v-model="form.supplier_invoice_number"
              type="text"
              class="input w-full"
              placeholder="Número de factura del proveedor"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Esperada</label>
            <input
              v-model="form.expected_date"
              type="date"
              class="input w-full"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select v-model="form.status" class="input w-full">
              <option value="draft">Borrador</option>
              <option value="ordered">Ordenada</option>
            </select>
          </div>

          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea
              v-model="form.notes"
              rows="3"
              class="input w-full"
              placeholder="Notas adicionales sobre la compra"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Product Search -->
      <div class="card" v-if="!isEditing || form.status === 'draft'">
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
        <div v-if="searchResults.length > 0" class="mt-4 border rounded-lg overflow-hidden">
          <div
            v-for="product in searchResults"
            :key="product.id"
            class="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 flex justify-between items-center"
            @click="addProduct(product)"
          >
            <div>
              <div class="font-medium">{{ product.name }}</div>
              <div class="text-sm text-gray-500">SKU: {{ product.sku }}</div>
            </div>
            <button type="button" class="btn-primary text-sm">Agregar</button>
          </div>
        </div>
      </div>

      <!-- Purchase Items -->
      <div class="card">
        <h2 class="text-lg font-semibold mb-4">Productos de la Compra</h2>

        <div v-if="form.details.length === 0" class="text-center py-8 text-gray-500">
          No hay productos agregados. Busca y agrega productos arriba.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Costo Unit.</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impuesto %</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(item, index) in form.details" :key="index">
                <td class="px-4 py-3">
                  <div class="font-medium text-sm">{{ item.product_name }}</div>
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    step="1"
                    class="input w-20 text-sm"
                    @input="calculateItemSubtotal(index)"
                    :disabled="isEditing && form.status !== 'draft'"
                  />
                </td>
                <td class="px-4 py-3">
                  <input
                    v-model.number="item.cost"
                    type="number"
                    min="0"
                    step="0.01"
                    class="input w-24 text-sm"
                    @input="calculateItemSubtotal(index)"
                    :disabled="isEditing && form.status !== 'draft'"
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
                    :disabled="isEditing && form.status !== 'draft'"
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
                    :disabled="isEditing && form.status !== 'draft'"
                  />
                </td>
                <td class="px-4 py-3 text-right font-medium">
                  L {{ formatMoney(item.subtotal) }}
                </td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="!isEditing || form.status === 'draft'"
                    type="button"
                    @click="removeProduct(index)"
                    class="text-red-600 hover:text-red-800"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Totals -->
          <div class="mt-6 flex justify-end">
            <div class="w-full md:w-1/2 space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">L {{ formatMoney(totals.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Impuestos:</span>
                <span class="font-medium">L {{ formatMoney(totals.tax) }}</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-gray-600">Descuento Global:</span>
                <input
                  v-model.number="form.discount"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input w-32 text-sm text-right"
                  @input="calculateTotals"
                  :disabled="isEditing && form.status !== 'draft'"
                />
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total:</span>
                <span>L {{ formatMoney(totals.total) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex gap-4">
        <button
          type="submit"
          :disabled="purchaseStore.loading || form.details.length === 0"
          class="btn-primary flex-1"
        >
          <span v-if="purchaseStore.loading">{{ isEditing ? 'Actualizando...' : 'Guardando...' }}</span>
          <span v-else>{{ isEditing ? 'Actualizar Compra' : 'Guardar Compra' }}</span>
        </button>
        <router-link to="/purchases" class="btn-secondary flex-1">
          Cancelar
        </router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchase'
import { useSupplierStore } from '@/stores/supplier'
import { useProductStore } from '@/stores/product'

const router = useRouter()
const route = useRoute()
const purchaseStore = usePurchaseStore()
const supplierStore = useSupplierStore()
const productStore = useProductStore()

const isEditing = computed(() => !!route.params.id)
const productSearch = ref('')
const searchResults = ref([])
let searchTimeout = null

const form = reactive({
  supplier_id: '',
  supplier_invoice_number: '',
  expected_date: '',
  status: 'draft',
  notes: '',
  discount: 0,
  details: []
})

const totals = computed(() => {
  const subtotal = form.details.reduce((sum, item) => sum + (item.subtotal || 0), 0)
  const tax = form.details.reduce((sum, item) => {
    const itemTax = ((item.subtotal || 0) * (item.tax_rate || 0)) / 100
    return sum + itemTax
  }, 0)
  const total = subtotal + tax - (form.discount || 0)

  return {
    subtotal,
    tax,
    total
  }
})

onMounted(async () => {
  await supplierStore.fetchSuppliers({ per_page: 1000 })

  if (isEditing.value) {
    await loadPurchase()
  }
})

async function loadPurchase() {
  const purchase = await purchaseStore.fetchPurchaseById(route.params.id)
  if (purchase) {
    form.supplier_id = purchase.supplier_id
    form.supplier_invoice_number = purchase.supplier_invoice_number || ''
    form.expected_date = purchase.expected_date || ''
    form.status = purchase.status
    form.notes = purchase.notes || ''
    form.discount = purchase.discount || 0
    form.details = purchase.details.map(detail => ({
      product_id: detail.product_id,
      variant_id: detail.variant_id,
      product_name: detail.product_name,
      quantity: detail.quantity,
      cost: parseFloat(detail.cost),
      tax_rate: parseFloat(detail.tax_rate || 0),
      discount: parseFloat(detail.discount || 0),
      subtotal: parseFloat(detail.subtotal)
    }))
  }
}

async function handleProductSearch() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  if (productSearch.value.length < 2) {
    searchResults.value = []
    return
  }

  searchTimeout = setTimeout(async () => {
    const results = await productStore.searchProducts(productSearch.value)
    searchResults.value = results
  }, 300)
}

function addProduct(product) {
  const existingIndex = form.details.findIndex(item => item.product_id === product.id)

  if (existingIndex >= 0) {
    form.details[existingIndex].quantity++
    calculateItemSubtotal(existingIndex)
  } else {
    form.details.push({
      product_id: product.id,
      variant_id: null,
      product_name: product.name,
      quantity: 1,
      cost: parseFloat(product.cost || 0),
      tax_rate: parseFloat(product.tax_rate || 0),
      discount: 0,
      subtotal: parseFloat(product.cost || 0)
    })
    calculateItemSubtotal(form.details.length - 1)
  }

  productSearch.value = ''
  searchResults.value = []
}

function removeProduct(index) {
  form.details.splice(index, 1)
  calculateTotals()
}

function calculateItemSubtotal(index) {
  const item = form.details[index]
  const quantity = parseFloat(item.quantity) || 0
  const cost = parseFloat(item.cost) || 0
  const discount = parseFloat(item.discount) || 0

  item.subtotal = (quantity * cost) - discount
  calculateTotals()
}

function calculateTotals() {
  // Totals are computed, this just triggers reactivity
}

async function handleSubmit() {
  if (form.details.length === 0) {
    return
  }

  const data = {
    supplier_id: form.supplier_id,
    supplier_invoice_number: form.supplier_invoice_number,
    expected_date: form.expected_date,
    status: form.status,
    notes: form.notes,
    subtotal: totals.value.subtotal,
    tax: totals.value.tax,
    discount: form.discount,
    total: totals.value.total,
    details: form.details.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.product_name,
      quantity: item.quantity,
      cost: item.cost,
      tax_rate: item.tax_rate,
      discount: item.discount,
      subtotal: item.subtotal
    }))
  }

  try {
    if (isEditing.value) {
      await purchaseStore.updatePurchase(route.params.id, data)
    } else {
      await purchaseStore.createPurchase(data)
    }
    router.push('/purchases')
  } catch (error) {
    // Error already handled in store
  }
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}
</script>

<style scoped>
.input {
  @apply border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
}

.btn-primary {
  @apply px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50;
}

.card {
  @apply bg-white rounded-lg shadow p-6;
}
</style>
