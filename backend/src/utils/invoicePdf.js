/**
 * Invoice PDF generator - layout modern dan rapi
 * Mendukung semua status invoice
 */
const PDFDocument = require('pdfkit');

const formatIDR = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
const formatDate = (d) => d ? new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

const STATUS_LABELS = {
  draft: 'Draft',
  tentative: 'Tagihan DP',
  partial_paid: 'Pembayaran DP',
  paid: 'Lunas',
  processing: 'Processing',
  completed: 'Completed',
  overdue: 'Overdue',
  canceled: 'Dibatalkan',
  refunded: 'Refund Dana',
  order_updated: 'Order Diupdate',
  overpaid: 'Kelebihan Bayar',
  overpaid_transferred: 'Pindahan (Sumber)',
  overpaid_received: 'Pindahan (Penerima)',
  refund_canceled: 'Refund Dibatalkan',
  overpaid_refund_pending: 'Sisa Pengembalian'
};

/**
 * @param {PDFDocument} doc
 * @param {object} data - invoice data (dari DB atau contoh)
 */
function renderInvoicePdf(doc, data) {
  const margin = 50;
  const pageWidth = doc.page.width - margin * 2;
  let y = margin;

  // Header - Logo area & Company
  doc.fontSize(24).fillColor('#0f766e').text('BINTANG GLOBAL GROUP', margin, y);
  y += 32;
  doc.fontSize(10).fillColor('#64748b').text('Travel & Umroh | Invoice Resmi', margin, y);
  y += 24;

  // Garis pemisah
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(margin, y).lineTo(doc.page.width - margin, y).stroke();
  y += 20;

  // Baris 1: Invoice # | Status | Tanggal
  const statusLabel = STATUS_LABELS[data.status] || data.status;
  doc.fontSize(11).fillColor('#334155');
  doc.text(`Invoice: ${data.invoice_number || 'INV-2025-00001'}`, margin, y);
  doc.text(`Status: ${statusLabel}`, margin + pageWidth * 0.5, y);
  doc.text(`Tanggal: ${formatDate(data.issued_at || data.created_at)}`, margin + pageWidth * 0.75, y);
  y += 22;

  // Info Owner & Cabang (nomor/status dari invoice saja)
  doc.fontSize(10).fillColor('#64748b');
  doc.text(`Owner: ${data.User?.name || data.User?.company_name || '-'}`, margin, y);
  doc.text(`Cabang: ${data.Branch?.name || data.Branch?.code || '-'}`, margin + pageWidth * 0.5, y);
  y += 28;

  // Tabel item (ringkas)
  doc.fontSize(10).fillColor('#0f172a');
  doc.text('Rincian', margin, y);
  y += 18;

  const tableTop = y;
  doc.rect(margin, tableTop, pageWidth, 24).fillAndStroke('#f8fafc', '#e2e8f0');
  doc.fontSize(9).fillColor('#475569');
  doc.text('Deskripsi', margin + 12, tableTop + 8);
  doc.text('Jumlah', margin + pageWidth - 100, tableTop + 8);
  y = tableTop + 28;

  const items = data.Order?.OrderItems || [];
  const totalAmount = parseFloat(data.total_amount || 0);
  if (items.length > 0) {
    items.forEach((item, i) => {
      const desc = item.Product?.name || item.product_name || `Item ${i + 1}`;
      const amt = parseFloat(item.subtotal || item.unit_price || 0);
      doc.fontSize(9).fillColor('#334155');
      doc.text(String(desc).slice(0, 50), margin + 12, y);
      doc.text(formatIDR(amt), margin + pageWidth - 100, y);
      y += 20;
    });
  } else {
    doc.fontSize(9).fillColor('#64748b').text('Paket Umroh / Layanan', margin + 12, y);
    doc.text(formatIDR(totalAmount), margin + pageWidth - 100, y);
    y += 20;
  }

  y += 12;

  // Summary box
  const boxTop = y;
  doc.rect(margin, boxTop, pageWidth * 0.4, 100).fillAndStroke('#f0fdfa', '#99f6e4');
  y = boxTop + 14;
  doc.fontSize(9).fillColor('#0f766e');
  doc.text('Total Tagihan', margin + 14, y);
  doc.text(formatIDR(totalAmount), margin + pageWidth * 0.4 - 110, y, { width: 90, align: 'right' });
  y += 18;
  doc.text('DP (30%)', margin + 14, y);
  doc.text(formatIDR(data.dp_amount || totalAmount * 0.3), margin + pageWidth * 0.4 - 110, y, { width: 90, align: 'right' });
  y += 18;
  doc.text('Dibayar', margin + 14, y);
  doc.text(formatIDR(data.paid_amount || 0), margin + pageWidth * 0.4 - 110, y, { width: 90, align: 'right' });
  y += 18;
  doc.text('Sisa', margin + 14, y);
  doc.text(formatIDR(data.remaining_amount || totalAmount), margin + pageWidth * 0.4 - 110, y, { width: 90, align: 'right' });

  if (parseFloat(data.overpaid_amount || 0) > 0) {
    y += 18;
    doc.fillColor('#b45309').text('Kelebihan Bayar', margin + 14, y);
    doc.text(formatIDR(data.overpaid_amount), margin + pageWidth * 0.4 - 110, y, { width: 90, align: 'right' });
  }

  y = boxTop + 110;

  // Terms
  const terms = data.terms || [];
  if (terms.length > 0) {
    doc.fontSize(9).fillColor('#64748b').text('Ketentuan:', margin, y);
    y += 14;
    terms.forEach((t) => {
      doc.text(`• ${t}`, margin + 8, y);
      y += 14;
    });
    y += 8;
  }

  // Footer
  doc.fontSize(8).fillColor('#94a3b8');
  doc.text(`Generated: ${new Date().toLocaleString('id-ID')} | Bintang Global Group`, margin, doc.page.height - 40, { align: 'center', width: pageWidth });
}

/**
 * Generate PDF buffer dari data invoice
 */
function buildInvoicePdfBuffer(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
    renderInvoicePdf(doc, data);
    doc.end();
  });
}

module.exports = { renderInvoicePdf, buildInvoicePdfBuffer, formatIDR, formatDate, STATUS_LABELS };
