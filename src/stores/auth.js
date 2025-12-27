import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { toast } from 'vue3-toastify'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('access_token') || null)

  const isAuthenticated = computed(() => !!token.value)
  const currentUser = computed(() => user.value)
  const permissions = computed(() => user.value?.permissions || [])
  const roles = computed(() => user.value?.roles || [])

  async function login(credentials) {
    try {
      const response = await authService.login(credentials)
      const data = response.data.data

      token.value = data.access_token
      user.value = data.user

      localStorage.setItem('access_token', data.access_token)

      toast.success(response.data.message || 'Inicio de sesión exitoso')
      return true
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al iniciar sesión')
      return false
    }
  }

  async function register(data) {
    try {
      const response = await authService.register(data)
      const responseData = response.data.data

      token.value = responseData.access_token
      user.value = responseData.user

      localStorage.setItem('access_token', responseData.access_token)

      toast.success(response.data.message || 'Registro exitoso')
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al registrarse'
      const errors = error.response?.data?.errors

      if (errors) {
        // Show first validation error
        const firstError = Object.values(errors)[0][0]
        toast.error(firstError)
      } else {
        toast.error(message)
      }
      return false
    }
  }

  async function fetchUser() {
    try {
      const response = await authService.me()
      user.value = response.data.data
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    }
  }

  async function refreshAccessToken() {
    try {
      const response = await authService.refresh()
      const data = response.data.data
      token.value = data.access_token
      localStorage.setItem('access_token', data.access_token)
      return true
    } catch (error) {
      logout()
      return false
    }
  }

  function logout() {
    user.value = null
    token.value = null

    localStorage.removeItem('access_token')

    toast.info('Sesión cerrada')
  }

  function hasPermission(permission) {
    if (!user.value || !user.value.permissions) return false
    return user.value.permissions.includes(permission)
  }

  function hasAnyPermission(permissionArray) {
    if (!user.value || !user.value.permissions) return false
    return permissionArray.some(permission => user.value.permissions.includes(permission))
  }

  function hasAllPermissions(permissionArray) {
    if (!user.value || !user.value.permissions) return false
    return permissionArray.every(permission => user.value.permissions.includes(permission))
  }

  function hasRole(role) {
    if (!user.value || !user.value.roles) return false
    return user.value.roles.includes(role)
  }

  return {
    user,
    token,
    isAuthenticated,
    currentUser,
    permissions,
    roles,
    login,
    register,
    fetchUser,
    refreshAccessToken,
    logout,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole
  }
})
