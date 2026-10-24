"use client";

import React from "react";
import { GraduationCap, Award, ShieldCheck, Cpu } from "lucide-react";

export default function Footer() {
  return (
    <footer className="print:hidden border-t border-slate-200/80 mt-auto py-10 text-slate-600 bg-white/60 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
                RSU
              </div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">
                RSU Project Monitor KPI
              </span>
            </div>
            <p className="text-sm font-medium text-slate-600 max-w-xl leading-relaxed">
              Development of a Web Application For Real-Time Project Performance Monitoring
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Department of Mechanical Engineering</span>
              <span>•</span>
              <span>Faculty of Engineering, Rivers State University</span>
            </div>
          </div>

          <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 text-xs text-slate-700 space-y-2 max-w-sm w-full md:w-auto shadow-2xs">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <Award size={16} className="text-blue-600 shrink-0" />
              <span>Researcher: NLUMANZE, Zerubbabel Chiwendu</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <GraduationCap size={16} className="text-indigo-500 shrink-0" />
              <span>Registration No: <strong className="text-slate-900 font-mono">MEM.2024/FT/MEC/0024</strong></span>
            </div>
            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200/60 flex items-center gap-1.5">
              <Cpu size={12} className="text-slate-400" />
              <span>Postgraduate Master of Engineering Project</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 pt-6 px-2 gap-2">
          <div>
            © {new Date().getFullYear()} RSU Project Monitor KPI. Academic research & engineering monitoring system.
          </div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold bg-emerald-50/80 border border-emerald-200/60 px-3 py-1 rounded-full text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-Time Engine Operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
