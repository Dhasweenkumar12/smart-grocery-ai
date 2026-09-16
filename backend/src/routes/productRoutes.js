const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  scanBarcode,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');

// Public/Customer browsing & Barcode scanner lookup
router.get('/', getProducts);
router.get('/barcode/:code', scanBarcode);
router.get('/:id', getProductById);

// Admin/Staff Product Management
router.post('/', protect, authorize('admin', 'staff'), createProduct);
router.put('/:id', protect, authorize('admin', 'staff'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

module.exports = router;
