<template>
  <div v-if="summary && summary.enrolled" class="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-3 shadow-md">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div
          v-if="summary.current_tier"
          class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg"
          :style="{ backgroundColor: summary.current_tier.color }"
        >
          {{ summary.current_tier.name.charAt(0) }}
        </div>
        <div>
          <div class="text-xs opacity-90">
            {{ summary.current_tier?.name || 'Cliente' }}
          </div>
          <div class="text-lg font-bold">
            {{ summary.points.toLocaleString() }} puntos
          </div>
          <div class="text-xs opacity-75">
            ≈ L. {{ summary.points_value?.toFixed(2) || '0.00' }}
          </div>
        </div>
      </div>
      <button
        v-if="summary.points > 0 && showRedeemButton"
        @click="$emit('redeem-points')"
        class="px-3 py-1.5 bg-white text-blue-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        Canjear
      </button>
    </div>
    <div v-if="summary.tier_discount > 0" class="mt-2 pt-2 border-t border-white border-opacity-20">
      <div class="flex items-center justify-between text-xs">
        <span>Descuento del tier:</span>
        <span class="font-semibold">{{ summary.tier_discount }}% de descuento</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useLoyaltyStore } from '@/stores/loyalty'

const props = defineProps({
  customerId: {
    type: Number,
    required: true
  },
  showRedeemButton: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['redeem-points'])

const loyaltyStore = useLoyaltyStore()

const summary = ref(null)

onMounted(async () => {
  if (props.customerId) {
    await loadLoyalty()
  }
})

watch(() => props.customerId, async (newVal) => {
  if (newVal) {
    await loadLoyalty()
  } else {
    summary.value = null
  }
})

async function loadLoyalty() {
  try {
    summary.value = await loyaltyStore.fetchCustomerSummary(props.customerId)
  } catch (error) {
    console.error('Error loading loyalty:', error)
    summary.value = null
  }
}

defineExpose({
  refresh: loadLoyalty,
  summary
})
</script>
