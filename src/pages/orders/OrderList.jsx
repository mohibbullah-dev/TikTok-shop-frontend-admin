// frontend-admin/src/pages/orders/OrderList.jsx
//
// VERIFIED AGAINST BACKEND:
// GET  /api/orders?status=&orderSn=&page=&limit=  → { orders, total, pages, summary:{totalCost,totalEarnings} }
// PUT  /api/orders/bulk-ship                       → ships pendingShipment→shipped (superAdmin+dispatchAdmin)
// PUT  /api/orders/bulk-complete                   → completes all shipped + adds profits (superAdmin)
// PUT  /api/orders/:id/confirm-profit              → single order complete + profit to merchant (superAdmin)
// PUT  /api/orders/:id/cancel                      → cancel order (superAdmin)
// GET  /api/orders/:id                             → single order detail (all admin roles)
//
// ORDER MODEL FIELDS (exact):
//   orderSn, buyerName, phoneNumber, shippingAddress, country
//   totalCost, sellingPrice, earnings, status, profitConfirmed
//   trackingNumber, logisticsInfo[], pickedUpAt, completedAt
//   products[]: { title, image, quantity, price }
//   merchant: { storeName, merchantId }
//
// STATUS ENUM: pendingPayment | pendingShipment | shipped | received | completed | cancelled | refunding
//
// REDUX: useSelector(s => s.auth) → { user, token }
// AXIOS: import API from '../../api/axios'

//======================== second code-version starts from here ======================================

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── Tiny shared atoms ────────────────────────────────────────
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
//         className="relative bg-white rounded-2xl w-full max-w-lg
//           max-h-[90vh] overflow-y-auto"
//         style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//               justify-center text-gray-400 hover:bg-gray-200 transition-all"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// const InfoRow = ({ label, value, mono }) => (
//   <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
//     <span className="text-gray-400 text-xs flex-shrink-0 w-32">{label}</span>
//     <span
//       className={`text-xs font-semibold text-right text-gray-800 flex-1 ${mono ? "font-mono break-all" : ""}`}
//     >
//       {value || "—"}
//     </span>
//   </div>
// );

// // ─── Status map — using exact enum values from Order model ────
// const STATUS_MAP = {
//   pendingPayment: { color: "#f59e0b", label: "Pending Pickup" },
//   pendingShipment: { color: "#3b82f6", label: "Processing" },
//   shipped: { color: "#8b5cf6", label: "Shipped" },
//   received: { color: "#06b6d4", label: "Received" },
//   completed: { color: "#22c55e", label: "Completed" },
//   cancelled: { color: "#ef4444", label: "Cancelled" },
//   refunding: { color: "#f97316", label: "Refunding" },
// };

// const TABS = [
//   { key: "all", label: "All" },
//   { key: "pendingPayment", label: "Pending Pickup" },
//   { key: "pendingShipment", label: "Processing" },
//   { key: "shipped", label: "Shipped" },
//   { key: "received", label: "Received" },
//   { key: "completed", label: "Completed" },
//   { key: "cancelled", label: "Cancelled" },
// ];

// export default function OrderList() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";
//   const isDispatchAdmin = user?.role === "dispatchAdmin";
//   const isMerchantAdmin = user?.role === "merchantAdmin";

//   // ── State ──────────────────────────────────────────────────
//   const [tab, setTab] = useState("all");
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [detailOrder, setDetailOrder] = useState(null);
//   const limit = 10;

//   // Reset page when tab or search changes
//   useEffect(() => setPage(1), [tab, search]);

//   // ── Fetch orders ───────────────────────────────────────────
//   // Backend: GET /api/orders?status=&orderSn=&page=&limit=
//   // Returns: { orders, total, pages, summary: { totalCost, totalEarnings } }
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["adminOrders", tab, page, search],
//     queryFn: async () => {
//       const params = new URLSearchParams({ page, limit });
//       if (tab !== "all") params.set("status", tab);
//       if (search.trim()) params.set("orderSn", search.trim());
//       const { data } = await API.get(`/orders?${params}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   // Exact field names from backend response
//   const orders = data?.orders || [];
//   const total = data?.total || 0;
//   const totalPages = data?.pages || 1;
//   const totalCost = data?.summary?.totalCost || 0;
//   const totalEarnings = data?.summary?.totalEarnings || 0;

//   const invalidate = () => queryClient.invalidateQueries(["adminOrders"]);

//   // ── confirm-profit: PUT /api/orders/:id/confirm-profit ─────
//   // superAdmin only — completes the order and adds earnings to merchant balance
//   const confirmProfit = useMutation({
//     mutationFn: (id) => API.put(`/orders/${id}/confirm-profit`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Profit confirmed! Balance added to merchant ✅");
//       setDetailOrder(null);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── cancel: PUT /api/orders/:id/cancel ─────────────────────
//   // superAdmin only — if merchant already picked up, refunds totalCost
//   const cancelOrder = useMutation({
//     mutationFn: (id) => API.put(`/orders/${id}/cancel`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Order cancelled");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── bulk-ship: PUT /api/orders/bulk-ship ───────────────────
//   // superAdmin + dispatchAdmin — ships ALL pendingShipment orders → shipped
//   const bulkShip = useMutation({
//     mutationFn: () => API.put("/orders/bulk-ship", {}),
//     onSuccess: (res) => {
//       invalidate();
//       toast.success(`${res.data?.count || 0} orders shipped! 📦`);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── bulk-complete: PUT /api/orders/bulk-complete ───────────
//   // superAdmin only — completes ALL shipped orders + adds profits to merchants
//   const bulkComplete = useMutation({
//     mutationFn: () => API.put("/orders/bulk-complete", {}),
//     onSuccess: (res) => {
//       invalidate();
//       toast.success(res.data?.message || "All shipped orders completed!");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Pagination helpers ─────────────────────────────────────
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

//   // ── Active tab color ───────────────────────────────────────
//   const activeColor =
//     tab === "all" ? "#6b7280" : STATUS_MAP[tab]?.color || "#6b7280";

//   return (
//     <div className="space-y-4">
//       {/* ══ Page header ══════════════════════════════════════ */}
//       <div
//         className="flex flex-col sm:flex-row sm:items-start
//         justify-between gap-3"
//       >
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Order Management
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
//         </div>

//         {/* Action buttons row */}
//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Bulk Ship — superAdmin + dispatchAdmin */}
//           {(isSuperAdmin || isDispatchAdmin) && (
//             <button
//               onClick={() => bulkShip.mutate()}
//               disabled={bulkShip.isPending}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                 text-xs font-bold text-white transition-all
//                 hover:scale-105 active:scale-95 disabled:opacity-50
//                 disabled:cursor-not-allowed"
//               style={{
//                 background: "linear-gradient(135deg,#3b82f6,#2563eb)",
//                 boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
//               }}
//             >
//               {bulkShip.isPending ? (
//                 <svg
//                   className="animate-spin w-3.5 h-3.5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8H4z"
//                   />
//                 </svg>
//               ) : (
//                 "📦"
//               )}
//               One-Click Ship
//             </button>
//           )}

//           {/* Bulk Complete — superAdmin only */}
//           {isSuperAdmin && (
//             <button
//               onClick={() => bulkComplete.mutate()}
//               disabled={bulkComplete.isPending}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                 text-xs font-bold text-white transition-all
//                 hover:scale-105 active:scale-95 disabled:opacity-50
//                 disabled:cursor-not-allowed"
//               style={{
//                 background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                 boxShadow: "0 4px 12px rgba(34,197,94,0.35)",
//               }}
//             >
//               {bulkComplete.isPending ? (
//                 <svg
//                   className="animate-spin w-3.5 h-3.5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                 >
//                   <circle
//                     className="opacity-25"
//                     cx="12"
//                     cy="12"
//                     r="10"
//                     stroke="currentColor"
//                     strokeWidth="4"
//                   />
//                   <path
//                     className="opacity-75"
//                     fill="currentColor"
//                     d="M4 12a8 8 0 018-8v8H4z"
//                   />
//                 </svg>
//               ) : (
//                 "✅"
//               )}
//               Bulk Complete
//             </button>
//           )}

//           {/* Refresh */}
//           <button
//             onClick={invalidate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//               border border-gray-200 text-gray-500 hover:bg-gray-50
//               text-sm transition-all"
//           >
//             <svg
//               className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <polyline points="23 4 23 10 17 10" />
//               <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
//             </svg>
//             <span className="hidden sm:inline">Refresh</span>
//           </button>
//         </div>
//       </div>

