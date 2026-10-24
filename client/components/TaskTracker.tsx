"use client";

import React, { useState } from "react";
import { CheckSquare, Plus, Trash2, Edit3, CheckCircle2, Clock, AlertCircle } from "lucide-react";
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-5 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="text-emerald-600" size={20} />
            <h3 className="text-lg font-bold text-slate-800">
              Task Breakdown & Completion Status
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track individual work packages and aggregate project task progress
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={15} />
              <span>Add Task</span>
            </button>
          )}
        </div>
      </div>

      {/* Overview Stat bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 items-center">
        {/* Large completion gauge card */}
        <div className="sm:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 block mb-1">
              Overall Task Completion
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-emerald-400">
                {overallCompletionPercentage}%
              </span>
              <span className="text-xs text-slate-300">
                ({completedCount} of {tasks.length} tasks finished)
              </span>
            </div>
            {/* Progress bar inside card */}
            <div className="w-full h-2 bg-slate-700 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${overallCompletionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Breakdown mini-cards */}
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
            Completed Tasks
          </span>
          <span className="text-2xl font-bold text-emerald-700 mt-1">{completedCount}</span>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex flex-col justify-center">
          <span className="text-xs font-medium text-amber-800 uppercase tracking-wider">
            In Progress / Pending
          </span>
          <span className="text-2xl font-bold text-amber-700 mt-1">
            {inProgressCount + pendingCount}
          </span>
        </div>
      </div>

      {/* Task List Table */}
      <div className="pt-4">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            <p>No tasks recorded yet for this project.</p>
            {canEdit && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 text-xs"
              >
                <Plus size={14} />
                Create your first task
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-xs text-slate-500 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 w-48">Completion %</th>
                  <th className="py-3 px-4">Due Date</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => (
                  <tr key={task._id || task.title} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{task.title}</div>
                      {task.description && (
                        <div className="text-xs text-slate-400 max-w-xs truncate">{task.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {task.assignedTo || "Unassigned"}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(task)}
                        disabled={!canEdit}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 border transition-colors ${
                          task.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : task.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
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
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              task.completionPercentage === 100
                                ? "bg-emerald-500"
                                : task.completionPercentage > 50
                                ? "bg-blue-500"
                                : "bg-amber-500"
                            }`}
                            style={{ width: `${task.completionPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-slate-700 w-9 text-right">
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
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                    </td>
                    {canEdit && task._id && (
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteTask(task._id!)}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
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

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Project Task</h3>
            <p className="text-xs text-slate-500 mb-4">
              Create a task package with estimated completion percentage
            </p>

            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structural Framing Inspection"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Deliverable
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete mechanical installation checks"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assignee
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Engineer"
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full text-sm p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Initial Completion Percentage</span>
                  <span className="text-blue-600 font-bold">{newTask.completionPercentage}%</span>
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

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70"
                >
                  {loading ? "Adding..." : "Add Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
