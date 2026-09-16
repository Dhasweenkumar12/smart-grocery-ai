const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  contactPerson: { type: String, default: '' },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  address: { type: String, default: '' },
  categoriesSupplied: [{ type: String }],
  rating: { type: Number, default: 4.5, min: 1, max: 5 },
  averageDeliveryDays: { type: Number, default: 2 }, // Lead time
  reliabilityScore: { type: Number, default: 95 }, // Percentage
  paymentTerms: { type: String, default: 'Net 30' },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
