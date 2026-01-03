import { defineStore } from 'pinia'
import { ref } from 'vue'
import creditService from '@/services/creditService'
import { toast } from 'vue3-toastify'

export const useCreditStore = defineStore('credit', () => {
  // State
  const payments = ref([])
  const creditSales = ref([])
  const currentPayment = ref(null)
  const currentCreditSale = ref(null)
  const dashboardStats = ref(null)
  const customerStatement = ref(null)
  const agingReport = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0
  })

  // Customer Payments Actions
  async function fetchPayments(params = {}) {
    loading.value = true
    try {
      const response = await creditService.getPayments(params)
      const data = response.data.data

      payments.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar pagos')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchPaymentById(id) {
    loading.value = true
    try {
      const response = await creditService.getPaymentById(id)
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
      const response = await creditService.createPayment(data)
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

  async function downloadReceipt(id) {
    loading.value = true
    try {
      const response = await creditService.downloadReceipt(id)

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `recibo-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Recibo descargado exitosamente')
    } catch (error) {
      toast.error('Error al descargar recibo')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  // Credit Sales Actions
  async function fetchCreditSales(params = {}) {
    loading.value = true
    try {
      const response = await creditService.getCreditSales(params)
      const data = response.data.data

      creditSales.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar cuentas por cobrar')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchCreditSaleById(id) {
    loading.value = true
    try {
      const response = await creditService.getCreditSaleById(id)
      currentCreditSale.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar venta al crédito')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchCustomerPendingSales(customerId) {
    loading.value = true
    try {
      const response = await creditService.getCustomerPendingSales(customerId)
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar ventas pendientes del cliente')
      console.error(error)
      return []
    } finally {
      loading.value = false
    }
  }

  // Reports Actions
  async function fetchCustomerStatement(data) {
    loading.value = true
    try {
      const response = await creditService.getCustomerStatement(data)
      customerStatement.value = response.data.data
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
      const response = await creditService.getAgingReport(params)
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
      const response = await creditService.getDashboard()
      dashboardStats.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar dashboard de cuentas por cobrar')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    payments,
    creditSales,
    currentPayment,
    currentCreditSale,
    dashboardStats,
    customerStatement,
    agingReport,
    loading,
    pagination,

    // Actions
    fetchPayments,
    fetchPaymentById,
    createPayment,
    downloadReceipt,
    fetchCreditSales,
    fetchCreditSaleById,
    fetchCustomerPendingSales,
    fetchCustomerStatement,
    fetchAgingReport,
    fetchDashboard
  }
})
