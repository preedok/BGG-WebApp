'use strict';

const bcrypt = require('bcryptjs');
const { ROLES, OWNER_STATUS } = require('../constants');

const DEFAULT_PASSWORD = 'Password123';
const BRANCH_JKT = 'a0000000-0000-0000-0000-000000000001';
const BRANCH_SBY = 'a0000000-0000-0000-0000-000000000002';
const BRANCH_BDG = 'a0000000-0000-0000-0000-000000000003';

const logErr = (label, err) => { console.warn(`[seed demo-data] ${label}:`, err.message); };

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    // 3 cabang: Jakarta, Surabaya, Bandung (untuk testing semua role)
    await queryInterface.bulkInsert('branches', [
      { id: BRANCH_JKT, code: 'JKT', name: 'Kantor Pusat Jakarta', city: 'Jakarta', region: 'DKI Jakarta', manager_name: 'Manager Pusat', phone: '+62 21 8094 5678', email: 'pusat@bintangglobal.com', address: 'Jl. Sudirman No. 1', is_active: true, created_at: now, updated_at: now },
      { id: BRANCH_SBY, code: 'SBY', name: 'Cabang Surabaya', city: 'Surabaya', region: 'Jawa Timur', manager_name: 'Manager Surabaya', phone: '+62 31 5687 4321', email: 'surabaya@bintangglobal.com', address: 'Jl. HR Muhammad No. 10', is_active: true, created_at: now, updated_at: now },
      { id: BRANCH_BDG, code: 'BDG', name: 'Cabang Bandung', city: 'Bandung', region: 'Jawa Barat', manager_name: 'Manager Bandung', phone: '+62 22 1234 5678', email: 'bandung@bintangglobal.com', address: 'Jl. Dago No. 5', is_active: true, created_at: now, updated_at: now }
    ]).catch(e => logErr('branches', e));

    // Semua role + 3 owner (minimal 3 contoh untuk testing)
    const users = [
      { id: 'b0000000-0000-0000-0000-000000000001', email: 'superadmin@bintangglobal.com', name: 'Super Admin', role: ROLES.SUPER_ADMIN, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000002', email: 'adminpusat@bintangglobal.com', name: 'Admin Pusat', role: ROLES.ADMIN_PUSAT, branch_id: null },
      { id: 'b0000000-0000-0000-0000-000000000003', email: 'admincabang.jkt@bintangglobal.com', name: 'Admin Cabang Jakarta', role: ROLES.ADMIN_CABANG, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000004', email: 'admincabang.sby@bintangglobal.com', name: 'Admin Cabang Surabaya', role: ROLES.ADMIN_CABANG, branch_id: BRANCH_SBY },
      { id: 'b0000000-0000-0000-0000-000000000014', email: 'admincabang.bdg@bintangglobal.com', name: 'Admin Cabang Bandung', role: ROLES.ADMIN_CABANG, branch_id: BRANCH_BDG },
      { id: 'b0000000-0000-0000-0000-000000000005', email: 'invoice@bintangglobal.com', name: 'Staff Invoice', role: ROLES.ROLE_INVOICE, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000006', email: 'hotel@bintangglobal.com', name: 'Staff Hotel', role: ROLES.ROLE_HOTEL, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000007', email: 'visa@bintangglobal.com', name: 'Staff Visa', role: ROLES.ROLE_VISA, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000008', email: 'ticket@bintangglobal.com', name: 'Staff Ticket', role: ROLES.ROLE_TICKET, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000009', email: 'bus@bintangglobal.com', name: 'Staff Bus', role: ROLES.ROLE_BUS, branch_id: BRANCH_JKT },
      { id: 'b0000000-0000-0000-0000-000000000010', email: 'accounting@bintangglobal.com', name: 'Staff Accounting', role: ROLES.ROLE_ACCOUNTING, branch_id: null },
      { id: 'b0000000-0000-0000-0000-000000000011', email: 'owner1@bintangglobal.com', name: 'Owner Travel Satu', role: ROLES.OWNER, branch_id: null, company_name: 'Travel Satu Jaya' },
      { id: 'b0000000-0000-0000-0000-000000000012', email: 'owner2@bintangglobal.com', name: 'Owner Travel Dua', role: ROLES.OWNER, branch_id: null, company_name: 'CV Travel Dua' },
      { id: 'b0000000-0000-0000-0000-000000000013', email: 'owner3@bintangglobal.com', name: 'Owner Travel Tiga', role: ROLES.OWNER, branch_id: null, company_name: 'PT Travel Tiga Utama' }
    ];

    const userRows = users.map(u => ({
      id: u.id,
      email: u.email,
      password_hash: hash,
      name: u.name,
      role: u.role,
      branch_id: u.branch_id || null,
      company_name: u.company_name || null,
      is_active: true,
      created_at: now,
      updated_at: now
    }));

    await queryInterface.bulkInsert('users', userRows).catch(e => logErr('users', e));

    // 3 owner profiles (aktif, masing-masing punya cabang)
    const ownerProfiles = [
      { user_id: 'b0000000-0000-0000-0000-000000000011', status: OWNER_STATUS.ACTIVE, assigned_branch_id: BRANCH_JKT, activated_at: now },
      { user_id: 'b0000000-0000-0000-0000-000000000012', status: OWNER_STATUS.ACTIVE, assigned_branch_id: BRANCH_JKT, activated_at: now },
      { user_id: 'b0000000-0000-0000-0000-000000000013', status: OWNER_STATUS.ACTIVE, assigned_branch_id: BRANCH_SBY, activated_at: now }
    ];

    for (const op of ownerProfiles) {
      await queryInterface.bulkInsert('owner_profiles', [{
        id: require('uuid').v4 ? require('uuid').v4() : op.user_id.replace('b000', 'c000'),
        user_id: op.user_id,
        status: op.status,
        assigned_branch_id: op.assigned_branch_id,
        activated_at: op.activated_at,
        created_at: now,
        updated_at: now
      }]).catch(e => logErr('owner_profiles', e));
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('owner_profiles', null, {});
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('branches', null, {});
  }
};

// Export IDs for other seeders
module.exports.BRANCH_JKT = BRANCH_JKT;
module.exports.BRANCH_SBY = BRANCH_SBY;
module.exports.BRANCH_BDG = BRANCH_BDG;
