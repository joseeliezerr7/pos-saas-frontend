<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="$emit('close')">
    <div class="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white mb-10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Crear Nuevo Cliente
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Error Messages -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center space-x-2">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-sm text-red-900">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Sección 1: Datos de la Empresa -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-4">1. Datos de la Empresa</h4>
          <div class="grid grid-cols-2 gap-4">
            <!-- Nombre de la Empresa -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa *
              </label>
              <input
                v-model="form.company_name"
                type="text"
                required
                maxlength="255"
                class="input"
                placeholder="Ej: Mi Empresa S.A."
              />
            </div>

            <!-- Razón Social -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Razón Social
              </label>
              <input
                v-model="form.legal_name"
                type="text"
                maxlength="255"
                class="input"
                placeholder="Nombre legal de la empresa"
              />
            </div>

            <!-- RTN -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                RTN *
              </label>
              <input
                v-model="form.company_rtn"
                type="text"
                required
                minlength="14"
                maxlength="14"
                pattern="\d{14}"
                class="input"
                placeholder="08011234567890"
                @input="validateRTN"
              />
              <p class="mt-1 text-xs text-gray-500">14 dígitos numéricos</p>
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email Corporativo *
              </label>
              <input
                v-model="form.email"
                type="email"
                required
                maxlength="255"
                class="input"
                placeholder="contacto@empresa.com"
              />
            </div>

            <!-- Teléfono -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                v-model="form.phone"
                type="tel"
                maxlength="20"
                class="input"
                placeholder="+504 9999-9999"
              />
            </div>

            <!-- Sitio Web -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                v-model="form.website"
                type="url"
                class="input"
                placeholder="https://www.empresa.com"
              />
            </div>

            <!-- Dirección -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <textarea
                v-model="form.address"
                rows="2"
                class="input"
                placeholder="Dirección completa de la empresa"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Sección 2: Usuario Administrador -->
        <div class="bg-blue-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-4">2. Usuario Administrador</h4>
          <div class="grid grid-cols-2 gap-4">
            <!-- Nombre del Admin -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo *
              </label>
              <input
                v-model="form.admin_name"
                type="text"
                required
                maxlength="255"
                class="input"
                placeholder="Juan Pérez"
              />
            </div>

            <!-- Email del Admin -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                v-model="form.admin_email"
                type="email"
                required
                maxlength="255"
                class="input"
                placeholder="admin@empresa.com"
              />
            </div>

            <!-- Contraseña -->
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Contraseña *
              </label>
              <input
                v-model="form.admin_password"
                type="password"
                required
                minlength="8"
                class="input"
                placeholder="Mínimo 8 caracteres"
              />
              <p class="mt-1 text-xs text-gray-500">La contraseña debe tener al menos 8 caracteres</p>
            </div>
          </div>
        </div>

        <!-- Sección 3: Suscripción -->
        <div class="bg-green-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-4">3. Configuración de Suscripción</h4>
          <div class="grid grid-cols-2 gap-4">
            <!-- Plan -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Plan *
              </label>
              <select v-model="form.plan_id" required class="input">
                <option value="">Selecciona un plan</option>
                <option v-for="plan in plans" :key="plan.id" :value="plan.id">
                  {{ plan.name }} - L {{ formatCurrency(plan.monthly_price || plan.price_monthly) }}/mes
                </option>
              </select>
            </div>

            <!-- Estado de Suscripción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Estado Inicial *
              </label>
              <select v-model="form.subscription_status" required class="input">
                <option value="trial">Prueba</option>
                <option value="active">Activa</option>
                <option value="suspended">Suspendida</option>
              </select>
            </div>

            <!-- Días de Prueba (solo si status=trial) -->
            <div v-if="form.subscription_status === 'trial'">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Días de Prueba
              </label>
              <input
                v-model.number="form.trial_days"
                type="number"
                min="0"
                max="365"
                class="input"
                placeholder="30"
              />
              <p class="mt-1 text-xs text-gray-500">Por defecto: 30 días</p>
            </div>

            <!-- Días de Suscripción -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Días de Suscripción
              </label>
              <input
                v-model.number="form.subscription_days"
                type="number"
                min="1"
                max="365"
                class="input"
                placeholder="30"
              />
              <p class="mt-1 text-xs text-gray-500">Por defecto: 30 días</p>
            </div>
          </div>
        </div>

        <!-- Plan Features Preview (if plan selected) -->
        <div v-if="selectedPlan" class="bg-gray-50 rounded-lg p-4">
          <h5 class="font-medium text-gray-900 mb-3">Características del Plan Seleccionado</h5>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ formatLimit(selectedPlan.max_users, 'usuarios') }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ formatLimit(selectedPlan.max_branches, 'sucursales') }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ formatLimit(selectedPlan.max_products, 'productos') }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ formatLimit(selectedPlan.max_monthly_transactions, 'transacciones/mes') }}</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end space-x-3 pt-4 border-t">
          <button
            type="button"
            @click="$emit('close')"
            class="btn-secondary"
            :disabled="loading"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="btn-primary"
            :disabled="loading || !isFormValid"
          >
            <span v-if="loading">Creando cliente...</span>
            <span v-else>Crear Cliente</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import superAdminService from '@/services/superAdminService'
import { toast } from 'vue3-toastify'

const props = defineProps({
  plans: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'created'])

const loading = ref(false)
const errorMessage = ref('')

const form = ref({
  // Empresa
  company_name: '',
  legal_name: '',
  company_rtn: '',
  email: '',
  phone: '',
  address: '',
  website: '',

  // Admin
  admin_name: '',
  admin_email: '',
  admin_password: '',

  // Suscripción
  plan_id: '',
  subscription_status: 'trial',
  trial_days: 30,
  subscription_days: 30
})

const selectedPlan = computed(() => {
  return props.plans.find(p => p.id === form.value.plan_id)
})

const isFormValid = computed(() => {
  return form.value.company_name &&
         form.value.company_rtn &&
         form.value.company_rtn.length === 14 &&
         form.value.email &&
         form.value.admin_name &&
         form.value.admin_email &&
         form.value.admin_password &&
         form.value.admin_password.length >= 8 &&
         form.value.plan_id &&
         form.value.subscription_status
})

function validateRTN(event) {
  // Solo permitir números
  form.value.company_rtn = event.target.value.replace(/\D/g, '').slice(0, 14)
}

async function handleSubmit() {
  if (!isFormValid.value) {
    errorMessage.value = 'Por favor completa todos los campos requeridos correctamente'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await superAdminService.createTenant(form.value)

    if (response.data.success) {
      toast.success('Cliente creado exitosamente')
      emit('created', response.data.data)
      emit('close')
    } else {
      errorMessage.value = response.data.message || 'Error al crear el cliente'
    }
  } catch (error) {
    console.error('Error creating tenant:', error)

    // Manejar errores de validación del backend
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors
      const errorMessages = Object.values(errors).flat()
      errorMessage.value = errorMessages.join(', ')
    } else {
      errorMessage.value = error.response?.data?.message || 'Error al crear el cliente. Por favor, intenta nuevamente.'
    }
  } finally {
    loading.value = false
  }
}

function formatCurrency(value) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatLimit(value, label) {
  if (value === -1) {
    return `${label.charAt(0).toUpperCase() + label.slice(1)} ilimitados`
  }
  return `${value} ${label}`
}
</script>
