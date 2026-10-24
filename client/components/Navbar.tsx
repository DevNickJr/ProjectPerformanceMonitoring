"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <header className="print:hidden bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
      {/* Top Academic Sub-Banner */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1.5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-2 truncate">
            <span className="bg-blue-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">
              RSU Research
            </span>
            <span className="text-slate-200 font-medium truncate">
              Development of a Web Application For Real-Time Project Performance Monitoring
            </span>
          </div>
          <div className="text-slate-400 text-[11px] font-normal whitespace-nowrap">
            by <strong className="text-slate-200">NLUMANZE, Zerubbabel Chiwendu</strong> (MEM.2024/FT/MEC/0024)
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              RSU
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block leading-tight">
                RSU Project Monitor KPI
              </span>
              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-wider block">
                Performance Monitoring System
              </span>
            </div>
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium ml-4">
              <Link href="/projects" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors">
                Projects
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-slate-600 hover:text-blue-600 font-semibold transition-colors flex items-center gap-1">
                  <span>Admin Panel</span>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">Admin</span>
                </Link>
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                  user.role === 'manager' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {user.role}
                </span>
                <span className="font-medium text-slate-800 hidden sm:inline">{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
