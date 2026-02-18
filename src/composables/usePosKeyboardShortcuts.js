import { ref, onMounted, onUnmounted } from "vue";

/**
 * Composable for POS keyboard shortcuts.
 *
 * @param {Object} options
 * @param {import('vue').Ref<string>} options.searchQuery - product search query
 * @param {import('vue').Ref<string>} options.customerSearchQuery - customer search query
 * @param {import('vue').Ref<string>} options.paymentMethod - current payment method
 * @param {import('vue').Ref<number>} options.amountPaid - amount paid (cash)
 * @param {import('vue').Ref<boolean>} options.assignOrderNumber - order number toggle
 * @param {import('vue').Ref<boolean>} options.showInvoiceTicket - invoice ticket visible
 * @param {import('vue').Ref<boolean>} options.showRedeemModal - redeem modal visible
 * @param {import('vue').Ref<boolean>} options.showCustomerModal - customer modal visible
 * @param {Object} options.saleStore - sale store instance
 * @param {Object} options.cartTotals - computed cart totals
 * @param {Array} options.paymentMethods - payment methods array
 * @param {Array} options.quickAmounts - quick amount values
 * @param {Function} options.completeSale - complete sale function
 * @param {Function} options.clearSale - clear/new sale function
 * @param {Function} options.closeInvoiceTicket - close invoice ticket function
 */
