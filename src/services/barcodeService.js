import api from './api'

export default {
  // Generate unique EAN-13 barcode
  async generateUnique() {
    const response = await api.post('/barcodes/generate-unique')
    return response.data
  },

  // Generate barcode SVG
  async generateSVG(code, type = 'ean13') {
    const response = await api.post('/barcodes/generate-svg', {
      code,
      type
    })
    return response.data
  },

  // Validate barcode
  async validate(barcode) {
    const response = await api.post('/barcodes/validate', {
      barcode
    })
    return response.data
  },

  // Generate labels data
  async generateLabels(products, options = {}) {
    const response = await api.post('/barcodes/labels', {
      products,
      label_size: options.size || 'medium',
      show_price: options.showPrice !== false,
      show_sku: options.showSku !== false
    })
    return response.data
  },

  // Generate labels PDF
  async generateLabelsPDF(products, options = {}) {
    const response = await api.post('/barcodes/labels/pdf', {
      products,
      label_size: options.size || 'medium',
      show_price: options.showPrice !== false,
      show_sku: options.showSku !== false,
      columns: options.columns || 3
    }, {
      responseType: 'blob'
    })
    return response.data
  },

  // Helper to download PDF
  downloadPDF(blob, filename) {
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
