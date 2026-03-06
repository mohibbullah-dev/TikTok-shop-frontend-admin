// frontend-admin/src/pages/merchants/LevelApplication.jsx
//
// VERIFIED BACKEND ENDPOINTS:
// GET /api/vip/applications?status=&page=&limit=
//   → { applications, total, pages }
//   → applications[].merchant populated: { storeName, merchantId, vipLevel }
//   → applications[].status: 'pendingReview' | 'approved' | 'rejected'
//   → applications[].requestedLevel (Number)
//   → applications[].price (Number — cost deducted if approved)
//   → applications[].reviewedBy, reviewedAt
//   → superAdmin sees all | merchantAdmin sees their referred merchants only
//
// PUT /api/vip/applications/:id/review
//   body: { status: 'approved' | 'rejected' }
//   → if approved: deducts price from merchant.balance, sets merchant.vipLevel
//   → creates vipUpgrade Transaction
//   → superAdmin only
//
// VipApplication MODEL (exact fields):
//   merchant{storeName, merchantId, vipLevel}
//   requestedLevel(Number), price(Number)
//   status: pendingReview | approved | rejected
//   reviewedBy, reviewedAt, createdAt

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── VIP tier visuals ─────────────────────────────────────────
// const TIER = {
//   0: { emoji: "🥉", color: "#78716c", label: "Basic" },
//   1: { emoji: "🥉", color: "#b45309", label: "Bronze" },
//   2: { emoji: "🥈", color: "#6b7280", label: "Silver" },
//   3: { emoji: "🥇", color: "#d97706", label: "Gold" },
//   4: { emoji: "💎", color: "#0ea5e9", label: "Platinum" },
//   5: { emoji: "💠", color: "#7c3aed", label: "Diamond" },
//   6: { emoji: "👑", color: "#f02d65", label: "Crown" },
// };

// // ─── Status config ────────────────────────────────────────────
// const STATUS = {
//   pendingReview: { color: "#f59e0b", label: "Pending Review" },
//   approved: { color: "#22c55e", label: "Approved" },
//   rejected: { color: "#ef4444", label: "Rejected" },
// };

// const TABS = [
//   { key: "pendingReview", label: "Pending Review" },
//   { key: "approved", label: "Approved" },
//   { key: "rejected", label: "Rejected" },
// ];

// // ─── Shared atoms ─────────────────────────────────────────────
// const Badge = ({ color, children }) => (
//   <span
//     className="px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
//     style={{ background: color + "18", color }}
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
//         className="relative bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
//         style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center
//               text-gray-400 hover:bg-gray-200 transition-all"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// const InfoRow = ({ label, value }) => (
//   <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
//     <span className="text-gray-400 text-xs flex-shrink-0 w-32">{label}</span>
//     <span className="text-xs font-semibold text-right text-gray-800 flex-1">
//       {value || "—"}
//     </span>
//   </div>
// );

// export default function LevelApplication() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";
//   const isMerchantAdmin = user?.role === "merchantAdmin";

//   const [tab, setTab] = useState("pendingReview");
//   const [page, setPage] = useState(1);
//   const [selected, setSelected] = useState(null);
//   const [modal, setModal] = useState(false);
//   const limit = 10;

//   useEffect(() => setPage(1), [tab]);

//   // ── Fetch applications ─────────────────────────────────────
//   // GET /api/vip/applications?status=pendingReview&page=1&limit=10
//   // Returns: { applications, total, pages }
//   // merchant field populated: storeName, merchantId, vipLevel
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["vipApplications", tab, page],
//     queryFn: async () => {
//       const params = new URLSearchParams({ status: tab, page, limit });
//       const { data } = await API.get(`/vip/applications?${params}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const apps = data?.applications || [];
//   const total = data?.total || 0;
//   const totalPages = data?.pages || 1;

//   const invalidate = () => queryClient.invalidateQueries(["vipApplications"]);

