// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { logout } from "../../store/authSlice";
// import API from "../../api/axios";

// // ── Nav item component ────────────────────────────────────────
// const NavItem = ({ to, icon, label, collapsed, badge }) => (
//   <NavLink
//     to={to}
//     end={to === "/"}
//     className={({ isActive }) =>
//       `flex items-center gap-3 px-3 py-2.5 rounded-xl
//       transition-all duration-150 group relative
//       ${
//         isActive
//           ? "text-white"
//           : "text-white/50 hover:text-white hover:bg-white/8"
//       }`
//     }
//     style={({ isActive }) =>
//       isActive
//         ? {
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//             boxShadow: "0 4px 12px rgba(240,45,101,0.35)",
//           }
//         : {}
//     }
//   >
//     {/* Icon */}
//     <span className="text-lg flex-shrink-0 w-5 text-center">{icon}</span>

//     {/* Label — hidden when collapsed */}
//     {!collapsed && (
//       <span className="text-sm font-medium flex-1 truncate">{label}</span>
//     )}

//     {/* Badge */}
//     {!collapsed && badge > 0 && (
//       <span
//         className="min-w-[18px] h-[18px] rounded-full
//         bg-yellow-400 text-[9px] font-bold text-gray-900
//         flex items-center justify-center px-1"
//       >
//         {badge > 99 ? "99+" : badge}
//       </span>
//     )}

//     {/* Tooltip when collapsed */}
//     {collapsed && (
//       <div
//         className="absolute left-full ml-2 px-2 py-1 bg-gray-900
//         text-white text-xs rounded-lg opacity-0 pointer-events-none
//         group-hover:opacity-100 transition-opacity whitespace-nowrap
//         z-50"
//       >
//         {label}
//       </div>
//     )}
//   </NavLink>
// );

// // ── Section header ────────────────────────────────────────────
// const SectionHeader = ({ label, collapsed }) =>
//   collapsed ? (
//     <div className="mx-3 my-2 h-px bg-white/10" />
//   ) : (
//     <p
//       className="px-3 pt-4 pb-1 text-white/25 text-[10px]
//       font-bold tracking-widest uppercase"
//     >
//       {label}
//     </p>
//   );

// export default function Sidebar({ open, collapsed, onCollapse, onClose }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((s) => s.auth);
//   const role = user?.role;

//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       await API.post("/auth/logout");
//     },
//     onSuccess: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//     onError: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//   });

//   const isSuperAdmin = role === "superAdmin";
//   const isMerchantAdmin = role === "merchantAdmin";
//   const isDispatchAdmin = role === "dispatchAdmin";

//   // Sidebar width
//   const sidebarW = collapsed ? 64 : 240;

//   return (
//     <aside
//       className="flex-shrink-0 h-screen flex flex-col
//         transition-all duration-300 z-40
//         fixed lg:relative
//         lg:translate-x-0"
//       style={{
//         width: sidebarW,
//         background: "linear-gradient(180deg,#0f172a 0%,#1a1035 100%)",
//         transform: open ? "translateX(0)" : "translateX(-100%)",
//         transition: "transform 0.3s ease, width 0.3s ease",
//         boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
//       }}
//     >
//       {/* ── Logo / Header ── */}
//       <div
//         className={`flex items-center h-16 flex-shrink-0
//         border-b border-white/8 ${collapsed ? "justify-center px-2" : "px-4 gap-3"}`}
//       >
//         <div
//           className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center
//           justify-center"
//           style={{
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//           }}
//         >
//           <span className="text-lg">🛍️</span>
//         </div>
//         {!collapsed && (
//           <div className="flex-1 min-w-0">
//             <p className="text-white font-bold text-sm truncate">TikTok Shop</p>
//             <p className="text-white/30 text-[10px]">Admin Panel</p>
//           </div>
//         )}
//         {/* Collapse button — desktop only */}
//         {!collapsed && (
//           <button
//             onClick={onCollapse}
//             className="hidden lg:flex w-6 h-6 rounded-lg items-center
//               justify-center text-white/30 hover:text-white
//               hover:bg-white/10 transition-all flex-shrink-0"
//           >
//             <svg
//               viewBox="0 0 24 24"
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <polyline points="15 18 9 12 15 6" />
//             </svg>
//           </button>
//         )}
//         {/* Mobile close */}
//         <button
//           onClick={onClose}
//           className="lg:hidden w-6 h-6 flex items-center justify-center
//             text-white/40 hover:text-white flex-shrink-0"
//         >
//           ×
//         </button>
//       </div>

//       {/* Expand button when collapsed */}
//       {collapsed && (
//         <button
//           onClick={onCollapse}
//           className="hidden lg:flex mx-auto mt-2 w-8 h-8 rounded-lg
//             items-center justify-center text-white/30 hover:text-white
//             hover:bg-white/10 transition-all"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <polyline points="9 18 15 12 9 6" />
//           </svg>
//         </button>
//       )}

//       {/* ── Nav Links ── */}
//       <nav
//         className="flex-1 overflow-y-auto overflow-x-hidden
//         py-2 px-2 space-y-0.5"
//       >
//         {/* DASHBOARD */}
//         <NavItem to="/" icon="📊" label="Dashboard" collapsed={collapsed} />

//         {/* GENERAL */}
//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="General" collapsed={collapsed} />
//             <NavItem
//               to="/profile"
//               icon="👤"
//               label="Profile"
//               collapsed={collapsed}
//             />
//           </>
//         )}

//         {/* MERCHANT MANAGEMENT */}
//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="Merchants" collapsed={collapsed} />
//             <NavItem
//               to="/merchants"
//               icon="🏪"
//               label="Merchant List"
//               collapsed={collapsed}
//             />
//             <NavItem
//               to="/merchants/funds"
//               icon="💰"
//               label="Fund Details"
//               collapsed={collapsed}
//             />
//             {isSuperAdmin && (
//               <>
//                 <NavItem
//                   to="/merchants/recharges"
//                   icon="💳"
//                   label="Recharge Records"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/withdrawals"
//                   icon="💸"
//                   label="Withdrawals"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/level-app"
//                   icon="👑"
//                   label="Level Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/applications"
//                   icon="📋"
//                   label="Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/showcase"
//                   icon="🛍️"
//                   label="Showcase"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/levels"
//                   icon="⭐"
//                   label="VIP Levels"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/notices"
//                   icon="📢"
//                   label="Notices"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/traffic"
//                   icon="🚦"
//                   label="Traffic Tasks"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/complaints"
//                   icon="🚨"
//                   label="Complaints"
//                   collapsed={collapsed}
//                 />
//               </>
//             )}
//             {isMerchantAdmin && (
//               <NavItem
//                 to="/merchants/withdrawals"
//                 icon="💸"
//                 label="Withdrawals"
//                 collapsed={collapsed}
//               />
//             )}
//           </>
//         )}

//         {/* ORDER MANAGEMENT */}
//         <SectionHeader label="Orders" collapsed={collapsed} />
//         <NavItem
//           to="/orders"
//           icon="📦"
//           label="Order List"
//           collapsed={collapsed}
//         />
//         {isSuperAdmin && (
//           <NavItem
//             to="/orders/refunds"
//             icon="↩️"
//             label="Refund Orders"
//             collapsed={collapsed}
//           />
//         )}
//       </nav>

