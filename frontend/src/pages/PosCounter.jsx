import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  FileText,
  CreditCard,
  QrCode,
  CheckCircle,
  Receipt
} from 'lucide-react';

export const PosCounter = () => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [posCart, setPosCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [cashTendered, setCashTendered] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    groceryApi.getProducts().then((res) => setRecentProducts(res.data.data.slice(0, 8)));
  }, []);

  const handleScanOrSearch = async (e) => {
    if (e) e.preventDefault();
    if (!barcodeInput) return;

    try {
      const res = await groceryApi.scanBarcode(barcodeInput.trim());
      const prod = res.data.data;
      addItemToPos(prod);
      setBarcodeInput('');
    } catch (err) {
      alert(`Barcode "${barcodeInput}" not recognized.`);
    }
  };

  const addItemToPos = (product) => {
    if (product.currentStock <= 0) {
      alert(`Sorry, ${product.name} is out of stock!`);
      return;
    }
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        return prev.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.currentStock) }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updatePosQty = (productId, delta) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: Math.min(newQty, item.product.currentStock) } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeItem = (productId) => {
    setPosCart((prev) => prev.filter((i) => i.product._id !== productId));
  };

  const subtotal = posCart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.05);
  const finalTotal = Math.max(0, subtotal - Number(discountAmount) + tax);

  const handleCompleteBill = async () => {
    if (posCart.length === 0) return;
    setIsProcessing(true);
    try {
      const payload = {
        customerDetails: {
          name: customerName,
          phone: customerPhone,
          address: 'Store Counter POS, Chennai',
        },
        items: posCart.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        paymentMethod,
        discountAmount: Number(discountAmount),
        orderType: 'IN_STORE_POS',
      };

      const res = await groceryApi.createOrder(payload);
      setLastOrder(res.data.data);
      setPosCart([]);
      setDiscountAmount(0);
    } catch (err) {
      alert(err.response?.data?.message || 'Billing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Barcode className="w-6 h-6 text-emerald-600" />
            <span>Smart POS Counter & Barcode Billing</span>
          </h1>
          <p className="text-xs text-slate-500">
            Automated stock deduction (FEFO), instant invoice generation & GST receipting
          </p>
        </div>

        {lastOrder && (
          <a
            href={groceryApi.getInvoiceUrl(lastOrder._id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center space-x-2 shadow-xs hover:bg-slate-800 transition"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print Last Invoice (#{lastOrder.orderNumber})</span>
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Barcode Scanner Input & Quick Tap Products */}
        <div className="lg:col-span-7 space-y-5">
          {/* Barcode Scanner Bar */}
          <form
            onSubmit={handleScanOrSearch}
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3"
          >
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Scan Barcode / Enter SKU
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  autoFocus
                  placeholder="Scan product barcode (e.g. 8901262010015)..."
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <Barcode className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition"
              >
                Enter
              </button>
            </div>

            {/* Quick barcode shortcuts */}
            <div className="flex flex-wrap gap-1 text-xs text-slate-500 pt-1">
              <span className="font-semibold mr-1">Quick Scans:</span>
              {[
                { name: 'Milk', code: '8901262010015' },
                { name: 'Bread', code: '8901262010022' },
                { name: 'Butter', code: '8901262010039' },
                { name: 'Eggs', code: '8901262010046' },
                { name: 'Rice', code: '8901262010053' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.code}
                  onClick={() => {
                    setBarcodeInput(item.code);
                    groceryApi.scanBarcode(item.code).then((res) => addItemToPos(res.data.data));
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  +{item.name}
                </button>
              ))}
            </div>
          </form>

          {/* Quick-tap Grid */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Fast-Moving Essentials (One-Tap Add)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {recentProducts.map((p) => (
                <button
                  key={p._id}
                  onClick={() => addItemToPos(p)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition group"
                >
                  <img src={p.imageUrl} alt={p.name} className="w-full h-16 object-cover rounded-lg mb-1.5" />
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-1 group-hover:text-emerald-700">
                    {p.name}
                  </h4>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-xs font-black text-slate-900">₹{p.sellingPrice}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Stock: {p.currentStock}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Bill Register & Print */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-slate-700" />
                <h3 className="font-bold text-sm text-slate-900">Active Register Receipt</h3>
              </div>
              <span className="text-xs font-mono text-slate-500">{posCart.length} Items</span>
            </div>

            {/* Cart item table */}
            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
              {posCart.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  Scan a barcode or tap an essential above to begin billing.
                </div>
              ) : (
                posCart.map((item) => (
                  <div key={item.product._id} className="py-2 flex items-center justify-between text-xs">
                    <div className="flex-1 pr-2">
                      <h5 className="font-bold text-slate-800 line-clamp-1">{item.product.name}</h5>
                      <span className="text-[11px] text-slate-500">
                        ₹{item.product.sellingPrice} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex items-center border border-slate-200 rounded-md">
                        <button
                          onClick={() => updatePosQty(item.product._id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => updatePosQty(item.product._id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-black text-slate-900 w-12 text-right">
                        ₹{item.product.sellingPrice * item.quantity}
                      </span>

                      <button
                        onClick={() => removeItem(item.product._id)}
                        className="text-slate-300 hover:text-red-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Customer & Payment details */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-500 block mb-0.5">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-500 block mb-0.5">Customer Mobile</label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs"
                  />
                </div>
              </div>

              {/* Payment selector */}
              <div className="pt-2">
                <label className="font-semibold text-slate-500 block mb-1">Counter Payment</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {['UPI', 'CARD', 'COD'].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition ${
                        paymentMethod === m
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {m === 'COD' ? 'Cash' : m}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'COD' && (
                  <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                      <span>Cash Tendered:</span>
                      <div className="flex items-center space-x-1">
                        <span>₹</span>
                        <input
                          type="number"
                          value={cashTendered || ''}
                          onChange={(e) => setCashTendered(Number(e.target.value))}
                          placeholder={String(finalTotal)}
                          className="w-20 px-2 py-0.5 border border-slate-300 rounded font-bold text-slate-900 text-right text-xs"
                        />
                      </div>
                    </div>
                    {/* Tender Quick Chips */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => setCashTendered(finalTotal)}
                        className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold"
                      >
                        Exact
                      </button>
                      {[100, 200, 500, 2000].map((amt) => (
                        <button
                          type="button"
                          key={amt}
                          onClick={() => setCashTendered(amt)}
                          className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-semibold"
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                    {cashTendered > 0 && (
                      <div className="flex justify-between text-xs font-extrabold pt-1 border-t border-slate-200">
                        <span className="text-slate-600">Change Due:</span>
                        <span className={cashTendered >= finalTotal ? 'text-emerald-600' : 'text-red-500'}>
                          {cashTendered >= finalTotal ? `₹${cashTendered - finalTotal}` : `Short by ₹${finalTotal - cashTendered}`}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Total summary */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5% GST)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-100 text-sm font-black text-slate-900">
                <span>Grand Total</span>
                <span className="text-xl text-emerald-600">₹{finalTotal}</span>
              </div>
            </div>

            {/* Bill button */}
            <button
              onClick={handleCompleteBill}
              disabled={posCart.length === 0 || isProcessing}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-40"
            >
              <Printer className="w-4 h-4" />
              <span>{isProcessing ? 'Generating Invoice...' : `Bill & Print Receipt (₹${finalTotal})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
