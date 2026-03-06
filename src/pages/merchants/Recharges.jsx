// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── Shared UI atoms ──────────────────────────────────────────
// const Badge = ({ color, bg, children }) => (
//   <span
//     className="px-2.5 py-1 rounded-full text-[11px] font-bold"
//     style={{ background: bg || color + "18", color }}
//   >
//     {children}
//   </span>
// );

// const Modal = ({ open, onClose, title, children }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />
//       <div
//         className="relative bg-white rounded-2xl w-full max-w-md
//         max-h-[90vh] overflow-y-auto"
//         style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
//       >
//         <div
//           className="flex items-center justify-between px-6 py-4
//           border-b border-gray-100"
//         >
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//               justify-center text-gray-400 hover:bg-gray-200
//               transition-all text-sm"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// // ─── Status config ────────────────────────────────────────────
// const STATUS = {
//   pending: { color: "#f59e0b", label: "Pending" },
//   approved: { color: "#22c55e", label: "Approved" },
//   rejected: { color: "#ef4444", label: "Rejected" },
// };

// export default function Recharges() {
//   const queryClient = useQueryClient();

//   const [tab, setTab] = useState("pending");
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [modal, setModal] = useState(null); // 'review' | 'image'
//   const [selected, setSelected] = useState(null);
//   const [rejectNote, setRejectNote] = useState("");
//   const limit = 10;

//   useEffect(() => setPage(1), [tab, search]);

//   // ── Fetch ──────────────────────────────────────────────────
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["recharges", tab, page, search],
//     queryFn: async () => {
//       const p = new URLSearchParams({
//         page,
//         limit,
//         status: tab,
//         ...(search && { search }),
//       });
//       const { data } = await API.get(`/recharge?${p}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const records = data?.recharges || data?.records || [];
//   const total = data?.total || 0;
//   const totalPages = Math.ceil(total / limit);

//   // ── Approve ────────────────────────────────────────────────
//   const approve = useMutation({
//     mutationFn: (id) =>
//       API.put(`/recharge/${id}/review`, { action: "approve" | "reject", note }),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["recharges"]);
//       queryClient.invalidateQueries(["pendingRecharges"]);
//       toast.success("Recharge approved! ✅");
//       setModal(null);
//       setSelected(null);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Reject ─────────────────────────────────────────────────
//   const reject = useMutation({
//     mutationFn: (id) => API.put(`/recharge/${id}/reject`, { note: rejectNote }),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["recharges"]);
//       queryClient.invalidateQueries(["pendingRecharges"]);
//       toast.success("Recharge rejected");
//       setModal(null);
//       setSelected(null);
//       setRejectNote("");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   const openReview = (r) => {
//     setSelected(r);
//     setModal("review");
//   };
//   const openImage = (r) => {
//     setSelected(r);
//     setModal("image");
//   };
//   const closeModal = () => {
//     setModal(null);
//     setSelected(null);
//     setRejectNote("");
//   };

//   // Pagination
//   const getPageNums = () => {
//     if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
//     if (page <= 3) return [1, 2, 3, 4, 5];
//     if (page >= totalPages - 2)
//       return [
//         totalPages - 4,
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     return [page - 2, page - 1, page, page + 1, page + 2];
//   };

//   const tabs = [
//     { key: "pending", label: "Pending Review", color: "#f59e0b" },
//     { key: "approved", label: "Approved", color: "#22c55e" },
//     { key: "rejected", label: "Rejected", color: "#ef4444" },
//   ];

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Recharge Records
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} records · Review pending recharge requests
//           </p>
//         </div>
//         <button
//           onClick={() => queryClient.invalidateQueries(["recharges"])}
//           className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//             border border-gray-200 text-gray-500 hover:bg-gray-50
//             text-sm transition-all"
//         >
//           <svg
//             className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <polyline points="23 4 23 10 17 10" />
//             <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
//           </svg>
//           <span className="hidden sm:inline">Refresh</span>
//         </button>
//       </div>

