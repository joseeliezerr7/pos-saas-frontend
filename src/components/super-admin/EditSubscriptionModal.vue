<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="$emit('close')">
    <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">
          Editar Suscripción - {{ tenant.name }}
        </h3>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Current Subscription Info -->
      <div v-if="tenant.subscription" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 class="font-medium text-blue-900 mb-2">Suscripción Actual</h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-blue-700">Plan:</span>
            <span class="font-medium ml-2">{{ tenant.subscription.plan?.name || 'N/A' }}</span>
          </div>
          <div>
            <span class="text-blue-700">Estado:</span>
            <span class="font-medium ml-2">{{ getSubscriptionLabel(tenant.subscription.status) }}</span>
          </div>
          <div>
            <span class="text-blue-700">Inicio:</span>
            <span class="font-medium ml-2">{{ formatDate(tenant.subscription.starts_at) }}</span>
          </div>
          <div>
            <span class="text-blue-700">Expiración:</span>
            <span class="font-medium ml-2">{{ formatDate(tenant.subscription.expires_at) }}</span>
          </div>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Plan -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Plan *
          </label>
          <select v-model="form.plan_id" required class="input">
            <option value="">Selecciona un plan</option>
            <option v-for="plan in plans" :key="plan.id" :value="plan.id">
              {{ plan.name }} - L {{ formatCurrency(plan.monthly_price) }}/mes
            </option>
          </select>
          <p v-if="selectedPlan" class="mt-2 text-sm text-gray-600">
            {{ selectedPlan.description }}
          </p>
        </div>

        <!-- Plan Features (if plan selected) -->
        <div v-if="selectedPlan" class="bg-gray-50 rounded-lg p-4">
          <h5 class="font-medium text-gray-900 mb-3">Características del Plan</h5>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ selectedPlan.max_users === -1 ? 'Usuarios ilimitados' : `${selectedPlan.max_users} usuarios` }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ selectedPlan.max_branches === -1 ? 'Sucursales ilimitadas' : `${selectedPlan.max_branches} sucursales` }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ selectedPlan.max_products === -1 ? 'Productos ilimitados' : `${selectedPlan.max_products} productos` }}</span>
            </div>
            <div class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ selectedPlan.max_monthly_transactions === -1 ? 'Transacciones ilimitadas' : `${selectedPlan.max_monthly_transactions} transacciones/mes` }}</span>
            </div>
          </div>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Estado *
          </label>
          <select v-model="form.status" required class="input">
            <option value="trial">Prueba</option>
            <option value="active">Activa</option>
            <option value="suspended">Suspendida</option>
            <option value="expired">Expirada</option>
            <option value="canceled">Cancelada</option>
          </select>
          <p class="mt-1 text-sm text-gray-500">
            Estado de la suscripción del cliente
          </p>
        </div>

        <!-- Expires At -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Expiración
          </label>
          <input
            v-model="form.expires_at"
            type="date"
            :min="minDate"
            class="input"
          />
          <p class="mt-1 text-sm text-gray-500">
            Deja vacío para establecer 30 días desde hoy
          </p>
        </div>

        <!-- Preview de cambios -->
        <div v-if="hasChanges" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <h5 class="font-medium text-yellow-900 mb-2">Vista previa de cambios</h5>
              <ul class="text-sm text-yellow-800 space-y-1">
                <li v-if="planChanged">
                  Plan: <strong>{{ tenant.subscription?.plan?.name || 'Sin plan' }}</strong> → <strong>{{ selectedPlan?.name }}</strong>
                </li>
                <li v-if="statusChanged">
                  Estado: <strong>{{ getSubscriptionLabel(tenant.subscription?.status) }}</strong> → <strong>{{ getSubscriptionLabel(form.status) }}</strong>
                </li>
                <li v-if="expiresAtChanged">
                  Expiración: <strong>{{ formatDate(tenant.subscription?.expires_at) }}</strong> → <strong>{{ formatDate(form.expires_at) || 'En 30 días' }}</strong>
                </li>
              </ul>
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
            :disabled="loading || !form.plan_id || !form.status"
          >
            <span v-if="loading">Guardando...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import superAdminService from '@/services/superAdminService'
import { toast } from 'vue3-toastify'

const props = defineProps({
  tenant: {
    type: Object,
    required: true
  },
  plans: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['close', 'updated'])

const loading = ref(false)
const form = ref({
  plan_id: '',
  status: 'active',
  expires_at: ''
})

const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const selectedPlan = computed(() => {
  return props.plans.find(p => p.id === form.value.plan_id)
})

const planChanged = computed(() => {
  return form.value.plan_id !== props.tenant.subscription?.plan_id
})

const statusChanged = computed(() => {
  return form.value.status !== props.tenant.subscription?.status
})

const expiresAtChanged = computed(() => {
  const currentDate = props.tenant.subscription?.expires_at?.split('T')[0]
  return form.value.expires_at !== currentDate
})

const hasChanges = computed(() => {
  return planChanged.value || statusChanged.value || expiresAtChanged.value
})

onMounted(() => {
  if (props.tenant.subscription) {
    form.value.plan_id = props.tenant.subscription.plan_id
    form.value.status = props.tenant.subscription.status

    if (props.tenant.subscription.expires_at) {
      form.value.expires_at = props.tenant.subscription.expires_at.split('T')[0]
    }
  }
})

async function handleSubmit() {
  loading.value = true

  try {
    await superAdminService.updateTenantSubscription(props.tenant.id, form.value)
    toast.success('Suscripción actualizada exitosamente')
    emit('updated')
  } catch (error) {
    console.error('Error updating subscription:', error)
    toast.error(error.response?.data?.error?.message || 'Error al actualizar la suscripción')
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

function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function getSubscriptionLabel(status) {
  const labels = {
    active: 'Activa',
    trial: 'Prueba',
    expired: 'Expirada',
    canceled: 'Cancelada',
    suspended: 'Suspendida'
  }
  return labels[status] || status
}
</script>
