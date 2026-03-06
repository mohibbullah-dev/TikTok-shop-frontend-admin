// frontend-admin/src/pages/merchants/TrafficTask.jsx
//
// VERIFIED BACKEND ENDPOINTS (superAdmin only for all):
// POST /api/traffic-tasks
//   body: { merchantId, startExecutionTime, executionDuration, traffic, taskInformation }
//   executionDuration is in MINUTES (default 43200 = 30 days)
//
// GET  /api/traffic-tasks?status=&merchantId=&page=&limit=
//   → { tasks, total, pages }
//   → tasks[].merchant populated: { storeName, merchantId }
//
// PUT  /api/traffic-tasks/:id/progress
//   body: { completedTraffic }
//   → auto-completes if completedTraffic >= task.traffic
//
// PUT  /api/traffic-tasks/:id/end
//   → sets status to 'ended'
//
// TrafficTask MODEL (exact fields):
//   merchant: { storeName, merchantId }       ← populated
//   assignedBy: User ObjectId
//   startExecutionTime: Date
//   executionDuration: Number (minutes, default 43200)
//   traffic: Number          ← target
//   completedTraffic: Number ← progress so far
//   status: 'inProgress' | 'executionCompleted' | 'ended'
//   taskInformation: String
//   createdAt, updatedAt

// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// // ─── Status config ─────────────────────────────────────────
// const STATUS_MAP = {
//   inProgress: { color: "#3b82f6", label: "In Progress", icon: "🔄" },
//   executionCompleted: { color: "#22c55e", label: "Completed", icon: "✅" },
//   ended: { color: "#6b7280", label: "Ended", icon: "⏹️" },
// };

// const TABS = [
//   { key: "all", label: "All" },
//   { key: "inProgress", label: "In Progress" },
//   { key: "executionCompleted", label: "Completed" },
//   { key: "ended", label: "Ended" },
// ];

// // ─── Atoms ─────────────────────────────────────────────────
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
//         className="relative bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
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

// const Field = ({ label, required, hint, children }) => (
//   <div>
//     <label className="block text-gray-500 text-xs font-semibold mb-1.5">
//       {label}
//       {required && <span className="text-red-400 ml-0.5">*</span>}
//     </label>
//     {children}
//     {hint && <p className="text-gray-400 text-[10px] mt-1">{hint}</p>}
//   </div>
// );

// const Input = (props) => (
//   <input
//     className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
//       text-gray-700 outline-none focus:border-pink-400 bg-gray-50
//       focus:bg-white transition-all"
//     {...props}
//   />
// );

// // Progress bar component
// const ProgressBar = ({ completed, total, color }) => {
//   const pct = total > 0 ? Math.min(100, (completed / total) * 100) : 0;
//   return (
//     <div className="w-full">
//       <div className="flex items-center justify-between mb-1">
//         <span className="text-[10px] text-gray-400">
//           {completed.toLocaleString()} / {total.toLocaleString()}
//         </span>
//         <span className="text-[10px] font-bold" style={{ color }}>
//           {pct.toFixed(0)}%
//         </span>
//       </div>
//       <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
//         <div
//           className="h-full rounded-full transition-all duration-500"
//           style={{ width: `${pct}%`, background: color }}
//         />
//       </div>
//     </div>
//   );
// };

// // Format minutes → human readable
// const fmtDuration = (mins) => {
//   if (mins >= 1440) {
//     const days = Math.round(mins / 1440);
//     return `${days} day${days !== 1 ? "s" : ""}`;
//   }
//   if (mins >= 60) {
//     const hrs = Math.round(mins / 60);
//     return `${hrs} hour${hrs !== 1 ? "s" : ""}`;
//   }
//   return `${mins} min`;
// };

// const EMPTY_FORM = {
//   merchantId: "",
//   startExecutionTime: "",
//   executionDuration: "43200",
//   traffic: "",
//   taskInformation: "",
// };

// export default function TrafficTask() {
//   const queryClient = useQueryClient();

//   const [tab, setTab] = useState("all");
//   const [page, setPage] = useState(1);
//   const [searchMId, setSearchMId] = useState("");
//   const [modal, setModal] = useState(null); // 'create' | 'progress' | 'detail'
//   const [form, setForm] = useState(EMPTY_FORM);
//   const [selected, setSelected] = useState(null);
//   const [newProgress, setNewProgress] = useState("");
//   const limit = 10;

//   useEffect(() => setPage(1), [tab, searchMId]);

//   // ── Fetch: GET /api/traffic-tasks?status=&merchantId=&page=&limit= ──
//   const { data, isLoading, isFetching } = useQuery({
//     queryKey: ["trafficTasks", tab, page, searchMId],
//     queryFn: async () => {
//       const params = new URLSearchParams({ page, limit });
//       if (tab !== "all") params.set("status", tab);
//       if (searchMId.trim()) params.set("merchantId", searchMId.trim());
//       const { data } = await API.get(`/traffic-tasks?${params}`);
//       return data;
//     },
//     keepPreviousData: true,
//   });

