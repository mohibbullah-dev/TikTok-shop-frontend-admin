// import { useQuery } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import API from "../../axios";

// // ─── Reusable stat card ───────────────────────────────────────
// const StatCard = ({
//   label,
//   icon,
//   color,
//   today,
//   yesterday,
//   month,
//   lastMonth,
// }) => (
//   <div
//     className="bg-white rounded-2xl p-5 flex flex-col gap-3"
//     style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//   >
//     {/* Header */}
//     <div className="flex items-center justify-between">
//       <p
//         className="text-gray-500 text-xs font-semibold uppercase
//         tracking-wide"
//       >
//         {label}
//       </p>
//       <div
//         className="w-9 h-9 rounded-xl flex items-center
//         justify-center text-lg"
//         style={{ background: color + "18" }}
//       >
//         {icon}
//       </div>
//     </div>

//     {/* Today big number */}
//     <div>
//       <p className="text-gray-400 text-[10px] mb-0.5">Today</p>
//       <p
//         className="text-2xl font-extrabold text-gray-800
//         leading-none tracking-tight"
//       >
//         {today}
//       </p>
//     </div>

//     {/* Divider */}
//     <div className="h-px bg-gray-100" />

//     {/* 3 sub-stats */}
//     <div className="grid grid-cols-3 gap-2">
//       {[
//         { lbl: "Yesterday", val: yesterday },
//         { lbl: "This Month", val: month },
//         { lbl: "Last Month", val: lastMonth },
//       ].map((s, i) => (
//         <div key={i}>
//           <p className="text-gray-400 text-[9px] mb-0.5">{s.lbl}</p>
//           <p className="text-gray-700 text-xs font-bold">{s.val}</p>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// // ─── Tiny trend badge ─────────────────────────────────────────
// const Trend = ({ value }) => {
//   const up = value >= 0;
//   return (
//     <span
//       className="inline-flex items-center gap-0.5 text-[10px]
//       font-bold px-1.5 py-0.5 rounded-full"
//       style={{
//         background: up ? "#dcfce7" : "#fee2e2",
//         color: up ? "#16a34a" : "#dc2626",
//       }}
//     >
//       {up ? "↑" : "↓"} {Math.abs(value)}%
//     </span>
//   );
// };

// // ─── Chart tooltip ────────────────────────────────────────────
// const ChartTooltip = ({ active, payload, label, prefix = "$" }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       className="bg-white px-3 py-2 rounded-xl text-xs"
//       style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
//     >
//       <p className="text-gray-400 mb-1">{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} className="font-bold" style={{ color: p.color }}>
//           {p.name}: {prefix}
//           {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
//         </p>
//       ))}
//     </div>
//   );
// };

// export default function Dashboard() {
//   const { user } = useSelector((s) => s.auth);
//   const navigate = useNavigate();

//   // ── Stats ──────────────────────────────────────────────────
//   const { data: statsData, isLoading: statsLoading } = useQuery({
//     queryKey: ["dashboardStats"],
//     queryFn: async () => {
//       const { data } = await API.get("/auth/admin/stats");
//       return data;
//     },
//     refetchInterval: 60000,
//   });

//   // ── Finance chart data ─────────────────────────────────────
//   const { data: financeChart } = useQuery({
//     queryKey: ["financeChart"],
//     queryFn: async () => {
//       const { data } = await API.get("/transactions/admin-statements?days=7");
//       return data;
//     },
//   });

//   // ── Recent recharges ───────────────────────────────────────
//   const { data: recentRecharges } = useQuery({
//     queryKey: ["recentRecharges"],
//     queryFn: async () => {
//       const { data } = await API.get("/recharge?limit=5&sort=-createdAt");
//       return data;
//     },
//     enabled: user?.role === "superAdmin",
//   });

//   // ── Recent withdrawals ─────────────────────────────────────
//   const { data: recentWithdrawals } = useQuery({
//     queryKey: ["recentWithdrawals"],
//     queryFn: async () => {
//       const { data } = await API.get("/withdrawal?limit=5&sort=-createdAt");
//       return data;
//     },
//     enabled: ["superAdmin", "merchantAdmin"].includes(user?.role),
//   });

//   // ── Recent orders ──────────────────────────────────────────
//   const { data: recentOrders } = useQuery({
//     queryKey: ["recentOrdersAdmin"],
//     queryFn: async () => {
//       const { data } = await API.get("/orders?limit=5&sort=-createdAt");
//       return data;
//     },
//   });

//   // ── Fallback chart data if API not ready ───────────────────
//   const chartData = financeChart?.data || [
//     { date: "Mon", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Tue", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Wed", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Thu", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Fri", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Sat", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Sun", recharge: 0, withdrawal: 0, profit: 0 },
//   ];

//   // Pie chart for order statuses
//   const orderPieData = [
//     {
//       name: "Completed",
//       value: statsData?.orders?.completed || 0,
//       color: "#22c55e",
//     },
//     {
//       name: "Pending",
//       value: statsData?.orders?.pending || 0,
//       color: "#f59e0b",
//     },
//     {
//       name: "Shipped",
//       value: statsData?.orders?.shipped || 0,
//       color: "#6366f1",
//     },
//     {
//       name: "Cancelled",
//       value: statsData?.orders?.cancelled || 0,
//       color: "#ef4444",
//     },
//   ];

//   // ── Stat cards config ──────────────────────────────────────
//   const stats = statsData || {};
//   const cards = [
//     {
//       label: "Total Registrations",
//       icon: "👥",
//       color: "#6366f1",
//       today: stats.registrations?.today ?? 0,
//       yesterday: stats.registrations?.yesterday ?? 0,
//       month: stats.registrations?.month ?? 0,
//       lastMonth: stats.registrations?.lastMonth ?? 0,
//     },
//     {
//       label: "Store Registrations",
//       icon: "🏪",
//       color: "#f02d65",
//       today: stats.stores?.today ?? 0,
//       yesterday: stats.stores?.yesterday ?? 0,
//       month: stats.stores?.month ?? 0,
//       lastMonth: stats.stores?.lastMonth ?? 0,
//     },
//     {
//       label: "Total Recharge",
//       icon: "💳",
//       color: "#22c55e",
//       today: `$${(stats.recharge?.today || 0).toFixed(2)}`,
//       yesterday: `$${(stats.recharge?.yesterday || 0).toFixed(2)}`,
//       month: `$${(stats.recharge?.month || 0).toFixed(2)}`,
//       lastMonth: `$${(stats.recharge?.lastMonth || 0).toFixed(2)}`,
//     },
//     {
//       label: "Total Withdrawals",
//       icon: "💸",
//       color: "#f59e0b",
//       today: `$${(stats.withdrawal?.today || 0).toFixed(2)}`,
//       yesterday: `$${(stats.withdrawal?.yesterday || 0).toFixed(2)}`,
//       month: `$${(stats.withdrawal?.month || 0).toFixed(2)}`,
//       lastMonth: `$${(stats.withdrawal?.lastMonth || 0).toFixed(2)}`,
//     },
//     {
//       label: "Number of Recharges",
//       icon: "🔢",
//       color: "#06b6d4",
//       today: stats.rechargeCount?.today ?? 0,
//       yesterday: stats.rechargeCount?.yesterday ?? 0,
//       month: stats.rechargeCount?.month ?? 0,
//       lastMonth: stats.rechargeCount?.lastMonth ?? 0,
//     },
//     {
//       label: "Total Profit",
//       icon: "📈",
//       color: "#8b5cf6",
//       today: `$${(stats.profit?.today || 0).toFixed(2)}`,
//       yesterday: `$${(stats.profit?.yesterday || 0).toFixed(2)}`,
//       month: `$${(stats.profit?.month || 0).toFixed(2)}`,
//       lastMonth: `$${(stats.profit?.lastMonth || 0).toFixed(2)}`,
//     },
//   ];

