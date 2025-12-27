import { defineStore } from 'pinia'
import { ref } from 'vue'
import roleService from '@/services/roleService'
import { toast } from 'vue3-toastify'

export const useRoleStore = defineStore('role', () => {
  const roles = ref([])
  const currentRole = ref(null)
  const permissions = ref({})
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchRoles(params = {}) {
    loading.value = true
    try {
      const response = await roleService.getAll(params)
      const data = response.data.data

      roles.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar roles')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchRoleById(id) {
    loading.value = true
    try {
      const response = await roleService.getById(id)
      currentRole.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar rol')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function fetchAllPermissions() {
    loading.value = true
    try {
      const response = await roleService.getAllPermissions()
      permissions.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar permisos')
      console.error(error)
      return {}
    } finally {
      loading.value = false
    }
  }

  async function createRole(data) {
    loading.value = true
    try {
      const response = await roleService.create(data)
      toast.success(response.data.message || 'Rol creado exitosamente')
      await fetchRoles()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear rol'
      const errors = error.response?.data?.errors

      if (errors) {
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(message)
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateRole(id, data) {
    loading.value = true
    try {
      const response = await roleService.update(id, data)
      toast.success(response.data.message || 'Rol actualizado exitosamente')
      await fetchRoles()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar rol'
      const errors = error.response?.data?.errors

      if (errors) {
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(message)
      }
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteRole(id) {
    loading.value = true
    try {
      const response = await roleService.delete(id)
      toast.success(response.data.message || 'Rol eliminado exitosamente')
      await fetchRoles()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar rol'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    roles,
    currentRole,
    permissions,
    loading,
    pagination,
    fetchRoles,
    fetchRoleById,
    fetchAllPermissions,
    createRole,
    updateRole,
    deleteRole
  }
})
