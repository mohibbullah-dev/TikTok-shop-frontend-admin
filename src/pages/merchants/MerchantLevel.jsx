// frontend-admin/src/pages/merchants/MerchantLevel.jsx
//
// VERIFIED BACKEND ENDPOINTS:
// GET  /api/vip/levels                  → returns active levels (status:1), public
// POST /api/vip/levels                  → create level, body:{levelId,name,nameEn,level,price,rate,requiredVisits,icon}
// PUT  /api/vip/levels/:id              → update level, body: any fields
// PUT  /api/vip/levels/:id/toggle       → toggles status 1↔0
// POST /api/vip/seed                    → seeds 7 default levels
//
// VipLevel MODEL FIELDS (exact):
//   levelId(Number), name(String), nameEn(String), level(Number)
//   icon(String), price(Number), rate(Number 0-1), requiredVisits(Number)
//   status(Number: 1=active, 0=inactive)
//
// DEFAULT DATA (from seed):
//   VIP0 Basic    level:0 price:$0      rate:15% visits:0
//   VIP1 Bronze   level:1 price:$1000   rate:20% visits:1,000
//   VIP2 Silver   level:2 price:$2000   rate:25% visits:10,000
//   VIP3 Gold     level:3 price:$4000   rate:27% visits:50,000
//   VIP4 Platinum level:4 price:$8000   rate:33% visits:100,000
//   VIP5 Diamond  level:5 price:$16000  rate:38% visits:200,000
//   VIP6 Crown    level:6 price:$32000  rate:43% visits:500,000

// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── VIP tier visual config ──────────────────────────────────
// const TIER_CONFIG = {
//   0: { emoji: "🥉", color: "#78716c", bg: "#f5f5f4", label: "Basic" },
//   1: { emoji: "🥉", color: "#b45309", bg: "#fef3c7", label: "Bronze" },
//   2: { emoji: "🥈", color: "#6b7280", bg: "#f3f4f6", label: "Silver" },
//   3: { emoji: "🥇", color: "#d97706", bg: "#fffbeb", label: "Gold" },
//   4: { emoji: "💎", color: "#0ea5e9", bg: "#f0f9ff", label: "Platinum" },
//   5: { emoji: "💠", color: "#7c3aed", bg: "#f5f3ff", label: "Diamond" },
//   6: { emoji: "👑", color: "#f02d65", bg: "#fdf2f8", label: "Crown" },
// };

// // ─── Shared atoms ────────────────────────────────────────────
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
//             className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 transition-all"
//           >
//             ✕
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//       </div>
//     </div>
//   );
// };

// const Field = ({ label, children }) => (
//   <div>
//     <label className="block text-gray-500 text-xs font-semibold mb-1.5">
//       {label}
//     </label>
//     {children}
//   </div>
// );

// const Input = ({ ...props }) => (
//   <input
//     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
//       text-gray-700 outline-none focus:border-pink-400 bg-gray-50
//       focus:bg-white transition-all"
//     {...props}
//   />
// );

// // Empty form state
// const EMPTY_FORM = {
//   levelId: "",
//   name: "",
//   nameEn: "",
//   level: "",
//   price: "",
//   rate: "",
//   requiredVisits: "",
//   icon: "",
// };

// export default function MerchantLevel() {
//   const queryClient = useQueryClient();

//   const [modal, setModal] = useState(null); // 'create' | 'edit'
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [editId, setEditId] = useState(null);

//   // ── Fetch all VIP levels ───────────────────────────────────
//   // NOTE: GET /api/vip/levels only returns status:1 (active) levels
//   // For admin we need to see ALL — so we fetch both active and
//   // inactive by not filtering; but the backend only exposes active ones.
//   // We show whatever the backend returns and use toggle to manage active state.
//   const { data: levels = [], isLoading } = useQuery({
//     queryKey: ["vipLevels"],
//     queryFn: async () => {
//       const { data } = await API.get("/vip/levels");
//       return data;
//     },
//   });

//   const invalidate = () => queryClient.invalidateQueries(["vipLevels"]);