//       {/* ══ Summary strip — superAdmin only ══════════════════ */}
//       {isSuperAdmin && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//           {[
//             {
//               label: "Total Orders",
//               value: total,
//               icon: "📦",
//               color: "#6366f1",
//             },
//             {
//               label: "Total Cost",
//               value: `$${totalCost.toFixed(2)}`,
//               icon: "💰",
//               color: "#f59e0b",
//             },
//             {
//               label: "Total Earnings",
//               value: `$${totalEarnings.toFixed(2)}`,
//               icon: "📈",
//               color: "#22c55e",
//             },
//           ].map((s) => (
//             <div
//               key={s.label}
//               className="bg-white rounded-xl px-4 py-3 flex items-center gap-3"
//               style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
//             >
//               <div
//                 className="w-9 h-9 rounded-xl flex items-center justify-center
//                   text-lg flex-shrink-0"
//                 style={{ background: s.color + "18" }}
//               >
//                 {s.icon}
//               </div>
//               <div>
//                 <p className="text-gray-400 text-[10px]">{s.label}</p>
//                 <p className="text-gray-800 font-bold text-sm">{s.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ══ Tabs + Search ═════════════════════════════════════ */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-4"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* Tabs — scrollable */}
//         <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
//           {TABS.map((t) => {
//             const color =
//               t.key === "all"
//                 ? "#6b7280"
//                 : STATUS_MAP[t.key]?.color || "#6b7280";
//             const active = tab === t.key;
//             return (
//               <button
//                 key={t.key}
//                 onClick={() => setTab(t.key)}
//                 className="px-4 py-2 rounded-xl text-sm font-semibold
//                   transition-all whitespace-nowrap flex-shrink-0"
//                 style={
//                   active
//                     ? {
//                         background: color,
//                         color: "white",
//                         boxShadow: `0 4px 12px ${color}40`,
//                       }
//                     : { background: "#f3f4f6", color: "#6b7280" }
//                 }
//               >
//                 {t.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Search by Order SN */}
//         <div className="relative max-w-sm">
//           <svg
//             className="absolute left-3 top-1/2 -translate-y-1/2
//               w-4 h-4 text-gray-400"
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
//             placeholder="Search by Order SN..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-xl border
//               border-gray-200 text-sm outline-none
//               focus:border-pink-400 bg-gray-50 focus:bg-white transition-all"
//           />
//         </div>
//       </div>

//       {/* ══ Table ══════════════════════════════════════════════ */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 920 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Order SN",
//                   "Merchant",
//                   "Buyer",
//                   "Product",
//                   "Cost",
//                   "Earnings",
//                   "Status",
//                   "Date",
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
//               {/* ── Loading skeleton ── */}
//               {isLoading &&
//                 [...Array(8)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(10)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}

//               {/* ── Empty state ── */}
//               {!isLoading && orders.length === 0 && (
//                 <tr>
//                   <td colSpan={10} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-6xl">📦</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No {tab === "all" ? "" : tab} orders found
//                       </p>
//                       {search && (
//                         <p className="text-gray-300 text-xs">
//                           Try a different order SN
//                         </p>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               )}

//               {/* ── Data rows ── */}
//               {!isLoading &&
//                 orders.map((o, i) => {
//                   const st = STATUS_MAP[o.status] || STATUS_MAP.pendingPayment;
//                   // Can confirm profit: only shipped orders not yet confirmed
//                   const canConfirm =
//                     isSuperAdmin &&
//                     o.status === "shipped" &&
//                     !o.profitConfirmed;
//                   // Can cancel: only non-terminal statuses
//                   const canCancel =
//                     isSuperAdmin &&
//                     !["completed", "cancelled"].includes(o.status);

//                   return (
//                     <tr
//                       key={o._id}
//                       className="border-t border-gray-50
//                       hover:bg-slate-50/60 transition-colors"
//                     >
//                       {/* # */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-400 text-xs">
//                           {(page - 1) * limit + i + 1}
//                         </span>
//                       </td>

//                       {/* Order SN */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-500 text-[10px] font-mono">
//                           #{o.orderSn?.slice(-10)}
//                         </span>
//                       </td>

//                       {/* Merchant */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-2">
//                           <div
//                             className="w-7 h-7 rounded-lg bg-gray-100
//                           overflow-hidden flex-shrink-0 flex items-center
//                           justify-center text-xs"
//                           >
//                             {o.merchant?.storeLogo ? (
//                               <img
//                                 src={o.merchant.storeLogo}
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                               />
//                             ) : (
//                               "🏪"
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p
//                               className="text-gray-700 text-xs font-medium
//                             truncate max-w-[90px]"
//                             >
//                               {o.merchant?.storeName || "—"}
//                             </p>
//                             <p className="text-gray-400 text-[10px]">
//                               {o.merchant?.merchantId}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Buyer — auto-generated, exact model fields */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-600 text-xs truncate max-w-[80px]">
//                           {o.buyerName || "—"}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {o.phoneNumber}
//                         </p>
//                       </td>

//                       {/* Product */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-2">
//                           <div
//                             className="w-9 h-9 rounded-lg bg-gray-100
//                           overflow-hidden flex-shrink-0 flex items-center
//                           justify-center"
//                           >
//                             {o.products?.[0]?.image ? (
//                               <img
//                                 src={o.products[0].image}
//                                 alt=""
//                                 className="w-full h-full object-cover"
//                               />
//                             ) : (
//                               <span className="text-sm">📦</span>
//                             )}
//                           </div>
//                           <div className="min-w-0">
//                             <p
//                               className="text-gray-700 text-xs font-medium
//                             line-clamp-1 max-w-[110px]"
//                             >
//                               {o.products?.[0]?.title || "Product"}
//                             </p>
//                             {o.products?.length > 1 && (
//                               <p className="text-gray-400 text-[10px]">
//                                 +{o.products.length - 1} more
//                               </p>
//                             )}
//                           </div>
//                         </div>
//                       </td>

//                       {/* Total cost — merchant paid this */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-800 text-sm font-bold">
//                           ${(o.totalCost || 0).toFixed(2)}
//                         </span>
//                       </td>

//                       {/* Earnings — profit, added when superAdmin confirms */}
//                       <td className="px-4 py-3.5">
//                         <span
//                           className={`text-sm font-bold ${
//                             o.profitConfirmed
//                               ? "text-green-600"
//                               : "text-orange-400"
//                           }`}
//                         >
//                           ${(o.earnings || 0).toFixed(2)}
//                         </span>
//                         {o.profitConfirmed && (
//                           <p className="text-green-400 text-[10px]">
//                             confirmed
//                           </p>
//                         )}
//                       </td>

//                       {/* Status */}
//                       <td className="px-4 py-3.5">
//                         <Badge color={st.color}>{st.label}</Badge>
//                       </td>

//                       {/* Date */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-500 text-xs whitespace-nowrap">
//                           {new Date(o.createdAt).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "2-digit",
//                           })}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {new Date(o.createdAt).toLocaleTimeString("en-US", {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-1.5">
//                           {/* View Detail — all admin roles */}
//                           <button
//                             onClick={() => setDetailOrder(o)}
//                             title="View Order Detail"
//                             className="w-7 h-7 rounded-lg flex items-center
//                             justify-center text-xs transition-all
//                             hover:scale-110 active:scale-95"
//                             style={{
//                               background: "#6366f118",
//                               color: "#6366f1",
//                             }}
//                           >
//                             👁️
//                           </button>

//                           {/* Confirm Profit — superAdmin, shipped, not yet confirmed */}
//                           {canConfirm && (
//                             <button
//                               onClick={() => confirmProfit.mutate(o._id)}
//                               disabled={confirmProfit.isPending}
//                               title="Confirm Profit — adds earnings to merchant balance"
//                               className="w-7 h-7 rounded-lg flex items-center
//                               justify-center text-xs transition-all
//                               hover:scale-110 active:scale-95
//                               disabled:opacity-50"
//                               style={{
//                                 background: "#22c55e18",
//                                 color: "#22c55e",
//                               }}
//                             >
//                               💰
//                             </button>
//                           )}

