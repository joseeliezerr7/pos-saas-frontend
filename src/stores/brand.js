import { defineStore } from 'pinia'
import { ref } from 'vue'
import brandService from '@/services/brandService'
import { toast } from 'vue3-toastify'

export const useBrandStore = defineStore('brand', () => {
  const brands = ref([])
  const currentBrand = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchBrands(params = {}) {
    loading.value = true
    try {
      const response = await brandService.getAll(params)
      const data = response.data.data

      brands.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar marcas')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchBrandById(id) {
    loading.value = true
    try {
      const response = await brandService.getById(id)
      currentBrand.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar marca')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createBrand(data) {
    loading.value = true
    try {
      const response = await brandService.create(data)
      toast.success(response.data.message || 'Marca creada exitosamente')
      await fetchBrands()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear marca'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateBrand(id, data) {
    loading.value = true
    try {
      const response = await brandService.update(id, data)
      toast.success(response.data.message || 'Marca actualizada exitosamente')
      await fetchBrands()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar marca'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteBrand(id) {
    loading.value = true
    try {
      const response = await brandService.delete(id)
      toast.success(response.data.message || 'Marca eliminada exitosamente')
      await fetchBrands()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar marca'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    brands,
    currentBrand,
    loading,
    pagination,
    fetchBrands,
    fetchBrandById,
    createBrand,
    updateBrand,
    deleteBrand
  }
})
