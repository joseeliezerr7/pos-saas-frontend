import { defineStore } from 'pinia'
import { ref } from 'vue'
import loyaltyService from '@/services/loyaltyService'
import { toast } from 'vue3-toastify'

export const useLoyaltyStore = defineStore('loyalty', () => {
  const program = ref(null)
  const tiers = ref([])
  const customerSummary = ref(null)
  const transactions = ref([])
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  // Program management
  async function fetchProgram() {
    loading.value = true
    try {
      const response = await loyaltyService.getProgram()
      if (response.data.success) {
        program.value = response.data.data
        return response.data.data
      }
      program.value = null
      return null
    } catch (error) {
      console.error('Error fetching program:', error)
      toast.error('Error al cargar programa de lealtad')
      program.value = null
      return null
    } finally {
      loading.value = false
    }
  }

  async function saveProgram(data) {
    loading.value = true
    try {
      const response = await loyaltyService.saveProgram(data)
      if (response.data.success) {
        program.value = response.data.data
        toast.success(response.data.message || 'Programa guardado exitosamente')
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al guardar programa'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Tier management
  async function fetchTiers() {
    loading.value = true
    try {
      const response = await loyaltyService.getTiers()
      if (response.data.success) {
        tiers.value = response.data.data || []
        return response.data.data || []
      }
      tiers.value = []
      return []
    } catch (error) {
      console.error('Error fetching tiers:', error)
      toast.error('Error al cargar niveles de lealtad')
      tiers.value = []
      return []
    } finally {
      loading.value = false
    }
  }

  async function createTier(data) {
    loading.value = true
    try {
      const response = await loyaltyService.createTier(data)
      if (response.data.success) {
        toast.success(response.data.message || 'Nivel creado exitosamente')
        await fetchTiers()
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear nivel'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateTier(id, data) {
    loading.value = true
    try {
      const response = await loyaltyService.updateTier(id, data)
      if (response.data.success) {
        toast.success(response.data.message || 'Nivel actualizado exitosamente')
        await fetchTiers()
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar nivel'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteTier(id) {
    loading.value = true
    try {
      const response = await loyaltyService.deleteTier(id)
      if (response.data.success) {
        toast.success(response.data.message || 'Nivel eliminado exitosamente')
        await fetchTiers()
        return true
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar nivel'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  // Customer loyalty
  async function fetchCustomerSummary(customerId) {
    loading.value = true
    try {
      const response = await loyaltyService.getCustomerSummary(customerId)
      if (response.data.success) {
        customerSummary.value = response.data.data
        return response.data.data
      }
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error('Error al cargar resumen de lealtad')
        console.error(error)
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function enrollCustomer(customerId) {
    loading.value = true
    try {
      const response = await loyaltyService.enrollCustomer(customerId)
      if (response.data.success) {
        toast.success(response.data.message || 'Cliente inscrito exitosamente')
        await fetchCustomerSummary(customerId)
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al inscribir cliente'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchCustomerTransactions(customerId, params = {}) {
    loading.value = true
    try {
      const response = await loyaltyService.getCustomerTransactions(customerId, params)
      if (response.data.success) {
        const data = response.data.data
        transactions.value = data.data
        pagination.value = {
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total
        }
        return transactions.value
      }
    } catch (error) {
      toast.error('Error al cargar transacciones')
      console.error(error)
      return []
    } finally {
      loading.value = false
    }
  }

  // Points operations
  async function redeemPoints(data) {
    loading.value = true
    try {
      const response = await loyaltyService.redeemPoints(data)
      if (response.data.success) {
        toast.success(response.data.message || 'Puntos canjeados exitosamente')
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al canjear puntos'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function adjustPoints(data) {
    loading.value = true
    try {
      const response = await loyaltyService.adjustPoints(data)
      if (response.data.success) {
        toast.success(response.data.message || 'Puntos ajustados exitosamente')
        return response.data.data
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al ajustar puntos'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  function clearCustomerData() {
    customerSummary.value = null
    transactions.value = []
  }

  return {
    program,
    tiers,
    customerSummary,
    transactions,
    loading,
    pagination,
    fetchProgram,
    saveProgram,
    fetchTiers,
    createTier,
    updateTier,
    deleteTier,
    fetchCustomerSummary,
    enrollCustomer,
    fetchCustomerTransactions,
    redeemPoints,
    adjustPoints,
    clearCustomerData
  }
})
