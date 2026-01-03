<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm px-6 py-5 flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <h1 class="text-2xl font-bold text-gray-900">Punto de Venta</h1>
        <span v-if="authStore.currentUser" class="text-base text-gray-600">
          Cajero: {{ authStore.currentUser.name }}
        </span>
      </div>
      <div class="flex items-center space-x-3">
        <button @click="clearSale" class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-base">
          Nueva Venta
        </button>
        <router-link to="/dashboard" class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-base">
          Salir
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
      <!-- Products Section -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Search Bar -->
        <div class="p-5 bg-white border-b">
          <input
            v-model="searchQuery"
            @input="searchProducts"
            type="text"
            placeholder="Buscar productos por nombre, SKU o código de barras..."
            class="w-full px-5 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            autofocus
          />
        </div>

        <!-- Product Grid -->
        <div class="flex-1 overflow-y-auto p-5">
          <div v-if="productStore.loading" class="text-center py-12">
            <p class="text-gray-500 text-lg">Cargando productos...</p>
          </div>
          <div v-else-if="productStore.products.length === 0" class="text-center py-12">
            <p class="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
          <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <button
              v-for="product in productStore.products"
              :key="product.id"
              @click="addProductToCart(product)"
              class="bg-white rounded-xl shadow-md border-2 border-gray-200 p-5 cursor-pointer hover:shadow-lg hover:border-primary-500 hover:scale-105 transition-all active:scale-95 touch-manipulation"
            >
              <div v-if="product.image" class="h-36 mb-3 flex items-center justify-center bg-gray-100 rounded-lg">
                <img :src="getImageUrl(product.image)" :alt="product.name" class="max-h-full max-w-full object-contain" @error="handleImageError" />
              </div>
              <div v-else class="h-36 mb-3 flex items-center justify-center bg-gray-100 rounded-lg">
                <svg class="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 class="font-semibold text-gray-900 text-base mb-2 line-clamp-2 min-h-[3rem]">{{ product.name }}</h3>
              <div v-if="product.total_stock !== undefined" class="text-xs text-gray-500 mb-2">
                Stock: <span :class="product.total_stock > 0 ? 'text-green-600' : 'text-red-600'">{{ product.total_stock }}</span>
              </div>
              <p class="text-2xl font-bold text-primary-600">L {{ formatMoney(product.price) }}</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Section -->
      <div class="w-[28rem] bg-white border-l flex flex-col">
        <!-- Customer Selection -->
        <div class="p-5 border-b">
          <label class="block text-base font-semibold text-gray-700 mb-3">Cliente</label>
          <div class="flex space-x-2">
            <input
              v-model="customerSearchQuery"
              @input="searchCustomers"
              type="text"
              placeholder="Buscar cliente..."
              class="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <button @click="showCustomerModal = true" class="px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-lg">
              +
            </button>
          </div>
          <div v-if="saleStore.customer" class="mt-3 space-y-3">
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-base font-semibold text-gray-900">{{ saleStore.customer.name }}</p>
              <p v-if="saleStore.customer.rtn" class="text-sm text-gray-600 mt-1">RTN: {{ saleStore.customer.rtn }}</p>
              <button @click="saleStore.setCustomer(null)" class="mt-2 text-sm text-red-600 font-medium hover:text-red-700">
                Remover
              </button>
            </div>
            <!-- Loyalty Badge -->
            <LoyaltyBadge
              v-if="saleStore.customer.id"
              :customerId="saleStore.customer.id"
              :showRedeemButton="true"
              @redeem-points="openRedeemPointsModal"
              ref="loyaltyBadgeRef"
            />
          </div>
          <div v-else-if="customerSearchResults.length > 0" class="mt-3 max-h-48 overflow-y-auto border-2 rounded-lg">
            <button
              v-for="customer in customerSearchResults"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 border-b last:border-b-0 touch-manipulation"
            >
              <p class="text-base font-medium">{{ customer.name }}</p>
              <p v-if="customer.rtn" class="text-sm text-gray-600">RTN: {{ customer.rtn }}</p>
            </button>
          </div>
        </div>

        <!-- Coupon / Promotion Section -->
        <div v-if="can('apply_coupons')" class="p-5 border-b bg-purple-50">
          <label class="block text-base font-semibold text-gray-700 mb-3">
            🎁 Cupón / Promoción
          </label>
          <div class="flex space-x-2">
            <input
              v-model="couponCode"
              type="text"
              placeholder="Código de cupón..."
              class="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 uppercase"
              :disabled="validatingCoupon"
            />
            <button
              @click="validateAndApplyCoupon"
              :disabled="!couponCode || validatingCoupon || saleStore.cartItems.length === 0"
              class="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ validatingCoupon ? '...' : 'Aplicar' }}
            </button>
          </div>

          <!-- Applied Promotion -->
          <div v-if="appliedPromotion" class="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-green-800">✓ {{ appliedPromotion.name }}</p>
                <p class="text-xs text-green-700 mt-1">{{ getPromotionDescription(appliedPromotion) }}</p>
              </div>
              <button
                @click="removePromotion"
                class="ml-2 p-1 text-red-600 hover:text-red-800"
                title="Remover promoción"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Auto Promotions Available -->
          <div v-else-if="availableAutoPromotions.length > 0" class="mt-3">
            <p class="text-xs font-semibold text-gray-600 mb-2">Promociones disponibles:</p>
            <div class="space-y-2">
              <button
                v-for="promo in availableAutoPromotions"
                :key="promo.id"
                @click="applyAutoPromotion(promo)"
                class="w-full text-left p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 active:bg-blue-200"
              >
                <p class="text-xs font-semibold text-blue-800">{{ promo.name }}</p>
                <p class="text-xs text-blue-600">{{ getPromotionDescription(promo) }}</p>
              </button>
            </div>
          </div>
        </div>

        <!-- Gift Card Section -->
        <div v-if="can('redeem_gift_cards')" class="p-5 border-b bg-yellow-50">
          <label class="block text-base font-semibold text-gray-700 mb-3">
            🎫 Gift Card
          </label>
          <div class="flex space-x-2">
            <input
              v-model="giftCardCode"
              type="text"
              placeholder="Código de gift card..."
              class="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 uppercase"
              :disabled="checkingGiftCard"
            />
            <button
              @click="checkAndApplyGiftCard"
              :disabled="!giftCardCode || checkingGiftCard || saleStore.cartItems.length === 0"
              class="px-5 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ checkingGiftCard ? '...' : 'Aplicar' }}
            </button>
          </div>

          <!-- Applied Gift Card -->
          <div v-if="appliedGiftCard" class="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-green-800">✓ Gift Card: {{ appliedGiftCard.code }}</p>
                <p class="text-xs text-green-700 mt-1">
                  Balance: L. {{ parseFloat(appliedGiftCard.current_balance).toFixed(2) }} |
                  Aplicado: L. {{ giftCardDiscount.toFixed(2) }}
                </p>
              </div>
              <button
                @click="removeGiftCard"
                class="ml-2 p-1 text-red-600 hover:text-red-800"
                title="Remover gift card"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-5">
          <h3 class="font-bold text-lg text-gray-900 mb-4">Carrito ({{ saleStore.cartItems.length }})</h3>

          <div v-if="saleStore.cartItems.length === 0" class="text-center py-12">
            <svg class="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p class="text-gray-500 text-base">El carrito está vacío</p>
            <p class="text-gray-400 text-sm mt-1">Toca un producto para agregar</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in saleStore.cartItems"
              :key="index"
              class="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
            >
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-base text-gray-900 flex-1 pr-2">{{ item.product.name }}</h4>
                <button
                  @click="saleStore.removeFromCart(index)"
                  class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 rounded-lg touch-manipulation active:scale-95 transition-all"
                >
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Quantity Controls -->
              <div class="mb-3">
                <label class="text-sm font-medium text-gray-600 mb-2 block">Cantidad</label>
                <div class="flex items-center space-x-2">
                  <button
                    @click="decrementQuantity(index)"
                    class="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg text-xl font-bold touch-manipulation active:scale-95 transition-all"
                  >
                    −
                  </button>
                  <input
                    v-model.number="item.quantity"
                    @change="saleStore.updateCartItemQuantity(index, item.quantity)"
                    type="number"
                    min="1"
                    step="1"
                    class="flex-1 text-center px-3 py-3 text-lg font-semibold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                  <button
                    @click="incrementQuantity(index)"
                    class="w-12 h-12 flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-xl font-bold touch-manipulation active:scale-95 transition-all"
                  >
                    +
                  </button>
                </div>
              </div>

              <!-- Price -->
              <div class="mb-3">
                <label class="text-sm font-medium text-gray-600 mb-2 block">Precio Unitario</label>
                <div class="flex items-center">
                  <span class="text-lg font-medium mr-2">L</span>
                  <input
                    v-model.number="item.price"
                    @change="saleStore.updateCartItemPrice(index, item.price)"
                    type="number"
                    min="0"
                    step="0.01"
                    class="flex-1 px-3 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500"
                  />
                </div>
              </div>

              <!-- Subtotal -->
              <div class="flex justify-between items-center pt-3 border-t-2 border-gray-300">
                <span class="text-sm font-medium text-gray-600">Subtotal:</span>
                <span class="font-bold text-lg text-gray-900">L {{ formatMoney(item.quantity * item.price) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t-2 p-5 bg-gray-50">
          <div class="space-y-3 mb-5">
            <div class="flex justify-between text-base">
              <span class="font-medium text-gray-600">Subtotal:</span>
              <span class="font-semibold text-gray-900">L {{ formatMoney(cartTotals.subtotal) }}</span>
            </div>
            <div v-if="cartTotals.discount > 0" class="flex justify-between text-base">
              <span class="font-medium text-green-600">Descuento:</span>
              <span class="font-semibold text-green-600">- L {{ formatMoney(cartTotals.discount) }}</span>
            </div>
            <div class="flex justify-between text-base">
              <span class="font-medium text-gray-600">Impuesto:</span>
              <span class="font-semibold text-gray-900">L {{ formatMoney(cartTotals.tax) }}</span>
            </div>
            <div class="flex justify-between text-2xl font-bold border-t-2 pt-3">
              <span>Total:</span>
              <span class="text-primary-600">L {{ formatMoney(cartTotals.total) }}</span>
            </div>
          </div>

          <!-- Payment Method -->
          <div class="mb-4">
            <label class="block text-base font-semibold text-gray-700 mb-3">Método de Pago</label>
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                @click="paymentMethod = method.value"
                :class="[
                  'py-3 px-4 rounded-lg font-medium text-base touch-manipulation active:scale-95 transition-all',
                  paymentMethod === method.value
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-300'
                ]"
              >
                {{ method.label }}
              </button>
            </div>
          </div>

          <!-- Transaction Reference (for card, transfer, qr) -->
          <div v-if="['card', 'transfer', 'qr'].includes(paymentMethod)" class="mb-5">
            <label class="block text-base font-semibold text-gray-700 mb-3">
              Referencia de Transacción
              <span class="text-sm font-normal text-gray-500">(Recomendado)</span>
            </label>
            <input
              v-model="transactionReference"
              type="text"
              maxlength="100"
              class="w-full px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              :placeholder="getReferencePlaceholder(paymentMethod)"
            />
            <p class="text-xs text-gray-500 mt-2">
              {{ getReferenceHelpText(paymentMethod) }}
            </p>
          </div>

          <!-- Amount Paid (for cash) -->
          <div v-if="paymentMethod === 'cash'" class="mb-5">
            <label class="block text-base font-semibold text-gray-700 mb-3">Monto Recibido</label>
            <input
              v-model.number="amountPaid"
              type="number"
              step="0.01"
              min="0"
              class="w-full px-4 py-4 text-xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="0.00"
            />
            <!-- Quick Amount Buttons -->
            <div class="grid grid-cols-4 gap-2 mt-3">
              <button
                v-for="amount in quickAmounts"
                :key="amount"
                @click="amountPaid = cartTotals.total + amount"
                class="py-2 px-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium text-sm touch-manipulation active:scale-95 transition-all"
              >
                +{{ amount }}
              </button>
            </div>
            <div v-if="amountPaid >= cartTotals.total && amountPaid > 0" class="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
              <p class="text-lg font-bold text-green-700 text-center">
                Cambio: L {{ formatMoney(amountPaid - cartTotals.total) }}
              </p>
            </div>
          </div>

          <!-- Credit Information (for credit) -->
          <div v-if="paymentMethod === 'credit'" class="mb-5">
            <div v-if="!saleStore.customer || !saleStore.customer.id" class="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p class="font-semibold text-yellow-800">Cliente requerido</p>
                  <p class="text-sm text-yellow-700 mt-1">
                    Para ventas al crédito debes seleccionar un cliente con límite de crédito configurado.
                  </p>
                </div>
              </div>
            </div>
            <div v-else-if="saleStore.customer.credit_limit <= 0" class="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div class="flex items-start gap-2">
                <svg class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p class="font-semibold text-red-800">Sin límite de crédito</p>
                  <p class="text-sm text-red-700 mt-1">
                    Este cliente no tiene un límite de crédito configurado. Debes configurarlo en el módulo de clientes primero.
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="space-y-3">
              <div class="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-medium text-blue-900">Cliente:</span>
                  <span class="font-bold text-blue-900">{{ saleStore.customer.name }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs text-blue-700">Límite de Crédito</p>
                    <p class="text-lg font-bold text-blue-900">L {{ formatMoney(saleStore.customer.credit_limit) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Balance Actual</p>
                    <p class="text-lg font-bold text-blue-900">L {{ formatMoney(saleStore.customer.current_balance || 0) }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Disponible</p>
                    <p class="text-lg font-bold" :class="creditAvailable >= cartTotals.total ? 'text-green-700' : 'text-red-700'">
                      L {{ formatMoney(creditAvailable) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Días de Plazo</p>
                    <p class="text-lg font-bold text-blue-900">{{ saleStore.customer.credit_days || 30 }} días</p>
                  </div>
                </div>
              </div>

              <!-- Warning if exceeds limit -->
              <div v-if="creditAvailable < cartTotals.total" class="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
                <div class="flex items-start gap-2">
                  <svg class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div class="flex-1">
                    <p class="font-semibold text-orange-800">Límite de crédito excedido</p>
                    <p class="text-sm text-orange-700 mt-1">
                      Esta venta excede el crédito disponible por L {{ formatMoney(cartTotals.total - creditAvailable) }}.
                    </p>
                    <label class="flex items-center gap-2 mt-3">
                      <input type="checkbox" v-model="overrideCreditLimit" class="rounded border-orange-300 text-orange-600 focus:ring-orange-500">
                      <span class="text-sm font-medium text-orange-900">Autorizar venta excediendo el límite</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Success message -->
              <div v-else class="p-3 bg-green-50 border-2 border-green-300 rounded-lg">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p class="text-sm font-medium text-green-800">
                    Crédito disponible suficiente para esta venta
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Complete Sale Button -->
          <button
            @click="completeSale"
            :disabled="saleStore.cartItems.length === 0 || saleStore.loading"
            class="w-full py-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-all"
          >
            <span v-if="saleStore.loading">Procesando...</span>
            <span v-else>💰 Completar Venta</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Redeem Points Modal -->
    <div v-if="showRedeemModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Canjear Puntos</h3>

        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            Puntos disponibles: <span class="font-bold text-blue-600">{{ availablePoints }}</span>
          </p>
          <p class="text-sm text-gray-600 mb-4">
            Valor: <span class="font-bold text-green-600">L. {{ pointsValue.toFixed(2) }}</span>
          </p>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Puntos a canjear
          </label>
          <input
            v-model.number="pointsToRedeem"
            type="number"
            min="1"
            :max="maxRedeemablePoints"
            step="1"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="updateRedeemValue"
          />
          <p class="text-xs text-gray-500 mt-1">
            Máximo: {{ maxRedeemablePoints }} puntos (suficiente para cubrir el total)
          </p>
        </div>

        <div class="mb-6 p-3 bg-green-50 rounded-md">
          <p class="text-sm text-gray-700">
            Descuento a aplicar: <span class="font-bold text-green-600">L. {{ redeemValue.toFixed(2) }}</span>
          </p>
        </div>

        <div class="flex space-x-3">
          <button
            @click="closeRedeemModal"
            class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            @click="applyRedeemPoints"
            :disabled="!pointsToRedeem || pointsToRedeem <= 0"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Aplicar
          </button>
        </div>
      </div>
    </div>

    <!-- Invoice Ticket Modal -->
    <invoice-ticket
      :show="showInvoiceTicket"
      :sale="completedSale"
      :company="companyData"
      :cai="caiData"
      :invoice-number="completedSale?.sale_number || ''"
      @close="closeInvoiceTicket"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useProductStore } from '@/stores/product'
import { useCustomerStore } from '@/stores/customer'
import { useSaleStore } from '@/stores/sale'
import { usePromotionStore } from '@/stores/promotion'
import { useLoyaltyStore } from '@/stores/loyalty'
import { useGiftCardStore } from '@/stores/giftCard'
import { usePermissions } from '@/composables/usePermissions'
import { toast } from 'vue3-toastify'
import InvoiceTicket from '@/components/pos/InvoiceTicket.vue'
import LoyaltyBadge from '@/components/loyalty/LoyaltyBadge.vue'
import cashRegisterService from '@/services/cashRegisterService'

const authStore = useAuthStore()
const productStore = useProductStore()
const customerStore = useCustomerStore()
const saleStore = useSaleStore()
const promotionStore = usePromotionStore()
const loyaltyStore = useLoyaltyStore()
const giftCardStore = useGiftCardStore()
const { can } = usePermissions()

const searchQuery = ref('')
const customerSearchQuery = ref('')
const customerSearchResults = ref([])
const paymentMethod = ref('cash')
const transactionReference = ref('')
const amountPaid = ref(0)
const overrideCreditLimit = ref(false)
const showCustomerModal = ref(false)
const showInvoiceTicket = ref(false)
const completedSale = ref({})
const currentCashOpening = ref(null)
const loyaltyBadgeRef = ref(null)

// Redeem points related
const showRedeemModal = ref(false)
const pointsToRedeem = ref(0)
const redeemValue = ref(0)
const availablePoints = ref(0)
const pointsValue = ref(0)
const redeemedPoints = ref(0) // Track redeemed points for this sale
const loyaltyDiscount = ref(0) // Track loyalty discount applied

// Promotion/Coupon related
const couponCode = ref('')
const validatingCoupon = ref(false)
const appliedPromotion = ref(null)
const availableAutoPromotions = ref([])

// Gift Card related
const giftCardCode = ref('')
const checkingGiftCard = ref(false)
const appliedGiftCard = ref(null)
const giftCardDiscount = ref(0)

// Company and CAI data
const companyData = computed(() => ({
  name: authStore.currentUser?.company?.name || 'Mi Empresa',
  legal_name: authStore.currentUser?.company?.legal_name || 'Mi Empresa S.A. de C.V.',
  rtn: authStore.currentUser?.company?.rtn || '0000000000000',
  address: authStore.currentUser?.company?.address || 'Tegucigalpa, Honduras',
  city: authStore.currentUser?.company?.city || 'Tegucigalpa',
  phone: authStore.currentUser?.company?.phone || '+504 0000-0000',
  email: authStore.currentUser?.company?.email || 'info@empresa.hn'
}))

const caiData = ref(null) // Will be fetched from backend in future

const paymentMethods = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'qr', label: 'QR' },
  { value: 'credit', label: 'Crédito' }
]

const quickAmounts = [0, 10, 20, 50, 100, 200, 500, 1000]

const cartTotals = computed(() => saleStore.getCartTotal())

const maxRedeemablePoints = computed(() => {
  if (!availablePoints.value || !pointsValue.value) return 0
  // Can't redeem more points than available
  // Can't redeem more than the cart total
  const maxByTotal = Math.floor(cartTotals.value.total / (pointsValue.value / availablePoints.value))
  return Math.min(availablePoints.value, maxByTotal)
})

const creditAvailable = computed(() => {
  if (!saleStore.customer || !saleStore.customer.credit_limit) return 0
  const currentBalance = saleStore.customer.current_balance || 0
  return Math.max(0, saleStore.customer.credit_limit - currentBalance)
})

onMounted(async () => {
  await checkCashRegister()
  loadProducts()
})

async function checkCashRegister() {
  try {
    // Buscar todas las cajas y filtrar la que esté abierta
    const response = await cashRegisterService.getAll()
    if (response.data.success) {
      const cashRegisters = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data.data || []

      // Buscar si alguna caja tiene una apertura activa
      for (const cashRegister of cashRegisters) {
        try {
          const openingResponse = await cashRegisterService.getCurrentOpening(cashRegister.id)
          if (openingResponse.data.success && openingResponse.data.data && openingResponse.data.data.status === 'open') {
            currentCashOpening.value = openingResponse.data.data
            toast.success(`Caja abierta: ${cashRegister.name}`)
            return
          }
        } catch (err) {
          // Esta caja no tiene apertura activa, continuar con la siguiente
          continue
        }
      }

      // No se encontró ninguna caja abierta
      toast.warning('⚠️ No tienes una caja abierta. Por favor, abre una caja en el módulo de Cajas Registradoras antes de realizar ventas.', {
        autoClose: false
      })
    }
  } catch (error) {
    console.error('Error checking cash register:', error)
    toast.error('Error al verificar el estado de la caja')
  }
}

async function loadProducts() {
  await productStore.fetchProducts({ per_page: 50, is_active: true })
}

async function searchProducts() {
  if (searchQuery.value.length >= 2) {
    await productStore.fetchProducts({
      search: searchQuery.value,
      per_page: 50,
      is_active: true
    })
  } else if (searchQuery.value.length === 0) {
    await loadProducts()
  }
}

function addProductToCart(product) {
  saleStore.addToCart(product, 1)
  toast.success(`${product.name} agregado al carrito`)
}

async function searchCustomers() {
  if (customerSearchQuery.value.length >= 2) {
    try {
      const response = await customerStore.searchCustomers(customerSearchQuery.value)
      customerSearchResults.value = response
    } catch (error) {
      console.error(error)
    }
  } else {
    customerSearchResults.value = []
  }
}

async function selectCustomer(customer) {
  await saleStore.setCustomer(customer)
  customerSearchQuery.value = customer.name
  customerSearchResults.value = []
}

async function completeSale() {
  if (saleStore.cartItems.length === 0) {
    toast.error('El carrito está vacío')
    return
  }

  // Verificar que haya una caja abierta
  if (!currentCashOpening.value) {
    toast.error('No hay una caja abierta. Por favor, abre una caja antes de realizar ventas.')
    return
  }

  if (paymentMethod.value === 'cash' && amountPaid.value < cartTotals.value.total) {
    toast.error('El monto recibido es menor al total')
    return
  }

  // Validaciones para ventas al crédito
  if (paymentMethod.value === 'credit') {
    if (!saleStore.customer || !saleStore.customer.id) {
      toast.error('Para ventas al crédito debes seleccionar un cliente')
      return
    }
    if (saleStore.customer.credit_limit <= 0) {
      toast.error('Este cliente no tiene un límite de crédito configurado')
      return
    }
    if (creditAvailable.value < cartTotals.value.total && !overrideCreditLimit.value) {
      toast.error('El cliente no tiene crédito disponible suficiente. Marca la casilla de autorización para continuar.')
      return
    }
  }

  const saleData = {
    branch_id: authStore.currentUser.branch_id,
    cash_opening_id: currentCashOpening.value.id,
    customer_id: saleStore.customer?.id || null,
    customer_name: saleStore.customer?.name || 'Consumidor Final',
    customer_rtn: saleStore.customer?.rtn || null,
    items: saleStore.cartItems.map(item => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      tax_rate: item.tax_rate || 0
    })),
    discount: saleStore.discount,
    promotion_id: appliedPromotion.value?.id || null,
    coupon_code: appliedPromotion.value?.code || null,
    payment_method: paymentMethod.value,
    transaction_reference: transactionReference.value || null,
    amount_paid: paymentMethod.value === 'cash' ? amountPaid.value : cartTotals.value.total,
    amount_change: paymentMethod.value === 'cash' ? (amountPaid.value - cartTotals.value.total) : 0,
    notes: saleStore.notes,
    override_credit_limit: paymentMethod.value === 'credit' ? overrideCreditLimit.value : false
  }

  try {
    const response = await saleStore.createSale(saleData)
    const sale = response

    // Redeem points if any were selected
    if (redeemedPoints.value > 0 && saleStore.customer?.id) {
      try {
        await loyaltyStore.redeemPoints({
          customer_id: saleStore.customer.id,
          points: redeemedPoints.value,
          sale_id: sale.id,
          description: `Canje de puntos en venta #${sale.sale_number || sale.id}`
        })
      } catch (error) {
        console.error('Error redeeming points:', error)
        toast.warning('Venta creada, pero hubo un error al canjear los puntos')
      }
    }

    // Redeem gift card if one was applied
    if (appliedGiftCard.value && giftCardDiscount.value > 0) {
      try {
        await giftCardStore.redeemGiftCard({
          code: appliedGiftCard.value.code,
          amount: giftCardDiscount.value,
          sale_id: sale.id,
          description: `Canje en venta #${sale.sale_number || sale.id}`
        })
      } catch (error) {
        console.error('Error redeeming gift card:', error)
        toast.warning('Venta creada, pero hubo un error al canjear la gift card')
      }
    }

    // Show success message with loyalty points if earned
    let successMessage = `Venta #${sale.sale_number || sale.id} completada exitosamente`
    if (sale.loyalty && sale.loyalty.points_earned > 0) {
      successMessage += ` - ¡${sale.loyalty.points_earned} puntos ganados!`
    }
    if (redeemedPoints.value > 0) {
      successMessage += ` - ${redeemedPoints.value} puntos canjeados`
    }
    if (appliedGiftCard.value && giftCardDiscount.value > 0) {
      successMessage += ` - L. ${giftCardDiscount.value.toFixed(2)} de gift card aplicados`
    }
    toast.success(successMessage)

    // Prepare sale data for invoice with all details
    completedSale.value = {
      ...sale,
      customer_name: saleData.customer_name,
      customer_rtn: saleData.customer_rtn,
      payment_method: saleData.payment_method,
      amount_paid: saleData.amount_paid,
      amount_change: saleData.amount_change,
      sold_at: new Date().toISOString(),
      details: saleStore.cartItems.map(item => ({
        product: item.product,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        tax_rate: item.tax_rate || 0
      })),
      user: authStore.currentUser,
      branch: authStore.currentUser?.branch,
      loyalty: sale.loyalty // Include loyalty info
    }

    console.log('Completed Sale Data:', completedSale.value)
    console.log('Loyalty Info:', completedSale.value.loyalty)
    console.log('Company Data:', companyData.value)
    console.log('Showing invoice ticket...')

    // Show invoice ticket
    showInvoiceTicket.value = true

    console.log('showInvoiceTicket value:', showInvoiceTicket.value)

    // Refresh loyalty badge if customer has points (after showing ticket to not block)
    if (saleStore.customer?.id && loyaltyBadgeRef.value) {
      try {
        loyaltyBadgeRef.value.refresh()
      } catch (error) {
        console.warn('Error refreshing loyalty badge:', error)
      }
    }
  } catch (error) {
    console.error('Error al completar la venta:', error)
  }
}

function closeInvoiceTicket() {
  showInvoiceTicket.value = false
  clearSale()
}

function clearSale() {
  saleStore.clearCart()
  customerSearchQuery.value = ''
  customerSearchResults.value = []
  paymentMethod.value = 'cash'
  transactionReference.value = ''
  amountPaid.value = 0
  overrideCreditLimit.value = false
  searchQuery.value = ''
  couponCode.value = ''
  appliedPromotion.value = null
  availableAutoPromotions.value = []

  // Clear loyalty redemption data
  redeemedPoints.value = 0
  loyaltyDiscount.value = 0
  pointsToRedeem.value = 0
  redeemValue.value = 0
  availablePoints.value = 0
  pointsValue.value = 0

  // Clear gift card data
  giftCardCode.value = ''
  appliedGiftCard.value = null
  giftCardDiscount.value = 0

  loadProducts()
}

// Promotion Functions
async function validateAndApplyCoupon() {
  if (!couponCode.value) return

  validatingCoupon.value = true
  try {
    const branchId = authStore.currentUser?.branch_id
    const customerId = saleStore.customer?.id || null

    const promotion = await promotionStore.validateCoupon(couponCode.value, branchId, customerId)

    if (promotion) {
      await applyPromotion(promotion)
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
  } finally {
    validatingCoupon.value = false
  }
}

async function applyPromotion(promotion) {
  try {
    const result = await promotionStore.applyPromotion(
      promotion.id,
      saleStore.cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price
      }))
    )

    console.log('=== PROMOTION APPLICATION DEBUG ===')
    console.log('Result from promotionStore.applyPromotion:', result)
    console.log('Discount amount:', result?.discount_amount)
    console.log('Current saleStore.discount BEFORE:', saleStore.discount)

    if (result && result.discount_amount) {
      // Apply discount to cart
      saleStore.discount = result.discount_amount
      appliedPromotion.value = promotion

      console.log('Current saleStore.discount AFTER:', saleStore.discount)
      console.log('Cart totals:', saleStore.getCartTotal())

      toast.success(`Promoción "${promotion.name}" aplicada`)
    } else {
      console.log('WARNING: No discount_amount in result!')
      console.log('Result structure:', JSON.stringify(result, null, 2))
    }
  } catch (error) {
    console.error('Error applying promotion:', error)
  }
}