//   const tasks = data?.tasks || [];
//   const total = data?.total || 0;
//   const totalPages = data?.pages || 1;

//   const invalidate = () => queryClient.invalidateQueries(["trafficTasks"]);

//   // ── Create: POST /api/traffic-tasks ──────────────────────
//   // body: { merchantId, startExecutionTime, executionDuration(minutes), traffic, taskInformation }
//   const create = useMutation({
//     mutationFn: (body) => API.post("/traffic-tasks", body),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Traffic task created! 🚀");
//       closeModal();
//     },
//     onError: (e) =>
//       toast.error(e.response?.data?.message || "Failed to create"),
//   });

//   // ── Update Progress: PUT /api/traffic-tasks/:id/progress ──
//   // body: { completedTraffic }
//   // auto-completes task if completedTraffic >= task.traffic
//   const updateProgress = useMutation({
//     mutationFn: ({ id, completedTraffic }) =>
//       API.put(`/traffic-tasks/${id}/progress`, { completedTraffic }),
//     onSuccess: (res) => {
//       invalidate();
//       const status = res.data?.task?.status;
//       if (status === "executionCompleted") {
//         toast.success("Traffic goal reached — task completed! ✅");
//       } else {
//         toast.success("Progress updated");
//       }
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── End task: PUT /api/traffic-tasks/:id/end ─────────────
//   // Sets status to 'ended' immediately
//   const endTask = useMutation({
//     mutationFn: (id) => API.put(`/traffic-tasks/${id}/end`),
//     onSuccess: () => {
//       invalidate();
//       toast.success("Task ended");
//       closeModal();
//     },
//     onError: (e) => toast.error(e.response?.data?.message || "Failed"),
//   });

//   // ── Modal helpers ─────────────────────────────────────────
//   const openCreate = () => {
//     setForm(EMPTY_FORM);
//     setModal("create");
//   };
//   const openProgress = (task) => {
//     setSelected(task);
//     setNewProgress(String(task.completedTraffic || 0));
//     setModal("progress");
//   };
//   const openDetail = (task) => {
//     setSelected(task);
//     setModal("detail");
//   };
//   const closeModal = () => {
//     setModal(null);
//     setSelected(null);
//     setNewProgress("");
//     setForm(EMPTY_FORM);
//   };

//   const setF = (key) => (e) =>
//     setForm((f) => ({ ...f, [key]: e.target.value }));

//   const handleCreate = () => {
//     if (!form.merchantId.trim()) return toast.error("Merchant ID is required");
//     if (!form.traffic || Number(form.traffic) <= 0)
//       return toast.error("Traffic target must be > 0");
//     const body = {
//       merchantId: form.merchantId.trim(),
//       executionDuration: Number(form.executionDuration || 43200),
//       traffic: Number(form.traffic),
//       taskInformation: form.taskInformation.trim(),
//       startExecutionTime: form.startExecutionTime
//         ? new Date(form.startExecutionTime).toISOString()
//         : new Date().toISOString(),
//     };
//     create.mutate(body);
//   };

//   const handleProgress = () => {
//     const val = Number(newProgress);
//     if (isNaN(val) || val < 0) return toast.error("Enter a valid number");
//     updateProgress.mutate({ id: selected._id, completedTraffic: val });
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

//   const activeColor =
//     tab === "all" ? "#6b7280" : STATUS_MAP[tab]?.color || "#6b7280";

//   return (
//     <div className="space-y-4">
//       {/* ── Header ── */}
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Traffic Tasks
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             {total} tasks · superAdmin only
//           </p>
//         </div>
//         <div className="flex items-center gap-2">
//           <button
//             onClick={invalidate}
//             className="flex items-center gap-2 px-3 py-2.5 rounded-xl border
//               border-gray-200 text-gray-500 hover:bg-gray-50 text-sm transition-all"
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
//           <button
//             onClick={openCreate}
//             className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm
//               font-bold text-white transition-all hover:scale-105 active:scale-95"
//             style={{
//               background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               boxShadow: "0 4px 12px rgba(240,45,101,0.35)",
//             }}
//           >
//             <span className="text-base leading-none">+</span>
//             New Task
//           </button>
//         </div>
//       </div>

//       {/* ── Tabs + Search ── */}
//       <div
//         className="bg-white rounded-2xl p-4 space-y-3"
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
//                       background:
//                         t.key === "all" ? "#6b7280" : STATUS_MAP[t.key]?.color,
//                       color: "white",
//                       boxShadow: `0 4px 12px ${(t.key === "all" ? "#6b7280" : STATUS_MAP[t.key]?.color) + "40"}`,
//                     }
//                   : { background: "#f3f4f6", color: "#6b7280" }
//               }
//             >
//               {t.label}
//             </button>
//           ))}
//         </div>

