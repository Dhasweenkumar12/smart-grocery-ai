const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./config/db');
const InventoryService = require('./services/inventoryService');

// Route imports
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const batchRoutes = require('./routes/batchRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reorderRoutes = require('./routes/reorderRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const aiRoutes = require('./routes/aiRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO configuration
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Attach io to express app
app.set('socketio', io);

// Socket.io connection events
io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  socket.on('join:room', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Smart Grocery Backend API',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reorders', reorderRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/audit', auditRoutes);

// Serve Frontend SPA in Production
const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log(`[Frontend] Serving static production build from ${frontendDist}`);
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
connectDB().then(async () => {
  // Auto-seed if database is fresh/empty (e.g. fresh Docker container volume)
  try {
    const Product = require('./models/Product');
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('[Auto-Seed] Database is fresh and empty. Seeding initial catalog and FEFO batches...');
      const { seedDatabase } = require('./seed/seedData');
      await seedDatabase();
    }
  } catch (e) {
    console.warn('Auto-seed check skipped:', e.message);
  }

  // Initial check of expiry statuses
  try {
    await InventoryService.refreshBatchExpiryStatuses();
  } catch (e) {
    console.warn('Initial batch check skipped:', e.message);
  }

  server.listen(PORT, () => {
    console.log(`🚀 [Server] Smart Grocery Backend running on port ${PORT}`);
    console.log(`📡 [WebSocket] Socket.IO initialized and ready`);
  });
});
