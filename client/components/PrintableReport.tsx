"use client";

import React, { useRef } from "react";
import { Printer, Download, X } from "lucide-react";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

interface PrintableReportProps {
  project: any;
  kpiData: any[];
  tasks?: any[];
  onClose?: () => void;
  isModal?: boolean;
}

export default function PrintableReport({
  project,
  kpiData = [],
  tasks = [],
  onClose,
  isModal = false,
}: PrintableReportProps) {
  const latestData = kpiData.length > 0 ? kpiData[kpiData.length - 1] : null;
  const metrics = latestData?.metrics;
  const entry = latestData?.entry;
  const currencySymbol = getCurrencySymbol(project?.currency);

  const handlePrint = () => {
    window.print();
  };

  // Forecasted dates
  const start = new Date(project?.startDate || Date.now());
  const validStart = isNaN(start.getTime()) ? new Date() : start;
  const plannedEndDate = new Date(validStart);
  plannedEndDate.setDate(plannedEndDate.getDate() + (project?.plannedDurationWeeks || 0) * 7);

  const safeSPI = metrics?.SPI && metrics.SPI > 0 ? metrics.SPI : 1;
  const forecastedWeeks = Math.max(1, Math.round((project?.plannedDurationWeeks || 1) / safeSPI));
  const scheduleDelayWeeks = Math.round(forecastedWeeks - (project?.plannedDurationWeeks || 1));
  const forecastedEndDate = new Date(validStart);
  forecastedEndDate.setDate(forecastedEndDate.getDate() + forecastedWeeks * 7);

  const content = (
    <div className="printable-document bg-white text-slate-900 p-8 sm:p-12 max-w-4xl mx-auto font-sans">
      {/* Action bar (Hidden when printed) */}
      <div className="print:hidden flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-700">Official Report View</span>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Ready to Print / PDF</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Report / Save as PDF</span>
          </button>
          {isModal && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-2 rounded-lg"
              title="Close Preview"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Official Academic & Institutional Header */}
      <div className="border-b-2 border-slate-900 pb-6 mb-6 text-center">
        <div className="text-xs font-bold tracking-widest text-slate-600 uppercase mb-1">
          Rivers State University • Faculty of Engineering
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 uppercase">
          RSU Project Monitor KPI
        </h1>
        <div className="text-sm font-semibold text-blue-900 mt-1 max-w-2xl mx-auto">
          "Development of a Web Application For Real-Time Project Performance Monitoring"
        </div>
        <div className="mt-2 text-xs text-slate-700 font-medium">
          by <span className="font-bold text-slate-900">NLUMANZE, Zerubbabel Chiwendu</span> | Reg No:{" "}
          <span className="font-bold text-slate-900">MEM.2024/FT/MEC/0024</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-1">
          Department of Mechanical Engineering • Executive Project Performance & Evaluation Report
        </div>
      </div>

      {/* Project Meta Information */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-6">
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-0.5">Project Title</span>
          <span className="text-slate-900 font-bold text-sm block">{project?.name}</span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-0.5">Budget (BAC)</span>
          <span className="text-slate-900 font-bold text-sm block">
            {formatCurrency(project?.budgetAtCompletion, project?.currency)} ({project?.currency || "NGN"})
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-0.5">Duration / Baseline</span>
          <span className="text-slate-900 font-bold text-sm block">
            {project?.plannedDurationWeeks} Weeks
          </span>
        </div>
        <div>
          <span className="text-slate-500 uppercase font-semibold block mb-0.5">Report Date</span>
          <span className="text-slate-900 font-bold text-sm block">
            {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Executive Performance Summary (EVM KPIs) */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 border-b pb-1">
          1. Key Performance Indicators (Earned Value Management)
        </h3>
        
        {metrics ? (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">CPI</span>
              <span className={`text-xl font-extrabold block mt-1 ${metrics.CPI < 0.95 ? "text-red-600" : "text-emerald-700"}`}>
                {metrics.CPI.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-500">
                {metrics.CPI < 1 ? "Over Budget" : "Cost Efficient"}
              </span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">SPI</span>
              <span className={`text-xl font-extrabold block mt-1 ${metrics.SPI < 0.95 ? "text-red-600" : "text-emerald-700"}`}>
                {metrics.SPI.toFixed(2)}
              </span>
              <span className="text-[9px] text-slate-500">
                {metrics.SPI < 1 ? "Behind Schedule" : "On / Ahead"}
              </span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Cost Variance (CV)</span>
              <span className={`text-sm font-bold block mt-1.5 ${metrics.CV < 0 ? "text-red-600" : "text-emerald-700"}`}>
                {formatCurrency(metrics.CV, project?.currency)}
              </span>
              <span className="text-[9px] text-slate-500">EV – AC</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Schedule Variance (SV)</span>
              <span className={`text-sm font-bold block mt-1.5 ${metrics.SV < 0 ? "text-red-600" : "text-emerald-700"}`}>
                {formatCurrency(metrics.SV, project?.currency)}
              </span>
              <span className="text-[9px] text-slate-500">EV – PV</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Estimate at Compl. (EAC)</span>
              <span className="text-sm font-bold text-slate-900 block mt-1.5">
                {formatCurrency(metrics.EAC, project?.currency)}
              </span>
              <span className="text-[9px] text-slate-500">Projected Total Cost</span>
            </div>

            <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Status</span>
              <span className={`text-sm font-extrabold block mt-1.5 uppercase ${
                metrics.alert === 'Critical' ? 'text-red-600' :
                metrics.alert === 'At Risk' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {metrics.alert || "On Track"}
              </span>
              <span className="text-[9px] text-slate-500">Risk Assessment</span>
            </div>
          </div>
        ) : (
          <div className="p-4 border rounded-lg text-center text-xs text-slate-500">
            No KPI data recorded yet for this project.
          </div>
        )}
      </div>

      {/* 2. Task Completion & Timeline Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        {/* Task Completion Box */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b pb-1">
            2. Task Completion Percentage
          </h3>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-700">Project Progress:</span>
            <span className="text-2xl font-extrabold text-emerald-700">
              {project?.taskCompletionPercentage || 0}%
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 border border-slate-200 overflow-hidden mb-2">
            <div
              className="bg-emerald-600 h-full rounded-full"
              style={{ width: `${project?.taskCompletionPercentage || 0}%` }}
            />
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between">
            <span>Tasks Recorded: {tasks.length}</span>
            <span>Completed: {tasks.filter(t => t.status === 'Completed').length}</span>
          </div>
        </div>

        {/* Timeline Summary Box */}
        <div className="border border-slate-200 rounded-lg p-4 bg-white">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b pb-1">
            3. Project Completion Timeline
          </h3>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Start Date:</span>
              <span className="font-semibold text-slate-800">{validStart.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Planned End Date:</span>
              <span className="font-semibold text-slate-800">{plannedEndDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Forecasted End Date:</span>
              <span className={`font-semibold ${scheduleDelayWeeks > 0 ? "text-red-700" : "text-emerald-700"}`}>
                {forecastedEndDate.toLocaleDateString()} ({forecastedWeeks} wks)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Schedule Variance:</span>
              <span className={`font-semibold ${scheduleDelayWeeks > 0 ? "text-red-700" : "text-emerald-700"}`}>
                {scheduleDelayWeeks > 0 ? `+${scheduleDelayWeeks} Weeks Behind` : scheduleDelayWeeks < 0 ? `${scheduleDelayWeeks} Weeks Ahead` : "On Schedule"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Weekly KPI Historical Log */}
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 border-b pb-1">
          4. Weekly Performance Log & Audit Trail
        </h3>
        <table className="w-full text-xs text-left border-collapse border border-slate-300">
          <thead className="bg-slate-100 font-bold text-slate-700">
            <tr>
              <th className="border border-slate-300 p-2 text-center">Wk</th>
              <th className="border border-slate-300 p-2 text-right">Planned (PV)</th>
              <th className="border border-slate-300 p-2 text-right">Earned (EV)</th>
              <th className="border border-slate-300 p-2 text-right">Actual Cost (AC)</th>
              <th className="border border-slate-300 p-2 text-center">CPI</th>
              <th className="border border-slate-300 p-2 text-center">SPI</th>
              <th className="border border-slate-300 p-2 text-right">EAC</th>
              <th className="border border-slate-300 p-2 text-center">Progress %</th>
              <th className="border border-slate-300 p-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {kpiData.length === 0 ? (
              <tr>
                <td colSpan={9} className="border border-slate-300 p-3 text-center text-slate-500">
                  No records recorded.
                </td>
              </tr>
            ) : (
              kpiData.map((d) => (
                <tr key={d.entry._id}>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">{d.entry.weekNumber}</td>
                  <td className="border border-slate-300 p-1.5 text-right">{formatCurrency(d.entry.plannedValue, project?.currency)}</td>
                  <td className="border border-slate-300 p-1.5 text-right">{formatCurrency(d.entry.earnedValue, project?.currency)}</td>
                  <td className="border border-slate-300 p-1.5 text-right">{formatCurrency(d.entry.actualCost, project?.currency)}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">{d.metrics.CPI.toFixed(2)}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold">{d.metrics.SPI.toFixed(2)}</td>
                  <td className="border border-slate-300 p-1.5 text-right">{formatCurrency(d.metrics.EAC, project?.currency)}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-semibold">{d.entry.taskCompletionPercentage ?? "—"}%</td>
                  <td className="border border-slate-300 p-1.5 text-center font-semibold uppercase">{d.metrics.alert}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Official Academic and Industrial Signatures Block */}
      <div className="pt-8 border-t-2 border-slate-900 mt-10">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-6">
          5. Verification & Academic Evaluation Sign-Off
        </div>

        <div className="grid grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="flex flex-col justify-end pt-10">
            <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">
              NLUMANZE, Zerubbabel Chiwendu
            </div>
            <div className="text-[11px] text-slate-500">Researcher / Project Lead</div>
            <div className="text-[10px] text-slate-400">Date: ________________________</div>
          </div>

          <div className="flex flex-col justify-end pt-10">
            <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">
              Project Supervisor
            </div>
            <div className="text-[11px] text-slate-500">Department of Mechanical Engineering</div>
            <div className="text-[10px] text-slate-400">Date: ________________________</div>
          </div>

          <div className="flex flex-col justify-end pt-10">
            <div className="border-t border-slate-900 pt-2 font-bold text-slate-900">
              Internal / External Examiner
            </div>
            <div className="text-[11px] text-slate-500">Postgraduate Board of Examiners</div>
            <div className="text-[10px] text-slate-400">Date: ________________________</div>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400 border-t pt-2">
          Generated automatically by RSU Project Monitor KPI Web Application • Rivers State University, Port Harcourt, Nigeria.
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative animate-in fade-in">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