//   // ── Review: PUT /api/vip/applications/:id/review ──────────
//   // body: { status: 'approved' | 'rejected' }
//   // if approved → deducts price from merchant balance + upgrades vipLevel
//   // superAdmin ONLY
//   const review = useMutation({
//     mutationFn: ({ id, status }) =>
//       API.put(`/vip/applications/${id}/review`, { status }),
//     onSuccess: (_, { status }) => {
//       invalidate();
//       queryClient.invalidateQueries(["merchants"]);
//       toast.success(
//         status === "approved"
//           ? "✅ VIP upgrade approved! Merchant level upgraded."
//           : "❌ Application rejected",
//       );
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Review failed"),
//   });

//   const openReview = (app) => {
//     setSelected(app);
//     setModal(true);
//   };
//   const closeModal = () => {
//     setModal(false);
//     setSelected(null);
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

//   const activeColor = STATUS[tab]?.color || "#6b7280";

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             VIP Upgrade Applications
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} {tab === "pendingReview" ? "pending" : tab} applications
//             {isMerchantAdmin && " · Showing your referred merchants only"}
//           </p>
//         </div>
//         <button
//           onClick={invalidate}
//           className="flex items-center gap-2 px-4 py-2.5 rounded-xl border
//             border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition-all self-start"
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

//       {/* merchantAdmin info banner */}
//       {isMerchantAdmin && (
//         <div
//           className="flex items-start gap-3 p-4 rounded-2xl"
//           style={{ background: "#eff6ff", border: "1px solid #bfdbfe" }}
//         >
//           <span className="text-xl flex-shrink-0">ℹ️</span>
//           <p className="text-blue-700 text-sm">
//             You can <strong>view</strong> VIP upgrade applications from your
//             referred merchants. Only <strong>Super Admin</strong> can approve or
//             reject applications.
//           </p>
//         </div>
//       )}

//       {/* ── Tabs ── */}
//       <div
//         className="bg-white rounded-2xl p-4"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="flex gap-2 flex-wrap">
//           {TABS.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => setTab(t.key)}
//               className="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
//               style={
//                 tab === t.key
//                   ? {
//                       background: STATUS[t.key].color,
//                       color: "white",
//                       boxShadow: `0 4px 12px ${STATUS[t.key].color}40`,
//                     }
//                   : { background: "#f3f4f6", color: "#6b7280" }
//               }
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ── Table ── */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 700 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Merchant",
//                   "Current VIP",
//                   "Requesting",
//                   "Cost",
//                   "Date",
//                   "Status",
//                   "Actions",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="px-4 py-3 text-left text-[11px] font-bold
//                       text-gray-400 uppercase tracking-wider whitespace-nowrap"
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {/* Loading skeleton */}
//               {isLoading &&
//                 [...Array(6)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(8)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}

//               {/* Empty */}
//               {!isLoading && apps.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-6xl">👑</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No {tab === "pendingReview" ? "pending" : tab}{" "}
//                         applications
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}

//               {/* Data rows */}
//               {!isLoading &&
//                 apps.map((app, i) => {
//                   const currentTier =
//                     TIER[app.merchant?.vipLevel ?? 0] || TIER[0];
//                   const requestedTier = TIER[app.requestedLevel] || TIER[0];
//                   const st = STATUS[app.status] || STATUS.pendingReview;

