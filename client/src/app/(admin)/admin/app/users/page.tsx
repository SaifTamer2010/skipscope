"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";
import { Search, User as UserIcon, Calendar, Edit2, Trash2, Mail, ShieldAlert, CheckCircle2, ChevronRight, Settings } from "lucide-react";

interface UserRequest {
  id: string;
  county?: string;
  state?: string;
  market?: string;
  status: string;
  created_at: string;
  kanban_columns: { name: string; color: string } | null;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at?: string;
  settings?: any;
}

interface UserDetail extends User {
  requests: UserRequest[];
}

function Avatar({ email, size = "md" }: { email: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold flex-shrink-0 border border-blue-100 shadow-sm`}
    >
      {email.charAt(0).toUpperCase()}
    </div>
  );
}

export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    verifyAuth();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchUsers();
    }, 500);
    return () => clearTimeout(handler);
  }, [search, page]);

  const verifyAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/admin/login"); return; }
    try {
      await adminApi.get("/admin/auth/verify");
    } catch {
      router.push("/admin/login");
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await adminApi.get(`/admin/users?page=${page}&limit=50&search=${search}`);
      setUsers(data.users || []);
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
      }
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const openDetails = async (user: User) => {
    setDetailLoading(true);
    setDetailUser({ ...user, requests: [] });
    try {
      const { data } = await adminApi.get(`/admin/users/${user.id}`);
      setDetailUser({ ...data.user, requests: data.requests });
    } catch {
      toast.error("Failed to load user details");
      setDetailUser(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setEditEmail(user.email);
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    if (!editEmail || !editEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setEditSaving(true);
    try {
      await adminApi.put(`/admin/users/${editingUser.id}`, { email: editEmail });
      toast.success("User updated successfully");
      setEditingUser(null);
      fetchUsers();
      if (detailUser?.id === editingUser.id) {
        setDetailUser((d) => d ? { ...d, email: editEmail } : d);
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    if (deleteConfirm !== deletingUser.email) {
      toast.error("Email doesn't match");
      return;
    }
    try {
      await adminApi.delete(`/admin/users/${deletingUser.id}`);
      toast.success("User deleted permanently");
      setDeletingUser(null);
      setDeleteConfirm("");
      if (detailUser?.id === deletingUser.id) setDetailUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  // Removed client filtering

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center w-full">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Users...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 text-black w-full overflow-hidden flex font-sans relative">
      {/* ── Main Table ── */}
      <div className={`flex-1 overflow-auto transition-all duration-300 p-8 ${detailUser ? "pr-[440px]" : "pr-8"}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black mb-1">User Management</h1>
              <p className="text-sm text-gray-500 font-medium">Manage platform accounts, auditing, and client profiles</p>
            </div>
            <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <span className="text-gray-500 uppercase tracking-wider text-[10px]">Total Accounts</span>
              <span className="text-blue-600 text-lg">{totalUsers}</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-shadow shadow-sm"
            />
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client Identity</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">System ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registration Date</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                         <div className="flex flex-col items-center justify-center">
                            <UserIcon className="w-8 h-8 text-gray-300 mb-3" />
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No users found</p>
                         </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-50 transition-colors duration-150 group cursor-pointer ${detailUser?.id === user.id ? "bg-blue-50/30" : ""}`}
                        onClick={() => openDetails(user)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <Avatar email={user.email} size="md" />
                            <div>
                               <span className="text-sm font-bold text-black block">{user.email}</span>
                               <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Client Account</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono tracking-tight max-w-[160px] truncate">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(user); }}
                              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Email"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeletingUser(user); setDeleteConfirm(""); }}
                              className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete User"
                            >
                              <Trash2 size={16} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDetails(user); }}
                              className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50/50 px-6 py-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── View Details Sidebar ── */}
      <div 
        className={`fixed top-[80px] right-0 bottom-0 w-[420px] bg-white border-l border-gray-200 overflow-y-auto z-30 transition-transform duration-300 ease-in-out shadow-2xl ${
          detailUser ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {detailUser && (
          <div className="flex flex-col h-full">
            {/* Sidebar header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
              <h2 className="text-lg font-bold text-black tracking-tight flex items-center gap-2">
                 <UserIcon size={18} className="text-blue-600" />
                 Client Overview
              </h2>
              <button
                onClick={() => setDetailUser(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black mb-4"></div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Profile</p>
              </div>
            ) : (
              <div className="flex-1">
                {/* Profile header */}
                <div className="px-6 py-8 border-b border-gray-100 flex flex-col items-center text-center">
                  <div className="mb-4 relative">
                     <Avatar email={detailUser.email} size="lg" />
                     <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active Account"></div>
                  </div>
                  <h3 className="text-xl font-bold text-black truncate w-full px-4">{detailUser.email}</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1 uppercase tracking-wider flex items-center justify-center gap-1">
                     <Calendar size={12} />
                     Joined {new Date(detailUser.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </p>

                  <div className="flex items-center gap-2 mt-6 w-full">
                    <button
                      onClick={() => openEdit(detailUser)}
                      className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => { setDeletingUser(detailUser); setDeleteConfirm(""); }}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>

                {/* Identity & Metadata */}
                <div className="px-6 py-6 border-b border-gray-100">
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <ShieldAlert size={12} /> System Identity
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                     <div>
                       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Account ID</label>
                       <p className="text-xs text-black font-mono break-all bg-white px-3 py-2 rounded-lg border border-gray-100">{detailUser.id}</p>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Email Address</label>
                          <p className="text-sm text-black font-semibold truncate" title={detailUser.email}>{detailUser.email}</p>
                        </div>
                        {detailUser.updated_at && (
                          <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Last Sync</label>
                            <p className="text-sm text-gray-600 font-medium">
                              {new Date(detailUser.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Settings section */}
                {detailUser.settings && Object.keys(detailUser.settings).length > 0 && (
                  <div className="px-6 py-6 border-b border-gray-100">
                    <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <Settings size={12} /> Account Settings
                    </h3>
                    <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto shadow-inner">
                      <pre className="text-[11px] text-green-400 font-mono font-medium">
                        {JSON.stringify(detailUser.settings, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Requests section */}
                <div className="px-6 py-6 pb-24">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                        <CheckCircle2 size={12} /> Active Requests
                     </h3>
                     <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {detailUser.requests.length} Total
                     </span>
                  </div>
                  
                  {detailUser.requests.length === 0 ? (
                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100 border-dashed">
                       <p className="text-sm text-gray-400 font-bold">No requests found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailUser.requests.map((req) => (
                        <div
                          key={req.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group"
                        >
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex flex-col">
                              <p className="text-sm text-black font-bold leading-tight group-hover:text-blue-600 transition-colors">
                                {req.county ? `${req.county}, ${req.state}` : req.state || req.market || `Req #${req.id.slice(0, 8)}`}
                              </p>
                              <p className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider mt-0.5">
                                {req.id.slice(0, 8)}
                              </p>
                            </div>
                            {req.kanban_columns && (
                              <span
                                className="text-[10px] px-2.5 py-0.5 rounded-md font-bold whitespace-nowrap flex-shrink-0 shadow-sm border"
                                style={{
                                  backgroundColor: req.kanban_columns.color + "1A", // 10% opacity
                                  color: req.kanban_columns.color,
                                  borderColor: req.kanban_columns.color + "33" // 20% opacity border
                                }}
                              >
                                {req.kanban_columns.name}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(req.created_at).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[70] px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 border border-gray-200 shadow-2xl scale-100 transition-all">
            <h2 className="text-2xl font-bold text-black tracking-tight mb-1">Update Email</h2>
            <p className="text-gray-500 text-sm font-medium mb-6">Change the registered email address.</p>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Mail className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    placeholder="client@example.com"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEdit}
                  disabled={editSaving}
                  className="flex-1 px-4 py-3 bg-black hover:bg-zinc-800 text-white disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 rounded-xl text-sm font-bold transition-colors flex justify-center items-center gap-2 shadow-md hover:shadow-lg"
                >
                  {editSaving ? (
                    <><span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> Saving...</>
                  ) : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-3 bg-white border border-gray-200 text-black hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deletingUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[70] px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 border-t-4 border-t-red-600 shadow-2xl scale-100 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-600 flex-shrink-0 shadow-sm">
                <Trash2 size={24} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-black tracking-tight">Delete Account</h2>
            </div>
            
            <p className="text-gray-600 font-medium text-sm mb-3">
              This action is irreversible. All data, requests, and logs associated with this user will be permanently destroyed.
            </p>
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-6 flex flex-col items-center text-center">
               <span className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Confirm Identity</span>
               <span className="text-black font-bold text-sm bg-white px-2 py-1 border border-gray-200 rounded select-all">{deletingUser.email}</span>
            </div>

            <div className="mb-6">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Type exact email to confirm</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-red-50/50 border border-red-200 rounded-xl text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-red-500 transition-shadow"
                placeholder={deletingUser.email}
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== deletingUser.email}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-bold flex justify-center items-center shadow-md hover:shadow-lg transition-all"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => { setDeletingUser(null); setDeleteConfirm(""); }}
                className="px-6 py-3 bg-white border border-gray-200 text-black hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
