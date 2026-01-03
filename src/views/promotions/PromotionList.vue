<template>
  <div class="promotions p-6">
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Promociones</h1>
        <p class="text-gray-600 mt-2">Gestione las promociones y descuentos de su negocio</p>
      </div>
      <button v-if="can('create_promotions')" @click="openCreateModal" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
        + Nueva Promoción
      </button>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="text"
          placeholder="Buscar por nombre o código..."
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          v-model="filterType"
          @change="handleFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los tipos</option>
          <option value="percentage">Porcentaje</option>
          <option value="fixed_amount">Monto Fijo</option>
          <option value="bogo">BOGO (2x1, 3x2)</option>
          <option value="volume">Por Volumen</option>
          <option value="bundle">Bundle/Combo</option>
          <option value="free_shipping">Envío Gratis</option>
        </select>
        <select
          v-model="filterStatus"
          @change="handleFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estados</option>
          <option value="1">Activos</option>
          <option value="0">Inactivos</option>
        </select>
        <select
          v-model="filterDateStatus"
          @change="handleFilterChange"
          class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Por vigencia</option>
          <option value="current">Vigentes ahora</option>
          <option value="upcoming">Próximas</option>
          <option value="expired">Expiradas</option>
        </select>
      </div>
    </div>

    <!-- Promotions Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="p-6">
        <div v-if="loading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
          <p class="mt-2 text-gray-600">Cargando promociones...</p>
        </div>

        <div v-else-if="promotions.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No hay promociones</h3>
          <p class="mt-1 text-sm text-gray-500">Comience agregando una nueva promoción.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Promoción</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descuento</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vigencia</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Usos</th>
                <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="promotion in promotions" :key="promotion.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <div class="text-sm font-medium text-gray-900">{{ promotion.name }}</div>
                    <div class="text-xs text-gray-500">
                      <span v-if="promotion.code" class="inline-flex items-center px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-mono">
                        {{ promotion.code }}
                      </span>
                      <span v-else class="text-gray-400">Sin código</span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span :class="getTypeClass(promotion.type)" class="px-2 py-1 text-xs font-semibold rounded-full">
                    {{ getTypeName(promotion.type) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ formatDiscount(promotion) }}
                </td>
                <td class="px-6 py-4 text-sm">
                  <div class="text-gray-900">{{ formatDate(promotion.start_date) }}</div>
                  <div class="text-gray-500 text-xs">hasta {{ formatDate(promotion.end_date) }}</div>
                  <div v-if="!isCurrentlyValid(promotion)" class="mt-1">
                    <span class="text-xs text-red-600">{{ getValidityStatus(promotion) }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <div class="text-gray-900 font-medium">{{ promotion.usage_count || 0 }}</div>
                  <div class="text-xs text-gray-500">
                    {{ promotion.usage_limit ? `de ${promotion.usage_limit}` : 'sin límite' }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-center">
                  <span v-if="promotion.is_active" class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    Activo
                  </span>
                  <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                    Inactivo
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    v-if="can('edit_promotions')"
                    @click="toggleActive(promotion)"
                    :class="promotion.is_active ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'"
                    class="mr-3"
                  >
                    {{ promotion.is_active ? 'Desactivar' : 'Activar' }}
                  </button>
                  <button v-if="can('edit_promotions')" @click="openEditModal(promotion)" class="text-blue-600 hover:text-blue-800 mr-3">
                    Editar
                  </button>
                  <button v-if="can('view_promotions')" @click="viewStats(promotion)" class="text-purple-600 hover:text-purple-800 mr-3">
                    Stats
                  </button>
                  <button v-if="can('delete_promotions')" @click="confirmDelete(promotion)" class="text-red-600 hover:text-red-800">
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div v-if="pagination.total > pagination.per_page" class="mt-4 flex justify-between items-center border-t pt-4">
          <div class="text-sm text-gray-700">
            Mostrando {{ promotions.length }} de {{ pagination.total }} promociones
          </div>
          <div class="flex gap-2">
            <button
              @click="changePage(pagination.current_page - 1)"
              :disabled="pagination.current_page === 1"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              @click="changePage(pagination.current_page + 1)"
              :disabled="pagination.current_page >= pagination.last_page"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div class="bg-white rounded-lg max-w-4xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 class="text-xl font-bold mb-4">
          {{ editingPromotion ? 'Editar Promoción' : 'Nueva Promoción' }}
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Basic Information -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Información Básica</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Promoción *</label>
                <input
                  v-model="form.name"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Descuento de Verano"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Código de Cupón</label>
                <input
                  v-model="form.code"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: VERANO2024"
                />
                <p class="mt-1 text-xs text-gray-500">Opcional. Deje vacío para promoción automática</p>
              </div>

              <div class="md:col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  v-model="form.description"
                  rows="2"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de la promoción"
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Discount Type and Value -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Tipo de Descuento</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Tipo *</label>
                <select
                  v-model="form.type"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar tipo...</option>
                  <option value="percentage">Porcentaje (%)</option>
                  <option value="fixed_amount">Monto Fijo ($)</option>
                  <option value="bogo">BOGO (Compra X lleva Y)</option>
                  <option value="volume">Por Volumen</option>
                  <option value="bundle">Bundle/Combo</option>
                  <option value="free_shipping">Envío Gratis</option>
                </select>
              </div>

              <!-- Percentage / Fixed Amount -->
              <div v-if="form.type === 'percentage' || form.type === 'fixed_amount'">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  {{ form.type === 'percentage' ? 'Porcentaje de Descuento (%)' : 'Monto de Descuento ($)' }}
                </label>
                <input
                  v-model.number="form.discount_value"
                  type="number"
                  step="0.01"
                  min="0"
                  :max="form.type === 'percentage' ? 100 : undefined"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :placeholder="form.type === 'percentage' ? 'Ej: 20' : 'Ej: 50.00'"
                />
              </div>

              <!-- BOGO -->
              <div v-if="form.type === 'bogo'" class="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Compra Cantidad</label>
                  <input
                    v-model.number="form.buy_quantity"
                    type="number"
                    min="1"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 2"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Lleva Cantidad</label>
                  <input
                    v-model.number="form.get_quantity"
                    type="number"
                    min="1"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 1"
                  />
                </div>
              </div>

              <!-- Volume -->
              <div v-if="form.type === 'volume'" class="md:col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Cantidad Mínima</label>
                  <input
                    v-model.number="form.buy_quantity"
                    type="number"
                    min="1"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 5"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">Descuento (%)</label>
                  <input
                    v-model.number="form.discount_value"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: 15"
                  />
                </div>
              </div>

              <!-- Bundle -->
              <div v-if="form.type === 'bundle'">
                <label class="block text-sm font-medium text-gray-700 mb-2">Descuento del Bundle (%)</label>
                <input
                  v-model.number="form.discount_value"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 25"
                />
              </div>
            </div>
          </div>

          <!-- Restrictions -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Restricciones</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Compra Mínima ($)</label>
                <input
                  v-model.number="form.min_purchase_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Descuento Máximo ($)</label>
                <input
                  v-model.number="form.max_discount_amount"
                  type="number"
                  step="0.01"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Límite de Usos Global</label>
                <input
                  v-model.number="form.usage_limit"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sin límite"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Usos por Cliente</label>
                <input
                  v-model.number="form.usage_per_customer"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sin límite"
                />
              </div>
            </div>
          </div>

          <!-- Validity Period -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Período de Vigencia</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Inicio *</label>
                <input
                  v-model="form.start_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Fecha de Fin *</label>
                <input
                  v-model="form.end_date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Inicio</label>
                <input
                  v-model="form.start_time"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Hora de Fin</label>
                <input
                  v-model="form.end_time"
                  type="time"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <!-- Applicability -->
          <div class="border-b pb-4">
            <h3 class="text-lg font-semibold mb-3">Aplicabilidad</h3>
            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Aplicar a</label>
                <select
                  v-model="form.applicable_to"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos los productos</option>
                  <option value="products">Productos específicos</option>
                  <option value="categories">Categorías específicas</option>
                  <option value="brands">Marcas específicas</option>
                </select>
              </div>

              <div v-if="form.applicable_to !== 'all'">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  IDs (separados por coma)
                </label>
                <input
                  v-model="applicableIdsInput"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 1,2,3,4"
                />
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div>
            <h3 class="text-lg font-semibold mb-3">Configuración</h3>
            <div class="space-y-3">
              <div class="flex items-center">
                <input
                  v-model="form.is_active"
                  type="checkbox"
                  id="is_active"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="is_active" class="ml-2 block text-sm text-gray-700">
                  Promoción activa
                </label>
              </div>

              <div class="flex items-center">
                <input
                  v-model="form.auto_apply"
                  type="checkbox"
                  id="auto_apply"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="auto_apply" class="ml-2 block text-sm text-gray-700">
                  Aplicar automáticamente (sin código)
                </label>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                <input
                  v-model.number="form.priority"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0 (mayor prioridad = mayor número)"
                />
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-3 mt-6">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="submitting"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {{ submitting ? 'Guardando...' : (editingPromotion ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Stats Modal -->
    <div v-if="showStatsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg max-w-2xl w-full p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Estadísticas: {{ selectedPromotion?.name }}</h2>
          <button @click="closeStatsModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="loadingStats" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-600"></div>
        </div>

        <div v-else-if="stats" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-blue-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">Total de Usos</div>
              <div class="text-2xl font-bold text-blue-600">{{ stats.total_uses || 0 }}</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">Descuento Total</div>
              <div class="text-2xl font-bold text-green-600">${{ stats.total_discount?.toFixed(2) || '0.00' }}</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">Promedio Descuento</div>
              <div class="text-2xl font-bold text-purple-600">${{ stats.average_discount?.toFixed(2) || '0.00' }}</div>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg">
              <div class="text-sm text-gray-600">Clientes Únicos</div>
              <div class="text-2xl font-bold text-orange-600">{{ stats.unique_customers || 0 }}</div>
            </div>
          </div>

          <div v-if="stats.top_customers && stats.top_customers.length > 0" class="mt-4">
            <h3 class="font-semibold mb-2">Top Clientes</h3>
            <div class="space-y-2">
              <div v-for="customer in stats.top_customers" :key="customer.customer_id" class="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span>{{ customer.customer_name || `Cliente #${customer.customer_id}` }}</span>
                <span class="text-sm text-gray-600">{{ customer.uses }} usos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePromotionStore } from '@/stores/promotion'
import { storeToRefs } from 'pinia'
import { usePermissions } from '@/composables/usePermissions'

const promotionStore = usePromotionStore()
const { promotions, loading, pagination } = storeToRefs(promotionStore)
const { can } = usePermissions()

const submitting = ref(false)
const showModal = ref(false)
const editingPromotion = ref(null)
const searchQuery = ref('')
const filterType = ref('')
const filterStatus = ref('')
const filterDateStatus = ref('')
const applicableIdsInput = ref('')
let searchTimeout = null

const showStatsModal = ref(false)
const selectedPromotion = ref(null)
const stats = ref(null)
const loadingStats = ref(false)

const form = ref({
  name: '',
  description: '',
  code: '',
  type: '',
  discount_value: 0,
  buy_quantity: null,
  get_quantity: null,
  min_purchase_amount: null,
  max_discount_amount: null,
  usage_limit: null,
  usage_per_customer: null,
  applicable_to: 'all',
  applicable_ids: [],
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  is_active: true,
  auto_apply: false,
  priority: 0
})

onMounted(() => {
  loadPromotions()
})

async function loadPromotions() {
  const params = {
    page: pagination.value.current_page,
    per_page: pagination.value.per_page,
    search: searchQuery.value || undefined,
    type: filterType.value || undefined,
    is_active: filterStatus.value || undefined,
    date_status: filterDateStatus.value || undefined
  }

  await promotionStore.fetchPromotions(params)
}

function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.value.current_page = 1
    loadPromotions()
  }, 500)
}

