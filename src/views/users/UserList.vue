<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Usuarios</h1>
        <p class="text-gray-600 mt-1">Gestiona los usuarios del sistema</p>
      </div>
      <button v-if="can('create_users')" @click="openCreateModal" class="btn-primary">
        + Nuevo Usuario
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por nombre o email..."
          class="input"
          @input="handleSearch"
        />
        <select v-model="filterStatus" @change="handleFilterChange" class="input">
          <option value="">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
          <option value="suspended">Suspendidos</option>
        </select>
        <select v-model="filterRole" @change="handleFilterChange" class="input">
          <option value="">Todos los roles</option>
          <option v-for="role in roleStore.roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Users Table -->
    <div class="card">
      <div v-if="userStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando usuarios...</p>
      </div>

      <div v-else-if="userStore.users.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay usuarios registrados</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sucursal</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in userStore.users" :key="user.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="h-10 w-10 flex-shrink-0 rounded-full bg-primary-100 flex items-center justify-center">
                    <span class="text-primary-600 font-medium">{{ user.name.charAt(0).toUpperCase() }}</span>
                  </div>
                  <div class="ml-4">
                    <div class="font-medium text-gray-900">{{ user.name }}</div>
                    <div class="text-sm text-gray-500">{{ user.email }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in user.roles"
                    :key="role.id"
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {{ role.name }}
                  </span>
                  <span v-if="!user.roles || user.roles.length === 0" class="text-sm text-gray-400">
                    Sin rol
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ user.branch?.name || '-' }}
              </td>
              <td class="px-6 py-4">
                <span v-if="user.status === 'active'" class="badge-success">Activo</span>
                <span v-else-if="user.status === 'inactive'" class="badge-warning">Inactivo</span>
                <span v-else-if="user.status === 'suspended'" class="badge-danger">Suspendido</span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button v-if="can('edit_users')" @click="openEditModal(user)" class="text-blue-600 hover:text-blue-800">
                  Editar
                </button>
                <button v-if="can('delete_users')" @click="confirmDelete(user)" class="text-red-600 hover:text-red-800">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="userStore.pagination.total > userStore.pagination.per_page" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ userStore.users.length }} de {{ userStore.pagination.total }} usuarios
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(userStore.pagination.current_page - 1)"
            :disabled="userStore.pagination.current_page === 1"
            class="btn-secondary"
          >
            Anterior
          </button>
          <button
            @click="changePage(userStore.pagination.current_page + 1)"
            :disabled="userStore.pagination.current_page * userStore.pagination.per_page >= userStore.pagination.total"
            class="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingUser ? 'Editar Usuario' : 'Nuevo Usuario' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input
              v-model="form.name"
              type="text"
              required
              class="input w-full"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Email *</label>
            <input
              v-model="form.email"
              type="email"
              required
              class="input w-full"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ editingUser ? 'Contraseña (dejar en blanco para no cambiar)' : 'Contraseña *' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :required="!editingUser"
              class="input w-full"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ editingUser ? 'Confirmar Contraseña' : 'Confirmar Contraseña *' }}
            </label>
            <input
              v-model="form.password_confirmation"
              type="password"
              :required="!editingUser && form.password"
              class="input w-full"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Roles</label>
            <div class="space-y-2 max-h-40 overflow-y-auto border rounded p-3">
              <label
                v-for="role in roleStore.roles"
                :key="role.id"
                class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              >
                <input
                  type="checkbox"
                  :value="role.id"
                  v-model="form.role_ids"
                  class="rounded"
                />
                <span class="text-sm">{{ role.name }}</span>
                <span v-if="role.description" class="text-xs text-gray-500">- {{ role.description }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
            <select v-model="form.branch_id" class="input w-full">
              <option :value="null">Sin asignar (Todas las sucursales)</option>
              <option v-for="branch in branchStore.branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">
              Los administradores pueden acceder a todas las sucursales. Los demás usuarios solo a la asignada.
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select v-model="form.status" class="input w-full">
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
              <option value="suspended">Suspendido</option>
            </select>
          </div>

          <div class="flex gap-2 pt-4">
            <button type="submit" :disabled="userStore.loading" class="btn-primary flex-1">
              <span v-if="userStore.loading">Guardando...</span>
              <span v-else>{{ editingUser ? 'Actualizar' : 'Crear' }}</span>
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
          ¿Estás seguro de eliminar al usuario <strong>{{ userToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="userStore.loading" class="btn-danger flex-1">
            <span v-if="userStore.loading">Eliminando...</span>
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
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRoleStore } from '@/stores/role'
import { useBranchStore } from '@/stores/branch'
import { usePermissions } from '@/composables/usePermissions'

const userStore = useUserStore()
const roleStore = useRoleStore()
const branchStore = useBranchStore()
const { can } = usePermissions()

const searchQuery = ref('')
const filterStatus = ref('')
const filterRole = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingUser = ref(null)
const userToDelete = ref(null)

const form = ref({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  role_ids: [],
  branch_id: null,
  status: 'active'
})

onMounted(() => {
  loadUsers()
  roleStore.fetchRoles({ per_page: 100 })
  branchStore.fetchBranches({ per_page: 100 })
})

function loadUsers() {
  const params = {
    page: userStore.pagination.current_page,
    per_page: userStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  if (filterStatus.value) {
    params.status = filterStatus.value
  }

  if (filterRole.value) {
    params.role_id = filterRole.value
  }

  userStore.fetchUsers(params)
}

function handleSearch() {
  userStore.pagination.current_page = 1
  loadUsers()
}

function handleFilterChange() {
  userStore.pagination.current_page = 1
  loadUsers()
}

function changePage(page) {
  userStore.pagination.current_page = page
  loadUsers()
}

function openCreateModal() {
  editingUser.value = null
  form.value = {
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_ids: [],
    branch_id: null,
    status: 'active'
  }
  showModal.value = true
}

function openEditModal(user) {
  editingUser.value = user
  form.value = {
    name: user.name,
    email: user.email,
    password: '',
    password_confirmation: '',
    role_ids: user.roles ? user.roles.map(r => r.id) : [],
    branch_id: user.branch_id,
    status: user.status
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingUser.value = null
}

async function handleSubmit() {
  try {
    if (editingUser.value) {
      await userStore.updateUser(editingUser.value.id, form.value)
    } else {
      await userStore.createUser(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(user) {
  userToDelete.value = user
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  userToDelete.value = null
}

async function handleDelete() {
  const success = await userStore.deleteUser(userToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}
</script>

<style scoped>
.badge-success {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800;
}

.badge-warning {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800;
}

.badge-danger {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
