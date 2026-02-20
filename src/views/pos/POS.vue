<template>
  <div class="h-full flex flex-col bg-gray-50">
    <!-- Header -->
    <div
      class="bg-white shadow-sm px-3 md:px-6 py-3 md:py-5 flex items-center justify-between"
    >
      <div class="flex items-center space-x-2 md:space-x-4">
        <h1 class="text-lg md:text-2xl font-bold text-gray-900">POS</h1>
        <span
          v-if="authStore.currentUser"
          class="text-sm md:text-base text-gray-600 hidden sm:inline"
        >
          {{ authStore.currentUser.name }}
        </span>
      </div>
      <div class="flex items-center space-x-2 md:space-x-3">
        <!-- Keyboard shortcuts help button -->
        <button
          @click="showShortcutsHelp = true"
          class="hidden md:flex items-center gap-1 px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm font-medium"
          title="Atajos de teclado (F1)"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          F1
        </button>
        <!-- Mobile toggle button -->
        <button
          @click="mobileView = mobileView === 'products' ? 'cart' : 'products'"
          class="md:hidden px-3 py-2 bg-primary-600 text-white rounded-lg font-medium text-sm relative"
        >
          <span v-if="mobileView === 'products'">
            🛒 ({{ saleStore.cartItems.length }})
          </span>
          <span v-else>📦 Productos</span>
        </button>
        <button
          @click="clearSale"
          class="px-3 md:px-6 py-2 md:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm md:text-base"
        >
          Nueva
          <span class="hidden lg:inline text-green-200 text-xs">(F8)</span>
        </button>
        <router-link
          to="/dashboard"
          class="px-3 md:px-6 py-2 md:py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium text-sm md:text-base"
        >
          Salir
        </router-link>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col md:flex-row overflow-hidden">
      <!-- Products Section -->
      <div
        class="flex-1 flex flex-col overflow-hidden"
        :class="{ 'hidden md:flex': mobileView === 'cart' }"
      >
        <!-- Search Bar -->
        <div class="p-3 md:p-5 bg-white border-b">
          <input
            v-model="searchQuery"
            @input="searchProducts"
            type="text"
            placeholder="Buscar productos... (F2)"
            data-shortcut="search-products"
            class="w-full px-3 md:px-5 py-3 md:py-4 text-base md:text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            autofocus
          />
        </div>

        <!-- Categories Bar -->
        <div
          v-if="categoryStore.categories.length > 0"
          class="bg-white border-b px-3 md:px-5 py-2 md:py-3"
        >
          <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              @click="selectCategory(null)"
              :class="[
                'flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all touch-manipulation active:scale-95',
                !selectedCategory
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              Todas
            </button>
            <button
              v-for="category in categoryStore.categories"
              :key="category.id"
              @click="selectCategory(category.id)"
              :class="[
                'flex-shrink-0 px-4 py-2 rounded-full font-semibold text-sm transition-all touch-manipulation active:scale-95',
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
              ]"
            >
              {{ category.name }}
            </button>
          </div>
        </div>

        <!-- Product Grid -->
        <div class="flex-1 overflow-y-auto p-3 md:p-5">
          <div v-if="productStore.loading" class="text-center py-12">
            <p class="text-gray-500 text-lg">Cargando productos...</p>
          </div>
          <div
            v-else-if="productStore.products.length === 0"
            class="text-center py-12"
          >
            <p class="text-gray-500 text-lg">No se encontraron productos</p>
          </div>
          <template v-else>
            <div
              class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4"
            >
              <button
                v-for="product in productStore.products"
                :key="product.id"
                @click="addProductToCart(product)"
                class="bg-white rounded-lg md:rounded-xl shadow-md border-2 border-gray-200 p-2 md:p-5 cursor-pointer hover:shadow-lg hover:border-primary-500 hover:scale-105 transition-all active:scale-95 touch-manipulation"
              >
                <div
                  v-if="product.image"
                  class="h-20 md:h-36 mb-2 md:mb-3 flex items-center justify-center bg-gray-100 rounded-lg"
                >
                  <img
                    :src="getThumbUrl(product.image)"
                    :alt="product.name"
                    class="max-h-full max-w-full object-contain"
                    loading="lazy"
                    decoding="async"
                    @error="handleImageError"
                  />
                </div>
                <div
                  v-else
                  class="h-20 md:h-36 mb-2 md:mb-3 flex items-center justify-center bg-gray-100 rounded-lg"
                >
                  <svg
                    class="w-10 md:w-20 h-10 md:h-20 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
                <h3
                  class="font-semibold text-gray-900 text-xs md:text-base mb-1 line-clamp-2 min-h-[2rem] md:min-h-[3rem]"
                >
                  {{ product.name }}
                </h3>
                <p
                  v-if="product.description"
                  class="text-[10px] md:text-xs text-gray-500 mb-1 md:mb-2 line-clamp-2"
                >
                  {{ product.description }}
                </p>
                <div
                  v-if="product.manage_stock === false"
                  class="text-[10px] md:text-xs text-blue-500 mb-1 md:mb-2"
                >
                  Disponible
                </div>
                <div
                  v-else-if="product.total_stock !== undefined"
                  class="text-[10px] md:text-xs text-gray-500 mb-1 md:mb-2"
                >
                  Stock:
                  <span
                    :class="
                      product.total_stock > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    "
                    >{{ product.total_stock }}</span
                  >
                </div>
                <p class="text-base md:text-2xl font-bold text-primary-600">
                  L {{ formatMoney(product.price) }}
                </p>
              </button>
            </div>

            <!-- Pagination -->
            <div
              v-if="
                productStore.pagination.total > productStore.pagination.per_page
              "
              class="flex items-center justify-center gap-2 mt-4 pb-2"
            >
              <button
                @click="changePage(productStore.pagination.current_page - 1)"
                :disabled="productStore.pagination.current_page <= 1"
                class="px-3 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-all"
              >
                &larr; Ant
              </button>
              <template v-for="page in paginationPages" :key="page">
                <span v-if="page === '...'" class="px-2 text-gray-400"
                  >...</span
                >
                <button
                  v-else
                  @click="changePage(page)"
                  :class="[
                    'w-10 h-10 rounded-lg text-sm font-bold touch-manipulation active:scale-95 transition-all',
                    page === productStore.pagination.current_page
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 hover:bg-gray-100',
                  ]"
                >
                  {{ page }}
                </button>
              </template>
              <button
                @click="changePage(productStore.pagination.current_page + 1)"
                :disabled="productStore.pagination.current_page >= totalPages"
                class="px-3 py-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-all"
              >
                Sig &rarr;
              </button>
            </div>
          </template>
        </div>
      </div>

      <!-- Cart Section -->
      <div
        class="w-full md:w-[28rem] bg-white border-l flex flex-col"
        :class="{ 'hidden md:flex': mobileView === 'products' }"
      >
        <!-- Customer Selection -->
        <div class="p-3 md:p-5 border-b">
          <label
            class="block text-sm md:text-base font-semibold text-gray-700 mb-2 md:mb-3"
            >Cliente</label
          >
          <div class="flex space-x-2">
            <input
              v-model="customerSearchQuery"
              @input="searchCustomers"
              type="text"
              placeholder="Buscar cliente... (F3)"
              data-shortcut="search-customer"
              class="flex-1 px-4 py-3 text-base border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
            />
            <button
              @click="showCustomerModal = true"
              class="px-5 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-lg"
            >
              +
            </button>
          </div>
          <div v-if="saleStore.customer" class="mt-3 space-y-3">
            <div class="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-base font-semibold text-gray-900">
                {{ saleStore.customer.name }}
              </p>
              <p
                v-if="saleStore.customer.rtn"
                class="text-sm text-gray-600 mt-1"
              >
                RTN: {{ saleStore.customer.rtn }}
              </p>
              <button
                @click="saleStore.setCustomer(null)"
                class="mt-2 text-sm text-red-600 font-medium hover:text-red-700"
              >
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
          <div
            v-else-if="customerSearchResults.length > 0"
            class="mt-3 max-h-48 overflow-y-auto border-2 rounded-lg"
          >
            <button
              v-for="customer in customerSearchResults"
              :key="customer.id"
              @click="selectCustomer(customer)"
              class="w-full text-left p-3 hover:bg-gray-50 active:bg-gray-100 border-b last:border-b-0 touch-manipulation"
            >
              <p class="text-base font-medium">{{ customer.name }}</p>
              <p v-if="customer.rtn" class="text-sm text-gray-600">
                RTN: {{ customer.rtn }}
              </p>
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
              :disabled="
                !couponCode ||
                validatingCoupon ||
                saleStore.cartItems.length === 0
              "
              class="px-5 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ validatingCoupon ? "..." : "Aplicar" }}
            </button>
          </div>

          <!-- Applied Promotion -->
          <div
            v-if="appliedPromotion"
            class="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-green-800">
                  ✓ {{ appliedPromotion.name }}
                </p>
                <p class="text-xs text-green-700 mt-1">
                  {{ getPromotionDescription(appliedPromotion) }}
                </p>
              </div>
              <button
                @click="removePromotion"
                class="ml-2 p-1 text-red-600 hover:text-red-800"
                title="Remover promoción"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Auto Promotions Available -->
          <div v-else-if="availableAutoPromotions.length > 0" class="mt-3">
            <p class="text-xs font-semibold text-gray-600 mb-2">
              Promociones disponibles:
            </p>
            <div class="space-y-2">
              <button
                v-for="promo in availableAutoPromotions"
                :key="promo.id"
                @click="applyAutoPromotion(promo)"
                class="w-full text-left p-2 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 active:bg-blue-200"
              >
                <p class="text-xs font-semibold text-blue-800">
                  {{ promo.name }}
                </p>
                <p class="text-xs text-blue-600">
                  {{ getPromotionDescription(promo) }}
                </p>
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
              :disabled="
                !giftCardCode ||
                checkingGiftCard ||
                saleStore.cartItems.length === 0
              "
              class="px-5 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ checkingGiftCard ? "..." : "Aplicar" }}
            </button>
          </div>

          <!-- Applied Gift Card -->
          <div
            v-if="appliedGiftCard"
            class="mt-3 p-3 bg-green-50 border-2 border-green-300 rounded-lg"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <p class="text-sm font-bold text-green-800">
                  ✓ Gift Card: {{ appliedGiftCard.code }}
                </p>
                <p class="text-xs text-green-700 mt-1">
                  Balance: L.
                  {{ parseFloat(appliedGiftCard.current_balance).toFixed(2) }} |
                  Aplicado: L. {{ giftCardDiscount.toFixed(2) }}
                </p>
              </div>
              <button
                @click="removeGiftCard"
                class="ml-2 p-1 text-red-600 hover:text-red-800"
                title="Remover gift card"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Cart Items -->
        <div class="flex-1 overflow-y-auto p-3 md:p-5">
          <h3 class="font-bold text-base md:text-lg text-gray-900 mb-3 md:mb-4">
            Carrito ({{ saleStore.cartItems.length }})
          </h3>

          <div
            v-if="saleStore.cartItems.length === 0"
            class="text-center py-12"
          >
            <svg
              class="w-16 h-16 text-gray-400 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p class="text-gray-500 text-base">El carrito está vacío</p>
            <p class="text-gray-400 text-sm mt-1">
              Toca un producto para agregar
            </p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="(item, index) in saleStore.cartItems"
              :key="index"
              class="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
            >
              <div class="flex justify-between items-start mb-3">
                <h4 class="font-semibold text-base text-gray-900 flex-1 pr-2">
                  {{ item.product.name }}
                </h4>
                <button
                  @click="saleStore.removeFromCart(index)"
                  class="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200 rounded-lg touch-manipulation active:scale-95 transition-all"
                >
                  <svg
                    class="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <!-- Quantity Controls -->
              <div class="mb-3">
                <label class="text-sm font-medium text-gray-600 mb-2 block"
                  >Cantidad</label
                >
                <div class="flex items-center space-x-2">
                  <button
                    @click="decrementQuantity(index)"
                    class="w-12 h-12 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-lg text-xl font-bold touch-manipulation active:scale-95 transition-all"
                  >
                    −
                  </button>
                  <input
                    v-model.number="item.quantity"
                    @change="
                      saleStore.updateCartItemQuantity(index, item.quantity)
                    "
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
                <label class="text-sm font-medium text-gray-600 mb-2 block"
                  >Precio Unitario</label
                >
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

              <!-- Item Notes (KDS) -->
              <div v-if="enableKds" class="mb-3">
                <input
                  v-model="item.notes"
                  type="text"
                  maxlength="200"
                  placeholder="Nota: sin cebolla, extra salsa..."
                  class="w-full px-3 py-2 text-sm border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 bg-orange-50"
                />
              </div>

              <!-- Subtotal -->
              <div
                class="flex justify-between items-center pt-3 border-t-2 border-gray-300"
              >
                <span class="text-sm font-medium text-gray-600">Subtotal:</span>
                <span class="font-bold text-lg text-gray-900"
                  >L {{ formatMoney(item.quantity * item.price) }}</span
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Cart Summary -->
        <div class="border-t-2 p-3 md:p-5 bg-gray-50">
          <div class="space-y-3 mb-5">
            <div class="flex justify-between text-base">
              <span class="font-medium text-gray-600">Subtotal:</span>
              <span class="font-semibold text-gray-900"
                >L {{ formatMoney(cartTotals.subtotal) }}</span
              >
            </div>
            <div
              v-if="cartTotals.discount > 0"
              class="flex justify-between text-base"
            >
              <span class="font-medium text-green-600">Descuento:</span>
              <span class="font-semibold text-green-600"
                >- L {{ formatMoney(cartTotals.discount) }}</span
              >
            </div>
            <div class="flex justify-between text-base">
              <span class="font-medium text-gray-600">Impuesto:</span>
              <span class="font-semibold text-gray-900"
                >L {{ formatMoney(cartTotals.tax) }}</span
              >
            </div>
            <div
              class="flex justify-between text-2xl font-bold border-t-2 pt-3"
            >
              <span>Total:</span>
              <span class="text-primary-600"
                >L {{ formatMoney(cartTotals.total) }}</span
              >
            </div>
          </div>

          <!-- Payment Method -->
          <div class="mb-4">
            <label class="block text-base font-semibold text-gray-700 mb-3"
              >Método de Pago</label
            >
            <div class="grid grid-cols-2 gap-2 mb-3">
              <button
                v-for="method in paymentMethods"
                :key="method.value"
                @click="paymentMethod = method.value"
                :class="[
                  'py-3 px-4 rounded-lg font-medium text-base touch-manipulation active:scale-95 transition-all',
                  paymentMethod === method.value
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-300',
                ]"
              >
                {{ method.label }}
              </button>
            </div>
          </div>

          <!-- Transaction Reference (for card, transfer, qr) -->
          <div
            v-if="['card', 'transfer', 'qr'].includes(paymentMethod)"
            class="mb-5"
          >
            <label class="block text-base font-semibold text-gray-700 mb-3">
              Referencia de Transacción
              <span class="text-sm font-normal text-gray-500"
                >(Recomendado)</span
              >
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
            <label class="block text-base font-semibold text-gray-700 mb-3"
              >Monto Recibido</label
            >
            <input
              v-model.number="amountPaid"
              type="number"
              step="0.01"
              min="0"
              data-shortcut="amount-paid"
              class="w-full px-4 py-4 text-xl font-semibold text-center border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
              placeholder="0.00 (F6)"
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
            <div
              v-if="amountPaid >= cartTotals.total && amountPaid > 0"
              class="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg"
            >
              <p class="text-lg font-bold text-green-700 text-center">
                Cambio: L {{ formatMoney(amountPaid - cartTotals.total) }}
              </p>
            </div>
          </div>

          <!-- Credit Information (for credit) -->
          <div v-if="paymentMethod === 'credit'" class="mb-5">
            <div
              v-if="!saleStore.customer || !saleStore.customer.id"
              class="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg"
            >
              <div class="flex items-start gap-2">
                <svg
                  class="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p class="font-semibold text-yellow-800">Cliente requerido</p>
                  <p class="text-sm text-yellow-700 mt-1">
                    Para ventas al crédito debes seleccionar un cliente con
                    límite de crédito configurado.
                  </p>
                </div>
              </div>
            </div>
            <div
              v-else-if="saleStore.customer.credit_limit <= 0"
              class="p-4 bg-red-50 border-2 border-red-300 rounded-lg"
            >
              <div class="flex items-start gap-2">
                <svg
                  class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
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
                <div>
                  <p class="font-semibold text-red-800">
                    Sin límite de crédito
                  </p>
                  <p class="text-sm text-red-700 mt-1">
                    Este cliente no tiene un límite de crédito configurado.
                    Debes configurarlo en el módulo de clientes primero.
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="space-y-3">
              <div class="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div class="flex justify-between items-center mb-3">
                  <span class="text-sm font-medium text-blue-900"
                    >Cliente:</span
                  >
                  <span class="font-bold text-blue-900">{{
                    saleStore.customer.name
                  }}</span>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <p class="text-xs text-blue-700">Límite de Crédito</p>
                    <p class="text-lg font-bold text-blue-900">
                      L {{ formatMoney(saleStore.customer.credit_limit) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Balance Actual</p>
                    <p class="text-lg font-bold text-blue-900">
                      L
                      {{ formatMoney(saleStore.customer.current_balance || 0) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Disponible</p>
                    <p
                      class="text-lg font-bold"
                      :class="
                        creditAvailable >= cartTotals.total
                          ? 'text-green-700'
                          : 'text-red-700'
                      "
                    >
                      L {{ formatMoney(creditAvailable) }}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-blue-700">Días de Plazo</p>
                    <p class="text-lg font-bold text-blue-900">
                      {{ saleStore.customer.credit_days || 30 }} días
                    </p>
                  </div>
                </div>
              </div>

              <!-- Warning if exceeds limit -->
              <div
                v-if="creditAvailable < cartTotals.total"
                class="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg"
              >
                <div class="flex items-start gap-2">
                  <svg
                    class="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div class="flex-1">
                    <p class="font-semibold text-orange-800">
                      Límite de crédito excedido
                    </p>
                    <p class="text-sm text-orange-700 mt-1">
                      Esta venta excede el crédito disponible por L
                      {{ formatMoney(cartTotals.total - creditAvailable) }}.
                    </p>
                    <label class="flex items-center gap-2 mt-3">
                      <input
                        type="checkbox"
                        v-model="overrideCreditLimit"
                        class="rounded border-orange-300 text-orange-600 focus:ring-orange-500"
                      />
                      <span class="text-sm font-medium text-orange-900"
                        >Autorizar venta excediendo el límite</span
                      >
                    </label>
                  </div>
                </div>
              </div>

              <!-- Success message -->
              <div
                v-else
                class="p-3 bg-green-50 border-2 border-green-300 rounded-lg"
              >
                <div class="flex items-center gap-2">
                  <svg
                    class="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p class="text-sm font-medium text-green-800">
                    Crédito disponible suficiente para esta venta
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Kitchen Notes (KDS) -->
          <div v-if="enableKds" class="mb-4">
            <button
              @click="showKitchenNotes = !showKitchenNotes"
              class="w-full flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-sm font-semibold text-orange-800"
            >
              <span class="flex items-center gap-2">
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
                Notas para Cocina
              </span>
              <svg
                class="w-4 h-4 transition-transform"
                :class="{ 'rotate-180': showKitchenNotes }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <textarea
              v-if="showKitchenNotes"
              v-model="kitchenNotes"
              rows="2"
              maxlength="500"
              placeholder="Instrucciones generales para cocina..."
              class="w-full mt-2 px-3 py-2 text-sm border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-200 bg-orange-50"
            ></textarea>
          </div>

          <!-- Order Number Toggle -->
          <label
            v-if="enableOrderNumbers && !enableKds"
            class="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors"
          >
            <input
              type="checkbox"
              v-model="assignOrderNumber"
              class="w-5 h-5 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
            />
            <div>
              <span class="text-sm font-semibold text-blue-800"
                >Asignar No. de Orden</span
              >
              <span class="text-xs text-blue-600 block"
                >Para restaurantes, pollerías, etc.</span
              >
            </div>
          </label>

          <!-- Complete Sale Button -->
          <button
            @click="completeSale"
            :disabled="saleStore.cartItems.length === 0 || saleStore.loading"
            class="w-full py-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl hover:from-green-700 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation active:scale-95 transition-all"
          >
            <span v-if="saleStore.loading">Procesando...</span>
            <span v-else>Completar Venta (F9)</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Redeem Points Modal -->
    <div
      v-if="showRedeemModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Canjear Puntos</h3>

        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            Puntos disponibles:
            <span class="font-bold text-blue-600">{{ availablePoints }}</span>
          </p>
          <p class="text-sm text-gray-600 mb-4">
            Valor:
            <span class="font-bold text-green-600"
              >L. {{ pointsValue.toFixed(2) }}</span
            >
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
            Máximo: {{ maxRedeemablePoints }} puntos (suficiente para cubrir el
            total)
          </p>
        </div>

        <div class="mb-6 p-3 bg-green-50 rounded-md">
          <p class="text-sm text-gray-700">
            Descuento a aplicar:
            <span class="font-bold text-green-600"
              >L. {{ redeemValue.toFixed(2) }}</span
            >
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

    <!-- Quick Create Customer Modal -->
    <div
      v-if="showCustomerModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 class="text-xl font-semibold text-gray-900 mb-4">Nuevo Cliente</h3>
        <form @submit.prevent="handleQuickCreateCustomer" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Nombre *</label
            >
            <input
              v-model="newCustomerForm.name"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Nombre del cliente"
              ref="customerNameInputRef"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >RTN</label
            >
            <input
              v-model="newCustomerForm.rtn"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="0000-0000-000000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Telefono</label
            >
            <input
              v-model="newCustomerForm.phone"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="+504 0000-0000"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >Email</label
            >
            <input
              v-model="newCustomerForm.email"
              type="email"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div class="flex space-x-3 pt-2">
            <button
              type="button"
              @click="showCustomerModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              :disabled="!newCustomerForm.name || creatingCustomer"
              class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ creatingCustomer ? "Guardando..." : "Guardar" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Invoice Ticket Modal -->
    <invoice-ticket
      :show="showInvoiceTicket"
      :sale="completedSale"
      :company="companyData"
      :cai="caiData"
      :invoice-number="
        completedSale?.invoice_number || completedSale?.sale_number || ''
      "
      @close="closeInvoiceTicket"
    />

    <!-- Shortcuts Help Overlay -->
    <shortcuts-help-overlay
      :show="showShortcutsHelp"
      :shortcuts="shortcutsList"
      @close="showShortcutsHelp = false"
    />

    <!-- Kitchen Orders Mini Panel (KDS) -->
    <div v-if="enableKds" class="fixed bottom-4 right-4 z-40">
      <!-- Toggle Button -->
      <button
        @click="showKitchenPanel = !showKitchenPanel"
        class="relative w-14 h-14 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center"
        title="Pedidos de Cocina"
      >
        <svg
          class="w-7 h-7"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
          />
        </svg>
        <!-- Badge with active count -->
        <span
          v-if="kitchenActiveCount > 0"
          class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
        >
          {{ kitchenActiveCount }}
        </span>
        <!-- Ready indicator -->
        <span
          v-if="kitchenReadyCount > 0"
          class="absolute -top-1 -left-1 w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
        >
          {{ kitchenReadyCount }}
        </span>
      </button>

      <!-- Slide-up Panel -->
      <transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 translate-y-4 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-4 scale-95"
      >
        <div
          v-if="showKitchenPanel"
          class="absolute bottom-16 right-0 w-80 max-h-[70vh] bg-gray-900 text-white rounded-xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col"
        >
          <!-- Panel Header -->
          <div
            class="bg-gray-800 px-4 py-3 flex items-center justify-between border-b border-gray-700 flex-shrink-0"
          >
            <h3 class="font-bold text-sm flex items-center gap-2">
              <svg
                class="w-4 h-4 text-orange-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                />
              </svg>
              Pedidos Cocina
            </h3>
            <div class="flex items-center gap-2">
              <a
                href="/kitchen"
                target="_blank"
                class="text-xs text-blue-400 hover:text-blue-300 underline"
              >
                Pantalla completa
              </a>
              <button
                @click="showKitchenPanel = false"
                class="text-gray-400 hover:text-white"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Status Summary -->
          <div
            class="flex items-center gap-3 px-4 py-2 bg-gray-800/50 text-xs border-b border-gray-700/50 flex-shrink-0"
          >
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-yellow-500"></span>
              {{ kitchenPendingOrders.length }}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              {{ kitchenPreparingOrders.length }}
            </span>
            <span class="flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              {{ kitchenReadyOrders.length }}
            </span>
            <span class="ml-auto flex items-center gap-1">
              <span
                class="w-2 h-2 rounded-full animate-pulse"
                :class="kitchenStore.isPolling ? 'bg-green-500' : 'bg-red-500'"
              ></span>
              <span class="text-gray-500">Auto</span>
            </span>
          </div>

          <!-- Orders List -->
          <div class="flex-1 overflow-y-auto">
            <!-- Ready Orders (highlighted) -->
            <div v-if="kitchenReadyOrders.length > 0">
              <div
                class="px-3 py-1.5 bg-green-900/30 text-green-400 text-xs font-bold uppercase tracking-wide sticky top-0"
              >
                Listos para entregar
              </div>
              <div
                v-for="order in kitchenReadyOrders"
                :key="'r-' + order.id"
                class="px-3 py-2.5 border-b border-gray-700/50 bg-green-900/20 hover:bg-green-900/30"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-green-400"
                    >#{{ order.order_number || order.id }}</span
                  >
                  <button
                    @click="markDelivered(order.id)"
                    class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 font-medium"
                  >
                    Entregado
                  </button>
                </div>
                <div v-if="order.customer" class="text-xs text-gray-400 mb-1">
                  {{ order.customer.name }}
                </div>
                <div class="space-y-0.5">
                  <div
                    v-for="detail in order.details"
                    :key="detail.id"
                    class="text-xs text-gray-300 flex items-start gap-1"
                  >
                    <span class="text-green-400 font-bold flex-shrink-0"
                      >{{ detail.quantity }}x</span
                    >
                    <span>{{
                      detail.product?.name || detail.product_name || "Producto"
                    }}</span>
                    <span
                      v-if="detail.product?.description"
                      class="text-gray-500 ml-1"
                      >- {{ detail.product.description }}</span
                    >
                    <span
                      v-if="detail.notes"
                      class="text-orange-400 italic ml-1"
                      >({{ detail.notes }})</span
                    >
                  </div>
                </div>
                <div
                  v-if="order.kitchen_notes"
                  class="mt-1 text-xs text-orange-300 italic"
                >
                  {{ order.kitchen_notes }}
                </div>
              </div>
            </div>

            <!-- Preparing Orders -->
            <div v-if="kitchenPreparingOrders.length > 0">
              <div
                class="px-3 py-1.5 bg-blue-900/30 text-blue-400 text-xs font-bold uppercase tracking-wide sticky top-0"
              >
                Preparando
              </div>
              <div
                v-for="order in kitchenPreparingOrders"
                :key="'p-' + order.id"
                class="px-3 py-2.5 border-b border-gray-700/50"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-blue-400"
                    >#{{ order.order_number || order.id }}</span
                  >
                  <span class="text-xs text-gray-500">{{
                    kitchenElapsed(order)
                  }}</span>
                </div>
                <div v-if="order.customer" class="text-xs text-gray-400 mb-1">
                  {{ order.customer.name }}
                </div>
                <div class="space-y-0.5">
                  <div
                    v-for="detail in order.details"
                    :key="detail.id"
                    class="text-xs text-gray-300 flex items-start gap-1"
                  >
                    <span class="text-blue-400 font-bold flex-shrink-0"
                      >{{ detail.quantity }}x</span
                    >
                    <span>{{
                      detail.product?.name || detail.product_name || "Producto"
                    }}</span>
                    <span
                      v-if="detail.product?.description"
                      class="text-gray-500 ml-1"
                      >- {{ detail.product.description }}</span
                    >
                    <span
                      v-if="detail.notes"
                      class="text-orange-400 italic ml-1"
                      >({{ detail.notes }})</span
                    >
                  </div>
                </div>
                <div
                  v-if="order.kitchen_notes"
                  class="mt-1 text-xs text-orange-300 italic"
                >
                  {{ order.kitchen_notes }}
                </div>
              </div>
            </div>

            <!-- Pending Orders -->
            <div v-if="kitchenPendingOrders.length > 0">
              <div
                class="px-3 py-1.5 bg-yellow-900/30 text-yellow-400 text-xs font-bold uppercase tracking-wide sticky top-0"
              >
                Pendientes
              </div>
              <div
                v-for="order in kitchenPendingOrders"
                :key="'w-' + order.id"
                class="px-3 py-2.5 border-b border-gray-700/50"
              >
                <div class="flex items-center justify-between mb-1">
                  <span class="font-bold text-yellow-400"
                    >#{{ order.order_number || order.id }}</span
                  >
                  <span class="text-xs text-gray-500">{{
                    kitchenElapsed(order)
                  }}</span>
                </div>
                <div v-if="order.customer" class="text-xs text-gray-400 mb-1">
                  {{ order.customer.name }}
                </div>
                <div class="space-y-0.5">
                  <div
                    v-for="detail in order.details"
                    :key="detail.id"
                    class="text-xs text-gray-300 flex items-start gap-1"
                  >
                    <span class="text-yellow-400 font-bold flex-shrink-0"
                      >{{ detail.quantity }}x</span
                    >
                    <span>{{
                      detail.product?.name || detail.product_name || "Producto"
                    }}</span>
                    <span
                      v-if="detail.product?.description"
                      class="text-gray-500 ml-1"
                      >- {{ detail.product.description }}</span
                    >
                    <span
                      v-if="detail.notes"
                      class="text-orange-400 italic ml-1"
                      >({{ detail.notes }})</span
                    >
                  </div>
                </div>
                <div
                  v-if="order.kitchen_notes"
                  class="mt-1 text-xs text-orange-300 italic"
                >
                  {{ order.kitchen_notes }}
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="kitchenActiveCount === 0"
              class="flex flex-col items-center justify-center py-8 text-gray-600"
            >
              <svg
                class="w-10 h-10 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <p class="text-sm">Sin pedidos activos</p>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useProductStore } from "@/stores/product";
import { useCategoryStore } from "@/stores/category";
import { useCustomerStore } from "@/stores/customer";
import { useSaleStore } from "@/stores/sale";
import { usePromotionStore } from "@/stores/promotion";
import { useLoyaltyStore } from "@/stores/loyalty";
import { useGiftCardStore } from "@/stores/giftCard";
import { useSettingsStore } from "@/stores/settings";
import { useKitchenStore } from "@/stores/kitchen";
import { usePermissions } from "@/composables/usePermissions";
import { toast } from "vue3-toastify";
import InvoiceTicket from "@/components/pos/InvoiceTicket.vue";
import LoyaltyBadge from "@/components/loyalty/LoyaltyBadge.vue";
import ShortcutsHelpOverlay from "@/components/pos/ShortcutsHelpOverlay.vue";
import cashRegisterService from "@/services/cashRegisterService";
import invoiceService from "@/services/invoiceService";
import { usePosKeyboardShortcuts } from "@/composables/usePosKeyboardShortcuts";
const authStore = useAuthStore();
const productStore = useProductStore();
const categoryStore = useCategoryStore();
const customerStore = useCustomerStore();
const saleStore = useSaleStore();
const promotionStore = usePromotionStore();
const loyaltyStore = useLoyaltyStore();
const giftCardStore = useGiftCardStore();
const settingsStore = useSettingsStore();
const kitchenStore = useKitchenStore();
const { can } = usePermissions();

const searchQuery = ref("");
const selectedCategory = ref(null);
const customerSearchQuery = ref("");
const mobileView = ref("products"); // 'products' or 'cart' for mobile toggle
const customerSearchResults = ref([]);
const paymentMethod = ref("cash");
const transactionReference = ref("");
const amountPaid = ref(0);
const overrideCreditLimit = ref(false);
const assignOrderNumber = ref(false);
const showCustomerModal = ref(false);
const showInvoiceTicket = ref(false);
const completedSale = ref({});
const currentCashOpening = ref(null);
const loyaltyBadgeRef = ref(null);

// Redeem points related
const showRedeemModal = ref(false);
const pointsToRedeem = ref(0);
const redeemValue = ref(0);
const availablePoints = ref(0);
const pointsValue = ref(0);
const redeemedPoints = ref(0); // Track redeemed points for this sale
const loyaltyDiscount = ref(0); // Track loyalty discount applied

// Promotion/Coupon related
const couponCode = ref("");
const validatingCoupon = ref(false);
const appliedPromotion = ref(null);
const availableAutoPromotions = ref([]);

// Gift Card related
const giftCardCode = ref("");
const checkingGiftCard = ref(false);
const appliedGiftCard = ref(null);
const giftCardDiscount = ref(0);

// Quick create customer
const customerNameInputRef = ref(null);
const creatingCustomer = ref(false);
const newCustomerForm = ref({
  name: "",
  rtn: "",
  phone: "",
  email: "",
});

// Company and CAI data
const companyData = computed(() => {
  const company = authStore.currentUser?.company;
  let logoUrl = company?.logo_url || null;
  if (!logoUrl && company?.logo) {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const backendUrl = apiUrl.replace("/api", "");
    logoUrl = `${backendUrl}/storage/${company.logo}`;
  }
  return {
    name: company?.name || "Mi Empresa",
    legal_name: company?.legal_name || "Mi Empresa S.A. de C.V.",
    rtn: company?.rtn || "0000000000000",
    address: company?.address || "Tegucigalpa, Honduras",
    city: company?.city || "Tegucigalpa",
    phone: company?.phone || "+504 0000-0000",
    email: company?.email || "info@empresa.hn",
    logo_url: logoUrl,
  };
});

const caiData = ref(null); // Will be fetched from backend in future

const paymentMethods = [
  { value: "cash", label: "Efectivo" },
  { value: "card", label: "Tarjeta" },
  { value: "transfer", label: "Transferencia" },
  { value: "qr", label: "QR" },
  { value: "credit", label: "Crédito" },
];

const quickAmounts = [0, 10, 20, 50, 100, 200, 500, 1000];

const cartTotals = computed(() => saleStore.getCartTotal());

// Keyboard shortcuts
const { showShortcutsHelp, shortcutsList } = usePosKeyboardShortcuts({
  searchQuery,
  customerSearchQuery,
  paymentMethod,
  amountPaid,
  assignOrderNumber,
  showInvoiceTicket,
  showRedeemModal,
  showCustomerModal,
  saleStore,
  cartTotals,
  paymentMethods,
  quickAmounts,
  completeSale,
  clearSale,
  closeInvoiceTicket,
});

const maxRedeemablePoints = computed(() => {
  if (!availablePoints.value || !pointsValue.value) return 0;
  // Can't redeem more points than available
  // Can't redeem more than the cart total
  const maxByTotal = Math.floor(
    cartTotals.value.total / (pointsValue.value / availablePoints.value),
  );
  return Math.min(availablePoints.value, maxByTotal);
});

const creditAvailable = computed(() => {
  if (!saleStore.customer || !saleStore.customer.credit_limit) return 0;
  const currentBalance = saleStore.customer.current_balance || 0;
  return Math.max(0, saleStore.customer.credit_limit - currentBalance);
});

function parseCompanySettings() {
  const s = settingsStore.companySettings?.settings;
  if (!s) return {};
  if (typeof s === "object") return s;
  try {
    return JSON.parse(s);
  } catch {
    return {};
  }
}
const enableOrderNumbers = computed(
  () => parseCompanySettings().enable_order_numbers || false,
);
const enableKds = computed(() => parseCompanySettings().enable_kds || false);
const autoFiscalInvoice = computed(
  () => parseCompanySettings().auto_fiscal_invoice || false,
);
const kitchenNotes = ref("");
const showKitchenNotes = ref(false);

// Kitchen mini-panel
const showKitchenPanel = ref(false);
const knownReadyIds = ref(new Set());
const isFirstKitchenLoad = ref(true);

const kitchenPendingOrders = computed(() =>
  kitchenStore.orders.filter((o) => o.kitchen_status === "pending"),
);
const kitchenPreparingOrders = computed(() =>
  kitchenStore.orders.filter((o) => o.kitchen_status === "preparing"),
);
const kitchenReadyOrders = computed(() =>
  kitchenStore.orders.filter((o) => o.kitchen_status === "ready"),
);
const kitchenActiveCount = computed(() => kitchenStore.orders.length);
const kitchenReadyCount = computed(() => kitchenReadyOrders.value.length);

function kitchenElapsed(order) {
  const start = new Date(order.created_at);
  const diff = Math.round((Date.now() - start.getTime()) / 1000);
  const m = Math.floor(diff / 60);
  const s = diff % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

async function markDelivered(orderId) {
  try {
    await kitchenStore.updateStatus(orderId, "delivered");
    toast.success("Pedido entregado");
  } catch {
    toast.error("Error al marcar como entregado");
  }
}

// Audio for "order ready" notification in POS — using AudioContext
let posAudioCtx = null;

function ensurePosAudioCtx() {
  if (!posAudioCtx) {
    posAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (posAudioCtx.state === "suspended") posAudioCtx.resume();
  return posAudioCtx;
}

function playReadySound() {
  try {
    const ctx = ensurePosAudioCtx();
    const now = ctx.currentTime;
    // Cheerful ding-ding-ding sound
    for (let i = 0; i < 3; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = i % 2 === 0 ? 1047 : 1319;
      gain.gain.setValueAtTime(0.8, now + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.18 + 0.15);
      osc.start(now + i * 0.18);
      osc.stop(now + i * 0.18 + 0.16);
    }
  } catch (e) {
    // Audio not supported
  }
}

function resumePosAudio() {
  // Create AudioContext on first user interaction to unlock audio
  try {
    ensurePosAudioCtx();
  } catch {
    // AudioContext not supported
  }
  document.removeEventListener("click", resumePosAudio);
  document.removeEventListener("touchstart", resumePosAudio);
}

// Watch for orders becoming "ready" — notify cashier by comparing IDs
watch(
  kitchenReadyOrders,
  (readyOrders) => {
    if (!enableKds.value) return;

    const currentReadyIds = new Set(readyOrders.map((o) => o.id));

    if (isFirstKitchenLoad.value) {
      knownReadyIds.value = currentReadyIds;
      isFirstKitchenLoad.value = false;
      return;
    }

    // Find new ready orders
    let newReady = 0;
    for (const id of currentReadyIds) {
      if (!knownReadyIds.value.has(id)) {
        newReady++;
      }
    }

    if (newReady > 0) {
      playReadySound();
      toast.info(
        `${newReady} pedido${newReady > 1 ? "s" : ""} listo${newReady > 1 ? "s" : ""} para entregar`,
        { autoClose: 4000 },
      );
    }

    knownReadyIds.value = currentReadyIds;
  },
  { deep: true },
);

onMounted(async () => {
  await settingsStore.fetchCompanySettings().catch(() => {});
  await checkCashRegister();
  loadCategories();
  loadProducts();

  // Start kitchen polling if KDS enabled (settings already loaded)
  if (enableKds.value) {
    kitchenStore.startPolling(5000);
  }

  // Resume AudioContext on first user interaction
  document.addEventListener("click", resumePosAudio);
  document.addEventListener("touchstart", resumePosAudio);
});

// Start kitchen polling when KDS setting loads
watch(enableKds, (enabled) => {
  if (enabled && !kitchenStore.isPolling) {
    kitchenStore.startPolling(5000);
  }
});

onUnmounted(() => {
  kitchenStore.stopPolling();
  document.removeEventListener("click", resumePosAudio);
  document.removeEventListener("touchstart", resumePosAudio);
});

async function checkCashRegister() {
  try {
    // Buscar todas las cajas y filtrar la que esté abierta
    const response = await cashRegisterService.getAll();
    if (response.data.success) {
      const cashRegisters = Array.isArray(response.data.data)
        ? response.data.data
        : response.data.data.data || [];

      // Buscar si alguna caja tiene una apertura activa
      for (const cashRegister of cashRegisters) {
        try {
          const openingResponse = await cashRegisterService.getCurrentOpening(
            cashRegister.id,
          );
          if (
            openingResponse.data.success &&
            openingResponse.data.data &&
            openingResponse.data.data.status === "open"
          ) {
            currentCashOpening.value = openingResponse.data.data;
            toast.success(`Caja abierta: ${cashRegister.name}`);
            return;
          }
        } catch (err) {
          // Esta caja no tiene apertura activa, continuar con la siguiente
          continue;
        }
      }

      // No se encontró ninguna caja abierta
      toast.warning(
        "⚠️ No tienes una caja abierta. Por favor, abre una caja en el módulo de Cajas Registradoras antes de realizar ventas.",
        {
          autoClose: false,
        },
      );
    }
  } catch (error) {
    console.error("Error checking cash register:", error);
    toast.error("Error al verificar el estado de la caja");
  }
}

async function loadCategories() {
  await categoryStore.fetchCategories({ per_page: 100 });
}

const PRODUCTS_PER_PAGE = 20;

async function loadProducts(page = 1) {
  const params = { per_page: PRODUCTS_PER_PAGE, page, is_active: true };
  if (selectedCategory.value) {
    params.category_id = selectedCategory.value;
  }
  await productStore.fetchProducts(params);
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId;
  searchQuery.value = "";
  loadProducts(1);
}

async function searchProducts() {
  if (searchQuery.value.length >= 2) {
    const params = {
      search: searchQuery.value,
      per_page: PRODUCTS_PER_PAGE,
      is_active: true,
    };
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value;
    }
    await productStore.fetchProducts(params);
  } else if (searchQuery.value.length === 0) {
    await loadProducts(1);
  }
}

function changePage(page) {
  if (page < 1 || page > totalPages.value) return;
  loadProducts(page);
}

const totalPages = computed(() => {
  const { total, per_page } = productStore.pagination;
  return Math.ceil(total / per_page) || 1;
});

const paginationPages = computed(() => {
  const current = productStore.pagination.current_page;
  const total = totalPages.value;
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 3) pages.push("...");
  for (
    let i = Math.max(2, current - 1);
    i <= Math.min(total - 1, current + 1);
    i++
  ) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
});

// Sound effect for adding to cart (reuses shared AudioContext)
function playAddSound() {
  try {
    const ctx = ensurePosAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Audio not supported
  }
}

function addProductToCart(product) {
  saleStore.addToCart(product, 1);
  playAddSound();
  toast.success(`${product.name} agregado al carrito`);
}

async function searchCustomers() {
  if (customerSearchQuery.value.length >= 2) {
    try {
      const response = await customerStore.searchCustomers(
        customerSearchQuery.value,
      );
      customerSearchResults.value = response;
    } catch (error) {
      console.error(error);
    }
  } else {
    customerSearchResults.value = [];
  }
}

async function selectCustomer(customer) {
  await saleStore.setCustomer(customer);
  customerSearchQuery.value = customer.name;
  customerSearchResults.value = [];
}

async function handleQuickCreateCustomer() {
  if (!newCustomerForm.value.name) return;
  creatingCustomer.value = true;
  try {
    const customer = await customerStore.createCustomer({
      name: newCustomerForm.value.name,
      rtn: newCustomerForm.value.rtn || null,
      phone: newCustomerForm.value.phone || null,
      email: newCustomerForm.value.email || null,
      is_active: true,
    });
    if (customer) {
      await selectCustomer(customer);
      showCustomerModal.value = false;
      newCustomerForm.value = { name: "", rtn: "", phone: "", email: "" };
    }
  } catch (error) {
    console.error("Error creating customer:", error);
  } finally {
    creatingCustomer.value = false;
  }
}

async function completeSale() {
  if (saleStore.cartItems.length === 0) {
    toast.error("El carrito está vacío");
    return;
  }

  // Verificar que haya una caja abierta
  if (!currentCashOpening.value) {
    toast.error(
      "No hay una caja abierta. Por favor, abre una caja antes de realizar ventas.",
    );
    return;
  }

  if (
    paymentMethod.value === "cash" &&
    amountPaid.value < cartTotals.value.total
  ) {
    toast.error("El monto recibido es menor al total");
    return;
  }

  // Validaciones para ventas al crédito
  if (paymentMethod.value === "credit") {
    if (!saleStore.customer || !saleStore.customer.id) {
      toast.error("Para ventas al crédito debes seleccionar un cliente");
      return;
    }
    if (saleStore.customer.credit_limit <= 0) {
      toast.error("Este cliente no tiene un límite de crédito configurado");
      return;
    }
    if (
      creditAvailable.value < cartTotals.value.total &&
      !overrideCreditLimit.value
    ) {
      toast.error(
        "El cliente no tiene crédito disponible suficiente. Marca la casilla de autorización para continuar.",
      );
      return;
    }
  }

  const saleData = {
    branch_id: authStore.currentUser.branch_id,
    cash_opening_id: currentCashOpening.value.id,
    customer_id: saleStore.customer?.id || null,
    customer_name: saleStore.customer?.name || "Consumidor Final",
    customer_rtn: saleStore.customer?.rtn || null,
    items: saleStore.cartItems.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      price: item.price,
      discount: item.discount || 0,
      tax_rate: item.tax_rate || 0,
      notes: item.notes || null,
    })),
    kitchen_notes: enableKds.value ? kitchenNotes.value || null : null,
    discount: saleStore.discount,
    promotion_id: appliedPromotion.value?.id || null,
    coupon_code: appliedPromotion.value?.code || null,
    payment_method: paymentMethod.value,
    transaction_reference: transactionReference.value || null,
    amount_paid:
      paymentMethod.value === "cash"
        ? amountPaid.value
        : cartTotals.value.total,
    amount_change:
      paymentMethod.value === "cash"
        ? amountPaid.value - cartTotals.value.total
        : 0,
    notes: saleStore.notes,
    override_credit_limit:
      paymentMethod.value === "credit" ? overrideCreditLimit.value : false,
    assign_order_number: assignOrderNumber.value,
  };

  try {
    const response = await saleStore.createSale(saleData);
    const sale = response;

    // Redeem points if any were selected
    if (redeemedPoints.value > 0 && saleStore.customer?.id) {
      try {
        await loyaltyStore.redeemPoints({
          customer_id: saleStore.customer.id,
          points: redeemedPoints.value,
          sale_id: sale.id,
          description: `Canje de puntos en venta #${sale.sale_number || sale.id}`,
        });
      } catch (error) {
        console.error("Error redeeming points:", error);
        toast.warning("Venta creada, pero hubo un error al canjear los puntos");
      }
    }

    // Redeem gift card if one was applied
    if (appliedGiftCard.value && giftCardDiscount.value > 0) {
      try {
        await giftCardStore.redeemGiftCard({
          code: appliedGiftCard.value.code,
          amount: giftCardDiscount.value,
          sale_id: sale.id,
          description: `Canje en venta #${sale.sale_number || sale.id}`,
        });
      } catch (error) {
        console.error("Error redeeming gift card:", error);
        toast.warning(
          "Venta creada, pero hubo un error al canjear la gift card",
        );
      }
    }

    // Show success message with loyalty points if earned
    let successMessage = `Venta #${sale.sale_number || sale.id} completada exitosamente`;
    if (sale.loyalty && sale.loyalty.points_earned > 0) {
      successMessage += ` - ¡${sale.loyalty.points_earned} puntos ganados!`;
    }
    if (redeemedPoints.value > 0) {
      successMessage += ` - ${redeemedPoints.value} puntos canjeados`;
    }
    if (appliedGiftCard.value && giftCardDiscount.value > 0) {
      successMessage += ` - L. ${giftCardDiscount.value.toFixed(2)} de gift card aplicados`;
    }
    toast.success(successMessage);

    // Prepare sale data for invoice with all details
    completedSale.value = {
      ...sale,
      customer_name: saleData.customer_name,
      customer_rtn: saleData.customer_rtn,
      payment_method: saleData.payment_method,
      amount_paid: saleData.amount_paid,
      amount_change: saleData.amount_change,
      sold_at: new Date().toISOString(),
      details: saleStore.cartItems.map((item) => ({
        product: item.product,
        product_name: item.product.name,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.quantity * item.price,
        tax_rate: item.tax_rate || 0,
      })),
      user: authStore.currentUser,
      branch: authStore.currentUser?.branch,
      loyalty: sale.loyalty, // Include loyalty info
    };

    // Auto-generate fiscal invoice if enabled
    if (autoFiscalInvoice.value) {
      try {
        const invoiceResponse = await invoiceService.create({
          sale_id: sale.id,
        });
        const invoice = invoiceResponse.data?.data || invoiceResponse.data;
        if (invoice) {
          // Build caiData object as InvoiceTicket expects
          caiData.value = invoice.cai_data || {
            cai_number: invoice.cai,
            range_from: invoice.range_from,
            range_to: invoice.range_to,
            expiry_date: invoice.cai_expiration,
          };
          completedSale.value.invoice_number = invoice.invoice_number || null;
          completedSale.value.invoice = invoice;
        }
      } catch (error) {
        console.warn("Auto-invoice failed:", error);
        const msg =
          error.response?.data?.error?.message ||
          "No se pudo generar la factura fiscal automáticamente";
        toast.warning(`Venta completada. ${msg}`);
      }
    }

    // Cash drawer opens automatically via ESC/POS commands embedded in InvoiceTicket print

    // Show invoice ticket
    showInvoiceTicket.value = true;

    // Refresh loyalty badge if customer has points (after showing ticket to not block)
    if (saleStore.customer?.id && loyaltyBadgeRef.value) {
      try {
        loyaltyBadgeRef.value.refresh();
      } catch (error) {
        console.warn("Error refreshing loyalty badge:", error);
      }
    }
  } catch (error) {
    console.error("Error al completar la venta:", error);
  }
}

function closeInvoiceTicket() {
  showInvoiceTicket.value = false;
  clearSale();
}

function clearSale() {
  saleStore.clearCart();
  customerSearchQuery.value = "";
  customerSearchResults.value = [];
  paymentMethod.value = "cash";
  transactionReference.value = "";
  amountPaid.value = 0;
  overrideCreditLimit.value = false;
  searchQuery.value = "";
  selectedCategory.value = null;
  couponCode.value = "";
  appliedPromotion.value = null;
  availableAutoPromotions.value = [];

  // Clear loyalty redemption data
  redeemedPoints.value = 0;
  loyaltyDiscount.value = 0;
  pointsToRedeem.value = 0;
  redeemValue.value = 0;
  availablePoints.value = 0;
  pointsValue.value = 0;

  // Clear gift card data
  giftCardCode.value = "";
  appliedGiftCard.value = null;
  giftCardDiscount.value = 0;

  // Clear fiscal invoice data
  caiData.value = null;

  // Clear kitchen notes
  kitchenNotes.value = "";
  showKitchenNotes.value = false;

  loadProducts();
}

// Promotion Functions
async function validateAndApplyCoupon() {
  if (!couponCode.value) return;

  validatingCoupon.value = true;
  try {
    const branchId = authStore.currentUser?.branch_id;
    const customerId = saleStore.customer?.id || null;

    const promotion = await promotionStore.validateCoupon(
      couponCode.value,
      branchId,
      customerId,
    );

    if (promotion) {
      await applyPromotion(promotion);
    }
  } catch (error) {
    console.error("Error validating coupon:", error);
  } finally {
    validatingCoupon.value = false;
  }
}

async function applyPromotion(promotion) {
  try {
    const result = await promotionStore.applyPromotion(
      promotion.id,
      saleStore.cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
      })),
    );

    if (result && result.discount_amount) {
      // Apply discount to cart
      saleStore.discount = result.discount_amount;
      appliedPromotion.value = promotion;

      toast.success(`Promoción "${promotion.name}" aplicada`);
    }
  } catch (error) {
    console.error("Error applying promotion:", error);
  }
}

