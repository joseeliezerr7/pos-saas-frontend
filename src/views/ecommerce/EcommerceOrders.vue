<template>
  <div class="space-y-6">
    <!-- Modal de Confirmación -->
    <Teleport to="body">
      <div v-if="showConvertModal" class="fixed inset-0 z-50 overflow-y-auto">
        <div
          class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0"
        >
          <div
            class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
            @click="showConvertModal = false"
          ></div>
          <div
            class="relative inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
          >
            <div class="sm:flex sm:items-start">
              <div
                class="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-green-100 rounded-full sm:mx-0 sm:h-10 sm:w-10"
              >
                <svg
                  class="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg font-medium leading-6 text-gray-900">
                  Convertir a Venta POS
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500">
                    ¿Estás seguro de convertir el pedido
                    <strong>#{{ orderToConvert?.order_number }}</strong> a una
                    venta en el POS?
                  </p>
                </div>
              </div>
            </div>
            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                :disabled="converting"
                @click="confirmConvertToSale"
                class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none sm:w-auto sm:text-sm disabled:opacity-50"
              >
                <svg
                  v-if="converting"
                  class="w-4 h-4 mr-2 animate-spin"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {{ converting ? "Convirtiendo..." : "Sí, convertir" }}
              </button>
              <button
                type="button"
                :disabled="converting"
                @click="showConvertModal = false"
                class="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pedidos Online</h1>
        <p class="text-gray-600">Gestiona los pedidos de tu tienda online</p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por # pedido, cliente o email..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="debouncedSearch"
          />
        </div>
        <div class="flex gap-2 flex-wrap">
          <select
            v-model="statusFilter"
            @change="loadOrders"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmado</option>
            <option value="processing">Procesando</option>
            <option value="shipped">Enviado</option>
            <option value="delivered">Entregado</option>
            <option value="cancelled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
          <select
            v-model="dateFilter"
            @change="loadOrders"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas las fechas</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow-sm p-4">
        <p class="text-sm text-gray-600">Total Pedidos</p>
        <p class="text-2xl font-bold text-gray-900">{{ pagination.total }}</p>
      </div>
      <div class="bg-yellow-50 rounded-lg shadow-sm p-4">
        <p class="text-sm text-yellow-800">Pendientes</p>
        <p class="text-2xl font-bold text-yellow-600">
          {{ orderStats.pending || 0 }}
        </p>
      </div>
      <div class="bg-blue-50 rounded-lg shadow-sm p-4">
        <p class="text-sm text-blue-800">En Proceso</p>
        <p class="text-2xl font-bold text-blue-600">
          {{ orderStats.processing || 0 }}
        </p>
      </div>
      <div class="bg-green-50 rounded-lg shadow-sm p-4">
        <p class="text-sm text-green-800">Completados</p>
        <p class="text-2xl font-bold text-green-600">
          {{ orderStats.delivered || 0 }}
        </p>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="text-gray-500 mt-2">Cargando pedidos...</p>
      </div>
      <div
        v-else-if="orders.length === 0"
        class="p-8 text-center text-gray-500"
      >
        <svg
          class="w-12 h-12 mx-auto text-gray-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        <p>No se encontraron pedidos</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Pedido
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Cliente
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Items
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Total
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Pago
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Fecha
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"
              >
                Acciones
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr
              v-for="order in orders"
              :key="order.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <router-link
                  :to="`/ecommerce/orders/${order.id}`"
                  class="font-medium text-blue-600 hover:text-blue-800"
                >
                  #{{ order.order_number }}
                </router-link>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div>
                  <p class="text-sm font-medium text-gray-900">
                    {{
                      order.customer?.name ||
                      order.customer_name ||
                      "Cliente Anónimo"
                    }}
                  </p>
                  <p class="text-sm text-gray-500">
                    {{ order.customer?.email || order.customer_email }}
                  </p>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ order.items_count || order.items?.length || 0 }} items
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {{ formatCurrency(order.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="order.status"
                  @change="updateStatus(order.id, $event.target.value)"
                  :class="getStatusSelectClass(order.status)"
                  class="text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer"
                >
                  <option value="pending">Pendiente</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="processing">Procesando</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="order.payment_status"
                  @change="updatePaymentStatus(order.id, $event.target.value)"
                  :class="getPaymentSelectClass(order.payment_status)"
                  class="text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer"
                >
                  <option value="pending">Pendiente</option>
                  <option value="paid">Pagado</option>
                  <option value="failed">Fallido</option>
                  <option value="refunded">Reembolsado</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/ecommerce/orders/${order.id}`"
                    class="text-gray-600 hover:text-blue-600"
                    title="Ver detalle"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </router-link>
                  <button
                    v-if="
                      order.status !== 'cancelled' &&
                      order.payment_status === 'paid' &&
                      !order.sale_id
                    "
                    @click="convertToSale(order)"
                    class="text-gray-600 hover:text-green-600"
                    title="Convertir a venta POS"
                  >
                    <svg
                      class="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div
        v-if="pagination.lastPage > 1"
        class="px-6 py-4 border-t border-gray-200 flex items-center justify-between"
      >
        <p class="text-sm text-gray-600">
          Mostrando
          {{ (pagination.currentPage - 1) * pagination.perPage + 1 }} -
          {{
            Math.min(
              pagination.currentPage * pagination.perPage,
              pagination.total,
            )
          }}
          de {{ pagination.total }}
        </p>
        <div class="flex gap-2">
          <button
            @click="goToPage(pagination.currentPage - 1)"
            :disabled="pagination.currentPage === 1"
            class="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Anterior
          </button>
          <button
            @click="goToPage(pagination.currentPage + 1)"
            :disabled="pagination.currentPage === pagination.lastPage"
            class="px-3 py-1 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEcommerceStore } from "@/stores/ecommerce";
import { storeToRefs } from "pinia";
import { toast } from "vue3-toastify";
import ecommerceService from "@/services/ecommerceService";

const route = useRoute();
const router = useRouter();
const ecommerceStore = useEcommerceStore();
const { orders, orderStats, ordersPagination, loading } =
  storeToRefs(ecommerceStore);

const search = ref("");
const statusFilter = ref("");
const showConvertModal = ref(false);
const converting = ref(false);
const orderToConvert = ref(null);
const dateFilter = ref("");

const pagination = computed(() => ordersPagination.value);

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadOrders();
  }, 300);
};

onMounted(() => {
  // Check for status filter in URL
  if (route.query.status) {
    statusFilter.value = route.query.status;
  }
  loadOrders();
  ecommerceStore.fetchOrderStats();
});

watch(
  () => route.query.status,
  (newStatus) => {
    if (newStatus !== statusFilter.value) {
      statusFilter.value = newStatus || "";
      loadOrders();
    }
  },
);

const loadOrders = async (page = 1) => {
  const params = {
    page,
    search: search.value,
    status: statusFilter.value,
    date_filter: dateFilter.value,
  };
  await ecommerceStore.fetchOrders(params);
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.lastPage) {
    loadOrders(page);
  }
};

const updateStatus = async (orderId, newStatus) => {
  try {
    await ecommerceStore.updateOrderStatus(orderId, { status: newStatus });
    // Recargar estadísticas y lista de pedidos
    await Promise.all([
      ecommerceStore.fetchOrderStats(),
      loadOrders(pagination.value.currentPage),
    ]);
  } catch (error) {
    console.error("Error updating status:", error);
    // Recargar para restaurar el estado anterior en el select
    await loadOrders(pagination.value.currentPage);
  }
};

const updatePaymentStatus = async (orderId, newStatus) => {
  try {
    await ecommerceService.updatePaymentStatus(orderId, {
      payment_status: newStatus,
    });
    toast.success("Estado de pago actualizado");
    await loadOrders(pagination.value.currentPage);
  } catch (error) {
    console.error("Error updating payment status:", error);
    toast.error(
      error.response?.data?.error?.message ||
        "Error al actualizar estado de pago",
    );
    await loadOrders(pagination.value.currentPage);
  }
};

const convertToSale = (order) => {
  orderToConvert.value = order;
  showConvertModal.value = true;
};

const confirmConvertToSale = async () => {
  if (!orderToConvert.value) return;

  converting.value = true;
  try {
    await ecommerceService.convertOrderToSale(orderToConvert.value.id);
    toast.success("Pedido convertido a venta exitosamente");
    showConvertModal.value = false;
    orderToConvert.value = null;
    loadOrders(pagination.value.currentPage);
  } catch (error) {
    toast.error(
      error.response?.data?.error?.message || "Error al convertir pedido",
    );
  } finally {
    converting.value = false;
  }
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("es-HN", {
    style: "currency",
    currency: "HNL",
  }).format(value || 0);
};

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-HN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusSelectClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    processing: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return classes[status] || classes.pending;
};

const getPaymentStatusClass = (status) => {
  const classes = {
    pending:
      "px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800",
    paid: "px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800",
    failed:
      "px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800",
    refunded:
      "px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800",
  };
  return classes[status] || classes.pending;
};

const getPaymentSelectClass = (status) => {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    paid: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800",
  };
  return classes[status] || classes.pending;
};

const getPaymentStatusLabel = (status) => {
  const labels = {
    pending: "Pendiente",
    paid: "Pagado",
    failed: "Fallido",
    refunded: "Reembolsado",
  };
  return labels[status] || status;
};
</script>
