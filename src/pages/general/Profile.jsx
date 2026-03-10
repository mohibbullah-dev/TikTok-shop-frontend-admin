// frontend-admin/src/pages/general/Profile.jsx
//
// WHAT THIS PAGE IS:
//   The logged-in admin's own profile page.
//   Displays their account info from the auth state.
//   All admin roles can view: superAdmin, merchantAdmin, dispatchAdmin.
//
// VERIFIED BACKEND ENDPOINT:
//   GET /api/auth/me  → { user, merchant }
//   user fields: username, email, mobile, nickname, avatar, role
//               invitationCode (merchantAdmin only), isActive, isFrozen
//               customerServiceLink, language, lastLogin, createdAt
//   merchant = null for admin roles (only populated for merchant role)
//
// NOTE: There is NO update endpoint for admin profile in the backend.
//   The profile is READ-ONLY display only.
//   If password change is needed, it would be a separate future endpoint.
//
// REDUX: useSelector(s => s.auth) → { user, token }
//   The user object from Redux auth state is the same data from login response
//   so we use that directly — no need to call /api/auth/me again unless
//   we need fresh data.

// import { useSelector } from "react-redux";

// // ─── Role config ─────────────────────────────────────────────
// const ROLE_CFG = {
//   superAdmin: {
//     label: "Super Admin",
//     color: "#f02d65",
//     bg: "#fdf2f8",
//     icon: "👑",
//   },
//   merchantAdmin: {
//     label: "Merchant Admin",
//     color: "#6366f1",
//     bg: "#f0f0ff",
//     icon: "🏪",
//   },
//   dispatchAdmin: {
//     label: "Dispatch Admin",
//     color: "#0ea5e9",
//     bg: "#f0f9ff",
//     icon: "📦",
//   },
//   merchant: { label: "Merchant", color: "#22c55e", bg: "#f0fdf4", icon: "🛒" },
// };

// const getRoleCfg = (role) =>
//   ROLE_CFG[role] || {
//     label: role,
//     color: "#6b7280",
//     bg: "#f3f4f6",
//     icon: "👤",
//   };

// // ─── Atoms ────────────────────────────────────────────────────
// const InfoCard = ({ title, icon, children }) => (
//   <div
//     className="bg-white rounded-2xl overflow-hidden"
//     style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//   >
//     <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
//       <span className="text-base">{icon}</span>
//       <h3 className="font-bold text-gray-700 text-sm">{title}</h3>
//     </div>
//     <div className="px-6 py-2">{children}</div>
//   </div>
// );

// const Row = ({ label, value, mono, badge, badgeColor, badgeBg }) => (
//   <div
//     className="flex items-center justify-between py-3
//     border-b border-gray-50 last:border-0 gap-4"
//   >
//     <span className="text-gray-400 text-xs flex-shrink-0 w-36">{label}</span>
//     {badge ? (
//       <span
//         className="px-3 py-1 rounded-full text-xs font-bold flex-shrink-0"
//         style={{ background: badgeBg, color: badgeColor }}
//       >
//         {value}
//       </span>
//     ) : (
//       <span
//         className={`text-xs font-semibold text-right text-gray-800 flex-1
//         ${mono ? "font-mono" : ""} ${!value ? "text-gray-400" : ""}`}
//       >
//         {value || "—"}
//       </span>
//     )}
//   </div>
// );

// export default function Profile() {
//   const { user } = useSelector((s) => s.auth);

//   if (!user)
//     return (
//       <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
//         Loading profile...
//       </div>
//     );

//   const role = getRoleCfg(user.role);

