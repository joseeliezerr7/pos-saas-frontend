import api from './api'

export default {
  // Get all stock
  getAll(params = {}) {
    return api.get('/stock', { params })
  },

  // Get stock by branch
  getByBranch(branchId) {
    return api.get(`/stock/branch/${branchId}`)
  },

  // Adjust stock
  adjust(data) {
    return api.post('/stock/adjust', data)
  },

  // Transfer stock
  transfer(data) {
    return api.post('/stock/transfer', data)
  },

  // Get movements
  getMovements(params = {}) {
    // Remove empty parameters
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null && value !== undefined)
    )
    return api.get('/stock/movements', { params: cleanParams })
  },

  // Get low stock products
  getLowStock(params = {}) {
    return api.get('/stock/low-stock', { params })
  }
}
