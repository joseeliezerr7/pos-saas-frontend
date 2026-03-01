/**
 * USB Thermal Printer Utility
 *
 * Connects directly to USB thermal receipt printers via the Web USB API
 * and sends raw ESC/POS commands for printing receipts without browser
 * print dialogs.
 *
 * Supports 58mm (32 columns) and 80mm (48 columns) paper widths.
 *
 * Usage:
 *   import { connectPrinter, printReceipt, disconnectPrinter, isConnected } from '@/utils/usbPrinter'
 *
 *   await connectPrinter()          // User selects printer
 *   await printReceipt(receiptData) // Print a receipt
 *   await disconnectPrinter()       // Disconnect
 */

// ---------------------------------------------------------------------------
// Constants - ESC/POS command bytes
// ---------------------------------------------------------------------------

const ESC = 0x1b;
const GS = 0x1d;
const LF = 0x0a;

const CMD = {
  INIT: new Uint8Array([ESC, 0x40]), // Initialize printer
  ALIGN_LEFT: new Uint8Array([ESC, 0x61, 0x00]),
  ALIGN_CENTER: new Uint8Array([ESC, 0x61, 0x01]),
  ALIGN_RIGHT: new Uint8Array([ESC, 0x61, 0x02]),
  BOLD_ON: new Uint8Array([ESC, 0x45, 0x01]),
  BOLD_OFF: new Uint8Array([ESC, 0x45, 0x00]),
  DOUBLE_SIZE: new Uint8Array([ESC, 0x21, 0x30]), // Double height + width
  NORMAL_SIZE: new Uint8Array([ESC, 0x21, 0x00]),
  CUT_PAPER: new Uint8Array([GS, 0x56, 0x41, 0x03]), // Partial cut with feed
  LINE_FEED: new Uint8Array([LF]),
  CASH_DRAWER: new Uint8Array([ESC, 0x70, 0x00, 0x19, 0x32]), // Kick pin 2
};

const STORAGE_KEY = "usb_printer_device";

// ---------------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------------

let _device = null;
let _endpointNumber = null;
let _interfaceNumber = null;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

/**
 * Saves the vendor and product IDs of the paired printer to localStorage
 * so the device can be auto-reconnected on future sessions.
 */
function _savePrinterInfo(device) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        vendorId: device.vendorId,
        productId: device.productId,
        productName: device.productName || "Thermal Printer",
      }),
    );
  } catch {
    // localStorage may be unavailable; not critical
  }
}

/**
 * Retrieves saved printer info from localStorage.
 * @returns {{ vendorId: number, productId: number, productName: string } | null}
 */
function _getSavedPrinterInfo() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Removes saved printer info from localStorage.
 */
function _clearPrinterInfo() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // not critical
  }
}

/**
 * Finds the first OUT bulk/interrupt endpoint on the device suitable for
 * sending data (print commands). Iterates all configurations, interfaces,
 * and alternates.
 *
 * @param {USBDevice} device
 * @returns {{ interfaceNumber: number, endpointNumber: number } | null}
 */
