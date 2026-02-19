const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { User, OwnerProfile, Branch } = require('../models');
const { ROLES, OWNER_STATUS } = require('../constants');
const { getBranchIdsForWilayah } = require('../utils/wilayahScope');

const KOORDINATOR_ROLES = [ROLES.ADMIN_KOORDINATOR, ROLES.INVOICE_KOORDINATOR, ROLES.TIKET_KOORDINATOR, ROLES.VISA_KOORDINATOR];
function isKoordinatorRole(role) {
  return KOORDINATOR_ROLES.includes(role);
}
const uploadConfig = require('../config/uploads');
/**
 * POST /api/v1/owners/register
 * Calon Owner registrasi. Status: REGISTERED_PENDING_MOU
 */
const register = asyncHandler(async (req, res) => {
  const { email, password, name, phone, company_name, address, operational_region, whatsapp, npwp, preferred_branch_id } = req.body;

  const existing = await User.findOne({ where: { email: email.toLowerCase() } });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
  }

  let operationalRegion = operational_region;
  if (preferred_branch_id) {
    const branch = await Branch.findByPk(preferred_branch_id);
    if (branch) operationalRegion = branch.region || operationalRegion;
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
    operational_region: operationalRegion,
    preferred_branch_id: preferred_branch_id || null,
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

  const mou_signed_url = req.file
    ? uploadConfig.toUrlPath(uploadConfig.SUBDIRS.MOU, req.file.filename)
    : req.body.mou_signed_url;
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
 * GET /api/v1/owners/:id (detail owner untuk Admin/Koordinator)
 */
const getById = asyncHandler(async (req, res) => {
  const profile = await OwnerProfile.findByPk(req.params.id, {
    include: [
      { model: User, as: 'User', attributes: ['id', 'email', 'name', 'phone', 'company_name'] },
      { model: Branch, as: 'PreferredBranch', attributes: ['id', 'code', 'name', 'region'], required: false },
      { model: Branch, as: 'AssignedBranch', attributes: ['id', 'code', 'name'], required: false }
    ]
  });
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  const isKoordinator = isKoordinatorRole(req.user.role);
  if (isKoordinator && req.user.wilayah_id) {
    const branchIds = await getBranchIdsForWilayah(req.user.wilayah_id);
    const allowed = (profile.assigned_branch_id && branchIds.includes(profile.assigned_branch_id)) || profile.status === OWNER_STATUS.DEPOSIT_VERIFIED;
    if (!allowed) return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  res.json({ success: true, data: profile });
});

/**
 * GET /api/v1/owners (Admin Pusat / Super Admin / Koordinator / Accounting)
 * Query: status, branch_id, wilayah_id, search (q), page, limit.
 * Koordinator: hanya owner yang assigned ke cabang di wilayah mereka, atau DEPOSIT_VERIFIED.
 */
const list = asyncHandler(async (req, res) => {
  const { status, branch_id, wilayah_id: queryWilayahId, q: search, page = 1, limit = 50 } = req.query;
  const where = {};
  if (status) where.status = status;

  const isKoordinator = isKoordinatorRole(req.user.role);
  const userWilayahId = req.user.wilayah_id;
  let branchIdsWilayah = null;
  if (isKoordinator && userWilayahId) {
    branchIdsWilayah = await getBranchIdsForWilayah(userWilayahId);
  } else if (queryWilayahId) {
    branchIdsWilayah = await getBranchIdsForWilayah(queryWilayahId);
  }

  if (branch_id) where.assigned_branch_id = branch_id;
  else if (queryWilayahId && branchIdsWilayah && branchIdsWilayah.length > 0) {
    where[Op.or] = [
      { assigned_branch_id: { [Op.in]: branchIdsWilayah } },
      { status: OWNER_STATUS.DEPOSIT_VERIFIED }
    ];
  } else if (isKoordinator && userWilayahId && branchIdsWilayah && branchIdsWilayah.length > 0) {
    where[Op.or] = [
      { assigned_branch_id: { [Op.in]: branchIdsWilayah } },
      { status: OWNER_STATUS.DEPOSIT_VERIFIED }
    ];
  }

  const userWhere = {};
  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    userWhere[Op.or] = [
      { name: { [Op.iLike]: term } },
      { company_name: { [Op.iLike]: term } },
      { email: { [Op.iLike]: term } }
    ];
  }

  const includeUser = {
    model: User,
    as: 'User',
    attributes: ['id', 'email', 'name', 'phone', 'company_name'],
    required: Object.keys(userWhere).length > 0,
    where: Object.keys(userWhere).length > 0 ? userWhere : undefined
  };
  const includePreferred = { model: Branch, as: 'PreferredBranch', attributes: ['id', 'code', 'name', 'region'], required: false };
  const includeAssigned = { model: Branch, as: 'AssignedBranch', attributes: ['id', 'code', 'name'], required: false };

  const lim = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 200);
  const pg = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (pg - 1) * lim;

  const { count, rows } = await OwnerProfile.findAndCountAll({
    where,
    include: [includeUser, includePreferred, includeAssigned],
    limit: lim,
    offset,
    order: [['created_at', 'DESC']],
    distinct: true
  });

  res.json({ success: true, data: rows, total: count, page: pg, limit: lim });
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
 * PATCH /api/v1/owners/:id/verify-deposit (Admin Pusat / Admin Cabang)
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
 * PATCH /api/v1/owners/:id/assign-branch (Admin Pusat / Admin Koordinator hanya ke cabang di wilayah)
 */
const assignBranch = asyncHandler(async (req, res) => {
  const { id } = req.params;
  let { branch_id } = req.body;
  const profile = await OwnerProfile.findByPk(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.DEPOSIT_VERIFIED) {
    return res.status(400).json({ success: false, message: 'Deposit harus terverifikasi dulu' });
  }

  const branch = await Branch.findByPk(branch_id);
  if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
  if (isKoordinatorRole(req.user.role)) {
    const branchIds = await getBranchIdsForWilayah(req.user.wilayah_id);
    if (!branchIds.includes(branch_id)) return res.status(403).json({ success: false, message: 'Hanya dapat menetapkan ke cabang di wilayah Anda' });
  }

  await User.update({ branch_id }, { where: { id: profile.user_id } });
  await profile.update({
    assigned_branch_id: branch_id,
    assigned_at: new Date(),
    status: OWNER_STATUS.ASSIGNED_TO_BRANCH
  });
  res.json({ success: true, message: 'Cabang berhasil ditetapkan', data: { owner_status: OWNER_STATUS.ASSIGNED_TO_BRANCH } });
});

/**
 * PATCH /api/v1/owners/:id/activate (Admin Pusat / Admin Koordinator wilayah)
 * Koordinator hanya bisa aktivasi owner yang assigned_branch ada di wilayah mereka.
 */
const activate = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const profile = await OwnerProfile.findByPk(id);
  if (!profile) return res.status(404).json({ success: false, message: 'Owner tidak ditemukan' });
  if (profile.status !== OWNER_STATUS.ASSIGNED_TO_BRANCH) {
    return res.status(400).json({ success: false, message: 'Owner harus sudah ditetapkan ke cabang' });
  }
  if (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN_PUSAT) {
    if (isKoordinatorRole(req.user.role)) {
      const branchIds = await getBranchIdsForWilayah(req.user.wilayah_id);
      if (!profile.assigned_branch_id || !branchIds.includes(profile.assigned_branch_id)) {
        return res.status(403).json({ success: false, message: 'Owner ini bukan di wilayah Anda. Hanya koordinator wilayah yang sesuai yang dapat mengaktifkan.' });
      }
    } else if (profile.assigned_branch_id !== req.user.branch_id) {
      return res.status(403).json({ success: false, message: 'Bukan cabang Anda' });
    }
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
  getById,
  verifyMou,
  verifyDeposit,
  assignBranch,
  activate
};