//   return (
//     <div className="space-y-5 max-w-2xl mx-auto">
//       {/* ── Profile hero card ── */}
//       <div
//         className="bg-white rounded-2xl p-6"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="flex items-start gap-5">
//           {/* Avatar */}
//           <div className="flex-shrink-0">
//             {user.avatar ? (
//               <img
//                 src={user.avatar}
//                 alt={user.username}
//                 className="w-20 h-20 rounded-2xl object-cover"
//                 style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
//               />
//             ) : (
//               <div
//                 className="w-20 h-20 rounded-2xl flex items-center
//                   justify-center text-4xl"
//                 style={{
//                   background: `linear-gradient(135deg, ${role.color}22, ${role.color}44)`,
//                   boxShadow: `0 4px 16px ${role.color}30`,
//                 }}
//               >
//                 {role.icon}
//               </div>
//             )}
//           </div>

//           {/* Info */}
//           <div className="flex-1 min-w-0">
//             {/* Role badge */}
//             <div className="flex items-center gap-2 mb-2">
//               <span
//                 className="px-3 py-1 rounded-full text-xs font-bold"
//                 style={{ background: role.bg, color: role.color }}
//               >
//                 {role.icon} {role.label}
//               </span>
//               {user.isActive ? (
//                 <span
//                   className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
//                   style={{ background: "#dcfce7", color: "#16a34a" }}
//                 >
//                   ● Active
//                 </span>
//               ) : (
//                 <span
//                   className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
//                   style={{ background: "#fee2e2", color: "#ef4444" }}
//                 >
//                   ○ Inactive
//                 </span>
//               )}
//               {user.isFrozen && (
//                 <span
//                   className="px-2.5 py-0.5 rounded-full text-[10px] font-bold"
//                   style={{ background: "#e0f2fe", color: "#0284c7" }}
//                 >
//                   🧊 Frozen
//                 </span>
//               )}
//             </div>

//             {/* Name */}
//             <h1 className="text-xl font-extrabold text-gray-800 tracking-tight truncate">
//               {user.nickname || user.username}
//             </h1>
//             {user.nickname && (
//               <p className="text-gray-400 text-sm">@{user.username}</p>
//             )}
//             <p className="text-gray-400 text-sm mt-0.5">{user.email}</p>

//             {/* Last login */}
//             {user.lastLogin && (
//               <p className="text-gray-300 text-xs mt-2">
//                 Last login: {new Date(user.lastLogin).toLocaleString()}
//               </p>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ── Account Info ── */}
//       <InfoCard title="Account Information" icon="👤">
//         <Row label="Username" value={user.username} />
//         <Row label="Nickname" value={user.nickname} />
//         <Row label="Email" value={user.email} />
//         <Row label="Mobile" value={user.mobile} />
//         <Row
//           label="Role"
//           value={role.label}
//           badge
//           badgeColor={role.color}
//           badgeBg={role.bg}
//         />
//         <Row label="Language" value={user.language} />
//         <Row
//           label="Account Status"
//           value={user.isActive ? "● Active" : "○ Inactive"}
//           badge
//           badgeColor={user.isActive ? "#16a34a" : "#ef4444"}
//           badgeBg={user.isActive ? "#dcfce7" : "#fee2e2"}
//         />
//         {user.isFrozen && (
//           <Row
//             label="Frozen"
//             value="🧊 Account Frozen"
//             badge
//             badgeColor="#0284c7"
//             badgeBg="#e0f2fe"
//           />
//         )}
//       </InfoCard>

//       {/* ── merchantAdmin: Invitation Code ── */}
//       {user.role === "merchantAdmin" && (
//         <InfoCard title="Merchant Admin Details" icon="🏪">
//           <Row label="Invitation Code" value={user.invitationCode} mono />
//           <div className="pb-3">
//             <p className="text-gray-400 text-[11px] mt-1">
//               Share this code with merchants to register under your account.
//               Merchants using this code will appear in your Merchant List.
//             </p>
//           </div>
//           {/* Copy button */}
//           {user.invitationCode && (
//             <div className="pb-3">
//               <button
//                 onClick={() => {
//                   navigator.clipboard
//                     .writeText(user.invitationCode)
//                     .then(() => {
//                       // We can't use toast here without import, show alert
//                       alert("Invitation code copied to clipboard!");
//                     })
//                     .catch(() =>
//                       alert("Copy failed — code: " + user.invitationCode),
//                     );
//                 }}
//                 className="flex items-center gap-2 px-4 py-2.5 rounded-xl
//                   border border-gray-200 text-gray-600 hover:bg-gray-50
//                   text-sm font-semibold transition-all hover:scale-105 active:scale-95"
//               >
//                 <svg
//                   className="w-4 h-4"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                   strokeWidth="2"
//                 >
//                   <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
//                   <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
//                 </svg>
//                 Copy Invitation Code
//               </button>
//             </div>
//           )}
//         </InfoCard>
//       )}