//                   return (
//                     <tr
//                       key={app._id}
//                       className="border-t border-gray-50 hover:bg-slate-50/60 transition-colors"
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
//                             className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden
//                             flex-shrink-0 flex items-center justify-center text-sm"
//                           >
//                             {app.merchant?.storeLogo ? (
//                               <img
//                                 src={app.merchant.storeLogo}
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                               />
//                             ) : (
//                               "🏪"
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-gray-800 text-xs font-semibold truncate max-w-[110px]">
//                               {app.merchant?.storeName || "—"}
//                             </p>
//                             <p className="text-gray-400 text-[10px]">
//                               ID: {app.merchant?.merchantId}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Current VIP level */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-1.5">
//                           <span className="text-base">{currentTier.emoji}</span>
//                           <div>
//                             <p
//                               className="text-xs font-bold"
//                               style={{ color: currentTier.color }}
//                             >
//                               VIP{app.merchant?.vipLevel ?? 0}
//                             </p>
//                             <p className="text-[10px] text-gray-400">
//                               {currentTier.label}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Requested level — with arrow */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-1.5">
//                           <span className="text-gray-300 text-xs">→</span>
//                           <span className="text-lg">{requestedTier.emoji}</span>
//                           <div>
//                             <p
//                               className="text-xs font-bold"
//                               style={{ color: requestedTier.color }}
//                             >
//                               VIP{app.requestedLevel}
//                             </p>
//                             <p className="text-[10px] text-gray-400">
//                               {requestedTier.label}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Cost — deducted from balance if approved */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-800 text-sm font-bold">
//                           ${(app.price || 0).toLocaleString()}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           from balance
//                         </p>
//                       </td>

//                       {/* Date */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-500 text-xs whitespace-nowrap">
//                           {new Date(app.createdAt).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "2-digit",
//                           })}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {new Date(app.createdAt).toLocaleTimeString("en-US", {
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
//                         {/* View / Review button */}
//                         <button
//                           onClick={() => openReview(app)}
//                           className="px-3 py-1.5 rounded-xl text-xs font-bold
//                           text-white transition-all hover:scale-105 active:scale-95"
//                           style={{
//                             background:
//                               tab === "pendingReview" && isSuperAdmin
//                                 ? "linear-gradient(135deg,#f02d65,#ff6035)"
//                                 : "#6b728018",
//                             color:
//                               tab === "pendingReview" && isSuperAdmin
//                                 ? "white"
//                                 : "#6b7280",
//                             boxShadow:
//                               tab === "pendingReview" && isSuperAdmin
//                                 ? "0 4px 10px rgba(240,45,101,0.3)"
//                                 : "none",
//                           }}
//                         >
//                           {tab === "pendingReview" && isSuperAdmin
//                             ? "Review"
//                             : "Details"}
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 flex-wrap gap-2">
//             <p className="text-gray-400 text-xs">
//               Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
//               of {total}
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage(1)}
//                 disabled={page === 1}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 «
//               </button>
//               <button
//                 onClick={() => setPage((p) => p - 1)}
//                 disabled={page === 1}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 ‹
//               </button>
//               {getPageNums().map((n) => (
//                 <button
//                   key={n}
//                   onClick={() => setPage(n)}
//                   className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
//                   style={
//                     n === page
//                       ? { background: activeColor, color: "white" }
//                       : { color: "#6b7280" }
//                   }
//                 >
//                   {n}
//                 </button>
//               ))}
//               <button
//                 onClick={() => setPage((p) => p + 1)}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 ›
//               </button>
//               <button
//                 onClick={() => setPage(totalPages)}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 text-sm"
//               >
//                 »
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ══ Review / Detail Modal ═════════════════════════════ */}
//       <Modal
//         open={modal}
//         onClose={closeModal}
//         title={
//           selected?.status === "pendingReview" && isSuperAdmin
//             ? "👑 Review VIP Application"
//             : "👑 Application Details"
//         }
//       >
//         {selected &&
//           (() => {
//             const currentTier =
//               TIER[selected.merchant?.vipLevel ?? 0] || TIER[0];
//             const requestedTier = TIER[selected.requestedLevel] || TIER[0];
//             const st = STATUS[selected.status];

