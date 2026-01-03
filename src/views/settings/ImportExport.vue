<template>
  <div class="import-export p-6">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Importación y Exportación de Datos</h1>
      <p class="mt-2 text-gray-600">Importa y exporta datos masivamente usando archivos CSV</p>
    </div>

    <!-- Tabs -->
    <div class="mb-6 border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'import'"
          :class="[
            activeTab === 'import'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          📥 Importar
        </button>
        <button
          @click="activeTab = 'export'"
          :class="[
            activeTab === 'export'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
          ]"
        >
          📤 Exportar
        </button>
      </nav>
    </div>

    <!-- Import Tab -->
    <div v-show="activeTab === 'import'" class="space-y-6">
      <!-- Type Selector -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Tipo de datos a importar</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            @click="importType = 'products'"
            :class="[
              importType === 'products'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-white hover:bg-gray-50',
              'p-4 border-2 rounded-lg text-left transition-colors'
            ]"
          >
            <div class="font-semibold">Productos</div>
            <div class="text-sm text-gray-600 mt-1">Importar listado de productos</div>
          </button>
          <button
            @click="importType = 'customers'"
            :class="[
              importType === 'customers'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-white hover:bg-gray-50',
              'p-4 border-2 rounded-lg text-left transition-colors'
            ]"
          >
            <div class="font-semibold">Clientes</div>
            <div class="text-sm text-gray-600 mt-1">Importar listado de clientes</div>
          </button>
          <button
            @click="importType = 'inventory'"
            :class="[
              importType === 'inventory'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-white hover:bg-gray-50',
              'p-4 border-2 rounded-lg text-left transition-colors'
            ]"
          >
            <div class="font-semibold">Inventario</div>
            <div class="text-sm text-gray-600 mt-1">Importar stock inicial</div>
          </button>
          <button
            @click="importType = 'price-update'"
            :class="[
              importType === 'price-update'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 bg-white hover:bg-gray-50',
              'p-4 border-2 rounded-lg text-left transition-colors'
            ]"
          >
            <div class="font-semibold">Precios</div>
            <div class="text-sm text-gray-600 mt-1">Actualizar precios masivamente</div>
          </button>
        </div>
      </div>

      <!-- Template Download -->
      <div class="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium text-blue-800">Descarga la plantilla</h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>Para importar correctamente, descarga la plantilla Excel o CSV y llena los datos siguiendo el formato indicado. Recomendamos usar Excel para mayor facilidad.</p>
            </div>
            <div class="mt-4 flex space-x-3">
              <button
                @click="downloadTemplate('excel')"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                Excel (.xlsx)
              </button>
              <button
                @click="downloadTemplate('csv')"
                class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
                CSV (.csv)
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Branch Selector for Inventory -->
      <div v-if="importType === 'inventory'" class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Seleccionar Sucursal</h2>
        <select
          v-model="selectedBranchId"
          class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          required
        >
          <option value="">Seleccione una sucursal</option>
          <option value="1">Sucursal Principal</option>
        </select>
        <p class="text-sm text-gray-600 mt-2">El inventario se importará a esta sucursal</p>
      </div>

      <!-- File Upload Area -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Cargar archivo CSV o Excel</h2>

        <!-- Drag & Drop Zone -->
        <div
          @drop.prevent="handleDrop"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          :class="[
            isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300 bg-gray-50',
            'border-2 border-dashed rounded-lg p-12 text-center transition-colors'
          ]"
        >
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div class="mt-4">
            <label class="cursor-pointer">
              <span class="text-primary-600 hover:text-primary-500 font-medium">
                Haz clic para seleccionar
              </span>
              <span class="text-gray-600"> o arrastra y suelta</span>
              <input
                type="file"
                accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                @change="handleFileSelect"
                class="hidden"
              />
            </label>
          </div>
          <p class="text-xs text-gray-500 mt-2">CSV o Excel (XLSX/XLS) hasta 10MB</p>
        </div>

        <!-- Selected File Info -->
        <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />
              </svg>
              <div class="ml-3">
                <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button
              @click="selectedFile = null; previewData = null"
              class="text-red-600 hover:text-red-800"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Actions -->
        <div v-if="selectedFile" class="mt-6 flex space-x-4">
          <button
            @click="previewImportData"
            :disabled="previewing"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {{ previewing ? 'Procesando...' : '👁️ Vista Previa' }}
          </button>
          <button
            @click="processImport"
            :disabled="importing"
            class="flex-1 px-4 py-2 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {{ importing ? 'Importando...' : '✓ Importar Datos' }}
          </button>
        </div>
      </div>

      <!-- Preview Data -->
      <div v-if="previewData" class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Vista Previa</h2>
        <div class="mb-4 text-sm text-gray-600">
          <p>Total de registros: <span class="font-semibold">{{ previewData.total_rows }}</span></p>
          <p class="mt-1">Mostrando primeros {{ previewData.preview.length }} registros</p>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="column in previewData.columns"
                  :key="column"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(row, index) in previewData.preview" :key="index">
                <td
                  v-for="column in previewData.columns"
                  :key="column"
                  class="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {{ row[column] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Import Results -->
      <div v-if="importResults" class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-start">
          <div class="flex-shrink-0">
            <svg v-if="importResults.success" class="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else class="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3 flex-1">
            <h3 class="text-sm font-medium" :class="importResults.success ? 'text-green-800' : 'text-red-800'">
              {{ importResults.success ? 'Importación Completada' : 'Error en Importación' }}
            </h3>
            <div class="mt-2 text-sm" :class="importResults.success ? 'text-green-700' : 'text-red-700'">
              <p v-if="importResults.success">
                • Registros importados: {{ importResults.imported }}<br>
                • Registros actualizados: {{ importResults.updated }}<br>
                • Total procesado: {{ importResults.total_rows }}
              </p>
              <p v-else>{{ importResults.message }}</p>
            </div>
            <!-- Errors List -->
            <div v-if="importResults.errors && importResults.errors.length > 0" class="mt-4">
              <h4 class="text-sm font-medium text-red-800">Errores encontrados:</h4>
              <ul class="mt-2 text-xs text-red-700 space-y-1">
                <li v-for="(error, idx) in importResults.errors.slice(0, 10)" :key="idx">
                  Fila {{ error.row }}: {{ Object.values(error.errors).flat().join(', ') }}
                </li>
                <li v-if="importResults.errors.length > 10" class="font-semibold">
                  ... y {{ importResults.errors.length - 10 }} errores más
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Export Tab -->
    <div v-show="activeTab === 'export'" class="space-y-6">
      <!-- Export Products -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Exportar Productos</h2>
        <p class="text-sm text-gray-600 mb-4">Descarga el listado completo de productos en formato CSV</p>

        <!-- Filters -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
            <select v-model="exportProductFilters.category_id" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Todas las categorías</option>
              <!-- Categories will be loaded dynamically -->
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select v-model="exportProductFilters.is_active" class="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="">Todos</option>
              <option value="1">Activos</option>
              <option value="0">Inactivos</option>
            </select>
          </div>
        </div>

        <button
          @click="exportProducts"
          :disabled="exporting"
          class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ exporting ? 'Exportando...' : '📥 Descargar Productos' }}
        </button>
      </div>

      <!-- Export Customers -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Exportar Clientes</h2>
        <p class="text-sm text-gray-600 mb-4">Descarga el listado completo de clientes en formato CSV</p>

        <button
          @click="exportCustomers"
          :disabled="exporting"
          class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ exporting ? 'Exportando...' : '📥 Descargar Clientes' }}
        </button>
      </div>

      <!-- Export Sales -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-lg font-semibold mb-4">Exportar Reporte de Ventas</h2>
        <p class="text-sm text-gray-600 mb-4">Descarga el reporte de ventas en formato CSV</p>

        <!-- Date Filters -->
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
            <input
              v-model="exportSalesFilters.start_date"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
            <input
              v-model="exportSalesFilters.end_date"
              type="date"
              class="w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
        </div>

        <button
          @click="exportSales"
          :disabled="exporting"
          class="w-full px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 disabled:opacity-50"
        >
          {{ exporting ? 'Exportando...' : '📥 Descargar Reporte' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import importExportService from '@/services/importExportService'
import { toast } from 'vue3-toastify'

const activeTab = ref('import')
const importType = ref('products')
const isDragging = ref(false)
const selectedFile = ref(null)
const selectedBranchId = ref('')
const previewing = ref(false)
const importing = ref(false)
const exporting = ref(false)
const previewData = ref(null)
const importResults = ref(null)

const exportProductFilters = ref({
  category_id: '',
  is_active: ''
})

const exportSalesFilters = ref({
  start_date: '',
  end_date: ''
})

// Download Template
async function downloadTemplate(format = 'excel') {
  try {
    let blob, filename

    if (format === 'excel') {
      if (importType.value === 'products') {
        blob = await importExportService.getProductTemplateExcel()
      } else if (importType.value === 'customers') {
        blob = await importExportService.getCustomerTemplateExcel()
      } else if (importType.value === 'inventory') {
        blob = await importExportService.getInventoryTemplateExcel()
      } else if (importType.value === 'price-update') {
        blob = await importExportService.getPriceUpdateTemplateExcel()
      }
      filename = `${importType.value}_template.xlsx`
    } else {
      if (importType.value === 'products') {
        blob = await importExportService.getProductTemplate()
      } else if (importType.value === 'customers') {
        blob = await importExportService.getCustomerTemplate()
      } else if (importType.value === 'inventory') {
        blob = await importExportService.getInventoryTemplate()
      } else if (importType.value === 'price-update') {
        blob = await importExportService.getPriceUpdateTemplate()
      }
      filename = `${importType.value}_template.csv`
    }

    importExportService.downloadBlob(blob, filename)
    toast.success('Plantilla descargada correctamente')
  } catch (error) {
    console.error('Error downloading template:', error)
    toast.error('Error al descargar la plantilla')
  }
}

// File Handlers
function handleDrop(e) {
  isDragging.value = false
  const files = e.dataTransfer.files
  if (files.length > 0) {
    const file = files[0]
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']
    const validExtensions = ['.csv', '.xlsx', '.xls']
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext))

    if (validTypes.includes(file.type) || hasValidExtension) {
      selectedFile.value = file
      previewData.value = null
      importResults.value = null
    } else {
      toast.error('Por favor selecciona un archivo CSV o Excel (.xlsx, .xls)')
    }
  }
}

