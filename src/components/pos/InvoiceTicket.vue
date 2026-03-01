<template>
  <div class="invoice-ticket-container">
    <!-- Modal Overlay -->
    <Teleport to="body">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div
            class="fixed inset-0 bg-black bg-opacity-50"
            @click="$emit('close')"
          ></div>

          <div
            :class="['relative bg-white rounded-lg shadow-xl w-full p-6 z-10', printSize === 'letter' ? 'max-w-3xl' : 'max-w-md']"
          >
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">Factura Generada</h3>
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-500"
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

            <!-- Ticket Preview -->
            <div id="ticket-content" :class="ticketClass" class="bg-white">
              <!-- 1. ENCABEZADO -->
              <div
                class="text-center border-b border-dashed border-gray-400 pb-2 mb-2"
              >
                <img
                  v-if="company.logo_url"
                  :src="company.logo_url"
                  alt="Logo"
                  style="
                    max-width: 120px;
                    max-height: 60px;
                    margin: 0 auto 6px auto;
                    display: block;
                  "
                />
                <div class="font-bold text-sm">
                  {{ company.legal_name || company.name }}
                </div>
                <div class="text-xs">{{ branchAddress || company.address }}</div>
                <div class="text-xs">Tel: {{ branchPhone || company.phone }}</div>
                <div class="text-xs">Email: {{ company.email }}</div>
                <div class="text-xs font-semibold mt-1">
                  RTN: {{ company.rtn }}
                </div>
                <div class="text-xs" v-if="cai">CAI: {{ cai.cai_number }}</div>
                <div class="text-xs" v-if="sale.branch">
                  Sucursal: {{ sale.branch.name }}
                </div>
              </div>

              <!-- 2. DATOS DEL DOCUMENTO -->
              <div
                class="text-center border-b border-dashed border-gray-400 pb-2 mb-2"
              >
                <div class="font-bold text-sm">FACTURA</div>
                <div class="text-xs">
                  No. {{ sale.sale_number || invoiceNumber }}
                </div>
                <div class="text-xs">
                  {{ formatDateTime(sale.sold_at || new Date()) }}
                </div>
                <div class="text-xs" v-if="sale.cash_opening">
                  Caja: {{ sale.cash_opening.cash_register?.name }}
                </div>
                <div class="text-xs" v-if="sale.user">
                  Vendedor: {{ sale.user.name }}
                </div>
              </div>

              <!-- NÚMERO DE ORDEN -->
              <div
                v-if="sale.order_number"
                class="text-center border-b border-dashed border-gray-400 pb-2 mb-2"
              >
                <div class="text-xs text-gray-600">ORDEN No.</div>
                <div
                  class="font-bold"
                  style="font-size: 28px; line-height: 1.2"
                >
                  {{ sale.order_number }}
                </div>
              </div>

              <!-- 3. DATOS DEL CLIENTE -->
              <div class="border-b border-dashed border-gray-400 pb-2 mb-2">
                <div class="text-xs">
                  <span class="font-semibold">Cliente:</span>
                  {{ sale.customer_name || "Consumidor Final" }}
                </div>
                <div class="text-xs" v-if="sale.customer_rtn">
                  <span class="font-semibold">RTN:</span>
                  {{ sale.customer_rtn }}
                </div>
              </div>

              <!-- 4. DETALLE DE PRODUCTOS -->
              <table class="w-full text-xs mb-2">
                <thead class="border-b border-gray-400">
                  <tr>
                    <th class="text-left py-1">Descripción</th>
                    <th class="text-center py-1 w-12">Cant</th>
                    <th class="text-right py-1 w-16">Precio</th>
                    <th class="text-right py-1 w-16">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in sale.details"
                    :key="item.id"
                    class="border-b border-gray-200"
                  >
                    <td class="py-1">
                      <div>{{ item.product?.name || item.product_name }}</div>
                      <div class="text-gray-600" v-if="item.product?.sku">
                        Código: {{ item.product.sku }}
                      </div>
                      <div class="text-gray-600">
                        {{ getTaxLabel(item.tax_rate) }}
                      </div>
                    </td>
                    <td class="text-center py-1">{{ item.quantity }}</td>
                    <td class="text-right py-1">
                      L {{ formatMoney(item.price) }}
                    </td>
                    <td class="text-right py-1">
                      L {{ formatMoney(item.subtotal) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- 5. RESUMEN DE IMPUESTOS -->
              <div class="border-t border-b border-gray-400 py-2 mb-2 text-xs">
                <div class="flex justify-between mb-1">
                  <span>Importe Exento:</span>
                  <span>L {{ formatMoney(taxSummary.exempt) }}</span>
                </div>
                <div class="flex justify-between mb-1">
                  <span>Importe Gravado 15%:</span>
                  <span>L {{ formatMoney(taxSummary.taxable15) }}</span>
                </div>
                <div class="flex justify-between mb-1">
                  <span>Subtotal:</span>
                  <span>L {{ formatMoney(sale.subtotal) }}</span>
                </div>
                <div class="flex justify-between mb-1">
                  <span>ISV 15%:</span>
                  <span>L {{ formatMoney(sale.tax) }}</span>
                </div>
                <div class="flex justify-between mb-1" v-if="sale.discount > 0">
                  <span>Descuento:</span>
                  <span>- L {{ formatMoney(sale.discount) }}</span>
                </div>
              </div>

              <!-- 6. TOTALES DE PAGO -->
              <div class="border-b border-dashed border-gray-400 pb-2 mb-2">
                <div class="flex justify-between font-bold text-sm mb-2">
                  <span>TOTAL A PAGAR:</span>
                  <span>L {{ formatMoney(sale.total) }}</span>
                </div>
                <div class="text-xs">
                  <div class="flex justify-between mb-1">
                    <span>Forma de Pago:</span>
                    <span style="text-transform: uppercase">{{
                      getPaymentMethodLabel(sale.payment_method)
                    }}</span>
                  </div>
                  <div
                    class="flex justify-between mb-1"
                    v-if="sale.transaction_reference"
                  >
                    <span>Ref. Transacción:</span>
                    <span class="font-mono text-xs">{{
                      sale.transaction_reference
                    }}</span>
                  </div>
                  <div class="flex justify-between mb-1">
                    <span>Monto Pagado:</span>
                    <span>L {{ formatMoney(sale.amount_paid) }}</span>
                  </div>
                  <div
                    class="flex justify-between mb-1"
                    v-if="sale.amount_change > 0"
                  >
                    <span>Cambio:</span>
                    <span>L {{ formatMoney(sale.amount_change) }}</span>
                  </div>
                </div>
              </div>

              <!-- LOYALTY POINTS -->
              <div
                v-if="sale.loyalty && sale.loyalty.points_earned > 0"
                class="border-b border-dashed border-gray-400 pb-2 mb-2 bg-blue-50 p-2 rounded"
              >
                <div class="text-xs text-center">
                  <div class="font-bold text-blue-700 mb-1">
                    PUNTOS DE LEALTAD
                  </div>
                  <div class="flex justify-between mb-1">
                    <span>Puntos Ganados:</span>
                    <span class="font-semibold text-green-600"
                      >+{{ sale.loyalty.points_earned }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span>Total de Puntos:</span>
                    <span class="font-semibold text-blue-700">{{
                      sale.loyalty.new_balance
                    }}</span>
                  </div>
                </div>
              </div>

              <!-- 7. INFORMACIÓN LEGAL -->
              <div class="text-xs text-center mb-2">
                <div class="font-semibold mb-1">{{ totalInWords }}</div>
                <div class="text-gray-600 mb-1">
                  G = Gravado (15%) | E = Exento
                </div>
                <div v-if="cai" class="text-gray-600">
                  <div>
                    Rango Autorizado: {{ cai.range_from }} - {{ cai.range_to }}
                  </div>
                  <div>Fecha Límite: {{ formatDate(cai.expiry_date) }}</div>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="text-center text-xs text-gray-600 border-t border-dashed border-gray-400 pt-2"
              >
                <div>¡Gracias por su compra!</div>
                <div class="mt-1">{{ company.name }}</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-col space-y-2 mt-6">
              <div class="flex space-x-3">
                <button
                  @click="printTicket"
                  data-shortcut="print-invoice"
                  class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center"
                >
                  <svg
                    class="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  {{ usbPrinterConnected ? 'Imprimir' : 'Imprimir (navegador)' }}
                </button>
                <button
                  @click="$emit('close')"
                  class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cerrar
                </button>
              </div>
              <!-- USB Printer connection -->
              <button
                v-if="usbSupported && !usbPrinterConnected"
                @click="connectUsb"
                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center text-sm"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Conectar Impresora USB (impresión directa)
              </button>
              <div v-if="usbPrinterConnected" class="flex items-center justify-between text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">
                <span>Impresora USB conectada (impresión directa)</span>
                <button @click="disconnectUsb" class="text-red-500 hover:text-red-700 underline">Desconectar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { getCashDrawerKickCommand } from "@/utils/cashDrawer";
import { printThermal } from "@/utils/printThermal";
import * as usbPrinter from "@/utils/usbPrinter";
import { toast } from "vue3-toastify";

const usbSupported = ref(false);
const usbPrinterConnected = ref(false);

onMounted(async () => {
  usbSupported.value = usbPrinter.isSupported();
  if (usbSupported.value) {
    try {
      await usbPrinter.autoReconnect();
      usbPrinterConnected.value = usbPrinter.isConnected();
    } catch (e) {
      // Silently fail
    }
  }
});

const connectUsb = async () => {
  try {
    await usbPrinter.connectPrinter();
    usbPrinterConnected.value = true;
    toast.success("Impresora USB conectada");
  } catch (e) {
    toast.error(e.message || "Error al conectar impresora USB");
  }
};

const disconnectUsb = async () => {
  try {
    await usbPrinter.disconnectPrinter();
    usbPrinterConnected.value = false;
    toast.info("Impresora USB desconectada");
  } catch (e) {
    // ignore
  }
};

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  sale: {
    type: Object,
    required: true,
  },
  company: {
    type: Object,
    required: true,
  },
  cai: {
    type: Object,
    default: null,
  },
  invoiceNumber: {
    type: String,
    default: "",
  },
  printSize: {
    type: String,
    default: "80mm",
    validator: (v) => ["58mm", "80mm", "letter"].includes(v),
  },
});

const ticketClass = computed(() => {
  const classes = {
    '58mm': 'ticket-58mm',
    '80mm': 'ticket-80mm',
    'letter': 'ticket-letter',
  };
  return classes[props.printSize] || 'ticket-80mm';
});

const emit = defineEmits(["close"]);

// Branch-specific data for the invoice header
const branchAddress = computed(() => props.sale.branch?.address || props.company.branch_address || null);
const branchPhone = computed(() => props.sale.branch?.phone || props.company.branch_phone || null);

// Helper to normalize tax_rate to integer for comparison
const normalizeTaxRate = (rate) => Math.round(parseFloat(rate) || 0);

// Computed: Tax Summary
const taxSummary = computed(() => {
  const summary = {
    exempt: 0,
    taxable15: 0,
    taxable18: 0,
  };

  if (props.sale.details) {
    props.sale.details.forEach((item) => {
      const itemTotal = parseFloat(item.subtotal) || item.quantity * item.price;
      const rate = normalizeTaxRate(item.tax_rate);

      if (rate === 0) {
        summary.exempt += itemTotal;
      } else if (rate === 15) {
        summary.taxable15 += itemTotal;
      } else if (rate === 18) {
        summary.taxable18 += itemTotal;
      }
    });
  }

  return summary;
});

// Computed: Total in Words
const totalInWords = computed(() => {
  const total = parseFloat(props.sale.total) || 0;
  const integerPart = Math.floor(total);
  const decimalPart = Math.round((total - integerPart) * 100);

  return `SON: ${numberToWords(integerPart)} LEMPIRAS CON ${decimalPart}/100`;
});

// Helpers
const formatMoney = (value) => {
  return parseFloat(value || 0).toFixed(2);
};

const parseDateSafe = (date) => {
  if (!date) return null;
  if (date instanceof Date) return date;
  // Si ya viene en formato dd/mm/yyyy HH:mm:ss, convertir a formato parseable
  const match = String(date).match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(.+)$/);
  if (match) return new Date(`${match[3]}-${match[2]}-${match[1]}T${match[4]}`);
  const d = new Date(date);
  return isNaN(d.getTime()) ? null : d;
};

