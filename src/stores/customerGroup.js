import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerGroupService from '@/services/customerGroupService'
import { toast } from 'vue3-toastify'

export const useCustomerGroupStore = defineStore('customerGroup', () => {
  const groups = ref([])
  const currentGroup = ref(null)
  const stats = ref(null)
  const prices = ref([])
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchGroups(params = {}) {
    loading.value = true
    try {
      const response = await customerGroupService.getAll(params)

      if (response.data.data) {
        groups.value = response.data.data.data || response.data.data
        if (response.data.data.current_page) {
          pagination.value = {
            current_page: response.data.data.current_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total
          }
        }
      } else {
        groups.value = response.data
      }
    } catch (error) {
      toast.error('Error al cargar grupos de clientes')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchGroupById(id) {
    loading.value = true
    try {
      const response = await customerGroupService.getById(id)
      currentGroup.value = response.data
      return response.data
    } catch (error) {
      toast.error('Error al cargar grupo')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createGroup(data) {
    loading.value = true
    try {
      const response = await customerGroupService.create(data)
      toast.success(response.data.message || 'Grupo creado exitosamente')
      await fetchGroups()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear grupo'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateGroup(id, data) {
    loading.value = true
    try {
      const response = await customerGroupService.update(id, data)
      toast.success(response.data.message || 'Grupo actualizado exitosamente')
      await fetchGroups()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar grupo'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteGroup(id) {
    loading.value = true
    try {
      const response = await customerGroupService.delete(id)
      toast.success(response.data.message || 'Grupo eliminado exitosamente')
      await fetchGroups()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar grupo'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchStats() {
    loading.value = true
    try {
      const response = await customerGroupService.getStats()
      stats.value = response.data
      return response.data
    } catch (error) {
      toast.error('Error al cargar estadísticas')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function calculateRFM() {
    loading.value = true
    try {
      const response = await customerGroupService.calculateRFM()
      toast.success(response.data.message || 'Análisis RFM calculado exitosamente')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al calcular análisis RFM'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchPrices(id) {
    loading.value = true
    try {
      const response = await customerGroupService.getPrices(id)
      prices.value = response.data
      return response.data
    } catch (error) {
      toast.error('Error al cargar precios especiales')
      console.error(error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function setPrice(id, data) {
    loading.value = true
    try {
      const response = await customerGroupService.setPrice(id, data)
      toast.success(response.data.message || 'Precio especial configurado')
      await fetchPrices(id)
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al configurar precio'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function removePrice(groupId, priceId) {
    loading.value = true
    try {
      const response = await customerGroupService.removePrice(groupId, priceId)
      toast.success(response.data.message || 'Precio especial eliminado')
      await fetchPrices(groupId)
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar precio'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function assignCustomers(id, customerIds) {
    loading.value = true
    try {
      const response = await customerGroupService.assignCustomers(id, customerIds)
      toast.success(response.data.message || 'Clientes asignados exitosamente')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al asignar clientes'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    groups,
    currentGroup,
    stats,
    prices,
    loading,
    pagination,
    fetchGroups,
    fetchGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchStats,
    calculateRFM,
    fetchPrices,
    setPrice,
    removePrice,
    assignCustomers
  }
})
