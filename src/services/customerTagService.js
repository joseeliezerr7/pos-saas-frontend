import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/customer-tags', { params })
  },

  getById(id) {
    return api.get(`/customer-tags/${id}`)
  },

  create(data) {
    return api.post('/customer-tags', data)
  },

  update(id, data) {
    return api.put(`/customer-tags/${id}`, data)
  },

  delete(id) {
    return api.delete(`/customer-tags/${id}`)
  },

  assignToCustomers(id, customerIds) {
    return api.post(`/customer-tags/${id}/assign`, { customer_ids: customerIds })
  },

  removeFromCustomers(id, customerIds) {
    return api.post(`/customer-tags/${id}/remove`, { customer_ids: customerIds })
  }
}