//                           {/* Cancel — superAdmin only, not terminal status */}
//                           {canCancel && (
//                             <button
//                               onClick={() => {
//                                 if (
//                                   window.confirm(
//                                     `Cancel order #${o.orderSn?.slice(-8)}?\n` +
//                                       (o.status !== "pendingPayment"
//                                         ? "The merchant will be refunded."
//                                         : ""),
//                                   )
//                                 ) {
//                                   cancelOrder.mutate(o._id);
//                                 }
//                               }}
//                               disabled={cancelOrder.isPending}
//                               title="Cancel Order"
//                               className="w-7 h-7 rounded-lg flex items-center
//                               justify-center text-xs transition-all
//                               hover:scale-110 active:scale-95
//                               disabled:opacity-50"
//                               style={{
//                                 background: "#ef444418",
//                                 color: "#ef4444",
//                               }}
//                             >
//                               ✕
//                             </button>
//                           )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//         </div>

//         {/* ── Pagination ── */}
//         {totalPages > 1 && (
//           <div
//             className="flex items-center justify-between px-5 py-3
//             border-t border-gray-100 flex-wrap gap-2"
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

//       {/* ══ Order Detail Modal ═════════════════════════════════ */}
//       <Modal
//         open={!!detailOrder}
//         onClose={() => setDetailOrder(null)}
//         title={`📦 Order — #${detailOrder?.orderSn?.slice(-10)}`}
//       >
//         {detailOrder && (
//           <div className="space-y-4">
//             {/* Product list */}
//             <div className="space-y-2">
//               {detailOrder.products?.map((p, i) => (
//                 <div
//                   key={i}
//                   className="flex items-center gap-3 p-3 rounded-xl"
//                   style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//                 >
//                   <div
//                     className="w-12 h-12 rounded-xl overflow-hidden
//                     bg-gray-100 flex-shrink-0 flex items-center justify-center"
//                   >
//                     {p.image ? (
//                       <img
//                         src={p.image}
//                         alt=""
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       <span className="text-xl">📦</span>
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p
//                       className="text-gray-800 text-sm font-semibold
//                       line-clamp-1"
//                     >
//                       {p.title}
//                     </p>
//                     <p className="text-gray-400 text-xs mt-0.5">
//                       Qty: {p.quantity || 1} · ${(p.price || 0).toFixed(2)} each
//                     </p>
//                   </div>
//                   <p className="text-gray-800 font-bold text-sm flex-shrink-0">
//                     ${((p.price || 0) * (p.quantity || 1)).toFixed(2)}
//                   </p>
//                 </div>
//               ))}
//             </div>

//             {/* Order financials */}
//             <div
//               className="rounded-xl px-4 py-2"
//               style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//             >
//               <InfoRow label="Order SN" value={detailOrder.orderSn} mono />
//               <InfoRow
//                 label="Merchant"
//                 value={detailOrder.merchant?.storeName}
//               />
//               <InfoRow
//                 label="Total Cost"
//                 value={`$${(detailOrder.totalCost || 0).toFixed(2)}`}
//               />
//               <InfoRow
//                 label="Selling Price"
//                 value={`$${(detailOrder.sellingPrice || 0).toFixed(2)}`}
//               />
//               <InfoRow
//                 label="Earnings"
//                 value={`$${(detailOrder.earnings || 0).toFixed(2)}`}
//               />
//               <InfoRow
//                 label="Status"
//                 value={STATUS_MAP[detailOrder.status]?.label}
//               />
//               <InfoRow
//                 label="Profit"
//                 value={
//                   detailOrder.profitConfirmed
//                     ? `✅ Confirmed`
//                     : "⏳ Not yet confirmed"
//                 }
//               />
//             </div>

//             {/* Buyer info — all fields from Order model */}
//             <div>
//               <p
//                 className="text-gray-500 text-xs font-semibold uppercase
//                 tracking-wide mb-2"
//               >
//                 Auto-Generated Buyer Info
//               </p>
//               <div
//                 className="rounded-xl px-4 py-2"
//                 style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
//               >
//                 <InfoRow label="Name" value={detailOrder.buyerName} />
//                 <InfoRow label="Phone" value={detailOrder.phoneNumber} />
//                 <InfoRow label="Country" value={detailOrder.country} />
//                 <InfoRow label="Address" value={detailOrder.shippingAddress} />
//               </div>
//             </div>

//             {/* Logistics — only if merchant picked up */}
//             {detailOrder.trackingNumber && (
//               <div>
//                 <p
//                   className="text-gray-500 text-xs font-semibold uppercase
//                   tracking-wide mb-2"
//                 >
//                   Logistics
//                 </p>
//                 <div
//                   className="rounded-xl px-4 py-2"
//                   style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
//                 >
//                   <InfoRow
//                     label="Tracking #"
//                     value={detailOrder.trackingNumber}
//                     mono
//                   />
//                   <InfoRow
//                     label="Picked Up"
//                     value={
//                       detailOrder.pickedUpAt
//                         ? new Date(detailOrder.pickedUpAt).toLocaleString()
//                         : null
//                     }
//                   />
//                   {detailOrder.logisticsInfo?.length > 0 && (
//                     <div className="py-2.5">
//                       <p className="text-gray-400 text-xs mb-2">Timeline</p>
//                       <div className="space-y-1.5 max-h-32 overflow-y-auto">
//                         {detailOrder.logisticsInfo.map((l, i) => (
//                           <div key={i} className="flex items-start gap-2">
//                             <div
//                               className="w-1.5 h-1.5 rounded-full
//                               bg-green-400 mt-1.5 flex-shrink-0"
//                             />
//                             <div>
//                               <p className="text-gray-600 text-[10px]">
//                                 {l.status}
//                               </p>
//                               <p className="text-gray-400 text-[9px]">
//                                 {new Date(l.time).toLocaleString()}
//                               </p>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Modal action buttons */}
//             <div className="flex gap-3 pt-1">
//               {/* Confirm Profit from inside modal */}
//               {isSuperAdmin &&
//                 detailOrder.status === "shipped" &&
//                 !detailOrder.profitConfirmed && (
//                   <button
//                     onClick={() => confirmProfit.mutate(detailOrder._id)}
//                     disabled={confirmProfit.isPending}
//                     className="flex-1 py-3 rounded-xl text-white font-bold
//                     text-sm transition-all disabled:opacity-50
//                     active:scale-95"
//                     style={{
//                       background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                       boxShadow: "0 4px 12px rgba(34,197,94,0.3)",
//                     }}
//                   >
//                     {confirmProfit.isPending
//                       ? "Confirming..."
//                       : "💰 Confirm Profit"}
//                   </button>
//                 )}

//               <button
//                 onClick={() => setDetailOrder(null)}
//                 className="flex-1 py-3 rounded-xl border border-gray-200
//                   text-gray-500 text-sm hover:bg-gray-50 transition-all"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// }

//======================== third code-version starts from here ======================================

// frontend-admin/src/pages/orders/OrderList.jsx
//
// REPLACES the existing OrderList.jsx with full dispatch admin capabilities.
//
// VERIFIED BACKEND ENDPOINTS:
//
//   GET  /api/orders?status=&orderSn=&merchantId=&page=&limit=
//        → { orders, total, pages, summary:{totalCost,totalEarnings} }
//        → orders[].merchant populated: { storeName, merchantId }
//        Access: superAdmin, merchantAdmin, dispatchAdmin
//
//   GET  /api/orders/:id
//        → full order with products[], logisticsInfo[], buyer info
//        Access: all admin roles
//
//   POST /api/orders/dispatch
//        body: { merchantId(String), products:[{productId,quantity}], completionDays }
//        → { message, order }
//        Access: dispatchAdmin only
//
//   POST /api/orders/dispatch-bulk
//        body: { orders:[{merchantId, products:[{productId,quantity}], completionDays}] }
//        → { results:[], errors:[], total, succeeded, failed }
//        Access: dispatchAdmin only
//
//   PUT  /api/orders/bulk-ship
//        body: { merchantId? }  → optional filter by merchant
//        → { message, count }
//        Access: superAdmin + dispatchAdmin
//
//   PUT  /api/orders/bulk-complete
//        → completes all shipped orders + credits merchant profits
//        Access: superAdmin only
//
//   PUT  /api/orders/:id/confirm-profit
//        → completes single order + credits merchant profit
//        Access: superAdmin only
//
//   PUT  /api/orders/:id/cancel
//        Access: superAdmin only
//
//   GET  /api/products/admin?title=&page=&limit=
//        → { products, total, pages }
//        Access: superAdmin + dispatchAdmin (after backend patch)
//        Used in dispatch modal to search/select products
//
//   GET  /api/merchants?storeName=&status=approved&limit=20
//        → { merchants }
//        Access: superAdmin + dispatchAdmin (after backend patch)
//        Used in dispatch modal to find merchants
//
// ORDER STATUS FLOW:
//   pendingPayment → (merchant picks up) → pendingShipment → (bulk-ship) → shipped
//   → (superAdmin confirms) → completed
//   OR → cancelled (superAdmin)

