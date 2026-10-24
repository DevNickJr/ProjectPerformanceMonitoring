"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Activity, History, AlertTriangle, Printer, CheckCircle2, Clock } from "lucide-react";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";
import ProjectTimeline from "@/components/ProjectTimeline";
import TaskTracker from "@/components/TaskTracker";
import PrintableReport from "@/components/PrintableReport";

export default function Dashboard() {
  const params = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fetchProjectData = async () => {
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

  useEffect(() => {
    if (params.id) fetchProjectData();
  }, [params.id]);

  useEffect(() => {
    if (!params.id) return;
    
    // Connect to Socket.IO server on configured port (default 4001)
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4001";
    const socket = io(socketUrl);
    
    socket.on("connect", () => {
      socket.emit("join_project", params.id);
    });
    
    socket.on("new_kpi_entry", (payload) => {
      setKpiData((prev) => {
        const filtered = prev.filter(d => d.entry.weekNumber !== payload.entry.weekNumber);
        return [...filtered, payload].sort((a, b) => a.entry.weekNumber - b.entry.weekNumber);
      });
      // Also refresh project data to sync task progress if updated
      api.get(`/projects/${params.id}`).then((res) => setProject(res.data)).catch(console.error);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [params.id]);

  if (loading) return <div className="p-10 text-center animate-pulse text-slate-500">Loading project dashboard...</div>;
  if (!project) return <div className="p-10 text-center text-slate-600">Project not found</div>;

  const latestData = kpiData.length > 0 ? kpiData[kpiData.length - 1] : null;
  const metrics = latestData?.metrics;
  const entry = latestData?.entry;
  const currentWeek = entry?.weekNumber || 1;
  const taskCompletion = project.taskCompletionPercentage ?? (entry?.taskCompletionPercentage ?? 0);

  // Chart data format
  const chartData = kpiData.map(d => ({
    week: `W${d.entry.weekNumber}`,
    CPI: Number(d.metrics.CPI.toFixed(2)),
    SPI: Number(d.metrics.SPI.toFixed(2)),
    Progress: d.entry.taskCompletionPercentage || 0,
  }));

  const getAlertBanner = () => {
    if (!metrics) return null;
    
    if (metrics.alert === 'Critical') {
      return (
        <div className="bg-red-500 text-white p-4 rounded-xl shadow-xs mb-6 flex items-center gap-3 font-medium animate-pulse">
          <AlertTriangle size={24} />
          <div>
            <div className="font-bold text-lg">Critical Alert</div>
            <div className="text-red-100 text-sm">Project performance is severely behind targets (CPI &lt; 0.85 or SPI &lt; 0.85). Immediate recovery plan required.</div>
          </div>
        </div>
      );
    }
    
    if (metrics.alert === 'At Risk') {
      return (
        <div className="bg-amber-500 text-white p-4 rounded-xl shadow-xs mb-6 flex items-center gap-3 font-medium">
          <AlertTriangle size={24} />
          <div>
            <div className="font-bold text-lg">At Risk Warning</div>
            <div className="text-amber-100 text-sm">Project is trending below optimal performance targets (CPI &lt; 0.95 or SPI &lt; 0.95). Corrective measures recommended.</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-emerald-600 text-white p-4 rounded-xl shadow-xs mb-6 flex items-center gap-3 font-medium">
        <Activity size={24} />
        <div>
          <div className="font-bold text-lg">On Track</div>
          <div className="text-emerald-100 text-sm">Project performance meets or exceeds target parameters (CPI &ge; 0.95 and SPI &ge; 0.95).</div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, subtitle, trend, format = 'number' }: any) => {
    const formattedValue = format === 'currency' 
      ? formatCurrency(value, project.currency)
      : format === 'decimal' 
        ? Number(value).toFixed(2) 
        : format === 'percentage'
        ? `${value}%`
        : value;
        
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
        <h3 className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">{title}</h3>
        <div className="flex items-end justify-between">
          <div>
            <div className={clsx("text-3xl font-extrabold mb-1 tracking-tight", {
              "text-red-600": trend === 'bad',
              "text-emerald-600": trend === 'good',
              "text-amber-600": trend === 'warning',
              "text-slate-900": !trend || trend === 'neutral'
            })}>
              {formattedValue}
            </div>
            {subtitle && <div className="text-xs text-slate-500 font-medium">{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors mb-2 text-sm">
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{project.name}</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
              {project.currency || 'NGN'}
            </span>
          </div>
          <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span>Budget (BAC): <strong className="text-slate-800">{formatCurrency(project.budgetAtCompletion, project.currency)}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Duration: <strong className="text-slate-800">{project.plannedDurationWeeks} weeks</strong></span>
            <span className="text-slate-300">•</span>
            <span>Task Progress: <strong className="text-emerald-700">{taskCompletion}%</strong></span>
          </p>
        </div>
        
        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Print Report Button */}
          <button
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-xs cursor-pointer"
            title="Print Official KPI Performance Report"
          >
            <Printer size={18} className="text-slate-600" />
            <span>Print Report</span>
          </button>

          <Link 
            href={`/projects/${params.id}/history`} 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-xs"
          >
            <History size={18} className="text-slate-600" />
            <span>History</span>
          </Link>
          
          {user?.role !== 'viewer' && (
            <Link 
              href={`/projects/${params.id}/kpi-entry`} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-xs cursor-pointer"
            >
              <PlusCircle size={18} />
              <span>Add KPI Entry</span>
            </Link>
          )}
        </div>
      </div>

      {kpiData.length > 0 ? (
        <>
          {getAlertBanner()}

          {/* Primary EVM & Task Completion KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Cost Performance Index (CPI)" 
              value={metrics.CPI} 
              format="decimal"
              trend={metrics.CPI < 0.95 ? (metrics.CPI < 0.85 ? 'bad' : 'warning') : 'good'}
              subtitle={metrics.CPI < 1 ? "Over budget (Inefficient)" : "Within budget (Favorable)"}
            />
            <MetricCard 
              title="Schedule Performance Index (SPI)" 
              value={metrics.SPI} 
              format="decimal"
              trend={metrics.SPI < 0.95 ? (metrics.SPI < 0.85 ? 'bad' : 'warning') : 'good'}
              subtitle={metrics.SPI < 1 ? "Behind schedule" : "Ahead of schedule"}
            />
            <MetricCard 
              title="Cost Variance (CV)" 
              value={metrics.CV} 
              format="currency"
              trend={metrics.CV < 0 ? 'bad' : 'good'}
              subtitle={metrics.CV >= 0 ? "Under planned cost" : "Cost overrun"}
            />
            <MetricCard 
              title="Schedule Variance (SV)" 
              value={metrics.SV} 
              format="currency"
              trend={metrics.SV < 0 ? 'bad' : 'good'}
              subtitle={metrics.SV >= 0 ? "Ahead of schedule" : "Behind schedule"}
            />
            <MetricCard 
              title="Estimate At Completion (EAC)" 
              value={metrics.EAC} 
              format="currency"
              subtitle={`Baseline BAC: ${formatCurrency(project.budgetAtCompletion, project.currency)}`}
              trend={metrics.EAC > project.budgetAtCompletion ? 'bad' : 'good'}
            />
            <MetricCard 
              title="Task Completion Rate" 
              value={taskCompletion} 
              format="percentage"
              trend={taskCompletion >= 75 ? 'good' : taskCompletion >= 40 ? 'warning' : 'bad'}
              subtitle="Overall work completed"
            />
            <MetricCard 
              title="Non-Conformances" 
              value={entry.nonConformances} 
              trend={entry.nonConformances > 0 ? 'bad' : 'good'}
              subtitle="Quality audit defects"
            />
            <MetricCard 
              title="Safety Incidents" 
              value={entry.safetyIncidents} 
              trend={entry.safetyIncidents > 0 ? 'bad' : 'good'}
              subtitle="Reported site safety incidents"
            />
          </div>

          {/* Project Completion Timeline Component */}
          <ProjectTimeline
            startDate={project.startDate}
            plannedDurationWeeks={project.plannedDurationWeeks}
            currentWeekNumber={currentWeek}
            spi={metrics.SPI}
            taskCompletionPercentage={taskCompletion}
          />

          {/* Task Breakdown & Completion Status Component */}
          <TaskTracker
            projectId={project._id}
            tasks={project.tasks || []}
            overallCompletionPercentage={taskCompletion}
            canEdit={user?.role !== 'viewer'}
            onTasksUpdated={(updatedProject) => setProject(updatedProject)}
          />

          {/* Performance Trend Chart */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Earned Value Performance Trends</h3>
                <p className="text-xs text-slate-500">Weekly progression of CPI, SPI, and Work Completion Rate</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-3 h-0.5 bg-blue-600 inline-block"></span> CPI (Cost Index)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600">
                  <span className="w-3 h-0.5 bg-emerald-600 inline-block"></span> SPI (Schedule Index)
                </span>
              </div>
            </div>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Baseline Target (1.0)', fill: '#64748b', fontSize: 12 }} />
                  <Line type="monotone" dataKey="CPI" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="SPI" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="text-center bg-white py-14 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
            <Activity size={48} className="text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800">No KPI data recorded yet</h3>
            <p className="text-slate-500 mt-2 max-w-md text-sm">
              This project has no weekly performance entries yet. Record week 1 data to generate CPI, SPI, and schedule forecasts.
            </p>
            {user?.role !== 'viewer' && (
              <Link 
                href={`/projects/${params.id}/kpi-entry`} 
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
              >
                Add Week 1 Data
              </Link>
            )}
          </div>

          {/* Even without KPI data, allow task tracking and timeline view */}
          <ProjectTimeline
            startDate={project.startDate}
            plannedDurationWeeks={project.plannedDurationWeeks}
            currentWeekNumber={1}
            spi={1}
            taskCompletionPercentage={taskCompletion}
          />

          <TaskTracker
            projectId={project._id}
            tasks={project.tasks || []}
            overallCompletionPercentage={taskCompletion}
            canEdit={user?.role !== 'viewer'}
            onTasksUpdated={(updatedProject) => setProject(updatedProject)}
          />
        </div>
      )}

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
