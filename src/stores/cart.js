import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { toast } from 'vue3-toastify'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const customer = ref(null)
  const discount = ref(0)
  const paymentMethod = ref('cash')
  const notes = ref('')

  const itemsCount = computed(() => items.value.length)

  const totalQuantity = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (item.price * item.quantity) - (item.discount || 0)
    }, 0)
  })

  const tax = computed(() => {
    return items.value.reduce((sum, item) => {
      const itemSubtotal = (item.price * item.quantity) - (item.discount || 0)
      const taxRate = item.tax_rate || 15.0
      return sum + (itemSubtotal * (taxRate / 100))
    }, 0)
  })

  const total = computed(() => {
    return subtotal.value + tax.value - discount.value
  })

  function addItem(product, quantity = 1) {
    const existingItem = items.value.find(item => item.product_id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
      toast.success(`Cantidad actualizada: ${product.name}`)
    } else {
      items.value.push({
        product_id: product.id,
        variant_id: product.variant_id || null,
        name: product.name,
        sku: product.sku,
        price: product.price,
        cost: product.cost || 0,
        quantity: quantity,
        tax_rate: product.tax_rate || 15.0,
        discount: 0,
        image: product.image
      })
      toast.success(`Agregado: ${product.name}`)
    }
  }

  function removeItem(productId) {
    const index = items.value.findIndex(item => item.product_id === productId)
    if (index !== -1) {
      const item = items.value[index]
      items.value.splice(index, 1)
      toast.info(`Eliminado: ${item.name}`)
    }
  }

  function updateItemQuantity(productId, quantity) {
    const item = items.value.find(item => item.product_id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  function updateItemPrice(productId, price) {
    const item = items.value.find(item => item.product_id === productId)
    if (item) {
      item.price = price
    }
  }

  function updateItemDiscount(productId, discountAmount) {
    const item = items.value.find(item => item.product_id === productId)
    if (item) {
      item.discount = discountAmount
    }
  }

  function setCustomer(customerData) {
    customer.value = customerData
  }

  function setDiscount(amount) {
    discount.value = amount
  }

  function setPaymentMethod(method) {
    paymentMethod.value = method
  }

  function setNotes(text) {
    notes.value = text
  }

  function clear() {
    items.value = []
    customer.value = null
    discount.value = 0
    paymentMethod.value = 'cash'
    notes.value = ''
  }

  function getCartData() {
    return {
      items: items.value.map(item => ({
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.price,
        discount: item.discount || 0,
        tax_rate: item.tax_rate
      })),
      customer_id: customer.value?.id || null,
      customer_rtn: customer.value?.rtn || null,
      customer_name: customer.value?.name || null,
      discount: discount.value,
      payment_method: paymentMethod.value,
      notes: notes.value
    }
  }

  return {
    items,
    customer,
    discount,
    paymentMethod,
    notes,
    itemsCount,
    totalQuantity,
    subtotal,
    tax,
    total,
    addItem,
    removeItem,
    updateItemQuantity,
    updateItemPrice,
    updateItemDiscount,
    setCustomer,
    setDiscount,
    setPaymentMethod,
    setNotes,
    clear,
    getCartData
  }
})
