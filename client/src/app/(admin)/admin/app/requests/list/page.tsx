"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import KanbanRequestModal from "@/components/ui/modals/kanbanRequestModal";
import adminApi from "@/lib/adminApi";
import { Search } from "lucide-react";

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

export default function RequestsListPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [allRequests, setAllRequests] = useState<(Request & { column_name: string, column_color: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [editClientNotes, setEditClientNotes] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    verifyAuth();
    fetchRequests();
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
      fetchRequests();

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

  const fetchRequests = async () => {
    try {
      const { data } = await adminApi.get("/admin/kanban/board");
      const board: Column[] = data.board;

      const flatRequests = board.flatMap(column =>
        column.requests.map(request => ({
          ...request,
          column_name: column.name,
          column_color: column.color
        }))
      );

      // Sort by newest first
      flatRequests.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setAllRequests(flatRequests);
    } catch (error) {
      console.error("Fetch requests error:", error);
      toast.error("Connection error");
    } finally {
      setLoading(false);
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

  const getStatusTextColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: "text-blue-500",
      purple: "text-purple-500",
      yellow: "text-yellow-500",
      green: "text-green-500",
      gray: "text-gray-500",
    };
    return colors[color] || "text-gray-500";
  };

  const filteredRequests = allRequests.filter(req => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      req.market?.toLowerCase().includes(q) ||
      req.county?.toLowerCase().includes(q) ||
      req.state?.toLowerCase().includes(q) ||
      req.users?.email?.toLowerCase().includes(q) ||
      req.id.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex flex-col items-center justify-center w-full">
        <div className="relative w-12 h-12 mb-6">
          <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Requests...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 text-black w-full overflow-hidden flex flex-col font-sans">
      <div className="max-w-full p-8 flex-1 overflow-hidden flex flex-col m-6 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">

        {/* Header and Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">All Requests LIST</h1>
            <p className="text-sm text-gray-500 mt-1">View and manage all requests in a list format</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
          <div className="min-w-[800px]">
            {/* Header */}
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">ID / Date</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client / Email</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Market / Location</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Leads & Provider</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</div>
            </div>

            {/* Body */}
            <div className="divide-y divide-gray-100">
              {filteredRequests.map((request) => (
                <div 
                  key={request.id} 
                  className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRequest(request)}
                >
                  <div>
                    <div className="font-mono text-xs font-bold text-black">{request.id.substring(0, 8)}</div>
                    <div className="text-xs text-gray-500 mt-1">{new Date(request.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-black truncate max-w-[200px]">{request.users?.email}</div>
                  </div>
                  <div>
                    <div className="font-bold text-sm text-black uppercase tracking-wide truncate max-w-[200px]">{request.market || "N/A"}</div>
                    <div className="text-xs text-gray-500 mt-1">{request.county ? `${request.county}, ${request.state}` : `${request.state}`}</div>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(request.column_color)}`} />
                      <span className={`text-xs font-bold uppercase tracking-wider ${getStatusTextColor(request.column_color)}`}>
                        {request.column_name}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex flex-col gap-1.5">
                      <span className="inline-flex items-center self-start px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-black text-white">
                        {request.rows?.toLocaleString()} Leads
                      </span>
                      {request.providers && (
                        <span className="inline-flex items-center self-start px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-black border border-gray-200">
                          🏢 {request.providers.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    {request.admin_users && (
                      <div
                        className="inline-flex w-8 h-8 bg-black rounded-full items-center justify-center text-xs font-bold text-white shadow-sm"
                        title={`Assigned to ${request.admin_users.display_name}`}
                      >
                        {request.admin_users.display_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {filteredRequests.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No requests found</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

    {/* Request Detail Modal (Simple Version) */ }
  {
    selectedRequest && (
      <KanbanRequestModal
        selectedRequest={selectedRequest}
        setSelectedRequest={setSelectedRequest}
        setShowEditModal={setShowEditModal}
        fetchBoard={fetchRequests}
        admin={admin}
      />
    )
  }

  {/* Edit Request Modal */ }
  {
    showEditModal && selectedRequest && (
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
              title="Close"
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
    )
  }
    </div >
  );
}
