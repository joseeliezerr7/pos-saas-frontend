<template>
  <div>
    <h2 class="text-2xl font-bold text-center text-gray-900 mb-6">Crear Cuenta</h2>
    <p class="text-center text-gray-600 mb-6">Registra tu empresa y comienza tu prueba gratuita</p>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de la Empresa</label>
        <input v-model="form.company_name" type="text" required class="input" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">RTN de la Empresa</label>
        <input
          v-model="form.company_rtn"
          type="text"
          required
          maxlength="14"
          class="input"
          placeholder="08011990123456"
        />
        <p class="text-xs text-gray-500 mt-1">14 dígitos sin guiones</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Tu Nombre</label>
        <input v-model="form.name" type="text" required class="input" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Nombre de Usuario</label>
        <input
          v-model="form.username"
          type="text"
          required
          class="input"
          placeholder="nombre.usuario"
        />
        <p class="text-xs text-gray-500 mt-1">Solo letras, números, puntos, guiones y guiones bajos</p>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input v-model="form.email" type="email" required class="input" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
        <input
          v-model="form.password"
          type="password"
          required
          minlength="8"
          class="input"
          placeholder="Mínimo 8 caracteres"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
        <input
          v-model="form.password_confirmation"
          type="password"
          required
          minlength="8"
          class="input"
        />
      </div>

      <button type="submit" :disabled="loading" class="btn-primary w-full mt-6">
        <span v-if="loading">Registrando...</span>
        <span v-else>Crear Cuenta</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <span class="text-sm text-gray-600">¿Ya tienes cuenta?</span>
      <router-link to="/auth/login" class="text-sm text-primary-600 hover:text-primary-700 ml-1">
        Inicia sesión
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTenantStore } from '@/stores/tenant'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

const form = ref({
  company_name: '',
  company_rtn: '',
  name: '',
  username: '',
  email: '',
  password: '',
  password_confirmation: ''
})

const loading = ref(false)

async function handleRegister() {
  loading.value = true
  const result = await authStore.register(form.value)
  loading.value = false

  if (result) {
    // Initialize tenant store with the new company
    if (authStore.user?.company) {
      tenantStore.setTenant(authStore.user.company)
    }

    // Redirect to dashboard
    window.location.href = '/dashboard'
  }
}
</script>
