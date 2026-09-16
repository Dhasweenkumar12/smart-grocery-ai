const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ rating: -1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 19: Recommend best supplier
exports.recommendBestSupplier = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { categoriesSupplied: category, isActive: true } : { isActive: true };

    const suppliers = await Supplier.find(filter).sort({ rating: -1, averageDeliveryDays: 1 });
    res.json({
      success: true,
      category,
      bestRecommendation: suppliers.length > 0 ? suppliers[0] : null,
      alternatives: suppliers.slice(1)
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
