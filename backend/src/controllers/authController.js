const asyncHandler = require('express-async-handler');
const { User, OwnerProfile } = require('../models');
const { signToken } = require('../middleware/auth');
const { ROLES } = require('../constants');
const logger = require('../config/logger');

/**
 * POST /api/v1/auth/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email dan password wajib' });
  }

  let user;
  try {
    user = await User.findOne({
      where: { email: email.toLowerCase() },
      include: [{ model: require('../models').Branch, as: 'Branch', attributes: ['id', 'code', 'name'] }]
    });
  } catch (err) {
    const dbMessage = (err && err.original && err.original.message) ? err.original.message : (err && err.message) ? String(err.message) : String(err);
    logger.error('Login DB error:', dbMessage);
    return res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Kesalahan server' : dbMessage
    });
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Email tidak ditemukan' });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    return res.status(401).json({ success: false, message: 'Password salah' });
  }

  if (!user.is_active) {
    return res.status(403).json({ success: false, message: 'Akun tidak aktif' });
  }

  if (user.role === ROLES.OWNER) {
    const profile = await OwnerProfile.findOne({ where: { user_id: user.id } });
    if (profile && profile.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Akun Owner belum aktif. Selesaikan proses registrasi dan approval.',
        owner_status: profile.status
      });
    }
  }

  await user.update({ last_login_at: new Date() });

  const token = signToken(user.id, user.email, user.role);
  const u = user.toJSON();
  delete u.password_hash;

  res.json({
    success: true,
    message: 'Login berhasil',
    data: {
      user: {
        ...u,
        branch_name: user.Branch ? user.Branch.name : null
      },
      token
    }
  });
});

/**
 * GET /api/v1/auth/me
 */
const me = asyncHandler(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] },
    include: [
      { model: require('../models').Branch, as: 'Branch', attributes: ['id', 'code', 'name', 'city'] }
    ]
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
  }
  const u = user.toJSON();
  if (user.role === ROLES.OWNER) {
    const profile = await OwnerProfile.findOne({ where: { user_id: user.id } });
    u.owner_status = profile ? profile.status : null;
    u.has_special_price = profile ? profile.has_special_price : false;
  }
  res.json({ success: true, data: u });
});

module.exports = { login, me };
