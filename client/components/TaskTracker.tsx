"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Trash2, CheckCircle2, Clock, AlertCircle, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import api from "@/lib/api";

export interface ProjectTask {
  _id?: string;
  title: string;
  description?: string;
  assignedTo?: string;
  dueDate?: string;
  status: "Pending" | "In Progress" | "Completed";
  completionPercentage: number;
}

interface TaskTrackerProps {
  projectId: string;
  tasks: ProjectTask[];
  overallCompletionPercentage: number;
  canEdit?: boolean;
  onTasksUpdated?: (updatedProject: any) => void;
}

export default function TaskTracker({
  projectId,
  tasks = [],
  overallCompletionPercentage = 0,
  canEdit = true,
  onTasksUpdated,
}: TaskTrackerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    dueDate: "",
    status: "Pending" as "Pending" | "In Progress" | "Completed",
    completionPercentage: 0,
  });

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setLoading(true);
    try {
      const res = await api.post(`/projects/${projectId}/tasks`, newTask);
      if (onTasksUpdated) onTasksUpdated(res.data);
      setShowAddModal(false);
      setNewTask({
        title: "",
        description: "",
        assignedTo: "",
        dueDate: "",
        status: "Pending",
        completionPercentage: 0,
      });
    } catch (err) {
      console.error("Failed to add task", err);
      alert("Failed to add task");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePercentage = async (taskId: string, percentage: number) => {
    try {
      const res = await api.put(`/projects/${projectId}/tasks/${taskId}`, {
        completionPercentage: percentage,
      });
      if (onTasksUpdated) onTasksUpdated(res.data);
    } catch (err) {
      console.error("Failed to update task percentage", err);
    }
  };

  const handleToggleStatus = async (task: ProjectTask) => {
    if (!canEdit || !task._id) return;
    const nextStatus = task.status === "Completed" ? "In Progress" : "Completed";
    const nextPercentage = nextStatus === "Completed" ? 100 : 50;

    try {
      const res = await api.put(`/projects/${projectId}/tasks/${task._id}`, {
        status: nextStatus,
        completionPercentage: nextPercentage,
      });
      if (onTasksUpdated) onTasksUpdated(res.data);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await api.delete(`/projects/${projectId}/tasks/${taskId}`);
      if (onTasksUpdated) onTasksUpdated(res.data);
    } catch (err) {
      console.error("Failed to delete task", err);
      alert("Failed to delete task");
    }
  };

  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const inProgressCount = tasks.filter((t) => t.status === "In Progress").length;
  const pendingCount = tasks.filter((t) => t.status === "Pending").length;

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-7 shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-100 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100/60 shadow-2xs">
            <CheckSquare size={18} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Work Packages & Task Completion Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Granular tracking of deliverables and aggregate completion percentage
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs shadow-blue-500/20 cursor-pointer"
            >
              <Plus size={15} />
              <span>Add New Task</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 items-center">
        {/* Large completion card */}
        <div className="sm:col-span-2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-700/50">
          <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
              Aggregate Task Completion
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                {overallCompletionPercentage}%
              </span>
              <span className="text-xs text-slate-300 font-medium">
                ({completedCount} of {tasks.length} tasks completed)
              </span>
            </div>

            {/* Glowing progress bar */}
            <div className="w-full h-2.5 bg-slate-700/80 rounded-full mt-3.5 overflow-hidden p-0.5 border border-slate-600/40">
              <div
                className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full transition-all duration-700 shadow-sm shadow-emerald-400/50"
                style={{ width: `${overallCompletionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown mini-cards */}
        <div className="bg-emerald-50/70 border border-emerald-100/80 p-4 rounded-2xl flex flex-col justify-center shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
            Completed Tasks
          </span>
          <span className="text-2xl font-black text-emerald-700 mt-1">{completedCount}</span>
          <span className="text-[10px] text-emerald-600 mt-0.5">Sign-off verified</span>
        </div>

        <div className="bg-amber-50/70 border border-amber-100/80 p-4 rounded-2xl flex flex-col justify-center shadow-2xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
            In Progress / Pending
          </span>
          <span className="text-2xl font-black text-amber-700 mt-1">
            {inProgressCount + pendingCount}
          </span>
          <span className="text-[10px] text-amber-600 mt-0.5">Active work items</span>
        </div>
      </div>

      {/* Task List Table */}
      <div className="pt-4">
        {tasks.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            <p>No tasks recorded yet for this project.</p>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-2 text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1 text-xs cursor-pointer"
              >
                <Plus size={14} />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[11px] text-slate-400 uppercase tracking-wider bg-slate-50/70 border-b border-slate-100 rounded-xl">
                <tr>
                  <th className="py-3 px-4 font-semibold">Deliverable / Task Name</th>
                  <th className="py-3 px-4 font-semibold">Assignee</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 w-48 font-semibold">Completion %</th>
                  <th className="py-3 px-4 font-semibold">Due Date</th>
                  {canEdit && <th className="py-3 px-4 text-right font-semibold">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task._id || task.title} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 text-sm">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-slate-400 max-w-xs truncate">{task.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {task.assignedTo || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        disabled={!canEdit}
                        className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 border transition-all cursor-pointer ${
                          task.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-2xs"
                            : task.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200/80 shadow-2xs"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {task.status === "Completed" && <CheckCircle2 size={12} />}
                        {task.status === "In Progress" && <Clock size={12} />}
                        {task.status === "Pending" && <AlertCircle size={12} />}
                        <span>{task.status}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/60 p-0.2">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              task.completionPercentage === 100
                                ? "bg-emerald-500"
                                : task.completionPercentage > 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${task.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-800 w-10 text-right font-mono">
                          {task.completionPercentage}%
                        </span>
                      </div>
                      {canEdit && task._id && (
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={task.completionPercentage}
                          onChange={(e) => handleUpdatePercentage(task._id!, Number(e.target.value))}
                          className="w-full mt-1.5 h-1 accent-blue-600 cursor-pointer"
                        />
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500 font-mono">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </td>
                    {canEdit && task._id && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTask(task._id!)}
                          className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Task Modal with AnimatePresence */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 max-w-md w-full p-6"
            >
              <div className="flex justify-between items-center mb-1">
                <h3 className="text-lg font-bold text-slate-900">Add New Project Task</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                Create a project work package with estimated completion percentage
              </p>

              <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Structural Framing Inspection"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Description / Deliverable
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Complete mechanical installation checks"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assignee
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Engineer"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      className="w-full text-sm p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Initial Completion Percentage</span>
                    <span className="text-blue-600 font-bold font-mono">{newTask.completionPercentage}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={newTask.completionPercentage}
                    onChange={(e) =>
                      setNewTask({
                        ...newTask,
                        completionPercentage: Number(e.target.value),
                        status:
                          Number(e.target.value) === 100
                            ? "Completed"
                            : Number(e.target.value) > 0
                            ? "In Progress"
                            : "Pending",
                      })
                    }
                    className="w-full h-2 accent-blue-600 cursor-pointer"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-xs disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? "Adding..." : "Add Task Package"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
