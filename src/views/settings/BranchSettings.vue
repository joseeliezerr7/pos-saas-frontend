<template>
  <div>
    <div class="mb-6 flex justify-end">
      <button @click="openCreateModal"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nueva Sucursal
      </button>
    </div>

    <!-- Loading State -->
    <loading-spinner v-if="branchStore.loading && branches.length === 0" text="Cargando sucursales..." />

    <!-- Branches List -->
    <div v-else>
      <div v-if="branches.length === 0" class="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <p class="text-lg font-medium">No hay sucursales registradas</p>
        <p class="mt-2">Crea tu primera sucursal para comenzar</p>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="branch in branches" :key="branch.id"
             class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <!-- Branch Header -->
          <div class="flex justify-between items-start mb-4">
            <div class="flex-1">
              <div class="flex items-center">
                <h3 class="text-lg font-semibold text-gray-900">{{ branch.name }}</h3>
                <span v-if="branch.is_main"
                      class="ml-2 px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                  Principal
                </span>
              </div>
              <p class="text-sm text-gray-500 mt-1">{{ branch.code }}</p>
            </div>
            <span :class="branch.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 text-xs font-medium rounded-full">
              {{ branch.is_active ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <!-- Branch Details -->
          <div class="space-y-2 mb-4">
            <div class="flex items-start text-sm">
              <svg class="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span class="text-gray-700">{{ branch.address || 'Sin dirección' }}</span>
            </div>
            <div v-if="branch.phone" class="flex items-center text-sm">
              <svg class="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span class="text-gray-700">{{ branch.phone }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex space-x-2 pt-4 border-t">
            <button @click="editBranch(branch)"
                    class="flex-1 px-3 py-2 text-sm font-medium text-primary-700 bg-primary-50 rounded-lg hover:bg-primary-100">
              Editar
            </button>
            <button v-if="!branch.is_main"
                    @click="deleteBranch(branch)"
                    class="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <modal-dialog :show="showModal"
                  :title="selectedBranch ? 'Editar Sucursal' : 'Nueva Sucursal'"
                  @close="closeModal"
                  size="large">
      <form @submit.prevent="saveBranch">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Name -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
            <input v-model="form.name"
                   type="text"
                   required
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                   placeholder="Sucursal Principal" />
          </div>

          <!-- Code -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Código *</label>
            <input v-model="form.code"
                   type="text"
                   required
                   maxlength="20"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                   placeholder="PRIN-001" />
          </div>

          <!-- Phone -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
            <input v-model="form.phone"
                   type="text"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                   placeholder="+504 0000-0000" />
          </div>

          <!-- Address -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
            <textarea v-model="form.address"
                      rows="2"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Dirección completa de la sucursal"></textarea>
          </div>

          <!-- Is Main -->
          <div class="flex items-center">
            <input v-model="form.is_main"
                   type="checkbox"
                   :disabled="!!selectedBranch && selectedBranch.is_main"
                   class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:opacity-50" />
            <label class="ml-2 text-sm font-medium text-gray-700">Sucursal Principal</label>
          </div>

          <!-- Is Active -->
          <div class="flex items-center">
            <input v-model="form.is_active"
                   type="checkbox"
                   class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
            <label class="ml-2 text-sm font-medium text-gray-700">Sucursal Activa</label>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit"
                  :disabled="branchStore.loading"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {{ branchStore.loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </modal-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useBranchStore } from '@/stores/branch'
import { toast } from 'vue3-toastify'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'

const branchStore = useBranchStore()

const showModal = ref(false)
const selectedBranch = ref(null)

const form = ref({
  name: '',
  code: '',
  phone: '',
  address: '',
  is_main: false,
  is_active: true
})

const branches = computed(() => branchStore.branches)

onMounted(async () => {
  await loadBranches()
})

async function loadBranches() {
  try {
    await branchStore.fetchBranches()
  } catch (error) {
    console.error('Error loading branches:', error)
  }
}

function openCreateModal() {
  selectedBranch.value = null
  form.value = {
    name: '',
    code: '',
    phone: '',
    address: '',
    is_main: false,
    is_active: true
  }
  showModal.value = true
}

function editBranch(branch) {
  selectedBranch.value = branch
  form.value = {
    name: branch.name,
    code: branch.code,
    phone: branch.phone || '',
    address: branch.address || '',
    is_main: branch.is_main,
    is_active: branch.is_active
  }
  showModal.value = true
}

async function saveBranch() {
  try {
    if (selectedBranch.value) {
      await branchStore.updateBranch(selectedBranch.value.id, form.value)
      toast.success('Sucursal actualizada exitosamente')
    } else {
      await branchStore.createBranch(form.value)
      toast.success('Sucursal creada exitosamente')
    }
    closeModal()
  } catch (error) {
    console.error('Error saving branch:', error)
    toast.error(selectedBranch.value ? 'Error al actualizar sucursal' : 'Error al crear sucursal')
  }
}

async function deleteBranch(branch) {
  if (!confirm(`¿Estás seguro de eliminar la sucursal "${branch.name}"?`)) return

  try {
    await branchStore.deleteBranch(branch.id)
    toast.success('Sucursal eliminada exitosamente')
  } catch (error) {
    console.error('Error deleting branch:', error)
    toast.error('Error al eliminar sucursal')
  }
}

function closeModal() {
  showModal.value = false
  selectedBranch.value = null
  form.value = {
    name: '',
    code: '',
    phone: '',
    address: '',
    is_main: false,
    is_active: true
  }
}
</script>
