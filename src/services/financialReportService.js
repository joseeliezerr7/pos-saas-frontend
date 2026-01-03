import api from './api'

export default {
  /**
   * Obtener Estado de Resultados (P&L)
   */
  getProfitAndLoss(params = {}) {
    return api.post('/financial-reports/profit-loss', params)
  },

  /**
   * Obtener Balance General
   */
  getBalanceSheet(params = {}) {
    return api.post('/financial-reports/balance-sheet', params)
  },

  /**
   * Obtener Flujo de Caja
   */
  getCashFlow(params = {}) {
    return api.post('/financial-reports/cash-flow', params)
  },

  /**
   * Obtener Rentabilidad por Producto
   */
  getProductProfitability(params = {}) {
    return api.post('/financial-reports/product-profitability', params)
  },

  /**
   * Obtener Rentabilidad por Categoría
   */
  getCategoryProfitability(params = {}) {
    return api.post('/financial-reports/category-profitability', params)
  },

  /**
   * Obtener Rentabilidad por Sucursal
   */
  getBranchProfitability(params = {}) {
    return api.post('/financial-reports/branch-profitability', params)
  },

  /**
   * Obtener Comparativo Mensual
   */
  getMonthlyComparison(params = {}) {
    return api.post('/financial-reports/monthly-comparison', params)
  },

  /**
   * Obtener Reporte Completo
   */
  getComprehensiveReport(params = {}) {
    return api.post('/financial-reports/comprehensive', params)
  }
}