//       {/* ── Tabs + Search ── */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-4"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* Tab buttons */}
//         <div className="flex flex-wrap gap-2">
//           {tabs.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => setTab(t.key)}
//               className="px-4 py-2 rounded-xl text-sm font-semibold
//                 transition-all"
//               style={
//                 tab === t.key
//                   ? {
//                       background: t.color,
//                       color: "white",
//                       boxShadow: `0 4px 12px ${t.color}40`,
//                     }
//                   : { background: "#f3f4f6", color: "#6b7280" }
//               }
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         {/* Search */}
//         <div className="relative">
//           <svg
//             className="absolute left-3 top-1/2 -translate-y-1/2
//             w-4 h-4 text-gray-400"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <circle cx="11" cy="11" r="8" />
//             <path d="M21 21l-4.35-4.35" />
//           </svg>
//           <input
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             placeholder="Search by order ID or store name..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-xl border
//               border-gray-200 text-sm outline-none
//               focus:border-pink-400 bg-gray-50 focus:bg-white
//               transition-all max-w-sm"
//           />
//         </div>
//       </div>

//       {/* ── Table card ── */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 760 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Merchant",
//                   "Order ID",
//                   "Amount",
//                   "Type",
//                   "Currency",
//                   "Voucher",
//                   "Date",
//                   "Status",
//                   tab === "pending" ? "Actions" : "Reviewed By",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="px-4 py-3 text-left text-[11px]
//                     font-bold text-gray-400 uppercase tracking-wider
//                     whitespace-nowrap"
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>

