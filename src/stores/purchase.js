import { defineStore } from 'pinia'
import { ref } from 'vue'
import purchaseService from '@/services/purchaseService'
import { toast } from 'vue3-toastify'

export const usePurchaseStore = defineStore('purchase', () => {
  const purchases = ref([])
  const currentPurchase = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchPurchases(params = {}) {
    loading.value = true
    try {
      const response = await purchaseService.getAll(params)
      const data = response.data.data

      purchases.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar compras')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchPurchaseById(id) {
    loading.value = true
    try {
      const response = await purchaseService.getById(id)
      currentPurchase.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar compra')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createPurchase(data) {
    loading.value = true
    try {
      const response = await purchaseService.create(data)
      toast.success(response.data.message || 'Compra creada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear compra'
      const errors = error.response?.data?.errors

      if (errors) {
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(message)
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updatePurchase(id, data) {
    loading.value = true
    try {
      const response = await purchaseService.update(id, data)
      toast.success(response.data.message || 'Compra actualizada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar compra'
      const errors = error.response?.data?.errors

      if (errors) {
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(message)
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deletePurchase(id) {
    loading.value = true
    try {
      const response = await purchaseService.delete(id)
      toast.success(response.data.message || 'Compra eliminada exitosamente')
      await fetchPurchases()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar compra'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function receivePurchase(id, data) {
    loading.value = true
    try {
      const response = await purchaseService.receive(id, data)
      toast.success(response.data.message || 'Compra recibida exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al recibir compra'
      const errors = error.response?.data?.errors

      if (errors) {
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(message)
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    purchases,
    currentPurchase,
    loading,
    pagination,
    fetchPurchases,
    fetchPurchaseById,
    createPurchase,
    updatePurchase,
    deletePurchase,
    receivePurchase
  }
})
