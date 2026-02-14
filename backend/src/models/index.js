const sequelize = require('../config/sequelize');
const Branch = require('./Branch');
const User = require('./User');
const OwnerProfile = require('./OwnerProfile');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Invoice = require('./Invoice');
const PaymentProof = require('./PaymentProof');
const Refund = require('./Refund');
const AuditLog = require('./AuditLog');
const Notification = require('./Notification');

// Branch
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' });
Branch.hasMany(User, { foreignKey: 'branch_id' });

// OwnerProfile -> User
OwnerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasOne(OwnerProfile, { foreignKey: 'user_id' });
OwnerProfile.belongsTo(Branch, { foreignKey: 'assigned_branch_id', as: 'AssignedBranch' });

// Order
Order.belongsTo(User, { foreignKey: 'owner_id' });
Order.belongsTo(User, { foreignKey: 'created_by' });
Order.belongsTo(Branch, { foreignKey: 'branch_id' });
User.hasMany(Order, { foreignKey: 'owner_id' });
Branch.hasMany(Order, { foreignKey: 'branch_id' });

OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'OrderItems' });

// Invoice
Invoice.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });
Invoice.belongsTo(User, { foreignKey: 'owner_id', as: 'User' });
Invoice.belongsTo(Branch, { foreignKey: 'branch_id' });
Order.hasOne(Invoice, { foreignKey: 'order_id' });

PaymentProof.belongsTo(Invoice, { foreignKey: 'invoice_id' });
PaymentProof.belongsTo(User, { foreignKey: 'uploaded_by' });
PaymentProof.belongsTo(User, { foreignKey: 'verified_by' });
Invoice.hasMany(PaymentProof, { foreignKey: 'invoice_id', as: 'PaymentProofs' });

// Refund
Refund.belongsTo(Invoice, { foreignKey: 'invoice_id' });
Refund.belongsTo(Order, { foreignKey: 'order_id' });
Refund.belongsTo(User, { foreignKey: 'requested_by' });
Refund.belongsTo(User, { foreignKey: 'approved_by' });

// AuditLog
AuditLog.belongsTo(User, { foreignKey: 'user_id' });
AuditLog.belongsTo(Branch, { foreignKey: 'branch_id' });

// Notification
Notification.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Notification, { foreignKey: 'user_id' });

const db = {
  sequelize,
  Sequelize: require('sequelize'),
  Branch,
  User,
  OwnerProfile,
  Order,
  OrderItem,
  Invoice,
  PaymentProof,
  Refund,
  AuditLog,
  Notification
};

module.exports = db;
