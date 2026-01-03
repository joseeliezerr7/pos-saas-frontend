# Generación de Íconos PWA

## Opción 1: Usar un generador online (Más fácil)

1. Ve a: https://realfavicongenerator.net/
2. Sube el archivo `icon.svg`
3. Descarga el paquete de íconos
4. Extrae estos archivos en la carpeta `public/`:
   - `pwa-192x192.png`
   - `pwa-512x512.png`
   - `apple-touch-icon.png`
   - `favicon.ico`

## Opción 2: Usar ImageMagick (Línea de comandos)

Si tienes ImageMagick instalado:

```bash
# Instalar ImageMagick (Windows)
# Descarga de: https://imagemagick.org/script/download.php

# Generar íconos
magick icon.svg -resize 192x192 pwa-192x192.png
magick icon.svg -resize 512x512 pwa-512x512.png
magick icon.svg -resize 180x180 apple-touch-icon.png
magick icon.svg -resize 32x32 favicon.ico
```

## Opción 3: Usar PWA Asset Generator (Automatizado)

```bash
npm install -g pwa-asset-generator

# Generar todos los íconos automáticamente
pwa-asset-generator icon.svg public --icon-only --background "#3B82F6"
```

## Opción 4: Photoshop/GIMP (Manual)

1. Abre `icon.svg` en Photoshop o GIMP
2. Exporta en los siguientes tamaños:
   - 192x192 → `pwa-192x192.png`
   - 512x512 → `pwa-512x512.png`
   - 180x180 → `apple-touch-icon.png`
   - 32x32 → `favicon.ico`

## Screenshots (Opcional para App Stores)

Si planeas publicar en stores, necesitas screenshots:
- `screenshot-wide.png` (1280x720) - Para desktop/tablet
- `screenshot-narrow.png` (750x1334) - Para móvil

Puedes capturar pantallas de tu app en funcionamiento.

## Verificación

Después de generar los íconos, verifica que tengas:
- ✅ `pwa-192x192.png`
- ✅ `pwa-512x512.png`
- ✅ `apple-touch-icon.png`
- ✅ `favicon.ico`
- ✅ `icon.svg` (ya existe)

## Nota Temporal

Por ahora, el sistema creará placeholders automáticamente.
Puedes reemplazarlos con tus íconos personalizados cuando estén listos.