// import { useState, useEffect, useRef } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── Status config ─────────────────────────────────────────────
// const STATUS = {
//   pendingPayment: {
//     color: "#f59e0b",
//     bg: "#fef9c3",
//     label: "⏳ Pending Payment",
//   },
//   pendingShipment: {
//     color: "#6366f1",
//     bg: "#ede9fe",
//     label: "📦 Pending Shipment",
//   },
//   shipped: { color: "#0ea5e9", bg: "#e0f2fe", label: "🚚 Shipped" },
//   received: { color: "#22c55e", bg: "#dcfce7", label: "✅ Received" },
//   completed: { color: "#16a34a", bg: "#dcfce7", label: "💰 Completed" },
//   cancelled: { color: "#ef4444", bg: "#fee2e2", label: "✕ Cancelled" },
//   refunding: { color: "#9ca3af", bg: "#f3f4f6", label: "↩️ Refunding" },
// };

// const STATUS_TABS = [
//   { key: "", label: "All" },
//   { key: "pendingPayment", label: "⏳ Pending" },
//   { key: "pendingShipment", label: "📦 Shipment" },
//   { key: "shipped", label: "🚚 Shipped" },
//   { key: "completed", label: "💰 Completed" },
//   { key: "cancelled", label: "✕ Cancelled" },
// ];

// // ─── Modal wrapper ─────────────────────────────────────────────
// const Modal = ({ open, onClose, title, wide, children }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />
//       <div
//         className={`relative bg-white rounded-2xl w-full
//           ${wide ? "max-w-2xl" : "max-w-lg"}
//           max-h-[90vh] overflow-y-auto`}
//         style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}
//       >
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
//           <p className="font-bold text-gray-800 text-sm">{title}</p>
//           <button
//             onClick={onClose}
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//               justify-center text-gray-400 hover:bg-gray-200 transition-all"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// // ─── Detail row atom ───────────────────────────────────────────
// const DetailRow = ({ label, value, mono }) => (
//   <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0 gap-4">
//     <span className="text-gray-400 text-xs flex-shrink-0 w-32">{label}</span>
//     <span
//       className={`text-xs font-semibold text-right text-gray-800 flex-1 ${mono ? "font-mono" : ""}`}
//     >
//       {value ?? "—"}
//     </span>
//   </div>
// );

// export default function OrderList() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";
//   const isDispatchAdmin = user?.role === "dispatchAdmin";

//   // ── Filters ──────────────────────────────────────────────────
//   const [tab, setTab] = useState("");
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [input, setInput] = useState("");
//   const limit = 10;

//   useEffect(() => setPage(1), [tab, search]);

//   // ── Modal state ───────────────────────────────────────────────
//   const [modal, setModal] = useState(null); // 'detail' | 'dispatch' | 'bulkShip'
//   const [sel, setSel] = useState(null);

//   // ─────────────────────────────────────────────────────────────
//   // FETCH: GET /api/orders
//   // ─────────────────────────────────────────────────────────────
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["orders", tab, page, search],
//     queryFn: async () => {
//       const params = new URLSearchParams({ page, limit });
//       if (tab) params.set("status", tab);
//       if (search) params.set("orderSn", search.trim());
//       const { data } = await API.get(`/orders?${params}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const orders = data?.orders || [];
//   const total = data?.total || 0;
//   const totalPages = data?.pages || 1;
//   const summary = data?.summary || { totalCost: 0, totalEarnings: 0 };
//   const invalidate = () => queryClient.invalidateQueries(["orders"]);

//   // ─────────────────────────────────────────────────────────────
//   // FETCH: Single order detail  GET /api/orders/:id
//   // ─────────────────────────────────────────────────────────────
//   const { data: orderDetail, isLoading: detailLoading } = useQuery({
//     queryKey: ["order-detail", sel?._id],
//     queryFn: async () => {
//       const { data } = await API.get(`/orders/${sel._id}`);
//       return data;
//     },
//     enabled: modal === "detail" && !!sel?._id,
//   });

//   // ─────────────────────────────────────────────────────────────
//   // MUTATION: Bulk ship  PUT /api/orders/bulk-ship
//   // body: { merchantId? }  — optional
//   // ─────────────────────────────────────────────────────────────
//   const bulkShip = useMutation({
//     mutationFn: () => API.put("/orders/bulk-ship", {}),
//     onSuccess: (res) => {
//       invalidate();
//       toast.success(`🚚 ${res.data.count} orders shipped!`);
//       setModal(null);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ─────────────────────────────────────────────────────────────
//   // MUTATION: Bulk complete  PUT /api/orders/bulk-complete (superAdmin)
//   // ─────────────────────────────────────────────────────────────
//   const bulkComplete = useMutation({
//     mutationFn: () => API.put("/orders/bulk-complete", {}),
//     onSuccess: (res) => {
//       invalidate();
//       toast.success(`💰 Orders completed + profits credited!`);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ─────────────────────────────────────────────────────────────
//   // MUTATION: Confirm profit  PUT /api/orders/:id/confirm-profit (superAdmin)
//   // ─────────────────────────────────────────────────────────────
//   const confirmProfit = useMutation({
//     mutationFn: (id) => API.put(`/orders/${id}/confirm-profit`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("💰 Profit confirmed!");
//       setModal(null);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ─────────────────────────────────────────────────────────────
//   // MUTATION: Cancel order  PUT /api/orders/:id/cancel (superAdmin)
//   // ─────────────────────────────────────────────────────────────
//   const cancelOrder = useMutation({
//     mutationFn: (id) => API.put(`/orders/${id}/cancel`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Order cancelled");
//       setModal(null);
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // Pagination helper
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

//   const tabColor = tab ? STATUS[tab]?.color || "#6b7280" : "#6b7280";

