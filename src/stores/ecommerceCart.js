import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import ecommerceService from '@/services/ecommerceService'
import { toast } from 'vue3-toastify'

export const useEcommerceCartStore = defineStore('ecommerceCart', () => {
  // State
  const items = ref([])
  const loading = ref(false)
  const coupon = ref(null)
  const shippingMethod = ref('pickup')
  const paymentMethod = ref('cash_on_delivery')

  // Computed
  const itemCount = computed(() => {
    return items.value.reduce((total, item) => total + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((total, item) => {
      return total + (item.unit_price * item.quantity)
    }, 0)
  })

  const discount = computed(() => {
    if (!coupon.value) return 0
    if (coupon.value.discount_type === 'percentage') {
      return subtotal.value * (coupon.value.discount_value / 100)
    }
    return coupon.value.discount_value
  })

  const shippingCost = computed(() => {
    if (shippingMethod.value === 'pickup') return 0
    // This would typically come from settings
    return 50 // Default shipping cost
  })

  const tax = computed(() => {
    // 15% ISV for Honduras
    return (subtotal.value - discount.value) * 0.15
  })

  const total = computed(() => {
    return subtotal.value - discount.value + tax.value + shippingCost.value
  })

  const isEmpty = computed(() => items.value.length === 0)

  // Actions
  async function fetchCart() {
    loading.value = true
    try {
      const response = await ecommerceService.getCart()
      items.value = response.data.data?.items || []
      coupon.value = response.data.data?.coupon || null
      return items.value
    } catch (error) {
      console.error('Error fetching cart:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addItem(productId, quantity = 1, variantId = null) {
    loading.value = true
    try {
      const response = await ecommerceService.addToCart(productId, quantity, variantId)
      items.value = response.data.data?.items || []
      toast.success('Producto agregado al carrito')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Error al agregar producto')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateItemQuantity(itemId, quantity) {
    if (quantity < 1) {
      return removeItem(itemId)
    }

    loading.value = true
    try {
      const response = await ecommerceService.updateCartItem(itemId, quantity)
      items.value = response.data.data?.items || []
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar cantidad')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function removeItem(itemId) {
    loading.value = true
    try {
      const response = await ecommerceService.removeFromCart(itemId)
      items.value = response.data.data?.items || []
      toast.success('Producto eliminado del carrito')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Error al eliminar producto')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function clearCart() {
    loading.value = true
    try {
      await ecommerceService.clearCart()
      items.value = []
      coupon.value = null
      toast.success('Carrito vaciado')
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Error al vaciar carrito')
      throw error
    } finally {
      loading.value = false
    }
  }

  async function applyCoupon(code) {
    loading.value = true
    try {
      const response = await ecommerceService.applyCoupon(code)
      coupon.value = response.data.data?.coupon
      items.value = response.data.data?.items || items.value
      toast.success('Cupon aplicado')
      return coupon.value
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Cupon invalido')
      throw error
    } finally {
      loading.value = false
    }
  }

  function removeCoupon() {
    coupon.value = null
  }

  function setShippingMethod(method) {
    shippingMethod.value = method
  }

  function setPaymentMethod(method) {
    paymentMethod.value = method
  }

  async function validateCheckout() {
    try {
      const response = await ecommerceService.validateCheckout()
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Error de validacion')
      throw error
    }
  }

  async function processCheckout(checkoutData) {
    loading.value = true
    try {
      const data = {
        ...checkoutData,
        shipping_method: shippingMethod.value,
        payment_method: paymentMethod.value,
        coupon_code: coupon.value?.code
      }
      const response = await ecommerceService.processCheckout(data)
      // Clear cart after successful checkout
      items.value = []
      coupon.value = null
      toast.success('Pedido realizado exitosamente')
      return response.data.data
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Error al procesar pedido')
      throw error
    } finally {
      loading.value = false
    }
  }

  // Local cart operations (for guest users without API)
  function addItemLocal(product, quantity = 1, variant = null) {
    const existingIndex = items.value.findIndex(item =>
      item.product_id === product.id && item.variant_id === (variant?.id || null)
    )

    if (existingIndex >= 0) {
      items.value[existingIndex].quantity += quantity
    } else {
      items.value.push({
        id: Date.now(), // Temporary local ID
        product_id: product.id,
        product_name: product.name,
        product_image: product.image,
        variant_id: variant?.id || null,
        variant_name: variant?.name || null,
        unit_price: variant?.price || product.price,
        quantity
      })
    }
    toast.success('Producto agregado al carrito')
  }

  function updateItemLocal(itemId, quantity) {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index >= 0) {
      if (quantity < 1) {
        items.value.splice(index, 1)
      } else {
        items.value[index].quantity = quantity
      }
    }
  }

  function removeItemLocal(itemId) {
    const index = items.value.findIndex(item => item.id === itemId)
    if (index >= 0) {
      items.value.splice(index, 1)
      toast.success('Producto eliminado')
    }
  }

  function clearLocal() {
    items.value = []
    coupon.value = null
  }

  // Reset store
  function $reset() {
    items.value = []
    coupon.value = null
    shippingMethod.value = 'pickup'
    paymentMethod.value = 'cash_on_delivery'
    loading.value = false
  }

  return {
    // State
    items,
    loading,
    coupon,
    shippingMethod,
    paymentMethod,

    // Computed
    itemCount,
    subtotal,
    discount,
    shippingCost,
    tax,
    total,
    isEmpty,

    // Actions
    fetchCart,
    addItem,
    updateItemQuantity,
    removeItem,
    clearCart,
    applyCoupon,
    removeCoupon,
    setShippingMethod,
    setPaymentMethod,
    validateCheckout,
    processCheckout,

    // Local operations
    addItemLocal,
    updateItemLocal,
    removeItemLocal,
    clearLocal,

    $reset
  }
})
