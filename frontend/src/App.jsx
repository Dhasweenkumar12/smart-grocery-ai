import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { RoleGate } from './components/RoleGate';
import { GeminiAssistantModal } from './components/GeminiAssistantModal';

// Pages
import { Storefront } from './pages/Storefront';
import { CartCheckout } from './pages/CartCheckout';
import { PosCounter } from './pages/PosCounter';
import { InventoryManagement } from './pages/InventoryManagement';
import { AIForecasting } from './pages/AIForecasting';
import { PurchaseOrders } from './pages/PurchaseOrders';
import { SuppliersPage } from './pages/SuppliersPage';
import { DeliveryPortal } from './pages/DeliveryPortal';
import { AdminDashboard } from './pages/AdminDashboard';
import { StaffAuditLogs } from './pages/StaffAuditLogs';

function MainApp() {
  const [activeTab, setActiveTab] = useState('store');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const { loading } = useAuth();
  const { cart, addToCart } = useCart();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-500">Initializing Smart Grocery AI Platform...</p>
        </div>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'store':
        return <Storefront onGoToCart={() => setActiveTab('cart')} />;
      case 'cart':
        return (
          <CartCheckout
            onBackToShop={() => setActiveTab('store')}
            onOrderPlaced={() => {}}
          />
        );
      case 'pos':
        return (
          <RoleGate allowedRoles={['admin', 'staff']} onBackToShop={() => setActiveTab('store')}>
            <PosCounter />
          </RoleGate>
        );
      case 'inventory':
        return (
          <RoleGate allowedRoles={['admin', 'staff']} onBackToShop={() => setActiveTab('store')}>
            <InventoryManagement />
          </RoleGate>
        );
      case 'ai-forecast':
        return (
          <RoleGate allowedRoles={['admin', 'staff']} onBackToShop={() => setActiveTab('store')}>
            <AIForecasting />
          </RoleGate>
        );
      case 'reorders':
        return (
          <RoleGate allowedRoles={['admin', 'staff']} onBackToShop={() => setActiveTab('store')}>
            <PurchaseOrders />
          </RoleGate>
        );
      case 'suppliers':
        return (
          <RoleGate allowedRoles={['admin', 'staff']} onBackToShop={() => setActiveTab('store')}>
            <SuppliersPage />
          </RoleGate>
        );
      case 'delivery':
        return (
          <RoleGate allowedRoles={['admin', 'delivery']} onBackToShop={() => setActiveTab('store')}>
            <DeliveryPortal />
          </RoleGate>
        );
      case 'dashboard':
        return (
          <RoleGate allowedRoles={['admin', 'staff']} onBackToShop={() => setActiveTab('store')}>
            <AdminDashboard />
          </RoleGate>
        );
      case 'audit':
        return (
          <RoleGate allowedRoles={['admin']} onBackToShop={() => setActiveTab('store')}>
            <StaffAuditLogs />
          </RoleGate>
        );
      default:
        return <Storefront onGoToCart={() => setActiveTab('cart')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {renderActiveTab()}
      </main>

      {/* Barcode & QR Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onProductSelected={() => {}}
      />

      {/* Intelligent Alerts Drawer */}
      <AlertsDrawer
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        onNavigate={(tabRoute) => {
          if (tabRoute.includes('inventory')) setActiveTab('inventory');
          else if (tabRoute.includes('orders') || tabRoute.includes('delivery')) setActiveTab('delivery');
          else if (tabRoute.includes('reorders')) setActiveTab('reorders');
        }}
      />

      {/* Google Gemini AI Shopping Assistant & Recipe Planner */}
      <GeminiAssistantModal
        cart={cart.map((item) => item.product)}
        onAddToCart={(product) => addToCart(product, 1)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 border-t border-slate-800 mt-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
              SG
            </div>
            <div>
              <span className="font-bold text-white block tracking-wide">
                SmartGrocery AI • Enterprise Retail & Quick-Commerce
              </span>
              <span className="text-slate-500 text-[11px] block mt-0.5">
                Real-Time FEFO Inventory • Scikit-Learn Predictive Ordering • Automated In-Store POS & Dispatch
              </span>
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <span>Production Build • Offline First • Zero Cloud API Dependencies</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
