<template>
  <div class="invoice-ticket-container">
    <!-- Modal Overlay -->
    <Teleport to="body">
      <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="flex min-h-screen items-center justify-center p-4">
          <div class="fixed inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>

          <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6 z-10">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-bold text-gray-900">Factura Generada</h3>
              <button @click="$emit('close')" class="text-gray-400 hover:text-gray-500">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <!-- Ticket Preview -->
            <div id="ticket-content" class="ticket-80mm bg-white">
              <!-- 1. ENCABEZADO -->
              <div class="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                <img v-if="company.logo_url" :src="company.logo_url" alt="Logo" style="max-width:120px;max-height:60px;margin:0 auto 6px auto;display:block;" />
                <div class="font-bold text-sm">{{ company.legal_name || company.name }}</div>
                <div class="text-xs">{{ company.address }}</div>
                <div class="text-xs">{{ company.city || 'Honduras' }}, C.A.</div>
                <div class="text-xs">Tel: {{ company.phone }}</div>
                <div class="text-xs">Email: {{ company.email }}</div>
                <div class="text-xs font-semibold mt-1">RTN: {{ company.rtn }}</div>
                <div class="text-xs" v-if="cai">CAI: {{ cai.cai_number }}</div>
                <div class="text-xs" v-if="sale.branch">Sucursal: {{ sale.branch.name }}</div>
              </div>

              <!-- 2. DATOS DEL DOCUMENTO -->
              <div class="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                <div class="font-bold text-sm">FACTURA</div>
                <div class="text-xs">No. {{ sale.sale_number || invoiceNumber }}</div>
                <div class="text-xs">{{ formatDateTime(sale.sold_at || new Date()) }}</div>
                <div class="text-xs" v-if="sale.cash_opening">Caja: {{ sale.cash_opening.cash_register?.name }}</div>
                <div class="text-xs" v-if="sale.user">Vendedor: {{ sale.user.name }}</div>
              </div>

              <!-- NÚMERO DE ORDEN -->
              <div v-if="sale.order_number" class="text-center border-b border-dashed border-gray-400 pb-2 mb-2">
                <div class="text-xs text-gray-600">ORDEN No.</div>
                <div class="font-bold" style="font-size:28px;line-height:1.2;">{{ sale.order_number }}</div>
              </div>

              <!-- 3. DATOS DEL CLIENTE -->
              <div class="border-b border-dashed border-gray-400 pb-2 mb-2">
                <div class="text-xs">
                  <span class="font-semibold">Cliente:</span> {{ sale.customer_name || 'Consumidor Final' }}
                </div>
                <div class="text-xs" v-if="sale.customer_rtn">
                  <span class="font-semibold">RTN:</span> {{ sale.customer_rtn }}
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
                  <tr v-for="item in sale.details" :key="item.id" class="border-b border-gray-200">
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
                    <td class="text-right py-1">L {{ formatMoney(item.price) }}</td>
                    <td class="text-right py-1">L {{ formatMoney(item.subtotal) }}</td>
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
                    <span style="text-transform:uppercase;">{{ getPaymentMethodLabel(sale.payment_method) }}</span>
                  </div>
                  <div class="flex justify-between mb-1" v-if="sale.transaction_reference">
                    <span>Ref. Transacción:</span>
                    <span class="font-mono text-xs">{{ sale.transaction_reference }}</span>
                  </div>
                  <div class="flex justify-between mb-1">
                    <span>Monto Pagado:</span>
                    <span>L {{ formatMoney(sale.amount_paid) }}</span>
                  </div>
                  <div class="flex justify-between mb-1" v-if="sale.amount_change > 0">
                    <span>Cambio:</span>
                    <span>L {{ formatMoney(sale.amount_change) }}</span>
                  </div>
                </div>
              </div>

              <!-- LOYALTY POINTS -->
              <div v-if="sale.loyalty && sale.loyalty.points_earned > 0" class="border-b border-dashed border-gray-400 pb-2 mb-2 bg-blue-50 p-2 rounded">
                <div class="text-xs text-center">
                  <div class="font-bold text-blue-700 mb-1">PUNTOS DE LEALTAD</div>
                  <div class="flex justify-between mb-1">
                    <span>Puntos Ganados:</span>
                    <span class="font-semibold text-green-600">+{{ sale.loyalty.points_earned }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Total de Puntos:</span>
                    <span class="font-semibold text-blue-700">{{ sale.loyalty.new_balance }}</span>
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
                  <div>Rango Autorizado: {{ cai.range_from }} - {{ cai.range_to }}</div>
                  <div>Fecha Límite: {{ formatDate(cai.expiry_date) }}</div>
                </div>
              </div>

              <!-- Footer -->
              <div class="text-center text-xs text-gray-600 border-t border-dashed border-gray-400 pt-2">
                <div>¡Gracias por su compra!</div>
                <div class="mt-1">{{ company.name }}</div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex space-x-3 mt-6">
              <button @click="printTicket"
                      data-shortcut="print-invoice"
                      class="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center justify-center">
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button @click="$emit('close')"
                      class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  sale: {
    type: Object,
    required: true
  },
  company: {
    type: Object,
    required: true
  },
  cai: {
    type: Object,
    default: null
  },
  invoiceNumber: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['close'])

