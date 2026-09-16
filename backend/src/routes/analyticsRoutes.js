const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAnalyticsCharts,
  getIntelligentAlerts
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin', 'staff'), getDashboardStats);
router.get('/charts', protect, authorize('admin', 'staff'), getAnalyticsCharts);
router.get('/alerts', protect, authorize('admin', 'staff'), getIntelligentAlerts);

module.exports = router;
