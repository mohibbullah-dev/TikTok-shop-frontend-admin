// // frontend-admin/src/pages/merchants/Complaints.jsx
// //
// // WHAT THIS PAGE IS:
// //   Called "Complaints" in sidebar — it's the FAQ / Help Center management.
// //   Merchants see these articles in their app Help screen.
// //   superAdmin manages articles. All admin roles can view.
// //
// // VERIFIED BACKEND ENDPOINTS:
// //   GET    /api/questions           → PUBLIC, array [{_id,title,category,sortOrder}]
// //                                     NOTE: list does NOT include 'content'
// //   GET    /api/questions/:id       → PUBLIC, full {title,content,category,sortOrder,isActive}
// //   POST   /api/questions           → superAdmin only, body:{title,content,category,sortOrder}
// //   PUT    /api/questions/:id       → superAdmin only, body:any fields (findByIdAndUpdate)
// //   DELETE /api/questions/:id       → superAdmin only (findByIdAndDelete)
// //   POST   /api/questions/seed      → superAdmin only, seeds 7 default articles
// //
// // Question MODEL (exact fields):
// //   title(String required), content(String required)
// //   category(String)  ← seed uses: account|products|advertising|transport|finance|complaints|store
// //   sortOrder(Number default:0), isActive(Boolean default:true)

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// const CATS = [
//   { key: "account", label: "🔑 Account", color: "#6366f1" },
//   { key: "products", label: "📦 Products", color: "#f59e0b" },
//   { key: "advertising", label: "📣 Advertising", color: "#ec4899" },
//   { key: "transport", label: "🚚 Transport", color: "#0ea5e9" },
//   { key: "finance", label: "💰 Finance", color: "#22c55e" },
//   { key: "complaints", label: "🚨 Complaints", color: "#ef4444" },
//   { key: "store", label: "🏪 Store", color: "#8b5cf6" },
// ];
// const getCat = (key) =>
//   CATS.find((c) => c.key === key) || {
//     label: key || "General",
//     color: "#6b7280",
//   };

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
//           ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}
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

// const Field = ({ label, required, hint, children }) => (
//   <div>
//     <label className="block text-gray-500 text-xs font-semibold mb-1.5">
//       {label}
//       {required && <span className="text-red-400 ml-1">*</span>}
//     </label>
//     {children}
//     {hint && <p className="text-gray-400 text-[10px] mt-1">{hint}</p>}
//   </div>
// );

// const Input = (props) => (
//   <input
//     className="w-full px-4 py-2.5 rounded-xl border border-gray-200
//       text-sm text-gray-700 outline-none focus:border-pink-400
//       bg-gray-50 focus:bg-white transition-all"
//     {...props}
//   />
// );

// const EMPTY = { title: "", content: "", category: "account", sortOrder: "0" };

// export default function Complaints() {
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);
//   const isSuperAdmin = user?.role === "superAdmin";

//   const [filterCat, setFilterCat] = useState("");
//   const [modal, setModal] = useState(null);
//   const [form, setForm] = useState(EMPTY);
//   const [editId, setEditId] = useState(null);
//   const [viewItem, setViewItem] = useState(null);
//   const [fetchingId, setFetchingId] = useState(null);

//   // GET /api/questions — public, list only {_id, title, category, sortOrder}
//   const {
//     data: questions = [],
//     isLoading,
//     isFetching,
//     refetch,
//   } = useQuery({
//     queryKey: ["questions"],
//     queryFn: async () => {
//       const { data } = await API.get("/questions");
//       return data;
//     },
//   });

//   const filtered = filterCat
//     ? questions.filter((q) => q.category === filterCat)
//     : questions;
//   const invalidate = () => queryClient.invalidateQueries(["questions"]);

//   // GET /api/questions/:id — fetch full content before edit/view
//   const loadOne = async (id) => {
//     setFetchingId(id);
//     try {
//       const { data } = await API.get(`/questions/${id}`);
//       return data;
//     } catch {
//       toast.error("Failed to load article");
//       return null;
//     } finally {
//       setFetchingId(null);
//     }
//   };

//   // POST /api/questions/seed
//   const seed = useMutation({
//     mutationFn: () => API.post("/questions/seed"),
//     onSuccess: () => {
//       invalidate();
//       toast.success("7 FAQ articles seeded! ✅");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Seed failed"),
//   });

