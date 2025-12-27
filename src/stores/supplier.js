import { defineStore } from 'pinia'
import { ref } from 'vue'
import supplierService from '@/services/supplierService'
import { toast } from 'vue3-toastify'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref([])
  const currentSupplier = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1
  })

  async function fetchSuppliers(params = {}) {
    loading.value = true
    try {
      const response = await supplierService.getAll(params)
      const data = response.data.data
      suppliers.value = data.data || data

      if (data.current_page) {
        pagination.value = {
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page
        }
      }
    } catch (error) {
      toast.error('Error al cargar proveedores')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchSupplierById(id) {
    loading.value = true
    try {
      const response = await supplierService.getById(id)
      currentSupplier.value = response.data.data
      return currentSupplier.value
    } catch (error) {
      toast.error('Error al cargar el proveedor')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createSupplier(supplierData) {
    loading.value = true
    try {
      const response = await supplierService.create(supplierData)
      toast.success('Proveedor creado exitosamente')
      await fetchSuppliers()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear el proveedor'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateSupplier(id, supplierData) {
    loading.value = true
    try {
      const response = await supplierService.update(id, supplierData)
      toast.success('Proveedor actualizado exitosamente')
      await fetchSuppliers()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar el proveedor'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteSupplier(id) {
    loading.value = true
    try {
      await supplierService.delete(id)
      toast.success('Proveedor eliminado exitosamente')
      await fetchSuppliers()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar el proveedor'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    suppliers,
    currentSupplier,
    loading,
    pagination,
    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
  }
})
