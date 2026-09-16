import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  IndianRupee,
  ShoppingBag,
  Boxes,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, chartsRes] = await Promise.all([
        groceryApi.getDashboardStats(),
        groceryApi.getAnalyticsCharts(),
      ]);
      setStats(statsRes.data.stats);
      setChartData(chartsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Real-time update on new orders or stock deductions
  useEffect(() => {
    const refresh = () => fetchDashboardData();
    socket.on('order:created', refresh);
    socket.on('stock:updated', refresh);

    return () => {
      socket.off('order:created', refresh);
      socket.off('stock:updated', refresh);
    };
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-slate-400">Loading live analytics...</div>;
  }

  if (error || !stats) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
        <p className="text-sm font-semibold text-slate-700">{error || 'Metrics temporarily unavailable'}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
        >
          Retry Fetching Data
        </button>
      </div>
    );
  }

  // 8 KPIs from Section 13
  const kpiCards = [
    {
      title: "Today's Revenue",
      value: `₹${stats.todaySales}`,
      subtitle: `Profit: ₹${stats.todayProfit}`,
      icon: IndianRupee,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      title: 'Online Orders',
      value: stats.onlineOrdersCount,
      subtitle: `${stats.pendingOrdersCount} Pending Action`,
      icon: ShoppingBag,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      title: 'Total Stock in Shelf',
      value: stats.totalStock,
      subtitle: `${stats.totalProducts} Distinct SKUs`,
      icon: Boxes,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
    },
    {
      title: 'Low Stock Alerts',
      value: stats.lowStockCount,
      subtitle: 'Threshold breached',
      icon: AlertTriangle,
      color: stats.lowStockCount > 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-200',
    },
    {
      title: 'Expiring Soon (30d)',
      value: stats.expiringBatchesCount,
      subtitle: 'Batches under FEFO watch',
      icon: Clock,
      color: stats.expiringBatchesCount > 0 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200',
    },
    {
      title: "Today's Net Profit",
      value: `₹${stats.todayProfit}`,
      subtitle: `Margin ~${stats.todaySales > 0 ? Math.round((stats.todayProfit / stats.todaySales) * 100) : 28}%`,
      icon: TrendingUp,
      color: 'bg-teal-50 text-teal-800 border-teal-200',
    },
    {
      title: 'Pending Fulfillment',
      value: stats.pendingOrdersCount,
      subtitle: 'Awaiting packing/dispatch',
      icon: Package,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
    {
      title: 'Active Products',
      value: stats.totalProducts,
      subtitle: 'Across 7 categories',
      icon: LayoutDashboard,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <LayoutDashboard className="w-6 h-6 text-emerald-600" />
          <span>Executive Business Dashboard & Analytics</span>
        </h1>
        <p className="text-xs text-slate-500">
          Section 13 & 17: Real-time revenue, net margins (Selling - Purchase), stock movement & category performance
        </p>
      </div>

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-2xl border shadow-2xs flex flex-col justify-between ${kpi.color}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{kpi.title}</span>
                <Icon className="w-4 h-4 opacity-70" />
              </div>
              <div className="mt-3">
                <span className="text-2xl font-black block">{kpi.value}</span>
                <span className="text-[11px] opacity-80 block mt-0.5">{kpi.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue vs Profit Trend (14 Days) */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Revenue & Net Profit Trend</h3>
                <span className="text-xs text-slate-400">
                  Calculated as: Profit = Selling Price − Purchase Price
                </span>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.salesTrend}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="_id" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="totalRevenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#revGrad)"
                    name="Gross Sales (₹)"
                  />
                  <Area
                    type="monotone"
                    dataKey="totalProfit"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#profGrad)"
                    name="Net Profit (₹)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Breakdown (Pie Chart) */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Category Stock Breakdown</h3>
              <span className="text-xs text-slate-400">Inventory distribution</span>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.categoryBreakdown}
                    dataKey="totalStock"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {chartData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category labels */}
            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600">
              {chartData.categoryBreakdown.map((cat, i) => (
                <div key={cat._id} className="flex items-center space-x-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  ></span>
                  <span className="truncate">{cat._id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 17: Best-Selling Products & Slow-Moving Clearance Radar */}
      {chartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Best Sellers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              ⭐ Top Best-Selling Products (Section 17)
            </h3>
            <div className="divide-y divide-slate-100">
              {chartData.bestSellers?.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-[11px] text-slate-500 block">{p.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block">{p.unitsSold} units</span>
                    <span className="text-[11px] text-emerald-600 font-semibold block">
                      Profit: ₹{p.profit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slow Movers (Candidates for Section 12 dynamic discount offers) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">
                🐌 Slow-Moving Inventory Radar
              </h3>
              <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Discount candidates
              </span>
            </div>
            <p className="text-xs text-slate-500">
              High warehouse stock with low weekly turnover — system recommends applying 10%-15% promotional discount.
            </p>

            <div className="divide-y divide-slate-100">
              {chartData.slowMovers?.map((p, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <span className="text-[11px] text-slate-500 block">Category: {p.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-800 block">{p.stock} units sitting</span>
                    <span className="text-[11px] text-slate-400">Price: ₹{p.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
