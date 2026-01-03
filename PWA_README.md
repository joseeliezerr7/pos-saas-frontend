# 📱 POS SaaS - Progressive Web App (PWA)

## ✅ ¿Qué es una PWA?

Una **Progressive Web App (PWA)** es una aplicación web que se comporta como una app nativa. Tu sistema POS SaaS ahora puede:

- 📱 **Instalarse en dispositivos móviles** como una app nativa
- 🚀 **Funcionar offline** - Vender sin internet
- 🔔 **Enviar notificaciones push** (próximamente)
- ⚡ **Carga instantánea** - Cacheo inteligente
- 🏠 **Ícono en pantalla de inicio** - Acceso rápido
- 📊 **Funciona en Android, iOS, Windows, Mac, Linux**

---

## 🎯 Características Implementadas

### ✅ Instalación
- Botón flotante "Instalar App" aparece después de 30 segundos
- Compatible con Android, iOS, Windows, Mac
- Ícono personalizado de POS SaaS
- Splash screen al abrir la app

### ✅ Modo Offline
- Funciona sin conexión a internet
- Cacheo inteligente de:
  - Páginas visitadas
  - Imágenes y assets
  - API responses (10 minutos)
  - Google Fonts (1 año)
- Indicador visual cuando está offline
- Sincronización automática al volver online

### ✅ Actualizaciones Automáticas
- Notificación cuando hay nueva versión
- Botón "Actualizar ahora"
- Sin necesidad de pasar por tiendas

### ✅ Optimizaciones
- **CacheFirst** para fonts y assets estáticos
- **NetworkFirst** para APIs (con fallback a caché)
- Service Worker con Workbox
- Manifest completo con íconos y metadata

---

## 🚀 Cómo Probar la PWA

### Método 1: Localhost (Desarrollo)

```bash
# 1. Compilar para producción (PWA solo funciona en build)
cd pos-saas-frontend
npm run build

# 2. Servir con preview
npm run preview
# O instala un servidor estático
npm install -g serve
serve -s dist -p 5173

# 3. Abrir en navegador
# Chrome/Edge: http://localhost:5173
```

**Importante:** PWA solo funciona en **HTTPS** o **localhost**. En desarrollo local usa `localhost`, no `127.0.0.1`.

### Método 2: Android (Chrome)

1. Abre la app en **Chrome para Android**
2. Busca el banner "Instalar app" en la parte inferior
3. O desde el menú (⋮) → "Instalar app"
4. El ícono aparecerá en tu pantalla de inicio
5. ¡Listo! Ahora funciona como app nativa

### Método 3: iOS (Safari)

1. Abre la app en **Safari para iOS**
2. Toca el botón de compartir (cuadrado con flecha)
3. Selecciona "Agregar a pantalla de inicio"
4. Personaliza el nombre si deseas
5. Toca "Agregar"
6. ¡La app está en tu pantalla de inicio!

**Nota iOS:** iOS no soporta el prompt automático de instalación. Los usuarios deben instalarlo manualmente.

### Método 4: Windows/Mac (Chrome/Edge)

1. Abre la app en **Chrome o Edge**
2. Busca el ícono de instalación (+) en la barra de direcciones
3. Haz clic en "Instalar"
4. La app se abrirá en su propia ventana
5. Aparecerá en tu menú de aplicaciones

---

## 🧪 Probar Funcionalidad Offline

### Paso 1: Instalar la app
```bash
npm run build
npm run preview
# Abre http://localhost:5173
# Instala la app desde el navegador
```

### Paso 2: Navega por la app
- Visita Dashboard
- Ve a Productos
- Abre algunas ventas
- Esto cachea las páginas

### Paso 3: Simular offline
**Chrome DevTools:**
1. F12 (Abrir DevTools)
2. Tab "Network"
3. Selecciona "Offline" en el dropdown
4. Recarga la app (F5)

**Modo Avión:**
- Activa modo avión en tu dispositivo
- Abre la app
- Debería funcionar normalmente con los datos cacheados

### Paso 4: Verificar
- ✅ La app carga sin internet
- ✅ Aparece banner amarillo "Modo offline"
- ✅ Puedes navegar por páginas visitadas
- ✅ Al volver online, el banner desaparece

---

## 📊 Verificar en Chrome DevTools

### Application Tab

1. **F12** → Tab "Application"
2. **Manifest**
   - Verifica que aparezca "POS SaaS - Sistema de Punto de Venta"
   - Revisa íconos (192x192, 512x512)
   - Theme color: #3B82F6

3. **Service Workers**
   - Debe aparecer activo (🟢 green)
   - Opciones: Update, Unregister, Bypass for network

4. **Storage**
   - **Cache Storage**: Verifica que tenga múltiples cachés:
     - workbox-precache-v2
     - google-fonts-cache
     - api-cache
     - etc.

5. **Lighthouse Audit**
   - Haz clic en "Lighthouse" tab
   - Selecciona "Progressive Web App"
   - Haz clic en "Generate report"
   - **Meta:** Puntaje > 90/100 ✅

---

## 🎨 Personalizar Íconos

Los íconos actuales son placeholders. Para usar íconos personalizados:

### Opción Rápida (Generador Online)

1. Ve a: https://realfavicongenerator.net/
2. Sube tu logo (PNG o SVG)
3. Descarga el paquete
4. Extrae en `public/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`
   - `favicon.ico`

### Opción Manual

Edita `public/icon.svg` con tu diseño y luego genera PNGs:

```bash
# Con ImageMagick
magick icon.svg -resize 192x192 pwa-192x192.png
magick icon.svg -resize 512x512 pwa-512x512.png
magick icon.svg -resize 180x180 apple-touch-icon.png
```

