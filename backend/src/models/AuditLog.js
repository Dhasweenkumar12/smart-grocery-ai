const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'System' },
  userEmail: { type: String, default: 'system@smartgrocery.ai' },
  userRole: { type: String, default: 'system' },
  action: { 
    type: String, 
    required: true,
    enum: [
      'LOGIN',
      'LOGOUT',
      'PRODUCT_CREATED',
      'PRODUCT_UPDATED',
      'STOCK_ADJUSTED',
      'BATCH_ADDED',
      'ORDER_STATUS_CHANGED',
      'DISCOUNT_APPLIED',
      'REORDER_APPROVED',
      'SUPPLIER_UPDATED',
      'SYSTEM_ALERT_TRIGGERED'
    ]
  },
  entityType: { type: String, default: 'GENERAL' }, // Product, Order, Batch, Supplier, User
  entityId: { type: String, default: '' },
  details: { type: String, required: true },
  previousState: { type: mongoose.Schema.Types.Mixed },
  newState: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String, default: '127.0.0.1' }
}, {
  timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
