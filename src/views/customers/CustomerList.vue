<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clientes</h1>
        <p class="text-gray-600 mt-1">Gestiona tu cartera de clientes</p>
      </div>
      <button @click="openCreateModal" class="btn-primary">
        + Nuevo Cliente
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="card">
      <div class="flex gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar clientes por nombre, RTN, teléfono o email..."
          class="input flex-1"
          @input="handleSearch"
        />
        <select v-model="filterStatus" @change="handleFilterChange" class="input">
          <option value="">Todos los estados</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="card">
      <div v-if="customerStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando clientes...</p>
      </div>

      <div v-else-if="customerStore.customers.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay clientes registrados</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RTN</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédito</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in customerStore.customers" :key="customer.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="font-medium text-gray-900">{{ customer.name }}</div>
                <div v-if="customer.address" class="text-sm text-gray-500">{{ customer.address }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ customer.rtn || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ customer.phone || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                {{ customer.email || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500">
                <div>Límite: L {{ formatNumber(customer.credit_limit) }}</div>
                <div class="text-xs">Saldo: L {{ formatNumber(customer.current_balance) }}</div>
              </td>
              <td class="px-6 py-4">
                <span v-if="customer.is_active" class="badge-success">Activo</span>
                <span v-else class="badge-danger">Inactivo</span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button @click="openEditModal(customer)" class="text-blue-600 hover:text-blue-800">
                  Editar
                </button>
                <button @click="confirmDelete(customer)" class="text-red-600 hover:text-red-800">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="customerStore.pagination.total > customerStore.pagination.per_page" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ customerStore.customers.length }} de {{ customerStore.pagination.total }} clientes
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(customerStore.pagination.current_page - 1)"
            :disabled="customerStore.pagination.current_page === 1"
            class="btn-secondary"
          >
            Anterior
          </button>
          <button
            @click="changePage(customerStore.pagination.current_page + 1)"
            :disabled="customerStore.pagination.current_page * customerStore.pagination.per_page >= customerStore.pagination.total"
            class="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Nombre *</label>
              <input
                v-model="form.name"
                type="text"
                required
                class="input w-full"
                placeholder="Nombre del cliente"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">RTN</label>
              <input
                v-model="form.rtn"
                type="text"
                maxlength="14"
                class="input w-full"
                placeholder="0000-0000-000000"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                v-model="form.phone"
                type="tel"
                class="input w-full"
                placeholder="+504 0000-0000"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                v-model="form.email"
                type="email"
                class="input w-full"
                placeholder="cliente@example.com"
              />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
              <textarea
                v-model="form.address"
                rows="2"
                class="input w-full"
                placeholder="Dirección completa del cliente"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Límite de Crédito (L)</label>
              <input
                v-model.number="form.credit_limit"
                type="number"
                step="0.01"
                min="0"
                class="input w-full"
                placeholder="0.00"
              />
            </div>

            <div class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                id="is_active"
                class="mr-2"
              />
              <label for="is_active" class="text-sm text-gray-700">Cliente activo</label>
            </div>
          </div>

          <div class="flex gap-2 pt-4">
            <button type="submit" :disabled="customerStore.loading" class="btn-primary flex-1">
              <span v-if="customerStore.loading">Guardando...</span>
              <span v-else>{{ editingCustomer ? 'Actualizar' : 'Crear' }}</span>
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
          ¿Estás seguro de eliminar el cliente <strong>{{ customerToDelete?.name }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="customerStore.loading" class="btn-danger flex-1">
            <span v-if="customerStore.loading">Eliminando...</span>
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
import { useCustomerStore } from '@/stores/customer'

const customerStore = useCustomerStore()

const searchQuery = ref('')
const filterStatus = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingCustomer = ref(null)
const customerToDelete = ref(null)

const form = ref({
  name: '',
  rtn: '',
  phone: '',
  email: '',
  address: '',
  credit_limit: 0,
  is_active: true
})

onMounted(() => {
  loadCustomers()
})

function loadCustomers() {
  const params = {
    page: customerStore.pagination.current_page,
    per_page: customerStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  if (filterStatus.value !== '') {
    params.is_active = filterStatus.value
  }

  customerStore.fetchCustomers(params)
}

function handleSearch() {
  customerStore.pagination.current_page = 1
  loadCustomers()
}

function handleFilterChange() {
  customerStore.pagination.current_page = 1
  loadCustomers()
}

function changePage(page) {
  customerStore.pagination.current_page = page
  loadCustomers()
}

function openCreateModal() {
  editingCustomer.value = null
  form.value = {
    name: '',
    rtn: '',
    phone: '',
    email: '',
    address: '',
    credit_limit: 0,
    is_active: true
  }
  showModal.value = true
}

function openEditModal(customer) {
  editingCustomer.value = customer
  form.value = {
    name: customer.name,
    rtn: customer.rtn || '',
    phone: customer.phone || '',
    email: customer.email || '',
    address: customer.address || '',
    credit_limit: customer.credit_limit || 0,
    is_active: customer.is_active
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingCustomer.value = null
}

async function handleSubmit() {
  try {
    if (editingCustomer.value) {
      await customerStore.updateCustomer(editingCustomer.value.id, form.value)
    } else {
      await customerStore.createCustomer(form.value)
    }
    closeModal()
  } catch (error) {
    // Error already handled in store
  }
}

function confirmDelete(customer) {
  customerToDelete.value = customer
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  customerToDelete.value = null
}

async function handleDelete() {
  const success = await customerStore.deleteCustomer(customerToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}

function formatNumber(value) {
  return parseFloat(value || 0).toFixed(2)
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
