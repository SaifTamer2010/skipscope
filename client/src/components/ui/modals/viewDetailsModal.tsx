import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { X, FileText, Download } from "lucide-react";
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-background-secondry border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Request Details</h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondry hover:text-white hover:bg-white/5 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : details ? (
            <>
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider ">
                    Request ID
                  </label>
                  <p className="text-white font-medium">{details.id}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Market
                  </label>
                  <p className="text-white font-medium">{details.market}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    State
                  </label>
                  <p className="text-white font-medium">
                    {details.state || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    County
                  </label>
                  <p className="text-white font-medium">{details.county}</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Zip Code
                  </label>
                  <p className="text-white font-medium">
                    {details.zipCode || "N/A"}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Rows
                  </label>
                  <p className="text-white font-medium">
                    {(details.rows / 1000).toFixed(1)}k
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                      ${statusColors[details.status as keyof typeof statusColors] || "bg-white/5 text-white border-white/10"}
                    `}
                    >
                      {details.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Date
                  </label>
                  <p className="text-white font-medium">
                    {new Date(details.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Notes Section */}
              <div className="grid grid-cols-1 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Motivation / Description
                  </label>
                  <div className="p-4 bg-background-third rounded-xl border border-white/5 text-sm text-text-secondry leading-relaxed">
                    {details.motivations}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                    Custom Ownership Criteria
                  </label>
                  <div className="p-4 bg-background-third rounded-xl border border-white/5 text-sm text-text-secondry leading-relaxed">
                    {details.ownershipCriteriaFinale.map((item) => (
                      <p>
                        {item.key}: {item.value}
                      </p>
                    ))}
                  </div>
                </div>

                {details.customNotes && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-text-secondry uppercase tracking-wider">
                      My Notes
                    </label>
                    <div className="p-4 bg-background-third rounded-xl border border-white/5 text-sm text-text-secondry leading-relaxed">
                      {details.customNotes}
                    </div>
                  </div>
                )}
              </div>

              {/* Files Section */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-lg font-medium text-white">
                  Delivered Files
                </h3>

                {!details.files || details.files.length === 0 ? (
                  <div className="text-center py-8 bg-background-third rounded-xl border border-white/5 border-dashed">
                    <div className="flex justify-center mb-3">
                      <FileText
                        className="text-text-secondry opacity-50"
                        size={32}
                      />
                    </div>
                    <p className="text-text-secondry text-sm">
                      No files uploaded yet.
                    </p>
                    <p className="text-xs text-text-secondry opacity-60 mt-1">
                      We'll notify you when your files are ready.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3">
                    {details.files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 bg-background-third rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2.5 bg-primary/10 rounded-lg text-primary">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white group-hover:text-primary transition-colors">
                              {file.file_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-text-secondry mt-0.5">
                              <span>{formatFileSize(file.file_size)}</span>
                              <span className="w-1 h-1 rounded-full bg-white/20"></span>
                              <span>
                                {new Date(
                                  file.uploaded_at,
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleDownload(file.id, file.file_name)
                          }
                          className="p-2 text-text-secondry hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Download File"
                        >
                          <Download size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center text-text-secondry py-12">
              Failed to load details.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 bg-background-secondry rounded-b-2xl">
          <button
            onClick={onClose}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewDetailsModal;