function handleFilterChange() {
  pagination.value.current_page = 1
  loadPromotions()
}

function changePage(page) {
  if (page >= 1 && page <= pagination.value.last_page) {
    pagination.value.current_page = page
    loadPromotions()
  }
}

function openCreateModal() {
  editingPromotion.value = null
  applicableIdsInput.value = ''
  form.value = {
    name: '',
    description: '',
    code: '',
    type: '',
    discount_value: 0,
    buy_quantity: null,
    get_quantity: null,
    min_purchase_amount: null,
    max_discount_amount: null,
    usage_limit: null,
    usage_per_customer: null,
    applicable_to: 'all',
    applicable_ids: [],
    start_date: '',
    end_date: '',
    start_time: '',
    end_time: '',
    is_active: true,
    auto_apply: false,
    priority: 0
  }
  showModal.value = true
}

function openEditModal(promotion) {
  editingPromotion.value = promotion
  applicableIdsInput.value = promotion.applicable_ids ? promotion.applicable_ids.join(',') : ''
  form.value = {
    name: promotion.name,
    description: promotion.description || '',
    code: promotion.code || '',
    type: promotion.type,
    discount_value: promotion.discount_value || 0,
    buy_quantity: promotion.buy_quantity || null,
    get_quantity: promotion.get_quantity || null,
    min_purchase_amount: promotion.min_purchase_amount || null,
    max_discount_amount: promotion.max_discount_amount || null,
    usage_limit: promotion.usage_limit || null,
    usage_per_customer: promotion.usage_per_customer || null,
    applicable_to: promotion.applicable_to || 'all',
    applicable_ids: promotion.applicable_ids || [],
    start_date: promotion.start_date,
    end_date: promotion.end_date,
    start_time: promotion.start_time || '',
    end_time: promotion.end_time || '',
    is_active: promotion.is_active,
    auto_apply: promotion.auto_apply || false,
    priority: promotion.priority || 0
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editingPromotion.value = null
  applicableIdsInput.value = ''
}

async function handleSubmit() {
  submitting.value = true
  try {
    // Convert applicable IDs
    if (form.value.applicable_to !== 'all' && applicableIdsInput.value) {
      form.value.applicable_ids = applicableIdsInput.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
    } else {
      form.value.applicable_ids = []
    }

    if (editingPromotion.value) {
      await promotionStore.updatePromotion(editingPromotion.value.id, form.value)
    } else {
      await promotionStore.createPromotion(form.value)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving promotion:', error)
  } finally {
    submitting.value = false
  }
}

async function toggleActive(promotion) {
  await promotionStore.toggleActivePromotion(promotion.id)
}

async function confirmDelete(promotion) {
  if (!confirm(`¿Está seguro de eliminar la promoción "${promotion.name}"?`)) {
    return
  }

  await promotionStore.deletePromotion(promotion.id)
}

async function viewStats(promotion) {
  selectedPromotion.value = promotion
  showStatsModal.value = true
  loadingStats.value = true
  try {
    stats.value = await promotionStore.getPromotionStats(promotion.id)
  } catch (error) {
    console.error('Error loading stats:', error)
  } finally {
    loadingStats.value = false
  }
}

function closeStatsModal() {
  showStatsModal.value = false
  selectedPromotion.value = null
  stats.value = null
}

function getTypeName(type) {
  const types = {
    percentage: 'Porcentaje',
    fixed_amount: 'Monto Fijo',
    bogo: 'BOGO',
    volume: 'Volumen',
    bundle: 'Bundle',
    free_shipping: 'Envío Gratis'
  }
  return types[type] || type
}

function getTypeClass(type) {
  const classes = {
    percentage: 'bg-blue-100 text-blue-800',
    fixed_amount: 'bg-green-100 text-green-800',
    bogo: 'bg-purple-100 text-purple-800',
    volume: 'bg-orange-100 text-orange-800',
    bundle: 'bg-pink-100 text-pink-800',
    free_shipping: 'bg-teal-100 text-teal-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

function formatDiscount(promotion) {
  if (promotion.type === 'percentage') {
    return `${promotion.discount_value}%`
  } else if (promotion.type === 'fixed_amount') {
    return `$${promotion.discount_value}`
  } else if (promotion.type === 'bogo') {
    return `${promotion.buy_quantity}x${promotion.get_quantity}`
  } else if (promotion.type === 'volume') {
    return `${promotion.buy_quantity}+ = ${promotion.discount_value}%`
  } else if (promotion.type === 'bundle') {
    return `${promotion.discount_value}%`
  } else if (promotion.type === 'free_shipping') {
    return 'Gratis'
  }
  return '-'
}

function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

function isCurrentlyValid(promotion) {
  const now = new Date()
  const start = new Date(promotion.start_date)
  const end = new Date(promotion.end_date)
  return now >= start && now <= end
}

function getValidityStatus(promotion) {
  const now = new Date()
  const start = new Date(promotion.start_date)
  const end = new Date(promotion.end_date)

  if (now < start) return 'Próximamente'
  if (now > end) return 'Expirada'
  return 'Vigente'
}
</script>
