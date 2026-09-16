const mongoose = require('mongoose');

const dailySaleSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productIdStr: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  unitsSold: { type: Number, required: true, default: 0 },
  revenue: { type: Number, required: true, default: 0 },
  cost: { type: Number, required: true, default: 0 },
  profit: { type: Number, required: true, default: 0 },
  dayOfWeek: { type: Number, required: true }, // 0=Sunday, 6=Saturday
  month: { type: Number, required: true }
}, {
  timestamps: true
});

dailySaleSchema.index({ product: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailySale', dailySaleSchema);
