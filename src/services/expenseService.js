import api from './api'

export default {
  /**
   * Get all expenses
   */
  getAll(params = {}) {
    return api.get('/expenses', { params })
  },

  /**
   * Get a single expense
   */
  getById(id) {
    return api.get(`/expenses/${id}`)
  },

  /**
   * Create a new expense
   */
  create(data) {
    return api.post('/expenses', data)
  },

  /**
   * Update an expense
   */
  update(id, data) {
    return api.put(`/expenses/${id}`, data)
  },

  /**
   * Delete an expense
   */
  delete(id) {
    return api.delete(`/expenses/${id}`)
  },

  /**
   * Get expense categories
   */
  getCategories() {
    return api.get('/expenses/categories')
  },

  /**
   * Get payment methods
   */
  getPaymentMethods() {
    return api.get('/expenses/payment-methods')
  },

  /**
   * Get expense statistics
   */
  getStatistics(params = {}) {
    return api.get('/expenses/statistics', { params })
  }
}
