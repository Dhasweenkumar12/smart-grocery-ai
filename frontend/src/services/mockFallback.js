// Comprehensive Mock Data & In-Browser Reactive Store for SmartGrocery AI Platform
// Automatically used when backend is initializing or offline

const INITIAL_PRODUCTS = [
  {
    _id: 'prd_1001',
    productId: 'PRD-1001',
    name: 'Fresh Pasteurised Whole Milk (1L)',
    category: 'Dairy & Eggs',
    brand: 'Aavin / Amul',
    description: 'Fresh toned rich farm milk pasteurized and packaged daily.',
    purchasePrice: 42,
    sellingPrice: 56,
    currentStock: 18,
    minStockLevel: 20,
    maxStockLevel: 150,
    unit: 'packet',
    barcode: '8901262010015',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60',
    discountPercent: 10,
    isDiscounted: true,
    salesVelocity7d: 14,
    rating: 4.8
  },
  {
    _id: 'prd_1002',
    productId: 'PRD-1002',
    name: 'Whole Wheat Sandwich Bread (400g)',
    category: 'Bakery & Bread',
    brand: 'Modern / Britania',
    description: '100% whole grain brown bread, soft & fibre-rich.',
    purchasePrice: 32,
    sellingPrice: 48,
    currentStock: 12,
    minStockLevel: 15,
    maxStockLevel: 80,
    unit: 'packet',
    barcode: '8901262010022',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    discountPercent: 15,
    isDiscounted: true,
    salesVelocity7d: 18,
    rating: 4.7
  },
  {
    _id: 'prd_1003',
    productId: 'PRD-1003',
    name: 'Amul Pasteurised Butter (500g)',
    category: 'Dairy & Eggs',
    brand: 'Amul',
    description: 'Delicious utterly butterly Amul salted pure butter block.',
    purchasePrice: 220,
    sellingPrice: 275,
    currentStock: 35,
    minStockLevel: 10,
    maxStockLevel: 100,
    unit: 'pack',
    barcode: '8901262010039',
    imageUrl: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&auto=format&fit=crop&q=60',
    discountPercent: 5,
    isDiscounted: false,
    salesVelocity7d: 8,
    rating: 4.9
  },
  {
    _id: 'prd_1004',
    productId: 'PRD-1004',
    name: 'Farm Fresh Brown Eggs (Pack of 12)',
    category: 'Dairy & Eggs',
    brand: 'FreshFarm',
    description: 'Cage-free nutritious brown eggs rich in Omega 3 and protein.',
    purchasePrice: 75,
    sellingPrice: 98,
    currentStock: 45,
    minStockLevel: 15,
    maxStockLevel: 120,
    unit: 'tray',
    barcode: '8901262010046',
    imageUrl: 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=500&auto=format&fit=crop&q=60',
    discountPercent: 0,
    isDiscounted: false,
    salesVelocity7d: 22,
    rating: 4.8
  },
  {
    _id: 'prd_1005',
    productId: 'PRD-1005',
    name: 'Royal Kohinoor Basmati Rice (5kg)',
    category: 'Grains & Staples',
    brand: 'Kohinoor',
    description: 'Extra long grain aged aromatic Basmati rice for premium biryani & pulao.',
    purchasePrice: 450,
    sellingPrice: 580,
    currentStock: 50,
    minStockLevel: 10,
    maxStockLevel: 150,
    unit: 'bag',
    barcode: '8901262010053',
    imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
    discountPercent: 8,
    isDiscounted: true,
    salesVelocity7d: 11,
    rating: 4.9
  },
  {
    _id: 'prd_1006',
    productId: 'PRD-1006',
    name: 'Organic Unpolished Toor Dal (1kg)',
    category: 'Grains & Staples',
    brand: 'Tata Sampann',
    description: 'Protein-rich natural unpolished yellow pigeon peas.',
    purchasePrice: 135,
    sellingPrice: 175,
    currentStock: 60,
    minStockLevel: 15,
    maxStockLevel: 150,
    unit: 'kg',
    barcode: '8901262010060',
    imageUrl: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?w=500&auto=format&fit=crop&q=60',
    discountPercent: 0,
    isDiscounted: false,
    salesVelocity7d: 16,
    rating: 4.7
  },
  {
    _id: 'prd_1007',
    productId: 'PRD-1007',
    name: 'Aashirvaad Shudh Chakki Atta (5kg)',
    category: 'Grains & Staples',
    brand: 'Aashirvaad',
    description: '100% whole wheat whole meal flour ground with traditional stone chakki.',
    purchasePrice: 215,
    sellingPrice: 260,
    currentStock: 40,
    minStockLevel: 12,
    maxStockLevel: 100,
    unit: 'bag',
    barcode: '8901262010077',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop&q=60',
    discountPercent: 5,
    isDiscounted: true,
    salesVelocity7d: 19,
    rating: 4.8
  },
  {
    _id: 'prd_1008',
    productId: 'PRD-1008',
    name: 'Tata Tea Gold Leaf (500g)',
    category: 'Beverages',
    brand: 'Tata Tea',
    description: 'Rich blend of aromatic CTC tea with gently rolled long leaves.',
    purchasePrice: 240,
    sellingPrice: 310,
    currentStock: 30,
    minStockLevel: 8,
    maxStockLevel: 80,
    unit: 'pack',
    barcode: '8901262010084',
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=60',
    discountPercent: 0,
    isDiscounted: false,
    salesVelocity7d: 13,
    rating: 4.6
  },
  {
    _id: 'prd_1009',
    productId: 'PRD-1009',
    name: 'Nescafe Classic Instant Coffee (100g)',
    category: 'Beverages',
    brand: 'Nescafe',
    description: 'Signature rich roast blend of pure arabica & robusta coffee.',
    purchasePrice: 210,
    sellingPrice: 265,
    currentStock: 25,
    minStockLevel: 8,
    maxStockLevel: 60,
    unit: 'jar',
    barcode: '8901262010091',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop&q=60',
    discountPercent: 10,
    isDiscounted: true,
    salesVelocity7d: 10,
    rating: 4.7
  },
  {
    _id: 'prd_1010',
    productId: 'PRD-1010',
    name: 'Crisp Royal Gala Apples (1kg)',
    category: 'Fresh Produce',
    brand: 'Kashmir Orchard',
    description: 'Sweet, crisp and juicy handpicked mountain apples.',
    purchasePrice: 140,
    sellingPrice: 195,
    currentStock: 30,
    minStockLevel: 15,
    maxStockLevel: 90,
    unit: 'kg',
    barcode: '8901262010107',
    imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60',
    discountPercent: 0,
    isDiscounted: false,
    salesVelocity7d: 15,
    rating: 4.8
  },
  {
    _id: 'prd_1011',
    productId: 'PRD-1011',
    name: 'Robusta Golden Bananas (1 Dozen)',
    category: 'Fresh Produce',
    brand: 'Trichy Farms',
    description: 'Naturally ripened, potassium packed golden bananas.',
    purchasePrice: 35,
    sellingPrice: 55,
    currentStock: 15,
    minStockLevel: 10,
    maxStockLevel: 60,
    unit: 'dozen',
    barcode: '8901262010114',
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=500&auto=format&fit=crop&q=60',
    discountPercent: 20,
    isDiscounted: true,
    salesVelocity7d: 25,
    rating: 4.6
  },
  {
    _id: 'prd_1012',
    productId: 'PRD-1012',
    name: 'Farm Fresh Vine Tomatoes (1kg)',
    category: 'Fresh Produce',
    brand: 'Dharmapuri Organics',
    description: 'Red, plump and firm garden tomatoes ideal for curries and salads.',
    purchasePrice: 28,
    sellingPrice: 42,
    currentStock: 50,
    minStockLevel: 20,
    maxStockLevel: 120,
    unit: 'kg',
    barcode: '8901262010121',
    imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=60',
    discountPercent: 0,
    isDiscounted: false,
    salesVelocity7d: 28,
    rating: 4.7
  },
  {
    _id: 'prd_1013',
    productId: 'PRD-1013',
    name: 'Barilla Italian Penne Rigate (500g)',
    category: 'Snacks & Packaged',
    brand: 'Barilla',
    description: 'Traditional 100% durum wheat semolina Italian pasta.',
    purchasePrice: 175,
    sellingPrice: 235,
    currentStock: 28,
    minStockLevel: 10,
    maxStockLevel: 60,
    unit: 'box',
    barcode: '8901262010138',
    imageUrl: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?w=500&auto=format&fit=crop&q=60',
    discountPercent: 12,
    isDiscounted: true,
    salesVelocity7d: 9,
    rating: 4.9
  },
  {
    _id: 'prd_1014',
    productId: 'PRD-1014',
    name: 'Del Monte Herb Pasta Sauce (500g)',
    category: 'Snacks & Packaged',
    brand: 'Del Monte',
    description: 'Authentic tomato sauce simmered with oregano, basil and extra virgin olive oil.',
    purchasePrice: 120,
    sellingPrice: 165,
    currentStock: 22,
    minStockLevel: 8,
    maxStockLevel: 50,
    unit: 'jar',
    barcode: '8901262010145',
    imageUrl: 'https://images.unsplash.com/photo-1572441713132-c542fc4fe282?w=500&auto=format&fit=crop&q=60',
    discountPercent: 10,
    isDiscounted: true,
    salesVelocity7d: 8,
    rating: 4.7
  }
];

