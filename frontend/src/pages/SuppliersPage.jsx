import React, { useState, useEffect } from 'react';
import { groceryApi } from '../services/api';
import {
  Users,
  Star,
  Clock,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';

export const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState('Dairy & Eggs');
  const [recommended, setRecommended] = useState(null);

  const [error, setError] = useState(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await groceryApi.getSuppliers();
      setSuppliers(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load suppliers directory');
    } finally {
      setLoading(false);
    }
  };

  const checkRecommendation = async (cat) => {
    setSelectedCat(cat);
    try {
      const res = await groceryApi.recommendSupplier(cat);
      setRecommended(res.data.bestRecommendation);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    checkRecommendation('Dairy & Eggs');
  }, []);

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center space-x-2">
          <Users className="w-6 h-6 text-emerald-600" />
          <span>Supplier Directory & Procurement Performance</span>
        </h1>
        <p className="text-xs text-slate-500">
          Section 19: Ratings, lead times, delivery reliability and category-based vendor selection
        </p>
      </div>

      {/* Section 19 Smart Supplier Recommendation Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-sm">AI Vendor Matchmaker (Section 19)</h3>
        </div>
        <p className="text-xs text-slate-300">
          Evaluates delivery lead time, rating score, and product category to choose the optimal supplier.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-400 font-semibold">Test Category:</span>
          {['Dairy & Eggs', 'Grains & Staples', 'Bakery & Bread', 'Fresh Produce', 'Beverages'].map((cat) => (
            <button
              key={cat}
              onClick={() => checkRecommendation(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                selectedCat === cat
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {recommended && (
          <div className="p-4 bg-white/10 rounded-xl backdrop-blur-xs border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                ⭐ Top Recommended Vendor for {selectedCat}:
              </span>
              <h4 className="font-bold text-base text-white mt-0.5">{recommended.name}</h4>
              <p className="text-xs text-slate-300">Contact: {recommended.contactPerson} ({recommended.phone})</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <div className="text-center">
                <span className="text-slate-400 block text-[10px]">Rating</span>
                <span className="text-amber-400 font-black text-sm">★ {recommended.rating} / 5.0</span>
              </div>
              <div className="text-center">
                <span className="text-slate-400 block text-[10px]">Lead Time</span>
                <span className="text-emerald-400 font-black text-sm">{recommended.averageDeliveryDays} Day(s)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((supp) => (
          <div
            key={supp._id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{supp.name}</h3>
                  <span className="text-xs text-slate-500">{supp.contactPerson}</span>
                </div>
                <div className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{supp.rating}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1">
                {supp.categoriesSupplied?.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700"
                  >
                    {c}
                  </span>
                ))}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supp.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{supp.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="line-clamp-1">{supp.address}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lead Time: <strong>{supp.averageDeliveryDays}d</strong></span>
              </div>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Reliability: <strong>{supp.reliabilityScore}%</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
