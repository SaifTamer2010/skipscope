"use client";

import { useEffect, useState } from "react";
import RequestTable from "@/components/RequestTable";
import api from "@/lib/api";
import toast from "react-hot-toast";
import BillingSection from "@/components/BillingSection";
import Image from "next/image";

interface Request {
  id: string;
  county: string;
  rows: number;
  status: "Pending" | "Waiting Confirmation" | "Finished";
  created_at: string;
  updated_at?: string;
}

export default function HistoryPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get("/history");
      setRequests(response.data.history);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get("/history/csv", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "request-history.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("CSV downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download CSV");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2 text-text-primary">
            Request History
          </h1>
          <p className="text-text-secondry">
            View all your past requests and payments.
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="px-6 py-3 bg-background-secondry rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
        >
          <Image
            src={"/download.svg"}
            alt={"Download"}
            height={25}
            width={25}
          />
          <span>Download CSV</span>
        </button>
      </div>
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background-secondry border border-white/10 rounded-xl p-4">
          <p className="text-text-secondry text-sm mb-1">Total Requests</p>
          <p className="text-3xl font-bold">{requests.length}</p>
        </div>
        <div className="bg-background-secondry border border-white/10 rounded-xl p-4">
          <p className="text-text-secondry text-sm mb-1">Pending</p>
          <p className="text-3xl font-bold text-yellow-400">
            {requests.filter((r) => r.status === "Pending").length}
          </p>
        </div>
        <div className="bg-background-secondry border border-white/10 rounded-xl p-4">
          <p className="text-text-secondry text-sm mb-1">Completed</p>
          <p className="text-3xl font-bold text-green-400">
            {requests.filter((r) => r.status === "Finished").length}
          </p>
        </div>
      </div>

      {/* Stripe Billing Placeholder
      <BillingSection /> */}
      {/* Request Table */}
      <RequestTable requests={requests} />
    </div>
  );
}