const formatDateTime = (date) => {
  if (!date) return "";
  const d = parseDateSafe(date);
  if (!d) return String(date);
  return d.toLocaleString("es-HN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatDate = (date) => {
  if (!date) return "";
  const d = parseDateSafe(date);
  if (!d) return String(date);
  return d.toLocaleDateString("es-HN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getTaxLabel = (taxRate) => {
  const rate = normalizeTaxRate(taxRate);
  if (rate === 0) return "E - Exento";
  if (rate === 15) return "G - Gravado 15%";
  if (rate === 18) return "G - Gravado 18%";
  return "";
};

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    qr: "Código QR",
    credit: "Crédito",
    check: "Cheque",
    other: "Otro",
  };
  return labels[method] || method;
};

const numberToWords = (num) => {
  const units = [
    "",
    "UN",
    "DOS",
    "TRES",
    "CUATRO",
    "CINCO",
    "SEIS",
    "SIETE",
    "OCHO",
    "NUEVE",
  ];
  const tens = [
    "",
    "DIEZ",
    "VEINTE",
    "TREINTA",
    "CUARENTA",
    "CINCUENTA",
    "SESENTA",
    "SETENTA",
    "OCHENTA",
    "NOVENTA",
  ];
  const hundreds = [
    "",
    "CIENTO",
    "DOSCIENTOS",
    "TRESCIENTOS",
    "CUATROCIENTOS",
    "QUINIENTOS",
    "SEISCIENTOS",
    "SETECIENTOS",
    "OCHOCIENTOS",
    "NOVECIENTOS",
  ];

  if (num === 0) return "CERO";
  if (num === 100) return "CIEN";

  let result = "";

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    if (thousands === 1) {
      result += "MIL ";
    } else {
      result += units[thousands] + " MIL ";
    }
    num %= 1000;
  }

  if (num >= 100) {
    result += hundreds[Math.floor(num / 100)] + " ";
    num %= 100;
  }

  if (num >= 10) {
    result += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }

  if (num > 0) {
    result += units[num];
  }

  return result.trim();
};

