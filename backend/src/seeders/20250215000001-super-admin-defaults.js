'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    await queryInterface.bulkInsert('ui_templates', [
      { id: 'c0000000-0000-0000-0000-000000000001', code: 'default', name: 'Default', description: 'Standard sidebar layout', config: '{}', is_active: true, sort_order: 0, created_at: now, updated_at: now },
      { id: 'c0000000-0000-0000-0000-000000000002', code: 'compact', name: 'Compact', description: 'Compact sidebar, denser content', config: '{"sidebarWidth": "200px"}', is_active: false, sort_order: 1, created_at: now, updated_at: now },
      { id: 'c0000000-0000-0000-0000-000000000003', code: 'modern', name: 'Modern', description: 'Modern card style, rounded corners', config: '{"cardRadius": "16px"}', is_active: false, sort_order: 2, created_at: now, updated_at: now },
      { id: 'c0000000-0000-0000-0000-000000000004', code: 'minimal', name: 'Minimal', description: 'Minimal UI, focus on content', config: '{"minimal": true}', is_active: false, sort_order: 3, created_at: now, updated_at: now }
    ]).catch(() => {});

    await queryInterface.bulkInsert('app_settings', [
      { id: 'd0000000-0000-0000-0000-000000000001', key: 'locale', value: 'id', description: 'Default language', created_at: now, updated_at: now },
      { id: 'd0000000-0000-0000-0000-000000000002', key: 'primary_color', value: '#059669', description: 'Primary theme color', created_at: now, updated_at: now },
      { id: 'd0000000-0000-0000-0000-000000000003', key: 'background_color', value: '#f8fafc', description: 'Background color', created_at: now, updated_at: now },
      { id: 'd0000000-0000-0000-0000-000000000004', key: 'text_color', value: '#0f172a', description: 'Text color', created_at: now, updated_at: now },
      { id: 'd0000000-0000-0000-0000-000000000005', key: 'font_size', value: '14', description: 'Base font size px', created_at: now, updated_at: now },
      { id: 'd0000000-0000-0000-0000-000000000006', key: 'ui_template', value: 'default', description: 'Active UI template code', created_at: now, updated_at: now }
    ]).catch(() => {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('app_settings', null, {});
    await queryInterface.bulkDelete('ui_templates', null, {});
  }
};
