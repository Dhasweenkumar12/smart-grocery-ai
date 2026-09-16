const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  assignDeliveryPartner,
  downloadInvoice
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

// Optional protect on createOrder to allow guest checkout or logged-in checkout
router.post('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, createOrder);

router.get('/', protect, getOrders);
router.get('/:id', getOrderById);
router.get('/:id/invoice', downloadInvoice); // Invoice PDF download

// Status update and delivery assignment
router.patch('/:id/status', protect, authorize('admin', 'staff', 'delivery'), updateOrderStatus);
router.patch('/:id/assign-delivery', protect, authorize('admin', 'staff'), assignDeliveryPartner);

module.exports = router;
