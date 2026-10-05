"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { PlusCircle, Activity, ArrowRight, ShieldCheck, Briefcase } from "lucide-react";

type Project = {
  _id: string;
  name: string;
  budgetAtCompletion: number;
  plannedDurationWeeks: number;
  startDate: string;
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

  if (!user) return null; // Redirect logic is generally handled elsewhere, but prevents flash

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and monitor your ongoing projects</p>
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
            <div key={i} className="h-48 bg-slate-200 rounded-xl animate-pulse border border-slate-100"></div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center bg-white py-16 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
          <Briefcase size={48} className="text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No projects yet</h3>
          <p className="text-slate-500 mt-2 max-w-md">Get started by creating your first project to track performance, budget, and schedule.</p>
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
          {projects.map(project => (
            <div key={project._id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-slate-800 line-clamp-1">{project.name}</h2>
                <div className="bg-blue-50 text-blue-600 p-1.5 rounded-lg">
                  <Activity size={20} />
                </div>
              </div>
              
              <div className="space-y-3 mb-6 flex-1">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Budget (BAC)</span>
                  <span className="font-semibold text-slate-800">${project.budgetAtCompletion.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold text-slate-800">{project.plannedDurationWeeks} weeks</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Owner</span>
                  <span className="font-semibold text-slate-800 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-emerald-500" />
                    {project.ownerId?.name || "Unknown"}
                  </span>
                </div>
              </div>
              
              <Link 
                href={`/projects/${project._id}/dashboard`}
                className="flex items-center justify-center gap-2 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 py-2.5 rounded-lg border border-slate-200 font-medium transition-colors group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900"
              >
                <span>View Dashboard</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
