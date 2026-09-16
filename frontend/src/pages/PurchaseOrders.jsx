import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  CheckCircle,
  Clock,
  Truck,
  PackageCheck,
  RotateCcw,
  Sparkles,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export const PurchaseOrders = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const { user } = useAuth();

  const [error, setError] = useState(null);

  const fetchPOs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groceryApi.getPurchaseOrders();
      setPurchaseOrders(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load purchase orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  // Listen for socket events
  useEffect(() => {
    const handlePORec = () => fetchPOs();
    socket.on('po:recommended', handlePORec);
    return () => socket.off('po:recommended', handlePORec);
  }, []);

  const handleApprove = async (id) => {
    try {
      await groceryApi.approvePO(id);
      fetchPOs();
      alert('Purchase Order approved and sent to Supplier!');
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReceive = async (id) => {
    try {
      await groceryApi.receivePO(id);
      fetchPOs();
      alert('Shipment verified & received! FEFO inventory and batches have been replenished.');
    } catch (err) {
      alert(err.response?.data?.message || 'Receive failed');
    }
  };

  const triggerScan = async () => {
    setIsScanning(true);
    try {
      const res = await groceryApi.triggerReorderScan();
      alert(res.data.message);
      fetchPOs();
    } catch (err) {
      alert(err.response?.data?.message || 'Scan failed');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            <span>Automated Reordering & Procurement (PO)</span>
          </h1>
          <p className="text-xs text-slate-500">
            Section 5: Minimum stock threshold detection → AI PO recommendation → Admin approval →
            FEFO replenishment
          </p>
        </div>

        <button
          onClick={triggerScan}
          disabled={isScanning}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition disabled:opacity-50"
        >
          <Sparkles className={`w-4 h-4 text-emerald-400 ${isScanning ? 'animate-spin' : ''}`} />
          <span>{isScanning ? 'Scanning Inventory...' : 'Trigger AI Reorder Scan'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
          <div className="text-xs text-red-700 font-semibold">{error}</div>
          <button
            onClick={fetchPOs}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* PO Cards / Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading purchase orders...</div>
      ) : purchaseOrders.length === 0 ? (
        <div className="text-center py-20 text-slate-400 bg-white rounded-2xl border border-slate-200">
          No purchase orders generated. Click "Trigger AI Reorder Scan" to check thresholds.
        </div>
      ) : (
        <div className="space-y-4">
          {purchaseOrders.map((po) => {
            const isRec = po.status === 'RECOMMENDED_BY_AI';
            const isApproved = po.status === 'APPROVED';
            const isReceived = po.status === 'RECEIVED';

            return (
              <div
                key={po._id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                      {po.poNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isRec
                          ? 'bg-amber-100 text-amber-800'
                          : isApproved
                          ? 'bg-blue-100 text-blue-800'
                          : isReceived
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {po.status.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Created: {new Date(po.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      Supplier: <span className="text-emerald-700">{po.supplierName}</span>
                    </h3>
                    <p className="text-xs text-slate-500 italic mt-0.5">{po.triggerReason}</p>
                  </div>

                  {/* Items list */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 max-w-xl text-xs space-y-1">
                    {po.items.map((itm, i) => (
                      <div key={i} className="flex justify-between font-medium">
                        <span className="text-slate-800">
                          {itm.productName} ({itm.productIdStr})
                        </span>
                        <span className="text-slate-600">
                          {itm.orderQuantity} units @ ₹{itm.estimatedUnitCost} ={' '}
                          <strong>₹{itm.totalCost}</strong>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right side: Action Buttons */}
                <div className="flex md:flex-col items-end justify-between md:justify-center gap-3">
                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 block">Total Procurement Cost</span>
                    <span className="text-xl font-black text-slate-900">₹{po.totalCost}</span>
                  </div>

                  <div className="flex space-x-2">
                    {isRec && (
                      <button
                        onClick={() => handleApprove(po._id)}
                        className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                      >
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Approve PO</span>
                      </button>
                    )}

                    {isApproved && (
                      <button
                        onClick={() => handleReceive(po._id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs transition"
                      >
                        <PackageCheck className="w-3.5 h-3.5" />
                        <span>Receive Goods into FEFO</span>
                      </button>
                    )}

                    {isReceived && (
                      <div className="flex items-center space-x-1 text-emerald-700 text-xs font-bold">
                        <CheckCircle className="w-4 h-4" />
                        <span>Ingested to Batches</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
