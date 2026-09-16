import React, { useState, useEffect } from 'react';
import { groceryApi, socket } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Truck,
  MapPin,
  Phone,
  Clock,
  CheckCircle,
  Package,
  Calendar,
  AlertCircle
} from 'lucide-react';

export const DeliveryPortal = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await groceryApi.getOrders({ orderType: 'ONLINE' });
      setOrders(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Listen to status updates
  useEffect(() => {
    const handleStatus = () => fetchOrders();
    socket.on('order:status_updated', handleStatus);
    socket.on('order:created', handleStatus);

    return () => {
      socket.off('order:status_updated', handleStatus);
      socket.off('order:created', handleStatus);
    };
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await groceryApi.updateOrderStatus(orderId, {
        status: newStatus,
        notes: `Delivery agent marked order as ${newStatus}`,
      });
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  const activeOrders = orders.filter((o) => o.orderStatus !== 'Delivered' && o.orderStatus !== 'Cancelled');
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'Delivered');

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Truck className="w-6 h-6 text-emerald-600" />
          <span>Delivery Partner Dispatch & Route Control</span>
        </h1>
        <p className="text-xs text-slate-500">
          Section 10: Dispatch tracking, live status milestones, customer drop locations & proof of fulfillment
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Active Deliveries in Transit
          </span>
          <span className="text-2xl font-black text-blue-950 mt-1 block">
            {activeOrders.length}
          </span>
        </div>
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Fulfilled & Delivered
          </span>
          <span className="text-2xl font-black text-emerald-950 mt-1 block">
            {deliveredOrders.length}
          </span>
        </div>
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Avg Turnaround Time
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">24 mins</span>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Active Shipments & Routes</h3>

        {activeOrders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            No active orders in delivery queue. All orders delivered!
          </div>
        ) : (
          activeOrders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-800">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    {order.orderStatus}
                  </span>
                  <span className="text-xs text-slate-400">
                    Payment: {order.paymentMethod} (₹{order.finalTotal})
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{order.customerDetails.name}</h4>
                  <div className="flex items-center space-x-3 text-xs text-slate-600 mt-1">
                    <span className="flex items-center space-x-1">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerDetails.phone}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="line-clamp-1">{order.customerDetails.address}</span>
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-500">
                  <strong>Items: </strong>
                  {order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                </div>
              </div>

              {/* Status Update Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {order.orderStatus === 'Placed' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Confirmed')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
                  >
                    Confirm Order
                  </button>
                )}

                {order.orderStatus === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition"
                  >
                    Mark Preparing
                  </button>
                )}

                {order.orderStatus === 'Preparing' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Packed')}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Mark Packed (FEFO)
                  </button>
                )}

                {order.orderStatus === 'Packed' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
                  >
                    Dispatch / Out for Delivery
                  </button>
                )}

                {order.orderStatus === 'Out for Delivery' && (
                  <button
                    onClick={() => handleUpdateStatus(order._id, 'Delivered')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition flex items-center space-x-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Complete Delivery</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
