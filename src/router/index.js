import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      component: () => import('@/layouts/AuthLayout.vue'),
      children: [
        {
          path: 'login',
          name: 'login',
          component: () => import('@/views/auth/Login.vue'),
          meta: { guest: true }
        },
        {
          path: 'register',
          name: 'register',
          component: () => import('@/views/auth/Register.vue'),
          meta: { guest: true }
        },
        {
          path: 'forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/auth/ForgotPassword.vue'),
          meta: { guest: true }
        }
      ]
    },
    {
      path: '/',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard'
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue')
        },
        {
          path: 'pos',
          name: 'pos',
          component: () => import('@/views/pos/POS.vue'),
          meta: { title: 'Punto de Venta' }
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/products/ProductList.vue')
        },
        {
          path: 'products/:id/variants',
          name: 'product-variants',
          component: () => import('@/views/products/ProductVariants.vue')
        },
        {
          path: 'categories',
          name: 'categories',
          component: () => import('@/views/categories/CategoryList.vue')
        },
        {
          path: 'customers',
          name: 'customers',
          component: () => import('@/views/customers/CustomerList.vue')
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@/views/sales/SalesIndex.vue')
        },
        {
          path: 'sales/:id',
          name: 'sale-detail',
          component: () => import('@/views/sales/SaleDetail.vue')
        },
        {
          path: 'invoices',
          name: 'invoices',
          component: () => import('@/views/invoices/InvoiceIndex.vue')
        },
        {
          path: 'invoices/:id',
          name: 'invoice-detail',
          component: () => import('@/views/invoices/InvoiceDetail.vue')
        },
        {
          path: 'returns',
          name: 'returns',
          component: () => import('@/views/returns/ReturnsIndex.vue')
        },
        {
          path: 'returns/create',
          name: 'returns-create',
          component: () => import('@/views/returns/ReturnCreate.vue')
        },
        {
          path: 'inventory',
          component: () => import('@/views/inventory/index.vue'),
          redirect: '/inventory',
          children: [
            {
              path: '',
              name: 'inventory',
              component: () => import('@/views/inventory/InventoryIndex.vue')
            },
            {
              path: 'stock',
              name: 'inventory-stock',
              component: () => import('@/views/inventory/InventoryStock.vue')
            },
            {
              path: 'movements',
              name: 'inventory-movements',
              component: () => import('@/views/inventory/InventoryMovements.vue')
            },
            {
              path: 'adjustments',
              name: 'inventory-adjustments',
              component: () => import('@/views/inventory/InventoryAdjustments.vue')
            },
            {
              path: 'adjustments/create',
              name: 'inventory-adjustments-create',
              component: () => import('@/views/inventory/InventoryAdjustmentCreate.vue')
            },
            {
              path: 'adjustments/:id',
              name: 'inventory-adjustments-detail',
              component: () => import('@/views/inventory/InventoryAdjustmentDetail.vue')
            },
            {
              path: 'transfers',
              name: 'inventory-transfers',
              component: () => import('@/views/inventory/InventoryTransfers.vue')
            }
          ]
        },
        {
          path: 'purchases',
          name: 'purchases',
          component: () => import('@/views/purchases/PurchaseIndex.vue')
        },
        {
          path: 'purchases/create',
          name: 'purchases-create',
          component: () => import('@/views/purchases/PurchaseCreate.vue')
        },
        {
          path: 'purchases/:id',
          name: 'purchase-detail',
          component: () => import('@/views/purchases/PurchaseShow.vue')
        },
        {
          path: 'purchases/:id/edit',
          name: 'purchase-edit',
          component: () => import('@/views/purchases/PurchaseCreate.vue')
        },
        {
          path: 'expenses',
          name: 'expenses',
          component: () => import('@/views/expenses/ExpenseList.vue')
        },
        {
          path: 'quotations',
          component: () => import('@/views/quotations/index.vue'),
          children: [
            {
              path: '',
              name: 'quotations',
              component: () => import('@/views/quotations/QuotationList.vue')
            },
            {
              path: 'create',
              name: 'quotations-create',
              component: () => import('@/views/quotations/QuotationCreate.vue')
            },
            {
              path: ':id',
              name: 'quotation-detail',
              component: () => import('@/views/quotations/QuotationDetail.vue')
            },
            {
              path: ':id/edit',
              name: 'quotation-edit',
              component: () => import('@/views/quotations/QuotationCreate.vue')
            }
          ]
        },
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('@/views/suppliers/SupplierList.vue')
        },
        {
          path: 'brands',
          name: 'brands',
          component: () => import('@/views/brands/BrandList.vue')
        },
        {
          path: 'units',
          name: 'units',
          component: () => import('@/views/units/UnitList.vue')
        },
        {
          path: 'cash-register',
          name: 'cash-register',
          component: () => import('@/views/cash-register/CashRegisterIndex.vue')
        },
        {
          path: 'cash-register/:id/history',
          name: 'cash-register-history',
          component: () => import('@/views/cash-register/CashRegisterHistory.vue')
        },
        {
          path: 'cash-register-reports',
          name: 'cash-register-reports',
          component: () => import('@/views/cash-register/CashRegisterReports.vue')
        },
        {
          path: 'reports',
          component: () => import('@/views/reports/index.vue'),
          redirect: '/reports',
          children: [
            {
              path: '',
              name: 'reports',
              component: () => import('@/views/reports/ReportsIndex.vue')
            },
            {
              path: 'sales',
              name: 'reports-sales',
              component: () => import('@/views/reports/SalesReport.vue')
            },
            {
              path: 'inventory',
              name: 'reports-inventory',
              component: () => import('@/views/reports/InventoryReport.vue')
            },
            {
              path: 'financial',
              name: 'reports-financial',
              component: () => import('@/views/reports/FinancialReport.vue')
            }
          ]
        },
        {
          path: 'users',
          name: 'users',
          component: () => import('@/views/users/UserList.vue')
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/views/roles/RoleList.vue')
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('@/views/audit/AuditLogList.vue')
        },
        {
          path: 'notifications',
          name: 'notifications',
          component: () => import('@/views/notifications/NotificationList.vue')
        },
        {
          path: 'settings',
          component: () => import('@/views/settings/index.vue'),
          redirect: '/settings/company',
          children: [
            {
              path: 'company',
              name: 'settings-company',
              component: () => import('@/views/settings/CompanySettings.vue')
            },
            {
              path: 'branches',
              name: 'settings-branches',
              component: () => import('@/views/settings/BranchSettings.vue')
            },
            {
              path: 'fiscal',
              name: 'settings-fiscal',
              component: () => import('@/views/settings/FiscalSettings.vue')
            },
            {
              path: 'subscription',
              name: 'settings-subscription',
              component: () => import('@/views/settings/Subscription.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFound.vue')
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
