const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * UI/Layout templates - Super Admin can switch layout from app.
 */
const UiTemplate = sequelize.define('UiTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: 'e.g. default, compact, modern, minimal'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT
  },
  config: {
    type: DataTypes.JSONB,
    defaultValue: {},
    comment: 'sidebar position, card style, colors override, etc.'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'Only one template can be active'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'ui_templates',
  underscored: true,
  timestamps: true
});

module.exports = UiTemplate;
