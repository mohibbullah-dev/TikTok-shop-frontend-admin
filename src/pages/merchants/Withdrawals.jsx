//////////////////////// ========================== latest version (by gemeni pro) ==============================///////////////////////////

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ── Icons for forms/modals ────────────────────────────────────
// import { RefreshCcw, Loader2, CheckCircle, XCircle, Info } from "lucide-react";

// // ── Reusable UI components ────────────────────────────────────
// const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
//   <button
//     onClick={onClick}
//     disabled={disabled}
//     className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5"
//     style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
//   >
//     {Icon && <Icon className="w-3.5 h-3.5" />}
//     {label}
//   </button>
// );

// const Field = ({ label, value, mono, highlight }) => (
//   <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
//     <span className="text-gray-500 text-[13px] font-medium flex-shrink-0 w-28">
//       {label}
//     </span>
//     <span
//       className={`text-[13px] font-semibold text-right break-all flex-1 ml-2
//       ${mono ? "font-mono tracking-tight" : ""}
//       ${highlight ? "text-red-600 font-bold" : "text-gray-900"}`}
//     >
//       {value || "—"}
//     </span>
//   </div>
// );

// // ── Premium Modal Component ───────────────────────────────────
// const Modal = ({
//   open,
//   onClose,
//   title,
//   icon: Icon,
//   children,
//   width = "max-w-md",
// }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
//       <div
//         className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
//         onClick={onClose}
//       />
//       <div
//         style={{ padding: "10px" }}
//         className={`relative bg-white rounded-lg w-full ${width} max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transform transition-all`}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
//           <div className="flex items-center gap-3">
//             {Icon && (
//               <div className="p-2 bg-teal-50 rounded-sm text-teal-600">
//                 <Icon className="w-5 h-5" />
//               </div>
//             )}
//             <h3 className="font-bold text-gray-900 text-base">{title}</h3>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ── Main component ────────────────────────────────────────────
// export default function Withdrawals() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";
//   const isMerchantAdmin = user?.role === "merchantAdmin";

//   const [tab, setTab] = useState(""); // "" = All, "underReview", "withdrawn", "rejected"
//   const [page, setPage] = useState(1);
//   const [modal, setModal] = useState(null);
//   const [selected, setSelected] = useState(null);
//   const [rejectReason, setRejectReason] = useState(""); // Maps to backend 'reason'
//   const limit = 10;

//   useEffect(() => setPage(1), [tab]);

//   // ── Fetch Logic ────────────────────────────────────────────
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["withdrawals", tab, page],
//     queryFn: async () => {
//       const p = new URLSearchParams({ page, limit });
//       if (tab) p.set("status", tab);
//       const { data } = await API.get(`/withdrawal?${p.toString()}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const records = data?.withdrawals || data?.records || [];
//   const total = data?.total || 0;
//   const totalPages = Math.ceil(total / limit) || 1;

//   const invalidate = () => {
//     queryClient.invalidateQueries(["withdrawals"]);
//   };

//   // ── Approve (superAdmin only) ──────────────────────────────
//   const approve = useMutation({
//     mutationFn: (id) => API.put(`/withdrawal/${id}/approve`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Withdrawal approved successfully! ✅");
//       closeModal();
//     },
//     onError: (e) =>
//       toast.error(e.response?.data?.message || "Failed to approve"),
//   });

//   // ── Cancel/Reject ──────────────────────────────────────────
//   // The backend controller expects { reason: "..." }
//   const cancel = useMutation({
//     mutationFn: (id) =>
//       API.put(`/withdrawal/${id}/cancel`, { reason: rejectReason }),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Withdrawal cancelled — balance returned to merchant.");
//       closeModal();
//     },
//     onError: (e) =>
//       toast.error(e.response?.data?.message || "Failed to cancel"),
//   });

//   const openReview = (r) => {
//     setSelected(r);
//     setModal("review");
//   };

//   const closeModal = () => {
//     setModal(null);
//     setSelected(null);
//     setRejectReason("");
//   };

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
//     { key: "", label: "All" },
//     { key: "rejected", label: "Rejected" },
//     { key: "underReview", label: "Under Review" },
//     { key: "withdrawn", label: "Withdrawn" },
//   ];

