<template>
  <div class="max-w-6xl mx-auto">
    <!-- Header -->
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold text-gray-800">Nueva Devolución</h1>
        <button
          @click="goBack"
          class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    </div>

    <!-- Step 1: Search and Select Sale -->
    <div class="mb-6 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">1. Buscar Venta</h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Número de Venta</label>
          <input
            v-model="saleSearch.sale_number"
            type="text"
            placeholder="VEN-00000001"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            v-model="saleSearch.date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div class="flex items-end">
          <button
            @click="searchSales"
            :disabled="searchLoading"
            class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            {{ searchLoading ? 'Buscando...' : 'Buscar' }}
          </button>
        </div>
      </div>

      <!-- Sales Results -->
      <div v-if="salesResults.length > 0" class="mt-4">
        <h3 class="text-sm font-medium text-gray-700 mb-2">Resultados:</h3>
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div
            v-for="sale in salesResults"
            :key="sale.id"
            @click="selectSale(sale)"
            class="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            :class="selectedSale?.id === sale.id ? 'border-primary-500 bg-primary-50' : 'border-gray-200'"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-900">{{ sale.sale_number }}</p>
                <p class="text-sm text-gray-600">{{ sale.customer_name || 'Cliente General' }}</p>
                <p class="text-xs text-gray-500">{{ formatDate(sale.sold_at) }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">{{ formatCurrency(sale.total) }}</p>
                <p class="text-xs text-gray-500">{{ sale.details?.length || 0 }} productos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 2: Select Products to Return -->
    <div v-if="selectedSale" class="mb-6 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">2. Seleccionar Productos a Devolver</h2>

      <div class="space-y-3">
        <div
          v-for="(detail, index) in selectedSale.details"
          :key="detail.id"
          class="p-4 border rounded-lg"
        >
          <div class="flex items-start space-x-4">
            <!-- Checkbox -->
            <div class="flex items-center pt-2">
              <input
                v-model="returnItems[index].selected"
                type="checkbox"
                class="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
            </div>

            <!-- Product Info -->
            <div class="flex-1">
              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-medium text-gray-900">{{ detail.product_name }}</h4>
                  <p class="text-sm text-gray-600">SKU: {{ detail.product_sku }}</p>
                  <p class="text-sm text-gray-600">Cantidad vendida: {{ detail.quantity }}</p>
                </div>
                <div class="text-right">
                  <p class="font-semibold text-gray-900">{{ formatCurrency(detail.unit_price) }}</p>
                  <p class="text-xs text-gray-500">Precio unitario</p>
                </div>
              </div>

              <!-- Return Quantity and Reason -->
              <div v-if="returnItems[index].selected" class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Cantidad a devolver</label>
                  <input
                    v-model.number="returnItems[index].quantity_returned"
                    type="number"
                    min="1"
                    :max="detail.quantity"
                    step="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                  <select
                    v-model="returnItems[index].reason"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Seleccionar motivo</option>
                    <option value="defective">Producto defectuoso</option>
                    <option value="wrong_product">Producto incorrecto</option>
                    <option value="not_satisfied">Cliente insatisfecho</option>
                    <option value="expired">Producto vencido</option>
                    <option value="other">Otro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Step 3: Return Details -->
    <div v-if="selectedSale && hasSelectedItems" class="mb-6 bg-white rounded-lg shadow p-6">
      <h2 class="text-lg font-semibold text-gray-800 mb-4">3. Detalles de la Devolución</h2>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Left Column -->
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Método de Reembolso *</label>
            <select
              v-model="returnData.refund_method"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="">Seleccionar método</option>
              <option value="cash">Efectivo</option>
              <option value="card">Tarjeta</option>
              <option value="transfer">Transferencia</option>
              <option value="credit">Nota de Crédito</option>
              <option value="mixed">Mixto</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Razón de la Devolución</label>
            <textarea
              v-model="returnData.reason"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descripción general de la devolución..."
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
            <textarea
              v-model="returnData.notes"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Notas internas..."
            ></textarea>
          </div>
        </div>

        <!-- Right Column - Summary -->
        <div>
          <div class="bg-gray-50 rounded-lg p-4 sticky top-4">
            <h3 class="font-semibold text-gray-800 mb-3">Resumen de Devolución</h3>

            <div class="space-y-2 mb-4">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Productos:</span>
                <span class="font-medium">{{ selectedItemsCount }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal:</span>
                <span class="font-medium">{{ formatCurrency(returnTotals.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Impuesto:</span>
                <span class="font-medium">{{ formatCurrency(returnTotals.tax) }}</span>
              </div>
              <div class="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                <span>Total a Reembolsar:</span>
                <span class="text-primary-600">{{ formatCurrency(returnTotals.total) }}</span>
              </div>
            </div>

            <div v-if="returnData.refund_method" class="mt-4 pt-4 border-t">
              <label class="block text-sm font-medium text-gray-700 mb-2">Monto a Reembolsar</label>
              <div class="flex items-center">
                <span class="text-lg font-medium mr-2">L</span>
                <input
                  v-model.number="returnData.refund_amount"
                  type="number"
                  min="0"
                  :max="returnTotals.total"
                  step="0.01"
                  class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p class="text-xs text-gray-500 mt-1">Máximo: {{ formatCurrency(returnTotals.total) }}</p>
            </div>

            <button
              @click="processReturn"
              :disabled="!canProcessReturn || processing"
              class="w-full mt-6 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {{ processing ? 'Procesando...' : 'Procesar Devolución' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSaleStore } from '@/stores/sale'
import { useReturnStore } from '@/stores/return'
import { toast } from 'vue3-toastify'

const router = useRouter()
const saleStore = useSaleStore()
const returnStore = useReturnStore()

const searchLoading = ref(false)
const processing = ref(false)
const salesResults = ref([])
const selectedSale = ref(null)
const returnItems = ref([])

const saleSearch = ref({
  sale_number: '',
  date: ''
})

const returnData = ref({
  refund_method: '',
  reason: '',
  notes: '',
  refund_amount: 0
})

watch(() => selectedSale.value, (newSale) => {
  if (newSale && newSale.details) {
    returnItems.value = newSale.details.map(detail => ({
      sale_detail_id: detail.id,
      product_id: detail.product_id,
      variant_id: detail.variant_id,
      selected: false,
      quantity_returned: 1,
      price: detail.unit_price,
      discount: detail.discount || 0,
      tax_rate: detail.tax_rate || 15.0,
      reason: ''
    }))
  }
})

const hasSelectedItems = computed(() => {
  return returnItems.value.some(item => item.selected)
})

const selectedItemsCount = computed(() => {
  return returnItems.value.filter(item => item.selected).length
})

const returnTotals = computed(() => {
  let subtotal = 0
  let tax = 0
  let discount = 0

  returnItems.value.forEach((item, index) => {
    if (item.selected) {
      const detail = selectedSale.value.details[index]
      const itemSubtotal = item.quantity_returned * item.price
      const itemDiscount = item.discount || 0

      subtotal += itemSubtotal
      discount += itemDiscount
      tax += (itemSubtotal - itemDiscount) * (item.tax_rate / 100)
    }
  })

  const total = subtotal + tax - discount

  // Auto-set refund amount to total if not already set
  if (returnData.value.refund_amount === 0) {
    returnData.value.refund_amount = total
  }

  return { subtotal, tax, discount, total }
})

const canProcessReturn = computed(() => {
  return (
    selectedSale.value &&
    hasSelectedItems.value &&
    returnData.value.refund_method &&
    returnData.value.refund_amount > 0 &&
    returnData.value.refund_amount <= returnTotals.value.total
  )
})

async function searchSales() {
  if (!saleSearch.value.sale_number && !saleSearch.value.date) {
    toast.error('Ingresa al menos un criterio de búsqueda')
    return
  }

  searchLoading.value = true
  try {
    const params = {
      status: 'completed',
      per_page: 10
    }

    if (saleSearch.value.sale_number) {
      params.search = saleSearch.value.sale_number
    }

    if (saleSearch.value.date) {
      params.date_from = saleSearch.value.date
      params.date_to = saleSearch.value.date
    }

    await saleStore.fetchSales(params)
    salesResults.value = saleStore.sales

    if (salesResults.value.length === 0) {
      toast.info('No se encontraron ventas con los criterios especificados')
    }
  } catch (error) {
    console.error('Error searching sales:', error)
    toast.error('Error al buscar ventas')
  } finally {
    searchLoading.value = false
  }
}

async function selectSale(sale) {
  try {
    const loadedSale = await saleStore.fetchSaleById(sale.id)
    selectedSale.value = loadedSale

    if (!loadedSale.details || loadedSale.details.length === 0) {
      toast.error('Esta venta no tiene productos')
      selectedSale.value = null
    }
  } catch (error) {
    console.error('Error loading sale details:', error)
    toast.error('Error al cargar los detalles de la venta')
  }
}

async function processReturn() {
  if (!canProcessReturn.value) {
    toast.error('Por favor completa todos los campos requeridos')
    return
  }

  // Validate all selected items have reason
  const hasInvalidItems = returnItems.value.some(item =>
    item.selected && !item.reason
  )

  if (hasInvalidItems) {
    toast.error('Por favor especifica el motivo para todos los productos seleccionados')
    return
  }

  processing.value = true
  try {
    const selectedItems = returnItems.value
      .filter(item => item.selected)
      .map(item => ({
        sale_detail_id: item.sale_detail_id,
        quantity_returned: item.quantity_returned,
        price: item.price,
        discount: item.discount,
        tax_rate: item.tax_rate,
        reason: item.reason
      }))

    const returnPayload = {
      sale_id: selectedSale.value.id,
      branch_id: selectedSale.value.branch_id,
      items: selectedItems,
      refund_method: returnData.value.refund_method,
      refund_amount: returnData.value.refund_amount,
      reason: returnData.value.reason,
      notes: returnData.value.notes
    }

    await returnStore.createReturn(returnPayload)
    toast.success('Devolución creada exitosamente')
    router.push('/returns')
  } catch (error) {
    console.error('Error processing return:', error)
    // Error is already handled by the store
  } finally {
    processing.value = false
  }
}

function goBack() {
  router.push('/returns')
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('es-HN', {
    style: 'currency',
    currency: 'HNL'
  }).format(amount || 0)
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-HN')
}
</script>