//       {/* ── User footer ── */}
//       <div
//         className={`flex-shrink-0 border-t border-white/8 p-3
//         ${collapsed ? "flex justify-center" : ""}`}
//       >
//         {collapsed ? (
//           <button
//             onClick={() => logoutMutation.mutate()}
//             className="w-9 h-9 rounded-xl bg-white/8 flex items-center
//               justify-center text-white/50 hover:text-red-400
//               hover:bg-red-500/10 transition-all"
//             title="Logout"
//           >
//             <svg
//               viewBox="0 0 24 24"
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
//               <polyline points="16 17 21 12 16 7" />
//               <line x1="21" y1="12" x2="9" y2="12" />
//             </svg>
//           </button>
//         ) : (
//           <div className="flex items-center gap-2">
//             {/* Avatar */}
//             <div
//               className="w-8 h-8 rounded-full flex-shrink-0
//               flex items-center justify-center text-white text-xs
//               font-bold"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               }}
//             >
//               {user?.username?.[0]?.toUpperCase() || "A"}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-white text-xs font-medium truncate">
//                 {user?.username}
//               </p>
//               <p className="text-white/30 text-[10px] truncate">{user?.role}</p>
//             </div>
//             {/* Logout */}
//             <button
//               onClick={() => logoutMutation.mutate()}
//               className="w-7 h-7 rounded-lg flex items-center justify-center
//                 text-white/30 hover:text-red-400 hover:bg-red-500/10
//                 transition-all flex-shrink-0"
//               title="Logout"
//             >
//               <svg
//                 viewBox="0 0 24 24"
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
//                 <polyline points="16 17 21 12 16 7" />
//                 <line x1="21" y1="12" x2="9" y2="12" />
//               </svg>
//             </button>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }

// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { logout } from "../../store/authSlice";
// import API from "../../api/axios";

// // ── Nav item component ────────────────────────────────────────
// const NavItem = ({ to, icon, label, collapsed, badge }) => (
//   <NavLink
//     to={to}
//     end={to === "/"}
//     className={({ isActive }) =>
//       `flex items-center gap-3 px-3 py-2.5 rounded-xl
//       transition-all duration-150 group relative
//       ${
//         isActive
//           ? "text-white"
//           : "text-white/50 hover:text-white hover:bg-white/8"
//       }`
//     }
//     style={({ isActive }) =>
//       isActive
//         ? {
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//             boxShadow: "0 4px 12px rgba(240,45,101,0.35)",
//           }
//         : {}
//     }
//   >
//     {/* Icon */}
//     <span className="text-lg flex-shrink-0 w-5 text-center">{icon}</span>

//     {/* Label — hidden when collapsed */}
//     {!collapsed && (
//       <span className="text-sm font-medium flex-1 truncate">{label}</span>
//     )}

//     {/* Badge */}
//     {!collapsed && badge > 0 && (
//       <span
//         className="min-w-[18px] h-[18px] rounded-full
//         bg-yellow-400 text-[9px] font-bold text-gray-900
//         flex items-center justify-center px-1"
//       >
//         {badge > 99 ? "99+" : badge}
//       </span>
//     )}

//     {/* Tooltip when collapsed */}
//     {collapsed && (
//       <div
//         className="absolute left-full ml-2 px-2 py-1 bg-gray-900
//         text-white text-xs rounded-lg opacity-0 pointer-events-none
//         group-hover:opacity-100 transition-opacity whitespace-nowrap
//         z-50"
//       >
//         {label}
//       </div>
//     )}
//   </NavLink>
// );

// // ── Section header ────────────────────────────────────────────
// const SectionHeader = ({ label, collapsed }) =>
//   collapsed ? (
//     <div className="mx-3 my-2 h-px bg-white/10" />
//   ) : (
//     <p
//       className="px-3 pt-4 pb-1 text-white/25 text-[10px]
//       font-bold tracking-widest uppercase"
//     >
//       {label}
//     </p>
//   );

// export default function Sidebar({ open, collapsed, onCollapse, onClose }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((s) => s.auth);
//   const role = user?.role;

//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       await API.post("/auth/logout");
//     },
//     onSuccess: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//     onError: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//   });

//   const isSuperAdmin = role === "superAdmin";
//   const isMerchantAdmin = role === "merchantAdmin";
//   const isDispatchAdmin = role === "dispatchAdmin";

//   // Sidebar width
//   const sidebarW = collapsed ? 64 : 240;

//   return (
//     <aside
//       className="flex-shrink-0 h-screen flex flex-col
//         transition-all duration-300 z-40
//         fixed lg:relative
//         lg:translate-x-0"
//       style={{
//         width: sidebarW,
//         background: "linear-gradient(180deg,#0f172a 0%,#1a1035 100%)",
//         transform: open ? "translateX(0)" : "translateX(-100%)",
//         transition: "transform 0.3s ease, width 0.3s ease",
//         boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
//       }}
//     >
//       {/* ── Logo / Header ── */}
//       <div
//         className={`flex items-center h-16 flex-shrink-0
//         border-b border-white/8 ${collapsed ? "justify-center px-2" : "px-4 gap-3"}`}
//       >
//         <div
//           className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center
//           justify-center"
//           style={{
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//           }}
//         >
//           <span className="text-lg">🛍️</span>
//         </div>
//         {!collapsed && (
//           <div className="flex-1 min-w-0">
//             <p className="text-white font-bold text-sm truncate">TikTok Shop</p>
//             <p className="text-white/30 text-[10px]">Admin Panel</p>
//           </div>
//         )}
//         {/* Collapse button — desktop only */}
//         {!collapsed && (
//           <button
//             onClick={onCollapse}
//             className="hidden lg:flex w-6 h-6 rounded-lg items-center
//               justify-center text-white/30 hover:text-white
//               hover:bg-white/10 transition-all flex-shrink-0"
//           >
//             <svg
//               viewBox="0 0 24 24"
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <polyline points="15 18 9 12 15 6" />
//             </svg>
//           </button>
//         )}
//         {/* Mobile close */}
//         <button
//           onClick={onClose}
//           className="lg:hidden w-6 h-6 flex items-center justify-center
//             text-white/40 hover:text-white flex-shrink-0"
//         >
//           ×
//         </button>
//       </div>

//       {/* Expand button when collapsed */}
//       {collapsed && (
//         <button
//           onClick={onCollapse}
//           className="hidden lg:flex mx-auto mt-2 w-8 h-8 rounded-lg
//             items-center justify-center text-white/30 hover:text-white
//             hover:bg-white/10 transition-all"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <polyline points="9 18 15 12 9 6" />
//           </svg>
//         </button>
//       )}

//       {/* ── Nav Links ── */}
//       <nav
//         className="flex-1 overflow-y-auto overflow-x-hidden
//         py-2 px-2 space-y-0.5"
//       >
//         {/* DASHBOARD */}
//         <NavItem to="/" icon="📊" label="Dashboard" collapsed={collapsed} />

//         {/* GENERAL */}
//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="General" collapsed={collapsed} />
//             <NavItem
//               to="/profile"
//               icon="👤"
//               label="Profile"
//               collapsed={collapsed}
//             />
//           </>
//         )}

