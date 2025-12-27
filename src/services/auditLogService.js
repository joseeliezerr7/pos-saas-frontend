import api from './api'

export default {
  // Get all audit logs
  getAll(params = {}) {
    return api.get('/audit-logs', { params })
  },

  // Get audit log by ID
  getById(id) {
    return api.get(`/audit-logs/${id}`)
  },

  // Get available event types
  getEventTypes() {
    return api.get('/audit-logs/event-types')
  },

  // Get available auditable types
  getAuditableTypes() {
    return api.get('/audit-logs/auditable-types')
  }
}