//   return (
//     <div
//       style={{ padding: "20px" }}
//       className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
//     >
//       <div className="mb-4">
//         <h1 className="text-xl font-bold text-gray-800">
//           Merchant Withdrawal Management
//         </h1>
//         <p className="text-[13px] text-gray-500 mt-1">
//           {total.toLocaleString()} records ·{" "}
//           {isMerchantAdmin
//             ? "You can cancel withdrawals (balance returned)"
//             : "Approve or reject merchant withdrawal requests"}
//         </p>
//       </div>

//       {isMerchantAdmin && (
//         <div
//           style={{ padding: "10px", marginBottom: "15px" }}
//           className="bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3"
//         >
//           <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
//           <p className="text-[13px] text-blue-800">
//             As <strong>Merchant Admin</strong>, you can only{" "}
//             <strong>cancel</strong> pending withdrawals for your assigned
//             merchants. When cancelled, the balance is automatically returned to
//             their account.
//           </p>
//         </div>
//       )}

//       {/* ── Top Control Bar (Demo Style Tabs) ── */}
//       <div
//         style={{ padding: "5px" }}
//         className="bg-white rounded-md p-4 border border-gray-100 mb-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
//       >
//         <div className="flex items-center gap-2 overflow-x-auto w-full">
//           {tabs.map((t) => (
//             <button
//               key={t.key}
//               style={{ padding: "8px 24px" }}
//               onClick={() => setTab(t.key)}
//               className={`rounded-sm text-[13px] font-semibold transition-all whitespace-nowrap ${
//                 tab === t.key
//                   ? "bg-slate-800 text-white shadow-md"
//                   : "bg-gray-100 text-gray-600 hover:bg-gray-200"
//               }`}
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ── Data Table Container ── */}
//       <div
//         style={{ padding: "5px" }}
//         className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden shadow-sm"
//       >
//         <div
//           style={{ padding: "10px" }}
//           className="border-b border-gray-100 bg-gray-50/50 flex justify-between gap-3 items-center"
//         >
//           <button
//             style={{ padding: "8px" }}
//             onClick={() => invalidate()}
//             className="rounded-sm bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center justify-center shadow-sm"
//             title="Refresh Table"
//           >
//             <RefreshCcw
//               className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
//             />
//           </button>
//         </div>

