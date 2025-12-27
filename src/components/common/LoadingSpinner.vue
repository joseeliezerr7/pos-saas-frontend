<template>
  <div class="flex items-center justify-center" :class="containerClass">
    <div class="animate-spin rounded-full border-4 border-primary-200"
         :class="[spinnerSizeClass, `border-t-${color}`]">
    </div>
    <span v-if="text" class="ml-3 text-gray-600" :class="textSizeClass">{{ text }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  color: {
    type: String,
    default: 'primary-600'
  },
  text: {
    type: String,
    default: ''
  },
  containerClass: {
    type: String,
    default: 'p-4'
  }
})

const spinnerSizeClass = computed(() => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24'
  }
  return sizes[props.size]
})

const textSizeClass = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }
  return sizes[props.size]
})
</script>
