"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { motion } from "motion/react";
import { PlusCircle, Activity, ArrowRight, ShieldCheck, Briefcase, Award, CheckCircle2, TrendingUp, Sparkles, Layers } from "lucide-react";
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

  const totalPortfolioBAC = projects.reduce((acc, p) => acc + (p.budgetAtCompletion || 0), 0);
  const avgCompletion = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + (p.taskCompletionPercentage || 0), 0) / projects.length)
    : 0;

  return (
    <div className="py-6 space-y-8">
      {/* Research Showcase Hero Card with softer gradient and subtle lighting */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-7 sm:p-9 shadow-xl border border-indigo-900/50"
      >
        {/* Soft background ambient blurs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md text-blue-200 border border-white/15 text-xs px-3.5 py-1 rounded-full font-semibold shadow-xs">
              <Sparkles size={13} className="text-blue-300 animate-pulse" />
              <span>Rivers State University (RSU) Research Project</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Development of a Web Application For Real-Time Project Performance Monitoring
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs sm:text-sm text-slate-300 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Award size={15} className="text-blue-400" />
                Researcher: <strong className="text-white ml-1">NLUMANZE, Zerubbabel Chiwendu</strong>
              </span>
              <span className="text-slate-500 hidden sm:inline">•</span>
              <span className="bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700 text-blue-200 font-mono text-xs">
                MEM.2024/FT/MEC/0024
              </span>
            </div>

            <div className="text-xs text-slate-400 font-medium">
              Department of Mechanical Engineering • Faculty of Engineering
            </div>
          </div>

          {/* Quick Portfolio Stats Card */}
          <div className="grid grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Monitored Projects
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white mt-1 block">
                {projects.length}
              </span>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-center">
              <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block">
                Avg. Completion
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1 block">
                {avgCompletion}%
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Project Portfolio</span>
            <span className="text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 px-2.5 py-0.5 rounded-full">
              {projects.length} Active
            </span>
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Monitor real-time Earned Value Metrics (CPI, SPI, EAC), budget, and milestones
          </p>
        </div>
        
        {user.role !== 'viewer' && (
          <Link 
            href="/projects/new" 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm shadow-blue-500/20 active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle size={18} />
            <span>New Project</span>
          </Link>
        )}
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 glass-card rounded-2xl animate-pulse p-6 space-y-4">
              <div className="h-6 bg-slate-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-slate-100 rounded-lg w-1/2"></div>
              <div className="h-20 bg-slate-50 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center glass-card py-16 px-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col items-center"
        >
          <div className="h-16 w-16 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
            <Briefcase size={32} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">No projects yet</h3>
          <p className="text-slate-500 mt-2 max-w-md text-sm leading-relaxed">
            Get started by initializing your first project to track performance indices, budget, task completion %, and completion timeline.
          </p>
          {user.role !== 'viewer' && (
            <Link 
              href="/projects/new" 
              className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]"
            >
              Create a Project
            </Link>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const taskPct = project.taskCompletionPercentage || 0;
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                whileHover={{ y: -3 }}
                className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {project.name}
                    </h3>
                    <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100/60 shadow-2xs">
                      <Activity size={17} />
                    </div>
                  </div>
                  
                  {/* Key Metrics Pill Container */}
                  <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/60 space-y-2.5 mb-5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Budget at Completion:</span>
                      <span className="font-extrabold text-slate-900 font-mono text-sm">
                        {formatCurrency(project.budgetAtCompletion, project.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Planned Duration:</span>
                      <span className="font-semibold text-slate-800">
                        {project.plannedDurationWeeks} Weeks
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Currency:</span>
                      <span className="font-semibold text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                        {project.currency || 'NGN'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Project Owner:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1 text-[11px]">
                        <ShieldCheck size={13} className="text-emerald-600" />
                        {project.ownerId?.name || "Lead Engineer"}
                      </span>
                    </div>
                  </div>

                  {/* Task Completion Progress Bar with soft glow */}
                  <div className="mb-6 space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        Task Completion
                      </span>
                      <span className="text-emerald-700 font-bold">{taskPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, taskPct)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <Link 
                  href={`/projects/${project._id}/dashboard`}
                  className="flex items-center justify-center gap-2 w-full bg-slate-900 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium text-xs transition-all shadow-xs group-hover:shadow-md"
                >
                  <span>Open Monitoring Dashboard</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
