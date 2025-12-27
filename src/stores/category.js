import { defineStore } from 'pinia'
import { ref } from 'vue'
import categoryService from '@/services/categoryService'
import { toast } from 'vue3-toastify'

export const useCategoryStore = defineStore('category', () => {
  const categories = ref([])
  const categoryTree = ref([])
  const currentCategory = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchCategories(params = {}) {
    loading.value = true
    try {
      const response = await categoryService.getAll(params)
      const data = response.data.data

      categories.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar categorías')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryTree() {
    loading.value = true
    try {
      const response = await categoryService.getTree()
      categoryTree.value = response.data.data
    } catch (error) {
      toast.error('Error al cargar árbol de categorías')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCategoryById(id) {
    loading.value = true
    try {
      const response = await categoryService.getById(id)
      currentCategory.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar categoría')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createCategory(data) {
    loading.value = true
    try {
      const response = await categoryService.create(data)
      toast.success(response.data.message || 'Categoría creada exitosamente')
      await fetchCategories()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear categoría'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateCategory(id, data) {
    loading.value = true
    try {
      const response = await categoryService.update(id, data)
      toast.success(response.data.message || 'Categoría actualizada exitosamente')
      await fetchCategories()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar categoría'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteCategory(id) {
    loading.value = true
    try {
      const response = await categoryService.delete(id)
      toast.success(response.data.message || 'Categoría eliminada exitosamente')
      await fetchCategories()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar categoría'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    categoryTree,
    currentCategory,
    loading,
    pagination,
    fetchCategories,
    fetchCategoryTree,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
  }
})
