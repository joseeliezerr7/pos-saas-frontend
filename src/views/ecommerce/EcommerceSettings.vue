<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Configuracion de Tienda</h1>
        <p class="text-gray-600">Configura tu tienda online y portal B2B</p>
      </div>
      <div class="flex items-center gap-3">
        <span
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            settings?.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          ]"
        >
          {{ settings?.is_active ? 'Tienda Activa' : 'Tienda Inactiva' }}
        </span>
        <button
          v-if="settings?.is_active"
          @click="toggleStoreStatus"
          class="btn-secondary text-sm"
        >
          Desactivar Tienda
        </button>
        <button
          v-else
          @click="toggleStoreStatus"
          class="btn-primary text-sm"
        >
          Activar Tienda
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Settings -->
      <div class="lg:col-span-2 space-y-6">
        <!-- Basic Info -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Informacion Basica</h2>
          </div>
          <form @submit.prevent="saveSettings" class="p-6 space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de la Tienda *</label>
                <input
                  v-model="form.store_name"
                  type="text"
                  required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Mi Tienda Online"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">URL de la Tienda</label>
                <div class="flex items-center">
                  <span class="px-4 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                    /store/
                  </span>
                  <input
                    v-model="form.store_slug"
                    type="text"
                    class="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="mi-tienda"
                    @input="generateSlug"
                  />
                </div>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
              <textarea
                v-model="form.store_description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe tu tienda..."
              ></textarea>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email de Contacto</label>
                <input
                  v-model="form.contact_email"
                  type="email"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="tienda@ejemplo.com"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telefono de Contacto</label>
                <input
                  v-model="form.contact_phone"
                  type="tel"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+504 9999-9999"
                />
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <button type="submit" :disabled="saving" class="btn-primary">
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </form>
        </div>

        <!-- Payment & Shipping -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Pagos y Envios</h2>
          </div>
          <div class="p-6 space-y-6">
            <!-- Payment Methods -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-3">Metodos de Pago</h3>
              <div class="space-y-3">
                <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    v-model="form.payment_methods"
                    value="cash_on_delivery"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span class="font-medium text-gray-900">Pago contra entrega</span>
                    <p class="text-sm text-gray-500">El cliente paga al recibir el pedido</p>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    v-model="form.payment_methods"
                    value="bank_transfer"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span class="font-medium text-gray-900">Transferencia Bancaria</span>
                    <p class="text-sm text-gray-500">El cliente transfiere a tu cuenta bancaria</p>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    v-model="form.payment_methods"
                    value="card"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span class="font-medium text-gray-900">Tarjeta de Credito/Debito</span>
                    <p class="text-sm text-gray-500">Requiere configuracion de pasarela de pago</p>
                  </div>
                </label>
              </div>
            </div>

            <!-- Shipping Options -->
            <div>
              <h3 class="text-sm font-medium text-gray-900 mb-3">Opciones de Envio</h3>
              <div class="space-y-3">
                <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    v-model="form.shipping_methods"
                    value="pickup"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span class="font-medium text-gray-900">Recoger en tienda</span>
                    <p class="text-sm text-gray-500">El cliente recoge su pedido en tu ubicacion</p>
                  </div>
                </label>
                <label class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    v-model="form.shipping_methods"
                    value="delivery"
                    class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <span class="font-medium text-gray-900">Envio a domicilio</span>
                    <p class="text-sm text-gray-500">Entregas en la direccion del cliente</p>
                  </div>
                </label>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Costo de Envio Base</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">L.</span>
                  <input
                    v-model.number="form.shipping_cost"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Envio Gratis desde</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">L.</span>
                  <input
                    v-model.number="form.free_shipping_threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <button @click="saveSettings" :disabled="saving" class="btn-primary">
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>

        <!-- B2B Settings -->
        <div class="bg-white rounded-lg shadow-sm">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-lg font-semibold text-gray-900">Portal B2B</h2>
            <p class="text-sm text-gray-500 mt-1">Configuracion para clientes mayoristas</p>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium text-gray-900">Habilitar Portal B2B</p>
                <p class="text-sm text-gray-500">Permite a clientes registrados acceder a precios mayoristas</p>
              </div>
              <button
                @click="form.b2b_enabled = !form.b2b_enabled"
                :class="[
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  form.b2b_enabled ? 'bg-blue-600' : 'bg-gray-200'
                ]"
              >
                <span
                  :class="[
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    form.b2b_enabled ? 'translate-x-6' : 'translate-x-1'
                  ]"
                ></span>
              </button>
            </div>

            <div v-if="form.b2b_enabled" class="space-y-4 pt-4 border-t border-gray-200">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Minimo de Compra B2B</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">L.</span>
                  <input
                    v-model.number="form.b2b_minimum_order"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="b2b_require_approval"
                  v-model="form.b2b_require_approval"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label for="b2b_require_approval" class="ml-2 text-sm text-gray-700">
                  Requerir aprobacion para nuevos clientes B2B
                </label>
              </div>
            </div>

            <div class="pt-4 border-t border-gray-200">
              <button @click="saveSettings" :disabled="saving" class="btn-primary">
                {{ saving ? 'Guardando...' : 'Guardar Cambios' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Sidebar -->
      <div class="space-y-6">
        <!-- Store Preview -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Vista Previa</h3>
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div class="bg-gray-100 p-4 text-center">
              <div v-if="settings?.logo_url" class="w-20 h-20 mx-auto mb-2 rounded-lg overflow-hidden">
                <img :src="settings.logo_url" alt="Logo" class="w-full h-full object-cover" />
              </div>
              <div v-else class="w-20 h-20 mx-auto mb-2 rounded-lg bg-gray-300 flex items-center justify-center">
                <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p class="font-bold text-gray-900">{{ form.store_name || 'Mi Tienda' }}</p>
              <p class="text-sm text-gray-500 truncate">{{ form.store_description || 'Descripcion de la tienda' }}</p>
            </div>
          </div>
          <div class="mt-4">
            <p class="text-xs text-gray-500 mb-2">URL de tu tienda:</p>
            <code class="block p-2 bg-gray-100 rounded text-xs text-gray-700 break-all">
              {{ storeUrl }}
            </code>
          </div>
          <button
            v-if="settings?.is_active && settings?.store_slug"
            @click="openStore"
            class="mt-4 w-full btn-secondary text-sm"
          >
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Visitar Tienda
          </button>
        </div>

        <!-- Logo Upload -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Logo de la Tienda</h3>
          <div class="space-y-4">
            <div class="w-32 h-32 mx-auto rounded-lg overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
              <img v-if="settings?.logo_url" :src="settings.logo_url" alt="Logo" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                <svg class="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div class="text-center">
              <label class="btn-secondary text-sm cursor-pointer">
                <input type="file" @change="uploadLogo" accept="image/*" class="hidden" />
                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                {{ uploadingLogo ? 'Subiendo...' : 'Subir Logo' }}
              </label>
              <p class="text-xs text-gray-500 mt-2">PNG, JPG hasta 2MB</p>
            </div>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-sm font-medium text-gray-500 uppercase mb-4">Estadisticas Rapidas</h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-gray-600">Productos en catalogo</span>
              <span class="font-medium text-gray-900">{{ settings?.products_count || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Pedidos totales</span>
              <span class="font-medium text-gray-900">{{ settings?.orders_count || 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Clientes registrados</span>
              <span class="font-medium text-gray-900">{{ settings?.customers_count || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useEcommerceStore } from '@/stores/ecommerce'
import { storeToRefs } from 'pinia'
import { toast } from 'vue3-toastify'
import ecommerceService from '@/services/ecommerceService'

const ecommerceStore = useEcommerceStore()
const { settings, loading } = storeToRefs(ecommerceStore)

const saving = ref(false)
const uploadingLogo = ref(false)

const form = reactive({
  store_name: '',
  store_slug: '',
  store_description: '',
  contact_email: '',
  contact_phone: '',
  payment_methods: [],
  shipping_methods: [],
  shipping_cost: 0,
  free_shipping_threshold: 0,
  b2b_enabled: false,
  b2b_minimum_order: 0,
  b2b_require_approval: true
})

const storeUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_STORE_URL || window.location.origin
  return `${baseUrl}/store/${form.store_slug || 'mi-tienda'}`
})

onMounted(async () => {
  await ecommerceStore.fetchSettings()
  if (settings.value) {
    populateForm()
  }
})

watch(settings, (newSettings) => {
  if (newSettings) {
    populateForm()
  }
})

const populateForm = () => {
  form.store_name = settings.value.store_name || ''
  form.store_slug = settings.value.store_slug || ''
  form.store_description = settings.value.description || settings.value.store_description || ''
  form.contact_email = settings.value.contact_email || ''
  form.contact_phone = settings.value.contact_phone || ''
  form.payment_methods = settings.value.payment_methods || []
  form.shipping_methods = settings.value.shipping_options || settings.value.shipping_methods || []
  form.shipping_cost = parseFloat(settings.value.shipping_cost) || 0
  form.free_shipping_threshold = parseFloat(settings.value.free_shipping_threshold) || 0
  form.b2b_enabled = settings.value.b2b_enabled || false
  form.b2b_minimum_order = parseFloat(settings.value.b2b_minimum_order) || 0
  form.b2b_require_approval = settings.value.b2b_require_approval ?? true
}

const generateSlug = () => {
  form.store_slug = form.store_slug
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const saveSettings = async () => {
  saving.value = true
  try {
    await ecommerceStore.updateSettings({ ...form })
  } catch (error) {
    console.error('Error:', error)
  } finally {
    saving.value = false
  }
}

const toggleStoreStatus = async () => {
  const action = settings.value?.is_active ? 'desactivar' : 'activar'
  if (!confirm(`¿Estas seguro de ${action} la tienda?`)) return

  try {
    if (settings.value?.is_active) {
      await ecommerceStore.deactivateStore()
    } else {
      await ecommerceStore.activateStore()
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

const uploadLogo = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  if (file.size > 2 * 1024 * 1024) {
    toast.error('El archivo es demasiado grande. Maximo 2MB.')
    return
  }

  uploadingLogo.value = true
  try {
    const formData = new FormData()
    formData.append('logo', file)
    await ecommerceService.uploadLogo(formData)
    toast.success('Logo actualizado')
    await ecommerceStore.fetchSettings()
  } catch (error) {
    toast.error('Error al subir el logo')
  } finally {
    uploadingLogo.value = false
    event.target.value = ''
  }
}

const openStore = () => {
  window.open(storeUrl.value, '_blank')
}
</script>

<style scoped>
.btn-primary {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors;
}
</style>
