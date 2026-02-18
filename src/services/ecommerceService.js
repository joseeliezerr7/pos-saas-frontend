import api from "./api";

export default {
  // Dashboard y configuración
  getDashboard() {
    return api.get("/ecommerce/dashboard");
  },

  getSettings() {
    return api.get("/ecommerce/settings");
  },

  updateSettings(data) {
    return api.put("/ecommerce/settings", data);
  },

  uploadLogo(formData) {
    return api.post("/ecommerce/settings/logo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  activateStore() {
    return api.post("/ecommerce/settings/activate");
  },

  deactivateStore() {
    return api.post("/ecommerce/settings/deactivate");
  },

  // Catálogo
  getCatalog(params = {}) {
    return api.get("/ecommerce/catalog", { params });
  },

  getProduct(id) {
    return api.get(`/ecommerce/catalog/${id}`);
  },

  getFeaturedProducts() {
    return api.get("/ecommerce/catalog/featured");
  },

  getCategories() {
    return api.get("/ecommerce/catalog/categories");
  },

  searchProducts(query) {
    return api.get("/ecommerce/catalog/search", { params: { q: query } });
  },

  updateProductEcommerce(productId, data) {
    return api.put(`/ecommerce/catalog/${productId}/ecommerce`, data);
  },

  // Pedidos
  getOrders(params = {}) {
    return api.get("/ecommerce/orders", { params });
  },

  getOrder(id) {
    return api.get(`/ecommerce/orders/${id}`);
  },

  getOrderStats() {
    return api.get("/ecommerce/orders/stats");
  },

  updateOrderStatus(id, data) {
    return api.put(`/ecommerce/orders/${id}/status`, data);
  },

  updatePaymentStatus(id, data) {
    return api.put(`/ecommerce/orders/${id}/payment-status`, data);
  },

  addOrderNote(id, note) {
    return api.post(`/ecommerce/orders/${id}/note`, { note });
  },

  convertOrderToSale(id) {
    return api.post(`/ecommerce/orders/${id}/convert-to-sale`);
  },

  // Clientes
  getCustomers(params = {}) {
    return api.get("/ecommerce/customers", { params });
  },

  getCustomer(id) {
    return api.get(`/ecommerce/customers/${id}`);
  },

  updateCustomerStatus(id, status) {
    return api.put(`/ecommerce/customers/${id}/status`, { status });
  },

  updateCustomerType(id, data) {
    return api.put(`/ecommerce/customers/${id}/type`, data);
  },

  getCustomerOrders(id, params = {}) {
    return api.get(`/ecommerce/customers/${id}/orders`, { params });
  },

  // Carrito (para testing admin)
  getCart() {
    return api.get("/ecommerce/cart");
  },

  addToCart(productId, quantity, variantId = null) {
    return api.post("/ecommerce/cart", {
      product_id: productId,
      quantity,
      variant_id: variantId,
    });
  },

  updateCartItem(itemId, quantity) {
    return api.put(`/ecommerce/cart/${itemId}`, { quantity });
  },

  removeFromCart(itemId) {
    return api.delete(`/ecommerce/cart/${itemId}`);
  },

  clearCart() {
    return api.delete("/ecommerce/cart");
  },

  applyCoupon(code) {
    return api.post("/ecommerce/cart/coupon", { coupon_code: code });
  },

  // Checkout
  validateCheckout() {
    return api.post("/ecommerce/checkout/validate");
  },

  processCheckout(data) {
    return api.post("/ecommerce/checkout", data);
  },
};