//   // ── Seed defaults: POST /api/vip/seed ─────────────────────
//   const seed = useMutation({
//     mutationFn: () => API.post("/vip/seed"),
//     onSuccess: () => {
//       invalidate();
//       toast.success("7 default VIP levels seeded! ✅");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Seed failed"),
//   });

//   // ── Create: POST /api/vip/levels ──────────────────────────
//   const create = useMutation({
//     mutationFn: (body) => API.post("/vip/levels", body),
//     onSuccess: () => {
//       invalidate();
//       toast.success("VIP level created!");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Update: PUT /api/vip/levels/:id ───────────────────────
//   const update = useMutation({
//     mutationFn: ({ id, body }) => API.put(`/vip/levels/${id}`, body),
//     onSuccess: () => {
//       invalidate();
//       toast.success("VIP level updated!");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Toggle: PUT /api/vip/levels/:id/toggle ────────────────
//   // Flips status between 1 (active) and 0 (inactive)
//   const toggle = useMutation({
//     mutationFn: (id) => API.put(`/vip/levels/${id}/toggle`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Status toggled");
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Modal helpers ──────────────────────────────────────────
//   const openCreate = () => {
//     setForm(EMPTY_FORM);
//     setEditId(null);
//     setModal("create");
//   };

//   const openEdit = (lvl) => {
//     setForm({
//       levelId: String(lvl.levelId),
//       name: lvl.name,
//       nameEn: lvl.nameEn,
//       level: String(lvl.level),
//       price: String(lvl.price),
//       rate: String((lvl.rate * 100).toFixed(0)), // store as % in form
//       requiredVisits: String(lvl.requiredVisits || 0),
//       icon: lvl.icon || "",
//     });
//     setEditId(lvl._id);
//     setModal("edit");
//   };

//   const closeModal = () => {
//     setModal(null);
//     setEditId(null);
//     setForm(EMPTY_FORM);
//   };

//   const setField = (key) => (e) =>
//     setForm((f) => ({ ...f, [key]: e.target.value }));

//   const handleSubmit = () => {
//     // Validate required fields
//     if (
//       !form.levelId ||
//       !form.name ||
//       !form.nameEn ||
//       form.level === "" ||
//       !form.price ||
//       !form.rate
//     ) {
//       return toast.error("Please fill all required fields");
//     }
//     const body = {
//       levelId: Number(form.levelId),
//       name: form.name.trim(),
//       nameEn: form.nameEn.trim(),
//       level: Number(form.level),
//       price: Number(form.price),
//       rate: Number(form.rate) / 100, // convert % → decimal for backend
//       requiredVisits: Number(form.requiredVisits || 0),
//       icon: form.icon.trim(),
//     };
//     if (modal === "edit" && editId) update.mutate({ id: editId, body });
//     else create.mutate(body);
//   };

//   const isSaving = create.isPending || update.isPending;

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             VIP Level Management
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {levels.length} levels configured · VIP0–VIP6 tier system
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           {/* Seed defaults */}
//           <button
//             onClick={() => {
//               if (
//                 window.confirm(
//                   "Seed 7 default VIP levels? This will DELETE all existing levels.",
//                 )
//               ) {
//                 seed.mutate();
//               }
//             }}
//             disabled={seed.isPending}
//             className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-500
//               hover:bg-gray-50 text-sm font-semibold transition-all disabled:opacity-50"
//           >
//             {seed.isPending ? "⏳ Seeding..." : "🌱 Seed Defaults"}
//           </button>
//           {/* Create new */}
//           <button
//             onClick={openCreate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//               text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
//             style={{
//               background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               boxShadow: "0 4px 12px rgba(240,45,101,0.35)",
//             }}
//           >
//             <span className="text-base leading-none">+</span>
//             New Level
//           </button>
//         </div>
//       </div>

