const Product = require('../models/Product');
const Order = require('../models/Order');
const Batch = require('../models/Batch');
const DailySale = require('../models/DailySale');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    // Aggregated total stock count
    const stockAgg = await Product.aggregate([
      { $group: { _id: null, totalStock: { $sum: '$currentStock' } } }
    ]);
    const totalStock = stockAgg.length > 0 ? stockAgg[0].totalStock : 0;

    // Today's boundaries
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = await Order.find({ createdAt: { $gte: today } });
    const todaySales = todayOrders.reduce((acc, o) => acc + (o.finalTotal || 0), 0);
    const todayProfit = todayOrders.reduce((acc, o) => acc + (o.profitEarned || 0), 0);
    const onlineOrdersCount = todayOrders.filter(o => o.orderType === 'ONLINE').length;

    // Low stock count (currentStock <= minStockLevel)
    const lowStockCount = await Product.countDocuments({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    });

    // Expiring batches in next 30 days
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const expiringBatchesCount = await Batch.countDocuments({
      currentQuantity: { $gt: 0 },
      expiryDate: { $lte: in30Days }
    });

    // Pending orders
    const pendingOrdersCount = await Order.countDocuments({
      orderStatus: { $in: ['Placed', 'Confirmed', 'Preparing'] }
    });

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalStock,
        todaySales: Math.round(todaySales),
        todayProfit: Math.round(todayProfit),
        todayOrdersCount: todayOrders.length,
        onlineOrdersCount,
        lowStockCount,
        expiringBatchesCount,
        pendingOrdersCount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 13 & 17: Charts data
exports.getAnalyticsCharts = async (req, res) => {
  try {
    // 1. Category breakdown
    const categoryAgg = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$currentStock' },
          inventoryValue: { $sum: { $multiply: ['$currentStock', '$purchasePrice'] } }
        }
      }
    ]);

    // 2. Recent 14-day sales trend from DailySale
    const salesTrend = await DailySale.aggregate([
      {
        $group: {
          _id: '$date',
          totalRevenue: { $sum: '$revenue' },
          totalCost: { $sum: '$cost' },
          totalProfit: { $sum: '$profit' },
          unitsSold: { $sum: '$unitsSold' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 14 }
    ]);

    // 3. Top Best Selling Products
    const bestSellers = await DailySale.aggregate([
      {
        $group: {
          _id: '$product',
          totalUnits: { $sum: '$unitsSold' },
          totalRevenue: { $sum: '$revenue' },
          totalProfit: { $sum: '$profit' }
        }
      },
      { $sort: { totalUnits: -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' }
    ]);

    // 4. Slow Moving Items (Stock > 25, sales < 5)
    const slowMovers = await Product.find({ currentStock: { $gt: 20 } })
      .sort({ currentStock: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        categoryBreakdown: categoryAgg,
        salesTrend,
        bestSellers: bestSellers.map(b => ({
          name: b.productDetails.name,
          category: b.productDetails.category,
          unitsSold: b.totalUnits,
          revenue: b.totalRevenue,
          profit: b.totalProfit
        })),
        slowMovers: slowMovers.map(s => ({
          name: s.name,
          category: s.category,
          stock: s.currentStock,
          price: s.sellingPrice
        }))
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Section 15: Intelligent Unified Alerts
exports.getIntelligentAlerts = async (req, res) => {
  try {
    const alerts = [];

    // Low stock
    const lowStock = await Product.find({
      $expr: { $lte: ['$currentStock', '$minStockLevel'] }
    }).limit(10);

    lowStock.forEach(p => {
      alerts.push({
        id: `low-${p._id}`,
        type: 'LOW_STOCK',
        severity: p.currentStock === 0 ? 'CRITICAL' : 'WARNING',
        title: `Low Stock: ${p.name}`,
        message: `Current stock (${p.currentStock}) is at or below threshold (${p.minStockLevel})`,
        link: '/admin/inventory',
        createdAt: new Date()
      });
    });

    // Expiry alerts
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expiringBatches = await Batch.find({
      currentQuantity: { $gt: 0 },
      expiryDate: { $lte: in7Days }
    }).populate('product', 'name');

    expiringBatches.forEach(b => {
      const isExpired = new Date(b.expiryDate) <= now;
      alerts.push({
        id: `exp-${b._id}`,
        type: isExpired ? 'EXPIRED' : 'NEAR_EXPIRY',
        severity: isExpired ? 'CRITICAL' : 'WARNING',
        title: isExpired ? `Expired Product: ${b.product?.name}` : `Near Expiry: ${b.product?.name}`,
        message: `Batch ${b.batchNumber} (${b.currentQuantity} units) ${isExpired ? 'expired on' : 'expires on'} ${new Date(b.expiryDate).toLocaleDateString()}`,
        link: '/admin/expiry',
        createdAt: new Date()
      });
    });

    // Pending Orders Alert
    const pendingCount = await Order.countDocuments({ orderStatus: 'Placed' });
    if (pendingCount > 0) {
      alerts.push({
        id: 'pending-orders-alert',
        type: 'PENDING_ORDERS',
        severity: 'INFO',
        title: `${pendingCount} New Orders Pending Confirmation`,
        message: 'Online customers are awaiting order acceptance and fulfillment.',
        link: '/admin/orders',
        createdAt: new Date()
      });
    }

    res.json({ success: true, count: alerts.length, data: alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
