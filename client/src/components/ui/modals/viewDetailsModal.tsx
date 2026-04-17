import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import api from "@/lib/api";
import { X, FileText, Download, Hash, Zap, MapPin, Layers, DollarSign } from "lucide-react";


import toast from "react-hot-toast";

interface RequestDetails {
  id: string;
  market: string;
  state: string;
  zipCode: string;
  ownershipCriteriaFinale: [{ key: string; value: string }];
  customNotes: string;
  motivations: string;
  county: string;
  rows: number;
  status: "Pending" | "Waiting Confirmation" | "Finished";
  created_at: string;
  updated_at?: string;
  client_notes: string;
  invoice_amount?: number;

  files?: Array<{
    id: string;
    file_name: string;
    file_size: number;
    file_type: string;
    uploaded_at: string;
    notes?: string;
  }>;
}

interface ViewDetailsModalProps {
  selectedRequest: { id: string }; // We only need the ID to fetch full details
  onClose: () => void;
}

const statusColors = {
  Pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
  "Waiting Confirmation": "bg-blue-500/20 text-blue-400 border-blue-500/50",
  Finished: "bg-green-500/20 text-green-400 border-green-500/50",
};

const ViewDetailsModal = ({
  selectedRequest,
  onClose,
}: ViewDetailsModalProps) => {
  const [details, setDetails] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data } = await api.get(`/requests/${selectedRequest.id}`);
        setDetails(data.request);
        console.log(data.request);
      } catch (error) {
        console.error("Failed to fetch request details:", error);
        toast.error("Failed to load details");
      } finally {
        setLoading(false);
      }
    };

    if (selectedRequest?.id) {
      fetchDetails();
    }
  }, [selectedRequest]);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      const { data } = await api.get(`/requests/file/${fileId}`);

      // Create a temporary link to download
      const link = document.createElement("a");
      link.href = data.downloadUrl;
      link.download = fileName; // This might be overridden by the browser depending on the signed URL headers
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (typeof document === "undefined") return null;

  return createPortal(

    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background-main/40 backdrop-blur-md animate-in fade-in duration-300">
      <div
        className="w-full max-w-2xl bg-background-secondry/80 backdrop-blur-2xl border border-border-light rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-border-muted bg-background-third/20">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tight">Request Details</h2>
            <p className="text-[10px] font-bold text-text-secondry uppercase tracking-widest flex items-center gap-2">

              <span className="w-1 h-1 rounded-full bg-brand-primary" />
              Detailed operational metrics and assets
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-secondry hover:text-text-primary hover:bg-background-third rounded-xl transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-brand-primary"></div>
            </div>
          ) : details ? (
            <>
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-2 col-span-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Operation Reference
                  </label>
                  <p className="text-text-primary font-mono text-sm bg-background-main/30 px-3 py-2 rounded-xl border border-border-muted inline-block">
                    {details.id}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Target Market
                  </label>
                  <p className="text-text-primary font-bold">{details.market}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Jurisdiction
                  </label>
                  <p className="text-text-primary font-bold">
                    {details.state || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Regional Area
                  </label>
                  <p className="text-text-primary font-bold">{details.county || "Global"}</p>
                </div>

                {details.zipCode && details.zipCode !== "N/A" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                      Zip Code Filter
                    </label>
                    <p className="text-brand-primary font-bold flex items-center gap-2">
                      <Hash size={12} className="opacity-50" />
                      {details.zipCode}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Records Scoped
                  </label>
                  <p className="text-text-primary font-bold">
                    {details.rows ? (details.rows / 1000).toFixed(1) : "0"}k <span className="text-[10px] uppercase text-text-secondry font-medium">leads</span>
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Operational Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                      inline-flex items-center px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border
                      ${statusColors[details.status as keyof typeof statusColors] || "bg-white/5 text-white border-white/10"}
                    `}
                    >
                      {details.status}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Commencement Date
                  </label>
                  <p className="text-text-primary font-bold">
                    {new Date(details.created_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest opacity-60">
                    Invoice Amount
                  </label>
                  <p className="text-emerald-500 font-black text-lg flex items-center gap-1">
                    <DollarSign size={16} className="opacity-70" />
                    {details.invoice_amount ? details.invoice_amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'}
                  </p>
                </div>
              </div>


              {/* Advanced Search Section */}
              <div className="grid grid-cols-1 gap-8 pt-4">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest flex items-center gap-2">
                    <Zap size={10} className="text-brand-primary" />
                    Strategic Motivations
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {details.motivations && details.motivations !== "N/A" ? (
                      details.motivations.split(",").map((motivation: string, index: number) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/20 rounded-xl text-[10px] font-bold text-brand-primary uppercase tracking-wider"
                        >
                          {motivation.trim()}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-text-secondry italic opacity-40">No specific motivations specified</span>
                    )}
                  </div>
                </div>

                {details.ownershipCriteriaFinale && Array.isArray(details.ownershipCriteriaFinale) && details.ownershipCriteriaFinale.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest flex items-center gap-2">
                      <Layers size={10} className="text-brand-primary" />
                      Ownership Parameters
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {details.ownershipCriteriaFinale.map((item: any, idx: number) => (
                        <div key={idx} className="p-3 bg-background-main/30 rounded-xl border border-border-muted group hover:border-brand-primary/30 transition-colors">
                          <p className="text-[9px] font-black text-text-secondry uppercase tracking-tighter opacity-60 group-hover:text-brand-primary transition-colors">{item.key}</p>
                          <p className="text-xs font-bold text-text-primary truncate">{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(details.customNotes || details.client_notes) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {details.customNotes && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-text-secondry uppercase tracking-widest">Client Documentation</label>
                        <div className="p-4 bg-background-third/40 rounded-xl border border-border-muted text-xs text-text-secondry leading-relaxed">
                          {details.customNotes}
                        </div>
                      </div>
                    )}
                    {details.client_notes && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Search Report</label>
                        <div className="p-4 bg-brand-primary/5 rounded-xl border border-brand-primary/10 text-xs text-text-primary/90 leading-relaxed font-medium">
                          {details.client_notes}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Assets Section */}
              <div className="space-y-6 pt-6 border-t border-border-muted">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-text-primary uppercase tracking-widest">
                    Asset Repository
                  </h3>
                  <span className="text-[10px] font-bold text-text-secondry uppercase bg-background-third px-2 py-0.5 rounded border border-border-muted">
                    {details.files?.length || 0} Delivered
                  </span>
                </div>

                {!details.files || details.files.length === 0 ? (
                  <div className="text-center py-12 bg-background-third/20 rounded-2xl border border-border-muted border-dashed">
                    <div className="flex justify-center mb-4 text-text-secondry opacity-20">
                      <FileText size={48} strokeWidth={1} />
                    </div>
                    <p className="text-xs font-bold text-text-secondry uppercase tracking-widest">
                      Processing Data Payload
                    </p>
                    <p className="text-[10px] text-text-secondry opacity-60 mt-2 px-12">
                      Our system is currently finalizing your skip tracing assets. You will receive a secure alert when the data is ready for retrieval.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {details.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-background-third/40 rounded-2xl border border-border-muted hover:border-brand-primary/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-brand-primary/10 rounded-xl text-brand-primary group-hover:scale-110 transition-transform">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary truncate max-w-[200px] md:max-w-xs">
                              {file.file_name}
                            </p>
                            <div className="flex items-center gap-3 text-[10px] font-bold text-text-secondry uppercase tracking-tighter mt-1">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span className="w-1 h-1 rounded-full bg-border-light"></span>
                              <span>
                                {new Date(file.uploaded_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(file.id, file.file_name)}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-brand-primary-strong text-text-button text-xs font-bold rounded-xl transition-all shadow-lg shadow-brand-primary/20"
                        >
                          <Download size={14} />
                          Retrieve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-text-secondry py-20 font-bold uppercase tracking-widest opacity-40">
              Terminal Error: No Data Found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border-muted bg-background-third/20">
          <button
            onClick={onClose}
            className="w-full py-4 bg-background-third hover:bg-background-main text-text-primary text-xs font-black uppercase tracking-[0.3em] rounded-2xl border border-border-light transition-all shadow-xl"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};


export default ViewDetailsModal;