//       {/* ── Loading ── */}
//       {isLoading && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {[...Array(7)].map((_, i) => (
//             <div
//               key={i}
//               className="bg-white rounded-2xl p-5 animate-pulse"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
//               <div className="h-8 bg-gray-100 rounded w-3/4 mb-2" />
//               <div className="h-3 bg-gray-100 rounded w-full mb-1" />
//               <div className="h-3 bg-gray-100 rounded w-2/3" />
//             </div>
//           ))}
//         </div>
//       )}

//       {/* ── Empty state ── */}
//       {!isLoading && levels.length === 0 && (
//         <div
//           className="bg-white rounded-2xl py-20 flex flex-col items-center gap-4"
//           style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//         >
//           <span className="text-6xl">👑</span>
//           <p className="text-gray-400 text-sm font-medium">
//             No VIP levels configured
//           </p>
//           <p className="text-gray-300 text-xs">
//             Click "Seed Defaults" to add all 7 levels at once
//           </p>
//           <button
//             onClick={() => seed.mutate()}
//             disabled={seed.isPending}
//             className="px-6 py-2.5 rounded-xl text-white text-sm font-bold
//               transition-all hover:scale-105 active:scale-95"
//             style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//           >
//             🌱 Seed 7 Default Levels
//           </button>
//         </div>
//       )}

//       {/* ── Level Cards Grid ── */}
//       {!isLoading && levels.length > 0 && (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//           {levels.map((lvl) => {
//             const tier = TIER_CONFIG[lvl.level] || TIER_CONFIG[0];
//             const active = lvl.status === 1;

//             return (
//               <div
//                 key={lvl._id}
//                 className="bg-white rounded-2xl p-5 transition-all hover:shadow-md"
//                 style={{
//                   boxShadow: "0 1px 12px rgba(0,0,0,0.07)",
//                   opacity: active ? 1 : 0.6,
//                 }}
//               >
//                 {/* Top row: badge + toggle */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div
//                     className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
//                     style={{ background: tier.bg }}
//                   >
//                     <span className="text-lg">{tier.emoji}</span>
//                     <div>
//                       <p
//                         className="font-extrabold text-sm leading-none"
//                         style={{ color: tier.color }}
//                       >
//                         {lvl.name}
//                       </p>
//                       <p
//                         className="text-[10px] mt-0.5"
//                         style={{ color: tier.color + "aa" }}
//                       >
//                         {lvl.nameEn}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Active/inactive toggle pill */}
//                   <button
//                     onClick={() => toggle.mutate(lvl._id)}
//                     disabled={toggle.isPending}
//                     className="relative w-11 h-6 rounded-full transition-all
//                       disabled:opacity-50 flex-shrink-0"
//                     style={{ background: active ? tier.color : "#d1d5db" }}
//                     title={active ? "Click to deactivate" : "Click to activate"}
//                   >
//                     <div
//                       className="absolute top-0.5 w-5 h-5 bg-white rounded-full
//                         shadow transition-all"
//                       style={{ left: active ? "22px" : "2px" }}
//                     />
//                   </button>
//                 </div>

//                 {/* Profit rate — the most important field */}
//                 <div className="mb-4">
//                   <p className="text-gray-400 text-[10px] uppercase tracking-wide">
//                     Profit Rate
//                   </p>
//                   <p
//                     className="text-3xl font-extrabold mt-0.5"
//                     style={{ color: tier.color }}
//                   >
//                     {(lvl.rate * 100).toFixed(0)}%
//                   </p>
//                 </div>

