<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Categorías</h1>
        <p class="text-gray-600 mt-1">Gestiona las categorías de productos</p>
      </div>
      <button v-if="can('create_categories')" @click="openCreateModal" class="btn-primary">
        Nueva Categoría
      </button>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="searchQuery"
            @input="searchCategories"
            type="text"
            placeholder="Buscar categorías..."
            class="input w-full"
          />
        </div>
        <div class="w-full md:w-48">
          <select v-model="statusFilter" @change="loadCategories" class="input w-full">
            <option value="">Todos</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="categoryStore.loading && !isSearching" class="text-center py-12">
      <p class="text-gray-500">Cargando categorías...</p>
    </div>

    <!-- Table View -->
    <div v-else class="card overflow-hidden">
      <div v-if="categoryStore.categories.length === 0" class="text-center py-12">
        <p class="text-gray-500">No se encontraron categorías</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Productos
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
            <tr v-for="category in categoryStore.categories" :key="category.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
                  <div v-if="category.description" class="text-sm text-gray-500 mt-1">
                    {{ category.description }}
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ category.products_count || 0 }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ category.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button v-if="can('edit_categories')" @click="openEditModal(category)" class="text-primary-600 hover:text-primary-900 mr-3">
                  Editar
                </button>
                <button v-if="can('delete_categories')" @click="confirmDelete(category)" class="text-red-600 hover:text-red-900">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="categoryStore.pagination.total > 0" class="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="changePage(categoryStore.pagination.current_page - 1)"
              :disabled="categoryStore.pagination.current_page === 1"
              class="btn-secondary"
            >
              Anterior
            </button>
            <button
              @click="changePage(categoryStore.pagination.current_page + 1)"
              :disabled="categoryStore.pagination.current_page === Math.ceil(categoryStore.pagination.total / categoryStore.pagination.per_page)"
              class="btn-secondary ml-3"
            >
              Siguiente
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Mostrando
                <span class="font-medium">{{ (categoryStore.pagination.current_page - 1) * categoryStore.pagination.per_page + 1 }}</span>
                a
                <span class="font-medium">{{ Math.min(categoryStore.pagination.current_page * categoryStore.pagination.per_page, categoryStore.pagination.total) }}</span>
                de
                <span class="font-medium">{{ categoryStore.pagination.total }}</span>
                resultados
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="changePage(categoryStore.pagination.current_page - 1)"
                  :disabled="categoryStore.pagination.current_page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  @click="changePage(categoryStore.pagination.current_page + 1)"
                  :disabled="categoryStore.pagination.current_page === Math.ceil(categoryStore.pagination.total / categoryStore.pagination.per_page)"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="saveCategory">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <h3 class="text-lg font-medium text-gray-900 mb-4">
                {{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}
              </h3>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input v-model="form.name" type="text" required class="input w-full" />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea v-model="form.description" rows="3" class="input w-full"></textarea>
                </div>

                <div class="flex items-center">
                  <input v-model="form.is_active" type="checkbox" class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label class="ml-2 block text-sm text-gray-900">Activo</label>
                </div>
              </div>
            </div>

            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="submit" :disabled="categoryStore.loading" class="btn-primary w-full sm:w-auto sm:ml-3">
                <span v-if="categoryStore.loading">Guardando...</span>
                <span v-else>{{ editingCategory ? 'Actualizar' : 'Crear' }}</span>
              </button>
              <button type="button" @click="closeModal" class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showDeleteModal = false"></div>

        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900">Eliminar Categoría</h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Estás seguro de que deseas eliminar la categoría <strong>{{ categoryToDelete?.name }}</strong>?
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="deleteCategory" :disabled="categoryStore.loading" class="btn-danger w-full sm:w-auto sm:ml-3">
              <span v-if="categoryStore.loading">Eliminando...</span>
              <span v-else>Eliminar</span>
            </button>
            <button @click="showDeleteModal = false" class="btn-secondary w-full sm:w-auto mt-3 sm:mt-0">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCategoryStore } from '@/stores/category'
import { usePermissions } from '@/composables/usePermissions'

const categoryStore = useCategoryStore()
const { can } = usePermissions()

const searchQuery = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)
const isSearching = ref(false)

const form = ref({
  name: '',
  description: '',
  is_active: true
})

onMounted(() => {
  loadCategories()
})

async function loadCategories() {
  const params = {
    per_page: 100
  }
  if (statusFilter.value !== '') {
    params.is_active = statusFilter.value
  }
  await categoryStore.fetchCategories(params)
}

let searchTimeout = null
function searchCategories() {
  clearTimeout(searchTimeout)
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    const params = { per_page: 100 }
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    if (statusFilter.value !== '') {
      params.is_active = statusFilter.value
    }
    await categoryStore.fetchCategories(params)
    isSearching.value = false
  }, 300)
}

function changePage(page) {
  const params = {
    page,
    per_page: categoryStore.pagination.per_page
  }
  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  if (statusFilter.value !== '') {
    params.is_active = statusFilter.value
  }
  categoryStore.fetchCategories(params)
}

function openCreateModal() {
  editingCategory.value = null
  form.value = {
    name: '',
    description: '',
    is_active: true
  }
  showModal.value = true
}

function openEditModal(category) {
  editingCategory.value = category
  form.value = {
    name: category.name,
    description: category.description || '',
    is_active: category.is_active
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function saveCategory() {
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, form.value)
    } else {
      await categoryStore.createCategory(form.value)
    }
    closeModal()
  } catch (error) {
    console.error('Error al guardar categoría:', error)
  }
}

function confirmDelete(category) {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

async function deleteCategory() {
  if (categoryToDelete.value) {
    const success = await categoryStore.deleteCategory(categoryToDelete.value.id)
    if (success) {
      showDeleteModal.value = false
      categoryToDelete.value = null
    }
  }
}
</script>
