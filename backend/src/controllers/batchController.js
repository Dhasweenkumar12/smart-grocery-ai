const Batch = require('../models/Batch');
const Product = require('../models/Product');
const InventoryService = require('../services/inventoryService');

exports.getBatches = async (req, res) => {
  try {
    const { productId, status } = req.query;
    const filter = {};
    if (productId) filter.product = productId;
    if (status) filter.status = status;

    // Refresh batch statuses
    await InventoryService.refreshBatchExpiryStatuses();

    const batches = await Batch.find(filter)
      .populate('product', 'name category productId currentStock sellingPrice')
      .populate('supplier', 'name phone')
      .sort({ expiryDate: 1 }); // FEFO sort: earliest expiry first

    res.json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addBatch = async (req, res) => {
  try {
    const { productId, batchNumber, manufacturingDate, expiryDate, quantity, costPrice, supplier, locationRack } = req.body;
    const io = req.app.get('socketio');

    const result = await InventoryService.addStockBatch(
      productId,
      {
        batchNumber,
        manufacturingDate,
        expiryDate,
        quantity: Number(quantity),
        costPrice: Number(costPrice),
        supplier,
        locationRack
      },
      io,
      req
    );

    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 6: Expiry & Batch Alerts (30 days, 7 days, Expired)
exports.getExpiryAlerts = async (req, res) => {
  try {
    await InventoryService.refreshBatchExpiryStatuses();

    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const expired = await Batch.find({
      currentQuantity: { $gt: 0 },
      expiryDate: { $lte: now }
    }).populate('product', 'name productId category sellingPrice');

    const expiring7Days = await Batch.find({
      currentQuantity: { $gt: 0 },
      expiryDate: { $gt: now, $lte: in7Days }
    }).populate('product', 'name productId category sellingPrice');

    const expiring30Days = await Batch.find({
      currentQuantity: { $gt: 0 },
      expiryDate: { $gt: in7Days, $lte: in30Days }
    }).populate('product', 'name productId category sellingPrice');

    res.json({
      success: true,
      summary: {
        expiredCount: expired.length,
        expiring7DaysCount: expiring7Days.length,
        expiring30DaysCount: expiring30Days.length,
        totalAtRisk: expired.length + expiring7Days.length + expiring30Days.length
      },
      data: {
        expired,
        expiring7Days,
        expiring30Days
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
