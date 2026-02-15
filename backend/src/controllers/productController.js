const asyncHandler = require('express-async-handler');
const { Op } = require('sequelize');
const { Product, ProductPrice, Branch, User } = require('../models');
const { ROLES } = require('../constants');

/**
 * Resolve effective price: special owner > branch > general (pusat).
 */
async function getEffectivePrice(productId, branchId, ownerId, meta = {}, currency = 'IDR') {
  const today = new Date().toISOString().slice(0, 10);
  const where = { product_id: productId, currency };
  const effectiveWhere = {
    [Op.or]: [{ effective_from: null }, { effective_from: { [Op.lte]: today } }],
    [Op.or]: [{ effective_until: null }, { effective_until: { [Op.gte]: today } }]
  };

  let special = null;
  let branch = null;
  let general = null;

  if (ownerId) {
    special = await ProductPrice.findOne({
      where: { ...where, owner_id: ownerId, branch_id: branchId, ...effectiveWhere },
      order: [['created_at', 'DESC']]
    });
  }
  if (branchId) {
    branch = await ProductPrice.findOne({
      where: { ...where, branch_id: branchId, owner_id: null, ...effectiveWhere },
      order: [['created_at', 'DESC']]
    });
  }
  general = await ProductPrice.findOne({
    where: { ...where, branch_id: null, owner_id: null, ...effectiveWhere },
    order: [['created_at', 'DESC']]
  });

  const price = special || branch || general;
  return price ? parseFloat(price.amount) : null;
}

/**
 * GET /api/v1/products
 * List products (with optional prices for branch/owner). For invoice: show general + branch prices.
 */
const list = asyncHandler(async (req, res) => {
  const { type, branch_id, owner_id, with_prices, is_package } = req.query;
  const where = { is_active: true };
  if (type) where.type = type;
  if (is_package === 'true' || is_package === '1') where.is_package = true;

  const products = await Product.findAll({
    where,
    order: [['type', 'ASC'], ['code', 'ASC']],
    include: with_prices === 'true' ? [{ model: ProductPrice, as: 'ProductPrices', required: false }] : []
  });

  if (with_prices === 'true') {
    const bid = branch_id || req.user?.branch_id || null;
    const oid = owner_id || null;
    const result = products.map(p => {
      const prices = p.ProductPrices || [];
      const general = prices.find(pr => !pr.branch_id && !pr.owner_id);
      const branch = bid ? prices.find(pr => pr.branch_id === bid && !pr.owner_id) : null;
      const special = oid ? prices.find(pr => pr.owner_id === oid) : null;
      return {
        ...p.toJSON(),
        price_general: general ? parseFloat(general.amount) : null,
        price_branch: branch ? parseFloat(branch.amount) : null,
        price_special: special ? parseFloat(special.amount) : null,
        currency: general?.currency || branch?.currency || 'IDR'
      };
    });
    return res.json({ success: true, data: result });
  }

  res.json({ success: true, data: products });
});

/**
 * GET /api/v1/products/:id
 */
const getById = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id, {
    include: [{ model: ProductPrice, as: 'ProductPrices' }]
  });
  if (!product) return res.status(404).json({ success: false, message: 'Product tidak ditemukan' });
  res.json({ success: true, data: product });
});

/**
 * GET /api/v1/products/:id/price
 * Effective price for branch + owner (for order form).
 */
const getPrice = asyncHandler(async (req, res) => {
  const { branch_id, owner_id, currency } = req.query;
  const branchId = branch_id || req.user?.branch_id;
  const ownerId = owner_id || null;
  const amount = await getEffectivePrice(req.params.id, branchId, ownerId, {}, currency || 'IDR');
  if (amount == null) return res.status(404).json({ success: false, message: 'Harga tidak ditemukan' });
  res.json({ success: true, data: { amount, currency: currency || 'IDR' } });
});

/**
 * POST /api/v1/products - admin pusat only
 */
const create = asyncHandler(async (req, res) => {
  const { type, code, name, description, is_package, meta } = req.body;
  if (!type || !code || !name) return res.status(400).json({ success: false, message: 'type, code, name wajib' });
  const product = await Product.create({
    type, code, name,
    description: description || null,
    is_package: !!is_package,
    meta: meta || {},
    created_by: req.user.id
  });
  res.status(201).json({ success: true, data: product });
});