async function applyAutoPromotion(promotion) {
  couponCode.value = promotion.code || ''
  await applyPromotion(promotion)
}

function removePromotion() {
  saleStore.discount = 0
  appliedPromotion.value = null
  couponCode.value = ''
  toast.info('Promoción removida')
}

async function loadAvailablePromotions() {
  if (saleStore.cartItems.length === 0) {
    availableAutoPromotions.value = []
    return
  }

  try {
    const branchId = authStore.currentUser?.branch_id
    const customerId = saleStore.customer?.id || null

    const promotions = await promotionStore.getApplicablePromotions(
      saleStore.cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price
      })),
      branchId,
      customerId
    )

    // Filter only auto-apply promotions that don't have applied promotion
    availableAutoPromotions.value = !appliedPromotion.value
      ? (promotions || []).filter(p => p.auto_apply).slice(0, 3)
      : []
  } catch (error) {
    console.error('Error loading available promotions:', error)
    availableAutoPromotions.value = []
  }
}

function getPromotionDescription(promotion) {
  if (!promotion) return ''

  switch (promotion.type) {
    case 'percentage':
      return `${promotion.discount_value}% de descuento`
    case 'fixed_amount':
      return `L ${formatMoney(promotion.discount_value)} de descuento`
    case 'bogo':
      return `Compra ${promotion.buy_quantity} lleva ${promotion.get_quantity}`
    case 'volume':
      return `${promotion.buy_quantity}+ unidades = ${promotion.discount_value}% descuento`
    case 'bundle':
      return `${promotion.discount_value}% en bundle`
    case 'free_shipping':
      return 'Envío gratis'
    default:
      return promotion.description || ''
  }
}

