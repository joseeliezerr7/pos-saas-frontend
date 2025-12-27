import api from './api'

export const unitService = {
  async getAll() {
    const response = await api.get('/units')
    return response.data
  },

  async create(data) {
    const response = await api.post('/units', data)
    return response.data
  },

  async update(id, data) {
    const response = await api.put(`/units/${id}`, data)
    return response.data
  },

  async delete(id) {
    const response = await api.delete(`/units/${id}`)
    return response.data
  }
}
