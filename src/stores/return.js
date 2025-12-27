import { defineStore } from 'pinia'
import { ref } from 'vue'
import returnService from '@/services/returnService'
import { toast } from 'vue3-toastify'

export const useReturnStore = defineStore('return', () => {
  const returns = ref([])
  const currentReturn = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  })

  async function fetchReturns(params = {}) {
    loading.value = true
    try {
      const response = await returnService.getAll(params)
      returns.value = response.data.data
      pagination.value = response.data.meta
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar devoluciones')
    } finally {
      loading.value = false
    }
  }

  async function fetchReturnById(id) {
    loading.value = true
    try {
      const response = await returnService.getById(id)
      currentReturn.value = response.data.data
      return currentReturn.value
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la devolución')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createReturn(returnData) {
    loading.value = true
    try {
      const response = await returnService.create(returnData)
      toast.success('Devolución creada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al crear la devolución'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function completeReturn(id) {
    loading.value = true
    try {
      const response = await returnService.complete(id)
      toast.success('Devolución procesada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al procesar la devolución'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function cancelReturn(id, reason) {
    loading.value = true
    try {
      const response = await returnService.cancel(id, { reason })
      toast.success('Devolución cancelada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al cancelar la devolución'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    returns,
    currentReturn,
    loading,
    pagination,
    fetchReturns,
    fetchReturnById,
    createReturn,
    completeReturn,
    cancelReturn
  }
})
