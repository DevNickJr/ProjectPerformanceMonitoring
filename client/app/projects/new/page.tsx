"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
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

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Link href="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition-colors">
        <ArrowLeft size={16} />
        Back to Projects
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <h1 className="text-2xl font-bold text-slate-900">Create New Project</h1>
          <p className="text-slate-500 text-sm mt-1">Set up your project details and KPI priorities</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">Basic Info</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g. Alpha Base Construction"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Budget at Completion ($)</label>
                <input
                  type="number"
                  name="budgetAtCompletion"
                  value={formData.budgetAtCompletion}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="100000"
                  min="0"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Planned Duration (Weeks)</label>
                <input
                  type="number"
                  name="plannedDurationWeeks"
                  value={formData.plannedDurationWeeks}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="52"
                  min="1"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-5">
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-2">KPI Priorities</h3>
            <p className="text-xs text-slate-500 mb-4">Set visual priority markers for different metrics</p>
            
            <div className="grid grid-cols-2 gap-5">
              {['cost', 'schedule', 'quality', 'safety'].map((kpi) => (
                <div key={kpi}>
                  <label className="block text-sm font-medium text-slate-700 mb-1 capitalize">{kpi} Priority</label>
                  <select
                    name={kpi}
                    value={(formData.kpiPriorities as any)[kpi]}
                    onChange={handleChange}
                    className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white font-medium px-8 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
