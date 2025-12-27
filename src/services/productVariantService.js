import api from './api'

export default {
  /**
   * Get all variants for a product
   */
  getAll(productId, params = {}) {
    return api.get(`/products/${productId}/variants`, { params })
  },

  /**
   * Get a single variant
   */
  getById(productId, variantId) {
    return api.get(`/products/${productId}/variants/${variantId}`)
  },

  /**
   * Create a new variant
   */
  create(productId, data) {
    return api.post(`/products/${productId}/variants`, data)
  },

  /**
   * Update a variant
   */
  update(productId, variantId, data) {
    return api.put(`/products/${productId}/variants/${variantId}`, data)
  },

  /**
   * Delete a variant
   */
  delete(productId, variantId) {
    return api.delete(`/products/${productId}/variants/${variantId}`)
  }
}
