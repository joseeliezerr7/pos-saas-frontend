import { defineStore } from 'pinia'
import reportService from '../services/reportService'
import { toast } from 'vue3-toastify'

export const useReportStore = defineStore('report', {
  state: () => ({
    // Sales Report
    salesData: null,
    salesSummary: null,
    salesGroupedData: null,
    salesPaymentMethods: null,
    salesTopProducts: null,

    // Inventory Report
    inventoryData: null,
    inventorySummary: null,
    inventoryProducts: null,
    inventoryMovements: null,

    // Financial Report
    financialData: null,
    financialSummary: null,
    financialDailyData: null,

    // SAR Reports
    sarMonthlyData: null,
    sarDEIData: null,

    // UI State
    loading: false,
    error: null,
    currentReportType: null,
    currentFilters: null
  }),

  getters: {
    isLoading: (state) => state.loading,
    hasError: (state) => state.error !== null,
    hasSalesData: (state) => state.salesData !== null,
    hasInventoryData: (state) => state.inventoryData !== null,
    hasFinancialData: (state) => state.financialData !== null
  },

  actions: {
    /**
     * Fetch sales report
     */
    async fetchSalesReport(filters) {
      this.loading = true
      this.error = null
      this.currentReportType = 'sales'
      this.currentFilters = filters

      try {
        // Clean empty filters
        const cleanFilters = {}
        Object.keys(filters).forEach(key => {
          if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
            cleanFilters[key] = filters[key]
          }
        })

        const response = await reportService.getSalesReport(cleanFilters)

        if (response.data.success) {
          this.salesData = response.data.data
          this.salesSummary = response.data.data.summary
          this.salesGroupedData = response.data.data.grouped_data
          this.salesPaymentMethods = response.data.data.payment_methods
          this.salesTopProducts = response.data.data.top_products

          toast.success('Reporte de ventas generado exitosamente')
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.error?.message || 'Error al generar reporte de ventas'
        toast.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch inventory report
     */
    async fetchInventoryReport(filters) {
      this.loading = true
      this.error = null
      this.currentReportType = 'inventory'
      this.currentFilters = filters

      try {
        const response = await reportService.getInventoryReport(filters)

        if (response.data.success) {
          this.inventoryData = response.data.data
          this.inventorySummary = response.data.data.summary
          this.inventoryProducts = response.data.data.products
          this.inventoryMovements = response.data.data.movements

          toast.success('Reporte de inventario generado exitosamente')
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.error?.message || 'Error al generar reporte de inventario'
        toast.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch financial report
     */
    async fetchFinancialReport(filters) {
      this.loading = true
      this.error = null
      this.currentReportType = 'financial'
      this.currentFilters = filters

      try {
        const response = await reportService.getFinancialReport(filters)

        if (response.data.success) {
          this.financialData = response.data.data
          this.financialSummary = response.data.data.summary
          this.financialDailyData = response.data.data.daily_data

          toast.success('Reporte financiero generado exitosamente')
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.error?.message || 'Error al generar reporte financiero'
        toast.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch SAR monthly report
     */
    async fetchSARMonthlyReport(filters) {
      this.loading = true
      this.error = null
      this.currentReportType = 'sar_monthly'
      this.currentFilters = filters

      try {
        const response = await reportService.getSARMonthlyReport(filters)

        if (response.data.success) {
          this.sarMonthlyData = response.data.data
          toast.success('Reporte SAR mensual generado exitosamente')
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.error?.message || 'Error al generar reporte SAR mensual'
        toast.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch SAR DEI report
     */
    async fetchSARDEIReport(filters) {
      this.loading = true
      this.error = null
      this.currentReportType = 'sar_dei'
      this.currentFilters = filters

      try {
        const response = await reportService.getSARDEIReport(filters)

        if (response.data.success) {
          this.sarDEIData = response.data.data
          toast.success('Reporte SAR DEI generado exitosamente')
          return response.data.data
        }
      } catch (error) {
        this.error = error.response?.data?.error?.message || 'Error al generar reporte SAR DEI'
        toast.error(this.error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Export current report as PDF
     */
    async exportAsPDF() {
      if (!this.currentReportType || !this.currentFilters) {
        toast.error('No hay reporte para exportar')
        return
      }

      try {
        toast.info('Exportando reporte a PDF...')
        await reportService.exportPDF(this.currentReportType, this.currentFilters)
        toast.success('Reporte exportado exitosamente')
      } catch (error) {
        toast.error('Error al exportar reporte')
      }
    },

    /**
     * Export current report as Excel
     */
    async exportAsExcel() {
      if (!this.currentReportType || !this.currentFilters) {
        toast.error('No hay reporte para exportar')
        return
      }

      try {
        toast.info('Exportando reporte a Excel...')
        await reportService.exportExcel(this.currentReportType, this.currentFilters)
        toast.success('Reporte exportado exitosamente')
      } catch (error) {
        toast.error('Error al exportar reporte')
      }
    },

    /**
     * Clear all report data
     */
    clearReports() {
      this.salesData = null
      this.salesSummary = null
      this.salesGroupedData = null
      this.salesPaymentMethods = null
      this.salesTopProducts = null
      this.inventoryData = null
      this.inventorySummary = null
      this.inventoryProducts = null
      this.inventoryMovements = null
      this.financialData = null
      this.financialSummary = null
      this.financialDailyData = null
      this.sarMonthlyData = null
      this.sarDEIData = null
      this.currentReportType = null
      this.currentFilters = null
      this.error = null
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    }
  }
})
