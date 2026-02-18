import { ref, computed } from "vue";
import { defineStore } from "pinia";
import ecommerceService from "@/services/ecommerceService";
import { toast } from "vue3-toastify";

export const useEcommerceStore = defineStore("ecommerce", () => {
  // State
  const settings = ref(null);
  const dashboard = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Catalog state
  const products = ref([]);
  const featuredProducts = ref([]);
  const categories = ref([]);
  const catalogPagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  // Orders state
  const orders = ref([]);
  const currentOrder = ref(null);
  const orderStats = ref(null);
  const ordersPagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  // Customers state
  const customers = ref([]);
  const currentCustomer = ref(null);
  const customersPagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0,
  });

  // Computed
  const isStoreActive = computed(() => settings.value?.is_active ?? false);
  const storeName = computed(() => settings.value?.store_name ?? "Mi Tienda");
  const storeSlug = computed(() => settings.value?.store_slug ?? "");

  // Actions - Settings
  async function fetchSettings() {
    loading.value = true;
    error.value = null;
    try {
      const response = await ecommerceService.getSettings();
      settings.value = response.data.data;
      return settings.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar configuración";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateSettings(data) {
    loading.value = true;
    try {
      const response = await ecommerceService.updateSettings(data);
      settings.value = response.data.data;
      toast.success("Configuración actualizada");
      return settings.value;
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Error al actualizar");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function activateStore() {
    loading.value = true;
    try {
      const response = await ecommerceService.activateStore();
      settings.value = response.data.data;
      toast.success("Tienda activada exitosamente");
      return settings.value;
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || "Error al activar tienda",
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deactivateStore() {
    loading.value = true;
    try {
      const response = await ecommerceService.deactivateStore();
      settings.value = response.data.data;
      toast.success("Tienda desactivada");
      return settings.value;
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || "Error al desactivar tienda",
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Actions - Dashboard
  async function fetchDashboard() {
    loading.value = true;
    try {
      const response = await ecommerceService.getDashboard();
      dashboard.value = response.data.data;
      settings.value = response.data.data.settings;
      return dashboard.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar dashboard";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Actions - Catalog
  async function fetchProducts(params = {}) {
    loading.value = true;
    try {
      const response = await ecommerceService.getCatalog(params);
      products.value = response.data.data;
      if (response.data.meta) {
        catalogPagination.value = {
          currentPage: response.data.meta.current_page,
          lastPage: response.data.meta.last_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
        };
      }
      return products.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar productos";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchFeaturedProducts() {
    try {
      const response = await ecommerceService.getFeaturedProducts();
      featuredProducts.value = response.data.data;
      return featuredProducts.value;
    } catch (err) {
      console.error("Error fetching featured products:", err);
      throw err;
    }
  }

  async function fetchCategories() {
    try {
      const response = await ecommerceService.getCategories();
      categories.value = response.data.data;
      return categories.value;
    } catch (err) {
      console.error("Error fetching categories:", err);
      throw err;
    }
  }

  async function updateProductEcommerce(productId, data) {
    loading.value = true;
    try {
      const response = await ecommerceService.updateProductEcommerce(
        productId,
        data,
      );
      toast.success("Producto actualizado");
      return response.data.data;
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || "Error al actualizar producto",
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Actions - Orders
  async function fetchOrders(params = {}) {
    loading.value = true;
    try {
      const response = await ecommerceService.getOrders(params);
      orders.value = response.data.data;
      if (response.data.meta) {
        ordersPagination.value = {
          currentPage: response.data.meta.current_page,
          lastPage: response.data.meta.last_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
        };
      }
      return orders.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar pedidos";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrder(id) {
    loading.value = true;
    try {
      const response = await ecommerceService.getOrder(id);
      currentOrder.value = response.data.data;
      return currentOrder.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar pedido";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchOrderStats() {
    try {
      const response = await ecommerceService.getOrderStats();
      orderStats.value = response.data.data;
      return orderStats.value;
    } catch (err) {
      console.error("Error fetching order stats:", err);
      throw err;
    }
  }

  async function updateOrderStatus(id, data) {
    loading.value = true;
    try {
      const response = await ecommerceService.updateOrderStatus(id, data);
      // Actualizar en la lista local
      const index = orders.value.findIndex((o) => o.id === id);
      if (index !== -1) {
        orders.value[index] = response.data.data;
      }
      if (currentOrder.value?.id === id) {
        currentOrder.value = response.data.data;
      }
      toast.success("Estado actualizado");
      return response.data.data;
    } catch (err) {
      toast.error(
        err.response?.data?.error?.message || "Error al actualizar estado",
      );
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Actions - Customers
  async function fetchCustomers(params = {}) {
    loading.value = true;
    try {
      const response = await ecommerceService.getCustomers(params);
      customers.value = response.data.data;
      if (response.data.meta) {
        customersPagination.value = {
          currentPage: response.data.meta.current_page,
          lastPage: response.data.meta.last_page,
          perPage: response.data.meta.per_page,
          total: response.data.meta.total,
        };
      }
      return customers.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar clientes";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCustomer(id) {
    loading.value = true;
    try {
      const response = await ecommerceService.getCustomer(id);
      // El backend devuelve { customer: {...}, stats: {...} }
      const data = response.data.data;
      if (data.customer) {
        currentCustomer.value = {
          ...data.customer,
          total_spent: data.stats?.total_spent || 0,
          orders_count:
            data.customer.orders_count || data.stats?.total_orders || 0,
        };
      } else {
        currentCustomer.value = data;
      }
      return currentCustomer.value;
    } catch (err) {
      error.value =
        err.response?.data?.error?.message || "Error al cargar cliente";
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCustomerStatus(id, status) {
    loading.value = true;
    try {
      const response = await ecommerceService.updateCustomerStatus(id, status);
      const index = customers.value.findIndex((c) => c.id === id);
      if (index !== -1) {
        customers.value[index] = response.data.data;
      }
      toast.success("Estado del cliente actualizado");
      return response.data.data;
    } catch (err) {
      toast.error(err.response?.data?.error?.message || "Error al actualizar");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  // Reset
  function $reset() {
    settings.value = null;
    dashboard.value = null;
    products.value = [];
    featuredProducts.value = [];
    categories.value = [];
    orders.value = [];
    currentOrder.value = null;
    orderStats.value = null;
    customers.value = [];
    currentCustomer.value = null;
    loading.value = false;
    error.value = null;
  }

  return {
    // State
    settings,
    dashboard,
    loading,
    error,
    products,
    featuredProducts,
    categories,
    catalogPagination,
    orders,
    currentOrder,
    orderStats,
    ordersPagination,
    customers,
    currentCustomer,
    customersPagination,

    // Computed
    isStoreActive,
    storeName,
    storeSlug,

    // Actions
    fetchSettings,
    updateSettings,
    activateStore,
    deactivateStore,
    fetchDashboard,
    fetchProducts,
    fetchFeaturedProducts,
    fetchCategories,
    updateProductEcommerce,
    fetchOrders,
    fetchOrder,
    fetchOrderStats,
    updateOrderStatus,
    fetchCustomers,
    fetchCustomer,
    updateCustomerStatus,
    $reset,
  };
});
