import { defineStore } from 'pinia'
import { ref } from 'vue'
import userService from '@/services/userService'
import { toast } from 'vue3-toastify'

export const useUserStore = defineStore('user', () => {
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 15,
    total: 0
  })

  async function fetchUsers(params = {}) {
    loading.value = true
    try {
      const response = await userService.getAll(params)
      const data = response.data.data

      users.value = data.data
      pagination.value = {
        current_page: data.current_page,
        per_page: data.per_page,
        total: data.total
      }
    } catch (error) {
      toast.error('Error al cargar usuarios')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function fetchUserById(id) {
    loading.value = true
    try {
      const response = await userService.getById(id)
      currentUser.value = response.data.data
      return response.data.data
    } catch (error) {
      toast.error('Error al cargar usuario')
      console.error(error)
      return null
    } finally {
      loading.value = false
    }
  }

  async function createUser(data) {
    loading.value = true
    try {
      const response = await userService.create(data)
      toast.success(response.data.message || 'Usuario creado exitosamente')
      await fetchUsers()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear usuario'
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

  async function updateUser(id, data) {
    loading.value = true
    try {
      const response = await userService.update(id, data)
      toast.success(response.data.message || 'Usuario actualizado exitosamente')
      await fetchUsers()
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar usuario'
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

  async function deleteUser(id) {
    loading.value = true
    try {
      const response = await userService.delete(id)
      toast.success(response.data.message || 'Usuario eliminado exitosamente')
      await fetchUsers()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al eliminar usuario'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateUserStatus(id, status) {
    loading.value = true
    try {
      const response = await userService.updateStatus(id, status)
      toast.success(response.data.message || 'Estado actualizado exitosamente')
      await fetchUsers()
      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar estado'
      toast.error(message)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    users,
    currentUser,
    loading,
    pagination,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus
  }
})
