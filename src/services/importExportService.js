import api from './api'

export default {
  // Get CSV templates
  async getProductTemplate() {
    const response = await api.get('/import-export/templates/products', {
      responseType: 'blob'
    })
    return response.data
  },

  async getCustomerTemplate() {
    const response = await api.get('/import-export/templates/customers', {
      responseType: 'blob'
    })
    return response.data
  },

  // Get Excel templates
  async getProductTemplateExcel() {
    const response = await api.get('/import-export/templates/products/excel', {
      responseType: 'blob'
    })
    return response.data
  },

  async getCustomerTemplateExcel() {
    const response = await api.get('/import-export/templates/customers/excel', {
      responseType: 'blob'
    })
    return response.data
  },

  async getInventoryTemplate() {
    const response = await api.get('/import-export/templates/inventory', {
      responseType: 'blob'
    })
    return response.data
  },

  async getInventoryTemplateExcel() {
    const response = await api.get('/import-export/templates/inventory/excel', {
      responseType: 'blob'
    })
    return response.data
  },

  async getPriceUpdateTemplate() {
    const response = await api.get('/import-export/templates/price-update', {
      responseType: 'blob'
    })
    return response.data
  },

  async getPriceUpdateTemplateExcel() {
    const response = await api.get('/import-export/templates/price-update/excel', {
      responseType: 'blob'
    })
    return response.data
  },

  // Preview import
  async previewImport(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/import-export/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Import
  async importProducts(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/import-export/import/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async importCustomers(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/import-export/import/customers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async importInventory(file, branchId) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('branch_id', branchId)

    const response = await api.post('/import-export/import/inventory', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  async bulkUpdatePrices(file) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await api.post('/import-export/bulk-update-prices', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  // Export
  async exportProducts(filters = {}) {
    const response = await api.get('/import-export/export/products', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },

  async exportCustomers() {
    const response = await api.get('/import-export/export/customers', {
      responseType: 'blob'
    })
    return response.data
  },

  async exportSales(filters = {}) {
    const response = await api.get('/import-export/export/sales', {
      params: filters,
      responseType: 'blob'
    })
    return response.data
  },

  // Helper to download blob as file
  downloadBlob(blob, filename) {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  }
}