async function applyAutoPromotion(promotion) {
  couponCode.value = promotion.code || "";
  await applyPromotion(promotion);
}

function removePromotion() {
  saleStore.discount = 0;
  appliedPromotion.value = null;
  couponCode.value = "";
  toast.info("Promoción removida");
}

async function loadAvailablePromotions() {
  if (saleStore.cartItems.length === 0) {
    availableAutoPromotions.value = [];
    return;
  }

  try {
    const branchId = authStore.currentUser?.branch_id;
    const customerId = saleStore.customer?.id || null;

    const promotions = await promotionStore.getApplicablePromotions(
      saleStore.cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price,
      })),
      branchId,
      customerId,
    );

    // Filter only auto-apply promotions that don't have applied promotion
    availableAutoPromotions.value = !appliedPromotion.value
      ? (promotions || []).filter((p) => p.auto_apply).slice(0, 3)
      : [];
  } catch (error) {
    console.error("Error loading available promotions:", error);
    availableAutoPromotions.value = [];
  }
}

function getPromotionDescription(promotion) {
  if (!promotion) return "";

  switch (promotion.type) {
    case "percentage":
      return `${promotion.discount_value}% de descuento`;
    case "fixed_amount":
      return `L ${formatMoney(promotion.discount_value)} de descuento`;
    case "bogo":
      return `Compra ${promotion.buy_quantity} lleva ${promotion.get_quantity}`;
    case "volume":
      return `${promotion.buy_quantity}+ unidades = ${promotion.discount_value}% descuento`;
    case "bundle":
      return `${promotion.discount_value}% en bundle`;
    case "free_shipping":
      return "Envío gratis";
    default:
      return promotion.description || "";
  }
}

