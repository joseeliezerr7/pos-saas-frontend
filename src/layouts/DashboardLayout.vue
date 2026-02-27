<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Mobile Menu Overlay -->
    <div
      v-if="mobileMenuOpen"
      @click="mobileMenuOpen = false"
      class="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    ></div>

    <!-- Sidebar -->
    <aside
      class="bg-gray-900 text-white transition-all duration-300 flex-shrink-0 flex flex-col z-50"
      :class="[
        sidebarOpen ? 'w-64' : 'w-20',
        'hidden md:flex',
        mobileMenuOpen ? '!flex fixed inset-y-0 left-0 w-64' : '',
      ]"
    >
      <!-- Logo -->
      <div
        class="h-16 flex items-center justify-between px-4 border-b border-gray-800 flex-shrink-0"
      >
        <template v-if="sidebarOpen || mobileMenuOpen">
          <img
            v-if="companyLogoUrl"
            :src="companyLogoUrl"
            alt="Logo"
            class="h-10 max-w-[140px] object-contain"
          />
          <h1 v-else class="text-xl font-bold text-white">
            {{ authStore.currentUser?.company?.name || "POS SaaS" }}
          </h1>
        </template>
        <template v-else>
          <img
            v-if="companyLogoUrl"
            :src="companyLogoUrl"
            alt="Logo"
            class="h-8 w-8 object-contain"
          />
          <h1 v-else class="text-xl font-bold text-white">PS</h1>
        </template>
        <button
          @click="sidebarOpen = !sidebarOpen"
          class="hidden md:block text-gray-400 hover:text-white focus:outline-none"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        <button
          @click="mobileMenuOpen = false"
          class="md:hidden text-gray-400 hover:text-white focus:outline-none"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation Links -->
      <nav
        class="mt-4 px-2 flex-1 overflow-y-auto pb-4"
        @click="mobileMenuOpen = false"
      >
        <!-- Dashboard -->
        <router-link
          v-if="can('view_dashboard')"
          to="/dashboard"
          class="sidebar-link"
        >
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
            >Dashboard</span
          >
        </router-link>

        <!-- POS -->
        <router-link v-if="can('access_pos')" to="/pos" class="sidebar-link">
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
            >Punto de Venta</span
          >
        </router-link>

        <!-- Kitchen Display (KDS) -->
        <a
          v-if="isKdsEnabled"
          href="/kitchen"
          target="_blank"
          class="sidebar-link"
        >
          <svg
            class="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"
            />
          </svg>
          <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
            >Pantalla Cocina</span
          >
        </a>

        <!-- Catálogo Section -->
        <div v-if="canAny(['view_products', 'view_categories', 'view_customers', 'view_customer_groups', 'view_customer_tags', 'view_brands', 'view_suppliers', 'view_units'])" class="mt-4">
          <button
            @click="toggleSection('catalogo')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Catálogo</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.catalogo }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="
                expandedSections.catalogo && (sidebarOpen || mobileMenuOpen)
              "
              class="ml-4 space-y-1"
            >
              <router-link
                v-if="can('view_products')"
                to="/products"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Productos
              </router-link>
              <router-link
                v-if="can('print_labels')"
                to="/products/print-labels"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Imprimir Etiquetas
              </router-link>
              <router-link
                v-if="can('view_brands')"
                to="/brands"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Marcas
              </router-link>
              <router-link
                v-if="can('view_categories')"
                to="/categories"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Categorías
              </router-link>
              <router-link
                v-if="can('view_customers')"
                to="/customers"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Clientes
              </router-link>
              <router-link
                v-if="can('view_customer_groups')"
                to="/customer-groups"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Grupos de Clientes
              </router-link>
              <router-link
                v-if="can('view_customer_tags')"
                to="/customer-tags"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Tags de Clientes
              </router-link>
              <router-link
                v-if="can('view_suppliers')"
                to="/suppliers"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Proveedores
              </router-link>
              <router-link
                v-if="can('view_units')"
                to="/units"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Unidades
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Ventas Section -->
        <div v-if="canAny(['view_sales', 'view_invoices', 'view_quotations', 'view_returns', 'view_promotions', 'view_loyalty_program', 'view_gift_cards'])" class="mt-2">
          <button
            @click="toggleSection('ventas')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Ventas</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.ventas }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="expandedSections.ventas && (sidebarOpen || mobileMenuOpen)"
              class="ml-4 space-y-1"
            >
              <router-link
                v-if="can('view_sales')"
                to="/sales"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Ventas
              </router-link>
              <router-link
                v-if="can('view_quotations')"
                to="/quotations"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Cotizaciones
              </router-link>
              <router-link
                v-if="can('view_invoices')"
                to="/invoices"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Facturas
              </router-link>
              <router-link
                v-if="can('view_returns')"
                to="/returns"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Devoluciones
              </router-link>
              <router-link
                v-if="can('view_promotions')"
                to="/promotions"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Promociones
              </router-link>
              <router-link
                v-if="can('view_loyalty_program')"
                to="/loyalty/program"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Programa de Lealtad
              </router-link>
              <router-link
                v-if="can('view_gift_cards')"
                to="/gift-cards"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Gift Cards
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Crédito Section -->
        <div v-if="can('view_credit')" class="mt-2">
          <button
            @click="toggleSection('credito')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Crédito</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.credito }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="expandedSections.credito && (sidebarOpen || mobileMenuOpen)"
              class="ml-4 space-y-1"
            >
              <router-link
                v-if="can('view_credit')"
                to="/credit/dashboard"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Dashboard
              </router-link>
              <router-link
                v-if="can('view_credit')"
                to="/credit/payments"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Gestión de Pagos
              </router-link>
              <router-link
                v-if="can('view_credit')"
                to="/credit/accounts-receivable"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Cuentas por Cobrar
              </router-link>
              <router-link
                v-if="can('view_credit')"
                to="/credit/aging-report"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Reporte de Antigüedad
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Cuentas por Pagar Section -->
        <div v-if="canAny(['view_payable', 'view_purchases'])" class="mt-2">
          <button
            @click="toggleSection('cuentasPorPagar')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Cuentas por Pagar</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.cuentasPorPagar }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="
                expandedSections.cuentasPorPagar &&
                (sidebarOpen || mobileMenuOpen)
              "
              class="ml-4 space-y-1"
            >
              <router-link
                v-if="can('view_payable') || can('view_purchases')"
                to="/payable/dashboard"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Dashboard
              </router-link>
              <router-link
                v-if="can('view_payable') || can('view_purchases')"
                to="/payable/payments"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Pagos a Proveedores
              </router-link>
              <router-link
                v-if="can('view_payable') || can('view_purchases')"
                to="/payable/accounts-payable"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Cuentas por Pagar
              </router-link>
              <router-link
                v-if="can('view_payable') || can('view_purchases')"
                to="/payable/aging-report"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Reporte de Antigüedad
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Inventario Section -->
        <div v-if="canAny(['view_inventory', 'view_purchases'])" class="mt-2">
          <button
            @click="toggleSection('inventario')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Inventario</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.inventario }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="
                expandedSections.inventario && (sidebarOpen || mobileMenuOpen)
              "
              class="ml-4 space-y-1"
            >
              <router-link
                v-if="can('view_inventory')"
                to="/inventory"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Inventario
              </router-link>
              <router-link
                v-if="can('view_purchases')"
                to="/purchases"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Compras
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Caja Section -->
        <div v-if="canAny(['view_cash_registers', 'view_expenses'])" class="mt-2">
          <button
            @click="toggleSection('caja')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Caja</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.caja }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="expandedSections.caja && (sidebarOpen || mobileMenuOpen)"
              class="ml-4 space-y-1"
            >
              <router-link v-if="can('view_cash_registers')" to="/cash-register" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Cajas Registradoras
              </router-link>
              <router-link
                v-if="can('view_expenses')"
                to="/expenses"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Gastos
              </router-link>
            </div>
          </transition>
        </div>

        <!-- E-commerce Section (Solo Plan Empresarial) -->
        <div v-if="can('access_ecommerce')" class="mt-2">
          <button
            @click="toggleSection('ecommerce')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
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
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >E-commerce</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.ecommerce }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="
                expandedSections.ecommerce && (sidebarOpen || mobileMenuOpen)
              "
              class="ml-4 space-y-1"
            >
              <router-link to="/ecommerce" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Dashboard
              </router-link>
              <router-link
                v-if="can('view_ecommerce_orders')"
                to="/ecommerce/orders"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Pedidos
              </router-link>
              <router-link
                v-if="can('view_ecommerce_customers')"
                to="/ecommerce/customers"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Clientes Online
              </router-link>
              <router-link
                v-if="can('manage_ecommerce_products')"
                to="/ecommerce/catalog"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Catálogo
              </router-link>
              <router-link
                v-if="can('configure_ecommerce')"
                to="/ecommerce/settings"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Configuración
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Administración Section -->
        <div v-if="canAny(['view_users', 'view_roles', 'view_audit_logs', 'view_reports', 'view_settings', 'create_products', 'export_reports'])" class="mt-2">
          <button
            @click="toggleSection('administracion')"
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-150 mb-1"
          >
            <div class="flex items-center">
              <svg
                class="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
                >Administración</span
              >
            </div>
            <svg
              v-if="sidebarOpen || mobileMenuOpen"
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': expandedSections.administracion }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <transition name="slide">
            <div
              v-if="
                expandedSections.administracion &&
                (sidebarOpen || mobileMenuOpen)
              "
              class="ml-4 space-y-1"
            >
              <router-link
                v-if="can('view_users')"
                to="/users"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Usuarios
              </router-link>
              <router-link
                v-if="can('view_roles')"
                to="/roles"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Roles
              </router-link>
              <router-link v-if="can('view_audit_logs')" to="/audit-logs" class="sidebar-sublink">
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Auditoría
              </router-link>
              <router-link
                v-if="can('view_reports')"
                to="/reports"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Reportes
              </router-link>
              <router-link
                v-if="can('view_settings')"
                to="/settings"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Configuración
              </router-link>
              <router-link
                v-if="can('create_products') || can('export_reports')"
                to="/settings/import-export"
                class="sidebar-sublink"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-gray-500 mr-3"></span>
                Importar/Exportar
              </router-link>
            </div>
          </transition>
        </div>

        <!-- Super Admin Section -->
        <div v-if="isSuperAdmin" class="mt-4 pt-4 border-t border-gray-700">
          <div class="px-2 mb-2">
            <span
              class="text-xs font-semibold text-gray-400 uppercase tracking-wider"
              >Super Admin</span
            >
          </div>
          <router-link to="/super-admin/dashboard" class="sidebar-link">
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
              >Dashboard Global</span
            >
          </router-link>
          <router-link to="/super-admin/tenants" class="sidebar-link">
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
            <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
              >Gestión de Clientes</span
            >
          </router-link>
          <router-link to="/super-admin/plans" class="sidebar-link">
            <svg
              class="w-5 h-5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span v-if="sidebarOpen || mobileMenuOpen" class="ml-3"
              >Gestión de Planes</span
            >
          </router-link>
        </div>
      </nav>

      <!-- User Info at Bottom -->
      <div class="border-t border-gray-700/30 p-4 flex-shrink-0">
        <div
          v-if="sidebarOpen || mobileMenuOpen"
          class="flex items-center justify-between"
        >
          <div class="flex items-center">
            <div
              class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium"
            >
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
          </button>
        </div>
        <button
          v-else
          @click="handleLogout"
          class="w-full flex justify-center text-gray-400 hover:text-white"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top Header -->
      <header
        v-if="route.name !== 'pos'"
        class="bg-white shadow-sm h-16 flex items-center px-4 md:px-6"
      >
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center space-x-3">
            <!-- Mobile Hamburger Menu Button -->
            <button
              @click="mobileMenuOpen = true"
              class="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 class="text-xl font-semibold text-gray-800">{{ pageTitle }}</h2>
          </div>
          <div class="flex items-center space-x-4">
            <!-- Notifications Icon -->
            <router-link
              to="/notifications"
              class="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Notificaciones"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
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
                {{ unreadCount > 9 ? "9+" : unreadCount }}
              </span>
            </router-link>
            <!-- Tenant Selector Component -->
            <div class="hidden md:block max-w-xs">
              <TenantSelector :show-info-button="false" />
            </div>
            <!-- Mobile: Simple tenant name -->
            <span class="md:hidden text-sm text-gray-600">{{
              user?.company?.name
            }}</span>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main
        class="flex-1 overflow-y-auto bg-gray-50"
        :class="{ 'p-6': route.name !== 'pos' }"
      >
        <RouterView />
      </main>
    </div>

    <!-- PWA Install Prompt -->
    <InstallPWA />
  </div>
