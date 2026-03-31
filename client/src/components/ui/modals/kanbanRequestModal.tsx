"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

interface FilesState {
  adminFiles: any[];
  clientFiles: any[];
}

interface Provider {
  name: string;
  price_per_lead: number;
}

const KanbanRequestModal = ({
  setSelectedRequest,
  selectedRequest,
  setShowEditModal,
  fetchBoard,
}: {
  setSelectedRequest: (request: any) => void;
  selectedRequest: any;
  setShowEditModal: (show: boolean) => void;
  fetchBoard: () => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [isAssigningProvider, setIsAssigningProvider] = useState(false);
  const [isSavingFinancials, setIsSavingFinancials] = useState(false);
  const [files, setFiles] = useState<FilesState>({
    adminFiles: [],
    clientFiles: [],
  });
  const [currentProvider, setCurrentProvider] = useState<Provider>({ name: "", price_per_lead: 0 });
  const [invoiceAmount, setInvoiceAmount] = useState<number>(selectedRequest?.invoice_amount || 0);

  useEffect(() => {
    if (selectedRequest) {
      fetchFiles(selectedRequest.id);
      fetchProviders();
      if (selectedRequest.providers) {
        setCurrentProvider(selectedRequest.providers);
      } else {
        setCurrentProvider({ name: "", price_per_lead: 0 });
      }
      setInvoiceAmount(selectedRequest.invoice_amount || 0);
    }
  }, [selectedRequest]);

  const fetchFiles = async (requestId: string) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/files/request/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      if (res.ok) {
        setFiles(data);
      }
    } catch (error) {
      console.error("Fetch files error:", error);
    }
  };

  const fetchProviders = async () => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(`http://localhost:5000/api/admin/providers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setProviders(data.providers || []);
      }
    } catch (error) {
      console.error("Fetch providers error:", error);
    }
  };

  const handleAssignProvider = async (providerId: string) => {
    if (!selectedRequest) return;
    setIsAssigningProvider(true);
    const token = localStorage.getItem("admin_token");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/kanban/assign-provider`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            providerId: providerId === "none" ? null : providerId,
          }),
        },
      );

      if (res.ok) {
        toast.success("Provider assigned successfully");
        fetchBoard();
        // Update local state optimistically
        const assignedProvider = providers.find((p) => p.id === providerId);
        setCurrentProvider(assignedProvider || { name: "", price_per_lead: 0 });
        setSelectedRequest({
          ...selectedRequest,
          provider_id: providerId === "none" ? null : providerId,
          providers: assignedProvider || null,
        });
      } else {
        toast.error("Failed to assign provider");
      }
    } catch (error) {
      console.error("Assign provider error:", error);
      toast.error("Connection error");
    } finally {
      setIsAssigningProvider(false);
    }
  };

  const handleSaveFinancials = async () => {
    if (!selectedRequest) return;
    setIsSavingFinancials(true);
    const token = localStorage.getItem("admin_token");
    
    const expense = currentProvider.price_per_lead * selectedRequest.rows;
    const currentProfit = invoiceAmount - expense;

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/kanban/financials`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            requestId: selectedRequest.id,
            invoiceAmount: invoiceAmount,
            expenses: expense,
            profit: currentProfit,
          }),
        },
      );

      if (res.ok) {
        toast.success("Financials saved successfully");
        fetchBoard();
        // Update local state so it doesn't revert
        setSelectedRequest({
          ...selectedRequest,
          invoice_amount: invoiceAmount,
          expenses: expense,
          profit: currentProfit
        });
      } else {
        toast.error("Failed to save financials");
      }
    } catch (error) {
      console.error("Save financials error:", error);
      toast.error("Connection error");
    } finally {
      setIsSavingFinancials(false);
    }
  };

  const handleFileUpload = async (file: File, type: "admin" | "client") => {
    if (!selectedRequest) return;

    // 1. Validate File Type
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    // Also check extension as fallback
    const validExtensions = [".csv", ".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      !validTypes.includes(file.type) &&
      !validExtensions.includes(fileExtension)
    ) {
      toast.error("Invalid file type. Please upload Excel or CSV files.");
      return;
    }

    setIsUploading(true);
    const token = localStorage.getItem("admin_token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("requestId", selectedRequest.id);

    const endpoint =
      type === "admin"
        ? "http://localhost:5000/api/admin/files/upload-admin"
        : "http://localhost:5000/api/admin/files/upload-client";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(
          `${type === "admin" ? "Admin" : "Client"} file uploaded successfully!`,
        );
        fetchFiles(selectedRequest.id);
        fetchBoard(); // Refresh file counts
      } else {
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Connection error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFile = async (
    fileId: string,
    type: "admin" | "client",
  ) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/files/download/${fileId}/${type}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();

      if (res.ok && data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Connection error");
    }
  };

  const handleDeleteFile = async (fileId: string, type: "admin" | "client") => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/files/${fileId}/${type}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.ok) {
        toast.success("File deleted successfully");
        if (selectedRequest) {
          fetchFiles(selectedRequest.id);
          fetchBoard(); // Refresh file counts
        }
      } else {
        toast.error("Failed to delete file");
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Connection error");
    }
  };

  const handleToggleVisibility = async (
    fileId: string,
    currentVisibility: boolean,
  ) => {
    const token = localStorage.getItem("admin_token");
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/files/visibility/${fileId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isVisibleToClient: !currentVisibility }),
        },
      );

      if (res.ok) {
        toast.success(
          `File is now ${!currentVisibility ? "visible" : "hidden"} to client`,
        );
        if (selectedRequest) fetchFiles(selectedRequest.id);
      } else {
        toast.error("Failed to update visibility");
      }
    } catch (error) {
      console.error("Visibility toggle error:", error);
      toast.error("Connection error");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={() => setSelectedRequest(null)}
    >
      <div
        className="bg-gray-900 rounded-xl max-w-300 w-full max-h-[90vh] overflow-y-auto p-6 [scrollbar-width:none]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {selectedRequest.id}
            </h2>
          </div>
          <button
            onClick={() => setSelectedRequest(null)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400">Username:</label>
            <p className="text-white">{selectedRequest.username}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Email:</label>
            <p className="text-white">{selectedRequest.users.email}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Market:</label>
            <p className="text-white">{selectedRequest.market}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">State:</label>
            <p className="text-white">{selectedRequest.state}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Zip Code(s):</label>
            <p className="text-white">{selectedRequest.zipCode}</p>
          </div>

          <div>
            <label className="text-sm text-gray-400">
              Ownerships Criterias:
            </label>
            {selectedRequest.ownershipCriteriaFinale?.map(
              (item: { key: string; value: string }, idx: number) => (
                <p key={item.key || idx}>
                  {item.key}: {item.value}
                </p>
              ),
            )}
          </div>

          <div>
            <label className="text-sm text-gray-400">User Email:</label>
            <p className="text-white">{selectedRequest.users.email}</p>
          </div>
          <div className="flex gap-16">
            <div>
              <label className="text-sm text-gray-400">Leads Ordered:</label>
              <p className="text-white">{selectedRequest.rows / 1000}k</p>
            </div>

            <div>

              <p className="text-red-600 mt-6">-{currentProvider.price_per_lead * selectedRequest.rows}$</p>
            </div>

          </div>
          <div>
            <label className="text-sm text-gray-400">Motivations:</label>
            <p className="text-white">{selectedRequest.motivations}</p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Created</label>
            <p className="text-white">
              {new Date(selectedRequest.created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-400">Notes</label>
            <p className="text-white">{selectedRequest.customNotes}</p>
          </div>
          <div className="w-full h-2  border-slate-700 border-b"></div>
          <h1 className="text-2xl font-bold text-white mb-2">Sell Status</h1>
          {/* Provider Assignment */}
          <div className="bg-gray-800/50 p-4 rounded-lg mt-4 border border-gray-700">
            <label className="text-sm text-gray-300 font-medium mb-2 block">
              Assigned Provider
            </label>
            <select
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
              value={selectedRequest.provider_id || "none"}
              onChange={(e) => handleAssignProvider(e.target.value)}
              disabled={isAssigningProvider}
            >
              <option value="none">-- Select a Provider --</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} (${Number(provider.price_per_lead).toString()}/lead)
                </option>
              ))}
            </select>
          </div>
          {/* Invoice and Profit Calculator */}
          <div className="bg-gray-800/50 p-4 rounded-lg mt-4 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4">Financials & Profit</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Invoice Amount ($)</label>
                <input
                  type="number"
                  step="any"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-500"
                  value={invoiceAmount || ""}
                  onChange={(e) => setInvoiceAmount(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Total Expenses</label>
                <p className="text-red-400 font-mono text-lg bg-gray-900 border border-gray-700 rounded-lg px-3 py-2">
                  ${(currentProvider.price_per_lead * selectedRequest.rows).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-400 block mb-2">Estimated Profit</label>
                {(() => {
                  const expense = currentProvider.price_per_lead * selectedRequest.rows;
                  const profit = invoiceAmount - expense;
                  const isProfit = profit >= 0;
                  return (
                    <div className={`font-mono text-lg font-bold bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                    </div>
                  );
                })()}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveFinancials}
                disabled={isSavingFinancials}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg text-white font-medium transition-colors flex items-center gap-2"
              >
                {isSavingFinancials ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  "Save Financials"
                )}
              </button>
            </div>
          </div>
          <div
            className="bg-gray-900 rounded-xl w-full p-6 border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h2 className="text-2xl font-bold text-white mb-2">
                File Management
              </h2>
              {isUploading && (
                <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                  <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                  Uploading...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Admin Files Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                  Admin Files (Internal Only)
                </h3>

                {/* Upload Area */}
                <label
                  className="block mb-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file, "admin");
                  }}
                >
                  <div className="border-2 border-dashed border-purple-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/5 transition-all">
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "admin");
                        e.target.value = "";
                      }}
                    />
                    <div className="text-purple-400 mb-2">📁</div>
                    <p className="text-sm text-gray-300 mb-1">
                      Click or Drag to upload admin file
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX</p>
                  </div>
                </label>

                {/* Downloaded Files */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Admin Files ({files?.adminFiles?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files?.adminFiles?.length > 0 ? (
                      files.adminFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              📄 {file.file_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() =>
                                handleDownloadFile(file.id, "admin")
                              }
                              className="px-3 py-1rounded text-xs transition-colors"
                              title="Download"
                            >
                              <Image
                                src={"/download.svg"}
                                width={25}
                                height={25}
                                alt={"download"}
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id, "admin")}
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                              title="Delete"
                            >
                              <Image
                                src={"/delete.svg"}
                                width={25}
                                height={25}
                                alt={"download"}
                              />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4 text-sm">
                        No admin files yet
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Client Files Section */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                  Client Files (Visible to Client)
                </h3>

                {/* Upload Area */}
                <label
                  className="block mb-4"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileUpload(file, "client");
                  }}
                >
                  <div className="border-2 border-dashed border-blue-500/50 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all">
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "client");
                        e.target.value = "";
                      }}
                    />
                    <div className="text-blue-400 mb-2">📄</div>
                    <p className="text-sm text-gray-300 mb-1">
                      Click or Drag to upload client file
                    </p>
                    <p className="text-xs text-gray-500">CSV, XLSX</p>
                  </div>
                </label>

                {/* Downloaded Files */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Client Files ({files?.clientFiles?.length || 0})
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {files?.clientFiles?.length > 0 ? (
                      files.clientFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between bg-gray-700 p-3 rounded-lg"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-white truncate">
                              📄 {file.file_name}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-2">
                              {new Date(file.uploaded_at).toLocaleDateString()}
                              <span
                                className={`inline-flex items-center gap-1 ${file.is_visible_to_client ? "text-green-400" : "text-gray-500"}`}
                              >
                                •{" "}
                                {file.is_visible_to_client
                                  ? "✅ Visible"
                                  : "❌ Hidden"}
                              </span>
                            </p>
                          </div>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() =>
                                handleToggleVisibility(
                                  file.id,
                                  file.is_visible_to_client,
                                )
                              }
                              className={`px-3 py-1 rounded text-xs transition-colors ${file.is_visible_to_client ? "bg-gray-600 hover:bg-gray-500" : "bg-green-600 hover:bg-green-700"}`}
                              title={
                                file.is_visible_to_client
                                  ? "Hide from client"
                                  : "Show to client"
                              }
                            >
                              {file.is_visible_to_client ? "👁️‍🗨️" : "👁️"}
                            </button>
                            <button
                              onClick={() =>
                                handleDownloadFile(file.id, "client")
                              }
                              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs transition-colors"
                              title="Download"
                            >
                              ⬇
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteFile(file.id, "client")
                              }
                              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs transition-colors"
                              title="Delete"
                            >
                              🗑
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-gray-500 py-4 text-sm">
                        No client files yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {selectedRequest.internal_notes && (
          <div>
            <label className="text-sm text-gray-400">Internal Notes</label>
            <p className="text-white bg-gray-800 p-3 rounded">
              {selectedRequest.internal_notes}
            </p>
          </div>
        )}

        {selectedRequest.client_notes && (
          <div>
            <label className="text-sm text-gray-400">Client Notes</label>
            <p className="text-white bg-gray-800 p-3 rounded">
              {selectedRequest.client_notes}
            </p>
          </div>
        )}

        <div className="flex gap-2 pt-4">
          <button
            onClick={() => {
              setShowEditModal(true);
            }}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
          >
            Edit Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanRequestModal;
