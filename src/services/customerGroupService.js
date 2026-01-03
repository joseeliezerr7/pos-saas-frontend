import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/customer-groups', { params })
  },

  getById(id) {
    return api.get(`/customer-groups/${id}`)
  },

  create(data) {
    return api.post('/customer-groups', data)
  },

  update(id, data) {
    return api.put(`/customer-groups/${id}`, data)
  },

  delete(id) {
    return api.delete(`/customer-groups/${id}`)
  },

  getStats() {
    return api.get('/customer-groups/stats')
  },

  calculateRFM() {
    return api.post('/customer-groups/calculate-rfm')
  },

  getPrices(id) {
    return api.get(`/customer-groups/${id}/prices`)
  },

  setPrice(id, data) {
    return api.post(`/customer-groups/${id}/prices`, data)
  },

  removePrice(id, priceId) {
    return api.delete(`/customer-groups/${id}/prices/${priceId}`)
  },

  assignCustomers(id, customerIds) {
    return api.post(`/customer-groups/${id}/assign-customers`, { customer_ids: customerIds })
  }
}
