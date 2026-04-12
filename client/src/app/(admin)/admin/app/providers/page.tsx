"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";
import { Server, Edit2, Trash2, Plus, DollarSign, Calendar, Tag } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  price_per_lead: number;
  requests_count?: number;
  created_at: string;
  updated_at: string;
}

export default function ProvidersManagementPage() {
  const router = useRouter();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newProviderName, setNewProviderName] = useState("");
  const [newProviderPrice, setNewProviderPrice] = useState("");
  const [isSavingRe, setIsSavingRe] = useState(false);

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [isEditingRe, setIsEditingRe] = useState(false);

  // Instead of confirm() we should optimally use a modal, but for speed we'll do confirm 
  // unless we want to build a quick delete confirm modal. Let's use `window.confirm` for simplicity.
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null);

  useEffect(() => {
    verifyAuth();
    fetchProviders();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      await adminApi.get("/admin/auth/verify");
    } catch (error) {
      console.error("Auth verification error:", error);
      router.push("/admin/login");
    }
  };

  const fetchProviders = async () => {
    try {
      const { data } = await adminApi.get("/admin/providers");
      setProviders(data.providers);
    } catch (error) {
      console.error("Fetch providers error:", error);
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProvider = async () => {
    if (!newProviderName || !newProviderPrice) {
      toast.error("Please fill all fields");
      return;
    }
    setIsSavingRe(true);
    try {
      await adminApi.post("/admin/providers", {
        name: newProviderName,
        price_per_lead: parseFloat(newProviderPrice),
      });
      toast.success("Provider added successfully");
      setShowAddModal(false);
      setNewProviderName("");
      setNewProviderPrice("");
      fetchProviders();
    } catch (error) {
      console.error("Add provider error:", error);
      toast.error("Failed to add provider");
    } finally {
      setIsSavingRe(false);
    }
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setEditName(provider.name);
    setEditPrice(String(provider.price_per_lead));
  };

  const handleEditProvider = async () => {
    if (!editingProvider) return;
    if (!editName || !editPrice) {
      toast.error("Please fill all fields");
      return;
    }
    setIsEditingRe(true);
    try {
      await adminApi.put(`/admin/providers/${editingProvider.id}`, {
        name: editName,
        price_per_lead: parseFloat(editPrice),
      });
      toast.success("Provider updated successfully");
      setEditingProvider(null);
      fetchProviders();
    } catch (error) {
      console.error("Edit provider error:", error);
      toast.error("Failed to update provider");
    } finally {
      setIsEditingRe(false);
    }
  };

  const handleDeleteProvider = async (id: string, name: string) => {
    if (!confirm(`Are you absolutely sure you want to delete ${name}?`)) return;

    try {
      await adminApi.delete(`/admin/providers/${id}`);
      toast.success("Provider deleted successfully");
      fetchProviders();
    } catch (error) {
      console.error("Delete provider error:", error);
      toast.error("Failed to delete provider");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center w-full">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Providers...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 text-black w-full overflow-hidden flex flex-col font-sans">
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-black mb-1">
                Data Providers
              </h1>
              <p className="text-sm text-gray-500 font-medium">Manage skip tracing vendors and pricing tiers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white border border-gray-200 shadow-sm px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                <span className="text-gray-500 uppercase tracking-wider text-[10px]">Active Vendors</span>
                <span className="text-black text-lg">{providers.length}</span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-2.5 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus size={16} /> Add Provider
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Provider Details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Base Rate
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Orders Assigned
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Integration Date
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {providers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Server className="w-12 h-12 text-gray-200 mb-3" />
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No providers found</p>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm">Add a new provider to start tracking expenses for your lead requests.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    providers.map((provider) => (
                      <tr
                        key={provider.id}
                        className="hover:bg-gray-50 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center text-black font-bold text-sm shadow-sm border border-gray-200">
                              {provider.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <span className="text-sm font-bold text-black block mb-0.5">{provider.name}</span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider font-mono">ID: {provider.id.split("-")[0]}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                           <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-sm">
                             <DollarSign size={14} />
                             {Number(provider.price_per_lead).toString()}
                           </div>
                           <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider ml-2">/ Lead</span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                           <span className="text-sm font-bold text-black border-b-2 border-blue-500/30 pb-0.5">
                             {provider.requests_count || 0}
                           </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm text-gray-600 font-medium h-full py-auto">
                          <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-gray-400" />
                             {new Date(provider.created_at).toLocaleDateString("en-US", {
                               year: "numeric",
                               month: "short",
                               day: "numeric",
                             })}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(provider)}
                              className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                              title="Edit Configuration"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider.id, provider.name)}
                              className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Vendor"
                            >
                              <Trash2 size={16} />
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

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 border border-gray-200 shadow-2xl scale-100 transition-all">
            <h2 className="text-2xl font-bold text-black tracking-tight mb-1">Edit Provider</h2>
            <p className="text-sm text-gray-500 font-medium mb-6">Modify vendor configuration and rates</p>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Vendor Tag
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Tag className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    placeholder="e.g. DataFinder Pro"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Price per Lead ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    placeholder="0.15"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditProvider}
                  disabled={isEditingRe}
                  className="flex-1 px-4 py-3 bg-black hover:bg-zinc-800 text-white disabled:opacity-50 rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-md transition-all"
                >
                  {isEditingRe ? (
                     <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span> Saving...</>
                  ) : "Save Changes"}
                </button>
                <button
                  onClick={() => setEditingProvider(null)}
                  className="px-6 py-3 bg-white border border-gray-200 text-black hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Provider Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 border border-gray-200 shadow-2xl scale-100 transition-all">
            <h2 className="text-2xl font-bold text-black tracking-tight mb-1">New Provider</h2>
             <p className="text-sm text-gray-500 font-medium mb-6">Register a new data vendor</p>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Vendor Tag
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Server className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    placeholder="e.g. DataFinder Pro"
                    value={newProviderName}
                    onChange={(e) => setNewProviderName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                  Price per Lead ($)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <DollarSign className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    step="any"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black font-medium focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                    placeholder="0.15"
                    value={newProviderPrice}
                    onChange={(e) => setNewProviderPrice(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProvider}
                  disabled={isSavingRe}
                  className="flex-1 px-4 py-3 bg-black hover:bg-zinc-800 text-white disabled:opacity-50 rounded-xl text-sm font-bold flex justify-center items-center gap-2 shadow-md transition-all"
                >
                  {isSavingRe ? (
                     <><span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span> Saving...</>
                  ) : "Register Provider"}
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-white border border-gray-200 text-black hover:bg-gray-50 rounded-xl text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
