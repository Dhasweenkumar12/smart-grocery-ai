import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import { useCart } from '../context/CartContext';
import {
  Search,
  ShoppingCart,
  Clock,
  CheckCircle,
  Plus,
  Minus,
  ArrowRight,
  X,
  Flame,
  Zap,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

const CATEGORY_ICONS = {
  'All': '🛒',
  'Dairy & Eggs': '🥛',
  'Dairy': '🥛',
  'Fresh Produce': '🥦',
  'Fruits & Vegetables': '🍎',
  'Bakery & Staples': '🍞',
  'Bakery': '🍞',
  'Grains & Staples': '🌾',
  'Grains & Pulses': '🌾',
  'Grains': '🌾',
  'Snacks & Munchies': '🍿',
  'Snacks': '🍿',
  'Beverages': '🧃',
  'Household': '🧼',
  'Instant Foods': '🍜'
};

export const Storefront = ({ onGoToCart }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [smartOffers, setSmartOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { cart, addToCart, updateQuantity, totalItemsCount, finalTotal } = useCart();

  const fetchProducts = async () => {
    try {
      const res = await groceryApi.getProducts();
      const prods = res.data.data || [];
      setProducts(prods);
      const cats = ['All', ...new Set(prods.map((p) => p.category))];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartOffers = async () => {
    try {
      const res = await groceryApi.getSmartOffers();
      setSmartOffers(res.data.offers || []);
    } catch (err) {
      console.warn('Smart offers offline:', err.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchSmartOffers();
  }, []);

  // Listen to real-time stock deductions
  useEffect(() => {
    const handleStockUpdate = (data) => {
      setProducts((prev) =>
        prev.map((p) =>
          p._id === data.productId ? { ...p, currentStock: data.currentStock } : p
        )
      );
    };

    socket.on('stock:updated', handleStockUpdate);
    return () => socket.off('stock:updated', handleStockUpdate);
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getCartQuantity = (productId) => {
    const item = cart.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8 pb-28">
      {/* Editorial Modern Hero */}
      <div className="rounded-2xl bg-[#09090b] text-white p-7 sm:p-10 shadow-sm border border-zinc-800 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>FEFO Shelf Dispatch • Real-Time Stock Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-zinc-100">
            Fresh goods. <br />
            <span className="text-zinc-400 font-normal">Real-time shelves.</span> Zero waste.
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg font-normal">
            Multi-batch grocery catalog managed via First-Expired First-Out (FEFO) logic and Scikit-Learn demand forecasting.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('catalog-grid');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-xs shadow-xs transition btn-tactile flex items-center space-x-2"
            >
              <span>Browse Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center space-x-3 text-xs text-zinc-400">
              <span className="flex items-center space-x-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Express 15m Dispatch</span>
              </span>
              <span className="text-zinc-700">•</span>
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Freshness Guaranteed</span>
              </span>
            </div>
          </div>
        </div>

        {/* Minimal ambient light effect */}
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>
      </div>

      {/* Near-Expiry Dynamic Markdown Flash Deals Banner */}
      {smartOffers.length > 0 && (
        <div className="bg-[#fffbeb] border border-amber-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-amber-800 flex items-center justify-center">
                <Flame className="w-4 h-4 text-amber-600 fill-amber-500" />
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base text-amber-950 flex items-center space-x-2">
                  <span>Near-Expiry Dynamic Markdowns</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-200/60 text-amber-900 font-mono">
                    Clearance Tier
                  </span>
                </h2>
                <p className="text-[11px] text-amber-900/80">
                  Automated shelf discounts calibrated by days-to-expiry to prevent grocery disposal.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold text-amber-900 flex items-center space-x-1 self-start sm:self-auto">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Limited Shelf Units</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {smartOffers.map((offer) => {
              const prod = products.find((p) => p._id === offer.productId);
              const cartQty = getCartQuantity(offer.productId);

              return (
                <div
                  key={offer.productId}
                  className="bg-white p-3.5 rounded-xl border border-amber-200/70 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black font-mono uppercase px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-200/80">
                        {offer.suggestedDiscount}% OFF
                      </span>
                      <span className="text-[11px] text-amber-800 font-medium flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>{offer.daysToExpiry}d left</span>
                      </span>
                    </div>
                    <h4 className="font-bold text-zinc-900 text-xs mt-2 line-clamp-1">
                      {offer.productName}
                    </h4>
                    <p className="text-[11px] text-zinc-500 line-clamp-1 mt-0.5">{offer.reason}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-zinc-100">
                    <div>
                      <span className="text-xs line-through text-zinc-400 mr-1.5 tabular-nums">
                        ₹{offer.currentPrice}
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700 tabular-nums">
                        ₹{offer.suggestedPrice}
                      </span>
                    </div>

                    {cartQty > 0 ? (
                      <div className="flex items-center space-x-1 bg-zinc-900 rounded-lg p-0.5 text-white">
                        <button
                          onClick={() => updateQuantity(offer.productId, cartQty - 1)}
                          className="w-5 h-5 rounded hover:bg-zinc-800 flex items-center justify-center transition btn-tactile"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-[11px] font-bold px-1 tabular-nums">{cartQty}</span>
                        <button
                          onClick={() => {
                            if (prod) addToCart({ ...prod, sellingPrice: offer.suggestedPrice }, 1);
                          }}
                          className="w-5 h-5 rounded hover:bg-zinc-800 flex items-center justify-center transition btn-tactile"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (prod) {
                            addToCart({ ...prod, sellingPrice: offer.suggestedPrice }, 1);
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center space-x-1 shadow-2xs transition btn-tactile"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>Claim</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Category Filters */}
      <div id="catalog-grid" className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search input with clear button */}
          <div className="relative w-full md:w-88">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by product, brand, or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-zinc-200 bg-white text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-zinc-900 shadow-2xs placeholder:text-zinc-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category filter pills with icons */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => {
              const icon = CATEGORY_ICONS[cat] || '📦';
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium flex items-center space-x-1.5 transition btn-tactile ${
                    isSelected
                      ? 'bg-zinc-900 text-white shadow-2xs font-semibold'
                      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{cat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results status indicator */}
        <div className="flex items-center justify-between text-xs text-zinc-500 px-0.5">
          <span>
            Showing <strong className="text-zinc-900 tabular-nums font-semibold">{filteredProducts.length}</strong> items in{' '}
            <span className="font-semibold text-zinc-800">{selectedCategory}</span>
          </span>
          {searchQuery && (
            <span>
              Query: &quot;<span className="text-zinc-700 font-semibold">{searchQuery}</span>&quot;
            </span>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="card-craft rounded-2xl p-4 space-y-3 animate-pulse">
                <div className="aspect-square bg-zinc-100 rounded-xl"></div>
                <div className="h-4 bg-zinc-100 rounded w-3/4"></div>
                <div className="h-3 bg-zinc-100 rounded w-1/2"></div>
                <div className="h-8 bg-zinc-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 p-8 space-y-3">
            <p className="text-sm font-bold text-zinc-800">No items found</p>
            <p className="text-xs text-zinc-400">Try modifying your keyword search or category filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-xs font-semibold btn-tactile"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const isLowStock = product.currentStock <= product.minStockLevel && product.currentStock > 0;
              const isOutOfStock = product.currentStock <= 0;
              const cartQty = getCartQuantity(product._id);

              return (
                <div
                  key={product._id}
                  className="card-craft rounded-2xl p-3.5 flex flex-col justify-between group relative"
                >
                  <div className="space-y-2.5">
                    {/* Product Image Container */}
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                        }}
                      />

                      {/* Category badge */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-semibold text-zinc-700 shadow-2xs border border-zinc-200/50">
                        {product.category}
                      </span>

                      {/* Stock Warning Badge */}
                      {isOutOfStock ? (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-bold shadow-2xs">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-2xs">
                          {product.currentStock} left
                        </span>
                      ) : null}
                    </div>

                    {/* Product Info */}
                    <div>
                      <span className="text-[10px] text-zinc-400 font-semibold block uppercase tracking-wider">
                        {product.brand}
                      </span>
                      <h3 className="font-semibold text-zinc-900 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-emerald-700 transition">
                        {product.name}
                      </h3>
                      <span className="text-[11px] text-zinc-500 mt-0.5 block">
                        Unit: {product.unit}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Stepper */}
                  <div className="pt-3 mt-2 border-t border-zinc-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-base font-bold text-zinc-950 tabular-nums">
                        ₹{product.sellingPrice}
                      </span>
                    </div>

                    {cartQty > 0 ? (
                      <div className="flex items-center space-x-1.5 bg-zinc-900 rounded-lg p-0.5 text-white shadow-2xs">
                        <button
                          onClick={() => updateQuantity(product._id, cartQty - 1)}
                          className="w-5 h-5 rounded hover:bg-zinc-800 flex items-center justify-center transition btn-tactile"
                          title="Decrease"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold px-1 tabular-nums">{cartQty}</span>
                        <button
                          onClick={() => updateQuantity(product._id, cartQty + 1)}
                          disabled={cartQty >= product.currentStock}
                          className="w-5 h-5 rounded hover:bg-zinc-800 disabled:opacity-40 flex items-center justify-center transition btn-tactile"
                          title="Increase"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product, 1)}
                        disabled={isOutOfStock}
                        className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center space-x-1 shadow-2xs transition btn-tactile"
                      >
                        <Plus className="w-3 h-3 text-emerald-400" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar (Minimalist Island UX) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 w-11/12 max-w-sm bg-[#09090b] text-white px-4 py-3 rounded-full shadow-2xl flex items-center justify-between z-30 border border-zinc-800 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center space-x-2.5 pl-1">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-[11px] tabular-nums text-white">
              {totalItemsCount}
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 leading-tight">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </p>
              <p className="text-[11px] text-emerald-400 font-bold tabular-nums">
                Total: ₹{finalTotal}
              </p>
            </div>
          </div>
          <button
            onClick={onGoToCart}
            className="px-3.5 py-1.5 bg-white hover:bg-zinc-100 text-zinc-950 rounded-full text-xs font-bold flex items-center space-x-1.5 transition btn-tactile shadow-xs"
          >
            <span>Review Bag</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
