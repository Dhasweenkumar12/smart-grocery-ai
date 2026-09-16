import React, { useState, useEffect } from 'react';
import { groceryApi } from '../services/api';
import {
  TrendingUp,
  BrainCircuit,
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Package,
  Layers,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export const AIForecasting = () => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [allForecasts, setAllForecasts] = useState([]);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'overview'
  const [executiveInsights, setExecutiveInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const loadExecutiveInsights = async () => {
    setLoadingInsights(true);
    try {
      const res = await groceryApi.getExecutiveInsights();
      setExecutiveInsights(res.data);
    } catch (err) {
      console.warn('Failed to load Gemini insights:', err.message);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    loadExecutiveInsights();
  }, []);

  useEffect(() => {
    groceryApi.getProducts().then((res) => {
      const prods = res.data.data || [];
      setProducts(prods);
      if (prods.length > 0) {
        setSelectedProductId(prods[0]._id);
      }
    }).catch(err => {
      console.warn('Product load warning:', err.message);
    });
  }, []);

  const loadForecast = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await groceryApi.getProductForecast(id);
      setForecastData(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load forecast for this product');
    } finally {
      setLoading(false);
    }
  };

  const loadAllForecasts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groceryApi.getAllForecasts();
      setAllForecasts(res.data.data || []);
      setViewMode('overview');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load catalog demand matrix');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProductId && viewMode === 'single') {
      loadForecast(selectedProductId);
    }
  }, [selectedProductId, viewMode]);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <BrainCircuit className="w-6 h-6 text-emerald-600" />
            <span>AI Demand Forecasting & Adaptive Reordering</span>
          </h1>
          <p className="text-xs text-slate-500">
            Powered by Scikit-Learn Random Forest Regressor trained on 90-day sales history
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('single')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'single'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Product Deep-Dive
          </button>
          <button
            onClick={loadAllForecasts}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
              viewMode === 'overview'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Catalog Demand Matrix
          </button>
        </div>
      </div>

      {/* Gemini AI Executive Brief Card */}
      {executiveInsights && (
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-5 rounded-2xl border border-indigo-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                    Gemini AI Executive Inventory Assessment
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    {executiveInsights.source || 'Gemini 1.5 Flash'}
                  </span>
                </div>
                <div className="text-xs text-indigo-100/90 whitespace-pre-line leading-relaxed mt-2 bg-black/20 p-3.5 rounded-xl border border-white/5 font-sans">
                  {executiveInsights.insights}
                </div>
              </div>
            </div>

            <button
              onClick={loadExecutiveInsights}
              disabled={loadingInsights}
              className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/60 border border-indigo-400/30 text-xs font-semibold text-indigo-200 flex items-center gap-1.5 transition shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingInsights ? 'animate-spin' : ''}`} />
              <span>Refresh AI Brief</span>
            </button>
          </div>
        </div>
      )}

      {viewMode === 'single' ? (
        <div className="space-y-6">
          {/* Selector Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Select Product to Predict:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (Stock: {p.currentStock})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => loadForecast(selectedProductId)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Re-run ML Model</span>
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-between">
              <div className="text-xs text-red-700 font-semibold">{error}</div>
              <button
                onClick={() => (viewMode === 'single' ? loadForecast(selectedProductId) : loadAllForecasts())}
                className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold transition"
              >
                Retry
              </button>
            </div>
          )}

          {loading ? (
            <div className="text-center py-20 text-slate-400">Running ML inference pipeline...</div>
          ) : forecastData ? (
            <div className="space-y-6">
              {/* Forecast KPI Highlights (Section 4 Example) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Current Stock in Shelf
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {forecastData.currentStock} units
                  </span>
                  <span className="text-xs text-slate-500">
                    Min Threshold: {forecastData.minStock}
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Historical Daily Sales
                  </span>
                  <span className="text-2xl font-black text-slate-900 mt-1 block">
                    {forecastData.avgDailySales} / day
                  </span>
                  <span className="text-xs text-slate-500">Based on past sales velocity</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Predicted 7-Day Demand
                  </span>
                  <span className="text-2xl font-black text-emerald-950 mt-1 block">
                    {forecastData.predictedDemandNext7Days} units
                  </span>
                  <span className="text-xs text-emerald-700 font-semibold">
                    ~{forecastData.predictedDailyDemand} units/day
                  </span>
                </div>

                <div
                  className={`p-5 rounded-2xl border shadow-xs ${
                    forecastData.reorderStatus === 'CRITICAL'
                      ? 'bg-red-50 border-red-200'
                      : forecastData.reorderStatus === 'RECOMMENDED'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider block">
                    AI Automated Reorder
                  </span>
                  <span className="text-2xl font-black mt-1 block">
                    {forecastData.recommendedReorderUnits > 0
                      ? `+${forecastData.recommendedReorderUnits} units`
                      : 'Stock Stable'}
                  </span>
                  <span className="text-xs font-semibold block">
                    Status: {forecastData.reorderStatus}
                  </span>
                </div>
              </div>

              {/* 7-Day Daily Breakdown Chart */}
              {forecastData.dailyBreakdown?.length > 0 && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Next 7 Days Projected Demand Breakdown
                      </h3>
                      <p className="text-xs text-slate-500">
                        Adjusts for weekend demand spikes and recent purchasing velocity
                      </p>
                    </div>
                    <div className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Confidence: {(forecastData.confidenceScore * 100).toFixed(1)}%
                    </div>
                  </div>

                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={forecastData.dailyBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="dayName" stroke="#64748b" fontSize={12} tickLine={false} />
                        <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#0f172a',
                            borderRadius: '12px',
                            color: '#fff',
                            fontSize: '12px',
                          }}
                        />
                        <Bar
                          dataKey="predictedUnits"
                          fill="#10b981"
                          radius={[6, 6, 0, 0]}
                          name="Predicted Units"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        /* Catalog Demand Matrix View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider">
              Autonomous Demand Matrix for All Products
            </h3>
            <span className="text-xs font-mono text-slate-400">{allForecasts.length} items evaluated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Avg Daily Sales</th>
                  <th className="px-4 py-3">Next 7 Days Demand</th>
                  <th className="px-4 py-3">AI Recommendation</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {allForecasts.map((item) => (
                  <tr key={item.productId} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{item.productName}</td>
                    <td className="px-4 py-3">{item.currentStock}</td>
                    <td className="px-4 py-3">{item.avgDailySales} / day</td>
                    <td className="px-4 py-3 font-bold text-emerald-700">
                      {item.predictedDemandNext7Days} units
                    </td>
                    <td className="px-4 py-3">
                      {item.recommendedReorderUnits > 0 ? (
                        <span className="font-bold text-slate-900">
                          Order {item.recommendedReorderUnits} units
                        </span>
                      ) : (
                        <span className="text-slate-400">Adequate</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.reorderStatus === 'CRITICAL'
                            ? 'bg-red-100 text-red-700'
                            : item.reorderStatus === 'RECOMMENDED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.reorderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
