<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
        <p class="text-gray-600 mt-1">Gestiona los roles y permisos del sistema</p>
      </div>
      <button v-if="can('create_roles')" @click="openCreateModal" class="btn-primary">
        + Nuevo Rol
      </button>
    </div>

    <!-- Search -->
    <div class="card">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar roles..."
        class="input w-full"
        @input="handleSearch"
      />
    </div>

    <!-- Roles Table -->
    <div class="card">
      <div v-if="roleStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando roles...</p>
      </div>

      <div v-else-if="roleStore.roles.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay roles registrados</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permisos</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuarios</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="role in roleStore.roles" :key="role.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <div class="font-medium text-gray-900">{{ role.name }}</div>
                  <div v-if="role.description" class="text-sm text-gray-500">{{ role.description }}</div>
                  <span v-if="role.is_system" class="inline-flex mt-1 items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    Sistema
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-900 font-medium">{{ role.permissions_count || 0 }}</span>
                <span class="text-sm text-gray-500"> permisos</span>
              </td>
              <td class="px-6 py-4">
                <span class="text-sm text-gray-900 font-medium">{{ role.users_count || 0 }}</span>
                <span class="text-sm text-gray-500"> usuarios</span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button v-if="can('edit_roles') || role.is_system" @click="openEditModal(role)" class="text-blue-600 hover:text-blue-800">
                  {{ role.is_system ? 'Ver' : 'Editar' }}
                </button>
                <button
                  v-if="!role.is_system && can('delete_roles')"
                  @click="confirmDelete(role)"
                  class="text-red-600 hover:text-red-800"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="roleStore.pagination.total > roleStore.pagination.per_page" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ roleStore.roles.length }} de {{ roleStore.pagination.total }} roles
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(roleStore.pagination.current_page - 1)"
            :disabled="roleStore.pagination.current_page === 1"
            class="btn-secondary"
          >
            Anterior
          </button>
          <button
            @click="changePage(roleStore.pagination.current_page + 1)"
            :disabled="roleStore.pagination.current_page * roleStore.pagination.per_page >= roleStore.pagination.total"
            class="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingRole ? (editingRole.is_system ? 'Ver Rol' : 'Editar Rol') : 'Nuevo Rol' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Rol *</label>
            <input
              v-model="form.name"
              type="text"
              required
              :disabled="editingRole?.is_system"
              class="input w-full"
              :class="{ 'bg-gray-100': editingRole?.is_system }"
              placeholder="Ej: Cajero, Gerente, etc."
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
            <textarea
              v-model="form.description"
              rows="2"
              :disabled="editingRole?.is_system"
              class="input w-full"
              :class="{ 'bg-gray-100': editingRole?.is_system }"
              placeholder="Descripción opcional del rol"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-3">Permisos</label>
            <div v-if="loadingPermissions" class="text-center py-4">
              <p class="text-gray-500">Cargando permisos...</p>
            </div>
            <div v-else class="space-y-4">
              <div v-for="(permissions, group) in groupedPermissions" :key="group" class="border rounded-lg p-4">
                <div class="flex items-center mb-3">
                  <input
                    type="checkbox"
                    :id="`group-${group}`"
                    :checked="isGroupSelected(permissions)"
                    @change="toggleGroup(permissions)"
                    :disabled="editingRole?.is_system"
                    class="rounded mr-2"
                  />
                  <label :for="`group-${group}`" class="font-medium text-gray-900 cursor-pointer">
                    {{ group }}
                  </label>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 ml-6">
                  <label
                    v-for="permission in permissions"
                    :key="permission.id"
                    class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      :value="permission.id"
                      v-model="form.permission_ids"
                      :disabled="editingRole?.is_system"
                      class="rounded"
                    />
                    <span class="text-sm text-gray-700">{{ permission.name }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!editingRole?.is_system" class="flex gap-2 pt-4 border-t">
            <button type="submit" :disabled="roleStore.loading" class="btn-primary flex-1">
              <span v-if="roleStore.loading">Guardando...</span>
              <span v-else>{{ editingRole ? 'Actualizar' : 'Crear' }}</span>
            </button>
            <button type="button" @click="closeModal" class="btn-secondary flex-1">
              Cancelar
            </button>
          </div>
          <div v-else class="flex gap-2 pt-4 border-t">
            <button type="button" @click="closeModal" class="btn-secondary w-full">
              Cerrar
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
          ¿Estás seguro de eliminar el rol <strong>{{ roleToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="roleStore.loading" class="btn-danger flex-1">
            <span v-if="roleStore.loading">Eliminando...</span>
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
import { ref, computed, onMounted } from 'vue'
import { useRoleStore } from '@/stores/role'
import { usePermissions } from '@/composables/usePermissions'

const roleStore = useRoleStore()
const { can } = usePermissions()

const searchQuery = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingRole = ref(null)
const roleToDelete = ref(null)
const loadingPermissions = ref(false)

const form = ref({
  name: '',
  description: '',
  permission_ids: []
})

const groupedPermissions = computed(() => roleStore.permissions)

onMounted(() => {
  loadRoles()
})

function loadRoles() {
  const params = {
    page: roleStore.pagination.current_page,
    per_page: roleStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  roleStore.fetchRoles(params)
}

function handleSearch() {
  roleStore.pagination.current_page = 1
  loadRoles()
}

function changePage(page) {
  roleStore.pagination.current_page = page
  loadRoles()
}

async function openCreateModal() {
  editingRole.value = null
  form.value = {
    name: '',
    description: '',
    permission_ids: []
  }
  showModal.value = true
  await loadPermissions()
}

async function openEditModal(role) {
  editingRole.value = role
  showModal.value = true
  await loadPermissions()

  // Fetch full role details
  const fullRole = await roleStore.fetchRoleById(role.id)
  if (fullRole) {
    form.value = {
      name: fullRole.name,
      description: fullRole.description || '',
      permission_ids: fullRole.permissions ? fullRole.permissions.map(p => p.id) : []
    }
  }
}

function closeModal() {
  showModal.value = false
  editingRole.value = null
}

async function loadPermissions() {
  if (Object.keys(roleStore.permissions).length === 0) {
    loadingPermissions.value = true
    await roleStore.fetchAllPermissions()
    loadingPermissions.value = false
  }
}

async function handleSubmit() {
  try {
    if (editingRole.value) {
      await roleStore.updateRole(editingRole.value.id, form.value)
    } else {
      await roleStore.createRole(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(role) {
  roleToDelete.value = role
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  roleToDelete.value = null
}

async function handleDelete() {
  const success = await roleStore.deleteRole(roleToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}

function isGroupSelected(permissions) {
  return permissions.every(p => form.value.permission_ids.includes(p.id))
}

function toggleGroup(permissions) {
  const allSelected = isGroupSelected(permissions)
  permissions.forEach(permission => {
    if (allSelected) {
      // Remove all permissions in this group
      form.value.permission_ids = form.value.permission_ids.filter(id => id !== permission.id)
    } else {
      // Add all permissions in this group
      if (!form.value.permission_ids.includes(permission.id)) {
        form.value.permission_ids.push(permission.id)
      }
    }
  })
}
</script>

<style scoped>
.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
