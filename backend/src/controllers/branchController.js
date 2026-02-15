const asyncHandler = require('express-async-handler');
const { Branch, User } = require('../models');
const { ROLES } = require('../constants');

const list = asyncHandler(async (req, res) => {
  const branches = await Branch.findAll({
    where: { is_active: true },
    order: [['code', 'ASC']]
  });
  res.json({ success: true, data: branches });
});

const getById = asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);
  if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
  res.json({ success: true, data: branch });
});

const create = asyncHandler(async (req, res) => {
  const { code, name, city, region, manager_name, phone, email, address, create_admin_account } = req.body;
  const branch = await Branch.create({
    code,
    name,
    city,
    region,
    manager_name,
    phone,
    email,
    address
  });

  let adminUser = null;
  if (create_admin_account && typeof create_admin_account === 'object') {
    const { name: accName, email: accEmail, password: accPassword } = create_admin_account;
    if (accName && accEmail && accPassword) {
      const existing = await User.findOne({ where: { email: accEmail.toLowerCase() } });
      if (existing) {
        await branch.destroy();
        return res.status(400).json({ success: false, message: 'Email untuk akun admin cabang sudah terdaftar' });
      }
      adminUser = await User.create({
        email: accEmail.toLowerCase(),
        password_hash: accPassword,
        name: accName,
        role: ROLES.ADMIN_CABANG,
        branch_id: branch.id,
        is_active: true
      });
      adminUser = adminUser.toJSON();
      delete adminUser.password_hash;
    }
  }

  const data = branch.toJSON();
  if (adminUser) data.created_admin_account = adminUser;
  res.status(201).json({ success: true, data, message: adminUser ? 'Cabang dan akun admin cabang berhasil dibuat' : 'Cabang berhasil dibuat' });
});

const update = asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);
  if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
  await branch.update(req.body);
  res.json({ success: true, data: branch });
});

module.exports = { list, getById, create, update };
