import { defineStore } from "pinia";
import { ref } from "vue";
import kitchenService from "@/services/kitchenService";

export const useKitchenStore = defineStore("kitchen", () => {
  const orders = ref([]);
  const history = ref([]);
  const stats = ref(null);
  const loading = ref(false);
  const isPolling = ref(false);

  let pollingInterval = null;

  async function fetchOrders() {
    try {
      const response = await kitchenService.getActiveOrders();
      if (response.data.success) {
        orders.value = response.data.data;
      }
    } catch (error) {
      console.error("Error fetching kitchen orders:", error);
    }
  }

  async function updateStatus(saleId, status) {
    loading.value = true;
    try {
      const response = await kitchenService.updateOrderStatus(saleId, status);
      if (response.data.success) {
        await fetchOrders();
      }
      return response.data;
    } catch (error) {
      console.error("Error updating kitchen status:", error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function fetchHistory() {
    try {
      const response = await kitchenService.getHistory();
      if (response.data.success) {
        history.value = response.data.data;
      }
    } catch (error) {
      console.error("Error fetching kitchen history:", error);
    }
  }

  async function fetchStats() {
    try {
      const response = await kitchenService.getStats();
      if (response.data.success) {
        stats.value = response.data.data;
      }
    } catch (error) {
      console.error("Error fetching kitchen stats:", error);
    }
  }

  function startPolling(intervalMs = 5000) {
    if (pollingInterval) return;
    isPolling.value = true;
    fetchOrders();
    fetchStats();
    pollingInterval = setInterval(() => {
      fetchOrders();
      fetchStats();
    }, intervalMs);
  }

  function stopPolling() {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    isPolling.value = false;
  }

  return {
    orders,
    history,
    stats,
    loading,
    isPolling,
    fetchOrders,
    updateStatus,
    fetchHistory,
    fetchStats,
    startPolling,
    stopPolling,
  };
});