//         <div className="relative max-w-sm">
//           <svg
//             className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <circle cx="11" cy="11" r="8" />
//             <path d="M21 21l-4.35-4.35" />
//           </svg>
//           <input
//             value={searchMId}
//             onChange={(e) => setSearchMId(e.target.value)}
//             placeholder="Filter by Merchant ID..."
//             className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200
//               text-sm outline-none focus:border-pink-400 bg-gray-50
//               focus:bg-white transition-all"
//           />
//         </div>
//       </div>

//       {/* ── Table ── */}
//       <div
//         className="bg-white rounded-2xl overflow-hidden"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="overflow-x-auto">
//           <table className="w-full" style={{ minWidth: 860 }}>
//             <thead style={{ background: "#f8fafc" }}>
//               <tr>
//                 {[
//                   "#",
//                   "Merchant",
//                   "Traffic Progress",
//                   "Duration",
//                   "Start Time",
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
//               {/* Skeleton */}
//               {isLoading &&
//                 [...Array(6)].map((_, i) => (
//                   <tr key={i} className="border-t border-gray-50">
//                     {[...Array(7)].map((_, j) => (
//                       <td key={j} className="px-4 py-4">
//                         <div className="h-3 bg-gray-100 rounded animate-pulse w-3/4" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))}

//               {/* Empty */}
//               {!isLoading && tasks.length === 0 && (
//                 <tr>
//                   <td colSpan={7} className="text-center py-20">
//                     <div className="flex flex-col items-center gap-3">
//                       <span className="text-6xl">📊</span>
//                       <p className="text-gray-400 text-sm font-medium">
//                         No {tab === "all" ? "" : tab} tasks found
//                       </p>
//                     </div>
//                   </td>
//                 </tr>
//               )}

//               {/* Rows */}
//               {!isLoading &&
//                 tasks.map((task, i) => {
//                   const st = STATUS_MAP[task.status] || STATUS_MAP.inProgress;
//                   const pct =
//                     task.traffic > 0
//                       ? Math.min(
//                           100,
//                           (task.completedTraffic / task.traffic) * 100,
//                         )
//                       : 0;

//                   return (
//                     <tr
//                       key={task._id}
//                       className="border-t border-gray-50 hover:bg-slate-50/60 transition-colors"
//                     >
//                       {/* # */}
//                       <td className="px-4 py-4">
//                         <span className="text-gray-400 text-xs">
//                           {(page - 1) * limit + i + 1}
//                         </span>
//                       </td>

//                       {/* Merchant */}
//                       <td className="px-4 py-4">
//                         <div className="flex items-center gap-2">
//                           <div
//                             className="w-7 h-7 rounded-lg bg-gray-100 flex items-center
//                           justify-center text-xs flex-shrink-0"
//                           >
//                             🏪
//                           </div>
//                           <div className="min-w-0">
//                             <p className="text-gray-700 text-xs font-semibold truncate max-w-[100px]">
//                               {task.merchant?.storeName || "—"}
//                             </p>
//                             <p className="text-gray-400 text-[10px]">
//                               {task.merchant?.merchantId}
//                             </p>
//                           </div>
//                         </div>
//                       </td>

//                       {/* Traffic progress */}
//                       <td className="px-4 py-4" style={{ minWidth: 160 }}>
//                         <ProgressBar
//                           completed={task.completedTraffic || 0}
//                           total={task.traffic || 0}
//                           color={st.color}
//                         />
//                       </td>

//                       {/* Duration */}
//                       <td className="px-4 py-4">
//                         <p className="text-gray-700 text-xs font-semibold">
//                           {fmtDuration(task.executionDuration || 43200)}
//                         </p>
//                       </td>

//                       {/* Start time */}
//                       <td className="px-4 py-4">
//                         <p className="text-gray-500 text-xs whitespace-nowrap">
//                           {task.startExecutionTime
//                             ? new Date(
//                                 task.startExecutionTime,
//                               ).toLocaleDateString("en-US", {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "2-digit",
//                               })
//                             : "—"}
//                         </p>
//                       </td>

//                       {/* Status */}
//                       <td className="px-4 py-4">
//                         <Badge color={st.color}>
//                           {st.icon} {st.label}
//                         </Badge>
//                       </td>

//                       {/* Actions */}
//                       <td className="px-4 py-4">
//                         <div className="flex items-center gap-1.5">
//                           {/* View detail */}
//                           <button
//                             onClick={() => openDetail(task)}
//                             title="View details"
//                             className="w-7 h-7 rounded-lg flex items-center justify-center
//                             text-xs transition-all hover:scale-110"
//                             style={{
//                               background: "#6366f118",
//                               color: "#6366f1",
//                             }}
//                           >
//                             👁️
//                           </button>

