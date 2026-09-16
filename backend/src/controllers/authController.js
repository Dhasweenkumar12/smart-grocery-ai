const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { logAction } = require('../middleware/audit');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'smart_grocery_super_secret_jwt_key_2026', {
    expiresIn: '30d'
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'customer',
      phone,
      address
    });

    await logAction({
      req,
      action: 'LOGIN',
      details: `New user registered: ${user.name} (${user.email}) as ${user.role}`
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    await logAction({
      req: { user, headers: req.headers, socket: req.socket },
      action: 'LOGIN',
      details: `User ${user.email} (${user.role}) logged in successfully`
    });

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
};

// Staff management (Admin only)
exports.listStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: { $in: ['admin', 'staff', 'delivery'] } }).select('-password');
    res.json({ success: true, count: staff.length, data: staff });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const staff = await User.create({
      name,
      email,
      password,
      role: role || 'staff',
      phone
    });

    await logAction({
      req,
      action: 'PRODUCT_CREATED', // System operation
      details: `Admin created new staff member ${staff.name} (${staff.role})`
    });

    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: { id: staff._id, name: staff.name, email: staff.email, role: staff.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
