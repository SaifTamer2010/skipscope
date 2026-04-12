"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import adminApi from "@/lib/adminApi";

interface FilesState {
  adminFiles: any[];
  clientFiles: any[];
}

interface Provider {
  id: string | null;
  name: string;
  price_per_lead: number;
}

interface Column {
  id: string;
  name: string;
}

const KanbanRequestModal = ({
  setSelectedRequest,
  selectedRequest,
  setShowEditModal,
  fetchBoard,
  admin,
}: {
  setSelectedRequest: (request: any) => void;
  selectedRequest: any;
  setShowEditModal: (show: boolean) => void;
  fetchBoard: () => void;
  admin: any;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHardDeleting, setIsHardDeleting] = useState(false);
  const [providers, setProviders] = useState<any[]>([]);
  const [isAssigningProvider, setIsAssigningProvider] = useState(false);
  const [isSavingFinancials, setIsSavingFinancials] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isMovingColumn, setIsMovingColumn] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);
  const [files, setFiles] = useState<FilesState>({
    adminFiles: [],
    clientFiles: [],
  });
  const [currentProvider, setCurrentProvider] = useState<Provider>({ id: null, name: "", price_per_lead: 0 });
  const [invoiceAmount, setInvoiceAmount] = useState<number>(selectedRequest?.invoice_amount || 0);

  useEffect(() => {
    if (selectedRequest) {
      fetchFiles(selectedRequest.id);
      fetchProviders();
      fetchColumns();
      if (selectedRequest.providers) {
        setCurrentProvider(selectedRequest.providers);
      } else {
        setCurrentProvider({ id: null, name: "", price_per_lead: 0 });
      }
      setInvoiceAmount(selectedRequest.invoice_amount || 0);
    }

    // Add Escape key listener
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedRequest(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRequest]);

  const fetchColumns = async () => {
    try {
      const { data } = await adminApi.get(`/admin/kanban/columns`);
      setColumns(data.columns || []);
    } catch (error) {
      console.error("Fetch columns error:", error);
    }
  };


  const fetchFiles = async (requestId: string) => {
    try {
      const { data } = await adminApi.get(`/admin/files/request/${requestId}`);
      setFiles(data);
    } catch (error) {
      console.error("Fetch files error:", error);
    }
  };

  const fetchProviders = async () => {
    try {
      const { data } = await adminApi.get(`/admin/providers`);
      setProviders(data.providers || []);
    } catch (error) {
      console.error("Fetch providers error:", error);
    }
  };

  const handleAssignProvider = async (providerId: string) => {
    if (!selectedRequest) return;
    setIsAssigningProvider(true);

    try {
      await adminApi.patch(`/admin/kanban/assign-provider`, {
        requestId: selectedRequest.id,
        providerId: providerId === "none" ? null : providerId,
      });

      toast.success("Provider assigned successfully");
      fetchBoard();
      // Update local state optimistically
      const assignedProvider = providers.find((p: any) => p.id === providerId);
      setCurrentProvider(assignedProvider || { id: null, name: "", price_per_lead: 0 });
      setSelectedRequest({
        ...selectedRequest,
        provider_id: providerId === "none" ? null : providerId,
        providers: assignedProvider || null,
      });
    } catch (error) {
      console.error("Assign provider error:", error);
      toast.error("Failed to assign provider");
    } finally {
      setIsAssigningProvider(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedRequest) return;
    setIsUpdatingStatus(true);

    try {
      await adminApi.patch(`/admin/kanban/status`, {
        requestId: selectedRequest.id,
        status: newStatus,
      });

      toast.success("Status updated successfully");
      fetchBoard();
      setSelectedRequest({
        ...selectedRequest,
        status: newStatus,
      });
    } catch (error: any) {
      console.error("Update status error:", error);
      const errorMsg = error.response?.data?.error || "Failed to update status";
      toast.error(errorMsg);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handlePaymentUpdate = async (paymentCompleted: boolean) => {
    if (!selectedRequest) return;
    setIsUpdatingPayment(true);

    try {
      await adminApi.patch(`/admin/kanban/payment-status`, {
        requestId: selectedRequest.id,
        paymentCompleted,
      });

      toast.success("Payment status updated successfully");
      fetchBoard();
      setSelectedRequest({
        ...selectedRequest,
        payment_completed: paymentCompleted,
      });
    } catch (error: any) {
      console.error("Update payment error:", error);
      toast.error(error.response?.data?.error || "Failed to update payment status");
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleMoveColumn = async (targetColumnId: string) => {
    if (!selectedRequest) return;
    if (selectedRequest.kanban_column_id === targetColumnId) return;

    setIsMovingColumn(true);

    try {
      await adminApi.patch(`/admin/kanban/move`, {
        requestId: selectedRequest.id,
        targetColumnId,
        newOrder: 0, // Simplified for modal move
      });

      toast.success("Column updated successfully");
      fetchBoard();
      setSelectedRequest({
        ...selectedRequest,
        kanban_column_id: targetColumnId,
      });
    } catch (error) {
      console.error("Move column error:", error);
      toast.error("Failed to move column");
    } finally {
      setIsMovingColumn(false);
    }
  };

  const handleSaveFinancials = async () => {
    if (!selectedRequest) return;
    setIsSavingFinancials(true);

    const expense = currentProvider.price_per_lead * selectedRequest.rows;
    const currentProfit = invoiceAmount - expense;

    try {
      await adminApi.patch(`/admin/kanban/financials`, {
        requestId: selectedRequest.id,
        invoiceAmount: invoiceAmount,
        expenses: expense,
        profit: currentProfit,
      });

      toast.success("Financials saved successfully");
      fetchBoard();
      // Update local state so it doesn't revert
      setSelectedRequest({
        ...selectedRequest,
        invoice_amount: invoiceAmount,
        expenses: expense,
        profit: currentProfit
      });
    } catch (error) {
      console.error("Save financials error:", error);
      toast.error("Failed to save financials");
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("requestId", selectedRequest.id);

    const endpoint =
      type === "admin"
        ? "/admin/files/upload-admin"
        : "/admin/files/upload-client";

    try {
      const { data } = await adminApi.post(endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        `${type === "admin" ? "Admin" : "Client"} file uploaded successfully!`,
      );
      fetchFiles(selectedRequest.id);
      fetchBoard(); // Refresh file counts
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.error || "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadFile = async (
    fileId: string,
    type: "admin" | "client",
  ) => {
    try {
      const { data } = await adminApi.get(`/admin/files/download/${fileId}/${type}`);

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        toast.error("Failed to get download URL");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to get download URL");
    }
  };

  const handleDeleteFile = async (fileId: string, type: "admin" | "client") => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      await adminApi.delete(`/admin/files/${fileId}/${type}`);
      toast.success("File deleted successfully");
      if (selectedRequest) {
        fetchFiles(selectedRequest.id);
        fetchBoard(); // Refresh file counts
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete file");
    }
  };

  const handleToggleVisibility = async (
    fileId: string,
    currentVisibility: boolean,
  ) => {
    try {
      await adminApi.patch(`/admin/files/visibility/${fileId}`, {
        isVisibleToClient: !currentVisibility,
      });

      toast.success(
        `File is now ${!currentVisibility ? "visible" : "hidden"} to client`,
      );
      if (selectedRequest) fetchFiles(selectedRequest.id);
    } catch (error) {
      console.error("Visibility toggle error:", error);
      toast.error("Failed to update visibility");
    }
  };

  const handleSoftDelete = async () => {
    if (!selectedRequest || !columns.length) return;

    const deletedColumn = columns.find(c => c.name.toLowerCase() === "deleted");
    if (!deletedColumn) {
      toast.error("No 'Deleted' column found. Please contact an admin to create one.");
      return;
    }

    if (!confirm("Are you sure you want to move this request to the Deleted column?")) return;

    setIsDeleting(true);
    try {
      await adminApi.patch(`/admin/kanban/move`, {
        requestId: selectedRequest.id,
        targetColumnId: deletedColumn.id,
        newOrder: 0,
      });

      toast.success("Request moved to Deleted");
      fetchBoard();
      setSelectedRequest(null); // Close modal
    } catch (error) {
      console.error("Soft delete error:", error);
      toast.error("Failed to move request to Deleted");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHardDelete = async () => {
    if (!selectedRequest) return;

    if (!confirm("⚠️ WARNING: This will PERMANENTLY delete this request and all associated files/logs. This action cannot be undone. Are you absolutely sure?")) return;

    setIsHardDeleting(true);
    try {
      await adminApi.delete(`/admin/kanban/request/${selectedRequest.id}`);

      toast.success("Request permanently deleted");
      fetchBoard();
      setSelectedRequest(null); // Close modal
    } catch (error) {
      console.error("Hard delete error:", error);
      toast.error("Failed to permanently delete request");
    } finally {
      setIsHardDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[70] px-4"
      onClick={() => setSelectedRequest(null)}
    >
      <div
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-2xl font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-8 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-black tracking-tight mb-1">
              Req #{selectedRequest.id?.slice(0, 8)}... - {selectedRequest.county}
            </h2>
            <p className="text-sm text-gray-500 font-medium">{selectedRequest.id}</p>
          </div>
          <button
            onClick={() => setSelectedRequest(null)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-black transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">County:</label>
            <p className="text-black font-medium">{selectedRequest.county || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">State:</label>
            <p className="text-black font-medium">{selectedRequest.state || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Market:</label>
            <p className="text-black font-medium">{selectedRequest.market || "N/A"}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zip Code(s):</label>
            <p className="text-black font-medium">{selectedRequest.zipCode || "All"}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Email:</label>
            <p className="text-black font-medium">{selectedRequest.users?.email}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned Admin:</label>
            <p className="text-black font-medium">{selectedRequest.admin_users?.display_name || "Unassigned"}</p>
          </div>

          <div className="col-span-full bg-gray-50 p-4 rounded-xl border border-gray-100">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
              Ownership Criterias:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {selectedRequest.ownershipCriteriaFinale?.map(
                (item: { key: string; value: string }, idx: number) => (
                  <p key={item.key || idx} className="text-sm text-gray-800">
                    <span className="font-semibold text-black">{item.key}:</span> {item.value}
                  </p>
                )
              )}
            </div>
          </div>

          <div className="flex gap-16 col-span-full">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Leads Ordered:</label>
              <p className="text-black font-bold text-lg">{(selectedRequest.rows / 1000).toFixed(1)}k</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Cost Estimate:</label>
              <p className="text-red-600 font-bold text-lg">-${(currentProvider.price_per_lead * selectedRequest.rows).toFixed(2)}</p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Created At:</label>
              <p className="text-black font-medium">
                {new Date(selectedRequest.created_at).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="col-span-full">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Motivations:</label>
            <p className="text-black">{selectedRequest.motivations || "None"}</p>
          </div>
          <div className="col-span-full">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Client Notes:</label>
            <p className="text-black bg-gray-50 p-3 rounded-lg border border-gray-100 mt-1">{selectedRequest.customNotes || "No extra notes"}</p>
          </div>
        </div>
        <div className="w-full h-px bg-gray-200 my-8"></div>

        <h3 className="text-xl font-bold text-black mb-4">Workflow & Status</h3>

        {/* Status Area Container */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Request Status
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-black font-medium focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 transition-shadow"
              value={selectedRequest.status || "Pending"}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              disabled={isUpdatingStatus}
            >
              <option value="Pending">Pending</option>
              <option value="Waiting Confirmation">Waiting Confirmation</option>
              <option value="Finished">Finished</option>
            </select>
          </div>

          {/* Provider Assignment */}
          <div className="flex-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Assigned Provider (Sell Status)
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-black font-medium focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 transition-shadow"
              value={selectedRequest.provider_id || "none"}
              onChange={(e) => handleAssignProvider(e.target.value)}
              disabled={isAssigningProvider}
            >
              <option value="none">-- Select a Provider --</option>
              {providers.map((provider: any) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name} (${Number(provider.price_per_lead).toString()}/lead)
                </option>
              ))}
            </select>
          </div>
        </div>

          {/* Payment Status */}
          <div className="border-t border-gray-200/60 pt-6 flex flex-col">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
              Payment Status
            </label>
            <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-lg px-4 py-2.5">
              <input
                type="checkbox"
                id="paymentCompleteCheckbox"
                className="w-5 h-5 rounded border-gray-300 text-black focus:ring-black transition-colors"
                checked={!!selectedRequest.payment_completed}
                onChange={(e) => handlePaymentUpdate(e.target.checked)}
                disabled={isUpdatingPayment}
              />
              <label htmlFor="paymentCompleteCheckbox" className="text-sm font-bold text-black cursor-pointer select-none">
                Payment Completed
              </label>
              {isUpdatingPayment && <span className="w-4 h-4 rounded-full border-2 border-gray-200 border-t-black animate-spin ml-auto"></span>}
            </div>
          </div>
        </div>
        {/* Invoice and Profit Calculator */}
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
          <h3 className="text-lg font-bold text-black mb-4">Financials & Profit</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Invoice Amount ($)</label>
              <input
                type="number"
                step="any"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-black font-medium focus:outline-none focus:ring-2 focus:ring-black transition-shadow"
                value={invoiceAmount || ""}
                onChange={(e) => setInvoiceAmount(parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Total Expenses</label>
              <p className="text-red-600 font-mono text-lg font-bold bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
                ${(currentProvider.price_per_lead * selectedRequest.rows).toFixed(2)}
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Estimated Profit</label>
              {(() => {
                const expense = currentProvider.price_per_lead * selectedRequest.rows;
                const profit = invoiceAmount - expense;
                const isProfit = profit >= 0;
                return (
                  <div className={`font-mono text-lg font-bold bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isProfit ? '+' : '-'}${Math.abs(profit).toFixed(2)}
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveFinancials}
              disabled={isSavingFinancials}
              className="px-6 py-2.5 bg-black hover:bg-zinc-800 disabled:bg-gray-300 disabled:text-gray-500 rounded-lg text-white font-bold transition-all flex items-center gap-2"
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
          className="bg-white rounded-2xl w-full p-6 border border-gray-200"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-bold text-black border-b border-gray-100 pb-2 w-full flex justify-between">
              File Management
              {isUploading && (
                <div className="flex items-center gap-2 text-black animate-pulse text-sm font-medium">
                  <span className="w-2 h-2 bg-black rounded-full"></span>
                  Uploading...
                </div>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Admin Files Section */}
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full"></span>
                Admin Files (Internal)
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
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-black hover:bg-gray-50 transition-all">
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
                  <div className="text-black mb-2 text-2xl">📁</div>
                  <p className="text-sm font-medium text-black mb-1">
                    Click or Drag to upload admin file
                  </p>
                  <p className="text-xs text-gray-500">CSV, XLSX</p>
                </div>
              </label>

              {/* Downloaded Files */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Admin Files ({files?.adminFiles?.length || 0})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files?.adminFiles?.length > 0 ? (
                    files.adminFiles.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-black truncate">
                            📄 {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleDownloadFile(file.id, "admin")
                            }
                            className="p-1.5 hover:bg-gray-100 rounded text-black transition-colors"
                            title="Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" /><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" /></svg>
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id, "admin")}
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-xs font-bold uppercase tracking-wider">
                      No admin files yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Client Files Section */}
            <div>
              <h3 className="text-sm font-bold text-black uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
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
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
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
                  <div className="text-blue-500 mb-2 text-2xl">📄</div>
                  <p className="text-sm font-medium text-black mb-1">
                    Click or Drag to upload client file
                  </p>
                  <p className="text-xs text-gray-500">CSV, XLSX</p>
                </div>
              </label>

              {/* Downloaded Files */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Client Files ({files?.clientFiles?.length || 0})
                </h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files?.clientFiles?.length > 0 ? (
                    files.clientFiles.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between bg-white border border-gray-200 p-3 rounded-lg shadow-sm"
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-black truncate">
                            📄 {file.file_name}
                          </p>
                          <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-1">
                            {new Date(file.uploaded_at).toLocaleDateString()}
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${file.is_visible_to_client ? "text-emerald-500" : "text-gray-400"}`}
                            >
                              •{" "}
                              {file.is_visible_to_client
                                ? "✅ Visible"
                                : "❌ Hidden"}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleToggleVisibility(
                                file.id,
                                file.is_visible_to_client,
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${file.is_visible_to_client ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                            title={
                              file.is_visible_to_client
                                ? "Hide from client"
                                : "Show to client"
                            }
                          >
                            {file.is_visible_to_client ? "Hide" : "Show"}
                          </button>
                          <button
                            onClick={() =>
                              handleDownloadFile(file.id, "client")
                            }
                            className="p-1.5 hover:bg-gray-100 rounded text-black transition-colors"
                            title="Download"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z" /><path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z" /></svg>
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteFile(file.id, "client")
                            }
                            className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                            title="Delete"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" /><path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" /></svg>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-xs font-bold uppercase tracking-wider">
                      No client files yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {selectedRequest.internal_notes && (
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Internal Notes (Admin Only)</label>
            <p className="text-black font-medium leading-relaxed">
              {selectedRequest.internal_notes}
            </p>
          </div>
        )}

        {selectedRequest.client_notes && (
          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Client Notes</label>
            <p className="text-black font-medium leading-relaxed">
              {selectedRequest.client_notes}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-gray-100">
          <button
            onClick={() => {
              setShowEditModal(true);
            }}
            className="flex-1 px-6 py-3 bg-black hover:bg-zinc-800 text-white rounded-xl shadow-lg transition-all font-bold"
          >
            Edit Request Notes
          </button>
          <button
            onClick={handleSoftDelete}
            disabled={isDeleting || isHardDeleting}
            className="flex-1 px-6 py-3 bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-600 rounded-xl transition-all font-bold disabled:opacity-50"
          >
            Move to Deleted
          </button>

          {admin?.isSuperAdmin && (
            <button
              onClick={handleHardDelete}
              disabled={isDeleting || isHardDeleting}
              className="flex-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isHardDeleting ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                  Deleting...
                </>
              ) : (
                "PERMANENT DELETE"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default KanbanRequestModal;
