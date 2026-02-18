import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api";

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export default {
  // Obtener informacion de la tienda
  getStoreInfo(storeSlug) {
    return publicApi.get(`/store/${storeSlug}/info`);
  },

  // Catalogo publico
  getProducts(storeSlug, params = {}) {
    return publicApi.get(`/store/${storeSlug}/products`, { params });
  },

  getProduct(storeSlug, productId) {
    return publicApi.get(`/store/${storeSlug}/products/${productId}`);
  },

  getFeaturedProducts(storeSlug) {
    return publicApi.get(`/store/${storeSlug}/products/featured`);
  },

  getCategories(storeSlug) {
    return publicApi.get(`/store/${storeSlug}/categories`);
  },

  searchProducts(storeSlug, query) {
    return publicApi.get(`/store/${storeSlug}/products/search`, {
      params: { q: query },
    });
  },

  // Carrito (basado en session/localStorage)
  getCart(storeSlug) {
    return publicApi.get(`/store/${storeSlug}/cart`);
  },

  addToCart(storeSlug, productId, quantity, variantId = null) {
    return publicApi.post(`/store/${storeSlug}/cart`, {
      product_id: productId,
      quantity,
      variant_id: variantId,
    });
  },

  updateCartItem(storeSlug, itemId, quantity) {
    return publicApi.put(`/store/${storeSlug}/cart/${itemId}`, { quantity });
  },

  removeFromCart(storeSlug, itemId) {
    return publicApi.delete(`/store/${storeSlug}/cart/${itemId}`);
  },

  applyCoupon(storeSlug, code) {
    return publicApi.post(`/store/${storeSlug}/cart/coupon`, {
      coupon_code: code,
    });
  },

  // Checkout
  validateCheckout(storeSlug) {
    return publicApi.post(`/store/${storeSlug}/checkout/validate`);
  },

  processCheckout(storeSlug, data) {
    return publicApi.post(`/store/${storeSlug}/checkout`, data);
  },

  // Autenticacion de clientes
  registerCustomer(storeSlug, data) {
    return publicApi.post(`/store/${storeSlug}/customer/register`, data);
  },

  loginCustomer(storeSlug, credentials) {
    return publicApi.post(`/store/${storeSlug}/customer/login`, credentials);
  },
};
