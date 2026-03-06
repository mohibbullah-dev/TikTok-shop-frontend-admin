import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { RefreshCcw, Loader2, Eye, CheckCircle, XCircle } from "lucide-react";

// ── Draggable Modal Component ──
const DraggableModal = ({
  open,
  onClose,
  title,
  children,
  customWidth = "600px",
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (open) setPos({ x: 0, y: 0 });
  }, [open]);
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) setPos({ x: e.clientX - rel.x, y: e.clientY - rel.y });
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, rel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-hidden pointer-events-auto">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        style={{
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          width: customWidth,
          maxWidth: "95vw",
        }}
        className="relative bg-white rounded-sm flex flex-col shadow-2xl overflow-hidden"
      >
        <div
          style={{ padding: "16px 24px" }}
          className="flex items-center justify-between bg-slate-800 text-white cursor-move select-none"
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            setIsDragging(true);
            setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
          }}
        >
          <h3 className="font-bold text-[16px]">{title}</h3>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>
        <div
          style={{ padding: "30px" }}
          className="overflow-y-auto max-h-[85vh] custom-scrollbar bg-gray-50/50"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const STATUS_MAP = {
  pending: { color: "text-amber-500", label: "Pending Review" },
  approved: { color: "text-emerald-500", label: "Approved" },
  rejected: { color: "text-red-500", label: "Rejected" },
};

const TABS = [
  { key: "", label: "All" },
  { key: "rejected", label: "Rejected" },
  { key: "pending", label: "Pending Review" },
  { key: "approved", label: "Approved" },
];

