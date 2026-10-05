"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
    nonConformances: "0",
    safetyIncidents: "0"
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${params.id}`);
        setProject(res.data);
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

  if (user?.role === 'viewer') return <div className="p-8 text-center text-red-500 font-bold">You don't have permission to view this page.</div>;

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
            {project ? `For project: ${project.name}` : 'Loading project details...'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Week Number</label>
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
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planned Value ($)</label>
                <input
                  type="number"
                  name="plannedValue"
                  value={formData.plannedValue}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Work that should be done</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Earned Value ($)</label>
                <input
                  type="number"
                  name="earnedValue"
                  value={formData.earnedValue}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Work actually completed</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Actual Cost ($)</label>
                <input
                  type="number"
                  name="actualCost"
                  value={formData.actualCost}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  min="0"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Money actually spent</p>
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
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading || !project}
              className="flex items-center gap-2 bg-blue-600 text-white font-medium px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
            >
              <Send size={18} />
              {loading ? "Submitting..." : "Submit KPI Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
