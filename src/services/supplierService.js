import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/suppliers', { params })
  },

  getById(id) {
    return api.get(`/suppliers/${id}`)
  },

  create(data) {
    return api.post('/suppliers', data)
  },

  update(id, data) {
    return api.put(`/suppliers/${id}`, data)
  },

  delete(id) {
    return api.delete(`/suppliers/${id}`)
  }
}
