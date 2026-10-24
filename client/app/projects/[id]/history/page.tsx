"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Filter, Printer } from "lucide-react";
import clsx from "clsx";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import PrintableReport from "@/components/PrintableReport";

export default function History() {
  const params = useParams();
  
  const [project, setProject] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMonthly, setShowMonthly] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

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

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Loading historical audit data...</div>;
  if (!project) return <div className="p-10 text-center text-slate-600">Project not found</div>;

  // Filter to every 4th week if toggle is on (simulating monthly report)
  const displayData = showMonthly 
    ? kpiData.filter(d => d.entry.weekNumber % 4 === 0)
    : kpiData;

  const getAlertStyle = (alert: string) => {
    if (alert === 'Critical') return "bg-red-50 text-red-700 border-red-200";
    if (alert === 'At Risk') return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  };

  const currencySymbol = getCurrencySymbol(project.currency);

  return (
    <div className="py-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href={`/projects/${params.id}/dashboard`} className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors mb-2 text-sm">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance History & Reports</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {project.currency || 'NGN'}
            </span>
          </div>
          <p className="text-slate-500 mt-1">
            Weekly EVM metric audit trail for: <strong className="text-slate-800">{project.name}</strong>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Print Report Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-xs cursor-pointer text-sm"
          >
            <Printer size={16} />
            <span>Print Report</span>
          </button>

          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-lg">
            <button 
              onClick={() => setShowMonthly(false)}
              className={clsx("px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer", !showMonthly ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900")}
            >
              All Weeks
            </button>
            <button 
              onClick={() => setShowMonthly(true)}
              className={clsx("px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 cursor-pointer", showMonthly ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900")}
            >
              <Filter size={13} />
              Monthly Filter
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Wk</th>
                <th className="px-6 py-4 font-semibold text-right">Planned (PV)</th>
                <th className="px-6 py-4 font-semibold text-right">Earned (EV)</th>
                <th className="px-6 py-4 font-semibold text-right">Actual Cost (AC)</th>
                <th className="px-6 py-4 font-semibold text-center">CPI</th>
                <th className="px-6 py-4 font-semibold text-center">SPI</th>
                <th className="px-6 py-4 font-semibold text-right">EAC</th>
                <th className="px-6 py-4 font-semibold text-center">Task Done %</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((data) => (
                <tr key={data.entry._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">Week {data.entry.weekNumber}</td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">
                    {formatCurrency(data.entry.plannedValue, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">
                    {formatCurrency(data.entry.earnedValue, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono">
                    {formatCurrency(data.entry.actualCost, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-bold text-sm", data.metrics.CPI < 0.95 ? "text-red-600" : "text-emerald-600")}>
                      {data.metrics.CPI.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-bold text-sm", data.metrics.SPI < 0.95 ? "text-red-600" : "text-emerald-600")}>
                      {data.metrics.SPI.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold text-slate-800 font-mono">
                    {formatCurrency(data.metrics.EAC, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-700">
                      {data.entry.taskCompletionPercentage ?? "—"}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("px-3 py-1 text-xs font-semibold rounded-full border uppercase", getAlertStyle(data.metrics.alert))}>
                      {data.metrics.alert}
                    </span>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                    No weekly records found for this project view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Modal */}
      {showPrintModal && (
        <PrintableReport
          project={project}
          kpiData={kpiData}
          tasks={project.tasks || []}
          isModal={true}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
