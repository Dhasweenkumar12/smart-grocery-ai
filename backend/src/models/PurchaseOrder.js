const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productIdStr: { type: String, required: true },
  productName: { type: String, required: true },
  recommendedQuantity: { type: Number, required: true },
  orderQuantity: { type: Number, required: true },
  estimatedUnitCost: { type: Number, required: true },
  totalCost: { type: Number, required: true }
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: { type: String, required: true, unique: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  items: [poItemSchema],
  totalCost: { type: Number, required: true },
  status: {
    type: String,
    enum: ['RECOMMENDED_BY_AI', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_SUPPLIER', 'RECEIVED', 'REJECTED'],
    default: 'RECOMMENDED_BY_AI'
  },
  triggerReason: {
    type: String,
    default: 'AUTOMATED_MIN_STOCK_REORDER' // or 'MANUAL' or 'DEMAND_FORECAST_SPIKE'
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approvedAt: { type: Date },
  receivedAt: { type: Date },
  expectedDeliveryDate: { type: Date },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
