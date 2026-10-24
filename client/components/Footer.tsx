"use client";

import React from "react";
import { GraduationCap, Award, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="print:hidden bg-white border-t border-slate-200 mt-auto py-8 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                RSU
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-base">
                RSU Project Monitor KPI
              </span>
            </div>
            <p className="text-sm font-medium text-slate-700 mt-1 max-w-xl">
              Development of a Web Application For Real-Time Project Performance Monitoring
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <Award size={15} className="text-blue-600" />
              <span>Researcher: NLUMANZE, Zerubbabel Chiwendu</span>
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <GraduationCap size={15} className="text-slate-400" />
              <span>Reg. No: <strong className="text-slate-800">MEM.2024/FT/MEC/0024</strong></span>
            </div>
            <div className="text-[11px] text-slate-500 pl-6">
              Department of Mechanical Engineering • Rivers State University
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 pt-4 gap-2">
          <div>
            © {new Date().getFullYear()} RSU Project Monitor KPI. Master of Engineering Research Project.
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck size={14} />
            <span>Real-Time EVM & KPI Performance System Active</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