//                           {/* Update progress — only for inProgress */}
//                           {task.status === "inProgress" && (
//                             <button
//                               onClick={() => openProgress(task)}
//                               title="Update progress"
//                               className="w-7 h-7 rounded-lg flex items-center justify-center
//                               text-xs transition-all hover:scale-110"
//                               style={{
//                                 background: "#3b82f618",
//                                 color: "#3b82f6",
//                               }}
//                             >
//                               📈
//                             </button>
//                           )}

//                           {/* End task — only for inProgress */}
//                           {task.status === "inProgress" && (
//                             <button
//                               onClick={() => {
//                                 if (window.confirm("End this traffic task?"))
//                                   endTask.mutate(task._id);
//                               }}
//                               disabled={endTask.isPending}
//                               title="End task"
//                               className="w-7 h-7 rounded-lg flex items-center justify-center
//                               text-xs transition-all hover:scale-110 disabled:opacity-50"
//                               style={{
//                                 background: "#6b728018",
//                                 color: "#6b7280",
//                               }}
//                             >
//                               ⏹️
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

//       {/* ══ Create Task Modal ════════════════════════════════ */}
//       <Modal
//         open={modal === "create"}
//         onClose={closeModal}
//         title="🚀 Create Traffic Task"
//       >
//         <div className="space-y-4">
//           <Field
//             label="Merchant ID"
//             required
//             hint="The merchant's unique ID string (merchantId)"
//           >
//             <Input
//               placeholder="e.g. MCH123456"
//               value={form.merchantId}
//               onChange={setF("merchantId")}
//             />
//           </Field>

//           <div className="grid grid-cols-2 gap-3">
//             <Field
//               label="Traffic Target"
//               required
//               hint="Number of visits to reach"
//             >
//               <Input
//                 type="number"
//                 min="1"
//                 placeholder="10000"
//                 value={form.traffic}
//                 onChange={setF("traffic")}
//               />
//             </Field>
//             <Field label="Duration (minutes)" hint="Default 43200 = 30 days">
//               <Input
//                 type="number"
//                 min="1"
//                 placeholder="43200"
//                 value={form.executionDuration}
//                 onChange={setF("executionDuration")}
//               />
//             </Field>
//           </div>

//           {/* Duration quick-picks */}
//           <div className="flex gap-2 flex-wrap">
//             {[
//               { label: "1 Day", val: "1440" },
//               { label: "7 Days", val: "10080" },
//               { label: "30 Days", val: "43200" },
//               { label: "60 Days", val: "86400" },
//             ].map((opt) => (
//               <button
//                 key={opt.val}
//                 onClick={() =>
//                   setForm((f) => ({ ...f, executionDuration: opt.val }))
//                 }
//                 className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
//                 style={
//                   form.executionDuration === opt.val
//                     ? { background: "#f02d65", color: "white" }
//                     : { background: "#f3f4f6", color: "#6b7280" }
//                 }
//               >
//                 {opt.label}
//               </button>
//             ))}
//           </div>

//           <Field
//             label="Start Date/Time"
//             hint="Leave blank to start immediately"
//           >
//             <Input
//               type="datetime-local"
//               value={form.startExecutionTime}
//               onChange={setF("startExecutionTime")}
//             />
//           </Field>

//           <Field label="Task Information">
//             <Input
//               placeholder="Optional notes about this task..."
//               value={form.taskInformation}
//               onChange={setF("taskInformation")}
//             />
//           </Field>

//           {/* Summary preview */}
//           {form.traffic && (
//             <div
//               className="rounded-xl p-4"
//               style={{ background: "#f0f9ff", border: "1px solid #bae6fd" }}
//             >
//               <p className="text-blue-600 text-xs font-semibold">
//                 Task Summary
//               </p>
//               <p className="text-blue-700 text-sm mt-1">
//                 Target: <strong>{Number(form.traffic).toLocaleString()}</strong>{" "}
//                 visits over{" "}
//                 <strong>
//                   {fmtDuration(Number(form.executionDuration || 43200))}
//                 </strong>
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
//               onClick={handleCreate}
//               disabled={create.isPending}
//               className="py-3 rounded-xl text-white font-bold text-sm transition-all
//                 hover:scale-105 active:scale-95 disabled:opacity-50"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                 boxShadow: "0 4px 12px rgba(240,45,101,0.3)",
//               }}
//             >
//               {create.isPending ? "Creating..." : "Create Task"}
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* ══ Update Progress Modal ════════════════════════════ */}
//       <Modal
//         open={modal === "progress"}
//         onClose={closeModal}
//         title="📈 Update Traffic Progress"
//       >
//         {selected && (
//           <div className="space-y-4">
//             <div
//               className="rounded-xl p-4"
//               style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//             >
//               <p className="text-gray-500 text-xs font-semibold mb-2">
//                 Current Progress
//               </p>
//               <ProgressBar
//                 completed={selected.completedTraffic || 0}
//                 total={selected.traffic || 0}
//                 color="#3b82f6"
//               />
//             </div>

