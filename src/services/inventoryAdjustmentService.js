import api from './api'

export default {
  // Get all inventory adjustments
  getAll(params = {}) {
    return api.get('/inventory-adjustments', { params })
  },

  // Get inventory adjustment by ID
  getById(id) {
    return api.get(`/inventory-adjustments/${id}`)
  },

  // Create inventory adjustment
  create(data) {
    return api.post('/inventory-adjustments', data)
  },

  // Approve inventory adjustment
  approve(id) {
    return api.post(`/inventory-adjustments/${id}/approve`)
  },

  // Reject inventory adjustment
  reject(id) {
    return api.post(`/inventory-adjustments/${id}/reject`)
  },

  // Delete inventory adjustment
  delete(id) {
    return api.delete(`/inventory-adjustments/${id}`)
  }
}
