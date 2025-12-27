<template>
  <div class="reports-index p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
      <p class="text-gray-600 mt-2">Genere reportes detallados sobre ventas, inventario y finanzas</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Sales Report -->
      <router-link
        to="/reports/sales"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Reporte de Ventas</h2>
        <p class="text-gray-600 text-sm mb-4">
          Analice sus ventas por período, sucursal, cajero o método de pago. Incluye top productos y gráficos.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Ver reporte</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Inventory Report -->
      <router-link
        to="/reports/inventory"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-orange-100 rounded-full">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Reporte de Inventario</h2>
        <p class="text-gray-600 text-sm mb-4">
          Consulte el estado actual de su inventario, productos con stock bajo y movimientos.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Ver reporte</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Financial Report -->
      <router-link
        to="/reports/financial"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Reporte Financiero</h2>
        <p class="text-gray-600 text-sm mb-4">
          Análisis completo de ingresos, gastos, costos y márgenes de ganancia.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Ver reporte</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Additional Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-semibold text-blue-900 mb-2">Acerca de los Reportes</h3>
          <ul class="text-blue-800 text-sm space-y-1">
            <li>• Todos los reportes se pueden exportar a PDF para su archivo</li>
            <li>• Los datos son filtrados automáticamente según su tenant y permisos</li>
            <li>• Los reportes financieros incluyen cálculos de márgenes y rentabilidad</li>
            <li>• Puede agrupar datos por diferentes criterios (día, semana, mes, sucursal, cajero)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Reports index page - navigation to different report types
</script>

<style scoped>
.reports-index {
  min-height: calc(100vh - 200px);
}
</style>

