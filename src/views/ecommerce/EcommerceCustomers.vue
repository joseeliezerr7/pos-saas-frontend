<template>
  <div class="space-y-6">
    <!-- Header -->
    <div
      class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Clientes Online</h1>
        <p class="text-gray-600">
          Gestiona los clientes registrados en tu tienda online
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <input
            v-model="search"
            type="text"
            placeholder="Buscar por nombre, email o telefono..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @input="debouncedSearch"
          />
        </div>
        <div class="flex gap-2">
          <select
            v-model="statusFilter"
            @change="loadCustomers"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="pending">Pendiente</option>
            <option value="suspended">Suspendido</option>
          </select>
          <select
            v-model="typeFilter"
            @change="loadCustomers"
            class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            <option value="retail">Minorista</option>
            <option value="wholesale">Mayorista</option>
            <option value="b2b">B2B</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Customers Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div v-if="loading" class="p-8 text-center">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"
        ></div>
        <p class="text-gray-500 mt-2">Cargando clientes...</p>
      </div>
      <div
        v-else-if="customers.length === 0"
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p>No se encontraron clientes</p>
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Cliente
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Tipo
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Pedidos
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Total Compras
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Estado
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
              >
                Registro
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
              v-for="customer in customers"
              :key="customer.id"
              class="hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0"
                  >
                    <span class="text-blue-600 font-medium">{{
                      getInitials(customer.name)
                    }}</span>
                  </div>
                  <div class="ml-4">
                    <p class="font-medium text-gray-900">{{ customer.name }}</p>
                    <p class="text-sm text-gray-500">{{ customer.email }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getTypeClass(customer.type)">
                  {{ getTypeLabel(customer.type) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {{ customer.orders_count || 0 }} pedidos
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                {{ formatCurrency(customer.total_spent || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select
                  :value="customer.status"
                  @change="updateStatus(customer.id, $event.target.value)"
                  :class="getStatusSelectClass(customer.status)"
                  class="text-xs font-medium rounded-full px-3 py-1 border-0 cursor-pointer"
                >
                  <option value="active">Activo</option>
                  <option value="pending">Pendiente</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(customer.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <router-link
                    :to="`/ecommerce/customers/${customer.id}`"
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
import { ref, computed, onMounted } from "vue";
import { useEcommerceStore } from "@/stores/ecommerce";
import { storeToRefs } from "pinia";

const ecommerceStore = useEcommerceStore();
const { customers, customersPagination, loading } = storeToRefs(ecommerceStore);

const search = ref("");
const statusFilter = ref("");
const typeFilter = ref("");

const pagination = computed(() => customersPagination.value);

let searchTimeout = null;
const debouncedSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadCustomers();
  }, 300);
};

onMounted(() => {
  loadCustomers();
});

const loadCustomers = async (page = 1) => {
  const params = {
    page,
    search: search.value,
    status: statusFilter.value,
    type: typeFilter.value,
  };
  await ecommerceStore.fetchCustomers(params);
};

const goToPage = (page) => {
  if (page >= 1 && page <= pagination.value.lastPage) {
    loadCustomers(page);
  }
};

const updateStatus = async (customerId, newStatus) => {
  try {
    await ecommerceStore.updateCustomerStatus(customerId, newStatus);
  } catch (error) {
    console.error("Error updating status:", error);
  }
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
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
    year: "numeric",
  });
};

const getTypeClass = (type) => {
  const classes = {
    retail:
      "px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800",
    wholesale:
      "px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800",
    b2b: "px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800",
  };
  return classes[type] || classes.retail;
};

const getTypeLabel = (type) => {
  const labels = {
    retail: "Minorista",
    wholesale: "Mayorista",
    b2b: "B2B",
  };
  return labels[type] || type;
};

const getStatusSelectClass = (status) => {
  const classes = {
    active: "bg-green-100 text-green-800",
    pending: "bg-yellow-100 text-yellow-800",
    suspended: "bg-red-100 text-red-800",
  };
  return classes[status] || classes.active;
};
</script>
