<template>
  <div>
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Recuperar Contraseña</h2>
    <p class="text-center text-gray-600 mb-6">Te enviaremos un enlace para restablecer tu contraseña</p>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input v-model="email" type="email" required class="input" />
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full">
        <span v-if="loading">Enviando...</span>
        <span v-else>Enviar Enlace</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <router-link to="/auth/login" class="text-sm text-primary-600 hover:text-primary-700">
        Volver al inicio de sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const email = ref('')
const loading = ref(false)

function handleSubmit() {
  loading.value = true
  // Implementar lógica
  setTimeout(() => loading.value = false, 1000)
}
</script>
