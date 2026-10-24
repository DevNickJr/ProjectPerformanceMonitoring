"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Filter, Printer, Calendar, Clock, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Loading historical performance audit logs...</p>
      </div>
    );
  }

  if (!project) return <div className="p-10 text-center text-slate-600">Project not found</div>;

  // Filter to every 4th week if toggle is on (simulating monthly report)
  const displayData = showMonthly 
    ? kpiData.filter(d => d.entry.weekNumber % 4 === 0)
    : kpiData;

  const getAlertStyle = (alert: string) => {
    if (alert === 'Critical') return "bg-red-50 text-red-700 border-red-200/80 ring-1 ring-red-600/10";
    if (alert === 'At Risk') return "bg-amber-50 text-amber-700 border-amber-200/80 ring-1 ring-amber-600/10";
    return "bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-1 ring-emerald-600/10";
  };

  const currencySymbol = getCurrencySymbol(project.currency);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="py-6 max-w-6xl mx-auto space-y-7"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href={`/projects/${params.id}/dashboard`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2">
            <ArrowLeft size={14} />
            Back to Project Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Performance History & Audit</h1>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-2xs">
              {project.currency || 'NGN'}
            </span>
          </div>
          <p className="text-slate-500 mt-1 text-xs">
            Weekly EVM metric audit trail and progression for: <strong className="text-slate-800">{project.name}</strong>
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Print Report Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-2xs cursor-pointer"
          >
            <Printer size={15} className="text-slate-500" />
            <span>Print Report</span>
          </motion.button>

          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            <button 
              onClick={() => setShowMonthly(false)}
              className={clsx("px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer", !showMonthly ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800")}
            >
              All Weeks ({kpiData.length})
            </button>
            <button 
              onClick={() => setShowMonthly(true)}
              className={clsx("px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer", showMonthly ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800")}
            >
              <Filter size={12} />
              Monthly Filter
            </button>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/70 text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-4">Sequence</th>
                <th className="px-6 py-4 text-right">Planned (PV)</th>
                <th className="px-6 py-4 text-right">Earned (EV)</th>
                <th className="px-6 py-4 text-right">Actual Cost (AC)</th>
                <th className="px-6 py-4 text-center">Cost Index (CPI)</th>
                <th className="px-6 py-4 text-center">Schedule Index (SPI)</th>
                <th className="px-6 py-4 text-right">Forecast (EAC)</th>
                <th className="px-6 py-4 text-center">Task Done %</th>
                <th className="px-6 py-4 text-center">Health Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayData.map((data) => (
                <tr key={data.entry._id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                      Week {data.entry.weekNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono text-xs">
                    {formatCurrency(data.entry.plannedValue, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono text-xs">
                    {formatCurrency(data.entry.earnedValue, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600 font-mono text-xs">
                    {formatCurrency(data.entry.actualCost, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-bold text-xs font-mono", data.metrics.CPI < 0.95 ? "text-red-600" : "text-emerald-600")}>
                      {data.metrics.CPI.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("font-bold text-xs font-mono", data.metrics.SPI < 0.95 ? "text-red-600" : "text-emerald-600")}>
                      {data.metrics.SPI.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-900 font-mono text-xs">
                    {formatCurrency(data.metrics.EAC, project.currency)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-semibold text-xs bg-slate-100 px-2.5 py-0.5 rounded-full text-slate-700 font-mono">
                      {data.entry.taskCompletionPercentage ?? "—"}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={clsx("px-3 py-1 text-[11px] font-bold rounded-full border uppercase shadow-2xs", getAlertStyle(data.metrics.alert))}>
                      {data.metrics.alert}
                    </span>
                  </td>
                </tr>
              ))}
              {displayData.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-14 text-center text-slate-400 text-xs">
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
    </motion.div>
  );
}