//             <Field
//               label="New Completed Traffic"
//               required
//               hint={`Target: ${(selected.traffic || 0).toLocaleString()} · Task auto-completes when reached`}
//             >
//               <Input
//                 type="number"
//                 min="0"
//                 max={selected.traffic}
//                 placeholder={String(selected.completedTraffic || 0)}
//                 value={newProgress}
//                 onChange={(e) => setNewProgress(e.target.value)}
//               />
//             </Field>

//             {/* Preview new progress */}
//             {newProgress && (
//               <div
//                 className="rounded-xl p-4"
//                 style={{ background: "#f0fdf4", border: "1px solid #bbf7d0" }}
//               >
//                 <p className="text-green-600 text-xs font-semibold mb-2">
//                   After update:
//                 </p>
//                 <ProgressBar
//                   completed={Number(newProgress) || 0}
//                   total={selected.traffic || 0}
//                   color="#22c55e"
//                 />
//                 {Number(newProgress) >= (selected.traffic || 0) && (
//                   <p className="text-green-700 text-xs mt-2 font-semibold">
//                     ✅ This will complete the task!
//                   </p>
//                 )}
//               </div>
//             )}

//             <div className="grid grid-cols-2 gap-3 pt-1">
//               <button
//                 onClick={closeModal}
//                 className="py-3 rounded-xl border border-gray-200 text-gray-500
//                   text-sm hover:bg-gray-50 transition-all"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleProgress}
//                 disabled={updateProgress.isPending}
//                 className="py-3 rounded-xl text-white font-bold text-sm transition-all
//                   hover:scale-105 active:scale-95 disabled:opacity-50"
//                 style={{
//                   background: "linear-gradient(135deg,#3b82f6,#2563eb)",
//                   boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
//                 }}
//               >
//                 {updateProgress.isPending ? "Updating..." : "Update Progress"}
//               </button>
//             </div>
//           </div>
//         )}
//       </Modal>

//       {/* ══ Detail Modal ════════════════════════════════════ */}
//       <Modal
//         open={modal === "detail"}
//         onClose={closeModal}
//         title="📊 Task Details"
//       >
//         {selected &&
//           (() => {
//             const st = STATUS_MAP[selected.status] || STATUS_MAP.inProgress;
//             return (
//               <div className="space-y-4">
//                 {/* Status badge */}
//                 <div className="flex items-center gap-2">
//                   <Badge color={st.color}>
//                     {st.icon} {st.label}
//                   </Badge>
//                 </div>

//                 {/* Merchant */}
//                 <div
//                   className="flex items-center gap-3 p-3 rounded-xl"
//                   style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//                 >
//                   <div
//                     className="w-10 h-10 rounded-xl bg-gray-100 flex items-center
//                   justify-center text-xl"
//                   >
//                     🏪
//                   </div>
//                   <div>
//                     <p className="text-gray-800 text-sm font-bold">
//                       {selected.merchant?.storeName || "—"}
//                     </p>
//                     <p className="text-gray-400 text-xs">
//                       ID: {selected.merchant?.merchantId}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Progress */}
//                 <div
//                   className="rounded-xl p-4"
//                   style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}
//                 >
//                   <p className="text-gray-500 text-xs font-semibold mb-3">
//                     Traffic Progress
//                   </p>
//                   <ProgressBar
//                     completed={selected.completedTraffic || 0}
//                     total={selected.traffic || 0}
//                     color={st.color}
//                   />
//                 </div>

//                 {/* Details grid */}
//                 <div className="grid grid-cols-2 gap-3 text-xs">
//                   {[
//                     {
//                       label: "Duration",
//                       value: fmtDuration(selected.executionDuration || 43200),
//                     },
//                     {
//                       label: "Target",
//                       value:
//                         (selected.traffic || 0).toLocaleString() + " visits",
//                     },
//                     {
//                       label: "Completed",
//                       value:
//                         (selected.completedTraffic || 0).toLocaleString() +
//                         " visits",
//                     },
//                     {
//                       label: "Start Time",
//                       value: selected.startExecutionTime
//                         ? new Date(selected.startExecutionTime).toLocaleString()
//                         : "—",
//                     },
//                   ].map((r) => (
//                     <div
//                       key={r.label}
//                       className="rounded-xl p-3"
//                       style={{
//                         background: "#f8fafc",
//                         border: "1px solid #e2e8f0",
//                       }}
//                     >
//                       <p className="text-gray-400 mb-0.5">{r.label}</p>
//                       <p className="text-gray-700 font-semibold">{r.value}</p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Task info */}
//                 {selected.taskInformation && (
//                   <div
//                     className="rounded-xl p-4"
//                     style={{
//                       background: "#f8fafc",
//                       border: "1px solid #e2e8f0",
//                     }}
//                   >
//                     <p className="text-gray-400 text-xs mb-1">
//                       Task Information
//                     </p>
//                     <p className="text-gray-700 text-sm">
//                       {selected.taskInformation}
//                     </p>
//                   </div>
//                 )}

