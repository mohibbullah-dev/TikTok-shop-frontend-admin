// frontend-admin/src/pages/merchants/FundDetails.jsx
//
// VERIFIED BACKEND ENDPOINTS:
//   GET    /api/transactions?merchantId=&type=&page=&limit=
//            → { transactions, total, pages }
//            → transactions[].merchant populated: { storeName, merchantId }
//            → superAdmin + merchantAdmin (merchantAdmin auto-filtered to referred merchants)
//   DELETE /api/transactions/:id  → superAdmin only
//
// Transaction MODEL FIELDS (exact):
//   merchant { storeName, merchantId }
//   linkedId (String — order SN or ref ID)
//   amount   (Number: positive=credit, negative=debit)
//   balanceAfter (Number — wallet snapshot after transaction)
//   type (String enum):
//     'orderPayment'   — merchant paid for order      (debit,  negative)
//     'orderCompleted' — profit after order confirmed (credit, positive)
//     'recharge'       — wallet top-up                (credit, positive)
//     'withdrawal'     — cash out                     (debit,  negative)
//     'signInBonus'    — daily sign-in reward          (credit, positive)
//     'vipUpgrade'     — VIP upgrade cost              (debit,  negative)
//     'adminAdd'       — admin manually added          (credit, positive)
//     'adminDeduct'    — admin manually deducted       (debit,  negative)
//   createdAt, updatedAt
//
// REDUX: useSelector(s => s.auth) → { user }
// AXIOS: import API from '../../api/axios'

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// ─── Transaction type config ──────────────────────────────────
// const TX_TYPES = {
//   orderPayment: {
//     label: "Order Payment",
//     color: "#ef4444",
//     icon: "🛒",
//     dir: "debit",
//   },
//   orderCompleted: {
//     label: "Order Profit",
//     color: "#22c55e",
//     icon: "✅",
//     dir: "credit",
//   },
//   recharge: { label: "Recharge", color: "#3b82f6", icon: "💳", dir: "credit" },
//   withdrawal: {
//     label: "Withdrawal",
//     color: "#f97316",
//     icon: "💸",
//     dir: "debit",
//   },
//   signInBonus: {
//     label: "Sign-in Bonus",
//     color: "#8b5cf6",
//     icon: "📅",
//     dir: "credit",
//   },
//   vipUpgrade: {
//     label: "VIP Upgrade",
//     color: "#ec4899",
//     icon: "👑",
//     dir: "debit",
//   },
//   adminAdd: { label: "Admin Add", color: "#06b6d4", icon: "➕", dir: "credit" },
//   adminDeduct: {
//     label: "Admin Deduct",
//     color: "#9ca3af",
//     icon: "➖",
//     dir: "debit",
//   },
// };

// const TYPE_TABS = [
//   { key: "", label: "All" },
//   { key: "orderPayment", label: "Order Payment" },
//   { key: "orderCompleted", label: "Order Profit" },
//   { key: "recharge", label: "Recharge" },
//   { key: "withdrawal", label: "Withdrawal" },
//   { key: "signInBonus", label: "Sign-in" },
//   { key: "vipUpgrade", label: "VIP Upgrade" },
//   { key: "adminAdd", label: "Admin Add" },
//   { key: "adminDeduct", label: "Admin Deduct" },
// ];

// export default function FundDetails() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";

//   const [tab, setTab] = useState(""); // transaction type filter
//   const [page, setPage] = useState(1);
//   const [merchant, setMerchant] = useState(""); // merchantId string filter
//   const [input, setInput] = useState(""); // controlled input before applying
//   const limit = 15;

//   // Reset page when filters change
//   useEffect(() => setPage(1), [tab, merchant]);

//   // ── Fetch: GET /api/transactions?merchantId=&type=&page=&limit=
//   // merchantAdmin: backend auto-scopes to their referred merchants
//   // superAdmin: sees all, can filter by merchantId
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["transactions", tab, page, merchant],
//     queryFn: async () => {
//       const params = new URLSearchParams({ page, limit });
//       if (tab) params.set("type", tab);
//       if (merchant) params.set("merchantId", merchant.trim());
//       const { data } = await API.get(`/transactions?${params}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const txs = data?.transactions || [];
//   const total = data?.total || 0;
//   const totalPages = data?.pages || 1;
//   const invalidate = () => queryClient.invalidateQueries(["transactions"]);

