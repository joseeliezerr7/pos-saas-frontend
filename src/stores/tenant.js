import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

/**
 * Store para gestión de tenant/empresa actual
 *
 * Funcionalidades:
 * - Almacena información del tenant actual
 * - Persiste tenant en localStorage
 * - Proporciona helpers para validación de tenant
 */
export const useTenantStore = defineStore('tenant', () => {
  // Estado
  const currentTenant = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const tenantId = computed(() => currentTenant.value?.id || null)
  const tenantSlug = computed(() => currentTenant.value?.slug || null)
  const tenantName = computed(() => currentTenant.value?.name || '')
  const isActive = computed(() => currentTenant.value?.is_active || false)

  /**
   * Inicializa el tenant desde localStorage
   */
  function initializeFromStorage() {
    try {
      const stored = localStorage.getItem('tenant')
      if (stored) {
        currentTenant.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Error loading tenant from storage:', e)
      clearTenant()
    }
  }

  /**
   * Establece el tenant actual
   * @param {Object} tenant - Objeto del tenant/company
   */
  function setTenant(tenant) {
    if (!tenant || !tenant.id) {
      console.warn('Invalid tenant object provided')
      return
    }

    currentTenant.value = {
      id: tenant.id,
      name: tenant.name,
      legal_name: tenant.legal_name,
      rtn: tenant.rtn,
      slug: tenant.slug || tenant.name.toLowerCase().replace(/\s+/g, '-'),
      logo: tenant.logo,
      phone: tenant.phone,
      email: tenant.email,
      address: tenant.address,
      is_active: tenant.is_active,
      settings: tenant.settings || {}
    }

    // Persistir en localStorage
    try {
      localStorage.setItem('tenant', JSON.stringify(currentTenant.value))
    } catch (e) {
      console.error('Error saving tenant to storage:', e)
    }
  }

  /**
   * Limpia el tenant actual
   */
  function clearTenant() {
    currentTenant.value = null
    localStorage.removeItem('tenant')
  }

  /**
   * Carga información del tenant desde la API
   * @param {Number} companyId - ID de la empresa
   */
  async function loadTenant(companyId) {
    if (!companyId) {
      console.warn('No company ID provided')
      return null
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.get('/company')
      if (response.data?.data) {
        setTenant(response.data.data)
        return currentTenant.value
      }
    } catch (e) {
      error.value = e.message
      console.error('Error loading tenant:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualiza información del tenant
   * @param {Object} updates - Campos a actualizar
   */
  async function updateTenant(updates) {
    if (!tenantId.value) {
      throw new Error('No tenant loaded')
    }

    loading.value = true
    error.value = null

    try {
      const response = await api.put('/company', updates)
      if (response.data?.data) {
        setTenant(response.data.data)
        return currentTenant.value
      }
    } catch (e) {
      error.value = e.message
      console.error('Error updating tenant:', e)
      throw e
    } finally {
      loading.value = false
    }
  }

  /**
   * Valida que un recurso pertenece al tenant actual
   * @param {Object} resource - Recurso a validar
   * @returns {Boolean}
   */
  function validateTenantOwnership(resource) {
    if (!resource || !tenantId.value) {
      return false
    }

    // Verificar diferentes posibles nombres de campo
    const resourceTenantId = resource.tenant_id || resource.company_id || resource.tenantId
    return resourceTenantId === tenantId.value
  }

  /**
   * Obtiene la clave de storage con namespace de tenant
   * @param {String} key - Clave original
   * @returns {String} - Clave con namespace
   */
  function getNamespacedKey(key) {
    const tid = tenantId.value || 'default'
    return `tenant_${tid}_${key}`
  }

  // Inicializar al crear el store
  initializeFromStorage()

  return {
    // Estado
    currentTenant,
    loading,
    error,

    // Computed
    tenantId,
    tenantSlug,
    tenantName,
    isActive,

    // Acciones
    setTenant,
    clearTenant,
    loadTenant,
    updateTenant,
    validateTenantOwnership,
    getNamespacedKey,
    initializeFromStorage
  }
})
