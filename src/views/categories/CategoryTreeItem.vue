<template>
  <div class="border-l-2 pl-4" :class="level > 0 ? 'ml-6 border-gray-300' : 'border-transparent'">
    <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 mb-2">
      <div class="flex items-center space-x-3 flex-1">
        <button
          v-if="category.children && category.children.length > 0"
          @click="expanded = !expanded"
          class="text-gray-500 hover:text-gray-700"
        >
          <svg
            class="w-5 h-5 transform transition-transform"
            :class="expanded ? 'rotate-90' : ''"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div v-else class="w-5"></div>

        <div v-if="category.image" class="h-10 w-10 flex-shrink-0">
          <img :src="category.image" :alt="category.name" class="h-10 w-10 rounded object-cover" />
        </div>

        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <h4 class="font-medium text-gray-900">{{ category.name }}</h4>
            <span
              :class="category.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              class="px-2 py-0.5 text-xs font-semibold rounded-full"
            >
              {{ category.is_active ? 'Activo' : 'Inactivo' }}
            </span>
          </div>
          <p v-if="category.description" class="text-sm text-gray-500 mt-1">{{ category.description }}</p>
          <div class="flex items-center space-x-4 mt-1 text-xs text-gray-500">
            <span v-if="category.children && category.children.length > 0">
              {{ category.children.length }} subcategoría{{ category.children.length !== 1 ? 's' : '' }}
            </span>
            <span>Orden: {{ category.sort_order }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="$emit('edit', category)"
          class="text-primary-600 hover:text-primary-900 text-sm font-medium"
        >
          Editar
        </button>
        <button
          @click="$emit('delete', category)"
          class="text-red-600 hover:text-red-900 text-sm font-medium"
        >
          Eliminar
        </button>
      </div>
    </div>

    <!-- Children -->
    <div v-if="expanded && category.children && category.children.length > 0" class="mt-2">
      <CategoryTreeItem
        v-for="child in category.children"
        :key="child.id"
        :category="child"
        :level="level + 1"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  category: {
    type: Object,
    required: true
  },
  level: {
    type: Number,
    default: 0
  }
})

defineEmits(['edit', 'delete'])

const expanded = ref(true)
</script>
