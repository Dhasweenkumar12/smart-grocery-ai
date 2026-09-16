const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productIdStr: { type: String, required: true },
  productName: { type: String, required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  batchNumber: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  purchasePrice: { type: Number, default: 0 },
  subtotal: { type: Number, required: true }
});

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerDetails: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
  },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  deliveryFee: { type: Number, default: 0 },
  finalTotal: { type: Number, required: true },
  profitEarned: { type: Number, default: 0 },
  paymentMethod: {
    type: String,
    enum: ['COD', 'UPI', 'CARD', 'NETBANKING'],
    default: 'UPI'
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'FAILED'],
    default: 'COMPLETED'
  },
  transactionId: { type: String, default: '' },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Confirmed', 'Preparing', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  orderType: {
    type: String,
    enum: ['ONLINE', 'IN_STORE_POS'],
    default: 'ONLINE'
  },
  deliveryPartner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryPartnerName: { type: String, default: 'Unassigned' },
  estimatedDeliveryTime: { type: Date },
  deliveredAt: { type: Date },
  statusTimeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
