import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { groceryApi } from '../services/api';
import { useCart } from '../context/CartContext';
import { Barcode, Search, AlertTriangle, CheckCircle, Clock, X, ShoppingCart } from 'lucide-react';

export const BarcodeScannerModal = ({ isOpen, onClose, onProductSelected }) => {
  const [manualCode, setManualCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const scannerRef = useRef(null);
  const { addToCart } = useCart();

  const handleLookup = async (code) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const res = await groceryApi.scanBarcode(code.trim());
      setScannedProduct(res.data.data);
      if (onProductSelected) {
        onProductSelected(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Product not found with this Barcode / QR');
      setScannedProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isCameraActive) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );
      scanner.render(
        (decodedText) => {
          handleLookup(decodedText);
          setIsCameraActive(false);
          scanner.clear();
        },
        (error) => {
          // ignore stream scanning errors
        }
      );
      scannerRef.current = scanner;

      return () => {
        if (scannerRef.current) {
          scannerRef.current.clear().catch((e) => console.error(e));
        }
      };
    }
  }, [isOpen, isCameraActive]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center space-x-2">
            <Barcode className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-bold">Smart Barcode & QR Scanner</h2>
          </div>
          <button
            onClick={() => {
              if (scannerRef.current) scannerRef.current.clear().catch(() => {});
              setIsCameraActive(false);
              onClose();
            }}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Camera Scan Toggle */}
          <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-sm font-medium text-emerald-900">
              Live Camera / Web Scanner (Section 7)
            </span>
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
            >
              {isCameraActive ? 'Close Camera' : 'Start Camera'}
            </button>
          </div>

          {isCameraActive && (
            <div className="overflow-hidden rounded-xl border border-slate-300">
              <div id="qr-reader" className="w-full"></div>
            </div>
          )}

          {/* Manual / Barcode input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Barcode / QR Number Input
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Scan or type barcode (e.g. 8901262010015)..."
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLookup(manualCode)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-mono"
                />
                <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              </div>
              <button
                onClick={() => handleLookup(manualCode)}
                disabled={loading || !manualCode}
                className="px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 disabled:opacity-50 flex items-center space-x-1.5"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Scanning...' : 'Lookup'}</span>
              </button>
            </div>
            {/* Quick Demo Barcodes */}
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Sample Barcodes:</span>
              <button
                onClick={() => {
                  setManualCode('8901262010015');
                  handleLookup('8901262010015');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
              >
                Milk (8901262010015)
              </button>
              <button
                onClick={() => {
                  setManualCode('8901262010022');
                  handleLookup('8901262010022');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
              >
                Bread (8901262010022)
              </button>
              <button
                onClick={() => {
                  setManualCode('8901262010039');
                  handleLookup('8901262010039');
                }}
                className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono"
              >
                Butter (8901262010039)
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-red-700 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Scanned Product Information Display */}
          {scannedProduct && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex space-x-4">
                <img
                  src={scannedProduct.imageUrl}
                  alt={scannedProduct.name}
                  className="w-20 h-20 rounded-lg object-cover border border-slate-200"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      {scannedProduct.category}
                    </span>
                    <span className="text-xs font-mono text-slate-500">
                      SKU: {scannedProduct.productId}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base mt-1">
                    {scannedProduct.name}
                  </h3>
                  <div className="flex items-baseline space-x-2 mt-1">
                    <span className="text-xl font-black text-emerald-600">
                      ₹{scannedProduct.sellingPrice}
                    </span>
                    <span className="text-xs text-slate-500">
                      Cost: ₹{scannedProduct.purchasePrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock and FEFO Info */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200">
                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">Available Stock</span>
                  <span className={`font-bold text-sm ${scannedProduct.currentStock <= scannedProduct.minStockLevel ? 'text-red-600' : 'text-slate-800'}`}>
                    {scannedProduct.currentStock} {scannedProduct.unit}
                  </span>
                  {scannedProduct.currentStock <= scannedProduct.minStockLevel && (
                    <span className="text-[10px] text-red-500 block font-medium">Below Min Threshold!</span>
                  )}
                </div>

                <div className="p-2 bg-white rounded-lg border border-slate-200">
                  <span className="text-slate-500 block">FEFO Nearest Expiry</span>
                  <span className="font-bold text-sm text-amber-600 flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>
                      {scannedProduct.nearestExpiryDate
                        ? new Date(scannedProduct.nearestExpiryDate).toLocaleDateString()
                        : 'No batch recorded'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Active Batches */}
              {scannedProduct.activeBatches?.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Active Batches in Shelf (FEFO Order):
                  </span>
                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {scannedProduct.activeBatches.map((b) => (
                      <div
                        key={b._id}
                        className="flex items-center justify-between text-xs bg-white px-2.5 py-1.5 rounded-lg border border-slate-200"
                      >
                        <span className="font-mono font-medium text-slate-700">{b.batchNumber}</span>
                        <span className="text-slate-500">{b.currentQuantity} units</span>
                        <span className={`font-semibold ${b.status === 'CRITICAL_EXPIRY_7D' ? 'text-red-600' : b.status === 'NEAR_EXPIRY_30D' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          Exp: {new Date(b.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart button */}
              <button
                onClick={() => {
                  addToCart(scannedProduct, 1);
                  alert(`Added ${scannedProduct.name} to cart!`);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center space-x-2 transition shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add Scanned Product to Cart / Bill</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