//   // ── Delete: DELETE /api/transactions/:id  (superAdmin only)
//   const remove = useMutation({
//     mutationFn: (id) => API.delete(`/transactions/${id}`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Transaction record deleted");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // Apply merchant filter when pressing Enter or clicking search
//   const applyMerchant = () => setMerchant(input.trim());

//   // Pagination
//   const getPageNums = () => {
//     if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
//     if (page <= 4) return [1, 2, 3, 4, 5, "...", totalPages];
//     if (page >= totalPages - 3)
//       return [
//         1,
//         "...",
//         totalPages - 4,
//         totalPages - 3,
//         totalPages - 2,
//         totalPages - 1,
//         totalPages,
//       ];
//     return [1, "...", page - 1, page, page + 1, "...", totalPages];
//   };

//   // Current tab color
//   const tabColor = tab ? TX_TYPES[tab]?.color || "#6b7280" : "#6b7280";

//   // Compute summary totals for visible page
//   const totalCredit = txs
//     .filter((t) => t.amount > 0)
//     .reduce((s, t) => s + t.amount, 0);
//   const totalDebit = txs
//     .filter((t) => t.amount < 0)
//     .reduce((s, t) => s + Math.abs(t.amount), 0);

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Fund Details
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total.toLocaleString()} records
//             {merchant && ` · filtered by merchant: ${merchant}`}
//             {user?.role === "merchantAdmin" &&
//               " · showing your referred merchants only"}
//           </p>
//         </div>
//         <button
//           onClick={invalidate}
//           className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//             border border-gray-200 text-gray-500 hover:bg-gray-50
//             text-sm transition-all self-start"
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

//       {/* ── Summary strip (current page totals) ── */}
//       {txs.length > 0 && (
//         <div className="grid grid-cols-3 gap-3">
//           {[
//             {
//               label: "Records (page)",
//               value: txs.length,
//               color: "#6366f1",
//               icon: "📋",
//             },
//             {
//               label: "Credits (+)",
//               value: `+$${totalCredit.toFixed(2)}`,
//               color: "#22c55e",
//               icon: "📈",
//             },
//             {
//               label: "Debits (−)",
//               value: `-$${totalDebit.toFixed(2)}`,
//               color: "#ef4444",
//               icon: "📉",
//             },
//           ].map((s) => (
//             <div
//               key={s.label}
//               className="bg-white rounded-xl px-4 py-3 flex items-center gap-3"
//               style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
//             >
//               <div
//                 className="w-8 h-8 rounded-xl flex items-center justify-center
//                 text-sm flex-shrink-0"
//                 style={{ background: s.color + "18" }}
//               >
//                 {s.icon}
//               </div>
//               <div>
//                 <p className="text-[10px] text-gray-400">{s.label}</p>
//                 <p className="text-gray-800 font-bold text-sm">{s.value}</p>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Filters: type tabs + merchant search ── */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-3"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* Type tabs — scrollable */}
//         <div className="flex gap-2 overflow-x-auto pb-1 -mb-1">
//           {TYPE_TABS.map((t) => {
//             const color = t.key
//               ? TX_TYPES[t.key]?.color || "#6b7280"
//               : "#6b7280";
//             return (
//               <button
//                 key={t.key}
//                 onClick={() => setTab(t.key)}
//                 className="px-3 py-1.5 rounded-xl text-xs font-semibold
//                   transition-all whitespace-nowrap flex-shrink-0"
//                 style={
//                   tab === t.key
//                     ? {
//                         background: color,
//                         color: "white",
//                         boxShadow: `0 3px 10px ${color}40`,
//                       }
//                     : { background: "#f3f4f6", color: "#6b7280" }
//                 }
//               >
//                 {t.key && TX_TYPES[t.key]?.icon + " "}
//                 {t.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Merchant ID search — superAdmin only (merchantAdmin auto-scoped) */}
//         {isSuperAdmin && (
//           <div className="flex gap-2 max-w-md">
//             <div className="relative flex-1">
//               <svg
//                 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="M21 21l-4.35-4.35" />
//               </svg>
//               <input
//                 value={input}
//                 onChange={(e) => setInput(e.target.value)}
//                 onKeyDown={(e) => e.key === "Enter" && applyMerchant()}
//                 placeholder="Filter by Merchant ID..."
//                 className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//                   text-sm outline-none focus:border-pink-400 bg-gray-50
//                   focus:bg-white transition-all"
//               />
//             </div>
//             <button
//               onClick={applyMerchant}
//               className="px-4 py-2.5 rounded-xl text-white text-sm font-bold
//                 transition-all hover:scale-105 active:scale-95"
//               style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//             >
//               Search
//             </button>
//             {merchant && (
//               <button
//                 onClick={() => {
//                   setMerchant("");
//                   setInput("");
//                 }}
//                 className="px-3 py-2.5 rounded-xl border border-gray-200
//                   text-gray-400 hover:bg-gray-50 text-sm transition-all"
//               >
//                 ✕
//               </button>
//             )}
//           </div>
//         )}
//       </div>

