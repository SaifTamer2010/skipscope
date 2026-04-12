"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import KanbanRequestModal from "@/components/ui/modals/kanbanRequestModal";
import adminApi from "@/lib/adminApi";
import { Clock, Activity, FileText, UserPlus, FileUp } from "lucide-react";

interface Admin {
  id: string;
  username: string;
  displayName: string;
  isSuperAdmin: boolean;
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

interface ActivityLog {
  id: string;
  created_at: string;
  action_type: string;
  action_description: string;
  metadata: any;
  request_id: string;
  admin_id: string | null;
  admin_users: {
    username: string;
    display_name: string;
  } | null;
  requests: {
    market: string;
    state: string;
    county: string;
    users: {
      email: string;
    } | null;
  } | null;
}

export default function RequestsTimelinePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const limit = 50;
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editInternalNotes, setEditInternalNotes] = useState("");
  const [editClientNotes, setEditClientNotes] = useState("");

  const handleCardClick = async (requestId: string) => {
    try {
      if (!requestId) return;
      toast.loading("Loading request details...", { id: "loading-request" });
      const { data } = await adminApi.get(`/admin/kanban/request/${requestId}`);
      setSelectedRequest(data.request);
      toast.dismiss("loading-request");
    } catch (error) {
      toast.dismiss("loading-request");
      console.error("Fetch request error:", error);
      toast.error("Failed to load request details");
    }
  };

  useEffect(() => {
    verifyAuth();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [page, startDate, endDate]);

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

  const fetchActivities = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
      });
      const { data } = await adminApi.get(`/admin/kanban/activities?${query.toString()}`);
      setActivities(data.activities);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Fetch activities error:", error);
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (actionType: string) => {
    switch (actionType) {
      case "note_added":
        return <FileText size={12} className="text-blue-500" />;
      case "status_updated":
        return <Activity size={12} className="text-purple-500" />;
      case "request_assigned":
      case "provider_assigned":
        return <UserPlus size={12} className="text-green-500" />;
      case "file_uploaded":
        return <FileUp size={12} className="text-orange-500" />;
      default:
        return <Activity size={12} className="text-gray-500" />;
    }
  };

  const getActivityColor = (actionType: string) => {
    switch (actionType) {
      case "note_added":
        return "border-blue-200 bg-blue-50 text-blue-700";
      case "status_updated":
        return "border-purple-200 bg-purple-50 text-purple-700";
      case "request_assigned":
      case "provider_assigned":
        return "border-green-200 bg-green-50 text-green-700";
      case "file_uploaded":
        return "border-orange-200 bg-orange-50 text-orange-700";
      default:
        return "border-gray-200 bg-gray-50 text-gray-700";
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 text-black w-full overflow-hidden flex flex-col font-sans">
      <div className="max-w-full p-8 flex-1 overflow-hidden flex flex-col m-6 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-black">Requests Timeline</h1>
            <p className="text-sm text-gray-500 mt-1">Chronological view of all system activities</p>
          </div>
          
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Time</label>
              <input 
                type="datetime-local" 
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">End Time</label>
              <input 
                type="datetime-local" 
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-black hover:bg-gray-100 transition-all bg-white shadow-sm"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-auto rounded-xl">
          {loading ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center w-full">
              <div className="relative w-12 h-12 mb-6">
                <div className="absolute inset-0 rounded-full border-[3px] border-gray-200"></div>
                <div className="absolute inset-0 rounded-full border-[3px] border-black border-t-transparent animate-spin"></div>
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading Timeline...</p>
            </div>
          ) : (
            <div className="relative px-4 pb-8 max-w-4xl mx-auto">
              {/* Vertical Line */}
              <div className="absolute left-[27px] top-4 bottom-0 w-0.5 bg-gray-100" />

            <div className="space-y-8">
              {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-start gap-6 group">
                  {/* Node */}
                  <div className={`relative mt-1.5 z-10 w-8 h-8 rounded-full flex items-center justify-center border transition-colors shrink-0 shadow-sm ${getActivityColor(activity.action_type)}`}>
                    {getActivityIcon(activity.action_type)}
                  </div>

                  {/* Content */}
                  <div 
                    className="flex-1 bg-white border border-gray-200 rounded-xl p-5 hover:border-black hover:shadow-md transition-all cursor-pointer"
                    onClick={() => activity.request_id && handleCardClick(activity.request_id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-bold text-black tracking-tight">{activity.action_description}</h3>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getActivityColor(activity.action_type)}`}>
                            {activity.action_type.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">
                          By: <span className="font-bold text-black">{activity.admin_users?.display_name || "System"}</span> 
                          {activity.requests && ` • Request for ${activity.requests.market || 'Unknown Market'}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">{formatDate(activity.created_at)}</span>
                      </div>
                    </div>

                    {activity.requests && (
                      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50">
                        <div className="text-xs text-gray-500 font-medium">
                           Client: <span className="font-bold text-black">{activity.requests.users?.email || 'N/A'}</span>
                        </div>
                        <div className="text-xs text-gray-500 font-medium">
                           Location: <span className="font-bold text-black">{activity.requests.county ? `${activity.requests.county}, ${activity.requests.state}` : activity.requests.state}</span>
                        </div>
                        <div className="ml-auto font-mono text-[10px] font-bold text-gray-300 uppercase">
                          REQ ID: {activity.request_id?.substring(0, 8)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="pt-8 text-center">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No activities yet</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pt-8 border-t border-gray-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-gray-500 px-4">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-bold text-black hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      </div>

      {/* Request Detail Modal (Simple Version) */}
      {selectedRequest && (
        <KanbanRequestModal
          selectedRequest={selectedRequest}
          setSelectedRequest={setSelectedRequest}
          setShowEditModal={setShowEditModal}
          fetchBoard={fetchActivities}
          admin={admin}
        />
      )}
    </div>
  );
}
