const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: { 
    type: String, 
    unique: true, 
    required: true,
    trim: true 
  },
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: [
      'Dairy & Eggs',
      'Bakery & Bread',
      'Fresh Produce',
      'Grains & Staples',
      'Beverages',
      'Snacks & Packaged',
      'Personal & Home Care'
    ],
    default: 'Grains & Staples'
  },
  brand: { type: String, default: 'FreshFarm' },
  description: { type: String, default: '' },
  purchasePrice: { type: Number, required: true, min: 0 },
  sellingPrice: { type: Number, required: true, min: 0 },
  currentStock: { type: Number, default: 0, min: 0 },
  minStockLevel: { type: Number, default: 15, min: 0 },
  maxStockLevel: { type: Number, default: 200, min: 0 },
  unit: { type: String, default: 'packet' }, // kg, litre, packet, pcs, box
  barcode: { type: String, unique: true, sparse: true },
  qrCode: { type: String, default: '' },
  imageUrl: { type: String, default: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60' },
  discountPercent: { type: Number, default: 0, min: 0, max: 100 },
  isDiscounted: { type: Boolean, default: false },
  salesVelocity7d: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
