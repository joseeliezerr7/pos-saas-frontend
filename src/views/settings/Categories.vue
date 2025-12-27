<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Categorías</h1>
        <p class="text-gray-600 mt-1">Gestiona las categorías de productos</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        + Nueva Categoría
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar categorías..."
          class="input flex-1"
          @input="handleSearch"
        />
        <select v-model="filterStatus" @change="handleFilterChange" class="input">
          <option value="">Todos los estados</option>
          <option value="1">Activas</option>
          <option value="0">Inactivas</option>
        </select>
      </div>
    </div>

    <!-- Categories Table -->
    <div class="card">
      <div v-if="categoryStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando categorías...</p>
      </div>

      <div v-else-if="categoryStore.categories.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay categorías registradas</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría Padre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Productos</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in categoryStore.categories" :key="category.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ category.name }}</div>
                <div v-if="category.description" class="text-sm text-gray-500">{{ category.description }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ category.parent?.name || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ category.products_count || 0 }}
              </td>
              <td class="px-6 py-4">
                <span v-if="category.is_active" class="badge-success">Activa</span>
                <span v-else class="badge-danger">Inactiva</span>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ category.sort_order }}
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button @click="openEditModal(category)" class="text-blue-600 hover:text-blue-800">
                  Editar
                </button>
                <button @click="confirmDelete(category)" class="text-red-600 hover:text-red-800">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="categoryStore.pagination.total > categoryStore.pagination.per_page" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ categoryStore.categories.length }} de {{ categoryStore.pagination.total }} categorías
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(categoryStore.pagination.current_page - 1)"
            :disabled="categoryStore.pagination.current_page === 1"
            class="btn-secondary"
          >
            Anterior
          </button>
          <button
            @click="changePage(categoryStore.pagination.current_page + 1)"
            :disabled="categoryStore.pagination.current_page * categoryStore.pagination.per_page >= categoryStore.pagination.total"
            class="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">
          {{ editingCategory ? 'Editar Categoría' : 'Nueva Categoría' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input w-full"
              placeholder="Nombre de la categoría"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Categoría Padre</label>
            <select v-model="form.parent_id" class="input w-full">
              <option :value="null">Sin categoría padre</option>
              <option v-for="cat in availableParents" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="input w-full"
              placeholder="Descripción de la categoría"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Orden</label>
            <input
              v-model.number="form.sort_order"
              type="number"
              class="input w-full"
              min="0"
            />
          </div>

          <div class="flex items-center">
            <input
              v-model="form.is_active"
              type="checkbox"
              id="is_active"
              class="mr-2"
            />
            <label for="is_active" class="text-sm text-gray-700">Categoría activa</label>
          </div>

          <div class="flex gap-2 pt-4">
            <button type="submit" :disabled="categoryStore.loading" class="btn-primary flex-1">
              <span v-if="categoryStore.loading">Guardando...</span>
              <span v-else>{{ editingCategory ? 'Actualizar' : 'Crear' }}</span>
            </button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4 text-red-600">Confirmar Eliminación</h2>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de eliminar la categoría <strong>{{ categoryToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="categoryStore.loading" class="btn-danger flex-1">
            <span v-if="categoryStore.loading">Eliminando...</span>
            <span v-else>Eliminar</span>
          </button>
          <button @click="closeDeleteModal" class="btn-secondary flex-1">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useCategoryStore } from '@/stores/category'

const categoryStore = useCategoryStore()

const searchQuery = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCategory = ref(null)
const categoryToDelete = ref(null)

const form = ref({
  name: '',
  parent_id: null,
  description: '',
  image: '',
  is_active: true,
  sort_order: 0
})

const availableParents = computed(() => {
  // Filter out the category being edited to prevent circular reference
  if (editingCategory.value) {
    return categoryStore.categories.filter(cat => cat.id !== editingCategory.value.id)
  }
  return categoryStore.categories
})

onMounted(() => {
  loadCategories()
})

function loadCategories() {
  const params = {
    page: categoryStore.pagination.current_page,
    per_page: categoryStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  if (filterStatus.value !== '') {
    params.is_active = filterStatus.value
  }

  categoryStore.fetchCategories(params)
}

function handleSearch() {
  categoryStore.pagination.current_page = 1
  loadCategories()
}

function handleFilterChange() {
  categoryStore.pagination.current_page = 1
  loadCategories()
}

function changePage(page) {
  categoryStore.pagination.current_page = page
  loadCategories()
}

function openCreateModal() {
  editingCategory.value = null
  form.value = {
    name: '',
    parent_id: null,
    description: '',
    image: '',
    is_active: true,
    sort_order: 0
  }
  showModal.value = true
}

function openEditModal(category) {
  editingCategory.value = category
  form.value = {
    name: category.name,
    parent_id: category.parent_id,
    description: category.description || '',
    image: category.image || '',
    is_active: category.is_active,
    sort_order: category.sort_order
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCategory.value = null
}

async function handleSubmit() {
  try {
    if (editingCategory.value) {
      await categoryStore.updateCategory(editingCategory.value.id, form.value)
    } else {
      await categoryStore.createCategory(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(category) {
  categoryToDelete.value = category
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  categoryToDelete.value = null
}

async function handleDelete() {
  const success = await categoryStore.deleteCategory(categoryToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}
</script>

<style scoped>
.badge-success {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800;
}

.badge-danger {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
