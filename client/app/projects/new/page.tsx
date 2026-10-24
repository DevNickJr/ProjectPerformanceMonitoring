"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft, Coins, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currency";

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    currency: "NGN",
    budgetAtCompletion: "",
    plannedDurationWeeks: "",
    kpiPriorities: {
      cost: "medium",
      schedule: "medium",
      quality: "medium",
      safety: "medium"
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (['cost', 'schedule', 'quality', 'safety'].includes(name)) {
      setFormData({
        ...formData,
        kpiPriorities: {
          ...formData.kpiPriorities,
          [name]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePrioritySelect = (metric: string, level: string) => {
    setFormData({
      ...formData,
      kpiPriorities: {
        ...formData.kpiPriorities,
        [metric]: level
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const payload = {
        ...formData,
        budgetAtCompletion: Number(formData.budgetAtCompletion),
        plannedDurationWeeks: Number(formData.plannedDurationWeeks)
      };
      
      const res = await api.post("/projects", payload);
      router.push(`/projects/${res.data._id}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create project");
      setLoading(false);
    }
  };

  const selectedCurrencySymbol = getCurrencySymbol(formData.currency);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto py-6"
    >
      <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
        <ArrowLeft size={14} />
        Back to Projects Portfolio
      </Link>
      
      <div className="glass-card rounded-3xl shadow-md border border-slate-200/80 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Project Initialization
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Create Monitored Project
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Configure project baselines, financial currency, and KPI priority weightings
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Project Vital Statistics
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                placeholder="e.g. Mechanical Workshop Automation Phase 1"
                required
              />
            </div>

            {/* Currency Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                <Coins size={15} className="text-amber-500" />
                <span>Select Currency Standard *</span>
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium cursor-pointer"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name} ({c.country})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                EVM metrics (BAC, PV, EV, AC, CV, SV, EAC) will calculate and print in this currency.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Budget at Completion (BAC in {selectedCurrencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">
                    {selectedCurrencySymbol}
                  </span>
                  <input
                    type="number"
                    name="budgetAtCompletion"
                    value={formData.budgetAtCompletion}
                    onChange={handleChange}
                    className="w-full p-3 pl-9 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                    placeholder="1000000"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Planned Baseline Duration (Weeks) *
                </label>
                <input
                  type="number"
                  name="plannedDurationWeeks"
                  value={formData.plannedDurationWeeks}
                  onChange={handleChange}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  placeholder="24"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>
          
          {/* Segmented KPI Priorities */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. KPI Focus & Priority Weights
            </h3>
            <p className="text-[11px] text-slate-400">
              Set organizational attention markers for each engineering performance dimension
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['cost', 'schedule', 'quality', 'safety'].map((kpi) => {
                const currentVal = (formData.kpiPriorities as any)[kpi];
                return (
                  <div key={kpi} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/70">
                    <span className="block text-xs font-bold text-slate-800 capitalize mb-2">
                      {kpi} Priority
                    </span>
                    <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-xl border border-slate-200">
                      {['low', 'medium', 'high'].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => handlePrioritySelect(kpi, level)}
                          className={`text-xs py-1 rounded-lg font-semibold capitalize transition-all cursor-pointer ${
                            currentVal === level
                              ? level === 'high' 
                                ? 'bg-rose-50 text-rose-700 shadow-2xs border border-rose-200' 
                                : level === 'medium' 
                                ? 'bg-blue-50 text-blue-700 shadow-2xs border border-blue-200'
                                : 'bg-slate-100 text-slate-700 shadow-2xs'
                              : 'text-slate-400 hover:text-slate-700'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 cursor-pointer"
            >
              {loading ? "Creating..." : "Create Project"}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
