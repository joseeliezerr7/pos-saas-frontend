import api from './api'

export default {
  // Program management
  getProgram() {
    return api.get('/loyalty/program')
  },

  saveProgram(data) {
    return api.post('/loyalty/program', data)
  },

  // Tier management
  getTiers() {
    return api.get('/loyalty/tiers')
  },

  createTier(data) {
    return api.post('/loyalty/tiers', data)
  },

  updateTier(id, data) {
    return api.put(`/loyalty/tiers/${id}`, data)
  },

  deleteTier(id) {
    return api.delete(`/loyalty/tiers/${id}`)
  },

  // Customer loyalty
  getCustomerSummary(customerId) {
    return api.get(`/loyalty/customers/${customerId}/summary`)
  },

  enrollCustomer(customerId) {
    return api.post(`/loyalty/customers/${customerId}/enroll`)
  },

  getCustomerTransactions(customerId, params = {}) {
    return api.get(`/loyalty/customers/${customerId}/transactions`, { params })
  },

  // Points operations
  redeemPoints(data) {
    return api.post('/loyalty/redeem', data)
  },

  adjustPoints(data) {
    return api.post('/loyalty/adjust', data)
  }
}
