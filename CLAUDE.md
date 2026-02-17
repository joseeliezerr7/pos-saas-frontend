# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

POS SaaS Frontend - A multi-tenant Point of Sale system built with Vue 3, Pinia, and Tailwind CSS. The frontend communicates with a Laravel backend API (`pos-saas-backend/`).

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Build
npm run build        # Production build to dist/
npm run preview      # Preview production build locally

# Testing
npm run test         # Run tests with Vitest
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Run tests with coverage

# Code Quality
npm run lint         # ESLint with auto-fix
npm run format       # Prettier formatting
```

## Architecture

### Multi-Tenancy
- The system is multi-tenant with tenant isolation via HTTP headers
- `src/services/api.js` adds `X-Company-ID`, `X-Tenant-ID`, `X-Branch-ID` headers to all authenticated requests
- The auth store (`src/stores/auth.js`) manages tokens and user company/tenant data
- Router guards validate subscription status and redirect to subscription settings if inactive

### State Management (Pinia)
- Stores in `src/stores/` follow composition API pattern with `defineStore`
- Auth store handles login, token refresh, logout, and permission checks
- Each domain has its own store (product, sale, customer, cart, etc.)
- Stores call corresponding services for API communication

### API Layer
- `src/services/api.js` - Axios instance with interceptors for auth tokens and error handling
- Individual services (e.g., `productService.js`, `saleService.js`) wrap specific API endpoints
- Token refresh is automatic on 401 responses with request queuing

### Routing
- `src/router/index.js` uses lazy loading for all routes
- Navigation guards check: authentication, super admin status, company active status, subscription validity, and permissions
- Route meta options: `requiresAuth`, `requiresSuperAdmin`, `guest`, `public`, `permission`, `permissions`
- Public store routes (`/store/:storeSlug/*`) don't require authentication

### Permission System
- Use `usePermissions()` composable for permission checks in components
- Methods: `can(permission)`, `canAny(permissions)`, `canAll(permissions)`, `hasRole(role)`
- Permissions are loaded from user data on login

### Layouts
- `DashboardLayout.vue` - Main authenticated layout with sidebar navigation
- `AuthLayout.vue` - Login/register pages
- `StoreLayout.vue` - Public e-commerce storefront

### Common Components
Located in `src/components/common/`:
- `ModalDialog.vue` - Modal wrapper with size variants
- `ConfirmDialog.vue` - Confirmation prompts
- `LoadingSpinner.vue` - Loading states
- `AlertMessage.vue` - Alert notifications
- `TenantSelector.vue` - Tenant switching (super admin)

### Tailwind Configuration
Custom color scales defined in `tailwind.config.js`:
- `primary` - Blue scale (primary actions)
- `success`, `warning`, `danger` - Semantic colors

## Environment Variables

```
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=POS SaaS
VITE_APP_VERSION=1.0.0
```

## Key Patterns

### Vue Components
- Use `<script setup>` with Composition API
- Import stores with `useXxxStore()` pattern
- Use `vue3-toastify` for notifications via `toast.success()`, `toast.error()`

### Service Pattern
```javascript
import api from '@/services/api'
export default {
  getAll: () => api.get('/endpoint'),
  create: (data) => api.post('/endpoint', data)
}
```

### Store Pattern
```javascript
export const useXxxStore = defineStore('xxx', () => {
  const items = ref([])
  const loading = ref(false)
  async function fetch() { /* ... */ }
  return { items, loading, fetch }
})
```
