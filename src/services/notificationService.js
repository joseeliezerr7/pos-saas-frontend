import api from './api'

export default {
  getAll() {
    return api.get('/notifications')
  },

  markAsRead(id) {
    return api.post(`/notifications/${id}/read`)
  },

  markAllAsRead() {
    return api.post('/notifications/read-all')
  }
}
