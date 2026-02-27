/**
 * Retorna configuración CSS según el tamaño de papel.
 * @param {'58mm'|'80mm'|'letter'} size
 */
function getSizeConfig(size) {
  switch (size) {
    case '58mm':
      return {
        page: '@page { size: 58mm auto; margin: 0; }',
        htmlBody: 'html, body { margin: 0; padding: 0; width: 58mm; }',
        body: "body { font-family: 'Courier New', monospace; font-size: 10px; font-weight: 900; line-height: 1.2; color: #000; padding: 0 2mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
        thTd: 'th, td { padding: 1px 0; font-size: 10px; font-weight: 900; }',
        big: '.big { font-size: 12px; font-weight: 900; }',
      };
    case 'letter':
      return {
        page: '@page { size: letter; margin: 18mm 20mm; }',
        htmlBody: 'html, body { margin: 0; padding: 0; width: 100%; }',
        body: "body { font-family: Arial, Helvetica, sans-serif; font-size: 13px; font-weight: 400; line-height: 1.6; color: #000; max-width: 170mm; margin: 0 auto; padding: 10mm 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
        thTd: 'th, td { padding: 6px 8px; font-size: 13px; font-weight: 400; } th { font-weight: 600; background: #f5f5f5; }',
        big: '.big { font-size: 18px; font-weight: 700; }',
        extra: `
          .c.sep, .sep { border-bottom: 1px solid #ccc; padding-bottom: 14px; margin-bottom: 14px; }
          .seps { border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; padding: 10px 0; margin-bottom: 14px; }
          .r { display: flex; justify-content: space-between; padding: 4px 0; font-size: 13px; }
          .b9 { font-weight: 600; }
          .badge { font-size: 14px; border: 2px solid #333; padding: 8px 16px; margin-bottom: 14px; }
          .voided { font-size: 18px; padding: 10px; margin: 14px 0; }
          table { border: 1px solid #ccc; margin-bottom: 14px; }
          table th { border-bottom: 2px solid #999; text-align: left; }
          table td, table th { border-right: 1px solid #eee; }
          table td:last-child, table th:last-child { border-right: none; }
          table tr { border-bottom: 1px solid #eee; }
          table tr:last-child { border-bottom: none; }
          img { max-width: 180px !important; max-height: 80px !important; }
        `,
      };
    case '80mm':
    default:
      return {
        page: '@page { size: 80mm auto; margin: 0; }',
        htmlBody: 'html, body { margin: 0; padding: 0; width: 80mm; }',
        body: "body { font-family: 'Courier New', monospace; font-size: 12px; font-weight: 900; line-height: 1.3; color: #000; padding: 0 4mm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }",
        thTd: 'th, td { padding: 2px 0; font-size: 12px; font-weight: 900; }',
        big: '.big { font-size: 14px; font-weight: 900; }',
      };
  }
}

/**
 * Imprime contenido HTML usando iframe oculto.
 * Soporta múltiples tamaños de papel: 58mm, 80mm (default), letter.
 *
 * @param {string} bodyHtml - El contenido HTML del recibo (sin <html>, <head>, etc.)
 * @param {object} [options] - Opciones adicionales
 * @param {string} [options.size] - Tamaño de papel: '58mm' | '80mm' | 'letter'
 * @param {string} [options.extraCss] - CSS adicional para agregar
 */
export function printThermal(bodyHtml, options = {}) {
  const sizeConfig = getSizeConfig(options.size || '80mm');

  const css = `
    ${sizeConfig.page}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    ${sizeConfig.htmlBody}
    ${sizeConfig.body}
    .c { text-align: center; }
    .sep { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
    .seps { border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 4px 0; margin-bottom: 4px; }
    .r { display: flex; justify-content: space-between; }
    table { width: 100%; border-collapse: collapse; }
    ${sizeConfig.thTd}
    ${sizeConfig.big}
    .badge { text-align: center; font-weight: 900; font-size: 13px; border: 2px solid #000; padding: 2px; margin-bottom: 4px; }
    .voided { text-align: center; font-weight: 900; font-size: 16px; border: 3px solid #000; color: #000; background: #ddd; padding: 6px; margin: 6px 0; letter-spacing: 2px; }
    ${sizeConfig.extra || ''}
    ${options.extraCss || ''}
  `;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>\u200B</title><style>${css}</style></head><body>${bodyHtml}</body></html>`;

  // Crear iframe oculto
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:none;visibility:hidden;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  function executePrint() {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (e) {
      console.error('Error printing:', e);
    }
    // Limpiar iframe después de imprimir
    setTimeout(() => {
      try { document.body.removeChild(iframe); } catch (e) { /* ya fue removido */ }
    }, 1000);
  }

  // Esperar que todas las imágenes carguen
  const imgs = doc.querySelectorAll('img');
  if (imgs.length === 0) {
    setTimeout(executePrint, 50);
    return;
  }

  let pending = imgs.length;
  function onImgReady() {
    pending--;
    if (pending <= 0) setTimeout(executePrint, 150);
  }

  imgs.forEach((img) => {
    if (img.complete) {
      onImgReady();
    } else {
      img.onload = onImgReady;
      img.onerror = onImgReady;
    }
  });
}
