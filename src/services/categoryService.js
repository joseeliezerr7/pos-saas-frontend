import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/categories', { params })
  },

  getTree() {
    return api.get('/categories/tree')
  },

  getById(id) {
    return api.get(`/categories/${id}`)
  },

  create(data) {
    return api.post('/categories', data)
  },

  update(id, data) {
    return api.put(`/categories/${id}`, data)
  },

  delete(id) {
    return api.delete(`/categories/${id}`)
  }
}