//         <div className="w-full overflow-x-auto custom-scrollbar">
//           <table className="w-full text-left border-collapse min-w-[1200px]">
//             <thead>
//               {/* Exact Headers mapped to Demo */}
//               <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-white">
//                 <th
//                   style={{ padding: "12px 15px" }}
//                   className="text-center w-10"
//                 >
//                   <input type="checkbox" className="rounded border-gray-300" />
//                 </th>
//                 <th style={{ padding: "12px 15px" }}>Extract_id</th>
//                 <th style={{ padding: "12px 15px" }}>Merchant.mer_name</th>
//                 <th style={{ padding: "12px 15px" }}>Extract_sn</th>
//                 <th style={{ padding: "12px 15px" }}>Extract_type</th>
//                 <th style={{ padding: "12px 15px" }}>Withdraw Info</th>
//                 <th style={{ padding: "12px 15px" }}>Extract_price</th>
//                 <th style={{ padding: "12px 15px" }}>Currency_type</th>
//                 <th style={{ padding: "12px 15px" }}>Status</th>
//                 <th style={{ padding: "12px 15px" }}>Creation Time</th>
//                 <th style={{ padding: "12px 15px" }} className="text-center">
//                   Operate
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {isLoading ? (
//                 <tr>
//                   <td colSpan="11" className="py-24">
//                     <div className="flex flex-col items-center justify-center gap-3">
//                       <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
//                       <p className="text-gray-500 text-[13px] font-medium">
//                         Loading withdrawal records...
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : records.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="11"
//                     className="text-center py-20 text-gray-500 text-[13px]"
//                   >
//                     No withdrawals found in this category.
//                   </td>
//                 </tr>
//               ) : (
//                 records.map((r, i) => {
//                   const isBankCard = r.extractType === "bankCard";

//                   // Status Dot Logic mapping to Demo
//                   let dotColor = "bg-gray-400";
//                   let statusText = "Under Review";
//                   if (r.status === "withdrawn") {
//                     dotColor = "bg-emerald-500";
//                     statusText = "Withdrawn";
//                   } else if (r.status === "rejected") {
//                     dotColor = "bg-red-500";
//                     statusText = "Rejected";
//                   } else if (r.status === "underReview") {
//                     dotColor = "bg-slate-700";
//                     statusText = "Under Review";
//                   }

//                   return (
//                     <tr
//                       key={r._id}
//                       className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors group"
//                     >
//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-center"
//                       >
//                         <input
//                           type="checkbox"
//                           className="rounded border-gray-300"
//                         />
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-[13px] text-gray-500 font-mono"
//                       >
//                         {r._id.slice(-4).toUpperCase()}
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-[13px] text-gray-800 font-bold"
//                       >
//                         {r.merchant?.storeName || "—"}
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-[13px] text-gray-600 font-mono"
//                       >
//                         {r.extractSn || "—"}
//                       </td>

//                       <td style={{ padding: "12px 15px" }}>
//                         <span
//                           className={`text-[12px] font-medium ${isBankCard ? "text-indigo-600" : "text-emerald-600"}`}
//                         >
//                           {isBankCard ? "Bank Card" : "Blockchain"}
//                         </span>
//                       </td>

//                       <td style={{ padding: "12px 15px" }}>
//                         {isBankCard ? (
//                           <div>
//                             <p className="text-gray-800 text-[12px] font-bold">
//                               {r.accountName}
//                             </p>
//                             <p className="text-gray-500 text-[11px] font-mono mt-0.5">
//                               {r.bankCardNumber} ({r.bankName})
//                             </p>
//                           </div>
//                         ) : (
//                           <div>
//                             <p className="text-gray-800 text-[12px] font-bold">
//                               {r.network}
//                             </p>
//                             <p
//                               className="text-gray-500 text-[11px] font-mono mt-0.5 max-w-[140px] truncate"
//                               title={r.walletAddress}
//                             >
//                               {r.walletAddress}
//                             </p>
//                           </div>
//                         )}
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-[13px] font-bold text-gray-800"
//                       >
//                         {r.extractPrice?.toFixed(2) || "0.00"}
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-[13px] text-gray-600"
//                       >
//                         {r.currencyType || "USD"}
//                       </td>

//                       <td style={{ padding: "12px 15px" }}>
//                         <div className="flex items-center gap-1.5">
//                           <span
//                             className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
//                           ></span>
//                           <span
//                             className={`text-[12px] font-bold ${r.status === "rejected" ? "text-red-600" : "text-slate-700"}`}
//                           >
//                             {statusText}
//                           </span>
//                         </div>
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-[13px] text-gray-500"
//                       >
//                         {new Date(r.createdAt).toLocaleString("en-CA")}
//                       </td>

//                       <td
//                         style={{ padding: "12px 15px" }}
//                         className="text-center"
//                       >
//                         <div className="flex items-center justify-center w-full">
//                           {r.status === "underReview" ? (
//                             <ActionBtn
//                               color="#334155" // Slate 700 to match demo's "Review" button
//                               label="Review"
//                               onClick={() => openReview(r)}
//                             />
//                           ) : (
//                             <span className="text-[11px] text-gray-400 font-medium">
//                               Processed
//                             </span>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         <div
//           style={{ padding: "5px" }}
//           className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50"
//         >
//           <div className="text-[13px] text-gray-500 mb-3 sm:mb-0 flex items-center gap-2 font-medium">
//             Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
//             of {total} rows
//             <select
//               style={{ padding: "5px" }}
//               value={limit}
//               onChange={(e) => {
//                 setLimit(Number(e.target.value));
//                 setPage(1);
//               }}
//               className="ml-2 border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-teal-500 bg-white font-semibold text-gray-700"
//             >
//               <option value={10}>10</option>
//               <option value={20}>20</option>
//               <option value={50}>50</option>
//             </select>
//           </div>

//           <div className="flex items-center gap-1.5">
//             <button
//               style={{ padding: "5px" }}
//               onClick={() => setPage((p) => Math.max(1, p - 1))}
//               disabled={page === 1}
//               className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
//             >
//               Prev
//             </button>

//             {getPageNums().map((n, idx) =>
//               n === "..." ? (
//                 <span key={`dots-${idx}`} className="px-2 text-gray-400">
//                   ...
//                 </span>
//               ) : (
//                 <button
//                   style={{ padding: "5px" }}
//                   key={n}
//                   onClick={() => setPage(n)}
//                   className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
//                 >
//                   {n}
//                 </button>
//               ),
//             )}

//             <button
//               style={{ padding: "5px" }}
//               onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//               disabled={page === totalPages || totalPages === 0}
//               className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
//             >
//               Next
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ════════════ REVIEW MODAL ════════════ */}
//       <Modal
//         open={modal === "review"}
//         onClose={closeModal}
//         title="Review Withdrawal Request"
//         icon={CheckCircle}
//         width="max-w-md"
//       >
//         {selected && (
//           <div className="space-y-4">
//             {/* Amount highlight */}
//             <div
//               className="rounded-md p-4 text-center mb-4"
//               style={{
//                 background:
//                   "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
//                 border: "1px solid #e2e8f0",
//               }}
//             >
//               <p className="text-gray-500 text-[12px] font-medium mb-1 uppercase tracking-wider">
//                 Requested Amount
//               </p>
//               <p className="text-3xl font-black text-slate-800 tracking-tight">
//                 ${(selected.extractPrice || 0).toFixed(2)}
//               </p>
//             </div>

//             <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm mb-4">
//               <Field label="Merchant" value={selected.merchant?.storeName} />
//               <Field
//                 label="Merchant ID"
//                 value={selected.merchant?.merchantId}
//               />
//               <Field label="Extract SN" value={selected.extractSn} mono />
//               <Field
//                 label="Submitted"
//                 value={new Date(selected.createdAt).toLocaleString()}
//               />
//             </div>

//             {/* Destination Info */}
//             <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
//               <p className="text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
//                 Destination Info
//               </p>
//               {selected.extractType === "bankCard" ? (
//                 <div>
//                   <p className="text-blue-900 font-bold text-[14px]">
//                     {selected.bankName}
//                   </p>
//                   <p className="text-blue-700 text-[12px] mt-1">
//                     Account: {selected.accountName}
//                   </p>
//                   <p className="text-blue-800 text-[14px] font-mono tracking-widest mt-2 bg-white inline-block px-2 py-1 rounded border border-blue-200">
//                     {selected.bankCardNumber}
//                   </p>
//                 </div>
//               ) : (
//                 <div>
//                   <p className="text-blue-900 font-bold text-[14px]">
//                     {selected.network}
//                   </p>
//                   <p className="text-blue-800 text-[13px] font-mono break-all mt-2 bg-white p-2 rounded border border-blue-200">
//                     {selected.walletAddress}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Reject/Cancel Reason Input */}
//             <div className="flex flex-col gap-1.5 mb-2">
//               <label className="text-gray-600 text-[13px] font-medium">
//                 {isMerchantAdmin
//                   ? "Cancel Reason (Required)"
//                   : "Reject Reason (Required if rejecting)"}
//               </label>
//               <textarea
//                 style={{ padding: "8px" }}
//                 value={rejectReason}
//                 onChange={(e) => setRejectReason(e.target.value)}
//                 rows={2}
//                 placeholder="Enter reason..."
//                 className="w-full rounded-sm border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
//               />
//             </div>

//             {/* Warning Note */}
//             <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm mb-4">
//               <p className="text-amber-800 text-[12px] font-medium leading-tight">
//                 {isMerchantAdmin
//                   ? "⚠️ Cancelling will immediately return the funds to the merchant's wallet balance."
//                   : "⚠️ Approving finalizes the transfer. Rejecting returns funds to the merchant."}
//               </p>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex gap-3 pt-2 border-t border-gray-100">
//               <button
//                 style={{ padding: "8px" }}
//                 onClick={() => cancel.mutate(selected._id)}
//                 disabled={
//                   !rejectReason.trim() || cancel.isPending || approve.isPending
//                 }
//                 className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
//               >
//                 <XCircle className="w-4 h-4" />
//                 {cancel.isPending
//                   ? "Processing..."
//                   : isMerchantAdmin
//                     ? "Cancel Withdrawal"
//                     : "Reject"}
//               </button>

//               {isSuperAdmin && (
//                 <button
//                   style={{ padding: "8px" }}
//                   onClick={() => approve.mutate(selected._id)}
//                   disabled={approve.isPending || cancel.isPending}
//                   className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
//                 >
//                   <CheckCircle className="w-4 h-4" />
//                   {approve.isPending ? "Approving..." : "Approve"}
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

/////////////////////////// ========================== latest version (by claud) ========================= ///////////////////////

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

import {
  RefreshCcw,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  Copy,
  Search,
} from "lucide-react";

const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </button>
);

