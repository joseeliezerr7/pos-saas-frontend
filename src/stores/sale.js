import { defineStore } from 'pinia'
import { ref } from 'vue'
import saleService from '@/services/saleService'
import { toast } from 'vue3-toastify'

export const useSaleStore = defineStore('sale', () => {
  const sales = ref([])
  const currentSale = ref(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    per_page: 20,
    total: 0,
    last_page: 1
  })

  // Cart items for POS
  const cartItems = ref([])
  const customer = ref(null)
  const discount = ref(0)
  const notes = ref('')

  async function fetchSales(params = {}) {
    loading.value = true
    try {
      const response = await saleService.getAll(params)
      sales.value = response.data.data
      pagination.value = response.data.meta
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar ventas')
    } finally {
      loading.value = false
    }
  }

  async function fetchSaleById(id) {
    loading.value = true
    try {
      const response = await saleService.getById(id)
      currentSale.value = response.data.data
      return currentSale.value
    } catch (error) {
      console.error(error)
      toast.error('Error al cargar la venta')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createSale(saleData) {
    loading.value = true
    try {
      const response = await saleService.create(saleData)
      toast.success('Venta creada exitosamente')
      return response.data.data
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al crear la venta'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function voidSale(id) {
    loading.value = true
    try {
      await saleService.void(id)
      toast.success('Venta anulada exitosamente')
      await fetchSales()
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Error al anular la venta'
      toast.error(message)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Cart management functions
  function addToCart(product, quantity = 1) {
    const existingItem = cartItems.value.find(item => item.product.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      // Apply tax only if product is taxed
      const taxRate = product.tax_type === 'exempt' ? 0 : (product.tax_rate || 0)

      cartItems.value.push({
        product: { ...product },
        quantity: quantity,
        price: product.price,
        discount: 0,
        tax_rate: taxRate
      })
    }
  }

  function removeFromCart(index) {
    cartItems.value.splice(index, 1)
  }

  function updateCartItemQuantity(index, quantity) {
    if (quantity <= 0) {
      removeFromCart(index)
    } else {
      cartItems.value[index].quantity = quantity
    }
  }

  function updateCartItemPrice(index, price) {
    cartItems.value[index].price = price
  }

  function updateCartItemDiscount(index, discount) {
    cartItems.value[index].discount = discount
  }

  function clearCart() {
    cartItems.value = []
    customer.value = null
    discount.value = 0
    notes.value = ''
  }

  function setCustomer(customerData) {
    customer.value = customerData
  }

  function getCartTotal() {
    let subtotal = 0
    let totalDiscount = discount.value
    let totalTax = 0

    cartItems.value.forEach(item => {
      const itemSubtotal = item.quantity * item.price
      const itemDiscount = item.discount || 0
      const itemTotal = itemSubtotal - itemDiscount
      const itemTax = itemTotal * (item.tax_rate / 100)

      subtotal += itemSubtotal
      totalDiscount += itemDiscount
      totalTax += itemTax
    })

    const total = subtotal - totalDiscount + totalTax

    return {
      subtotal,
      discount: totalDiscount,
      tax: totalTax,
      total
    }
  }

  return {
    sales,
    currentSale,
    loading,
    pagination,
    cartItems,
    customer,
    discount,
    notes,
    fetchSales,
    fetchSaleById,
    createSale,
    voidSale,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    updateCartItemPrice,
    updateCartItemDiscount,
    clearCart,
    setCustomer,
    getCartTotal
  }
})