//       {/* ── Table ── */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 780 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Merchant",
//                   "Type",
//                   "Amount",
//                   "Balance After",
//                   "Linked ID",
//                   "Date",
//                   isSuperAdmin ? "Actions" : null,
//                 ]
//                   .filter(Boolean)
//                   .map((h) => (
//                     <th
//                       key={h}
//                       className="px-4 py-3 text-left text-[11px] font-bold
//                       text-gray-400 uppercase tracking-wider whitespace-nowrap"
//                     >
//                       {h}
//                     </th>
//                   ))}
//               </tr>
//             </thead>
//             <tbody>
//               {/* Loading skeleton */}
//               {isLoading &&
//                 [...Array(8)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(isSuperAdmin ? 8 : 7)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}

//               {/* Empty */}
//               {!isLoading && txs.length === 0 && (
//                 <tr>
//                   <td
//                     colSpan={isSuperAdmin ? 8 : 7}
//                     className="text-center py-20"
//                   >
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-6xl">💳</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No{tab ? ` "${TX_TYPES[tab]?.label}"` : ""} transactions
//                         found
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}

//               {/* Data rows */}
//               {!isLoading &&
//                 txs.map((tx, i) => {
//                   const cfg = TX_TYPES[tx.type] || {
//                     label: tx.type,
//                     color: "#6b7280",
//                     icon: "💱",
//                     dir: "credit",
//                   };
//                   const isCredit = tx.amount > 0;

//                   return (
//                     <tr
//                       key={tx._id}
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
//                         <p className="text-gray-800 text-xs font-semibold truncate max-w-[110px]">
//                           {tx.merchant?.storeName || "—"}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {tx.merchant?.merchantId}
//                         </p>
//                       </td>

//                       {/* Type badge */}
//                       <td className="px-4 py-3.5">
//                         <div className="flex items-center gap-1.5">
//                           <span className="text-sm">{cfg.icon}</span>
//                           <span
//                             className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap"
//                             style={{
//                               background: cfg.color + "15",
//                               color: cfg.color,
//                             }}
//                           >
//                             {cfg.label}
//                           </span>
//                         </div>
//                       </td>

//                       {/* Amount — green for credit, red for debit */}
//                       <td className="px-4 py-3.5">
//                         <span
//                           className="text-sm font-extrabold"
//                           style={{ color: isCredit ? "#22c55e" : "#ef4444" }}
//                         >
//                           {isCredit ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
//                         </span>
//                       </td>

//                       {/* Balance after — snapshot after this tx */}
//                       <td className="px-4 py-3.5">
//                         <span className="text-gray-600 text-sm font-semibold">
//                           ${(tx.balanceAfter || 0).toFixed(2)}
//                         </span>
//                       </td>

//                       {/* Linked ID — order SN or reference */}
//                       <td className="px-4 py-3.5">
//                         <span
//                           className="text-gray-400 text-[10px] font-mono
//                         truncate block max-w-[120px]"
//                         >
//                           {tx.linkedId || "—"}
//                         </span>
//                       </td>

//                       {/* Date */}
//                       <td className="px-4 py-3.5">
//                         <p className="text-gray-500 text-xs whitespace-nowrap">
//                           {new Date(tx.createdAt).toLocaleDateString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "2-digit",
//                           })}
//                         </p>
//                         <p className="text-gray-400 text-[10px]">
//                           {new Date(tx.createdAt).toLocaleTimeString("en-US", {
//                             hour: "2-digit",
//                             minute: "2-digit",
//                           })}
//                         </p>
//                       </td>

