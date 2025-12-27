<template>
  <div class="p-6">
    <!-- Header with actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="text-gray-600 hover:text-gray-900"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Ajuste {{ adjustment?.adjustment_number }}
          </h1>
          <p class="text-gray-600 mt-1">Detalle del ajuste de inventario</p>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          v-if="adjustment?.can_approve"
          @click="confirmApprove"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Aprobar
        </button>
        <button
          v-if="adjustment?.can_reject"
          @click="confirmReject"
          class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rechazar
        </button>
        <button
          v-if="adjustment?.status === 'pending'"
          @click="confirmDelete"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Eliminar
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando ajuste...</p>
    </div>

    <!-- Adjustment Content -->
    <div v-else-if="adjustment" class="space-y-6">
      <!-- Status Badge -->
      <div v-if="adjustment.status === 'approved'" class="bg-green-50 border-l-4 border-green-400 p-4">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-green-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-green-800">Ajuste Aprobado</h3>
            <p class="text-sm text-green-700">
              Aprobado por {{ adjustment.approver_name }} el {{ formatDateTime(adjustment.approved_at) }}
            </p>
          </div>
        </div>
      </div>

      <div v-else-if="adjustment.status === 'rejected'" class="bg-red-50 border-l-4 border-red-400 p-4">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 class="text-lg font-semibold text-red-800">Ajuste Rechazado</h3>
            <p class="text-sm text-red-700">
              Rechazado por {{ adjustment.approver_name }} el {{ formatDateTime(adjustment.rejected_at) }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Adjustment Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Información del Ajuste</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Número de Ajuste</dt>
              <dd class="text-base text-gray-900 font-semibold">{{ adjustment.adjustment_number }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Sucursal</dt>
              <dd class="text-base text-gray-900">{{ adjustment.branch_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Razón</dt>
              <dd class="text-base text-gray-900">{{ adjustment.reason_label }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha de Creación</dt>
              <dd class="text-base text-gray-900">{{ formatDateTime(adjustment.created_at) }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Creado por</dt>
              <dd class="text-base text-gray-900">{{ adjustment.user_name }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Estado</dt>
              <dd>
                <span :class="getStatusClass(adjustment.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ adjustment.status_label }}
                </span>
              </dd>
            </div>
            <div v-if="adjustment.notes">
              <dt class="text-sm font-medium text-gray-500">Notas</dt>
              <dd class="text-base text-gray-900">{{ adjustment.notes }}</dd>
            </div>
          </dl>
        </div>

        <!-- Summary -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">Resumen</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Total de Items</dt>
              <dd class="text-base text-gray-900">{{ adjustment.items_count }} productos</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Valor Total del Ajuste</dt>
              <dd class="text-2xl font-bold" :class="{
                'text-red-600': adjustment.total_adjustment < 0,
                'text-green-600': adjustment.total_adjustment > 0,
                'text-gray-900': adjustment.total_adjustment === 0
              }">
                L {{ formatMoney(Math.abs(adjustment.total_adjustment)) }}
              </dd>
              <p class="text-xs text-gray-500 mt-1">
                {{ adjustment.total_adjustment < 0 ? 'Pérdida' : adjustment.total_adjustment > 0 ? 'Ganancia' : 'Sin cambios' }}
              </p>
            </div>
          </dl>
        </div>
      </div>

      <!-- Adjustment Items -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Detalle de Productos</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cant. Sistema</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cant. Física</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Diferencia</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Costo Unit.</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in adjustment.details" :key="item.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">{{ item.product_name }}</div>
                  <div class="text-xs text-gray-500">SKU: {{ item.product_sku }}</div>
                  <div v-if="item.variant_name" class="text-xs text-gray-500">Variante: {{ item.variant_name }}</div>
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">{{ item.system_quantity }}</td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">{{ item.physical_quantity }}</td>
                <td class="px-6 py-4 text-right">
                  <span
                    :class="{
                      'text-red-600 font-semibold': item.difference < 0,
                      'text-green-600 font-semibold': item.difference > 0,
                      'text-gray-600': item.difference === 0
                    }"
                    class="text-sm"
                  >
                    {{ item.difference >= 0 ? '+' : '' }}{{ item.difference }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <span
                    :class="{
                      'bg-green-100 text-green-800': item.adjustment_type === 'increase',
                      'bg-red-100 text-red-800': item.adjustment_type === 'decrease',
                      'bg-gray-100 text-gray-800': item.adjustment_type === 'none'
                    }"
                    class="px-2 py-1 text-xs font-medium rounded-full"
                  >
                    {{ item.adjustment_type === 'increase' ? 'Aumento' : item.adjustment_type === 'decrease' ? 'Reducción' : 'Sin cambio' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">L {{ formatMoney(item.cost) }}</td>
                <td class="px-6 py-4 text-right">
                  <span
                    :class="{
                      'text-red-600': item.total < 0,
                      'text-green-600': item.total > 0,
                      'text-gray-900': item.total === 0
                    }"
                    class="text-sm font-semibold"
                  >
                    L {{ formatMoney(Math.abs(item.total)) }}
                  </span>
                </td>
              </tr>
            </tbody>
            <tfoot class="bg-gray-50">
              <tr>
                <td colspan="6" class="px-6 py-4 text-right text-sm font-bold text-gray-700">
                  Total del Ajuste:
                </td>
                <td class="px-6 py-4 text-right">
                  <span
                    :class="{
                      'text-red-600': adjustment.total_adjustment < 0,
                      'text-green-600': adjustment.total_adjustment > 0,
                      'text-gray-900': adjustment.total_adjustment === 0
                    }"
                    class="text-base font-bold"
                  >
                    L {{ formatMoney(Math.abs(adjustment.total_adjustment)) }}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import inventoryAdjustmentService from '@/services/inventoryAdjustmentService'
import { toast } from 'vue3-toastify'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const adjustment = ref(null)

onMounted(() => {
  loadAdjustment()
})

async function loadAdjustment() {
  loading.value = true
  try {
    const response = await inventoryAdjustmentService.getById(route.params.id)
    if (response.data.success) {
      adjustment.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading adjustment:', error)
    toast.error('Error al cargar el ajuste de inventario')
    router.push('/inventory/adjustments')
  } finally {
    loading.value = false
  }
}

function confirmApprove() {
  if (confirm(`¿Aprobar el ajuste ${adjustment.value.adjustment_number}? Esto actualizará el inventario.`)) {
    approveAdjustment()
  }
}

async function approveAdjustment() {
  loading.value = true
  try {
    await inventoryAdjustmentService.approve(adjustment.value.id)
    toast.success('Ajuste aprobado exitosamente')
    loadAdjustment()
  } catch (error) {
    console.error('Error approving adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al aprobar el ajuste')
  } finally {
    loading.value = false
  }
}

function confirmReject() {
  if (confirm(`¿Rechazar el ajuste ${adjustment.value.adjustment_number}?`)) {
    rejectAdjustment()
  }
}

async function rejectAdjustment() {
  loading.value = true
  try {
    await inventoryAdjustmentService.reject(adjustment.value.id)
    toast.success('Ajuste rechazado exitosamente')
    loadAdjustment()
  } catch (error) {
    console.error('Error rejecting adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al rechazar el ajuste')
  } finally {
    loading.value = false
  }
}

function confirmDelete() {
  if (confirm(`¿Eliminar el ajuste ${adjustment.value.adjustment_number}?`)) {
    deleteAdjustment()
  }
}

async function deleteAdjustment() {
  loading.value = true
  try {
    await inventoryAdjustmentService.delete(adjustment.value.id)
    toast.success('Ajuste eliminado exitosamente')
    router.push('/inventory/adjustments')
  } catch (error) {
    console.error('Error deleting adjustment:', error)
    toast.error(error.response?.data?.error?.message || 'Error al eliminar el ajuste')
  } finally {
    loading.value = false
  }
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
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
