import api from './api'

export default {
  login(credentials) {
    return api.post('/auth/login', credentials)
  },

  register(data) {
    return api.post('/auth/register', data)
  },

  logout() {
    return api.post('/auth/logout')
  },

  me() {
    return api.get('/auth/me')
  },

  refresh() {
    return api.post('/auth/refresh')
  },

  forgotPassword(email) {
    return api.post('/auth/forgot-password', { email })
  },

  resetPassword(data) {
    return api.post('/auth/reset-password', data)
  }
}
