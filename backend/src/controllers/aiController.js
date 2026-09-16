const Product = require('../models/Product');
const Batch = require('../models/Batch');
const DailySale = require('../models/DailySale');
const AIService = require('../services/aiService');
const GeminiService = require('../services/geminiService');

// Interactive Gemini Assistant Chat
exports.chatWithGemini = async (req, res) => {
  try {
    const { message, cartItems = [], userRole = 'customer' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, message: 'Message text is required' });
    }

    // Grab a small sample of active products to provide store context to Gemini
    const catalogSample = await Product.find({}, 'name category sellingPrice currentStock').limit(15);

    const response = await GeminiService.askAssistant(message, {
      cartItems,
      userRole,
      catalogSample
    });

    res.json({ success: true, ...response });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Gemini Cart Recipe Suggestions
exports.getRecipeSuggestions = async (req, res) => {
  try {
    const { cartItems = [] } = req.body;
    const result = await GeminiService.generateRecipes(cartItems);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Gemini Executive Inventory Summary & Wastage Strategy
exports.getExecutiveInsights = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });

    const now = new Date();
    const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expiringNearCount = await Batch.countDocuments({
      currentQuantity: { $gt: 0 },
      expiryDate: { $lte: next30Days, $gt: now }
    });

    const expiredCount = await Batch.countDocuments({
      currentQuantity: { $gt: 0 },
      expiryDate: { $lte: now }
    });

    const metrics = {
      totalProducts,
      lowStockCount,
      expiringNearCount,
      expiredCount,
      todayRevenue: 48500,
      topCategory: 'Dairy, Bakery & Fresh Produce'
    };

    const result = await GeminiService.generateInventoryInsights(metrics);
    res.json({ success: true, metrics, ...result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 4 & 20: AI Demand Forecasting for Single Product
exports.getDemandForecast = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    // Fetch past 30 days of sales history
    const salesRecords = await DailySale.find({ product: product._id })
      .sort({ date: -1 })
      .limit(30);

    const formattedSales = salesRecords.map(s => ({
      date: s.date,
      quantity: s.unitsSold,
      revenue: s.revenue
    })).reverse();

    const payload = {
      productId: product._id.toString(),
      productName: product.name,
      currentStock: product.currentStock,
      minStock: product.minStockLevel,
      price: product.sellingPrice,
      discount: product.discountPercent,
      salesHistory: formattedSales
    };

    const forecast = await AIService.predictProductDemand(payload);
    res.json({ success: true, data: forecast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Batch AI demand forecasting for all products (Admin Dashboard)
exports.getAllProductsForecast = async (req, res) => {
  try {
    const products = await Product.find().limit(20);
    const forecasts = [];

    for (const p of products) {
      const sales = await DailySale.find({ product: p._id }).sort({ date: -1 }).limit(14);
      const prediction = await AIService.predictProductDemand({
        productId: p._id.toString(),
        productName: p.name,
        currentStock: p.currentStock,
        minStock: p.minStockLevel,
        price: p.sellingPrice,
        salesHistory: sales.map(s => ({ date: s.date, quantity: s.unitsSold }))
      });
      forecasts.push(prediction);
    }

    res.json({ success: true, count: forecasts.length, data: forecasts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 14: Smart Product Recommendations ("Frequently bought together")
exports.getCartRecommendations = async (req, res) => {
  try {
    const { cartItems } = req.body;
    const recs = await AIService.getCartRecommendations(cartItems || []);

    const matchingProducts = await Product.find({
      name: { $in: recs.map(r => new RegExp(r, 'i')) }
    }).limit(4);

    res.json({ success: true, recommendations: matchingProducts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 12: Smart Offers & Discounts for Near-Expiry & Slow Movers
exports.getSmartOffers = async (req, res) => {
  try {
    const batches = await Batch.find({ currentQuantity: { $gt: 0 } })
      .populate('product', 'name category purchasePrice sellingPrice currentStock')
      .sort({ expiryDate: 1 });

    const now = new Date();
    const productMap = new Map();

    for (const b of batches) {
      if (!b.product) continue;
      const pid = b.product._id.toString();
      const days = Math.ceil((new Date(b.expiryDate) - now) / (1000 * 60 * 60 * 24));

      if (!productMap.has(pid) || days < productMap.get(pid).daysToExpiry) {
        productMap.set(pid, {
          id: pid,
          productId: pid,
          name: b.product.name,
          category: b.product.category,
          price: b.product.sellingPrice,
          purchasePrice: b.product.purchasePrice,
          stock: b.currentQuantity,
          daysToExpiry: days,
          batchNumber: b.batchNumber
        });
      }
    }

    const offers = await AIService.getSmartOffers(Array.from(productMap.values()));
    res.json({ success: true, count: offers.length, offers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
