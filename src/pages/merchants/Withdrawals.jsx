// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── Shared UI atoms ──────────────────────────────────────────
// const Badge = ({ color, children }) => (
//   <span
//     className="px-2.5 py-1 rounded-full text-[11px] font-bold"
//     style={{ background: color + "18", color }}
//   >
//     {children}
//   </span>
// );

// const Modal = ({ open, onClose, title, children }) => {
//   if (!open) return null;
//   return (
//     <div
//       className="fixed inset-0 z-50 flex items-center
//       justify-center p-4"
//     >
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

// // ─── Info row inside modal ────────────────────────────────────
// const InfoRow = ({ label, value, mono, highlight }) => (
//   <div
//     className="flex items-center justify-between py-2.5
//     border-b border-gray-50 last:border-0"
//   >
//     <span className="text-gray-400 text-xs flex-shrink-0 w-28">{label}</span>
//     <span
//       className={`text-xs font-bold text-right flex-1 ml-2
//       ${mono ? "font-mono" : ""}
//       ${highlight ? "text-pink-600 text-sm" : "text-gray-800"}`}
//     >
//       {value || "—"}
//     </span>
//   </div>
// );

// // ─── Status config ────────────────────────────────────────────
// const STATUS = {
//   pending: { color: "#f59e0b", label: "Under Review" },
//   approved: { color: "#22c55e", label: "Approved" },
//   rejected: { color: "#ef4444", label: "Rejected" },
//   withdrawn: { color: "#6366f1", label: "Withdrawn" },
// };

// export default function Withdrawals() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";
//   const isMerchantAdmin = user?.role === "merchantAdmin";

//   const [tab, setTab] = useState("pending");
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [modal, setModal] = useState(null);
//   const [selected, setSelected] = useState(null);
//   const [rejectNote, setRejectNote] = useState("");
//   const limit = 10;

//   useEffect(() => setPage(1), [tab, search]);

//   // ── Fetch ──────────────────────────────────────────────────
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["withdrawals", tab, page, search],
//     queryFn: async () => {
//       const p = new URLSearchParams({
//         page,
//         limit,
//         status: tab,
//         ...(search && { search }),
//       });
//       const { data } = await API.get(`/withdrawal?${p}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const records = data?.withdrawals || data?.records || [];
//   const total = data?.total || 0;
//   const totalPages = Math.ceil(total / limit);

//   // ── Approve (superAdmin only) ──────────────────────────────
//   const approve = useMutation({
//     mutationFn: (id) => API.put(`/withdrawal/${id}/approve`),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["withdrawals"]);
//       queryClient.invalidateQueries(["pendingWithdrawals"]);
//       toast.success("Withdrawal approved! ✅");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Reject / Cancel ────────────────────────────────────────
//   // superAdmin → reject (balance NOT returned)
//   // merchantAdmin → cancel (balance IS returned)
//   // const reject = useMutation({
//   //   mutationFn: (id) => {
//   //     const endpoint = isMerchantAdmin
//   //       ? `/withdrawal/${id}/cancel`
//   //       : `/withdrawal/${id}/reject`;
//   //     return API.put(endpoint, { note: rejectNote });
//   //   },
//   //   onSuccess: () => {
//   //     queryClient.invalidateQueries(["withdrawals"]);
//   //     queryClient.invalidateQueries(["pendingWithdrawals"]);
//   //     toast.success(
//   //       isMerchantAdmin
//   //         ? "Withdrawal cancelled — balance returned to merchant"
//   //         : "Withdrawal rejected",
//   //     );
//   //     closeModal();
//   //   },
//   //   onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   // });

//   const cancel = useMutation({
//     mutationFn: (id) =>
//       API.put(`/withdrawal/${id}/cancel`, { note: cancelNote }),
//     onSuccess: () => {
//       queryClient.invalidateQueries(["withdrawals"]);
//       toast.success("Withdrawal cancelled — balance returned to merchant");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   const openReview = (r) => {
//     setSelected(r);
//     setModal("review");
//   };
//   const closeModal = () => {
//     setModal(null);
//     setSelected(null);
//     setRejectNote("");
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
//     { key: "pending", label: "Under Review", color: "#f59e0b" },
//     { key: "approved", label: "Approved", color: "#22c55e" },
//     { key: "rejected", label: "Rejected", color: "#ef4444" },
//     { key: "withdrawn", label: "Withdrawn", color: "#6366f1" },
//   ];

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1
//             className="text-xl font-extrabold text-gray-800
//             tracking-tight"
//           >
//             Withdrawal Management
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} records ·{" "}
//             {isMerchantAdmin
//               ? "You can cancel withdrawals (balance returned)"
//               : "Approve or reject merchant withdrawal requests"}
//           </p>
//         </div>
//         <button
//           onClick={() => queryClient.invalidateQueries(["withdrawals"])}
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

