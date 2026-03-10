///////////////////// ===================== latest version (by gemeni pro) ==================== //////////////////
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  Plane,
  CheckCircle,
  Package,
  Settings,
} from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const FormInput = ({ label, type = "text", ...props }) => (
  <div className="flex items-center gap-3 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-36 text-right flex-shrink-0">
      {label}
    </label>
    <input
      style={{ padding: "8px 12px" }}
      type={type}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 transition-all bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex items-center gap-3 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-36 text-right flex-shrink-0">
      {label}
    </label>
    <select
      style={{ padding: "8px 12px" }}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 transition-all bg-white"
      {...props}
    >
      {children}
    </select>
  </div>
);

const OpBtn = ({ bg, color = "white", onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded-[3px] font-bold transition-all shadow-sm hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1"
    style={{
      backgroundColor: bg,
      color: color,
      padding: "5px 12px",
      fontSize: "12px",
      border: `1px solid ${bg === "white" ? "#e5e7eb" : bg}`,
    }}
  >
    {children}
  </button>
);

// ── FIXED Draggable Modal Component ────────────────────────────
// Now using strict inline styles for width to prevent CSS "squishing"
const DraggableModal = ({
  open,
  onClose,
  title,
  children,
  customWidth = "900px",
}) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [rel, setRel] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (open) setPos({ x: 0, y: 0 });
  }, [open]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPos({ x: e.clientX - rel.x, y: e.clientY - rel.y });
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
          maxWidth: "95vw", // Ensures it doesn't break on small screens
        }}
        className={`relative bg-white rounded-sm flex flex-col shadow-2xl overflow-hidden`}
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

// ── Status Configuration ──────────────────────────────────────
const STATUS_MAP = {
  pendingPayment: {
    color: "text-gray-400",
    label: "Pending Payment",
    dot: "bg-gray-400",
  },
  pendingShipment: {
    color: "text-emerald-500",
    label: "Pending Shipment",
    dot: "bg-emerald-500",
  },
  shipped: { color: "text-orange-500", label: "Shipped", dot: "bg-orange-500" },
  received: {
    color: "text-indigo-500",
    label: "Received",
    dot: "bg-indigo-500",
  },
  completed: { color: "text-blue-600", label: "Completed", dot: "bg-blue-600" },
  cancelled: { color: "text-red-500", label: "Cancelled", dot: "bg-red-500" },
  refunding: {
    color: "text-purple-500",
    label: "Refunding",
    dot: "bg-purple-500",
  },
};

const TABS = [
  { key: "", label: "All" },
  { key: "cancelled", label: "Cancelled" },
  { key: "pendingPayment", label: "Pending Payment" },
  { key: "pendingShipment", label: "Pending Shipment" },
  { key: "shipped", label: "Shipped" },
  { key: "received", label: "Received" },
  { key: "completed", label: "Completed" },
];

