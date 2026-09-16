import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import { Bell, AlertTriangle, Clock, ShoppingBag, X, RefreshCw } from 'lucide-react';

export const AlertsDrawer = ({ isOpen, onClose, onNavigate }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await groceryApi.getIntelligentAlerts();
      setAlerts(res.data.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAlerts();
    }
  }, [isOpen]);

  // Real-time socket alerts
  useEffect(() => {
    const handleLowStock = (data) => {
      setAlerts((prev) => [
        {
          id: `socket-low-${Date.now()}`,
          type: 'LOW_STOCK',
          severity: 'CRITICAL',
          title: `Real-Time Low Stock: ${data.productName}`,
          message: `Stock fell to ${data.currentStock} units (threshold: ${data.minStock})`,
          link: '/admin/inventory',
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    const handleOrderCreated = (data) => {
      setAlerts((prev) => [
        {
          id: `socket-ord-${Date.now()}`,
          type: 'PENDING_ORDERS',
          severity: 'INFO',
          title: `New Online Order Placed: #${data.orderNumber}`,
          message: `${data.customerName} ordered items totaling ₹${data.finalTotal}`,
          link: '/admin/orders',
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    const handlePORecommended = (data) => {
      setAlerts((prev) => [
        {
          id: `socket-po-${Date.now()}`,
          type: 'REORDER_RECOMMENDED',
          severity: 'WARNING',
          title: `AI Auto-Reorder Generated: ${data.poNumber}`,
          message: `Recommended ${data.recommendedQuantity} units of ${data.productName} from ${data.supplierName}`,
          link: '/admin/reorders',
          createdAt: new Date(),
        },
        ...prev,
      ]);
    };

    socket.on('alert:lowStock', handleLowStock);
    socket.on('order:created', handleOrderCreated);
    socket.on('po:recommended', handlePORecommended);

    return () => {
      socket.off('alert:lowStock', handleLowStock);
      socket.off('order:created', handleOrderCreated);
      socket.off('po:recommended', handlePORecommended);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Intelligent Alert Center</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {alerts.length}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchAlerts}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">All operations stable. No urgent alerts.</p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isWarn = alert.severity === 'WARNING';

              return (
                <div
                  key={alert.id}
                  onClick={() => {
                    if (onNavigate && alert.link) {
                      onNavigate(alert.link);
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-xl border transition cursor-pointer hover:shadow-md ${
                    isCrit
                      ? 'bg-red-50 border-red-200 hover:bg-red-100/70'
                      : isWarn
                      ? 'bg-amber-50 border-amber-200 hover:bg-amber-100/70'
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {isCrit || isWarn ? (
                        <AlertTriangle
                          className={`w-4 h-4 flex-shrink-0 ${
                            isCrit ? 'text-red-600' : 'text-amber-600'
                          }`}
                        />
                      ) : (
                        <ShoppingBag className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-900">{alert.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(alert.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 pl-6 leading-relaxed">
                    {alert.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Real-time Stock, Expiry & Demand Monitoring Active
        </div>
      </div>
    </div>
  );
};
