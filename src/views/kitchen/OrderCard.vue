<template>
  <div
    class="rounded-lg p-3 border-2 transition-all"
    :class="cardClasses"
  >
    <!-- Header: Order number + Timer -->
    <div class="flex items-center justify-between mb-2">
      <span class="text-2xl font-black">#{{ order.order_number || order.id }}</span>
      <span
        class="text-sm font-mono font-bold px-2 py-0.5 rounded"
        :class="timerClasses"
      >
        {{ elapsedDisplay }}
      </span>
    </div>

    <!-- Customer name -->
    <div v-if="order.customer?.name" class="text-xs text-gray-400 mb-2">
      {{ order.customer.name }}
    </div>

    <!-- Items -->
    <div class="space-y-1 mb-3">
      <div
        v-for="detail in order.details"
        :key="detail.id"
        class="flex items-start gap-2"
      >
        <span class="font-bold text-lg leading-tight min-w-[2rem] text-right">{{ Math.round(detail.quantity) }}x</span>
        <div class="flex-1 min-w-0">
          <span class="text-sm font-medium leading-tight">{{ detail.product_name || detail.product?.name }}</span>
          <p v-if="detail.product?.description" class="text-xs text-gray-400 mt-0.5 leading-snug">{{ detail.product.description }}</p>
          <p v-if="detail.notes" class="text-xs text-yellow-400 mt-0.5 italic">{{ detail.notes }}</p>
        </div>
      </div>
    </div>

    <!-- Kitchen notes -->
    <div v-if="order.kitchen_notes" class="bg-yellow-900/30 border border-yellow-700/50 rounded px-2 py-1 mb-3">
      <p class="text-xs text-yellow-300 italic">{{ order.kitchen_notes }}</p>
    </div>

    <!-- Action Button -->
    <button
      @click="$emit('advance', order.id, nextStatus)"
      class="w-full py-3 rounded-lg font-bold text-base transition-all active:scale-95 touch-manipulation"
      :class="buttonClasses"
    >
      {{ nextLabel }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  order: { type: Object, required: true },
  alertMinutes: { type: Number, default: 15 },
  statusColor: { type: String, default: 'yellow' },
  nextStatus: { type: String, required: true },
  nextLabel: { type: String, required: true },
})

defineEmits(['advance'])

const elapsedSeconds = ref(0)
let timerInterval = null

const elapsedDisplay = computed(() => {
  const m = Math.floor(elapsedSeconds.value / 60)
  const s = elapsedSeconds.value % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

const isAlert = computed(() => {
  return elapsedSeconds.value >= props.alertMinutes * 60
})

const cardClasses = computed(() => {
  if (isAlert.value) {
    return 'bg-red-900/60 border-red-500 animate-pulse-slow'
  }
  const colors = {
    yellow: 'bg-gray-800 border-yellow-600/50',
    blue: 'bg-gray-800 border-blue-600/50',
    green: 'bg-gray-800 border-green-600/50',
  }
  return colors[props.statusColor] || colors.yellow
})

const timerClasses = computed(() => {
  if (isAlert.value) return 'bg-red-600 text-white'
  const colors = {
    yellow: 'bg-yellow-900/50 text-yellow-400',
    blue: 'bg-blue-900/50 text-blue-400',
    green: 'bg-green-900/50 text-green-400',
  }
  return colors[props.statusColor] || colors.yellow
})

const buttonClasses = computed(() => {
  const colors = {
    yellow: 'bg-blue-600 hover:bg-blue-700 text-white',
    blue: 'bg-green-600 hover:bg-green-700 text-white',
    green: 'bg-gray-600 hover:bg-gray-500 text-white',
  }
  return colors[props.statusColor] || colors.yellow
})

function updateElapsed() {
  const created = new Date(props.order.created_at)
  const now = new Date()
  elapsedSeconds.value = Math.max(0, Math.round((now - created) / 1000))
}

onMounted(() => {
  updateElapsed()
  timerInterval = setInterval(updateElapsed, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}
.animate-pulse-slow {
  animation: pulse-slow 2s ease-in-out infinite;
}
</style>
