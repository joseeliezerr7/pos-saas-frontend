<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gastos</h1>
        <p class="mt-1 text-sm text-gray-600">Gestiona los gastos operativos de tu negocio</p>
      </div>
      <button
        v-if="can('create_expenses')"
        @click="openCreateModal"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Registrar Gasto
      </button>
    </div>

    <!-- Statistics Cards -->
    <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0 bg-red-500 rounded-md p-3">
            <svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-500 truncate">Total Gastos</dt>
              <dd class="text-lg font-semibold text-gray-900">L {{ formatCurrency(statistics.total_expenses) }}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="mb-4 grid grid-cols-1 md:grid-cols-5 gap-4">
      <div>
        <input
          v-model="filters.search"
          @input="loadExpenses"
          type="text"
          placeholder="Buscar..."
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <select
          v-model="filters.category"
          @change="loadExpenses"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las categorías</option>
          <option v-for="(label, value) in categories" :key="value" :value="value">
            {{ label }}
          </option>
        </select>
      </div>
      <div>
        <select
          v-model="filters.branch_id"
          @change="loadExpenses"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Todas las sucursales</option>
          <option v-for="branch in (branches || []).filter(b => b && b.id)" :key="branch.id" :value="branch.id">
            {{ branch.name }}
          </option>
        </select>
      </div>
      <div>
        <input
          v-model="filters.start_date"
          @change="loadExpenses"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <input
          v-model="filters.end_date"
          @change="loadExpenses"
          type="date"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
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

    <!-- Expenses Table -->
    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sucursal
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Método de Pago
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="expense in expenses" :key="expense.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(expense.expense_date) }}</div>
              <div v-if="expense.invoice_number" class="text-xs text-gray-500">
                Factura: {{ expense.invoice_number }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                {{ categories[expense.category] || expense.category }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="text-sm text-gray-900">{{ expense.description }}</div>
              <div v-if="expense.supplier" class="text-xs text-gray-500">
                Proveedor: {{ expense.supplier.name }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ expense.branch?.name || '-' }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">
                {{ paymentMethods[expense.payment_method] || expense.payment_method }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-semibold text-red-600">L {{ formatCurrency(expense.amount) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                v-if="can('edit_expenses')"
                @click="openEditModal(expense)"
                class="text-blue-600 hover:text-blue-900 mr-3"
                title="Editar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                v-if="can('delete_expenses')"
                @click="confirmDelete(expense)"
                class="text-red-600 hover:text-red-900"
                title="Eliminar"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </td>
          </tr>
          <tr v-if="expenses.length === 0">
            <td colspan="7" class="px-6 py-8 text-center text-gray-500">
              No se encontraron gastos
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Anterior
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              Mostrando
              <span class="font-medium">{{ pagination.from || 0 }}</span>
              a
              <span class="font-medium">{{ pagination.to || 0 }}</span>
              de
              <span class="font-medium">{{ pagination.total }}</span>
              resultados
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="changePage(pagination.current_page - 1)"
                :disabled="pagination.current_page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                @click="changePage(pagination.current_page + 1)"
                :disabled="pagination.current_page === pagination.last_page"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>
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
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeModal"></div>

          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <form @submit.prevent="handleSubmit">
              <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {{ editingExpense ? 'Editar Gasto' : 'Registrar Gasto' }}
                </h3>

                <div class="grid grid-cols-2 gap-4">
                  <!-- Category -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Categoría <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.category"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar categoría</option>
                      <option v-for="(label, value) in categories" :key="value" :value="value">
                        {{ label }}
                      </option>
                    </select>
                  </div>

                  <!-- Expense Date -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Fecha <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.expense_date"
                      type="date"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <!-- Description -->
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Descripción <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.description"
                      type="text"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe el gasto"
                    />
                  </div>

                  <!-- Amount -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Monto <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="form.amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <!-- Payment Method -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Método de Pago <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.payment_method"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar método</option>
                      <option v-for="(label, value) in paymentMethods" :key="value" :value="value">
                        {{ label }}
                      </option>
                    </select>
                  </div>

                  <!-- Branch -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Sucursal <span class="text-red-500">*</span>
                    </label>
                    <select
                      v-model="form.branch_id"
                      required
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar sucursal</option>
                      <option v-for="branch in (branches || []).filter(b => b && b.id)" :key="branch.id" :value="branch.id">
                        {{ branch.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Supplier -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Proveedor
                    </label>
                    <select
                      v-model="form.supplier_id"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Ninguno</option>
                      <option v-for="supplier in (suppliers || []).filter(s => s && s.id)" :key="supplier.id" :value="supplier.id">
                        {{ supplier.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Receipt Number -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Número de Recibo
                    </label>
                    <input
                      v-model="form.receipt_number"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <!-- Invoice Number -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Número de Factura
                    </label>
                    <input
                      v-model="form.invoice_number"
                      type="text"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <!-- Notes -->
                  <div class="col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      v-model="form.notes"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>
              </div>

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
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeDeleteModal"></div>

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
                    Eliminar Gasto
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      ¿Estás seguro de que deseas eliminar el gasto <strong>{{ expenseToDelete?.description }}</strong>?
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
import { ref, onMounted, reactive, computed } from 'vue'
import { useExpenseStore } from '@/stores/expense'
import branchService from '@/services/branchService'
import supplierService from '@/services/supplierService'
import { usePermissions } from '@/composables/usePermissions'

// Store
const expenseStore = useExpenseStore()
const { can } = usePermissions()

// Computed properties from store
const expenses = computed(() => expenseStore.expenses)
const categories = computed(() => expenseStore.categories)
const paymentMethods = computed(() => expenseStore.paymentMethods)
const statistics = computed(() => expenseStore.statistics)
const loading = computed(() => expenseStore.loading)
const pagination = computed(() => expenseStore.pagination)

// Local state (UI only)
const branches = ref([])
const suppliers = ref([])
const submitting = ref(false)
const error = ref(null)
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingExpense = ref(null)
const expenseToDelete = ref(null)

const filters = reactive({
  search: '',
  category: '',
  branch_id: '',
  start_date: '',
  end_date: '',
  page: 1
})

const form = ref({
  category: '',
  description: '',
  amount: 0,
  expense_date: new Date().toISOString().split('T')[0],
  payment_method: 'cash',
  branch_id: '',
  supplier_id: '',
  receipt_number: '',
  invoice_number: '',
  notes: ''
})

// Methods
async function loadExpenses() {
  error.value = null
  try {
    await expenseStore.fetchExpenses(filters)
  } catch (err) {
    error.value = 'Error al cargar los gastos'
    console.error('Error loading expenses:', err)
  }
}

async function loadCategories() {
  try {
    await expenseStore.fetchCategories()
  } catch (err) {
    console.error('Error loading categories:', err)
  }
}

async function loadPaymentMethods() {
  try {
    await expenseStore.fetchPaymentMethods()
  } catch (err) {
    console.error('Error loading payment methods:', err)
  }
}

async function loadBranches() {
  try {
    const response = await branchService.getAllBranches()
    if (response.data.success) {
      // Si es un array directo, úsalo. Si es un objeto paginado, extrae el array
      branches.value = Array.isArray(response.data.data)
        ? response.data.data
        : (response.data.data.data || [])
    }
  } catch (err) {
    console.error('Error loading branches:', err)
  }
}

async function loadSuppliers() {
  try {
    const response = await supplierService.getAll({ all: true })
    if (response.data.success) {
      // Si es un array directo, úsalo. Si es un objeto paginado, extrae el array
      suppliers.value = Array.isArray(response.data.data)
        ? response.data.data
        : (response.data.data.data || [])
    }
  } catch (err) {
    console.error('Error loading suppliers:', err)
  }
}

async function loadStatistics() {
  try {
    await expenseStore.fetchStatistics(filters)
  } catch (err) {
    console.error('Error loading statistics:', err)
  }
}

function openCreateModal() {
  form.value = {
    category: '',
    description: '',
    amount: 0,
    expense_date: new Date().toISOString().split('T')[0],
    payment_method: 'cash',
    branch_id: (branches.value && branches.value.length > 0) ? branches.value[0].id : '',
    supplier_id: '',
    receipt_number: '',
    invoice_number: '',
    notes: ''
  }
  editingExpense.value = null
  showModal.value = true
}

function openEditModal(expense) {
  form.value = {
    category: expense.category,
    description: expense.description,
    amount: expense.amount,
    expense_date: expense.expense_date,
    payment_method: expense.payment_method,
    branch_id: expense.branch_id,
    supplier_id: expense.supplier_id || '',
    receipt_number: expense.receipt_number || '',
    invoice_number: expense.invoice_number || '',
    notes: expense.notes || ''
  }
  editingExpense.value = expense
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingExpense.value = null
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (editingExpense.value) {
      await expenseStore.updateExpense(editingExpense.value.id, form.value)
    } else {
      await expenseStore.createExpense(form.value)
    }

    closeModal()
    await loadExpenses()
    await loadStatistics()
  } catch (err) {
    console.error('Error submitting form:', err)
    // Error handling is done in the store with toast notifications
  } finally {
    submitting.value = false
  }
}

function confirmDelete(expense) {
  expenseToDelete.value = expense
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  expenseToDelete.value = null
}

async function handleDelete() {
  if (!expenseToDelete.value) return

  submitting.value = true
  try {
    const success = await expenseStore.deleteExpense(expenseToDelete.value.id)
    if (success) {
      closeDeleteModal()
      await loadStatistics()
    }
  } catch (err) {
    console.error('Error deleting expense:', err)
    // Error handling is done in the store with toast notifications
  } finally {
    submitting.value = false
  }
}

function changePage(page) {
  if (page < 1 || page > pagination.value.last_page) return
  filters.page = page
  loadExpenses()
}

function formatCurrency(amount) {
  return parseFloat(amount || 0).toFixed(2)
}

function formatDate(date) {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('es-HN')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadCategories(),
    loadPaymentMethods(),
    loadBranches(),
    loadSuppliers()
  ])
  await loadExpenses()
  await loadStatistics()
})
</script>
