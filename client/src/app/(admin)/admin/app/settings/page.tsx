"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Settings, LayoutPanelLeft, Plus, Edit2, Trash2, X } from "lucide-react";
import adminApi from "@/lib/adminApi";
import { motion, AnimatePresence } from "motion/react";
import toast from "react-hot-toast";
import InputModal from "@/components/modals/InputModal";
import ConfirmModal from "@/components/modals/ConfirmModal";

interface KanbanColumn {
  id: string;
  name: string;
  color: string;
  orderIndex: number;
}

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Kanban config state
  const [showKanbanConfig, setShowKanbanConfig] = useState(false);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [colLoading, setColLoading] = useState(false);

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) { router.push("/admin/login"); return; }
    try {
      await adminApi.get("/admin/auth/verify");
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchColumns = async () => {
    setColLoading(true);
    try {
      const { data } = await adminApi.get("/admin/kanban/columns");
      if (data.columns) {
        setColumns(data.columns.sort((a: any, b: any) => a.orderIndex - b.orderIndex));
      } else {
        setColumns([]);
      }
    } catch {
      toast.error("Failed to load columns");
    } finally {
      setColLoading(false);
    }
  };

  const handleOpenKanbanConfig = () => {
    setShowKanbanConfig(true);
    fetchColumns();
  };

  const handleAddColumn = async () => {
    const name = prompt("Enter new column name:");
    if (!name) return;
    const color = prompt("Enter color (blue, green, purple, yellow, gray):", "gray");
    if (!color) return;

    try {
      const { data } = await adminApi.post("/admin/kanban/columns", {
        name,
        color,
        orderIndex: columns.length
      });
      toast.success("Column added!");
      fetchColumns();
    } catch {
      toast.error("Failed to add column");
    }
  };

  const handleEditColumn = async (col: KanbanColumn) => {
    const name = prompt("Edit column name:", col.name);
    if (!name) return;
    const color = prompt("Edit color:", col.color);
    if (!color) return;

    try {
      await adminApi.put(`/admin/kanban/columns/${col.id}`, { name, color, orderIndex: col.orderIndex });
      toast.success("Column updated!");
      fetchColumns();
    } catch {
      toast.error("Failed to update column");
    }
  };

  const handleDeleteColumn = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the column "${name}"?`)) return;
    try {
      await adminApi.delete(`/admin/kanban/columns/${id}`);
      toast.success("Column deleted!");
      fetchColumns();
    } catch {
      toast.error("Failed to delete column");
    }
  };

  const getStatusColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-500",
      purple: "bg-purple-500",
      yellow: "bg-yellow-500",
      green: "bg-green-500",
      gray: "bg-gray-500",
    };
    return colors[color] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center w-full">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 text-black w-full overflow-y-auto flex font-sans relative p-8">
      <div className="max-w-4xl mx-auto w-full">
        <div className="flex flex-col mb-8 gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-black flex items-center gap-3">
            <Settings className="text-gray-400" size={28} /> Platform Settings
          </h1>
          <p className="text-sm text-gray-500 font-medium ml-10">Configure global platform options and operational variables</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Settings Card for Kanban */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <LayoutPanelLeft size={24} />
            </div>
            <h3 className="text-xl font-bold text-black mb-2 tracking-tight">Kanban Board</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Manage Kanban columns, reorder statuses, and customize colors for the requests workflow.
            </p>
            <button
              onClick={handleOpenKanbanConfig}
              className="w-full py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-black rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              Configure Columns
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Config Slide Panel */}
      <AnimatePresence>
        {showKanbanConfig && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col"
          >
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-black flex items-center gap-2">
                <LayoutPanelLeft size={18} className="text-blue-600" />
                Kanban Columns
              </h2>
              <button
                onClick={() => setShowKanbanConfig(false)}
                className="p-2 hover:bg-gray-200 rounded-lg text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {colLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-200 border-t-black"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {columns.map((col) => (
                    <div key={col.id} className="flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl shadow-sm hover:border-black transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full shadow-inner ${getStatusColorClass(col.color)}`} />
                        <span className="font-bold text-sm uppercase tracking-wider text-black">{col.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditColumn(col)}
                          className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteColumn(col.id, col.name)}
                          className="p-2 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {columns.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-4 font-bold uppercase">No columns found</p>
                  )}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 mt-auto">
              <button
                onClick={handleAddColumn}
                className="w-full py-4 bg-black hover:bg-zinc-800 text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Plus size={18} /> Add New Column
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay to close when clicking outside */}
      <AnimatePresence>
        {showKanbanConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowKanbanConfig(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
