"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, PlusCircle, Activity, History, AlertTriangle, Printer, 
  CheckCircle2, Clock, DollarSign, Calendar, TrendingUp, ShieldAlert, CheckSquare, Sparkles 
} from "lucide-react";
import { io } from "socket.io-client";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ReferenceLine, Area, AreaChart 
} from "recharts";
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
      api.get(`/projects/${params.id}`).then((res) => setProject(res.data)).catch(console.error);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
        <div className="h-10 w-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium text-sm">Loading project performance telemetry...</p>
      </div>
    );
  }

  if (!project) return <div className="p-10 text-center text-slate-600">Project not found</div>;

  const latestData = kpiData.length > 0 ? kpiData[kpiData.length - 1] : null;
  const metrics = latestData?.metrics;
  const entry = latestData?.entry;
  const currentWeek = entry?.weekNumber || 1;
  const taskCompletion = project.taskCompletionPercentage ?? (entry?.taskCompletionPercentage ?? 0);

  // Chart data format
  const chartData = kpiData.map(d => ({
    week: `Wk ${d.entry.weekNumber}`,
    CPI: Number(d.metrics.CPI.toFixed(2)),
    SPI: Number(d.metrics.SPI.toFixed(2)),
    Progress: d.entry.taskCompletionPercentage || 0,
  }));

  const getAlertBanner = () => {
    if (!metrics) return null;
    
    if (metrics.alert === 'Critical') {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-red-600 to-rose-700 text-white p-5 rounded-2xl shadow-sm mb-8 flex items-center gap-4 font-medium"
        >
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base">Critical Schedule or Budget Variance</div>
            <div className="text-red-100 text-xs mt-0.5">
              Project performance is severely below threshold targets (CPI &lt; 0.85 or SPI &lt; 0.85). Immediate intervention is required.
            </div>
          </div>
        </motion.div>
      );
    }
    
    if (metrics.alert === 'At Risk') {
      return (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-sm mb-8 flex items-center gap-4 font-medium"
        >
          <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <AlertTriangle size={24} className="text-white" />
          </div>
          <div>
            <div className="font-extrabold text-base">At Risk Performance Notice</div>
            <div className="text-amber-100 text-xs mt-0.5">
              Metrics indicate slight deviation below optimal benchmarks (CPI &lt; 0.95 or SPI &lt; 0.95). Corrective monitoring recommended.
            </div>
          </div>
        </motion.div>
      );
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm mb-8 flex items-center gap-4 font-medium"
      >
        <div className="h-12 w-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <CheckCircle2 size={24} className="text-white" />
        </div>
        <div>
          <div className="font-extrabold text-base">Project On Track & Healthy</div>
          <div className="text-emerald-100 text-xs mt-0.5">
            Both Cost Performance (CPI) and Schedule Performance (SPI) exceed 0.95 target baselines.
          </div>
        </div>
      </motion.div>
    );
  };

  const ModernMetricCard = ({ title, value, subtitle, trend, icon: Icon, format = 'number', color = 'blue' }: any) => {
    const formattedValue = format === 'currency' 
      ? formatCurrency(value, project.currency)
      : format === 'decimal' 
        ? Number(value).toFixed(2) 
        : format === 'percentage'
        ? `${value}%`
        : value;

    const colorMap: any = {
      blue: 'from-blue-50 to-indigo-50 text-blue-600 border-blue-100',
      emerald: 'from-emerald-50 to-teal-50 text-emerald-600 border-emerald-100',
      purple: 'from-purple-50 to-pink-50 text-purple-600 border-purple-100',
      amber: 'from-amber-50 to-orange-50 text-amber-600 border-amber-100',
    };
        
    return (
      <motion.div 
        whileHover={{ y: -3, transition: { duration: 0.2 } }}
        className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          {Icon && (
            <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${colorMap[color] || colorMap.blue} flex items-center justify-center shrink-0 border shadow-2xs`}>
              <Icon size={16} />
            </div>
          )}
        </div>
        
        <div>
          <div className={clsx("text-2xl sm:text-3xl font-black tracking-tight", {
            "text-red-600": trend === 'bad',
            "text-emerald-600": trend === 'good',
            "text-amber-600": trend === 'warning',
            "text-slate-900": !trend || trend === 'neutral'
          })}>
            {formattedValue}
          </div>
          {subtitle && <div className="text-[11px] text-slate-400 font-medium mt-1 truncate">{subtitle}</div>}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="py-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Link href="/projects" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2">
            <ArrowLeft size={14} />
            Back to Projects Portfolio
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project.name}</h1>
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase shadow-xs">
              {project.currency || 'NGN'}
            </span>
          </div>
          <p className="text-slate-500 mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span>Budget: <strong className="text-slate-800 font-mono">{formatCurrency(project.budgetAtCompletion, project.currency)}</strong></span>
            <span className="text-slate-300">•</span>
            <span>Duration: <strong className="text-slate-800">{project.plannedDurationWeeks} weeks</strong></span>
            <span className="text-slate-300">•</span>
            <span>Task Progress: <strong className="text-emerald-600">{taskCompletion}%</strong></span>
          </p>
        </div>
        
        {/* Header Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowPrintModal(true)}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-2xs hover:shadow-xs cursor-pointer"
          >
            <Printer size={15} className="text-slate-500" />
            <span>Print Report</span>
          </motion.button>

          <Link 
            href={`/projects/${params.id}/history`} 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-2xs hover:shadow-xs"
          >
            <History size={15} className="text-slate-500" />
            <span>Audit History</span>
          </Link>
          
          {user?.role !== 'viewer' && (
            <Link 
              href={`/projects/${params.id}/kpi-entry`} 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98]"
            >
              <PlusCircle size={15} />
              <span>Record KPI Entry</span>
            </Link>
          )}
        </div>
      </div>

      {kpiData.length > 0 ? (
        <>
          {getAlertBanner()}

          {/* Primary EVM & Task Completion KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ModernMetricCard 
              title="Cost Performance (CPI)" 
              value={metrics.CPI} 
              format="decimal"
              trend={metrics.CPI < 0.95 ? (metrics.CPI < 0.85 ? 'bad' : 'warning') : 'good'}
              subtitle={metrics.CPI < 1 ? "Over budget (Loss)" : "Cost efficient (Favorable)"}
              icon={DollarSign}
              color="blue"
            />
            <ModernMetricCard 
              title="Schedule Performance (SPI)" 
              value={metrics.SPI} 
              format="decimal"
              trend={metrics.SPI < 0.95 ? (metrics.SPI < 0.85 ? 'bad' : 'warning') : 'good'}
              subtitle={metrics.SPI < 1 ? "Behind schedule" : "Ahead of schedule"}
              icon={Clock}
              color="emerald"
            />
            <ModernMetricCard 
              title="Cost Variance (CV)" 
              value={metrics.CV} 
              format="currency"
              trend={metrics.CV < 0 ? 'bad' : 'good'}
              subtitle={metrics.CV >= 0 ? "Under planned cost" : "Cost overrun"}
              icon={TrendingUp}
              color="purple"
            />
            <ModernMetricCard 
              title="Schedule Variance (SV)" 
              value={metrics.SV} 
              format="currency"
              trend={metrics.SV < 0 ? 'bad' : 'good'}
              subtitle={metrics.SV >= 0 ? "Ahead of baseline" : "Schedule delay"}
              icon={Calendar}
              color="amber"
            />
            <ModernMetricCard 
              title="Estimate At Compl. (EAC)" 
              value={metrics.EAC} 
              format="currency"
              subtitle={`Budget: ${formatCurrency(project.budgetAtCompletion, project.currency)}`}
              trend={metrics.EAC > project.budgetAtCompletion ? 'bad' : 'good'}
              icon={DollarSign}
              color="blue"
            />
            <ModernMetricCard 
              title="Task Work Progress" 
              value={taskCompletion} 
              format="percentage"
              trend={taskCompletion >= 75 ? 'good' : taskCompletion >= 40 ? 'warning' : 'bad'}
              subtitle="Aggregated task completion"
              icon={CheckSquare}
              color="emerald"
            />
            <ModernMetricCard 
              title="Quality Defects (NCR)" 
              value={entry.nonConformances} 
              trend={entry.nonConformances > 0 ? 'bad' : 'good'}
              subtitle="Recorded audit non-conformances"
              icon={ShieldAlert}
              color="amber"
            />
            <ModernMetricCard 
              title="Site Safety Incidents" 
              value={entry.safetyIncidents} 
              trend={entry.safetyIncidents > 0 ? 'bad' : 'good'}
              subtitle="Safety and hazard events"
              icon={AlertTriangle}
              color="purple"
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
          <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Earned Value Progression & Metrics Trend
                </h3>
                <p className="text-xs text-slate-500">Weekly trajectory of CPI (Cost Index) and SPI (Schedule Index)</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> CPI Target
                </span>
                <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50/80 px-2.5 py-1 rounded-full border border-emerald-100">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> SPI Target
                </span>
              </div>
            </div>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={{ stroke: '#e2e8f0' }} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid #e2e8f0', 
                      boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '15px' }} />
                  <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Baseline Target (1.0)', fill: '#64748b', fontSize: 11 }} />
                  <Line type="monotone" dataKey="CPI" stroke="#2563eb" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="SPI" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ffffff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="text-center glass-card py-16 px-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center">
            <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800">No KPI telemetry recorded yet</h3>
            <p className="text-slate-500 mt-2 max-w-md text-sm leading-relaxed">
              This project has no weekly performance entries yet. Record week 1 data to generate real-time CPI, SPI, and schedule forecasts.
            </p>
            {user?.role !== 'viewer' && (
              <Link 
                href={`/projects/${params.id}/kpi-entry`} 
                className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium text-xs transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98]"
              >
                Record Week 1 Data
              </Link>
            )}
          </div>

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