//       {/* ── superAdmin stats ── */}
//       {user.role === "superAdmin" && (
//         <InfoCard title="Super Admin Access" icon="👑">
//           <div className="py-3 space-y-2">
//             {[
//               {
//                 label: "Merchant Management",
//                 detail: "Full CRUD, approve/reject/freeze stores",
//               },
//               {
//                 label: "Financial Control",
//                 detail: "Add/deduct funds, approve withdrawals",
//               },
//               {
//                 label: "VIP Management",
//                 detail: "Configure VIP levels & approve upgrades",
//               },
//               {
//                 label: "Order Management",
//                 detail: "Confirm profits, bulk ship & complete",
//               },
//               {
//                 label: "System Config",
//                 detail: "FAQ, notices, traffic tasks, products",
//               },
//               {
//                 label: "Admin Creation",
//                 detail: "Create merchantAdmin & dispatchAdmin accounts",
//               },
//             ].map((item) => (
//               <div
//                 key={item.label}
//                 className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
//               >
//                 <span className="text-green-500 mt-0.5 flex-shrink-0 text-xs">
//                   ✓
//                 </span>
//                 <div>
//                   <p className="text-gray-700 text-xs font-semibold">
//                     {item.label}
//                   </p>
//                   <p className="text-gray-400 text-[10px] mt-0.5">
//                     {item.detail}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </InfoCard>
//       )}

//       {/* ── dispatchAdmin info ── */}
//       {user.role === "dispatchAdmin" && (
//         <InfoCard title="Dispatch Admin Access" icon="📦">
//           <div className="py-3 space-y-2">
//             {[
//               {
//                 label: "Order Dispatch",
//                 detail:
//                   "Send orders to merchants with auto-generated buyer info",
//                 ok: true,
//               },
//               {
//                 label: "Order Shipping",
//                 detail: "Bulk ship processing orders",
//                 ok: true,
//               },
//               {
//                 label: "Financial Access",
//                 detail: "No access to funds, withdrawals, or recharges",
//                 ok: false,
//               },
//               {
//                 label: "Merchant Edit",
//                 detail: "Cannot modify merchant accounts",
//                 ok: false,
//               },
//             ].map((item) => (
//               <div
//                 key={item.label}
//                 className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0"
//               >
//                 <span
//                   className={`mt-0.5 flex-shrink-0 text-xs ${item.ok ? "text-green-500" : "text-red-400"}`}
//                 >
//                   {item.ok ? "✓" : "✕"}
//                 </span>
//                 <div>
//                   <p className="text-gray-700 text-xs font-semibold">
//                     {item.label}
//                   </p>
//                   <p className="text-gray-400 text-[10px] mt-0.5">
//                     {item.detail}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </InfoCard>
//       )}

//       {/* ── Customer service link if set ── */}
//       {user.customerServiceLink && (
//         <InfoCard title="Customer Service" icon="💬">
//           <div className="py-3">
//             <p className="text-gray-400 text-[10px] mb-2">
//               Customer service link shared with merchants:
//             </p>
//             <a
//               href={user.customerServiceLink}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="text-pink-600 text-sm font-semibold hover:underline break-all"
//             >
//               {user.customerServiceLink}
//             </a>
//           </div>
//         </InfoCard>
//       )}