//                       {/* Delete — superAdmin only */}
//                       {isSuperAdmin && (
//                         <td className="px-4 py-3.5">
//                           <button
//                             onClick={() =>
//                               window.confirm(
//                                 `Delete this ${cfg.label} record? This cannot be undone.`,
//                               ) && remove.mutate(tx._id)
//                             }
//                             disabled={remove.isPending}
//                             title="Delete record"
//                             className="w-7 h-7 rounded-lg flex items-center
//                             justify-center text-xs transition-all
//                             hover:scale-110 active:scale-95 disabled:opacity-40"
//                             style={{
//                               background: "#ef444415",
//                               color: "#ef4444",
//                             }}
//                           >
//                             🗑️
//                           </button>
//                         </td>
//                       )}
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
//               Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)}{" "}
//               of {total.toLocaleString()}
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
//               {getPageNums().map((n, i) =>
//                 n === "..." ? (
//                   <span
//                     key={`e${i}`}
//                     className="w-8 text-center text-gray-400 text-xs"
//                   >
//                     …
//                   </span>
//                 ) : (
//                   <button
//                     key={n}
//                     onClick={() => setPage(n)}
//                     className="w-8 h-8 rounded-lg text-xs font-semibold transition-all"
//                     style={
//                       n === page
//                         ? { background: tabColor, color: "white" }
//                         : { color: "#6b7280" }
//                     }
//                   >
//                     {n}
//                   </button>
//                 ),
//               )}
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
//     </div>
//   );
// }

////////////////////////////////////// ====================== latest verion (by gemeni pro) =========================//////////////////////////
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  Trash2,
  ClipboardList,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

// ── Transaction type config ───────────────────────────────────
const TX_TYPES = {
  orderPayment: { label: "Order Payment", color: "#ef4444", dot: "bg-red-500" },
  orderCompleted: {
    label: "Order Profit",
    color: "#f59e0b",
    dot: "bg-amber-500",
  },
  recharge: { label: "Recharge", color: "#3b82f6", dot: "bg-blue-500" },
  withdrawal: { label: "Withdrawal", color: "#f97316", dot: "bg-orange-500" },
  signInBonus: {
    label: "Sign-in Bonus",
    color: "#8b5cf6",
    dot: "bg-purple-500",
  },
  vipUpgrade: { label: "VIP Upgrade", color: "#ec4899", dot: "bg-pink-500" },
  adminAdd: { label: "Admin Add", color: "#10b981", dot: "bg-emerald-500" },
  adminDeduct: { label: "Admin Deduct", color: "#64748b", dot: "bg-slate-500" },
};

// ── Reusable UI components (Matched Exactly to MerchantList) ──
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
      className="w-full px-3.5 py-2 rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white"
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
      className="w-full px-3.5 py-2 rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
      {...props}
    >
      {children}
    </select>
  </div>
);

