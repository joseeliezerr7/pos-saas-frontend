import { defineStore } from 'pinia'
import stockService from '../services/stockService'

export const useStockStore = defineStore('stock', {
  state: () => ({
    stocks: [],
    movements: [],
    lowStockProducts: [],
    loading: false,
    error: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 20,
      total: 0
    }
  }),

  getters: {
    hasLowStock: (state) => state.lowStockProducts.length > 0,

    outOfStockCount: (state) => {
      return state.lowStockProducts.filter(p => p.status === 'out_of_stock').length
    },

    lowStockCount: (state) => {
      return state.lowStockProducts.filter(p => p.status === 'low_stock').length
    },

    stockByBranch: (state) => state.stocks
  },

  actions: {
    async fetchStock(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await stockService.getAll(params)
        this.stocks = response.data.data
        this.pagination = response.data.meta || this.pagination
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar inventario'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchStockByBranch(branchId) {
      this.loading = true
      this.error = null
      try {
        const response = await stockService.getByBranch(branchId)
        this.stocks = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar stock'
        throw error
      } finally {
        this.loading = false
      }
    },

    async adjustStock(data) {
      this.loading = true
      this.error = null
      try {
        const response = await stockService.adjust(data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al ajustar stock'
        throw error
      } finally {
        this.loading = false
      }
    },

    async transferStock(data) {
      this.loading = true
      this.error = null
      try {
        const response = await stockService.transfer(data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error en transferencia'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchMovements(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await stockService.getMovements(params)
        this.movements = response.data.data
        this.pagination = response.data.meta || this.pagination
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar movimientos'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchLowStock(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await stockService.getLowStock(params)
        this.lowStockProducts = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar productos'
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
