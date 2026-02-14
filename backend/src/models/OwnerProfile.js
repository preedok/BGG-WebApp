const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');
const { OWNER_STATUS } = require('../constants');

const OwnerProfile = sequelize.define('OwnerProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: { model: 'users', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  status: {
    type: DataTypes.ENUM(Object.values(OWNER_STATUS)),
    allowNull: false,
    defaultValue: OWNER_STATUS.REGISTERED_PENDING_MOU
  },
  address: {
    type: DataTypes.TEXT
  },
  operational_region: {
    type: DataTypes.STRING(255)
  },
  whatsapp: {
    type: DataTypes.STRING(50)
  },
  npwp: {
    type: DataTypes.STRING(50)
  },
  legal_doc_url: {
    type: DataTypes.STRING(500)
  },
  mou_template_downloaded_at: {
    type: DataTypes.DATE
  },
  mou_signed_url: {
    type: DataTypes.STRING(500),
    comment: 'Upload MoU yang sudah ditandatangani'
  },
  mou_uploaded_at: {
    type: DataTypes.DATE
  },
  mou_rejected_reason: {
    type: DataTypes.TEXT
  },
  deposit_amount: {
    type: DataTypes.DECIMAL(18, 2)
  },
  deposit_proof_url: {
    type: DataTypes.STRING(500)
  },
  deposit_verified_at: {
    type: DataTypes.DATE
  },
  deposit_verified_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  assigned_branch_id: {
    type: DataTypes.UUID,
    references: { model: 'branches', key: 'id' }
  },
  assigned_at: {
    type: DataTypes.DATE
  },
  activated_at: {
    type: DataTypes.DATE
  },
  activated_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  has_special_price: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'owner_profiles',
  underscored: true,
  timestamps: true
});

module.exports = OwnerProfile;