const INITIAL_SUPPLIERS = [
  {
    _id: 'sup_1',
    name: 'Apex Dairy & Poultry Supplies',
    contactPerson: 'M. Anand',
    email: 'orders@apexdairy.in',
    phone: '+91 9444101010',
    address: 'Madhavaram Milk Colony, Chennai',
    categoriesSupplied: ['Dairy & Eggs'],
    rating: 4.8,
    averageDeliveryDays: 1,
    reliabilityScore: 98
  },
  {
    _id: 'sup_2',
    name: 'Golden Harvest Agro Mills',
    contactPerson: 'S. Narayanan',
    email: 'sales@goldenharvest.com',
    phone: '+91 9444202020',
    address: 'Koyambedu Wholesale Complex, Chennai',
    categoriesSupplied: ['Grains & Staples'],
    rating: 4.6,
    averageDeliveryDays: 2,
    reliabilityScore: 94
  },
  {
    _id: 'sup_3',
    name: 'Sunrise Bakeries & Snacks Co.',
    contactPerson: 'Deepa Krishnan',
    email: 'supply@sunrisebakers.com',
    phone: '+91 9444303030',
    address: 'Ambattur Industrial Estate, Chennai',
    categoriesSupplied: ['Bakery & Bread', 'Snacks & Packaged'],
    rating: 4.7,
    averageDeliveryDays: 1,
    reliabilityScore: 96
  },
  {
    _id: 'sup_4',
    name: 'Nilgiri Fresh Organics',
    contactPerson: 'K. Balaji',
    email: 'produce@nilgiriorganics.in',
    phone: '+91 9444404040',
    address: 'Fruit & Vegetable Market, Koyambedu, Chennai',
    categoriesSupplied: ['Fresh Produce'],
    rating: 4.9,
    averageDeliveryDays: 1,
    reliabilityScore: 99
  }
];