export default function OrderList() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";

  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [orderSnInput, setOrderSnInput] = useState("");
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const [modal, setModal] = useState(null); // 'detail' | 'logistics' | 'status'
  const [selected, setSelected] = useState(null);
  const [newStatus, setNewStatus] = useState("");

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["orders", tab, page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      else if (activeFilters.status) p.set("status", activeFilters.status);
      if (activeFilters.orderSn) p.set("orderSn", activeFilters.orderSn);
      if (activeFilters.merchantId)
        p.set("merchantId", activeFilters.merchantId);

      const { data } = await API.get(`/orders?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const orders = data?.orders || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;
  const summary = data?.summary || { totalCost: 0, totalEarnings: 0 };

  const invalidate = () => queryClient.invalidateQueries(["orders"]);

  // ── Single Item Mutations ──────────────────────────────────
  const confirmProfit = useMutation({
    mutationFn: (id) => API.put(`/orders/${id}/confirm-profit`),
    onSuccess: () => {
      invalidate();
      toast.success("Order Completed & Profit Confirmed!");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to confirm profit"),
  });

  const shipSingleOrder = useMutation({
    mutationFn: (id) => API.put(`/orders/${id}/ship`),
    onSuccess: () => {
      invalidate();
      toast.success("Order Shipped!");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to ship order"),
  });

  const cancelOrder = useMutation({
    mutationFn: (id) => API.put(`/orders/${id}/cancel`),
    onSuccess: () => {
      invalidate();
      toast.success("Order Cancelled.");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to cancel order"),
  });

  const modifyStatus = useMutation({
    mutationFn: ({ id, status }) => API.put(`/orders/${id}/status`, { status }),
    onSuccess: () => {
      invalidate();
      toast.success("Status modified successfully.");
      setModal(null);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to modify status"),
  });

  // ── Bulk Action Mutations ──────────────────────────────────
  const bulkShip = useMutation({
    mutationFn: () => API.put("/orders/bulk-ship", {}),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.data.message || "Bulk shipped successfully!");
    },
  });

  const bulkComplete = useMutation({
    mutationFn: () => API.put("/orders/bulk-complete", {}),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.data.message || "Bulk completed successfully!");
    },
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = () => {
    setActiveFilters({
      orderSn: orderSnInput.trim(),
      merchantId: merchantIdInput.trim(),
      status: statusInput,
    });
    setPage(1);
    setTab("");
  };

  const handleReset = () => {
    setOrderSnInput("");
    setMerchantIdInput("");
    setStatusInput("");
    setActiveFilters({});
    setTab("");
    setPage(1);
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
        <h1 className="text-xl font-bold text-gray-800">Order Management</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} orders · Monitor, ship, and complete platform
          orders.
        </p>
      </div>

      {/* ── TOP TABS ── */}
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
                ? "bg-slate-800 text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Advanced Visual Filter Grid ── */}
      <div
        style={{ padding: "20px" }}
        className="bg-white rounded-sm border border-gray-100 mb-4 w-full shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-2 mb-4">
          <FormInput
            label="Order_sn"
            placeholder="Search Order SN"
            value={orderSnInput}
            onChange={(e) => setOrderSnInput(e.target.value)}
          />
          <FormInput label="Order Type" placeholder="Order Type" />
          <FormInput label="Merchant" placeholder="Merchant Name" />
          <FormInput
            label="Merchant ID"
            placeholder="Merchant ID"
            value={merchantIdInput}
            onChange={(e) => setMerchantIdInput(e.target.value)}
          />

          <FormInput label="User.nickname" placeholder="Buyer Name" />
          <FormInput label="User ID" placeholder="Buyer ID" />
          <FormSelect
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">Choose Status</option>
            <option value="pendingPayment">Pending Payment</option>
            <option value="pendingShipment">Pending Shipment</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </FormSelect>
          <FormSelect label="Frozen status">
            <option value="">Choose</option>
          </FormSelect>
        </div>
        <div
          style={{ paddingTop: "20px", paddingBottom: "20px" }}
          className="flex justify-center gap-4 pt-4 "
        >
          <button
            style={{ padding: "10px 40px" }}
            onClick={handleSearch}
            className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-bold rounded-sm transition-colors shadow-sm"
          >
            Submit
          </button>
          <button
            style={{ padding: "10px 40px" }}
            onClick={handleReset}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-sm transition-colors shadow-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── BULK ACTION BAR & TOTALS ── */}
      <div
        style={{ padding: "15px" }}
        className="bg-white border border-gray-100 rounded-sm mb-4 w-full flex flex-col lg:flex-row justify-between items-center gap-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={invalidate}
            style={{ padding: "8px 14px" }}
            className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center justify-center shadow-sm"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>

          <button
            onClick={() =>
              window.confirm("Bulk ship all pending orders?") &&
              bulkShip.mutate()
            }
            disabled={bulkShip.isPending}
            style={{ padding: "8px 16px" }}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-sm text-[13px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <Plane className="w-4 h-4 text-blue-500" /> One-Click Shipping
          </button>
          <button
            onClick={() =>
              window.confirm("Mark all shipped orders as received?") &&
              API.put("/orders/bulk-ship", { toReceived: true }).then(() => {
                invalidate();
                toast.success("Marked as received!");
              })
            }
            style={{ padding: "8px 16px" }}
            className="flex items-center gap-2 ..."
          >
            <Package className="w-4 h-4 text-orange-500" /> One-Click Receipt
          </button>
          <button
            onClick={() =>
              window.confirm("Bulk complete all shipped orders?") &&
              bulkComplete.mutate()
            }
            disabled={bulkComplete.isPending}
            style={{ padding: "8px 16px" }}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-sm text-[13px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
          >
            <CheckCircle className="w-4 h-4 text-emerald-500" /> One-Click
            Complete
          </button>
          <button
            style={{ padding: "8px 16px" }}
            className="flex items-center gap-2 bg-slate-100 border border-slate-200 text-slate-700 rounded-sm text-[13px] font-bold hover:bg-slate-200 transition-colors shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-600" /> Batch Unfreeze
          </button>
        </div>

        <div className="flex items-center gap-8 text-[15px] font-bold text-gray-700 bg-gray-50 px-6 py-3 rounded-sm border border-gray-200">
          <p>
            Total Cost:{" "}
            <span className="text-gray-900 ml-1 font-black">
              ${summary.totalCost?.toFixed(2)}
            </span>
          </p>
          <p>
            Total Profit:{" "}
            <span className="text-blue-600 ml-1 font-black">
              ${summary.totalEarnings?.toFixed(2)}
            </span>
          </p>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-sm flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1700px]">
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
                  Order_sn
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Order Type
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Belonging Merchant
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Merchant ID
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  User.nickname
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  User ID
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Status
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Frozen status
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Pickup Status
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[14px]">
                        Loading orders...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-20 text-gray-500 text-[14px]"
                  >
                    No orders found matching criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const st = STATUS_MAP[o.status] || STATUS_MAP.pendingPayment;
                  let dotColor = st.dot;
                  if (o.status === "completed") dotColor = "bg-blue-500";

                  return (
                    <tr
                      key={o._id}
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
                        className="text-[13px] text-gray-800 font-mono font-bold text-center"
                      >
                        {o.orderSn}
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                          <span className="text-[13px] font-bold text-gray-700">
                            {o.orderType || "Virtual Order"}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-800 font-bold text-center"
                      >
                        {o.merchant?.storeName || "—"}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-600 font-mono text-center"
                      >
                        {o.merchant?.merchantId || "—"}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-800 font-medium text-center"
                      >
                        {o.buyerName || "—"}
                      </td>
                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-[13px] text-gray-600 font-mono text-center"
                      >
                        {o.buyerUserId || "—"}
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          ></span>
                          <span className={`text-[13px] font-bold ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                          <span className="text-[13px] font-bold text-emerald-600 capitalize">
                            {o.frozenStatus || "Normal"}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${o.pickedUpAt ? "bg-emerald-500" : "bg-gray-400"}`}
                          ></span>
                          <span
                            className={`text-[13px] font-bold ${o.pickedUpAt ? "text-emerald-600" : "text-gray-500"}`}
                          >
                            {o.pickedUpAt ? "Picked Up" : "Pending"}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{ padding: "16px 20px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-2 flex-wrap max-w-[320px]">
                          {/* Detail Button */}
                          <OpBtn
                            bg="#3b82f6"
                            onClick={() => {
                              setSelected(o);
                              setModal("detail");
                            }}
                          >
                            Detail
                          </OpBtn>

                          {/* Status Modification */}
                          {isSuperAdmin && (
                            <OpBtn
                              bg="#64748b"
                              onClick={() => {
                                setSelected(o);
                                setNewStatus(o.status);
                                setModal("status");
                              }}
                            >
                              Status Mod.
                            </OpBtn>
                          )}

                          {/* Dynamic Actions */}
                          {o.status === "pendingShipment" && (
                            <OpBtn
                              bg="#f59e0b"
                              onClick={() =>
                                window.confirm("Ship this specific order?") &&
                                shipSingleOrder.mutate(o._id)
                              }
                              disabled={shipSingleOrder.isPending}
                            >
                              Shipping
                            </OpBtn>
                          )}

                          {o.status === "shipped" && isSuperAdmin && (
                            <OpBtn
                              bg="#10b981"
                              onClick={() => confirmProfit.mutate(o._id)}
                              disabled={confirmProfit.isPending}
                            >
                              Confirm Receipt
                            </OpBtn>
                          )}

                          {o.status === "completed" && (
                            <OpBtn
                              bg="#334155"
                              onClick={() => {
                                setSelected(o);
                                setModal("logistics");
                              }}
                            >
                              Logistics
                            </OpBtn>
                          )}

                          {isSuperAdmin &&
                            !["completed", "cancelled"].includes(o.status) && (
                              <OpBtn
                                bg="#ef4444"
                                onClick={() =>
                                  window.confirm("Cancel this order?") &&
                                  cancelOrder.mutate(o._id)
                                }
                                disabled={cancelOrder.isPending}
                              >
                                Cancel
                              </OpBtn>
                            )}
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
          className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50"
        >
          <div className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} rows
            <select
              style={{ padding: "5px" }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-teal-500 bg-white font-semibold text-gray-700"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Prev
            </button>
            {getPageNums().map((n, idx) =>
              n === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  style={{ padding: "5px" }}
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors shadow-sm ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ STATUS MODIFICATION MODAL ════════════ */}
      <DraggableModal
        open={modal === "status"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title={`Modify Status: ${selected?.orderSn}`}
        customWidth="450px"
      >
        {selected && (
          <div className="space-y-6">
            <div
              style={{
                padding: "5px 12px",
                fontSize: "12px",
                marginBottom: "5px",
              }}
              className="bg-amber-50 border border-amber-200 p-4 rounded-sm"
            >
              <p className="text-[13px] text-amber-800 font-medium leading-relaxed">
                Warning: Force modifying a status bypasses normal financial and
                logistical checks. Only use this to fix stuck orders.
              </p>
            </div>

            <FormSelect
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="pendingPayment">Pending Payment</option>
              <option value="pendingShipment">Pending Shipment</option>
              <option value="shipped">Shipped</option>
              <option value="received">Received</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunding">Refunding</option>
            </FormSelect>

            <div className="flex justify-end pt-6 border-t border-gray-200 mt-4">
              <button
                style={{
                  padding: "5px 12px",
                  fontSize: "12px",
                  marginTop: "5px",
                }}
                onClick={() =>
                  modifyStatus.mutate({ id: selected._id, status: newStatus })
                }
                disabled={
                  modifyStatus.isPending || newStatus === selected.status
                }
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-[14px] font-bold px-8 py-3 shadow-md transition-colors disabled:opacity-50"
              >
                {modifyStatus.isPending ? "Updating..." : "Force Update Status"}
              </button>
            </div>
          </div>
        )}
      </DraggableModal>

      {/* ════════════ UPGRADED DETAIL MODAL ════════════ */}
      {/* Forced customWidth to prevent Tailwind max-w from failing */}
      <DraggableModal
        open={modal === "detail"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title={`Order Details: ${selected?.orderSn}`}
        customWidth="900px"
      >
        {selected && (
          <div className="space-y-8">
            {/* Financial Overview Cards - Bigger Text & Padding */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 text-center shadow-sm">
                <p className="text-[13px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                  Total Cost Price
                </p>
                <p className="text-3xl font-black text-gray-800">
                  ${selected.totalCost?.toFixed(2)}
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-sm p-6 text-center shadow-sm">
                <p className="text-[13px] text-blue-600 font-bold uppercase tracking-wider mb-2">
                  Total Selling Price
                </p>
                <p className="text-3xl font-black text-blue-700">
                  ${selected.sellingPrice?.toFixed(2)}
                </p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-sm p-6 text-center shadow-sm">
                <p className="text-[13px] text-emerald-600 font-bold uppercase tracking-wider mb-2">
                  Store Profit
                </p>
                <p className="text-3xl font-black text-emerald-700">
                  ${selected.earnings?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Buyer Info & Order Info - Bigger Text & Padding */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-slate-100 border-b border-gray-200 px-6 py-4 font-bold text-[15px] text-gray-800">
                  Buyer Information
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Name
                    </span>
                    <span className="text-[15px] font-bold text-gray-900">
                      {selected.buyerName}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      User ID
                    </span>
                    <span className="text-[15px] font-mono text-gray-900">
                      {selected.buyerUserId}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Phone
                    </span>
                    <span className="text-[15px] font-mono text-gray-900">
                      {selected.phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Country
                    </span>
                    <span className="text-[15px] font-bold text-gray-900">
                      {selected.country}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[14px] text-gray-500 font-medium w-24">
                      Address
                    </span>
                    <span className="text-[14px] text-gray-800 text-right leading-relaxed">
                      {selected.shippingAddress}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-slate-100 border-b border-gray-200 px-6 py-4 font-bold text-[15px] text-gray-800">
                  Order Timeline
                </div>
                <div className="p-6 space-y-5">
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Created At
                    </span>
                    <span className="text-[14px] font-medium text-gray-800">
                      {new Date(selected.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Pickup Deadline
                    </span>
                    <span className="text-[14px] font-medium text-gray-800">
                      {selected.pickupDeadline
                        ? new Date(selected.pickupDeadline).toLocaleString()
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-100 pb-3">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Picked Up
                    </span>
                    <span className="text-[14px] font-medium text-gray-800">
                      {selected.pickedUpAt
                        ? new Date(selected.pickedUpAt).toLocaleString()
                        : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-[14px] text-gray-500 font-medium">
                      Completed
                    </span>
                    <span className="text-[14px] font-bold text-emerald-600">
                      {selected.completedAt
                        ? new Date(selected.completedAt).toLocaleString()
                        : "Pending"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-slate-100 border-b border-gray-200 px-6 py-4 font-bold text-[15px] text-gray-800">
                Products in Order
              </div>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 text-[13px] text-gray-600 font-bold uppercase tracking-wider bg-gray-50">
                    <th className="p-5">Product</th>
                    <th className="p-5 text-center">Unit Price</th>
                    <th className="p-5 text-center">Quantity</th>
                    <th className="p-5 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.products?.map((p, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors last:border-0"
                    >
                      <td className="p-5 flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-sm overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-100"></div>
                          )}
                        </div>
                        <p className="text-[15px] font-bold text-gray-800 leading-relaxed pr-4">
                          {p.title}
                        </p>
                      </td>
                      <td className="p-5 text-center text-[15px] font-mono text-gray-600">
                        ${p.price?.toFixed(2)}
                      </td>
                      <td className="p-5 text-center text-[15px] font-bold text-gray-800">
                        x{p.quantity}
                      </td>
                      <td className="p-5 text-right text-[16px] font-mono font-black text-gray-900">
                        ${(p.price * p.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Button Separated and Cleaned */}
            <div className="flex justify-end pt-8 mt-4">
              <button
                onClick={() => {
                  setModal(null);
                  setSelected(null);
                }}
                className="bg-slate-800 hover:bg-slate-900 text-white rounded-sm text-[15px] font-bold px-10 py-3 shadow-md transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </DraggableModal>

      {/* ════════════ LOGISTICS MODAL ════════════ */}
      <DraggableModal
        open={modal === "logistics"}
        onClose={() => {
          setModal(null);
          setSelected(null);
        }}
        title="Logistics Tracking"
        customWidth="600px"
      >
        {selected && (
          <div className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-6 shadow-sm text-center">
              <p className="text-[13px] text-gray-500 font-bold mb-2 uppercase tracking-wider">
                Tracking Number
              </p>
              <p className="text-2xl text-gray-900 font-mono font-black tracking-widest">
                {selected.trackingNumber || selected.orderSn}
              </p>
            </div>

            <div className="relative border-l-2 border-teal-500 ml-6 pl-8 py-4">
              {selected.logisticsInfo && selected.logisticsInfo.length > 0 ? (
                selected.logisticsInfo.map((log, idx) => (
                  // Using explicit mb-8 instead of space-y to prevent collapsing
                  <div key={idx} className="relative mb-8 last:mb-0">
                    <span className="absolute -left-[41px] top-1 w-4 h-4 bg-teal-500 border-2 border-white rounded-full shadow-sm"></span>
                    <p className="text-[15px] font-bold text-gray-800 leading-normal">
                      {log.status}
                    </p>
                    <p className="text-[13px] text-gray-500 mt-1.5 font-medium">
                      {new Date(log.time).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-[14px] text-gray-500 italic">
                  No logistics tracking data available yet.
                </p>
              )}
            </div>
          </div>
        )}
      </DraggableModal>
    </div>
  );
}