//   // POST /api/questions  body: {title, content, category, sortOrder}
//   const create = useMutation({
//     mutationFn: (body) => API.post("/questions", body),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Article created!");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // PUT /api/questions/:id  body: any fields
//   const update = useMutation({
//     mutationFn: ({ id, body }) => API.put(`/questions/${id}`, body),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Article updated!");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // DELETE /api/questions/:id  (findByIdAndDelete — no body needed)
//   const remove = useMutation({
//     mutationFn: (id) => API.delete(`/questions/${id}`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Article deleted");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   const openCreate = () => {
//     setForm(EMPTY);
//     setEditId(null);
//     setModal("create");
//   };

//   const openEdit = async (q) => {
//     const full = await loadOne(q._id);
//     if (!full) return;
//     setForm({
//       title: full.title || "",
//       content: full.content || "",
//       category: full.category || "account",
//       sortOrder: String(full.sortOrder ?? 0),
//     });
//     setEditId(q._id);
//     setModal("edit");
//   };

//   const openView = async (q) => {
//     const full = await loadOne(q._id);
//     if (!full) return;
//     setViewItem(full);
//     setModal("view");
//   };

//   const closeModal = () => {
//     setModal(null);
//     setEditId(null);
//     setViewItem(null);
//     setForm(EMPTY);
//   };

//   const setF = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

//   const submit = () => {
//     if (!form.title.trim()) return toast.error("Title is required");
//     if (!form.content.trim()) return toast.error("Content is required");
//     const body = {
//       title: form.title.trim(),
//       content: form.content.trim(),
//       category: form.category,
//       sortOrder: Number(form.sortOrder) || 0,
//     };
//     modal === "edit" && editId
//       ? update.mutate({ id: editId, body })
//       : create.mutate(body);
//   };

//   return (
//     <div className="space-y-4">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             FAQ / Help Center
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {filtered.length} articles visible to merchants
//           </p>
//         </div>
//         <div className="flex items-center gap-2 flex-wrap">
//           {isSuperAdmin && (
//             <>
//               <button
//                 onClick={() =>
//                   window.confirm(
//                     "Seed 7 defaults? Deletes all existing articles.",
//                   ) && seed.mutate()
//                 }
//                 disabled={seed.isPending}
//                 className="px-4 py-2.5 rounded-xl border border-gray-200
//                   text-gray-500 hover:bg-gray-50 text-sm font-semibold
//                   transition-all disabled:opacity-50"
//               >
//                 {seed.isPending ? "⏳ Seeding..." : "🌱 Seed Defaults"}
//               </button>
//               <button
//                 onClick={openCreate}
//                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                   text-sm font-bold text-white hover:scale-105 active:scale-95
//                   transition-all"
//                 style={{
//                   background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                   boxShadow: "0 4px 12px rgba(240,45,101,0.35)",
//                 }}
//               >
//                 <span className="text-base leading-none">+</span> New Article
//               </button>
//             </>
//           )}
//           <button
//             onClick={refetch}
//             title="Refresh"
//             className="w-10 h-10 rounded-xl border border-gray-200
//               text-gray-400 hover:bg-gray-50 flex items-center
//               justify-center transition-all"
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

