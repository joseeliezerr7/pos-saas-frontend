<template>
  <div class="p-6">
    <!-- Header with actions -->
    <div class="mb-6 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button
          @click="router.back()"
          class="text-gray-600 hover:text-gray-900"
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            Venta #{{ sale?.sale_number }}
          </h1>
          <p class="text-gray-600 mt-1">{{ formatDate(sale?.sold_at) }}</p>
        </div>
      </div>

      <div class="flex gap-3 items-center">
        <!-- USB Printer Connection -->
        <button
          v-if="usbSupported && !usbPrinterConnected"
          @click="connectUsb"
          class="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-1 text-sm"
          title="Conectar impresora USB para impresión directa"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          USB
        </button>
        <div v-if="usbPrinterConnected" class="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-1.5 rounded-lg">
          <span class="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
          <span>USB</span>
          <button @click="disconnectUsb" class="text-red-500 hover:text-red-700 ml-1" title="Desconectar">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <button
          @click="printReceipt"
          class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg flex items-center gap-2"
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
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
            />
          </svg>
          {{ usbPrinterConnected ? 'Reimprimir' : 'Reimprimir (navegador)' }}
        </button>
        <button
          v-if="!sale?.has_invoice"
          @click="generateInvoice"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generar Factura
        </button>
        <button
          v-else
          @click="router.push(`/invoices/${sale.invoice?.id}`)"
          class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"
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
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Ver Factura
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"
      ></div>
      <p class="text-gray-600 mt-2">Cargando venta...</p>
    </div>

    <!-- Sale Content -->
    <div v-else-if="sale" class="space-y-6">
      <!-- Status Badge -->
      <div
        v-if="sale.status === 'voided'"
        class="bg-red-50 border-l-4 border-red-400 p-4"
      >
        <div class="flex items-center">
          <svg
            class="w-6 h-6 text-red-400 mr-3"
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
            <h3 class="text-lg font-semibold text-red-800">Venta Anulada</h3>
            <p class="text-sm text-red-700">{{ sale.void_reason }}</p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Sale Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Información de Venta
          </h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Número de Venta</dt>
              <dd class="text-base text-gray-900">{{ sale.sale_number }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Fecha</dt>
              <dd class="text-base text-gray-900">
                {{ formatDate(sale.sold_at) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Método de Pago</dt>
              <dd class="text-base text-gray-900">
                {{ getPaymentMethodLabel(sale.payment_method) }}
              </dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Estado</dt>
              <dd>
                <span
                  :class="getStatusClass(sale.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ getStatusLabel(sale.status) }}
                </span>
              </dd>
            </div>
            <div v-if="sale.has_invoice">
              <dt class="text-sm font-medium text-gray-500">Factura</dt>
              <dd class="text-base text-green-600 font-medium">Facturada</dd>
            </div>
          </dl>
        </div>

        <!-- Customer Information -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4">
            Información del Cliente
          </h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Nombre</dt>
              <dd class="text-base text-gray-900">
                {{ sale.customer_name || "Cliente General" }}
              </dd>
            </div>
            <div v-if="sale.customer_rtn">
              <dt class="text-sm font-medium text-gray-500">RTN</dt>
              <dd class="text-base text-gray-900">{{ sale.customer_rtn }}</dd>
            </div>
            <div v-if="sale.customer?.email">
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="text-base text-gray-900">{{ sale.customer.email }}</dd>
            </div>
            <div v-if="sale.customer?.phone">
              <dt class="text-sm font-medium text-gray-500">Teléfono</dt>
              <dd class="text-base text-gray-900">{{ sale.customer.phone }}</dd>
            </div>
            <div v-if="sale.customer?.address">
              <dt class="text-sm font-medium text-gray-500">Dirección</dt>
              <dd class="text-base text-gray-900">
                {{ sale.customer.address }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- Sale Items -->
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Detalle de Productos</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Producto
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cantidad
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Precio
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Descuento
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Impuesto
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="item in sale.details" :key="item.id">
                <td class="px-6 py-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ item.product_name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    {{ item.product?.code }}
                  </div>
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  {{ item.quantity }}
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  L {{ formatMoney(item.unit_price) }}
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  L {{ formatMoney(item.discount) }}
                </td>
                <td class="px-6 py-4 text-right text-sm text-gray-900">
                  L {{ formatMoney(item.tax_amount) }}
                  <div class="text-xs text-gray-500">{{ item.tax_rate }}%</div>
                </td>
                <td
                  class="px-6 py-4 text-right text-sm font-semibold text-gray-900"
                >
                  L {{ formatMoney(item.total) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Totals -->
      <div class="bg-white rounded-lg shadow-sm p-6">
        <div class="max-w-md ml-auto space-y-3">
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Subtotal:</span>
            <span class="font-medium text-gray-900"
              >L {{ formatMoney(sale.subtotal) }}</span
            >
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Descuento:</span>
            <span class="font-medium text-gray-900"
              >L {{ formatMoney(sale.discount) }}</span
            >
          </div>
          <div class="flex justify-between text-base">
            <span class="text-gray-600">Impuesto:</span>
            <span class="font-medium text-gray-900"
              >L {{ formatMoney(sale.tax) }}</span
            >
          </div>
          <div
            class="border-t border-gray-200 pt-3 flex justify-between text-xl font-bold"
          >
            <span class="text-gray-900">Total:</span>
            <span class="text-gray-900">L {{ formatMoney(sale.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSaleStore } from "@/stores/sale";
import { useInvoiceStore } from "@/stores/invoice";
import saleService from "@/services/saleService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "vue3-toastify";
import { printThermal } from "@/utils/printThermal";
import * as usbPrinter from "@/utils/usbPrinter";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const saleStore = useSaleStore();
const invoiceStore = useInvoiceStore();
const authStore = useAuthStore();
const branchPrintSize = computed(() => authStore.currentUser?.branch?.settings?.print_size || '80mm');

const sale = computed(() => saleStore.currentSale);
const loading = computed(() => saleStore.loading);

const usbSupported = ref(false);
const usbPrinterConnected = ref(false);

onMounted(async () => {
  loadSale();
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

async function connectUsb() {
  try {
    await usbPrinter.connectPrinter();
    usbPrinterConnected.value = true;
    toast.success("Impresora USB conectada");
  } catch (e) {
    toast.error(e.message || "Error al conectar impresora USB");
  }
}

async function disconnectUsb() {
  try {
    await usbPrinter.disconnectPrinter();
    usbPrinterConnected.value = false;
    toast.info("Impresora USB desconectada");
  } catch (e) {
    // ignore
  }
}

async function loadSale() {
  const id = route.params.id;
  await saleStore.fetchSaleById(id);
  console.log("Sale loaded:", sale.value);
  console.log("Sale details:", sale.value?.details);
}

async function printReceipt() {
  try {
    const response = await saleService.getReceipt(sale.value.id);
    if (response.data.success) {
      const data = response.data.data;

      // Si hay impresora USB conectada, imprimir directo
      if (usbPrinterConnected.value && usbPrinter.isConnected()) {
        try {
          const company = data.company || {};
          const s = data.sale || {};
          const items = data.items || [];
          const invoice = data.invoice || null;
          const seller = data.seller || {};
          const cashRegister = data.cash_register || null;

          const pSize = branchPrintSize.value === 'letter' ? '80mm' : branchPrintSize.value;

          const branch = data.branch || {};
          await usbPrinter.printReceipt({
            company: {
              name: company.legal_name || company.name || '',
              rtn: company.rtn || '',
              address: branch.address || company.address || '',
              phone: branch.phone || company.phone || '',
            },
            sale: {
              sale_number: s.sale_number || '',
              invoice_number: invoice ? invoice.invoice_number : '',
              date: s.sold_at || '',
              customer_name: s.customer_name || 'Consumidor Final',
              customer_rtn: s.customer_rtn || '',
              details: items.map(item => ({
                product_name: item.product_name || '',
                product_sku: item.product_sku || '',
                quantity: item.quantity,
                price: item.price,
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
            },
            cai: invoice && invoice.cai_number ? {
              cai: invoice.cai_number,
              range_from: invoice.range_authorized ? invoice.range_authorized.split(' - ')[0] : '',
              range_to: invoice.range_authorized ? invoice.range_authorized.split(' - ')[1] : '',
              due_date: invoice.cai_expiration_date || '',
            } : null,
            printSize: pSize,
          }, { openDrawer: false });
          toast.success("Reimpreso correctamente");
          return;
        } catch (e) {
          console.error('USB print failed, falling back to browser:', e);
          toast.warning("Error USB, usando impresión del navegador");
        }
      }

      printThermal(buildReceiptHtml(data), { size: branchPrintSize.value });
    }
  } catch (error) {
    console.error("Error printing receipt:", error);
    toast.error("Error al obtener los datos del recibo");
  }
}

function numberToWords(num) {
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
}

function buildReceiptHtml(data) {
  const company = data.company || {};
  const sale = data.sale || {};
  const branch = data.branch || {};
  const items = data.items || [];
  const invoice = data.invoice || null;
  const seller = data.seller || {};
  const cashRegister = data.cash_register || null;
  const loyalty = data.loyalty || null;

  const fm = (v) => parseFloat(v || 0).toFixed(2);

  const getTaxLabel = (rate) => {
    const r = Math.round(parseFloat(rate) || 0);
    if (r === 0) return "E - Exento";
    if (r === 15) return "G - Gravado 15%";
    if (r === 18) return "G - Gravado 18%";
    return "";
  };

  const getPaymentLabel = (method) => {
    const labels = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia', qr: 'Código QR', credit: 'Crédito', check: 'Cheque', other: 'Otro' };
    return labels[method] || method;
  };

  const fmtDateTime = (date) => {
    if (!date) return '';
    // sold_at viene del backend como dd/mm/yyyy HH:mm:ss, mostrarlo directo
    return String(date);
  };

  const fmtDate = (date) => {
    if (!date) return '';
    return String(date);
  };

  // Tax summary
  let exempt = 0,
    taxable15 = 0;
  items.forEach((item) => {
    const itemTotal = parseFloat(item.subtotal) || item.quantity * item.price;
    const r = Math.round(parseFloat(item.tax_rate) || 0);
    if (r === 0) exempt += itemTotal;
    else if (r === 15) taxable15 += itemTotal;
  });

  // Total in words
  const total = parseFloat(sale.total) || 0;
  const intPart = Math.floor(total);
  const decPart = Math.round((total - intPart) * 100);
  const totalWords = `SON: ${numberToWords(intPart)} LEMPIRAS CON ${decPart}/100`;

  // Items HTML
  const itemsHtml = items
    .map((item) => {
      const taxLabel = getTaxLabel(item.tax_rate);
      return `<tr style="border-bottom:1px solid #000;">
      <td style="padding:2px 0;">
        <div>${item.product_name}</div>
        ${item.product_sku ? `<div style="font-size:10px;">Código: ${item.product_sku}</div>` : ""}
        ${taxLabel ? `<div style="font-size:10px;">${taxLabel}</div>` : ""}
      </td>
      <td style="text-align:center;padding:2px 0;">${item.quantity}</td>
      <td style="text-align:right;padding:2px 0;">L${fm(item.price)}</td>
      <td style="text-align:right;padding:2px 0;">L${fm(item.subtotal)}</td>
    </tr>`;
    })
    .join("");

  // Loyalty section
  let loyaltyHtml = '';
  if (loyalty && loyalty.points_earned > 0) {
    loyaltyHtml = `
    <div style="border-bottom:1px dashed #000;padding-bottom:4px;margin-bottom:4px;background:#eff6ff;padding:8px;border-radius:4px;">
      <div style="font-size:9px;text-align:center;">
        <div style="font-weight:bold;color:#1d4ed8;margin-bottom:4px;">PUNTOS DE LEALTAD</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Puntos Ganados:</span><span style="font-weight:600;color:#16a34a;">+${loyalty.points_earned}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Total de Puntos:</span><span style="font-weight:600;color:#1d4ed8;">${loyalty.new_balance}</span></div>
      </div>
    </div>`;
  }

  // Use branch data when available for address/phone
  const printAddress = branch.address || company.address || "";
  const printPhone = branch.phone || company.phone || "";

  return `<div class="badge">*** REIMPRESION ***</div>
<div class="c sep">
${company.logo_url ? `<img src="${company.logo_url}" style="max-width:50%;max-height:60px;margin:0 auto 4px;display:block;">` : ""}
<div class="big">${company.legal_name || company.name || "EMPRESA"}</div>
${printAddress ? `<div>${printAddress}</div>` : ""}
${printPhone ? `<div>Tel: ${printPhone}</div>` : ""}
${company.email ? `<div>Email: ${company.email}</div>` : ""}
<div class="b9">RTN: ${company.rtn || ""}</div>
${invoice && invoice.cai_number ? `<div>CAI: ${invoice.cai_number}</div>` : ""}
${branch.name ? `<div>Sucursal: ${branch.name}</div>` : ""}
</div>
<div class="c sep">
<div class="big">FACTURA</div>
<div>No. ${invoice ? invoice.invoice_number : sale.sale_number}</div>
<div>${fmtDateTime(sale.sold_at)}</div>
${cashRegister ? `<div>Caja: ${typeof cashRegister === 'object' ? cashRegister.name : cashRegister}</div>` : ""}
${seller.name ? `<div>Vendedor: ${seller.name}</div>` : ""}
</div>
${sale.order_number ? `<div class="c sep"><div>ORDEN No.</div><div style="font-size:26px;font-weight:900;line-height:1.2;">${sale.order_number}</div></div>` : ""}
<div class="sep">
<div><span class="b9">Cliente:</span> ${sale.customer_name || "Consumidor Final"}</div>
${sale.customer_rtn ? `<div><span class="b9">RTN:</span> ${sale.customer_rtn}</div>` : ""}
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
<div class="r"><span>Exento:</span><span>L${fm(exempt)}</span></div>
<div class="r"><span>Gravado 15%:</span><span>L${fm(taxable15)}</span></div>
<div class="r"><span>Subtotal:</span><span>L${fm(sale.subtotal)}</span></div>
<div class="r"><span>ISV 15%:</span><span>L${fm(sale.tax)}</span></div>
${parseFloat(sale.discount) > 0 ? `<div class="r"><span>Descuento:</span><span>-L${fm(sale.discount)}</span></div>` : ""}
</div>
<div class="sep">
<div class="r big"><span>TOTAL:</span><span>L${fm(sale.total)}</span></div>
<div class="r"><span>Pago:</span><span style="text-transform:uppercase;">${getPaymentLabel(sale.payment_method)}</span></div>
${sale.transaction_reference ? `<div class="r"><span>Ref:</span><span>${sale.transaction_reference}</span></div>` : ""}
<div class="r"><span>Pagado:</span><span>L${fm(sale.amount_paid)}</span></div>
${parseFloat(sale.amount_change) > 0 ? `<div class="r"><span>Cambio:</span><span>L${fm(sale.amount_change)}</span></div>` : ""}
</div>
${sale.status === "voided" ? '<div class="voided">*** ANULADA ***</div>' : ""}
${loyaltyHtml}
<div class="c" style="margin-bottom:4px;">
<div class="b9">${totalWords}</div>
<div>G=Gravado(15%) | E=Exento</div>
${invoice && invoice.range_authorized ? `<div>Rango: ${invoice.range_authorized}</div>` : ""}
${invoice && invoice.cai_expiration_date ? `<div>Límite: ${fmtDate(invoice.cai_expiration_date)}</div>` : ""}
</div>
<div class="c" style="border-top:1px dashed #000;padding-top:4px;">
<div class="b9">Gracias por su compra!</div>
<div>${company.name || ""}</div>
<div style="margin-top:4px;font-size:10px;">Reimpreso: ${new Date().toLocaleString("es-HN")}</div>
</div>`;
}

async function generateInvoice() {
  try {
    const invoice = await invoiceStore.createInvoice({
      sale_id: sale.value.id,
    });
    toast.success("Factura generada exitosamente");
    router.push(`/invoices/${invoice.id}`);
  } catch (error) {
    console.error("Error generating invoice:", error);
  }
}

function formatDate(date) {
  if (!date) return "-";
  return format(new Date(date), "dd MMM yyyy HH:mm", { locale: es });
}

function formatMoney(amount) {
  return parseFloat(amount || 0).toLocaleString("es-HN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getPaymentMethodLabel(method) {
  const labels = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia",
    credit: "Crédito",
  };
  return labels[method] || method;
}

function getStatusClass(status) {
  const classes = {
    completed: "bg-green-100 text-green-800",
    voided: "bg-red-100 text-red-800",
    pending: "bg-yellow-100 text-yellow-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
}

function getStatusLabel(status) {
  const labels = {
    completed: "Completada",
    voided: "Anulada",
    pending: "Pendiente",
  };
  return labels[status] || status;
}
</script>
