<template>
  <div>
    <div class="mb-6 flex justify-end">
      <button @click="showCreateModal = true"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center">
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        Nuevo CAI
      </button>
    </div>

    <!-- Loading State -->
    <loading-spinner v-if="settingsStore.loading && cais.length === 0" text="Cargando CAIs..." />

    <!-- CAI List -->
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="cais.length === 0" class="p-8 text-center text-gray-500">
        <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-lg font-medium">No hay CAIs registrados</p>
        <p class="mt-2">Crea tu primer CAI para comenzar a emitir facturas</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CAI</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rango</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Documentos</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="cai in cais" :key="cai.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ cai.cai_number }}</div>
                <div v-if="cai.branch" class="text-xs text-gray-500">{{ cai.branch.name }}</div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">{{ getDocumentTypeLabel(cai.document_type) }}</td>
              <td class="px-6 py-4 text-sm text-gray-600">
                {{ cai.range_start }} - {{ cai.range_end }}
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-900">{{ cai.used_documents }} / {{ cai.total_documents }}</div>
                <div class="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div class="bg-primary-600 h-2 rounded-full" :style="{ width: `${(cai.used_documents / cai.total_documents) * 100}%` }"></div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-600">
                <div>{{ formatDate(cai.authorization_date) }}</div>
                <div>{{ formatDate(cai.expiration_date) }}</div>
              </td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(cai.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(cai.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-sm">
                <div class="flex space-x-2">
                  <button @click="editCAI(cai)"
                          class="text-primary-600 hover:text-primary-800">
                    Editar
                  </button>
                  <button @click="deleteCAI(cai)"
                          class="text-red-600 hover:text-red-800"
                          :disabled="cai.used_documents > 0">
                    Eliminar
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <modal-dialog :show="showCreateModal || showEditModal"
                  :title="selectedCAI ? 'Editar CAI' : 'Nuevo CAI'"
                  @close="closeModal"
                  size="large">
      <form @submit.prevent="saveCAI">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- CAI Number -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Número de CAI *</label>
            <input v-model="form.cai_number"
                   type="text"
                   required
                   maxlength="50"
                   :disabled="!!selectedCAI"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                   placeholder="00000-000000-000000-000000" />
          </div>

          <!-- Branch -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Sucursal *</label>
            <select v-model="form.branch_id"
                    required
                    :disabled="!!selectedCAI"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="">Seleccionar sucursal</option>
              <option v-for="branch in branches" :key="branch.id" :value="branch.id">
                {{ branch.name }}
              </option>
            </select>
          </div>

          <!-- Document Type -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
            <select v-model="form.document_type"
                    required
                    :disabled="!!selectedCAI"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100">
              <option value="FACTURA">Factura</option>
              <option value="NOTA_CREDITO">Nota de Crédito</option>
              <option value="NOTA_DEBITO">Nota de Débito</option>
              <option value="RECIBO_HONORARIOS">Recibo de Honorarios</option>
              <option value="FACTURA_EXPORTACION">Factura de Exportación</option>
            </select>
          </div>

          <!-- Range Start -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rango Inicial *</label>
            <input v-model="form.range_start"
                   type="text"
                   required
                   :disabled="!!selectedCAI"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                   placeholder="001-001-01-00000001" />
          </div>

          <!-- Range End -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rango Final *</label>
            <input v-model="form.range_end"
                   type="text"
                   required
                   :disabled="!!selectedCAI"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100"
                   placeholder="001-001-01-00001000" />
          </div>

          <!-- Authorization Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Autorización *</label>
            <input v-model="form.authorization_date"
                   type="date"
                   required
                   :disabled="!!selectedCAI"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>

          <!-- Expiration Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Vencimiento *</label>
            <input v-model="form.expiration_date"
                   type="date"
                   required
                   :disabled="!!selectedCAI"
                   class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100" />
          </div>

          <!-- Status (only on edit) -->
          <div v-if="selectedCAI" class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select v-model="form.status"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="active">Activo</option>
              <option value="expired">Vencido</option>
              <option value="depleted">Agotado</option>
              <option value="canceled">Cancelado</option>
            </select>
          </div>

          <!-- Notes -->
          <div class="md:col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">Notas</label>
            <textarea v-model="form.notes"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Observaciones adicionales"></textarea>
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-3">
          <button type="button"
                  @click="closeModal"
                  class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancelar
          </button>
          <button type="submit"
                  :disabled="settingsStore.loading"
                  class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
            {{ settingsStore.loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </modal-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ModalDialog from '@/components/common/ModalDialog.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedCAI = ref(null)

const form = ref({
  branch_id: '',
  cai_number: '',
  document_type: 'FACTURA',
  range_start: '',
  range_end: '',
  authorization_date: '',
  expiration_date: '',
  status: 'active',
  notes: ''
})

const branches = ref([])

const cais = computed(() => settingsStore.cais)

onMounted(async () => {
  await Promise.all([
    loadCAIs(),
    loadBranches()
  ])
})

async function loadBranches() {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/branches`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Accept': 'application/json'
      }
    })
    const data = await response.json()
    if (data.success) {
      branches.value = data.data
    }
  } catch (error) {
    console.error('Error loading branches:', error)
  }
}

async function loadCAIs() {
  try {
    await settingsStore.fetchCAIs()
  } catch (error) {
    console.error('Error loading CAIs:', error)
  }
}

function editCAI(cai) {
  selectedCAI.value = cai
  form.value = {
    branch_id: cai.branch_id,
    cai_number: cai.cai_number,
    document_type: cai.document_type,
    range_start: cai.range_start,
    range_end: cai.range_end,
    authorization_date: cai.authorization_date,
    expiration_date: cai.expiration_date,
    status: cai.status,
    notes: cai.notes || ''
  }
  showEditModal.value = true
}

async function saveCAI() {
  try {
    if (selectedCAI.value) {
      await settingsStore.updateCAI(selectedCAI.value.id, { status: form.value.status, notes: form.value.notes })
      toast.success('CAI actualizado exitosamente')
    } else {
      await settingsStore.createCAI(form.value)
      toast.success('CAI creado exitosamente')
    }
    closeModal()
  } catch (error) {
    console.error('Error saving CAI:', error)
    toast.error(selectedCAI.value ? 'Error al actualizar CAI' : 'Error al crear CAI')
  }
}

async function deleteCAI(cai) {
  if (!confirm(`¿Estás seguro de eliminar el CAI ${cai.cai_number}?`)) return

  try {
    await settingsStore.deleteCAI(cai.id)
    toast.success('CAI eliminado exitosamente')
  } catch (error) {
    console.error('Error deleting CAI:', error)
    toast.error('Error al eliminar CAI')
  }
}

function closeModal() {
  showCreateModal.value = false
  showEditModal.value = false
  selectedCAI.value = null
  form.value = {
    branch_id: '',
    cai_number: '',
    document_type: 'FACTURA',
    range_start: '',
    range_end: '',
    authorization_date: '',
    expiration_date: '',
    status: 'active',
    notes: ''
  }
}

function getDocumentTypeLabel(type) {
  const labels = {
    FACTURA: 'Factura',
    NOTA_CREDITO: 'Nota de Crédito',
    NOTA_DEBITO: 'Nota de Débito',
    RECIBO_HONORARIOS: 'Recibo Honorarios',
    FACTURA_EXPORTACION: 'Factura Exportación'
  }
  return labels[type] || type
}

function getStatusLabel(status) {
  const labels = {
    active: 'Activo',
    expired: 'Vencido',
    depleted: 'Agotado',
    canceled: 'Cancelado'
  }
  return labels[status] || status
}

function getStatusClass(status) {
  const classes = {
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    depleted: 'bg-yellow-100 text-yellow-800',
    canceled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-HN')
}
</script>
