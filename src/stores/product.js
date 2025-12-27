import { defineStore } from 'pinia'
import { ref } from 'vue'
import productService from '@/services/productService'
import { toast } from 'vue3-toastify'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const currentProduct = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchProducts(params = {}) {
    loading.value = true
    try {
      const response = await productService.getAll(params)
      const data = response.data.data

      products.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar productos')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function searchProducts(query) {
    loading.value = true
    try {
      const response = await productService.search(query)
      return response.data.data
    } catch (error) {
      toast.error('Error al buscar productos')
      console.error(error)
      return []
    } finally {
      loading.value = false
    }
  }

  async function findByBarcode(barcode) {
    loading.value = true
    try {
      const response = await productService.findByBarcode(barcode)
      return response.data.data
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Producto no encontrado')
      } else {
        toast.error('Error al buscar producto')
      }
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchProductById(id) {
    loading.value = true
    try {
      const response = await productService.getById(id)
      currentProduct.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar producto')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createProduct(data) {
    loading.value = true
    try {
      const response = await productService.create(data)
      toast.success(response.data.message || 'Producto creado exitosamente')
      await fetchProducts()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear producto'
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

  async function updateProduct(id, data) {
    loading.value = true
    try {
      const response = await productService.update(id, data)
      toast.success(response.data.message || 'Producto actualizado exitosamente')
      await fetchProducts()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar producto'
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

  async function deleteProduct(id) {
    loading.value = true
    try {
      const response = await productService.delete(id)
      toast.success(response.data.message || 'Producto eliminado exitosamente')
      await fetchProducts()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar producto'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    currentProduct,
    loading,
    pagination,
    fetchProducts,
    searchProducts,
    findByBarcode,
    fetchProductById,
    createProduct,
    updateProduct,
    deleteProduct
  }
})
