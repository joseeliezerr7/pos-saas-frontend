# 🖥️ POS SaaS Frontend - Interfaz de Usuario Vue 3

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-green.svg)](https://vuejs.org)
[![Vite](https://img.shields.io/badge/Vite-5.x-purple.svg)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-blue.svg)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

Interfaz de usuario moderna y responsive para el Sistema POS SaaS, desarrollada con Vue 3, Composition API, Pinia y Tailwind CSS.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Tecnologías](#-tecnologías)
- [Requisitos](#-requisitos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [Build](#-build)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Componentes Principales](#-componentes-principales)
- [State Management](#-state-management)
- [Routing](#-routing)
- [Roadmap](#-roadmap)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

## ✨ Características

### Interfaz de Usuario
- 🎨 **Diseño Moderno** - UI limpia y profesional con Tailwind CSS
- 📱 **Responsive** - Funciona perfectamente en desktop, tablet y móvil
- ⚡ **Rápida** - Optimizada con Vite y lazy loading
- 🎯 **Intuitiva** - UX diseñada para facilidad de uso
- 🌙 **Modo Oscuro** - Preparado para dark mode (próximamente)

### Módulos Implementados
- 🏪 **POS Completo** - Interfaz de punto de venta con carrito
- 📦 **Productos** - CRUD completo con variantes, imágenes, categorías
- 📊 **Inventario** - Stock, ajustes, transferencias, movimientos
- 👥 **Clientes & Proveedores** - Gestión completa
- 💰 **Ventas** - Historial, detalles, búsqueda, filtros
- 🔄 **Devoluciones** - Proceso completo de returns
- 📝 **Cotizaciones** - Crear, editar, convertir a ventas
- 🛒 **Compras** - Órdenes de compra con workflow
- 💵 **Caja** - Apertura, cierre, transacciones
- 🧾 **Facturación** - Visualización, PDF, email
- 💳 **Gastos** - Tracking de gastos por categoría
- 📈 **Reportes** - Dashboard, ventas, inventario, financiero
- ⚙️ **Configuración** - Empresa, sucursales, usuarios, roles
- 🔔 **Notificaciones** - Sistema de notificaciones en tiempo real
- 📋 **Auditoría** - Logs de todas las acciones

### Características Técnicas
- ✅ **Composition API** - Vue 3 con setup script
- ✅ **State Management** - Pinia stores modulares
- ✅ **Router** - Vue Router con guards y lazy loading
- ✅ **HTTP Client** - Axios con interceptores
- ✅ **Formularios** - Validación y manejo de errores
- ✅ **Toasts** - Notificaciones elegantes con vue3-toastify
- ✅ **Modals** - Sistema de modales reutilizables
- ✅ **Loading States** - Spinners y skeletons
- ✅ **Error Handling** - Manejo centralizado de errores
- ✅ **Permissions** - Sistema de permisos granular

## 📸 Capturas de Pantalla

### Dashboard
![Dashboard](docs/screenshots/dashboard.png)
_Dashboard ejecutivo con estadísticas y gráficos en tiempo real_

### Punto de Venta (POS)
![POS](docs/screenshots/pos.png)
_Interfaz completa de punto de venta con búsqueda rápida de productos_

### Gestión de Productos
![Products](docs/screenshots/products.png)
_Lista de productos con filtros, búsqueda y acciones rápidas_

### Inventario
![Inventory](docs/screenshots/inventory.png)
_Control de inventario por sucursal con alertas de stock bajo_

## 🛠 Tecnologías

### Core
- **Vue.js 3.4+** - Framework progresivo de JavaScript
- **Vite 5.x** - Build tool ultra rápido
- **Pinia 2.x** - State management oficial de Vue
- **Vue Router 4.x** - Routing oficial de Vue

### UI & Estilos
- **Tailwind CSS 3.x** - Framework de utilidades CSS
- **PostCSS** - Transformación de CSS
- **Heroicons** - Iconos SVG

### Utilidades
- **Axios** - Cliente HTTP
- **Vue3-Toastify** - Notificaciones toast
- **VeeValidate** - Validación de formularios (próximamente)
- **Chart.js** - Gráficos (próximamente)

### Desarrollo
- **ESLint** - Linting de código
- **Prettier** - Formateo de código
- **Vite Plugin Vue** - Plugin oficial de Vue para Vite

## 📋 Requisitos

- Node.js >= 18.x
- npm >= 9.x (o yarn/pnpm)
- Backend API corriendo (pos-saas-backend)

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/joseeliezerr7/pos-saas-frontend.git
cd pos-saas-frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env`:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME="POS SaaS"
VITE_APP_VERSION=1.0.0
```

## ⚙️ Configuración

### API URL

El frontend se comunica con el backend Laravel a través de la variable `VITE_API_URL`. Asegúrate de que:

1. El backend está corriendo en `http://localhost:8000`
2. Las rutas de API están configuradas correctamente
3. CORS está habilitado en el backend

### Autenticación

El sistema usa Laravel Sanctum con Bearer tokens:

```javascript
// Ejemplo de login
const response = await authService.login({
  email: 'admin@example.com',
  password: 'password'
})

// El token se guarda automáticamente en localStorage
// y se incluye en todas las peticiones subsecuentes
```

## 💻 Desarrollo

### Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Hot Module Replacement (HMR)

Vite proporciona HMR ultra rápido. Los cambios se reflejan instantáneamente sin recargar la página.

### Comandos Útiles

```bash
# Desarrollo con HMR
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint

# Format código
npm run format
```

## 🏗️ Build

### Build de Producción

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`.

### Preview del Build

```bash
npm run preview
```

Sirve los archivos de producción localmente para testing.

### Optimizaciones

- ✅ Code splitting automático
- ✅ Tree shaking
- ✅ Minificación
- ✅ Compresión de assets
- ✅ Lazy loading de rutas
- ✅ Lazy loading de componentes

## 📁 Estructura del Proyecto

```
pos-saas-frontend/
├── public/                 # Assets estáticos
├── src/
│   ├── assets/            # Recursos (CSS, imágenes)
│   │   └── css/
│   │       └── tailwind.css
│   ├── components/        # Componentes reutilizables
│   │   ├── common/       # Componentes comunes
│   │   │   ├── AlertMessage.vue
│   │   │   ├── ConfirmDialog.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   └── ModalDialog.vue
│   │   └── pos/          # Componentes específicos de POS
│   ├── composables/       # Composables de Vue
│   │   └── usePermissions.js
│   ├── layouts/          # Layouts de página
│   │   ├── AuthLayout.vue
│   │   └── DashboardLayout.vue
│   ├── router/           # Configuración de rutas
│   │   └── index.js
│   ├── services/         # Servicios de API
│   │   ├── api.js       # Configuración base de Axios
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── saleService.js
│   │   └── ... (27 servicios)
│   ├── stores/           # Pinia stores
│   │   ├── auth.js
│   │   ├── product.js
│   │   ├── cart.js
│   │   └── ... (23 stores)
│   ├── views/            # Vistas/Páginas
│   │   ├── auth/        # Autenticación
│   │   ├── dashboard/   # Dashboard
│   │   ├── products/    # Productos
│   │   ├── pos/         # Punto de Venta
│   │   ├── sales/       # Ventas
│   │   ├── inventory/   # Inventario
│   │   └── ... (15+ módulos)
│   ├── App.vue          # Componente raíz
│   └── main.js          # Entry point
├── .env.example         # Variables de entorno ejemplo
├── .gitignore          # Git ignore
├── index.html          # HTML template
├── package.json        # Dependencias
├── postcss.config.js   # PostCSS config
├── tailwind.config.js  # Tailwind config
├── vite.config.js      # Vite config
└── ROADMAP.md         # Roadmap de desarrollo
```

## 🧩 Componentes Principales

### Comunes

#### ModalDialog.vue
```vue
<ModalDialog
  :show="showModal"
  title="Título del Modal"
  @close="showModal = false"
  size="large"
>
  <p>Contenido del modal</p>
</ModalDialog>
```

#### LoadingSpinner.vue
```vue
<LoadingSpinner text="Cargando datos..." />
```

#### ConfirmDialog.vue
```vue
<ConfirmDialog
  :show="showConfirm"
  title="Confirmar Acción"
  message="¿Estás seguro?"
  @confirm="handleConfirm"
  @cancel="showConfirm = false"
/>
```

### Layouts

#### DashboardLayout
- Sidebar con navegación
- Header con usuario y notificaciones
- Área de contenido principal
- Breadcrumbs

#### AuthLayout
- Diseño centrado para login/registro
- Branding
- Formularios de autenticación

## 🗄️ State Management

### Pinia Stores

El estado global se maneja con Pinia. Ejemplo de un store:

```javascript
// stores/product.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import productService from '@/services/productService'

export const useProductStore = defineStore('product', () => {
  const products = ref([])
  const loading = ref(false)

  async function fetchProducts() {
    loading.value = true
    try {
      const response = await productService.getAll()
      products.value = response.data.data
    } catch (error) {
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    fetchProducts
  }
})
```

### Stores Disponibles

- **auth** - Autenticación y usuario actual
- **product** - Catálogo de productos
- **cart** - Carrito de compras (POS)
- **sale** - Ventas
- **stock** - Inventario
- **customer** - Clientes
- **cashRegister** - Caja registradora
- ... y 16 más

## 🛣️ Routing

### Estructura de Rutas

```javascript
const routes = [
  {
    path: '/',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'dashboard', component: Dashboard },
      { path: 'pos', name: 'pos', component: POS },
      { path: 'products', name: 'products', component: ProductIndex },
      // ... más rutas
    ]
  },
  {
    path: '/login',
    component: AuthLayout,
    children: [
      { path: '', name: 'login', component: Login }
    ]
  }
]
```

### Navigation Guards

```javascript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})
```

### Lazy Loading

Todas las rutas usan lazy loading para optimizar el bundle size:

```javascript
{
  path: 'products',
  component: () => import('@/views/products/ProductIndex.vue')
}
```

## 🗺️ Roadmap

Ver el archivo [ROADMAP.md](ROADMAP.md) para el plan de desarrollo completo.

### Próximas Funcionalidades (Q1 2025)

#### FASE 1 - Crítico (2-3 meses)
- [ ] Módulo de Promociones y Descuentos
- [ ] Importación/Exportación de datos (CSV)
- [ ] Generador de códigos de barras
- [ ] Mejoras de UX en formularios

#### FASE 2 - Importante (3-6 meses)
- [ ] Programa de Lealtad/Puntos
- [ ] Gift Cards
- [ ] Reportes Financieros Avanzados
- [ ] Integraciones de Pago (Stripe, PayPal)

#### FASE 3 - Crecimiento (6-12 meses)
- [ ] App Móvil (React Native/Flutter)
- [ ] Análisis Predictivo de Inventario
- [ ] Segmentación de Clientes
- [ ] Multi-idioma completo

### Mejoras de UI/UX Pendientes

- [ ] Dark mode completo
- [ ] Animaciones de transición mejoradas
- [ ] Skeleton loaders
- [ ] Tutorial/onboarding para nuevos usuarios
- [ ] Atajos de teclado
- [ ] Búsqueda global (Cmd+K style)

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Desarrollo

- Usar Vue 3 Composition API con `<script setup>`
- Seguir convenciones de nomenclatura de Vue
- Componentes reutilizables en `components/`
- Vistas específicas en `views/`
- Usar Tailwind CSS para estilos
- Mantener stores pequeños y enfocados
- Documentar funciones complejas

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👨‍💻 Autor

**Jose Eliezer Rodriguez**
- GitHub: [@joseeliezerr7](https://github.com/joseeliezerr7)

## 🔗 Enlaces

- **Backend Repository:** [pos-saas-backend](https://github.com/joseeliezerr7/pos-saas-backend)
- **Vue.js Docs:** https://vuejs.org
- **Tailwind CSS:** https://tailwindcss.com
- **Pinia:** https://pinia.vuejs.org

## 📞 Soporte

Para reportar bugs o solicitar features:
- Abrir un [Issue](https://github.com/joseeliezerr7/pos-saas-frontend/issues)
- Email: soporte@example.com

## 📊 Estado del Proyecto

**Estado Actual:** ✅ Production Ready

- ✅ Core UI: 100%
- ✅ Módulos Principales: 100%
- ⚠️ UX Enhancements: 60%
- ❌ Advanced Features: 20%

Sistema completamente funcional con todas las vistas principales implementadas. Mejoras de UX y features avanzadas en desarrollo.

---

**Desarrollado con ❤️ usando Vue 3 y Tailwind CSS**
