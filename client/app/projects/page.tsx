"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { PlusCircle, Activity, ArrowRight, ShieldCheck, Briefcase, Award, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

type Project = {
  _id: string;
  name: string;
  budgetAtCompletion: number;
  plannedDurationWeeks: number;
  startDate: string;
  currency?: string;
  taskCompletionPercentage?: number;
  ownerId: { _id: string; name: string };
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get("/projects");
        setProjects(res.data);
      } catch (err) {
        console.error("Failed to fetch projects");
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchProjects();
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="py-6">
      {/* Research Project Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 mb-8 shadow-md border border-blue-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs px-3 py-1 rounded-full font-semibold mb-3">
            <Award size={14} className="text-blue-300" />
            <span>Rivers State University (RSU) Research Project</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
            Development of a Web Application For Real-Time Project Performance Monitoring
          </h2>
          <div className="text-sm text-slate-300 flex flex-wrap items-center gap-y-1 gap-x-4">
            <span>Researcher: <strong className="text-white">NLUMANZE, Zerubbabel Chiwendu</strong></span>
            <span>•</span>
            <span>Reg. No: <strong className="text-white">MEM.2024/FT/MEC/0024</strong></span>
          </div>
          <div className="text-xs text-blue-200/80 mt-2 font-mono">
            Department of Mechanical Engineering • Faculty of Engineering
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Portfolio</h1>
          <p className="text-slate-500 mt-1">Manage and monitor ongoing projects with real-time EVM metrics</p>
        </div>
        
        {user.role !== 'viewer' && (
          <Link 
            href="/projects/new" 
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <PlusCircle size={20} />
            <span>New Project</span>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-56 bg-slate-200 rounded-xl animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center bg-white py-16 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <Briefcase size={48} className="text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No projects yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">Get started by creating your first project to track performance, budget, task completion, and schedule.</p>
          {user.role !== 'viewer' && (
            <Link 
              href="/projects/new" 
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
            >
              Create a Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => {
            const taskPct = project.taskCompletionPercentage || 0;
            return (
              <div key={project._id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {project.name}
                    </h2>
                    <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                      <Activity size={20} />
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Budget (BAC)</span>
                      <span className="font-bold text-slate-900">
                        {formatCurrency(project.budgetAtCompletion, project.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Duration</span>
                      <span className="font-semibold text-slate-800">{project.plannedDurationWeeks} weeks</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Currency</span>
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                        {project.currency || 'NGN'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Project Owner</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <ShieldCheck size={14} className="text-emerald-500" />
                        {project.ownerId?.name || "Lead Engineer"}
                      </span>
                    </div>

                    {/* Task Completion Progress Bar */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-slate-500 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          Task Completion
                        </span>
                        <span className="font-bold text-emerald-600">{taskPct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${taskPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/projects/${project._id}/dashboard`}
                  className="flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg border border-slate-200 font-medium transition-colors group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 mt-2"
                >
                  <span>View Dashboard</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