//   // ── Status helpers ─────────────────────────────────────────
//   const statusBadge = (status) => {
//     const map = {
//       pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
//       approved: { bg: "#dcfce7", text: "#166534", label: "Approved" },
//       rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
//       completed: { bg: "#dbeafe", text: "#1e40af", label: "Completed" },
//       withdrawn: { bg: "#dcfce7", text: "#166534", label: "Withdrawn" },
//     };
//     const s = map[status] || { bg: "#f3f4f6", text: "#6b7280", label: status };
//     return (
//       <span
//         className="px-2 py-0.5 rounded-full text-[10px] font-bold"
//         style={{ background: s.bg, color: s.text }}
//       >
//         {s.label}
//       </span>
//     );
//   };

//   if (statsLoading)
//     return (
//       <div className="flex items-center justify-center h-64">
//         <svg
//           className="animate-spin h-8 w-8"
//           style={{ color: "#f02d65" }}
//           fill="none"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           />
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8v8H4z"
//           />
//         </svg>
//       </div>
//     );

//   return (
//     <div className="space-y-6">
//       {/* ── Page header ── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1
//             className="text-xl font-extrabold text-gray-800
//             tracking-tight"
//           >
//             Dashboard
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             Welcome back, {user?.username} 👋
//           </p>
//         </div>
//         <div className="text-xs text-gray-400">
//           {new Date().toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           })}
//         </div>
//       </div>

//       {/* ── STAT CARDS — 2 cols mobile, 3 cols lg ── */}
//       <div
//         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
//         gap-4"
//       >
//         {cards.map((card, i) => (
//           <StatCard key={i} {...card} />
//         ))}
//       </div>

//       {/* ── CHARTS ROW ── */}
//       <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//         {/* Area chart — spans 2 cols */}
//         <div
//           className="xl:col-span-2 bg-white rounded-2xl p-5"
//           style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//         >
//           <div className="flex items-center justify-between mb-5">
//             <div>
//               <p className="text-gray-800 font-bold text-sm">
//                 Financial Overview
//               </p>
//               <p className="text-gray-400 text-xs mt-0.5">
//                 Last 7 days — Recharge vs Withdrawal vs Profit
//               </p>
//             </div>
//             {/* Legend */}
//             <div className="hidden sm:flex items-center gap-4">
//               {[
//                 { color: "#22c55e", label: "Recharge" },
//                 { color: "#f02d65", label: "Withdrawal" },
//                 { color: "#6366f1", label: "Profit" },
//               ].map((l) => (
//                 <div key={l.label} className="flex items-center gap-1.5">
//                   <div
//                     className="w-2.5 h-2.5 rounded-full"
//                     style={{ background: l.color }}
//                   />
//                   <span className="text-gray-500 text-[11px]">{l.label}</span>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <ResponsiveContainer width="100%" height={220}>
//             <AreaChart
//               data={chartData}
//               margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
//             >
//               <defs>
//                 <linearGradient id="gRecharge" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
//                   <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="gWithdrawal" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#f02d65" stopOpacity={0.15} />
//                   <stop offset="95%" stopColor="#f02d65" stopOpacity={0} />
//                 </linearGradient>
//                 <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
//                   <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid stroke="#f3f4f6" vertical={false} />
//               <XAxis
//                 dataKey="date"
//                 tick={{ fontSize: 10, fill: "#9ca3af" }}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <YAxis
//                 tick={{ fontSize: 10, fill: "#9ca3af" }}
//                 tickLine={false}
//                 axisLine={false}
//               />
//               <Tooltip content={<ChartTooltip />} />
//               <Area
//                 type="monotone"
//                 dataKey="recharge"
//                 name="Recharge"
//                 stroke="#22c55e"
//                 strokeWidth={2}
//                 fill="url(#gRecharge)"
//                 dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="withdrawal"
//                 name="Withdrawal"
//                 stroke="#f02d65"
//                 strokeWidth={2}
//                 fill="url(#gWithdrawal)"
//                 dot={{ fill: "#f02d65", r: 3, strokeWidth: 0 }}
//               />
//               <Area
//                 type="monotone"
//                 dataKey="profit"
//                 name="Profit"
//                 stroke="#6366f1"
//                 strokeWidth={2}
//                 fill="url(#gProfit)"
//                 dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
//               />
//             </AreaChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Pie chart — 1 col */}
//         <div
//           className="bg-white rounded-2xl p-5"
//           style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//         >
//           <p className="text-gray-800 font-bold text-sm mb-1">Order Status</p>
//           <p className="text-gray-400 text-xs mb-4">Distribution overview</p>

//           <ResponsiveContainer width="100%" height={160}>
//             <PieChart>
//               <Pie
//                 data={orderPieData}
//                 cx="50%"
//                 cy="50%"
//                 innerRadius={45}
//                 outerRadius={70}
//                 paddingAngle={3}
//                 dataKey="value"
//               >
//                 {orderPieData.map((entry, i) => (
//                   <Cell key={i} fill={entry.color} />
//                 ))}
//               </Pie>
//               <Tooltip
//                 formatter={(v, n) => [v, n]}
//                 contentStyle={{
//                   background: "white",
//                   border: "none",
//                   borderRadius: 12,
//                   boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
//                   fontSize: 11,
//                 }}
//               />
//             </PieChart>
//           </ResponsiveContainer>

