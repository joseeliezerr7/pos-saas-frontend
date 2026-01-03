<template>
  <div class="loyalty-program-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Programa de Lealtad</h1>
        <p class="text-sm text-gray-500 mt-1">Configura el programa de puntos y niveles de tus clientes</p>
      </div>
    </div>

    <div v-if="loading && !program" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- No Program Message -->
    <div v-else-if="!loading && !program" class="bg-white rounded-lg shadow p-8 text-center">
      <div class="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <svg class="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/>
        </svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">No hay programa de lealtad configurado</h3>
      <p class="text-gray-600 mb-6">
        Crea un programa de puntos para tus clientes y aumenta su fidelidad.
      </p>
      <p class="text-sm text-gray-500 mb-6">
        El programa ya está preconfigurado con valores por defecto. Solo presiona "Guardar Programa" para activarlo.
      </p>
      <button
        v-if="can('configure_loyalty_program')"
        @click="handleSaveProgram"
        :disabled="loading"
        class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {{ loading ? 'Creando...' : 'Crear Programa de Lealtad' }}
      </button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Program Configuration -->
      <div class="bg-white rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Configuración del Programa</h2>

        <form @submit.prevent="handleSaveProgram" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Programa
            </label>
            <input
              v-model="programForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Programa de Lealtad"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              v-model="programForm.description"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Gana puntos con cada compra..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Puntos por Lempira
              </label>
              <input
                v-model.number="programForm.points_per_currency"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">Ej: 1 = 1 punto por cada L. gastado</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Valor del Punto (L.)
              </label>
              <input
                v-model.number="programForm.point_value"
                type="number"
                step="0.01"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">Valor monetario de 1 punto</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Compra Mínima (L.)
              </label>
              <input
                v-model.number="programForm.min_purchase_amount"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">Mínimo para ganar puntos</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Multiplicador Cumpleaños
              </label>
              <input
                v-model.number="programForm.birthday_multiplier"
                type="number"
                step="0.01"
                min="1"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-xs text-gray-500 mt-1">Ej: 2 = doble puntos</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <label class="flex items-center">
              <input
                v-model="programForm.points_expire"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Los puntos expiran</span>
            </label>

            <div v-if="programForm.points_expire" class="flex-1">
              <input
                v-model.number="programForm.expiration_days"
                type="number"
                min="1"
                :required="programForm.points_expire"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Días para expirar"
              />
            </div>
          </div>

          <div class="flex items-center">
            <label class="flex items-center">
              <input
                v-model="programForm.is_active"
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700">Programa activo</span>
            </label>
          </div>

          <div v-if="can('configure_loyalty_program')" class="flex justify-end pt-4">
            <button
              type="submit"
              :disabled="loading"
              class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ loading ? 'Guardando...' : 'Guardar Programa' }}
            </button>
          </div>
        </form>
      </div>

      <!-- Tiers Management -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Niveles de Lealtad</h2>
          <button
            v-if="can('manage_loyalty_tiers')"
            @click="showTierModal = true; editingTier = null; resetTierForm()"
            class="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
          >
            + Agregar Nivel
          </button>
        </div>

        <div v-if="tiers.length === 0" class="text-center py-8 text-gray-500">
          No hay niveles configurados. Agrega el primer nivel.
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="tier in sortedTiers"
            :key="tier.id"
            class="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  :style="{ backgroundColor: tier.color }"
                >
                  {{ tier.order }}
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ tier.name }}</h3>
                  <p class="text-sm text-gray-500">
                    Desde {{ tier.min_points.toLocaleString() }} puntos
                  </p>
                </div>
              </div>
              <div v-if="can('manage_loyalty_tiers')" class="flex items-center space-x-2">
                <button
                  @click="editTier(tier)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Editar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  @click="confirmDeleteTier(tier)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Eliminar"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="text-gray-600">
                <span class="font-medium">Descuento:</span> {{ tier.discount_percentage }}%
              </div>
              <div class="text-gray-600">
                <span class="font-medium">Multiplicador:</span> x{{ tier.points_multiplier }}
              </div>
            </div>
            <div v-if="tier.benefits && tier.benefits.length" class="mt-2">
              <p class="text-xs font-medium text-gray-700 mb-1">Beneficios:</p>
              <ul class="text-xs text-gray-600 space-y-1">
                <li v-for="(benefit, index) in tier.benefits" :key="index" class="flex items-start">
                  <span class="text-green-600 mr-1">✓</span>
                  {{ benefit }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tier Modal -->
    <div v-if="showTierModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div class="p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ editingTier ? 'Editar Nivel' : 'Nuevo Nivel' }}
          </h3>

          <form @submit.prevent="handleSaveTier" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
              <input
                v-model="tierForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Bronce, Plata, Oro"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                <input
                  v-model="tierForm.color"
                  type="color"
                  required
                  class="w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Orden *</label>
                <input
                  v-model.number="tierForm.order"
                  type="number"
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Puntos Mínimos *</label>
              <input
                v-model.number="tierForm.min_points"
                type="number"
                min="0"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Descuento (%) *</label>
                <input
                  v-model.number="tierForm.discount_percentage"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Multiplicador *</label>
                <input
                  v-model.number="tierForm.points_multiplier"
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Beneficios <span class="text-xs text-gray-500">(uno por línea)</span>
              </label>
              <textarea
                v-model="tierBenefitsText"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="5% de descuento&#10;Acceso a promociones&#10;Envío gratis"
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                @click="showTierModal = false"
                class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="loading"
                @click="console.log('Button clicked, loading:', loading)"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {{ loading ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'
import { usePermissions } from '@/composables/usePermissions'
import { toast } from 'vue3-toastify'

const loyaltyStore = useLoyaltyStore()
const { can } = usePermissions()

const loading = computed(() => loyaltyStore.loading)
const program = computed(() => loyaltyStore.program)
const tiers = computed(() => loyaltyStore.tiers)

const showTierModal = ref(false)
const editingTier = ref(null)

const programForm = ref({
  name: 'Programa de Lealtad',
  description: '',
  is_active: true,
  points_per_currency: 1.00,
  min_purchase_amount: 0,
  point_value: 1.00,
  points_expire: true,
  expiration_days: 365,
  special_dates: [],
  birthday_multiplier: 2.00
})

const tierForm = ref({
  name: '',
  color: '#CD7F32',
  min_points: 0,
  order: 1,
  discount_percentage: 0,
  points_multiplier: 1.00,
  benefits: []
})

const tierBenefitsText = ref('')

const sortedTiers = computed(() => {
  return [...tiers.value].sort((a, b) => a.order - b.order)
})

watch(tierBenefitsText, (newValue) => {
  tierForm.value.benefits = newValue
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
})

async function loadData() {
  await loyaltyStore.fetchProgram()
  await loyaltyStore.fetchTiers()

  if (program.value) {
    programForm.value = { ...program.value }
  }
}

onMounted(async () => {
  await loadData()
})

// Watch program changes to update form
watch(program, (newProgram, oldProgram) => {
  console.log('program watch triggered')
  console.log('oldProgram:', oldProgram)
  console.log('newProgram:', newProgram)

  if (newProgram) {
    programForm.value = { ...newProgram }
    console.log('programForm updated to:', programForm.value)
  }
})

function resetTierForm() {
  tierForm.value = {
    name: '',
    color: '#CD7F32',
    min_points: 0,
    order: tiers.value.length + 1,
    discount_percentage: 0,
    points_multiplier: 1.00,
    benefits: []
  }
  tierBenefitsText.value = ''
}

function editTier(tier) {
  editingTier.value = tier
  tierForm.value = { ...tier }
  tierBenefitsText.value = tier.benefits ? tier.benefits.join('\n') : ''
  showTierModal.value = true
}

async function handleSaveProgram() {
  console.log('handleSaveProgram called')
  console.log('programForm:', programForm.value)

  try {
    console.log('Calling saveProgram...')
    const result = await loyaltyStore.saveProgram(programForm.value)
    console.log('saveProgram result:', result)

    // Refresh program and tiers after saving
    console.log('Fetching program...')
    await loyaltyStore.fetchProgram()
    console.log('Program fetched, current program:', loyaltyStore.program)

    console.log('Fetching tiers...')
    await loyaltyStore.fetchTiers()
    console.log('Tiers fetched')
  } catch (error) {
    console.error('Error saving program:', error)
  }
}

async function handleSaveTier() {
  console.log('handleSaveTier called')
  console.log('editingTier:', editingTier.value)
  console.log('tierForm:', tierForm.value)

  try {
    if (editingTier.value) {
      console.log('Updating tier...')
      await loyaltyStore.updateTier(editingTier.value.id, tierForm.value)
    } else {
      console.log('Creating tier...')
      await loyaltyStore.createTier(tierForm.value)
    }
    showTierModal.value = false
    resetTierForm()
  } catch (error) {
    console.error('Error saving tier:', error)
  }
}

async function confirmDeleteTier(tier) {
  if (confirm(`¿Estás seguro de eliminar el nivel "${tier.name}"?`)) {
    await loyaltyStore.deleteTier(tier.id)
  }
}
</script>

<style scoped>
.loyalty-program-container {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}
</style>