//             <tbody>
//               {isLoading ? (
//                 [...Array(6)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(10)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div
//                           className="h-3 bg-gray-100 rounded
//                           animate-pulse w-3/4"
//                         />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : records.length === 0 ? (
//                 <tr>
//                   <td colSpan={10} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-5xl">💳</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No {tab} recharges
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 records.map((r, i) => {
//                   const st = STATUS[r.status] || STATUS.pending;
//                   return (
//                     <tr
//                       key={r._id}
//                       className="border-t border-gray-50
//                       hover:bg-slate-50/60 transition-colors"
//                     >
//                       {/* # */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-400 text-xs">
//                           {(page - 1) * limit + i + 1}
//                         </span>
//                       </td>

//                       {/* Merchant */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-2.5">
//                           <div
//                             className="w-8 h-8 rounded-lg bg-gray-100
//                           overflow-hidden flex-shrink-0 flex items-center
//                           justify-center text-sm"
//                           >
//                             {r.merchant?.storeLogo ? (
//                               <img
//                                 src={r.merchant.storeLogo}
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                               />
//                             ) : (
//                               "🏪"
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p
//                               className="text-gray-800 text-xs font-semibold
//                             truncate max-w-[120px]"
//                             >
//                               {r.merchant?.storeName || "—"}
//                             </p>
//                             <p className="text-gray-400 text-[10px]">
//                               ID: {r.merchant?.merchantId}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Order ID */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-500 text-xs font-mono">
//                           #{r.orderId?.slice(-10) || r._id?.slice(-8)}
//                         </span>
//                       </td>

//                       {/* Amount */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-800 text-sm font-bold">
//                           ${(r.price || 0).toFixed(2)}
//                         </span>
//                       </td>

//                       {/* Type */}
//                       <td className="px-4 py-3.5">
//                         <Badge color="#6366f1">
//                           {r.rechargeType || "USDT"}
//                         </Badge>
//                       </td>

//                       {/* Currency */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-500 text-xs">
//                           {r.currencyType || "USDT-TRC20"}
//                         </span>
//                       </td>

//                       {/* Voucher image */}
//                       <td className="px-4 py-3.5">
//                         {r.voucherImage ? (
//                           <button
//                             onClick={() => openImage(r)}
//                             className="w-10 h-10 rounded-lg overflow-hidden
//                             border-2 border-gray-100 hover:border-pink-300
//                             transition-all hover:scale-105"
//                           >
//                             <img
//                               src={r.voucherImage}
//                               alt="voucher"
//                               className="w-full h-full object-cover"
//                             />
//                           </button>
//                         ) : (
//                           <span className="text-gray-300 text-xs">None</span>
//                         )}
//                       </td>

//                       {/* Date */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-500 text-xs whitespace-nowrap">
//                           {new Date(r.createdAt).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "2-digit",
//                           })}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {new Date(r.createdAt).toLocaleTimeString("en-US", {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </td>

//                       {/* Status */}
//                       <td className="px-4 py-3.5">
//                         <Badge color={st.color}>{st.label}</Badge>
//                       </td>

//                       {/* Actions / Reviewed by */}
//                       <td className="px-4 py-3.5">
//                         {tab === "pending" ? (
//                           <button
//                             onClick={() => openReview(r)}
//                             className="px-3 py-1.5 rounded-xl text-xs
//                             font-bold text-white transition-all
//                             hover:scale-105 active:scale-95"
//                             style={{
//                               background:
//                                 "linear-gradient(135deg,#f02d65,#ff6035)",
//                               boxShadow: "0 4px 10px rgba(240,45,101,0.3)",
//                             }}
//                           >
//                             Review
//                           </button>
//                         ) : (
//                           <span className="text-gray-400 text-xs">
//                             {r.approvedBy?.username ||
//                               r.rejectedBy?.username ||
//                               "System"}
//                           </span>
//                         )}
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div
//             className="flex items-center justify-between px-5 py-3
//             border-t border-gray-100"
//           >
//             <p className="text-gray-400 text-xs">
//               Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
//               of {total}
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage(1)}
//                 disabled={page === 1}
//                 className="w-8 h-8 rounded-lg text-gray-400
//                   hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 «
//               </button>
//               <button
//                 onClick={() => setPage((p) => p - 1)}
//                 disabled={page === 1}
//                 className="w-8 h-8 rounded-lg text-gray-400
//                   hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 ‹
//               </button>
//               {getPageNums().map((n) => (
//                 <button
//                   key={n}
//                   onClick={() => setPage(n)}
//                   className="w-8 h-8 rounded-lg text-xs font-semibold
//                     transition-all"
//                   style={
//                     n === page
//                       ? { background: "#f02d65", color: "white" }
//                       : { color: "#6b7280" }
//                   }
//                 >
//                   {n}
//                 </button>
//               ))}
//               <button
//                 onClick={() => setPage((p) => p + 1)}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400
//                   hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 ›
//               </button>
//               <button
//                 onClick={() => setPage(totalPages)}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400
//                   hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 »
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ═══════════ MODALS ═══════════ */}

//       {/* Review modal */}
//       <Modal
//         open={modal === "review"}
//         onClose={closeModal}
//         title="💳 Review Recharge Request"
//       >
//         {selected && (
//           <div className="space-y-4">
//             {/* Info card */}
//             <div
//               className="rounded-xl p-4 space-y-2.5"
//               style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//             >
//               {[
//                 ["Merchant", selected.merchant?.storeName],
//                 ["Merchant ID", selected.merchant?.merchantId],
//                 ["Amount", `$${(selected.price || 0).toFixed(2)}`],
//                 ["Type", selected.rechargeType || "USDT"],
//                 ["Currency", selected.currencyType || "USDT-TRC20"],
//                 ["Submitted", new Date(selected.createdAt).toLocaleString()],
//               ].map(([k, v]) => (
//                 <div key={k} className="flex items-center justify-between">
//                   <span className="text-gray-400 text-xs">{k}</span>
//                   <span className="text-gray-800 text-xs font-bold">{v}</span>
//                 </div>
//               ))}
//             </div>

//             {/* Voucher image preview */}
//             {selected.voucherImage && (
//               <div>
//                 <p className="text-gray-500 text-xs font-medium mb-2">
//                   Transaction Voucher
//                 </p>
//                 <img
//                   src={selected.voucherImage}
//                   alt="voucher"
//                   className="w-full rounded-xl object-contain max-h-48
//                     border border-gray-100 cursor-zoom-in"
//                   onClick={() => setModal("image")}
//                 />
//               </div>
//             )}

