import api from './api'

export default {
  /**
   * Generate sales report
   * @param {Object} filters - date_from, date_to, branch_id, user_id, payment_method, group_by
   */
  getSalesReport(filters) {
    return api.post('/reports/sales', filters)
  },

  /**
   * Generate inventory report
   * @param {Object} filters - branch_id, category_id, status, date_from, date_to
   */
  getInventoryReport(filters) {
    return api.post('/reports/inventory', filters)
  },

  /**
   * Generate financial report
   * @param {Object} filters - date_from, date_to, branch_id
   */
  getFinancialReport(filters) {
    return api.post('/reports/financial', filters)
  },

  /**
   * Generate SAR monthly report
   * @param {Object} filters - year, month, branch_id
   */
  getSARMonthlyReport(filters) {
    return api.post('/reports/sar/monthly', filters)
  },

  /**
   * Generate SAR DEI report
   * @param {Object} filters - date_from, date_to
   */
  getSARDEIReport(filters) {
    return api.post('/reports/sar/dei', filters)
  },

  /**
   * Download a report
   * @param {Number} id - Report ID
   */
  downloadReport(id) {
    return api.get(`/reports/${id}/download`, {
      responseType: 'blob'
    })
  },

  /**
   * Export report as PDF
   * @param {String} type - Report type (sales, inventory, financial)
   * @param {Object} filters - Report filters
   */
  exportPDF(type, filters) {
    // For now, we'll handle PDF generation on the frontend
    // In the future, this could call a backend endpoint
    return Promise.resolve({ success: true })
  },

  /**
   * Export report as Excel
   * @param {String} type - Report type
   * @param {Object} filters - Report filters
   */
  exportExcel(type, filters) {
    // Placeholder for Excel export functionality
    return Promise.resolve({ success: true })
  }
}
