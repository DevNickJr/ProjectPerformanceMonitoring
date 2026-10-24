"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, User as UserIcon, Shield, Trash2, UserPlus, Search, CheckCircle2, AlertCircle, Info, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import clsx from "clsx";

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "manager"
  });
  const [submittingUser, setSubmittingUser] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err: any) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      setMessage({ type: 'success', text: `Role updated to ${newRole}` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Failed to update role" });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      setMessage({ type: 'success', text: `User "${userName}" has been removed.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Failed to delete user" });
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingUser(true);
    try {
      const res = await api.post("/users", newUser);
      setUsers([res.data, ...users]);
      setShowAddModal(false);
      setNewUser({ name: "", email: "", password: "", role: "manager" });
      setMessage({ type: 'success', text: `User "${res.data.name}" successfully created.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Failed to create user" });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setSubmittingUser(false);
    }
  };

  if (!user) return null;
  
  if (user.role !== 'admin') {
    return (
      <div className="py-20 text-center flex flex-col items-center">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-2xs">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-sm text-sm">
          You need Administrator privileges to access the User Management portal.
        </p>
      </div>
    );
  }

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter((u) => u.role === 'admin').length;
  const managerCount = users.filter((u) => u.role === 'manager').length;
  const viewerCount = users.filter((u) => u.role === 'viewer').length;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="py-6 max-w-6xl mx-auto space-y-7"
    >
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
              Admin Governance Center
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
            User & Role Management
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Manage system users, access privileges, role allocations, and security credentials
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer text-xs"
        >
          <UserPlus size={15} />
          <span>Add New User</span>
        </motion.button>
      </div>

      {/* Notifications / Feedback Banner */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-xs flex items-center gap-2.5 ${
            message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span className="font-semibold">{message.text}</span>
        </motion.div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <span className="text-[11px] uppercase font-bold text-slate-400 block mb-1">Total Users</span>
          <span className="text-3xl font-black text-slate-900">{users.length}</span>
        </div>
        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <span className="text-[11px] uppercase font-bold text-purple-600 block mb-1">Administrators</span>
          <span className="text-3xl font-black text-purple-700">{adminCount}</span>
        </div>
        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <span className="text-[11px] uppercase font-bold text-blue-600 block mb-1">Project Managers</span>
          <span className="text-3xl font-black text-blue-700">{managerCount}</span>
        </div>
        <div className="glass-card glass-card-hover rounded-2xl p-5">
          <span className="text-[11px] uppercase font-bold text-slate-500 block mb-1">Viewers / Auditors</span>
          <span className="text-3xl font-black text-slate-700">{viewerCount}</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-xs">
        {/* Table Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto bg-slate-50/80 p-1 rounded-xl border border-slate-200/60">
            {['all', 'admin', 'manager', 'viewer'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  roleFilter === role ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center animate-pulse text-slate-400 text-xs">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No users match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/70 text-slate-400 border-b border-slate-100 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email Address</th>
                  <th className="px-6 py-4 text-center">Assigned Role</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u._id === user.id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase border border-blue-200/50 shadow-2xs">
                          {u.name?.substring(0, 2) || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {u._id.substring(u._id.length - 6)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4 text-center">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isCurrent}
                          className={clsx(
                            "px-3 py-1.5 rounded-xl text-xs font-semibold outline-none border cursor-pointer transition-colors shadow-2xs",
                            u.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-200" :
                            u.role === 'manager' ? "bg-blue-50 text-blue-700 border-blue-200" :
                            "bg-slate-100 text-slate-700 border-slate-200"
                          )}
                        >
                          <option value="viewer">Viewer (Read-only)</option>
                          <option value="manager">Manager (Project Creator)</option>
                          <option value="admin">Admin (System Admin)</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 shadow-2xs">
                          <CheckCircle2 size={11} />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCurrent ? (
                          <button 
                            onClick={() => handleDelete(u._id, u.name)}
                            className="text-slate-400 hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                            title={`Remove user ${u.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Self (Protected)</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Role Permission Matrix Card */}
      <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 text-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-900 font-bold text-xs uppercase tracking-wider">
          <Info size={16} className="text-blue-600" />
          <span>Role Permissions & Access Matrix</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <strong className="text-purple-700 font-bold block mb-1">Administrator (Admin)</strong>
            <p className="text-slate-500 leading-relaxed">
              Full system privileges. Create & delete projects, enter KPIs, manage tasks, audit user accounts, and allocate system roles.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <strong className="text-blue-700 font-bold block mb-1">Project Manager</strong>
            <p className="text-slate-500 leading-relaxed">
              Create and configure projects, record weekly EVM entries, update task completion sliders, and export official reports.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <strong className="text-slate-700 font-bold block mb-1">Viewer (Auditor / Student)</strong>
            <p className="text-slate-500 leading-relaxed">
              Read-only telemetry access. View dashboards, evaluate historical EVM curves, examine schedule progress, and print reports.
            </p>
          </div>
        </div>
      </div>

      {/* Create User Modal with AnimatePresence */}
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
                <h3 className="text-lg font-bold text-slate-900">Add New System User</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-5">Provision a new account with specified system role</p>

              <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Samuel Douglas"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. samuel@rsu.edu.ng"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Min. 6 characters"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assign Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full p-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white font-medium cursor-pointer"
                  >
                    <option value="viewer">Viewer (Read-only)</option>
                    <option value="manager">Manager (Project Creator & KPI Entry)</option>
                    <option value="admin">Admin (Full Administrative Privileges)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingUser}
                    className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl transition-all shadow-xs disabled:opacity-70 cursor-pointer"
                  >
                    {submittingUser ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