//           {/* Legend */}
//           <div className="grid grid-cols-2 gap-y-2 mt-3">
//             {orderPieData.map((d, i) => (
//               <div key={i} className="flex items-center gap-1.5">
//                 <div
//                   className="w-2 h-2 rounded-full flex-shrink-0"
//                   style={{ background: d.color }}
//                 />
//                 <span className="text-gray-500 text-[11px]">{d.name}</span>
//                 <span
//                   className="text-gray-800 text-[11px] font-bold
//                   ml-auto"
//                 >
//                   {d.value}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* ── BOTTOM ROW: 3 activity tables ── */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//         {/* Recent Recharges */}
//         {user?.role === "superAdmin" && (
//           <div
//             className="bg-white rounded-2xl overflow-hidden"
//             style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//           >
//             <div
//               className="flex items-center justify-between
//               px-5 py-4 border-b border-gray-100"
//             >
//               <p className="font-bold text-sm text-gray-800">
//                 Recent Recharges
//               </p>
//               <button
//                 onClick={() => navigate("/merchants/recharges")}
//                 className="text-xs font-semibold"
//                 style={{ color: "#f02d65" }}
//               >
//                 View All →
//               </button>
//             </div>
//             <div className="divide-y divide-gray-50">
//               {recentRecharges?.recharges?.length > 0 ? (
//                 recentRecharges.recharges.map((r, i) => (
//                   <div
//                     key={r._id || i}
//                     className="flex items-center gap-3 px-5 py-3"
//                   >
//                     <div
//                       className="w-8 h-8 rounded-full
//                       flex items-center justify-center flex-shrink-0
//                       text-sm"
//                       style={{ background: "#dcfce7" }}
//                     >
//                       💳
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p
//                         className="text-gray-700 text-xs font-semibold
//                         truncate"
//                       >
//                         {r.merchant?.storeName || "Unknown"}
//                       </p>
//                       <p className="text-gray-400 text-[10px]">
//                         {r.rechargeType} · {r.currencyType}
//                       </p>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className="text-green-600 text-xs font-bold">
//                         +${r.price?.toFixed(2)}
//                       </p>
//                       {statusBadge(r.status)}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div
//                   className="flex flex-col items-center py-8
//                     gap-2"
//                 >
//                   <span className="text-3xl">💳</span>
//                   <p className="text-gray-300 text-xs">No recharges yet</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Recent Withdrawals */}
//         {["superAdmin", "merchantAdmin"].includes(user?.role) && (
//           <div
//             className="bg-white rounded-2xl overflow-hidden"
//             style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//           >
//             <div
//               className="flex items-center justify-between
//               px-5 py-4 border-b border-gray-100"
//             >
//               <p className="font-bold text-sm text-gray-800">
//                 Recent Withdrawals
//               </p>
//               <button
//                 onClick={() => navigate("/merchants/withdrawals")}
//                 className="text-xs font-semibold"
//                 style={{ color: "#f02d65" }}
//               >
//                 View All →
//               </button>
//             </div>
//             <div className="divide-y divide-gray-50">
//               {recentWithdrawals?.withdrawals?.length > 0 ? (
//                 recentWithdrawals.withdrawals.map((w, i) => (
//                   <div
//                     key={w._id || i}
//                     className="flex items-center gap-3 px-5 py-3"
//                   >
//                     <div
//                       className="w-8 h-8 rounded-full
//                       flex items-center justify-center flex-shrink-0
//                       text-sm"
//                       style={{ background: "#fee2e2" }}
//                     >
//                       💸
//                     </div>
//                     <div className="flex-1 min-w-0">
//                       <p
//                         className="text-gray-700 text-xs font-semibold
//                         truncate"
//                       >
//                         {w.merchant?.storeName || "Unknown"}
//                       </p>
//                       <p className="text-gray-400 text-[10px]">
//                         {w.extractType}
//                       </p>
//                     </div>
//                     <div className="text-right flex-shrink-0">
//                       <p className="text-red-500 text-xs font-bold">
//                         -${w.extractPrice?.toFixed(2)}
//                       </p>
//                       {statusBadge(w.status)}
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div
//                   className="flex flex-col items-center py-8
//                     gap-2"
//                 >
//                   <span className="text-3xl">💸</span>
//                   <p className="text-gray-300 text-xs">No withdrawals yet</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Recent Orders */}
//         <div
//           className="bg-white rounded-2xl overflow-hidden"
//           style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//         >
//           <div
//             className="flex items-center justify-between
//             px-5 py-4 border-b border-gray-100"
//           >
//             <p className="font-bold text-sm text-gray-800">Recent Orders</p>
//             <button
//               onClick={() => navigate("/orders")}
//               className="text-xs font-semibold"
//               style={{ color: "#f02d65" }}
//             >
//               View All →
//             </button>
//           </div>
//           <div className="divide-y divide-gray-50">
//             {recentOrders?.orders?.length > 0 ? (
//               recentOrders.orders.map((o, i) => (
//                 <div
//                   key={o._id || i}
//                   className="flex items-center gap-3 px-5 py-3"
//                 >
//                   <div
//                     className="w-8 h-8 rounded-lg bg-gray-100
//                     overflow-hidden flex-shrink-0 flex items-center
//                     justify-center text-sm"
//                   >
//                     {o.products?.[0]?.image ? (
//                       <img
//                         src={o.products[0].image}
//                         alt=""
//                         className="w-full h-full object-cover"
//                       />
//                     ) : (
//                       "📦"
//                     )}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p
//                       className="text-gray-700 text-xs font-semibold
//                       truncate"
//                     >
//                       {o.products?.[0]?.title || "Product"}
//                     </p>
//                     <p className="text-gray-400 text-[10px]">
//                       #{o.orderSn?.slice(-8)}
//                     </p>
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     <p className="text-gray-700 text-xs font-bold">
//                       ${o.totalAmount?.toFixed(2)}
//                     </p>
//                     {statusBadge(o.status)}
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div
//                 className="flex flex-col items-center py-8
//                   gap-2"
//               >
//                 <span className="text-3xl">📦</span>
//                 <p className="text-gray-300 text-xs">No orders yet</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// frontend-admin/src/pages/dashboard/Dashboard.jsx
//
// UPDATED: Now handles both superAdmin and merchantAdmin with role-scoped data.
//
// BACKEND ENDPOINTS USED:
//
// superAdmin:
//   GET /auth/admin/stats      → full system stats (registrations, stores, recharge, etc.)
//   GET /transactions/admin-statements?days=7  → 7-day finance chart
//   GET /recharge?limit=5      → recent recharges
//   GET /withdrawal?limit=5    → recent withdrawals (auto-scoped by backend for merchantAdmin)
//   GET /orders?limit=5        → recent orders
//
// merchantAdmin:
//   GET /merchants/my-stats    → NEW: scoped stats (their referred merchants only)
//                                    returns: totalMerchants, activeMerchants, pendingMerchants,
//                                    frozenMerchants, totalWithdrawals, pendingWithdrawals,
//                                    totalBalance, totalProfit, recentMerchants, recentWithdrawals
//   GET /withdrawal?limit=5    → recent withdrawals (auto-scoped to referred merchants)
//   GET /orders?limit=5        → recent orders (scoped by backend)