//         {/* MERCHANT MANAGEMENT */}
//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="Merchants" collapsed={collapsed} />
//             <NavItem
//               to="/merchants"
//               icon="🏪"
//               label="Merchant List"
//               collapsed={collapsed}
//             />
//             <NavItem
//               to="/merchants/funds"
//               icon="💰"
//               label="Fund Details"
//               collapsed={collapsed}
//             />
//             {isSuperAdmin && (
//               <>
//                 <NavItem
//                   to="/merchants/recharges"
//                   icon="💳"
//                   label="Recharge Records"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/withdrawals"
//                   icon="💸"
//                   label="Withdrawals"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/level-app"
//                   icon="👑"
//                   label="Level Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/applications"
//                   icon="📋"
//                   label="Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/showcase"
//                   icon="🛍️"
//                   label="Showcase"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/levels"
//                   icon="⭐"
//                   label="VIP Levels"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/notices"
//                   icon="📢"
//                   label="Notices"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/traffic"
//                   icon="🚦"
//                   label="Traffic Tasks"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/complaints"
//                   icon="🚨"
//                   label="Complaints"
//                   collapsed={collapsed}
//                 />
//               </>
//             )}
//             {isMerchantAdmin && (
//               <NavItem
//                 to="/merchants/withdrawals"
//                 icon="💸"
//                 label="Withdrawals"
//                 collapsed={collapsed}
//               />
//             )}
//           </>
//         )}

//         {/* ORDER MANAGEMENT */}
//         <SectionHeader label="Orders" collapsed={collapsed} />
//         <NavItem
//           to="/orders"
//           icon="📦"
//           label="Order List"
//           collapsed={collapsed}
//         />
//         {isSuperAdmin && (
//           <NavItem
//             to="/orders/refunds"
//             icon="↩️"
//             label="Refund Orders"
//             collapsed={collapsed}
//           />
//         )}
//       </nav>

//       {/* ── User footer ── */}
//       <div
//         className={`flex-shrink-0 border-t border-white/8 p-3
//         ${collapsed ? "flex justify-center" : ""}`}
//       >
//         {collapsed ? (
//           <button
//             onClick={() => logoutMutation.mutate()}
//             className="w-9 h-9 rounded-xl bg-white/8 flex items-center
//               justify-center text-white/50 hover:text-red-400
//               hover:bg-red-500/10 transition-all"
//             title="Logout"
//           >
//             <svg
//               viewBox="0 0 24 24"
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//             >
//               <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
//               <polyline points="16 17 21 12 16 7" />
//               <line x1="21" y1="12" x2="9" y2="12" />
//             </svg>
//           </button>
//         ) : (
//           <div className="flex items-center gap-2">
//             {/* Avatar */}
//             <div
//               className="w-8 h-8 rounded-full flex-shrink-0
//               flex items-center justify-center text-white text-xs
//               font-bold"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               }}
//             >
//               {user?.username?.[0]?.toUpperCase() || "A"}
//             </div>
//             <div className="flex-1 min-w-0">
//               <p className="text-white text-xs font-medium truncate">
//                 {user?.username}
//               </p>
//               <p className="text-white/30 text-[10px] truncate">{user?.role}</p>
//             </div>
//             {/* Logout */}
//             <button
//               onClick={() => logoutMutation.mutate()}
//               className="w-7 h-7 rounded-lg flex items-center justify-center
//                 text-white/30 hover:text-red-400 hover:bg-red-500/10
//                 transition-all flex-shrink-0"
//               title="Logout"
//             >
//               <svg
//                 viewBox="0 0 24 24"
//                 className="w-4 h-4"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//               >
//                 <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
//                 <polyline points="16 17 21 12 16 7" />
//                 <line x1="21" y1="12" x2="9" y2="12" />
//               </svg>
//             </button>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }

/////////////// ======================== second version =====================////////////////////////////

// src/layout/Sidebar.jsx  (DESIGN ONLY)
// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useMutation } from "@tanstack/react-query";
// import { logout } from "../../store/authSlice";
// import API from "../../api/axios";
// import { CiChat1 } from "react-icons/ci";

// /* ---------- Icons (design only, no deps) ---------- */
// // const I = {
// //   Dashboard: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M4 13h7V4H4v9Z" />
// //       <path d="M13 20h7V11h-7v9Z" />
// //       <path d="M13 4h7v5h-7V4Z" />
// //       <path d="M4 20h7v-5H4v5Z" />
// //     </svg>
// //   ),
// //   User: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M20 21a8 8 0 0 0-16 0" />
// //       <circle cx="12" cy="8" r="4" />
// //     </svg>
// //   ),
// //   Store: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M3 7l1-4h16l1 4" />
// //       <path d="M5 7v14h14V7" />
// //       <path d="M9 21v-8h6v8" />
// //     </svg>
// //   ),
// //   Wallet: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14" />
// //       <path d="M21 12h-7a2 2 0 0 0 0 4h7v-4Z" />
// //       <path d="M7 7h10" />
// //     </svg>
// //   ),
// //   Card: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <rect x="2" y="5" width="20" height="14" rx="3" />
// //       <path d="M2 10h20" />
// //       <path d="M6 15h4" />
// //     </svg>
// //   ),
// //   CashOut: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M3 7h18v10H3z" />
// //       <path d="M12 10v6" />
// //       <path d="M9 13l3 3 3-3" />
// //     </svg>
// //   ),
// //   Crown: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M3 8l4 4 5-7 5 7 4-4v10H3V8Z" />
// //     </svg>
// //   ),
// //   Clipboard: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M9 4h6" />
// //       <path d="M9 4a2 2 0 0 0-2 2v2h10V6a2 2 0 0 0-2-2" />
// //       <path d="M7 8H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2" />
// //     </svg>
// //   ),
// //   Megaphone: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M3 11v2" />
// //       <path d="M5 10h5l8-4v12l-8-4H5" />
// //       <path d="M5 14l1 6h3l-1-6" />
// //     </svg>
// //   ),
// //   Traffic: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M12 3v18" />
// //       <path d="M8 7h8" />
// //       <path d="M8 12h8" />
// //       <path d="M8 17h8" />
// //       <circle cx="12" cy="7" r="1.3" />
// //       <circle cx="12" cy="12" r="1.3" />
// //       <circle cx="12" cy="17" r="1.3" />
// //     </svg>
// //   ),
// //   Alert: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M12 9v4" />
// //       <path d="M12 17h.01" />
// //       <path d="M10 3h4l8 16H2L10 3Z" />
// //     </svg>
// //   ),
// //   Box: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M21 8l-9-5-9 5 9 5 9-5Z" />
// //       <path d="M3 8v8l9 5 9-5V8" />
// //       <path d="M12 13v8" />
// //     </svg>
// //   ),
// //   Refund: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M3 12a9 9 0 1 0 3-6.7" />
// //       <path d="M3 4v6h6" />
// //       <path d="M8 13h8" />
// //     </svg>
// //   ),
// //   Logout: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M10 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5" />
// //       <path d="M17 16l4-4-4-4" />
// //       <path d="M21 12H10" />
// //     </svg>
// //   ),
// //   CollapseL: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M15 18l-6-6 6-6" />
// //     </svg>
// //   ),
// //   CollapseR: (p) => (
// //     <svg
// //       viewBox="0 0 24 24"
// //       fill="none"
// //       stroke="currentColor"
// //       strokeWidth="2"
// //       {...p}
// //     >
// //       <path d="M9 18l6-6-6-6" />
// //     </svg>
// //   ),
// // };

// import {
//   FiHome,
//   FiUser,
//   FiShoppingBag,
//   FiCreditCard,
//   FiDollarSign,
//   FiAward,
//   FiFileText,
//   FiBell,
//   FiActivity,
//   FiAlertTriangle,
//   FiPackage,
//   FiRotateCcw,
//   FiLogOut,
//   FiChevronLeft,
//   FiChevronRight,
//   FiMessageCircle,
//   FiLayers,
// } from "react-icons/fi";
// import { CiChat1 } from "react-icons/ci";

