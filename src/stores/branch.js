import { defineStore } from 'pinia'
import branchService from '../services/branchService'

export const useBranchStore = defineStore('branch', {
  state: () => ({
    branches: [],
    currentBranch: null,
    loading: false,
    error: null
  }),

  getters: {
    mainBranch: (state) => state.branches.find(b => b.is_main),
    activeBranches: (state) => state.branches.filter(b => b.is_active)
  },

  actions: {
    async fetchBranches(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await branchService.getAllBranches(params)
        this.branches = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar sucursales'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchBranch(id) {
      this.loading = true
      this.error = null
      try {
        const response = await branchService.getBranch(id)
        this.currentBranch = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar sucursal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async createBranch(data) {
      this.loading = true
      this.error = null
      try {
        const response = await branchService.createBranch(data)
        this.branches.push(response.data.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear sucursal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateBranch(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await branchService.updateBranch(id, data)
        const index = this.branches.findIndex(b => b.id === id)
        if (index !== -1) {
          this.branches[index] = response.data.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar sucursal'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteBranch(id) {
      this.loading = true
      this.error = null
      try {
        const response = await branchService.deleteBranch(id)
        this.branches = this.branches.filter(b => b.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar sucursal'
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
