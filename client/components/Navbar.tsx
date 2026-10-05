"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return null;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl tracking-tight text-blue-600">
            MonitorKPI
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              <Link href="/projects" className="text-slate-600 hover:text-blue-600">
                Projects
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin" className="text-slate-600 hover:text-blue-600">
                  Admin
                </Link>
              )}
            </nav>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="bg-slate-100 px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {user.role}
                </span>
                <span>{user.name}</span>
              </div>
              <button
                onClick={logout}
                className="text-sm font-medium text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Login
              </Link>
              <Link href="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded shadow-sm transition-colors">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