export function usePosKeyboardShortcuts(options) {
  const {
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
  } = options;

  const showShortcutsHelp = ref(false);

  const shortcutsList = [
    {
      category: "Acciones Principales",
      shortcuts: [
        { keys: "F1", description: "Mostrar/ocultar ayuda de atajos" },
        { keys: "F2", description: "Buscar productos (focus)" },
        { keys: "F3", description: "Buscar cliente (focus)" },
        { keys: "F4", description: "Cambiar metodo de pago (ciclo)" },
        { keys: "F6", description: "Enfocar monto recibido (efectivo)" },
        { keys: "F7", description: "Toggle No. de Orden" },
        { keys: "F8", description: "Nueva venta / Limpiar" },
        { keys: "F9", description: "Completar venta" },
        { keys: "F10", description: "Imprimir factura (cuando visible)" },
        {
          keys: "Esc",
          description: "Cerrar modal / blur input / limpiar busqueda",
        },
      ],
    },
    {
      category: "Metodos de Pago",
      shortcuts: [
        { keys: "Alt+E", description: "Efectivo" },
        { keys: "Alt+T", description: "Tarjeta" },
        { keys: "Alt+R", description: "Transferencia" },
        { keys: "Alt+Q", description: "QR" },
        { keys: "Alt+C", description: "Credito" },
      ],
    },
    {
      category: "Carrito",
      shortcuts: [
        { keys: "\u2191", description: "+1 cantidad ultimo item" },
        { keys: "\u2193", description: "-1 cantidad ultimo item" },
        { keys: "Ctrl+Supr", description: "Eliminar ultimo item" },
      ],
    },
    {
      category: "Montos Rapidos (efectivo)",
      shortcuts: [
        { keys: "Alt+1", description: "Monto exacto" },
        { keys: "Alt+2", description: "+10" },
        { keys: "Alt+3", description: "+20" },
        { keys: "Alt+4", description: "+50" },
        { keys: "Alt+5", description: "+100" },
        { keys: "Alt+6", description: "+200" },
        { keys: "Alt+7", description: "+500" },
        { keys: "Alt+8", description: "+1000" },
      ],
    },
  ];

  function isInputFocused() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName.toLowerCase();
    return (
      tag === "input" ||
      tag === "textarea" ||
      tag === "select" ||
      el.isContentEditable
    );
  }

  function focusElement(selector) {
    const el = document.querySelector(selector);
    if (el) {
      el.focus();
      if (el.select) el.select();
    }
  }

  function cyclePaymentMethod(direction = 1) {
    const currentIndex = paymentMethods.findIndex(
      (m) => m.value === paymentMethod.value,
    );
    const nextIndex =
      (currentIndex + direction + paymentMethods.length) %
      paymentMethods.length;
    paymentMethod.value = paymentMethods[nextIndex].value;
  }

  const altKeyMap = {
    e: "cash",
    t: "card",
    r: "transfer",
    q: "qr",
    c: "credit",
  };

  // Quick amounts mapping: Alt+1 = exact, Alt+2..8 = quickAmounts[1..7]
  const quickAmountKeys = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 7: 6, 8: 7 };

  function handleKeyDown(e) {
    const key = e.key;
    const code = e.code;

    // Never intercept F5, F11, F12 (browser functions)
    if (key === "F5" || key === "F11" || key === "F12") return;

    // --- F-keys and Alt+ always active (even with input focused) ---

    // F1 - Toggle help
    if (key === "F1") {
      e.preventDefault();
      showShortcutsHelp.value = !showShortcutsHelp.value;
      return;
    }

    // F2 - Focus product search
    if (key === "F2") {
      e.preventDefault();
      focusElement('[data-shortcut="search-products"]');
      return;
    }

    // F3 - Focus customer search
    if (key === "F3") {
      e.preventDefault();
      focusElement('[data-shortcut="search-customer"]');
      return;
    }

    // F4 - Cycle payment method
    if (key === "F4") {
      e.preventDefault();
      cyclePaymentMethod();
      return;
    }

    // F6 - Focus amount paid (only if cash)
    if (key === "F6") {
      e.preventDefault();
      if (paymentMethod.value === "cash") {
        focusElement('[data-shortcut="amount-paid"]');
      }
      return;
    }

    // F7 - Toggle order number
    if (key === "F7") {
      e.preventDefault();
      assignOrderNumber.value = !assignOrderNumber.value;
      return;
    }

    // F8 - New sale / clear
    if (key === "F8") {
      e.preventDefault();
      clearSale();
      return;
    }

    // F9 - Complete sale
    if (key === "F9") {
      e.preventDefault();
      completeSale();
      return;
    }

    // F10 - Print invoice (when visible)
    if (key === "F10") {
      e.preventDefault();
      if (showInvoiceTicket.value) {
        const printBtn = document.querySelector(
          '[data-shortcut="print-invoice"]',
        );
        if (printBtn) printBtn.click();
      }
      return;
    }

    // Escape - priority chain: help > invoice > redeem modal > customer modal > blur > clear search
    if (key === "Escape") {
      e.preventDefault();
      if (showShortcutsHelp.value) {
        showShortcutsHelp.value = false;
        return;
      }
      if (showInvoiceTicket.value) {
        closeInvoiceTicket();
        return;
      }
      if (showRedeemModal.value) {
        showRedeemModal.value = false;
        return;
      }
      if (showCustomerModal.value) {
        showCustomerModal.value = false;
        return;
      }
      if (isInputFocused()) {
        document.activeElement.blur();
        return;
      }
      if (searchQuery.value) {
        searchQuery.value = "";
        return;
      }
      return;
    }

    // Alt + letter - Payment methods
    if (e.altKey && !e.ctrlKey && !e.metaKey) {
      const lower = key.toLowerCase();

      // Alt + E/T/R/Q/C - payment methods
      if (altKeyMap[lower]) {
        e.preventDefault();
        paymentMethod.value = altKeyMap[lower];
        return;
      }

      // Alt + 1..8 - Quick amounts (only when cash)
      if (
        paymentMethod.value === "cash" &&
        quickAmountKeys[key] !== undefined
      ) {
        e.preventDefault();
        const idx = quickAmountKeys[key];
        if (idx === 0) {
          // Alt+1 = exact amount
          amountPaid.value = cartTotals.value.total;
        } else if (quickAmounts[idx] !== undefined) {
          amountPaid.value = cartTotals.value.total + quickAmounts[idx];
        }
        return;
      }
    }

    // --- Below: only when no input is focused ---
    if (isInputFocused()) return;

    // Arrow Up - +1 quantity on last cart item
    if (key === "ArrowUp") {
      e.preventDefault();
      const len = saleStore.cartItems.length;
      if (len > 0) {
        const lastIndex = len - 1;
        const item = saleStore.cartItems[lastIndex];
        saleStore.updateCartItemQuantity(lastIndex, item.quantity + 1);
      }
      return;
    }

    // Arrow Down - -1 quantity on last cart item
    if (key === "ArrowDown") {
      e.preventDefault();
      const len = saleStore.cartItems.length;
      if (len > 0) {
        const lastIndex = len - 1;
        const item = saleStore.cartItems[lastIndex];
        if (item.quantity > 1) {
          saleStore.updateCartItemQuantity(lastIndex, item.quantity - 1);
        }
      }
      return;
    }

    // Ctrl+Delete - Remove last cart item
    if (e.ctrlKey && key === "Delete") {
      e.preventDefault();
      const len = saleStore.cartItems.length;
      if (len > 0) {
        saleStore.removeFromCart(len - 1);
      }
      return;
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  return {
    showShortcutsHelp,
    shortcutsList,
  };
}