// Generate self-contained print HTML from data (not innerHTML copy)
const printTicket = async () => {
  const s = props.sale;
  const c = props.company;
  const caiInfo = props.cai;
  const fm = (v) => parseFloat(v || 0).toFixed(2);

  // Build items HTML
  const itemsHtml = (s.details || [])
    .map((item) => {
      const rate = normalizeTaxRate(item.tax_rate);
      let taxLabel = "";
      if (rate === 0) taxLabel = "E - Exento";
      else if (rate === 15) taxLabel = "G - Gravado 15%";
      else if (rate === 18) taxLabel = "G - Gravado 18%";
      const productName = item.product?.name || item.product_name || "";
      const sku = item.product?.sku || "";

      return `<tr style="border-bottom:1px solid #000;">
      <td style="padding:2px 0;">
        <div>${productName}</div>
        ${sku ? `<div style="font-size:10px;">Código: ${sku}</div>` : ""}
        ${taxLabel ? `<div style="font-size:10px;">${taxLabel}</div>` : ""}
      </td>
      <td style="text-align:center;padding:2px 0;">${item.quantity}</td>
      <td style="text-align:right;padding:2px 0;">L${fm(item.price)}</td>
      <td style="text-align:right;padding:2px 0;">L${fm(item.subtotal)}</td>
    </tr>`;
    })
    .join("");

  // Tax summary from computed
  const ts = taxSummary.value;

  // Loyalty section
  let loyaltyHtml = "";
  if (s.loyalty && s.loyalty.points_earned > 0) {
    loyaltyHtml = `
    <div style="border-bottom:1px dashed #999;padding-bottom:8px;margin-bottom:8px;background:#eff6ff;padding:8px;border-radius:4px;">
      <div style="font-size:9px;text-align:center;">
        <div style="font-weight:bold;color:#1d4ed8;margin-bottom:4px;">PUNTOS DE LEALTAD</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Puntos Ganados:</span><span style="font-weight:600;color:#16a34a;">+${s.loyalty.points_earned}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Total de Puntos:</span><span style="font-weight:600;color:#1d4ed8;">${s.loyalty.new_balance}</span></div>
      </div>
    </div>`;
  }

  // Use branch data when available for address/phone
  const printAddress = s.branch?.address || c.address || "";
  const printPhone = s.branch?.phone || c.phone || "";

  // Build receipt HTML
  const receiptHtml = `<div class="c sep">
${c.logo_url ? `<img src="${c.logo_url}" style="max-width:50%;max-height:60px;margin:0 auto 4px;display:block;">` : ""}
<div class="big">${c.legal_name || c.name}</div>
<div>${printAddress}</div>
<div>Tel: ${printPhone}</div>
<div>Email: ${c.email || ""}</div>
<div class="b9">RTN: ${c.rtn || ""}</div>
${caiInfo ? `<div>CAI: ${caiInfo.cai_number}</div>` : ""}
${s.branch ? `<div>Sucursal: ${s.branch.name}</div>` : ""}
</div>
<div class="c sep">
<div class="big">FACTURA</div>
<div>No. ${s.sale_number || props.invoiceNumber}</div>
<div>${formatDateTime(s.sold_at || new Date())}</div>
${s.cash_opening ? `<div>Caja: ${s.cash_opening.cash_register?.name || ""}</div>` : ""}
${s.user ? `<div>Vendedor: ${s.user.name}</div>` : ""}
</div>
${s.order_number ? `<div class="c sep"><div>ORDEN No.</div><div style="font-size:26px;font-weight:900;line-height:1.2;">${s.order_number}</div></div>` : ""}
<div class="sep">
<div><span class="b9">Cliente:</span> ${s.customer_name || "Consumidor Final"}</div>
${s.customer_rtn ? `<div><span class="b9">RTN:</span> ${s.customer_rtn}</div>` : ""}
</div>
<table style="margin-bottom:4px;">
<thead><tr style="border-bottom:1px solid #000;">
<th style="text-align:left;">Desc</th>
<th style="text-align:center;width:13%;">Cant</th>
<th style="text-align:right;width:20%;">Precio</th>
<th style="text-align:right;width:20%;">Total</th>
</tr></thead>
<tbody>${itemsHtml}</tbody>
</table>
<div class="seps">
<div class="r"><span>Exento:</span><span>L${fm(ts.exempt)}</span></div>
<div class="r"><span>Gravado 15%:</span><span>L${fm(ts.taxable15)}</span></div>
<div class="r"><span>Subtotal:</span><span>L${fm(s.subtotal)}</span></div>
<div class="r"><span>ISV 15%:</span><span>L${fm(s.tax)}</span></div>
${parseFloat(s.discount) > 0 ? `<div class="r"><span>Descuento:</span><span>-L${fm(s.discount)}</span></div>` : ""}
</div>
<div class="sep">
<div class="r big"><span>TOTAL:</span><span>L${fm(s.total)}</span></div>
<div class="r"><span>Pago:</span><span style="text-transform:uppercase;">${getPaymentMethodLabel(s.payment_method)}</span></div>
${s.transaction_reference ? `<div class="r"><span>Ref:</span><span>${s.transaction_reference}</span></div>` : ""}
<div class="r"><span>Pagado:</span><span>L${fm(s.amount_paid)}</span></div>
${parseFloat(s.amount_change) > 0 ? `<div class="r"><span>Cambio:</span><span>L${fm(s.amount_change)}</span></div>` : ""}
</div>
${loyaltyHtml}
<div class="c" style="margin-bottom:4px;">
<div class="b9">${totalInWords.value}</div>
<div>G=Gravado(15%) | E=Exento</div>
${caiInfo ? `<div>Rango: ${caiInfo.range_from} - ${caiInfo.range_to}</div><div>Límite: ${formatDate(caiInfo.expiry_date)}</div>` : ""}
</div>
<div class="c" style="border-top:1px dashed #000;padding-top:4px;">
<div class="b9">Gracias por su compra!</div>
<div>${c.name}</div>
</div>`;

  // Si hay impresora USB conectada, imprimir directo sin diálogo
  if (usbPrinterConnected.value && usbPrinter.isConnected()) {
    try {
      await usbPrinter.printReceipt({
        company: c,
        sale: {
          sale_number: s.sale_number || props.invoiceNumber,
          invoice_number: s.invoice_number || props.invoiceNumber,
          date: s.sold_at || new Date(),
          customer_name: s.customer_name || 'Consumidor Final',
          customer_rtn: s.customer_rtn,
          details: (s.details || []).map(item => ({
            product_name: item.product?.name || item.product_name || '',
            product_sku: item.product?.sku || item.product_sku || '',
            quantity: item.quantity,
            price: item.price || item.unit_price,
            tax_rate: item.tax_rate,
            subtotal: item.subtotal,
          })),
          subtotal: s.subtotal,
          discount: s.discount,
          tax: s.tax,
          total: s.total,
          payment_method: s.payment_method,
          amount_paid: s.amount_paid,
          amount_change: s.amount_change,
          notes: s.notes,
          order_number: s.order_number,
          user_name: s.user?.name,
          branch_name: s.branch?.name,
          cash_register_name: s.cash_opening?.cash_register?.name,
        },
        cai: caiInfo ? {
          cai: caiInfo.cai_number,
          range_from: caiInfo.range_from,
          range_to: caiInfo.range_to,
          due_date: caiInfo.expiry_date,
        } : null,
        printSize: props.printSize === 'letter' ? '80mm' : props.printSize,
      }, { openDrawer: true });
      toast.success("Impreso correctamente");
      return;
    } catch (e) {
      console.error('USB print failed, falling back to browser:', e);
      toast.warning("Error USB, usando impresión del navegador");
    }
  }

  // Fallback: impresión por navegador
  printThermal(receiptHtml, { size: props.printSize });
};
</script>

