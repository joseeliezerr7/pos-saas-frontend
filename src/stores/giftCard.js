import { defineStore } from 'pinia'
import { ref } from 'vue'
import giftCardService from '@/services/giftCardService'
import { toast } from 'vue3-toastify'

export const useGiftCardStore = defineStore('giftCard', () => {
  const giftCards = ref([])
  const currentGiftCard = ref(null)
  const statistics = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  })

  // Fetch all gift cards
  async function fetchGiftCards(params = {}) {
    loading.value = true
    try {
      const response = await giftCardService.getAll(params)
      if (response.data) {
        giftCards.value = response.data.data || []

        // Update pagination
        if (response.data.current_page) {
          pagination.value = {
            current_page: response.data.current_page,
            per_page: response.data.per_page,
            total: response.data.total,
            last_page: response.data.last_page
          }
        }

        return response.data
      }
    } catch (error) {
      console.error('Error fetching gift cards:', error)
      toast.error('Error al cargar gift cards')
      giftCards.value = []
    } finally {
      loading.value = false
    }
  }

  // Create a new gift card
  async function createGiftCard(data) {
    loading.value = true
    try {
      const response = await giftCardService.create(data)
      if (response.data.success) {
        toast.success(response.data.message || 'Gift card creada exitosamente')
        await fetchGiftCards()
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear gift card'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Get gift card details
  async function getGiftCard(id) {
    loading.value = true
    try {
      const response = await giftCardService.get(id)
      if (response.data.success) {
        currentGiftCard.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching gift card:', error)
      toast.error('Error al cargar gift card')
      throw error
    } finally {
      loading.value = false
    }
  }

  // Check balance by code
  async function checkBalance(code) {
    loading.value = true
    try {
      const response = await giftCardService.checkBalance(code)
      if (response.data.success) {
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al verificar balance'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Redeem gift card
  async function redeemGiftCard(data) {
    loading.value = true
    try {
      const response = await giftCardService.redeem(data)
      if (response.data.success) {
        toast.success(response.data.message || 'Gift card canjeada exitosamente')
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al canjear gift card'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Add balance to gift card
  async function addBalance(id, amount, description = null) {
    loading.value = true
    try {
      const response = await giftCardService.addBalance(id, { amount, description })
      if (response.data.success) {
        toast.success(response.data.message || 'Balance agregado exitosamente')
        await fetchGiftCards()
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al agregar balance'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Void a gift card
  async function voidGiftCard(id, reason) {
    loading.value = true
    try {
      const response = await giftCardService.void(id, reason)
      if (response.data.success) {
        toast.success(response.data.message || 'Gift card anulada exitosamente')
        await fetchGiftCards()
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al anular gift card'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Get statistics
  async function fetchStatistics(params = {}) {
    loading.value = true
    try {
      const response = await giftCardService.getStatistics(params)
      if (response.data.success) {
        statistics.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      console.error('Error fetching statistics:', error)
      toast.error('Error al cargar estadísticas')
      statistics.value = null
    } finally {
      loading.value = false
    }
  }

  // Expire old gift cards
  async function expireCards() {
    loading.value = true
    try {
      const response = await giftCardService.expireCards()
      if (response.data.success) {
        toast.success(response.data.message)
        await fetchGiftCards()
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al expirar gift cards'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    giftCards,
    currentGiftCard,
    statistics,
    loading,
    pagination,

    // Actions
    fetchGiftCards,
    createGiftCard,
    getGiftCard,
    checkBalance,
    redeemGiftCard,
    addBalance,
    voidGiftCard,
    fetchStatistics,
    expireCards
  }
})