// Gift Card Functions
async function checkAndApplyGiftCard() {
  if (!giftCardCode.value) return;

  checkingGiftCard.value = true;
  try {
    const cardData = await giftCardStore.checkBalance(
      giftCardCode.value.trim().toUpperCase(),
    );

    if (!cardData.is_active) {
      toast.error("Esta gift card no está activa");
      return;
    }

    if (cardData.current_balance <= 0) {
      toast.error("Esta gift card no tiene balance disponible");
      return;
    }

    appliedGiftCard.value = cardData;

    // Calculate discount (use up to the total or the card balance, whichever is less)
    const cardBalance = parseFloat(cardData.current_balance);
    const maxDiscount = Math.min(cardBalance, cartTotals.value.total);
    giftCardDiscount.value = maxDiscount;
    saleStore.discount = (saleStore.discount || 0) + maxDiscount;

    toast.success(
      `Gift card aplicada - Descuento: L. ${maxDiscount.toFixed(2)}`,
    );
  } catch (error) {
    console.error("Error checking gift card:", error);
  } finally {
    checkingGiftCard.value = false;
  }
}

function removeGiftCard() {
  if (giftCardDiscount.value > 0) {
    saleStore.discount = Math.max(
      0,
      (saleStore.discount || 0) - giftCardDiscount.value,
    );
  }
  appliedGiftCard.value = null;
  giftCardCode.value = "";
  giftCardDiscount.value = 0;
  toast.info("Gift card removida");
}

