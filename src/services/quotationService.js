import api from './api'

export default {
  // Get all quotations
  getAll(params = {}) {
    return api.get('/quotations', { params })
  },

  // Get quotation by ID
  getById(id) {
    return api.get(`/quotations/${id}`)
  },

  // Create new quotation
  create(data) {
    return api.post('/quotations', data)
  },

  // Update quotation
  update(id, data) {
    return api.put(`/quotations/${id}`, data)
  },

  // Delete quotation
  delete(id) {
    return api.delete(`/quotations/${id}`)
  },

  // Convert quotation to sale
  convertToSale(id, data) {
    return api.post(`/quotations/${id}/convert`, data)
  }
}