////////////////////////// ========================== second verion ===========================/////////////////////

// import { useQuery } from "@tanstack/react-query";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import API from "../../axios";

// // ─── Reusable stat card ───────────────────────────────────────
// const StatCard = ({
//   label,
//   icon,
//   color,
//   today,
//   yesterday,
//   month,
//   lastMonth,
//   onClick,
// }) => (
//   <div
//     className={`bg-white rounded-2xl p-5 flex flex-col gap-3
//       ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
//     style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//     onClick={onClick}
//   >
//     <div className="flex items-center justify-between">
//       <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">
//         {label}
//       </p>
//       <div
//         className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
//         style={{ background: color + "18" }}
//       >
//         {icon}
//       </div>
//     </div>
//     <div>
//       <p className="text-gray-400 text-[10px] mb-0.5">Today / Total</p>
//       <p className="text-2xl font-extrabold text-gray-800 leading-none tracking-tight">
//         {today}
//       </p>
//     </div>
//     <div className="h-px bg-gray-100" />
//     <div className="grid grid-cols-3 gap-2">
//       {[
//         { lbl: "Yesterday", val: yesterday },
//         { lbl: "This Month", val: month },
//         { lbl: "Last Month", val: lastMonth },
//       ].map((s, i) => (
//         <div key={i}>
//           <p className="text-gray-400 text-[9px] mb-0.5">{s.lbl}</p>
//           <p className="text-gray-700 text-xs font-bold">{s.val}</p>
//         </div>
//       ))}
//     </div>
//   </div>
// );

// // Big summary card (for merchantAdmin)
// const SummaryCard = ({ label, icon, value, color, sub, onClick }) => (
//   <div
//     className={`bg-white rounded-2xl p-5 flex items-center gap-4
//       ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}
//     style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//     onClick={onClick}
//   >
//     <div
//       className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
//       style={{ background: color + "18" }}
//     >
//       {icon}
//     </div>
//     <div className="flex-1 min-w-0">
//       <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide">
//         {label}
//       </p>
//       <p className="text-xl font-extrabold text-gray-800 mt-0.5">{value}</p>
//       {sub && <p className="text-gray-400 text-[10px] mt-0.5">{sub}</p>}
//     </div>
//   </div>
// );

// // Chart tooltip
// const ChartTooltip = ({ active, payload, label, prefix = "$" }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <div
//       className="bg-white px-3 py-2 rounded-xl text-xs"
//       style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
//     >
//       <p className="text-gray-400 mb-1">{label}</p>
//       {payload.map((p, i) => (
//         <p key={i} className="font-bold" style={{ color: p.color }}>
//           {p.name}: {prefix}
//           {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
//         </p>
//       ))}
//     </div>
//   );
// };

// // Status badge helper
// const statusBadge = (status) => {
//   const map = {
//     pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
//     underReview: { bg: "#fef3c7", text: "#92400e", label: "Reviewing" },
//     approved: { bg: "#dcfce7", text: "#166534", label: "Approved" },
//     rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
//     completed: { bg: "#dbeafe", text: "#1e40af", label: "Completed" },
//     withdrawn: { bg: "#dcfce7", text: "#166534", label: "Withdrawn" },
//     cancelled: { bg: "#fee2e2", text: "#991b1b", label: "Cancelled" },
//     shipped: { bg: "#e0e7ff", text: "#3730a3", label: "Shipped" },
//   };
//   const s = map[status] || { bg: "#f3f4f6", text: "#6b7280", label: status };
//   return (
//     <span
//       className="px-2 py-0.5 rounded-full text-[10px] font-bold"
//       style={{ background: s.bg, color: s.text }}
//     >
//       {s.label}
//     </span>
//   );
// };

// export default function Dashboard() {
//   const { user } = useSelector((s) => s.auth);
//   const navigate = useNavigate();
//   const isSuperAdmin = user?.role === "superAdmin";
//   const isMerchantAdmin = user?.role === "merchantAdmin";

//   // ── superAdmin: full system stats ──────────────────────────
//   // GET /auth/admin/stats (all roles can call, but shows system-wide numbers)
//   const { data: statsData, isLoading: statsLoading } = useQuery({
//     queryKey: ["dashboardStats"],
//     queryFn: async () => {
//       const { data } = await API.get("/auth/admin/stats");
//       return data;
//     },
//     enabled: isSuperAdmin,
//     refetchInterval: 60000,
//   });

//   // ── merchantAdmin: scoped stats ────────────────────────────
//   // GET /merchants/my-stats (new backend route, merchantAdmin only)
//   const { data: myStats, isLoading: myStatsLoading } = useQuery({
//     queryKey: ["merchantAdminStats"],
//     queryFn: async () => {
//       const { data } = await API.get("/merchants/my-stats");
//       return data;
//     },
//     enabled: isMerchantAdmin,
//     refetchInterval: 60000,
//   });

//   // ── Finance chart (superAdmin only, 7-day breakdown) ───────
//   // GET /transactions/admin-statements?days=7
//   const { data: financeChart } = useQuery({
//     queryKey: ["financeChart"],
//     queryFn: async () => {
//       const { data } = await API.get("/transactions/admin-statements?days=7");
//       return data;
//     },
//     enabled: isSuperAdmin,
//   });

//   // ── Recent recharges (superAdmin only) ─────────────────────
//   const { data: recentRecharges } = useQuery({
//     queryKey: ["recentRecharges"],
//     queryFn: async () => {
//       const { data } = await API.get("/recharge?limit=5");
//       return data;
//     },
//     enabled: isSuperAdmin,
//   });

//   // ── Recent withdrawals (both roles — backend auto-scopes) ──
//   const { data: recentWithdrawals } = useQuery({
//     queryKey: ["recentWithdrawals"],
//     queryFn: async () => {
//       const { data } = await API.get("/withdrawal?limit=5");
//       return data;
//     },
//     enabled: isSuperAdmin || isMerchantAdmin,
//   });

//   // ── Recent orders (both roles) ─────────────────────────────
//   const { data: recentOrders } = useQuery({
//     queryKey: ["recentOrdersAdmin"],
//     queryFn: async () => {
//       const { data } = await API.get("/orders?limit=5");
//       return data;
//     },
//   });

//   // ── Chart data fallback ────────────────────────────────────
//   const chartData = financeChart?.data || [
//     { date: "Mon", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Tue", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Wed", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Thu", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Fri", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Sat", recharge: 0, withdrawal: 0, profit: 0 },
//     { date: "Sun", recharge: 0, withdrawal: 0, profit: 0 },
//   ];

