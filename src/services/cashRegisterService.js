import api from './api'

export default {
  // Get all cash registers
  getAll(params = {}) {
    return api.get('/cash-registers', { params })
  },

  // Get single cash register
  getById(id) {
    return api.get(`/cash-registers/${id}`)
  },

  // Create cash register
  create(data) {
    return api.post('/cash-registers', data)
  },

  // Update cash register
  update(id, data) {
    return api.put(`/cash-registers/${id}`, data)
  },

  // Delete cash register
  delete(id) {
    return api.delete(`/cash-registers/${id}`)
  },

  // Open cash register
  open(id, data) {
    return api.post(`/cash-registers/${id}/open`, data)
  },

  // Close cash register
  close(id, data) {
    return api.post(`/cash-registers/${id}/close`, data)
  },

  // Get current opening
  getCurrentOpening(id) {
    return api.get(`/cash-registers/${id}/current`)
  },

  // Add transaction
  addTransaction(id, data) {
    return api.post(`/cash-registers/${id}/transaction`, data)
  },

  // Get summary
  getSummary(id) {
    return api.get(`/cash-registers/${id}/summary`)
  },

  // Get history (openings and closings)
  getHistory(id, params = {}) {
    return api.get(`/cash-registers/${id}/history`, { params })
  },

  // Get reports
  getReports(params = {}) {
    return api.get('/cash-registers/reports', { params })
  }
}
