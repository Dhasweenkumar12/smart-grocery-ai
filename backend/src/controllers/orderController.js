const Order = require('../models/Order');
const Product = require('../models/Product');
const DailySale = require('../models/DailySale');
const User = require('../models/User');
const InventoryService = require('../services/inventoryService');
const InvoiceService = require('../services/invoiceService');
const { logAction } = require('../middleware/audit');

exports.createOrder = async (req, res) => {
  try {
    const {
      customerDetails,
      items,
      paymentMethod,
      discountAmount = 0,
      orderType = 'ONLINE'
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required' });
    }

    const io = req.app.get('socketio');
    const orderItems = [];
    let subtotal = 0;
    let totalProfit = 0;

    // Validate and deduct stock for each item using FEFO
    for (const itm of items) {
      const product = await Product.findById(itm.productId);
      if (!product) {
        return res.status(404).json({ success: false, message: `Product ${itm.productId} not found` });
      }

      if (product.currentStock < itm.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. In stock: ${product.currentStock}`
        });
      }

      // FEFO deduction
      const { batchesUsed } = await InventoryService.deductStockFEFO(
        product._id,
        Number(itm.quantity),
        io,
        req
      );

      const itemSubtotal = product.sellingPrice * itm.quantity;
      subtotal += itemSubtotal;

      const unitPurchasePrice = batchesUsed.length > 0 ? batchesUsed[0].costPrice : product.purchasePrice;
      const profitOnItem = (product.sellingPrice - unitPurchasePrice) * itm.quantity;
      totalProfit += profitOnItem;

      orderItems.push({
        product: product._id,
        productIdStr: product.productId,
        productName: product.name,
        batch: batchesUsed.length > 0 ? batchesUsed[0].batchId : null,
        batchNumber: batchesUsed.length > 0 ? batchesUsed[0].batchNumber : 'DEFAULT',
        quantity: itm.quantity,
        unitPrice: product.sellingPrice,
        purchasePrice: unitPurchasePrice,
        subtotal: itemSubtotal
      });
    }

    const taxAmount = Math.round(subtotal * 0.05); // 5% GST for grocery
    const deliveryFee = subtotal > 500 ? 0 : 40; // Free delivery above ₹500
    const finalTotal = Math.max(0, subtotal - discountAmount + taxAmount + deliveryFee);

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const transactionId = paymentMethod === 'COD' 
      ? `COD-${Date.now().toString().slice(-6)}` 
      : `TXN-SIM-${Date.now().toString().slice(-8)}`;

    const order = await Order.create({
      orderNumber,
      customer: req.user ? req.user._id : null,
      customerDetails: {
        name: customerDetails ? customerDetails.name : (req.user ? req.user.name : 'Walk-in Customer'),
        phone: customerDetails ? customerDetails.phone : (req.user ? req.user.phone : '9876543210'),
        address: customerDetails ? customerDetails.address : (req.user ? req.user.address?.street || 'Store Counter' : 'Store Counter')
      },
      items: orderItems,
      subtotal,
      discountAmount,
      taxAmount,
      deliveryFee,
      finalTotal,
      profitEarned: totalProfit,
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'COMPLETED',
      transactionId,
      orderStatus: orderType === 'IN_STORE_POS' ? 'Delivered' : 'Placed',
      orderType,
      statusTimeline: [{
        status: orderType === 'IN_STORE_POS' ? 'Delivered' : 'Placed',
        timestamp: new Date(),
        notes: `Order created via ${orderType}`
      }]
    });

    // Record daily sales data for ML training & analytics
    const todayStr = new Date().toISOString().split('T')[0];
    const dow = new Date().getDay();
    const month = new Date().getMonth() + 1;

    for (const item of orderItems) {
      await DailySale.findOneAndUpdate(
        { product: item.product, date: todayStr },
        {
          $inc: {
            unitsSold: item.quantity,
            revenue: item.subtotal,
            cost: item.purchasePrice * item.quantity,
            profit: item.subtotal - (item.purchasePrice * item.quantity)
          },
          $setOnInsert: {
            productIdStr: item.productIdStr,
            dayOfWeek: dow,
            month: month
          }
        },
        { upsert: true, new: true }
      );
    }

    if (io) {
      io.emit('order:created', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        finalTotal: order.finalTotal,
        customerName: order.customerDetails.name,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt
      });
    }

    await logAction({
      req,
      action: 'ORDER_STATUS_CHANGED',
      entityType: 'ORDER',
      entityId: order._id.toString(),
      details: `New order ${order.orderNumber} placed by ${order.customerDetails.name} for ₹${order.finalTotal}`
    });

    res.status(201).json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { status, customerId, orderType } = req.query;
    const filter = {};
    if (status) filter.orderStatus = status;
    if (customerId) filter.customer = customerId;
    if (orderType) filter.orderType = orderType;

    // If customer role, only return their own orders
    if (req.user && req.user.role === 'customer') {
      filter.customer = req.user._id;
    }

    const orders = await Order.find(filter)
      .populate('customer', 'name email phone')
      .populate('deliveryPartner', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('deliveryPartner', 'name phone');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Order Status Lifecycle: Placed -> Confirmed -> Preparing -> Packed -> Out for Delivery -> Delivered
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const prevStatus = order.orderStatus;
    order.orderStatus = status;

    if (status === 'Delivered') {
      order.deliveredAt = new Date();
    }

    order.statusTimeline.push({
      status,
      timestamp: new Date(),
      notes: notes || `Status changed from ${prevStatus} to ${status}`
    });

    await order.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: status,
        updatedAt: new Date()
      });
    }

    await logAction({
      req,
      action: 'ORDER_STATUS_CHANGED',
      entityType: 'ORDER',
      entityId: order._id.toString(),
      details: `Order ${order.orderNumber} status updated: ${prevStatus} -> ${status}`
    });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delivery management (Section 10)
exports.assignDeliveryPartner = async (req, res) => {
  try {
    const { deliveryPartnerId, estimatedMinutes = 30 } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const partner = await User.findById(deliveryPartnerId);
    if (!partner) return res.status(404).json({ success: false, message: 'Delivery partner not found' });

    order.deliveryPartner = partner._id;
    order.deliveryPartnerName = partner.name;
    order.orderStatus = 'Out for Delivery';
    order.estimatedDeliveryTime = new Date(Date.now() + estimatedMinutes * 60 * 1000);

    order.statusTimeline.push({
      status: 'Out for Delivery',
      timestamp: new Date(),
      notes: `Assigned to delivery agent ${partner.name} (Est. ${estimatedMinutes} mins)`
    });

    await order.save();

    const io = req.app.get('socketio');
    if (io) {
      io.emit('order:status_updated', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        newStatus: 'Out for Delivery',
        deliveryPartner: partner.name
      });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 18: Download PDF Invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    InvoiceService.generateInvoicePDF(order, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