</template>

<script setup>
import InstallPWA from "@/components/InstallPWA.vue";
import TenantSelector from "@/components/common/TenantSelector.vue";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useSettingsStore } from "@/stores/settings";
import { usePermissions } from "@/composables/usePermissions";
import { storeToRefs } from "pinia";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();
const settingsStore = useSettingsStore();
const { can, canAny } = usePermissions();
const { unreadCount } = storeToRefs(notificationStore);

const isTablet = () => window.innerWidth >= 768 && window.innerWidth < 1280;
const sidebarOpen = ref(!isTablet());
const mobileMenuOpen = ref(false);

const handleResize = () => {
  if (isTablet()) {
    sidebarOpen.value = false;
  }
};
const expandedSections = ref({
  catalogo: false,
  ventas: false,
  credito: false,
  cuentasPorPagar: false,
  inventario: false,
  caja: false,
  ecommerce: false,
  administracion: false,
});

const user = computed(() => authStore.currentUser);

const companyLogoUrl = computed(() => {
  const company = authStore.currentUser?.company;
  if (company?.logo_url) return company.logo_url;
  if (company?.logo) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    return `${apiUrl.replace("/api", "")}/storage/${company.logo}`;
  }
  return null;
});

const isSuperAdmin = computed(() => {
  return (
    authStore.user?.is_super_admin ||
    authStore.user?.roles?.includes("super_admin")
  );
});

