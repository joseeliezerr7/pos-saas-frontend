import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/customers', { params })
  },

  search(query) {
    return api.get('/customers/search', { params: { q: query } })
  },

  getById(id) {
    return api.get(`/customers/${id}`)
  },

  create(data) {
    return api.post('/customers', data)
  },

  update(id, data) {
    return api.put(`/customers/${id}`, data)
  },

  delete(id) {
    return api.delete(`/customers/${id}`)
  }
}
