const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

/**
 * Flyer / template design product atau paket. Admin pusat buat & launch; semua role bisa lihat yang published.
 */
const FlyerTemplate = sequelize.define('FlyerTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('product', 'package'),
    allowNull: false
  },
  product_id: {
    type: DataTypes.UUID,
    references: { model: 'products', key: 'id' },
    onDelete: 'SET NULL'
  },
  design_content: {
    type: DataTypes.TEXT,
    comment: 'HTML atau JSON design (editor)'
  },
  thumbnail_url: {
    type: DataTypes.STRING(500)
  },
  is_published: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  published_at: {
    type: DataTypes.DATE
  },
  created_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  }
}, {
  tableName: 'flyer_templates',
  underscored: true,
  timestamps: true
});

module.exports = FlyerTemplate;
