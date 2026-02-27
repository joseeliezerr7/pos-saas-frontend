<template>
  <div>
    <h2 class="text-xl font-bold text-gray-900 mb-2">Configuración de Impresión</h2>
    <p class="text-gray-600 mb-6">
      Selecciona el tamaño de papel para la impresión de facturas y recibos en cada sucursal.
    </p>

    <!-- Branch Selector -->
    <div v-if="branches.length > 1" class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">Sucursal</label>
      <select
        v-model="selectedBranchId"
        class="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option v-for="branch in branches" :key="branch.id" :value="branch.id">
          {{ branch.name }}
        </option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="loadingBranches" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      <p class="text-gray-600 mt-2">Cargando sucursales...</p>
    </div>

    <!-- Size Options -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <!-- 58mm Card -->
      <button
        @click="selectedSize = '58mm'"
        :class="[
          'relative rounded-xl border-2 p-6 text-left transition-all hover:shadow-md focus:outline-none',
          selectedSize === '58mm'
            ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
            : 'border-gray-200 bg-white hover:border-gray-300'
        ]"
      >
        <div v-if="selectedSize === '58mm'" class="absolute top-3 right-3">
          <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex items-center mb-3">
          <div class="w-10 h-14 border-2 border-gray-400 rounded mr-3 flex items-center justify-center">
            <span class="text-xs text-gray-500 font-mono">58</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">58mm</h3>
            <p class="text-sm text-gray-500">Térmica pequeña</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="font-mono text-center" style="font-size: 7px; line-height: 1.2;">
            <div class="font-bold">EMPRESA S.A.</div>
            <div>-----------</div>
            <div>FACTURA #001</div>
            <div>Prod... L10.00</div>
            <div>-----------</div>
            <div class="font-bold">TOTAL: L10.00</div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">Ideal para recibos compactos y quioscos.</p>
      </button>

      <!-- 80mm Card -->
      <button
        @click="selectedSize = '80mm'"
        :class="[
          'relative rounded-xl border-2 p-6 text-left transition-all hover:shadow-md focus:outline-none',
          selectedSize === '80mm'
            ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
            : 'border-gray-200 bg-white hover:border-gray-300'
        ]"
      >
        <div v-if="selectedSize === '80mm'" class="absolute top-3 right-3">
          <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex items-center mb-3">
          <div class="w-12 h-14 border-2 border-gray-400 rounded mr-3 flex items-center justify-center">
            <span class="text-xs text-gray-500 font-mono">80</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">80mm</h3>
            <p class="text-sm text-gray-500">Térmica estándar</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="font-mono text-center" style="font-size: 8px; line-height: 1.3;">
            <div class="font-bold">EMPRESA S.A. de C.V.</div>
            <div>------------------------</div>
            <div>FACTURA #001-001-00001</div>
            <div class="text-left">Producto 1 &nbsp; x2 &nbsp; L20.00</div>
            <div>------------------------</div>
            <div class="font-bold">TOTAL: L20.00</div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">El tamaño más común para POS. Recomendado.</p>
      </button>

      <!-- Letter Card -->
      <button
        @click="selectedSize = 'letter'"
        :class="[
          'relative rounded-xl border-2 p-6 text-left transition-all hover:shadow-md focus:outline-none',
          selectedSize === 'letter'
            ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-200'
            : 'border-gray-200 bg-white hover:border-gray-300'
        ]"
      >
        <div v-if="selectedSize === 'letter'" class="absolute top-3 right-3">
          <svg class="w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex items-center mb-3">
          <div class="w-14 h-16 border-2 border-gray-400 rounded mr-3 flex items-center justify-center">
            <span class="text-xs text-gray-500 font-mono">A4</span>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">Carta</h3>
            <p class="text-sm text-gray-500">Impresora normal</p>
          </div>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <div class="text-center" style="font-size: 8px; line-height: 1.4; font-family: Arial, sans-serif;">
            <div class="font-bold">EMPRESA S.A. de C.V.</div>
            <div style="border-bottom: 1px solid #ccc; margin: 2px 0;"></div>
            <div>FACTURA #001-001-00001</div>
            <div class="text-left">
              <span>Producto ejemplo</span>
              <span class="float-right">L 20.00</span>
            </div>
            <div style="border-top: 1px solid #ccc; margin-top: 2px; padding-top: 2px;">
              <span class="font-bold">TOTAL:</span>
              <span class="float-right font-bold">L 20.00</span>
            </div>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">Para impresoras de escritorio tamaño carta/A4.</p>
      </button>
    </div>

    <!-- Save Button -->
    <div v-if="!loadingBranches" class="flex items-center gap-4">
      <button
        @click="saveSettings"
        :disabled="saving || selectedSize === currentSize"
        class="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {{ saving ? 'Guardando...' : 'Guardar Configuración' }}
      </button>
      <span v-if="selectedSize === currentSize" class="text-sm text-gray-500">
        Sin cambios pendientes
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import branchService from "@/services/branchService";
import { toast } from "vue3-toastify";

const authStore = useAuthStore();

const branches = ref([]);
const selectedBranchId = ref(null);
const selectedSize = ref("80mm");
const currentSize = ref("80mm");
const loadingBranches = ref(true);
const saving = ref(false);

onMounted(async () => {
  await loadBranches();
});

async function loadBranches() {
  loadingBranches.value = true;
  try {
    const response = await branchService.getAllBranches({ active: true });
    if (response.data.success) {
      branches.value = response.data.data;
      // Select the user's current branch first, or the first one
      const userBranchId = authStore.currentUser?.branch_id;
      if (userBranchId && branches.value.find((b) => b.id === userBranchId)) {
        selectedBranchId.value = userBranchId;
      } else if (branches.value.length > 0) {
        selectedBranchId.value = branches.value[0].id;
      }
      loadSelectedBranchSize();
    }
  } catch (error) {
    console.error("Error loading branches:", error);
    toast.error("Error al cargar las sucursales");
  } finally {
    loadingBranches.value = false;
  }
}

function loadSelectedBranchSize() {
  const branch = branches.value.find((b) => b.id === selectedBranchId.value);
  const size = branch?.settings?.print_size || "80mm";
  selectedSize.value = size;
  currentSize.value = size;
}

watch(selectedBranchId, () => {
  loadSelectedBranchSize();
});

async function saveSettings() {
  saving.value = true;
  try {
    const response = await branchService.updateBranch(selectedBranchId.value, {
      settings: { print_size: selectedSize.value },
    });
    if (response.data.success) {
      currentSize.value = selectedSize.value;
      // Update the branch in local array
      const idx = branches.value.findIndex((b) => b.id === selectedBranchId.value);
      if (idx !== -1) {
        branches.value[idx] = response.data.data;
      }
      // If this is the user's branch, update auth user data
      if (authStore.currentUser?.branch_id === selectedBranchId.value) {
        if (authStore.currentUser.branch) {
          authStore.currentUser.branch.settings = {
            ...authStore.currentUser.branch.settings,
            print_size: selectedSize.value,
          };
        }
      }
      toast.success("Configuración de impresión guardada");
    }
  } catch (error) {
    console.error("Error saving print settings:", error);
    toast.error(error.response?.data?.message || "Error al guardar la configuración");
  } finally {
    saving.value = false;
  }
}
</script>
