import { defineStore } from 'pinia'
import { ref } from 'vue'
import { unitService } from '@/services/unitService'

export const useUnitStore = defineStore('unit', () => {
  const units = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchUnits() {
    loading.value = true
    error.value = null
    try {
      const data = await unitService.getAll()
      if (data.success) {
        units.value = data.data
      }
    } catch (err) {
      error.value = err.message
      console.error('Error fetching units:', err)
    } finally {
      loading.value = false
    }
  }

  async function createUnit(unitData) {
    loading.value = true
    error.value = null
    try {
      const data = await unitService.create(unitData)
      if (data.success) {
        units.value.push(data.data)
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      console.error('Error creating unit:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateUnit(id, unitData) {
    loading.value = true
    error.value = null
    try {
      const data = await unitService.update(id, unitData)
      if (data.success) {
        const index = units.value.findIndex(u => u.id === id)
        if (index !== -1) {
          units.value[index] = data.data
        }
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      console.error('Error updating unit:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  async function deleteUnit(id) {
    loading.value = true
    error.value = null
    try {
      const data = await unitService.delete(id)
      if (data.success) {
        units.value = units.value.filter(u => u.id !== id)
        return true
      }
      return false
    } catch (err) {
      error.value = err.message
      console.error('Error deleting unit:', err)
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    units,
    loading,
    error,
    fetchUnits,
    createUnit,
    updateUnit,
    deleteUnit
  }
})