//                 {/* Actions from detail modal */}
//                 <div className="flex gap-2 flex-wrap">
//                   {selected.status === "inProgress" && (
//                     <>
//                       <button
//                         onClick={() => {
//                           closeModal();
//                           openProgress(selected);
//                         }}
//                         className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold
//                         transition-all hover:scale-105"
//                         style={{
//                           background: "linear-gradient(135deg,#3b82f6,#2563eb)",
//                         }}
//                       >
//                         📈 Update Progress
//                       </button>
//                       <button
//                         onClick={() => {
//                           if (window.confirm("End this task?"))
//                             endTask.mutate(selected._id);
//                         }}
//                         disabled={endTask.isPending}
//                         className="px-4 py-2.5 rounded-xl text-sm font-bold border
//                         border-gray-200 text-gray-500 hover:bg-gray-50 transition-all"
//                       >
//                         ⏹️ End
//                       </button>
//                     </>
//                   )}
//                   <button
//                     onClick={closeModal}
//                     className="flex-1 py-2.5 rounded-xl border border-gray-200
//                     text-gray-500 text-sm hover:bg-gray-50 transition-all"
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

/////////////////////////////// ==================== latest version (by gemeni pro) ========================//////////////////////////*:
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  Plus,
  Search,
  Edit,
  Trash2,
  StopCircle,
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
    <label className="text-gray-600 text-[13px] font-bold w-40 text-right flex-shrink-0">
      {label}
    </label>
    <input
      style={{ padding: "6px 10px" }}
      type={type}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex items-center gap-4 mb-4">
    <label className="text-gray-600 text-[13px] font-bold w-40 text-right flex-shrink-0">
      {label}
    </label>
    <select
      style={{ padding: "6px 10px" }}
      className="flex-1 rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white disabled:bg-gray-100 disabled:text-gray-500"
      {...props}
    >
      {children}
    </select>
  </div>
);

// ── Draggable Modal Component ────────────────────────────
const DraggableModal = ({
  open,
  onClose,
  title,
  children,
  width = "max-w-2xl",
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
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
        className={`relative bg-white rounded-sm w-full ${width} flex flex-col shadow-2xl overflow-hidden`}
      >
        <div
          style={{ padding: "12px 20px" }}
          className="flex items-center justify-between bg-slate-800 text-white cursor-move select-none"
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            setIsDragging(true);
            setRel({ x: e.clientX - pos.x, y: e.clientY - pos.y });
          }}
        >
          <h3 className="font-bold text-[14px]">{title}</h3>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div
          style={{ padding: "20px" }}
          className="overflow-y-auto max-h-[80vh] custom-scrollbar bg-gray-50/30"
        >
          {children}
        </div>
      </div>
    </div>
  );
};

const EMPTY_FORM = {
  merchantId: "",
  traffic: "",
  completedTraffic: 0,
  executionDuration: "43200",
  startExecutionTime: "",
  taskInformation: "",
  status: "inProgress",
};