export default function RefundOrders() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [adminRemark, setAdminRemark] = useState("");

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["refunds", tab, page, limit],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      const { data } = await API.get(`/refunds?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const refunds = data?.refunds || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["refunds"]);

  const processRefund = useMutation({
    mutationFn: ({ id, action, remark }) =>
      API.put(`/refunds/${id}/process`, { action, adminRemark: remark }),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.data.message);
      setModal(false);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to process"),
  });

  const openProcess = (r) => {
    setSelected(r);
    setAdminRemark(r.adminRemark || "");
    setModal(true);
  };

  const getPageNums = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      {/* ── HEADER ── */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Refund Orders</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Review and process merchant refund requests.
        </p>
      </div>

      {/* ── TOP TABS (Matches Demo) ── */}
      <div className="flex gap-1 border-b border-gray-200 mb-4 bg-white rounded-t-sm shadow-sm p-1 overflow-x-auto custom-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            style={{ padding: "10px 24px" }}
            className={`text-[13px] font-bold rounded-sm transition-colors whitespace-nowrap ${
              tab === t.key
                ? "bg-slate-200 text-slate-800"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── ACTION BAR ── */}
      <div
        style={{ padding: "10px" }}
        className="bg-white border border-gray-100 rounded-sm mb-4 w-full flex gap-2 shadow-sm"
      >
        <button
          onClick={invalidate}
          style={{ padding: "6px 12px" }}
          className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center justify-center shadow-sm"
        >
          <RefreshCcw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-sm flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-800 text-[13px] font-bold bg-gray-50/50 whitespace-nowrap">
                <th
                  style={{ padding: "16px 20px" }}
                  className="text-center w-10"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 w-4 h-4"
                  />
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Refund_id
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  User.nickname
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Refund_sn
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Receiving_status
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Service_type
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Reason_type
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Amount
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Refund_explain
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Creation Time
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Status
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="12" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[14px]">
                        Loading refunds...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : refunds.length === 0 ? (
                <tr>
                  <td
                    colSpan="12"
                    className="text-center py-20 text-gray-500 text-[14px]"
                  >
                    No matching records found
                  </td>
                </tr>
              ) : (
                refunds.map((r) => {
                  const st = STATUS_MAP[r.status];
                  return (
                    <tr
                      key={r._id}
                      className="border-b border-gray-50 hover:bg-slate-50/80 transition-colors group"
                    >
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 w-4 h-4"
                        />
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-600 font-mono text-center"
                      >
                        {r._id.slice(-6).toUpperCase()}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-800 font-medium text-center"
                      >
                        {r.buyerNickname || "—"}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-800 font-mono font-bold text-center"
                      >
                        {r.refundSn}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-600 text-center"
                      >
                        {r.receivingStatus}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-600 text-center"
                      >
                        {r.serviceType}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-800 font-bold text-center"
                      >
                        {r.reasonType}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[14px] text-red-500 font-mono font-bold text-center"
                      >
                        ${r.amount?.toFixed(2)}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[12px] text-gray-500 text-center max-w-[150px] truncate"
                        title={r.explanation}
                      >
                        {r.explanation || "—"}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-500 text-center"
                      >
                        {new Date(r.createdAt).toLocaleString("en-CA")}
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <span className={`text-[13px] font-bold ${st.color}`}>
                          {st.label}
                        </span>
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openProcess(r)}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-sm text-[12px] font-bold px-3 py-1.5 shadow-sm transition-colors whitespace-nowrap"
                          >
                            {r.status === "pending" ? "Process" : "Detail"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{ padding: "5px" }}
          className="flex items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50"
        >
          <div className="text-[13px] text-gray-500 font-medium">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} rows
          </div>
          <div className="flex items-center gap-1.5">
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-bold bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm"
            >
              Prev
            </button>
            {getPageNums().map((n, idx) =>
              n === "..." ? (
                <span key={idx} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  style={{ padding: "5px" }}
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold shadow-sm ${n === page ? "bg-slate-800 text-white" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-bold bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ PROCESS MODAL ════════════ */}
      <DraggableModal
        open={modal}
        onClose={() => setModal(false)}
        title={`Process Refund: ${selected?.refundSn}`}
        customWidth="600px"
      >
        {selected && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 shadow-sm">
              <div className="flex justify-between mb-4">
                <div>
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Reason
                  </p>
                  <p className="text-[15px] font-bold text-gray-800">
                    {selected.reasonType}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                    Refund Amount
                  </p>
                  <p className="text-[18px] font-black text-red-500">
                    ${selected.amount?.toFixed(2)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-[12px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                  Merchant Explanation
                </p>
                <p className="text-[14px] text-gray-700 bg-white p-3 border border-gray-200 rounded-sm">
                  {selected.explanation || "No explanation provided."}
                </p>
              </div>
            </div>

            {selected.status === "pending" ? (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">
                    Admin Remarks (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={adminRemark}
                    onChange={(e) => setAdminRemark(e.target.value)}
                    className="w-full rounded-sm border border-gray-300 p-3 text-[14px] text-gray-800 outline-none focus:border-teal-500 transition-all resize-none shadow-sm"
                    placeholder="Enter notes about this decision..."
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() =>
                      processRefund.mutate({
                        id: selected._id,
                        action: "approve",
                        remark: adminRemark,
                      })
                    }
                    disabled={processRefund.isPending}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm text-[14px] font-bold py-3 shadow-md transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5 inline-block mr-2" />{" "}
                    Approve & Refund
                  </button>
                  <button
                    onClick={() =>
                      processRefund.mutate({
                        id: selected._id,
                        action: "reject",
                        remark: adminRemark,
                      })
                    }
                    disabled={processRefund.isPending}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-sm text-[14px] font-bold py-3 shadow-md transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5 inline-block mr-2" /> Reject
                    Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2">
                    Admin Remarks
                  </label>
                  <p className="text-[14px] text-gray-700 bg-white p-3 border border-gray-200 rounded-sm">
                    {selected.adminRemark || "No remarks."}
                  </p>
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setModal(false)}
                    className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-[14px] font-bold px-10 py-3 shadow-md transition-colors"
                  >
                    Close View
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </DraggableModal>
    </div>
  );
}
