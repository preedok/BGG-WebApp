const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelize');

const PaymentProof = sequelize.define('PaymentProof', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  invoice_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'invoices', key: 'id' },
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE'
  },
  payment_type: {
    type: DataTypes.ENUM('dp', 'partial', 'full'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(18, 2),
    allowNull: false
  },
  bank_name: {
    type: DataTypes.STRING(100)
  },
  account_number: {
    type: DataTypes.STRING(50)
  },
  transfer_date: {
    type: DataTypes.DATEONLY
  },
  proof_file_url: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  uploaded_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  verified_by: {
    type: DataTypes.UUID,
    references: { model: 'users', key: 'id' }
  },
  verified_at: {
    type: DataTypes.DATE
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'payment_proofs',
  underscored: true,
  timestamps: true
});

module.exports = PaymentProof;
