/**
 * Utilidades para manejo de Storage con aislamiento por Tenant
 *
 * Proporciona funciones para almacenar datos en localStorage/sessionStorage
 * con namespace automático por tenant para evitar mezcla de datos entre empresas.
 */

import { useTenantStore } from '@/stores/tenant'

/**
 * Obtiene la clave con namespace del tenant actual
 *
 * @param {String} key - Clave original
 * @param {String|Number} tenantId - ID del tenant (opcional, usa el actual si no se provee)
 * @returns {String} - Clave con formato tenant_{id}_{key}
 */
export function getNamespacedKey(key, tenantId = null) {
  if (!key) {
    throw new Error('Storage key is required')
  }

  // Si no se provee tenantId, intentar obtener del store
  let tid = tenantId

  if (!tid) {
    try {
      const tenantStore = useTenantStore()
      tid = tenantStore.tenantId
    } catch (e) {
      // Si el store no está disponible, usar 'default'
      console.warn('Tenant store not available, using default namespace')
    }
  }

  // Si aún no hay tenant, usar 'default'
  const namespace = tid || 'default'

  return `tenant_${namespace}_${key}`
}

/**
 * Guarda un valor en localStorage con namespace de tenant
 *
 * @param {String} key - Clave
 * @param {*} value - Valor a guardar (será serializado a JSON)
 * @param {String|Number} tenantId - ID del tenant (opcional)
 */
export function setTenantData(key, value, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(namespacedKey, serializedValue)
  } catch (e) {
    console.error('Error saving to tenant storage:', e)
    throw e
  }
}

/**
 * Obtiene un valor de localStorage con namespace de tenant
 *
 * @param {String} key - Clave
 * @param {*} defaultValue - Valor por defecto si no existe
 * @param {String|Number} tenantId - ID del tenant (opcional)
 * @returns {*} - Valor deserializado o defaultValue
 */
export function getTenantData(key, defaultValue = null, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    const item = localStorage.getItem(namespacedKey)

    if (item === null) {
      return defaultValue
    }

    return JSON.parse(item)
  } catch (e) {
    console.error('Error reading from tenant storage:', e)
    return defaultValue
  }
}

/**
 * Elimina un valor de localStorage con namespace de tenant
 *
 * @param {String} key - Clave
 * @param {String|Number} tenantId - ID del tenant (opcional)
 */
export function removeTenantData(key, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    localStorage.removeItem(namespacedKey)
  } catch (e) {
    console.error('Error removing from tenant storage:', e)
  }
}

/**
 * Verifica si existe un valor en localStorage
 *
 * @param {String} key - Clave
 * @param {String|Number} tenantId - ID del tenant (opcional)
 * @returns {Boolean}
 */
export function hasTenantData(key, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    return localStorage.getItem(namespacedKey) !== null
  } catch (e) {
    console.error('Error checking tenant storage:', e)
    return false
  }
}

/**
 * Limpia todos los datos del tenant actual
 *
 * @param {String|Number} tenantId - ID del tenant (opcional, usa el actual)
 */
export function clearTenantData(tenantId = null) {
  try {
    let tid = tenantId

    if (!tid) {
      const tenantStore = useTenantStore()
      tid = tenantStore.tenantId
    }

    if (!tid) {
      console.warn('No tenant ID available for clearing data')
      return
    }

    const prefix = `tenant_${tid}_`
    const keysToRemove = []

    // Encontrar todas las claves del tenant
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    // Eliminar todas las claves encontradas
    keysToRemove.forEach(key => localStorage.removeItem(key))

    console.log(`Cleared ${keysToRemove.length} items for tenant ${tid}`)
  } catch (e) {
    console.error('Error clearing tenant storage:', e)
  }
}

/**
 * Limpia datos de TODOS los tenants (usar con precaución)
 * Solo elimina claves con el prefijo tenant_
 */
export function clearAllTenantsData() {
  try {
    const keysToRemove = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('tenant_')) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key))

    console.log(`Cleared ${keysToRemove.length} tenant items from storage`)
  } catch (e) {
    console.error('Error clearing all tenants storage:', e)
  }
}

/**
 * Obtiene todas las claves del tenant actual
 *
 * @param {String|Number} tenantId - ID del tenant (opcional)
 * @returns {Array<String>} - Array de claves (sin el namespace)
 */
