const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  approvePurchaseOrder,
  receivePurchaseOrder,
  scanAndGenerateReorders
} = require('../controllers/reorderController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'staff'), getPurchaseOrders);
router.patch('/:id/approve', protect, authorize('admin'), approvePurchaseOrder);
router.patch('/:id/receive', protect, authorize('admin', 'staff'), receivePurchaseOrder);
router.post('/scan', protect, authorize('admin', 'staff'), scanAndGenerateReorders);

module.exports = router;
