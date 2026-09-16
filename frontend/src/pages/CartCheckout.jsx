import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { groceryApi } from '../services/api';
import {
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  CreditCard,
  QrCode,
  Banknote,
  CheckCircle,
  FileText,
  Truck,
  Sparkles,
  ShoppingBag,
  Tag,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export const CartCheckout = ({ onBackToShop, onOrderPlaced }) => {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, tax, deliveryFee, finalTotal } = useCart();
  const { user } = useAuth();

  const [customerName, setCustomerName] = useState(user?.name || 'Priya Sundaram');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+91 98401 12233');
  const [customerAddress, setCustomerAddress] = useState(
    user?.address?.street ? `${user.address.street}, Adyar, Chennai` : 'Flat 4B, Green Acres, Adyar, Chennai - 600020'
  );
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [recommendations, setRecommendations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  // Coupon & Promo Code State
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Simulated Card Fields
  const [cardNum, setCardNum] = useState('4532 •••• •••• 8920');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('782');

  const applyCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'SAVE50') {
      setDiscountAmount(50);
      setCouponApplied(true);
      setCouponError('');
    } else if (couponCode.trim().toUpperCase() === 'FRESH20') {
      const disc = Math.round(subtotal * 0.2);
      setDiscountAmount(disc);
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon. Try "SAVE50" or "FRESH20"');
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountAmount(0);
    setCouponApplied(false);
    setCouponError('');
  };

  // Section 14: AI Smart Product Recommendations for items currently in cart
  useEffect(() => {
    const fetchRecs = async () => {
      if (cart.length === 0) return;
      try {
        const itemNames = cart.map((i) => i.product.name);
        const res = await groceryApi.getCartRecommendations(itemNames);
        setRecommendations(res.data.recommendations || []);
      } catch (err) {
        console.warn('Recommendation service offline');
      }
    };
    fetchRecs();
  }, [cart]);

  const payableTotal = Math.max(0, finalTotal - discountAmount);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderPayload = {
        customerDetails: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
        },
        items: cart.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        paymentMethod,
        discountAmount,
        orderType: 'ONLINE',
      };

      const res = await groceryApi.createOrder(orderPayload);
      clearCart();
      setCompletedOrder(res.data.data);
      if (onOrderPlaced) onOrderPlaced(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Success Screen with direct PDF invoice download link!
  if (completedOrder) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-6 animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-md">
          <CheckCircle className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-800 font-extrabold px-3 py-1 bg-emerald-100/70 rounded-full border border-emerald-300">
            Order #{completedOrder.orderNumber}
          </span>
          <h2 className="text-2xl font-black text-slate-900">
            Order Confirmed & Stock Deducted!
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Thank you, <strong>{completedOrder.customerDetails.name}</strong>. Your fresh items are being packed via First-Expired First-Out (FEFO) warehouse logic.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left text-xs space-y-3 shadow-xs">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Payment Status:</span>
            <span className="font-bold text-emerald-600">
              {completedOrder.paymentStatus} ({completedOrder.paymentMethod})
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Transaction ID:</span>
            <span className="font-mono text-slate-700">{completedOrder.transactionId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500">Delivery Address:</span>
            <span className="font-medium text-slate-800 text-right max-w-xs">
              {completedOrder.customerDetails.address}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-extrabold text-slate-900">
            <span>Total Paid:</span>
            <span className="text-emerald-600">₹{completedOrder.finalTotal}</span>
          </div>
        </div>

        {/* Action Buttons: Invoice download and return to shop */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href={groceryApi.getInvoiceUrl(completedOrder._id)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Download Tax Invoice (PDF)</span>
          </a>

          <button
            onClick={() => onBackToShop()}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition active:scale-95 shadow-sm"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your shopping bag is empty</h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          Add fresh items from our dairy, organic produce, or bakery aisles to begin express checkout.
        </p>
        <button
          onClick={onBackToShop}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-md active:scale-95"
        >
          Explore Aisles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onBackToShop}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition active:scale-95"
          title="Back to Catalog"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Cart & Express Checkout</h1>
          <span className="text-xs text-slate-500 font-medium">
            30-min express grocery fulfillment • Synchronized stock deduction
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Cart Items & Cross Sells */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">
                Cart Items ({cart.length})
              </h3>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                FEFO Batch Reserved
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {cart.map((item) => (
                <div key={item.product._id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-2xs"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.product.name}</h4>
                      <span className="text-[11px] text-slate-500 block">
                        ₹{item.product.sellingPrice} / {item.product.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {/* Qty Stepper */}
                    <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="p-1.5 hover:bg-slate-200 text-slate-600 transition active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-black text-xs text-slate-900 w-16 text-right">
                      ₹{item.product.sellingPrice * item.quantity}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.product._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Smart Cross-Sell Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-extrabold text-xs text-emerald-950 uppercase tracking-wider">
                    Frequently Bought Together (AI Suggestion)
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-200/50 px-2 py-0.5 rounded-full">
                  Pairing Algorithm
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {recommendations.map((rec) => (
                  <div
                    key={rec._id}
                    className="bg-white p-2.5 rounded-xl border border-emerald-100 shadow-2xs flex flex-col justify-between"
                  >
                    <img
                      src={rec.imageUrl}
                      alt={rec.name}
                      className="w-full h-16 object-cover rounded-lg mb-1.5"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=60';
                      }}
                    />
                    <div>
                      <h5 className="font-bold text-[11px] text-slate-800 line-clamp-1">
                        {rec.name}
                      </h5>
                      <span className="text-xs font-extrabold text-emerald-700">
                        ₹{rec.sellingPrice}
                      </span>
                    </div>
                    <button
                      onClick={() => updateQuantity(rec._id, 1)}
                      className="mt-2 w-full py-1 text-[10px] font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition active:scale-95"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Customer Details, Coupon & Payment Gateway */}
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleCheckout}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
          >
            <h3 className="font-bold text-slate-900 text-sm">Delivery Information</h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Customer Full Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-600">Delivery Address</label>
                  <div className="flex items-center space-x-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setCustomerAddress('Flat 4B, Green Acres, Adyar, Chennai - 600020')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Home
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => setCustomerAddress('Tech Park Tower 3, OMR, Chennai - 600096')}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Office
                    </button>
                  </div>
                </div>
                <textarea
                  rows={2}
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Coupon / Promo Code Input */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-800 text-xs block mb-1.5 flex items-center space-x-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Promo Code</span>
              </label>

              {couponApplied ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Coupon <strong>{couponCode.toUpperCase()}</strong> applied (-₹{discountAmount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-red-600 hover:text-red-700 text-xs font-bold underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Try 'SAVE50' or 'FRESH20'"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 uppercase font-semibold"
                  />
                  <button
                    type="button"
                    onClick={applyCoupon}
                    className="px-3 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    Apply
                  </button>
                </div>
              )}
              {couponError && <p className="text-[11px] text-red-500 mt-1">{couponError}</p>}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-2 border-t border-slate-100">
              <label className="font-bold text-slate-900 text-xs block mb-2">
                Payment Method (Simulated Local Gateway)
              </label>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'UPI', label: 'Instant UPI', icon: QrCode },
                  { id: 'CARD', label: 'Credit/Debit Card', icon: CreditCard },
                  { id: 'NETBANKING', label: 'Net Banking', icon: Banknote },
                  { id: 'COD', label: 'Cash on Delivery', icon: Truck },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <button
                      type="button"
                      key={mode.id}
                      onClick={() => setPaymentMethod(mode.id)}
                      className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold shadow-2xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs">{mode.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Interactive payment preview */}
              {paymentMethod === 'UPI' && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-2">
                  <div className="w-24 h-24 mx-auto bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-center shadow-2xs">
                    <QrCode className="w-20 h-20 text-slate-800" />
                  </div>
                  <p className="text-[11px] font-mono text-slate-600">smartgrocery@upi</p>
                  <span className="inline-block text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    Scan with any UPI App or click pay below
                  </span>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="mt-3 p-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl shadow-xs space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-400">
                    <span>DEMO PAYMENT CARD</span>
                    <span className="font-bold text-emerald-400">VISA / MASTERCARD</span>
                  </div>
                  <div className="font-mono text-sm tracking-widest text-emerald-300">{cardNum}</div>
                  <div className="flex justify-between text-[11px] text-slate-300">
                    <span>{customerName}</span>
                    <span>EXP: {cardExpiry}</span>
                  </div>
                </div>
              )}

              {paymentMethod === 'COD' && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Cash on Delivery Active</p>
                  <p className="text-[11px] text-amber-800">
                    Please keep exact cash ₹{payableTotal} ready at the time of delivery.
                  </p>
                </div>
              )}
            </div>

            {/* Bill Breakdown */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>GST Tax (5%)</span>
                <span>₹{tax}</span>
              </div>
              <div className="flex justify-between">
                <span>Express Delivery Fee</span>
                <span>{deliveryFee === 0 ? <strong className="text-emerald-600">FREE</strong> : `₹${deliveryFee}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                <span>Final Payable</span>
                <span className="text-emerald-600">₹{payableTotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition active:scale-98 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>Processing Order & FEFO Stock...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Pay ₹{payableTotal} & Place Order</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
