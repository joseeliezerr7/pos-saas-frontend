<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-3xl font-bold text-gray-900">Cuentas por Pagar</h1>
      <div class="flex gap-3">
        <router-link to="/payable/payments" class="btn-primary text-sm">
          Registrar Pago
        </router-link>
        <button @click="refreshDashboard" :disabled="payableStore.loading" class="btn-secondary text-sm">
          <span v-if="payableStore.loading">Actualizando...</span>
          <span v-else>Actualizar</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="payableStore.loading" class="text-center py-12">
      <p class="text-gray-500">Cargando datos...</p>
    </div>

    <template v-else-if="payableStore.dashboardStats">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Total Cuentas por Pagar -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Total por Pagar</p>
              <p class="text-2xl font-bold text-gray-900">L {{ formatNumber(payableStore.dashboardStats.total_payable) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ payableStore.dashboardStats.total_payables }} facturas</p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Facturas Vencidas -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Facturas Vencidas</p>
              <p class="text-2xl font-bold text-red-600">L {{ formatNumber(payableStore.dashboardStats.overdue_amount) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ payableStore.dashboardStats.overdue_count }} facturas</p>
            </div>
            <div class="bg-red-100 rounded-full p-3">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Proveedores sobre Límite -->
        <div
          class="card cursor-pointer hover:shadow-lg transition-shadow"
          :class="payableStore.dashboardStats.suppliers_over_limit?.count > 0 ? 'border-l-4 border-orange-500' : 'border-l-4 border-green-500'"
          @click="payableStore.dashboardStats.suppliers_over_limit?.count > 0 && showSuppliersOverLimit()"
        >
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <p class="text-sm text-gray-600">Proveedores sobre Límite</p>
              <p
                class="text-2xl font-bold mt-1"
                :class="payableStore.dashboardStats.suppliers_over_limit?.count > 0 ? 'text-orange-600' : 'text-green-600'"
              >
                {{ payableStore.dashboardStats.suppliers_over_limit?.count || 0 }}
              </p>
              <div class="mt-1">
                <p
                  v-if="!payableStore.dashboardStats.suppliers_over_limit?.count || payableStore.dashboardStats.suppliers_over_limit.count === 0"
                  class="text-xs text-green-600 font-medium flex items-center gap-1"
                >
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Todo en orden
                </p>
                <p
                  v-else
                  class="text-xs text-orange-600 font-medium flex items-center gap-1"
                >
                  <svg class="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Requieren atención
                </p>
              </div>
            </div>
            <div
              class="rounded-full p-3"
              :class="payableStore.dashboardStats.suppliers_over_limit?.count > 0 ? 'bg-orange-100' : 'bg-green-100'"
            >
              <svg
                v-if="!payableStore.dashboardStats.suppliers_over_limit?.count || payableStore.dashboardStats.suppliers_over_limit.count === 0"
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg
                v-else
                class="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Pagos del Mes -->
        <div class="card">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600">Pagos del Mes</p>
              <p class="text-2xl font-bold text-green-600">L {{ formatNumber(payableStore.dashboardStats.payments_this_month) }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ payableStore.dashboardStats.payment_count_this_month }} pagos</p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- Aging Report Summary -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold">Antigüedad de Saldos</h2>
          <router-link to="/payable/aging-report" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
            Ver reporte completo →
          </router-link>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div v-if="payableStore.dashboardStats.aging" class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-sm text-green-700 font-medium">Al Corriente</p>
            <p class="text-2xl font-bold text-green-900 mt-1">L {{ formatNumber(payableStore.dashboardStats.aging.current?.amount || 0) }}</p>
            <p class="text-xs text-green-600 mt-1">{{ payableStore.dashboardStats.aging.current?.count || 0 }} facturas</p>
          </div>
          <div v-if="payableStore.dashboardStats.aging" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-yellow-700 font-medium">1-30 Días</p>
            <p class="text-2xl font-bold text-yellow-900 mt-1">L {{ formatNumber(payableStore.dashboardStats.aging['1_30_days']?.amount || 0) }}</p>
            <p class="text-xs text-yellow-600 mt-1">{{ payableStore.dashboardStats.aging['1_30_days']?.count || 0 }} facturas</p>
          </div>
          <div v-if="payableStore.dashboardStats.aging" class="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p class="text-sm text-orange-700 font-medium">31-60 Días</p>
            <p class="text-2xl font-bold text-orange-900 mt-1">L {{ formatNumber(payableStore.dashboardStats.aging['31_60_days']?.amount || 0) }}</p>
            <p class="text-xs text-orange-600 mt-1">{{ payableStore.dashboardStats.aging['31_60_days']?.count || 0 }} facturas</p>
          </div>
          <div v-if="payableStore.dashboardStats.aging" class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-700 font-medium">Más de 60 Días</p>
            <p class="text-2xl font-bold text-red-900 mt-1">L {{ formatNumber(payableStore.dashboardStats.aging['60_plus_days']?.amount || 0) }}</p>
            <p class="text-xs text-red-600 mt-1">{{ payableStore.dashboardStats.aging['60_plus_days']?.count || 0 }} facturas</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Top Suppliers by Payable Amount -->
        <div class="card">
          <h2 class="text-lg font-semibold mb-4">Principales Proveedores con Saldo</h2>
          <div v-if="!payableStore.dashboardStats.top_suppliers || payableStore.dashboardStats.top_suppliers.length === 0" class="text-center py-8 text-gray-500">
            No hay proveedores con saldo pendiente
          </div>
          <div v-else class="space-y-3">
            <div v-for="(supplier, index) in payableStore.dashboardStats.top_suppliers.slice(0, 5)" :key="supplier.id"
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
              <div class="flex items-center space-x-3">
                <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-primary-100 text-primary-700 font-semibold text-sm">
                  {{ index + 1 }}
                </span>
                <div>
                  <p class="font-medium text-gray-900">{{ supplier.name }}</p>
                  <p class="text-sm text-gray-500">{{ supplier.pending_payables }} facturas pendientes</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">L {{ formatNumber(supplier.balance) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Payments -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Pagos Recientes</h2>
            <router-link to="/payable/payments" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Ver todos →
            </router-link>
          </div>
          <div v-if="!payableStore.dashboardStats.recent_payments || payableStore.dashboardStats.recent_payments.length === 0" class="text-center py-8 text-gray-500">
            No hay pagos recientes
          </div>
          <div v-else class="space-y-3">
            <div v-for="payment in payableStore.dashboardStats.recent_payments.slice(0, 5)" :key="payment.id"
                 class="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-primary-300 transition">
              <div>
                <p class="font-medium text-gray-900">{{ payment.supplier_name }}</p>
                <p class="text-sm text-gray-500">{{ payment.payment_number }} - {{ formatDate(payment.payment_date) }}</p>
                <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 mt-1">
                  {{ payment.payment_method }}
                </span>
              </div>
              <div class="text-right">
                <p class="font-semibold text-green-600">L {{ formatNumber(payment.amount) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <h2 class="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <router-link to="/payable/payments" class="btn-primary text-center">
            Registrar Pago
          </router-link>
          <router-link to="/payable/accounts-payable" class="btn-secondary text-center">
            Ver Cuentas por Pagar
          </router-link>
          <router-link to="/payable/aging-report" class="btn-secondary text-center">
            Reporte de Antigüedad
          </router-link>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="text-center py-12">
        <p class="text-gray-500">No se pudieron cargar los datos del dashboard</p>
      </div>
    </template>

    <!-- Modal: Proveedores sobre Límite -->
    <div
      v-if="showOverLimitModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showOverLimitModal = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-2xl font-bold text-gray-800">Proveedores sobre Límite de Crédito</h2>
              <p class="text-sm text-gray-600 mt-1">
                {{ payableStore.dashboardStats?.suppliers_over_limit?.count || 0 }} proveedores requieren atención
              </p>
            </div>
            <button
              @click="showOverLimitModal = false"
              class="text-gray-400 hover:text-gray-600 p-2"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto max-h-[60vh]">
          <div
            v-if="payableStore.dashboardStats?.suppliers_over_limit?.suppliers?.length > 0"
            class="space-y-4"
          >
            <div
              v-for="supplier in payableStore.dashboardStats.suppliers_over_limit.suppliers"
              :key="supplier.id"
              class="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div class="flex justify-between items-start">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-gray-900">{{ supplier.name }}</h3>

                  <div class="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p class="text-xs text-gray-500">Límite de Crédito</p>
                      <p class="text-sm font-medium text-gray-900">L {{ formatNumber(supplier.credit_limit) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Balance Actual</p>
                      <p class="text-sm font-semibold text-orange-600">L {{ formatNumber(supplier.current_balance) }}</p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">Excedente</p>
                      <p class="text-sm font-bold text-red-600">
                        L {{ formatNumber(supplier.over_limit_by) }}
                      </p>
                    </div>
                    <div>
                      <p class="text-xs text-gray-500">% Utilizado</p>
                      <p class="text-sm font-semibold text-orange-600">
                        {{ supplier.credit_limit > 0 ? Math.round((supplier.current_balance / supplier.credit_limit) * 100) : 0 }}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-center py-12">
            <svg class="w-16 h-16 text-green-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-gray-600 font-medium">Todos los proveedores dentro del límite de crédito</p>
            <p class="text-sm text-gray-500 mt-2">No hay alertas en este momento</p>
          </div>
        </div>

        <div class="p-6 border-t border-gray-200 bg-gray-50">
          <div class="flex justify-end gap-3">
            <button
              @click="showOverLimitModal = false"
              class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Cerrar
            </button>
            <router-link
              to="/payable/accounts-payable"
              @click="showOverLimitModal = false"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ver Cuentas por Pagar
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePayableStore } from '@/stores/payable'
import { toast } from 'vue3-toastify'

const payableStore = usePayableStore()
const showOverLimitModal = ref(false)

onMounted(async () => {
  await payableStore.fetchDashboard()
})

function refreshDashboard() {
  payableStore.fetchDashboard()
}

function formatNumber(value) {
  return parseFloat(value || 0).toFixed(2)
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-HN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function showSuppliersOverLimit() {
  if (payableStore.dashboardStats?.suppliers_over_limit?.suppliers?.length > 0) {
    showOverLimitModal.value = true
  } else {
    toast.info('No hay proveedores sobre el límite de crédito')
  }
}
</script>
