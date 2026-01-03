<template>
  <div class="print-labels p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Imprimir Etiquetas de Productos</h1>
      <p class="mt-2 text-gray-600">Genera e imprime etiquetas con códigos de barras para tus productos</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Panel - Product Selection -->
      <div class="lg:col-span-2">
        <!-- Search Products -->
        <div class="bg-white p-6 rounded-lg shadow mb-6">
          <h2 class="text-lg font-semibold mb-4">Buscar Productos</h2>
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Buscar por nombre, SKU o código de barras..."
              class="w-full border border-gray-300 rounded-md px-4 py-2 pr-10"
              @input="searchProducts"
            />
            <svg class="absolute right-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <!-- Search Results -->
          <div v-if="searchResults.length > 0" class="mt-4 max-h-96 overflow-y-auto">
            <div
              v-for="product in searchResults"
              :key="product.id"
              class="p-3 border border-gray-200 rounded-md mb-2 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
              @click="addProduct(product)"
            >
              <div>
                <div class="font-medium">{{ product.name }}</div>
                <div class="text-sm text-gray-600">SKU: {{ product.sku || 'N/A' }} | Barcode: {{ product.barcode || 'N/A' }}</div>
              </div>
              <button class="px-3 py-1 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700">
                Agregar
              </button>
            </div>
          </div>
        </div>

        <!-- Selected Products -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Productos Seleccionados</h2>

          <div v-if="selectedProducts.length === 0" class="text-center py-8 text-gray-500">
            No hay productos seleccionados. Busca y agrega productos arriba.
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in selectedProducts"
              :key="index"
              class="flex items-center justify-between p-3 border border-gray-200 rounded-md"
            >
              <div class="flex-1">
                <div class="font-medium">{{ item.product.name }}</div>
                <div class="text-sm text-gray-600">{{ item.product.barcode || 'Sin código de barras' }}</div>
              </div>

              <div class="flex items-center space-x-3">
                <div class="flex items-center space-x-2">
                  <button
                    @click="decreaseQuantity(index)"
                    class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    -
                  </button>
                  <input
                    v-model.number="item.quantity"
                    type="number"
                    min="1"
                    max="100"
                    class="w-16 text-center border border-gray-300 rounded-md py-1"
                  />
                  <button
                    @click="increaseQuantity(index)"
                    class="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>

                <button
                  @click="removeProduct(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-if="selectedProducts.length > 0" class="mt-4 pt-4 border-t border-gray-200">
            <div class="text-sm text-gray-600">
              Total de etiquetas: <span class="font-semibold">{{ totalLabels }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Options & Preview -->
      <div class="space-y-6">
        <!-- Label Options -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Opciones de Etiqueta</h2>

          <div class="space-y-4">
            <!-- Size -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Tamaño</label>
              <select v-model="labelOptions.size" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option value="small">Pequeño (50x25mm)</option>
                <option value="medium">Mediano (70x35mm)</option>
                <option value="large">Grande (100x50mm)</option>
              </select>
            </div>

            <!-- Columns -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Columnas</label>
              <select v-model="labelOptions.columns" class="w-full border border-gray-300 rounded-md px-3 py-2">
                <option :value="1">1 columna</option>
                <option :value="2">2 columnas</option>
                <option :value="3">3 columnas</option>
                <option :value="4">4 columnas</option>
              </select>
            </div>

            <!-- Show Price -->
            <div class="flex items-center">
              <input
                v-model="labelOptions.showPrice"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-700">Mostrar precio</label>
            </div>

            <!-- Show SKU -->
            <div class="flex items-center">
              <input
                v-model="labelOptions.showSku"
                type="checkbox"
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label class="ml-2 block text-sm text-gray-700">Mostrar SKU</label>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-lg font-semibold mb-4">Acciones</h2>

          <div class="space-y-3">
            <button
              v-if="can('generate_barcodes')"
              @click="generatePreview"
              :disabled="selectedProducts.length === 0 || previewing"
              class="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ previewing ? 'Generando...' : 'Vista Previa' }}
            </button>

            <button
              v-if="can('print_labels')"
              @click="generatePDF"
              :disabled="selectedProducts.length === 0 || generating"
              class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ generating ? 'Generando...' : 'Descargar PDF' }}
            </button>

            <button
              @click="clearAll"
              :disabled="selectedProducts.length === 0"
              class="w-full px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Limpiar Todo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="showPreview = false"
    >
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold">Vista Previa de Etiquetas</h2>
            <button @click="showPreview = false" class="text-gray-500 hover:text-gray-700">
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="grid gap-4" :class="`grid-cols-${labelOptions.columns}`">
            <div
              v-for="(label, index) in previewLabels"
              :key="index"
              class="border border-gray-300 p-3 text-center"
              :class="{
                'text-xs': labelOptions.size === 'small',
                'text-sm': labelOptions.size === 'medium',
                'text-base': labelOptions.size === 'large'
              }"
            >
              <div class="font-semibold mb-1">{{ label.name }}</div>
              <div v-if="labelOptions.showSku" class="text-gray-600 text-xs mb-1">{{ label.sku }}</div>
              <div v-html="label.barcode_svg" class="my-2"></div>
              <div v-if="labelOptions.showPrice" class="font-bold">L. {{ parseFloat(label.price).toFixed(2) }}</div>
              <div class="text-xs text-gray-500">{{ label.barcode }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProductStore } from '@/stores/product'