function handleFileSelect(e) {
  const files = e.target.files
  if (files.length > 0) {
    selectedFile.value = files[0]
    previewData.value = null
    importResults.value = null
  }
}

// Preview Import
async function previewImportData() {
  if (!selectedFile.value) return

  previewing.value = true
  try {
    const result = await importExportService.previewImport(selectedFile.value)
    if (result.success) {
      previewData.value = result
    } else {
      toast.error(result.message || 'Error al procesar el archivo')
    }
  } catch (error) {
    console.error('Error previewing import:', error)
    toast.error('Error al procesar la vista previa')
  } finally {
    previewing.value = false
  }
}

// Process Import
async function processImport() {
  if (!selectedFile.value) return

  // Validate branch selection for inventory
  if (importType.value === 'inventory' && !selectedBranchId.value) {
    toast.error('Por favor selecciona una sucursal')
    return
  }

  importing.value = true
  importResults.value = null

  try {
    let result
    if (importType.value === 'products') {
      result = await importExportService.importProducts(selectedFile.value)
    } else if (importType.value === 'customers') {
      result = await importExportService.importCustomers(selectedFile.value)
    } else if (importType.value === 'inventory') {
      result = await importExportService.importInventory(selectedFile.value, selectedBranchId.value)
    } else if (importType.value === 'price-update') {
      result = await importExportService.bulkUpdatePrices(selectedFile.value)
    }

    importResults.value = result

    if (result.success) {
      if (importType.value === 'price-update') {
        toast.success(`Actualización completada: ${result.updated} precios actualizados`)
      } else {
        toast.success(`Importación completada: ${result.imported} nuevos, ${result.updated} actualizados`)
      }
      selectedFile.value = null
      previewData.value = null
    } else {
      toast.error(result.message || 'Error en la importación')
    }
  } catch (error) {
    console.error('Error importing:', error)
    toast.error('Error al procesar la importación')
    importResults.value = {
      success: false,
      message: error.response?.data?.message || 'Error al procesar la importación'
    }
  } finally {
    importing.value = false
  }
}

