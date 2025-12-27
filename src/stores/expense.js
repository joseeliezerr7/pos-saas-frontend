import { defineStore } from 'pinia'
import { ref } from 'vue'
import expenseService from '@/services/expenseService'
import { toast } from 'vue3-toastify'

export const useExpenseStore = defineStore('expense', () => {
  const expenses = ref([])
  const currentExpense = ref(null)
  const categories = ref({})
  const paymentMethods = ref({})
  const statistics = ref({
    total_expenses: 0,
    expenses_by_category: {}
  })
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchExpenses(params = {}) {
    loading.value = true
    try {
      const response = await expenseService.getAll(params)
      const data = response.data.data

      expenses.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar gastos')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchExpenseById(id) {
    loading.value = true
    try {
      const response = await expenseService.getById(id)
      currentExpense.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar gasto')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createExpense(data) {
    loading.value = true
    try {
      const response = await expenseService.create(data)
      toast.success(response.data.message || 'Gasto creado exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear gasto'
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

  async function updateExpense(id, data) {
    loading.value = true
    try {
      const response = await expenseService.update(id, data)
      toast.success(response.data.message || 'Gasto actualizado exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar gasto'
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

  async function deleteExpense(id) {
    loading.value = true
    try {
      const response = await expenseService.delete(id)
      toast.success(response.data.message || 'Gasto eliminado exitosamente')
      await fetchExpenses()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar gasto'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function fetchCategories() {
    try {
      const response = await expenseService.getCategories()
      categories.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar categorías')
      console.error(error)
      return {}
    }
  }

  async function fetchPaymentMethods() {
    try {
      const response = await expenseService.getPaymentMethods()
      paymentMethods.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar métodos de pago')
      console.error(error)
      return {}
    }
  }

  async function fetchStatistics(params = {}) {
    loading.value = true
    try {
      const response = await expenseService.getStatistics(params)
      statistics.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar estadísticas')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    expenses,
    currentExpense,
    categories,
    paymentMethods,
    statistics,
    loading,
    pagination,
    fetchExpenses,
    fetchExpenseById,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchCategories,
    fetchPaymentMethods,
    fetchStatistics
  }
})
