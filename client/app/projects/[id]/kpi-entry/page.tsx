"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, CheckSquare, Sparkles, Activity, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAuth } from "@/context/AuthContext";
import { getCurrencySymbol, formatCurrency } from "@/lib/currency";

export default function KPIEntry() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [project, setProject] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    weekNumber: "",
    plannedValue: "",
    earnedValue: "",
    actualCost: "",
    taskCompletionPercentage: "0",
    nonConformances: "0",
    safetyIncidents: "0"
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${params.id}`);
        setProject(res.data);
        if (res.data.taskCompletionPercentage !== undefined) {
          setFormData(prev => ({
            ...prev,
            taskCompletionPercentage: String(res.data.taskCompletionPercentage)
          }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (params.id) fetchProject();
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const payload = {
        weekNumber: Number(formData.weekNumber),
        plannedValue: Number(formData.plannedValue),
        earnedValue: Number(formData.earnedValue),
        actualCost: Number(formData.actualCost),
        taskCompletionPercentage: Number(formData.taskCompletionPercentage),
        nonConformances: Number(formData.nonConformances),
        safetyIncidents: Number(formData.safetyIncidents)
      };
      
      await api.post(`/kpis/${params.id}`, payload);
      router.push(`/projects/${params.id}/dashboard`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit KPI data");
      setLoading(false);
    }
  };

  const currencySymbol = getCurrencySymbol(project?.currency);

  // Live EVM metric computations
  const pv = Number(formData.plannedValue) || 0;
  const ev = Number(formData.earnedValue) || 0;
  const ac = Number(formData.actualCost) || 0;

  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = ac > 0 ? ev / ac : 1;
  const spi = pv > 0 ? ev / pv : 1;

  let liveStatus = { label: "On Track", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
  if (cpi < 0.85 || spi < 0.85) {
    liveStatus = { label: "Critical Variance", color: "text-red-700 bg-red-50 border-red-200" };
  } else if (cpi < 0.95 || spi < 0.95) {
    liveStatus = { label: "At Risk", color: "text-amber-700 bg-amber-50 border-amber-200" };
  }

  if (user?.role === 'viewer') {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="h-14 w-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-3">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 text-xs mt-1">Viewer accounts do not have write access to KPI telemetry.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="max-w-2xl mx-auto py-6"
    >
      <div className="flex justify-between items-center mb-6">
        <Link href={`/projects/${params.id}/dashboard`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="glass-card rounded-3xl shadow-md border border-slate-200/80 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
              Telemetry Entry
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">Record Weekly KPI Metrics</h1>
          <p className="text-slate-500 text-xs mt-1">
            {project ? (
              <span>
                Project: <strong className="text-slate-800">{project.name}</strong> • Currency: <strong className="text-blue-600">{project.currency || 'NGN'} ({currencySymbol})</strong>
              </span>
            ) : 'Loading project details...'}
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
              1. Earned Value Parameters
            </h3>
            
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Reporting Week Sequence *</label>
              <input
                type="number"
                name="weekNumber"
                value={formData.weekNumber}
                onChange={handleChange}
                className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                placeholder="e.g. 1"
                min="1"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">Sequential week index of the project schedule</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Planned Value ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    name="plannedValue"
                    value={formData.plannedValue}
                    onChange={handleChange}
                    className="w-full p-3 pl-8 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                    placeholder="PV"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Budgeted work scheduled</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Earned Value ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    name="earnedValue"
                    value={formData.earnedValue}
                    onChange={handleChange}
                    className="w-full p-3 pl-8 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                    placeholder="EV"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Budgeted work performed</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Actual Cost ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    name="actualCost"
                    value={formData.actualCost}
                    onChange={handleChange}
                    className="w-full p-3 pl-8 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                    placeholder="AC"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold">Actual cost incurred</p>
              </div>
            </div>
          </div>

          {/* Live EVM Telemetry Preview Card */}
          {(pv > 0 || ev > 0 || ac > 0) && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} className="text-blue-500" />
                  Live EVM Pre-computation
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${liveStatus.color}`}>
                  {liveStatus.label}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold block">CPI</span>
                  <span className={`font-mono font-bold text-sm ${cpi < 0.95 ? "text-red-600" : "text-emerald-700"}`}>
                    {cpi.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold block">SPI</span>
                  <span className={`font-mono font-bold text-sm ${spi < 0.95 ? "text-red-600" : "text-emerald-700"}`}>
                    {spi.toFixed(2)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold block">CV</span>
                  <span className={`font-mono font-bold text-xs ${cv < 0 ? "text-red-600" : "text-emerald-700"}`}>
                    {formatCurrency(cv, project?.currency)}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                  <span className="text-[10px] text-slate-400 font-semibold block">SV</span>
                  <span className={`font-mono font-bold text-xs ${sv < 0 ? "text-red-600" : "text-emerald-700"}`}>
                    {formatCurrency(sv, project?.currency)}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Task Completion Percentage Input */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <CheckSquare size={16} className="text-emerald-600" />
              <span>2. Task Completion Status</span>
            </h3>
            
            <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200/70">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold text-slate-700">
                  Overall Task Work Completion Rate for Week {formData.weekNumber || "—"}
                </label>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {formData.taskCompletionPercentage}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                name="taskCompletionPercentage"
                value={formData.taskCompletionPercentage}
                onChange={handleChange}
                className="w-full h-2 accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
                <span>0% (Kickoff)</span>
                <span>50% (Mid-Execution)</span>
                <span>100% (Fully Handed Over)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              3. Quality & Safety Audit
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Non-Conformances (NCR)</label>
                <input
                  type="number"
                  name="nonConformances"
                  value={formData.nonConformances}
                  onChange={handleChange}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Inspection audit failures or rework items</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Safety Incidents</label>
                <input
                  type="number"
                  name="safetyIncidents"
                  value={formData.safetyIncidents}
                  onChange={handleChange}
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">Reported site near-misses, injuries, or hazards</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !project}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-70 cursor-pointer text-xs"
            >
              <Send size={15} />
              <span>{loading ? "Submitting..." : "Submit Weekly KPI Data"}</span>
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