//   // ─────────────────────────────────────────────────────────────
//   // Count orders needing ship (for the bulk-ship badge)
//   const pendingShipCount = orders.filter(
//     (o) => o.status === "pendingShipment",
//   ).length;

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Order List
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">{total} total orders</p>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           {/* Dispatch button — dispatchAdmin only */}
//           {isDispatchAdmin && (
//             <button
//               onClick={() => setModal("dispatch")}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                 text-white text-sm font-bold transition-all
//                 hover:scale-105 active:scale-95"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                 boxShadow: "0 4px 16px rgba(240,45,101,0.35)",
//               }}
//             >
//               <span className="text-base">📤</span>
//               Dispatch Order
//             </button>
//           )}
//           {/* Bulk Ship — superAdmin + dispatchAdmin */}
//           {(isSuperAdmin || isDispatchAdmin) && (
//             <button
//               onClick={() => setModal("bulkShip")}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                 text-white text-sm font-bold transition-all
//                 hover:scale-105 active:scale-95 relative"
//               style={{
//                 background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
//                 boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
//               }}
//             >
//               <span className="text-base">🚚</span>
//               Bulk Ship
//               {pendingShipCount > 0 && (
//                 <span
//                   className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5
//                   rounded-full bg-yellow-400 text-gray-900 text-[10px] font-bold
//                   flex items-center justify-center px-1"
//                 >
//                   {pendingShipCount}
//                 </span>
//               )}
//             </button>
//           )}
//           {/* Bulk Complete — superAdmin only */}
//           {isSuperAdmin && (
//             <button
//               onClick={() => {
//                 if (
//                   window.confirm(
//                     "Complete all shipped orders and credit merchant profits?",
//                   )
//                 )
//                   bulkComplete.mutate();
//               }}
//               disabled={bulkComplete.isPending}
//               className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                 text-white text-sm font-bold transition-all
//                 hover:scale-105 active:scale-95 disabled:opacity-50"
//               style={{
//                 background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                 boxShadow: "0 4px 16px rgba(34,197,94,0.35)",
//               }}
//             >
//               <span className="text-base">💰</span>
//               Bulk Complete
//             </button>
//           )}
//           <button
//             onClick={invalidate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//               border border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition-all"
//           >
//             <svg
//               className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <polyline points="23 4 23 10 17 10" />
//               <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {/* Summary strip */}
//       <div className="grid grid-cols-3 gap-3">
//         {[
//           {
//             label: "Total Orders",
//             value: total.toLocaleString(),
//             color: "#6366f1",
//             icon: "📦",
//           },
//           {
//             label: "Total Cost",
//             value: `$${(summary.totalCost || 0).toFixed(2)}`,
//             color: "#f59e0b",
//             icon: "💵",
//           },
//           {
//             label: "Total Earnings",
//             value: `$${(summary.totalEarnings || 0).toFixed(2)}`,
//             color: "#22c55e",
//             icon: "💰",
//           },
//         ].map((s) => (
//           <div
//             key={s.label}
//             className="bg-white rounded-2xl p-4 flex items-center gap-3"
//             style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//           >
//             <div
//               className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
//               style={{ background: s.color + "18" }}
//             >
//               {s.icon}
//             </div>
//             <div>
//               <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wide">
//                 {s.label}
//               </p>
//               <p className="text-gray-800 font-extrabold text-sm">{s.value}</p>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Filters */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-3"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* Status tabs */}
//         <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
//           {STATUS_TABS.map((t) => {
//             const color = t.key ? STATUS[t.key]?.color || "#6b7280" : "#6b7280";
//             return (
//               <button
//                 key={t.key}
//                 onClick={() => setTab(t.key)}
//                 className="px-3 py-2 rounded-xl text-xs font-semibold
//                   transition-all whitespace-nowrap flex-shrink-0"
//                 style={
//                   tab === t.key
//                     ? {
//                         background: color,
//                         color: "white",
//                         boxShadow: `0 4px 12px ${color}40`,
//                       }
//                     : { background: "#f3f4f6", color: "#6b7280" }
//                 }
//               >
//                 {t.label}
//               </button>
//             );
//           })}
//         </div>
//         {/* Order SN search */}
//         <div className="flex gap-2 max-w-sm">
//           <div className="relative flex-1">
//             <svg
//               className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//               fill="none"
//               viewBox="0 0 24 24"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <circle cx="11" cy="11" r="8" />
//               <path d="M21 21l-4.35-4.35" />
//             </svg>
//             <input
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && setSearch(input)}
//               placeholder="Search by order SN..."
//               className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//                 text-sm outline-none focus:border-pink-400 bg-gray-50 focus:bg-white transition-all"
//             />
//           </div>
//           <button
//             onClick={() => setSearch(input)}
//             className="px-4 py-2.5 rounded-xl text-white text-sm font-bold
//               transition-all hover:scale-105"
//             style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//           >
//             Search
//           </button>
//           {search && (
//             <button
//               onClick={() => {
//                 setSearch("");
//                 setInput("");
//               }}
//               className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-400 text-sm hover:bg-gray-50"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Orders table */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 820 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Order SN",
//                   "Merchant",
//                   "Products",
//                   "Amounts",
//                   "Status",
//                   "Profit",
//                   "Actions",
//                 ].map((h) => (
//                   <th
//                     key={h}
//                     className="px-4 py-3 text-left text-[11px] font-bold
//                     text-gray-400 uppercase tracking-wider whitespace-nowrap"
//                   >
//                     {h}
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {isLoading &&
//                 [...Array(5)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(8)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}

//               {!isLoading && orders.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-6xl">📦</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No orders found
//                       </p>
//                       {isDispatchAdmin && (
//                         <button
//                           onClick={() => setModal("dispatch")}
//                           className="px-4 py-2 rounded-xl text-white text-sm font-bold"
//                           style={{
//                             background:
//                               "linear-gradient(135deg,#f02d65,#ff6035)",
//                           }}
//                         >
//                           📤 Dispatch First Order
//                         </button>
//                       )}
//                     </div>
//                   </td>
//                 </tr>
//               )}

//               {!isLoading &&
//                 orders.map((o, i) => {
//                   const st = STATUS[o.status] || STATUS.pendingPayment;
//                   return (
//                     <tr
//                       key={o._id}
//                       className="border-t border-gray-50 hover:bg-slate-50/60 transition-colors"
//                     >
//                       {/* # */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-400 text-xs">
//                           {(page - 1) * limit + i + 1}
//                         </span>
//                       </td>
//                       {/* Order SN */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-700 text-xs font-mono font-semibold">
//                           {o.orderSn}
//                         </span>
//                       </td>
//                       {/* Merchant */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-800 text-xs font-semibold truncate max-w-[110px]">
//                           {o.merchant?.storeName || "—"}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {o.merchant?.merchantId}
//                         </p>
//                       </td>
//                       {/* Products count */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-600 text-xs">
//                           {o.products?.length || 0} item
//                           {(o.products?.length || 0) !== 1 ? "s" : ""}
//                         </span>
//                       </td>
//                       {/* Amounts */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-800 text-xs font-bold">
//                           ${(o.sellingPrice || 0).toFixed(2)}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           Cost: ${(o.totalCost || 0).toFixed(2)}
//                         </p>
//                       </td>
//                       {/* Status */}
//                       <td className="px-4 py-3.5">
//                         <span
//                           className="px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap"
//                           style={{ background: st.bg, color: st.color }}
//                         >
//                           {st.label}
//                         </span>
//                       </td>
//                       {/* Profit confirmed */}
//                       <td className="px-4 py-3.5">
//                         {o.profitConfirmed ? (
//                           <span className="text-green-600 text-xs font-bold">
//                             ✓ +${(o.earnings || 0).toFixed(2)}
//                           </span>
//                         ) : (
//                           <span className="text-gray-300 text-xs">
//                             ${(o.earnings || 0).toFixed(2)}
//                           </span>
//                         )}
//                       </td>
//                       {/* Actions */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-1.5">
//                           {/* View */}
//                           <button
//                             onClick={() => {
//                               setSel(o);
//                               setModal("detail");
//                             }}
//                             title="View detail"
//                             className="w-7 h-7 rounded-lg flex items-center justify-center
//                             text-xs hover:scale-110 transition-all"
//                             style={{
//                               background: "#6366f115",
//                               color: "#6366f1",
//                             }}
//                           >
//                             👁️
//                           </button>
//                           {/* Confirm profit — superAdmin + shipped/received */}
//                           {isSuperAdmin &&
//                             ["shipped", "received"].includes(o.status) &&
//                             !o.profitConfirmed && (
//                               <button
//                                 onClick={() => {
//                                   if (
//                                     window.confirm(
//                                       `Confirm profit $${(o.earnings || 0).toFixed(2)} for ${o.merchant?.storeName}?`,
//                                     )
//                                   )
//                                     confirmProfit.mutate(o._id);
//                                 }}
//                                 disabled={confirmProfit.isPending}
//                                 title="Confirm profit"
//                                 className="w-7 h-7 rounded-lg flex items-center justify-center
//                               text-xs hover:scale-110 transition-all disabled:opacity-50"
//                                 style={{
//                                   background: "#22c55e18",
//                                   color: "#16a34a",
//                                 }}
//                               >
//                                 💰
//                               </button>
//                             )}
//                           {/* Cancel — superAdmin + pending statuses */}
//                           {isSuperAdmin &&
//                             ["pendingPayment", "pendingShipment"].includes(
//                               o.status,
//                             ) && (
//                               <button
//                                 onClick={() => {
//                                   if (
//                                     window.confirm(`Cancel order ${o.orderSn}?`)
//                                   )
//                                     cancelOrder.mutate(o._id);
//                                 }}
//                                 disabled={cancelOrder.isPending}
//                                 title="Cancel order"
//                                 className="w-7 h-7 rounded-lg flex items-center justify-center
//                               text-xs hover:scale-110 transition-all disabled:opacity-50"
//                                 style={{
//                                   background: "#ef444418",
//                                   color: "#ef4444",
//                                 }}
//                               >
//                                 ✕
//                               </button>
//                             )}
//                         </div>
//                       </td>
//                     </tr>
//                   );
//                 })}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {totalPages > 1 && (
//           <div
//             className="flex items-center justify-between px-5 py-3
//             border-t border-gray-100 flex-wrap gap-2"
//           >
//             <p className="text-gray-400 text-xs">
//               {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
//               {total}
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage(1)}
//                 disabled={page === 1}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 text-sm"
//               >
//                 «
//               </button>
//               <button
//                 onClick={() => setPage((p) => p - 1)}
//                 disabled={page === 1}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 text-sm"
//               >
//                 ‹
//               </button>
//               {getPageNums().map((n) => (
//                 <button
//                   key={n}
//                   onClick={() => setPage(n)}
//                   className="w-8 h-8 rounded-xl text-xs font-semibold transition-all"
//                   style={
//                     n === page
//                       ? { background: tabColor, color: "white" }
//                       : { color: "#6b7280" }
//                   }
//                 >
//                   {n}
//                 </button>
//               ))}
//               <button
//                 onClick={() => setPage((p) => p + 1)}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 text-sm"
//               >
//                 ›
//               </button>
//               <button
//                 onClick={() => setPage(totalPages)}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-50 disabled:opacity-30 text-sm"
//               >
//                 »
//               </button>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* ══ Detail Modal ═══════════════════════════════════════ */}
//       <Modal
//         open={modal === "detail"}
//         onClose={() => {
//           setModal(null);
//           setSel(null);
//         }}
//         title="📦 Order Detail"
//         wide
//       >
//         {detailLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <svg
//               className="animate-spin w-8 h-8"
//               style={{ color: "#f02d65" }}
//               fill="none"
//               viewBox="0 0 24 24"
//             >
//               <circle
//                 className="opacity-25"
//                 cx="12"
//                 cy="12"
//                 r="10"
//                 stroke="currentColor"
//                 strokeWidth="4"
//               />
//               <path
//                 className="opacity-75"
//                 fill="currentColor"
//                 d="M4 12a8 8 0 018-8v8H4z"
//               />
//             </svg>
//           </div>
//         ) : orderDetail ? (
//           <div className="space-y-5">
//             {/* Status badge */}
//             <div className="flex items-center gap-3">
//               <span
//                 className="px-3 py-1.5 rounded-xl text-sm font-bold"
//                 style={{
//                   background: STATUS[orderDetail.status]?.bg,
//                   color: STATUS[orderDetail.status]?.color,
//                 }}
//               >
//                 {STATUS[orderDetail.status]?.label || orderDetail.status}
//               </span>
//               {orderDetail.profitConfirmed && (
//                 <span
//                   className="px-3 py-1.5 rounded-xl text-sm font-bold"
//                   style={{ background: "#dcfce7", color: "#16a34a" }}
//                 >
//                   💰 Profit Confirmed
//                 </span>
//               )}
//             </div>