export default function TrafficTask() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter Inputs
  const [taskIdInput, setTaskIdInput] = useState("");
  const [merchantNameInput, setMerchantNameInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [activeFilters, setActiveFilters] = useState({});

  const [modal, setModal] = useState(null); // 'add' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  // Searchable Merchant Dropdown States
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["trafficTasks", page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (activeFilters.status) p.set("status", activeFilters.status);
      const { data } = await API.get(`/traffic-tasks?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const tasks = data?.tasks || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["trafficTasks"]);

  // ── Merchant Search API ──────────
  const { data: searchResults } = useQuery({
    queryKey: ["merchantSearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];
      const { data } = await API.get(
        `/merchants?storeName=${searchQuery}&limit=10`,
      );
      return data.merchants || [];
    },
    enabled: !!searchQuery && showDropdown,
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Mutations ──────────────────────────────────────────────
  const createTask = useMutation({
    mutationFn: (body) => API.post("/traffic-tasks", body),
    onSuccess: () => {
      invalidate();
      toast.success("Traffic task created successfully!");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to create task"),
  });

  const updateTask = useMutation({
    mutationFn: ({ id, body }) => API.put(`/traffic-tasks/${id}`, body),
    onSuccess: () => {
      invalidate();
      toast.success("Traffic task updated successfully!");
      closeModal();
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to update task"),
  });

  const deleteTask = useMutation({
    mutationFn: (id) => API.delete(`/traffic-tasks/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted permanently.");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to delete task"),
  });

  const endTask = useMutation({
    mutationFn: (id) => API.put(`/traffic-tasks/${id}/end`),
    onSuccess: () => {
      invalidate();
      toast.success("Task ended successfully.");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to end task"),
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = () => {
    setActiveFilters({ status: statusInput });
    setPage(1);
  };

  const handleReset = () => {
    setTaskIdInput("");
    setMerchantNameInput("");
    setStatusInput("");
    setActiveFilters({});
    setPage(1);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setSearchQuery("");
    setEditId(null);
    setModal("add");
  };

  const openEdit = (t) => {
    setForm({
      merchantId: t.merchant?.merchantId || "",
      traffic: t.traffic || "",
      completedTraffic: t.completedTraffic || 0,
      executionDuration: t.executionDuration || "43200",
      startExecutionTime: t.startExecutionTime
        ? new Date(t.startExecutionTime).toISOString().slice(0, 16)
        : "",
      taskInformation: t.taskInformation || "",
      status: t.status || "inProgress",
    });
    setSearchQuery(`${t.merchant?.storeName} (${t.merchant?.merchantId})`);
    setEditId(t._id);
    setModal("edit");
  };

  const closeModal = () => {
    setModal(null);
    setEditId(null);
    setForm(EMPTY_FORM);
    setSearchQuery("");
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!form.merchantId) return toast.error("Please select a Merchant.");
    if (!form.traffic || Number(form.traffic) <= 0)
      return toast.error("Traffic target must be > 0");

    const body = {
      merchantId: form.merchantId,
      executionDuration: Number(form.executionDuration || 43200),
      traffic: Number(form.traffic),
      completedTraffic: Number(form.completedTraffic || 0),
      taskInformation: form.taskInformation,
      status: form.status,
      startExecutionTime: form.startExecutionTime
        ? new Date(form.startExecutionTime).toISOString()
        : new Date().toISOString(),
    };

    if (modal === "edit" && editId) {
      updateTask.mutate({ id: editId, body });
    } else {
      createTask.mutate(body);
    }
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
      {/* ── Visual Filter Grid ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <FormInput
            label="Task ID"
            placeholder="Search by Task ID"
            value={taskIdInput}
            onChange={(e) => setTaskIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant Name"
            placeholder="Search by Merchant"
            value={merchantNameInput}
            onChange={(e) => setMerchantNameInput(e.target.value)}
          />
          <FormSelect
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="inProgress">In Progress</option>
            <option value="executionCompleted">Execution Completed</option>
            <option value="ended">Ended</option>
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
            Submit
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
          />
        </button>
        <ActionBtn
          color="#059669"
          label="Add New Task"
          icon={Plus}
          onClick={openAdd}
        />
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-sm flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-800 text-[12px] font-bold bg-gray-50/50">
                <th
                  style={{ padding: "12px 15px" }}
                  className="text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>Task ID</th>
                <th style={{ padding: "12px 15px" }}>Merchant Name</th>
                <th style={{ padding: "12px 15px" }}>Start Execution Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Duration (min)
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Target Traffic
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Completed Traffic
                </th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Status
                </th>
                <th style={{ padding: "12px 15px" }}>Task Information</th>
                <th style={{ padding: "12px 15px" }}>Creation Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="11" className="py-24 text-center">
                    {/* <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-[13px]">
                      Loading traffic tasks...
                    </p> */}
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <p className="text-gray-500 text-[13px] font-medium">
                        Loading traffic tasks...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td
                    colSpan="11"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => {
                  let dotColor = "text-gray-400";
                  let statusText = "Ended";
                  if (t.status === "inProgress") {
                    dotColor = "text-blue-500";
                    statusText = "In Progress";
                  } else if (t.status === "executionCompleted") {
                    dotColor = "text-emerald-500";
                    statusText = "Execution Completed";
                  }

                  return (
                    <tr
                      key={t._id}
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
                        className="text-[13px] text-gray-600 font-mono"
                      >
                        {t._id.slice(-4).toUpperCase()}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-800 font-bold"
                      >
                        {t.merchant?.storeName || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600"
                      >
                        {new Date(
                          t.startExecutionTime || t.createdAt,
                        ).toLocaleString("en-CA")}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center text-[13px] text-gray-700 font-mono bg-gray-50/50"
                      >
                        {t.executionDuration}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center text-[13px] font-bold text-blue-600 font-mono bg-blue-50/20"
                      >
                        {t.traffic}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center text-[13px] font-bold text-emerald-600 font-mono bg-emerald-50/20"
                      >
                        {t.completedTraffic}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`text-[14px] leading-none ${dotColor}`}
                          >
                            ●
                          </span>
                          <span className={`text-[12px] font-bold ${dotColor}`}>
                            {statusText}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[12px] text-gray-600 max-w-[150px] truncate"
                      >
                        {t.taskInformation ||
                          (t.status === "executionCompleted"
                            ? "Completed Additions"
                            : "-")}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {new Date(t.createdAt).toLocaleString("en-CA")}
                      </td>

                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openEdit(t)}
                            className="w-7 h-7 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white rounded-sm flex items-center justify-center transition-colors border border-blue-100"
                            title="Edit Task"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {t.status === "inProgress" && (
                            <button
                              onClick={() =>
                                window.confirm(
                                  "Are you sure you want to stop this live traffic task? The merchant's traffic will halt immediately.",
                                ) && endTask.mutate(t._id)
                              }
                              disabled={endTask.isPending}
                              className="w-7 h-7 bg-orange-50 text-orange-500 hover:bg-orange-500 hover:text-white rounded-sm flex items-center justify-center transition-colors border border-orange-100 disabled:opacity-50"
                              title="Force End Task"
                            >
                              <StopCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              window.confirm(
                                "Are you sure you want to permanently delete this task? This cannot be undone.",
                              ) && deleteTask.mutate(t._id)
                            }
                            disabled={deleteTask.isPending}
                            className="w-7 h-7 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-sm flex items-center justify-center transition-colors border border-red-100 disabled:opacity-50"
                            title="Delete Task"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ════════════ DRAGGABLE ADD/EDIT MODAL ════════════ */}
      <DraggableModal
        open={modal}
        onClose={closeModal}
        title={modal === "edit" ? "Edit Traffic Task" : "Add Traffic Task"}
      >
        <div className="flex flex-col gap-2">
          {/* SEARCHABLE MERCHANT ID FIELD */}
          <div
            className="flex items-start gap-4 mb-4 relative"
            ref={dropdownRef}
          >
            <label className="text-gray-600 text-[13px] font-bold w-40 text-right flex-shrink-0 pt-2">
              Target Merchant:
            </label>
            <div className="flex-1 relative">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  style={{ padding: "6px 10px 6px 32px" }}
                  type="text"
                  placeholder="Search Store Name or Merchant ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={modal === "edit"} // Prevent changing merchant during edit to avoid database linkage issues
                  className="w-full rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {showDropdown && searchResults && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-xl max-h-48 overflow-y-auto">
                  {searchResults.map((m) => (
                    <div
                      key={m._id}
                      onClick={() => {
                        setForm({ ...form, merchantId: m.merchantId });
                        setSearchQuery(`${m.storeName} (${m.merchantId})`);
                        setShowDropdown(false);
                      }}
                      className="p-2.5 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                    >
                      <p className="text-[13px] font-bold text-gray-800">
                        {m.storeName}
                      </p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        ID: {m.merchantId}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <FormInput
            label="Target Traffic"
            type="number"
            placeholder="e.g. 3187"
            value={form.traffic}
            onChange={(e) => setForm({ ...form, traffic: e.target.value })}
          />

          {modal === "edit" && (
            <FormInput
              label="Completed Traffic"
              type="number"
              placeholder="e.g. 1500"
              value={form.completedTraffic}
              onChange={(e) =>
                setForm({ ...form, completedTraffic: e.target.value })
              }
            />
          )}

          <FormInput
            label="Execution Duration (min)"
            type="number"
            placeholder="e.g. 43200 (30 days)"
            value={form.executionDuration}
            onChange={(e) =>
              setForm({ ...form, executionDuration: e.target.value })
            }
          />

          <FormInput
            label="Start Execution Time"
            type="datetime-local"
            value={form.startExecutionTime}
            onChange={(e) =>
              setForm({ ...form, startExecutionTime: e.target.value })
            }
          />

          <FormInput
            label="Task Information"
            type="text"
            placeholder="Optional notes or 'Completed Additions'"
            value={form.taskInformation}
            onChange={(e) =>
              setForm({ ...form, taskInformation: e.target.value })
            }
          />

          <FormSelect
            label="Status"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            disabled={modal === "add"} // Status is automatically In Progress when adding
          >
            <option value="inProgress">In Progress</option>
            <option value="executionCompleted">Execution Completed</option>
            <option value="ended">Ended</option>
          </FormSelect>

          {/* Action Button */}
          <div className="flex justify-center mt-2 border-t border-gray-100 pt-5">
            <button
              style={{ padding: "8px 40px" }}
              onClick={handleSubmit}
              disabled={createTask.isPending || updateTask.isPending}
              className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm font-bold text-[13px] transition-colors shadow-sm disabled:opacity-50"
            >
              {createTask.isPending || updateTask.isPending
                ? "Processing..."
                : "OK"}
            </button>
          </div>
        </div>
      </DraggableModal>
    </div>
  );
}