// Gift Card Functions
async function checkAndApplyGiftCard() {
  if (!giftCardCode.value) return

  checkingGiftCard.value = true
  try {
    const cardData = await giftCardStore.checkBalance(giftCardCode.value.trim().toUpperCase())

    if (!cardData.is_active) {
      toast.error('Esta gift card no está activa')
      return
    }

    if (cardData.current_balance <= 0) {
      toast.error('Esta gift card no tiene balance disponible')
      return
    }

    appliedGiftCard.value = cardData

    // Calculate discount (use up to the total or the card balance, whichever is less)
    const cardBalance = parseFloat(cardData.current_balance)
    const maxDiscount = Math.min(cardBalance, cartTotals.value.total)
    giftCardDiscount.value = maxDiscount
    saleStore.discount = (saleStore.discount || 0) + maxDiscount

    toast.success(`Gift card aplicada - Descuento: L. ${maxDiscount.toFixed(2)}`)
  } catch (error) {
    console.error('Error checking gift card:', error)
  } finally {
    checkingGiftCard.value = false
  }
}

function removeGiftCard() {
  if (giftCardDiscount.value > 0) {
    saleStore.discount = Math.max(0, (saleStore.discount || 0) - giftCardDiscount.value)
  }
  appliedGiftCard.value = null
  giftCardCode.value = ''
  giftCardDiscount.value = 0
  toast.info('Gift card removida')
}