const Field = ({ label, value, mono, highlight }) => (
  <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-[13px] font-medium flex-shrink-0 w-28">
      {label}
    </span>
    <span
      className={`text-[13px] font-semibold text-right break-all flex-1 ml-2 ${mono ? "font-mono tracking-tight" : ""} ${highlight ? "text-red-600 font-bold" : "text-gray-900"}`}
    >
      {value || "—"}
    </span>
  </div>
);

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

export default function Withdrawals() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  const [tab, setTab] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // ✅ NEW: Search state
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  useEffect(() => setPage(1), [tab]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["withdrawals", tab, page, limit, activeSearch],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      // ✅ Send search param — backend already supports storeName/merchantId filtering
      if (activeSearch) p.set("search", activeSearch);
      const { data } = await API.get(`/withdrawal?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const records = data?.withdrawals || data?.records || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["withdrawals"]);

  // ✅ NEW: Copy to clipboard helper
  const copyToClipboard = (text, label = "Copied!") => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success(`✅ ${label}`));
  };

  const approve = useMutation({
    mutationFn: (id) => API.put(`/withdrawal/${id}/approve`),
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawal approved! ✅");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to approve"),
  });

  const cancel = useMutation({
    mutationFn: (id) =>
      API.put(`/withdrawal/${id}/cancel`, { reason: rejectReason }),
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawal cancelled — balance returned.");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to cancel"),
  });

  const openReview = (r) => {
    setSelected(r);
    setModal("review");
  };
  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setRejectReason("");
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

  const tabs = [
    { key: "", label: "All" },
    { key: "rejected", label: "Rejected" },
    { key: "underReview", label: "Under Review" },
    { key: "withdrawn", label: "Withdrawn" },
  ];

  return (
    <div
      style={{ padding: "20px" }}
      className="bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          Merchant Withdrawal Management
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} records ·{" "}
          {isMerchantAdmin
            ? "You can cancel withdrawals (balance returned)"
            : "Approve or reject merchant withdrawal requests"}
        </p>
      </div>

      {isMerchantAdmin && (
        <div
          style={{ padding: "10px", marginBottom: "15px" }}
          className="bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-800">
            As <strong>Merchant Admin</strong>, you can only{" "}
            <strong>cancel</strong> pending withdrawals for your assigned
            merchants. When cancelled, the balance is automatically returned to
            their account.
          </p>
        </div>
      )}

      {/* ── Tabs + Search Bar ── */}
      <div
        style={{ padding: "12px 16px" }}
        className="bg-white rounded-md border border-gray-100 mb-4 w-full flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm"
      >
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              style={{ padding: "8px 20px" }}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`rounded-sm text-[13px] font-semibold transition-all whitespace-nowrap ${
                tab === t.key
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ✅ NEW: Search Bar */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            {/* <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" /> */}
            <input
              style={{ padding: "8px 14px" }}
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setActiveSearch(searchInput.trim());
                  setPage(1);
                }
              }}
              placeholder="Search by name or merchant ID..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm text-[13px] text-gray-700 focus:outline-none focus:border-teal-500 bg-gray-50"
            />
          </div>
          <button
            style={{ padding: "8px 14px" }}
            onClick={() => {
              setActiveSearch(searchInput.trim());
              setPage(1);
            }}
            className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors whitespace-nowrap"
          >
            Search
          </button>
          {activeSearch && (
            <button
              style={{ padding: "8px 10px" }}
              onClick={() => {
                setSearchInput("");
                setActiveSearch("");
                setPage(1);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-[13px] font-semibold rounded-sm transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div
          style={{ padding: "10px" }}
          className="border-b border-gray-100 bg-gray-50/50 flex justify-between gap-3 items-center"
        >
          <button
            style={{ padding: "8px" }}
            onClick={() => invalidate()}
            className="rounded-sm bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center justify-center shadow-sm"
            title="Refresh Table"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-white">
                <th
                  style={{ padding: "12px 15px" }}
                  className="text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>Extract_id</th>
                <th style={{ padding: "12px 15px" }}>Merchant.mer_name</th>
                <th style={{ padding: "12px 15px" }}>Extract_sn</th>
                <th style={{ padding: "12px 15px" }}>Extract_type</th>
                <th style={{ padding: "12px 15px" }}>Withdraw Info</th>
                <th style={{ padding: "12px 15px" }}>Extract_price</th>
                <th style={{ padding: "12px 15px" }}>Currency_type</th>
                <th style={{ padding: "12px 15px" }}>Status</th>
                <th style={{ padding: "12px 15px" }}>Creation Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <p className="text-gray-500 text-[13px] font-medium">
                        Loading withdrawal records...
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
                    No withdrawals found
                    {activeSearch
                      ? ` for "${activeSearch}"`
                      : " in this category"}
                    .
                  </td>
                </tr>
              ) : (
                records.map((r) => {
                  const isBankCard = r.extractType === "bankCard";

                  let dotColor = "bg-gray-400";
                  let statusText = "Under Review";
                  if (r.status === "withdrawn") {
                    dotColor = "bg-emerald-500";
                    statusText = "Withdrawn";
                  } else if (r.status === "rejected") {
                    dotColor = "bg-red-500";
                    statusText = "Rejected";
                  } else if (r.status === "underReview") {
                    dotColor = "bg-slate-700";
                    statusText = "Under Review";
                  }

                  return (
                    <tr
                      key={r._id}
                      className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500 font-mono"
                      >
                        {r._id.slice(-4).toUpperCase()}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-800 font-bold"
                      >
                        {r.merchant?.storeName || "—"}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600 font-mono"
                      >
                        {r.extractSn || "—"}
                      </td>

                      <td style={{ padding: "12px 15px" }}>
                        <span
                          className={`text-[12px] font-medium ${isBankCard ? "text-indigo-600" : "text-emerald-600"}`}
                        >
                          {isBankCard ? "Bank Card" : "Blockchain"}
                        </span>
                      </td>

                      {/* ✅ NEW: Copy button added to wallet address / bank card number */}
                      <td style={{ padding: "12px 15px" }}>
                        {isBankCard ? (
                          <div>
                            <p className="text-gray-800 text-[12px] font-bold">
                              {r.accountName}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p className="text-gray-500 text-[11px] font-mono">
                                {r.bankCardNumber} ({r.bankName})
                              </p>
                              {r.bankCardNumber && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      r.bankCardNumber,
                                      "Card number copied!",
                                    )
                                  }
                                  className="text-gray-300 hover:text-teal-500 transition-colors flex-shrink-0"
                                  title="Copy card number"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-800 text-[12px] font-bold">
                              {r.network}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <p
                                className="text-gray-500 text-[11px] font-mono max-w-[130px] truncate"
                                title={r.walletAddress}
                              >
                                {r.walletAddress}
                              </p>
                              {r.walletAddress && (
                                <button
                                  onClick={() =>
                                    copyToClipboard(
                                      r.walletAddress,
                                      "USDT address copied!",
                                    )
                                  }
                                  className="text-gray-300 hover:text-teal-500 transition-colors flex-shrink-0"
                                  title="Copy USDT address"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] font-bold text-gray-800"
                      >
                        {r.extractPrice?.toFixed(2) || "0.00"}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600"
                      >
                        {r.currencyType || "USD"}
                      </td>

                      <td style={{ padding: "12px 15px" }}>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          ></span>
                          <span
                            className={`text-[12px] font-bold ${r.status === "rejected" ? "text-red-600" : "text-slate-700"}`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {new Date(r.createdAt).toLocaleString("en-CA")}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center w-full">
                          {r.status === "underReview" ? (
                            <ActionBtn
                              color="#334155"
                              label="Review"
                              onClick={() => openReview(r)}
                            />
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              Processed
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
            Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} rows
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

      {/* ════════ REVIEW MODAL ════════ */}
      <Modal
        open={modal === "review"}
        onClose={closeModal}
        title="Review Withdrawal Request"
        icon={CheckCircle}
        width="max-w-md"
      >
        {selected && (
          <div className="space-y-4">
            <div
              className="rounded-md p-4 text-center mb-4"
              style={{
                background:
                  "linear-gradient(to bottom right, #f8fafc, #f1f5f9)",
                border: "1px solid #e2e8f0",
              }}
            >
              <p className="text-gray-500 text-[12px] font-medium mb-1 uppercase tracking-wider">
                Requested Amount
              </p>
              <p className="text-3xl font-black text-slate-800 tracking-tight">
                ${(selected.extractPrice || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm mb-4">
              <Field label="Merchant" value={selected.merchant?.storeName} />
              <Field
                label="Merchant ID"
                value={selected.merchant?.merchantId}
              />
              <Field label="Extract SN" value={selected.extractSn} mono />
              <Field
                label="Submitted"
                value={new Date(selected.createdAt).toLocaleString()}
              />
            </div>

            {/* Destination Info — with copy button in modal too */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
              <p className="text-blue-800 text-[11px] font-bold uppercase tracking-wider mb-2">
                Destination Info
              </p>
              {selected.extractType === "bankCard" ? (
                <div>
                  <p className="text-blue-900 font-bold text-[14px]">
                    {selected.bankName}
                  </p>
                  <p className="text-blue-700 text-[12px] mt-1">
                    Account: {selected.accountName}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <p className="text-blue-800 text-[14px] font-mono tracking-widest bg-white inline-block px-2 py-1 rounded border border-blue-200">
                      {selected.bankCardNumber}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selected.bankCardNumber,
                          "Card number copied!",
                        )
                      }
                      className="text-blue-400 hover:text-teal-600 transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-blue-900 font-bold text-[14px]">
                    {selected.network}
                  </p>
                  <div className="flex items-start gap-2 mt-2">
                    <p className="text-blue-800 text-[13px] font-mono break-all bg-white p-2 rounded border border-blue-200 flex-1">
                      {selected.walletAddress}
                    </p>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          selected.walletAddress,
                          "USDT address copied!",
                        )
                      }
                      className="text-blue-400 hover:text-teal-600 transition-colors mt-2 flex-shrink-0"
                      title="Copy USDT address"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              <label className="text-gray-600 text-[13px] font-medium">
                {isMerchantAdmin
                  ? "Cancel Reason (Required)"
                  : "Reject Reason (Required if rejecting)"}
              </label>
              <textarea
                style={{ padding: "8px" }}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={2}
                placeholder="Enter reason..."
                className="w-full rounded-sm border border-gray-300 text-[13px] focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm mb-4">
              <p className="text-amber-800 text-[12px] font-medium leading-tight">
                {isMerchantAdmin
                  ? "⚠️ Cancelling will immediately return the funds to the merchant's wallet balance."
                  : "⚠️ Approving finalizes the transfer. Rejecting returns funds to the merchant."}
              </p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                style={{ padding: "8px" }}
                onClick={() => cancel.mutate(selected._id)}
                disabled={
                  !rejectReason.trim() || cancel.isPending || approve.isPending
                }
                className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                {cancel.isPending
                  ? "Processing..."
                  : isMerchantAdmin
                    ? "Cancel Withdrawal"
                    : "Reject"}
              </button>

              {isSuperAdmin && (
                <button
                  style={{ padding: "8px" }}
                  onClick={() => approve.mutate(selected._id)}
                  disabled={approve.isPending || cancel.isPending}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                >
                  <CheckCircle className="w-4 h-4" />
                  {approve.isPending ? "Approving..." : "Approve"}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
