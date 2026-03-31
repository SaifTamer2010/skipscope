"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";

interface Provider {
  id: string;
  name: string;
  price_per_lead: number;
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

  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

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

    try {
      await adminApi.post("/admin/providers", {
        name: newProviderName,
        price_per_lead: parseFloat(newProviderPrice),
      });
      console.log(newProviderPrice) // it does work fine here
      toast.success("Provider added successfully");
      setShowAddModal(false);
      setNewProviderName("");
      setNewProviderPrice("");
      fetchProviders();
    } catch (error) {
      console.error("Add provider error:", error);
      toast.error("Failed to add provider");
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
    }
  };

  const handleDeleteProvider = async (id: string) => {
    // if (!confirm("Are you sure you want to delete this provider?")) return;

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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Provider Management
            </h1>
            <p className="text-gray-400">Manage your data providers and leads pricing.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-gray-800 px-4 py-2 rounded-lg text-gray-300">
              Total Providers:{" "}
              <span className="text-white font-bold">{providers.length}</span>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
            >
              Add Provider
            </button>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-800/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Provider Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Price per Lead
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Added Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {providers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No providers found.
                    </td>
                  </tr>
                ) : (
                  providers.map((provider) => (
                    <tr
                      key={provider.id}
                      className="hover:bg-gray-800/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs mr-3">
                            {provider.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-white">
                            {provider.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-mono">
                        ${Number(provider.price_per_lead).toString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {new Date(provider.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => openEditModal(provider)}
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProvider(provider.id)}
                            className="text-red-400 hover:text-red-300 font-medium transition-colors"
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

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Provider</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g. DataFinder Pro"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Lead ($)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.15"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleEditProvider}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingProvider(null)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4">
          <div className="bg-gray-900 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Add New Provider</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="e.g. DataFinder Pro"
                  value={newProviderName}
                  onChange={(e) => setNewProviderName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Price per Lead ($)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  placeholder="0.15"
                  value={newProviderPrice}
                  onChange={(e) => setNewProviderPrice(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddProvider}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors"
                >
                  Save Provider
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
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
