<template>
  <div class="suppliers p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Proveedores</h1>
        <p class="text-gray-600 mt-2">Gestione su catálogo de proveedores</p>
      </div>
      <button @click="openCreateModal" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        + Nuevo Proveedor
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Buscar por nombre, RTN o contacto..."
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

    <!-- Suppliers Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p class="mt-2 text-gray-600">Cargando proveedores...</p>
        </div>

        <div v-else-if="suppliers.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay proveedores</h3>
          <p class="mt-1 text-sm text-gray-500">Comience agregando un nuevo proveedor.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RTN</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contacto</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teléfono</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Crédito</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="supplier in suppliers" :key="supplier.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 text-sm font-medium text-gray-900">
                  {{ supplier.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ supplier.rtn || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ supplier.contact_name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ supplier.phone || '-' }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ supplier.email || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div v-if="supplier.credit_days > 0 || supplier.credit_limit > 0">
                    <div v-if="supplier.credit_days > 0">{{ supplier.credit_days }} días</div>
                    <div v-if="supplier.credit_limit > 0" class="text-xs">Límite: L {{ formatMoney(supplier.credit_limit) }}</div>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span v-if="supplier.is_active" class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                  <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button @click="openEditModal(supplier)" class="text-blue-600 hover:text-blue-800 mr-3">
                    Editar
                  </button>
                  <button @click="confirmDelete(supplier)" class="text-red-600 hover:text-red-800">
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
            Mostrando {{ suppliers.length }} de {{ pagination.total }} proveedores
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
          {{ editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Name -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Proveedor *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del proveedor"
              />
            </div>

            <!-- RTN -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">RTN</label>
              <input
                v-model="form.rtn"
                type="text"
                maxlength="14"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0000000000000"
              />
            </div>

            <!-- Contact Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre del Contacto</label>
              <input
                v-model="form.contact_name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nombre del contacto"
              />
            </div>

            <!-- Phone -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                v-model="form.phone"
                type="tel"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="+504 0000-0000"
              />
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@ejemplo.com"
              />
            </div>

            <!-- Credit Days -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Días de Crédito</label>
              <input
                v-model.number="form.credit_days"
                type="number"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <!-- Credit Limit -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Límite de Crédito (L)</label>
              <input
                v-model.number="form.credit_limit"
                type="number"
                step="0.01"
                min="0"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <textarea
                v-model="form.address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dirección completa"
              ></textarea>
            </div>

            <!-- Active Status -->
            <div v-if="editingSupplier" class="md:col-span-2">
              <div class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  id="is_active"
                  class="mr-2"
                />
                <label for="is_active" class="text-sm text-gray-700">Proveedor activo</label>
              </div>
            </div>
          </div>

          <div class="flex gap-2 pt-4 border-t">
            <button
              type="submit"
              :disabled="supplierStore.loading"
              class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ supplierStore.loading ? 'Guardando...' : (editingSupplier ? 'Actualizar' : 'Crear') }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
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
          ¿Está seguro de eliminar el proveedor <strong>{{ supplierToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button
            @click="handleDelete"
            :disabled="supplierStore.loading"
            class="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {{ supplierStore.loading ? 'Eliminando...' : 'Eliminar' }}
          </button>
          <button
            @click="closeDeleteModal"
            class="flex-1 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSupplierStore } from '@/stores/supplier'

const supplierStore = useSupplierStore()

const searchQuery = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingSupplier = ref(null)
const supplierToDelete = ref(null)

const form = ref({
  name: '',
  rtn: '',
  contact_name: '',
  phone: '',
  email: '',
  address: '',
  credit_days: 0,
  credit_limit: 0,
  is_active: true
})

const loading = computed(() => supplierStore.loading)
const suppliers = computed(() => supplierStore.suppliers || [])
const pagination = computed(() => supplierStore.pagination)

onMounted(() => {
  loadSuppliers()
})

async function loadSuppliers() {
  const params = {
    page: supplierStore.pagination.current_page,
    per_page: supplierStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  if (filterStatus.value !== '') {
    params.is_active = filterStatus.value
  }

  await supplierStore.fetchSuppliers(params)
}

function handleSearch() {
  supplierStore.pagination.current_page = 1
  loadSuppliers()
}

function handleFilterChange() {
  supplierStore.pagination.current_page = 1
  loadSuppliers()
}

function changePage(page) {
  supplierStore.pagination.current_page = page
  loadSuppliers()
}

function openCreateModal() {
  editingSupplier.value = null
  form.value = {
    name: '',
    rtn: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    credit_days: 0,
    credit_limit: 0,
    is_active: true
  }
  showModal.value = true
}

function openEditModal(supplier) {
  editingSupplier.value = supplier
  form.value = {
    name: supplier.name,
    rtn: supplier.rtn || '',
    contact_name: supplier.contact_name || '',
    phone: supplier.phone || '',
    email: supplier.email || '',
    address: supplier.address || '',
    credit_days: supplier.credit_days || 0,
    credit_limit: supplier.credit_limit || 0,
    is_active: supplier.is_active
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingSupplier.value = null
}

async function handleSubmit() {
  try {
    if (editingSupplier.value) {
      await supplierStore.updateSupplier(editingSupplier.value.id, form.value)
    } else {
      await supplierStore.createSupplier(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(supplier) {
  supplierToDelete.value = supplier
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  supplierToDelete.value = null
}

async function handleDelete() {
  const success = await supplierStore.deleteSupplier(supplierToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toFixed(2)
}
</script>