//       {/* Category filter tabs */}
//       <div
//         className="bg-white rounded-2xl p-4"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="flex gap-2 flex-wrap">
//           <button
//             onClick={() => setFilterCat("")}
//             className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
//             style={
//               !filterCat
//                 ? {
//                     background: "#6b7280",
//                     color: "white",
//                     boxShadow: "0 4px 12px #6b728040",
//                   }
//                 : { background: "#f3f4f6", color: "#6b7280" }
//             }
//           >
//             📋 All ({questions.length})
//           </button>
//           {CATS.map((cat) => {
//             const count = questions.filter(
//               (q) => q.category === cat.key,
//             ).length;
//             return (
//               <button
//                 key={cat.key}
//                 onClick={() => setFilterCat(cat.key)}
//                 className="px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap"
//                 style={
//                   filterCat === cat.key
//                     ? {
//                         background: cat.color,
//                         color: "white",
//                         boxShadow: `0 4px 12px ${cat.color}40`,
//                       }
//                     : { background: "#f3f4f6", color: "#6b7280" }
//                 }
//               >
//                 {cat.label}
//                 {count > 0 && ` (${count})`}
//               </button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Articles grid */}
//       {isLoading ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {[...Array(6)].map((_, i) => (
//             <div
//               key={i}
//               className="bg-white rounded-2xl p-5 animate-pulse"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="h-3 bg-gray-100 rounded w-1/3 mb-4" />
//               <div className="h-5 bg-gray-100 rounded w-3/4 mb-3" />
//               <div className="h-3 bg-gray-100 rounded w-full mb-1" />
//               <div className="h-3 bg-gray-100 rounded w-2/3 mb-6" />
//               <div className="h-8 bg-gray-100 rounded-xl" />
//             </div>
//           ))}
//         </div>
//       ) : filtered.length === 0 ? (
//         <div
//           className="bg-white rounded-2xl py-20 flex flex-col items-center gap-4"
//           style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//         >
//           <span className="text-6xl">❓</span>
//           <p className="text-gray-400 text-sm font-medium">
//             {filterCat
//               ? `No "${getCat(filterCat).label}" articles`
//               : "No FAQ articles yet"}
//           </p>
//           {isSuperAdmin && !filterCat && (
//             <button
//               onClick={() => seed.mutate()}
//               disabled={seed.isPending}
//               className="px-6 py-2.5 rounded-xl text-white text-sm font-bold
//                 hover:scale-105 active:scale-95 transition-all"
//               style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//             >
//               🌱 Seed 7 Default Articles
//             </button>
//           )}
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {filtered.map((q) => {
//             const cat = getCat(q.category);
//             const loading = fetchingId === q._id;
//             return (
//               <div
//                 key={q._id}
//                 className="bg-white rounded-2xl p-5 transition-all
//                   hover:shadow-md group flex flex-col"
//                 style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//               >
//                 {/* Top row */}
//                 <div className="flex items-start justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <span
//                       className="px-2.5 py-1 rounded-full text-[10px] font-bold"
//                       style={{ background: cat.color + "15", color: cat.color }}
//                     >
//                       {cat.label}
//                     </span>
//                     <span className="text-gray-300 text-[10px]">
//                       #{q.sortOrder}
//                     </span>
//                   </div>
//                   {/* Actions — visible on hover, superAdmin only */}
//                   {isSuperAdmin && (
//                     <div
//                       className="flex items-center gap-1
//                       opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
//                     >
//                       <button
//                         onClick={() => openEdit(q)}
//                         disabled={loading}
//                         title="Edit"
//                         className="w-6 h-6 rounded-lg flex items-center justify-center
//                           text-xs hover:scale-110 transition-all disabled:opacity-40"
//                         style={{ background: "#f59e0b18", color: "#f59e0b" }}
//                       >
//                         ✏️
//                       </button>
//                       <button
//                         onClick={() =>
//                           window.confirm(`Delete "${q.title}"?`) &&
//                           remove.mutate(q._id)
//                         }
//                         disabled={remove.isPending}
//                         title="Delete"
//                         className="w-6 h-6 rounded-lg flex items-center justify-center
//                           text-xs hover:scale-110 transition-all disabled:opacity-40"
//                         style={{ background: "#ef444418", color: "#ef4444" }}
//                       >
//                         🗑️
//                       </button>
//                     </div>
//                   )}
//                 </div>

//                 {/* Title */}
//                 <p
//                   className="text-gray-800 font-bold text-sm mb-2
//                   leading-snug line-clamp-2 flex-1"
//                 >
//                   {q.title}
//                 </p>

//                 {/* Note: content not in list response */}
//                 <p className="text-gray-400 text-[11px] mb-4 italic">
//                   Click to read full article →
//                 </p>

//                 <button
//                   onClick={() => openView(q)}
//                   disabled={loading}
//                   className="w-full py-2 rounded-xl text-xs font-bold
//                     transition-all hover:scale-105 active:scale-95 disabled:opacity-60"
//                   style={{
//                     background: cat.color + "12",
//                     color: cat.color,
//                     border: `1px solid ${cat.color}25`,
//                   }}
//                 >
//                   {loading ? "⏳ Loading..." : "Read Article →"}
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Create / Edit Modal */}
//       <Modal
//         open={modal === "create" || modal === "edit"}
//         onClose={closeModal}
//         title={modal === "edit" ? "✏️ Edit FAQ Article" : "➕ New FAQ Article"}
//         wide
//       >
//         <div className="space-y-4">
//           <Field label="Title" required>
//             <Input
//               placeholder="e.g. Transportation Rules"
//               value={form.title}
//               onChange={setF("title")}
//             />
//           </Field>

//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Category">
//               <select
//                 value={form.category}
//                 onChange={setF("category")}
//                 className="w-full px-4 py-2.5 rounded-xl border border-gray-200
//                   text-sm text-gray-700 outline-none focus:border-pink-400
//                   bg-gray-50 focus:bg-white transition-all"
//               >
//                 {CATS.map((c) => (
//                   <option key={c.key} value={c.key}>
//                     {c.label}
//                   </option>
//                 ))}
//               </select>
//             </Field>
//             <Field label="Sort Order" hint="Lower = appears first (0 = top)">
//               <Input
//                 type="number"
//                 min="0"
//                 placeholder="0"
//                 value={form.sortOrder}
//                 onChange={setF("sortOrder")}
//               />
//             </Field>
//           </div>

//           <Field
//             label="Content"
//             required
//             hint="Plain text. Merchants see this in their Help screen."
//           >
//             <textarea
//               rows={12}
//               placeholder={`1. How to arrange delivery?\nTikTok Delivery mode, operations center arranges warehouse delivery.\n\n2. How long is the delivery period?\n24 hours after principal payment.`}
//               value={form.content}
//               onChange={setF("content")}
//               className="w-full px-4 py-2.5 rounded-xl border border-gray-200
//                 text-sm text-gray-700 outline-none focus:border-pink-400
//                 bg-gray-50 focus:bg-white transition-all resize-y leading-relaxed"
//             />
//           </Field>

//           <div className="grid grid-cols-2 gap-3 pt-1">
//             <button
//               onClick={closeModal}
//               className="py-3 rounded-xl border border-gray-200 text-gray-500
//                 text-sm hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={submit}
//               disabled={create.isPending || update.isPending}
//               className="py-3 rounded-xl text-white font-bold text-sm
//                 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                 boxShadow: "0 4px 12px rgba(240,45,101,0.3)",
//               }}
//             >
//               {create.isPending || update.isPending
//                 ? "Saving..."
//                 : modal === "edit"
//                   ? "Update Article"
//                   : "Create Article"}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* View Modal */}
//       <Modal
//         open={modal === "view"}
//         onClose={closeModal}
//         title="❓ Help Article"
//         wide
//       >
//         {viewItem &&
//           (() => {
//             const cat = getCat(viewItem.category);
//             return (
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2 flex-wrap">
//                   <span
//                     className="px-3 py-1 rounded-full text-xs font-bold"
//                     style={{ background: cat.color + "15", color: cat.color }}
//                   >
//                     {cat.label}
//                   </span>
//                   <span className="text-gray-400 text-xs">
//                     Sort #{viewItem.sortOrder}
//                   </span>
//                   <span
//                     className="px-2.5 py-1 rounded-full text-[10px] font-bold"
//                     style={
//                       viewItem.isActive
//                         ? { background: "#dcfce7", color: "#16a34a" }
//                         : { background: "#f3f4f6", color: "#9ca3af" }
//                     }
//                   >
//                     {viewItem.isActive ? "● Active" : "○ Inactive"}
//                   </span>
//                 </div>

//                 <h2 className="text-gray-800 text-base font-extrabold">
//                   {viewItem.title}
//                 </h2>

//                 {/* Full content — whitespace-pre-wrap keeps line breaks */}
//                 <div
//                   className="rounded-xl p-4 text-sm text-gray-700
//                   leading-relaxed whitespace-pre-wrap overflow-y-auto"
//                   style={{
//                     background: "#f8fafc",
//                     border: "1px solid #e2e8f0",
//                     maxHeight: "55vh",
//                   }}
//                 >
//                   {viewItem.content}
//                 </div>

//                 <div className="flex gap-3 pt-1">
//                   {isSuperAdmin && (
//                     <button
//                       onClick={() => {
//                         closeModal();
//                         setTimeout(() => openEdit(viewItem), 80);
//                       }}
//                       className="flex-1 py-2.5 rounded-xl border border-gray-200
//                       text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
//                     >
//                       ✏️ Edit
//                     </button>
//                   )}
//                   <button
//                     onClick={closeModal}
//                     className="flex-1 py-2.5 rounded-xl text-white text-sm
//                     font-bold transition-all active:scale-95"
//                     style={{
//                       background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                     }}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             );
//           })()}
//       </Modal>
//     </div>
//   );
// }

///////////////////// ====================== latest version (by gemeni) =======================///////////////////////

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
} from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-bold transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5 shadow-sm"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label && <span>{label}</span>}
  </button>
);

