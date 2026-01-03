import api from './api'

/**
 * Servicio para operaciones de Super Admin
 * Gestión de todos los tenants del sistema
 */

export default {
  /**
   * Obtener listado de tenants con filtros
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise}
   */
  getTenants(params = {}) {
    return api.get('/super-admin/tenants', { params })
  },

  /**
   * Obtener detalles de un tenant específico
   * @param {Number} tenantId - ID del tenant
   * @returns {Promise}
   */
  getTenantDetails(tenantId) {
    return api.get(`/super-admin/tenants/${tenantId}`)
  },

  /**
   * Crear un nuevo tenant
   * @param {Object} tenantData - Datos del nuevo tenant
   * @returns {Promise}
   */
  createTenant(tenantData) {
    return api.post('/super-admin/tenants', tenantData)
  },

  /**
   * Activar o desactivar un tenant
   * @param {Number} tenantId - ID del tenant
   * @returns {Promise}
   */
  toggleTenantStatus(tenantId) {
    return api.post(`/super-admin/tenants/${tenantId}/toggle-status`)
  },

  /**
   * Actualizar suscripción de un tenant
   * @param {Number} tenantId - ID del tenant
   * @param {Object} subscriptionData - Datos de la suscripción
   * @returns {Promise}
   */
  updateTenantSubscription(tenantId, subscriptionData) {
    return api.put(`/super-admin/tenants/${tenantId}/subscription`, subscriptionData)
  },

  /**
   * Eliminar un tenant (soft delete)
   * @param {Number} tenantId - ID del tenant
   * @returns {Promise}
   */
  deleteTenant(tenantId) {
    return api.delete(`/super-admin/tenants/${tenantId}`)
  },

  /**
   * Obtener dashboard de métricas globales
   * @returns {Promise}
   */
  getDashboard() {
    return api.get('/super-admin/dashboard')
  },

  /**
   * Exportar datos de tenants
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise}
   */
  exportTenants(params = {}) {
    return api.get('/super-admin/tenants/export', { params })
  },

  /**
   * Obtener todos los planes disponibles
   * @returns {Promise}
   */
  getPlans() {
    return api.get('/plans')
  }
}