//                 {/* Stats grid */}
//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                   <div
//                     className="rounded-xl p-2.5"
//                     style={{ background: tier.bg }}
//                   >
//                     <p className="text-[9px] text-gray-400 uppercase tracking-wide">
//                       Capital Required
//                     </p>
//                     <p
//                       className="text-sm font-bold mt-0.5"
//                       style={{ color: tier.color }}
//                     >
//                       {lvl.price === 0
//                         ? "Free"
//                         : `$${lvl.price.toLocaleString()}`}
//                     </p>
//                   </div>
//                   <div
//                     className="rounded-xl p-2.5"
//                     style={{ background: tier.bg }}
//                   >
//                     <p className="text-[9px] text-gray-400 uppercase tracking-wide">
//                       Req. Visits
//                     </p>
//                     <p
//                       className="text-sm font-bold mt-0.5"
//                       style={{ color: tier.color }}
//                     >
//                       {(lvl.requiredVisits || 0).toLocaleString()}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Status badge */}
//                 <div className="flex items-center justify-between mb-4">
//                   <span
//                     className="text-[10px] font-bold px-2.5 py-1 rounded-full"
//                     style={
//                       active
//                         ? { background: "#dcfce7", color: "#16a34a" }
//                         : { background: "#f3f4f6", color: "#9ca3af" }
//                     }
//                   >
//                     {active ? "● Active" : "○ Inactive"}
//                   </span>
//                   <span className="text-[10px] text-gray-400">
//                     Level {lvl.level}
//                   </span>
//                 </div>

//                 {/* Edit button */}
//                 <button
//                   onClick={() => openEdit(lvl)}
//                   className="w-full py-2 rounded-xl text-xs font-bold transition-all
//                     hover:scale-105 active:scale-95"
//                   style={{
//                     background: tier.bg,
//                     color: tier.color,
//                     border: `1.5px solid ${tier.color}30`,
//                   }}
//                 >
//                   ✏️ Edit Level
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ══ Create / Edit Modal ═══════════════════════════════ */}
//       <Modal
//         open={modal === "create" || modal === "edit"}
//         onClose={closeModal}
//         title={modal === "edit" ? "✏️ Edit VIP Level" : "➕ Create VIP Level"}
//       >
//         <div className="space-y-4">
//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Level ID *">
//               <Input
//                 type="number"
//                 min="0"
//                 max="6"
//                 placeholder="0–6"
//                 value={form.levelId}
//                 onChange={setField("levelId")}
//                 disabled={modal === "edit"}
//               />
//             </Field>
//             <Field label="Level Number *">
//               <Input
//                 type="number"
//                 min="0"
//                 max="6"
//                 placeholder="0–6"
//                 value={form.level}
//                 onChange={setField("level")}
//                 disabled={modal === "edit"}
//               />
//             </Field>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Name (e.g. VIP1) *">
//               <Input
//                 placeholder="VIP1"
//                 value={form.name}
//                 onChange={setField("name")}
//               />
//             </Field>
//             <Field label="Name EN (e.g. Bronze) *">
//               <Input
//                 placeholder="Bronze"
//                 value={form.nameEn}
//                 onChange={setField("nameEn")}
//               />
//             </Field>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <Field label="Capital Required ($) *">
//               <Input
//                 type="number"
//                 min="0"
//                 placeholder="1000"
//                 value={form.price}
//                 onChange={setField("price")}
//               />
//             </Field>
//             <Field label="Profit Rate (%) *">
//               <Input
//                 type="number"
//                 min="0"
//                 max="100"
//                 step="1"
//                 placeholder="20"
//                 value={form.rate}
//                 onChange={setField("rate")}
//               />
//             </Field>
//           </div>

//           <Field label="Required Visits">
//             <Input
//               type="number"
//               min="0"
//               placeholder="1000"
//               value={form.requiredVisits}
//               onChange={setField("requiredVisits")}
//             />
//           </Field>

//           <Field label="Icon URL (optional)">
//             <Input
//               placeholder="https://..."
//               value={form.icon}
//               onChange={setField("icon")}
//             />
//           </Field>

//           {/* Rate preview */}
//           {form.rate && (
//             <div
//               className="p-3 rounded-xl text-center"
//               style={{ background: "#fdf2f8", border: "1px solid #fbcfe8" }}
//             >
//               <p className="text-gray-400 text-xs">
//                 Merchants at this level earn
//               </p>
//               <p
//                 className="text-2xl font-extrabold mt-0.5"
//                 style={{ color: "#f02d65" }}
//               >
//                 {form.rate}% profit
//               </p>
//               <p className="text-gray-400 text-xs mt-0.5">
//                 on every order's selling price
//               </p>
//             </div>
//           )}

