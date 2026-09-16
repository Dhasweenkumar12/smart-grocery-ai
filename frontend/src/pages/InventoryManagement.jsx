import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import {
  Boxes,
  Clock,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  XCircle,
  TrendingDown
} from 'lucide-react';

export const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' or 'products'
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [expirySummary, setExpirySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal for adding new inward batch
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBatch, setNewBatch] = useState({
    productId: '',
    batchNumber: '',
    manufacturingDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    quantity: 50,
    costPrice: 40,
    locationRack: 'A-01',
  });

  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [bRes, pRes, alertRes] = await Promise.all([
        groceryApi.getBatches(),
        groceryApi.getProducts(),
        groceryApi.getExpiryAlerts(),
      ]);
      setBatches(bRes.data.data || []);
      setProducts(pRes.data.data || []);
      setExpirySummary(alertRes.data.summary || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load inventory batches');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Real-time stock update
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

  const handleAddBatchSubmit = async (e) => {
    e.preventDefault();
    try {
      await groceryApi.addBatch(newBatch);
      setIsAddModalOpen(false);
      fetchData();
      alert('New batch ingested and added to FEFO inventory!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add batch');
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.product?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Boxes className="w-6 h-6 text-emerald-600" />
            <span>Real-Time FEFO Inventory & Batch Control</span>
          </h1>
          <p className="text-xs text-slate-500">
            First-Expired, First-Out (FEFO) shelf management and multi-batch tracking
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-2 shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Inward New Batch (Shipment)</span>
        </button>
      </div>

      {/* Expiry Risk Stat Bar (Section 6) */}
      {expirySummary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider block">
                🔴 Expired Batches
              </span>
              <span className="text-2xl font-black text-red-900">
                {expirySummary.expiredCount}
              </span>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-60" />
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
                🟠 Expiring Within 7 Days
              </span>
              <span className="text-2xl font-black text-amber-900">
                {expirySummary.expiring7DaysCount}
              </span>
            </div>
            <AlertTriangle className="w-8 h-8 text-amber-500 opacity-60" />
          </div>

          <div className="p-4 rounded-2xl bg-yellow-50 border border-yellow-200 flex items-center justify-between shadow-2xs">
            <div>
              <span className="text-[11px] font-bold text-yellow-800 uppercase tracking-wider block">
                🟡 Expiring Within 30 Days
              </span>
              <span className="text-2xl font-black text-yellow-900">
                {expirySummary.expiring30DaysCount}
              </span>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 opacity-60" />
          </div>
        </div>
      )}

      {/* Tabs and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('batches')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'batches'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            FEFO Batches ({batches.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Stock Overview ({products.length})
          </button>
        </div>

        {/* Filter and Search */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search product or batch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {activeTab === 'batches' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CRITICAL_EXPIRY_7D">Critical (≤ 7 Days)</option>
              <option value="NEAR_EXPIRY_30D">Near Expiry (≤ 30 Days)</option>
              <option value="EXPIRED">Expired</option>
            </select>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
          <div className="text-xs text-red-700 font-semibold">{error}</div>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Table: Batches (FEFO sorted) */}
      {activeTab === 'batches' ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">FEFO Priority</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Remaining Qty</th>
                  <th className="px-4 py-3">Mfg Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Location / Rack</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBatches.map((b, index) => {
                  const daysLeft = Math.ceil(
                    (new Date(b.expiryDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );

                  let statusBadge = (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Active
                    </span>
                  );
                  if (daysLeft <= 0) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-800">
                        Expired
                      </span>
                    );
                  } else if (daysLeft <= 7) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 animate-pulse">
                        Critical ({daysLeft}d left)
                      </span>
                    );
                  } else if (daysLeft <= 30) {
                    statusBadge = (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-yellow-100 text-yellow-800">
                        Expiring in {daysLeft}d
                      </span>
                    );
                  }

                  return (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-400">
                        #{index + 1}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {b.product?.name || 'Unknown Product'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {b.product?.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">{b.batchNumber}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">
                        {b.currentQuantity} / {b.initialQuantity}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {new Date(b.manufacturingDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-800">
                        {new Date(b.expiryDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{b.locationRack}</td>
                      <td className="px-4 py-3">{statusBadge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stock Overview Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Cost Price</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Min Threshold</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {products.map((p) => {
                  const isLow = p.currentStock <= p.minStockLevel;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono text-slate-500">{p.productId}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{p.name}</td>
                      <td className="px-4 py-3 text-slate-600">{p.category}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">₹{p.sellingPrice}</td>
                      <td className="px-4 py-3 text-slate-500">₹{p.purchasePrice}</td>
                      <td className={`px-4 py-3 font-black ${isLow ? 'text-red-600' : 'text-slate-900'}`}>
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{p.minStockLevel}</td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                            Auto-Reorder Needed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                            Healthy
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Inward New Batch */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Receive New Inward Batch</h3>

            <form onSubmit={handleAddBatchSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Select Product</label>
                <select
                  required
                  value={newBatch.productId}
                  onChange={(e) => setNewBatch({ ...newBatch, productId: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.productId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BATCH-2026-09"
                  value={newBatch.batchNumber}
                  onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Mfg Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.manufacturingDate}
                    onChange={(e) => setNewBatch({ ...newBatch, manufacturingDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newBatch.expiryDate}
                    onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newBatch.quantity}
                    onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-600 block mb-1">Cost Per Unit (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newBatch.costPrice}
                    onChange={(e) => setNewBatch({ ...newBatch, costPrice: e.target.value })}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Warehouse Location / Rack</label>
                <input
                  type="text"
                  placeholder="e.g. AISLE-D-02"
                  value={newBatch.locationRack}
                  onChange={(e) => setNewBatch({ ...newBatch, locationRack: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                >
                  Save & Ingest Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
