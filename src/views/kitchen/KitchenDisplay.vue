<template>
  <div class="min-h-screen bg-gray-900 text-white flex flex-col">
    <!-- Header -->
    <header class="bg-gray-800 px-3 sm:px-4 py-2 sm:py-3 flex items-center justify-between flex-shrink-0 border-b border-gray-700">
      <div class="flex items-center gap-2 sm:gap-4 min-w-0">
        <h1 class="text-base sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2 whitespace-nowrap">
          <svg class="w-5 h-5 sm:w-7 sm:h-7 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
          <span class="hidden sm:inline">Pantalla de Cocina</span>
          <span class="sm:hidden">Cocina</span>
        </h1>
        <span v-if="stats" class="hidden md:inline text-sm text-gray-400 truncate">
          Hoy: {{ stats.total_today }} pedidos |
          Promedio: {{ formatTime(stats.avg_prep_time_seconds) }}
        </span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
        <!-- Sound toggle / activate -->
        <button
          v-if="!audioUnlocked"
          @click="activateSound"
          class="px-2 sm:px-3 py-1.5 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-xs sm:text-sm font-bold animate-pulse"
        >
          <span class="hidden sm:inline">Activar Sonido</span>
          <svg class="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </button>
        <button
          v-else
          @click="toggleSound"
          class="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-gray-700 transition-colors"
          :class="soundEnabled ? 'text-green-400' : 'text-gray-500'"
        >
          <svg v-if="soundEnabled" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          <svg v-else class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
          <span class="text-xs hidden sm:inline">{{ soundEnabled ? 'ON' : 'OFF' }}</span>
        </button>
        <!-- History button -->
        <button
          @click="showHistory = !showHistory"
          class="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-xs sm:text-sm font-medium"
        >
          <span class="hidden sm:inline">Historial</span>
          <svg class="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </button>
        <!-- Exit button -->
        <router-link
          to="/dashboard"
          class="px-2 sm:px-4 py-1.5 sm:py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 text-xs sm:text-sm font-medium"
        >
          <span class="hidden sm:inline">Salir</span>
          <svg class="sm:hidden w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </router-link>
      </div>
    </header>

    <!-- Stats Bar -->
    <div class="bg-gray-800/50 px-3 sm:px-4 py-2 border-b border-gray-700/50 flex-shrink-0">
      <div class="flex flex-wrap items-center gap-x-4 sm:gap-x-6 gap-y-1 text-xs sm:text-sm">
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500"></span>
          <span class="text-gray-400">Pend:</span>
          <span class="font-bold text-yellow-400">{{ stats?.pending || 0 }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-blue-500"></span>
          <span class="text-gray-400">Prep:</span>
          <span class="font-bold text-blue-400">{{ stats?.preparing || 0 }}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500"></span>
          <span class="text-gray-400">Listos:</span>
          <span class="font-bold text-green-400">{{ stats?.ready || 0 }}</span>
        </div>
        <div class="hidden sm:flex items-center gap-1.5">
          <span class="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-500"></span>
          <span class="text-gray-400">Entregados:</span>
          <span class="font-bold text-gray-300">{{ stats?.delivered || 0 }}</span>
        </div>
        <div class="ml-auto flex items-center gap-1.5 text-gray-500">
          <span class="w-2 h-2 rounded-full animate-pulse" :class="kitchenStore.isPolling ? 'bg-green-500' : 'bg-red-500'"></span>
          <span class="text-xs">{{ currentTime }}</span>
        </div>
      </div>
    </div>

    <!-- Mobile Tab Selector (visible only on small screens) -->
    <div class="md:hidden flex flex-shrink-0 border-b border-gray-700">
      <button
        v-for="tab in mobileTabs"
        :key="tab.status"
        @click="mobileActiveTab = tab.status"
        class="flex-1 py-2.5 text-center text-sm font-bold transition-colors relative"
        :class="mobileActiveTab === tab.status ? tab.activeClass : 'text-gray-500 bg-gray-800/50'"
      >
        {{ tab.label }}
        <span
          class="ml-1 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full text-xs font-bold"
          :class="tab.badgeClass"
        >
          {{ tab.count }}
        </span>
        <div
          v-if="mobileActiveTab === tab.status"
          class="absolute bottom-0 left-0 right-0 h-0.5"
          :class="tab.barClass"
        ></div>
      </button>
    </div>

    <!-- Main Content -->
    <!-- Desktop: 3 columns | Mobile: single column based on active tab -->
    <div class="flex-1 flex overflow-hidden p-2 sm:p-3 gap-2 sm:gap-3">
      <!-- Column: PENDIENTES -->
      <div
        class="flex-1 flex flex-col min-w-0"
        :class="{ 'hidden md:flex': mobileActiveTab !== 'pending' }"
      >
        <div class="bg-yellow-600 rounded-t-lg px-3 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
          <h2 class="text-sm sm:text-lg font-bold">PENDIENTES</h2>
          <span class="bg-yellow-800 px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold">{{ pendingOrders.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto bg-gray-800/30 rounded-b-lg p-2 space-y-2">
          <OrderCard
            v-for="order in pendingOrders"
            :key="order.id"
            :order="order"
            :alert-minutes="alertMinutes"
            status-color="yellow"
            next-status="preparing"
            next-label="Preparar"
            @advance="advanceStatus"
          />
          <div v-if="pendingOrders.length === 0" class="flex items-center justify-center h-32 text-gray-600 text-sm">
            Sin pedidos pendientes
          </div>
        </div>
      </div>

      <!-- Column: PREPARANDO -->
      <div
        class="flex-1 flex flex-col min-w-0"
        :class="{ 'hidden md:flex': mobileActiveTab !== 'preparing' }"
      >
        <div class="bg-blue-600 rounded-t-lg px-3 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
          <h2 class="text-sm sm:text-lg font-bold">PREPARANDO</h2>
          <span class="bg-blue-800 px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold">{{ preparingOrders.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto bg-gray-800/30 rounded-b-lg p-2 space-y-2">
          <OrderCard
            v-for="order in preparingOrders"
            :key="order.id"
            :order="order"
            :alert-minutes="alertMinutes"
            status-color="blue"
            next-status="ready"
            next-label="Listo"
            @advance="advanceStatus"
          />
          <div v-if="preparingOrders.length === 0" class="flex items-center justify-center h-32 text-gray-600 text-sm">
            Sin pedidos en preparacion
          </div>
        </div>
      </div>

      <!-- Column: LISTOS -->
      <div
        class="flex-1 flex flex-col min-w-0"
        :class="{ 'hidden md:flex': mobileActiveTab !== 'ready' }"
      >
        <div class="bg-green-600 rounded-t-lg px-3 sm:px-4 py-2 flex items-center justify-between flex-shrink-0">
          <h2 class="text-sm sm:text-lg font-bold">LISTOS</h2>
          <span class="bg-green-800 px-2 py-0.5 rounded-full text-xs sm:text-sm font-bold">{{ readyOrders.length }}</span>
        </div>
        <div class="flex-1 overflow-y-auto bg-gray-800/30 rounded-b-lg p-2 space-y-2">
          <OrderCard
            v-for="order in readyOrders"
            :key="order.id"
            :order="order"
            :alert-minutes="alertMinutes"
            status-color="green"
            next-status="delivered"
            next-label="Entregado"
            @advance="advanceStatus"
          />
          <div v-if="readyOrders.length === 0" class="flex items-center justify-center h-32 text-gray-600 text-sm">
            Sin pedidos listos
          </div>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="showHistory" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black bg-opacity-70">
      <div class="bg-gray-800 rounded-t-xl sm:rounded-lg shadow-2xl w-full sm:max-w-2xl sm:mx-4 max-h-[85vh] sm:max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-3 sm:p-4 border-b border-gray-700">
          <h3 class="text-base sm:text-lg font-bold">Historial de Hoy</h3>
          <button @click="showHistory = false" class="text-gray-400 hover:text-white p-1">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2">
          <div
            v-for="order in kitchenStore.history"
            :key="order.id"
            class="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
          >
            <div class="min-w-0 flex-1">
              <span class="font-bold text-base sm:text-lg">#{{ order.order_number || order.id }}</span>
              <span v-if="order.customer" class="ml-2 text-gray-400 text-xs sm:text-sm truncate">{{ order.customer.name }}</span>
              <div class="text-xs text-gray-500 mt-1">
                {{ order.details?.length || 0 }} items | L {{ parseFloat(order.total).toFixed(2) }}
              </div>
            </div>
            <div class="text-right text-sm flex-shrink-0 ml-2">
              <span class="text-green-400 font-medium text-xs sm:text-sm">Entregado</span>
              <div v-if="order.kitchen_started_at && order.kitchen_completed_at" class="text-xs text-gray-500">
                Prep: {{ calcPrepTime(order) }}
              </div>
            </div>
          </div>
          <div v-if="kitchenStore.history.length === 0" class="text-center py-8 text-gray-500">
            No hay pedidos entregados hoy
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useKitchenStore } from '@/stores/kitchen'
import { useAuthStore } from '@/stores/auth'
import { useSettingsStore } from '@/stores/settings'
import { toast } from 'vue3-toastify'
import OrderCard from './OrderCard.vue'

const kitchenStore = useKitchenStore()
const authStore = useAuthStore()
const settingsStore = useSettingsStore()

const showHistory = ref(false)
const soundEnabled = ref(true)
const audioUnlocked = ref(false)
const currentTime = ref('')
const knownOrderIds = ref(new Set())
const isFirstLoad = ref(true)
const mobileActiveTab = ref('pending')

const stats = computed(() => kitchenStore.stats)

const companySettings = computed(() => {
  const s = settingsStore.companySettings?.settings
  if (!s) return {}
  if (typeof s === 'object') return s
  try { return JSON.parse(s) } catch { return {} }
})
const alertMinutes = computed(() => companySettings.value.kds_alert_minutes || 15)

const pendingOrders = computed(() =>
  kitchenStore.orders.filter(o => o.kitchen_status === 'pending')
)
const preparingOrders = computed(() =>
  kitchenStore.orders.filter(o => o.kitchen_status === 'preparing')
)
const readyOrders = computed(() =>
  kitchenStore.orders.filter(o => o.kitchen_status === 'ready')
)

const mobileTabs = computed(() => [
  {
    status: 'pending',
    label: 'Pendientes',
    count: pendingOrders.value.length,
    activeClass: 'text-yellow-400 bg-yellow-900/30',
    badgeClass: 'bg-yellow-800 text-yellow-200',
    barClass: 'bg-yellow-500',
  },
  {
    status: 'preparing',
    label: 'Preparando',
    count: preparingOrders.value.length,
    activeClass: 'text-blue-400 bg-blue-900/30',
    badgeClass: 'bg-blue-800 text-blue-200',
    barClass: 'bg-blue-500',
  },
  {
    status: 'ready',
    label: 'Listos',
    count: readyOrders.value.length,
    activeClass: 'text-green-400 bg-green-900/30',
    badgeClass: 'bg-green-800 text-green-200',
    barClass: 'bg-green-500',
  },
])

// Clock
let clockInterval = null
function updateClock() {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ========== AUDIO SYSTEM ==========
let kitchenAudioCtx = null

function playBeep(frequency, durationMs, volume) {
  if (!kitchenAudioCtx) return false
  if (kitchenAudioCtx.state === 'suspended') kitchenAudioCtx.resume()
  const osc = kitchenAudioCtx.createOscillator()
  const gain = kitchenAudioCtx.createGain()
  osc.connect(gain)
  gain.connect(kitchenAudioCtx.destination)
  osc.type = 'square'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(volume, kitchenAudioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, kitchenAudioCtx.currentTime + durationMs / 1000)
  osc.start(kitchenAudioCtx.currentTime)
  osc.stop(kitchenAudioCtx.currentTime + durationMs / 1000)
  return true
}

function activateSound() {
  try {
    kitchenAudioCtx = new (window.AudioContext || window.webkitAudioContext)()
    if (kitchenAudioCtx.state === 'suspended') kitchenAudioCtx.resume()

    const now = kitchenAudioCtx.currentTime
    for (let i = 0; i < 3; i++) {
      const osc = kitchenAudioCtx.createOscillator()
      const gain = kitchenAudioCtx.createGain()
      osc.connect(gain)
      gain.connect(kitchenAudioCtx.destination)
      osc.type = 'square'
      osc.frequency.value = i % 2 === 0 ? 800 : 1000
      gain.gain.setValueAtTime(1.0, now + i * 0.2)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.15)
      osc.start(now + i * 0.2)
      osc.stop(now + i * 0.2 + 0.18)
    }

    audioUnlocked.value = true
    soundEnabled.value = true
    localStorage.setItem('kds_sound_enabled', 'true')
    toast.success('Sonido activado correctamente')
  } catch (e) {
    console.error('Error activando sonido:', e)
    toast.error('No se pudo activar el sonido: ' + e.message)
  }
}

function toggleSound() {
  soundEnabled.value = !soundEnabled.value
  localStorage.setItem('kds_sound_enabled', soundEnabled.value ? 'true' : 'false')
  if (soundEnabled.value && kitchenAudioCtx) {
    playBeep(800, 200, 0.8)
  }
}

function playNewOrderSound() {
  if (!soundEnabled.value || !audioUnlocked.value || !kitchenAudioCtx) return
  try {
    if (kitchenAudioCtx.state === 'suspended') kitchenAudioCtx.resume()
    const now = kitchenAudioCtx.currentTime
    for (let i = 0; i < 5; i++) {
      const osc = kitchenAudioCtx.createOscillator()
      const gain = kitchenAudioCtx.createGain()
      osc.connect(gain)
      gain.connect(kitchenAudioCtx.destination)
      osc.type = 'square'
      osc.frequency.value = i % 2 === 0 ? 880 : 1100
      gain.gain.setValueAtTime(1.0, now + i * 0.15)
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.12)
      osc.start(now + i * 0.15)
      osc.stop(now + i * 0.15 + 0.13)
    }
  } catch (e) {
    console.warn('Error playing notification:', e)
  }
}

// Watch for new orders — compare IDs to detect truly new orders
watch(() => kitchenStore.orders, (orders) => {
  if (!orders || orders.length === 0) {
    knownOrderIds.value = new Set()
    isFirstLoad.value = false
    return
  }

  const currentIds = new Set(orders.map(o => o.id))

  if (isFirstLoad.value) {
    knownOrderIds.value = currentIds
    isFirstLoad.value = false
    return
  }

  let newCount = 0
  for (const id of currentIds) {
    if (!knownOrderIds.value.has(id)) {
      newCount++
    }
  }

  if (newCount > 0) {
    playNewOrderSound()
    toast.info(`${newCount} pedido${newCount > 1 ? 's' : ''} nuevo${newCount > 1 ? 's' : ''}`, { autoClose: 3000 })
  }

  knownOrderIds.value = currentIds
}, { deep: true })

async function advanceStatus(orderId, newStatus) {
  try {
    await kitchenStore.updateStatus(orderId, newStatus)
    if (newStatus === 'delivered') {
      toast.success('Pedido marcado como entregado')
    }
  } catch (error) {
    toast.error('Error al actualizar estado')
  }
}

function formatTime(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function calcPrepTime(order) {
  if (!order.kitchen_started_at || !order.kitchen_completed_at) return '--'
  const start = new Date(order.kitchen_started_at)
  const end = new Date(order.kitchen_completed_at)
  const diff = Math.round((end - start) / 1000)
  return formatTime(diff)
}

onMounted(() => {
  settingsStore.fetchCompanySettings()
  kitchenStore.startPolling(5000)
  kitchenStore.fetchHistory()
  updateClock()
  clockInterval = setInterval(updateClock, 1000)

  const savedSound = localStorage.getItem('kds_sound_enabled')
  if (savedSound === 'false') soundEnabled.value = false
})

onUnmounted(() => {
  kitchenStore.stopPolling()
  if (clockInterval) clearInterval(clockInterval)
})
</script>