// /* ---------- Nav item (design only) ---------- */
// const NavItem = ({ to, icon: IconComp, label, collapsed, badge }) => (
//   <NavLink
//     to={to}
//     end={to === "/"}
//     className={({ isActive }) =>
//       [
//         "relative group flex items-center gap-3",
//         "px-3 py-2 rounded-2xl",
//         "transition-all duration-200",
//         "focus:outline-none",
//         isActive
//           ? "text-white bg-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.22)]"
//           : "text-white/60 hover:text-white hover:bg-white/8",
//       ].join(" ")
//     }
//     style={({ isActive }) =>
//       isActive
//         ? {
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//             boxShadow: "0 10px 26px rgba(240,45,101,0.22)",
//           }
//         : {}
//     }
//   >
//     <span className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5">
//       <IconComp className="w-5 h-5" />
//     </span>

//     {!collapsed && (
//       <span className="text-sm font-semibold flex-1 truncate">{label}</span>
//     )}

//     {!collapsed && badge > 0 && (
//       <span className="min-w-5 h-5 rounded-full bg-amber-300 text-gray-900 text-[10px] font-extrabold px-1 inline-flex items-center justify-center">
//         {badge > 99 ? "99+" : badge}
//       </span>
//     )}

//     {collapsed && (
//       <div className="absolute left-full ml-2 px-2 py-1 rounded-xl bg-slate-900 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
//         {label}
//       </div>
//     )}
//   </NavLink>
// );

// const SectionHeader = ({ label, collapsed }) =>
//   collapsed ? (
//     <div className="mx-3 my-3 h-px bg-white/10" />
//   ) : (
//     <p className="px-3 pt-5 pb-2 text-white/35 text-[11px] font-extrabold tracking-[0.18em] uppercase">
//       {label}
//     </p>
//   );

// export default function Sidebar({ open, collapsed, onCollapse, onClose }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((s) => s.auth);
//   const role = user?.role;

//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       await API.post("/auth/logout");
//     },
//     onSuccess: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//     onError: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//   });

//   const isSuperAdmin = role === "superAdmin";
//   const isMerchantAdmin = role === "merchantAdmin";

//   const sidebarW = collapsed ? 76 : 264;

//   return (
//     <aside
//       className="flex-shrink-0 h-screen flex flex-col fixed lg:relative z-40"
//       style={{
//         width: sidebarW,
//         background:
//           "radial-gradient(1200px 800px at 20% 0%, rgba(240,45,101,0.18), transparent 40%), linear-gradient(180deg,#0B1220 0%, #120A28 100%)",
//         transform: open ? "translateX(0)" : "translateX(-110%)",
//         transition: "transform 0.28s ease, width 0.28s ease",
//         boxShadow: "10px 0 40px rgba(0,0,0,0.35)",
//       }}
//     >
//       {/* Header */}
//       <div
//         className={[
//           "h-16 flex items-center border-b border-white/10",
//           collapsed ? "justify-center px-2" : "px-4 gap-3",
//         ].join(" ")}
//       >
//         <div
//           className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
//           style={{
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//             boxShadow: "0 10px 24px rgba(240,45,101,0.18)",
//           }}
//         >
//           <span className="text-white font-black">TS</span>
//         </div>

//         {!collapsed && (
//           <div className="min-w-0 flex-1">
//             <p className="text-white font-extrabold text-sm truncate">
//               TikTok Shop
//             </p>
//             <p className="text-white/40 text-[11px] truncate">Admin Panel</p>
//           </div>
//         )}

//         {!collapsed && (
//           <button
//             onClick={onCollapse}
//             className="hidden lg:flex w-9 h-9 rounded-2xl items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
//             aria-label="Collapse sidebar"
//           >
//             <I.CollapseL className="w-4 h-4" />
//           </button>
//         )}

//         <button
//           onClick={onClose}
//           className="lg:hidden w-9 h-9 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
//           aria-label="Close sidebar"
//         >
//           ×
//         </button>
//       </div>

//       {/* Expand button when collapsed */}
//       {collapsed && (
//         <button
//           onClick={onCollapse}
//           className="hidden lg:flex mx-auto mt-3 w-10 h-10 rounded-2xl items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
//           aria-label="Expand sidebar"
//         >
//           <I.CollapseR className="w-4 h-4" />
//         </button>
//       )}

//       {/* Nav */}
//       <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
//         <NavItem to="/" icon={FiHome} label="Dashboard" collapsed={collapsed} />

//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="General" collapsed={collapsed} />
//             <NavItem
//               to="/profile"
//               icon={I.User}
//               label="Profile"
//               collapsed={collapsed}
//             />
//             <NavItem
//               to="/chat"
//               icon="💬"
//               label="Customer Service"
//               collapsed={collapsed}
//             />
//           </>
//         )}

//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="Merchants" collapsed={collapsed} />
//             <NavItem
//               to="/merchants"
//               icon={I.Store}
//               label="Merchant List"
//               collapsed={collapsed}
//             />
//             <NavItem
//               to="/merchants/funds"
//               icon={I.Wallet}
//               label="Fund Details"
//               collapsed={collapsed}
//             />

//             {isSuperAdmin && (
//               <>
//                 <NavItem
//                   to="/merchants/recharges"
//                   icon={I.Card}
//                   label="Recharge Records"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/withdrawals"
//                   icon={I.CashOut}
//                   label="Withdrawals"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/level-app"
//                   icon={I.Crown}
//                   label="Level Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/applications"
//                   icon={I.Clipboard}
//                   label="Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/showcase"
//                   icon={I.Store}
//                   label="Showcase"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/levels"
//                   icon={I.Crown}
//                   label="VIP Levels"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/notices"
//                   icon={I.Megaphone}
//                   label="Notices"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/traffic"
//                   icon={I.Traffic}
//                   label="Traffic Tasks"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/complaints"
//                   icon={I.Alert}
//                   label="Complaints"
//                   collapsed={collapsed}
//                 />
//               </>
//             )}

//             {isMerchantAdmin && (
//               <NavItem
//                 to="/merchants/withdrawals"
//                 icon={I.CashOut}
//                 label="Withdrawals"
//                 collapsed={collapsed}
//               />
//             )}
//           </>
//         )}

//         <SectionHeader label="Orders" collapsed={collapsed} />
//         <NavItem
//           to="/orders"
//           icon={I.Box}
//           label="Order List"
//           collapsed={collapsed}
//         />
//         {isSuperAdmin && (
//           <NavItem
//             to="/orders/refunds"
//             icon={I.Refund}
//             label="Refund Orders"
//             collapsed={collapsed}
//           />
//         )}
//       </nav>

//       {/* Footer */}
//       <div
//         className={[
//           "border-t border-white/10 p-3",
//           collapsed ? "flex justify-center" : "",
//         ].join(" ")}
//       >
//         {collapsed ? (
//           <button
//             onClick={() => logoutMutation.mutate()}
//             className="w-10 h-10 rounded-2xl bg-white/8 flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/10 transition"
//             title="Logout"
//           >
//             <I.Logout className="w-4 h-4" />
//           </button>
//         ) : (
//           <div className="flex items-center gap-3">
//             <div
//               className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold"
//               style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//             >
//               {user?.username?.[0]?.toUpperCase() || "A"}
//             </div>

//             <div className="min-w-0 flex-1">
//               <p className="text-white text-sm font-semibold truncate">
//                 {user?.username}
//               </p>
//               <p className="text-white/45 text-[11px] truncate">{user?.role}</p>
//             </div>

//             <button
//               onClick={() => logoutMutation.mutate()}
//               className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/10 transition"
//               title="Logout"
//             >
//               <I.Logout className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }

