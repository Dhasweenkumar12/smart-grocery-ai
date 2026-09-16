const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  batchNumber: { 
    type: String, 
    required: true,
    trim: true 
  },
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },
  productIdStr: { type: String, required: true },
  manufacturingDate: { type: Date, required: true },
  expiryDate: { type: Date, required: true },
  initialQuantity: { type: Number, required: true, min: 0 },
  currentQuantity: { type: Number, required: true, min: 0 },
  costPrice: { type: Number, required: true },
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier' 
  },
  locationRack: { type: String, default: 'A-01' },
  status: {
    type: String,
    enum: ['ACTIVE', 'NEAR_EXPIRY_30D', 'CRITICAL_EXPIRY_7D', 'EXPIRED', 'DEPLETED'],
    default: 'ACTIVE'
  }
}, {
  timestamps: true
});

// Helper virtual to calculate days until expiry
batchSchema.virtual('daysToExpiry').get(function() {
  if (!this.expiryDate) return 999;
  const diffTime = new Date(this.expiryDate).getTime() - Date.now();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

module.exports = mongoose.model('Batch', batchSchema);
