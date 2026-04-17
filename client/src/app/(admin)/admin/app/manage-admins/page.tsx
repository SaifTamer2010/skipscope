"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";
import { 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  UserPlus, 
  Edit2, 
  Trash2, 
  Shield, 
  Lock, 
  Unlock,
  CheckCircle2,
  XCircle,
  Calendar,
  Clock,
  User as UserIcon
} from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  display_name: string;
  is_super_admin: boolean;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

function AdminAvatar({ name, isSuper }: { name: string; isSuper: boolean }) {
  return (
    <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border shadow-sm ${
      isSuper 
        ? "bg-indigo-50 text-indigo-600 border-indigo-100" 
        : "bg-gray-50 text-gray-600 border-gray-100"
    }`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default function ManageAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    username: "",
    displayName: "",
    isSuperAdmin: false,
    isActive: true
  });
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    verifyRoleAndAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchAdmins();
    }
  }, [currentUser]);

  const verifyRoleAndAuth = async () => {
    const token = localStorage.getItem("admin_token");
    const userStr = localStorage.getItem("admin_user");
    
    if (!token || !userStr) {
      router.push("/admin/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      
      if (!user.isSuperAdmin) {
        toast.error("Super admin access required");
        router.push("/admin/app/dashboard");
        return;
      }

      await adminApi.get("/admin/auth/verify");
    } catch (error) {
      router.push("/admin/login");
    }
  };

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.get("/admin/admins");
      setAdmins(data.admins || []);
    } catch (error) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.displayName) {
      toast.error("All fields are required");
      return;
    }

    setSaving(true);
    try {
      await adminApi.post("/admin/admins", formData);
      toast.success("Admin created successfully");
      setIsCreateModalOpen(false);
      resetForm();
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to create admin");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin) return;

    setSaving(true);
    try {
      await adminApi.patch(`/admin/admins/${selectedAdmin.id}`, {
        displayName: formData.displayName,
        isSuperAdmin: formData.isSuperAdmin,
        isActive: formData.isActive
      });
      toast.success("Admin updated successfully");
      setIsEditModalOpen(false);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update admin");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAdmin) return;

    setSaving(true);
    try {
      await adminApi.delete(`/admin/admins/${selectedAdmin.id}`);
      toast.success("Admin deleted successfully");
      setIsDeleteModalOpen(false);
      fetchAdmins();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to delete admin");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      username: admin.username,
      displayName: admin.display_name,
      isSuperAdmin: admin.is_super_admin,
      isActive: admin.is_active
    });
    setIsEditModalOpen(true);
  };

  const openDelete = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      username: "",
      displayName: "",
      isSuperAdmin: false,
      isActive: true
    });
    setSelectedAdmin(null);
  };

  const filteredAdmins = admins.filter(a => 
    a.username.toLowerCase().includes(search.toLowerCase()) || 
    a.display_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading && !admins.length) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center w-full">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Initializing Security...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 text-black font-sans pb-12">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-black mb-1 flex items-center gap-3">
               <ShieldCheck size={28} className="text-indigo-600" />
               Manage Admins
            </h1>
            <p className="text-sm text-gray-500 font-medium">Configure administrative personnel and security privileges.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
            className="px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-black/5"
          >
            <UserPlus size={18} />
            Provision New Admin
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
           <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100">
                 <Shield size={24} />
              </div>
              <div>
                 <div className="text-2xl font-bold text-black">{admins.length}</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Admin Personnel</div>
              </div>
           </div>
           <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                 <CheckCircle2 size={24} />
              </div>
              <div>
                 <div className="text-2xl font-bold text-black">{admins.filter(a => a.is_active).length}</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Accounts</div>
              </div>
           </div>
           <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-100">
                 <ShieldAlert size={24} />
              </div>
              <div>
                 <div className="text-2xl font-bold text-black">{admins.filter(a => a.is_super_admin).length}</div>
                 <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Super Admin Privileges</div>
              </div>
           </div>
        </div>

        {/* Search */}
        <div className="mb-8 relative max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
           <input 
             type="text" 
             placeholder="Audit search (username, name)..." 
             className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-black transition-shadow shadow-sm"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-100">
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Identity</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Privilege Tier</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">System Status</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Last Access</th>
                   <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Administrative Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                 {filteredAdmins.map((admin) => (
                   <tr key={admin.id} className="hover:bg-gray-50/50 transition-colors group">
                     <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                         <AdminAvatar name={admin.display_name} isSuper={admin.is_super_admin} />
                         <div>
                            <span className="text-sm font-bold text-black block">{admin.display_name}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">@{admin.username} {admin.id === currentUser?.id && "(You)"}</span>
                         </div>
                       </div>
                     </td>
                     <td className="px-6 py-5">
                        {admin.is_super_admin ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full w-max border border-indigo-100">
                             <Shield size={12} strokeWidth={3} />
                             <span className="text-[10px] font-black uppercase tracking-widest">Super Admin</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-500 rounded-full w-max border border-gray-100">
                             <Shield size={12} />
                             <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
                          </div>
                        )}
                     </td>
                     <td className="px-6 py-5">
                        {admin.is_active ? (
                          <div className="flex items-center gap-1.5 text-emerald-500">
                             <CheckCircle2 size={16} />
                             <span className="text-xs font-bold uppercase tracking-wider">Operational</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-rose-400">
                             <XCircle size={16} />
                             <span className="text-xs font-bold uppercase tracking-wider">Deactivated</span>
                          </div>
                        )}
                     </td>
                     <td className="px-6 py-5">
                        <div className="flex flex-col">
                           <span className="text-xs font-bold text-gray-700">
                             {admin.last_login ? new Date(admin.last_login).toLocaleDateString() : 'Never'}
                           </span>
                           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                             {admin.last_login ? new Date(admin.last_login).toLocaleTimeString() : 'No Auth History'}
                           </span>
                        </div>
                     </td>
                     <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button 
                             onClick={() => openEdit(admin)}
                             className="p-2.5 text-gray-400 hover:text-black hover:bg-white border hover:border-gray-200 rounded-xl transition-all"
                             title="Modify Admin"
                           >
                             <Edit2 size={16} />
                           </button>
                           <button 
                             onClick={() => openDelete(admin)}
                             className="p-2.5 text-red-300 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                             title="Revoke Access"
                             disabled={admin.id === currentUser?.id}
                           >
                             <Trash2 size={16} />
                           </button>
                        </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </div>

      {/* Provision Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 scale-100 transition-transform">
              <div className="p-8 pb-0">
                 <div className="flex items-center justify-between mb-8">
                    <div>
                       <h2 className="text-2xl font-black text-black tracking-tighter">
                          {isCreateModalOpen ? 'New Admin Persona' : 'Modify Permission'}
                       </h2>
                       <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                          Security clearance protocol
                       </p>
                    </div>
                    <button 
                      onClick={() => { setIsCreateModalOpen(false); setIsEditModalOpen(false); }}
                      className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black transition-colors"
                    >
                      <XCircle size={20} />
                    </button>
                 </div>

                 <form onSubmit={isCreateModalOpen ? handleCreate : handleUpdate} className="space-y-6">
                    {isCreateModalOpen && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">System Username</label>
                        <div className="relative">
                           <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                           <input 
                             type="text" 
                             className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-300 transition-all font-mono"
                             placeholder="admin_id"
                             value={formData.username}
                             onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '_')})}
                           />
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Display Alias</label>
                      <div className="relative">
                         <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-bold">@</div>
                         <input 
                           type="text" 
                           className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-300 transition-all"
                           placeholder="Full Name / Handle"
                           value={formData.displayName}
                           onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                         />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <button
                         type="button"
                         onClick={() => setFormData({...formData, isSuperAdmin: !formData.isSuperAdmin})}
                         className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                           formData.isSuperAdmin 
                             ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100" 
                             : "bg-gray-50 border-gray-100 text-gray-400"
                         }`}
                       >
                          <div className="flex flex-col items-start">
                             <span className="text-[10px] font-black uppercase tracking-widest">Privilege</span>
                             <span className="text-xs font-bold">{formData.isSuperAdmin ? 'SUPER' : 'BASIC'}</span>
                          </div>
                          {formData.isSuperAdmin ? <Lock size={18} /> : <Unlock size={18} />}
                       </button>

                       <button
                         type="button"
                         onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                         className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                           formData.isActive 
                             ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100" 
                             : "bg-gray-50 border-gray-100 text-gray-400"
                         }`}
                       >
                          <div className="flex flex-col items-start">
                             <span className="text-[10px] font-black uppercase tracking-widest">Status</span>
                             <span className="text-xs font-bold">{formData.isActive ? 'OPERATIONAL' : 'LOCKED'}</span>
                          </div>
                          {formData.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                       </button>
                    </div>

                    <div className="pt-6 pb-8">
                       <button 
                         type="submit"
                         disabled={saving}
                         className="w-full py-4 bg-black hover:bg-zinc-800 text-white font-black rounded-2xl text-sm uppercase tracking-widest transform transition-all active:scale-[0.98] shadow-xl disabled:opacity-30"
                       >
                          {saving ? 'Processing Authorization...' : (isCreateModalOpen ? 'Initialize Account' : 'Commit Changes')}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* Revocation Modal */}
      {isDeleteModalOpen && selectedAdmin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border-t-8 border-t-red-600 flex flex-col items-center">
              <div className="p-8 text-center">
                 <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                    <Trash2 size={32} strokeWidth={2.5} />
                 </div>
                 <h2 className="text-2xl font-black text-black tracking-tighter mb-2">Revoke Clearance?</h2>
                 <p className="text-gray-500 text-sm font-medium mb-8">
                    You are about to permanently purge <span className="text-black font-bold">@{selectedAdmin.username}</span> from the system.
                    This operation is non-recoverable.
                 </p>
                 
                 <div className="flex gap-4 w-full">
                    <button 
                      onClick={handleDelete}
                      disabled={saving}
                      className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 disabled:opacity-30"
                    >
                      {saving ? 'Purging...' : 'Execute Purge'}
                    </button>
                    <button 
                      onClick={() => setIsDeleteModalOpen(false)}
                      className="px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold rounded-2xl text-xs uppercase"
                    >
                      Abort
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
