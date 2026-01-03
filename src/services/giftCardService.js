import api from './api'

export default {
  // Get all gift cards
  getAll(params = {}) {
    return api.get('/gift-cards', { params })
  },

  // Create a new gift card
  create(data) {
    return api.post('/gift-cards', data)
  },

  // Get gift card details
  get(id) {
    return api.get(`/gift-cards/${id}`)
  },

  // Check balance by code
  checkBalance(code) {
    return api.post('/gift-cards/check-balance', { code })
  },

  // Redeem gift card
  redeem(data) {
    return api.post('/gift-cards/redeem', data)
  },

  // Add balance to gift card
  addBalance(id, data) {
    return api.post(`/gift-cards/${id}/add-balance`, data)
  },

  // Void a gift card
  void(id, reason) {
    return api.post(`/gift-cards/${id}/void`, { reason })
  },

  // Get statistics
  getStatistics(params = {}) {
    return api.get('/gift-cards/statistics', { params })
  },

  // Expire old gift cards
  expireCards() {
    return api.post('/gift-cards/expire')
  }
}