const isKdsEnabled = computed(() => {
  const s = settingsStore.companySettings?.settings;
  if (!s) return false;
  const parsed =
    typeof s === "string"
      ? (() => {
          try {
            return JSON.parse(s);
          } catch {
            return {};
          }
        })()
      : s;
  return parsed?.enable_kds === true;
});

// Refresh user data and notifications on mount
let notificationInterval = null;
onMounted(() => {
  authStore.fetchUser();

  // Fetch notifications silently - if user lacks permission, just skip
  notificationStore.fetchNotifications().catch(() => {});
  notificationInterval = setInterval(() => {
    notificationStore.fetchNotifications().catch(() => {});
  }, 30000);

  // Fetch company settings silently - may fail for restricted users
  settingsStore.fetchCompanySettings().catch(() => {});

  // Auto-collapse sidebar on tablet
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  if (notificationInterval) clearInterval(notificationInterval);
  window.removeEventListener('resize', handleResize);
});

const toggleSection = (section) => {
  expandedSections.value[section] = !expandedSections.value[section];
};

const pageTitle = computed(() => {
  const titles = {
    dashboard: "Dashboard",
    pos: "Punto de Venta",
    products: "Productos",
    "products-print-labels": "Imprimir Etiquetas",
    brands: "Marcas",
    categories: "Categorías",
    customers: "Clientes",
    suppliers: "Proveedores",
    units: "Unidades de Medida",
    sales: "Ventas",
    invoices: "Facturas",
    inventory: "Inventario",
    purchases: "Compras",
    "cash-register": "Cajas Registradoras",
    expenses: "Gastos",
    users: "Usuarios",
    roles: "Roles y Permisos",
    "audit-logs": "Registro de Auditoría",
    reports: "Reportes",
    settings: "Configuración",
    loyalty: "Programa de Lealtad",
    "gift-cards": "Gift Cards",
    "credit-dashboard": "Dashboard de Crédito",
    "credit-payments": "Gestión de Pagos",
    "credit-accounts-receivable": "Cuentas por Cobrar",
    "credit-aging-report": "Reporte de Antigüedad",
    "credit-customer-statement": "Estado de Cuenta",
    "payable-dashboard": "Dashboard Cuentas por Pagar",
    "payable-payments": "Pagos a Proveedores",
    "payable-accounts-payable": "Cuentas por Pagar",
    "payable-aging-report": "Antigüedad Cuentas por Pagar",
    "super-admin-dashboard": "Dashboard Global",
    "super-admin-tenants": "Gestión de Clientes",
    "super-admin-tenant-details": "Detalles del Cliente",
    "super-admin-plans": "Gestión de Planes",
    "ecommerce-dashboard": "E-commerce Dashboard",
    "ecommerce-orders": "Pedidos Online",
    "ecommerce-order-detail": "Detalle de Pedido",
    "ecommerce-customers": "Clientes Online",
    "ecommerce-customer-detail": "Detalle de Cliente",
    "ecommerce-catalog": "Catálogo E-commerce",
    "ecommerce-settings": "Configuración de Tienda",
    "kitchen-display": "Pantalla de Cocina",
  };
  return titles[route.name] || "POS SaaS";
});

function handleLogout() {
  authStore.logout();
  router.push({ name: "login" });
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
