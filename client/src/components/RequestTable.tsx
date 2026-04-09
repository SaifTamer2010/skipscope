import { useState } from "react";
import ViewDetailsModal from "@/components/ui/modals/viewDetailsModal";
import { Eye, Calendar, MapPin, Hash, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface Request {
  id: string;
  market: string;
  state: string;
  zipCode: string;
  ownershipCriteriaFinale: object;
  customNotes: string;
  motivations: string;
  county: string;
  rows: number;
  status: "Pending" | "Waiting Confirmation" | "Finished";
  created_at: string;
  updated_at?: string;
}

interface RequestTableProps {
  requests: Request[];
}

const statusConfig = {
  Pending: {
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-amber-500/5",
  },
  "Waiting Confirmation": {
    color: "text-brand-primary",
    bg: "bg-brand-primary/10",
    border: "border-brand-primary/20",
    glow: "shadow-brand-primary/5",
  },
  Finished: {
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/5",
  },
};

export default function RequestTable({ requests }: RequestTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto rounded-[2rem] border border-border-light bg-background-secondry/20 backdrop-blur-xl shadow-2xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-background-third/40 border-b border-border-light">
            <th className="px-8 py-5 text-left text-[10px] font-black text-text-secondry uppercase tracking-[0.2em] whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Hash size={12} className="text-brand-primary/50" />
                Index Reference
              </div>
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-text-secondry uppercase tracking-[0.2em] whitespace-nowrap">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-brand-primary/50" />
                Region
              </div>
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-text-secondry uppercase tracking-[0.2em] whitespace-nowrap">
              Volume
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-text-secondry uppercase tracking-[0.2em] whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Activity size={12} className="text-brand-primary/50" />
                Status
              </div>
            </th>
            <th className="px-8 py-5 text-left text-[10px] font-black text-text-secondry uppercase tracking-[0.2em] whitespace-nowrap">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-brand-primary/50" />
                Timestamp
              </div>
            </th>
            <th className="px-8 py-5 text-right text-[10px] font-black text-text-secondry uppercase tracking-[0.2em] whitespace-nowrap">
              Operations
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-8 py-20 text-center text-text-secondry font-medium italic"
              >
                No historical records found.
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr
                key={request.id}
                className="border-b border-border-muted transition-all duration-300 hover:bg-background-third/30 group"
              >
                <td className="px-8 py-6">
                  <span className="font-mono text-xs text-text-primary/60 bg-background-main/30 px-3 py-1 rounded-lg border border-border-muted">
                    {request.id.slice(0, 8)}
                  </span>
                </td>
                <td className="px-8 py-6 font-bold text-text-primary">
                  {request.county || "Multiple Regions"}
                </td>
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-text-primary">{(request.rows / 1000).toFixed(1)}k</span>
                    <span className="text-[10px] font-bold text-text-secondry uppercase">Records</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span
                    className={cn(
                      "inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg",
                      statusConfig[request.status].bg,
                      statusConfig[request.status].color,
                      statusConfig[request.status].border,
                      statusConfig[request.status].glow
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full mr-2", statusConfig[request.status].color.replace('text-', 'bg-'))} />
                    {request.status}
                  </span>
                </td>
                <td className="px-8 py-6 text-text-secondry/80 text-xs font-medium">
                  {formatDate(request.created_at)}
                </td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="inline-flex items-center gap-2.5 px-5 py-2 bg-brand-primary/10 hover:bg-brand-primary border border-brand-primary/20 hover:border-brand-primary rounded-xl text-brand-primary hover:text-text-button text-xs font-bold transition-all duration-300 group/btn shadow-lg shadow-brand-primary/5"
                  >
                    <Eye size={14} className="transition-transform group-hover/btn:scale-110" />
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {selectedRequest && (
        <ViewDetailsModal
          selectedRequest={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
}