//   // ── superAdmin: stat cards ─────────────────────────────────
//   const stats = statsData || {};
//   const superAdminCards = [
//     {
//       label: "Total Registrations",
//       icon: "👥",
//       color: "#6366f1",
//       today: stats.registrations?.today ?? 0,
//       yesterday: stats.registrations?.yesterday ?? 0,
//       month: stats.registrations?.month ?? 0,
//       lastMonth: stats.registrations?.lastMonth ?? 0,
//     },
//     {
//       label: "Store Registrations",
//       icon: "🏪",
//       color: "#f02d65",
//       today: stats.stores?.today ?? 0,
//       yesterday: stats.stores?.yesterday ?? 0,
//       month: stats.stores?.month ?? 0,
//       lastMonth: stats.stores?.lastMonth ?? 0,
//     },
//     {
//       label: "Total Recharge",
//       icon: "💳",
//       color: "#22c55e",
//       today: `$${(stats.recharge?.today || 0).toFixed(2)}`,
//       yesterday: `$${(stats.recharge?.yesterday || 0).toFixed(2)}`,
//       month: `$${(stats.recharge?.month || 0).toFixed(2)}`,
//       lastMonth: `$${(stats.recharge?.lastMonth || 0).toFixed(2)}`,
//       onClick: () => navigate("/merchants/recharges"),
//     },
//     {
//       label: "Total Withdrawals",
//       icon: "💸",
//       color: "#f59e0b",
//       today: `$${(stats.withdrawal?.today || 0).toFixed(2)}`,
//       yesterday: `$${(stats.withdrawal?.yesterday || 0).toFixed(2)}`,
//       month: `$${(stats.withdrawal?.month || 0).toFixed(2)}`,
//       lastMonth: `$${(stats.withdrawal?.lastMonth || 0).toFixed(2)}`,
//       onClick: () => navigate("/merchants/withdrawals"),
//     },
//     {
//       label: "Recharge Count",
//       icon: "🔢",
//       color: "#06b6d4",
//       today: stats.rechargeCount?.today ?? 0,
//       yesterday: stats.rechargeCount?.yesterday ?? 0,
//       month: stats.rechargeCount?.month ?? 0,
//       lastMonth: stats.rechargeCount?.lastMonth ?? 0,
//     },
//     {
//       label: "Total Profit",
//       icon: "📈",
//       color: "#8b5cf6",
//       today: `$${(stats.profit?.today || 0).toFixed(2)}`,
//       yesterday: `$${(stats.profit?.yesterday || 0).toFixed(2)}`,
//       month: `$${(stats.profit?.month || 0).toFixed(2)}`,
//       lastMonth: `$${(stats.profit?.lastMonth || 0).toFixed(2)}`,
//     },
//   ];

//   // ── Order pie data (superAdmin) ────────────────────────────
//   const orderPieData = [
//     {
//       name: "Completed",
//       value: stats.orders?.completed || 0,
//       color: "#22c55e",
//     },
//     { name: "Pending", value: stats.orders?.pending || 0, color: "#f59e0b" },
//     { name: "Shipped", value: stats.orders?.shipped || 0, color: "#6366f1" },
//     {
//       name: "Cancelled",
//       value: stats.orders?.cancelled || 0,
//       color: "#ef4444",
//     },
//   ];

//   const isLoading = isSuperAdmin ? statsLoading : myStatsLoading;

//   if (isLoading)
//     return (
//       <div className="flex items-center justify-center h-64">
//         <svg
//           className="animate-spin h-8 w-8"
//           style={{ color: "#f02d65" }}
//           fill="none"
//           viewBox="0 0 24 24"
//         >
//           <circle
//             className="opacity-25"
//             cx="12"
//             cy="12"
//             r="10"
//             stroke="currentColor"
//             strokeWidth="4"
//           />
//           <path
//             className="opacity-75"
//             fill="currentColor"
//             d="M4 12a8 8 0 018-8v8H4z"
//           />
//         </svg>
//       </div>
//     );

//   return (
//     <div className="space-y-6">
//       {/* ── Page header ── */}
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-xl font-extrabold text-gray-800 tracking-tight">
//             Dashboard
//           </h1>
//           <p className="text-gray-400 text-sm mt-0.5">
//             Welcome back, {user?.username} 👋
//           </p>
//         </div>
//         <div className="text-xs text-gray-400">
//           {new Date().toLocaleDateString("en-US", {
//             weekday: "long",
//             year: "numeric",
//             month: "long",
//             day: "numeric",
//           })}
//         </div>
//       </div>

//       {/* ══════════════════════════════════════════════════════
//           superAdmin VIEW
//       ══════════════════════════════════════════════════════ */}
//       {isSuperAdmin && (
//         <>
//           {/* Stat cards grid */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {superAdminCards.map((card, i) => (
//               <StatCard key={i} {...card} />
//             ))}
//           </div>

//           {/* Charts row */}
//           <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
//             {/* Area chart — 7-day finance */}
//             <div
//               className="xl:col-span-2 bg-white rounded-2xl p-5"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="flex items-center justify-between mb-5">
//                 <div>
//                   <p className="text-gray-800 font-bold text-sm">
//                     Financial Overview
//                   </p>
//                   <p className="text-gray-400 text-xs mt-0.5">
//                     Last 7 days — Recharge vs Withdrawal vs Profit
//                   </p>
//                 </div>
//                 <div className="hidden sm:flex items-center gap-4">
//                   {[
//                     { color: "#22c55e", label: "Recharge" },
//                     { color: "#f02d65", label: "Withdrawal" },
//                     { color: "#6366f1", label: "Profit" },
//                   ].map((l) => (
//                     <div key={l.label} className="flex items-center gap-1.5">
//                       <div
//                         className="w-2.5 h-2.5 rounded-full"
//                         style={{ background: l.color }}
//                       />
//                       <span className="text-gray-500 text-[11px]">
//                         {l.label}
//                       </span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <ResponsiveContainer width="100%" height={220}>
//                 <AreaChart data={chartData}>
//                   <defs>
//                     {[
//                       { id: "recharge", color: "#22c55e" },
//                       { id: "withdrawal", color: "#f02d65" },
//                       { id: "profit", color: "#6366f1" },
//                     ].map((g) => (
//                       <linearGradient
//                         key={g.id}
//                         id={g.id}
//                         x1="0"
//                         y1="0"
//                         x2="0"
//                         y2="1"
//                       >
//                         <stop
//                           offset="5%"
//                           stopColor={g.color}
//                           stopOpacity={0.15}
//                         />
//                         <stop
//                           offset="95%"
//                           stopColor={g.color}
//                           stopOpacity={0}
//                         />
//                       </linearGradient>
//                     ))}
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="date"
//                     tick={{ fontSize: 11, fill: "#9ca3af" }}
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <YAxis
//                     tick={{ fontSize: 11, fill: "#9ca3af" }}
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <Tooltip content={<ChartTooltip />} />
//                   <Area
//                     type="monotone"
//                     dataKey="recharge"
//                     name="Recharge"
//                     stroke="#22c55e"
//                     fill="url(#recharge)"
//                     strokeWidth={2}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="withdrawal"
//                     name="Withdrawal"
//                     stroke="#f02d65"
//                     fill="url(#withdrawal)"
//                     strokeWidth={2}
//                   />
//                   <Area
//                     type="monotone"
//                     dataKey="profit"
//                     name="Profit"
//                     stroke="#6366f1"
//                     fill="url(#profit)"
//                     strokeWidth={2}
//                   />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>

