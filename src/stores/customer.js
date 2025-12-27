import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerService from '@/services/customerService'
import { toast } from 'vue3-toastify'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref([])
  const currentCustomer = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchCustomers(params = {}) {
    loading.value = true
    try {
      const response = await customerService.getAll(params)
      const data = response.data.data

      customers.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar clientes')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function searchCustomers(query) {
    try {
      const response = await customerService.search(query)
      return response.data.data
    } catch (error) {
      toast.error('Error al buscar clientes')
      console.error(error)
      return []
    }
  }

  async function fetchCustomerById(id) {
    loading.value = true
    try {
      const response = await customerService.getById(id)
      currentCustomer.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar cliente')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createCustomer(data) {
    loading.value = true
    try {
      const response = await customerService.create(data)
      toast.success(response.data.message || 'Cliente creado exitosamente')
      await fetchCustomers()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear cliente'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(id, data) {
    loading.value = true
    try {
      const response = await customerService.update(id, data)
      toast.success(response.data.message || 'Cliente actualizado exitosamente')
      await fetchCustomers()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar cliente'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteCustomer(id) {
    loading.value = true
    try {
      const response = await customerService.delete(id)
      toast.success(response.data.message || 'Cliente eliminado exitosamente')
      await fetchCustomers()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar cliente'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    currentCustomer,
    loading,
    pagination,
    fetchCustomers,
    searchCustomers,
    fetchCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
  }
})
