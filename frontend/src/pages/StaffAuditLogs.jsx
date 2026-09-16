import React, { useState, useEffect } from 'react';
import { groceryApi } from '../services/api';
import {
  ShieldCheck,
  Users,
  Lock,
  Plus,
  Trash2,
  Clock,
  UserCheck,
  FileSearch,
  Activity
} from 'lucide-react';

export const StaffAuditLogs = () => {
  const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'logs'
  const [staffList, setStaffList] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New staff form
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff',
    phone: '',
  });

  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, logsRes] = await Promise.all([
        groceryApi.getStaff(),
        groceryApi.getAuditLogs(),
      ]);
      setStaffList(staffRes.data.data || []);
      setAuditLogs(logsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Access restricted to Store Administrator');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await groceryApi.createStaff(newStaff);
      setNewStaff({ name: '', email: '', password: '', role: 'staff', phone: '' });
      fetchData();
      alert('New staff member added with role permissions!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create staff');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Revoke access for this staff member?')) return;
    try {
      await groceryApi.deleteStaff(id);
      fetchData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
            <span>Staff RBAC Permissions & Security Audit Logs</span>
          </h1>
          <p className="text-xs text-slate-500">
            Section 1 & 16: Role-based access control, login tracking, mutation history and system audit trails
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'staff'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Staff Directory ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Audit Trail ({auditLogs.length})
          </button>
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

      {activeTab === 'staff' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Staff List */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Active Staff & Role Permissions
              </h3>
              <span className="text-xs font-mono text-slate-400">Section 1</span>
            </div>

            <div className="divide-y divide-slate-100">
              {staffList.map((st) => (
                <div key={st._id} className="p-4 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                      {st.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{st.name}</h4>
                      <span className="text-slate-500">{st.email}</span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        Phone: {st.phone || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        st.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : st.role === 'delivery'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {st.role}
                    </span>

                    {st.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteStaff(st._id)}
                        className="p-1 text-slate-300 hover:text-red-500 transition"
                        title="Delete staff"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Staff Form */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Add New Staff Member</h3>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Email (Login ID)</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  placeholder="suresh@grocery.com"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Role / Permissions</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full p-2 rounded-xl border border-slate-300"
                >
                  <option value="staff">Store Staff / Cashier</option>
                  <option value="delivery">Delivery Agent</option>
                  <option value="admin">Store Admin</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  placeholder="+91 9840000000"
                  className="w-full p-2 rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition mt-2 shadow-xs"
              >
                Create Staff Account
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* Section 16: Security Audit Log Table */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Immutable Audit Trail (Section 16)
              </h3>
              <p className="text-[11px] text-slate-400">
                Records who executed actions, stock adjustments, price changes, and approval logs
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} events logged</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor / User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action Type</th>
                  <th className="px-4 py-3">Operation Details</th>
                  <th className="px-4 py-3">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {auditLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{log.userName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-700">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-slate-700 max-w-md">{log.details}</td>
                    <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                      {log.ipAddress}
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
