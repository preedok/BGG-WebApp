const asyncHandler = require('express-async-handler');
const { User, OwnerProfile, Branch } = require('../models');
const { ROLES, OWNER_STATUS } = require('../constants');
/**
 * POST /api/v1/owners/register
 * Calon Owner registrasi. Status: REGISTERED_PENDING_MOU
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone, company_name, address, operational_region, whatsapp, npwp } = req.body;

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
  }

  const user = await User.create({
    email: email.toLowerCase(),
    password_hash: password,
    name,
    phone,
    company_name,
    role: ROLES.OWNER,
    is_active: true
  });

  await OwnerProfile.create({
    user_id: user.id,
    status: OWNER_STATUS.REGISTERED_PENDING_MOU,
    address,
    operational_region,
    whatsapp: whatsapp || phone,
    npwp
  });

  const u = user.toJSON();
  delete u.password_hash;
  res.status(201).json({
    success: true,
    message: 'Registrasi berhasil. Silakan download MoU, tanda tangan, dan upload kembali.',
    data: { user: u, owner_status: OWNER_STATUS.REGISTERED_PENDING_MOU }
  });
});

/**
 * POST /api/v1/owners/upload-mou
 * Owner upload MoU yang sudah ditandatangani. Status: PENDING_MOU_APPROVAL
 */
const uploadMou = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const profile = await OwnerProfile.findOne({ where: { user_id: userId } });
  if (!profile) return res.status(404).json({ success: false, message: 'Profil owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.REGISTERED_PENDING_MOU) {
    return res.status(400).json({ success: false, message: 'Status tidak sesuai untuk upload MoU' });
  }

  const mou_signed_url = req.file ? req.file.path || req.file.filename : req.body.mou_signed_url;
  if (!mou_signed_url) return res.status(400).json({ success: false, message: 'File MoU wajib' });

  await profile.update({
    mou_signed_url,
    mou_uploaded_at: new Date(),
    status: OWNER_STATUS.PENDING_MOU_APPROVAL
  });

  res.json({
    success: true,
    message: 'MoU berhasil diupload. Menunggu verifikasi Admin Pusat.',
    data: { owner_status: profile.status }
  });
});

/**
 * GET /api/v1/owners/me
 */
const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await OwnerProfile.findOne({
    where: { user_id: req.user.id },
    include: [{ model: Branch, as: 'AssignedBranch', attributes: ['id', 'code', 'name'] }]
  });
  if (!profile) return res.status(404).json({ success: false, message: 'Profil tidak ditemukan' });
  res.json({ success: true, data: profile });
});

/**
 * GET /api/v1/owners (Admin Pusat / Super Admin)
 */
const list = asyncHandler(async (req, res) => {
  const { status, branch_id } = req.query;
  const where = {};
  if (status) where.status = status;
  const profiles = await OwnerProfile.findAll({
    where,
    include: [
      { model: User, as: 'User', attributes: ['id', 'email', 'name', 'phone', 'company_name'] },
      { model: Branch, as: 'AssignedBranch', attributes: ['id', 'code', 'name'] }
    ]
  });
  let list_ = profiles;
  if (branch_id) {
    list_ = profiles.filter(p => p.assigned_branch_id === branch_id);
  }
  res.json({ success: true, data: list_ });
});

/**
 * PATCH /api/v1/owners/:id/verify-mou (Admin Pusat)
 * Verifikasi MoU: approve -> PENDING_DEPOSIT_PAYMENT, reject -> kembali dengan alasan
 */
const verifyMou = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { approved, rejection_reason } = req.body;
  const profile = await OwnerProfile.findByPk(id, { include: [User] });
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.PENDING_MOU_APPROVAL) {
    return res.status(400).json({ success: false, message: 'Status tidak sesuai' });
  }

  if (approved === false) {
    await profile.update({
      status: OWNER_STATUS.REJECTED,
      mou_rejected_reason: rejection_reason
    });
    return res.json({ success: true, message: 'MoU ditolak', data: { owner_status: profile.status } });
  }

  await profile.update({ status: OWNER_STATUS.PENDING_DEPOSIT_PAYMENT });
  res.json({
    success: true,
    message: 'MoU disetujui. Owner dapat melakukan transfer deposit.',
    data: { owner_status: OWNER_STATUS.PENDING_DEPOSIT_PAYMENT }
  });
});

/**
 * PATCH /api/v1/owners/:id/verify-deposit (Admin Pusat)
 */
const verifyDeposit = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await OwnerProfile.findByPk(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.PENDING_DEPOSIT_VERIFICATION) {
    return res.status(400).json({ success: false, message: 'Status tidak sesuai' });
  }

  await profile.update({
    status: OWNER_STATUS.DEPOSIT_VERIFIED,
    deposit_verified_at: new Date(),
    deposit_verified_by: req.user.id
  });
  res.json({ success: true, message: 'Deposit terverifikasi', data: { owner_status: profile.status } });
});

/**
 * PATCH /api/v1/owners/:id/assign-branch (Admin Pusat)
 */
const assignBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { branch_id } = req.body;
  const profile = await OwnerProfile.findByPk(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.DEPOSIT_VERIFIED) {
    return res.status(400).json({ success: false, message: 'Deposit harus terverifikasi dulu' });
  }

  const branch = await Branch.findByPk(branch_id);
  if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });

  await User.update({ branch_id }, { where: { id: profile.user_id } });
  await profile.update({
    assigned_branch_id: branch_id,
    assigned_at: new Date(),
    status: OWNER_STATUS.ASSIGNED_TO_BRANCH
  });
  res.json({ success: true, message: 'Cabang berhasil ditetapkan', data: { owner_status: OWNER_STATUS.ASSIGNED_TO_BRANCH } });
});

/**
 * PATCH /api/v1/owners/:id/activate (Admin Cabang)
 */
const activate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await OwnerProfile.findByPk(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.ASSIGNED_TO_BRANCH) {
    return res.status(400).json({ success: false, message: 'Owner harus sudah ditetapkan ke cabang' });
  }
  if (profile.assigned_branch_id !== req.user.branch_id && req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN_PUSAT) {
    return res.status(403).json({ success: false, message: 'Bukan cabang Anda' });
  }

  await profile.update({
    status: OWNER_STATUS.ACTIVE,
    activated_at: new Date(),
    activated_by: req.user.id
  });
  res.json({ success: true, message: 'Owner berhasil diaktifkan', data: { owner_status: OWNER_STATUS.ACTIVE } });
});

module.exports = {
  register,
  uploadMou,
  getMyProfile,
  list,
  verifyMou,
  verifyDeposit,
  assignBranch,
  activate
};