import barcodeService from '@/services/barcodeService'
import { toast } from 'vue3-toastify'
import { usePermissions } from '@/composables/usePermissions'

const { can } = usePermissions()
const productStore = useProductStore()

const searchQuery = ref('')
const searchResults = ref([])
const selectedProducts = ref([])
const previewing = ref(false)
const generating = ref(false)
const showPreview = ref(false)
const previewLabels = ref([])

const labelOptions = ref({
  size: 'medium',
  columns: 3,
  showPrice: true,
  showSku: true
})

const totalLabels = computed(() => {
  return selectedProducts.value.reduce((sum, item) => sum + item.quantity, 0)
})

// Search products
async function searchProducts() {
  if (searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  try {
    await productStore.fetchProducts({ search: searchQuery.value })
    searchResults.value = productStore.products.slice(0, 10)
  } catch (error) {
    console.error('Error searching products:', error)
  }
}

// Add product
function addProduct(product) {
  const existing = selectedProducts.value.find(item => item.product.id === product.id)
  if (existing) {
    existing.quantity++
    toast.info('Cantidad actualizada')
  } else {
    selectedProducts.value.push({
      product,
      quantity: 1
    })
    toast.success('Producto agregado')
  }
}

// Remove product
function removeProduct(index) {
  selectedProducts.value.splice(index, 1)
  toast.success('Producto eliminado')
}

// Increase/decrease quantity
function increaseQuantity(index) {
  if (selectedProducts.value[index].quantity < 100) {
    selectedProducts.value[index].quantity++
  }
}

function decreaseQuantity(index) {
  if (selectedProducts.value[index].quantity > 1) {
    selectedProducts.value[index].quantity--
  }
}

// Clear all
function clearAll() {
  selectedProducts.value = []
  searchQuery.value = ''
  searchResults.value = []
  toast.success('Lista limpiada')
}

// Generate preview
async function generatePreview() {
  previewing.value = true
  try {
    const products = selectedProducts.value.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }))

    const result = await barcodeService.generateLabels(products, labelOptions.value)

    if (result.success) {
      previewLabels.value = result.labels
      showPreview.value = true
    } else {
      toast.error(result.message || 'Error al generar vista previa')
    }
  } catch (error) {
    console.error('Error generating preview:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Error al generar vista previa'
    toast.error(errorMessage)
  } finally {
    previewing.value = false
  }
}

// Generate PDF
async function generatePDF() {
  generating.value = true
  try {
    const products = selectedProducts.value.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity
    }))

    const blob = await barcodeService.generateLabelsPDF(products, labelOptions.value)

    // Check if blob is actually a Blob
    if (blob instanceof Blob) {
      const filename = `etiquetas_${new Date().toISOString().split('T')[0]}.pdf`
      barcodeService.downloadPDF(blob, filename)
      toast.success('PDF generado correctamente')
    } else {
      // If not a blob, it might be an error response
      toast.error('Error al generar PDF: respuesta inválida del servidor')
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    const errorMessage = error.response?.data?.message || error.message || 'Error al generar PDF'
    toast.error(errorMessage)
  } finally {
    generating.value = false
  }
}
</script>