<style scoped>
.ticket-58mm {
  width: 58mm;
  font-family: "Courier New", monospace;
  font-size: 9px;
  line-height: 1.2;
  color: #000;
  padding: 2mm;
  background: white;
  margin: 0 auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
  overflow-y: auto;
}

.ticket-80mm {
  width: 80mm;
  font-family: "Courier New", monospace;
  font-size: 10px;
  line-height: 1.4;
  color: #000;
  padding: 5mm;
  background: white;
  margin: 0 auto;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  max-height: 70vh;
  overflow-y: auto;
}

.ticket-letter {
  width: 100%;
  max-width: 650px;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 13px;
  line-height: 1.6;
  color: #000;
  padding: 32px 40px;
  background: white;
  margin: 0 auto;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  max-height: 70vh;
  overflow-y: auto;
}

.ticket-letter :deep(.text-xs) {
  font-size: 13px;
}

.ticket-letter :deep(.text-sm) {
  font-size: 15px;
}

.ticket-letter :deep(.font-bold.text-sm) {
  font-size: 16px;
}

.ticket-letter :deep(.border-dashed) {
  border-style: solid;
}

.ticket-letter :deep(.border-b),
.ticket-letter :deep(.border-t) {
  border-color: #d1d5db;
}

.ticket-letter :deep(.border-b.border-dashed.border-gray-400) {
  border-style: solid;
  border-color: #d1d5db;
}

.ticket-letter :deep(.pb-2) {
  padding-bottom: 14px;
}

.ticket-letter :deep(.mb-2) {
  margin-bottom: 14px;
}

.ticket-letter :deep(.py-2) {
  padding-top: 12px;
  padding-bottom: 12px;
}

.ticket-letter :deep(.mb-1) {
  margin-bottom: 6px;
}

.ticket-letter :deep(.py-1) {
  padding-top: 8px;
  padding-bottom: 8px;
}

.ticket-letter :deep(.pt-2) {
  padding-top: 14px;
}

.ticket-letter :deep(table) {
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.ticket-letter :deep(table th) {
  background-color: #f3f4f6;
  font-size: 13px;
  font-weight: 600;
  padding: 10px 8px;
  border-bottom: 2px solid #d1d5db;
}

.ticket-letter :deep(table td) {
  padding: 10px 8px;
  font-size: 13px;
}

.ticket-letter :deep(table .border-b) {
  border-color: #e5e7eb;
}

.ticket-letter :deep(img) {
  max-width: 180px !important;
  max-height: 80px !important;
}

@media print {
  .ticket-58mm,
  .ticket-80mm,
  .ticket-letter {
    box-shadow: none;
    max-height: none;
    overflow: visible;
  }
}
</style>
