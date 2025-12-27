<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Compras</h1>
        <p class="text-gray-600 mt-1">Gestiona las compras a proveedores</p>
      </div>
      <router-link v-if="can('create_purchases')" to="/purchases/create" class="btn-primary">
        + Nueva Compra
      </router-link>
    </div>

    <!-- Filters -->
    <div class="card">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar por número o proveedor..."
          class="input"
          @input="handleSearch"
        />
        <select v-model="filterStatus" @change="handleFilterChange" class="input">
          <option value="">Todos los estados</option>
          <option value="draft">Borrador</option>
          <option value="ordered">Ordenada</option>
          <option value="partial">Parcial</option>
          <option value="received">Recibida</option>
          <option value="canceled">Cancelada</option>
        </select>
        <select v-model="filterPaymentStatus" @change="handleFilterChange" class="input">
          <option value="">Estado de pago</option>
          <option value="pending">Pendiente</option>
          <option value="partial">Parcial</option>
          <option value="paid">Pagada</option>
        </select>
        <input
          v-model="filterDateFrom"
          type="date"
          class="input"
          @change="handleFilterChange"
        />
      </div>
    </div>

    <!-- Purchases Table -->
    <div class="card">
      <div v-if="purchaseStore.loading" class="text-center py-8">
        <p class="text-gray-500">Cargando compras...</p>
      </div>

      <div v-else-if="purchaseStore.purchases.length === 0" class="text-center py-8">
        <p class="text-gray-500">No hay compras registradas</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Número</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Proveedor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="purchase in purchaseStore.purchases" :key="purchase.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ purchase.purchase_number }}</div>
                <div v-if="purchase.supplier_invoice_number" class="text-xs text-gray-500">
                  Factura: {{ purchase.supplier_invoice_number }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ purchase.supplier?.name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(purchase.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                L {{ formatMoney(purchase.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusBadge(purchase.status)">
                  {{ getStatusLabel(purchase.status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getPaymentStatusBadge(purchase.payment_status)">
                  {{ getPaymentStatusLabel(purchase.payment_status) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                <router-link
                  :to="`/purchases/${purchase.id}`"
                  class="text-blue-600 hover:text-blue-800"
                >
                  Ver
                </router-link>
                <button
                  v-if="can('edit_purchases') && purchase.status === 'draft'"
                  @click="editPurchase(purchase)"
                  class="text-yellow-600 hover:text-yellow-800"
                >
                  Editar
                </button>
                <button
                  v-if="can('delete_purchases') && purchase.status === 'draft'"
                  @click="confirmDelete(purchase)"
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
      <div v-if="purchaseStore.pagination.total > purchaseStore.pagination.per_page" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-500">
          Mostrando {{ purchaseStore.purchases.length }} de {{ purchaseStore.pagination.total }} compras
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(purchaseStore.pagination.current_page - 1)"
            :disabled="purchaseStore.pagination.current_page === 1"
            class="btn-secondary"
          >
            Anterior
          </button>
          <button
            @click="changePage(purchaseStore.pagination.current_page + 1)"
            :disabled="purchaseStore.pagination.current_page * purchaseStore.pagination.per_page >= purchaseStore.pagination.total"
            class="btn-secondary"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-md w-full p-6">
        <h2 class="text-xl font-bold mb-4 text-red-600">Confirmar Eliminación</h2>
        <p class="text-gray-600 mb-6">
          ¿Estás seguro de eliminar la compra <strong>{{ purchaseToDelete?.purchase_number }}</strong>?
          Esta acción no se puede deshacer.
        </p>
        <div class="flex gap-2">
          <button @click="handleDelete" :disabled="purchaseStore.loading" class="btn-danger flex-1">
            <span v-if="purchaseStore.loading">Eliminando...</span>
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
import { useRouter } from 'vue-router'
import { usePurchaseStore } from '@/stores/purchase'
import { usePermissions } from '@/composables/usePermissions'

const router = useRouter()
const purchaseStore = usePurchaseStore()
const { can } = usePermissions()

const searchQuery = ref('')
const filterStatus = ref('')
const filterPaymentStatus = ref('')
const filterDateFrom = ref('')
const showDeleteModal = ref(false)
const purchaseToDelete = ref(null)

onMounted(() => {
  loadPurchases()
})

function loadPurchases() {
  const params = {
    page: purchaseStore.pagination.current_page,
    per_page: purchaseStore.pagination.per_page
  }

  if (searchQuery.value) {
    params.search = searchQuery.value
  }
  if (filterStatus.value) {
    params.status = filterStatus.value
  }
  if (filterPaymentStatus.value) {
    params.payment_status = filterPaymentStatus.value
  }
  if (filterDateFrom.value) {
    params.date_from = filterDateFrom.value
  }

  purchaseStore.fetchPurchases(params)
}

function handleSearch() {
  purchaseStore.pagination.current_page = 1
  loadPurchases()
}

function handleFilterChange() {
  purchaseStore.pagination.current_page = 1
  loadPurchases()
}

function changePage(page) {
  purchaseStore.pagination.current_page = page
  loadPurchases()
}

function editPurchase(purchase) {
  router.push(`/purchases/${purchase.id}/edit`)
}

function confirmDelete(purchase) {
  purchaseToDelete.value = purchase
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
  purchaseToDelete.value = null
}

async function handleDelete() {
  const success = await purchaseStore.deletePurchase(purchaseToDelete.value.id)
  if (success) {
    closeDeleteModal()
  }
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function formatMoney(amount) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

function getStatusLabel(status) {
  const labels = {
    draft: 'Borrador',
    ordered: 'Ordenada',
    partial: 'Parcial',
    received: 'Recibida',
    canceled: 'Cancelada'
  }
  return labels[status] || status
}

function getStatusBadge(status) {
  const badges = {
    draft: 'badge-gray',
    ordered: 'badge-blue',
    partial: 'badge-yellow',
    received: 'badge-green',
    canceled: 'badge-red'
  }
  return badges[status] || 'badge-gray'
}

function getPaymentStatusLabel(status) {
  const labels = {
    pending: 'Pendiente',
    partial: 'Parcial',
    paid: 'Pagada'
  }
  return labels[status] || status
}

function getPaymentStatusBadge(status) {
  const badges = {
    pending: 'badge-yellow',
    partial: 'badge-blue',
    paid: 'badge-green'
  }
  return badges[status] || 'badge-gray'
}
</script>

<style scoped>
.badge-gray {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800;
}

.badge-blue {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800;
}

.badge-yellow {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800;
}

.badge-green {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800;
}

.badge-red {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