//           <div className="grid grid-cols-2 gap-3 pt-1">
//             <button
//               onClick={closeModal}
//               className="py-3 rounded-xl border border-gray-200 text-gray-500
//                 text-sm hover:bg-gray-50 transition-all"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               disabled={isSaving}
//               className="py-3 rounded-xl text-white font-bold text-sm
//                 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                 boxShadow: "0 4px 12px rgba(240,45,101,0.3)",
//               }}
//             >
//               {isSaving
//                 ? "Saving..."
//                 : modal === "edit"
//                   ? "Update Level"
//                   : "Create Level"}
//             </button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

////////////////////////////////// ============================ latest version (by gemeni) ========================/////////////////////////////

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import { RefreshCcw, Loader2, Edit, Plus, Database } from "lucide-react";

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

const Modal = ({ open, onClose, title, children, width = "max-w-md" }) => {
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
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
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

const EMPTY_FORM = {
  levelId: "",
  name: "",
  nameEn: "",
  level: "",
  price: "",
  rate: "",
  requiredVisits: "",
  icon: "",
};

// ── Main component ────────────────────────────────────────────
export default function MerchantLevel() {
  const queryClient = useQueryClient();
  const [modal, setModal] = useState(null); // 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  const {
    data: levels = [],
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["vipLevels"],
    queryFn: async () => {
      const { data } = await API.get("/vip/levels");
      return data;
    },
  });

  const invalidate = () => queryClient.invalidateQueries(["vipLevels"]);

  const seed = useMutation({
    mutationFn: () => API.post("/vip/seed"),
    onSuccess: () => {
      invalidate();
      toast.success("7 default VIP levels seeded! ✅");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Seed failed"),
  });

  const create = useMutation({
    mutationFn: (body) => API.post("/vip/levels", body),
    onSuccess: () => {
      invalidate();
      toast.success("VIP level created!");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const update = useMutation({
    mutationFn: ({ id, body }) => API.put(`/vip/levels/${id}`, body),
    onSuccess: () => {
      invalidate();
      toast.success("VIP level updated!");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const toggle = useMutation({
    mutationFn: (id) => API.put(`/vip/levels/${id}/toggle`),
    onSuccess: () => {
      invalidate();
      toast.success("Status toggled");
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditId(null);
    setModal("create");
  };
  const openEdit = (lvl) => {
    setForm({
      levelId: String(lvl.levelId),
      name: lvl.name,
      nameEn: lvl.nameEn,
      level: String(lvl.level),
      price: String(lvl.price),
      rate: String((lvl.rate * 100).toFixed(0)),
      requiredVisits: String(lvl.requiredVisits || 0),
      icon: lvl.icon || "",
    });
    setEditId(lvl._id);
    setModal("edit");
  };
  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    if (
      !form.levelId ||
      !form.name ||
      !form.nameEn ||
      form.level === "" ||
      !form.price ||
      !form.rate
    ) {
      return toast.error("Please fill all required fields");
    }
    const body = {
      levelId: Number(form.levelId),
      name: form.name.trim(),
      nameEn: form.nameEn.trim(),
      level: Number(form.level),
      price: Number(form.price),
      rate: Number(form.rate) / 100,
      requiredVisits: Number(form.requiredVisits || 0),
      icon: form.icon.trim(),
    };
    if (modal === "edit" && editId) update.mutate({ id: editId, body });
    else create.mutate(body);
  };

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            VIP Level Management
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Configure pricing and profit rates for VIP tiers.
          </p>
        </div>
        <div className="flex gap-2">
          <ActionBtn
            color="#f59e0b"
            label="Seed Defaults"
            icon={Database}
            onClick={() =>
              window.confirm("Reset all levels to defaults?") && seed.mutate()
            }
            disabled={seed.isPending}
          />
          <ActionBtn
            color="#10b981"
            label="New Level"
            icon={Plus}
            onClick={openCreate}
          />
        </div>
      </div>

      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div
          style={{ padding: "10px" }}
          className="border-b border-gray-100 bg-gray-50/50 flex justify-between gap-3 items-center"
        >
          <h2 className="text-[14px] font-bold text-gray-800">
            System VIP Levels
          </h2>
          <button
            style={{ padding: "8px" }}
            onClick={invalidate}
            className="rounded-sm bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center justify-center shadow-sm"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-white">
                <th style={{ padding: "12px 15px" }}>Level No.</th>
                <th style={{ padding: "12px 15px" }}>Internal Name</th>
                <th style={{ padding: "12px 15px" }}>Display Name (EN)</th>
                <th style={{ padding: "12px 15px" }}>Upgrade Cost ($)</th>
                <th style={{ padding: "12px 15px" }}>Profit Rate (%)</th>
                <th style={{ padding: "12px 15px" }}>Req. Visits</th>
                <th style={{ padding: "12px 15px" }}>Status</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[13px]">
                        {" "}
                        Loading levels...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : levels.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No VIP levels configured.
                  </td>
                </tr>
              ) : (
                levels.map((lvl) => (
                  <tr
                    key={lvl._id}
                    className="border-b border-gray-50 hover:bg-slate-50 transition-colors"
                  >
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] font-bold text-teal-600"
                    >
                      VIP {lvl.level}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] font-semibold text-gray-800"
                    >
                      {lvl.name}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600"
                    >
                      {lvl.nameEn}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] font-bold text-gray-800"
                    >
                      ${lvl.price.toLocaleString()}
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] font-bold text-red-500"
                    >
                      {(lvl.rate * 100).toFixed(0)}%
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-[13px] text-gray-600"
                    >
                      {lvl.requiredVisits?.toLocaleString() || 0}
                    </td>
                    <td style={{ padding: "12px 15px" }}>
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${lvl.status === 1 ? "bg-emerald-500" : "bg-gray-400"}`}
                        ></span>
                        <span
                          className={`text-[12px] font-bold ${lvl.status === 1 ? "text-emerald-600" : "text-gray-500"}`}
                        >
                          {lvl.status === 1 ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{ padding: "12px 15px" }}
                      className="text-center"
                    >
                      <div className="flex items-center justify-center gap-2 w-max mx-auto">
                        <ActionBtn
                          color={lvl.status === 1 ? "#ef4444" : "#10b981"}
                          label={lvl.status === 1 ? "Deactivate" : "Activate"}
                          onClick={() => toggle.mutate(lvl._id)}
                          disabled={toggle.isPending}
                        />
                        <ActionBtn
                          color="#3b82f6"
                          label="Edit"
                          icon={Edit}
                          onClick={() => openEdit(lvl)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal
        open={modal}
        onClose={closeModal}
        title={modal === "edit" ? "Edit VIP Level" : "Create VIP Level"}
      >
        <div className="grid grid-cols-2 gap-3">
          <FormInput
            label="Level ID *"
            type="number"
            value={form.levelId}
            onChange={(e) => setForm({ ...form, levelId: e.target.value })}
            disabled={modal === "edit"}
          />
          <FormInput
            label="Level No. (0-6) *"
            type="number"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            disabled={modal === "edit"}
          />
          <FormInput
            label="Internal Name (VIP1) *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <FormInput
            label="Display Name (Bronze) *"
            value={form.nameEn}
            onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
          />
          <FormInput
            label="Capital Required ($) *"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <FormInput
            label="Profit Rate (%) *"
            type="number"
            value={form.rate}
            onChange={(e) => setForm({ ...form, rate: e.target.value })}
          />
        </div>
        <FormInput
          label="Required Visits"
          type="number"
          value={form.requiredVisits}
          onChange={(e) => setForm({ ...form, requiredVisits: e.target.value })}
        />

        <div
          style={{ paddingTop: "15px" }}
          className="flex justify-end gap-3 mt-2 border-t border-gray-100"
        >
          <button
            style={{ padding: "8px 16px" }}
            onClick={closeModal}
            className="bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-sm hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            style={{ padding: "8px 16px" }}
            onClick={handleSubmit}
            disabled={create.isPending || update.isPending}
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md"
          >
            {modal === "edit" ? "Save Changes" : "Create Level"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
