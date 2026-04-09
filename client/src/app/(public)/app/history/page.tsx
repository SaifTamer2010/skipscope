"use client";

import { useEffect, useState } from "react";
import RequestTable from "@/components/RequestTable";
import api from "@/lib/api";
import toast from "react-hot-toast";
import BillingSection from "@/components/BillingSection";
import { Download, History, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import LoadingScreen from "@/src/components/LoadingScreen";

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
    return <LoadingScreen />;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-2">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-text-primary uppercase tracking-tight flex items-center gap-4">
            Request History
          </h1>
          <p className="text-text-secondry font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40" />
            Comprehensive log of your skip tracing operations and data exports.
          </p>
        </div>
        
        <button
          onClick={handleDownloadCSV}
          className="group flex items-center gap-3 px-8 py-3.5 bg-background-secondry/40 border border-border-light rounded-2xl text-text-primary font-bold hover:bg-background-secondry hover:border-brand-primary/50 transition-all duration-300 shadow-xl"
        >
          <Download size={18} className="text-brand-primary group-hover:-translate-y-0.5 transition-transform" />
          Download Data
        </button>
      </div>
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Requests */}
        <div className="relative group overflow-hidden bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2rem] p-8 transition-all duration-300 hover:border-brand-primary/30">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <History size={80} />
          </div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                <History size={20} className="text-brand-primary" />
              </div>
              <p className="text-xs font-black text-text-secondry uppercase tracking-widest">Aggregate Tasks</p>
            </div>
            <p className="text-5xl font-bold tracking-tight text-text-primary">{requests.length}</p>
          </div>
        </div>

        {/* Pending */}
        <div className="relative group overflow-hidden bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2rem] p-8 transition-all duration-300 hover:border-yellow-500/30">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Clock size={80} />
          </div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                <Clock size={20} className="text-yellow-500" />
              </div>
              <p className="text-xs font-black text-text-secondry uppercase tracking-widest">Pending Processing</p>
            </div>
            <p className="text-5xl font-bold tracking-tight text-text-primary">
              {requests.filter((r) => r.status === "Pending").length}
            </p>
          </div>
        </div>

        {/* Completed */}
        <div className="relative group overflow-hidden bg-background-secondry/40 backdrop-blur-xl border border-border-light rounded-[2rem] p-8 transition-all duration-300 hover:border-green-500/30">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <CheckCircle2 size={80} />
          </div>
          <div className="relative space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <CheckCircle2 size={20} className="text-green-500" />
              </div>
              <p className="text-xs font-black text-text-secondry uppercase tracking-widest">Enriched Assets</p>
            </div>
            <p className="text-5xl font-bold tracking-tight text-text-primary">
              {requests.filter((r) => r.status === "Finished").length}
            </p>
          </div>
        </div>
      </div>

      {/* Stripe Billing Placeholder
      <BillingSection /> */}
      {/* Request Table wrapper */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-8 px-2">
          <h2 className="text-xs font-black text-text-secondry uppercase tracking-[0.3em] flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            Detailed Record Set
          </h2>
          <div className="h-[1px] flex-1 bg-border-muted mx-8" />
        </div>
        <RequestTable requests={requests} />
      </div>
    </div>
  );
}
