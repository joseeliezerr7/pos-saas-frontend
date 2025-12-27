<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Ajustes de Inventario</h1>
        <p class="text-gray-600 mt-1">Gestión de ajustes y conteos de inventario</p>
      </div>
      <router-link
        to="/inventory/adjustments/create"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo Ajuste
      </router-link>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Estado</label>
          <select
            v-model="filters.status"
            @change="loadAdjustments"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Razón</label>
          <select
            v-model="filters.reason"
            @change="loadAdjustments"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas</option>
            <option value="physical_count">Conteo Físico</option>
            <option value="damage">Daño/Deterioro</option>
            <option value="theft">Robo/Pérdida</option>
            <option value="expiration">Caducidad</option>
            <option value="correction">Corrección</option>
            <option value="other">Otro</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
          <input
            v-model="filters.date_from"
            type="date"
            @change="loadAdjustments"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
          <input
            v-model="filters.date_to"
            type="date"
            @change="loadAdjustments"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando ajustes...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Empty State -->
      <div v-if="adjustments.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p class="text-lg font-medium">No hay ajustes de inventario</p>
        <p class="mt-2">Los ajustes que crees aparecerán aquí</p>
      </div>

      <!-- Table -->
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Razón</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Ajuste</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="adjustment in adjustments" :key="adjustment.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ adjustment.adjustment_number }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(adjustment.created_at) }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(adjustment.created_at) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="text-sm text-gray-900">{{ adjustment.reason_label }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ adjustment.items_count }} items
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-semibold text-gray-900">L {{ formatMoney(adjustment.total_adjustment) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(adjustment.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ adjustment.status_label }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <div class="flex space-x-2">
                <router-link
                  :to="`/inventory/adjustments/${adjustment.id}`"
                  class="text-blue-600 hover:text-blue-900"
                  title="Ver detalles"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </router-link>
                <button
                  v-if="adjustment.can_approve"
                  @click="confirmApprove(adjustment)"
                  class="text-green-600 hover:text-green-900"
                  title="Aprobar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button
                  v-if="adjustment.can_reject"
                  @click="confirmReject(adjustment)"
                  class="text-red-600 hover:text-red-900"
                  title="Rechazar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  v-if="adjustment.status === 'pending'"
                  @click="confirmDelete(adjustment)"
                  class="text-gray-600 hover:text-gray-900"
                  title="Eliminar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }} a {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de {{ pagination.total }} ajustes
        </div>
        <div class="flex gap-2">
          <button
            @click="changePage(pagination.current_page - 1)"
            :disabled="pagination.current_page === 1"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            @click="changePage(pagination.current_page + 1)"
            :disabled="pagination.current_page === pagination.last_page"
            class="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import inventoryAdjustmentService from '@/services/inventoryAdjustmentService'
import { toast } from 'vue3-toastify'

const adjustments = ref([])
const loading = ref(false)

const filters = ref({
  status: '',
  reason: '',
  date_from: '',
  date_to: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
})

onMounted(() => {
  loadAdjustments()
})

async function loadAdjustments() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
      ...filters.value
    }
    const response = await inventoryAdjustmentService.getAll(params)
    if (response.data.success) {
      adjustments.value = response.data.data
      pagination.value = response.data.meta
    }
  } catch (error) {
    console.error('Error loading adjustments:', error)
    toast.error('Error al cargar los ajustes de inventario')
  } finally {
    loading.value = false
  }
}

function confirmApprove(adjustment) {
  if (confirm(`¿Aprobar el ajuste ${adjustment.adjustment_number}? Esto actualizará el inventario.`)) {
    approveAdjustment(adjustment)
  }
}

async function approveAdjustment(adjustment) {
  loading.value = true
  try {
    await inventoryAdjustmentService.approve(adjustment.id)
    toast.success('Ajuste aprobado exitosamente')
    loadAdjustments()
  } catch (error) {
    console.error('Error approving adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al aprobar el ajuste')
  } finally {
    loading.value = false
  }
}

function confirmReject(adjustment) {
  if (confirm(`¿Rechazar el ajuste ${adjustment.adjustment_number}?`)) {
    rejectAdjustment(adjustment)
  }
}

async function rejectAdjustment(adjustment) {
  loading.value = true
  try {
    await inventoryAdjustmentService.reject(adjustment.id)
    toast.success('Ajuste rechazado exitosamente')
    loadAdjustments()
  } catch (error) {
    console.error('Error rejecting adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al rechazar el ajuste')
  } finally {
    loading.value = false
  }
}

function confirmDelete(adjustment) {
  if (confirm(`¿Eliminar el ajuste ${adjustment.adjustment_number}?`)) {
    deleteAdjustment(adjustment)
  }
}

async function deleteAdjustment(adjustment) {
  loading.value = true
  try {
    await inventoryAdjustmentService.delete(adjustment.id)
    toast.success('Ajuste eliminado exitosamente')
    loadAdjustments()
  } catch (error) {
    console.error('Error deleting adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al eliminar el ajuste')
  } finally {
    loading.value = false
  }
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page
    loadAdjustments()
  }
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-HN')
}

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function getStatusClass(status) {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}
</script>