//             {/* Order info */}
//             <div
//               className="rounded-xl px-4 py-1"
//               style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//             >
//               <DetailRow label="Order SN" value={orderDetail.orderSn} mono />
//               <DetailRow
//                 label="Merchant"
//                 value={orderDetail.merchant?.storeName}
//               />
//               <DetailRow
//                 label="Merchant ID"
//                 value={orderDetail.merchant?.merchantId}
//                 mono
//               />
//               <DetailRow
//                 label="Selling Price"
//                 value={`$${(orderDetail.sellingPrice || 0).toFixed(2)}`}
//               />
//               <DetailRow
//                 label="Total Cost"
//                 value={`$${(orderDetail.totalCost || 0).toFixed(2)}`}
//               />
//               <DetailRow
//                 label="Earnings"
//                 value={`$${(orderDetail.earnings || 0).toFixed(2)}`}
//               />
//               <DetailRow
//                 label="Created"
//                 value={new Date(orderDetail.createdAt).toLocaleString()}
//               />
//               {orderDetail.pickedUpAt && (
//                 <DetailRow
//                   label="Picked Up"
//                   value={new Date(orderDetail.pickedUpAt).toLocaleString()}
//                 />
//               )}
//               {orderDetail.trackingNumber && (
//                 <DetailRow
//                   label="Tracking"
//                   value={orderDetail.trackingNumber}
//                   mono
//                 />
//               )}
//             </div>

//             {/* Buyer info */}
//             <div>
//               <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">
//                 Buyer Info (Auto-Generated)
//               </p>
//               <div
//                 className="rounded-xl px-4 py-1"
//                 style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//               >
//                 <DetailRow label="Buyer Name" value={orderDetail.buyerName} />
//                 <DetailRow label="Phone" value={orderDetail.phoneNumber} />
//                 <DetailRow
//                   label="Address"
//                   value={orderDetail.shippingAddress}
//                 />
//                 <DetailRow label="Country" value={orderDetail.country} />
//               </div>
//             </div>

//             {/* Products */}
//             {(orderDetail.products || []).length > 0 && (
//               <div>
//                 <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-2">
//                   Products ({orderDetail.products.length})
//                 </p>
//                 <div className="space-y-2">
//                   {orderDetail.products.map((p, i) => (
//                     <div
//                       key={i}
//                       className="flex items-center gap-3 p-3 rounded-xl"
//                       style={{
//                         background: "#f8fafc",
//                         border: "1px solid #e2e8f0",
//                       }}
//                     >
//                       {p.image ? (
//                         <img
//                           src={p.image}
//                           alt={p.title}
//                           className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
//                         />
//                       ) : (
//                         <div
//                           className="w-12 h-12 rounded-lg bg-gray-100 flex items-center
//                           justify-center text-2xl flex-shrink-0"
//                         >
//                           🛍️
//                         </div>
//                       )}
//                       <div className="flex-1 min-w-0">
//                         <p className="text-gray-800 text-xs font-semibold truncate">
//                           {p.title}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           Qty: {p.quantity} × ${(p.price || 0).toFixed(2)}
//                         </p>
//                       </div>
//                       <p className="text-gray-800 text-sm font-bold flex-shrink-0">
//                         ${((p.quantity || 1) * (p.price || 0)).toFixed(2)}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Actions */}
//             {isSuperAdmin && (
//               <div className="flex gap-3 pt-1">
//                 {["shipped", "received"].includes(orderDetail.status) &&
//                   !orderDetail.profitConfirmed && (
//                     <button
//                       onClick={() => {
//                         if (
//                           window.confirm(
//                             `Confirm profit $${(orderDetail.earnings || 0).toFixed(2)}?`,
//                           )
//                         )
//                           confirmProfit.mutate(orderDetail._id);
//                       }}
//                       disabled={confirmProfit.isPending}
//                       className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white
//                       hover:scale-105 transition-all disabled:opacity-50"
//                       style={{
//                         background: "linear-gradient(135deg,#22c55e,#16a34a)",
//                       }}
//                     >
//                       💰 Confirm Profit
//                     </button>
//                   )}
//                 {["pendingPayment", "pendingShipment"].includes(
//                   orderDetail.status,
//                 ) && (
//                   <button
//                     onClick={() => {
//                       if (window.confirm("Cancel this order?"))
//                         cancelOrder.mutate(orderDetail._id);
//                     }}
//                     disabled={cancelOrder.isPending}
//                     className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white
//                       hover:scale-105 transition-all disabled:opacity-50"
//                     style={{
//                       background: "linear-gradient(135deg,#ef4444,#dc2626)",
//                     }}
//                   >
//                     ✕ Cancel Order
//                   </button>
//                 )}
//               </div>
//             )}
//           </div>
//         ) : (
//           <p className="text-center text-gray-400 text-sm py-8">
//             Order not found
//           </p>
//         )}
//       </Modal>

