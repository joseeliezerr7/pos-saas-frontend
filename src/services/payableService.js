import api from "./api";

export default {
  // Supplier Payments
  getPayments(params = {}) {
    return api.get("/payable/payments", { params });
  },

  getPaymentById(id) {
    return api.get(`/payable/payments/${id}`);
  },

  createPayment(data) {
    return api.post("/payable/payments", data);
  },

  // Supplier Payables
  getPayables(params = {}) {
    return api.get("/payable/payables", { params });
  },

  getPayableById(id) {
    return api.get(`/payable/payables/${id}`);
  },

  createPayable(data) {
    return api.post("/payable/payables", data);
  },

  getSupplierPendingPayables(supplierId) {
    return api.get(`/payable/suppliers/${supplierId}/pending`);
  },

  // Reports
  getSupplierStatement(data) {
    return api.post("/payable/reports/statement", data);
  },

  getAgingReport(params = {}) {
    return api.get("/payable/reports/aging", { params });
  },

  getDashboard() {
    return api.get("/payable/reports/dashboard");
  },
};