// Watch cart changes to update available promotions
watch(
  () => saleStore.cartItems.length,
  () => {
    loadAvailablePromotions();
  },
  { immediate: false },
);

watch(
  () => saleStore.customer,
  () => {
    loadAvailablePromotions();
  },
  { deep: true },
);

watch(showCustomerModal, (val) => {
  if (val) {
    nextTick(() => {
      customerNameInputRef.value?.focus();
    });
  }
});

function formatMoney(amount) {
  return parseFloat(amount || 0).toFixed(2);
}

// Quantity controls
function incrementQuantity(index) {
  const item = saleStore.cartItems[index];
  saleStore.updateCartItemQuantity(index, item.quantity + 1);
}

function decrementQuantity(index) {
  const item = saleStore.cartItems[index];
  if (item.quantity > 1) {
    saleStore.updateCartItemQuantity(index, item.quantity - 1);
  }
}

// Loyalty points redemption
function openRedeemPointsModal() {
  if (!loyaltyBadgeRef.value?.summary) {
    toast.error("No se pudo cargar información de puntos");
    return;
  }

  const summary = loyaltyBadgeRef.value.summary;
  availablePoints.value = summary.points;
  pointsValue.value = summary.points_value || 0;
  pointsToRedeem.value = 0;
  redeemValue.value = 0;
  showRedeemModal.value = true;
}

