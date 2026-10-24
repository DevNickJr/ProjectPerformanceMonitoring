"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send, CheckSquare } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getCurrencySymbol } from "@/lib/currency";

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

  if (user?.role === 'viewer') return <div className="p-8 text-center text-red-500 font-bold">You don't have permission to record KPI data.</div>;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <Link href={`/projects/${params.id}/dashboard`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">Submit Weekly KPI Data</h1>
          <p className="text-slate-500 text-sm mt-1">
            {project ? (
              <span>
                Project: <strong className="text-slate-800">{project.name}</strong> • Currency: <strong className="text-blue-600">{project.currency || 'NGN'} ({currencySymbol})</strong>
              </span>
            ) : 'Loading project details...'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Earned Value Metrics</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Week Number *</label>
              <input
                type="number"
                name="weekNumber"
                value={formData.weekNumber}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. 1"
                min="1"
                required
              />
              <p className="text-xs text-slate-400 mt-1">Numerical sequence of the reporting week</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Planned Value ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    name="plannedValue"
                    value={formData.plannedValue}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="PV"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Work that should be done</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Earned Value ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    name="earnedValue"
                    value={formData.earnedValue}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="EV"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Work actually completed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Actual Cost ({currencySymbol}) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">{currencySymbol}</span>
                  <input
                    type="number"
                    name="actualCost"
                    value={formData.actualCost}
                    onChange={handleChange}
                    className="w-full p-2.5 pl-8 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="AC"
                    min="0"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Money actually spent</p>
              </div>
            </div>
          </div>

          {/* Task Completion Percentage Input */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2 flex items-center gap-2">
              <CheckSquare size={18} className="text-emerald-600" />
              <span>Task Completion Progress</span>
            </h3>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-700">
                  Overall Task Completion Percentage for Week {formData.weekNumber || "—"}
                </label>
                <span className="text-lg font-extrabold text-emerald-600">
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
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0% (Not Started)</span>
                <span>50% (Midway)</span>
                <span>100% (Fully Completed)</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Incidents & Quality</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Non-Conformances</label>
                <input
                  type="number"
                  name="nonConformances"
                  value={formData.nonConformances}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Defects or failed inspections</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Safety Incidents</label>
                <input
                  type="number"
                  name="safetyIncidents"
                  value={formData.safetyIncidents}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-xs text-slate-400 mt-1">Accidents, injuries, or near-misses</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || !project}
              className="flex items-center gap-2 bg-blue-600 text-white font-medium px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
            >
              <Send size={18} />
              {loading ? "Submitting..." : "Submit Weekly KPI Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