//             return (
//               <div className="space-y-4">
//                 {/* Upgrade arrow visual */}
//                 <div className="flex items-center justify-center gap-4 py-4">
//                   {/* Current */}
//                   <div className="text-center">
//                     <div
//                       className="w-16 h-16 rounded-2xl flex items-center justify-center
//                       text-3xl mx-auto mb-2"
//                       style={{ background: currentTier.color + "18" }}
//                     >
//                       {currentTier.emoji}
//                     </div>
//                     <p
//                       className="text-xs font-bold"
//                       style={{ color: currentTier.color }}
//                     >
//                       VIP{selected.merchant?.vipLevel ?? 0}
//                     </p>
//                     <p className="text-[10px] text-gray-400">
//                       {currentTier.label}
//                     </p>
//                   </div>

//                   {/* Arrow */}
//                   <div className="flex flex-col items-center">
//                     <svg
//                       className="w-8 h-8 text-gray-300"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                       strokeWidth="2"
//                     >
//                       <path d="M5 12h14M12 5l7 7-7 7" />
//                     </svg>
//                   </div>

//                   {/* Requested */}
//                   <div className="text-center">
//                     <div
//                       className="w-16 h-16 rounded-2xl flex items-center justify-center
//                       text-3xl mx-auto mb-2"
//                       style={{ background: requestedTier.color + "18" }}
//                     >
//                       {requestedTier.emoji}
//                     </div>
//                     <p
//                       className="text-xs font-bold"
//                       style={{ color: requestedTier.color }}
//                     >
//                       VIP{selected.requestedLevel}
//                     </p>
//                     <p className="text-[10px] text-gray-400">
//                       {requestedTier.label}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Application info */}
//                 <div
//                   className="rounded-xl px-4 py-2"
//                   style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//                 >
//                   <InfoRow
//                     label="Merchant"
//                     value={selected.merchant?.storeName}
//                   />
//                   <InfoRow
//                     label="Merchant ID"
//                     value={selected.merchant?.merchantId}
//                   />
//                   <InfoRow
//                     label="Current Level"
//                     value={`VIP${selected.merchant?.vipLevel ?? 0} — ${currentTier.label}`}
//                   />
//                   <InfoRow
//                     label="Requested Level"
//                     value={`VIP${selected.requestedLevel} — ${requestedTier.label}`}
//                   />
//                   <InfoRow label="Status" value={st?.label} />
//                   <InfoRow
//                     label="Applied On"
//                     value={new Date(selected.createdAt).toLocaleString()}
//                   />
//                   {selected.reviewedAt && (
//                     <InfoRow
//                       label="Reviewed On"
//                       value={new Date(selected.reviewedAt).toLocaleString()}
//                     />
//                   )}
//                 </div>

//                 {/* Cost card */}
//                 <div
//                   className="rounded-xl p-4 text-center"
//                   style={{
//                     background: "linear-gradient(135deg,#fdf2f8,#fce7f3)",
//                     border: "1px solid #fbcfe8",
//                   }}
//                 >
//                   <p className="text-gray-400 text-xs mb-1">
//                     Balance deduction if approved
//                   </p>
//                   <p
//                     className="text-3xl font-extrabold"
//                     style={{ color: "#f02d65" }}
//                   >
//                     ${(selected.price || 0).toLocaleString()}
//                   </p>
//                   <p className="text-gray-400 text-xs mt-1">
//                     deducted from merchant's wallet balance
//                   </p>
//                 </div>

//                 {/* Warning */}
//                 {selected.status === "pendingReview" && isSuperAdmin && (
//                   <div
//                     className="p-3 rounded-xl"
//                     style={{
//                       background: "#fffbeb",
//                       border: "1px solid #fef08a",
//                     }}
//                   >
//                     <p className="text-yellow-700 text-xs">
//                       ⚠️ Approving will immediately deduct{" "}
//                       <strong>${(selected.price || 0).toLocaleString()}</strong>{" "}
//                       from the merchant's balance and upgrade them to{" "}
//                       <strong>VIP{selected.requestedLevel}</strong>. This cannot
//                       be undone.
//                     </p>
//                   </div>
//                 )}