// Watch cart changes to update available promotions
watch(() => saleStore.cartItems.length, () => {
  loadAvailablePromotions()
}, { immediate: false })

watch(() => saleStore.customer, () => {
  loadAvailablePromotions()
}, { deep: true })

function formatMoney(amount) {
  return parseFloat(amount || 0).toFixed(2)
}

// Quantity controls
function incrementQuantity(index) {
  const item = saleStore.cartItems[index]
  saleStore.updateCartItemQuantity(index, item.quantity + 1)
}

function decrementQuantity(index) {
  const item = saleStore.cartItems[index]
  if (item.quantity > 1) {
    saleStore.updateCartItemQuantity(index, item.quantity - 1)
  }
}

// Loyalty points redemption
function openRedeemPointsModal() {
  if (!loyaltyBadgeRef.value?.summary) {
    toast.error('No se pudo cargar información de puntos')
    return
  }

  const summary = loyaltyBadgeRef.value.summary
  availablePoints.value = summary.points
  pointsValue.value = summary.points_value || 0
  pointsToRedeem.value = 0
  redeemValue.value = 0
  showRedeemModal.value = true
}

function closeRedeemModal() {
  showRedeemModal.value = false
  pointsToRedeem.value = 0
  redeemValue.value = 0
}

function updateRedeemValue() {
  if (!pointsToRedeem.value || pointsToRedeem.value <= 0) {
    redeemValue.value = 0
    return
  }

  // Ensure not exceeding max
  if (pointsToRedeem.value > maxRedeemablePoints.value) {
    pointsToRedeem.value = maxRedeemablePoints.value
  }

  // Calculate discount value
  const pointValueRatio = pointsValue.value / availablePoints.value
  redeemValue.value = pointsToRedeem.value * pointValueRatio
}

