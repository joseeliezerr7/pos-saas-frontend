import api from './api'

export default {
  // Get all invoices
  getAll(params = {}) {
    return api.get('/invoices', { params })
  },

  // Get invoice by ID
  getById(id) {
    return api.get(`/invoices/${id}`)
  },

  // Create invoice from sale
  create(data) {
    return api.post('/invoices', data)
  },

  // Void invoice
  void(id, data) {
    return api.post(`/invoices/${id}/void`, data)
  },

  // Download PDF
  downloadPDF(id) {
    return api.get(`/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
  },

  // Send invoice via email
  sendEmail(id, data) {
    return api.post(`/invoices/${id}/send-email`, data)
  }
}
