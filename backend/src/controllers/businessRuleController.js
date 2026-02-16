const asyncHandler = require('express-async-handler');
const { BusinessRuleConfig, Branch } = require('../models');
const { ROLES } = require('../constants');
const { BUSINESS_RULES, BUSINESS_RULE_KEYS } = require('../constants');

const DEFAULTS = {
  [BUSINESS_RULE_KEYS.BUS_MIN_PACK]: BUSINESS_RULES.BUS_MIN_PACK,
  [BUSINESS_RULE_KEYS.BUS_PENALTY_IDR]: 500000,
  [BUSINESS_RULE_KEYS.HANDLING_DEFAULT_SAR]: 100,
  [BUSINESS_RULE_KEYS.REQUIRE_HOTEL_WITH_VISA]: true,
  [BUSINESS_RULE_KEYS.DP_GRACE_HOURS]: BUSINESS_RULES.DP_GRACE_HOURS,
  [BUSINESS_RULE_KEYS.DP_DUE_DAYS]: BUSINESS_RULES.DP_DUE_DAYS,
  [BUSINESS_RULE_KEYS.CURRENCY_RATES]: JSON.stringify({ SAR_TO_IDR: 4200, USD_TO_IDR: 15500, IDR_TO_SAR: 0.000238 }),
  [BUSINESS_RULE_KEYS.REGISTRATION_DEPOSIT_IDR]: BUSINESS_RULES.REGISTRATION_DEPOSIT_IDR,
  [BUSINESS_RULE_KEYS.COMPANY_NAME]: 'Bintang Global Group',
  [BUSINESS_RULE_KEYS.COMPANY_ADDRESS]: 'Jl. Gatot Subroto No. 123, Jakarta Selatan',
  [BUSINESS_RULE_KEYS.NOTIFICATION_ORDER]: 'true',
  [BUSINESS_RULE_KEYS.NOTIFICATION_PAYMENT]: 'true',
  [BUSINESS_RULE_KEYS.NOTIFICATION_INVOICE]: 'true',
  [BUSINESS_RULE_KEYS.VISA_DEFAULT_IDR]: 0,
  [BUSINESS_RULE_KEYS.TICKET_DEFAULT_IDR]: 0,
  [BUSINESS_RULE_KEYS.TICKET_GENERAL_IDR]: 0,
  [BUSINESS_RULE_KEYS.TICKET_LION_IDR]: 0,
  [BUSINESS_RULE_KEYS.TICKET_SUPER_AIR_JET_IDR]: 0,
  [BUSINESS_RULE_KEYS.TICKET_GARUDA_IDR]: 0
};

/**
 * GET /api/v1/business-rules
 * Get rules: global + branch override (for current user branch or query branch_id).
 */
const get = asyncHandler(async (req, res) => {
  const branchId = req.query.branch_id || (req.user.branch_id || null);
  const global = await BusinessRuleConfig.findAll({ where: { branch_id: null }, raw: true });
  let branch = [];
  if (branchId) {
    branch = await BusinessRuleConfig.findAll({ where: { branch_id: branchId }, raw: true });
  }
  const globalMap = {};
  global.forEach(r => { globalMap[r.key] = r.value; });
  const branchMap = {};
  branch.forEach(r => { branchMap[r.key] = r.value });

  const result = {};
  Object.keys(DEFAULTS).forEach(key => {
    let val = branchMap[key] ?? globalMap[key] ?? DEFAULTS[key];
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
      try { val = JSON.parse(val); } catch (e) {}
    } else if (['bus_min_pack', 'dp_grace_hours', 'dp_due_days', 'registration_deposit_idr'].includes(key)) val = parseInt(val, 10);
    else if (['bus_penalty_idr', 'handling_default_sar', 'visa_default_idr', 'ticket_default_idr', 'ticket_general_idr', 'ticket_lion_idr', 'ticket_super_air_jet_idr', 'ticket_garuda_idr'].includes(key)) val = parseFloat(val);
    else if (key === 'require_hotel_with_visa') val = val === 'true' || val === true;
    result[key] = val;
  });
  res.json({ success: true, data: result });
});

/**
 * PUT /api/v1/business-rules
 * Set one or more rules. Pusat: branch_id null. Cabang: branch_id = their branch.
 */
const set = asyncHandler(async (req, res) => {
  const { branch_id, rules } = req.body;
  const canSetGlobal = [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT].includes(req.user.role);
  const canSetBranch = [ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_CABANG].includes(req.user.role);
  const finalBranchId = branch_id ?? (req.user.role === ROLES.ADMIN_CABANG ? req.user.branch_id : null);
  if (finalBranchId && !canSetBranch) return res.status(403).json({ success: false, message: 'Tidak boleh set rule cabang' });
  if (!finalBranchId && !canSetGlobal) return res.status(403).json({ success: false, message: 'Hanya pusat yang boleh set rule global' });

  const validKeys = Object.values(BUSINESS_RULE_KEYS);
  for (const [key, value] of Object.entries(rules || {})) {
    if (!validKeys.includes(key)) continue;
    const val = typeof value === 'object' ? JSON.stringify(value) : String(value);
    const [row] = await BusinessRuleConfig.findOrCreate({
      where: { key, branch_id: finalBranchId },
      defaults: { value: val, updated_by: req.user.id }
    });
    await row.update({ value: val, updated_by: req.user.id });
  }
  const updated = await BusinessRuleConfig.findAll({ where: { branch_id: finalBranchId }, raw: true });
  const result = {};
  updated.forEach(r => { result[r.key] = r.value; });
  res.json({ success: true, data: result });
});

/**
 * Helper: get resolved rules for a branch (for use in order/invoice logic).
 */
async function getRulesForBranch(branchId) {
  const global = await BusinessRuleConfig.findAll({ where: { branch_id: null }, raw: true });
  let branch = [];
  if (branchId) branch = await BusinessRuleConfig.findAll({ where: { branch_id: branchId }, raw: true });
  const globalMap = {};
  global.forEach(r => { globalMap[r.key] = r.value; });
  const branchMap = {};
  branch.forEach(r => { branchMap[r.key] = r.value });
  const result = {};
  Object.keys(DEFAULTS).forEach(key => {
    let val = branchMap[key] ?? globalMap[key] ?? DEFAULTS[key];
    if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) { try { val = JSON.parse(val); } catch (e) {} }
    else if (['bus_min_pack', 'dp_grace_hours', 'dp_due_days', 'registration_deposit_idr'].includes(key)) val = parseInt(val, 10);
    else if (['bus_penalty_idr', 'handling_default_sar', 'visa_default_idr', 'ticket_default_idr', 'ticket_general_idr', 'ticket_lion_idr', 'ticket_super_air_jet_idr', 'ticket_garuda_idr'].includes(key)) val = parseFloat(val);
    else if (key === 'require_hotel_with_visa') val = val === 'true' || val === true;
    result[key] = val;
  });
  return result;
}

module.exports = { get, set, DEFAULTS, getRulesForBranch };