//       {/* ── Role notice for merchantAdmin ── */}
//       {isMerchantAdmin && (
//         <div
//           className="flex items-start gap-3 p-4 rounded-2xl"
//           style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
//         >
//           <span className="text-xl flex-shrink-0">ℹ️</span>
//           <p className="text-blue-700 text-sm">
//             As <strong>Merchant Admin</strong>, you can only
//             <strong> cancel</strong> pending withdrawals for your merchants.
//             When cancelled, the balance is automatically returned to the
//             merchant's account.
//           </p>
//         </div>
//       )}

//       {/* ── Tabs + Search ── */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-4"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* Tabs */}
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
//             placeholder="Search by extract SN or store name..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-xl border
//               border-gray-200 text-sm outline-none
//               focus:border-pink-400 bg-gray-50 focus:bg-white
//               transition-all max-w-sm"
//           />
//         </div>
//       </div>

//       {/* ── Table ── */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 880 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Merchant",
//                   "Extract SN",
//                   "Method",
//                   "Withdraw Info",
//                   "Amount",
//                   "Date",
//                   "Status",
//                   "Actions",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="px-4 py-3 text-left
//                     text-[11px] font-bold text-gray-400 uppercase
//                     tracking-wider whitespace-nowrap"
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
//                     {[...Array(9)].map((_, j) => (
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
//                   <td colSpan={9} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-5xl">💸</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No {tab} withdrawals
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               ) : (
//                 records.map((r, i) => {
//                   const st = STATUS[r.status] || STATUS.pending;
//                   const isBankCard = r.extractType === "bankCard";
//                   const isBlockchain = r.extractType === "blockchain";

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
//                               className="text-gray-800 text-xs
//                             font-semibold truncate max-w-[110px]"
//                             >
//                               {r.merchant?.storeName || "—"}
//                             </p>
//                             <p className="text-gray-400 text-[10px]">
//                               {r.merchant?.merchantId}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Extract SN */}
//                       <td className="px-4 py-3.5">
//                         <span
//                           className="text-gray-500 text-[10px]
//                         font-mono"
//                         >
//                           {r.extractSn?.slice(-12) || r._id?.slice(-8)}
//                         </span>
//                       </td>

//                       {/* Method */}
//                       <td className="px-4 py-3.5">
//                         <Badge color={isBankCard ? "#6366f1" : "#f59e0b"}>
//                           {isBankCard ? "🏦 Bank Card" : "₿ Blockchain"}
//                         </Badge>
//                       </td>

//                       {/* Withdraw info */}
//                       <td className="px-4 py-3.5">
//                         {isBankCard ? (
//                           <div>
//                             <p
//                               className="text-gray-700 text-xs
//                             font-semibold"
//                             >
//                               {r.bankName || r.extractInfo?.bankName}
//                             </p>
//                             <p
//                               className="text-gray-400 text-[10px]
//                             font-mono"
//                             >
//                               {r.cardNumber || r.extractInfo?.cardNumber}
//                             </p>
//                           </div>
//                         ) : (
//                           <p
//                             className="text-gray-500 text-[10px]
//                           font-mono truncate max-w-[120px]"
//                           >
//                             {r.walletAddress || r.extractInfo?.walletAddress}
//                           </p>
//                         )}
//                       </td>

//                       {/* Amount */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-800 text-sm font-bold">
//                           ${(r.extractPrice || 0).toFixed(2)}
//                         </span>
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

//                       {/* Actions */}
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
//                               r.cancelledBy?.username ||
//                               "—"}
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
//             className="flex items-center justify-between px-5
//             py-3 border-t border-gray-100"
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

//       {/* ═══════════ REVIEW MODAL ═══════════ */}
//       <Modal
//         open={modal === "review"}
//         onClose={closeModal}
//         title="💸 Review Withdrawal Request"
//       >
//         {selected && (
//           <div className="space-y-4">
//             {/* Amount highlight */}
//             <div
//               className="rounded-xl p-4 text-center"
//               style={{
//                 background: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
//                 border: "1px solid #fbcfe8",
//               }}
//             >
//               <p className="text-gray-500 text-xs mb-1">Withdrawal Amount</p>
//               <p
//                 className="text-3xl font-extrabold"
//                 style={{ color: "#f02d65" }}
//               >
//                 ${(selected.extractPrice || 0).toFixed(2)}
//               </p>
//             </div>

//             {/* Info block */}
//             <div
//               className="rounded-xl px-4 py-2"
//               style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//             >
//               <InfoRow label="Merchant" value={selected.merchant?.storeName} />
//               <InfoRow
//                 label="Merchant ID"
//                 value={selected.merchant?.merchantId}
//               />
//               <InfoRow
//                 label="Extract SN"
//                 value={selected.extractSn?.slice(-16)}
//                 mono
//               />
//               <InfoRow
//                 label="Method"
//                 value={
//                   selected.extractType === "bankCard"
//                     ? "🏦 Bank Card"
//                     : "₿ Blockchain"
//                 }
//               />
//               <InfoRow
//                 label="Submitted"
//                 value={new Date(selected.createdAt).toLocaleString()}
//               />
//             </div>

//             {/* Withdrawal destination */}
//             <div>
//               <p
//                 className="text-gray-500 text-xs font-semibold
//                 uppercase tracking-wide mb-2"
//               >
//                 Destination
//               </p>
//               {selected.extractType === "bankCard" ? (
//                 <div
//                   className="rounded-xl p-4"
//                   style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
//                 >
//                   <p className="text-blue-800 font-bold text-sm">
//                     {selected.bankName || selected.extractInfo?.bankName}
//                   </p>
//                   <p className="text-blue-600 text-xs mt-1">
//                     Account:{" "}
//                     {selected.accountName || selected.extractInfo?.accountName}
//                   </p>
//                   <p
//                     className="text-blue-700 text-sm font-mono
//                     font-bold tracking-widest mt-1.5"
//                   >
//                     {selected.cardNumber || selected.extractInfo?.cardNumber}
//                   </p>
//                 </div>
//               ) : (
//                 <div
//                   className="rounded-xl p-4"
//                   style={{ background: "#fffbeb", border: "1px solid #fde68a" }}
//                 >
//                   <p
//                     className="text-yellow-700 text-xs font-semibold
//                     mb-1"
//                   >
//                     USDT Wallet Address
//                   </p>
//                   <p
//                     className="text-yellow-800 text-xs font-mono
//                     break-all"
//                   >
//                     {selected.walletAddress ||
//                       selected.extractInfo?.walletAddress}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Reject note */}
//             <div>
//               <label
//                 className="text-gray-500 text-xs font-medium
//                 block mb-1.5"
//               >
//                 {isMerchantAdmin
//                   ? "Cancel Note (required)"
//                   : "Reject Note (required if rejecting)"}
//               </label>
//               <textarea
//                 value={rejectNote}
//                 onChange={(e) => setRejectNote(e.target.value)}
//                 rows={2}
//                 placeholder="Enter reason..."
//                 className="w-full px-4 py-2.5 rounded-xl border
//                   border-gray-200 text-sm text-gray-700 outline-none
//                   focus:border-pink-400 transition-all resize-none
//                   bg-gray-50 focus:bg-white"
//               />
//             </div>

//             {/* Warning: balance impact */}
//             <div
//               className="p-3 rounded-xl"
//               style={{ background: "#fefce8", border: "1px solid #fef08a" }}
//             >
//               <p className="text-yellow-700 text-xs">
//                 {isMerchantAdmin
//                   ? "⚠️ Cancelling will return $" +
//                     (selected.extractPrice || 0).toFixed(2) +
//                     " to merchant's balance."
//                   : "⚠️ Approving will mark this withdrawal as processed. Rejecting returns the balance to merchant."}
//               </p>
//             </div>

//             {/* Buttons */}
//             <div
//               className={`grid gap-3 pt-1 ${isSuperAdmin ? "grid-cols-2" : "grid-cols-1"}`}
//             >
//               {/* Cancel / Reject */}
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
//                 {reject.isPending
//                   ? "Processing..."
//                   : isMerchantAdmin
//                     ? "✕ Cancel Withdrawal"
//                     : "✕ Reject"}
//               </button>

//               {/* Approve — superAdmin only */}
//               {isSuperAdmin && (
//                 <button
//                   onClick={() => approve.mutate(selected._id)}
//                   disabled={approve.isPending}
//                   className="py-3 rounded-xl font-bold text-sm
//                     text-white transition-all disabled:opacity-50
//                     active:scale-95"
//                   style={{
//                     background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                     boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
//                   }}
//                 >
//                   {approve.isPending ? "Approving..." : "✓ Approve"}
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

//////////////////////// ========================== latest version (by gemeni pro) ==============================///////////////////////////

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import { RefreshCcw, Loader2, CheckCircle, XCircle, Info } from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
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
      className={`text-[13px] font-semibold text-right break-all flex-1 ml-2
      ${mono ? "font-mono tracking-tight" : ""}
      ${highlight ? "text-red-600 font-bold" : "text-gray-900"}`}
    >
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
export default function Withdrawals() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  const [tab, setTab] = useState(""); // "" = All, "underReview", "withdrawn", "rejected"
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [rejectReason, setRejectReason] = useState(""); // Maps to backend 'reason'
  const limit = 10;

  useEffect(() => setPage(1), [tab]);

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["withdrawals", tab, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      const { data } = await API.get(`/withdrawal?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const records = data?.withdrawals || data?.records || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  const invalidate = () => {
    queryClient.invalidateQueries(["withdrawals"]);
  };

  // ── Approve (superAdmin only) ──────────────────────────────
  const approve = useMutation({
    mutationFn: (id) => API.put(`/withdrawal/${id}/approve`),
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawal approved successfully! ✅");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to approve"),
  });

  // ── Cancel/Reject ──────────────────────────────────────────
  // The backend controller expects { reason: "..." }
  const cancel = useMutation({
    mutationFn: (id) =>
      API.put(`/withdrawal/${id}/cancel`, { reason: rejectReason }),
    onSuccess: () => {
      invalidate();
      toast.success("Withdrawal cancelled — balance returned to merchant.");
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
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
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

      {/* ── Top Control Bar (Demo Style Tabs) ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-4 border border-gray-100 mb-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-x-auto w-full">
          {tabs.map((t) => (
            <button
              key={t.key}
              style={{ padding: "8px 24px" }}
              onClick={() => setTab(t.key)}
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
      </div>

      {/* ── Data Table Container ── */}
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
              {/* Exact Headers mapped to Demo */}
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
                    No withdrawals found in this category.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => {
                  const isBankCard = r.extractType === "bankCard";

                  // Status Dot Logic mapping to Demo
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

                      <td style={{ padding: "12px 15px" }}>
                        {isBankCard ? (
                          <div>
                            <p className="text-gray-800 text-[12px] font-bold">
                              {r.accountName}
                            </p>
                            <p className="text-gray-500 text-[11px] font-mono mt-0.5">
                              {r.bankCardNumber} ({r.bankName})
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-gray-800 text-[12px] font-bold">
                              {r.network}
                            </p>
                            <p
                              className="text-gray-500 text-[11px] font-mono mt-0.5 max-w-[140px] truncate"
                              title={r.walletAddress}
                            >
                              {r.walletAddress}
                            </p>
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
                              color="#334155" // Slate 700 to match demo's "Review" button
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

      {/* ════════════ REVIEW MODAL ════════════ */}
      <Modal
        open={modal === "review"}
        onClose={closeModal}
        title="Review Withdrawal Request"
        icon={CheckCircle}
        width="max-w-md"
      >
        {selected && (
          <div className="space-y-4">
            {/* Amount highlight */}
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

            {/* Destination Info */}
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
                  <p className="text-blue-800 text-[14px] font-mono tracking-widest mt-2 bg-white inline-block px-2 py-1 rounded border border-blue-200">
                    {selected.bankCardNumber}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-blue-900 font-bold text-[14px]">
                    {selected.network}
                  </p>
                  <p className="text-blue-800 text-[13px] font-mono break-all mt-2 bg-white p-2 rounded border border-blue-200">
                    {selected.walletAddress}
                  </p>
                </div>
              )}
            </div>

            {/* Reject/Cancel Reason Input */}
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

            {/* Warning Note */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm mb-4">
              <p className="text-amber-800 text-[12px] font-medium leading-tight">
                {isMerchantAdmin
                  ? "⚠️ Cancelling will immediately return the funds to the merchant's wallet balance."
                  : "⚠️ Approving finalizes the transfer. Rejecting returns funds to the merchant."}
              </p>
            </div>

            {/* Action Buttons */}
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
