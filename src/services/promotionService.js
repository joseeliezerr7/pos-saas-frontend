import api from './api'

export default {
  getAll(params = {}) {
    return api.get('/promotions', { params })
  },

  getById(id) {
    return api.get(`/promotions/${id}`)
  },

  create(data) {
    return api.post('/promotions', data)
  },

  update(id, data) {
    return api.put(`/promotions/${id}`, data)
  },

  delete(id) {
    return api.delete(`/promotions/${id}`)
  },

  toggleActive(id) {
    return api.post(`/promotions/${id}/toggle-active`)
  },

  getStats(id) {
    return api.get(`/promotions/${id}/stats`)
  },

  validateCoupon(code, branchId, customerId = null) {
    return api.post('/promotions/validate-coupon', {
      code,
      branch_id: branchId,
      customer_id: customerId
    })
  },

  getApplicablePromotions(cartItems, branchId, customerId = null) {
    return api.post('/promotions/get-applicable', {
      cart_items: cartItems,
      branch_id: branchId,
      customer_id: customerId
    })
  },

  applyPromotion(promotionId, cartItems) {
    return api.post('/promotions/apply', {
      promotion_id: promotionId,
      cart_items: cartItems
    })
  }
}