function getStored(key, fallback) {
  try {
    const data = localStorage.getItem(`sg_${key}`);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    return fallback;
  }
}

function setStored(key, value) {
  try {
    localStorage.setItem(`sg_${key}`, JSON.stringify(value));
  } catch (e) {}
}

export function initStorage() {
  if (!localStorage.getItem('sg_products')) {
    setStored('products', INITIAL_PRODUCTS);
  }
  if (!localStorage.getItem('sg_suppliers')) {
    setStored('suppliers', INITIAL_SUPPLIERS);
  }
  if (!localStorage.getItem('sg_batches')) {
    const now = new Date();
    const batches = [
      {
        _id: 'b_101',
        batchNumber: 'BAT-2026-MILK-01',
        productIdStr: 'PRD-1001',
        product: INITIAL_PRODUCTS[0],
        manufacturingDate: new Date(now.getTime() - 2 * 86400000).toISOString(),
        expiryDate: new Date(now.getTime() + 2 * 86400000).toISOString(),
        initialQuantity: 30,
        currentQuantity: 18,
        costPrice: 42,
        locationRack: 'COOLER-A1',
        status: 'CRITICAL_EXPIRY_7D',
        daysToExpiry: 2
      },
      {
        _id: 'b_102',
        batchNumber: 'BAT-2026-BREAD-04',
        productIdStr: 'PRD-1002',
        product: INITIAL_PRODUCTS[1],
        manufacturingDate: new Date(now.getTime() - 1 * 86400000).toISOString(),
        expiryDate: new Date(now.getTime() + 3 * 86400000).toISOString(),
        initialQuantity: 25,
        currentQuantity: 12,
        costPrice: 32,
        locationRack: 'BAKERY-R2',
        status: 'CRITICAL_EXPIRY_7D',
        daysToExpiry: 3
      },
      {
        _id: 'b_103',
        batchNumber: 'BAT-2026-BUTTER-09',
        productIdStr: 'PRD-1003',
        product: INITIAL_PRODUCTS[2],
        manufacturingDate: new Date(now.getTime() - 10 * 86400000).toISOString(),
        expiryDate: new Date(now.getTime() + 60 * 86400000).toISOString(),
        initialQuantity: 40,
        currentQuantity: 35,
        costPrice: 220,
        locationRack: 'CHILLER-C3',
        status: 'ACTIVE',
        daysToExpiry: 60
      }
    ];
    setStored('batches', batches);
  }
  if (!localStorage.getItem('sg_orders')) {
    const orders = [
      {
        _id: 'ord_demo_1',
        orderNumber: 'ORD-2026-8801',
        customerDetails: {
          name: 'Priya Sundaram',
          phone: '+91 9840112233',
          address: 'Flat 4B, Green Acres, Adyar, Chennai'
        },
        items: [
          {
            product: 'prd_1001',
            productIdStr: 'PRD-1001',
            productName: 'Fresh Pasteurised Whole Milk (1L)',
            quantity: 2,
            unitPrice: 56,
            subtotal: 112
          },
          {
            product: 'prd_1002',
            productIdStr: 'PRD-1002',
            productName: 'Whole Wheat Sandwich Bread (400g)',
            quantity: 1,
            unitPrice: 48,
            subtotal: 48
          }
        ],
        subtotal: 160,
        discountAmount: 16,
        taxAmount: 8,
        deliveryFee: 20,
        finalTotal: 172,
        profitEarned: 52,
        paymentMethod: 'UPI',
        paymentStatus: 'COMPLETED',
        transactionId: 'UPI-9840-0012',
        orderStatus: 'Out for Delivery',
        orderType: 'ONLINE',
        deliveryPartnerName: 'Karthik Raja (Delivery Partner)',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        statusTimeline: [
          { status: 'Placed', timestamp: new Date(Date.now() - 3600000).toISOString(), notes: 'Order placed via Online App' },
          { status: 'Packed', timestamp: new Date(Date.now() - 2400000).toISOString(), notes: 'Picked using FEFO batch' },
          { status: 'Out for Delivery', timestamp: new Date(Date.now() - 900000).toISOString(), notes: 'Assigned to Karthik Raja' }
        ]
      }
    ];
    setStored('orders', orders);
  }
  if (!localStorage.getItem('sg_reorders')) {
    const pos = [
      {
        _id: 'po_demo_1',
        poNumber: 'PO-2026-0041',
        supplierName: 'Apex Dairy & Poultry Supplies',
        totalCost: 2100,
        status: 'RECOMMENDED_BY_AI',
        triggerReason: 'AUTOMATED_MIN_STOCK_REORDER',
        createdAt: new Date().toISOString(),
        items: [
          {
            productIdStr: 'PRD-1001',
            productName: 'Fresh Pasteurised Whole Milk (1L)',
            recommendedQuantity: 50,
            orderQuantity: 50,
            estimatedUnitCost: 42,
            totalCost: 2100
          }
        ]
      }
    ];
    setStored('reorders', pos);
  }
  if (!localStorage.getItem('sg_staff')) {
    const staff = [
      { _id: 'u_admin', name: 'Harish Kumar (Admin)', email: 'admin@grocery.com', role: 'admin', phone: '+91 9840123456' },
      { _id: 'u_staff', name: 'Ravi Shankar (Staff)', email: 'staff@grocery.com', role: 'staff', phone: '+91 9840654321' },
      { _id: 'u_delivery', name: 'Karthik Raja (Delivery Partner)', email: 'delivery@grocery.com', role: 'delivery', phone: '+91 9840998877' },
      { _id: 'u_cust', name: 'Priya Sundaram', email: 'customer@gmail.com', role: 'customer', phone: '+91 9840112233' }
    ];
    setStored('staff', staff);
  }
  if (!localStorage.getItem('sg_audit')) {
    const logs = [
      { _id: 'aud_1', action: 'FEFO_BATCH_VERIFIED', entityType: 'Batch', performedByName: 'System Bot', details: 'Refreshed batch expiry indicators', createdAt: new Date().toISOString() },
      { _id: 'aud_2', action: 'ORDER_PLACED', entityType: 'Order', performedByName: 'Priya Sundaram', details: 'Order ORD-2026-8801 submitted via UPI', createdAt: new Date(Date.now() - 3600000).toISOString() }
    ];
    setStored('audit', logs);
  }
}

