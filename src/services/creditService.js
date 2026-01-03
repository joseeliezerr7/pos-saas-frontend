import api from './api'

export default {
  // Customer Payments
  getPayments(params = {}) {
    return api.get('/credit/payments', { params })
  },

  getPaymentById(id) {
    return api.get(`/credit/payments/${id}`)
  },

  createPayment(data) {
    return api.post('/credit/payments', data)
  },

  downloadReceipt(id) {
    return api.get(`/credit/payments/${id}/receipt`, {
      responseType: 'blob'
    })
  },

  // Credit Sales
  getCreditSales(params = {}) {
    return api.get('/credit/sales', { params })
  },

  getCreditSaleById(id) {
    return api.get(`/credit/sales/${id}`)
  },

  getCustomerPendingSales(customerId) {
    return api.get(`/credit/customers/${customerId}/pending`)
  },

  // Reports
  getCustomerStatement(data) {
    return api.post('/credit/reports/statement', data)
  },

  getAgingReport(params = {}) {
    return api.get('/credit/reports/aging', { params })
  },

  getDashboard() {
    return api.get('/credit/reports/dashboard')
  }
}
