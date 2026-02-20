/**
 * Cash Drawer Utility
 * Sends ESC/POS commands to open the cash drawer connected via the thermal printer's RJ11 port.
 *
 * Standard ESC/POS command: ESC p m t1 t2
 *   ESC = 0x1B, p = 0x70, m = pin (0x00=pin2, 0x01=pin5), t1/t2 = pulse timing
 */

// ESC/POS cash drawer kick commands (pin 2 and pin 5 for compatibility)
const KICK_PIN2 = "\x1B\x70\x00\x19\xFA";
const KICK_PIN5 = "\x1B\x70\x01\x19\xFA";

/**
 * Open cash drawer by sending ESC/POS kick command through a print window.
 * Works when the browser's default printer is the thermal receipt printer.
 */
export function openCashDrawer() {
  try {
    const win = window.open("", "_blank", "width=1,height=1");
    if (!win) {
      console.warn("Cash drawer: popup blocked. Allow popups for this site.");
      return;
    }

    win.document.write(
      `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>Cash Drawer</title>
<style>@page{size:80mm auto;margin:0;}body{margin:0;padding:0;font-size:0;line-height:0;}</style>
</head><body>${KICK_PIN2}${KICK_PIN5}<script>window.onload=function(){window.print();setTimeout(function(){window.close();},500);};<` +
        `/script></body></html>`,
    );
    win.document.close();
  } catch (e) {
    console.error("Cash drawer: error opening drawer", e);
  }
}

/**
 * Returns the raw ESC/POS cash drawer kick string to embed in print HTML.
 * Include this at the start of your receipt HTML body.
 */
export function getCashDrawerKickCommand() {
  return KICK_PIN2 + KICK_PIN5;
}

export default { openCashDrawer, getCashDrawerKickCommand };
