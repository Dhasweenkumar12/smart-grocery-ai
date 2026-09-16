const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const InventoryService = require('../services/inventoryService');
const { logAction } = require('../middleware/audit');

exports.getPurchaseOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const pos = await PurchaseOrder.find(filter)
      .populate('supplier', 'name email phone averageDeliveryDays rating')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: pos.length, data: pos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approvePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });

    po.status = 'APPROVED';
    po.approvedBy = req.user._id;
    po.approvedAt = new Date();
    await po.save();

    await logAction({
      req,
      action: 'REORDER_APPROVED',
      entityType: 'PURCHASE_ORDER',
      entityId: po._id.toString(),
      details: `PO ${po.poNumber} approved by ${req.user.name} for Supplier ${po.supplierName} (₹${po.totalCost})`
    });

    res.json({ success: true, message: 'Purchase Order approved successfully', data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// When items arrive at warehouse: mark received and ingest into FEFO batches
exports.receivePurchaseOrder = async (req, res) => {
  try {
    const po = await PurchaseOrder.findById(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    if (po.status === 'RECEIVED') {
      return res.status(400).json({ success: false, message: 'Purchase Order already received' });
    }

    const io = req.app.get('socketio');

    // For each item in PO, add batch to inventory
    for (const item of po.items) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 90); // default 90 days expiry

      await InventoryService.addStockBatch(
        item.product,
        {
          batchNumber: `BATCH-${po.poNumber.slice(-4)}-${Date.now().toString().slice(-4)}`,
          quantity: item.orderQuantity,
          costPrice: item.estimatedUnitCost,
          supplier: po.supplier,
          expiryDate: expDate
        },
        io,
        req
      );
    }

    po.status = 'RECEIVED';
    po.receivedAt = new Date();
    await po.save();

    await logAction({
      req,
      action: 'STOCK_ADJUSTED',
      entityType: 'PURCHASE_ORDER',
      entityId: po._id.toString(),
      details: `PO ${po.poNumber} received into inventory stock`
    });

    res.json({ success: true, message: 'Purchase Order received and inventory updated', data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Scan inventory to generate reorders for any low-stock items
exports.scanAndGenerateReorders = async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });

    const generated = [];
    const io = req.app.get('socketio');

    for (const prod of lowStockProducts) {
      const po = await InventoryService.triggerAutoReorder(prod, io);
      if (po) generated.push(po);
    }

    res.json({
      success: true,
      message: `Scanned inventory: found ${lowStockProducts.length} low stock items, created ${generated.length} reorder recommendations`,
      data: generated
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