function _findOutEndpoint(device) {
  const configuration = device.configuration;
  if (!configuration) return null;

  for (const iface of configuration.interfaces) {
    for (const alt of iface.alternates) {
      for (const ep of alt.endpoints) {
        if (ep.direction === "out") {
          return {
            interfaceNumber: iface.interfaceNumber,
            endpointNumber: ep.endpointNumber,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Opens the device, selects configuration 1, claims the interface, and
 * stores the endpoint information for later transfers.
 *
 * @param {USBDevice} device
 */
async function _openDevice(device) {
  await device.open();

  // Select configuration 1 (standard for receipt printers)
  if (!device.configuration || device.configuration.configurationValue !== 1) {
    await device.selectConfiguration(1);
  }

  const ep = _findOutEndpoint(device);
  if (!ep) {
    await device.close();
    throw new Error(
      "No se encontro un endpoint de salida (OUT) en la impresora. " +
        "Verifique que el dispositivo es una impresora termica compatible.",
    );
  }

  _interfaceNumber = ep.interfaceNumber;
  _endpointNumber = ep.endpointNumber;

  await device.claimInterface(_interfaceNumber);

  _device = device;
}

/**
 * Sends raw bytes to the printer through the claimed OUT endpoint.
 *
 * @param {Uint8Array} data
 */
async function _sendData(data) {
  if (!_device || !_device.opened) {
    throw new Error("La impresora no esta conectada.");
  }
  await _device.transferOut(_endpointNumber, data);
}

/**
 * Concatenates multiple Uint8Array buffers into one.
 *
 * @param  {...Uint8Array} arrays
 * @returns {Uint8Array}
 */
function _concat(...arrays) {
  let totalLength = 0;
  for (const arr of arrays) {
    totalLength += arr.length;
  }
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Text formatting helpers
// ---------------------------------------------------------------------------

/**
 * Returns the column width for a given paper size.
 * @param {'58mm'|'80mm'} size
 * @returns {number}
 */
function _cols(size) {
  return size === "58mm" ? 32 : 48;
}

/**
 * Truncates or pads a string to the given length.
 * @param {string} str
 * @param {number} len
 * @param {'left'|'right'|'center'} align
 * @returns {string}
 */
function _pad(str, len, align = "left") {
  const s = String(str || "");
  if (s.length > len) return s.substring(0, len);
  const diff = len - s.length;
  switch (align) {
    case "right":
      return " ".repeat(diff) + s;
    case "center": {
      const left = Math.floor(diff / 2);
      const right = diff - left;
      return " ".repeat(left) + s + " ".repeat(right);
    }
    default:
      return s + " ".repeat(diff);
  }
}

/**
 * Creates a two-column line: left-aligned label, right-aligned value.
 * @param {string} left
 * @param {string} right
 * @param {number} cols
 * @returns {string}
 */
function _twoCol(left, right, cols) {
  const l = String(left || "");
  const r = String(right || "");
  const space = cols - l.length - r.length;
  if (space < 1) {
    // Truncate left side to make room
    const maxLeft = cols - r.length - 1;
    return l.substring(0, maxLeft) + " " + r;
  }
  return l + " ".repeat(space) + r;
}

/**
 * Creates a separator line of dashes.
 * @param {number} cols
 * @returns {string}
 */
function _separator(cols) {
  return "-".repeat(cols);
}

/**
 * Creates a double separator line of equals signs.
 * @param {number} cols
 * @returns {string}
 */
function _doubleSeparator(cols) {
  return "=".repeat(cols);
}

/**
 * Formats a number as currency string with two decimals.
 * @param {number|string} amount
 * @returns {string}
 */
function _formatMoney(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return "0.00";
  return num.toFixed(2);
}

/**
 * Wraps long text to fit within the column width, returning multiple lines.
 * @param {string} text
 * @param {number} maxWidth
 * @returns {string[]}
 */
function _wordWrap(text, maxWidth) {
  const str = String(text || "");
  if (str.length <= maxWidth) return [str];

  const lines = [];
  let remaining = str;

  while (remaining.length > maxWidth) {
    // Try to break at a space
    let breakAt = remaining.lastIndexOf(" ", maxWidth);
    if (breakAt <= 0) {
      breakAt = maxWidth; // Force break if no space found
    }
    lines.push(remaining.substring(0, breakAt));
    remaining = remaining.substring(breakAt).trimStart();
  }
  if (remaining.length > 0) {
    lines.push(remaining);
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Receipt builder
// ---------------------------------------------------------------------------

/**
 * Builds a complete ESC/POS byte buffer from receipt data.
 *
 * @param {Object} receiptData
 * @param {Object} receiptData.company
 * @param {string} receiptData.company.name
 * @param {string} receiptData.company.rtn
 * @param {string} receiptData.company.address
 * @param {string} receiptData.company.phone
 * @param {Object} receiptData.sale
 * @param {string} receiptData.sale.sale_number
 * @param {string} receiptData.sale.invoice_number
 * @param {string} receiptData.sale.date
 * @param {string} receiptData.sale.customer_name
 * @param {string} receiptData.sale.customer_rtn
 * @param {Array}  receiptData.sale.details
 * @param {number} receiptData.sale.subtotal
 * @param {number} receiptData.sale.discount
 * @param {number} receiptData.sale.tax
 * @param {number} receiptData.sale.total
 * @param {string} receiptData.sale.payment_method
 * @param {number} receiptData.sale.amount_paid
 * @param {number} receiptData.sale.amount_change
 * @param {string} receiptData.sale.notes
 * @param {Object} [receiptData.cai]
 * @param {string} [receiptData.cai.cai]
 * @param {string} [receiptData.cai.range_from]
 * @param {string} [receiptData.cai.range_to]
 * @param {string} [receiptData.cai.due_date]
 * @param {'58mm'|'80mm'} [receiptData.printSize='80mm']
 * @returns {Uint8Array}
 */
function _buildReceipt(receiptData) {
  const { company = {}, sale = {}, cai, printSize = "80mm" } = receiptData;
  const cols = _cols(printSize);
  const parts = [];

  /**
   * Helper: appends raw ESC/POS command bytes.
   * @param {Uint8Array} cmd
   */
  function cmd(c) {
    parts.push(c);
  }

  /**
   * Helper: appends a text line followed by a line feed.
   * @param {string} text
   */
  function line(text) {
    parts.push(encoder.encode(text));
    parts.push(CMD.LINE_FEED);
  }

  /**
   * Helper: appends an empty line.
   */
  function emptyLine() {
    parts.push(CMD.LINE_FEED);
  }

  // --- Initialize printer ---
  cmd(CMD.INIT);

  // --- Company header ---
  cmd(CMD.ALIGN_CENTER);
  cmd(CMD.BOLD_ON);
  cmd(CMD.DOUBLE_SIZE);
  line(String(company.name || "").toUpperCase());
  cmd(CMD.NORMAL_SIZE);
  cmd(CMD.BOLD_OFF);

  if (company.rtn) {
    line("RTN: " + company.rtn);
  }
  if (company.address) {
    const addressLines = _wordWrap(company.address, cols);
    for (const al of addressLines) {
      line(al);
    }
  }
  if (company.phone) {
    line("Tel: " + company.phone);
  }

  cmd(CMD.ALIGN_LEFT);
  line(_doubleSeparator(cols));

  // --- Invoice / sale info ---
  if (sale.invoice_number) {
    cmd(CMD.BOLD_ON);
    cmd(CMD.ALIGN_CENTER);
    line("FACTURA");
    cmd(CMD.ALIGN_LEFT);
    cmd(CMD.BOLD_OFF);
    line(_twoCol("No:", sale.invoice_number, cols));
  } else if (sale.sale_number) {
    cmd(CMD.BOLD_ON);
    cmd(CMD.ALIGN_CENTER);
    line("RECIBO DE VENTA");
    cmd(CMD.ALIGN_LEFT);
    cmd(CMD.BOLD_OFF);
    line(_twoCol("No:", sale.sale_number, cols));
  }

  if (sale.date) {
    line(_twoCol("Fecha:", sale.date, cols));
  }

  line(_separator(cols));

  // --- Customer info ---
  if (sale.customer_name) {
    line(_twoCol("Cliente:", sale.customer_name, cols));
  }
  if (sale.customer_rtn) {
    line(_twoCol("RTN:", sale.customer_rtn, cols));
  }
  if (sale.customer_name || sale.customer_rtn) {
    line(_separator(cols));
  }

  // --- Detail header ---
  cmd(CMD.BOLD_ON);

  if (printSize === "58mm") {
    // Compact layout for 58mm: 32 cols
    // PRODUCTO
    // QTY x PRECIO     SUBTOTAL
    line(_pad("PRODUCTO", cols));
    line(
      _twoCol(
        _pad("CANT", 4) + " " + _pad("PRECIO", 8),
        _pad("TOTAL", 9, "right"),
        cols,
      ),
    );
  } else {
    // Full layout for 80mm: 48 cols
    // PRODUCTO            CANT  PRECIO     TOTAL
    const descW = cols - 6 - 10 - 10; // remaining for description
    line(
      _pad("PRODUCTO", descW) +
        _pad("CANT", 6, "right") +
        _pad("PRECIO", 10, "right") +
        _pad("TOTAL", 10, "right"),
    );
  }

  cmd(CMD.BOLD_OFF);
  line(_separator(cols));

  // --- Detail lines ---
  const details = sale.details || [];
  for (const item of details) {
    const qty = String(item.quantity || 0);
    const price = _formatMoney(item.price);
    const subtotal = _formatMoney(item.subtotal);
    const name = String(item.product_name || "");

    if (printSize === "58mm") {
      // 58mm: product name on its own line, qty x price + subtotal on next
      const nameLines = _wordWrap(name, cols);
      for (const nl of nameLines) {
        line(nl);
      }
      const leftPart = qty + " x " + price;
      line(_twoCol(leftPart, subtotal, cols));
    } else {
      // 80mm: single line or two lines if name is too long
      const descW = cols - 6 - 10 - 10;
      const nameLines = _wordWrap(name, descW);

      // First line with all columns
      line(
        _pad(nameLines[0], descW) +
          _pad(qty, 6, "right") +
          _pad(price, 10, "right") +
          _pad(subtotal, 10, "right"),
      );

      // Additional name lines (no columns, just continuation)
      for (let i = 1; i < nameLines.length; i++) {
        line("  " + nameLines[i]);
      }
    }

    // Show SKU if available
    if (item.product_sku) {
      line("  SKU: " + item.product_sku);
    }

    // Show tax rate if available and non-zero
    if (item.tax_rate && parseFloat(item.tax_rate) > 0) {
      line("  ISV: " + parseFloat(item.tax_rate).toFixed(0) + "%");
    }
  }

  line(_separator(cols));

  // --- Totals ---
  cmd(CMD.ALIGN_LEFT);

  line(_twoCol("Subtotal:", "L " + _formatMoney(sale.subtotal), cols));

  if (sale.discount && parseFloat(sale.discount) > 0) {
    line(_twoCol("Descuento:", "- L " + _formatMoney(sale.discount), cols));
  }

  if (sale.tax !== undefined && sale.tax !== null) {
    line(_twoCol("ISV:", "L " + _formatMoney(sale.tax), cols));
  }

  line(_separator(cols));

  cmd(CMD.BOLD_ON);
  cmd(CMD.DOUBLE_SIZE);
  line(_twoCol("TOTAL:", "L " + _formatMoney(sale.total), cols));
  cmd(CMD.NORMAL_SIZE);
  cmd(CMD.BOLD_OFF);

  line(_separator(cols));

  // --- Payment info ---
  if (sale.payment_method) {
    const methodLabels = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer: "Transferencia",
      credit: "Credito",
    };
    const methodLabel =
      methodLabels[sale.payment_method] || sale.payment_method;
    line(_twoCol("Forma de pago:", methodLabel, cols));
  }

  if (sale.amount_paid !== undefined && sale.amount_paid !== null) {
    line(_twoCol("Pago:", "L " + _formatMoney(sale.amount_paid), cols));
  }

  if (sale.amount_change !== undefined && sale.amount_change !== null) {
    line(_twoCol("Cambio:", "L " + _formatMoney(sale.amount_change), cols));
  }

  // --- Notes ---
  if (sale.notes) {
    line(_separator(cols));
    const noteLines = _wordWrap("Nota: " + sale.notes, cols);
    for (const nl of noteLines) {
      line(nl);
    }
  }

  // --- CAI / Fiscal data ---
  if (cai && cai.cai) {
    line(_doubleSeparator(cols));
    cmd(CMD.ALIGN_CENTER);

    const caiLines = _wordWrap("CAI: " + cai.cai, cols);
    for (const cl of caiLines) {
      line(cl);
    }

    cmd(CMD.ALIGN_LEFT);

    if (cai.range_from) {
      line(_twoCol("Rango desde:", cai.range_from, cols));
    }
    if (cai.range_to) {
      line(_twoCol("Rango hasta:", cai.range_to, cols));
    }
    if (cai.due_date) {
      line(_twoCol("Fecha lim.:", cai.due_date, cols));
    }
  }

  // --- Footer ---
  line(_doubleSeparator(cols));
  cmd(CMD.ALIGN_CENTER);
  line("GRACIAS POR SU COMPRA");
  emptyLine();
  line("Este documento es su comprobante");
  line("de pago. Conservelo.");
  emptyLine();

  // Feed and cut
  emptyLine();
  emptyLine();
  emptyLine();
  cmd(CMD.CUT_PAPER);

  // Concatenate all parts into a single buffer
  return _concat(...parts);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Checks whether the Web USB API is available in the current browser.
 * @returns {boolean}
 */
export function isSupported() {
  return !!navigator.usb;
}

/**
 * Prompts the user to select a USB printer and establishes a connection.
 *
 * The printer's vendorId and productId are saved to localStorage so that
 * future calls to `connectPrinter()` (or `autoReconnect()`) can reconnect
 * without showing the chooser dialog, as long as the user has previously
 * granted permission.
 *
 * @returns {Promise<{ vendorId: number, productId: number, productName: string }>}
 * @throws {Error} If Web USB is not supported, user cancels, or connection fails.
 */
export async function connectPrinter() {
  if (!navigator.usb) {
    throw new Error(
      "Web USB no es compatible con este navegador. " +
        "Use Chrome, Edge u Opera en un entorno seguro (HTTPS).",
    );
  }

  // If already connected, return current device info
  if (_device && _device.opened) {
    return {
      vendorId: _device.vendorId,
      productId: _device.productId,
      productName: _device.productName || "Thermal Printer",
    };
  }

  // First try to auto-reconnect to a previously paired device
  const saved = _getSavedPrinterInfo();
  if (saved) {
    try {
      const devices = await navigator.usb.getDevices();
      const existing = devices.find(
        (d) =>
          d.vendorId === saved.vendorId && d.productId === saved.productId,
      );
      if (existing) {
        await _openDevice(existing);
        return {
          vendorId: existing.vendorId,
          productId: existing.productId,
          productName: existing.productName || saved.productName,
        };
      }
    } catch (err) {
      console.warn("USB Printer: auto-reconnect failed, prompting user.", err);
    }
  }

  // Prompt user to pick a device (filter by printer class 0x07)
  let device;
  try {
    device = await navigator.usb.requestDevice({
      filters: [{ classCode: 0x07 }], // Printer class
    });
  } catch (err) {
    if (err.name === "NotFoundError") {
      throw new Error(
        "No se selecciono ninguna impresora. " +
          "Conecte la impresora USB y vuelva a intentar.",
      );
    }
    throw new Error("Error al seleccionar impresora USB: " + err.message);
  }

  await _openDevice(device);
  _savePrinterInfo(device);

  return {
    vendorId: device.vendorId,
    productId: device.productId,
    productName: device.productName || "Thermal Printer",
  };
}

/**
 * Attempts to auto-reconnect to a previously paired printer without showing
 * the browser's device chooser dialog. Returns device info on success, or
 * null if no previously paired device is available.
 *
 * @returns {Promise<{ vendorId: number, productId: number, productName: string } | null>}
 */
export async function autoReconnect() {
  if (!navigator.usb) return null;

  // Already connected
  if (_device && _device.opened) {
    return {
      vendorId: _device.vendorId,
      productId: _device.productId,
      productName: _device.productName || "Thermal Printer",
    };
  }

  const saved = _getSavedPrinterInfo();
  if (!saved) return null;

  try {
    const devices = await navigator.usb.getDevices();
    const existing = devices.find(
      (d) =>
        d.vendorId === saved.vendorId && d.productId === saved.productId,
    );

    if (!existing) return null;

    await _openDevice(existing);
    return {
      vendorId: existing.vendorId,
      productId: existing.productId,
      productName: existing.productName || saved.productName,
    };
  } catch (err) {
    console.warn("USB Printer: auto-reconnect failed.", err);
    return null;
  }
}

/**
 * Returns `true` if a USB printer is currently connected and the device
 * handle is open.
 *
 * @returns {boolean}
 */
export function isConnected() {
  return !!(_device && _device.opened);
}

/**
 * Returns information about the currently connected printer, or null if
 * no printer is connected.
 *
 * @returns {{ vendorId: number, productId: number, productName: string } | null}
 */
export function getPrinterInfo() {
  if (!_device || !_device.opened) {
    // Check localStorage for saved (but not currently connected) printer
    const saved = _getSavedPrinterInfo();
    if (saved) {
      return { ...saved, connected: false };
    }
    return null;
  }
  return {
    vendorId: _device.vendorId,
    productId: _device.productId,
    productName: _device.productName || "Thermal Printer",
    connected: true,
  };
}

/**
 * Prints a receipt by generating ESC/POS commands from the receipt data
 * and sending them directly to the connected USB thermal printer.
 *
 * If no printer is connected, this function will attempt an auto-reconnect
 * first. If that fails, it throws an error.
 *
 * @param {Object} receiptData - The receipt data structure (see module docs).
 * @param {Object}  [options] - Additional options.
 * @param {boolean} [options.openDrawer=false] - Send cash drawer kick command after printing.
 * @param {number}  [options.copies=1] - Number of copies to print.
 * @returns {Promise<void>}
 * @throws {Error} If not connected or transfer fails.
 */
export async function printReceipt(receiptData, options = {}) {
  const { openDrawer = false, copies = 1 } = options;

  // Ensure we have a connection
  if (!_device || !_device.opened) {
    const reconnected = await autoReconnect();
    if (!reconnected) {
      throw new Error(
        "No hay impresora USB conectada. " +
          "Use connectPrinter() para seleccionar una impresora primero.",
      );
    }
  }

  // Build the receipt
  const receiptBuffer = _buildReceipt(receiptData);

  // Print the requested number of copies
  for (let i = 0; i < copies; i++) {
    await _sendData(receiptBuffer);
  }

  // Open cash drawer if requested
  if (openDrawer) {
    await _sendData(CMD.CASH_DRAWER);
  }
}

/**
 * Sends a raw cash drawer kick command to the connected printer.
 *
 * @returns {Promise<void>}
 * @throws {Error} If not connected.
 */
export async function openCashDrawer() {
  if (!_device || !_device.opened) {
    const reconnected = await autoReconnect();
    if (!reconnected) {
      throw new Error(
        "No hay impresora USB conectada. " +
          "Conecte la impresora para abrir el cajon.",
      );
    }
  }

  await _sendData(CMD.CASH_DRAWER);
}

/**
 * Sends raw ESC/POS bytes to the printer. Useful for custom commands
 * or testing.
 *
 * @param {Uint8Array} data - Raw bytes to send.
 * @returns {Promise<void>}
 * @throws {Error} If not connected.
 */
export async function sendRawData(data) {
  if (!_device || !_device.opened) {
    throw new Error("No hay impresora USB conectada.");
  }
  await _sendData(data);
}

/**
 * Prints a test page to verify the printer is working correctly.
 *
 * @param {'58mm'|'80mm'} [printSize='80mm']
 * @returns {Promise<void>}
 * @throws {Error} If not connected.
 */
export async function printTestPage(printSize = "80mm") {
  if (!_device || !_device.opened) {
    const reconnected = await autoReconnect();
    if (!reconnected) {
      throw new Error("No hay impresora USB conectada.");
    }
  }

  const cols = _cols(printSize);
  const parts = [];

  parts.push(CMD.INIT);
  parts.push(CMD.ALIGN_CENTER);
  parts.push(CMD.BOLD_ON);
  parts.push(CMD.DOUBLE_SIZE);
  parts.push(encoder.encode("PRUEBA DE IMPRESION"));
  parts.push(CMD.LINE_FEED);
  parts.push(CMD.NORMAL_SIZE);
  parts.push(CMD.BOLD_OFF);
  parts.push(CMD.LINE_FEED);

  parts.push(CMD.ALIGN_LEFT);
  parts.push(encoder.encode(_separator(cols)));
  parts.push(CMD.LINE_FEED);

  parts.push(encoder.encode("Tamano de papel: " + printSize));
  parts.push(CMD.LINE_FEED);
  parts.push(encoder.encode("Columnas: " + cols));
  parts.push(CMD.LINE_FEED);

  const printerName = _device.productName || "Desconocida";
  parts.push(encoder.encode("Impresora: " + printerName));
  parts.push(CMD.LINE_FEED);

  parts.push(
    encoder.encode(
      "Vendor ID: 0x" + _device.vendorId.toString(16).padStart(4, "0"),
    ),
  );
  parts.push(CMD.LINE_FEED);

  parts.push(
    encoder.encode(
      "Product ID: 0x" + _device.productId.toString(16).padStart(4, "0"),
    ),
  );
  parts.push(CMD.LINE_FEED);

  const now = new Date();
  parts.push(encoder.encode("Fecha: " + now.toLocaleString()));
  parts.push(CMD.LINE_FEED);

  parts.push(encoder.encode(_separator(cols)));
  parts.push(CMD.LINE_FEED);

  // Character test
  parts.push(encoder.encode("0123456789".repeat(Math.ceil(cols / 10)).substring(0, cols)));
  parts.push(CMD.LINE_FEED);

  parts.push(encoder.encode(_separator(cols)));
  parts.push(CMD.LINE_FEED);

  parts.push(CMD.ALIGN_CENTER);
  parts.push(encoder.encode("Impresion correcta!"));
  parts.push(CMD.LINE_FEED);
  parts.push(CMD.LINE_FEED);
  parts.push(CMD.LINE_FEED);
  parts.push(CMD.LINE_FEED);

  parts.push(CMD.CUT_PAPER);

  await _sendData(_concat(...parts));
}

/**
 * Disconnects from the USB printer, releases the interface, closes the
 * device, and removes saved printer info from localStorage.
 *
 * @param {Object}  [options]
 * @param {boolean} [options.forget=true] - If true, also removes saved printer
 *   info so the user will be prompted again on next connect. Set to false to
 *   keep the pairing for auto-reconnect.
 * @returns {Promise<void>}
 */
export async function disconnectPrinter(options = {}) {
  const { forget = true } = options;

  if (_device) {
    try {
      if (_device.opened) {
        if (_interfaceNumber !== null) {
          try {
            await _device.releaseInterface(_interfaceNumber);
          } catch {
            // Interface may already be released
          }
        }
        await _device.close();
      }
    } catch (err) {
      console.warn("USB Printer: error during disconnect.", err);
    }

    if (forget) {
      try {
        await _device.forget();
      } catch {
        // forget() may not be supported in all browsers
      }
      _clearPrinterInfo();
    }
  }

  _device = null;
  _endpointNumber = null;
  _interfaceNumber = null;
}

// ---------------------------------------------------------------------------
// Default export
// ---------------------------------------------------------------------------

export default {
  isSupported,
  connectPrinter,
  autoReconnect,
  isConnected,
  getPrinterInfo,
  printReceipt,
  openCashDrawer,
  sendRawData,
  printTestPage,
  disconnectPrinter,
};
