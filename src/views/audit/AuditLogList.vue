<template>
  <div class="audit-logs p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Registro de Auditoría</h1>
      <p class="text-gray-600 mt-2">Historial completo de acciones realizadas en el sistema</p>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
          <input
            v-model="filters.search"
            @input="handleSearch"
            type="text"
            placeholder="IP, URL..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento</label>
          <select
            v-model="filters.event"
            @change="loadLogs"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option v-for="event in eventTypes" :key="event" :value="event">{{ event }}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
          <input
            v-model="filters.date_from"
            type="date"
            @change="loadLogs"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
          <input
            v-model="filters.date_to"
            type="date"
            @change="loadLogs"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="bg-white rounded-lg shadow-sm p-8 text-center">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Cargando registros...</p>
    </div>

    <!-- Table -->
    <div v-else class="bg-white rounded-lg shadow-sm overflow-hidden">
      <!-- Empty State -->
      <div v-if="logs.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg font-medium">No hay registros de auditoría</p>
        <p class="mt-2">Las acciones realizadas aparecerán aquí</p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha/Hora</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evento</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modelo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="log in logs" :key="log.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(log.created_at) }}</div>
                <div class="text-xs text-gray-500">{{ formatTime(log.created_at) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">Usuario #{{ log.user_id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getEventClass(log.event)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ log.event }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ getModelName(log.auditable_type) }}</div>
                <div class="text-xs text-gray-500">#{{ log.auditable_id }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ log.ip_address }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  @click="showDetails(log)"
                  class="text-blue-600 hover:text-blue-900"
                  title="Ver detalles"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > 0" class="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
        <div class="text-sm text-gray-700">
          Mostrando {{ (pagination.current_page - 1) * pagination.per_page + 1 }} a {{ Math.min(pagination.current_page * pagination.per_page, pagination.total) }} de {{ pagination.total }} registros
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

    <!-- Details Modal -->
    <div v-if="showModal && selectedLog" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-start mb-4">
          <h2 class="text-xl font-bold">Detalles del Registro de Auditoría</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4">
          <!-- Basic Info -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Fecha y Hora</label>
              <p class="text-base text-gray-900">{{ formatDateTime(selectedLog.created_at) }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Usuario</label>
              <p class="text-base text-gray-900">Usuario #{{ selectedLog.user_id }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Evento</label>
              <p class="text-base text-gray-900">{{ selectedLog.event }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Modelo</label>
              <p class="text-base text-gray-900">{{ getModelName(selectedLog.auditable_type) }} #{{ selectedLog.auditable_id }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Dirección IP</label>
              <p class="text-base text-gray-900">{{ selectedLog.ip_address }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">URL</label>
              <p class="text-base text-gray-900 truncate" :title="selectedLog.url">{{ selectedLog.url }}</p>
            </div>
          </div>

          <!-- User Agent -->
          <div>
            <label class="block text-sm font-medium text-gray-500 mb-1">User Agent</label>
            <p class="text-sm text-gray-900 bg-gray-50 p-2 rounded">{{ selectedLog.user_agent || '-' }}</p>
          </div>

          <!-- Old Values -->
          <div v-if="selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0">
            <label class="block text-sm font-medium text-gray-500 mb-1">Valores Anteriores</label>
            <pre class="text-sm text-gray-900 bg-red-50 p-3 rounded overflow-x-auto">{{ JSON.stringify(selectedLog.old_values, null, 2) }}</pre>
          </div>

          <!-- New Values -->
          <div v-if="selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0">
            <label class="block text-sm font-medium text-gray-500 mb-1">Valores Nuevos</label>
            <pre class="text-sm text-gray-900 bg-green-50 p-3 rounded overflow-x-auto">{{ JSON.stringify(selectedLog.new_values, null, 2) }}</pre>
          </div>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import auditLogService from '@/services/auditLogService'
import { toast } from 'vue3-toastify'

const logs = ref([])
const eventTypes = ref([])
const loading = ref(false)
const showModal = ref(false)
const selectedLog = ref(null)
let searchTimeout = null

const filters = ref({
  search: '',
  event: '',
  date_from: '',
  date_to: ''
})

const pagination = ref({
  current_page: 1,
  last_page: 1,
  per_page: 20,
  total: 0
})

onMounted(async () => {
  await loadEventTypes()
  await loadLogs()
})

async function loadEventTypes() {
  try {
    const response = await auditLogService.getEventTypes()
    if (response.data.success) {
      eventTypes.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading event types:', error)
  }
}

async function loadLogs() {
  loading.value = true
  try {
    const params = {
      page: pagination.value.current_page,
      per_page: pagination.value.per_page,
      ...filters.value
    }
    const response = await auditLogService.getAll(params)
    if (response.data.success) {
      logs.value = response.data.data
      pagination.value = response.data.meta
    }
  } catch (error) {
    console.error('Error loading audit logs:', error)
    toast.error('Error al cargar los registros de auditoría')
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1
    loadLogs()
  }, 500)
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page
    loadLogs()
  }
}

function showDetails(log) {
  selectedLog.value = log
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  selectedLog.value = null
}

function formatDate(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('es-HN')
}

function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('es-HN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function formatDateTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getModelName(type) {
  if (!type) return '-'
  const parts = type.split('\\')
  return parts[parts.length - 1]
}

function getEventClass(event) {
  const classes = {
    'created': 'bg-green-100 text-green-800',
    'updated': 'bg-blue-100 text-blue-800',
    'deleted': 'bg-red-100 text-red-800',
    'login': 'bg-purple-100 text-purple-800',
    'logout': 'bg-gray-100 text-gray-800'
  }
  return classes[event] || 'bg-gray-100 text-gray-800'
}
</script>
