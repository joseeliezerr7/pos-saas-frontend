import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'
import { usePermissions } from '@/composables/usePermissions'
import { getCurrentTenantSlug } from '@/utils/tenant'

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
          path: 'products/print-labels',
          name: 'products-print-labels',
          component: () => import('@/views/products/PrintLabels.vue'),
          meta: { permission: 'generate_barcodes' }
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
          path: 'customer-groups',
          name: 'customer-groups',
          component: () => import('@/views/customers/CustomerGroups.vue'),
          meta: { permission: 'view_customer_groups' }
        },
        {
          path: 'customer-tags',
          name: 'customer-tags',
          component: () => import('@/views/customers/CustomerTags.vue'),
          meta: { permission: 'view_customer_tags' }
        },
        {
          path: 'loyalty/program',
          name: 'loyalty-program',
          component: () => import('@/views/loyalty/LoyaltyProgram.vue'),
          meta: { permission: 'view_loyalty_program' }
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
          component: () => import('@/views/returns/ReturnsIndex.vue'),
          meta: { permission: 'view_returns' }
        },
        {
          path: 'returns/create',
          name: 'returns-create',
          component: () => import('@/views/returns/ReturnCreate.vue'),
          meta: { permission: 'create_returns' }
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
          meta: { permission: 'view_quotations' },
          children: [
            {
              path: '',
              name: 'quotations',
              component: () => import('@/views/quotations/QuotationList.vue')
            },
            {
              path: 'create',
              name: 'quotations-create',
              component: () => import('@/views/quotations/QuotationCreate.vue'),
              meta: { permission: 'create_quotations' }
            },
            {
              path: ':id',
              name: 'quotation-detail',
              component: () => import('@/views/quotations/QuotationDetail.vue')
            },
            {
              path: ':id/edit',
              name: 'quotation-edit',
              component: () => import('@/views/quotations/QuotationCreate.vue'),
              meta: { permission: 'edit_quotations' }
            }
          ]
        },
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('@/views/suppliers/SupplierList.vue'),
          meta: { permission: 'view_suppliers' }
        },
        {
          path: 'brands',
          name: 'brands',
          component: () => import('@/views/brands/BrandList.vue'),
          meta: { permission: 'view_brands' }
        },
        {
          path: 'units',
          name: 'units',
          component: () => import('@/views/units/UnitList.vue'),
          meta: { permission: 'view_units' }
        },
        {
          path: 'promotions',
          name: 'promotions',
          component: () => import('@/views/promotions/PromotionList.vue'),
          meta: { permission: 'view_promotions' }
        },
        {
          path: 'loyalty',
          name: 'loyalty',
          component: () => import('@/views/loyalty/LoyaltyProgram.vue'),
          meta: { permission: 'view_loyalty_program' }
        },
        {
          path: 'gift-cards',
          name: 'gift-cards',
          component: () => import('@/views/giftcards/GiftCards.vue'),
          meta: { permission: 'view_gift_cards' }
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
          path: 'credit',
          component: () => import('@/views/credit/index.vue'),
          redirect: '/credit/dashboard',
          meta: { permission: 'view_credit' },
          children: [
            {
              path: 'dashboard',
              name: 'credit-dashboard',
              component: () => import('@/views/credit/CreditDashboard.vue')
            },
            {
              path: 'payments',
              name: 'credit-payments',
              component: () => import('@/views/credit/PaymentsIndex.vue')
            },
            {
              path: 'accounts-receivable',
              name: 'credit-accounts-receivable',
              component: () => import('@/views/credit/AccountsReceivable.vue')
            },
            {
              path: 'aging-report',
              name: 'credit-aging-report',
              component: () => import('@/views/credit/AgingReport.vue')
            },
            {
              path: 'customer-statement/:customerId',
              name: 'credit-customer-statement',
              component: () => import('@/views/credit/CustomerStatement.vue')
            }
          ]
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
          component: () => import('@/views/users/UserList.vue'),
          meta: { permission: 'view_users' }
        },
        {
          path: 'roles',
          name: 'roles',
          component: () => import('@/views/roles/RoleList.vue'),
          meta: { permission: 'view_roles' }
        },
        {
          path: 'audit-logs',
          name: 'audit-logs',
          component: () => import('@/views/audit/AuditLogList.vue'),
          meta: { permission: 'view_audit_logs' }
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
            },
            {
              path: 'import-export',
              name: 'settings-import-export',
              component: () => import('@/views/settings/ImportExport.vue'),
              meta: { permissions: ['import_products', 'export_data'] }
            }
          ]
        }
      ]
    },
    // Super Admin Routes
    {
      path: '/super-admin',
      component: () => import('@/layouts/DashboardLayout.vue'),
      meta: { requiresAuth: true, requiresSuperAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'super-admin-dashboard',
          component: () => import('@/views/super-admin/SuperAdminDashboard.vue')
        },
        {
          path: 'tenants',
          name: 'super-admin-tenants',
          component: () => import('@/views/super-admin/TenantsList.vue')
        },
        {
          path: 'tenants/:id',
          name: 'super-admin-tenant-details',
          component: () => import('@/views/super-admin/TenantDetails.vue')
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
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const tenantStore = useTenantStore()

  // Check authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login' })
    return
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }

  // Super Admin validation
  if (to.meta.requiresSuperAdmin) {
    if (!authStore.user?.is_super_admin && !authStore.user?.roles?.includes('super_admin')) {
      console.warn('[Router] User is not Super Admin')
      next({ name: 'dashboard' })
      return
    }
    // Super admins skip tenant validation
    next()
    return
  }

  // Tenant validation for authenticated users (skip for Super Admin)
  if (authStore.isAuthenticated && to.meta.requiresAuth) {
    const isSuperAdmin = authStore.user?.is_super_admin ||
                        authStore.user?.roles?.includes('super_admin')

    // Ensure tenant is loaded from user's company
    if (!tenantStore.currentTenant && authStore.user?.company) {
      console.log('[Router] Initializing tenant from user company')
      tenantStore.setTenant(authStore.user.company)
    }

    // Skip tenant validation for Super Admin
    if (!isSuperAdmin) {
      // Validate tenant slug from domain matches user's company
      const domainTenantSlug = getCurrentTenantSlug()
      if (domainTenantSlug && domainTenantSlug !== 'default') {
        // In production with subdomains, validate the domain matches user's company
        if (tenantStore.currentTenant?.slug &&
            domainTenantSlug !== tenantStore.currentTenant.slug) {
          console.error('[Router] Tenant mismatch detected!')
          console.error('Domain tenant:', domainTenantSlug)
          console.error('User tenant:', tenantStore.currentTenant.slug)

          // Logout user and redirect to login
          authStore.logout()
          next({
            name: 'login',
            query: {
              error: 'tenant_mismatch',
              message: 'No tienes acceso a esta empresa'
            }
          })
          return
        }
      }

      // Validate user belongs to the current tenant
      if (tenantStore.tenantId && authStore.user?.company_id) {
        if (tenantStore.tenantId !== authStore.user.company_id) {
          console.error('[Router] User does not belong to current tenant')

          // Clear tenant and logout
          tenantStore.clearTenant()
          authStore.logout()
          next({
            name: 'login',
            query: {
              error: 'unauthorized_tenant',
              message: 'Acceso no autorizado a esta empresa'
            }
          })
          return
        }
      }

      // Validate company is active
      if (authStore.user?.company && !authStore.user.company.is_active) {
        console.warn('[Router] Company is not active')
        next({
          name: 'dashboard',
          query: {
            warning: 'company_inactive',
            message: 'Tu empresa está inactiva. Contacta al administrador.'
          }
        })
        return
      }
    } else {
      console.log('[Router] Super Admin detected - skipping tenant validation')
    }
  }

  // Check permissions
  if ((to.meta.permission || to.meta.permissions) && authStore.isAuthenticated) {
    const { can } = usePermissions()

    // Handle single permission
    if (to.meta.permission && !can(to.meta.permission)) {
      next({ name: 'dashboard' })
      return
    }

    // Handle multiple permissions (user needs at least one)
    if (to.meta.permissions) {
      const hasPermission = to.meta.permissions.some(permission => can(permission))
      if (!hasPermission) {
        next({ name: 'dashboard' })
        return
      }
    }
  }

  next()
})

export default router
