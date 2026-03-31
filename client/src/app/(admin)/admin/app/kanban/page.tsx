"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import KanbanRequestModal from "@/components/ui/modals/kanbanRequestModal";
import adminApi from "@/lib/adminApi";

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

  const handleDrop = async (targetColumnId: string) => {
    if (!draggedRequest) return;

    const sourceColumnId = draggedRequest.kanban_column_id || board[0].id; // Fallback to first column if null

    // Don't do anything if dropped in same column
    if (sourceColumnId === targetColumnId) return;

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
      // Add to target column
      if (column.id === targetColumnId) {
        return {
          ...column,
          requests: [
            ...column.requests,
            { ...draggedRequest, kanban_column_id: targetColumnId },
          ],
        };
      }
      return column;
    });

    setBoard(newBoard);
    setDraggedRequest(null); // Clear drag state immediately

    try {
      const targetColumn = board.find((c) => c.id === targetColumnId);
      const newOrder = targetColumn ? targetColumn.requests.length : 0;

      await adminApi.patch("/admin/kanban/move", {
        requestId: draggedRequest.id,
        targetColumnId,
        newOrder,
      });

      toast.success("Request moved successfully");
      // No need to fetchBoard() if successful, state is already updated
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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-400">Loading kanban board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-950 text-white w-full overflow-hidden flex flex-col">
      <div className=" max-w-full p-8  flex-1 overflow-hidden flex flex-col m-6 border-2 border-gray-800 rounded-lg">
        <div className="flex gap-6 overflow-x-auto overflow-y-hidden pb-8 flex-1 items-start max-w-full">
          {board.map((column) => (
            <div
              key={column.id}
              className="shrink-0 w-96"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* Column Header */}
              <div className="mb-4 ">
                <div className="flex items-center gap-3 mb-2 ">
                  <div
                    className={`w-3 h-3 rounded-full ${getStatusColor(column.color)}`}
                  />
                  <h2 className="font-semibold text-lg text-gray-200">
                    {column.name}
                  </h2>
                  <span className="ml-auto bg-gray-800 px-2 py-1 rounded text-sm text-gray-400">
                    {column.requests.length}
                  </span>
                </div>
              </div>

              {/* Requests */}
              <div className="space-y-3 min-h-[200px]">
                {column.requests.map((request) => (
                  <div
                    key={request.id}
                    draggable
                    onDragStart={() => handleDragStart(request)}
                    onClick={() => setSelectedRequest(request)}
                    className="bg-gray-900 border border-gray-800 rounded-lg p-4 cursor-move hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    {/* Request Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-white mb-1">
                          {request.county}
                        </h3>
                        <p className="text-xs text-gray-400">
                          {request.users.email}
                        </p>
                        {request.providers && (
                          <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            🏢 {request.providers.name}
                          </div>
                        )}
                      </div>
                      {request.admin_users && (
                        <div
                          className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-xs font-bold"
                          title={`Assigned to ${request.admin_users.display_name}`}
                        >
                          {request.admin_users.display_name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Files & Date */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span title="Admin files">
                          📁 {request.adminFileCount}
                        </span>
                        <span title="Client files">
                          📄 {request.clientFileCount}
                        </span>
                      </div>
                      <span>
                        {new Date(request.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}

                {column.requests.length === 0 && (
                  <div className="text-center py-12 text-gray-600">
                    <svg
                      className="w-12 h-12 mx-auto mb-2 opacity-50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-sm">No requests</p>
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
        />
      )}

      {/* Edit Request Modal */}
      {showEditModal && selectedRequest && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] px-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Edit Request
                </h2>
                <p className="text-gray-400">{selectedRequest.county}</p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Internal Notes (Admin Only)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Add private notes visible only to admins..."
                  value={editInternalNotes}
                  onChange={(e) => setEditInternalNotes(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Client Notes (Visible to Client)
                </label>
                <textarea
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  rows={4}
                  placeholder="Add notes that the client can see..."
                  value={editClientNotes}
                  onChange={(e) => setEditClientNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleUpdateNotes}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-medium"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-medium"
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
