import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, UserCheck, Lock } from 'lucide-react';

export const RoleGate = ({ allowedRoles = ['admin'], children, onBackToShop }) => {
  const { user, switchDemoRole } = useAuth();

  const isAllowed = user && allowedRoles.includes(user.role);

  if (isAllowed) {
    return children;
  }

  return (
    <div className="max-w-xl mx-auto py-16 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 shadow-sm">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
          Role-Based Access Control (RBAC)
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900">
          Staff / Admin Clearance Required
        </h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          You are currently viewing the system as a{' '}
          <strong className="text-purple-700 font-black uppercase">
            {user?.role || 'Guest'}
          </strong>
          . This management module is restricted to{' '}
          <strong className="text-slate-800">{allowedRoles.join(' or ')}</strong> personnel.
        </p>
      </div>

      {/* Quick 1-click switch button */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs max-w-sm mx-auto space-y-3">
        <span className="text-xs font-semibold text-slate-500 block">
          Switch to an authorized demo role:
        </span>
        <div className="flex flex-col gap-2">
          {allowedRoles.includes('admin') && (
            <button
              onClick={() => switchDemoRole('admin')}
              className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>Switch to Store Admin (Harish Kumar)</span>
            </button>
          )}

          {allowedRoles.includes('staff') && (
            <button
              onClick={() => switchDemoRole('staff')}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Staff / Cashier (Ravi)</span>
            </button>
          )}

          {allowedRoles.includes('delivery') && (
            <button
              onClick={() => switchDemoRole('delivery')}
              className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <UserCheck className="w-4 h-4" />
              <span>Switch to Delivery Agent (Karthik)</span>
            </button>
          )}
        </div>
      </div>

      {onBackToShop && (
        <button
          onClick={onBackToShop}
          className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
        >
          Return to Customer Storefront
        </button>
      )}
    </div>
  );
};
