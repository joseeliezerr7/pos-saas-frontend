<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center mb-4">
        <router-link
          to="/products"
          class="mr-4 text-gray-600 hover:text-gray-900"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <div class="flex-1">
          <h1 class="text-2xl font-bold text-gray-900">Variantes de Producto</h1>
          <p class="mt-1 text-sm text-gray-600">
            {{ product?.name || 'Cargando...' }}
          </p>
        </div>
        <button
          @click="openCreateModal"
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nueva Variante
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Variants Table -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código de Barras
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Precio
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Costo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="variant in variants" :key="variant.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div v-if="variant.image" class="flex-shrink-0 h-10 w-10">
                  <img class="h-10 w-10 rounded object-cover" :src="variant.image" :alt="variant.name">
                </div>
                <div :class="variant.image ? 'ml-4' : ''">
                  <div class="text-sm font-medium text-gray-900">{{ variant.name }}</div>
                  <div v-if="variant.attributes" class="text-xs text-gray-500">
                    {{ formatAttributes(variant.attributes) }}
                  </div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ variant.sku }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ variant.barcode || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">L {{ parseFloat(variant.price).toFixed(2) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">L {{ parseFloat(variant.cost).toFixed(2) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  variant.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                ]"
              >
                {{ variant.is_active ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                @click="openEditModal(variant)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="Editar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                @click="confirmDelete(variant)"
                class="text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="variants.length === 0">
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              No hay variantes para este producto. Crea una para comenzar.
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div
        v-if="showModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="closeModal"
          ></div>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <form @submit.prevent="handleSubmit">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {{ editingVariant ? 'Editar Variante' : 'Nueva Variante' }}
                </h3>

                <!-- Name Field -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Nombre <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="form.name"
                    type="text"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ej: Talla M - Rojo"
                  />
                  <p class="mt-1 text-xs text-gray-500">Describe la variante (talla, color, etc.)</p>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- SKU Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      SKU <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.sku"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="SKU único"
                    />
                  </div>

                  <!-- Barcode Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Código de Barras
                    </label>
                    <input
                      v-model="form.barcode"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4 mb-4">
                  <!-- Price Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Precio <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <!-- Cost Field -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Costo
                    </label>
                    <input
                      v-model="form.cost"
                      type="number"
                      step="0.01"
                      min="0"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <!-- Image URL Field -->
                <div class="mb-4">
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    URL de Imagen
                  </label>
                  <input
                    v-model="form.image"
                    type="text"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <!-- Active Status -->
                <div class="mb-4">
                  <label class="flex items-center">
                    <input
                      v-model="form.is_active"
                      type="checkbox"
                      class="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    />
                    <span class="ml-2 text-sm text-gray-700">Variante activa</span>
                  </label>
                </div>
              </div>

              <!-- Modal Actions -->
              <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  :disabled="submitting"
                  class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {{ submitting ? 'Guardando...' : 'Guardar' }}
                </button>
                <button
                  type="button"
                  @click="closeModal"
                  :disabled="submitting"
                  class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="closeDeleteModal"
          ></div>

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900">
                    Eliminar Variante
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar la variante <strong>{{ variantToDelete?.name }}</strong>?
                      Esta acción no se puede deshacer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                @click="handleDelete"
                :disabled="submitting"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                {{ submitting ? 'Eliminando...' : 'Eliminar' }}
              </button>
              <button
                type="button"
                @click="closeDeleteModal"
                :disabled="submitting"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import productVariantService from '@/services/productVariantService'
import productService from '@/services/productService'

const route = useRoute()
const productId = route.params.id

// State
const product = ref(null)
const variants = ref([])
const loading = ref(false)
const submitting = ref(false)
const error = ref(null)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingVariant = ref(null)
const variantToDelete = ref(null)

// Form
const form = ref({
  name: '',
  sku: '',
  barcode: '',
  price: 0,
  cost: 0,
  image: '',
  attributes: null,
  is_active: true
})

// Methods
async function loadProduct() {
  try {
    const response = await productService.getById(productId)
    if (response.data.success) {
      product.value = response.data.data
    }
  } catch (err) {
    console.error('Error loading product:', err)
  }
}

async function loadVariants() {
  loading.value = true
  error.value = null
  try {
    const response = await productVariantService.getAll(productId)
    if (response.data.success) {
      variants.value = response.data.data
    }
  } catch (err) {
    error.value = 'Error al cargar las variantes'
    console.error('Error loading variants:', err)
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  form.value = {
    name: '',
    sku: '',
    barcode: '',
    price: product.value?.price || 0,
    cost: product.value?.cost || 0,
    image: '',
    attributes: null,
    is_active: true
  }
  editingVariant.value = null
  showModal.value = true
}

function openEditModal(variant) {
  form.value = {
    name: variant.name,
    sku: variant.sku,
    barcode: variant.barcode || '',
    price: variant.price,
    cost: variant.cost,
    image: variant.image || '',
    attributes: variant.attributes,
    is_active: variant.is_active
  }
  editingVariant.value = variant
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingVariant.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    let response
    if (editingVariant.value) {
      response = await productVariantService.update(productId, editingVariant.value.id, form.value)
    } else {
      response = await productVariantService.create(productId, form.value)
    }

    if (response.data.success) {
      closeModal()
      await loadVariants()
    }
  } catch (err) {
    console.error('Error submitting form:', err)
    alert('Error al guardar la variante')
  } finally {
    submitting.value = false
  }
}

function confirmDelete(variant) {
  variantToDelete.value = variant
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  variantToDelete.value = null
}

async function handleDelete() {
  if (!variantToDelete.value) return

  submitting.value = true
  try {
    const response = await productVariantService.delete(productId, variantToDelete.value.id)
    if (response.data.success) {
      closeDeleteModal()
      await loadVariants()
    }
  } catch (err) {
    console.error('Error deleting variant:', err)
    alert('Error al eliminar la variante')
  } finally {
    submitting.value = false
  }
}

function formatAttributes(attributes) {
  if (!attributes || typeof attributes !== 'object') return ''
  return Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')
}

// Lifecycle
onMounted(async () => {
  await loadProduct()
  await loadVariants()
})
</script>
