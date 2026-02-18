import api from "@/services/api";

export default {
  getActiveOrders: () => api.get("/kitchen/orders"),
  updateOrderStatus: (saleId, status) =>
    api.put(`/kitchen/orders/${saleId}/status`, { status }),
  getHistory: () => api.get("/kitchen/history"),
  getStats: () => api.get("/kitchen/stats"),
};
