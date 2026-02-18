const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { PaymentProof, Invoice } = require('../models');
const { ROLES } = require('../constants');
const uploadConfig = require('../config/uploads');

const proofDir = uploadConfig.getDir(uploadConfig.SUBDIRS.PAYMENT_PROOFS);

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, proofDir),
  filename: (req, file, cb) => {
    const { dateTimeForFilename, safeExt } = uploadConfig;
    const { date, time } = dateTimeForFilename();
    const ext = safeExt(file.originalname);
    cb(null, `BUKTI_${req.params.id}_${date}_${time}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/v1/invoices/:id/payment-proofs
 * Owner upload bukti bayar. Or role invoice (Saudi) issue bukti: body only, no file (payment_location: saudi).
 */
const create = [
  upload.single('proof_file'),
  asyncHandler(async (req, res) => {
    const invoice = await Invoice.findByPk(req.params.id);
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice tidak ditemukan' });
    if (invoice.owner_id !== req.user.id && !['invoice_koordinator', 'role_invoice_saudi', 'super_admin'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    const { payment_type, amount, bank_name, account_number, transfer_date, notes, payment_location } = req.body;
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) return res.status(400).json({ success: false, message: 'amount wajib dan harus > 0' });
    const type = ['dp', 'partial', 'full'].includes(payment_type) ? payment_type : 'dp';

    let fileUrl = null;
    if (req.file) {
      const finalName = uploadConfig.paymentProofFilename(invoice.invoice_number, type, amt, req.file.originalname);
      const oldPath = req.file.path;
      const newPath = path.join(proofDir, finalName);
      let savedName = req.file.filename;
      try {
        fs.renameSync(oldPath, newPath);
        savedName = finalName;
      } catch (e) {
        // jika rename gagal (misal cross-device), pakai nama file sementara
      }
      fileUrl = uploadConfig.toUrlPath(uploadConfig.SUBDIRS.PAYMENT_PROOFS, savedName);
    }
    const isIssueByInvoice = req.user.role === ROLES.ROLE_INVOICE_SAUDI && payment_location === 'saudi';
    if (!fileUrl && !isIssueByInvoice) return res.status(400).json({ success: false, message: 'File bukti bayar wajib atau gunakan payment_location=saudi untuk terbitkan bukti' });

    const proof = await PaymentProof.create({
      invoice_id: invoice.id,
      payment_type: type,
      amount: amt,
      bank_name: bank_name || null,
      account_number: account_number || null,
      transfer_date: transfer_date || null,
      proof_file_url: fileUrl || (isIssueByInvoice ? 'issued-saudi' : ''),
      uploaded_by: isIssueByInvoice ? null : req.user.id,
      issued_by: isIssueByInvoice ? req.user.id : null,
      payment_location: payment_location === 'saudi' ? 'saudi' : 'indonesia',
      notes
    });

    const full = await PaymentProof.findByPk(proof.id);
    res.status(201).json({ success: true, data: full });
  })
];

/**
 * GET /api/v1/invoices/:id/payment-proofs/:proofId/file
 * Stream file bukti bayar (untuk preview di popup; auth dipakai sehingga img/fetch bisa akses).
 */
const getFile = asyncHandler(async (req, res) => {
  const proof = await PaymentProof.findOne({
    where: { id: req.params.proofId, invoice_id: req.params.id }
  });
  if (!proof || !proof.proof_file_url || proof.proof_file_url === 'issued-saudi') {
    return res.status(404).json({ success: false, message: 'File tidak ditemukan' });
  }
  const invoice = await Invoice.findByPk(proof.invoice_id, { attributes: ['owner_id'] });
  const canAccess = invoice && (
    invoice.owner_id === req.user.id ||
    ['super_admin', 'admin_pusat', 'admin_koordinator', 'invoice_koordinator', 'role_invoice_saudi', 'role_invoice', 'invoice', 'role_accounting'].includes(req.user.role)
  );
  if (!canAccess) return res.status(403).json({ success: false, message: 'Akses ditolak' });
  const match = proof.proof_file_url.match(/\/uploads\/payment-proofs\/(.+)$/);
  if (!match) return res.status(404).json({ success: false, message: 'Path tidak valid' });
  const filePath = path.join(proofDir, match[1]);
  if (!fs.existsSync(filePath)) return res.status(404).json({ success: false, message: 'File tidak ada di server' });
  const ext = path.extname(filePath).toLowerCase();
  const mime = MIME_BY_EXT[ext] || 'application/octet-stream';
  res.setHeader('Content-Type', mime);
  res.setHeader('Cache-Control', 'private, max-age=3600');
  fs.createReadStream(filePath).pipe(res);
});

module.exports = { create, upload, getFile };