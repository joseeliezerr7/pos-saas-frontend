import api from './api'

export default {
  // Company Settings
  getCompanySettings() {
    return api.get('/settings/company')
  },

  updateCompanySettings(data) {
    return api.put('/settings/company', data)
  },

  uploadCompanyLogo(file) {
    const formData = new FormData()
    formData.append('logo', file)
    return api.post('/settings/company/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  deleteCompanyLogo() {
    return api.delete('/settings/company/logo')
  },

  // CAI Management
  getAllCAIs(params = {}) {
    return api.get('/settings/cais', { params })
  },

  getActiveCAI(branchId = null, documentType = 'FACTURA') {
    return api.get('/settings/cais/active', {
      params: { branch_id: branchId, document_type: documentType }
    })
  },

  getCAI(id) {
    return api.get(`/settings/cais/${id}`)
  },

  createCAI(data) {
    return api.post('/settings/cais', data)
  },

  updateCAI(id, data) {
    return api.put(`/settings/cais/${id}`, data)
  },

  deleteCAI(id) {
    return api.delete(`/settings/cais/${id}`)
  }
}
