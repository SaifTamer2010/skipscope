"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import KanbanRequestModal from "@/components/ui/modals/kanbanRequestModal";
import adminApi from "@/lib/adminApi";
import { motion, AnimatePresence } from "motion/react";

interface Admin {
  id: string;
  username: string;
  displayName: string;
  isSuperAdmin: boolean;
}

interface Column {
  id: string;
  name: string;
  color: string;
  orderIndex: number;
  requests: Request[];
}

interface Request {
  id: string;
  user_id: string;
  county: string;
  motivations: string;
  state: string;
  market: string;
  zipCode: string;
  ownershipCriteriaFinale: [{ key: string; value: string }];
  created_at: string;
  updated_at: string;
  rows: number;
  kanban_order: number;
  assigned_admin_id: string | null;
  internal_notes: string | null;
  client_notes: string | null;
  adminFileCount: number;
  clientFileCount: number;
  kanban_column_id: string;
  customNotes: string;
  invoice_amount?: number;
  expenses?: number;
  profit?: number;
  users: {
    email: string;
  };
  admin_users: {
    id: string;
    username: string;
    display_name: string;
  } | null;
  provider_id: string | null;
  providers: {
    id: string;
    name: string;
    price_per_lead: number;
  } | null;
}

export default function KanbanPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [board, setBoard] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedRequest, setDraggedRequest] = useState<Request | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [editClientNotes, setEditClientNotes] = useState("");

  useEffect(() => {
    verifyAuth();
    fetchBoard();
  }, []);

  useEffect(() => {
    if (selectedRequest) {
      setEditInternalNotes(selectedRequest.internal_notes || "");
      setEditClientNotes(selectedRequest.client_notes || "");
    }
  }, [selectedRequest]);

  const handleUpdateNotes = async () => {
    if (!selectedRequest) return;

    try {
      await adminApi.patch("/admin/kanban/notes", {
        requestId: selectedRequest.id,
        internalNotes: editInternalNotes,
        clientNotes: editClientNotes,
      });

      setShowEditModal(false);
      fetchBoard(); // Refresh to update local state if needed

      // Update selected request local state if it's open (though we close modal)
      setSelectedRequest({
        ...selectedRequest,
        internal_notes: editInternalNotes,
        client_notes: editClientNotes,
      });
    } catch (error) {
      console.error("Update notes error:", error);
      toast.error("Connection error");
    }
  };

  const verifyAuth = async () => {
    const token = localStorage.getItem("admin_token");
    const adminData = localStorage.getItem("admin_user");

    if (!token || !adminData) {
      router.push("/admin/login");
      return;
    }

    try {
      await adminApi.get("/admin/auth/verify");
      setAdmin(JSON.parse(adminData));
    } catch (error) {
      console.error("Auth verification error:", error);
      router.push("/admin/login");
    }
  };

  const fetchBoard = async () => {
    try {
      const { data } = await adminApi.get("/admin/kanban/board");
      setBoard(data.board);
    } catch (error) {
      console.error("Fetch board error:", error);
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (request: Request) => {
    setDraggedRequest(request);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetColumnId: string, dropIndex?: number) => {
    if (!draggedRequest) return;

    const sourceColumnId = draggedRequest.kanban_column_id || board[0].id; // Fallback to first column if null

    // Don't do anything if dropped in same position identical
    if (sourceColumnId === targetColumnId && dropIndex === undefined) return;

    // Optimistic Update
    const previousBoard = [...board];
    const newBoard = board.map((column) => {
      // Remove from source column
      if (column.id === sourceColumnId) {
        return {
          ...column,
          requests: column.requests.filter((r) => r.id !== draggedRequest.id),
        };
      }
      return { ...column, requests: [...column.requests] }; // shallow copy requests for target column safety
    });

    const targetColumnIndex = newBoard.findIndex((c) => c.id === targetColumnId);
    if (targetColumnIndex === -1) return;
    
    const targetColumn = newBoard[targetColumnIndex];
    let insertIndex = dropIndex !== undefined ? dropIndex : targetColumn.requests.length;
    
    // Safety boundaries for insertIndex
    if (insertIndex < 0) insertIndex = 0;
    if (insertIndex > targetColumn.requests.length) insertIndex = targetColumn.requests.length;

    const requestToInsert = { ...draggedRequest, kanban_column_id: targetColumnId };
    
    // Splice in the item precisely
    targetColumn.requests.splice(insertIndex, 0, requestToInsert);

    setBoard(newBoard);
    setDraggedRequest(null); // Clear drag state immediately

    try {
      let newOrderVal = 0;
      const prevTargetColumn = previousBoard.find(c => c.id === targetColumnId);
      
      if (dropIndex !== undefined && prevTargetColumn && prevTargetColumn.requests.length > 0) {
        // If placing at a specific index, take the kanban_order of the item currently sitting there.
        // If placing at the very bottom, just increment max.
        if (dropIndex < prevTargetColumn.requests.length) {
           newOrderVal = prevTargetColumn.requests[dropIndex].kanban_order;
        } else {
           const maxOrder = prevTargetColumn.requests.reduce((max, r) => Math.max(max, r.kanban_order || 0), 0);
           newOrderVal = maxOrder + 1;
        }
      } else {
        // Dropped at bottom of an empty or unindexed column
        const maxOrder = targetColumn.requests.reduce((max, r) => Math.max(max, r.kanban_order || 0), 0);
        newOrderVal = maxOrder + 1;
      }

      await adminApi.patch("/admin/kanban/move", {
        requestId: draggedRequest.id,
        targetColumnId,
        newOrder: newOrderVal,
      });

    } catch (error) {
      console.error("Move request error:", error);
      toast.error("Connection error");
      setBoard(previousBoard); // Revert on error
    }
  };

  const getStatusColor = (color: string) => {
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
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Workspace...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 text-black w-full overflow-hidden flex flex-col font-sans">
      <div className="max-w-full p-8 flex-1 overflow-hidden flex flex-col m-6 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-8 flex-1 items-stretch max-w-full h-full">
          {board.map((column) => (
            <div
              key={column.id}
              className="shrink-0 w-96 bg-gray-50/50 border border-gray-200 rounded-2xl p-5 flex flex-col h-full max-h-full"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className="mb-4 shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(column.color)}`}
                  />
                  <h2 className="font-bold text-sm uppercase tracking-wider text-black">
                    {column.name}
                  </h2>
                  <span className="ml-auto bg-white border border-gray-200 font-bold px-2 py-0.5 rounded-md text-xs text-black shadow-sm">
                    {column.requests.length}
                  </span>
                </div>
              </div>

              {/* Requests */}
              <div className="space-y-4 flex-1 overflow-y-auto min-h-[50px] px-4 -mx-4 pt-2 -mt-2 pb-10">
                <AnimatePresence>
                  {column.requests.map((request, index) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={request.id}
                      draggable
                      onDragStart={() => handleDragStart(request)}
                      onClick={() => setSelectedRequest(request)}
                      onDragEnd={() => setDraggedRequest(null)}
                      onDragOver={(e: any) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onDrop={(e: any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const y = e.clientY - rect.top;
                        const placeIndex = y < rect.height / 2 ? index : index + 1;
                        handleDrop(column.id, placeIndex);
                      }}
                      className={`bg-white border rounded-xl p-5 cursor-move transition-colors duration-200 group ${draggedRequest?.id === request.id
                        ? "shadow-2xl scale-[1.02] border-black opacity-60 z-50 relative"
                        : "border-gray-200 hover:border-black hover:shadow-md"
                        }`}
                    >
                      {/* Request Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider group-hover:text-black transition-colors line-clamp-1 break-all">
                              {request.market || "No Market"}
                            </h3>
                          </div>
                          <p className="text-xs font-medium text-gray-500 truncate mb-1">
                            {request.users?.email}
                          </p>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                              {request.rows?.toLocaleString()} Leads
                            </span>
                            
                            {request.providers && (
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-black border border-gray-200">
                                🏢 {request.providers.name}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {request.admin_users && (
                          <div
                            className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shrink-0 ml-2"
                            title={`Assigned to ${request.admin_users.display_name}`}
                          >
                            {request.admin_users.display_name
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Footer Date & ID */}
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-3 border-t border-gray-100 mt-auto">
                        <span>{new Date(request.created_at).toLocaleDateString()}</span>
                        <span className="text-gray-300 ml-auto">ID: {request.id.substring(0, 6)}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {column.requests.length === 0 && (
                  <div className="text-center py-10 bg-white border border-dashed border-gray-200 rounded-xl mt-2">
                    <svg
                      className="w-8 h-8 mx-auto mb-2 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Empty</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Request Detail Modal (Simple Version) */}
      {selectedRequest && (
        <KanbanRequestModal
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
          setShowEditModal={setShowEditModal}
          fetchBoard={fetchBoard}
          admin={admin}
        />
      )}

      {/* Edit Request Modal */}
      {showEditModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[60] px-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 border border-gray-100 shadow-2xl font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-black tracking-tight mb-1">
                  Edit Request
                </h2>
                <p className="text-sm text-gray-500 font-medium">{selectedRequest.county}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Internal Notes (Admin Only)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Add private notes visible only to admins..."
                  value={editInternalNotes}
                  onChange={(e) => setEditInternalNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-2">
                  Client Notes (Visible to Client)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Add notes that the client can see..."
                  value={editClientNotes}
                  onChange={(e) => setEditClientNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  onClick={handleUpdateNotes}
                  className="flex-1 px-4 py-4 bg-black hover:bg-zinc-800 text-white rounded-xl shadow-lg transform transition-all active:scale-[0.98] font-bold"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-8 py-4 bg-gray-100 hover:bg-gray-200 text-black rounded-xl font-bold transition-all"
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