/////////////// ======================== third version =====================////////////////////////////// src/layout/Sidebar.jsx  (DESIGN ONLY)
// import { NavLink, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import { useMutation } from "@tanstack/react-query";
// import { logout } from "../../store/authSlice";
// import API from "../../api/axios";

// /* ✅ Professional SaaS Icons (react-icons/fi) */
// import {
//   FiHome,
//   FiUser,
//   FiShoppingBag,
//   FiCreditCard,
//   FiDollarSign,
//   FiAward,
//   FiFileText,
//   FiBell,
//   FiActivity,
//   FiAlertTriangle,
//   FiPackage,
//   FiRotateCcw,
//   FiLogOut,
//   FiChevronLeft,
//   FiChevronRight,
//   FiMessageCircle,
//   FiLayers,
// } from "react-icons/fi";
// import { PiHandWithdrawFill } from "react-icons/pi";

// /* ---------- Icons (design only) ---------- */
// const I = {
//   Dashboard: FiHome,
//   User: FiUser,
//   Store: FiShoppingBag,
//   Wallet: FiDollarSign,
//   Card: FiCreditCard,
//   CashOut: PiHandWithdrawFill,
//   Crown: FiAward,
//   Clipboard: FiFileText,
//   Megaphone: FiBell,
//   Traffic: FiActivity,
//   Alert: FiAlertTriangle,
//   Box: FiPackage,
//   Refund: FiRotateCcw,
//   Logout: FiLogOut,
//   CollapseL: FiChevronLeft,
//   CollapseR: FiChevronRight,
//   Chat: FiMessageCircle,
//   Showcase: FiLayers,
// };

// /* ---------- Nav item (design only) ---------- */
// const NavItem = ({ to, icon: IconComp, label, collapsed, badge }) => (
//   <NavLink
//     to={to}
//     end={to === "/"}
//     className={({ isActive }) =>
//       [
//         "relative group flex items-center gap-3",
//         "px-3 py-2 rounded-2xl",
//         "transition-all duration-200",
//         "focus:outline-none",
//         isActive
//           ? "text-white bg-white/10 shadow-[0_10px_26px_rgba(0,0,0,0.22)]"
//           : "text-white/60 hover:text-white hover:bg-white/8",
//       ].join(" ")
//     }
//     style={({ isActive }) =>
//       isActive
//         ? {
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//             boxShadow: "0 10px 26px rgba(240,45,101,0.22)",
//           }
//         : {}
//     }
//   >
//     <span className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 bg-white/5">
//       {/* react-icons components accept className */}
//       <IconComp className="w-5 h-5" />
//     </span>

//     {!collapsed && (
//       <span className="text-sm font-semibold flex-1 truncate">{label}</span>
//     )}

//     {!collapsed && badge > 0 && (
//       <span className="min-w-5 h-5 rounded-full bg-amber-300 text-gray-900 text-[10px] font-extrabold px-1 inline-flex items-center justify-center">
//         {badge > 99 ? "99+" : badge}
//       </span>
//     )}

//     {collapsed && (
//       <div className="absolute left-full ml-2 px-2 py-1 rounded-xl bg-slate-900 text-white text-xs opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
//         {label}
//       </div>
//     )}
//   </NavLink>
// );

// const SectionHeader = ({ label, collapsed }) =>
//   collapsed ? (
//     <div className="mx-3 my-3 h-px bg-white/10" />
//   ) : (
//     <p className="px-3 pt-5 pb-2 text-white/35 text-[11px] font-extrabold tracking-[0.18em] uppercase">
//       {label}
//     </p>
//   );

// export default function Sidebar({ open, collapsed, onCollapse, onClose }) {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user } = useSelector((s) => s.auth);
//   const role = user?.role;

//   const logoutMutation = useMutation({
//     mutationFn: async () => {
//       await API.post("/auth/logout");
//     },
//     onSuccess: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//     onError: () => {
//       dispatch(logout());
//       navigate("/login");
//     },
//   });

//   const isSuperAdmin = role === "superAdmin";
//   const isMerchantAdmin = role === "merchantAdmin";

//   const sidebarW = collapsed ? 76 : 264;

//   return (
//     <aside
//       className="flex-shrink-0 h-screen flex flex-col fixed lg:relative z-40"
//       style={{
//         width: sidebarW,
//         background:
//           "radial-gradient(1200px 800px at 20% 0%, rgba(240,45,101,0.18), transparent 40%), linear-gradient(180deg,#0B1220 0%, #120A28 100%)",
//         transform: open ? "translateX(0)" : "translateX(-110%)",
//         transition: "transform 0.28s ease, width 0.28s ease",
//         boxShadow: "10px 0 40px rgba(0,0,0,0.35)",
//       }}
//     >
//       {/* Header */}
//       <div
//         className={[
//           "h-16 flex items-center border-b border-white/10",
//           collapsed ? "justify-center px-2" : "px-4 gap-3",
//         ].join(" ")}
//       >
//         <div
//           className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
//           style={{
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//             boxShadow: "0 10px 24px rgba(240,45,101,0.18)",
//           }}
//         >
//           <span className="text-white font-black">TS</span>
//         </div>

//         {!collapsed && (
//           <div className="min-w-0 flex-1">
//             <p className="text-white font-extrabold text-sm truncate">
//               TikTok Shop
//             </p>
//             <p className="text-white/40 text-[11px] truncate">Admin Panel</p>
//           </div>
//         )}

//         {!collapsed && (
//           <button
//             onClick={onCollapse}
//             className="hidden lg:flex w-9 h-9 rounded-2xl items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
//             aria-label="Collapse sidebar"
//           >
//             <I.CollapseL className="w-4 h-4" />
//           </button>
//         )}

//         <button
//           onClick={onClose}
//           className="lg:hidden w-9 h-9 rounded-2xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition"
//           aria-label="Close sidebar"
//         >
//           ×
//         </button>
//       </div>

//       {/* Expand button when collapsed */}
//       {collapsed && (
//         <button
//           onClick={onCollapse}
//           className="hidden lg:flex mx-auto mt-3 w-10 h-10 rounded-2xl items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition"
//           aria-label="Expand sidebar"
//         >
//           <I.CollapseR className="w-4 h-4" />
//         </button>
//       )}

//       {/* Nav */}
//       <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-1">
//         <NavItem
//           to="/"
//           icon={I.Dashboard}
//           label="Dashboard"
//           collapsed={collapsed}
//         />

//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="General" collapsed={collapsed} />
//             <NavItem
//               to="/profile"
//               icon={I.User}
//               label="Profile"
//               collapsed={collapsed}
//             />
//             <NavItem
//               to="/chat"
//               icon={I.Chat}
//               label="Customer Service"
//               collapsed={collapsed}
//             />
//           </>
//         )}

//         {(isSuperAdmin || isMerchantAdmin) && (
//           <>
//             <SectionHeader label="Merchants" collapsed={collapsed} />
//             <NavItem
//               to="/merchants"
//               icon={I.Store}
//               label="Merchant List"
//               collapsed={collapsed}
//             />
//             <NavItem
//               to="/merchants/funds"
//               icon={I.Wallet}
//               label="Fund Details"
//               collapsed={collapsed}
//             />

