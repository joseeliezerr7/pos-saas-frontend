<template>
  <div class="plans-list">
    <div class="mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
          <p class="text-gray-600 mt-2">Administra los planes de suscripción del sistema</p>
        </div>
        <button @click="openCreateModal" class="btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Plan
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando planes...</div>
    </div>

    <!-- Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="bg-white rounded-lg shadow-lg overflow-hidden border-2"
        :class="plan.is_active ? 'border-transparent' : 'border-red-200 opacity-75'"
      >
        <!-- Plan Header -->
        <div class="p-6" :class="getPlanHeaderClass(plan.slug)">
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold text-white">{{ plan.name }}</h3>
            <span
              v-if="!plan.is_active"
              class="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded"
            >
              Inactivo
            </span>
          </div>
          <p class="text-white/80 text-sm mt-1">{{ plan.description }}</p>
          <div class="mt-4">
            <span class="text-4xl font-bold text-white">L {{ formatPrice(plan.price) }}</span>
            <span class="text-white/80 text-sm">/mes</span>
          </div>
        </div>

        <!-- Plan Features -->
        <div class="p-6">
          <h4 class="font-semibold text-gray-900 mb-3">Límites</h4>
          <ul class="space-y-2 text-sm">
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ plan.max_users === -1 ? 'Usuarios ilimitados' : `${plan.max_users} usuarios` }}</span>
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ plan.max_branches === -1 ? 'Sucursales ilimitadas' : `${plan.max_branches} sucursales` }}</span>
            </li>
            <li class="flex items-center">
              <svg class="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>{{ plan.max_products === -1 ? 'Productos ilimitados' : `${plan.max_products} productos` }}</span>
            </li>
          </ul>

          <!-- Features List -->
          <div v-if="plan.features && plan.features.length > 0" class="mt-4">
            <h4 class="font-semibold text-gray-900 mb-3">Características</h4>
            <ul class="space-y-2 text-sm">
              <li v-for="(feature, index) in plan.features" :key="index" class="flex items-center">
                <svg class="w-4 h-4 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <span>{{ feature }}</span>
              </li>
            </ul>
          </div>

          <!-- Stats -->
          <div class="mt-4 pt-4 border-t">
            <div class="flex items-center justify-between text-sm text-gray-500">
              <span>Suscripciones activas:</span>
              <span class="font-semibold text-gray-900">{{ plan.active_subscriptions || 0 }}</span>
            </div>
          </div>
        </div>

        <!-- Plan Actions -->
        <div class="px-6 py-4 bg-gray-50 border-t flex items-center justify-between">
          <button
            @click="toggleStatus(plan)"
            :class="plan.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'"
            class="text-sm font-medium"
          >
            {{ plan.is_active ? 'Desactivar' : 'Activar' }}
          </button>
          <div class="flex items-center space-x-3">
            <button
              @click="editPlan(plan)"
              class="text-primary-600 hover:text-primary-800"
              title="Editar"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="confirmDelete(plan)"
              class="text-red-600 hover:text-red-800"
              title="Eliminar"
              :disabled="plan.active_subscriptions > 0"
              :class="{ 'opacity-50 cursor-not-allowed': plan.active_subscriptions > 0 }"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && plans.length === 0" class="text-center py-12 bg-white rounded-lg shadow">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay planes</h3>
      <p class="mt-1 text-sm text-gray-500">Crea tu primer plan de suscripción</p>
      <button @click="openCreateModal" class="mt-4 btn-primary">
        Crear Plan
      </button>
    </div>

    <!-- Plan Modal -->
    <div v-if="showModal" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black/50" @click="closeModal"></div>

        <div class="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="px-6 py-4 border-b flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ isEditing ? 'Editar Plan' : 'Nuevo Plan' }}
            </h3>
            <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="savePlan" class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- Nombre -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="input"
                  required
                  placeholder="Ej: Plan Básico"
                />
              </div>

              <!-- Slug -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="input"
                  required
                  placeholder="Ej: basic"
                  pattern="[a-z0-9\-]+"
                />
                <p class="text-xs text-gray-500 mt-1">Solo letras minúsculas, números y guiones</p>
              </div>

              <!-- Precio -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Precio Mensual (L) *</label>
                <input
                  v-model.number="form.price"
                  type="number"
                  class="input"
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>

              <!-- Trial Days -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Días de Prueba</label>
                <input
                  v-model.number="form.trial_days"
                  type="number"
                  class="input"
                  min="0"
                  placeholder="14"
                />
              </div>

              <!-- Max Users -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Máximo de Usuarios</label>
                <input
                  v-model.number="form.max_users"
                  type="number"
                  class="input"
                  min="-1"
                  placeholder="-1 = ilimitado"
                />
                <p class="text-xs text-gray-500 mt-1">-1 para ilimitado</p>
              </div>

              <!-- Max Branches -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Máximo de Sucursales</label>
                <input
                  v-model.number="form.max_branches"
                  type="number"
                  class="input"
                  min="-1"
                  placeholder="-1 = ilimitado"
                />
                <p class="text-xs text-gray-500 mt-1">-1 para ilimitado</p>
              </div>

              <!-- Max Products -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Máximo de Productos</label>
                <input
                  v-model.number="form.max_products"
                  type="number"
                  class="input"
                  min="-1"
                  placeholder="-1 = ilimitado"
                />
                <p class="text-xs text-gray-500 mt-1">-1 para ilimitado</p>
              </div>

              <!-- Sort Order -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  class="input"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Description -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="input"
                placeholder="Descripción breve del plan"
              ></textarea>
            </div>

            <!-- Features -->
            <div class="mt-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">Características</label>
              <div class="space-y-2">
                <div v-for="(feature, index) in form.features" :key="index" class="flex items-center space-x-2">
                  <input
                    v-model="form.features[index]"
                    type="text"
                    class="input flex-1"
                    placeholder="Ej: Reportes avanzados"
                  />
                  <button
                    type="button"
                    @click="removeFeature(index)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addFeature"
                  class="text-sm text-primary-600 hover:text-primary-800 font-medium"
                >
                  + Agregar característica
                </button>
              </div>
            </div>

            <!-- Is Active -->
            <div class="mt-4">
              <label class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">Plan activo (visible para nuevas suscripciones)</span>
              </label>
            </div>

            <!-- Actions -->
            <div class="mt-6 flex items-center justify-end space-x-3">
              <button type="button" @click="closeModal" class="btn-secondary">
                Cancelar
              </button>
              <button type="submit" class="btn-primary" :disabled="saving">
                {{ saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import superAdminService from '@/services/superAdminService'
import { toast } from 'vue3-toastify'

const loading = ref(true)
const saving = ref(false)
const plans = ref([])
const showModal = ref(false)
const isEditing = ref(false)
const editingPlanId = ref(null)

const defaultForm = {
  name: '',
  slug: '',
  description: '',
  price: 0,
  trial_days: 14,
  max_users: 5,
  max_branches: 1,
  max_products: 1000,
  sort_order: 0,
  features: [],
  is_active: true
}

const form = ref({ ...defaultForm })

onMounted(async () => {
  await loadPlans()
})

async function loadPlans() {
  loading.value = true
  try {
    const response = await superAdminService.getPlans()
    const rawPlans = response.data.data || []

    // Parse features if they come as JSON string and ensure price is a number
    plans.value = rawPlans.map(plan => ({
      ...plan,
      price: parseFloat(plan.price) || 0,
      features: parseFeatures(plan.features)
    }))
  } catch (error) {
    console.error('Error loading plans:', error)
    toast.error('Error al cargar los planes')
  } finally {
    loading.value = false
  }
}

function parseFeatures(features) {
  if (!features) return []
  if (Array.isArray(features)) return features
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }
  return []
}

function openCreateModal() {
  isEditing.value = false
  editingPlanId.value = null
  form.value = { ...defaultForm, features: [] }
  showModal.value = true
}

function editPlan(plan) {
  isEditing.value = true
  editingPlanId.value = plan.id

  // Features are already parsed in loadPlans, but handle edge cases
  const features = parseFeatures(plan.features)

  form.value = {
    name: plan.name,
    slug: plan.slug,
    description: plan.description || '',
    price: parseFloat(plan.price) || 0,
    trial_days: plan.trial_days || 14,
    max_users: plan.max_users,
    max_branches: plan.max_branches,
    max_products: plan.max_products,
    sort_order: plan.sort_order || 0,
    features: [...features],
    is_active: plan.is_active
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  form.value = { ...defaultForm, features: [] }
}

function addFeature() {
  form.value.features.push('')
}

function removeFeature(index) {
  form.value.features.splice(index, 1)
}

async function savePlan() {
  saving.value = true
  try {
    // Filter empty features
    const planData = {
      ...form.value,
      features: form.value.features.filter(f => f.trim() !== '')
    }

    if (isEditing.value) {
      await superAdminService.updatePlan(editingPlanId.value, planData)
      toast.success('Plan actualizado exitosamente')
    } else {
      await superAdminService.createPlan(planData)
      toast.success('Plan creado exitosamente')
    }

    closeModal()
    await loadPlans()
  } catch (error) {
    console.error('Error saving plan:', error)
    const message = error.response?.data?.error?.message || 'Error al guardar el plan'
    toast.error(message)
  } finally {
    saving.value = false
  }
}

async function toggleStatus(plan) {
  const action = plan.is_active ? 'desactivar' : 'activar'

  if (!confirm(`¿Estás seguro de ${action} este plan?`)) {
    return
  }

  try {
    await superAdminService.togglePlanStatus(plan.id)
    toast.success(`Plan ${action === 'desactivar' ? 'desactivado' : 'activado'} exitosamente`)
    await loadPlans()
  } catch (error) {
    console.error('Error toggling status:', error)
    toast.error(`Error al ${action} el plan`)
  }
}

async function confirmDelete(plan) {
  if (plan.active_subscriptions > 0) {
    toast.warning('No puedes eliminar un plan con suscripciones activas')
    return
  }

  if (!confirm(`¿Estás seguro de eliminar el plan "${plan.name}"?\n\nEsta acción no se puede deshacer.`)) {
    return
  }

  try {
    await superAdminService.deletePlan(plan.id)
    toast.success('Plan eliminado exitosamente')
    await loadPlans()
  } catch (error) {
    console.error('Error deleting plan:', error)
    const message = error.response?.data?.error?.message || 'Error al eliminar el plan'
    toast.error(message)
  }
}

function getPlanHeaderClass(slug) {
  const classes = {
    basic: 'bg-gradient-to-r from-gray-600 to-gray-700',
    professional: 'bg-gradient-to-r from-blue-600 to-blue-700',
    enterprise: 'bg-gradient-to-r from-purple-600 to-purple-700',
    corporate: 'bg-gradient-to-r from-emerald-600 to-emerald-700'
  }
  return classes[slug] || 'bg-gradient-to-r from-primary-600 to-primary-700'
}

function formatPrice(price) {
  return new Intl.NumberFormat('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price)
}
</script>

<style scoped>
.plans-list {
  @apply p-6;
}
</style>