//       {/* ── Security note ── */}
//       <div
//         className="bg-white rounded-2xl p-5"
//         style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
//       >
//         <div className="flex items-start gap-3">
//           <span className="text-xl flex-shrink-0">🔒</span>
//           <div>
//             <p className="text-gray-700 text-sm font-semibold mb-1">
//               Account Security
//             </p>
//             <p className="text-gray-400 text-xs leading-relaxed">
//               To change your password or update account details, please contact
//               your system administrator. Admin accounts are managed directly
//               through the superAdmin interface.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

///////////////////// ====================== lastest version (by gemeni) ======================///////////////////

// import { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";
// // import { setCredentials } from "../../store/authSlice";

// // ── Icons ─────────────────────────────────────────────────────
// import { User, RefreshCcw, Loader2 } from "lucide-react";

// export default function Profile() {
//   const { user } = useSelector((s) => s.auth);
//   const dispatch = useDispatch();
//   const queryClient = useQueryClient();

//   // Form State
//   const [form, setForm] = useState({
//     username: "",
//     mobile: "",
//     email: "",
//     nickname: "",
//     password: "",
//   });

//   useEffect(() => {
//     if (user) {
//       setForm({
//         username: user.username || "",
//         mobile: user.mobile || "",
//         email: user.email || "",
//         nickname: user.nickname || "",
//         password: "",
//       });
//     }
//   }, [user]);

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   // ── Fetch Admin Logs ────────────────────────────────────────
//   const {
//     data: logData,
//     isLoading: logsLoading,
//     isFetching: logsFetching,
//   } = useQuery({
//     queryKey: ["adminLogs"],
//     queryFn: async () => {
//       const { data } = await API.get("/admin-logs?limit=20");
//       return data;
//     },
//   });

//   const logs = logData?.logs || [];
//   const invalidateLogs = () => queryClient.invalidateQueries(["adminLogs"]);

//   // ── Mutations ───────────────────────────────────────────────
//   // const updateProfile = useMutation({
//   //   mutationFn: async (data) => {
//   //     const res = await API.put("/api/auth/update-profile", data);
//   //     return res.data;
//   //   },
//   //   onSuccess: (data) => {
//   //     toast.success("Profile updated successfully!");
//   //     // Removed the dispatch(setCredentials(...)) line
//   //     queryClient.invalidateQueries(["me"]);
//   //     invalidateLogs(); // Refresh logs after update

//   //     // Optional: Quick page reload to show new name/avatar instantly
//   //     setTimeout(() => window.location.reload(), 1000);
//   //   },
//   //   onError: (err) =>
//   //     toast.error(err.response?.data?.message || "Failed to update profile"),
//   // });
//   // ── Mutations ───────────────────────────────────────────────
//   const updateProfile = useMutation({
//     mutationFn: async (data) => {
//       const res = await API.put("/auth/update-profile", data);
//       return res.data;
//     },
//     onSuccess: (data) => {
//       toast.success("Profile updated successfully!");
//       // Removed the crashing Redux dispatch line
//       queryClient.invalidateQueries(["me"]);
//       invalidateLogs();
//       setTimeout(() => window.location.reload(), 1000); // Quick reload to show new data
//     },
//     onError: (err) =>
//       toast.error(err.response?.data?.message || "Failed to update profile"),
//   });

//   const changePassword = useMutation({
//     mutationFn: async (newPassword) =>
//       API.put("/auth/change-password", { newPassword }),
//     onSuccess: () => {
//       toast.success("Password changed successfully!");
//       setForm({ ...form, password: "" });
//       invalidateLogs();
//     },
//     onError: (err) =>
//       toast.error(err.response?.data?.message || "Failed to change password"),
//   });

//   const handleSubmit = async () => {
//     if (form.nickname !== user.nickname || form.mobile !== user.mobile) {
//       await updateProfile.mutateAsync({
//         nickname: form.nickname,
//         mobile: form.mobile,
//       });
//     }
//     if (form.password.trim() !== "") {
//       await changePassword.mutateAsync(form.password);
//     }
//   };