function closeRedeemModal() {
  showRedeemModal.value = false;
  pointsToRedeem.value = 0;
  redeemValue.value = 0;
}

function updateRedeemValue() {
  if (!pointsToRedeem.value || pointsToRedeem.value <= 0) {
    redeemValue.value = 0;
    return;
  }

  // Ensure not exceeding max
  if (pointsToRedeem.value > maxRedeemablePoints.value) {
    pointsToRedeem.value = maxRedeemablePoints.value;
  }

  // Calculate discount value
  const pointValueRatio = pointsValue.value / availablePoints.value;
  redeemValue.value = pointsToRedeem.value * pointValueRatio;
}

function applyRedeemPoints() {
  if (!pointsToRedeem.value || pointsToRedeem.value <= 0) {
    toast.error("Ingresa la cantidad de puntos a canjear");
    return;
  }

  // Store the redeemed points and discount
  redeemedPoints.value = pointsToRedeem.value;
  loyaltyDiscount.value = redeemValue.value;

  // Apply as a general discount to the cart
  saleStore.discount = (saleStore.discount || 0) + redeemValue.value;

  toast.success(
    `${pointsToRedeem.value} puntos canjeados - Descuento: L. ${redeemValue.value.toFixed(2)}`,
  );
  closeRedeemModal();
}

