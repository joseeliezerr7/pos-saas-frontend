import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/sales', { params })
  },

  getById(id) {
    return api.get(`/sales/${id}`)
  },

  create(data) {
    return api.post('/sales', data)
  },

  void(id, data) {
    return api.post(`/sales/${id}/void`, data)
  },

  getStatistics(params = {}) {
    return api.get('/sales/statistics', { params })
  }
}