function applyRedeemPoints() {
  if (!pointsToRedeem.value || pointsToRedeem.value <= 0) {
    toast.error('Ingresa la cantidad de puntos a canjear')
    return
  }

  // Store the redeemed points and discount
  redeemedPoints.value = pointsToRedeem.value
  loyaltyDiscount.value = redeemValue.value

  // Apply as a general discount to the cart
  saleStore.discount = (saleStore.discount || 0) + redeemValue.value

  toast.success(`${pointsToRedeem.value} puntos canjeados - Descuento: L. ${redeemValue.value.toFixed(2)}`)
  closeRedeemModal()
}

// Image helper functions
function getImageUrl(imagePath) {
  if (!imagePath) return ''
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  const backendUrl = apiUrl.replace('/api', '')
  return `${backendUrl}${imagePath}`
}

function handleImageError(event) {
  event.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/%3E%3C/svg%3E'
  event.target.classList.add('bg-gray-200', 'p-3')
}

// Transaction reference helper functions
function getReferencePlaceholder(method) {
  const placeholders = {
    card: 'Ej: AUTH-123456, últimos 4 dígitos',
    transfer: 'Ej: TRANSF-789012, número de operación',
    qr: 'Ej: QR-345678, ID de transacción'
  }
  return placeholders[method] || 'Número de referencia'
}

function getReferenceHelpText(method) {
  const helpTexts = {
    card: 'Ingresa el código de autorización o los últimos 4 dígitos de la tarjeta',
    transfer: 'Ingresa el número de operación o referencia del banco',
    qr: 'Ingresa el ID de transacción o referencia del sistema QR'
  }
  return helpTexts[method] || 'Ingresa la referencia de la transacción para fines de auditoría'
}
</script>
