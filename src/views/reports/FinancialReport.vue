<template>
  <div class="financial-report p-6">
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Reportes Financieros Avanzados</h1>
      <p class="text-gray-600 mt-2">Estado de Resultados, Balance General, Flujo de Caja y Análisis de Rentabilidad</p>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 class="text-lg font-semibold mb-4">Filtros</h2>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Inicial <span class="text-red-500">*</span>
          </label>
          <input
            v-model="filters.start_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Fecha Final <span class="text-red-500">*</span>
          </label>
          <input
            v-model="filters.end_date"
            type="date"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Sucursal
          </label>
          <select
            v-model="filters.branch_id"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las sucursales</option>
            <!-- Add branches here -->
          </select>
        </div>

        <div class="flex items-end">
          <button
            @click="loadAllReports"
            :disabled="loading || !filters.start_date || !filters.end_date"
            class="w-full px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Cargando...' : 'Generar Reportes' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
      {{ error }}
    </div>

    <!-- Tabs Navigation -->
    <div class="bg-white rounded-lg shadow-sm mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            {{ tab.name }}
          </button>
        </nav>
      </div>

      <!-- Tab Content -->
      <div class="p-6">
        <!-- Profit & Loss Tab -->
        <div v-show="activeTab === 'profit-loss'">
          <div v-if="profitAndLoss">
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">Estado de Resultados (P&L)</h3>
              <p class="text-sm text-gray-600">
                Período: {{ formatDate(profitAndLoss.period?.start_date) }} - {{ formatDate(profitAndLoss.period?.end_date) }}
              </p>
            </div>

            <!-- Revenue Section -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <h4 class="text-lg font-semibold text-green-900 mb-4">Ingresos</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Total de Ventas</span>
                  <span class="font-semibold">L {{ formatCurrency(profitAndLoss.revenue?.total_sales) }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Número de Ventas</span>
                  <span>{{ profitAndLoss.revenue?.number_of_sales }}</span>
                </div>
                <div class="flex justify-between text-sm text-gray-600">
                  <span>Venta Promedio</span>
                  <span>L {{ formatCurrency(profitAndLoss.revenue?.average_sale) }}</span>
                </div>
              </div>
            </div>

            <!-- Cost of Sales -->
            <div class="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-4">
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-semibold text-orange-900">Costo de Ventas</h4>
                <span class="text-xl font-bold text-orange-900">L {{ formatCurrency(profitAndLoss.cost_of_sales) }}</span>
              </div>
            </div>

            <!-- Gross Profit -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
              <h4 class="text-lg font-semibold text-blue-900 mb-3">Ganancia Bruta</h4>
              <div class="flex justify-between items-center">
                <span class="text-2xl font-bold text-blue-900">L {{ formatCurrency(profitAndLoss.gross_profit?.amount) }}</span>
                <span class="text-lg font-semibold text-blue-700">{{ profitAndLoss.gross_profit?.margin_percentage }}% margen</span>
              </div>
            </div>

            <!-- Operating Expenses -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h4 class="text-lg font-semibold text-red-900 mb-4">Gastos Operativos</h4>
              <div class="space-y-2 mb-3">
                <div v-for="(amount, category) in profitAndLoss.operating_expenses?.by_category" :key="category" class="flex justify-between text-sm">
                  <span class="capitalize">{{ category }}</span>
                  <span>L {{ formatCurrency(amount) }}</span>
                </div>
              </div>
              <div class="border-t border-red-300 pt-3 flex justify-between">
                <span class="font-semibold">Total Gastos</span>
                <span class="font-bold text-lg">L {{ formatCurrency(profitAndLoss.operating_expenses?.total) }}</span>
              </div>
            </div>

            <!-- Operating Profit -->
            <div class="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-4">
              <div class="flex justify-between items-center">
                <h4 class="text-lg font-semibold text-purple-900">Ganancia Operativa</h4>
                <span class="text-xl font-bold text-purple-900">L {{ formatCurrency(profitAndLoss.operating_profit) }}</span>
              </div>
            </div>

            <!-- Net Profit -->
            <div class="bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg p-6">
              <h4 class="text-xl font-semibold mb-3">Ganancia Neta</h4>
              <div class="flex justify-between items-center">
                <span class="text-3xl font-bold">L {{ formatCurrency(profitAndLoss.net_profit?.amount) }}</span>
                <span class="text-xl font-semibold">{{ profitAndLoss.net_profit?.margin_percentage }}% margen</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>

        <!-- Balance Sheet Tab -->
        <div v-show="activeTab === 'balance-sheet'">
          <div v-if="balanceSheet">
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">Balance General</h3>
              <p class="text-sm text-gray-600">Al: {{ formatDate(balanceSheet.as_of_date) }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Assets -->
              <div>
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-blue-900 mb-4">ACTIVOS</h4>

                  <div class="space-y-3">
                    <div>
                      <p class="text-sm font-semibold text-blue-800 mb-2">Activos Corrientes</p>
                      <div class="space-y-1 pl-4 text-sm">
                        <div class="flex justify-between">
                          <span>Efectivo en Cajas</span>
                          <span>L {{ formatCurrency(balanceSheet.assets?.current_assets?.cash_in_registers) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Inventario</span>
                          <span>L {{ formatCurrency(balanceSheet.assets?.current_assets?.inventory) }}</span>
                        </div>
                        <div class="flex justify-between">
                          <span>Cuentas por Cobrar</span>
                          <span>L {{ formatCurrency(balanceSheet.assets?.current_assets?.accounts_receivable) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="border-t border-blue-300 pt-3">
                      <div class="flex justify-between font-bold text-blue-900">
                        <span>Total Activos</span>
                        <span>L {{ formatCurrency(balanceSheet.assets?.total) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Liabilities & Equity -->
              <div class="space-y-6">
                <!-- Liabilities -->
                <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-red-900 mb-4">PASIVOS</h4>

                  <div class="space-y-3">
                    <div>
                      <p class="text-sm font-semibold text-red-800 mb-2">Pasivos Corrientes</p>
                      <div class="space-y-1 pl-4 text-sm">
                        <div class="flex justify-between">
                          <span>Cuentas por Pagar</span>
                          <span>L {{ formatCurrency(balanceSheet.liabilities?.current_liabilities?.accounts_payable) }}</span>
                        </div>
                      </div>
                    </div>

                    <div class="border-t border-red-300 pt-3">
                      <div class="flex justify-between font-bold text-red-900">
                        <span>Total Pasivos</span>
                        <span>L {{ formatCurrency(balanceSheet.liabilities?.total) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Equity -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h4 class="text-lg font-semibold text-green-900 mb-4">PATRIMONIO</h4>

                  <div class="flex justify-between font-bold text-green-900">
                    <span>Total Patrimonio</span>
                    <span>L {{ formatCurrency(balanceSheet.equity?.total) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>

        <!-- Cash Flow Tab -->
        <div v-show="activeTab === 'cash-flow'">
          <div v-if="cashFlow">
            <div class="mb-6">
              <h3 class="text-xl font-semibold mb-2">Estado de Flujo de Caja</h3>
              <p class="text-sm text-gray-600">
                Período: {{ formatDate(cashFlow.period?.start_date) }} - {{ formatDate(cashFlow.period?.end_date) }}
              </p>
            </div>

            <!-- Cash Inflows -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-4">
              <h4 class="text-lg font-semibold text-green-900 mb-4">Entradas de Efectivo</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Ventas</span>
                  <span class="font-semibold">L {{ formatCurrency(cashFlow.operating_activities?.cash_inflows?.sales) }}</span>
                </div>
                <div class="border-t border-green-300 pt-2 flex justify-between font-bold text-green-900">
                  <span>Total Entradas</span>
                  <span>L {{ formatCurrency(cashFlow.operating_activities?.cash_inflows?.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Cash Outflows -->
            <div class="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
              <h4 class="text-lg font-semibold text-red-900 mb-4">Salidas de Efectivo</h4>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span>Compras</span>
                  <span>L {{ formatCurrency(cashFlow.operating_activities?.cash_outflows?.purchases) }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Gastos</span>
                  <span>L {{ formatCurrency(cashFlow.operating_activities?.cash_outflows?.expenses) }}</span>
                </div>
                <div class="border-t border-red-300 pt-2 flex justify-between font-bold text-red-900">
                  <span>Total Salidas</span>
                  <span>L {{ formatCurrency(cashFlow.operating_activities?.cash_outflows?.total) }}</span>
                </div>
              </div>
            </div>

            <!-- Net Cash Flow -->
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6">
              <h4 class="text-xl font-semibold mb-3">Flujo Neto de Efectivo</h4>
              <div class="text-3xl font-bold">
                L {{ formatCurrency(cashFlow.operating_activities?.net_cash_flow) }}
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>

        <!-- Product Profitability Tab -->
        <div v-show="activeTab === 'product-profitability'">
          <div v-if="productProfitability && productProfitability.length > 0">
            <div class="mb-6">
              <h3 class="text-xl font-semibold">Rentabilidad por Producto</h3>
              <p class="text-sm text-gray-600 mt-1">Top productos más rentables</p>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Unidades</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Costo</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ganancia</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Margen %</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="product in productProfitability" :key="product.id">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ product.name }}</td>
                    <td class="px-6 py-4 text-sm text-gray-600">{{ product.sku }}</td>
                    <td class="px-6 py-4 text-sm text-right text-gray-900">{{ product.units_sold }}</td>
                    <td class="px-6 py-4 text-sm text-right text-green-600 font-semibold">L {{ formatCurrency(product.revenue) }}</td>
                    <td class="px-6 py-4 text-sm text-right text-orange-600">L {{ formatCurrency(product.cost) }}</td>
                    <td class="px-6 py-4 text-sm text-right text-blue-600 font-bold">L {{ formatCurrency(product.profit) }}</td>
                    <td class="px-6 py-4 text-sm text-right">
                      <span class="px-2 py-1 rounded-full text-xs font-semibold" :class="getProfitabilityClass(product.margin_percentage)">
                        {{ product.margin_percentage }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>

        <!-- Category Profitability Tab -->
        <div v-show="activeTab === 'category-profitability'">
          <div v-if="categoryProfitability && categoryProfitability.length > 0">
            <div class="mb-6">
              <h3 class="text-xl font-semibold">Rentabilidad por Categoría</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="category in categoryProfitability" :key="category.id" class="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <h4 class="text-lg font-semibold text-gray-900 mb-4">{{ category.name }}</h4>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Unidades Vendidas</span>
                    <span class="font-semibold">{{ category.units_sold }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Ingresos</span>
                    <span class="font-semibold text-green-600">L {{ formatCurrency(category.revenue) }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Costo</span>
                    <span class="font-semibold text-orange-600">L {{ formatCurrency(category.cost) }}</span>
                  </div>
                  <div class="border-t pt-2 flex justify-between">
                    <span class="text-gray-900 font-semibold">Ganancia</span>
                    <span class="font-bold text-blue-600">L {{ formatCurrency(category.profit) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Margen</span>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="getProfitabilityClass(category.margin_percentage)">
                      {{ category.margin_percentage }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>

        <!-- Branch Profitability Tab -->
        <div v-show="activeTab === 'branch-profitability'">
          <div v-if="branchProfitability && branchProfitability.length > 0">
            <div class="mb-6">
              <h3 class="text-xl font-semibold">Rentabilidad por Sucursal</h3>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="branch in branchProfitability" :key="branch.id" class="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-colors">
                <h4 class="text-xl font-bold text-gray-900 mb-4">{{ branch.name }}</h4>
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Total Ventas</span>
                    <span class="font-semibold text-gray-900">{{ branch.total_sales }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Ingresos</span>
                    <span class="text-lg font-bold text-green-600">L {{ formatCurrency(branch.revenue) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Costo</span>
                    <span class="font-semibold text-orange-600">L {{ formatCurrency(branch.cost) }}</span>
                  </div>
                  <div class="border-t-2 border-gray-300 pt-3 flex justify-between items-center">
                    <span class="text-lg font-bold text-gray-900">Ganancia</span>
                    <span class="text-xl font-bold text-blue-600">L {{ formatCurrency(branch.profit) }}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="text-gray-600">Margen</span>
                    <span class="px-3 py-1 rounded-full text-sm font-semibold" :class="getProfitabilityClass(branch.margin_percentage)">
                      {{ branch.margin_percentage }}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>

        <!-- Monthly Comparison Tab -->
        <div v-show="activeTab === 'monthly-comparison'">
          <div v-if="monthlyComparison && monthlyComparison.length > 0">
            <div class="mb-6">
              <h3 class="text-xl font-semibold">Comparativo Mensual</h3>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gastos</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ganancia</th>
                    <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">N° Ventas</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="month in monthlyComparison" :key="month.month">
                    <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ month.month_name }}</td>
                    <td class="px-6 py-4 text-sm text-right text-green-600 font-semibold">L {{ formatCurrency(month.revenue) }}</td>
                    <td class="px-6 py-4 text-sm text-right text-red-600">L {{ formatCurrency(month.expenses) }}</td>
                    <td class="px-6 py-4 text-sm text-right font-bold" :class="month.profit >= 0 ? 'text-blue-600' : 'text-red-600'">
                      L {{ formatCurrency(month.profit) }}
                    </td>
                    <td class="px-6 py-4 text-sm text-right text-gray-600">{{ month.sales_count }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div v-else class="text-center py-12 text-gray-500">
            No hay datos disponibles. Genere el reporte para ver los resultados.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useFinancialReportStore } from '@/stores/financialReport'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const financialReportStore = useFinancialReportStore()

const activeTab = ref('profit-loss')
const filters = ref({
  start_date: getDefaultStartDate(),
  end_date: getDefaultEndDate(),
  branch_id: ''
})

const tabs = [
  { id: 'profit-loss', name: 'Estado de Resultados (P&L)' },
  { id: 'balance-sheet', name: 'Balance General' },
  { id: 'cash-flow', name: 'Flujo de Caja' },
  { id: 'product-profitability', name: 'Rentabilidad por Producto' },
  { id: 'category-profitability', name: 'Rentabilidad por Categoría' },
  { id: 'branch-profitability', name: 'Rentabilidad por Sucursal' },
  { id: 'monthly-comparison', name: 'Comparativo Mensual' }
]

const loading = computed(() => financialReportStore.loading)
const error = computed(() => financialReportStore.error)
const profitAndLoss = computed(() => financialReportStore.profitAndLoss)
const balanceSheet = computed(() => financialReportStore.balanceSheet)
const cashFlow = computed(() => financialReportStore.cashFlow)
const productProfitability = computed(() => financialReportStore.productProfitability)
const categoryProfitability = computed(() => financialReportStore.categoryProfitability)
const branchProfitability = computed(() => financialReportStore.branchProfitability)
const monthlyComparison = computed(() => financialReportStore.monthlyComparison)

function getDefaultStartDate() {
  const date = new Date()
  date.setDate(1) // First day of current month
  return date.toISOString().split('T')[0]
}

function getDefaultEndDate() {
  return new Date().toISOString().split('T')[0]
}

async function loadAllReports() {
  const params = { ...filters.value }

  try {
    await Promise.all([
      financialReportStore.fetchProfitAndLoss(params),
      financialReportStore.fetchCashFlow(params),
      financialReportStore.fetchProductProfitability(params),
      financialReportStore.fetchCategoryProfitability(params),
      financialReportStore.fetchBranchProfitability(params)
    ])

    // Balance sheet uses as_of_date instead of start_date/end_date
    await financialReportStore.fetchBalanceSheet({
      as_of_date: params.end_date,
      branch_id: params.branch_id
    })

    // Monthly comparison uses year
    const year = new Date(params.end_date).getFullYear()
    await financialReportStore.fetchMonthlyComparison({
      year,
      branch_id: params.branch_id
    })
  } catch (err) {
    console.error('Error loading reports:', err)
  }
}

function formatCurrency(value) {
  if (!value && value !== 0) return '0.00'
  return parseFloat(value).toLocaleString('es-HN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function formatDate(dateString) {
  if (!dateString) return ''
  try {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
  } catch {
    return dateString
  }
}

function getProfitabilityClass(margin) {
  if (margin >= 30) return 'bg-green-100 text-green-800'
  if (margin >= 15) return 'bg-blue-100 text-blue-800'
  if (margin >= 5) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

onMounted(() => {
  // Optionally load reports on mount
  // loadAllReports()
})
</script>
