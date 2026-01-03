import { defineStore } from 'pinia'
import { ref } from 'vue'
import promotionService from '@/services/promotionService'
import { toast } from 'vue3-toastify'

export const usePromotionStore = defineStore('promotion', () => {
  const promotions = ref([])
  const currentPromotion = ref(null)
  const applicablePromotions = ref([])
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  })

  async function fetchPromotions(params = {}) {
    loading.value = true
    try {
      const response = await promotionService.getAll(params)
      promotions.value = response.data.data
      pagination.value = {
        current_page: response.data.current_page,
        per_page: response.data.per_page,
        total: response.data.total,
        last_page: response.data.last_page
      }
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar promociones')
    } finally {
      loading.value = false
    }
  }

  async function fetchPromotionById(id) {
    loading.value = true
    try {
      const response = await promotionService.getById(id)
      currentPromotion.value = response.data.data
      return currentPromotion.value
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la promoción')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createPromotion(promotionData) {
    loading.value = true
    try {
      const response = await promotionService.create(promotionData)
      toast.success('Promoción creada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear la promoción'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updatePromotion(id, promotionData) {
    loading.value = true
    try {
      const response = await promotionService.update(id, promotionData)
      toast.success('Promoción actualizada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar la promoción'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deletePromotion(id) {
    loading.value = true
    try {
      await promotionService.delete(id)
      toast.success('Promoción eliminada exitosamente')
      // Remover de la lista
      promotions.value = promotions.value.filter(p => p.id !== id)
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar la promoción'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function toggleActivePromotion(id) {
    try {
      const response = await promotionService.toggleActive(id)
      toast.success(response.data.message)

      // Actualizar en la lista
      const index = promotions.value.findIndex(p => p.id === id)
      if (index !== -1) {
        promotions.value[index].is_active = response.data.data.is_active
      }

      // Recargar la lista para reflejar cambios
      await fetchPromotions({
        page: pagination.value.current_page,
        per_page: pagination.value.per_page
      })

      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar el estado'
      toast.error(message)
      throw error
    }
  }

  async function toggleActive(id) {
    return toggleActivePromotion(id)
  }

  async function getPromotionStats(id) {
    loading.value = true
    try {
      const response = await promotionService.getStats(id)
      return response.data.data
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar estadísticas')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function getStats(id) {
    return getPromotionStats(id)
  }

  async function validateCoupon(code, branchId, customerId = null) {
    try {
      const response = await promotionService.validateCoupon(code, branchId, customerId)
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Cupón inválido'
      toast.error(message)
      throw error
    }
  }

  async function getApplicablePromotions(cartItems, branchId, customerId = null) {
    try {
      const response = await promotionService.getApplicablePromotions(cartItems, branchId, customerId)
      applicablePromotions.value = response.data.data
      return response.data.data
    } catch (error) {
      console.error(error)
      toast.error('Error al obtener promociones aplicables')
      throw error
    }
  }

  async function applyPromotion(promotionId, cartItems) {
    try {
      const response = await promotionService.applyPromotion(promotionId, cartItems)
      // Toast message is handled in the POS component
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al aplicar promoción'
      toast.error(message)
      throw error
    }
  }

  function clearCurrentPromotion() {
    currentPromotion.value = null
  }

  return {
    promotions,
    currentPromotion,
    applicablePromotions,
    loading,
    pagination,
    fetchPromotions,
    fetchPromotionById,
    createPromotion,
    updatePromotion,
    deletePromotion,
    toggleActive,
    toggleActivePromotion,
    getStats,
    getPromotionStats,
    validateCoupon,
    getApplicablePromotions,
    applyPromotion,
    clearCurrentPromotion
  }
})