// ── Main component ────────────────────────────────────────────
export default function FundDetails() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";

  // 1. Input States (What the user types)
  const [idInput, setIdInput] = useState("");
  const [linkedIdInput, setLinkedIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [typeInput, setTypeInput] = useState("");

  // 2. Active Filter States (Sent to backend on Submit)
  const [activeFilters, setActiveFilters] = useState({
    merchantId: "",
    type: "",
    searchName: "",
    linkedId: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter Handlers
  const handleSubmitFilters = () => {
    setActiveFilters({
      merchantId: idInput.trim(),
      searchName: nameInput.trim(),
      linkedId: linkedIdInput.trim(),
      type: typeInput,
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setIdInput("");
    setLinkedIdInput("");
    setNameInput("");
    setTypeInput("");
    setActiveFilters({
      merchantId: "",
      type: "",
      searchName: "",
      linkedId: "",
    });
    setPage(1);
  };

  // Fetch Logic
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["transactions", page, limit, activeFilters],
    queryFn: async () => {
      const params = new URLSearchParams({ page, limit });
      if (activeFilters.type) params.set("type", activeFilters.type);
      if (activeFilters.merchantId)
        params.set("merchantId", activeFilters.merchantId);

      const { data } = await API.get(`/transactions?${params.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const txs = data?.transactions || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;
  const invalidate = () => queryClient.invalidateQueries(["transactions"]);

  // Delete Mutation
  const remove = useMutation({
    mutationFn: (id) => API.delete(`/transactions/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Transaction record deleted");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to delete"),
  });

  // Pagination Helper
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

  // Summary Totals for current page
  const totalCredit = txs
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const totalDebit = txs
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Fund Details</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} financial records found.
          {user?.role === "merchantAdmin" &&
            " (Viewing referred merchants only)"}
        </p>
      </div>

      {/* ── Premium Summary Strip ── */}
      {!isLoading && txs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-md p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-sm bg-blue-50 text-blue-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px] font-medium">
                Page Records
              </p>
              <p className="text-gray-800 font-bold text-lg leading-tight">
                {txs.length}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-md p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-sm bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px] font-medium">
                Page Credits (+)
              </p>
              <p className="text-emerald-600 font-bold text-lg leading-tight">
                +${totalCredit.toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-md p-4 flex items-center gap-4 border border-gray-100 shadow-sm">
            <div className="w-10 h-10 rounded-sm bg-red-50 text-red-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-500 text-[12px] font-medium">
                Page Debits (−)
              </p>
              <p className="text-red-600 font-bold text-lg leading-tight">
                -${totalDebit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Advanced Filter Grid ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <FormInput
            label="Transaction ID"
            placeholder="Search ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <FormInput
            label="Linked ID"
            placeholder="Linked Order ID"
            value={linkedIdInput}
            onChange={(e) => setLinkedIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant Name"
            placeholder="Search Merchant"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <FormSelect
            label="Type"
            value={typeInput}
            onChange={(e) => setTypeInput(e.target.value)}
          >
            <option value="">All Types</option>
            {Object.entries(TX_TYPES).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
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
            Financial Records
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
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] uppercase tracking-wider bg-gray-50/50">
                <th
                  style={{ padding: "5px" }}
                  className="py-4 px-5 text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-4 px-5 font-bold">ID</th>
                <th className="py-4 px-5 font-bold">Linked ID</th>
                <th className="py-4 px-5 font-bold">Merchant Name</th>
                <th className="py-4 px-5 font-bold">Amount</th>
                <th className="py-4 px-5 font-bold">Type</th>
                <th className="py-4 px-5 font-bold">Creation Time</th>
                {isSuperAdmin && (
                  <th className="py-4 px-5 font-bold text-center">Operate</th>
                )}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isSuperAdmin ? 8 : 7} className="py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <p className="text-gray-500 text-[13px] font-medium">
                        Loading records...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : txs.length === 0 ? (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 8 : 7}
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No financial records found matching your filters.
                  </td>
                </tr>
              ) : (
                txs.map((tx) => {
                  const cfg = TX_TYPES[tx.type] || {
                    label: tx.type,
                    color: "#6b7280",
                    dot: "bg-gray-500",
                  };
                  const isCredit = tx.amount > 0;

                  return (
                    <tr
                      key={tx._id}
                      className="border-b border-gray-50 hover:bg-teal-50/30 transition-colors group"
                    >
                      <td className="py-3 px-5 text-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </td>

                      <td className="py-3 px-5 text-[13px] text-gray-600 font-mono tracking-tight">
                        {tx._id.slice(-6).toUpperCase()}
                      </td>

                      <td
                        className="py-3 px-5 text-[13px] text-gray-500 font-mono max-w-[150px] truncate"
                        title={tx.linkedId}
                      >
                        {tx.linkedId || "—"}
                      </td>

                      <td className="py-3 px-5">
                        <div className="text-[13px] font-bold text-gray-800">
                          {tx.merchant?.storeName || "—"}
                        </div>
                      </td>

                      <td className="py-3 px-5">
                        <span
                          className={`text-[13px] font-black ${isCredit ? "text-emerald-600" : "text-red-600"}`}
                        >
                          {isCredit ? "+" : "-"}$
                          {Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>

                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${cfg.dot}`}
                          ></span>
                          <span
                            className="text-[13px] font-medium text-gray-700"
                            style={{ color: cfg.color }}
                          >
                            {cfg.label}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-5 text-[13px] text-gray-500">
                        {new Date(tx.createdAt).toLocaleDateString("en-CA")}{" "}
                        {new Date(tx.createdAt).toLocaleTimeString()}
                      </td>

                      {isSuperAdmin && (
                        <td className="py-3 px-5 text-center">
                          <ActionBtn
                            color="#dc2626"
                            label="Delete"
                            icon={Trash2}
                            onClick={() =>
                              window.confirm(
                                `Delete this ${cfg.label} record?`,
                              ) && remove.mutate(tx._id)
                            }
                            disabled={remove.isPending}
                          />
                        </td>
                      )}
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
    </div>
  );
}
