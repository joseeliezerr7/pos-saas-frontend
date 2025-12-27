import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/returns', { params })
  },

  getById(id) {
    return api.get(`/returns/${id}`)
  },

  create(data) {
    return api.post('/returns', data)
  },

  complete(id) {
    return api.post(`/returns/${id}/complete`)
  },

  cancel(id, data) {
    return api.post(`/returns/${id}/cancel`, data)
  }
}