//             {/* Reject note input */}
//             <div>
//               <label
//                 className="text-gray-500 text-xs font-medium
//                 block mb-1.5"
//               >
//                 Reject Note (required if rejecting)
//               </label>
//               <textarea
//                 value={rejectNote}
//                 onChange={(e) => setRejectNote(e.target.value)}
//                 rows={2}
//                 placeholder="Enter reason for rejection..."
//                 className="w-full px-4 py-2.5 rounded-xl border
//                   border-gray-200 text-sm text-gray-700 outline-none
//                   focus:border-pink-400 transition-all resize-none
//                   bg-gray-50 focus:bg-white"
//               />
//             </div>

//             {/* Action buttons */}
//             <div className="grid grid-cols-2 gap-3 pt-1">
//               <button
//                 onClick={() => reject.mutate(selected._id)}
//                 disabled={!rejectNote.trim() || reject.isPending}
//                 className="py-3 rounded-xl font-bold text-sm
//                   text-white transition-all disabled:opacity-50
//                   active:scale-95"
//                 style={{
//                   background: "#ef4444",
//                   boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
//                 }}
//               >
//                 {reject.isPending ? "Rejecting..." : "✕ Reject"}
//               </button>
//               <button
//                 onClick={() => approve.mutate(selected._id)}
//                 disabled={approve.isPending}
//                 className="py-3 rounded-xl font-bold text-sm
//                   text-white transition-all disabled:opacity-50
//                   active:scale-95"
//                 style={{
//                   background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                   boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
//                 }}
//               >
//                 {approve.isPending ? "Approving..." : "✓ Approve"}
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* Full-size image modal */}
//       <Modal
//         open={modal === "image"}
//         onClose={closeModal}
//         title="🖼️ Voucher Image"
//       >
//         {selected?.voucherImage && (
//           <div>
//             <img
//               src={selected.voucherImage}
//               alt="voucher"
//               className="w-full rounded-xl object-contain"
//             />
//             <button
//               onClick={closeModal}
//               className="w-full mt-4 py-2.5 rounded-xl border
//                 border-gray-200 text-gray-500 text-sm
//                 hover:bg-gray-50 transition-all"
//             >
//               Close
//             </button>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

/////////////////////// ============================== lates version (by gemeni) ========================///////////////////
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  CheckCircle,
  XCircle,
  ImageIcon,
} from "lucide-react";

// ── Reusable UI components (Strictly Matched to your Design) ──
const ActionBtn = ({ onClick, color, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {label}
  </button>
);

const FormInput = ({ label, ...props }) => (
  <div
    style={{ marginTop: "10px", marginBottom: "10px" }}
    className="flex flex-col gap-1.5"
  >
    {label && (
      <label className="text-gray-600 text-[13px] font-medium ml-1">
        {label}
      </label>
    )}
    <input
      style={{ padding: "5px" }}
      className="w-full rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-gray-600 text-[13px] font-medium ml-1">
        {label}
      </label>
    )}
    <select
      style={{ padding: "5px" }}
      className="w-full rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
      {...props}
    >
      {children}
    </select>
  </div>
);

const Field = ({ label, value }) => (
  <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-[13px] font-medium flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-900 text-[13px] font-semibold text-right break-all">
      {value || "—"}
    </span>
  </div>
);

