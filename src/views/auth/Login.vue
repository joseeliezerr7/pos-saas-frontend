<template>
  <div>
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">
      Iniciar Sesión
    </h2>

    <!-- Tenant Info from Domain -->
    <div
      v-if="tenantFromDomain && !tenantFromDomain.isLocal"
      class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
    >
      <div class="flex items-center space-x-2">
        <svg
          class="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
        <div>
          <p class="text-sm font-medium text-blue-900">
            Ingresando a: <strong>{{ tenantFromDomain.slug }}</strong>
          </p>
          <p class="text-xs text-blue-700 mt-0.5">
            Asegúrate de usar un usuario asociado a esta empresa
          </p>
        </div>
      </div>
    </div>

    <!-- Error Messages -->
    <div
      v-if="errorMessage"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex items-center space-x-2">
        <svg
          class="w-5 h-5 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p class="text-sm text-red-900">{{ errorMessage }}</p>
      </div>
    </div>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Usuario</label
        >
        <input
          v-model="form.username"
          type="text"
          required
          autocomplete="username"
          class="input"
          placeholder="tu nombre de usuario"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2"
          >Contraseña</label
        >
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="input pr-10"
            placeholder="••••••••"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
          >
            <svg
              v-if="!showPassword"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              />
            </svg>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input type="checkbox" v-model="form.remember" class="mr-2" />
          <span class="text-sm text-gray-600">Recordarme</span>
        </label>
        <router-link
          to="/auth/forgot-password"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          ¿Olvidaste tu contraseña?
        </router-link>
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        <span v-if="loading">Iniciando sesión...</span>
        <span v-else>Iniciar Sesión</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <span class="text-sm text-gray-600">¿No tienes cuenta?</span>
      <router-link
        to="/auth/register"
        class="text-sm text-primary-600 hover:text-primary-700 ml-1"
      >
        Regístrate aquí
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useTenantStore } from "@/stores/tenant";
import { getTenantFromDomain, debugTenantInfo } from "@/utils/tenant";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const tenantStore = useTenantStore();

const form = ref({
  username: "",
  password: "",
  remember: false,
});

const loading = ref(false);
const showPassword = ref(false);
const tenantFromDomain = ref(null);
const errorMessage = ref("");

// Detect tenant from domain on mount
onMounted(() => {
  // Get tenant from domain
  tenantFromDomain.value = getTenantFromDomain();

  // Debug tenant info in development
  if (import.meta.env.DEV) {
    console.log("[Login] Tenant Debug Info:", debugTenantInfo());
  }

  // Check for error messages from router
  if (route.query.error) {
    const errorMessages = {
      tenant_mismatch: "No tienes acceso a esta empresa",
      unauthorized_tenant: "Acceso no autorizado a esta empresa",
      session_expired:
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
    };
    errorMessage.value =
      route.query.message ||
      errorMessages[route.query.error] ||
      "Error al iniciar sesión";

    // Clear query params
    router.replace({ name: "login" });
  }

  // Check for subscription warning messages
  if (route.query.warning) {
    const warningMessages = {
      subscription_inactive: "Tu suscripción no está activa.",
      subscription_expired: "Tu suscripción ha expirado.",
      no_subscription: "No tienes una suscripción activa.",
    };
    errorMessage.value =
      route.query.message ||
      warningMessages[route.query.warning] ||
      "Hay un problema con tu suscripción.";

    // Clear query params
    router.replace({ name: "login" });
  }
});

async function handleLogin() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const success = await authStore.login(form.value);

    if (success) {
      // Initialize tenant from user's company
      if (authStore.user?.company) {
        tenantStore.setTenant(authStore.user.company);
      }

      // Redirect to dashboard - using window.location for clean reload
      window.location.href = "/dashboard";
    } else {
      errorMessage.value =
        "Credenciales incorrectas. Por favor, verifica tu usuario y contraseña.";
    }
  } catch (error) {
    console.error("[Login] Error:", error);
    errorMessage.value =
      error.message ||
      "Error al iniciar sesión. Por favor, intenta nuevamente.";
  } finally {
    loading.value = false;
  }
}
</script>
