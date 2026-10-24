"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, User as UserIcon, Shield, Trash2, UserPlus, Search, CheckCircle2, AlertCircle, Info } from "lucide-react";
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
      setMessage({ type: 'success', text: `User role successfully updated to ${newRole}` });
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
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Shield size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 mt-2 max-w-sm">
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
    <div className="py-6 max-w-6xl mx-auto">
      {/* Page Title & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full uppercase">
              Admin Control Center
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            User & Role Management
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage system users, access privileges, role allocations, and security credentials
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm cursor-pointer text-sm"
        >
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {/* Notifications / Feedback Banner */}
      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2.5 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-400 block mb-1">Total Users</span>
          <span className="text-3xl font-extrabold text-slate-900">{users.length}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs uppercase font-semibold text-purple-600 block mb-1">Administrators</span>
          <span className="text-3xl font-extrabold text-purple-700">{adminCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs uppercase font-semibold text-blue-600 block mb-1">Project Managers</span>
          <span className="text-3xl font-extrabold text-blue-700">{managerCount}</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs uppercase font-semibold text-slate-500 block mb-1">Viewers / Auditors</span>
          <span className="text-3xl font-extrabold text-slate-700">{viewerCount}</span>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 shadow-xs rounded-xl overflow-hidden mb-8">
        {/* Table Filter Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto">
            {['all', 'admin', 'manager', 'viewer'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  roleFilter === role ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>
        
        {loading ? (
          <div className="p-12 text-center animate-pulse text-slate-500">Loading user accounts...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No users match the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/60 text-slate-600 border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email Address</th>
                  <th className="px-6 py-4 font-semibold text-center">Assigned Role</th>
                  <th className="px-6 py-4 font-semibold text-center">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrent = u._id === user.id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs uppercase">
                          {u.name?.substring(0, 2) || "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-2">
                            <span>{u.name}</span>
                            {isCurrent && (
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400">ID: {u._id.substring(u._id.length - 6)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">{u.email}</td>
                      <td className="px-6 py-4 text-center">
                        <select 
                          value={u.role} 
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                          disabled={isCurrent}
                          className={clsx(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold outline-none border cursor-pointer font-sans transition-colors",
                            u.role === 'admin' ? "bg-purple-50 text-purple-700 border-purple-300" :
                            u.role === 'manager' ? "bg-blue-50 text-blue-700 border-blue-300" :
                            "bg-slate-100 text-slate-700 border-slate-300"
                          )}
                        >
                          <option value="viewer">Viewer (Read-only)</option>
                          <option value="manager">Manager (Full edit)</option>
                          <option value="admin">Admin (System Admin)</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isCurrent ? (
                          <button 
                            onClick={() => handleDelete(u._id, u.name)}
                            className="text-slate-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                            title={`Remove user ${u.name}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Self (Protected)</span>
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
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-sm">
        <div className="flex items-center gap-2 mb-3 text-slate-800 font-bold">
          <Info size={18} className="text-blue-600" />
          <span>Role Permissions & Access Matrix</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <strong className="text-purple-700 font-bold block mb-1">Administrator (Admin)</strong>
            <p className="text-slate-600">
              Full system rights. Can create and delete projects, enter KPIs, manage tasks, view audits, add users, change roles, and remove accounts.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <strong className="text-blue-700 font-bold block mb-1">Project Manager</strong>
            <p className="text-slate-600">
              Can create new projects, submit weekly KPI entries, manage project work packages and tasks, and export printable reports.
            </p>
          </div>
          <div className="bg-white p-3.5 rounded-lg border border-slate-200">
            <strong className="text-slate-700 font-bold block mb-1">Viewer (Auditor / Student)</strong>
            <p className="text-slate-600">
              Read-only access. Can view project dashboards, charts, task completion timelines, and print academic evaluation reports.
            </p>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New System User</h3>
            <p className="text-xs text-slate-500 mb-4">Provision a new account with specified system role</p>

            <form onSubmit={handleCreateUser} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engr. Samuel Douglas"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. samuel@rsu.edu.ng"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min. 6 characters"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Role *</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium"
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingUser}
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-70 cursor-pointer"
                >
                  {submittingUser ? "Creating..." : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