//   const handleReset = () => {
//     setForm({
//       username: user?.username || "",
//       mobile: user?.mobile || "",
//       email: user?.email || "",
//       nickname: user?.nickname || "",
//       password: "",
//     });
//   };

//   // ── Dynamic Link Generation ──
//   // Use env variable if available, fallback to origin
//   const merchantBaseUrl =
//     import.meta.env.VITE_MERCHANT_URL || window.location.origin;

//   const registrationLink =
//     user?.role === "merchantAdmin" && user?.invitationCode
//       ? `${merchantBaseUrl}/register?code=${user.invitationCode}`
//       : "";

//   const customerServiceLink = user?.customerServiceLink || "";

//   if (!user)
//     return <div className="p-8 text-center text-gray-500">Loading...</div>;

//   return (
//     <div
//       style={{ padding: "20px" }}
//       className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
//     >
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* LEFT COLUMN: Profile Form */}
//         <div className="lg:col-span-1 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
//           <div
//             style={{ padding: "15px" }}
//             className="border-b border-gray-100 font-bold text-gray-800 text-[14px]"
//           >
//             Profile
//           </div>

//           <div
//             style={{ padding: "20px" }}
//             className="flex flex-col items-center"
//           >
//             <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-gray-50 flex items-center justify-center mb-4 shadow-sm">
//               {user.avatar ? (
//                 <img
//                   src={user.avatar}
//                   alt="Avatar"
//                   className="w-full h-full rounded-full object-cover"
//                 />
//               ) : (
//                 <User className="w-10 h-10 text-gray-400" />
//               )}
//             </div>
//             <h2 className="text-lg font-bold text-gray-800">
//               {user.nickname || user.username}
//             </h2>
//             <p className="text-[12px] text-teal-600 font-bold mt-1 uppercase tracking-wider">
//               {user.role}
//             </p>

//             <div className="w-full mt-6 space-y-4">
//               <div className="flex flex-col gap-1">
//                 <label className="text-[13px] font-bold text-gray-700">
//                   Username:
//                 </label>
//                 <input
//                   style={{ padding: "8px" }}
//                   type="text"
//                   name="username"
//                   value={form.username}
//                   disabled
//                   className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-500 text-[13px] cursor-not-allowed"
//                 />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[13px] font-bold text-gray-700">
//                   Mobile:
//                 </label>
//                 <input
//                   style={{ padding: "8px" }}
//                   type="text"
//                   name="mobile"
//                   value={form.mobile}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[13px] transition-all"
//                 />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[13px] font-bold text-gray-700">
//                   Email:
//                 </label>
//                 <input
//                   style={{ padding: "8px" }}
//                   type="email"
//                   name="email"
//                   value={form.email}
//                   disabled
//                   className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-500 text-[13px] cursor-not-allowed"
//                 />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[13px] font-bold text-gray-700">
//                   Nickname:
//                 </label>
//                 <input
//                   style={{ padding: "8px" }}
//                   type="text"
//                   name="nickname"
//                   value={form.nickname}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[13px] transition-all"
//                 />
//               </div>
//               <div className="flex flex-col gap-1">
//                 <label className="text-[13px] font-bold text-gray-700">
//                   Password:
//                 </label>
//                 <input
//                   style={{ padding: "8px" }}
//                   type="password"
//                   name="password"
//                   placeholder="Leave password blank if dont want to change"
//                   value={form.password}
//                   onChange={handleChange}
//                   className="w-full border border-gray-300 rounded-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[13px] transition-all"
//                 />
//               </div>

