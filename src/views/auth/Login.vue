<template>
  <div>
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Iniciar Sesión</h2>

    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="input"
          placeholder="tu@email.com"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="input"
          placeholder="••••••••"
        />
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input type="checkbox" v-model="form.remember" class="mr-2" />
          <span class="text-sm text-gray-600">Recordarme</span>
        </label>
        <router-link to="/auth/forgot-password" class="text-sm text-primary-600 hover:text-primary-700">
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
      <router-link to="/auth/register" class="text-sm text-primary-600 hover:text-primary-700 ml-1">
        Regístrate aquí
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)

async function handleLogin() {
  loading.value = true
  const success = await authStore.login(form.value)
  loading.value = false

  if (success) {
    router.push({ name: 'dashboard' })
  }
}
</script>
