<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Tags de Clientes</h1>
        <p class="text-gray-600 mt-1">Etiquetas flexibles para categorizar clientes</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        + Nuevo Tag
      </button>
    </div>

    <!-- Search -->
    <div class="card">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar tags..."
        class="input w-full"
        @input="handleSearch"
      />
    </div>

    <!-- Tags Grid -->
    <div v-if="tagStore.loading" class="text-center py-8">
      <p class="text-gray-500">Cargando tags...</p>
    </div>

    <div v-else-if="tagStore.tags.length === 0" class="text-center py-8">
      <p class="text-gray-500">No hay tags registrados</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="tag in tagStore.tags"
        :key="tag.id"
        class="card hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center space-x-3 flex-1">
            <div
              class="w-4 h-4 rounded-full flex-shrink-0"
              :style="{ backgroundColor: tag.color }"
            ></div>
            <div class="flex-1 min-w-0">
              <h3 class="font-medium text-gray-900 truncate">{{ tag.name }}</h3>
              <p class="text-sm text-gray-500">{{ tag.customers_count || 0 }} clientes</p>
            </div>
          </div>
          <div class="flex space-x-1 ml-2">
            <button
              @click="openEditModal(tag)"
              class="text-blue-600 hover:text-blue-800 p-1"
              title="Editar"
            >
              ✏️
            </button>
            <button
              @click="confirmDelete(tag)"
              class="text-red-600 hover:text-red-800 p-1"
              title="Eliminar"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4">
          {{ editingTag ? 'Editar Tag' : 'Nuevo Tag' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input w-full"
              placeholder="Nombre del tag"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div class="flex items-center space-x-2">
              <input
                v-model="form.color"
                type="color"
                class="h-10 w-16"
              />
              <input
                v-model="form.color"
                type="text"
                class="input flex-1"
                placeholder="#10B981"
              />
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button type="submit" :disabled="tagStore.loading" class="btn-primary flex-1">
              <span v-if="tagStore.loading">Guardando...</span>
              <span v-else>{{ editingTag ? 'Actualizar' : 'Crear' }}</span>
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
          ¿Estás seguro de eliminar el tag <strong>{{ tagToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="tagStore.loading" class="btn-danger flex-1">
            <span v-if="tagStore.loading">Eliminando...</span>
            <span v-else">Eliminar</span>
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
import { ref, onMounted } from 'vue'
import { useCustomerTagStore } from '@/stores/customerTag'

const tagStore = useCustomerTagStore()

const showModal = ref(false)
const showDeleteModal = ref(false)
const editingTag = ref(null)
const tagToDelete = ref(null)
const searchQuery = ref('')

const form = ref({
  name: '',
  color: '#10B981'
})

onMounted(async () => {
  await loadTags()
})

async function loadTags() {
  const params = {}
  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  await tagStore.fetchTags(params)
}

function handleSearch() {
  loadTags()
}

function openCreateModal() {
  editingTag.value = null
  form.value = {
    name: '',
    color: '#10B981'
  }
  showModal.value = true
}

function openEditModal(tag) {
  editingTag.value = tag
  form.value = {
    name: tag.name,
    color: tag.color || '#10B981'
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingTag.value = null
}

async function handleSubmit() {
  try {
    if (editingTag.value) {
      await tagStore.updateTag(editingTag.value.id, form.value)
    } else {
      await tagStore.createTag(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(tag) {
  tagToDelete.value = tag
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  tagToDelete.value = null
}

async function handleDelete() {
  const success = await tagStore.deleteTag(tagToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}
</script>

<style scoped>
.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
