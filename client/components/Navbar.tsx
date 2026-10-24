"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion } from "motion/react";
import { Award, FolderKanban, ShieldCheck, LogOut, User as UserIcon, Sparkles } from "lucide-react";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const pathname = usePathname();

  if (isLoading) return null;

  const isActive = (path: string) => {
    if (path === "/projects" && pathname.startsWith("/projects")) return true;
    if (path === "/admin" && pathname.startsWith("/admin")) return true;
    return pathname === path;
  };

  return (
    <header className="print:hidden sticky top-0 z-50">
      {/* Top Academic Sub-Banner with subtle gradient and glow */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-slate-300 text-[11px] py-1.5 px-4 md:px-8 border-b border-indigo-900/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-xs">
              <Sparkles size={11} className="text-blue-200" />
              RSU Research
            </span>
            <span className="text-slate-200 font-medium truncate">
              Development of a Web Application For Real-Time Project Performance Monitoring
            </span>
          </div>
          <div className="text-slate-300 text-[11px] font-normal whitespace-nowrap flex items-center gap-1.5">
            <span>by</span>
            <strong className="text-white font-semibold tracking-tight">NLUMANZE, Zerubbabel Chiwendu</strong>
            <span className="bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700 text-blue-300 font-mono text-[10px]">
              MEM.2024/FT/MEC/0024
            </span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navbar */}
      <div className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-blue-500/25 border border-white/20"
              >
                RSU
              </motion.div>
              <div>
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 block leading-none group-hover:text-blue-600 transition-colors">
                  RSU Project Monitor KPI
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-1">
                  Real-Time EVM Performance Suite
                </span>
              </div>
            </Link>

            {user && (
              <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
                <Link
                  href="/projects"
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${isActive("/projects")
                      ? "bg-blue-50/80 text-blue-700 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                    }`}
                >
                  <FolderKanban size={16} />
                  <span>Projects</span>
                </Link>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${isActive("/admin")
                        ? "bg-purple-50 text-purple-700 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/60"
                      }`}
                  >
                    <ShieldCheck size={16} className="text-purple-600" />
                    <span>Admin Control</span>
                    <span className="bg-purple-100 text-purple-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded-full">
                      Admin
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </div>

          {/* User Controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2.5 bg-slate-50/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-2xs">
                  <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {user.name?.substring(0, 1).toUpperCase()}
                  </div>
                  <span className="font-semibold text-slate-800 text-xs hidden sm:inline">
                    {user.name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${user.role === "admin"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : user.role === "manager"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                  >
                    {user.role}
                  </span>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200/80 px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100/60 transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-4 py-2 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
