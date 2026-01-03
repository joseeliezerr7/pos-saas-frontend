import { defineStore } from 'pinia'
import financialReportService from '@/services/financialReportService'

export const useFinancialReportStore = defineStore('financialReport', {
  state: () => ({
    profitAndLoss: null,
    balanceSheet: null,
    cashFlow: null,
    productProfitability: [],
    categoryProfitability: [],
    branchProfitability: [],
    monthlyComparison: [],
    comprehensiveReport: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchProfitAndLoss(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getProfitAndLoss(params)
        this.profitAndLoss = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar el estado de resultados'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchBalanceSheet(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getBalanceSheet(params)
        this.balanceSheet = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar el balance general'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCashFlow(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getCashFlow(params)
        this.cashFlow = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar el flujo de caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchProductProfitability(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getProductProfitability(params)
        this.productProfitability = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar rentabilidad por producto'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCategoryProfitability(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getCategoryProfitability(params)
        this.categoryProfitability = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar rentabilidad por categoría'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchBranchProfitability(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getBranchProfitability(params)
        this.branchProfitability = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar rentabilidad por sucursal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMonthlyComparison(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getMonthlyComparison(params)
        this.monthlyComparison = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar comparativo mensual'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchComprehensiveReport(params) {
      this.loading = true
      this.error = null
      try {
        const response = await financialReportService.getComprehensiveReport(params)
        this.comprehensiveReport = response.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar reporte completo'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
