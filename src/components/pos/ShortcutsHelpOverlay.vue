<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <div
        class="fixed inset-0 bg-black bg-opacity-50"
        @click="$emit('close')"
      ></div>
      <div
        class="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto z-10"
      >
        <!-- Header -->
        <div
          class="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl"
        >
          <div class="flex items-center gap-3">
            <svg
              class="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
              />
            </svg>
            <h2 class="text-lg font-bold text-gray-900">Atajos de Teclado</h2>
          </div>
          <button
            @click="$emit('close')"
            class="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="group in shortcuts" :key="group.category">
            <h3
              class="text-sm font-bold text-primary-700 uppercase tracking-wide mb-3"
            >
              {{ group.category }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="shortcut in group.shortcuts"
                :key="shortcut.keys"
                class="flex items-center justify-between py-1.5 px-2 rounded hover:bg-gray-50"
              >
                <span class="text-sm text-gray-700">{{
                  shortcut.description
                }}</span>
                <kbd
                  class="ml-3 flex-shrink-0 inline-flex items-center px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono font-semibold text-gray-700 shadow-sm"
                >
                  {{ shortcut.keys }}
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 bg-gray-50 border-t px-6 py-3 rounded-b-2xl"
        >
          <p class="text-xs text-gray-500 text-center">
            Presiona
            <kbd
              class="px-1.5 py-0.5 bg-gray-200 border border-gray-300 rounded text-xs font-mono"
              >F1</kbd
            >
            o
            <kbd
              class="px-1.5 py-0.5 bg-gray-200 border border-gray-300 rounded text-xs font-mono"
              >Esc</kbd
            >
            para cerrar
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  shortcuts: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["close"]);
</script>
