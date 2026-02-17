'use strict';

/**
 * Workflow Koordinator: Hapus user lama (kecuali super_admin & owner), buat user baru per wilayah + Saudi.
 * - Satu admin_pusat
 * - Per wilayah: admin_koordinator, invoice_koordinator, tiket_koordinator, visa_koordinator
 * - Saudi: role_hotel, role_bus, role_invoice_saudi (tanpa wilayah)
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES } = require('../constants');

const DEFAULT_PASSWORD = 'Password123';
const uuid = () => crypto.randomUUID();
const slug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

module.exports = {
  async up(queryInterface, Sequelize) {
    const q = queryInterface.sequelize;
    const now = new Date();
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // Hapus user yang bukan super_admin dan bukan owner (hapus staff/koordinator lama)
    await q.query(`
      DELETE FROM users
      WHERE role IN (
        'admin_pusat', 'admin_cabang', 'admin_provinsi', 'admin_wilayah',
        'role_invoice', 'role_ticket', 'role_visa', 'role_hotel', 'role_bus',
        'role_accounting', 'admin_koordinator', 'invoice_koordinator',
        'tiket_koordinator', 'visa_koordinator', 'role_invoice_saudi'
      )
    `).catch(() => {});

    const [wilayahRows] = await q.query(`SELECT id, name FROM wilayah ORDER BY name`);
    const wilayahList = Array.isArray(wilayahRows) ? wilayahRows : [];

    const usersToInsert = [];

    // 1) Admin Pusat (jika belum ada)
    const [[ap]] = await q.query(`SELECT id FROM users WHERE role = 'admin_pusat' LIMIT 1`);
    if (!ap) {
      usersToInsert.push({
        id: uuid(),
        email: 'adminpusat@bintangglobal.com',
        password_hash: hash,
        name: 'Admin Pusat',
        role: ROLES.ADMIN_PUSAT,
        branch_id: null,
        wilayah_id: null,
        is_active: true,
        created_at: now,
        updated_at: now
      });
    }

    // 2) Per wilayah: 4 koordinator
    for (const w of wilayahList) {
      const wid = w.id;
      const wName = w.name || '';
      const pre = slug(wName).slice(0, 12) || 'wilayah';
      usersToInsert.push(
        { id: uuid(), email: `admin-koord.${pre}@bintangglobal.com`, password_hash: hash, name: `Admin Koordinator ${wName}`, role: ROLES.ADMIN_KOORDINATOR, branch_id: null, wilayah_id: wid, is_active: true, created_at: now, updated_at: now },
        { id: uuid(), email: `invoice-koord.${pre}@bintangglobal.com`, password_hash: hash, name: `Invoice Koordinator ${wName}`, role: ROLES.INVOICE_KOORDINATOR, branch_id: null, wilayah_id: wid, is_active: true, created_at: now, updated_at: now },
        { id: uuid(), email: `tiket-koord.${pre}@bintangglobal.com`, password_hash: hash, name: `Tiket Koordinator ${wName}`, role: ROLES.TIKET_KOORDINATOR, branch_id: null, wilayah_id: wid, is_active: true, created_at: now, updated_at: now },
        { id: uuid(), email: `visa-koord.${pre}@bintangglobal.com`, password_hash: hash, name: `Visa Koordinator ${wName}`, role: ROLES.VISA_KOORDINATOR, branch_id: null, wilayah_id: wid, is_active: true, created_at: now, updated_at: now }
      );
    }

    // 3) Saudi: hotel, bus, invoice saudi
    const [[hasHotel]] = await q.query(`SELECT id FROM users WHERE role = 'role_hotel' LIMIT 1`);
    if (!hasHotel) usersToInsert.push({ id: uuid(), email: 'hotel.saudi@bintangglobal.com', password_hash: hash, name: 'Hotel Saudi Arabia', role: ROLES.ROLE_HOTEL, branch_id: null, wilayah_id: null, is_active: true, created_at: now, updated_at: now });
    const [[hasBus]] = await q.query(`SELECT id FROM users WHERE role = 'role_bus' LIMIT 1`);
    if (!hasBus) usersToInsert.push({ id: uuid(), email: 'bus.saudi@bintangglobal.com', password_hash: hash, name: 'Bus Saudi Arabia', role: ROLES.ROLE_BUS, branch_id: null, wilayah_id: null, is_active: true, created_at: now, updated_at: now });
    const [[hasInvSaudi]] = await q.query(`SELECT id FROM users WHERE role = 'role_invoice_saudi' LIMIT 1`);
    if (!hasInvSaudi) usersToInsert.push({ id: uuid(), email: 'invoice.saudi@bintangglobal.com', password_hash: hash, name: 'Invoice Saudi Arabia', role: ROLES.ROLE_INVOICE_SAUDI, branch_id: null, wilayah_id: null, is_active: true, created_at: now, updated_at: now });

    // 4) Accounting (satu di pusat) jika belum ada
    const [[hasAcc]] = await q.query(`SELECT id FROM users WHERE role = 'role_accounting' LIMIT 1`);
    if (!hasAcc) usersToInsert.push({ id: uuid(), email: 'accounting@bintangglobal.com', password_hash: hash, name: 'Accounting Pusat', role: ROLES.ROLE_ACCOUNTING, branch_id: null, wilayah_id: null, is_active: true, created_at: now, updated_at: now });

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('users', usersToInsert).catch(e => console.warn('[seed workflow-koordinator-users]', e.message));
    }
  },

  async down(queryInterface, Sequelize) {
    const q = queryInterface.sequelize;
    await q.query(`
      DELETE FROM users
      WHERE role IN (
        'admin_koordinator', 'invoice_koordinator', 'tiket_koordinator', 'visa_koordinator',
        'role_invoice_saudi'
      )
    `).catch(() => {});
  }
};
