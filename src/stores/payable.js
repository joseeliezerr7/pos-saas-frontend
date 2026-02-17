import { defineStore } from 'pinia'
import { ref } from 'vue'
import payableService from '@/services/payableService'
import { toast } from 'vue3-toastify'

export const usePayableStore = defineStore('payable', () => {
  // State
  const payments = ref([])
  const payables = ref([])
  const currentPayment = ref(null)
  const currentPayable = ref(null)
  const dashboardStats = ref(null)
  const supplierStatement = ref(null)
  const agingReport = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0
  })

  // Supplier Payments Actions
  async function fetchPayments(params = {}) {
    loading.value = true
    try {
      const response = await payableService.getPayments(params)
      const data = response.data.data

      payments.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar pagos a proveedores')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchPaymentById(id) {
    loading.value = true
    try {
      const response = await payableService.getPaymentById(id)
      currentPayment.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar pago')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createPayment(data) {
    loading.value = true
    try {
      const response = await payableService.createPayment(data)
      toast.success(response.data.message || 'Pago registrado exitosamente')
      await fetchPayments()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrar pago'
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

  // Supplier Payables Actions
  async function fetchPayables(params = {}) {
    loading.value = true
    try {
      const response = await payableService.getPayables(params)
      const data = response.data.data

      payables.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar cuentas por pagar')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchPayableById(id) {
    loading.value = true
    try {
      const response = await payableService.getPayableById(id)
      currentPayable.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar cuenta por pagar')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createPayable(data) {
    loading.value = true
    try {
      const response = await payableService.createPayable(data)
      toast.success(response.data.message || 'Cuenta por pagar creada exitosamente')
      await fetchPayables()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear cuenta por pagar'
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

  async function fetchSupplierPendingPayables(supplierId) {
    loading.value = true
    try {
      const response = await payableService.getSupplierPendingPayables(supplierId)
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar cuentas pendientes del proveedor')
      console.error(error)
      return []
    } finally {
      loading.value = false
    }
  }

  // Reports Actions
  async function fetchSupplierStatement(data) {
    loading.value = true
    try {
      const response = await payableService.getSupplierStatement(data)
      supplierStatement.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar estado de cuenta')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchAgingReport(params = {}) {
    loading.value = true
    try {
      const response = await payableService.getAgingReport(params)
      agingReport.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar reporte de antigüedad')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchDashboard() {
    loading.value = true
    try {
      const response = await payableService.getDashboard()
      dashboardStats.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar dashboard de cuentas por pagar')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    payments,
    payables,
    currentPayment,
    currentPayable,
    dashboardStats,
    supplierStatement,
    agingReport,
    loading,
    pagination,

    // Actions
    fetchPayments,
    fetchPaymentById,
    createPayment,
    fetchPayables,
    fetchPayableById,
    createPayable,
    fetchSupplierPendingPayables,
    fetchSupplierStatement,
    fetchAgingReport,
    fetchDashboard
  }
})