// Export Functions
async function exportProducts() {
  exporting.value = true
  try {
    const filters = {}
    if (exportProductFilters.value.category_id) {
      filters.category_id = exportProductFilters.value.category_id
    }
    if (exportProductFilters.value.is_active !== '') {
      filters.is_active = exportProductFilters.value.is_active
    }

    const blob = await importExportService.exportProducts(filters)
    const filename = `products_${new Date().toISOString().split('T')[0]}.csv`
    importExportService.downloadBlob(blob, filename)
    toast.success('Productos exportados correctamente')
  } catch (error) {
    console.error('Error exporting products:', error)
    toast.error('Error al exportar productos')
  } finally {
    exporting.value = false
  }
}

async function exportCustomers() {
  exporting.value = true
  try {
    const blob = await importExportService.exportCustomers()
    const filename = `customers_${new Date().toISOString().split('T')[0]}.csv`
    importExportService.downloadBlob(blob, filename)
    toast.success('Clientes exportados correctamente')
  } catch (error) {
    console.error('Error exporting customers:', error)
    toast.error('Error al exportar clientes')
  } finally {
    exporting.value = false
  }
}

async function exportSales() {
  exporting.value = true
  try {
    const filters = {}
    if (exportSalesFilters.value.start_date) {
      filters.start_date = exportSalesFilters.value.start_date
    }
    if (exportSalesFilters.value.end_date) {
      filters.end_date = exportSalesFilters.value.end_date
    }

    const blob = await importExportService.exportSales(filters)
    const filename = `sales_report_${new Date().toISOString().split('T')[0]}.csv`
    importExportService.downloadBlob(blob, filename)
    toast.success('Reporte de ventas exportado correctamente')
  } catch (error) {
    console.error('Error exporting sales:', error)
    toast.error('Error al exportar reporte de ventas')
  } finally {
    exporting.value = false
  }
}

// Helper
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>

<style scoped>
/* Additional styles if needed */
</style>