//       {/* ══ Bulk Ship Confirm Modal ════════════════════════════ */}
//       <Modal
//         open={modal === "bulkShip"}
//         onClose={() => setModal(null)}
//         title="🚚 Bulk Ship Orders"
//       >
//         <div className="space-y-4">
//           <div
//             className="p-4 rounded-xl text-center"
//             style={{ background: "#e0f2fe", border: "1px solid #bae6fd" }}
//           >
//             <p className="text-sky-700 font-bold text-sm">
//               Ship all pending shipment orders
//             </p>
//             <p className="text-sky-600 text-xs mt-1">
//               All orders with status "Pending Shipment" will be changed to
//               "Shipped".
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <button
//               onClick={() => bulkShip.mutate()}
//               disabled={bulkShip.isPending}
//               className="flex-1 py-3 rounded-xl font-bold text-sm text-white
//                 hover:scale-105 transition-all disabled:opacity-50"
//               style={{
//                 background: "linear-gradient(135deg,#0ea5e9,#0284c7)",
//                 boxShadow: "0 4px 16px rgba(14,165,233,0.35)",
//               }}
//             >
//               {bulkShip.isPending ? "Shipping..." : "🚚 Ship All Now"}
//             </button>
//             <button
//               onClick={() => setModal(null)}
//               className="flex-1 py-3 rounded-xl border border-gray-200
//                 text-gray-500 text-sm hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* ══ Dispatch Order Modal ══════════════════════════════ */}
//       {modal === "dispatch" && (
//         <DispatchModal
//           onClose={() => setModal(null)}
//           onSuccess={() => {
//             setModal(null);
//             invalidate();
//           }}
//         />
//       )}
//     </div>
//   );
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // DISPATCH ORDER MODAL
// // Separate component to keep things clean.
// // Uses:
// //   GET /api/merchants?status=approved&storeName= → search merchants
// //   GET /api/products/admin?title=               → search products
// //   POST /api/orders/dispatch body:{merchantId,products:[{productId,quantity}],completionDays}
// // ─────────────────────────────────────────────────────────────────────────────
// function DispatchModal({ onClose, onSuccess }) {
//   const [step, setStep] = useState(1); // 1=merchant, 2=products, 3=confirm
//   const [merchantSearch, setMerchantSearch] = useState("");
//   const [selMerchant, setSelMerchant] = useState(null);
//   const [productSearch, setProductSearch] = useState("");
//   const [selProducts, setSelProducts] = useState([]); // [{ product, quantity }]
//   const [completionDays, setCompletionDays] = useState(1);

//   // ── Merchant search ──────────────────────────────────────────
//   const { data: merchantData, isLoading: merchantLoading } = useQuery({
//     queryKey: ["dispatch-merchants", merchantSearch],
//     queryFn: async () => {
//       const params = new URLSearchParams({ status: "approved", limit: 10 });
//       if (merchantSearch) params.set("storeName", merchantSearch);
//       const { data } = await API.get(`/merchants?${params}`);
//       return data;
//     },
//     enabled: step === 1,
//   });

//   // ── Product search ───────────────────────────────────────────
//   const { data: productData, isLoading: productLoading } = useQuery({
//     queryKey: ["dispatch-products", productSearch],
//     queryFn: async () => {
//       const params = new URLSearchParams({ limit: 12 });
//       if (productSearch) params.set("title", productSearch);
//       const { data } = await API.get(`/products/admin?${params}`);
//       return data;
//     },
//     enabled: step === 2,
//   });

//   // ── Dispatch mutation ────────────────────────────────────────
//   const dispatch = useMutation({
//     mutationFn: () =>
//       API.post("/orders/dispatch", {
//         merchantId: selMerchant.merchantId,
//         products: selProducts.map((p) => ({
//           productId: p.product._id,
//           quantity: p.quantity,
//         })),
//         completionDays,
//       }),
//     onSuccess: (res) => {
//       toast.success(`📤 Order dispatched! SN: ${res.data.order?.orderSn}`);
//       onSuccess();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Dispatch failed"),
//   });

//   const merchants = merchantData?.merchants || [];
//   const products = productData?.products || [];

//   // Add/update product in selection
//   const addProduct = (product) => {
//     setSelProducts((prev) => {
//       const exists = prev.find((p) => p.product._id === product._id);
//       if (exists) return prev;
//       return [...prev, { product, quantity: 1 }];
//     });
//   };

//   const removeProduct = (productId) => {
//     setSelProducts((prev) => prev.filter((p) => p.product._id !== productId));
//   };

//   const updateQty = (productId, qty) => {
//     setSelProducts((prev) =>
//       prev.map((p) =>
//         p.product._id === productId ? { ...p, quantity: Math.max(1, qty) } : p,
//       ),
//     );
//   };

//   // Calculate totals
//   const totalSellingPrice = selProducts.reduce(
//     (sum, p) => sum + (p.product.salesPrice || 0) * p.quantity,
//     0,
//   );
//   const totalCost = selProducts.reduce(
//     (sum, p) => sum + (p.product.costPrice || 0) * p.quantity,
//     0,
//   );

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />
//       <div
//         className="relative bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
//         style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.3)" }}
//       >
//         {/* Header */}
//         <div className="sticky top-0 bg-white z-10 px-6 py-4 border-b border-gray-100">
//           <div className="flex items-center justify-between mb-3">
//             <p className="font-bold text-gray-800 text-sm">📤 Dispatch Order</p>
//             <button
//               onClick={onClose}
//               className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//                 justify-center text-gray-400 hover:bg-gray-200"
//             >
//               ✕
//             </button>
//           </div>
//           {/* Step progress */}
//           <div className="flex items-center gap-2">
//             {["Select Merchant", "Add Products", "Confirm"].map((label, i) => (
//               <div key={i} className="flex items-center gap-2 flex-1">
//                 <div className="flex items-center gap-1.5">
//                   <div
//                     className="w-6 h-6 rounded-full text-xs font-bold flex items-center
//                     justify-center flex-shrink-0 transition-all"
//                     style={
//                       step > i + 1
//                         ? { background: "#22c55e", color: "white" }
//                         : step === i + 1
//                           ? { background: "#f02d65", color: "white" }
//                           : { background: "#f3f4f6", color: "#9ca3af" }
//                     }
//                   >
//                     {step > i + 1 ? "✓" : i + 1}
//                   </div>
//                   <span
//                     className={`text-[10px] font-semibold whitespace-nowrap
//                     ${step === i + 1 ? "text-gray-800" : "text-gray-400"}`}
//                   >
//                     {label}
//                   </span>
//                 </div>
//                 {i < 2 && <div className="flex-1 h-px bg-gray-200 mx-1" />}
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="p-6 space-y-4">
//           {/* ─── STEP 1: Select Merchant ─── */}
//           {step === 1 && (
//             <>
//               <p className="text-gray-500 text-xs font-semibold">
//                 Search for an approved merchant store:
//               </p>
//               <div className="relative">
//                 <svg
//                   className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="M21 21l-4.35-4.35" />
//                 </svg>
//                 <input
//                   value={merchantSearch}
//                   onChange={(e) => setMerchantSearch(e.target.value)}
//                   placeholder="Search by store name..."
//                   className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//                     text-sm outline-none focus:border-pink-400 bg-gray-50 focus:bg-white transition-all"
//                 />
//               </div>

//               <div className="space-y-2">
//                 {merchantLoading && (
//                   <div className="text-center py-6 text-gray-400 text-sm">
//                     Searching...
//                   </div>
//                 )}
//                 {!merchantLoading &&
//                   merchants.map((m) => (
//                     <button
//                       key={m._id}
//                       onClick={() => {
//                         setSelMerchant(m);
//                         setStep(2);
//                       }}
//                       className={`w-full flex items-center gap-3 p-3 rounded-xl text-left
//                       transition-all hover:scale-[1.01]
//                       ${selMerchant?._id === m._id ? "ring-2 ring-pink-400" : ""}`}
//                       style={{
//                         background: "#f8fafc",
//                         border: "1px solid #e2e8f0",
//                       }}
//                     >
//                       <div
//                         className="w-10 h-10 rounded-xl bg-gray-100 flex items-center
//                       justify-center text-lg flex-shrink-0"
//                       >
//                         🏪
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <p className="text-gray-800 text-sm font-semibold truncate">
//                           {m.storeName}
//                         </p>
//                         <p className="text-gray-400 text-xs">
//                           ID: <span className="font-mono">{m.merchantId}</span>{" "}
//                           · VIP{m.vipLevel}
//                         </p>
//                       </div>
//                       <span
//                         className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
//                         style={{ background: "#dcfce7", color: "#16a34a" }}
//                       >
//                         ✓ Approved
//                       </span>
//                     </button>
//                   ))}
//                 {!merchantLoading && merchants.length === 0 && (
//                   <p className="text-center text-gray-400 text-sm py-6">
//                     No approved merchants found
//                   </p>
//                 )}
//               </div>
//             </>
//           )}

//           {/* ─── STEP 2: Add Products ─── */}
//           {step === 2 && (
//             <>
//               {/* Selected merchant chip */}
//               <div
//                 className="flex items-center gap-2 p-3 rounded-xl"
//                 style={{ background: "#fdf2f8", border: "1px solid #fbcfe8" }}
//               >
//                 <span className="text-sm">🏪</span>
//                 <div className="flex-1 min-w-0">
//                   <p className="text-pink-700 font-bold text-xs">
//                     {selMerchant?.storeName}
//                   </p>
//                   <p className="text-pink-400 text-[10px]">
//                     {selMerchant?.merchantId} · VIP{selMerchant?.vipLevel}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => {
//                     setSelMerchant(null);
//                     setStep(1);
//                   }}
//                   className="text-pink-400 text-xs hover:text-pink-600"
//                 >
//                   change
//                 </button>
//               </div>

