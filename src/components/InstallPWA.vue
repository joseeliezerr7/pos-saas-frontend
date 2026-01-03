<template>
  <!-- Install PWA Button - Floating -->
  <transition name="slide-up">
    <div
      v-if="showInstallPrompt && !isInstalled"
      class="fixed bottom-6 right-6 z-50 max-w-sm"
    >
      <div class="bg-white rounded-lg shadow-2xl border-2 border-primary-500 p-4">
        <div class="flex items-start space-x-3">
          <!-- Icon -->
          <div class="flex-shrink-0">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
              <svg class="w-7 h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-semibold text-gray-900 mb-1">
              Instalar POS SaaS
            </h3>
            <p class="text-xs text-gray-600 mb-3">
              Instala la app en tu dispositivo para acceso rápido y uso offline
            </p>

            <!-- Buttons -->
            <div class="flex space-x-2">
              <button
                @click="installPWA"
                class="flex-1 bg-primary-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Instalar
              </button>
              <button
                @click="dismissPrompt"
                class="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Ahora no
              </button>
            </div>
          </div>

          <!-- Close button -->
          <button
            @click="dismissPrompt"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Update Available Notification -->
  <transition name="slide-up">
    <div
      v-if="showUpdatePrompt"
      class="fixed bottom-6 left-6 z-50 max-w-sm"
    >
      <div class="bg-green-50 rounded-lg shadow-lg border-2 border-green-500 p-4">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <div class="flex-1">
            <h3 class="text-sm font-semibold text-gray-900 mb-1">
              Actualización disponible
            </h3>
            <p class="text-xs text-gray-600 mb-3">
              Hay una nueva versión de la app disponible
            </p>
            <button
              @click="updatePWA"
              class="w-full bg-green-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Actualizar ahora
            </button>
          </div>
          <button
            @click="showUpdatePrompt = false"
            class="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </transition>

  <!-- Offline Indicator -->
  <transition name="slide-down">
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-50"
    >
      <div class="bg-yellow-500 text-white px-4 py-2 text-center text-sm font-medium">
        <div class="flex items-center justify-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
          <span>Modo offline - Los cambios se sincronizarán cuando vuelva la conexión</span>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const showInstallPrompt = ref(false)
const showUpdatePrompt = ref(false)
const isInstalled = ref(false)
const isOnline = ref(navigator.onLine)
let deferredPrompt = null

// PWA Update
const {
  offlineReady,
  needRefresh,
  updateServiceWorker,
} = useRegisterSW({
  onRegistered(r) {
    console.log('✅ Service Worker registrado:', r)
  },
  onRegisterError(error) {
    console.error('❌ Error al registrar Service Worker:', error)
  },
})

// Detect if already installed
onMounted(() => {
  // Check if running as installed PWA
  if (window.matchMedia('(display-mode: standalone)').matches) {
    isInstalled.value = true
  }

  // Listen for beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e

    // Show install prompt after 30 seconds
    setTimeout(() => {
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (!dismissed) {
        showInstallPrompt.value = true
      }
    }, 30000)
  })

  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalada exitosamente')
    isInstalled.value = true
    showInstallPrompt.value = false
    deferredPrompt = null
  })

  // Online/Offline detection
  window.addEventListener('online', () => {
    isOnline.value = true
    console.log('✅ Conexión restaurada')
  })

  window.addEventListener('offline', () => {
    isOnline.value = false
    console.log('⚠️ Sin conexión - Modo offline activado')
  })

  // Show update prompt
  if (needRefresh.value) {
    showUpdatePrompt.value = true
  }
})

// Install PWA
const installPWA = async () => {
  if (!deferredPrompt) {
    console.warn('⚠️ No hay evento de instalación disponible')
    return
  }

  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice

  console.log(`Usuario ${outcome === 'accepted' ? 'aceptó' : 'rechazó'} la instalación`)

  if (outcome === 'accepted') {
    showInstallPrompt.value = false
  }

  deferredPrompt = null
}

// Dismiss install prompt
const dismissPrompt = () => {
  showInstallPrompt.value = false
  localStorage.setItem('pwa-install-dismissed', Date.now())

  // Show again after 7 days
  setTimeout(() => {
    localStorage.removeItem('pwa-install-dismissed')
  }, 7 * 24 * 60 * 60 * 1000)
}

// Update PWA
const updatePWA = async () => {
  showUpdatePrompt.value = false
  await updateServiceWorker()
  window.location.reload()
}
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  transform: translateY(100px);
  opacity: 0;
}

.slide-up-leave-to {
  transform: translateY(100px);
  opacity: 0;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  transform: translateY(-100%);
  opacity: 0;
}

.slide-down-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}
</style>
