<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside
      class="bg-gray-900 text-white transition-all duration-300 flex-shrink-0 flex flex-col"
      :class="sidebarOpen ? 'w-64' : 'w-20'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0">
        <h1 v-if="sidebarOpen" class="text-xl font-bold text-white">POS SaaS</h1>
        <h1 v-else class="text-xl font-bold text-white">PS</h1>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="text-gray-400 hover:text-white focus:outline-none"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav class="mt-4 px-2 flex-1 overflow-y-auto pb-4">
        <!-- Dashboard -->
        <router-link v-if="can('view_dashboard')" to="/dashboard" class="sidebar-link">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span v-if="sidebarOpen" class="ml-3">Dashboard</span>
        </router-link>

        <!-- POS -->
        <router-link v-if="can('access_pos')" to="/pos" class="sidebar-link">
          <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span v-if="sidebarOpen" class="ml-3">Punto de Venta</span>
        </router-link>

        <!-- Catálogo Section -->
        <div class="mt-4">
          <button @click="toggleSection('catalogo')"
                  class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1">
            <div class="flex items-center">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <span v-if="sidebarOpen" class="ml-3">Catálogo</span>
            </div>
            <svg v-if="sidebarOpen" class="w-4 h-4 transition-transform duration-200"
                 :class="{ 'rotate-180': expandedSections.catalogo }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <transition name="slide">
            <div v-if="expandedSections.catalogo && sidebarOpen" class="ml-4 space-y-1">
              <router-link v-if="can('view_products')" to="/products" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Productos
              </router-link>
              <router-link v-if="can('view_products')" to="/brands" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Marcas
              </router-link>
              <router-link v-if="can('view_categories')" to="/categories" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Categorías
              </router-link>
              <router-link v-if="can('view_customers')" to="/customers" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Clientes
              </router-link>
              <router-link v-if="can('view_products')" to="/suppliers" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Proveedores
              </router-link>
              <router-link v-if="can('view_products')" to="/units" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Unidades
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Ventas Section -->
        <div class="mt-2">
          <button @click="toggleSection('ventas')"
                  class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1">
            <div class="flex items-center">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span v-if="sidebarOpen" class="ml-3">Ventas</span>
            </div>
            <svg v-if="sidebarOpen" class="w-4 h-4 transition-transform duration-200"
                 :class="{ 'rotate-180': expandedSections.ventas }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <transition name="slide">
            <div v-if="expandedSections.ventas && sidebarOpen" class="ml-4 space-y-1">
              <router-link v-if="can('view_sales')" to="/sales" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Ventas
              </router-link>
              <router-link v-if="can('view_sales')" to="/quotations" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Cotizaciones
              </router-link>
              <router-link v-if="can('view_invoices')" to="/invoices" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Facturas
              </router-link>
              <router-link v-if="can('view_sales')" to="/returns" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Devoluciones
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Inventario Section -->
        <div class="mt-2">
          <button @click="toggleSection('inventario')"
                  class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1">
            <div class="flex items-center">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span v-if="sidebarOpen" class="ml-3">Inventario</span>
            </div>
            <svg v-if="sidebarOpen" class="w-4 h-4 transition-transform duration-200"
                 :class="{ 'rotate-180': expandedSections.inventario }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <transition name="slide">
            <div v-if="expandedSections.inventario && sidebarOpen" class="ml-4 space-y-1">
              <router-link v-if="can('view_inventory')" to="/inventory" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Inventario
              </router-link>
              <router-link v-if="can('view_purchases')" to="/purchases" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Compras
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Caja Section -->
        <div class="mt-2">
          <button @click="toggleSection('caja')"
                  class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1">
            <div class="flex items-center">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span v-if="sidebarOpen" class="ml-3">Caja</span>
            </div>
            <svg v-if="sidebarOpen" class="w-4 h-4 transition-transform duration-200"
                 :class="{ 'rotate-180': expandedSections.caja }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <transition name="slide">
            <div v-if="expandedSections.caja && sidebarOpen" class="ml-4 space-y-1">
              <router-link to="/cash-register" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Cajas Registradoras
              </router-link>
              <router-link v-if="can('view_expenses')" to="/expenses" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Gastos
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Administración Section -->
        <div class="mt-2">
          <button @click="toggleSection('administracion')"
                  class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1">
            <div class="flex items-center">
              <svg class="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span v-if="sidebarOpen" class="ml-3">Administración</span>
            </div>
            <svg v-if="sidebarOpen" class="w-4 h-4 transition-transform duration-200"
                 :class="{ 'rotate-180': expandedSections.administracion }"
                 fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <transition name="slide">
            <div v-if="expandedSections.administracion && sidebarOpen" class="ml-4 space-y-1">
              <router-link v-if="can('view_users')" to="/users" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Usuarios
              </router-link>
              <router-link v-if="can('view_roles')" to="/roles" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Roles
              </router-link>
              <router-link to="/audit-logs" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Auditoría
              </router-link>
              <router-link v-if="can('view_reports')" to="/reports" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Reportes
              </router-link>
              <router-link v-if="can('view_settings')" to="/settings" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Configuración
              </router-link>
            </div>
          </transition>
        </div>
      </nav>

      <!-- User Info at Bottom -->
      <div class="border-t border-gray-700/30 p-4 flex-shrink-0">
        <div v-if="sidebarOpen" class="flex items-center justify-between">
          <div class="flex items-center">
            <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
              {{ user?.name?.charAt(0).toUpperCase() }}
            </div>
            <div class="ml-3">
              <p class="text-sm font-medium text-white">{{ user?.name }}</p>
              <p class="text-xs text-gray-400">{{ user?.email }}</p>
            </div>
          </div>
          <button
            @click="handleLogout"
            class="text-gray-400 hover:text-white"
            title="Cerrar sesión"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
        <button v-else @click="handleLogout" class="w-full flex justify-center text-gray-400 hover:text-white">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header v-if="route.name !== 'pos'" class="bg-white shadow-sm h-16 flex items-center px-6">
        <div class="flex items-center justify-between w-full">
          <div>
            <h2 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h2>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Notifications Icon -->
            <router-link
              to="/notifications"
              class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notificaciones"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <!-- Unread count badge -->
              <span
                v-if="unreadCount > 0"
                class="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ unreadCount > 9 ? '9+' : unreadCount }}
              </span>
            </router-link>
            <span class="text-sm text-gray-600">{{ user?.company?.name }}</span>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50" :class="{ 'p-6': route.name !== 'pos' }">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { usePermissions } from '@/composables/usePermissions'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()
