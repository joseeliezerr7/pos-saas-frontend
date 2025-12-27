import { defineStore } from 'pinia'
import { ref } from 'vue'
import quotationService from '@/services/quotationService'
import { toast } from 'vue3-toastify'

export const useQuotationStore = defineStore('quotation', () => {
  const quotations = ref([])
  const currentQuotation = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  })

  async function fetchQuotations(params = {}) {
    loading.value = true
    try {
      const response = await quotationService.getAll(params)
      quotations.value = response.data.data
      pagination.value = response.data.meta
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar cotizaciones')
    } finally {
      loading.value = false
    }
  }

  async function fetchQuotationById(id) {
    loading.value = true
    try {
      const response = await quotationService.getById(id)
      currentQuotation.value = response.data.data
      return currentQuotation.value
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la cotización')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createQuotation(quotationData) {
    loading.value = true
    try {
      const response = await quotationService.create(quotationData)
      toast.success('Cotización creada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al crear la cotización'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateQuotation(id, quotationData) {
    loading.value = true
    try {
      const response = await quotationService.update(id, quotationData)
      toast.success('Cotización actualizada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al actualizar la cotización'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteQuotation(id) {
    loading.value = true
    try {
      await quotationService.delete(id)
      toast.success('Cotización eliminada exitosamente')
      await fetchQuotations()
      return true
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al eliminar la cotización'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function convertToSale(id, paymentData) {
    loading.value = true
    try {
      const response = await quotationService.convertToSale(id, paymentData)
      toast.success('Cotización convertida a venta exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al convertir la cotización'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    quotations,
    currentQuotation,
    loading,
    pagination,
    fetchQuotations,
    fetchQuotationById,
    createQuotation,
    updateQuotation,
    deleteQuotation,
    convertToSale
  }
})
