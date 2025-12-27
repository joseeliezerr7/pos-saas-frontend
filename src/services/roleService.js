import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/roles', { params })
  },

  getById(id) {
    return api.get(`/roles/${id}`)
  },

  create(data) {
    return api.post('/roles', data)
  },

  update(id, data) {
    return api.put(`/roles/${id}`, data)
  },

  delete(id) {
    return api.delete(`/roles/${id}`)
  },

  getAllPermissions() {
    return api.get('/permissions/grouped')
  }
}