//                 {/* Action buttons — only for pending + superAdmin */}
//                 {selected.status === "pendingReview" && isSuperAdmin ? (
//                   <div className="grid grid-cols-2 gap-3 pt-1">
//                     <button
//                       onClick={() =>
//                         review.mutate({ id: selected._id, status: "rejected" })
//                       }
//                       disabled={review.isPending}
//                       className="py-3 rounded-xl font-bold text-sm text-white
//                       transition-all active:scale-95 disabled:opacity-50"
//                       style={{
//                         background: "#ef4444",
//                         boxShadow: "0 4px 12px rgba(239,68,68,0.3)",
//                       }}
//                     >
//                       {review.isPending ? "Processing..." : "✕ Reject"}
//                     </button>
//                     <button
//                       onClick={() =>
//                         review.mutate({ id: selected._id, status: "approved" })
//                       }
//                       disabled={review.isPending}
//                       className="py-3 rounded-xl font-bold text-sm text-white
//                       transition-all active:scale-95 disabled:opacity-50"
//                       style={{
//                         background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                         boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
//                       }}
//                     >
//                       {review.isPending ? "Processing..." : "✓ Approve"}
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={closeModal}
//                     className="w-full py-3 rounded-xl border border-gray-200
//                     text-gray-500 text-sm hover:bg-gray-50 transition-all"
//                   >
//                     Close
//                   </button>
//                 )}
//               </div>
//             );
//           })()}
//       </Modal>
//     </div>
//   );
// }

