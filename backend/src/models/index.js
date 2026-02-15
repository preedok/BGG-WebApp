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
const AppSetting = require('./AppSetting');
const SystemLog = require('./SystemLog');
const MaintenanceNotice = require('./MaintenanceNotice');
const UiTemplate = require('./UiTemplate');
const Product = require('./Product');
const ProductPrice = require('./ProductPrice');
const BusinessRuleConfig = require('./BusinessRuleConfig');
const HotelProgress = require('./HotelProgress');
const TicketProgress = require('./TicketProgress');
const VisaProgress = require('./VisaProgress');
const BusProgress = require('./BusProgress');
const ProductAvailability = require('./ProductAvailability');
const FlyerTemplate = require('./FlyerTemplate');

// Branch
User.belongsTo(Branch, { foreignKey: 'branch_id', as: 'Branch' });
Branch.hasMany(User, { foreignKey: 'branch_id' });

// OwnerProfile -> User
OwnerProfile.belongsTo(User, { foreignKey: 'user_id', as: 'User' });
User.hasOne(OwnerProfile, { foreignKey: 'user_id' });
OwnerProfile.belongsTo(Branch, { foreignKey: 'assigned_branch_id', as: 'AssignedBranch' });

// Order
Order.belongsTo(User, { foreignKey: 'owner_id', as: 'User' });
Order.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
Order.belongsTo(Branch, { foreignKey: 'branch_id' });
User.hasMany(Order, { foreignKey: 'owner_id' });
Branch.hasMany(Order, { foreignKey: 'branch_id' });

OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });
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

// MaintenanceNotice
MaintenanceNotice.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });

// Product
Product.belongsTo(User, { foreignKey: 'created_by' });
Product.hasMany(ProductPrice, { foreignKey: 'product_id', as: 'ProductPrices' });
ProductPrice.belongsTo(Product, { foreignKey: 'product_id' });
ProductPrice.belongsTo(Branch, { foreignKey: 'branch_id' });
ProductPrice.belongsTo(User, { foreignKey: 'owner_id', as: 'Owner' });
ProductPrice.belongsTo(User, { foreignKey: 'created_by', as: 'Creator' });
Branch.hasMany(ProductPrice, { foreignKey: 'branch_id' });

BusinessRuleConfig.belongsTo(Branch, { foreignKey: 'branch_id' });
BusinessRuleConfig.belongsTo(User, { foreignKey: 'updated_by' });
Branch.hasMany(BusinessRuleConfig, { foreignKey: 'branch_id' });

Order.belongsTo(User, { foreignKey: 'unblocked_by', as: 'UnblockedBy' });
Invoice.belongsTo(User, { foreignKey: 'unblocked_by', as: 'UnblockedBy' });
PaymentProof.belongsTo(User, { foreignKey: 'issued_by', as: 'IssuedBy' });

HotelProgress.belongsTo(OrderItem, { foreignKey: 'order_item_id' });
HotelProgress.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });
OrderItem.hasOne(HotelProgress, { foreignKey: 'order_item_id', as: 'HotelProgress' });

TicketProgress.belongsTo(OrderItem, { foreignKey: 'order_item_id' });
TicketProgress.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });
OrderItem.hasOne(TicketProgress, { foreignKey: 'order_item_id', as: 'TicketProgress' });

VisaProgress.belongsTo(OrderItem, { foreignKey: 'order_item_id' });
VisaProgress.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });
OrderItem.hasOne(VisaProgress, { foreignKey: 'order_item_id', as: 'VisaProgress' });

BusProgress.belongsTo(OrderItem, { foreignKey: 'order_item_id' });
BusProgress.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });
OrderItem.hasOne(BusProgress, { foreignKey: 'order_item_id', as: 'BusProgress' });

ProductAvailability.belongsTo(Product, { foreignKey: 'product_id' });
ProductAvailability.belongsTo(User, { foreignKey: 'updated_by', as: 'UpdatedBy' });
Product.hasOne(ProductAvailability, { foreignKey: 'product_id', as: 'ProductAvailability' });

FlyerTemplate.belongsTo(Product, { foreignKey: 'product_id' });
FlyerTemplate.belongsTo(User, { foreignKey: 'created_by', as: 'CreatedBy' });
Product.hasMany(FlyerTemplate, { foreignKey: 'product_id', as: 'FlyerTemplates' });

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
  Notification,
  AppSetting,
  SystemLog,
  MaintenanceNotice,
  UiTemplate,
  Product,
  ProductPrice,
  BusinessRuleConfig,
  HotelProgress,
  TicketProgress,
  VisaProgress,
  BusProgress,
  ProductAvailability,
  FlyerTemplate
};

module.exports = db;