Ver `public/GENERATE_ICONS.md` para más opciones.

---

## 🌐 Despliegue en Producción

### Requisitos Obligatorios

1. **HTTPS** - PWA solo funciona con HTTPS
   - Usa Cloudflare, Let's Encrypt, o cualquier certificado SSL
   - Excepto `localhost` para desarrollo

2. **Service Worker** - Se genera automáticamente en build
   ```bash
   npm run build
   # Genera dist/sw.js automáticamente
   ```

3. **Manifest** - Se genera automáticamente
   - Verifica `dist/manifest.webmanifest` después del build

### Hosting Recomendado

#### Vercel (Recomendado)
```bash
npm install -g vercel
vercel --prod
```
- ✅ HTTPS automático
- ✅ Service Worker compatible
- ✅ Gratis para proyectos pequeños

#### Netlify
```bash
npm run build
# Sube la carpeta dist/
```
- ✅ HTTPS automático
- ✅ PWA compatible
- ✅ Interfaz fácil

#### VPS/Servidor Propio (Nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name tu-dominio.com;

    # SSL
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/pos-saas-frontend/dist;
    index index.html;

    # Service Worker MUST be served with correct headers
    location /sw.js {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
        add_header Service-Worker-Allowed "/";
    }

    # Manifest
    location /manifest.webmanifest {
        add_header Content-Type "application/manifest+json";
        add_header Cache-Control "no-cache";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔧 Configuración Avanzada

### Modificar Estrategias de Caché

Edita `vite.config.js`:

```javascript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /\/api\/.*/i,
      handler: 'NetworkFirst', // Cambia a 'CacheFirst', 'StaleWhileRevalidate', etc.
      options: {
        cacheName: 'api-cache',
        expiration: {
          maxAgeSeconds: 60 * 10 // 10 minutos
        }
      }
    }
  ]
}
```

**Estrategias disponibles:**
- `NetworkFirst` - Red primero, caché como fallback (para APIs)
- `CacheFirst` - Caché primero, red como fallback (para assets)
- `StaleWhileRevalidate` - Devuelve caché pero actualiza en background
- `NetworkOnly` - Solo red, sin caché
- `CacheOnly` - Solo caché, sin red

### Deshabilitar PWA en Desarrollo

```javascript
// vite.config.js
VitePWA({
  devOptions: {
    enabled: false // Cambiar a false
  }
})
```

---

## 📈 Métricas y Analytics

### Ver Instalaciones

```javascript
// En tu analytics
window.addEventListener('appinstalled', (evt) => {
  console.log('App instalada!')
  gtag('event', 'pwa_install', {
    event_category: 'PWA',
    event_label: 'Instalación'
  })
})
```

### Trackear Offline Usage

```javascript
window.addEventListener('online', () => {
  gtag('event', 'connection_restored')
})

window.addEventListener('offline', () => {
  gtag('event', 'offline_mode')
})
```

---

## ❓ Troubleshooting

### La app no se puede instalar

**Checklist:**
- ✅ Usando HTTPS (o localhost)
- ✅ Manifest válido (`/manifest.webmanifest`)
- ✅ Service Worker registrado (`/sw.js`)
- ✅ Íconos existen (192x192, 512x512)
- ✅ start_url válido (`/`)

**Verificar en DevTools:**
```
F12 → Application → Manifest → "Add to homescreen"
```
Si hay errores, aparecerán aquí.

### Cambios no se ven

El Service Worker cachea agresivamente:

**Solución 1:** DevTools
```
F12 → Application → Service Workers → "Update" button
Luego: F12 → Application → Storage → "Clear site data"
```

**Solución 2:** Incógnito
- Abre en modo incógnito para testing

**Solución 3:** Cambiar versión
```javascript
// vite.config.js
manifest: {
  name: 'POS SaaS v2.0', // Cambiar versión fuerza actualización
}
```

### Service Worker no se registra

**Chrome:** `chrome://serviceworker-internals/`
**Edge:** `edge://serviceworker-internals/`

Busca errores en la consola.

---

## 📚 Recursos Adicionales

- **Documentación PWA:** https://web.dev/progressive-web-apps/
- **Workbox (caché):** https://developer.chrome.com/docs/workbox/
- **Vite Plugin PWA:** https://vite-pwa-org.netlify.app/
- **Web App Manifest:** https://developer.mozilla.org/en-US/docs/Web/Manifest
- **Service Worker:** https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

## 🎉 Siguientes Pasos

### Features Futuras (Opcional)

1. **Push Notifications**
   - Notificaciones de ventas
   - Alertas de inventario bajo
   - Recordatorios de citas

2. **Background Sync**
   - Enviar ventas cuando vuelva el internet
   - Sincronización automática de datos

3. **Periodic Background Sync**
   - Actualizar inventario cada hora
   - Descargar reportes en background

4. **Share API**
   - Compartir facturas vía WhatsApp
   - Exportar reportes

5. **Shortcuts en App Icon**
   - Acceso rápido a POS
   - Ir directo a Inventario
   - Ver reportes del día

---

## 🏆 Checklist Final

Antes de lanzar a producción:

- [ ] Íconos personalizados generados (no placeholders)
- [ ] Probado en Chrome Android
- [ ] Probado en Safari iOS
- [ ] Lighthouse PWA score > 90
- [ ] HTTPS habilitado en producción
- [ ] Service Worker funcionando
- [ ] Modo offline probado
- [ ] Actualizaciones automáticas funcionando
- [ ] Meta tags para redes sociales configurados
- [ ] Analytics implementado para trackear instalaciones

---

**¡Tu POS SaaS ahora es una PWA instalable!** 🎉

Para preguntas o ayuda: Revisa la documentación en `/public/GENERATE_ICONS.md`