// Helper to normalize tax_rate to integer for comparison
const normalizeTaxRate = (rate) => Math.round(parseFloat(rate) || 0)

// Computed: Tax Summary
const taxSummary = computed(() => {
  const summary = {
    exempt: 0,
    taxable15: 0,
    taxable18: 0
  }

  if (props.sale.details) {
    props.sale.details.forEach(item => {
      const itemTotal = parseFloat(item.subtotal) || (item.quantity * item.price)
      const rate = normalizeTaxRate(item.tax_rate)

      if (rate === 0) {
        summary.exempt += itemTotal
      } else if (rate === 15) {
        summary.taxable15 += itemTotal
      } else if (rate === 18) {
        summary.taxable18 += itemTotal
      }
    })
  }

  return summary
})

// Computed: Total in Words
const totalInWords = computed(() => {
  const total = parseFloat(props.sale.total) || 0
  const integerPart = Math.floor(total)
  const decimalPart = Math.round((total - integerPart) * 100)

  return `SON: ${numberToWords(integerPart)} LEMPIRAS CON ${decimalPart}/100`
})

// Helpers
const formatMoney = (value) => {
  return parseFloat(value || 0).toFixed(2)
}

const formatDateTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleString('es-HN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('es-HN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

const getTaxLabel = (taxRate) => {
  const rate = normalizeTaxRate(taxRate)
  if (rate === 0) return 'E - Exento'
  if (rate === 15) return 'G - Gravado 15%'
  if (rate === 18) return 'G - Gravado 18%'
  return ''
}

const getPaymentMethodLabel = (method) => {
  const labels = {
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',
    qr: 'Código QR',
    credit: 'Crédito',
    check: 'Cheque',
    other: 'Otro'
  }
  return labels[method] || method
}

const numberToWords = (num) => {
  const units = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE']
  const tens = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA']
  const hundreds = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS']

  if (num === 0) return 'CERO'
  if (num === 100) return 'CIEN'

  let result = ''

  if (num >= 1000) {
    const thousands = Math.floor(num / 1000)
    if (thousands === 1) {
      result += 'MIL '
    } else {
      result += units[thousands] + ' MIL '
    }
    num %= 1000
  }

  if (num >= 100) {
    result += hundreds[Math.floor(num / 100)] + ' '
    num %= 100
  }

  if (num >= 10) {
    result += tens[Math.floor(num / 10)] + ' '
    num %= 10
  }

  if (num > 0) {
    result += units[num]
  }

  return result.trim()
}

// Generate self-contained print HTML from data (not innerHTML copy)
const printTicket = () => {
  const s = props.sale
  const c = props.company
  const caiInfo = props.cai
  const fm = (v) => parseFloat(v || 0).toFixed(2)

  // Build items HTML
  const itemsHtml = (s.details || []).map(item => {
    const rate = normalizeTaxRate(item.tax_rate)
    let taxLabel = ''
    if (rate === 0) taxLabel = 'E - Exento'
    else if (rate === 15) taxLabel = 'G - Gravado 15%'
    else if (rate === 18) taxLabel = 'G - Gravado 18%'
    const productName = item.product?.name || item.product_name || ''
    const sku = item.product?.sku || ''

    return `<tr style="border-bottom:1px solid #ddd;">
      <td style="padding:4px 2px;">
        <div>${productName}</div>
        ${sku ? `<div style="color:#666;font-size:9px;">Código: ${sku}</div>` : ''}
        ${taxLabel ? `<div style="color:#666;font-size:9px;">${taxLabel}</div>` : ''}
      </td>
      <td style="text-align:center;padding:4px 2px;">${item.quantity}</td>
      <td style="text-align:right;padding:4px 2px;">L ${fm(item.price)}</td>
      <td style="text-align:right;padding:4px 2px;">L ${fm(item.subtotal)}</td>
    </tr>`
  }).join('')

  // Tax summary from computed
  const ts = taxSummary.value

  // Loyalty section
  let loyaltyHtml = ''
  if (s.loyalty && s.loyalty.points_earned > 0) {
    loyaltyHtml = `
    <div style="border-bottom:1px dashed #999;padding-bottom:8px;margin-bottom:8px;background:#eff6ff;padding:8px;border-radius:4px;">
      <div style="font-size:9px;text-align:center;">
        <div style="font-weight:bold;color:#1d4ed8;margin-bottom:4px;">PUNTOS DE LEALTAD</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span>Puntos Ganados:</span><span style="font-weight:600;color:#16a34a;">+${s.loyalty.points_earned}</span></div>
        <div style="display:flex;justify-content:space-between;"><span>Total de Puntos:</span><span style="font-weight:600;color:#1d4ed8;">${s.loyalty.new_balance}</span></div>
      </div>
    </div>`
  }

  const printWindow = window.open('', '_blank')
  printWindow.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Factura ${s.sale_number || props.invoiceNumber}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box;}
  @page{size:80mm auto;margin:0;}
  @media print{body{width:80mm;}}
  body{font-family:'Courier New',monospace;font-size:10px;line-height:1.4;color:#000;background:#fff;width:80mm;padding:5mm;}
  .sep{border-bottom:1px dashed #999;padding-bottom:8px;margin-bottom:8px;}
  .sep-solid{border-top:1px solid #999;border-bottom:1px solid #999;padding:8px 0;margin-bottom:8px;}
  .flex{display:flex;justify-content:space-between;}
  table{width:100%;border-collapse:collapse;}
  th,td{padding:4px 2px;font-size:10px;}
</style></head><body>

<!-- 1. ENCABEZADO -->
<div style="text-align:center;" class="sep">
  ${c.logo_url ? `<img src="${c.logo_url}" alt="Logo" style="max-width:120px;max-height:60px;margin:0 auto 6px auto;display:block;" />` : ''}
  <div style="font-weight:bold;font-size:11px;">${c.legal_name || c.name}</div>
  <div style="font-size:9px;">${c.address || ''}</div>
  <div style="font-size:9px;">${c.city || 'Honduras'}, C.A.</div>
  <div style="font-size:9px;">Tel: ${c.phone || ''}</div>
  <div style="font-size:9px;">Email: ${c.email || ''}</div>
  <div style="font-size:9px;font-weight:600;margin-top:4px;">RTN: ${c.rtn || ''}</div>
  ${caiInfo ? `<div style="font-size:9px;">CAI: ${caiInfo.cai_number}</div>` : ''}
  ${s.branch ? `<div style="font-size:9px;">Sucursal: ${s.branch.name}</div>` : ''}
</div>

<!-- 2. DATOS DEL DOCUMENTO -->
<div style="text-align:center;" class="sep">
  <div style="font-weight:bold;font-size:11px;">FACTURA</div>
  <div style="font-size:9px;">No. ${s.sale_number || props.invoiceNumber}</div>
  <div style="font-size:9px;">${formatDateTime(s.sold_at || new Date())}</div>
  ${s.cash_opening ? `<div style="font-size:9px;">Caja: ${s.cash_opening.cash_register?.name || ''}</div>` : ''}
  ${s.user ? `<div style="font-size:9px;">Vendedor: ${s.user.name}</div>` : ''}
</div>

<!-- NÚMERO DE ORDEN -->
${s.order_number ? `<div style="text-align:center;border-bottom:1px dashed #999;padding-bottom:8px;margin-bottom:8px;">
  <div style="font-size:9px;color:#666;">ORDEN No.</div>
  <div style="font-weight:bold;font-size:28px;line-height:1.2;">${s.order_number}</div>
</div>` : ''}

<!-- 3. DATOS DEL CLIENTE -->
<div class="sep">
  <div style="font-size:9px;"><span style="font-weight:600;">Cliente:</span> ${s.customer_name || 'Consumidor Final'}</div>
  ${s.customer_rtn ? `<div style="font-size:9px;"><span style="font-weight:600;">RTN:</span> ${s.customer_rtn}</div>` : ''}
</div>

<!-- 4. DETALLE DE PRODUCTOS -->
<table style="margin-bottom:8px;">
  <thead><tr style="border-bottom:1px solid #999;">
    <th style="text-align:left;padding:4px 2px;">Descripción</th>
    <th style="text-align:center;padding:4px 2px;width:12mm;">Cant</th>
    <th style="text-align:right;padding:4px 2px;width:16mm;">Precio</th>
    <th style="text-align:right;padding:4px 2px;width:16mm;">Total</th>
  </tr></thead>
  <tbody>${itemsHtml}</tbody>
</table>

<!-- 5. RESUMEN DE IMPUESTOS -->
<div class="sep-solid">
  <div class="flex" style="margin-bottom:4px;"><span>Importe Exento:</span><span>L ${fm(ts.exempt)}</span></div>
  <div class="flex" style="margin-bottom:4px;"><span>Importe Gravado 15%:</span><span>L ${fm(ts.taxable15)}</span></div>
  <div class="flex" style="margin-bottom:4px;"><span>Subtotal:</span><span>L ${fm(s.subtotal)}</span></div>
  <div class="flex" style="margin-bottom:4px;"><span>ISV 15%:</span><span>L ${fm(s.tax)}</span></div>
  ${parseFloat(s.discount) > 0 ? `<div class="flex" style="margin-bottom:4px;"><span>Descuento:</span><span>- L ${fm(s.discount)}</span></div>` : ''}
</div>

<!-- 6. TOTALES DE PAGO -->
<div class="sep">
  <div class="flex" style="font-weight:bold;font-size:11px;margin-bottom:8px;"><span>TOTAL A PAGAR:</span><span>L ${fm(s.total)}</span></div>
  <div style="font-size:9px;">
    <div class="flex" style="margin-bottom:4px;"><span>Forma de Pago:</span><span style="text-transform:uppercase;">${getPaymentMethodLabel(s.payment_method)}</span></div>
    ${s.transaction_reference ? `<div class="flex" style="margin-bottom:4px;"><span>Ref. Transacción:</span><span>${s.transaction_reference}</span></div>` : ''}
    <div class="flex" style="margin-bottom:4px;"><span>Monto Pagado:</span><span>L ${fm(s.amount_paid)}</span></div>
    ${parseFloat(s.amount_change) > 0 ? `<div class="flex" style="margin-bottom:4px;"><span>Cambio:</span><span>L ${fm(s.amount_change)}</span></div>` : ''}
  </div>
</div>

${loyaltyHtml}

<!-- 7. INFORMACIÓN LEGAL -->
<div style="font-size:9px;text-align:center;margin-bottom:8px;">
  <div style="font-weight:600;margin-bottom:4px;">${totalInWords.value}</div>
  <div style="color:#666;margin-bottom:4px;">G = Gravado (15%) | E = Exento</div>
  ${caiInfo ? `<div style="color:#666;">Rango Autorizado: ${caiInfo.range_from} - ${caiInfo.range_to}</div><div style="color:#666;">Fecha Límite: ${formatDate(caiInfo.expiry_date)}</div>` : ''}
</div>

<!-- Footer -->
<div style="text-align:center;font-size:9px;color:#666;border-top:1px dashed #999;padding-top:8px;">
  <div>¡Gracias por su compra!</div>
  <div style="margin-top:4px;">${c.name}</div>
</div>

<script>window.onload=function(){window.print();window.onafterprint=function(){window.close();};};<\/script>
</body></html>`)
  printWindow.document.close()
}
</script>

<style scoped>
.ticket-80mm {
  width: 80mm;
  font-family: 'Courier New', monospace;
  font-size: 10px;
  line-height: 1.4;
  color: #000;
  padding: 5mm;
  background: white;
  margin: 0 auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  max-height: 70vh;
  overflow-y: auto;
}

@media print {
  .ticket-80mm {
    box-shadow: none;
    max-height: none;
    overflow: visible;
  }
}
</style>