// Transparent Mock API Resolver
export async function resolveMockRequest(method, url, data = {}, params = {}) {
  initStorage();

  const cleanUrl = url.replace(/^\/api/, '').split('?')[0];

  // Auth Routes
  if (cleanUrl === '/auth/login' || cleanUrl === '/auth/register') {
    const roleAccounts = {
      'admin@grocery.com': { _id: 'u_admin', name: 'Harish Kumar (Admin)', email: 'admin@grocery.com', role: 'admin' },
      'staff@grocery.com': { _id: 'u_staff', name: 'Ravi Shankar (Staff)', email: 'staff@grocery.com', role: 'staff' },
      'delivery@grocery.com': { _id: 'u_delivery', name: 'Karthik Raja (Delivery)', email: 'delivery@grocery.com', role: 'delivery' },
      'customer@gmail.com': { _id: 'u_cust', name: 'Priya Sundaram', email: 'customer@gmail.com', role: 'customer' }
    };
    const user = roleAccounts[data.email] || {
      _id: 'u_custom',
      name: data.name || data.email.split('@')[0],
      email: data.email,
      role: data.role || 'customer'
    };
    return {
      success: true,
      token: 'demo_jwt_token_2026_' + user.role,
      user
    };
  }

  if (cleanUrl === '/auth/me') {
    const staff = getStored('staff', []);
    return { success: true, user: staff[0] };
  }

  if (cleanUrl === '/auth/staff') {
    const staff = getStored('staff', []);
    if (method === 'post') {
      const newUser = { _id: 'u_' + Date.now(), ...data };
      staff.push(newUser);
      setStored('staff', staff);
      return { success: true, user: newUser, data: newUser };
    }
    return { success: true, count: staff.length, data: staff, staff };
  }

  if (cleanUrl.startsWith('/auth/staff/')) {
    const id = cleanUrl.split('/')[3];
    let staff = getStored('staff', []);
    staff = staff.filter(s => s._id !== id);
    setStored('staff', staff);
    return { success: true, message: 'Staff deleted' };
  }

  // Products
  if (cleanUrl === '/products') {
    let products = getStored('products', INITIAL_PRODUCTS);
    if (params?.category && params.category !== 'All') {
      products = products.filter(p => p.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      products = products.filter(p => p.name.toLowerCase().includes(q) || p.barcode?.includes(q));
    }
    return { success: true, count: products.length, data: products, products };
  }

  if (cleanUrl.startsWith('/products/barcode/')) {
    const code = cleanUrl.split('/')[3];
    const products = getStored('products', INITIAL_PRODUCTS);
    const found = products.find(p => p.barcode === code || p.productId === code);
    if (!found) {
      const err = new Error('Product not found for barcode: ' + code);
      err.response = { status: 404, data: { message: 'Barcode not in catalog' } };
      throw err;
    }
    return { success: true, data: found, product: found };
  }

  if (cleanUrl.startsWith('/products/') && method === 'get') {
    const id = cleanUrl.split('/')[2];
    const products = getStored('products', INITIAL_PRODUCTS);
    const found = products.find(p => p._id === id || p.productId === id);
    const item = found || products[0];
    return { success: true, data: item, product: item };
  }

  // Batches
  if (cleanUrl === '/batches') {
    let batches = getStored('batches', []);
    if (method === 'post') {
      const newBatch = {
        _id: 'b_' + Date.now(),
        ...data,
        daysToExpiry: Math.ceil((new Date(data.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      };
      batches.unshift(newBatch);
      setStored('batches', batches);
      return { success: true, data: newBatch, batch: newBatch };
    }
    return { success: true, count: batches.length, data: batches, batches };
  }

  if (cleanUrl === '/batches/alerts') {
    const batches = getStored('batches', []);
    const near = batches.filter(b => b.daysToExpiry <= 7);
    return {
      success: true,
      count: near.length,
      data: near,
      alerts: near,
      summary: {
        critical: near.length,
        warning: 1,
        healthy: batches.length - near.length
      }
    };
  }

  // Orders
  if (cleanUrl === '/orders') {
    let orders = getStored('orders', []);
    if (method === 'post') {
      const newOrder = {
        _id: 'ord_' + Date.now(),
        orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        statusTimeline: [{ status: 'Placed', timestamp: new Date().toISOString(), notes: 'Order placed' }],
        createdAt: new Date().toISOString(),
        orderStatus: data.orderType === 'IN_STORE_POS' ? 'Delivered' : 'Placed',
        ...data
      };
      orders.unshift(newOrder);
      setStored('orders', orders);

      // Deduct stock
      let products = getStored('products', INITIAL_PRODUCTS);
      if (data.items) {
        data.items.forEach(item => {
          const p = products.find(prod => prod._id === item.product || prod.productId === item.productIdStr);
          if (p) p.currentStock = Math.max(0, p.currentStock - item.quantity);
        });
        setStored('products', products);
      }

      return { success: true, data: newOrder, order: newOrder };
    }
    return { success: true, count: orders.length, data: orders, orders };
  }

  if (cleanUrl.startsWith('/orders/') && cleanUrl.endsWith('/status')) {
    const id = cleanUrl.split('/')[2];
    let orders = getStored('orders', []);
    const ord = orders.find(o => o._id === id);
    if (ord) {
      ord.orderStatus = data.status || ord.orderStatus;
      ord.statusTimeline.push({ status: ord.orderStatus, timestamp: new Date().toISOString(), notes: data.notes || '' });
      setStored('orders', orders);
    }
    return { success: true, data: ord, order: ord };
  }

  if (cleanUrl.startsWith('/orders/') && cleanUrl.endsWith('/assign-delivery')) {
    const id = cleanUrl.split('/')[2];
    let orders = getStored('orders', []);
    const ord = orders.find(o => o._id === id);
    if (ord) {
      ord.deliveryPartnerName = data.deliveryPartnerName || 'Karthik Raja';
      ord.orderStatus = 'Out for Delivery';
      setStored('orders', orders);
    }
    return { success: true, data: ord, order: ord };
  }

  // Reorders / Purchase Orders
  if (cleanUrl === '/reorders') {
    let reorders = getStored('reorders', []);
    return { success: true, count: reorders.length, data: reorders, purchaseOrders: reorders };
  }

  if (cleanUrl.startsWith('/reorders/') && cleanUrl.endsWith('/approve')) {
    const id = cleanUrl.split('/')[2];
    let reorders = getStored('reorders', []);
    const po = reorders.find(r => r._id === id);
    if (po) {
      po.status = 'APPROVED';
      setStored('reorders', reorders);
    }
    return { success: true, data: po, purchaseOrder: po };
  }

  if (cleanUrl.startsWith('/reorders/') && cleanUrl.endsWith('/receive')) {
    const id = cleanUrl.split('/')[2];
    let reorders = getStored('reorders', []);
    const po = reorders.find(r => r._id === id);
    if (po) {
      po.status = 'RECEIVED';
      po.receivedAt = new Date().toISOString();
      setStored('reorders', reorders);

      // Increase stock
      let products = getStored('products', INITIAL_PRODUCTS);
      po.items.forEach(item => {
        const prod = products.find(p => p.productId === item.productIdStr);
        if (prod) prod.currentStock += item.orderQuantity;
      });
      setStored('products', products);
    }
    return { success: true, data: po, purchaseOrder: po };
  }

  if (cleanUrl === '/reorders/scan') {
    let products = getStored('products', INITIAL_PRODUCTS);
    let reorders = getStored('reorders', []);
    const low = products.filter(p => p.currentStock <= p.minStockLevel);
    low.forEach(p => {
      const exists = reorders.some(r => r.items?.some(i => i.productIdStr === p.productId) && r.status !== 'RECEIVED');
      if (!exists) {
        reorders.unshift({
          _id: 'po_' + Date.now(),
          poNumber: 'PO-' + Math.floor(1000 + Math.random() * 9000),
          supplierName: 'Apex Dairy & Poultry Supplies',
          totalCost: p.purchasePrice * 30,
          status: 'RECOMMENDED_BY_AI',
          triggerReason: 'AUTOMATED_MIN_STOCK_REORDER',
          createdAt: new Date().toISOString(),
          items: [{
            productIdStr: p.productId,
            productName: p.name,
            recommendedQuantity: 30,
            orderQuantity: 30,
            estimatedUnitCost: p.purchasePrice,
            totalCost: p.purchasePrice * 30
          }]
        });
      }
    });
    setStored('reorders', reorders);
    return { success: true, count: low.length, message: `Scanned catalog. Created ${low.length} AI replenishment orders.` };
  }

  // Suppliers
  if (cleanUrl === '/suppliers') {
    const suppliers = getStored('suppliers', INITIAL_SUPPLIERS);
    if (method === 'post') {
      const newSup = { _id: 'sup_' + Date.now(), ...data };
      suppliers.push(newSup);
      setStored('suppliers', suppliers);
      return { success: true, data: newSup, supplier: newSup };
    }
    return { success: true, count: suppliers.length, data: suppliers, suppliers };
  }

  if (cleanUrl === '/suppliers/recommend') {
    const suppliers = getStored('suppliers', INITIAL_SUPPLIERS);
    const rec = suppliers[0];
    return { success: true, data: rec, bestRecommendation: rec, recommendedSupplier: rec };
  }

  // AI & Gemini
  if (cleanUrl === '/ai/chat') {
    const { message = '' } = data;
    const lower = message.toLowerCase();
    let reply = `🛒 **SmartGrocery AI Culinary & Shopping Assistant**\n\nI am happy to assist you! `;
    if (lower.includes('recipe') || lower.includes('cook') || lower.includes('make')) {
      reply += `Based on your cart, you can make delicious **Classic Butter Toasted Sandwich with Eggs** or **Creamy Garlic Penne Pasta**! Would you like cooking instructions?`;
    } else if (lower.includes('milk') || lower.includes('bread') || lower.includes('offer')) {
      reply += `Great choices! Milk and Whole Wheat Bread are freshly stocked from today's morning delivery. We also offer a 15% markdown on Sandwich Bread!`;
    } else {
      reply += `I can recommend ingredients, generate gourmet recipes from your cart items, or check shelf-life expiration badges. Feel free to ask anything!`;
    }
    return { success: true, reply, source: 'gemini-1.5-flash-simulated', isLive: true };
  }

  if (cleanUrl === '/ai/recipes') {
    return {
      success: true,
      recipes: [
        {
          name: 'Golden Herb Scrambled Eggs on Buttered Toast',
          cookTime: '10 mins',
          difficulty: 'Easy',
          calories: '320 kcal',
          usedFromCart: ['Farm Fresh Brown Eggs', 'Whole Wheat Sandwich Bread', 'Amul Pasteurised Butter'],
          recommendedToAdd: ['Black Pepper', 'Fresh Parsley'],
          instructions: [
            'Whisk 2 fresh eggs with a pinch of salt and a tablespoon of milk.',
            'Melt Amul Butter in a pan over medium heat.',
            'Gently fold the eggs until soft curd forms.',
            'Serve immediately over toasted golden brown bread slices.'
          ]
        },
        {
          name: 'Aromatic Cardamom Masala Chai with Biscuits',
          cookTime: '8 mins',
          difficulty: 'Quick',
          calories: '140 kcal',
          usedFromCart: ['Fresh Pasteurised Whole Milk', 'Tata Tea Gold Leaf'],
          recommendedToAdd: ['Cardamom Pods', 'Ginger'],
          instructions: [
            'Crush fresh ginger and cardamom pods into 1 cup of boiling water.',
            'Add 1 tbsp of Tata Tea Gold and simmer for 2 minutes.',
            'Pour in rich whole milk and bring to a rolling boil.',
            'Strain into a cup and enjoy steaming hot.'
          ]
        }
      ],
      source: 'gemini-1.5-flash-simulated'
    };
  }

  if (cleanUrl === '/ai/cart-recommendations') {
    const products = getStored('products', INITIAL_PRODUCTS);
    const recs = products.slice(0, 3).map(p => ({
      ...p,
      reason: 'Frequently bought together with your selected items'
    }));
    return { success: true, data: recs, recommendations: recs };
  }

  if (cleanUrl === '/ai/smart-offers') {
    const products = getStored('products', INITIAL_PRODUCTS);
    const discounted = products.filter(p => p.isDiscounted || p.discountPercent > 0);
    return { success: true, count: discounted.length, data: discounted, offers: discounted };
  }

  if (cleanUrl === '/ai/insights') {
    const insights = {
      summary: 'FEFO stock rotation is performing with 96% efficiency. 2 batches in Dairy & Bakery are within critical 3-day expiry windows.',
      recommendations: [
        'Activate 15% markdown badge on Whole Wheat Bread to accelerate sales velocity before expiry.',
        'Consolidate dairy orders with Apex Dairy & Poultry for next-day dispatch.',
        'Reorder Aashirvaad Chakki Atta to replenish safety stock buffer.'
      ]
    };
    return { success: true, data: insights, insights, ...insights };
  }

  if (cleanUrl === '/ai/forecast/all' || cleanUrl.startsWith('/ai/forecast/')) {
    const products = getStored('products', INITIAL_PRODUCTS);
    const forecasts = products.map(p => ({
      productId: p.productId,
      productName: p.name,
      currentStock: p.currentStock,
      minStock: p.minStockLevel,
      avgDailySales: p.salesVelocity7d || 12,
      predictedDailyDemand: p.salesVelocity7d || 12,
      predictedDemandNext7Days: Math.round((p.salesVelocity7d || 12) * 7 * 1.15),
      stockRunoutDays: Math.round((p.currentStock / (p.salesVelocity7d || 12)) * 10) / 10,
      reorderStatus: p.currentStock <= p.minStockLevel ? 'CRITICAL' : 'STABLE',
      recommendedReorderUnits: p.currentStock <= p.minStockLevel ? p.minStockLevel * 2 : 0,
      confidenceScore: 0.94
    }));
    if (cleanUrl.startsWith('/ai/forecast/') && cleanUrl !== '/ai/forecast/all') {
      const pid = cleanUrl.split('/')[3];
      const single = forecasts.find(f => f.productId === pid || f._id === pid) || forecasts[0];
      return { success: true, data: single, forecast: single };
    }
    return { success: true, count: forecasts.length, data: forecasts, forecasts };
  }

  // Analytics
  if (cleanUrl === '/analytics/stats') {
    const products = getStored('products', INITIAL_PRODUCTS);
    const orders = getStored('orders', []);
    const batches = getStored('batches', []);

    const totalStock = products.reduce((acc, p) => acc + (p.currentStock || 0), 0);
    const todaySales = orders.reduce((acc, o) => acc + (o.finalTotal || 0), 0);
    const todayProfit = orders.reduce((acc, o) => acc + (o.profitEarned || 0), 0);
    const lowStockCount = products.filter(p => p.currentStock <= p.minStockLevel).length;
    const expiringBatchesCount = batches.filter(b => b.daysToExpiry <= 7).length;

    const stats = {
      totalProducts: products.length,
      totalStock,
      todaySales: Math.round(todaySales),
      todayProfit: Math.round(todayProfit),
      todayOrdersCount: orders.length,
      onlineOrdersCount: orders.filter(o => o.orderType === 'ONLINE').length,
      lowStockCount,
      expiringBatchesCount,
      pendingOrdersCount: orders.filter(o => o.orderStatus === 'Placed').length
    };

    return { success: true, data: stats, stats };
  }

  if (cleanUrl === '/analytics/charts') {
    const products = getStored('products', INITIAL_PRODUCTS);
    const catMap = {};
    products.forEach(p => {
      if (!catMap[p.category]) catMap[p.category] = { count: 0, totalStock: 0, inventoryValue: 0 };
      catMap[p.category].count += 1;
      catMap[p.category].totalStock += p.currentStock;
      catMap[p.category].inventoryValue += p.currentStock * p.purchasePrice;
    });

    const categoryBreakdown = Object.keys(catMap).map(k => ({
      _id: k,
      count: catMap[k].count,
      totalStock: catMap[k].totalStock,
      inventoryValue: catMap[k].inventoryValue
    }));

    const salesTrend = [
      { _id: 'Mon', totalRevenue: 12400, totalProfit: 3400, unitsSold: 210 },
      { _id: 'Tue', totalRevenue: 14800, totalProfit: 4100, unitsSold: 245 },
      { _id: 'Wed', totalRevenue: 13900, totalProfit: 3800, unitsSold: 230 },
      { _id: 'Thu', totalRevenue: 16500, totalProfit: 4600, unitsSold: 280 },
      { _id: 'Fri', totalRevenue: 21200, totalProfit: 5900, unitsSold: 360 },
      { _id: 'Sat', totalRevenue: 27800, totalProfit: 7800, unitsSold: 470 },
      { _id: 'Sun', totalRevenue: 25400, totalProfit: 7100, unitsSold: 420 }
    ];

    const bestSellers = products.slice(0, 5).map(p => ({
      name: p.name,
      category: p.category,
      unitsSold: p.salesVelocity7d * 7,
      revenue: (p.salesVelocity7d * 7) * p.sellingPrice,
      profit: (p.salesVelocity7d * 7) * (p.sellingPrice - p.purchasePrice)
    }));

    const slowMovers = products.slice(-3).map(p => ({
      name: p.name,
      category: p.category,
      stock: p.currentStock,
      price: p.sellingPrice
    }));

    const chartData = {
      categoryBreakdown,
      salesTrend,
      bestSellers,
      slowMovers
    };

    return { success: true, data: chartData, ...chartData };
  }

  if (cleanUrl === '/analytics/alerts') {
    const products = getStored('products', INITIAL_PRODUCTS);
    const batches = getStored('batches', []);
    const alerts = [];

    products.filter(p => p.currentStock <= p.minStockLevel).forEach(p => {
      alerts.push({
        id: 'low-' + p._id,
        type: 'LOW_STOCK',
        severity: p.currentStock === 0 ? 'CRITICAL' : 'WARNING',
        title: `Low Stock: ${p.name}`,
        message: `Current stock (${p.currentStock} ${p.unit}) is at or below threshold (${p.minStockLevel})`,
        link: '/inventory',
        createdAt: new Date()
      });
    });

    batches.filter(b => b.daysToExpiry <= 7).forEach(b => {
      alerts.push({
        id: 'exp-' + b._id,
        type: 'NEAR_EXPIRY',
        severity: 'CRITICAL',
        title: `Expiring Soon: ${b.product?.name || b.batchNumber}`,
        message: `Batch ${b.batchNumber} (${b.currentQuantity} units) expires in ${b.daysToExpiry} days. Apply markdown clearance!`,
        link: '/inventory',
        createdAt: new Date()
      });
    });

    return { success: true, count: alerts.length, data: alerts, alerts };
  }

  if (cleanUrl === '/audit') {
    const logs = getStored('audit', []);
    return { success: true, count: logs.length, data: logs, logs };
  }

  // Default fallback
  return { success: true, message: 'Operation completed in offline simulation mode' };
}