//             {/* Pie chart — order statuses */}
//             <div
//               className="bg-white rounded-2xl p-5"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <p className="text-gray-800 font-bold text-sm mb-1">
//                 Order Status
//               </p>
//               <p className="text-gray-400 text-xs mb-4">All time breakdown</p>
//               <ResponsiveContainer width="100%" height={160}>
//                 <PieChart>
//                   <Pie
//                     data={orderPieData}
//                     cx="50%"
//                     cy="50%"
//                     innerRadius={45}
//                     outerRadius={70}
//                     paddingAngle={3}
//                     dataKey="value"
//                   >
//                     {orderPieData.map((e, i) => (
//                       <Cell key={i} fill={e.color} />
//                     ))}
//                   </Pie>
//                   <Tooltip formatter={(v) => [v.toLocaleString(), ""]} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <div className="grid grid-cols-2 gap-2 mt-3">
//                 {orderPieData.map((d) => (
//                   <div key={d.name} className="flex items-center gap-1.5">
//                     <div
//                       className="w-2 h-2 rounded-full flex-shrink-0"
//                       style={{ background: d.color }}
//                     />
//                     <div>
//                       <p className="text-[9px] text-gray-400">{d.name}</p>
//                       <p className="text-xs font-bold text-gray-700">
//                         {d.value.toLocaleString()}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Recent data tables */}
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//             {/* Recent recharges */}
//             <div
//               className="bg-white rounded-2xl overflow-hidden"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//                 <p className="text-gray-800 font-bold text-sm">
//                   Recent Recharges
//                 </p>
//                 <button
//                   onClick={() => navigate("/merchants/recharges")}
//                   className="text-pink-500 text-xs font-semibold hover:underline"
//                 >
//                   View all →
//                 </button>
//               </div>
//               <div className="divide-y divide-gray-50">
//                 {(recentRecharges?.recharges || []).slice(0, 5).map((r) => (
//                   <div
//                     key={r._id}
//                     className="flex items-center justify-between px-5 py-3"
//                   >
//                     <div>
//                       <p className="text-gray-700 text-xs font-semibold">
//                         {r.merchant?.storeName || "—"}
//                       </p>
//                       <p className="text-gray-400 text-[10px]">
//                         {r.rechargeId}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-green-600 font-bold text-sm">
//                         +${(r.price || 0).toFixed(2)}
//                       </span>
//                       {statusBadge(r.status)}
//                     </div>
//                   </div>
//                 ))}
//                 {!recentRecharges?.recharges?.length && (
//                   <div className="px-5 py-8 text-center text-gray-400 text-xs">
//                     No recent recharges
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Recent orders */}
//             <div
//               className="bg-white rounded-2xl overflow-hidden"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//                 <p className="text-gray-800 font-bold text-sm">Recent Orders</p>
//                 <button
//                   onClick={() => navigate("/orders")}
//                   className="text-pink-500 text-xs font-semibold hover:underline"
//                 >
//                   View all →
//                 </button>
//               </div>
//               <div className="divide-y divide-gray-50">
//                 {(recentOrders?.orders || []).slice(0, 5).map((o) => (
//                   <div
//                     key={o._id}
//                     className="flex items-center justify-between px-5 py-3"
//                   >
//                     <div>
//                       <p className="text-gray-700 text-xs font-semibold truncate max-w-[140px]">
//                         {o.merchant?.storeName || "—"}
//                       </p>
//                       <p className="text-gray-400 text-[10px] font-mono">
//                         {o.orderSn}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-gray-700 text-sm font-bold">
//                         ${(o.totalAmount || 0).toFixed(2)}
//                       </span>
//                       {statusBadge(o.status)}
//                     </div>
//                   </div>
//                 ))}
//                 {!recentOrders?.orders?.length && (
//                   <div className="px-5 py-8 text-center text-gray-400 text-xs">
//                     No recent orders
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* ══════════════════════════════════════════════════════
//           merchantAdmin VIEW
//       ══════════════════════════════════════════════════════ */}
//       {isMerchantAdmin && myStats && (
//         <>
//           {/* Summary cards — merchant counts */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//             <SummaryCard
//               label="Total Merchants"
//               icon="🏪"
//               color="#6366f1"
//               value={myStats.totalMerchants}
//               sub="Merchants you referred"
//               onClick={() => navigate("/merchants")}
//             />
//             <SummaryCard
//               label="Active Stores"
//               icon="✅"
//               color="#22c55e"
//               value={myStats.activeMerchants}
//               sub="Status: approved"
//               onClick={() => navigate("/merchants")}
//             />
//             <SummaryCard
//               label="Pending Approval"
//               icon="⏳"
//               color="#f59e0b"
//               value={myStats.pendingMerchants}
//               sub="Awaiting review"
//               onClick={() => navigate("/merchants")}
//             />
//             <SummaryCard
//               label="Frozen"
//               icon="🧊"
//               color="#9ca3af"
//               value={myStats.frozenMerchants}
//               sub="Suspended accounts"
//             />
//           </div>

//           {/* Financial summary cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <SummaryCard
//               label="Total Balance"
//               icon="💰"
//               color="#f02d65"
//               value={`$${(myStats.totalBalance || 0).toFixed(2)}`}
//               sub="Sum of all merchant wallets"
//             />
//             <SummaryCard
//               label="Total Profit"
//               icon="📈"
//               color="#8b5cf6"
//               value={`$${(myStats.totalProfit || 0).toFixed(2)}`}
//               sub="All-time earned profit"
//             />
//             <SummaryCard
//               label="Total Withdrawn"
//               icon="💸"
//               color="#f59e0b"
//               value={`$${(myStats.totalWithdrawals || 0).toFixed(2)}`}
//               sub="Approved withdrawals"
//               onClick={() => navigate("/merchants/withdrawals")}
//             />
//             <SummaryCard
//               label="Pending Withdrawals"
//               icon="🔔"
//               color="#ef4444"
//               value={myStats.pendingWithdrawals}
//               sub="Awaiting your action"
//               onClick={() => navigate("/merchants/withdrawals")}
//             />
//           </div>