const { can } = usePermissions()
const { unreadCount } = storeToRefs(notificationStore)

const sidebarOpen = ref(true)
const expandedSections = ref({
  catalogo: false,
  ventas: false,
  inventario: false,
  caja: false,
  administracion: false
})

const user = computed(() => authStore.currentUser)

// Fetch notifications on mount and periodically
onMounted(() => {
  notificationStore.fetchNotifications()

  // Refresh notifications every 30 seconds
  setInterval(() => {
    notificationStore.fetchNotifications()
  }, 30000)
})

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section]
}

const pageTitle = computed(() => {
  const titles = {
    dashboard: 'Dashboard',
    pos: 'Punto de Venta',
    products: 'Productos',
    brands: 'Marcas',
    categories: 'Categorías',
    customers: 'Clientes',
    suppliers: 'Proveedores',
    units: 'Unidades de Medida',
    sales: 'Ventas',
    invoices: 'Facturas',
    inventory: 'Inventario',
    purchases: 'Compras',
    'cash-register': 'Cajas Registradoras',
    expenses: 'Gastos',
    users: 'Usuarios',
    roles: 'Roles y Permisos',
    'audit-logs': 'Registro de Auditoría',
    reports: 'Reportes',
    settings: 'Configuración'
  }
  return titles[route.name] || 'POS SaaS'
})

function handleLogout() {
  authStore.logout()
  router.push({ name: 'login' })
}
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center px-4 py-3 text-sm font-medium text-gray-300 rounded-lg hover:bg-gray-800 hover:text-white transition-colors duration-150 mb-1;
}

.sidebar-link.router-link-active {
  @apply bg-primary-600 text-white;
}

.sidebar-sublink {
  @apply flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors duration-150;
}

.sidebar-sublink.router-link-active {
  @apply text-primary-400 bg-gray-800/50;
}

/* Transitions for collapsible sections */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
  overflow: hidden;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