// ── Premium Modal Component ───────────────────────────────────
const Modal = ({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  width = "max-w-md",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        style={{ padding: "10px" }}
        className={`relative bg-white rounded-lg w-full ${width} max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transform transition-all`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-teal-50 rounded-sm text-teal-600">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
export default function Recharges() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";

  // 1. Input States
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  // 2. Active Filters
  const [activeFilters, setActiveFilters] = useState({
    search: "",
    status: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal States
  const [modal, setModal] = useState(null); // 'review' | 'image'
  const [selected, setSelected] = useState(null);

  // Filter Handlers
  const handleSubmitFilters = () => {
    setActiveFilters({
      search: searchInput.trim(),
      status: statusInput,
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setStatusInput("");
    setActiveFilters({ search: "", status: "" });
    setPage(1);
  };

  // Fetch Logic - Fetches ALL by default like the demo
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["recharges", page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (activeFilters.search) p.set("search", activeFilters.search);
      if (activeFilters.status !== "") p.set("status", activeFilters.status);

      const { data } = await API.get(`/recharge?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const records = data?.recharges || data?.records || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const invalidate = () => {
    queryClient.invalidateQueries(["recharges"]);
  };

  // ── Mutations (Mapped to backend expected: 1=approve, 2=reject)
  const approve = useMutation({
    mutationFn: (id) => API.put(`/recharge/${id}/review`, { status: 1 }),
    onSuccess: () => {
      invalidate();
      toast.success("Recharge approved successfully! ✅");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to approve"),
  });

  const reject = useMutation({
    mutationFn: (id) => API.put(`/recharge/${id}/review`, { status: 2 }),
    onSuccess: () => {
      invalidate();
      toast.success("Recharge request rejected.");
      closeModal();
    },
    onError: (e) => {
      // Note: If this throws a validation error, it's because your backend enum
      // only allows [0, 1]. You may need to add '2' to your mongoose schema enum!
      toast.error(
        e.response?.data?.message || "Failed to reject (Check Backend Enum)",
      );
    },
  });

  const openReview = (r) => {
    setSelected(r);
    setModal("review");
  };

  const openImage = (r) => {
    setSelected(r);
    setModal("image");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
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
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Merchant Recharge Records
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Review, approve, and manage manual recharge requests.
        </p>
      </div>

      {/* ── Advanced Filter Grid ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <FormInput
            label="Search Records"
            placeholder="Search by ID or Store Name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <FormSelect
            label="Review Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">All Records</option>
            <option value="pending">Pending Review (Status 0)</option>
            <option value="approved">Approved (Status 1)</option>
          </FormSelect>
        </div>

        <div
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          className="flex justify-end gap-3 pt-4 border-t border-gray-100"
        >
          <button
            style={{ padding: "5px" }}
            onClick={handleResetFilters}
            className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold rounded-sm transition-colors"
          >
            Reset
          </button>
          <button
            style={{ padding: "5px" }}
            onClick={handleSubmitFilters}
            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Data Table Container ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden"
      >
        <div
          style={{ padding: "10px" }}
          className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between gap-3 items-center"
        >
          <h2 className="text-[14px] font-bold text-gray-800">
            Recharge Directory
          </h2>
          <button
            onClick={() => invalidate()}
            className="p-2 rounded-sm bg-gray-50 hover:bg-gray-100 text-teal-600 transition-colors border border-gray-200"
            title="Refresh"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              {/* Exact Headers from Client Demo */}
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-gray-50/50">
                <th
                  style={{ padding: "5px" }}
                  className="py-4 px-5 text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-4 px-5">Recharge_id</th>
                <th className="py-4 px-5">Merchant.mer_name</th>
                <th className="py-4 px-5">Order_id</th>
                <th className="py-4 px-5">Price</th>
                <th className="py-4 px-5">Recharge_type</th>
                <th className="py-4 px-5">Currency_type</th>
                <th className="py-4 px-5 text-center">Recharge Voucher</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Creation Time</th>
                <th className="py-4 px-5 text-center">Operate</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <p className="text-gray-500 text-[13px] font-medium">
                        Loading records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No recharge records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const voucherImg = r.voucher || r.voucherImage;

                  // Status Logic mapping exactly to demo (Status 0, Status 1)
                  const isApproved = r.status === 1 || r.status === "1";
                  const isPending = r.status === 0 || r.status === "0";

                  let dotColor = "bg-red-500";
                  let statusText = "Status 2";
                  if (isApproved) {
                    dotColor = "bg-emerald-500";
                    statusText = "Status 1";
                  }
                  if (isPending) {
                    dotColor = "bg-slate-700";
                    statusText = "Status 0";
                  }

                  return (
                    <tr
                      key={r._id}
                      className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors group"
                    >
                      <td className="py-3 px-5 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-3 px-5 text-[13px] text-gray-600 font-mono">
                        {r.rechargeId || r._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-5 text-[13px] text-gray-800 font-bold">
                        {r.merchant?.storeName || "—"}
                      </td>
                      <td className="py-3 px-5 text-[13px] text-gray-500 font-mono">
                        {r.orderId || "—"}
                      </td>
                      <td className="py-3 px-5 text-[13px] font-bold text-gray-800">
                        {r.price?.toFixed(2) || "0.00"}
                      </td>
                      <td className="py-3 px-5 text-[13px] text-gray-600">
                        {r.rechargeType || "Recharge_type 0"}
                      </td>
                      <td className="py-3 px-5 text-[13px] text-gray-600">
                        {r.currencyType || "USD"}
                      </td>
                      <td className="py-3 px-5 text-center">
                        {voucherImg ? (
                          <button
                            onClick={() => openImage(r)}
                            className="w-10 h-8 mx-auto bg-slate-800 rounded-sm overflow-hidden hover:opacity-80 transition-opacity flex items-center justify-center"
                          >
                            <ImageIcon className="w-4 h-4 text-white opacity-50" />
                          </button>
                        ) : (
                          <span className="text-gray-300 text-[11px] font-bold">
                            —
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          ></span>
                          <span
                            className={`text-[12px] font-bold ${isApproved ? "text-emerald-600" : "text-slate-700"}`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-[13px] text-gray-500">
                        {new Date(r.createdAt).toLocaleString("en-CA")}
                      </td>

                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center w-full">
                          {isPending && isSuperAdmin ? (
                            <ActionBtn
                              color="#334155" // Slate dark color mapping to Demo's 'Review'
                              label="Review"
                              onClick={() => openReview(r)}
                            />
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              {r.reviewedBy?.username || "—"}
                            </span>
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
          <div className="text-[13px] text-gray-500 mb-3 sm:mb-0 flex items-center gap-2 font-medium">
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
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
                  className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}

            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ MODALS ════════════ */}

      {/* 1. Review Modal */}
      <Modal
        open={modal === "review"}
        onClose={closeModal}
        title="Review Recharge Request"
        icon={CheckCircle}
        width="max-w-md"
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm">
              <Field label="Merchant" value={selected.merchant?.storeName} />
              <Field
                label="Merchant ID"
                value={selected.merchant?.merchantId}
              />
              <Field
                label="Amount"
                value={`$${(selected.price || 0).toFixed(2)}`}
              />
              <Field label="Type" value={selected.rechargeType || "USDT"} />
              <Field label="Currency" value={selected.currencyType || "USD"} />
              <Field
                label="Submitted"
                value={new Date(selected.createdAt).toLocaleString()}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                style={{ padding: "8px" }}
                onClick={() => reject.mutate(selected._id)}
                disabled={reject.isPending || approve.isPending}
                className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                {reject.isPending ? "Processing..." : "Reject (Status 2)"}
              </button>

              <button
                style={{ padding: "8px" }}
                onClick={() => approve.mutate(selected._id)}
                disabled={approve.isPending || reject.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                {approve.isPending ? "Approving..." : "Approve (Status 1)"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* 2. Image Viewing Modal */}
      <Modal
        open={modal === "image"}
        onClose={closeModal}
        title="Recharge Voucher"
      >
        {selected && (
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 rounded-md border border-gray-200 w-full min-h-[250px] flex items-center justify-center p-2 mb-4">
              <img
                src={selected.voucher || selected.voucherImage}
                alt="voucher"
                className="max-w-full max-h-[60vh] object-contain rounded"
              />
            </div>
            <button
              style={{ padding: "8px" }}
              onClick={closeModal}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-[13px] rounded-sm transition-colors shadow-sm"
            >
              Close Viewer
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