//           {/* Pending withdrawals alert banner */}
//           {myStats.pendingWithdrawals > 0 && (
//             <div
//               className="flex items-center justify-between p-4 rounded-2xl cursor-pointer
//                 hover:scale-[1.01] transition-transform"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//                 boxShadow: "0 4px 20px rgba(240,45,101,0.3)",
//               }}
//               onClick={() => navigate("/merchants/withdrawals")}
//             >
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">
//                   🔔
//                 </div>
//                 <div>
//                   <p className="text-white font-bold text-sm">
//                     {myStats.pendingWithdrawals} Withdrawal
//                     {myStats.pendingWithdrawals > 1 ? "s" : ""} Pending
//                   </p>
//                   <p className="text-white/70 text-xs">
//                     Merchants are waiting for withdrawal approval or
//                     cancellation
//                   </p>
//                 </div>
//               </div>
//               <span className="text-white font-bold text-sm">Review →</span>
//             </div>
//           )}

//           {/* Bar chart: merchant balances (top 7 from recentMerchants) */}
//           {(myStats.recentMerchants || []).length > 0 && (
//             <div
//               className="bg-white rounded-2xl p-5"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <p className="text-gray-800 font-bold text-sm mb-1">
//                 Recent Merchant Registrations
//               </p>
//               <p className="text-gray-400 text-xs mb-4">
//                 Latest 5 referred stores
//               </p>
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart
//                   data={myStats.recentMerchants.map((m) => ({
//                     name:
//                       m.storeName.length > 10
//                         ? m.storeName.slice(0, 10) + "…"
//                         : m.storeName,
//                     balance: m.balance || 0,
//                   }))}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis
//                     dataKey="name"
//                     tick={{ fontSize: 10, fill: "#9ca3af" }}
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <YAxis
//                     tick={{ fontSize: 10, fill: "#9ca3af" }}
//                     axisLine={false}
//                     tickLine={false}
//                   />
//                   <Tooltip content={<ChartTooltip />} />
//                   <Bar
//                     dataKey="balance"
//                     name="Balance"
//                     fill="#6366f1"
//                     radius={[6, 6, 0, 0]}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           )}

//           {/* Recent tables */}
//           <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
//             {/* Recent merchants */}
//             <div
//               className="bg-white rounded-2xl overflow-hidden"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//                 <p className="text-gray-800 font-bold text-sm">
//                   Recent Merchants
//                 </p>
//                 <button
//                   onClick={() => navigate("/merchants")}
//                   className="text-pink-500 text-xs font-semibold hover:underline"
//                 >
//                   View all →
//                 </button>
//               </div>
//               <div className="divide-y divide-gray-50">
//                 {(myStats.recentMerchants || []).map((m) => (
//                   <div
//                     key={m._id}
//                     className="flex items-center justify-between px-5 py-3"
//                   >
//                     <div>
//                       <p className="text-gray-700 text-xs font-semibold">
//                         {m.storeName}
//                       </p>
//                       <p className="text-gray-400 text-[10px] font-mono">
//                         {m.merchantId}
//                       </p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-gray-800 text-xs font-bold">
//                         VIP{m.vipLevel}
//                       </span>
//                       {statusBadge(m.status)}
//                     </div>
//                   </div>
//                 ))}
//                 {!myStats.recentMerchants?.length && (
//                   <div className="px-5 py-8 text-center text-gray-400 text-xs">
//                     No merchants yet
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Recent withdrawals */}
//             <div
//               className="bg-white rounded-2xl overflow-hidden"
//               style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//             >
//               <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//                 <p className="text-gray-800 font-bold text-sm">
//                   Recent Withdrawals
//                 </p>
//                 <button
//                   onClick={() => navigate("/merchants/withdrawals")}
//                   className="text-pink-500 text-xs font-semibold hover:underline"
//                 >
//                   View all →
//                 </button>
//               </div>
//               <div className="divide-y divide-gray-50">
//                 {(
//                   myStats.recentWithdrawals ||
//                   recentWithdrawals?.withdrawals ||
//                   []
//                 )
//                   .slice(0, 5)
//                   .map((w) => (
//                     <div
//                       key={w._id}
//                       className="flex items-center justify-between px-5 py-3"
//                     >
//                       <div>
//                         <p className="text-gray-700 text-xs font-semibold">
//                           {w.merchant?.storeName || "—"}
//                         </p>
//                         <p className="text-gray-400 text-[10px] font-mono">
//                           {w.extractSn}
//                         </p>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         <span className="text-orange-500 font-bold text-sm">
//                           ${(w.extractPrice || 0).toFixed(2)}
//                         </span>
//                         {statusBadge(w.status)}
//                       </div>
//                     </div>
//                   ))}
//                 {!myStats.recentWithdrawals?.length &&
//                   !recentWithdrawals?.withdrawals?.length && (
//                     <div className="px-5 py-8 text-center text-gray-400 text-xs">
//                       No recent withdrawals
//                     </div>
//                   )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* dispatchAdmin view */}
//       {user?.role === "dispatchAdmin" && (
//         <div className="space-y-4">
//           <div
//             className="bg-white rounded-2xl p-8 text-center"
//             style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//           >
//             <span className="text-6xl block mb-4">📦</span>
//             <p className="text-gray-800 font-bold text-lg mb-1">
//               Dispatch Dashboard
//             </p>
//             <p className="text-gray-400 text-sm">
//               Head to Order List to dispatch orders to merchants.
//             </p>
//             <button
//               onClick={() => navigate("/orders")}
//               className="mt-5 px-6 py-3 rounded-xl text-white font-bold text-sm
//                 hover:scale-105 active:scale-95 transition-all"
//               style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//             >
//               Go to Order List →
//             </button>
//           </div>

//           {/* Recent orders for dispatchAdmin */}
//           <div
//             className="bg-white rounded-2xl overflow-hidden"
//             style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//           >
//             <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
//               <p className="text-gray-800 font-bold text-sm">Recent Orders</p>
//               <button
//                 onClick={() => navigate("/orders")}
//                 className="text-pink-500 text-xs font-semibold hover:underline"
//               >
//                 View all →
//               </button>
//             </div>
//             <div className="divide-y divide-gray-50">
//               {(recentOrders?.orders || []).slice(0, 5).map((o) => (
//                 <div
//                   key={o._id}
//                   className="flex items-center justify-between px-5 py-3"
//                 >
//                   <div>
//                     <p className="text-gray-700 text-xs font-semibold truncate max-w-[140px]">
//                       {o.merchant?.storeName || "—"}
//                     </p>
//                     <p className="text-gray-400 text-[10px] font-mono">
//                       {o.orderSn}
//                     </p>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <span className="text-gray-700 text-sm font-bold">
//                       ${(o.totalAmount || 0).toFixed(2)}
//                     </span>
//                     {statusBadge(o.status)}
//                   </div>
//                 </div>
//               ))}
//               {!recentOrders?.orders?.length && (
//                 <div className="px-5 py-8 text-center text-gray-400 text-xs">
//                   No recent orders
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

