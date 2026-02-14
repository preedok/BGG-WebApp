'use strict';

const { ROLES } = require('../constants');

module.exports = {
  async up(queryInterface, Sequelize) {
    const branchId = 'a0000000-0000-0000-0000-000000000001';
    await queryInterface.bulkInsert('branches', [
      {
        id: branchId,
        code: 'JKT',
        name: 'Kantor Pusat Jakarta',
        city: 'Jakarta',
        region: 'DKI Jakarta',
        manager_name: 'Manager Pusat',
        phone: '+62 21 8094 5678',
        email: 'pusat@bintangglobal.com',
        address: 'Jl. Sudirman No. 1',
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await queryInterface.bulkInsert('users', [
      {
        id: 'b0000000-0000-0000-0000-000000000001',
        email: 'superadmin@bintangglobal.com',
        password_hash: hash,
        name: 'Super Admin',
        phone: '+62 21 8094 5678',
        role: ROLES.SUPER_ADMIN,
        branch_id: branchId,
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
    await queryInterface.bulkDelete('branches', null, {});
  }
};
