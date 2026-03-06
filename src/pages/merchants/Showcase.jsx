// frontend-admin/src/pages/merchants/Showcase.jsx
//
// WHAT THIS PAGE IS:
//   The product distribution center / showcase management.
//   superAdmin views all products, toggles "recommended" status.
//   Merchants distribute products from here to their own stores.
//
// VERIFIED BACKEND ENDPOINTS:
//   GET  /api/products/admin?title=&isRecommended=&merchantId=&page=&limit=
//          → { products, total, pages }
//          → products[].merchant populated: { storeName, merchantId }
//          superAdmin only
//
//   PUT  /api/products/:id/recommend
//          → toggles isRecommended (uses $not operator, no body needed)
//          superAdmin only
//          → returns { message, product }
//
// Product MODEL FIELDS (exact):
//   title(String), image(String URL)
//   category(String)
//   salesPrice(Number — customer pays), costPrice(Number — base cost)
//   profit(Number — salesPrice - costPrice)
//   sales(Number), clicks(Number)
//   predictSales, predictClicks
//   stock(Number default:99999)
//   isRecommended(Boolean), isActive(Boolean)
//   isDistribution(Boolean — true = in distribution center)
//   merchant { storeName, merchantId } — null for platform products
//   createdAt

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// const TABS = [
//   { key: "", label: "All Products" },
//   { key: "true", label: "⭐ Recommended" },
//   { key: "false", label: "Not Recommended" },
// ];

// export default function Showcase() {
//   const queryClient = useQueryClient();

//   const [tab, setTab] = useState("");
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const [input, setInput] = useState("");
//   const [modal, setModal] = useState(null); // 'view'
//   const [sel, setSel] = useState(null);
//   const limit = 12; // grid of 3 = clean rows

//   useEffect(() => setPage(1), [tab, search]);

//   // ── Fetch: GET /api/products/admin?title=&isRecommended=&page=&limit=
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["showcase-products", tab, page, search],
//     queryFn: async () => {
//       const params = new URLSearchParams({ page, limit });
//       if (search) params.set("title", search.trim());
//       if (tab) params.set("isRecommended", tab);
//       const { data } = await API.get(`/products/admin?${params}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const products = data?.products || [];
//   const total = data?.total || 0;
//   const totalPages = data?.pages || 1;
//   const invalidate = () => queryClient.invalidateQueries(["showcase-products"]);

//   // ── Toggle recommend: PUT /api/products/:id/recommend
//   // Uses MongoDB $not operator — no body needed
//   // Returns { message, product } with updated product
//   const toggleRecommend = useMutation({
//     mutationFn: (id) => API.put(`/products/${id}/recommend`),
//     onSuccess: (res) => {
//       invalidate();
//       const isRec = res.data?.product?.isRecommended;
//       toast.success(
//         isRec ? "⭐ Added to Recommended!" : "Removed from Recommended",
//       );
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   const openView = (p) => {
//     setSel(p);
//     setModal("view");
//   };
//   const closeModal = () => {
//     setModal(null);
//     setSel(null);
//   };
//   const applySearch = () => setSearch(input);

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

//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Product Showcase
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} products · Mark as recommended to promote to merchants
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
//           Refresh
//         </button>
//       </div>

//       {/* Filters */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-3"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         {/* Tabs */}
//         <div className="flex gap-2">
//           {TABS.map((t) => (
//             <button
//               key={t.key}
//               onClick={() => setTab(t.key)}
//               className="px-4 py-2 rounded-xl text-sm font-semibold
//                 transition-all whitespace-nowrap"
//               style={
//                 tab === t.key
//                   ? {
//                       background: "#f02d65",
//                       color: "white",
//                       boxShadow: "0 4px 12px #f02d6540",
//                     }
//                   : { background: "#f3f4f6", color: "#6b7280" }
//               }
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>
//         {/* Search */}
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
//               onKeyDown={(e) => e.key === "Enter" && applySearch()}
//               placeholder="Search by product title..."
//               className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//                 text-sm outline-none focus:border-pink-400 bg-gray-50
//                 focus:bg-white transition-all"
//             />
//           </div>
//           <button
//             onClick={applySearch}
//             className="px-4 py-2.5 rounded-xl text-white text-sm font-bold
//               transition-all hover:scale-105 active:scale-95"
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
//               className="px-3 py-2.5 rounded-xl border border-gray-200
//                 text-gray-400 hover:bg-gray-50 text-sm transition-all"
//             >
//               ✕
//             </button>
//           )}
//         </div>
//       </div>

