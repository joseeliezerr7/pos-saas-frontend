import { defineStore } from 'pinia'
import cashRegisterService from '../services/cashRegisterService'

export const useCashRegisterStore = defineStore('cashRegister', {
  state: () => ({
    cashRegisters: [],
    currentCashRegister: null,
    currentOpening: null,
    summary: null,
    loading: false,
    error: null
  }),

  getters: {
    isOpen: (state) => state.currentOpening !== null && state.currentOpening.is_open,

    expectedAmount: (state) => {
      if (!state.summary) return 0
      return state.summary.expected_amount || 0
    },

    totalSales: (state) => {
      if (!state.summary) return 0
      return state.summary.total_sales || 0
    }
  },

  actions: {
    async fetchCashRegisters(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.getAll(params)
        this.cashRegisters = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar cajas'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCashRegister(id) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.getById(id)
        this.currentCashRegister = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCashRegister(data) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.create(data)
        this.cashRegisters.push(response.data.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    async openCashRegister(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.open(id, data)
        this.currentOpening = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al abrir caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    async closeCashRegister(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.close(id, data)
        this.currentOpening = null
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cerrar caja'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentOpening(id) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.getCurrentOpening(id)
        // El backend devuelve el opening directamente en data
        this.currentOpening = response.data.data
        this.summary = response.data.data.stats
        console.log('Current opening fetched successfully:', this.currentOpening)
        return response.data
      } catch (error) {
        // Si no hay apertura activa, lanzar el error para que loadSummary lo maneje
        this.currentOpening = null
        this.summary = null
        if (error.response?.status === 404) {
          // No es un error crítico, solo no hay apertura
          console.log('No active opening found (404)')
        } else {
          this.error = error.response?.data?.message || 'Error al cargar apertura'
          console.error('Error fetching current opening:', error)
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async addTransaction(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.addTransaction(id, data)
        // Reload summary after transaction
        await this.fetchSummary(id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al registrar transacción'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchSummary(id) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.getSummary(id)
        this.summary = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar resumen'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchHistory(id, params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await cashRegisterService.getHistory(id, params)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar historial'
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