//               {user.role === "merchantAdmin" && (
//                 <>
//                   <div className="flex flex-col gap-1 pt-2">
//                     <label className="text-[13px] font-bold text-gray-700">
//                       Invitation code:
//                     </label>
//                     <input
//                       style={{ padding: "8px" }}
//                       type="text"
//                       value={user.invitationCode || ""}
//                       readOnly
//                       className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-600 text-[13px] font-mono"
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     <label className="text-[13px] font-bold text-gray-700">
//                       Registration Link:
//                     </label>
//                     <input
//                       style={{ padding: "8px" }}
//                       type="text"
//                       value={registrationLink}
//                       readOnly
//                       className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-600 text-[11px] font-mono"
//                     />
//                   </div>
//                   <div className="flex flex-col gap-1">
//                     <label className="text-[13px] font-bold text-gray-700">
//                       Customer Service Link:
//                     </label>
//                     <input
//                       style={{ padding: "8px" }}
//                       type="text"
//                       value={customerServiceLink}
//                       readOnly
//                       className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-600 text-[11px] font-mono"
//                     />
//                   </div>
//                 </>
//               )}

//               <div
//                 style={{ paddingTop: "15px" }}
//                 className="flex items-center gap-3"
//               >
//                 <button
//                   style={{ padding: "8px 24px" }}
//                   onClick={handleSubmit}
//                   disabled={updateProfile.isPending || changePassword.isPending}
//                   className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm text-[13px] font-bold transition-colors shadow-sm disabled:opacity-50"
//                 >
//                   {updateProfile.isPending ? "Submitting..." : "Submit"}
//                 </button>
//                 <button
//                   style={{ padding: "8px 24px" }}
//                   onClick={handleReset}
//                   className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm text-[13px] font-bold transition-colors shadow-sm"
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* RIGHT COLUMN: Actual Working Admin Log */}
//         <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col h-full min-h-[500px]">
//           <div
//             style={{ padding: "15px" }}
//             className="border-b border-gray-100 font-bold text-gray-800 text-[14px] flex items-center gap-2 bg-gray-50/50"
//           >
//             <ClipboardListIcon className="w-4 h-4 text-gray-500" /> Admin Log
//           </div>

//           <div style={{ padding: "15px" }} className="flex flex-col h-full">
//             <button
//               style={{ padding: "6px" }}
//               onClick={invalidateLogs}
//               className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors mb-4 shadow-sm self-start"
//             >
//               <RefreshCcw
//                 className={`w-4 h-4 ${logsFetching ? "animate-spin" : ""}`}
//               />
//             </button>

//             <div className="border border-gray-200 rounded-sm w-full flex-1 bg-white overflow-hidden flex flex-col">
//               {logsLoading ? (
//                 <div className="flex-1 flex flex-col items-center justify-center p-10">
//                   <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
//                   <p className="text-gray-500 text-[13px]">Loading logs...</p>
//                 </div>
//               ) : logs.length === 0 ? (
//                 <div className="flex-1 flex items-center justify-center bg-gray-50 p-10">
//                   <p className="text-gray-400 text-[13px] font-medium">
//                     No logs available at this time.
//                   </p>
//                 </div>
//               ) : (
//                 <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
//                   <table className="w-full text-left border-collapse">
//                     <thead>
//                       <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-gray-50/50 sticky top-0">
//                         <th style={{ padding: "12px 15px" }}>Time</th>
//                         <th style={{ padding: "12px 15px" }}>Action</th>
//                         <th style={{ padding: "12px 15px" }}>Details</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {logs.map((log) => (
//                         <tr
//                           key={log._id}
//                           className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors"
//                         >
//                           <td
//                             style={{ padding: "12px 15px" }}
//                             className="text-[12px] text-gray-500 whitespace-nowrap"
//                           >
//                             {new Date(log.createdAt).toLocaleString()}
//                           </td>
//                           <td
//                             style={{ padding: "12px 15px" }}
//                             className="text-[13px] font-bold text-gray-800"
//                           >
//                             {log.action}
//                           </td>
//                           <td
//                             style={{ padding: "12px 15px" }}
//                             className="text-[12px] text-gray-600"
//                           >
//                             {log.details || "—"}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Simple icon for the header
// function ClipboardListIcon(props) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
//       <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
//       <path d="M12 11h4" />
//       <path d="M12 16h4" />
//       <path d="M8 11h.01" />
//       <path d="M8 16h.01" />
//     </svg>
//   );
// }

