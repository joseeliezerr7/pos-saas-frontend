import { defineStore } from 'pinia'
import { ref } from 'vue'
import notificationService from '@/services/notificationService'
import { toast } from 'vue3-toastify'

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref([])
  const unreadCount = ref(0)
  const loading = ref(false)

  async function fetchNotifications() {
    loading.value = true
    try {
      const response = await notificationService.getAll()
      const data = response.data.data

      notifications.value = data.notifications
      unreadCount.value = data.unread_count
    } catch (error) {
      toast.error('Error al cargar notificaciones')
      console.error(error)
    } finally {
      loading.value = false
    }
  }

  async function markAsRead(id) {
    try {
      const response = await notificationService.markAsRead(id)
      toast.success(response.data.message || 'Notificación marcada como leída')

      // Update local state
      const notification = notifications.value.find(n => n.id === id)
      if (notification && !notification.read_at) {
        notification.read_at = new Date().toISOString()
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      return true
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al marcar notificación como leída'
      toast.error(message)
      return false
    }
  }

  async function markAllAsRead() {
    try {
      const response = await notificationService.markAllAsRead()
      toast.success(response.data.message || 'Todas las notificaciones marcadas como leídas')

      // Update local state
      notifications.value.forEach(notification => {
        if (!notification.read_at) {
          notification.read_at = new Date().toISOString()
        }
      })
      unreadCount.value = 0

      return true
    } catch (error) {
      const message = error.response?.data?.message || 'Error al marcar notificaciones como leídas'
      toast.error(message)
      return false
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  }
})
