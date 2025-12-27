<template>
  <div class="inventory-index p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Gestión de Inventario</h1>
      <p class="text-gray-600 mt-2">Administre el stock, movimientos y transferencias de productos</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Current Stock -->
      <router-link
        to="/inventory/stock"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-blue-100 rounded-full">
            <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Stock Actual</h2>
        <p class="text-gray-600 text-sm mb-4">
          Consulte las existencias actuales por sucursal, alertas de stock bajo y valorización.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Ver stock</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Movements -->
      <router-link
        to="/inventory/movements"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Movimientos de Inventario</h2>
        <p class="text-gray-600 text-sm mb-4">
          Historial completo de entradas, salidas, ajustes y transferencias de productos.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Ver movimientos</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Adjustments -->
      <router-link
        to="/inventory/adjustments"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-orange-100 rounded-full">
            <svg class="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Ajustes de Inventario</h2>
        <p class="text-gray-600 text-sm mb-4">
          Registre ajustes manuales por merma, robo, error de conteo o correcciones.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Realizar ajuste</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>

      <!-- Transfers -->
      <router-link
        to="/inventory/transfers"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-primary"
      >
        <div class="flex items-center mb-4">
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">Transferencias entre Sucursales</h2>
        <p class="text-gray-600 text-sm mb-4">
          Transfiera productos entre sucursales y mantenga un registro de movimientos.
        </p>
        <div class="flex items-center text-primary font-semibold">
          <span>Nueva transferencia</span>
          <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </router-link>
    </div>

    <!-- Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div class="flex items-start">
        <svg class="w-6 h-6 text-blue-600 mt-1 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h3 class="text-lg font-semibold text-blue-900 mb-2">Gestión de Inventario</h3>
          <ul class="text-blue-800 text-sm space-y-1">
            <li>• Todos los movimientos quedan registrados con fecha, usuario y motivo</li>
            <li>• Los ajustes requieren motivo obligatorio para auditoría</li>
            <li>• Las transferencias afectan el stock de ambas sucursales automáticamente</li>
            <li>• Puede generar reportes de inventario desde el módulo de Reportes</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Inventory index page - navigation to inventory management sections
</script>

<style scoped>
.inventory-index {
  min-height: calc(100vh - 200px);
}
</style>

