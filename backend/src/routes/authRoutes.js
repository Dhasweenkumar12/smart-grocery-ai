const express = require('express');
const router = express.Router();
const { register, login, getMe, listStaff, createStaff, deleteStaff } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Staff management
router.get('/staff', protect, authorize('admin'), listStaff);
router.post('/staff', protect, authorize('admin'), createStaff);
router.delete('/staff/:id', protect, authorize('admin'), deleteStaff);

module.exports = router;