///////////////////////////================================ third version (notebookLM) ===================//////////////////
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
// import axios from "../../axios";
import { Loader2, RefreshCcw } from "lucide-react";
import axios from "axios";

// ── Reusable Metric Card Component (SaaS Styled) ──
const MetricBlock = ({ title, bgColor, children }) => (
  <div
    style={{ padding: "15px" }}
    className={`rounded-sm text-white text-lg ${bgColor} flex flex-col h-[140px] relative overflow-hidden shadow-sm transition-transform hover:-translate-y-1`}
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-[14px] font-bold tracking-wide opacity-95">
        {title}
      </h3>
      <span
        style={{ padding: "2px 6px" }}
        className="bg-black/20 text-[10px] font-bold rounded-sm tracking-wider uppercase"
      >
        Real-time
      </span>
    </div>
    <div className="mt-auto flex items-end gap-6 overflow-x-auto custom-scrollbar no-scrollbar">
      {children}
    </div>
  </div>
);

// Helpers
const formatNum = (num) => Number(num || 0).toLocaleString();
const formatCur = (num) => Number(num || 0).toFixed(2);

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // const fetchStats = async () => {
  //   setLoading(true);
  //   try {
  //     // NOTE: Ensure your backend auth.route.js is saved and server restarted!
  //     const endpoint =
  //       user?.role === "merchantAdmin"
  //         ? "/merchants/my-stats"
  //         : "/auth/admin/stats";
  //     const res = await axios.get(endpoint);
  //     setStats(res.data);
  //   } catch (err) {
  //     console.error("Failed to fetch dashboard stats", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const endpoint =
        user?.role === "merchantAdmin"
          ? "/merchants/my-stats"
          : "/auth/admin/stats";
      const res = await axios.get(endpoint);
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      // TEMPORARY FIX: Provide empty stats instead of crashing
      setStats({});
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, [user]);

  // Demo colors explicitly matched to screenshot
  const colors = {
    blue: "bg-blue-500",
    teal: "bg-teal-400",
    purple: "bg-indigo-400",
    green: "bg-emerald-400",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-gray-500 text-[13px] font-medium">
          Loading platform statistics...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }} className="w-full bg-gray-50 min-h-screen">
      {/* ── HEADER SECTION ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Platform Dashboard
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Real-time statistical data, reports, and system overviews.
          </p>
        </div>
        <button
          style={{ padding: "8px 16px" }}
          onClick={fetchStats}
          className="bg-white border border-gray-200 text-gray-700 rounded-sm text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* ── TABS ── */}
      <div
        style={{ marginTop: "10px", marginBottom: "10px" }}
        className="flex gap-2  mb-6"
      >
        <div
          style={{ padding: "8px 24px" }}
          className="bg-slate-800 text-white text-[13px] font-bold rounded-t-sm shadow-sm cursor-default"
        >
          Overview
        </div>
        <div
          style={{ padding: "8px 24px" }}
          className="bg-white border-t border-l border-r border-gray-200 text-gray-500 text-[13px] font-bold hover:bg-gray-50 cursor-pointer rounded-t-sm transition-colors"
        >
          Custom Reports
        </div>
      </div>

      {/* ── DATA BLOCKS GRID ── */}
      {user?.role !== "merchantAdmin" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* ROW 1: Registrations & Stores */}
          <MetricBlock title="Total Registrations" bgColor={colors.blue}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              {formatNum(
                stats?.registrations?.total || stats?.registrations?.month,
              )}
            </div>
          </MetricBlock>

          <MetricBlock title="User Registration" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.registrations?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.registrations?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yesterday
              </div>
            </div>
          </MetricBlock>

          <MetricBlock
            title="Total Store Registrations"
            bgColor={colors.purple}
          >
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              {formatNum(stats?.stores?.total || stats?.stores?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Store Registration" bgColor={colors.green}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.stores?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.stores?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.stores?.month)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Month
              </div>
            </div>
          </MetricBlock>

          {/* ROW 2: Financials */}
          <MetricBlock title="Total Recharge" bgColor={colors.blue}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.recharge?.total || stats?.recharge?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Recharge Volumes" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.recharge?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black leading-none mb-1">
                ${formatCur(stats?.recharge?.yesterday)}
              </div>
              <div className="text-[10px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black leading-none mb-1">
                ${formatCur(stats?.recharge?.month)}
              </div>
              <div className="text-[10px] font-medium opacity-90 uppercase tracking-wider">
                Month
              </div>
            </div>
          </MetricBlock>

          <MetricBlock title="Total Withdrawals" bgColor={colors.purple}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.withdrawal?.total || stats?.withdrawal?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Withdrawal Volumes" bgColor={colors.green}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.withdrawal?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.withdrawal?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.withdrawal?.month)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Month
              </div>
            </div>
          </MetricBlock>

          {/* ROW 3: Counts & Profits */}
          <MetricBlock title="Recharge Frequency" bgColor={colors.blue}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.rechargeCount?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Recharge
                <br />
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.rechargeCount?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Recharge
                <br />
                Yest.
              </div>
            </div>
          </MetricBlock>

          <MetricBlock title="User Activity" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.rechargeCount?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Rechargers
                <br />
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">0</div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Withdrawers
                <br />
                Today
              </div>
            </div>
          </MetricBlock>

          <MetricBlock title="Total Profit" bgColor={colors.purple}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.profit?.total || stats?.profit?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Profit Breakdown" bgColor={colors.green}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.profit?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.profit?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
          </MetricBlock>
        </div>
      ) : (
        /* ── Merchant Admin Fallback View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricBlock title="Total Referred Merchants" bgColor={colors.blue}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              {formatNum(stats?.totalMerchants)}
            </div>
          </MetricBlock>
          <MetricBlock title="Store Statuses" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.activeMerchants)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Active
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.pendingMerchants)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Pending
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.frozenMerchants)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Frozen
              </div>
            </div>
          </MetricBlock>
          <MetricBlock title="Total Store Balance" bgColor={colors.purple}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.totalBalance)}
            </div>
          </MetricBlock>
          <MetricBlock title="Total Earned Profit" bgColor={colors.green}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.totalProfit)}
            </div>
          </MetricBlock>
        </div>
      )}
    </div>
  );
}
