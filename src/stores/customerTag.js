import { defineStore } from 'pinia'
import { ref } from 'vue'
import customerTagService from '@/services/customerTagService'
import { toast } from 'vue3-toastify'

export const useCustomerTagStore = defineStore('customerTag', () => {
  const tags = ref([])
  const currentTag = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchTags(params = {}) {
    loading.value = true
    try {
      const response = await customerTagService.getAll(params)

      if (response.data.data) {
        tags.value = response.data.data.data || response.data.data
        if (response.data.data.current_page) {
          pagination.value = {
            current_page: response.data.data.current_page,
            per_page: response.data.data.per_page,
            total: response.data.data.total
          }
        }
      } else {
        tags.value = response.data
      }
    } catch (error) {
      toast.error('Error al cargar tags')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchTagById(id) {
    loading.value = true
    try {
      const response = await customerTagService.getById(id)
      currentTag.value = response.data
      return response.data
    } catch (error) {
      toast.error('Error al cargar tag')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createTag(data) {
    loading.value = true
    try {
      const response = await customerTagService.create(data)
      toast.success(response.data.message || 'Tag creado exitosamente')
      await fetchTags()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear tag'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateTag(id, data) {
    loading.value = true
    try {
      const response = await customerTagService.update(id, data)
      toast.success(response.data.message || 'Tag actualizado exitosamente')
      await fetchTags()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar tag'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteTag(id) {
    loading.value = true
    try {
      const response = await customerTagService.delete(id)
      toast.success(response.data.message || 'Tag eliminado exitosamente')
      await fetchTags()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar tag'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function assignToCustomers(id, customerIds) {
    loading.value = true
    try {
      const response = await customerTagService.assignToCustomers(id, customerIds)
      toast.success(response.data.message || 'Tag asignado a clientes exitosamente')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al asignar tag'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function removeFromCustomers(id, customerIds) {
    loading.value = true
    try {
      const response = await customerTagService.removeFromCustomers(id, customerIds)
      toast.success(response.data.message || 'Tag removido de clientes exitosamente')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al remover tag'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    tags,
    currentTag,
    loading,
    pagination,
    fetchTags,
    fetchTagById,
    createTag,
    updateTag,
    deleteTag,
    assignToCustomers,
    removeFromCustomers
  }
})
