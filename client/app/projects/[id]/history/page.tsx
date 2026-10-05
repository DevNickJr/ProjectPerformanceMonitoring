"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Filter } from "lucide-react";
import clsx from "clsx";

export default function History() {
  const params = useParams();
  
  const [project, setProject] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMonthly, setShowMonthly] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, kpiRes] = await Promise.all([
          api.get(`/projects/${params.id}`),
          api.get(`/kpis/${params.id}`)
        ]);
        setProject(projRes.data);
        setKpiData(kpiRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (params.id) fetchData();
  }, [params.id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading history...</div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  // Filter to every 4th week if toggle is on (simulating monthly report)
  const displayData = showMonthly 
    ? kpiData.filter(d => d.entry.weekNumber % 4 === 0)
    : kpiData;

  const getAlertStyle = (alert: string) => {
    if (alert === 'Critical') return "bg-red-50 text-red-700 border-red-200";
    if (alert === 'At Risk') return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="py-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href={`/projects/${params.id}/dashboard`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors mb-2 text-sm">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">History & Reports</h1>
          <p className="text-slate-500 mt-1">
            {project.name}
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-white border border-slate-200 p-1.5 rounded-lg">
          <button 
            onClick={() => setShowMonthly(false)}
            className={clsx("px-4 py-2 text-sm font-medium rounded-md transition-colors", !showMonthly ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900")}
          >
            All Weeks
          </button>
          <button 
            onClick={() => setShowMonthly(true)}
            className={clsx("px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2", showMonthly ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900")}
          >
            <Filter size={14} />
            Monthly (Every 4th)
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Wk</th>
                <th className="px-6 py-4 font-semibold text-right">PV</th>
                <th className="px-6 py-4 font-semibold text-right">EV</th>
                <th className="px-6 py-4 font-semibold text-right">AC</th>
                <th className="px-6 py-4 font-semibold text-center">CPI</th>
                <th className="px-6 py-4 font-semibold text-center">SPI</th>
                <th className="px-6 py-4 font-semibold text-right">EAC</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((data) => (
                <tr key={data.entry._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{data.entry.weekNumber}</td>
                  <td className="px-6 py-4 text-right text-slate-600">${data.entry.plannedValue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-600">${data.entry.earnedValue.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-slate-600">${data.entry.actualCost.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-semibold", data.metrics.CPI < 0.95 ? "text-red-600" : "text-emerald-600")}>
                      {data.metrics.CPI.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-semibold", data.metrics.SPI < 0.95 ? "text-red-600" : "text-emerald-600")}>
                      {data.metrics.SPI.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-800">
                    ${data.metrics.EAC.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("px-3 py-1 text-xs font-semibold rounded-full border", getAlertStyle(data.metrics.alert))}>
                      {data.metrics.alert}
                    </span>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                    No records found for the selected view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
