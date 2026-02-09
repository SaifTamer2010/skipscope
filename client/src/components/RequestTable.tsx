"use client";

import { useState } from "react";
import ViewDetailsModal from "@/components/ui/modals/viewDetailsModal";

interface Request {
  id: string;
  county: string;
  rows: number;
  status: "Pending" | "Waiting Confirmation" | "Finished";
  created_at: string;
  updated_at?: string;
}

interface RequestTableProps {
  requests: Request[];
}

const statusColors = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  "Waiting Confirmation": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  Finished: "bg-green-500/20 text-green-400 border-green-500/50",
};

const rowAccents = {
  Pending: "border-l-4 border-l-yellow-500 hover:bg-yellow-500/5",
  "Waiting Confirmation": "border-l-4 border-l-blue-500 hover:bg-blue-500/5",
  Finished: "border-l-4 border-l-green-500 hover:bg-green-500/5",
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
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-background-third border-b border-white/10">
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Request ID
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              County
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Rows</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Status
            </th>
            <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-6 py-12 text-center text-text-secondry"
              >
                No requests found
              </td>
            </tr>
          ) : (
            requests.map((request) => (
              <tr
                key={request.id}
                className={`border-b border-white/10 transition-colors ${rowAccents[request.status]}`}
              >
                <td className="px-6 py-4">
                  <span className="font-mono text-sm text-text-secondry">
                    {request.id.slice(0, 8)}...
                  </span>
                </td>
                <td className="px-6 py-4 font-medium">{request.county}</td>
                <td className="px-6 py-4 text-text-secondry">
                  {(request.rows / 1000).toFixed(1)}k
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                      ${statusColors[request.status]}
                    `}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-text-secondry text-sm">
                  {formatDate(request.created_at)}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => setSelectedRequest(request)}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 rounded-lg text-sm transition-colors"
                  >
                    View Details
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
