import { defineStore } from 'pinia'
import { ref } from 'vue'
import invoiceService from '@/services/invoiceService'
import { toast } from 'vue3-toastify'

export const useInvoiceStore = defineStore('invoice', () => {
  const invoices = ref([])
  const currentInvoice = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  })

  async function fetchInvoices(params = {}) {
    loading.value = true
    try {
      const response = await invoiceService.getAll(params)
      invoices.value = response.data.data
      pagination.value = response.data.meta
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar facturas')
    } finally {
      loading.value = false
    }
  }

  async function fetchInvoiceById(id) {
    loading.value = true
    try {
      const response = await invoiceService.getById(id)
      currentInvoice.value = response.data.data
      return currentInvoice.value
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la factura')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createInvoice(invoiceData) {
    loading.value = true
    try {
      const response = await invoiceService.create(invoiceData)
      toast.success('Factura generada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al generar la factura'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function voidInvoice(id, reason) {
    loading.value = true
    try {
      await invoiceService.void(id, { reason })
      toast.success('Factura anulada exitosamente')
      await fetchInvoices()
      return true
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al anular la factura'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function downloadPDF(id, invoiceNumber) {
    loading.value = true
    try {
      const response = await invoiceService.downloadPDF(id)

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `factura-${invoiceNumber}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success('Descargando factura...')
    } catch (error) {
      console.error(error)
      toast.error('Error al descargar la factura')
    } finally {
      loading.value = false
    }
  }

  async function sendEmail(id, email) {
    loading.value = true
    try {
      await invoiceService.sendEmail(id, { email })
      toast.success('Factura enviada por correo exitosamente')
      return true
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al enviar la factura'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    invoices,
    currentInvoice,
    loading,
    pagination,
    fetchInvoices,
    fetchInvoiceById,
    createInvoice,
    voidInvoice,
    downloadPDF,
    sendEmail
  }
})
