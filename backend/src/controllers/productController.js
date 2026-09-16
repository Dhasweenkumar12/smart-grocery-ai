const Product = require('../models/Product');
const Batch = require('../models/Batch');
const { logAction } = require('../middleware/audit');

exports.getProducts = async (req, res) => {
  try {
    const { search, category, lowStock, isDiscounted } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { productId: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isDiscounted === 'true') {
      query.isDiscounted = true;
    }

    let products = await Product.find(query).sort({ name: 1 });

    if (lowStock === 'true') {
      products = products.filter(p => p.currentStock <= p.minStockLevel);
    }

    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Barcode & QR Code scanner lookup (Section 7)
exports.scanBarcode = async (req, res) => {
  try {
    const { code } = req.params;
    const product = await Product.findOne({
      $or: [{ barcode: code }, { qrCode: code }, { productId: code }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: `No product found matching barcode/QR: ${code}` });
    }

    // Get active batches for FEFO details
    const batches = await Batch.find({
      product: product._id,
      currentQuantity: { $gt: 0 }
    }).sort({ expiryDate: 1 });

    const nearestExpiry = batches.length > 0 ? batches[0].expiryDate : null;

    res.json({
      success: true,
      data: {
        ...product.toObject(),
        activeBatches: batches,
        nearestExpiryDate: nearestExpiry
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      productId,
      category,
      brand,
      description,
      purchasePrice,
      sellingPrice,
      currentStock,
      minStockLevel,
      maxStockLevel,
      unit,
      barcode,
      imageUrl
    } = req.body;

    const generatedId = productId || `PRD-${Date.now().toString().slice(-6)}`;
    const generatedBarcode = barcode || `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    const product = await Product.create({
      productId: generatedId,
      name,
      category,
      brand: brand || 'FreshFarm',
      description,
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      currentStock: Number(currentStock || 0),
      minStockLevel: Number(minStockLevel || 15),
      maxStockLevel: Number(maxStockLevel || 200),
      unit: unit || 'packet',
      barcode: generatedBarcode,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500'
    });

    // If initial stock > 0, create an initial active batch
    if (Number(currentStock) > 0) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + 90); // default 90 days
      await Batch.create({
        batchNumber: `INIT-${Date.now().toString().slice(-6)}`,
        product: product._id,
        productIdStr: product.productId,
        manufacturingDate: new Date(),
        expiryDate: expDate,
        initialQuantity: Number(currentStock),
        currentQuantity: Number(currentStock),
        costPrice: Number(purchasePrice),
        status: 'ACTIVE'
      });
    }

    await logAction({
      req,
      action: 'PRODUCT_CREATED',
      entityType: 'PRODUCT',
      entityId: product._id.toString(),
      details: `Created new product ${product.name} (SKU: ${product.productId})`
    });

    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const prevPrice = product.sellingPrice;
    const prevStock = product.currentStock;

    Object.assign(product, req.body);
    await product.save();

    await logAction({
      req,
      action: 'PRODUCT_UPDATED',
      entityType: 'PRODUCT',
      entityId: product._id.toString(),
      details: `Product ${product.name} updated. Price: ${prevPrice}->${product.sellingPrice}, Stock: ${prevStock}->${product.currentStock}`,
      previousState: { price: prevPrice, stock: prevStock },
      newState: { price: product.sellingPrice, stock: product.currentStock }
    });

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await Batch.deleteMany({ product: product._id });
    res.json({ success: true, message: 'Product and associated batches removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
