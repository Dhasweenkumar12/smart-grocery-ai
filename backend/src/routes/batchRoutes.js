const express = require('express');
const router = express.Router();
const { getBatches, addBatch, getExpiryAlerts } = require('../controllers/batchController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('admin', 'staff'), getBatches);
router.get('/alerts', protect, authorize('admin', 'staff'), getExpiryAlerts);
router.post('/', protect, authorize('admin', 'staff'), addBatch);

module.exports = router;