/////////////////////////// ===================== latest version (by gemeni) =====================//////////////////

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
export default function LevelApplication() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  const [tab, setTab] = useState(""); // "" = All, pendingReview, approved, rejected
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Visual Filters (Matches demo, backend currently filters only by status, but we send them just in case)
  const [idInput, setIdInput] = useState("");
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const [merchantNameInput, setMerchantNameInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => setPage(1), [tab]);

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vipApplications", tab, page, limit],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      const { data } = await API.get(`/vip/applications?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const apps = data?.applications || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["vipApplications"]);

  // ── Approve/Reject Mutation ──────────────────────────────────
  const review = useMutation({
    mutationFn: ({ id, status }) =>
      API.put(`/vip/applications/${id}/review`, { status }),
    onSuccess: (_, { status }) => {
      invalidate();
      queryClient.invalidateQueries(["merchants"]);
      toast.success(
        status === "approved"
          ? "VIP upgrade approved!"
          : "Application rejected",
      );
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Review failed"),
  });

  const openReview = (app) => {
    setSelected(app);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
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

  const tabs = [
    { key: "", label: "All" },
    { key: "pendingReview", label: "Under Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Level Applications
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {total.toLocaleString()} applications found.
          </p>
        </div>
      </div>

      {isMerchantAdmin && (
        <div
          style={{ padding: "10px", marginBottom: "15px" }}
          className="bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-800">
            You can <strong>view</strong> applications from your assigned
            merchants. Only <strong>Super Admins</strong> can approve/reject.
          </p>
        </div>
      )}

      {/* ── Top Tabs (Demo Style) ── */}
      <div
        style={{ padding: "5px", marginBottom: "15px" }}
        className="bg-white rounded-md p-4 border border-gray-100 w-full shadow-sm"
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

      {/* ── Visual Filter Grid (Matches Demo) ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <FormInput
            label="ID"
            placeholder="Application ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant ID"
            placeholder="Merchant ID"
            value={merchantIdInput}
            onChange={(e) => setMerchantIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant Name"
            placeholder="Search Merchant"
            value={merchantNameInput}
            onChange={(e) => setMerchantNameInput(e.target.value)}
          />
          <FormSelect
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">Choose</option>
            <option value="pendingReview">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </FormSelect>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            style={{ padding: "5px 20px" }}
            onClick={() => {
              setIdInput("");
              setMerchantIdInput("");
              setMerchantNameInput("");
              setStatusInput("");
              setPage(1);
            }}
            className="bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-sm hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            style={{ padding: "5px 20px" }}
            onClick={() => invalidate()}
            className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>

      {/* ── Data Table Container ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div
          style={{ padding: "10px" }}
          className="border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"
        >
          <button
            style={{ padding: "8px" }}
            onClick={() => invalidate()}
            className="rounded-sm bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center justify-center shadow-sm"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-white">
                <th
                  style={{ padding: "12px 15px" }}
                  className="text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>ID</th>
                <th style={{ padding: "12px 15px" }}>Merchant ID</th>
                <th style={{ padding: "12px 15px" }}>Merchant Name</th>
                <th style={{ padding: "12px 15px" }}>Level</th>
                <th style={{ padding: "12px 15px" }}>Price</th>
                <th style={{ padding: "12px 15px" }}>Status</th>
                <th style={{ padding: "12px 15px" }}>Creation Time</th>
                <th style={{ padding: "12px 15px" }}>Audit Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[13px]">
                        Loading applications...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                apps.map((app) => {
                  let dotColor = "bg-gray-400";
                  let statusText = "Pending Review";
                  if (app.status === "approved") {
                    dotColor = "bg-emerald-500";
                    statusText = "Approved";
                  } else if (app.status === "rejected") {
                    dotColor = "bg-red-500";
                    statusText = "Rejected";
                  } else if (app.status === "pendingReview") {
                    dotColor = "bg-slate-700";
                    statusText = "Pending Review";
                  }

                  return (
                    <tr
                      key={app._id}
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
                        {app._id.slice(-4).toUpperCase()}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600 font-medium"
                      >
                        {app.merchant?.merchantId || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-800 font-bold"
                      >
                        {app.merchant?.storeName || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] font-bold text-teal-600"
                      >
                        VIP {app.requestedLevel}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] font-bold text-gray-800"
                      >
                        ${(app.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 15px" }}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          ></span>
                          <span
                            className={`text-[12px] font-bold ${app.status === "rejected" ? "text-red-600" : "text-slate-700"}`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {new Date(app.createdAt).toLocaleString("en-CA")}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {app.reviewedAt
                          ? new Date(app.reviewedAt).toLocaleString("en-CA")
                          : "None"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center w-full">
                          {app.status === "pendingReview" && isSuperAdmin ? (
                            <ActionBtn
                              color="#334155"
                              label="Review"
                              onClick={() => openReview(app)}
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
        open={modal}
        onClose={closeModal}
        title="Review VIP Application"
        icon={CheckCircle}
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm mb-4">
              <Field label="Merchant" value={selected.merchant?.storeName} />
              <Field
                label="Merchant ID"
                value={selected.merchant?.merchantId}
              />
              <Field
                label="Current Level"
                value={`VIP ${selected.merchant?.vipLevel ?? 0}`}
              />
              <Field
                label="Requested Level"
                value={`VIP ${selected.requestedLevel}`}
                highlight
              />
              <Field
                label="Upgrade Price"
                value={`$${(selected.price || 0).toLocaleString()}`}
              />
              <Field
                label="Applied On"
                value={new Date(selected.createdAt).toLocaleString()}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm mb-4">
              <p className="text-amber-800 text-[12px] font-medium leading-tight">
                ⚠️ Approving will immediately deduct{" "}
                <strong>${(selected.price || 0).toLocaleString()}</strong> from
                the merchant's balance and upgrade their VIP tier.
              </p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                style={{ padding: "8px" }}
                onClick={() =>
                  review.mutate({ id: selected._id, status: "rejected" })
                }
                disabled={review.isPending}
                className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>

              <button
                style={{ padding: "8px" }}
                onClick={() =>
                  review.mutate({ id: selected._id, status: "approved" })
                }
                disabled={review.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle className="w-4 h-4" /> Approve Upgrade
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
