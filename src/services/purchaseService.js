import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/purchases', { params })
  },

  getById(id) {
    return api.get(`/purchases/${id}`)
  },

  create(data) {
    return api.post('/purchases', data)
  },

  update(id, data) {
    return api.put(`/purchases/${id}`, data)
  },

  delete(id) {
    return api.delete(`/purchases/${id}`)
  },

  receive(id, data) {
    return api.post(`/purchases/${id}/receive`, data)
  }
}
