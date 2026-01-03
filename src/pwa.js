/**
 * PWA Configuration and Service Worker Registration
 * Handles offline functionality, caching, and app updates
 */

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope)

        // Check for updates every hour
        setInterval(() => {
          registration.update()
        }, 60 * 60 * 1000)
      })
      .catch((error) => {
        console.error('❌ Error al registrar Service Worker:', error)
      })
  })
}

// Handle offline/online events
window.addEventListener('online', () => {
  console.log('✅ Conexión a internet restaurada')

  // Sync any pending data
  if ('sync' in navigator.serviceWorker) {
    navigator.serviceWorker.ready.then((registration) => {
      return registration.sync.register('sync-data')
    })
  }
})

window.addEventListener('offline', () => {
  console.log('⚠️ Sin conexión - Modo offline activado')
})

// Handle app updates
let refreshing = false
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (refreshing) return
  refreshing = true
  window.location.reload()
})

// Skip waiting when new service worker is ready
navigator.serviceWorker?.ready.then((registration) => {
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing

    newWorker?.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('🔄 Nueva versión disponible')

        // Show update notification (handled by InstallPWA component)
        window.dispatchEvent(new Event('pwa-update-available'))
      }
    })
  })
})

// Prevent app from being uninstalled accidentally
window.addEventListener('beforeunload', (e) => {
  // Only prevent if there are unsaved changes
  const hasUnsavedChanges = false // TODO: Implement unsaved changes detection

  if (hasUnsavedChanges) {
    e.preventDefault()
    e.returnValue = ''
  }
})

// iOS PWA Standalone detection
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
const isStandalone = window.matchMedia('(display-mode: standalone)').matches

if (isIOS && !isStandalone) {
  // iOS user not using PWA - could show install instructions
  console.log('💡 Usuario iOS - Puede instalar la app para mejor experiencia')
}

// Log PWA status
console.log('📱 PWA Status:', {
  serviceWorker: 'serviceWorker' in navigator,
  standalone: window.matchMedia('(display-mode: standalone)').matches,
  online: navigator.onLine,
  platform: navigator.platform,
})

export default {
  isOnline: () => navigator.onLine,
  isStandalone: () => window.matchMedia('(display-mode: standalone)').matches,
  isIOS: () => /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
}