//               <p className="text-gray-500 text-xs font-semibold">
//                 Search and add products:
//               </p>
//               <div className="relative">
//                 <svg
//                   className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <circle cx="11" cy="11" r="8" />
//                   <path d="M21 21l-4.35-4.35" />
//                 </svg>
//                 <input
//                   value={productSearch}
//                   onChange={(e) => setProductSearch(e.target.value)}
//                   placeholder="Search products by title..."
//                   className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//                     text-sm outline-none focus:border-pink-400 bg-gray-50 focus:bg-white transition-all"
//                 />
//               </div>

//               {/* Product search results */}
//               <div className="space-y-2 max-h-48 overflow-y-auto">
//                 {productLoading && (
//                   <div className="text-center py-4 text-gray-400 text-sm">
//                     Loading products...
//                   </div>
//                 )}
//                 {!productLoading &&
//                   products.map((p) => {
//                     const added = selProducts.find(
//                       (sp) => sp.product._id === p._id,
//                     );
//                     return (
//                       <div
//                         key={p._id}
//                         className="flex items-center gap-3 p-3 rounded-xl"
//                         style={{
//                           background: added ? "#f0fdf4" : "#f8fafc",
//                           border: `1px solid ${added ? "#bbf7d0" : "#e2e8f0"}`,
//                         }}
//                       >
//                         {p.image ? (
//                           <img
//                             src={p.image}
//                             alt={p.title}
//                             className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
//                           />
//                         ) : (
//                           <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl flex-shrink-0">
//                             🛍️
//                           </div>
//                         )}
//                         <div className="flex-1 min-w-0">
//                           <p className="text-gray-800 text-xs font-semibold truncate">
//                             {p.title}
//                           </p>
//                           <p className="text-gray-400 text-[10px]">
//                             ${(p.salesPrice || 0).toFixed(2)} · Cost: $
//                             {(p.costPrice || 0).toFixed(2)}
//                           </p>
//                         </div>
//                         {added ? (
//                           <button
//                             onClick={() => removeProduct(p._id)}
//                             className="text-red-400 text-xs font-bold hover:text-red-600 flex-shrink-0"
//                           >
//                             Remove
//                           </button>
//                         ) : (
//                           <button
//                             onClick={() => addProduct(p)}
//                             className="px-3 py-1.5 rounded-lg text-xs font-bold text-white flex-shrink-0"
//                             style={{ background: "#f02d65" }}
//                           >
//                             + Add
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })}
//               </div>

//               {/* Selected products with qty controls */}
//               {selProducts.length > 0 && (
//                 <div>
//                   <p className="text-gray-500 text-xs font-semibold mb-2">
//                     Selected ({selProducts.length}):
//                   </p>
//                   <div className="space-y-2">
//                     {selProducts.map(({ product: p, quantity }) => (
//                       <div
//                         key={p._id}
//                         className="flex items-center gap-3 p-3 rounded-xl"
//                         style={{
//                           background: "#f0fdf4",
//                           border: "1px solid #bbf7d0",
//                         }}
//                       >
//                         <div className="flex-1 min-w-0">
//                           <p className="text-gray-700 text-xs font-semibold truncate">
//                             {p.title}
//                           </p>
//                           <p className="text-gray-400 text-[10px]">
//                             ${(p.salesPrice || 0).toFixed(2)} each
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2 flex-shrink-0">
//                           <button
//                             onClick={() => updateQty(p._id, quantity - 1)}
//                             className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold
//                               flex items-center justify-center hover:bg-gray-200"
//                           >
//                             −
//                           </button>
//                           <span className="text-gray-800 text-sm font-bold w-6 text-center">
//                             {quantity}
//                           </span>
//                           <button
//                             onClick={() => updateQty(p._id, quantity + 1)}
//                             className="w-6 h-6 rounded-lg bg-gray-100 text-gray-600 text-sm font-bold
//                               flex items-center justify-center hover:bg-gray-200"
//                           >
//                             +
//                           </button>
//                           <button
//                             onClick={() => removeProduct(p._id)}
//                             className="w-6 h-6 rounded-lg bg-red-50 text-red-400 text-xs
//                               flex items-center justify-center hover:bg-red-100"
//                           >
//                             ✕
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Completion days */}
//               <div>
//                 <p className="text-gray-500 text-xs font-semibold mb-2">
//                   Completion Days (pickup deadline):
//                 </p>
//                 <div className="flex items-center gap-3">
//                   {[1, 2, 3, 5, 7, 10].map((d) => (
//                     <button
//                       key={d}
//                       onClick={() => setCompletionDays(d)}
//                       className="w-10 h-10 rounded-xl text-sm font-bold transition-all hover:scale-110"
//                       style={
//                         completionDays === d
//                           ? { background: "#f02d65", color: "white" }
//                           : { background: "#f3f4f6", color: "#6b7280" }
//                       }
//                     >
//                       {d}
//                     </button>
//                   ))}
//                   <span className="text-gray-400 text-xs">days</span>
//                 </div>
//               </div>

//               {/* Next step button */}
//               <button
//                 onClick={() => setStep(3)}
//                 disabled={selProducts.length === 0}
//                 className="w-full py-3 rounded-xl font-bold text-sm text-white
//                   disabled:opacity-40 hover:scale-105 transition-all"
//                 style={{
//                   background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                 }}
//               >
//                 Next: Review Order →
//               </button>
//             </>
//           )}

//           {/* ─── STEP 3: Confirm ─── */}
//           {step === 3 && (
//             <>
//               <div
//                 className="p-4 rounded-xl space-y-2"
//                 style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//               >
//                 <div className="flex justify-between">
//                   <span className="text-gray-400 text-xs">Merchant</span>
//                   <span className="text-gray-800 text-xs font-bold">
//                     {selMerchant?.storeName}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400 text-xs">Products</span>
//                   <span className="text-gray-800 text-xs font-bold">
//                     {selProducts.length} item(s)
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400 text-xs">Selling Price</span>
//                   <span className="text-green-600 text-xs font-bold">
//                     ${totalSellingPrice.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400 text-xs">Total Cost</span>
//                   <span className="text-gray-700 text-xs font-bold">
//                     ${totalCost.toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span className="text-gray-400 text-xs">Completion Days</span>
//                   <span className="text-gray-800 text-xs font-bold">
//                     {completionDays} day(s)
//                   </span>
//                 </div>
//                 <div className="h-px bg-gray-200 my-1" />
//                 <div className="flex justify-between">
//                   <span className="text-gray-500 text-xs font-bold">
//                     Estimated Earnings
//                   </span>
//                   <span className="text-purple-600 text-xs font-bold">
//                     ~${(totalSellingPrice * 0.15).toFixed(2)}+ (VIP rate)
//                   </span>
//                 </div>
//               </div>

//               {/* Products summary */}
//               <div className="space-y-2">
//                 {selProducts.map(({ product: p, quantity }) => (
//                   <div
//                     key={p._id}
//                     className="flex items-center gap-2 text-xs text-gray-600"
//                   >
//                     <span className="flex-1 truncate">{p.title}</span>
//                     <span className="text-gray-400 flex-shrink-0">
//                       ×{quantity}
//                     </span>
//                     <span className="font-bold flex-shrink-0">
//                       ${((p.salesPrice || 0) * quantity).toFixed(2)}
//                     </span>
//                   </div>
//                 ))}
//               </div>

//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setStep(2)}
//                   className="flex-1 py-3 rounded-xl border border-gray-200
//                     text-gray-500 text-sm hover:bg-gray-50 transition-all"
//                 >
//                   ← Back
//                 </button>
//                 <button
//                   onClick={() => dispatch.mutate()}
//                   disabled={dispatch.isPending}
//                   className="flex-1 py-3 rounded-xl font-bold text-sm text-white
//                     disabled:opacity-50 hover:scale-105 transition-all"
//                   style={{
//                     background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                     boxShadow: "0 4px 16px rgba(240,45,101,0.35)",
//                   }}
//                 >
//                   {dispatch.isPending ? "Dispatching..." : "📤 Dispatch Order"}
//                 </button>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

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
            style={{ padding: "8px 16px" }}
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 rounded-sm text-[13px] font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 shadow-sm"
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
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-sm">
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