//////////////////// ============================ latest version (by gemeni) ====================//////////////////////

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import { User, RefreshCcw, Loader2 } from "lucide-react";

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // Form State
  const [form, setForm] = useState({
    username: "",
    mobile: "",
    email: "",
    nickname: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || "",
        mobile: user.mobile || "",
        email: user.email || "",
        nickname: user.nickname || "",
        password: "",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ── Fetch Admin Logs ────────────────────────────────────────
  const {
    data: logData,
    isLoading: logsLoading,
    isFetching: logsFetching,
  } = useQuery({
    queryKey: ["adminLogs"],
    queryFn: async () => {
      const { data } = await API.get("/admin-logs?limit=20");
      return data;
    },
    // ✅ FIX: Only fetch logs if the user is a superAdmin. Stops the 403 error!
    enabled: user?.role === "superAdmin",
  });

  const logs = logData?.logs || [];
  const invalidateLogs = () => queryClient.invalidateQueries(["adminLogs"]);

  // ── Mutations ───────────────────────────────────────────────
  const updateProfile = useMutation({
    mutationFn: async (data) => {
      const res = await API.put("/auth/update-profile", data);
      return res.data;
    },
    onSuccess: (data) => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(["me"]);
      invalidateLogs();
      setTimeout(() => window.location.reload(), 1000); // Quick reload to show new data
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update profile"),
  });

  const changePassword = useMutation({
    mutationFn: async (newPassword) =>
      API.put("/auth/change-password", { newPassword }),
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setForm({ ...form, password: "" });
      invalidateLogs();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to change password"),
  });

  const handleSubmit = async () => {
    if (form.nickname !== user.nickname || form.mobile !== user.mobile) {
      await updateProfile.mutateAsync({
        nickname: form.nickname,
        mobile: form.mobile,
      });
    }
    if (form.password.trim() !== "") {
      await changePassword.mutateAsync(form.password);
    }
  };

  const handleReset = () => {
    setForm({
      username: user?.username || "",
      mobile: user?.mobile || "",
      email: user?.email || "",
      nickname: user?.nickname || "",
      password: "",
    });
  };

  // ── Dynamic Link Generation ──
  const merchantBaseUrl =
    import.meta.env.VITE_MERCHANT_URL || window.location.origin;

  const registrationLink =
    user?.role === "merchantAdmin" && user?.invitationCode
      ? `${merchantBaseUrl}/register?code=${user.invitationCode}`
      : "";

  const customerServiceLink = user?.customerServiceLink || "";

  if (!user)
    return <div className="p-8 text-center text-gray-500">Loading...</div>;

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Profile Form */}
        <div className="lg:col-span-1 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col">
          <div
            style={{ padding: "15px" }}
            className="border-b border-gray-100 font-bold text-gray-800 text-[14px]"
          >
            Profile
          </div>

          <div
            style={{ padding: "20px" }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full border-4 border-gray-50 flex items-center justify-center mb-4 shadow-sm">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-800">
              {user.nickname || user.username}
            </h2>
            <p className="text-[12px] text-teal-600 font-bold mt-1 uppercase tracking-wider">
              {user.role}
            </p>

            <div className="w-full mt-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">
                  Username:
                </label>
                <input
                  style={{ padding: "8px" }}
                  type="text"
                  name="username"
                  value={form.username}
                  disabled
                  className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-500 text-[13px] cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">
                  Mobile:
                </label>
                <input
                  style={{ padding: "8px" }}
                  type="text"
                  name="mobile"
                  value={form.mobile}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[13px] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">
                  Email:
                </label>
                <input
                  style={{ padding: "8px" }}
                  type="email"
                  name="email"
                  value={form.email}
                  disabled
                  className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-500 text-[13px] cursor-not-allowed"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">
                  Nickname:
                </label>
                <input
                  style={{ padding: "8px" }}
                  type="text"
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[13px] transition-all"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-bold text-gray-700">
                  Password:
                </label>
                <input
                  style={{ padding: "8px" }}
                  type="password"
                  name="password"
                  placeholder="Leave blank if don't want to change"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-sm bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-[13px] transition-all"
                />
              </div>

              {user.role === "merchantAdmin" && (
                <>
                  <div className="flex flex-col gap-1 pt-2">
                    <label className="text-[13px] font-bold text-gray-700">
                      Invitation code:
                    </label>
                    <input
                      style={{ padding: "8px" }}
                      type="text"
                      value={user.invitationCode || ""}
                      readOnly
                      className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-600 text-[13px] font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">
                      Registration Link:
                    </label>
                    <input
                      style={{ padding: "8px" }}
                      type="text"
                      value={registrationLink}
                      readOnly
                      className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-600 text-[11px] font-mono"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[13px] font-bold text-gray-700">
                      Customer Service Link:
                    </label>
                    <input
                      style={{ padding: "8px" }}
                      type="text"
                      value={customerServiceLink}
                      readOnly
                      className="w-full border border-gray-200 rounded-sm bg-gray-100 text-gray-600 text-[11px] font-mono"
                    />
                  </div>
                </>
              )}

              <div
                style={{ paddingTop: "15px" }}
                className="flex items-center gap-3"
              >
                <button
                  style={{ padding: "8px 24px" }}
                  onClick={handleSubmit}
                  disabled={updateProfile.isPending || changePassword.isPending}
                  className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm text-[13px] font-bold transition-colors shadow-sm disabled:opacity-50"
                >
                  {updateProfile.isPending ? "Submitting..." : "Submit"}
                </button>
                <button
                  style={{ padding: "8px 24px" }}
                  onClick={handleReset}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-sm text-[13px] font-bold transition-colors shadow-sm"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Admin Log (Only visible if superAdmin) */}
        {user?.role === "superAdmin" && (
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col h-full min-h-[500px]">
            <div
              style={{ padding: "15px" }}
              className="border-b border-gray-100 font-bold text-gray-800 text-[14px] flex items-center gap-2 bg-gray-50/50"
            >
              <ClipboardListIcon className="w-4 h-4 text-gray-500" /> Admin Log
            </div>

            <div style={{ padding: "15px" }} className="flex flex-col h-full">
              <button
                style={{ padding: "6px" }}
                onClick={invalidateLogs}
                className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors mb-4 shadow-sm self-start"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${logsFetching ? "animate-spin" : ""}`}
                />
              </button>

              <div className="border border-gray-200 rounded-sm w-full flex-1 bg-white overflow-hidden flex flex-col">
                {logsLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-10">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                    <p className="text-gray-500 text-[13px]">Loading logs...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center bg-gray-50 p-10">
                    <p className="text-gray-400 text-[13px] font-medium">
                      No logs available at this time.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[500px] custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-gray-50/50 sticky top-0">
                          <th style={{ padding: "12px 15px" }}>Time</th>
                          <th style={{ padding: "12px 15px" }}>Action</th>
                          <th style={{ padding: "12px 15px" }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr
                            key={log._id}
                            className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors"
                          >
                            <td
                              style={{ padding: "12px 15px" }}
                              className="text-[12px] text-gray-500 whitespace-nowrap"
                            >
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td
                              style={{ padding: "12px 15px" }}
                              className="text-[13px] font-bold text-gray-800"
                            >
                              {log.action}
                            </td>
                            <td
                              style={{ padding: "12px 15px" }}
                              className="text-[12px] text-gray-600"
                            >
                              {log.details || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple icon for the header
function ClipboardListIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2-2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
