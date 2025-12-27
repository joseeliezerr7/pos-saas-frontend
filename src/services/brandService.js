import api from './api'

export default {
  // Get all brands
  getAll(params = {}) {
    return api.get('/brands', { params })
  },

  // Get brand by ID
  getById(id) {
    return api.get(`/brands/${id}`)
  },

  // Create brand
  create(data) {
    return api.post('/brands', data)
  },

  // Update brand
  update(id, data) {
    return api.put(`/brands/${id}`, data)
  },

  // Delete brand
  delete(id) {
    return api.delete(`/brands/${id}`)
  }
}
