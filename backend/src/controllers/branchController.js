const asyncHandler = require('express-async-handler');
const { Branch } = require('../models');

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
  const { code, name, city, region, manager_name, phone, email, address } = req.body;
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
  res.status(201).json({ success: true, data: branch });
});

const update = asyncHandler(async (req, res) => {
  const branch = await Branch.findByPk(req.params.id);
  if (!branch) return res.status(404).json({ success: false, message: 'Cabang tidak ditemukan' });
  await branch.update(req.body);
  res.json({ success: true, data: branch });
});

module.exports = { list, getById, create, update };
