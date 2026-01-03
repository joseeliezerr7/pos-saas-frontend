/**
 * Utilidades para manejo de Multi-Tenancy
 *
 * Funcionalidades:
 * - Extracción de tenant desde dominio/subdominio
 * - Redirección a tenant específico
 * - Validación de tenant
 */

/**
 * Configuración de dominio base
 * Cambiar según el entorno
 */
const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || 'possaas.test'
const PRODUCTION_DOMAIN = import.meta.env.VITE_PRODUCTION_DOMAIN || 'possaas.com'

/**
 * Extrae información del tenant desde el dominio/hostname actual
 *
 * Ejemplos:
 * - localhost:5173 → { slug: 'default', domain: 'localhost', isLocal: true }
 * - empresa1.possaas.test → { slug: 'empresa1', domain: 'empresa1.possaas.test', isLocal: false }
 * - empresa2.possaas.com → { slug: 'empresa2', domain: 'empresa2.possaas.com', isLocal: false }
 *
 * @returns {Object|null} - Objeto con información del tenant o null si no se puede determinar
 */
export function getTenantFromDomain() {
  const hostname = window.location.hostname
  const port = window.location.port

  // Desarrollo local (localhost o 127.0.0.1)
  if (hostname === 'localhost' || hostname.startsWith('127.0.0.1')) {
    return {
      slug: 'default',
      domain: hostname,
      fullDomain: port ? `${hostname}:${port}` : hostname,
      isLocal: true,
      isDevelopment: true
    }
  }

  // Producción o staging con subdominio
  const parts = hostname.split('.')

  // Verificar si es un subdominio (mínimo 3 partes: empresa.possaas.com)
  if (parts.length >= 3) {
    const tenantSlug = parts[0]

    // Validar que no sea 'www' o subdominios reservados
    const reservedSubdomains = ['www', 'api', 'admin', 'app', 'mail', 'ftp']
    if (reservedSubdomains.includes(tenantSlug.toLowerCase())) {
      return null
    }

    return {
      slug: tenantSlug,
      domain: hostname,
      fullDomain: hostname,
      isLocal: false,
      isDevelopment: false
    }
  }

  // Dominio base sin subdominio (possaas.com)
  if (parts.length === 2) {
    return {
      slug: null,
      domain: hostname,
      fullDomain: hostname,
      isLocal: false,
      isDevelopment: false,
      isBaseDomain: true
    }
  }

  return null
}

/**
 * Redirige a un tenant específico usando subdominio
 *
 * @param {String} tenantSlug - Slug/identificador del tenant
 * @param {String} path - Ruta opcional dentro del tenant (ej: '/dashboard')
 */
export function redirectToTenant(tenantSlug, path = '/') {
  if (!tenantSlug) {
    console.error('No tenant slug provided for redirect')
    return
  }

  const protocol = window.location.protocol
  const isDevelopment = import.meta.env.DEV

  let targetUrl

  if (isDevelopment) {
    // En desarrollo, redirigir a localhost con parámetro
    const port = window.location.port || '5173'
    targetUrl = `${protocol}//localhost:${port}${path}?tenant=${tenantSlug}`
  } else {
    // En producción, usar subdominio
    const baseDomain = import.meta.env.PROD ? PRODUCTION_DOMAIN : BASE_DOMAIN
    targetUrl = `${protocol}//${tenantSlug}.${baseDomain}${path}`
  }

  window.location.href = targetUrl
}

/**
 * Obtiene el tenant desde parámetros de URL (útil para desarrollo)
 *
 * @returns {String|null} - Slug del tenant o null
 */
export function getTenantFromParams() {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get('tenant')
}

/**
 * Determina el tenant slug actual de cualquier fuente disponible
 * Prioridad: 1) Subdominio, 2) Parámetro URL, 3) localStorage
 *
 * @returns {String|null} - Slug del tenant actual
 */
export function getCurrentTenantSlug() {
  // 1. Intentar desde dominio
  const domainTenant = getTenantFromDomain()
  if (domainTenant?.slug && domainTenant.slug !== 'default') {
    return domainTenant.slug
  }

  // 2. Intentar desde parámetros URL (desarrollo)
  const paramTenant = getTenantFromParams()
  if (paramTenant) {
    return paramTenant
  }

  // 3. Intentar desde localStorage
  try {
    const storedTenant = localStorage.getItem('tenant')
    if (storedTenant) {
      const tenant = JSON.parse(storedTenant)
      return tenant.slug
    }
  } catch (e) {
    console.error('Error reading tenant from localStorage:', e)
  }

  return null
}

/**
 * Valida si un slug de tenant es válido
 *
 * @param {String} slug - Slug a validar
 * @returns {Boolean}
 */
export function isValidTenantSlug(slug) {
  if (!slug || typeof slug !== 'string') {
    return false
  }

  // Validar formato: solo letras minúsculas, números y guiones
  const validSlugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  if (!validSlugRegex.test(slug)) {
    return false
  }

  // Validar longitud (3-50 caracteres)
  if (slug.length < 3 || slug.length > 50) {
    return false
  }

  // Validar que no sea un slug reservado
  const reservedSlugs = [
    'admin', 'api', 'app', 'www', 'mail', 'ftp', 'blog',
    'default', 'test', 'demo', 'system', 'root'
  ]
  if (reservedSlugs.includes(slug.toLowerCase())) {
    return false
  }

  return true
}

/**
 * Construye una URL para un tenant específico
 *
 * @param {String} tenantSlug - Slug del tenant
 * @param {String} path - Ruta dentro del tenant
 * @returns {String} - URL completa
 */
export function buildTenantUrl(tenantSlug, path = '/') {
  const protocol = window.location.protocol
  const isDevelopment = import.meta.env.DEV

  if (isDevelopment) {
    const port = window.location.port || '5173'
    return `${protocol}//localhost:${port}${path}?tenant=${tenantSlug}`
  }

  const baseDomain = import.meta.env.PROD ? PRODUCTION_DOMAIN : BASE_DOMAIN
  return `${protocol}//${tenantSlug}.${baseDomain}${path}`
}

/**
 * Verifica si estamos en el dominio base (sin tenant)
 *
 * @returns {Boolean}
 */
export function isBaseDomain() {
  const tenantInfo = getTenantFromDomain()
  return tenantInfo?.isBaseDomain === true || tenantInfo?.isLocal === true
}

/**
 * Obtiene el nombre amigable del entorno actual
 *
 * @returns {String}
 */
export function getEnvironmentName() {
  if (import.meta.env.DEV) {
    return 'Desarrollo'
  }
  if (import.meta.env.PROD) {
    return 'Producción'
  }
  return 'Desconocido'
}

/**
 * Helper para debugging de tenant
 *
 * @returns {Object} - Información de debugging
 */
export function debugTenantInfo() {
  return {
    hostname: window.location.hostname,
    port: window.location.port,
    protocol: window.location.protocol,
    href: window.location.href,
    tenantFromDomain: getTenantFromDomain(),
    tenantFromParams: getTenantFromParams(),
    currentTenantSlug: getCurrentTenantSlug(),
    isBaseDomain: isBaseDomain(),
    environment: getEnvironmentName(),
    envVars: {
      DEV: import.meta.env.DEV,
      PROD: import.meta.env.PROD,
      BASE_DOMAIN: BASE_DOMAIN,
      PRODUCTION_DOMAIN: PRODUCTION_DOMAIN
    }
  }
}
