<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Notificaciones</h1>
        <p class="text-gray-600 mt-1">
          {{ unreadCount > 0 ? `Tienes ${unreadCount} notificaciones sin leer` : 'No tienes notificaciones sin leer' }}
        </p>
      </div>
      <button
        v-if="unreadCount > 0"
        @click="handleMarkAllAsRead"
        class="btn-secondary"
      >
        Marcar todas como leídas
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <p class="text-gray-500">Cargando notificaciones...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="notifications.length === 0" class="card text-center py-12">
      <svg
        class="mx-auto h-12 w-12 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No hay notificaciones</h3>
      <p class="mt-1 text-sm text-gray-500">Cuando tengas notificaciones, aparecerán aquí.</p>
    </div>

    <!-- Notifications List -->
    <div v-else class="space-y-3">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        :class="[
          'card hover:shadow-md transition-shadow cursor-pointer',
          notification.read_at ? 'bg-white' : 'bg-blue-50 border-l-4 border-blue-500'
        ]"
        @click="handleMarkAsRead(notification)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <!-- Notification Icon -->
            <div class="flex items-center gap-3">
              <div
                :class="[
                  'flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center',
                  getNotificationColor(notification.type)
                ]"
              >
                <svg
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    v-if="notification.type.includes('Stock')"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                  <path
                    v-else-if="notification.type.includes('CAI') || notification.type.includes('Fiscal')"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                  <path
                    v-else
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
              </div>

              <div class="flex-1 min-w-0">
                <!-- Title -->
                <p
                  :class="[
                    'text-sm font-medium',
                    notification.read_at ? 'text-gray-900' : 'text-blue-900'
                  ]"
                >
                  {{ notification.data.title || getNotificationTitle(notification.type) }}
                </p>

                <!-- Message -->
                <p class="text-sm text-gray-600 mt-1">
                  {{ notification.data.message || 'Sin mensaje' }}
                </p>

                <!-- Metadata -->
                <div class="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>{{ formatDate(notification.created_at) }}</span>
                  <span v-if="!notification.read_at" class="text-blue-600 font-medium">
                    • Nueva
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Mark as read button -->
          <button
            v-if="!notification.read_at"
            @click.stop="handleMarkAsRead(notification)"
            class="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
            title="Marcar como leída"
          >
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

const notificationStore = useNotificationStore()
const { notifications, unreadCount, loading } = storeToRefs(notificationStore)

onMounted(() => {
  notificationStore.fetchNotifications()
})

function getNotificationTitle(type) {
  const titles = {
    'App\\Notifications\\LowStockNotification': 'Stock Bajo',
    'App\\Notifications\\CAIExpiringNotification': 'CAI Próximo a Vencer',
    'App\\Notifications\\CorrelativeAlertNotification': 'Alerta de Correlativos',
    'App\\Notifications\\SaleNotification': 'Nueva Venta',
    'App\\Notifications\\PurchaseNotification': 'Nueva Compra'
  }
  return titles[type] || 'Notificación'
}

function getNotificationColor(type) {
  if (type.includes('Stock')) {
    return 'bg-orange-100 text-orange-600'
  } else if (type.includes('CAI') || type.includes('Correlative')) {
    return 'bg-red-100 text-red-600'
  } else if (type.includes('Sale')) {
    return 'bg-green-100 text-green-600'
  } else if (type.includes('Purchase')) {
    return 'bg-blue-100 text-blue-600'
  }
  return 'bg-gray-100 text-gray-600'
}

function formatDate(date) {
  if (!date) return ''

  const dateObj = new Date(date)
  const now = new Date()
  const diffInHours = (now - dateObj) / (1000 * 60 * 60)

  // If less than 24 hours, show relative time
  if (diffInHours < 24) {
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
  }

  // Otherwise show formatted date
  return format(dateObj, "d 'de' MMMM 'a las' HH:mm", { locale: es })
}

async function handleMarkAsRead(notification) {
  if (notification.read_at) return

  await notificationStore.markAsRead(notification.id)
}

async function handleMarkAllAsRead() {
  await notificationStore.markAllAsRead()
}
</script>
