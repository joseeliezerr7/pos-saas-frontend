<template>
  <div class="brands p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Marcas</h1>
        <p class="text-gray-600 mt-2">Gestione el catálogo de marcas de productos</p>
      </div>
      <button v-if="can('create_products')" @click="openCreateModal" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        + Nueva Marca
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Buscar por nombre o descripción..."
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          v-model="filterStatus"
          @change="handleFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Brands Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p class="mt-2 text-gray-600">Cargando marcas...</p>
        </div>

        <div v-else-if="brands.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay marcas</h3>
          <p class="mt-1 text-sm text-gray-500">Comience agregando una nueva marca.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marca</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Productos</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="brand in brands" :key="brand.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div v-if="brand.logo" class="flex-shrink-0 h-10 w-10 mr-3">
                      <img :src="brand.logo" :alt="brand.name" class="h-10 w-10 rounded object-contain bg-gray-100">
                    </div>
                    <div v-else class="flex-shrink-0 h-10 w-10 mr-3 bg-gray-200 rounded flex items-center justify-center">
                      <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <div class="text-sm font-medium text-gray-900">{{ brand.name }}</div>
                      <div class="text-xs text-gray-500">{{ brand.slug }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ brand.description || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-600">
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {{ brand.products_count || 0 }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span v-if="brand.is_active" class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                  <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button v-if="can('edit_products')" @click="openEditModal(brand)" class="text-blue-600 hover:text-blue-800 mr-3">
                    Editar
                  </button>
                  <button v-if="can('delete_products')" @click="confirmDelete(brand)" class="text-red-600 hover:text-red-800">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > pagination.per_page" class="mt-4 flex justify-between items-center border-t pt-4">
          <div class="text-sm text-gray-700">
            Mostrando {{ brands.length }} de {{ pagination.total }} marcas
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page >= pagination.last_page"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingBrand ? 'Editar Marca' : 'Nueva Marca' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Marca *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre de la marca"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción de la marca"
            ></textarea>
          </div>

          <!-- Logo URL -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">URL del Logo</label>
            <input
              v-model="form.logo"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://ejemplo.com/logo.png"
            />
            <p class="mt-1 text-xs text-gray-500">Ingrese la URL completa del logo de la marca</p>
          </div>

          <!-- Logo Preview -->
          <div v-if="form.logo" class="flex items-center space-x-3">
            <label class="block text-sm font-medium text-gray-700">Vista previa:</label>
            <img :src="form.logo" alt="Logo preview" class="h-16 w-16 object-contain bg-gray-100 rounded">
          </div>

          <!-- Status -->
          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="is_active" class="ml-2 block text-sm text-gray-700">
              Marca activa
            </label>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ submitting ? 'Guardando...' : (editingBrand ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useBrandStore } from '@/stores/brand'
import { storeToRefs } from 'pinia'
import { usePermissions } from '@/composables/usePermissions'

const brandStore = useBrandStore()
const { brands, loading, pagination } = storeToRefs(brandStore)
const { can } = usePermissions()

const submitting = ref(false)
const showModal = ref(false)
const editingBrand = ref(null)
const searchQuery = ref('')
const filterStatus = ref('')
let searchTimeout = null

const form = ref({
  name: '',
  description: '',
  logo: '',
  is_active: true
})

onMounted(() => {
  loadBrands()
})

async function loadBrands() {
  const params = {
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    search: searchQuery.value || undefined,
    is_active: filterStatus.value || undefined
  }

  await brandStore.fetchBrands(params)
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1
    loadBrands()
  }, 500)
}

function handleFilterChange() {
  pagination.value.current_page = 1
  loadBrands()
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page
    loadBrands()
  }
}

function openCreateModal() {
  editingBrand.value = null
  form.value = {
    name: '',
    description: '',
    logo: '',
    is_active: true
  }
  showModal.value = true
}

function openEditModal(brand) {
  editingBrand.value = brand
  form.value = {
    name: brand.name,
    description: brand.description || '',
    logo: brand.logo || '',
    is_active: brand.is_active
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingBrand.value = null
  form.value = {
    name: '',
    description: '',
    logo: '',
    is_active: true
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editingBrand.value) {
      await brandStore.updateBrand(editingBrand.value.id, form.value)
    } else {
      await brandStore.createBrand(form.value)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving brand:', error)
  } finally {
    submitting.value = false
  }
}

async function confirmDelete(brand) {
  if (!confirm(`¿Está seguro de eliminar la marca "${brand.name}"?`)) {
    return
  }

  await brandStore.deleteBrand(brand.id)
}
</script>