//             {isSuperAdmin && (
//               <>
//                 <NavItem
//                   to="/merchants/recharges"
//                   icon={I.Card}
//                   label="Recharge Records"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/withdrawals"
//                   icon={I.CashOut}
//                   label="Withdrawals"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/level-app"
//                   icon={I.Crown}
//                   label="Level Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/applications"
//                   icon={I.Clipboard}
//                   label="Applications"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/showcase"
//                   icon={I.Showcase}
//                   label="Showcase"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/levels"
//                   icon={I.Crown}
//                   label="VIP Levels"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/notices"
//                   icon={I.Megaphone}
//                   label="Notices"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/traffic"
//                   icon={I.Traffic}
//                   label="Traffic Tasks"
//                   collapsed={collapsed}
//                 />
//                 <NavItem
//                   to="/merchants/complaints"
//                   icon={I.Alert}
//                   label="Complaints"
//                   collapsed={collapsed}
//                 />
//               </>
//             )}

//             {isMerchantAdmin && (
//               <NavItem
//                 to="/merchants/withdrawals"
//                 icon={I.CashOut}
//                 label="Withdrawals"
//                 collapsed={collapsed}
//               />
//             )}
//           </>
//         )}

//         <SectionHeader label="Orders" collapsed={collapsed} />
//         <NavItem
//           to="/orders"
//           icon={I.Box}
//           label="Order List"
//           collapsed={collapsed}
//         />
//         {isSuperAdmin && (
//           <NavItem
//             to="/orders/refunds"
//             icon={I.Refund}
//             label="Refund Orders"
//             collapsed={collapsed}
//           />
//         )}
//       </nav>

//       {/* Footer */}
//       <div
//         className={[
//           "border-t border-white/10 p-3",
//           collapsed ? "flex justify-center" : "",
//         ].join(" ")}
//       >
//         {collapsed ? (
//           <button
//             onClick={() => logoutMutation.mutate()}
//             className="w-10 h-10 rounded-2xl bg-white/8 flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/10 transition"
//             title="Logout"
//           >
//             <I.Logout className="w-4 h-4" />
//           </button>
//         ) : (
//           <div className="flex items-center gap-3">
//             <div
//               className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold"
//               style={{ background: "linear-gradient(135deg,#f02d65,#ff6035)" }}
//             >
//               {user?.username?.[0]?.toUpperCase() || "A"}
//             </div>

//             <div className="min-w-0 flex-1">
//               <p className="text-white text-sm font-semibold truncate">
//                 {user?.username}
//               </p>
//               <p className="text-white/45 text-[11px] truncate">{user?.role}</p>
//             </div>

//             <button
//               onClick={() => logoutMutation.mutate()}
//               className="w-10 h-10 rounded-2xl flex items-center justify-center text-white/60 hover:text-red-300 hover:bg-red-500/10 transition"
//               title="Logout"
//             >
//               <I.Logout className="w-4 h-4" />
//             </button>
//           </div>
//         )}
//       </div>
//     </aside>
//   );
// }

///////////////============================== fourth version by (notebookLM) ================================///////////////

// import React, { useState } from "react";
// import { Link, useLocation } from "react-router-dom";

// export default function Sidebar({ user, isMobileOpen, setIsMobileOpen }) {
//   const location = useLocation();
//   const [searchQuery, setSearchQuery] = useState("");
//   // By default, open these accordion menus to match the demo
//   const [openMenus, setOpenMenus] = useState([
//     "General Management",
//     "Merchant Management",
//     "Order Management",
//     "Attendance management",
//   ]);

//   const toggleMenu = (title) => {
//     setOpenMenus((prev) =>
//       prev.includes(title)
//         ? prev.filter((item) => item !== title)
//         : [...prev, title],
//     );
//   };

//   // Menu Configuration (with role-based access control)
//   const menuItems = [
//     {
//       title: "Dashboard",
//       path: "/dashboard",
//       roles: ["superAdmin", "merchantAdmin", "dispatchAdmin"],
//       badge: "hot",
//       icon: (
//         <svg
//           className="w-[18px] h-[18px]"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="1.5"
//             d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//           />
//         </svg>
//       ),
//     },
//     {
//       title: "General Management",
//       roles: ["superAdmin", "merchantAdmin", "dispatchAdmin"],
//       icon: (
//         <svg
//           className="w-[18px] h-[18px]"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="1.5"
//             d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//           />
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="1.5"
//             d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//           />
//         </svg>
//       ),
//       children: [
//         {
//           title: "Profile",
//           path: "/profile",
//           icon: (
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="1.5"
//                 d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//               />
//             </svg>
//           ),
//         },
//       ],
//     },
//     {
//       title: "Merchant Management",
//       roles: ["superAdmin", "merchantAdmin"],
//       icon: (
//         <svg
//           className="w-[18px] h-[18px]"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="1.5"
//             d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
//           />
//         </svg>
//       ),
//       children: [
//         { title: "Merchant List", path: "/merchants", icon: <HomeIcon /> },
//         {
//           title: "Fund Details",
//           path: "/merchants/funds",
//           icon: <DiamondIcon />,
//         },
//         {
//           title: "Merchant complaints",
//           path: "/merchants/complaints",
//           icon: <ChatIcon />,
//         },
//         {
//           title: "Level application",
//           path: "/merchants/level-app",
//           icon: <ScreenIcon />,
//         },
//         {
//           title: "Merchant Application",
//           path: "/merchants/applications",
//           icon: <AppIcon />,
//         },
//         {
//           title: "Merchant Showcase",
//           path: "/merchants/showcase",
//           icon: <ShowcaseIcon />,
//         },
//         {
//           title: "Merchant Level",
//           path: "/merchants/levels",
//           icon: <LevelIcon />,
//         },
//         {
//           title: "Merchant Notice",
//           path: "/merchants/notices",
//           icon: <NoticeIcon />,
//         },
//         {
//           title: "Merchant Recharge Records",
//           path: "/merchants/recharges",
//           icon: <RechargeIcon />,
//         },
//         {
//           title: "Merchant Withdrawal Manage",
//           path: "/merchants/withdrawals",
//           icon: <DollarIcon />,
//         },
//         {
//           title: "Traffic Task",
//           path: "/merchants/traffic",
//           icon: <CircleIcon />,
//         },
//       ],
//     },
//     {
//       title: "Order Management",
//       roles: ["superAdmin", "merchantAdmin", "dispatchAdmin"],
//       icon: (
//         <svg
//           className="w-[18px] h-[18px]"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="1.5"
//             d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
//           />
//         </svg>
//       ),
//       children: [
//         { title: "Order List", path: "/orders", icon: <ListIcon /> },
//         { title: "Refund Order", path: "/refund-orders", icon: <RefundIcon /> },
//       ],
//     },
//     {
//       title: "Attendance management",
//       roles: ["superAdmin"],
//       icon: (
//         <svg
//           className="w-[18px] h-[18px]"
//           fill="none"
//           stroke="currentColor"
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             strokeWidth="1.5"
//             d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
//           />
//         </svg>
//       ),
//       children: [
//         {
//           title: "Attendance records",
//           path: "/attendance",
//           icon: <CircleIcon />,
//         },
//       ],
//     },
//   ];

//   // Filter items based on user role and search query
//   const filteredMenus = menuItems
//     .filter((item) => !item.roles || item.roles.includes(user?.role))
//     .map((item) => {
//       if (!item.children) return item;
//       const filteredChildren = item.children.filter((child) =>
//         child.title.toLowerCase().includes(searchQuery.toLowerCase()),
//       );
//       return { ...item, children: filteredChildren };
//     })
//     .filter(
//       (item) =>
//         item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         (item.children && item.children.length > 0),
//     );

//   return (
//     <>
//       {/* Mobile backdrop */}
//       {isMobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-40 lg:hidden"
//           onClick={() => setIsMobileOpen(false)}
//         />
//       )}

