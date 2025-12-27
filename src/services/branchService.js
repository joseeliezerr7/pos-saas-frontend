import api from './api'

export default {
  getAllBranches(params = {}) {
    return api.get('/branches', { params })
  },

  getBranch(id) {
    return api.get(`/branches/${id}`)
  },

  createBranch(data) {
    return api.post('/branches', data)
  },

  updateBranch(id, data) {
    return api.put(`/branches/${id}`, data)
  },

  deleteBranch(id) {
    return api.delete(`/branches/${id}`)
  }
}
