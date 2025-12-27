import { defineStore } from 'pinia'
import settingsService from '../services/settingsService'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    companySettings: null,
    cais: [],
    activeCAI: null,
    loading: false,
    error: null
  }),

  getters: {
    hasActiveCAI: (state) => state.activeCAI !== null,

    activeFACTURACAI: (state) => {
      return state.cais.find(cai =>
        cai.document_type === 'FACTURA' &&
        cai.status === 'active' &&
        new Date(cai.expiration_date) >= new Date()
      )
    }
  },

  actions: {
    async fetchCompanySettings() {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.getCompanySettings()
        this.companySettings = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar configuración'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCompanySettings(data) {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.updateCompanySettings(data)
        this.companySettings = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar configuración'
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadLogo(file) {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.uploadCompanyLogo(file)
        if (this.companySettings) {
          this.companySettings.logo = response.data.data.logo
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al subir logo'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteLogo() {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.deleteCompanyLogo()
        if (this.companySettings) {
          this.companySettings.logo = null
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar logo'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchCAIs(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.getAllCAIs(params)
        this.cais = response.data.data
        return response.data.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al cargar CAIs'
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchActiveCAI(branchId = null, documentType = 'FACTURA') {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.getActiveCAI(branchId, documentType)
        this.activeCAI = response.data.data
        return response.data.data
      } catch (error) {
        this.activeCAI = null
        if (error.response?.status !== 404) {
          this.error = error.response?.data?.message || 'Error al cargar CAI activo'
        }
        throw error
      } finally {
        this.loading = false
      }
    },

    async createCAI(data) {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.createCAI(data)
        this.cais.unshift(response.data.data)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al crear CAI'
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateCAI(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.updateCAI(id, data)
        const index = this.cais.findIndex(cai => cai.id === id)
        if (index !== -1) {
          this.cais[index] = response.data.data
        }
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al actualizar CAI'
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteCAI(id) {
      this.loading = true
      this.error = null
      try {
        const response = await settingsService.deleteCAI(id)
        this.cais = this.cais.filter(cai => cai.id !== id)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al eliminar CAI'
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
