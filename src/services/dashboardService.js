import api from './api'

export default {
  getStats() {
    return api.get('/dashboard/stats')
  },

  getSalesChart() {
    return api.get('/dashboard/sales-chart')
  },

  getTopProducts() {
    return api.get('/dashboard/top-products')
  },

  getAlerts() {
    return api.get('/dashboard/alerts')
  }
}
