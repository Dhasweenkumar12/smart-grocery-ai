import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { socket } from '../services/api';
import {
  Store,
  LayoutDashboard,
  Boxes,
  TrendingUp,
  Truck,
  ShoppingCart,
  Barcode,
  Bell,
  ShieldCheck,
  FileText,
  Users
} from 'lucide-react';

export const Navbar = ({ activeTab, setActiveTab, onOpenScanner, onOpenAlerts }) => {
  const { user, switchDemoRole } = useAuth();
  const { totalItemsCount } = useCart();
  const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);

  useEffect(() => {
    const handleConnect = () => setIsSocketConnected(true);
    const handleDisconnect = () => setIsSocketConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
    };
  }, []);

  const navItems = [
    { id: 'store', label: 'Storefront', icon: Store },
    { id: 'pos', label: 'POS Billing', icon: Barcode },
    { id: 'inventory', label: 'FEFO Inventory', icon: Boxes },
    { id: 'ai-forecast', label: 'AI Forecasting', icon: TrendingUp },
    { id: 'reorders', label: 'Purchase Orders', icon: FileText },
    { id: 'suppliers', label: 'Vendors', icon: Users },
    { id: 'delivery', label: 'Dispatch', icon: Truck },
    { id: 'dashboard', label: 'Analytics', icon: LayoutDashboard },
    { id: 'audit', label: 'Audit Logs', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 glass-header border-b border-zinc-200/75 shadow-xs">
      {/* Top Banner: Profile Switcher & Real-Time Sync Indicator */}
      <div className="bg-[#09090b] text-zinc-300 text-xs px-4 sm:px-6 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isSocketConnected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
              }`}
            ></span>
            <span className="font-mono text-[11px] text-zinc-400">
              {isSocketConnected ? 'Live Socket Sync' : 'Connecting...'}
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400 text-[11px]">
            User: <strong className="text-zinc-100 font-semibold">{user?.name || 'Guest'}</strong> (
            <span className="capitalize text-emerald-400 font-medium">{user?.role || 'Guest'}</span>)
          </span>
        </div>

        {/* 1-Click Profile Switcher */}
        <div className="flex items-center space-x-1">
          <span className="text-zinc-500 mr-1.5 text-[11px] hidden md:inline font-medium">Switch Persona:</span>
          <button
            onClick={() => switchDemoRole('admin')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition btn-tactile ${
              user?.role === 'admin'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-600 shadow-2xs font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Admin
          </button>
          <button
            onClick={() => switchDemoRole('staff')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition btn-tactile ${
              user?.role === 'staff'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-600 shadow-2xs font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Staff
          </button>
          <button
            onClick={() => switchDemoRole('delivery')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition btn-tactile ${
              user?.role === 'delivery'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-600 shadow-2xs font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Delivery
          </button>
          <button
            onClick={() => switchDemoRole('customer')}
            className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold transition btn-tactile ${
              user?.role === 'customer'
                ? 'bg-zinc-800 text-white ring-1 ring-zinc-600 shadow-2xs font-bold'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            Customer
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('store')}
            className="flex items-center space-x-3 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#09090b] flex items-center justify-center text-white ring-1 ring-black/5 shadow-xs group-hover:scale-105 transition-transform duration-200">
              <Boxes className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-sm sm:text-base text-zinc-950 tracking-tight">
                  SmartGrocery
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-mono">
                  ERP
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Items */}
          <nav className="hidden xl:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition btn-tactile ${
                    isActive
                      ? 'bg-zinc-900 text-white shadow-2xs font-bold'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Barcode Scanner Button */}
            <button
              onClick={onOpenScanner}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-2xs transition btn-tactile"
              title="Open Barcode & QR Scanner"
            >
              <Barcode className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Scan SKU</span>
            </button>

            {/* Alerts Drawer Button */}
            <button
              onClick={onOpenAlerts}
              className="p-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 relative transition btn-tactile"
              title="Real-time Alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-amber-500 absolute top-1.5 right-1.5"></span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setActiveTab('cart')}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-2 btn-tactile ${
                activeTab === 'cart'
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs font-bold'
                  : 'border-zinc-200 text-zinc-800 hover:bg-zinc-100 font-semibold'
              }`}
              title="Shopping Bag"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 px-1 py-0.2 bg-emerald-500 text-white text-[9px] font-black rounded-full leading-none">
                    {totalItemsCount}
                  </span>
                )}
              </div>
              <span className="text-xs hidden sm:inline">Bag</span>
            </button>
          </div>
        </div>

        {/* Secondary horizontal navigation on smaller displays */}
        <div className="xl:hidden flex items-center space-x-1 overflow-x-auto py-1.5 border-t border-zinc-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap flex items-center space-x-1 transition btn-tactile ${
                  isActive
                    ? 'bg-zinc-900 text-white font-bold'
                    : 'text-zinc-600 hover:bg-zinc-100'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