/**
 * PATCH /api/v1/products/:id - admin pusat / admin cabang
 */
const update = asyncHandler(async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product tidak ditemukan' });
  const { code, name, description, is_package, meta, is_active } = req.body;
  if (code !== undefined) product.code = code;
  if (name !== undefined) product.name = name;
  if (description !== undefined) product.description = description;
  if (is_package !== undefined) product.is_package = is_package;
  if (meta !== undefined) product.meta = meta;
  if (is_active !== undefined) product.is_active = is_active;
  await product.save();
  res.json({ success: true, data: product });
});

/**
 * GET /api/v1/products/prices
 * List prices (general + branch for current user branch, or all for pusat).
 */
const listPrices = asyncHandler(async (req, res) => {
  const { product_id, branch_id, owner_id } = req.query;
  const where = {};
  if (product_id) where.product_id = product_id;
  const branchId = branch_id || (req.user.role !== ROLES.SUPER_ADMIN && req.user.role !== ROLES.ADMIN_PUSAT ? req.user.branch_id : null);
  if (branchId) where[Op.or] = [{ branch_id: branchId }, { branch_id: null }];
  else where.branch_id = null;

  const prices = await ProductPrice.findAll({
    where,
    include: [
      { model: Product, attributes: ['id', 'code', 'name', 'type'] },
      { model: Branch, as: 'Branch', attributes: ['id', 'code', 'name'] },
      { model: User, as: 'Owner', attributes: ['id', 'name', 'email'], foreignKey: 'owner_id' }
    ],
    order: [['product_id', 'ASC'], ['branch_id', 'ASC'], ['owner_id', 'ASC']]
  });
  res.json({ success: true, data: prices });
});

/**
 * POST /api/v1/products/prices
 * Create price: general (pusat, branch_id null), branch (admin cabang), or special owner (role invoice).
 */
const createPrice = asyncHandler(async (req, res) => {
  const { product_id, branch_id, owner_id, currency, amount, meta, effective_from, effective_until } = req.body;
  if (!product_id || amount == null) return res.status(400).json({ success: false, message: 'product_id dan amount wajib' });

  const canSetBranch = [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG].includes(req.user.role);
  const canSetOwner = [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG, ROLES.ROLE_INVOICE].includes(req.user.role);

  let finalBranchId = branch_id || null;
  let finalOwnerId = owner_id || null;

  if (finalBranchId && !canSetBranch) finalBranchId = null;
  if (finalOwnerId && !canSetOwner) finalOwnerId = null;
  if (req.user.role === ROLES.ADMIN_CABANG && finalBranchId !== req.user.branch_id) finalBranchId = req.user.branch_id;
  if (req.user.role === ROLES.ROLE_INVOICE && finalBranchId !== req.user.branch_id) finalBranchId = req.user.branch_id;

  const price = await ProductPrice.create({
    product_id,
    branch_id: finalBranchId,
    owner_id: finalOwnerId,
    currency: currency || 'IDR',
    amount,
    meta: meta || {},
    effective_from: effective_from || null,
    effective_until: effective_until || null,
    created_by: req.user.id
  });
  const full = await ProductPrice.findByPk(price.id, { include: [{ model: Product, attributes: ['id', 'code', 'name'] }] });
  res.status(201).json({ success: true, data: full });
});

/**
 * PATCH /api/v1/products/prices/:id
 */
const updatePrice = asyncHandler(async (req, res) => {
  const price = await ProductPrice.findByPk(req.params.id);
  if (!price) return res.status(404).json({ success: false, message: 'Price tidak ditemukan' });
  const { amount, effective_from, effective_until } = req.body;
  if (amount !== undefined) price.amount = amount;
  if (effective_from !== undefined) price.effective_from = effective_from;
  if (effective_until !== undefined) price.effective_until = effective_until;
  await price.save();
  res.json({ success: true, data: price });
});

module.exports = {
  list,
  getById,
  getPrice,
  create,
  update,
  listPrices,
  createPrice,
  updatePrice,
  getEffectivePrice
};
