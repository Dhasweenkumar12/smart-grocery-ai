const Product = require('../models/Product');
const Batch = require('../models/Batch');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const { logAction } = require('../middleware/audit');

class InventoryService {
  /**
   * Deduct stock according to FEFO (First Expired, First Out)
   */
  static async deductStockFEFO(productId, quantityToDeduct, io = null, req = null) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    if (product.currentStock < quantityToDeduct) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.currentStock}, Requested: ${quantityToDeduct}`);
    }

    const previousStock = product.currentStock;

    // Find active batches for this product ordered by earliest expiry date (FEFO)
    const batches = await Batch.find({
      product: productId,
      currentQuantity: { $gt: 0 },
      status: { $ne: 'EXPIRED' }
    }).sort({ expiryDate: 1 });

    let remainingToDeduct = quantityToDeduct;
    const batchesUsed = [];

    for (const batch of batches) {
      if (remainingToDeduct <= 0) break;

      const deduction = Math.min(batch.currentQuantity, remainingToDeduct);
      batch.currentQuantity -= deduction;
      remainingToDeduct -= deduction;

      if (batch.currentQuantity === 0) {
        batch.status = 'DEPLETED';
      }
      await batch.save();

      batchesUsed.push({
        batchId: batch._id,
        batchNumber: batch.batchNumber,
        quantityDeducted: deduction,
        costPrice: batch.costPrice
      });
    }

    // Update product stock
    product.currentStock -= quantityToDeduct;
    await product.save();

    // Check if auto-reorder needs to be triggered
    if (product.currentStock <= product.minStockLevel) {
      await this.triggerAutoReorder(product, io);
    }

    // Emit real-time update
    if (io) {
      io.emit('stock:updated', {
        productId: product._id,
        productName: product.name,
        currentStock: product.currentStock,
        minStock: product.minStockLevel
      });

      if (product.currentStock <= product.minStockLevel) {
        io.emit('alert:lowStock', {
          productId: product._id,
          productName: product.name,
          currentStock: product.currentStock,
          minStock: product.minStockLevel,
          timestamp: new Date()
        });
      }
    }

    // Audit log
    await logAction({
      req,
      action: 'STOCK_ADJUSTED',
      entityType: 'PRODUCT',
      entityId: product._id.toString(),
      details: `FEFO stock deduction: ${product.name} decreased by ${quantityToDeduct} units (${previousStock} -> ${product.currentStock})`,
      previousState: { stock: previousStock },
      newState: { stock: product.currentStock }
    });

    return { product, batchesUsed };
  }

  /**
   * Add stock (from Purchase Order receipt or manual batch addition)
   */
  static async addStockBatch(productId, batchData, io = null, req = null) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');

    const previousStock = product.currentStock;

    // Calculate initial status based on expiry
    const now = new Date();
    const expiry = new Date(batchData.expiryDate);
    const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    let status = 'ACTIVE';
    if (diffDays <= 0) status = 'EXPIRED';
    else if (diffDays <= 7) status = 'CRITICAL_EXPIRY_7D';
    else if (diffDays <= 30) status = 'NEAR_EXPIRY_30D';

    const newBatch = await Batch.create({
      batchNumber: batchData.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`,
      product: productId,
      productIdStr: product.productId,
      manufacturingDate: batchData.manufacturingDate || new Date(),
      expiryDate: batchData.expiryDate,
      initialQuantity: batchData.quantity,
      currentQuantity: batchData.quantity,
      costPrice: batchData.costPrice || product.purchasePrice,
      supplier: batchData.supplier,
      locationRack: batchData.locationRack || 'A-01',
      status
    });

    product.currentStock += Number(batchData.quantity);
    if (batchData.costPrice) {
      product.purchasePrice = Number(batchData.costPrice);
    }
    await product.save();

    if (io) {
      io.emit('stock:updated', {
        productId: product._id,
        productName: product.name,
        currentStock: product.currentStock
      });
    }

    await logAction({
      req,
      action: 'BATCH_ADDED',
      entityType: 'BATCH',
      entityId: newBatch._id.toString(),
      details: `Added new batch ${newBatch.batchNumber} with ${batchData.quantity} units to ${product.name}`,
      previousState: { stock: previousStock },
      newState: { stock: product.currentStock }
    });

    return { product, batch: newBatch };
  }

  /**
   * Section 5: Automatic Reorder Recommendation
   */
  static async triggerAutoReorder(product, io = null) {
    // Check if an open/recommended PO already exists for this product
    const existingPO = await PurchaseOrder.findOne({
      'items.product': product._id,
      status: { $in: ['RECOMMENDED_BY_AI', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_SUPPLIER'] }
    });

    if (existingPO) return null; // Avoid duplicate reorder recommendations

    // Find best supplier based on category, rating, and lead time
    let supplier = await Supplier.findOne({
      categoriesSupplied: product.category,
      isActive: true
    }).sort({ rating: -1, averageDeliveryDays: 1 });

    if (!supplier) {
      supplier = await Supplier.findOne({ isActive: true }).sort({ rating: -1 });
    }

    if (!supplier) return null;

    const recommendedQty = Math.max(product.minStockLevel * 3, 50);
    const unitCost = product.purchasePrice || 20;
    const totalCost = recommendedQty * unitCost;

    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    const po = await PurchaseOrder.create({
      poNumber,
      supplier: supplier._id,
      supplierName: supplier.name,
      items: [{
        product: product._id,
        productIdStr: product.productId,
        productName: product.name,
        recommendedQuantity: recommendedQty,
        orderQuantity: recommendedQty,
        estimatedUnitCost: unitCost,
        totalCost
      }],
      totalCost,
      status: 'RECOMMENDED_BY_AI',
      triggerReason: `Stock dropped to ${product.currentStock} (below threshold of ${product.minStockLevel})`,
      expectedDeliveryDate: new Date(Date.now() + supplier.averageDeliveryDays * 24 * 60 * 60 * 1000)
    });

    if (io) {
      io.emit('po:recommended', {
        poNumber: po.poNumber,
        productName: product.name,
        supplierName: supplier.name,
        recommendedQuantity: recommendedQty,
        totalCost
      });
    }

    return po;
  }

  /**
   * Scan and refresh all batch expiry states
   */
  static async refreshBatchExpiryStatuses() {
    const batches = await Batch.find({ currentQuantity: { $gt: 0 } });
    const now = new Date();

    for (const b of batches) {
      const diffDays = Math.ceil((new Date(b.expiryDate) - now) / (1000 * 60 * 60 * 24));
      let newStatus = 'ACTIVE';

      if (diffDays <= 0) {
        newStatus = 'EXPIRED';
      } else if (diffDays <= 7) {
        newStatus = 'CRITICAL_EXPIRY_7D';
      } else if (diffDays <= 30) {
        newStatus = 'NEAR_EXPIRY_30D';
      }

      if (b.status !== newStatus) {
        b.status = newStatus;
        await b.save();
      }
    }
  }
}

module.exports = InventoryService;