// Image helper functions
function getImageUrl(imagePath) {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const backendUrl = apiUrl.replace("/api", "");
  return `${backendUrl}${imagePath}`;
}

function getThumbUrl(imagePath) {
  if (!imagePath) return "";
  // If it's a full URL, try to derive thumbnail URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    const dotIndex = imagePath.lastIndexOf(".");
    if (dotIndex > -1) {
      return (
        imagePath.slice(0, dotIndex) + "_thumb" + imagePath.slice(dotIndex)
      );
    }
    return imagePath;
  }
  // Relative path: insert _thumb before extension
  const dotIndex = imagePath.lastIndexOf(".");
  if (dotIndex > -1) {
    const thumbPath =
      imagePath.slice(0, dotIndex) + "_thumb" + imagePath.slice(dotIndex);
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    const backendUrl = apiUrl.replace("/api", "");
    return `${backendUrl}${thumbPath}`;
  }
  return getImageUrl(imagePath);
}

function handleImageError(event) {
  const img = event.target;
  const src = img.getAttribute("src") || "";
  // If thumbnail failed, fallback to original image
  if (src.includes("_thumb.")) {
    img.src = src.replace("_thumb.", ".");
    return;
  }
  // Final fallback: SVG placeholder
  img.src =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2"%3E%3Cpath d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/%3E%3C/svg%3E';
  img.classList.add("bg-gray-200", "p-3");
}

// Transaction reference helper functions
function getReferencePlaceholder(method) {
  const placeholders = {
    card: "Ej: AUTH-123456, últimos 4 dígitos",
    transfer: "Ej: TRANSF-789012, número de operación",
    qr: "Ej: QR-345678, ID de transacción",
  };
  return placeholders[method] || "Número de referencia";
}

function getReferenceHelpText(method) {
  const helpTexts = {
    card: "Ingresa el código de autorización o los últimos 4 dígitos de la tarjeta",
    transfer: "Ingresa el número de operación o referencia del banco",
    qr: "Ingresa el ID de transacción o referencia del sistema QR",
  };
  return (
    helpTexts[method] ||
    "Ingresa la referencia de la transacción para fines de auditoría"
  );
}
</script>
