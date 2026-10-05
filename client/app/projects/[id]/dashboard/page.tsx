"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Activity, History, AlertTriangle } from "lucide-react";
import { io } from "socket.io-client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

export default function Dashboard() {
  const params = useParams();
  const { user } = useAuth();
  
  const [project, setProject] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!params.id) return;
    
    // Connect to Socket.IO
    const socket = io("http://localhost:5000");
    
    socket.on("connect", () => {
      console.log("Connected to socket server");
      socket.emit("join_project", params.id);
    });
    
    socket.on("new_kpi_entry", (payload) => {
      console.log("New KPI received:", payload);
      setKpiData((prev) => {
        // Replace if same week, otherwise append
        const filtered = prev.filter(d => d.entry.weekNumber !== payload.entry.weekNumber);
        return [...filtered, payload].sort((a, b) => a.entry.weekNumber - b.entry.weekNumber);
      });
    });
    
    return () => {
      socket.disconnect();
    };
  }, [params.id]);

  if (loading) return <div className="p-10 text-center animate-pulse">Loading dashboard...</div>;
  if (!project) return <div className="p-10 text-center">Project not found</div>;

  const latestData = kpiData.length > 0 ? kpiData[kpiData.length - 1] : null;
  const metrics = latestData?.metrics;
  const entry = latestData?.entry;

  // Chart data format
  const chartData = kpiData.map(d => ({
    week: `W${d.entry.weekNumber}`,
    CPI: Number(d.metrics.CPI.toFixed(2)),
    SPI: Number(d.metrics.SPI.toFixed(2))
  }));

  const getAlertBanner = () => {
    if (!metrics) return null;
    
    if (metrics.alert === 'Critical') {
      return (
        <div className="bg-red-500 text-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3 font-medium animate-pulse">
          <AlertTriangle size={24} />
          <div>
            <div className="font-bold text-lg">Critical Alert</div>
            <div className="text-red-100 text-sm">Project performance is severely behind targets. Immediate action required.</div>
          </div>
        </div>
      );
    }
    
    if (metrics.alert === 'At Risk') {
      return (
        <div className="bg-amber-500 text-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3 font-medium">
          <AlertTriangle size={24} />
          <div>
            <div className="font-bold text-lg">At Risk</div>
            <div className="text-amber-100 text-sm">Project is trending below optimal performance targets.</div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-sm mb-6 flex items-center gap-3 font-medium">
        <Activity size={24} />
        <div>
          <div className="font-bold text-lg">On Track</div>
          <div className="text-emerald-100 text-sm">Project is meeting or exceeding performance expectations.</div>
        </div>
      </div>
    );
  };

  const MetricCard = ({ title, value, subtitle, trend, format = 'number' }: any) => {
    const formattedValue = format === 'currency' 
      ? `$${Number(value).toLocaleString()}` 
      : format === 'decimal' 
        ? Number(value).toFixed(2) 
        : value;
        
    return (
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
        <h3 className="text-slate-500 text-sm font-medium mb-2">{title}</h3>
        <div className="flex items-end justify-between">
          <div>
            <div className={clsx("text-3xl font-bold mb-1 text-slate-800", {
              "text-red-600": trend === 'bad',
              "text-emerald-600": trend === 'good',
              "text-amber-600": trend === 'warning'
            })}>
              {formattedValue}
            </div>
            {subtitle && <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <Link href="/projects" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors mb-2 text-sm">
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2">
            <span>Budget: ${project.budgetAtCompletion.toLocaleString()}</span>
            <span className="text-slate-300">•</span>
            <span>Duration: {project.plannedDurationWeeks} weeks</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href={`/projects/${params.id}/history`} 
            className="flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <History size={18} />
            <span>History</span>
          </Link>
          
          {user?.role !== 'viewer' && (
            <Link 
              href={`/projects/${params.id}/kpi-entry`} 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard 
              title="Cost Performance Index (CPI)" 
              value={metrics.CPI} 
              format="decimal"
              trend={metrics.CPI < 0.95 ? (metrics.CPI < 0.85 ? 'bad' : 'warning') : 'good'}
              subtitle={metrics.CPI < 1 ? "Over budget" : "Under budget"}
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
            />
            <MetricCard 
              title="Schedule Variance (SV)" 
              value={metrics.SV} 
              format="currency"
              trend={metrics.SV < 0 ? 'bad' : 'good'}
            />
            <MetricCard 
              title="Estimate At Completion" 
              value={metrics.EAC} 
              format="currency"
              subtitle={`Original: $${project.budgetAtCompletion.toLocaleString()}`}
              trend={metrics.EAC > project.budgetAtCompletion ? 'bad' : 'neutral'}
            />
            <MetricCard 
              title="Non-Conformances" 
              value={entry.nonConformances} 
              trend={entry.nonConformances > 0 ? 'bad' : 'good'}
            />
            <MetricCard 
              title="Safety Incidents" 
              value={entry.safetyIncidents} 
              trend={entry.safetyIncidents > 0 ? 'bad' : 'good'}
            />
            <div className="bg-slate-900 p-6 rounded-xl shadow-sm flex flex-col justify-between text-white">
              <h3 className="text-slate-400 text-sm font-medium mb-2">Current Week</h3>
              <div className="text-3xl font-bold">{entry.weekNumber}</div>
              <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">Out of {project.plannedDurationWeeks}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Performance Trend</h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="week" tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <ReferenceLine y={1} stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Target (1.0)', fill: '#64748b', fontSize: 12 }} />
                  <Line type="monotone" dataKey="CPI" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="SPI" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center bg-white py-16 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <Activity size={48} className="text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No KPI data yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">This project has no weekly entries. Be the first to record progress.</p>
          {user?.role !== 'viewer' && (
            <Link 
              href={`/projects/${params.id}/kpi-entry`} 
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Add Initial Data
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