const FormInput = ({ label, type = "text", ...props }) => (
  <div className="flex items-center gap-4 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0">
      {label}
    </label>
    <input
      style={{ padding: "6px 10px" }}
      type={type}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex items-center gap-4 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0">
      {label}
    </label>
    <select
      style={{ padding: "6px 10px" }}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
      {...props}
    >
      {children}
    </select>
  </div>
);

// ── Premium Modal Component ───────────────────────────────────
const Modal = ({ open, onClose, title, children, width = "max-w-2xl" }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-sm w-full ${width} flex flex-col shadow-2xl overflow-hidden transform transition-all`}
      >
        <div
          style={{ padding: "12px 20px" }}
          className="flex items-center justify-between bg-slate-800 text-white"
        >
          <h3 className="font-bold text-[14px]">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        <div
          style={{ padding: "20px" }}
          className="overflow-y-auto max-h-[85vh] custom-scrollbar bg-gray-50/30"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Status Configuration ──────────────────────────────────────
const STATUS_MAP = {
  pending: {
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Pending Review",
    icon: Clock,
  },
  processing: {
    color: "text-blue-500",
    bg: "bg-blue-50",
    label: "Processing",
    icon: RefreshCcw,
  },
  resolved: {
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Resolved",
    icon: CheckCircle,
  },
  rejected: {
    color: "text-red-500",
    bg: "bg-red-50",
    label: "Rejected",
    icon: XCircle,
  },
};

// ── Main component ────────────────────────────────────────────
export default function Complaints() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [statusInput, setStatusInput] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  // Resolution form state
  const [resolutionText, setResolutionText] = useState("");
  const [resolutionStatus, setResolutionStatus] = useState("resolved");

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["complaints", page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (activeFilters.status) p.set("status", activeFilters.status);
      const { data } = await API.get(`/complaints?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const complaints = data?.complaints || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["complaints"]);

  // ── Mutations ──────────────────────────────────────────────
  const resolveComplaint = useMutation({
    mutationFn: ({ id, body }) => API.put(`/complaints/${id}/resolve`, body),
    onSuccess: () => {
      invalidate();
      toast.success("Complaint resolved and updated.");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to update complaint"),
  });

  const handleSearch = () => {
    setActiveFilters({ status: statusInput });
    setPage(1);
  };

  const handleReset = () => {
    setStatusInput("");
    setActiveFilters({});
    setPage(1);
  };

  const openView = (comp) => {
    setSelected(comp);
    setResolutionText(comp.resolution || "");
    setResolutionStatus(
      comp.status === "pending" || comp.status === "processing"
        ? "resolved"
        : comp.status,
    );
    setModal(true);
  };

  const closeModal = () => {
    setModal(false);
    setSelected(null);
    setResolutionText("");
  };

  const handleResolveSubmit = () => {
    if (!resolutionText.trim() && resolutionStatus !== "rejected") {
      return toast.error("Please provide resolution details.");
    }
    resolveComplaint.mutate({
      id: selected._id,
      body: { status: resolutionStatus, resolution: resolutionText },
    });
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
      <div className="my-4">
        <h1 className="text-xl font-bold text-gray-800">Merchant Complaints</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} tickets · Review and resolve issues submitted
          by merchants regarding orders.
        </p>
      </div>

      {/* ── Visual Filter Grid ── */}
      <div
        style={{ padding: "5px", marginTop: "10px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-4 w-full shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormSelect
            label="Ticket Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="processing">Processing</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </FormSelect>
        </div>
        <div
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          className="flex justify-end gap-3 pt-2"
        >
          <button
            style={{ padding: "5px 20px" }}
            onClick={handleSearch}
            className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-bold rounded-sm transition-colors shadow-sm"
          >
            Search
          </button>
          <button
            style={{ padding: "5px 20px" }}
            onClick={handleReset}
            className="bg-white border border-gray-200 text-gray-700 text-[13px] font-bold rounded-sm hover:bg-gray-50 transition-colors shadow-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── TOP ACTION BAR ── */}
      <div
        style={{ padding: "10px" }}
        className="bg-white border border-gray-100 rounded-sm mb-4 w-full flex gap-2 shadow-sm"
      >
        <button
          onClick={invalidate}
          style={{ padding: "6px 12px" }}
          className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center justify-center shadow-sm"
          title="Refresh Table"
        >
          <RefreshCcw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />{" "}
          <span className="ml-2 text-[12px] font-bold">Refresh</span>
        </button>
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-sm flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-800 text-[12px] font-bold bg-gray-50/50">
                <th style={{ padding: "12px 15px" }}>Complaint ID</th>
                <th style={{ padding: "12px 15px" }}>Merchant</th>
                <th style={{ padding: "12px 15px" }}>Order SN (Reference)</th>
                <th style={{ padding: "12px 15px" }}>Complaint Preview</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Status
                </th>
                <th style={{ padding: "12px 15px" }}>Submission Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[13px]">
                        Loading complaints...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No complaints found.
                  </td>
                </tr>
              ) : (
                complaints.map((c) => {
                  const statusInfo = STATUS_MAP[c.status] || STATUS_MAP.pending;
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={c._id}
                      className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors"
                    >
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600 font-mono"
                      >
                        CMP-{c._id.slice(-5).toUpperCase()}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-800 font-bold"
                      >
                        {c.merchant?.storeName || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-blue-600 font-mono font-medium"
                      >
                        {c.orderSn}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600 max-w-[250px] truncate"
                        title={c.content}
                      >
                        {c.content}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-sm text-[11px] font-bold ${statusInfo.bg} ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />{" "}
                          {statusInfo.label}
                        </span>
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {new Date(c.createdAt).toLocaleString("en-CA")}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center">
                          <ActionBtn
                            color={
                              c.status === "pending" ? "#f59e0b" : "#334155"
                            }
                            label={
                              c.status === "pending" ||
                              c.status === "processing"
                                ? "Review"
                                : "Details"
                            }
                            icon={Eye}
                            onClick={() => openView(c)}
                          />
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

      {/* ════════════ REVIEW / RESOLVE MODAL ════════════ */}
      <Modal
        open={modal}
        onClose={closeModal}
        title={`Ticket: CMP-${selected?._id?.slice(-5).toUpperCase()}`}
      >
        {selected && (
          <div className="flex flex-col gap-4">
            {/* COMPLAINT DETAILS */}
            <div className="bg-gray-50 border border-gray-200 rounded-sm p-4">
              <div className="flex justify-between items-start mb-3 border-b border-gray-200 pb-3">
                <div>
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    Merchant
                  </p>
                  <p className="text-[14px] text-gray-900 font-bold">
                    {selected.merchant?.storeName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                    Order Reference
                  </p>
                  <p className="text-[14px] text-blue-600 font-mono font-bold">
                    {selected.orderSn}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                Complaint Content
              </p>
              <div className="bg-white border border-gray-200 rounded-sm p-3 text-[13px] text-gray-800 whitespace-pre-wrap leading-relaxed shadow-sm">
                {selected.content}
              </div>

              {/* Images Attached */}
              {selected.images && selected.images.length > 0 && (
                <div className="mt-4">
                  <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-2">
                    Attached Evidences
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {selected.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-20 h-20 bg-gray-200 rounded-sm border border-gray-300 flex-shrink-0 overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={img}
                          alt={`evidence-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RESOLUTION SECTION */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-[14px] font-bold text-gray-800 mb-3">
                Resolution Action
              </h4>

              <FormSelect
                label="Change Status"
                value={resolutionStatus}
                onChange={(e) => setResolutionStatus(e.target.value)}
                disabled={selected.status === "resolved"}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="resolved">Resolved / Fixed</option>
                <option value="rejected">Rejected / Invalid</option>
              </FormSelect>

              <div className="flex items-start gap-4 mb-4">
                <label className="text-gray-600 text-[13px] font-bold w-32 text-right flex-shrink-0 pt-2">
                  Admin Reply: <br />
                  <span className="text-[10px] text-gray-400 font-normal">
                    (Sent to merchant)
                  </span>
                </label>
                <textarea
                  style={{ padding: "10px" }}
                  rows={4}
                  placeholder="Type your official resolution response here..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  disabled={selected.status === "resolved" && !isSuperAdmin}
                  className="flex-1 rounded-sm border border-gray-300 text-[13px] text-gray-800 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all resize-none shadow-sm disabled:bg-gray-50"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  style={{ padding: "8px 24px" }}
                  onClick={closeModal}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm text-[13px] font-bold transition-colors shadow-sm"
                >
                  Close
                </button>
                {selected.status !== "resolved" && (
                  <button
                    style={{ padding: "8px 30px" }}
                    onClick={handleResolveSubmit}
                    disabled={resolveComplaint.isPending}
                    className="bg-teal-500 hover:bg-teal-600 text-white rounded-sm font-bold text-[13px] transition-colors shadow-sm disabled:opacity-50"
                  >
                    {resolveComplaint.isPending
                      ? "Saving..."
                      : "Submit Resolution"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

////////////////////// ==================== latest version (by claud io) ================= //////////////////////