//       {/* Sidebar Container */}
//       <aside
//         className={`fixed lg:static top-0 left-0 h-full w-[260px] bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
//           isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//         }`}
//       >
//         {/* User Profile Block (Matches Demo) */}
//         <div className="flex flex-col items-center py-6 border-b border-gray-100">
//           <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden mb-3">
//             <img
//               src={
//                 user?.avatar ||
//                 "https://ui-avatars.com/api/?name=" +
//                   (user?.username || "Admin") +
//                   "&background=e2e8f0&color=94a3b8"
//               }
//               alt="avatar"
//               className="w-full h-full object-cover"
//             />
//           </div>
//           <h3 className="text-gray-700 font-medium text-[15px]">
//             {user?.nickname || user?.username || "Admin"}
//           </h3>
//           <div className="flex items-center text-[13px] text-gray-500 mt-1">
//             <span className="w-2.5 h-2.5 bg-teal-500 rounded-full mr-1.5"></span>
//             Online
//           </div>
//         </div>

//         {/* Search Bar */}
//         <div className="px-4 py-3">
//           <div className="relative">
//             <input
//               type="text"
//               placeholder="Search menu"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="w-full bg-gray-50 border border-gray-200 text-sm rounded-[4px] px-3 py-1.5 focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-400 transition-colors"
//             />
//             <svg
//               className="w-4 h-4 absolute right-3 top-2 text-gray-400"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
//               />
//             </svg>
//           </div>
//         </div>

//         {/* Navigation Links */}
//         <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
//           <nav className="space-y-0.5">
//             {filteredMenus.map((item, index) => (
//               <div key={index}>
//                 {/* Parent Menu Item / Single Link */}
//                 {item.path ? (
//                   <Link
//                     to={item.path}
//                     className={`flex items-center px-5 py-3 text-[14px] transition-colors ${
//                       location.pathname === item.path
//                         ? "bg-blue-50/50 text-blue-600 font-medium"
//                         : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
//                     }`}
//                   >
//                     <span className="mr-3 text-gray-500">{item.icon}</span>
//                     <span className="flex-1">{item.title}</span>
//                     {item.badge === "hot" && (
//                       <span className="ml-auto bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
//                         hot
//                       </span>
//                     )}
//                   </Link>
//                 ) : (
//                   /* Accordion Parent */
//                   <button
//                     onClick={() => toggleMenu(item.title)}
//                     className="w-full flex items-center px-5 py-3 text-[14px] text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
//                   >
//                     <span className="mr-3 text-gray-500">{item.icon}</span>
//                     <span className="flex-1 text-left">{item.title}</span>
//                     <svg
//                       className={`w-4 h-4 text-gray-400 transition-transform ${
//                         openMenus.includes(item.title) ? "rotate-90" : ""
//                       }`}
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth="2"
//                         d="M9 5l7 7-7 7"
//                       />
//                     </svg>
//                   </button>
//                 )}

//                 {/* Children Items */}
//                 {item.children && openMenus.includes(item.title) && (
//                   <div className="bg-gray-50/30">
//                     {item.children.map((child, idx) => {
//                       const isActive = location.pathname === child.path;
//                       return (
//                         <Link
//                           key={idx}
//                           to={child.path}
//                           className={`flex items-center pl-[44px] pr-4 py-2.5 text-[13px] transition-colors ${
//                             isActive
//                               ? "text-gray-900 font-semibold"
//                               : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
//                           }`}
//                         >
//                           <span
//                             className={`mr-2 ${
//                               isActive ? "text-gray-900" : "text-gray-400"
//                             }`}
//                           >
//                             {child.icon}
//                           </span>
//                           {child.title}
//                         </Link>
//                       );
//                     })}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </nav>
//         </div>
//       </aside>
//     </>
//   );
// }

// // // ----------------------------------------------------------------------
// // // Demo-Specific Mini SVG Icons for sub-menus
// // // ----------------------------------------------------------------------
// // const HomeIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
// //     />
// //   </svg>
// // );
// // const DiamondIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //     />
// //   </svg>
// // );
// // const ChatIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
// //     />
// //   </svg>
// // );
// // const ScreenIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
// //     />
// //   </svg>
// // );
// // const AppIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
// //     />
// //   </svg>
// // );
// // const ShowcaseIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
// //     />
// //   </svg>
// // );
// // const LevelIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
// //     />
// //   </svg>
// // );
// // const NoticeIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
// //     />
// //   </svg>
// // );
// // const RechargeIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
// //     />
// //   </svg>
// // );
// // const DollarIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
// //     />
// //   </svg>
// // );
// // const CircleIcon = () => (
// //   <svg
// //     className="w-3 h-3"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <circle cx="12" cy="12" r="10" strokeWidth="2" />
// //   </svg>
// // );
// // const ListIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M4 6h16M4 10h16M4 14h16M4 18h16"
// //     />
// //   </svg>
// // );
// // const RefundIcon = () => (
// //   <svg
// //     className="w-3.5 h-3.5"
// //     fill="none"
// //     stroke="currentColor"
// //     viewBox="0 0 24 24"
// //   >
// //     <path
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //       strokeWidth="2"
// //       d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z"
// //     />
// //   </svg>
// // );

/////////////////  =========================  latest version by gemeni pro ================= //////////////////////
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../store/authSlice";
import API from "../../api/axios";

// ── Icons (Premium SaaS Grade) ────────────────────────────────
import {
  LayoutDashboard, // Dashboard
  SlidersHorizontal, // System Configuration (Group)
  CircleUser, // Profile
  Headset, // Customer Service
  Settings2, // Platform Settings
  ShieldCheck, // Admin Management
  Workflow, // Affiliate Network
  Boxes, // Distribution Center
  Building2, // Merchant Management (Group)
  TableProperties, // Merchant List
  CircleDollarSign, // Fund Details
  WalletCards, // Recharge Records
  Landmark, // Withdrawal Records
  FileBadge, // Level Applications
  Gem, // VIP Level Settings
  Sparkles, // Store Showcase
  TrendingUp, // Traffic Tasks
  Megaphone, // System Notices
  ShieldAlert, // Complaints & Appeals
  CalendarDays, // Attendance Records
  PackageOpen, // Order Operations (Group)
  ListOrdered, // Order Tracking
  Undo2, // Refund Interventions
  LogOut, // Logout
  ChevronDown, // UI Element
  Search, // UI Element
  ShoppingBag, // Logo
} from "lucide-react";

// ── Nav item component ────────────────────────────────────────
const NavItem = ({
  to,
  icon: Icon,
  label,
  collapsed,
  badge,
  isSubItem = false,
}) => (
  <NavLink
    style={{ paddingTop: "8px", paddingBottom: "8px", marginLeft: "5px" }}
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      `flex items-center gap-3 py-2.5 transition-all duration-200 group relative
      ${collapsed ? "justify-center px-2" : isSubItem ? "pl-11 pr-4" : "px-4"}
      ${
        isActive
          ? "text-orange-600 bg-orange-50/80 font-semibold border-r-[3px] border-orange-500"
          : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
      }`
    }
  >
    <Icon
      className={`flex-shrink-0 transition-transform text-lg  text-gray-500 group-hover:scale-110 ${isSubItem ? "w-4 h-4" : "w-4.5 h-4.5"}`}
    />

    {!collapsed && (
      <span
        className={`flex-1 truncate ${isSubItem ? "text-[13px]" : "text-sm"}`}
      >
        {label}
      </span>
    )}

    {!collapsed && badge > 0 && (
      <span className="min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 ">
        {badge > 99 ? "99+" : badge}
      </span>
    )}

    {collapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-800 text-white text-xs font-medium rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </NavLink>
);

