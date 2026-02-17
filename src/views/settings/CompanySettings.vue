<template>
  <div>
    <!-- Alert Messages -->
    <alert-message v-if="settingsStore.error"
                   type="error"
                   :message="settingsStore.error"
                   @close="settingsStore.clearError()"
                   class="mb-4" />

    <alert-message v-if="successMessage"
                   type="success"
                   :message="successMessage"
                   @close="successMessage = ''"
                   class="mb-4" />

    <!-- Loading State -->
    <loading-spinner v-if="settingsStore.loading && !company" text="Cargando configuración..." />

    <!-- Company Settings Form -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Logo Section -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Logo de la Empresa</h2>

          <div class="flex flex-col items-center">
            <!-- Logo Preview -->
            <div class="w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4 bg-gray-50">
              <img v-if="companyLogoUrl" :src="companyLogoUrl" alt="Logo" class="max-w-full max-h-full object-contain p-2" @error="logoError = true" />
              <div v-else class="text-center text-gray-400">
                <svg class="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p class="text-sm">Sin logo</p>
              </div>
            </div>

            <!-- Upload/Delete Buttons -->
            <div class="flex space-x-2">
              <label class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer text-sm">
                <input type="file" @change="handleLogoUpload" accept="image/*" class="hidden" />
                {{ company?.logo ? 'Cambiar' : 'Subir' }} Logo
              </label>
              <button v-if="company?.logo"
                      @click="handleLogoDelete"
                      class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
                Eliminar
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-2">PNG, JPG, SVG hasta 2MB</p>
          </div>
        </div>
      </div>

      <!-- Company Information Form -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Información de la Empresa</h2>

          <form @submit.prevent="saveSettings">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Name -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre Comercial *</label>
                <input v-model="form.name"
                       type="text"
                       required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="Mi Empresa" />
              </div>

              <!-- Legal Name -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Razón Social *</label>
                <input v-model="form.legal_name"
                       type="text"
                       required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="Mi Empresa S.A. de C.V." />
              </div>

              <!-- RTN -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">RTN *</label>
                <input v-model="form.rtn"
                       type="text"
                       maxlength="14"
                       required
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="00000000000000" />
              </div>

              <!-- Phone -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                <input v-model="form.phone"
                       type="text"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="+504 0000-0000" />
              </div>

              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input v-model="form.email"
                       type="email"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="info@empresa.hn" />
              </div>

              <!-- Website -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Sitio Web</label>
                <input v-model="form.website"
                       type="url"
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                       placeholder="https://www.empresa.hn" />
              </div>

              <!-- Address -->
              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Dirección *</label>
                <textarea v-model="form.address"
                          rows="2"
                          required
                          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Dirección completa de la empresa"></textarea>
              </div>
            </div>

            <!-- Save Button -->
            <div class="mt-6 flex justify-end">
              <button type="submit"
                      :disabled="settingsStore.loading"
                      class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {{ settingsStore.loading ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- POS Configuration -->
        <div class="bg-white rounded-lg shadow p-6 mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Configuración del POS</h2>

          <div class="space-y-4">
            <label class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <input type="checkbox" v-model="form.settings.enable_order_numbers" class="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500">
              <div>
                <span class="text-sm font-semibold text-blue-800">Habilitar No. de Orden</span>
                <span class="text-xs text-blue-600 block">Muestra la opción de asignar número de orden en el POS (útil para restaurantes, pollerías, etc.)</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Kitchen Display System (KDS) Configuration -->
        <div class="bg-white rounded-lg shadow p-6 mt-6">
          <h2 class="text-lg font-semibold text-gray-900 mb-4">Pantalla de Cocina (KDS)</h2>

          <div class="space-y-4">
            <label class="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors">
              <input type="checkbox" v-model="form.settings.enable_kds" class="w-5 h-5 rounded border-orange-300 text-orange-600 focus:ring-orange-500">
              <div>
                <span class="text-sm font-semibold text-orange-800">Habilitar Pantalla de Cocina</span>
                <span class="text-xs text-orange-600 block">Activa el sistema KDS para que la cocina vea y gestione los pedidos en tiempo real</span>
              </div>
            </label>

            <div v-if="form.settings.enable_kds" class="space-y-4 pl-4 border-l-2 border-orange-200 ml-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tiempo de alerta (minutos)</label>
                <input
                  v-model.number="form.settings.kds_alert_minutes"
                  type="number"
                  min="1"
                  max="120"
                  class="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p class="text-xs text-gray-500 mt-1">Los pedidos que superen este tiempo se resaltaran en rojo</p>
              </div>

              <label class="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <input type="checkbox" v-model="form.settings.kds_sound" class="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500">
                <div>
                  <span class="text-sm font-semibold text-gray-800">Sonido de notificacion</span>
                  <span class="text-xs text-gray-600 block">Reproduce un sonido cuando llega un nuevo pedido a la cocina</span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { toast } from 'vue3-toastify'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import AlertMessage from '@/components/common/AlertMessage.vue'

const settingsStore = useSettingsStore()
const successMessage = ref('')

const form = ref({
  name: '',
  legal_name: '',
  rtn: '',
  phone: '',
  email: '',
  website: '',
  address: '',
  settings: {
    enable_order_numbers: false,
    enable_kds: false,
    kds_alert_minutes: 15,
    kds_sound: true
  }
})

const company = computed(() => settingsStore.companySettings)
const logoError = ref(false)

const companyLogoUrl = computed(() => {
  if (logoError.value) return null
  const c = company.value
  if (!c) return null
  if (c.logo_url) return c.logo_url
  if (c.logo) return getLogoUrl(c.logo)
  return null
})

onMounted(async () => {
  await loadSettings()
})

function parseSettings(raw) {
  if (!raw) return {}
  if (typeof raw === 'object') return raw
  try { return JSON.parse(raw) } catch { return {} }
}

async function loadSettings() {
  try {
    const data = await settingsStore.fetchCompanySettings()
    const s = parseSettings(data.settings)
    form.value = {
      name: data.name || '',
      legal_name: data.legal_name || '',
      rtn: data.rtn || '',
      phone: data.phone || '',
      email: data.email || '',
      website: data.website || '',
      address: data.address || '',
      settings: {
        ...s,
        enable_order_numbers: s.enable_order_numbers || false,
        enable_kds: s.enable_kds || false,
        kds_alert_minutes: s.kds_alert_minutes ?? 15,
        kds_sound: s.kds_sound ?? true
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error)
  }
}

async function saveSettings() {
  try {
    await settingsStore.updateCompanySettings(form.value)
    successMessage.value = 'Configuración actualizada exitosamente'
    toast.success('Configuración guardada')
  } catch (error) {
    console.error('Error saving settings:', error)
    toast.error('Error al guardar configuración')
  }
}

async function handleLogoUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.error('El archivo debe ser menor a 2MB')
    return
  }

  try {
    await settingsStore.uploadLogo(file)
    logoError.value = false
    await loadSettings()
    successMessage.value = 'Logo actualizado exitosamente'
    toast.success('Logo subido correctamente')
  } catch (error) {
    console.error('Error uploading logo:', error)
    toast.error('Error al subir logo')
  }
}

async function handleLogoDelete() {
  if (!confirm('¿Estás seguro de eliminar el logo?')) return

  try {
    await settingsStore.deleteLogo()
    successMessage.value = 'Logo eliminado exitosamente'
    toast.success('Logo eliminado')
  } catch (error) {
    console.error('Error deleting logo:', error)
    toast.error('Error al eliminar logo')
  }
}

function getLogoUrl(logoPath) {
  if (!logoPath) return ''
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    return logoPath
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const backendUrl = apiUrl.replace('/api', '')
  return `${backendUrl}/storage/${logoPath}`
}
</script>
