import { defineStore } from 'pinia'
import { ref } from 'vue'
import dashboardService from '@/services/dashboardService'
import { toast } from 'vue3-toastify'

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref({
    today: {
      total: 0,
      count: 0,
      average: 0,
      cash: 0,
      card: 0
    },
    month: {
      total: 0,
      count: 0,
      average: 0,
      change_percentage: 0
    }
  })

  const salesChart = ref({
    labels: [],
    values: []
  })

  const topProducts = ref([])
  const alerts = ref([])
  const loading = ref(false)

  async function fetchStats() {
    try {
      const response = await dashboardService.getStats()
      stats.value = response.data.data
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
      toast.error('Error al cargar estadísticas')
    }
  }

  async function fetchSalesChart() {
    try {
      const response = await dashboardService.getSalesChart()
      salesChart.value = response.data.data
    } catch (error) {
      console.error('Error al cargar gráfica de ventas:', error)
    }
  }

  async function fetchTopProducts() {
    try {
      const response = await dashboardService.getTopProducts()
      topProducts.value = response.data.data
    } catch (error) {
      console.error('Error al cargar productos más vendidos:', error)
    }
  }

  async function fetchAlerts() {
    try {
      const response = await dashboardService.getAlerts()
      alerts.value = response.data.data.alerts || []
    } catch (error) {
      console.error('Error al cargar alertas:', error)
    }
  }

  async function loadDashboard() {
    loading.value = true
    try {
      await Promise.all([
        fetchStats(),
        fetchSalesChart(),
        fetchTopProducts(),
        fetchAlerts()
      ])
    } finally {
      loading.value = false
    }
  }

  return {
    stats,
    salesChart,
    topProducts,
    alerts,
    loading,
    fetchStats,
    fetchSalesChart,
    fetchTopProducts,
    fetchAlerts,
    loadDashboard
  }
})