// ── Accordion Group Component ─────────────────────────────────
const AccordionGroup = ({
  icon: Icon,
  title,
  children,
  collapsed,
  isOpen,
  onToggle,
}) => {
  if (collapsed) {
    return <div className="py-1 border-t border-gray-100/50">{children}</div>;
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={onToggle}
        className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full group"
      >
        <div
          style={{
            paddingTop: "5px",
            paddingBottom: "5px",
            borderRadius: "10px",
          }}
          className="flex items-center gap-3"
        >
          <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span>{title}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Smoothly expand/collapse wrapper */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"}`}
      >
        <div className="flex flex-col pb-2 space-y-0.5">{children}</div>
      </div>
    </div>
  );
};

export default function Sidebar({ open, collapsed, onCollapse, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;
  const [searchQuery, setSearchQuery] = useState("");

  const [openSections, setOpenSections] = useState({
    system: false,
    merchants: true, // Kept open by default like the demo
    orders: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const logoutMutation = useMutation({
    mutationFn: async () => await API.post("/auth/logout"),
    onSettled: () => {
      dispatch(logout());
      navigate("/login");
    },
  });

  const isSuperAdmin = role === "superAdmin";
  const isMerchantAdmin = role === "merchantAdmin";

  const sidebarW = collapsed ? 72 : 260;

  return (
    <aside
      className="flex-shrink-0 h-screen flex flex-col z-40 fixed lg:relative border-r border-gray-200 bg-white"
      style={{
        padding: "7px",
        width: sidebarW,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition:
          "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* ── Header / Logo ── */}
      <div
        className={`flex items-center h-14 flex-shrink-0 border-b border-gray-100 ${collapsed ? "justify-center" : "px-5 gap-3"}`}
      >
        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center flex-shrink-0 ">
          <ShoppingBag className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-bold text-[15px] truncate tracking-tight">
              TikTok Shop
            </p>
          </div>
        )}
        <button
          onClick={onClose}
          className="lg:hidden w-8 h-8 flex items-center text-xl justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* ── Search Bar ── */}
      {!collapsed && (
        <div className="p-4 pb-2">
          <div className="relative group">
            <input
              style={{ padding: "5px" }}
              type="text"
              placeholder="Search menu"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50/50 border border-gray-200 text-[13px] text-gray-700 rounded-lg py-2 pl-3 pr-9 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all "
            />
            <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5 group-focus-within:text-orange-500 transition-colors" />
          </div>
        </div>
      )}

      {/* ── Nav Links ── */}
      <nav
        style={{ paddingTop: "20px", paddingBottom: "20px" }}
        className="flex-1 overflow-y-auto py-3 flex flex-col custom-scrollbar"
      >
        <NavItem
          style={{ padding: "5px" }}
          to="/"
          icon={LayoutDashboard}
          label="Dashboard"
          collapsed={collapsed}
        />

        {/* 1. SYSTEM & PLATFORM SETTINGS */}
        {(isSuperAdmin || isMerchantAdmin) && (
          <AccordionGroup
            icon={SlidersHorizontal}
            title="System Configuration"
            collapsed={collapsed}
            isOpen={openSections.system}
            onToggle={() => toggleSection("system")}
          >
            <NavItem
              to="/profile"
              icon={CircleUser}
              label="My Profile"
              collapsed={collapsed}
              isSubItem={true}
            />
            <NavItem
              to="/chat"
              icon={Headset}
              label="Customer Service"
              collapsed={collapsed}
              isSubItem={true}
            />
            {isSuperAdmin && (
              <>
                <NavItem
                  to="/settings"
                  icon={Settings2}
                  label="Platform Settings"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/admin-management"
                  icon={ShieldCheck}
                  label="Admin Management"
                  collapsed={collapsed}
                  isSubItem={true}
                />
              </>
            )}
            <NavItem
              to="/team"
              icon={Workflow}
              label="Affiliate Network"
              collapsed={collapsed}
              isSubItem={true}
            />
            <NavItem
              to="/product-pool"
              icon={Boxes}
              label="Distribution Center"
              collapsed={collapsed}
              isSubItem={true}
            />
          </AccordionGroup>
        )}

        {/* 2. MERCHANT MANAGEMENT */}
        {(isSuperAdmin || isMerchantAdmin) && (
          <AccordionGroup
            icon={Building2}
            title="Merchant Management"
            collapsed={collapsed}
            isOpen={openSections.merchants}
            onToggle={() => toggleSection("merchants")}
          >
            <NavItem
              to="/merchants"
              icon={TableProperties}
              label="Merchant List"
              collapsed={collapsed}
              isSubItem={true}
            />
            <NavItem
              to="/merchants/funds"
              icon={CircleDollarSign}
              label="Fund Details"
              collapsed={collapsed}
              isSubItem={true}
            />

            {isSuperAdmin && (
              <>
                <NavItem
                  to="/merchants/recharges"
                  icon={WalletCards}
                  label="Recharge Records"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/withdrawals"
                  icon={Landmark}
                  label="Withdrawal Records"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/level-app"
                  icon={FileBadge}
                  label="Level Applications"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/levels"
                  icon={Gem}
                  label="VIP Level Settings"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/showcase"
                  icon={Sparkles}
                  label="Store Showcase"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/traffic"
                  icon={TrendingUp}
                  label="Traffic Tasks"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/notices"
                  icon={Megaphone}
                  label="System Notices"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/merchants/complaints"
                  icon={ShieldAlert}
                  label="Complaints & Appeals"
                  collapsed={collapsed}
                  isSubItem={true}
                />
                <NavItem
                  to="/attendance-records"
                  icon={CalendarDays}
                  label="Attendance Records"
                  collapsed={collapsed}
                  isSubItem={true}
                />
              </>
            )}

            {isMerchantAdmin && !isSuperAdmin && (
              <NavItem
                to="/merchants/withdrawals"
                icon={Landmark}
                label="Withdrawal Reviews"
                collapsed={collapsed}
                isSubItem={true}
              />
            )}
          </AccordionGroup>
        )}

        {/* 3. ORDER MANAGEMENT */}
        <AccordionGroup
          icon={PackageOpen}
          title="Order Operations"
          collapsed={collapsed}
          isOpen={openSections.orders}
          onToggle={() => toggleSection("orders")}
        >
          <NavItem
            to="/orders"
            icon={ListOrdered}
            label="Order Tracking"
            collapsed={collapsed}
            isSubItem={true}
          />
          {isSuperAdmin && (
            <NavItem
              to="/refund-orders"
              icon={Undo2}
              label="Refund Interventions"
              collapsed={collapsed}
              isSubItem={true}
            />
          )}
        </AccordionGroup>
      </nav>

      {/* ── Footer / Logout ── */}
      <div className="flex-shrink-0 border-t border-gray-100 p-4 bg-gray-50/50">
        <button
          style={{ padding: "5px" }}
          onClick={() => logoutMutation.mutate()}
          className="w-full cursor-pointer hover:bg-orange-200 bg-orange-100 flex text-lg  items-center gap-3 justify-start border border-gray-200 text-[13px] text-orange-600 font-bold rounded-sm py-2 pl-3 pr-9 focus:outline-none focus:ring-2 transition-all shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && (
            <span className="font-medium text-[13px]">Logout</span>
          )}
        </button>
      </div>
    </aside>
  );
}
