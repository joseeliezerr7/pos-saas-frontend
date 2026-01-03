<template>
  <div class="tenant-selector">
    <!-- Tenant Info Display -->
    <div class="tenant-info">
      <div class="flex items-center space-x-3">
        <!-- Company Logo -->
        <div class="tenant-logo">
          <img
            v-if="currentTenant?.logo"
            :src="currentTenant.logo"
            :alt="currentTenant.name"
            class="w-8 h-8 rounded-md object-cover"
          />
          <div
            v-else
            class="w-8 h-8 rounded-md bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">
              {{ tenantInitials }}
            </span>
          </div>
        </div>

        <!-- Company Info -->
        <div class="tenant-details flex-1 min-w-0">
          <div class="flex items-center space-x-2">
            <h3 class="text-sm font-semibold text-gray-900 truncate">
              {{ currentTenant?.name || 'Sin empresa' }}
            </h3>
            <span
              v-if="currentTenant?.is_active"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800"
            >
              Activa
            </span>
            <span
              v-else
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800"
            >
              Inactiva
            </span>
          </div>

          <div class="flex items-center space-x-2 mt-1">
            <p class="text-xs text-gray-500">
              RTN: {{ currentTenant?.rtn || 'N/A' }}
            </p>
            <span class="text-gray-300">•</span>
            <p class="text-xs text-gray-500">
              {{ currentBranch?.name || 'Sin sucursal' }}
            </p>
          </div>
        </div>

        <!-- Info Button (optional, for future expansion) -->
        <button
          v-if="showInfoButton"
          @click="showDetails = !showDetails"
          class="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          title="Ver detalles de la empresa"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Expanded Details (conditional) -->
    <transition name="slide-fade">
      <div v-if="showDetails && currentTenant" class="tenant-details-expanded mt-3 pt-3 border-t border-gray-200">
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span class="text-gray-500">Razón Social:</span>
            <p class="font-medium text-gray-900 mt-1">{{ currentTenant.legal_name || 'N/A' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Email:</span>
            <p class="font-medium text-gray-900 mt-1">{{ currentTenant.email || 'N/A' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Teléfono:</span>
            <p class="font-medium text-gray-900 mt-1">{{ currentTenant.phone || 'N/A' }}</p>
          </div>
          <div>
            <span class="text-gray-500">Dirección:</span>
            <p class="font-medium text-gray-900 mt-1 line-clamp-2">{{ currentTenant.address || 'N/A' }}</p>
          </div>
        </div>

        <!-- Subscription Info (if available) -->
        <div v-if="subscriptionInfo" class="mt-3 pt-3 border-t border-gray-200">
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-500">Suscripción:</span>
            <span
              :class="[
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium',
                subscriptionStatusClass
              ]"
            >
              {{ subscriptionStatusText }}
            </span>
          </div>
          <p v-if="subscriptionInfo.expires_at" class="text-xs text-gray-500 mt-1">
            Vence: {{ formatDate(subscriptionInfo.expires_at) }}
          </p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useTenantStore } from '@/stores/tenant'
import { useAuthStore } from '@/stores/auth'

// Props
defineProps({
  showInfoButton: {
    type: Boolean,
    default: true
  }
})

// Stores
const tenantStore = useTenantStore()
const authStore = useAuthStore()

// State
const showDetails = ref(false)

// Computed
const currentTenant = computed(() => tenantStore.currentTenant)
const currentBranch = computed(() => authStore.user?.branch)

const tenantInitials = computed(() => {
  if (!currentTenant.value?.name) return 'N/A'
  return currentTenant.value.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
})

const subscriptionInfo = computed(() => {
  return authStore.user?.company?.subscription || null
})

const subscriptionStatusClass = computed(() => {
  const status = subscriptionInfo.value?.status
  const classes = {
    active: 'bg-green-100 text-green-800',
    trial: 'bg-blue-100 text-blue-800',
    expired: 'bg-red-100 text-red-800',
    canceled: 'bg-gray-100 text-gray-800',
    suspended: 'bg-yellow-100 text-yellow-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
})

const subscriptionStatusText = computed(() => {
  const status = subscriptionInfo.value?.status
  const texts = {
    active: 'Activa',
    trial: 'Prueba',
    expired: 'Expirada',
    canceled: 'Cancelada',
    suspended: 'Suspendida'
  }
  return texts[status] || 'Desconocida'
})

// Methods
function formatDate(dateString) {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.tenant-selector {
  @apply rounded-lg bg-white border border-gray-200 p-4 shadow-sm;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
