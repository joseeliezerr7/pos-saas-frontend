<template>
  <div class="super-admin-dashboard">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Panel de Super Administrador</h1>
      <p class="text-gray-600 mt-2">Gestiona todos los clientes y métricas del sistema</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="text-gray-500">Cargando métricas...</div>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Métricas Principales -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Total Tenants -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Total Clientes</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.tenants?.total || 0 }}</p>
              <p class="text-sm text-green-600 mt-2">
                +{{ stats.tenants?.new_this_month || 0 }} este mes
              </p>
            </div>
            <div class="p-3 bg-blue-100 rounded-full">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Active Tenants -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Activos</p>
              <p class="text-3xl font-bold text-green-600 mt-2">{{ stats.tenants?.active || 0 }}</p>
              <p class="text-sm text-gray-500 mt-2">
                {{ stats.tenants?.inactive || 0 }} inactivos
              </p>
            </div>
            <div class="p-3 bg-green-100 rounded-full">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Subscriptions -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Suscripciones Activas</p>
              <p class="text-3xl font-bold text-purple-600 mt-2">{{ stats.subscriptions?.active || 0 }}</p>
              <p class="text-sm text-orange-600 mt-2">
                {{ stats.subscriptions?.trial || 0 }} en prueba
              </p>
            </div>
            <div class="p-3 bg-purple-100 rounded-full">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Monthly Revenue -->
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-600">Ingresos Mensuales</p>
              <p class="text-3xl font-bold text-emerald-600 mt-2">
                L {{ formatCurrency(stats.global?.monthly_revenue || 0) }}
              </p>
              <p class="text-sm text-gray-500 mt-2">Proyectado</p>
            </div>
            <div class="p-3 bg-emerald-100 rounded-full">
              <svg class="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Gráficas y Datos Adicionales -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- Distribución por Plan -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Distribución por Plan</h3>
          <div class="space-y-3">
            <div v-for="plan in stats.plans" :key="plan.id" class="flex items-center justify-between">
              <span class="text-sm text-gray-700">{{ plan.name }}</span>
              <div class="flex items-center space-x-2">
                <div class="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    class="bg-primary-600 h-2 rounded-full"
                    :style="{ width: `${getPlanPercentage(plan.active_subscriptions)}%` }"
                  ></div>
                </div>
                <span class="text-sm font-medium text-gray-900">{{ plan.active_subscriptions }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado de Suscripciones -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Estado de Suscripciones</h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-green-50 rounded-lg">
              <p class="text-2xl font-bold text-green-600">{{ stats.subscriptions?.active || 0 }}</p>
              <p class="text-sm text-gray-600 mt-1">Activas</p>
            </div>
            <div class="text-center p-4 bg-blue-50 rounded-lg">
              <p class="text-2xl font-bold text-blue-600">{{ stats.subscriptions?.trial || 0 }}</p>
              <p class="text-sm text-gray-600 mt-1">Prueba</p>
            </div>
            <div class="text-center p-4 bg-red-50 rounded-lg">
              <p class="text-2xl font-bold text-red-600">{{ stats.subscriptions?.expired || 0 }}</p>
              <p class="text-sm text-gray-600 mt-1">Expiradas</p>
            </div>
            <div class="text-center p-4 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-600">{{ stats.subscriptions?.suspended || 0 }}</p>
              <p class="text-sm text-gray-600 mt-1">Suspendidas</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Registros Recientes -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900">Registros Recientes</h3>
          <router-link
            to="/super-admin/tenants"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Ver todos →
          </router-link>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Registro</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="signup in stats.recent_signups" :key="signup.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ signup.name }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {{ signup.plan }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(signup.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import superAdminService from '@/services/superAdminService'
import { toast } from 'vue3-toastify'

const loading = ref(true)
const stats = ref({})

const totalActiveSubscriptions = computed(() => {
  if (!stats.value.plans) return 0
  return stats.value.plans.reduce((sum, plan) => sum + plan.active_subscriptions, 0)
})

onMounted(async () => {
  await loadDashboard()
})

async function loadDashboard() {
  loading.value = true
  try {
    const response = await superAdminService.getDashboard()
    stats.value = response.data.data
  } catch (error) {
    console.error('Error loading dashboard:', error)
    toast.error('Error al cargar el dashboard')
  } finally {
    loading.value = false
  }
}

function getPlanPercentage(activeCount) {
  if (totalActiveSubscriptions.value === 0) return 0
  return Math.round((activeCount / totalActiveSubscriptions.value) * 100)
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
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.super-admin-dashboard {
  @apply p-6;
}
</style>