export function getTenantKeys(tenantId = null) {
  try {
    let tid = tenantId

    if (!tid) {
      const tenantStore = useTenantStore()
      tid = tenantStore.tenantId
    }

    if (!tid) {
      return []
    }

    const prefix = `tenant_${tid}_`
    const keys = []

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        // Remover el prefijo para devolver la clave original
        keys.push(key.substring(prefix.length))
      }
    }

    return keys
  } catch (e) {
    console.error('Error getting tenant keys:', e)
    return []
  }
}

/**
 * Guarda en sessionStorage con namespace de tenant
 *
 * @param {String} key - Clave
 * @param {*} value - Valor a guardar
 * @param {String|Number} tenantId - ID del tenant (opcional)
 */
export function setTenantSessionData(key, value, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    const serializedValue = JSON.stringify(value)
    sessionStorage.setItem(namespacedKey, serializedValue)
  } catch (e) {
    console.error('Error saving to tenant session storage:', e)
    throw e
  }
}

/**
 * Obtiene de sessionStorage con namespace de tenant
 *
 * @param {String} key - Clave
 * @param {*} defaultValue - Valor por defecto
 * @param {String|Number} tenantId - ID del tenant (opcional)
 * @returns {*}
 */
export function getTenantSessionData(key, defaultValue = null, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    const item = sessionStorage.getItem(namespacedKey)

    if (item === null) {
      return defaultValue
    }

    return JSON.parse(item)
  } catch (e) {
    console.error('Error reading from tenant session storage:', e)
    return defaultValue
  }
}

/**
 * Elimina de sessionStorage con namespace de tenant
 *
 * @param {String} key - Clave
 * @param {String|Number} tenantId - ID del tenant (opcional)
 */
export function removeTenantSessionData(key, tenantId = null) {
  try {
    const namespacedKey = getNamespacedKey(key, tenantId)
    sessionStorage.removeItem(namespacedKey)
  } catch (e) {
    console.error('Error removing from tenant session storage:', e)
  }
}

/**
 * Limpia sessionStorage del tenant actual
 *
 * @param {String|Number} tenantId - ID del tenant (opcional)
 */
export function clearTenantSessionData(tenantId = null) {
  try {
    let tid = tenantId

    if (!tid) {
      const tenantStore = useTenantStore()
      tid = tenantStore.tenantId
    }

    if (!tid) {
      return
    }

    const prefix = `tenant_${tid}_`
    const keysToRemove = []

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key)
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  } catch (e) {
    console.error('Error clearing tenant session storage:', e)
  }
}

/**
 * Helper para migrar datos existentes a formato con namespace
 * Útil para actualizar aplicaciones existentes
 *
 * @param {Array<String>} keys - Claves a migrar
 * @param {String|Number} tenantId - ID del tenant
 */
export function migrateLegacyData(keys, tenantId) {
  if (!tenantId) {
    console.error('Tenant ID required for migration')
    return
  }

  let migratedCount = 0

  keys.forEach(key => {
    try {
      const legacyData = localStorage.getItem(key)
      if (legacyData !== null) {
        // Guardar con namespace
        setTenantData(key, JSON.parse(legacyData), tenantId)
        // Eliminar la versión legacy
        localStorage.removeItem(key)
        migratedCount++
      }
    } catch (e) {
      console.error(`Error migrating key ${key}:`, e)
    }
  })

  console.log(`Migrated ${migratedCount} keys to tenant namespace`)
  return migratedCount
}

/**
 * Obtiene estadísticas de uso de storage por tenant
 *
 * @param {String|Number} tenantId - ID del tenant (opcional)
 * @returns {Object}
 */
export function getTenantStorageStats(tenantId = null) {
  try {
    let tid = tenantId

    if (!tid) {
      const tenantStore = useTenantStore()
      tid = tenantStore.tenantId
    }

    if (!tid) {
      return { keys: 0, size: 0 }
    }

    const prefix = `tenant_${tid}_`
    let totalSize = 0
    let keyCount = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(prefix)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
          keyCount++
        }
      }
    }

    return {
      keys: keyCount,
      sizeBytes: totalSize,
      sizeKB: (totalSize / 1024).toFixed(2),
      sizeMB: (totalSize / (1024 * 1024)).toFixed(4)
    }
  } catch (e) {
    console.error('Error getting storage stats:', e)
    return { keys: 0, size: 0 }
  }
}
