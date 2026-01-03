<template>
  <div class="customer-statement-page">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <button
          @click="goBack"
          class="text-blue-600 hover:text-blue-800 mb-2 flex items-center gap-1"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </button>
        <h1 class="text-2xl font-bold text-gray-800">Estado de Cuenta</h1>
        <p v-if="customerData" class="text-gray-600 mt-1">{{ customerData.name }}</p>
      </div>
      <div class="flex gap-2">
        <button
          @click="showPreview"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Vista Previa
        </button>
        <button
          @click="printStatement"
          class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
        <button
          @click="exportPDF"
          :disabled="exportingPDF"
          class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg v-if="!exportingPDF" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          {{ exportingPDF ? 'Generando...' : 'Exportar PDF' }}
        </button>
      </div>
    </div>

    <!-- Customer Info Card -->
    <div v-if="customerData" class="bg-white rounded-lg shadow p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Cliente</h3>
          <p class="text-lg font-semibold text-gray-900">{{ customerData.name }}</p>
          <p class="text-sm text-gray-600">{{ customerData.rtn || 'Sin RTN' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Teléfono</h3>
          <p class="text-gray-900">{{ customerData.phone || 'N/A' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Correo</h3>
          <p class="text-gray-900">{{ customerData.email || 'N/A' }}</p>
        </div>
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-1">Dirección</h3>
          <p class="text-gray-900">{{ customerData.address || 'N/A' }}</p>
        </div>
      </div>
    </div>

    <!-- Credit Summary -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-blue-600 mb-1">Límite de Crédito</p>
            <p class="text-2xl font-bold text-blue-700">L {{ formatCurrency(customerData?.credit_limit || 0) }}</p>
          </div>
          <div class="bg-blue-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-green-600 mb-1">Crédito Disponible</p>
            <p class="text-2xl font-bold text-green-700">L {{ formatCurrency(availableCredit) }}</p>
          </div>
          <div class="bg-green-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-red-600 mb-1">Balance Actual</p>
            <p class="text-2xl font-bold text-red-700">L {{ formatCurrency(customerData?.current_balance || 0) }}</p>
          </div>
          <div class="bg-red-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div class="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-purple-600 mb-1">Días de Crédito</p>
            <p class="text-2xl font-bold text-purple-700">{{ customerData?.credit_days || 30 }} días</p>
          </div>
          <div class="bg-purple-200 p-3 rounded-full">
            <svg class="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex items-center gap-4">
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Inicio</label>
          <input
            v-model="filters.start_date"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex-1">
          <label class="block text-sm font-medium text-gray-700 mb-2">Fecha Fin</label>
          <input
            v-model="filters.end_date"
            type="date"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div class="flex items-end gap-2">
          <button
            @click="applyFilters"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Filtrar
          </button>
          <button
            @click="setDateRange('thisMonth')"
            class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Este Mes
          </button>
          <button
            @click="setDateRange('all')"
            class="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
          >
            Todo
          </button>
        </div>
      </div>
    </div>

    <!-- Statement Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-800">Movimientos de Cuenta</h2>
      </div>

      <div v-if="loading" class="p-8 text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-gray-600 mt-2">Cargando estado de cuenta...</p>
      </div>

      <div v-else-if="transactions.length === 0" class="p-8 text-center">
        <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p class="text-gray-600">No hay movimientos en el período seleccionado</p>
      </div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Documento
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cargos
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Abonos
            </th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Balance
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(transaction, index) in transactions" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ formatDate(transaction.date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span v-if="transaction.type === 'sale'" class="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                Venta
              </span>
              <span v-else class="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                Pago
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ transaction.document_number }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ transaction.description }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-red-600">
              {{ transaction.type === 'sale' ? 'L ' + formatCurrency(transaction.amount) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
              {{ transaction.type === 'payment' ? 'L ' + formatCurrency(transaction.amount) : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold" :class="transaction.balance >= 0 ? 'text-red-600' : 'text-green-600'">
              L {{ formatCurrency(Math.abs(transaction.balance)) }}
              <span v-if="transaction.balance < 0" class="text-xs ml-1">(A favor)</span>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100">
          <tr>
            <td colspan="4" class="px-6 py-4 text-sm font-bold text-gray-900">TOTALES</td>
            <td class="px-6 py-4 text-right text-sm font-bold text-red-600">
              L {{ formatCurrency(totalCharges) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-green-600">
              L {{ formatCurrency(totalPayments) }}
            </td>
            <td class="px-6 py-4 text-right text-sm font-bold text-gray-900">
              L {{ formatCurrency(finalBalance) }}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Summary Section -->
    <div v-if="statementSummary" class="mt-6 bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Resumen del Período</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p class="text-sm text-gray-600 mb-1">Balance Inicial</p>
          <p class="text-xl font-semibold text-gray-900">L {{ formatCurrency(statementSummary.opening_balance || 0) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-1">Total Cargos</p>
          <p class="text-xl font-semibold text-red-600">L {{ formatCurrency(totalCharges) }}</p>
        </div>
        <div>
          <p class="text-sm text-gray-600 mb-1">Total Abonos</p>
          <p class="text-xl font-semibold text-green-600">L {{ formatCurrency(totalPayments) }}</p>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center">
          <p class="text-lg font-semibold text-gray-800">Balance Final:</p>
          <p class="text-2xl font-bold" :class="finalBalance >= 0 ? 'text-red-600' : 'text-green-600'">
            L {{ formatCurrency(Math.abs(finalBalance)) }}
            <span v-if="finalBalance < 0" class="text-sm ml-2">(A favor del cliente)</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <!-- Modal Header -->
        <div class="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-bold">Vista Previa - Estado de Cuenta</h2>
          <div class="flex gap-2">
            <button
              @click="printFromPreview"
              class="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded flex items-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Imprimir
            </button>
            <button
              @click="exportPDFFromPreview"
              :disabled="exportingPDF"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2 disabled:opacity-50"
            >
              <svg v-if="!exportingPDF" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div v-else class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              {{ exportingPDF ? 'Generando...' : 'Descargar PDF' }}
            </button>
            <button
              @click="closePreview"
              class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Content - Scrollable -->
        <div class="overflow-y-auto max-h-[calc(90vh-80px)] bg-gray-100 p-6">
          <!-- PDF Content -->
          <div ref="pdfContent" class="bg-white shadow-lg mx-auto" style="width: 210mm; min-height: 297mm; padding: 20mm;">
            <!-- Header -->
            <div class="border-b-2 border-gray-800 pb-4 mb-6">
              <div class="flex justify-between items-start">
                <div>
                  <h1 class="text-2xl font-bold text-gray-800">{{ companyData.name }}</h1>
                  <p class="text-sm text-gray-600">{{ companyData.legal_name }}</p>
                  <p class="text-sm text-gray-600">RTN: {{ companyData.rtn }}</p>
                  <p class="text-sm text-gray-600">{{ companyData.address }}</p>
                  <p class="text-sm text-gray-600">Tel: {{ companyData.phone }}</p>
                  <p class="text-sm text-gray-600">{{ companyData.email }}</p>
                </div>
                <div class="text-right">
                  <h2 class="text-xl font-bold text-gray-800">ESTADO DE CUENTA</h2>
                  <p class="text-sm text-gray-600 mt-2">Fecha de emisión:</p>
                  <p class="text-sm font-semibold">{{ formatDate(new Date()) }}</p>
                </div>
              </div>
            </div>

            <!-- Customer Info -->
            <div class="mb-6 bg-gray-50 p-4 rounded">
              <h3 class="font-bold text-gray-800 mb-3">INFORMACIÓN DEL CLIENTE</h3>
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p class="text-gray-600">Cliente:</p>
                  <p class="font-semibold">{{ customerData?.name }}</p>
                </div>
                <div>
                  <p class="text-gray-600">RTN:</p>
                  <p class="font-semibold">{{ customerData?.rtn || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Teléfono:</p>
                  <p class="font-semibold">{{ customerData?.phone || 'N/A' }}</p>
                </div>
                <div>
                  <p class="text-gray-600">Correo:</p>
                  <p class="font-semibold">{{ customerData?.email || 'N/A' }}</p>
                </div>
              </div>
            </div>

            <!-- Period Info -->
            <div class="mb-6 grid grid-cols-3 gap-4">
              <div class="bg-blue-50 p-3 rounded border border-blue-200">
                <p class="text-xs text-blue-600 mb-1">Límite de Crédito</p>
                <p class="text-lg font-bold text-blue-700">L {{ formatCurrency(customerData?.credit_limit || 0) }}</p>
              </div>
              <div class="bg-green-50 p-3 rounded border border-green-200">
                <p class="text-xs text-green-600 mb-1">Crédito Disponible</p>
                <p class="text-lg font-bold text-green-700">L {{ formatCurrency(availableCredit) }}</p>
              </div>
              <div class="bg-red-50 p-3 rounded border border-red-200">
                <p class="text-xs text-red-600 mb-1">Balance Actual</p>
                <p class="text-lg font-bold text-red-700">L {{ formatCurrency(customerData?.current_balance || 0) }}</p>
              </div>
            </div>

            <div class="mb-4 text-sm">
              <p><strong>Período:</strong> {{ formatDate(filters.start_date) }} - {{ formatDate(filters.end_date) }}</p>
            </div>

            <!-- Transactions Table -->
            <table class="w-full text-sm mb-6">
              <thead>
                <tr class="bg-gray-800 text-white">
                  <th class="py-2 px-3 text-left">Fecha</th>
                  <th class="py-2 px-3 text-left">Documento</th>
                  <th class="py-2 px-3 text-left">Descripción</th>
                  <th class="py-2 px-3 text-right">Cargos</th>
                  <th class="py-2 px-3 text-right">Abonos</th>
                  <th class="py-2 px-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="statementSummary.opening_balance > 0" class="border-b border-gray-200 bg-gray-50">
                  <td class="py-2 px-3">{{ formatDate(filters.start_date) }}</td>
                  <td class="py-2 px-3 font-semibold">Balance Inicial</td>
                  <td class="py-2 px-3 text-gray-600">Saldo anterior</td>
                  <td class="py-2 px-3 text-right">-</td>
                  <td class="py-2 px-3 text-right">-</td>
                  <td class="py-2 px-3 text-right font-semibold">L {{ formatCurrency(statementSummary.opening_balance) }}</td>
                </tr>
                <tr v-for="(transaction, index) in transactions" :key="index" class="border-b border-gray-200 hover:bg-gray-50">
                  <td class="py-2 px-3">{{ formatDate(transaction.date) }}</td>
                  <td class="py-2 px-3 font-medium">{{ transaction.reference }}</td>
                  <td class="py-2 px-3 text-gray-600">
                    <span v-if="transaction.type === 'sale'" class="inline-block px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded">Venta</span>
                    <span v-else class="inline-block px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">Pago</span>
                    {{ transaction.due_date ? ' - Vence: ' + formatDate(transaction.due_date) : '' }}
                  </td>
                  <td class="py-2 px-3 text-right font-semibold text-red-600">
                    {{ transaction.charge > 0 ? 'L ' + formatCurrency(transaction.charge) : '-' }}
                  </td>
                  <td class="py-2 px-3 text-right font-semibold text-green-600">
                    {{ transaction.payment > 0 ? 'L ' + formatCurrency(transaction.payment) : '-' }}
                  </td>
                  <td class="py-2 px-3 text-right font-semibold">
                    L {{ formatCurrency(Math.abs(transaction.balance)) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="bg-gray-100 font-bold">
                  <td colspan="3" class="py-3 px-3 text-right">TOTALES:</td>
                  <td class="py-3 px-3 text-right text-red-600">L {{ formatCurrency(totalCharges) }}</td>
                  <td class="py-3 px-3 text-right text-green-600">L {{ formatCurrency(totalPayments) }}</td>
                  <td class="py-3 px-3 text-right text-gray-900">L {{ formatCurrency(finalBalance) }}</td>
                </tr>
              </tfoot>
            </table>

            <!-- Summary -->
            <div class="border-t-2 border-gray-800 pt-4">
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p class="text-sm text-gray-600">Balance Inicial:</p>
                  <p class="text-xl font-bold">L {{ formatCurrency(statementSummary.opening_balance || 0) }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-600">Balance Final:</p>
                  <p class="text-xl font-bold" :class="finalBalance > 0 ? 'text-red-600' : 'text-green-600'">
                    L {{ formatCurrency(Math.abs(finalBalance)) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 text-center">
              <p>Este es un documento generado electrónicamente y no requiere firma</p>
              <p class="mt-1">{{ companyData.name }} - {{ companyData.phone }} - {{ companyData.email }}</p>
              <p class="mt-1">Generado el {{ formatDate(new Date()) }} a las {{ formatTime(new Date()) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCreditStore } from '@/stores/credit'
import { useCustomerStore } from '@/stores/customer'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue3-toastify'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import html2pdf from 'html2pdf.js'

const route = useRoute()
const router = useRouter()
const creditStore = useCreditStore()
const customerStore = useCustomerStore()
const authStore = useAuthStore()

const loading = ref(false)
const customerId = ref(route.params.customerId)
const showPreviewModal = ref(false)
const exportingPDF = ref(false)
const pdfContent = ref(null)

const filters = ref({
  start_date: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
  end_date: format(endOfMonth(new Date()), 'yyyy-MM-dd')
})

const customerData = computed(() => {
  return customerStore.customers.find(c => c.id == customerId.value) || null
})

const companyData = computed(() => ({
  name: authStore.currentUser?.company?.name || 'Mi Empresa',
  legal_name: authStore.currentUser?.company?.legal_name || 'Mi Empresa S.A. de C.V.',
  rtn: authStore.currentUser?.company?.rtn || '0000000000000',
  address: authStore.currentUser?.company?.address || 'Tegucigalpa, Honduras',
  city: authStore.currentUser?.company?.city || 'Tegucigalpa',
  phone: authStore.currentUser?.company?.phone || '+504 0000-0000',
  email: authStore.currentUser?.company?.email || 'info@empresa.hn'
}))

const statementData = computed(() => creditStore.customerStatement || {})
const statementSummary = computed(() => statementData.value.summary || {})
const transactions = computed(() => statementData.value.transactions || [])

const availableCredit = computed(() => {
  const limit = customerData.value?.credit_limit || 0
  const balance = customerData.value?.current_balance || 0
  return Math.max(0, limit - balance)
})

const totalCharges = computed(() => {
  return transactions.value
    .filter(t => t.type === 'sale')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const totalPayments = computed(() => {
  return transactions.value
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0)
})

const finalBalance = computed(() => {
  if (transactions.value.length === 0) return 0
  return transactions.value[transactions.value.length - 1].balance
})

onMounted(async () => {
  await loadCustomer()
  await loadStatement()
})

const loadCustomer = async () => {
  try {
    if (!customerData.value) {
      await customerStore.fetchCustomers()
    }
  } catch (error) {
    console.error('Error loading customer:', error)
  }
}

const loadStatement = async () => {
  loading.value = true
  try {
    await creditStore.fetchCustomerStatement({
      customer_id: customerId.value,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    })
  } catch (error) {
    toast.error('Error al cargar el estado de cuenta')
  } finally {
    loading.value = false
  }
}

const applyFilters = () => {
  loadStatement()
}

const setDateRange = (range) => {
  const today = new Date()

  if (range === 'thisMonth') {
    filters.value.start_date = format(startOfMonth(today), 'yyyy-MM-dd')
    filters.value.end_date = format(endOfMonth(today), 'yyyy-MM-dd')
  } else if (range === 'all') {
    filters.value.start_date = ''
    filters.value.end_date = ''
  }

  loadStatement()
}

const goBack = () => {
  router.go(-1)
}

const showPreview = () => {
  showPreviewModal.value = true
}

const closePreview = () => {
  showPreviewModal.value = false
}

const printStatement = () => {
  showPreview()
}

const printFromPreview = () => {
  const printWindow = window.open('', '_blank')
  const content = pdfContent.value.innerHTML

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Estado de Cuenta - ${customerData.value?.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: Arial, sans-serif; }
          @page { size: A4; margin: 0; }
          @media print {
            body { margin: 0; }
            .no-print { display: none !important; }
          }
        </style>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body>
        ${content}
      </body>
    </html>
  `)

  printWindow.document.close()
  setTimeout(() => {
    printWindow.print()
    printWindow.close()
  }, 250)
}

const exportPDF = () => {
  showPreview()
}

const exportPDFFromPreview = async () => {
  if (!pdfContent.value) {
    toast.error('No se puede generar el PDF')
    return
  }

  exportingPDF.value = true

  try {
    const opt = {
      margin: 0,
      filename: `estado-cuenta-${customerData.value?.name}-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    }

    await html2pdf().set(opt).from(pdfContent.value).save()
    toast.success('PDF generado exitosamente')
  } catch (error) {
    console.error('Error generating PDF:', error)
    toast.error('Error al generar el PDF')
  } finally {
    exportingPDF.value = false
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'dd/MM/yyyy')
}

const formatTime = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'HH:mm:ss')
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<style scoped>
.customer-statement-page {
  padding: 1.5rem;
}

@media print {
  .customer-statement-page {
    padding: 0;
  }

  button {
    display: none !important;
  }
}
</style>