//       {/* Products grid */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {[...Array(8)].map((_, i) => (
//             <div
//               key={i}
//               className="bg-white rounded-2xl overflow-hidden animate-pulse"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="h-36 bg-gray-100" />
//               <div className="p-4 space-y-2">
//                 <div className="h-3 bg-gray-100 rounded w-3/4" />
//                 <div className="h-3 bg-gray-100 rounded w-1/2" />
//                 <div className="h-8 bg-gray-100 rounded-xl mt-4" />
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : products.length === 0 ? (
//         <div
//           className="bg-white rounded-2xl py-20 flex flex-col items-center gap-4"
//           style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//         >
//           <span className="text-6xl">🛍️</span>
//           <p className="text-gray-400 text-sm font-medium">No products found</p>
//           {search && (
//             <button
//               onClick={() => {
//                 setSearch("");
//                 setInput("");
//               }}
//               className="px-4 py-2 rounded-xl border border-gray-200
//                 text-gray-500 text-sm hover:bg-gray-50"
//             >
//               Clear search
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {products.map((p) => (
//             <div
//               key={p._id}
//               className="bg-white rounded-2xl overflow-hidden transition-all
//                 hover:shadow-md group"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               {/* Product image */}
//               <div className="relative h-36 bg-gray-50 overflow-hidden">
//                 {p.image ? (
//                   <img
//                     src={p.image}
//                     alt={p.title}
//                     className="w-full h-full object-cover group-hover:scale-105
//                       transition-transform duration-300"
//                   />
//                 ) : (
//                   <div
//                     className="w-full h-full flex items-center justify-center
//                     text-5xl text-gray-200"
//                   >
//                     🛍️
//                   </div>
//                 )}
//                 {/* Recommended star badge */}
//                 {p.isRecommended && (
//                   <div
//                     className="absolute top-2 right-2 w-7 h-7 rounded-full
//                     flex items-center justify-center shadow-lg"
//                     style={{
//                       background: "linear-gradient(135deg,#f59e0b,#d97706)",
//                     }}
//                   >
//                     <span className="text-sm">⭐</span>
//                   </div>
//                 )}
//                 {/* Inactive overlay */}
//                 {!p.isActive && (
//                   <div
//                     className="absolute inset-0 bg-black/40 flex items-center
//                     justify-center"
//                   >
//                     <span
//                       className="text-white text-xs font-bold bg-black/50
//                       px-2 py-1 rounded-full"
//                     >
//                       OFF SHELF
//                     </span>
//                   </div>
//                 )}
//               </div>

//               {/* Product info */}
//               <div className="p-4">
//                 {/* Category + distribution badge */}
//                 <div className="flex items-center gap-1.5 mb-2">
//                   {p.category && (
//                     <span
//                       className="px-2 py-0.5 rounded-full text-[9px] font-bold"
//                       style={{ background: "#f3f4f6", color: "#6b7280" }}
//                     >
//                       {p.category}
//                     </span>
//                   )}
//                   {p.isDistribution && (
//                     <span
//                       className="px-2 py-0.5 rounded-full text-[9px] font-bold"
//                       style={{ background: "#dbeafe", color: "#1d4ed8" }}
//                     >
//                       Distribution
//                     </span>
//                   )}
//                 </div>

//                 {/* Title */}
//                 <p
//                   className="text-gray-800 font-semibold text-sm line-clamp-2
//                   leading-snug mb-2"
//                 >
//                   {p.title}
//                 </p>

//                 {/* Pricing */}
//                 <div className="flex items-center justify-between mb-1">
//                   <span className="text-pink-600 font-extrabold text-base">
//                     ${(p.salesPrice || 0).toFixed(2)}
//                   </span>
//                   <span className="text-gray-400 text-xs line-through">
//                     ${(p.costPrice || 0).toFixed(2)}
//                   </span>
//                 </div>

//                 {/* Profit */}
//                 <p className="text-green-600 text-[11px] font-semibold mb-3">
//                   Profit: ${(p.profit || 0).toFixed(2)}
//                 </p>

//                 {/* Stats row */}
//                 <div className="flex items-center gap-3 text-[10px] text-gray-400 mb-3">
//                   <span>📦 {(p.sales || 0).toLocaleString()} sold</span>
//                   <span>👁️ {(p.clicks || 0).toLocaleString()}</span>
//                 </div>

//                 {/* Merchant info */}
//                 {p.merchant && (
//                   <p className="text-gray-400 text-[10px] mb-3 truncate">
//                     🏪 {p.merchant.storeName}
//                   </p>
//                 )}

//                 {/* Action buttons */}
//                 <div className="flex gap-2">
//                   {/* Recommend toggle */}
//                   <button
//                     onClick={() => toggleRecommend.mutate(p._id)}
//                     disabled={toggleRecommend.isPending}
//                     className="flex-1 py-2 rounded-xl text-xs font-bold
//                       transition-all hover:scale-105 active:scale-95
//                       disabled:opacity-50"
//                     style={
//                       p.isRecommended
//                         ? {
//                             background: "#fef3c7",
//                             color: "#d97706",
//                             border: "1px solid #fde68a",
//                           }
//                         : {
//                             background: "#f3f4f6",
//                             color: "#6b7280",
//                             border: "1px solid #e5e7eb",
//                           }
//                     }
//                   >
//                     {p.isRecommended ? "⭐ Recommended" : "☆ Recommend"}
//                   </button>

//                   {/* View detail */}
//                   <button
//                     onClick={() => openView(p)}
//                     className="w-9 h-9 rounded-xl flex items-center justify-center
//                       text-sm transition-all hover:scale-110 flex-shrink-0"
//                     style={{ background: "#6366f115", color: "#6366f1" }}
//                   >
//                     👁️
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between flex-wrap gap-2">
//           <p className="text-gray-400 text-xs">
//             {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
//           </p>
//           <div className="flex items-center gap-1">
//             <button
//               onClick={() => setPage(1)}
//               disabled={page === 1}
//               className="w-8 h-8 rounded-lg text-gray-400 hover:bg-white disabled:opacity-30 text-sm"
//             >
//               «
//             </button>
//             <button
//               onClick={() => setPage((p) => p - 1)}
//               disabled={page === 1}
//               className="w-8 h-8 rounded-lg text-gray-400 hover:bg-white disabled:opacity-30 text-sm"
//             >
//               ‹
//             </button>
//             {getPageNums().map((n) => (
//               <button
//                 key={n}
//                 onClick={() => setPage(n)}
//                 className="w-8 h-8 rounded-xl text-xs font-semibold transition-all"
//                 style={
//                   n === page
//                     ? {
//                         background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                         color: "white",
//                       }
//                     : { color: "#6b7280", background: "white" }
//                 }
//               >
//                 {n}
//               </button>
//             ))}
//             <button
//               onClick={() => setPage((p) => p + 1)}
//               disabled={page === totalPages}
//               className="w-8 h-8 rounded-lg text-gray-400 hover:bg-white disabled:opacity-30 text-sm"
//             >
//               ›
//             </button>
//             <button
//               onClick={() => setPage(totalPages)}
//               disabled={page === totalPages}
//               className="w-8 h-8 rounded-lg text-gray-400 hover:bg-white disabled:opacity-30 text-sm"
//             >
//               »
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ══ View Detail Modal ═════════════════════════════════ */}
//       {modal === "view" && sel && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//           <div
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={closeModal}
//           />
//           <div
//             className="relative bg-white rounded-2xl w-full max-w-sm
//             max-h-[90vh] overflow-y-auto"
//             style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.25)" }}
//           >
//             {/* Image */}
//             <div className="h-48 bg-gray-100 overflow-hidden rounded-t-2xl relative">
//               {sel.image ? (
//                 <img
//                   src={sel.image}
//                   alt={sel.title}
//                   className="w-full h-full object-cover"
//                 />
//               ) : (
//                 <div
//                   className="w-full h-full flex items-center justify-center
//                     text-6xl text-gray-200"
//                 >
//                   🛍️
//                 </div>
//               )}
//               {sel.isRecommended && (
//                 <div
//                   className="absolute top-3 right-3 px-3 py-1 rounded-full
//                   text-xs font-bold text-white shadow"
//                   style={{
//                     background: "linear-gradient(135deg,#f59e0b,#d97706)",
//                   }}
//                 >
//                   ⭐ Recommended
//                 </div>
//               )}
//             </div>

//             <div className="p-5 space-y-4">
//               {/* Title + close */}
//               <div className="flex items-start justify-between gap-3">
//                 <h2 className="text-gray-800 font-extrabold text-base leading-snug flex-1">
//                   {sel.title}
//                 </h2>
//                 <button
//                   onClick={closeModal}
//                   className="w-8 h-8 rounded-xl bg-gray-100 flex items-center
//                     justify-center text-gray-400 hover:bg-gray-200 flex-shrink-0"
//                 >
//                   ✕
//                 </button>
//               </div>

//               {/* Pricing box */}
//               <div
//                 className="p-3 rounded-xl grid grid-cols-3 gap-2 text-center"
//                 style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//               >
//                 {[
//                   {
//                     label: "Sales Price",
//                     val: `$${(sel.salesPrice || 0).toFixed(2)}`,
//                     color: "#f02d65",
//                   },
//                   {
//                     label: "Cost Price",
//                     val: `$${(sel.costPrice || 0).toFixed(2)}`,
//                     color: "#6b7280",
//                   },
//                   {
//                     label: "Profit",
//                     val: `$${(sel.profit || 0).toFixed(2)}`,
//                     color: "#22c55e",
//                   },
//                 ].map((x) => (
//                   <div key={x.label}>
//                     <p className="text-[10px] text-gray-400">{x.label}</p>
//                     <p
//                       className="font-extrabold text-sm"
//                       style={{ color: x.color }}
//                     >
//                       {x.val}
//                     </p>
//                   </div>
//                 ))}
//               </div>

//               {/* Stats */}
//               <div className="grid grid-cols-2 gap-3">
//                 {[
//                   { label: "Sales", val: (sel.sales || 0).toLocaleString() },
//                   { label: "Clicks", val: (sel.clicks || 0).toLocaleString() },
//                   {
//                     label: "Predict Sales",
//                     val: (sel.predictSales || 0).toLocaleString(),
//                   },
//                   { label: "Stock", val: (sel.stock || 0).toLocaleString() },
//                 ].map((x) => (
//                   <div
//                     key={x.label}
//                     className="p-2.5 rounded-xl"
//                     style={{ background: "#f8fafc" }}
//                   >
//                     <p className="text-gray-400 text-[10px]">{x.label}</p>
//                     <p className="text-gray-800 font-bold text-sm">{x.val}</p>
//                   </div>
//                 ))}
//               </div>

//               {/* Merchant */}
//               {sel.merchant && (
//                 <div
//                   className="flex items-center gap-2 p-3 rounded-xl"
//                   style={{ background: "#f8fafc" }}
//                 >
//                   <span>🏪</span>
//                   <div>
//                     <p className="text-gray-800 text-xs font-semibold">
//                       {sel.merchant.storeName}
//                     </p>
//                     <p className="text-gray-400 text-[10px]">
//                       {sel.merchant.merchantId}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Badges row */}
//               <div className="flex items-center gap-2 flex-wrap">
//                 {sel.isDistribution && (
//                   <span
//                     className="px-2.5 py-1 rounded-full text-xs font-bold"
//                     style={{ background: "#dbeafe", color: "#1d4ed8" }}
//                   >
//                     Distribution
//                   </span>
//                 )}
//                 <span
//                   className="px-2.5 py-1 rounded-full text-xs font-bold"
//                   style={
//                     sel.isActive
//                       ? { background: "#dcfce7", color: "#16a34a" }
//                       : { background: "#fee2e2", color: "#ef4444" }
//                   }
//                 >
//                   {sel.isActive ? "● Active" : "○ Off Shelf"}
//                 </span>
//                 {sel.category && (
//                   <span
//                     className="px-2.5 py-1 rounded-full text-xs font-bold"
//                     style={{ background: "#f3f4f6", color: "#6b7280" }}
//                   >
//                     {sel.category}
//                   </span>
//                 )}
//               </div>

//               {/* Recommend toggle in modal */}
//               <button
//                 onClick={() => {
//                   toggleRecommend.mutate(sel._id);
//                   closeModal();
//                 }}
//                 disabled={toggleRecommend.isPending}
//                 className="w-full py-3 rounded-xl font-bold text-sm
//                   transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
//                 style={
//                   sel.isRecommended
//                     ? {
//                         background: "#fef3c7",
//                         color: "#d97706",
//                         border: "1px solid #fde68a",
//                       }
//                     : {
//                         background: "linear-gradient(135deg,#f59e0b,#d97706)",
//                         color: "white",
//                       }
//                 }
//               >
//                 {sel.isRecommended
//                   ? "☆ Remove from Recommended"
//                   : "⭐ Add to Recommended"}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

///////////////////// ====================== latest versoin (by gemeni) ========================////////////////////

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  Eye,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm"
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

const Field = ({ label, value, mono }) => (
  <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-[13px] font-medium flex-shrink-0 w-32">
      {label}
    </span>
    <span
      className={`text-gray-900 text-[13px] font-semibold text-right break-all flex-1 ${mono ? "font-mono text-blue-700" : ""}`}
    >
      {value || "—"}
    </span>
  </div>
);

// ── Demo-style Toggle Switch ──────────────────────────────────
const ToggleSwitch = ({ checked, onChange, disabled }) => (
  <button
    type="button"
    onClick={onChange}
    disabled={disabled}
    className={`relative w-9 h-5 rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
      checked ? "bg-emerald-500" : "bg-gray-300"
    }`}
  >
    <span
      className={`absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform duration-200 ease-in-out shadow-sm ${
        checked ? "translate-x-4" : "translate-x-0"
      }`}
    />
  </button>
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
export default function Showcase() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter Inputs
  const [titleInput, setTitleInput] = useState("");
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const [recommendInput, setRecommendInput] = useState("");

  // Active Filter States (Sent to backend on Submit)
  const [activeFilters, setActiveFilters] = useState({
    title: "",
    merchantId: "",
    isRecommended: "",
  });

  const [modal, setModal] = useState(null); // 'view'
  const [sel, setSel] = useState(null);

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["showcase-products", page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (activeFilters.title) p.set("title", activeFilters.title);
      if (activeFilters.merchantId)
        p.set("merchantId", activeFilters.merchantId);
      if (activeFilters.isRecommended !== "")
        p.set("isRecommended", activeFilters.isRecommended);

      const { data } = await API.get(`/products/admin?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["showcase-products"]);

  const handleSearch = () => {
    setActiveFilters({
      title: titleInput.trim(),
      merchantId: merchantIdInput.trim(),
      isRecommended: recommendInput,
    });
    setPage(1);
  };

  const handleReset = () => {
    setTitleInput("");
    setMerchantIdInput("");
    setRecommendInput("");
    setActiveFilters({ title: "", merchantId: "", isRecommended: "" });
    setPage(1);
  };

  // ── Toggle recommend Mutation ──────────────────────────────────
  const toggleRecommend = useMutation({
    mutationFn: (id) => API.put(`/products/${id}/recommend`),
    onSuccess: (res) => {
      invalidate();
      const isRec = res.data?.product?.isRecommended;
      toast.success(
        isRec
          ? "Product marked as Recommended! ⭐"
          : "Removed from Recommended",
      );
    },
    onError: (e) =>
      toast.error(
        e.response?.data?.message || "Failed to update recommendation",
      ),
  });

  // ── Toggle Active (On/Off Shelf) Mutation ────────────────────
  const toggleActive = useMutation({
    mutationFn: (id) => API.put(`/products/${id}/toggle-admin`), // Calls the new API endpoint
    onSuccess: (res) => {
      invalidate();
      const isActive = res.data?.product?.isActive;
      toast.success(
        isActive
          ? "Product is now Active (On Shelf) 🟢"
          : "Product is now Inactive (Off Shelf) 🔴",
      );
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to toggle status"),
  });

  const openView = (p) => {
    setSel(p);
    setModal("view");
  };
  const closeModal = () => {
    setModal(null);
    setSel(null);
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
        <h1 className="text-xl font-bold text-gray-800">Merchant Showcase</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} products · Manage and recommend merchant
          products across the platform.
        </p>
      </div>

      {/* ── Advanced Visual Filter Grid (Matches Demo) ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
          <FormInput
            label="Product.title"
            placeholder="Search product title..."
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
          />
          <FormInput
            label="Mer_id"
            placeholder="Merchant ID"
            value={merchantIdInput}
            onChange={(e) => setMerchantIdInput(e.target.value)}
          />
          <FormSelect
            label="Is_recommend"
            value={recommendInput}
            onChange={(e) => setRecommendInput(e.target.value)}
          >
            <option value="">Choose</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </FormSelect>
        </div>
        <div
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          className="flex justify-end gap-3 pt-2 border-t border-gray-100"
        >
          <button
            style={{ padding: "5px 20px" }}
            onClick={handleReset}
            className="bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            Reset
          </button>
          <button
            style={{ padding: "5px 20px" }}
            onClick={handleSearch}
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
            title="Refresh Table"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1500px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-700 text-[12px] font-bold bg-white">
                <th
                  style={{ padding: "12px 15px" }}
                  className="text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>Id</th>
                <th style={{ padding: "12px 15px" }}>Mer_id</th>
                <th style={{ padding: "12px 15px" }}>Merchant.mer_name</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Sales
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Click
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Predict_sales
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Predict_click
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Is_recommend
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Switch (Active)
                </th>
                <th style={{ padding: "12px 15px" }}>Category</th>
                <th style={{ padding: "12px 15px" }}>Product.title</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Product.image
                </th>
                <th style={{ padding: "12px 15px" }}>Product.sales_price</th>
                <th style={{ padding: "12px 15px" }}>Product.cost_price</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="16" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[13px]">
                        Loading products...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="16"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p._id}
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
                      {p._id.slice(-6)}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600 font-mono"
                    >
                      {p.merchant?.merchantId || "—"}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-800 font-medium"
                    >
                      {p.merchant?.storeName || "Platform"}
                    </td>

                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-700 text-center font-mono"
                    >
                      {p.sales || 0}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-700 text-center font-mono"
                    >
                      {p.clicks || 0}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-700 text-center font-mono"
                    >
                      {p.predictSales || 0}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-700 text-center font-mono"
                    >
                      {p.predictClicks || 0}
                    </td>

                    {/* Is Recommended Toggle */}
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <ToggleSwitch
                        checked={p.isRecommended}
                        onChange={() => toggleRecommend.mutate(p._id)}
                        disabled={toggleRecommend.isPending}
                      />
                    </td>

                    {/* NOW WORKING: Is Active Switch */}
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <ToggleSwitch
                        checked={p.isActive}
                        onChange={() => toggleActive.mutate(p._id)}
                        disabled={toggleActive.isPending}
                      />
                    </td>

                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600"
                    >
                      {p.category || "Uncategorized"}
                    </td>

                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-800 font-medium max-w-[200px] truncate"
                      title={p.title}
                    >
                      {p.title}
                    </td>

                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      {p.image ? (
                        <div className="w-10 h-10 mx-auto rounded-sm border border-gray-200 overflow-hidden shadow-sm">
                          <img
                            src={p.image}
                            alt="thumbnail"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 mx-auto rounded-sm border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>

                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-800 font-mono"
                    >
                      {p.salesPrice?.toFixed(2)}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-500 font-mono line-through"
                    >
                      {p.costPrice?.toFixed(2)}
                    </td>

                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <div className="flex justify-center">
                        <button
                          onClick={() => openView(p)}
                          className="w-8 h-7 bg-slate-500 hover:bg-slate-600 text-white rounded-sm flex items-center justify-center transition-colors shadow-sm"
                          title="View Details"
                        >
                          <span className="text-lg leading-none mb-0.5">+</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
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

      {/* ════════════ VIEW MODAL ════════════ */}
      <Modal
        open={modal === "view"}
        onClose={closeModal}
        title="Product Details"
        icon={Eye}
        width="max-w-md"
      >
        {sel && (
          <div className="space-y-4">
            <div className="flex gap-4 p-4 border border-gray-200 rounded-sm bg-white shadow-sm">
              <div className="w-24 h-24 bg-gray-100 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200">
                {sel.image ? (
                  <img
                    src={sel.image}
                    alt={sel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-300 m-8" />
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h4 className="text-[14px] font-bold text-gray-900 leading-snug line-clamp-3">
                  {sel.title}
                </h4>
                <div className="mt-2 flex gap-2">
                  {sel.isRecommended && (
                    <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      ⭐ Recommended
                    </span>
                  )}
                  {sel.isDistribution && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-sm">
                      Platform Distribution
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-sm border border-gray-200 p-2 shadow-sm">
              <Field
                label="Merchant"
                value={sel.merchant?.storeName || "Platform Global"}
              />
              <Field label="Category" value={sel.category || "—"} />
              <Field
                label="Sales Price"
                value={`$${(sel.salesPrice || 0).toFixed(2)}`}
                mono
              />
              <Field
                label="Cost Price"
                value={`$${(sel.costPrice || 0).toFixed(2)}`}
                mono
              />
              <Field
                label="Profit"
                value={`$${(sel.profit || 0).toFixed(2)}`}
                mono
              />
              <Field
                label="Current Stock"
                value={(sel.stock || 0).toLocaleString()}
                mono
              />
              <Field
                label="Status"
                value={
                  sel.isActive
                    ? "✅ Active / On Shelf"
                    : "🚫 Inactive / Off Shelf"
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  Total Sales
                </p>
                <p className="text-xl font-black text-gray-800">
                  {sel.sales || 0}
                </p>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                  Total Clicks
                </p>
                <p className="text-xl font-black text-gray-800">
                  {sel.clicks || 0}
                </p>
              </div>
            </div>

            <button
              style={{ padding: "8px" }}
              onClick={closeModal}
              className="w-full mt-2 bg-slate-800 hover:bg-slate-900 text-white rounded-sm font-bold text-[13px] transition-colors shadow-sm"
            >
              Close Window
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
