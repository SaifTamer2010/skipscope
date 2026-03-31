"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";

interface UserRequest {
  id: string;
  title: string;
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

// ── tiny helpers ─────────────────────────────────────────────
const statusBadge: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  rejected: "bg-red-500/20 text-red-400",
};

function Avatar({ email, size = "md" }: { email: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-xl" };
  return (
    <div
      className={`${sizes[size]} rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold flex-shrink-0`}
    >
      {email.charAt(0).toUpperCase()}
    </div>
  );
}

// ── main component ────────────────────────────────────────────
export default function UserManagementPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // View Details
  const [detailUser, setDetailUser] = useState<UserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Edit modal
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editSaving, setEditSaving] = useState(false);

  // Delete confirm
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    verifyAuth();
    fetchUsers();
  }, []);

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
      const { data } = await adminApi.get("/admin/users");
      setUsers(data.users);
    } catch {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  // ── View Details ──────────────────────────────────────────
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

  // ── Edit ──────────────────────────────────────────────────
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
      toast.success("User updated");
      setEditingUser(null);
      fetchUsers();
      // update detail panel too if open
      if (detailUser?.id === editingUser.id) {
        setDetailUser((d) => d ? { ...d, email: editEmail } : d);
      }
    } catch {
      toast.error("Failed to update user");
    } finally {
      setEditSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingUser) return;
    if (deleteConfirm !== deletingUser.email) {
      toast.error("Email doesn't match");
      return;
    }
    try {
      await adminApi.delete(`/admin/users/${deletingUser.id}`);
      toast.success("User deleted");
      setDeletingUser(null);
      setDeleteConfirm("");
      if (detailUser?.id === deletingUser.id) setDetailUser(null);
      fetchUsers();
    } catch {
      toast.error("Failed to delete user");
    }
  };

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ── Loading ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500" />
          <p className="mt-4 text-gray-400">Loading users...</p>
        </div>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-950 text-white flex">
      {/* ── Main Table ── */}
      <div className={`flex-1 transition-all duration-300 ${detailUser ? "mr-[420px]" : ""}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">User Management</h1>
              <p className="text-gray-400 text-sm">Manage registered accounts and their requests.</p>
            </div>
            <div className="bg-gray-800 px-4 py-2 rounded-lg text-gray-300 text-sm">
              Total:{" "}
              <span className="text-white font-bold">{users.length}</span>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-800/50 border-b border-gray-800">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((user) => (
                      <tr
                        key={user.id}
                        className={`hover:bg-gray-800/50 transition-colors duration-150 ${detailUser?.id === user.id ? "bg-purple-900/10 border-l-2 border-l-purple-500" : ""}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar email={user.email} size="sm" />
                            <span className="text-sm font-medium text-white">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono max-w-[160px] truncate">
                          {user.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                          {new Date(user.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => openDetails(user)}
                              className="text-purple-400 hover:text-purple-300 font-medium text-sm transition-colors"
                            >
                              View
                            </button>
                            <button
                              onClick={() => openEdit(user)}
                              className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => { setDeletingUser(user); setDeleteConfirm(""); }}
                              className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── View Details Sidebar ── */}
      {detailUser && (
        <div className="fixed top-[80px] right-0 h-[calc(100vh-80px)] w-[420px] bg-gray-900 border-l border-gray-800 overflow-y-auto z-30 flex flex-col shadow-2xl">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
            <h2 className="text-lg font-bold text-white">User Details</h2>
            <button
              onClick={() => setDetailUser(null)}
              className="text-gray-400 hover:text-white transition-colors text-xl leading-none"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {detailLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {/* Profile card */}
              <div className="px-6 py-6 border-b border-gray-800">
                <div className="flex items-center gap-4 mb-5">
                  <Avatar email={detailUser.email} size="lg" />
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-base truncate">{detailUser.email}</p>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Joined{" "}
                      {new Date(detailUser.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(detailUser)}
                    className="flex-1 py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Edit Email
                  </button>
                  <button
                    onClick={() => { setDeletingUser(detailUser); setDeleteConfirm(""); }}
                    className="flex-1 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    Delete User
                  </button>
                </div>
              </div>

              {/* Info section */}
              <div className="px-6 py-5 border-b border-gray-800">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Info</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">User ID</dt>
                    <dd className="text-xs text-gray-300 font-mono break-all">{detailUser.id}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">Email</dt>
                    <dd className="text-sm text-white">{detailUser.email}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-0.5">Registered</dt>
                    <dd className="text-sm text-gray-300">
                      {new Date(detailUser.created_at).toLocaleString("en-US")}
                    </dd>
                  </div>
                  {detailUser.updated_at && (
                    <div>
                      <dt className="text-xs text-gray-500 mb-0.5">Last Updated</dt>
                      <dd className="text-sm text-gray-300">
                        {new Date(detailUser.updated_at).toLocaleString("en-US")}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              {/* Settings section */}
              {detailUser.settings && Object.keys(detailUser.settings).length > 0 && (
                <div className="px-6 py-5 border-b border-gray-800">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Settings</h3>
                  <pre className="text-xs text-gray-400 bg-gray-800 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(detailUser.settings, null, 2)}
                  </pre>
                </div>
              )}

              {/* Requests section */}
              <div className="px-6 py-5">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                  Requests{" "}
                  <span className="text-gray-600 normal-case">({detailUser.requests.length})</span>
                </h3>
                {detailUser.requests.length === 0 ? (
                  <p className="text-sm text-gray-600 italic">No requests yet.</p>
                ) : (
                  <div className="space-y-3">
                    {detailUser.requests.map((req) => (
                      <div
                        key={req.id}
                        className="bg-gray-800 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm text-white font-medium leading-tight">{req.title}</p>
                          {req.kanban_columns && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap flex-shrink-0"
                              style={{
                                backgroundColor: req.kanban_columns.color + "33",
                                color: req.kanban_columns.color,
                              }}
                            >
                              {req.kanban_columns.name}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
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

      {/* ── Edit Modal ── */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-1">Edit User</h2>
            <p className="text-gray-400 text-sm mb-6">Update the user's email address.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="user@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEdit()}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleEdit}
                  disabled={editSaving}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-red-900/50 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 text-lg">
                ⚠
              </div>
              <h2 className="text-xl font-bold text-white">Delete User</h2>
            </div>
            <p className="text-gray-400 text-sm mb-2">
              This action is <span className="text-red-400 font-semibold">irreversible</span>. All data associated with this user may be affected.
            </p>
            <p className="text-gray-400 text-sm mb-5">
              Type <span className="text-white font-mono">{deletingUser.email}</span> to confirm.
            </p>

            <input
              type="text"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4 focus:outline-none focus:border-red-500 transition-colors"
              placeholder={deletingUser.email}
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />

            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleteConfirm !== deletingUser.email}
                className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
              >
                Delete User
              </button>
              <button
                onClick={() => { setDeletingUser(null); setDeleteConfirm(""); }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
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
