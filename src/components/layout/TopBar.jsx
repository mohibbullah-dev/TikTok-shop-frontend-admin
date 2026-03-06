// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// export default function TopBar({ onMenuToggle }) {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);

//   // Pending recharge count
//   const { data: rechargeData } = useQuery({
//     queryKey: ["pendingRecharges"],
//     queryFn: async () => {
//       const { data } = await API.get("/recharge?status=pending&limit=1");
//       return data;
//     },
//     enabled: user?.role === "superAdmin",
//     refetchInterval: 30000,
//   });

//   // Pending withdrawal count
//   const { data: withdrawalData } = useQuery({
//     queryKey: ["pendingWithdrawals"],
//     queryFn: async () => {
//       const { data } = await API.get("/withdrawal?status=pending&limit=1");
//       return data;
//     },
//     enabled: ["superAdmin", "merchantAdmin"].includes(user?.role),
//     refetchInterval: 30000,
//   });

//   const pendingRecharges = rechargeData?.total || 0;
//   const pendingWithdrawals = withdrawalData?.total || 0;

//   const handleWipeCache = () => {
//     queryClient.invalidateQueries();
//     toast.success("Cache cleared!");
//   };

//   const roleColors = {
//     superAdmin: { bg: "#fef3c7", text: "#92400e", label: "Super Admin" },
//     merchantAdmin: { bg: "#dbeafe", text: "#1e40af", label: "Merchant Admin" },
//     dispatchAdmin: { bg: "#d1fae5", text: "#065f46", label: "Dispatch Admin" },
//   };
//   const rc = roleColors[user?.role] || roleColors.superAdmin;

//   return (
//     <header
//       className="h-16 flex-shrink-0 flex items-center
//       justify-between px-4 md:px-6 border-b border-gray-200 bg-white"
//       style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
//     >
//       {/* Left: hamburger + breadcrumb */}
//       <div className="flex items-center gap-3">
//         {/* Menu toggle */}
//         <button
//           onClick={onMenuToggle}
//           className="w-9 h-9 rounded-xl flex items-center justify-center
//             text-gray-500 hover:text-gray-800 hover:bg-gray-100
//             transition-all"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             className="w-5 h-5"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <line x1="3" y1="6" x2="21" y2="6" />
//             <line x1="3" y1="12" x2="21" y2="12" />
//             <line x1="3" y1="18" x2="21" y2="18" />
//           </svg>
//         </button>

//         {/* Role badge — md+ */}
//         <span
//           className="hidden md:inline-flex items-center px-3 py-1
//           rounded-full text-xs font-bold"
//           style={{ background: rc.bg, color: rc.text }}
//         >
//           {rc.label}
//         </span>
//       </div>

//       {/* Right: action buttons */}
//       <div className="flex items-center gap-2">
//         {/* Recharge badge */}
//         {user?.role === "superAdmin" && (
//           <button
//             onClick={() => navigate("/merchants/recharges")}
//             className="relative flex items-center gap-1.5 px-3 py-2
//               rounded-xl text-xs font-semibold transition-all
//               hover:scale-105 active:scale-95"
//             style={{
//               background:
//                 pendingRecharges > 0
//                   ? "linear-gradient(135deg,#22c55e,#16a34a)"
//                   : "#f3f4f6",
//               color: pendingRecharges > 0 ? "white" : "#6b7280",
//               boxShadow:
//                 pendingRecharges > 0
//                   ? "0 4px 12px rgba(34,197,94,0.35)"
//                   : "none",
//             }}
//           >
//             <span>💳</span>
//             <span className="hidden sm:inline">Recharge</span>
//             {pendingRecharges > 0 && (
//               <span
//                 className="min-w-[18px] h-[18px] rounded-full
//                 bg-yellow-400 text-gray-900 text-[9px] font-bold
//                 flex items-center justify-center px-1"
//               >
//                 {pendingRecharges}
//               </span>
//             )}
//           </button>
//         )}

//         {/* Withdrawal badge */}
//         {["superAdmin", "merchantAdmin"].includes(user?.role) && (
//           <button
//             onClick={() => navigate("/merchants/withdrawals")}
//             className="relative flex items-center gap-1.5 px-3 py-2
//               rounded-xl text-xs font-semibold transition-all
//               hover:scale-105 active:scale-95"
//             style={{
//               background:
//                 pendingWithdrawals > 0
//                   ? "linear-gradient(135deg,#f02d65,#ff6035)"
//                   : "#f3f4f6",
//               color: pendingWithdrawals > 0 ? "white" : "#6b7280",
//               boxShadow:
//                 pendingWithdrawals > 0
//                   ? "0 4px 12px rgba(240,45,101,0.35)"
//                   : "none",
//             }}
//           >
//             <span>💸</span>
//             <span className="hidden sm:inline">Withdrawal</span>
//             {pendingWithdrawals > 0 && (
//               <span
//                 className="min-w-[18px] h-[18px] rounded-full
//                 bg-yellow-400 text-gray-900 text-[9px] font-bold
//                 flex items-center justify-center px-1"
//               >
//                 {pendingWithdrawals}
//               </span>
//             )}
//           </button>
//         )}

//         {/* Home */}
//         <button
//           onClick={() => navigate("/")}
//           className="w-9 h-9 rounded-xl flex items-center justify-center
//             text-gray-500 hover:text-gray-800 hover:bg-gray-100
//             transition-all"
//           title="Dashboard"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
//             <polyline points="9 22 9 12 15 12 15 22" />
//           </svg>
//         </button>

//         {/* Wipe Cache */}
//         <button
//           onClick={handleWipeCache}
//           className="w-9 h-9 rounded-xl flex items-center justify-center
//             text-gray-500 hover:text-gray-800 hover:bg-gray-100
//             transition-all"
//           title="Wipe Cache"
//         >
//           <svg
//             viewBox="0 0 24 24"
//             className="w-4 h-4"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth="2"
//           >
//             <polyline points="23 4 23 10 17 10" />
//             <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
//           </svg>
//         </button>

//         {/* Avatar */}
//         <div
//           className="w-9 h-9 rounded-xl flex items-center
//           justify-center text-white text-sm font-bold ml-1"
//           style={{
//             background: "linear-gradient(135deg,#f02d65,#ff6035)",
//           }}
//         >
//           {user?.username?.[0]?.toUpperCase() || "A"}
//         </div>
//       </div>
//     </header>
//   );
// }

////////////////// ========================= second version =========================////////////////////////

// src/layout/TopBar.jsx  (DESIGN ONLY, functionality unchanged)
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";

// /* lightweight icons */
// const I = {
//   Menu: (p) => (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       {...p}
//     >
//       <path d="M4 6h16M4 12h16M4 18h16" />
//     </svg>
//   ),
//   Home: (p) => (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       {...p}
//     >
//       <path d="M3 10.5 12 3l9 7.5V21a1.8 1.8 0 0 1-1.8 1.8H4.8A1.8 1.8 0 0 1 3 21v-10.5Z" />
//       <path d="M9 22v-9h6v9" />
//     </svg>
//   ),
//   Refresh: (p) => (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       {...p}
//     >
//       <path d="M21 12a9 9 0 1 1-3-6.7" />
//       <path d="M21 3v7h-7" />
//     </svg>
//   ),
//   Card: (p) => (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       {...p}
//     >
//       <rect x="2" y="5" width="20" height="14" rx="3" />
//       <path d="M2 10h20" />
//       <path d="M6 15h4" />
//     </svg>
//   ),
//   CashOut: (p) => (
//     <svg
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       {...p}
//     >
//       <path d="M3 7h18v10H3z" />
//       <path d="M12 10v6" />
//       <path d="M9 13l3 3 3-3" />
//     </svg>
//   ),
// };

// const Pill = ({
//   active,
//   gradient,
//   shadow,
//   label,
//   count,
//   icon: IconComp,
//   onClick,
// }) => (
//   <button
//     onClick={onClick}
//     className={[
//       "relative inline-flex items-center gap-2",
//       "h-10 px-3 rounded-2xl",
//       "text-xs font-semibold",
//       "transition-all duration-200",
//       "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-300",
//       active ? "text-white" : "text-slate-700 bg-slate-100 hover:bg-slate-200",
//     ].join(" ")}
//     style={active ? { background: gradient, boxShadow: shadow } : undefined}
//   >
//     <span
//       className={[
//         "w-7 h-7 rounded-xl flex items-center justify-center",
//         active ? "bg-white/15" : "bg-white/70",
//       ].join(" ")}
//     >
//       <IconComp
//         className={["w-4 h-4", active ? "text-white" : "text-slate-700"].join(
//           " ",
//         )}
//       />
//     </span>

//     <span className="hidden sm:inline">{label}</span>

//     {active && count > 0 && (
//       <span className="min-w-5 h-5 px-1 rounded-full bg-amber-300 text-slate-900 text-[10px] font-extrabold inline-flex items-center justify-center">
//         {count > 99 ? "99+" : count}
//       </span>
//     )}
//   </button>
// );

// export default function TopBar({ onMenuToggle }) {
//   const navigate = useNavigate();
//   const queryClient = useQueryClient();
//   const { user } = useSelector((s) => s.auth);

//   const { data: rechargeData } = useQuery({
//     queryKey: ["pendingRecharges"],
//     queryFn: async () => {
//       const { data } = await API.get("/recharge?status=pending&limit=1");
//       return data;
//     },
//     enabled: user?.role === "superAdmin",
//     refetchInterval: 30000,
//   });

//   const { data: withdrawalData } = useQuery({
//     queryKey: ["pendingWithdrawals"],
//     queryFn: async () => {
//       const { data } = await API.get("/withdrawal?status=pending&limit=1");
//       return data;
//     },
//     enabled: ["superAdmin", "merchantAdmin"].includes(user?.role),
//     refetchInterval: 30000,
//   });

//   const pendingRecharges = rechargeData?.total || 0;
//   const pendingWithdrawals = withdrawalData?.total || 0;

//   const handleWipeCache = () => {
//     queryClient.invalidateQueries();
//     toast.success("Cache cleared!");
//   };

//   const roleColors = {
//     superAdmin: {
//       bg: "#FFF7ED",
//       text: "#9A3412",
//       ring: "#FED7AA",
//       label: "Super Admin",
//     },
//     merchantAdmin: {
//       bg: "#EFF6FF",
//       text: "#1E40AF",
//       ring: "#BFDBFE",
//       label: "Merchant Admin",
//     },
//     dispatchAdmin: {
//       bg: "#ECFDF5",
//       text: "#065F46",
//       ring: "#A7F3D0",
//       label: "Dispatch Admin",
//     },
//   };
//   const rc = roleColors[user?.role] || roleColors.superAdmin;

//   return (
//     <header className="sticky top-0 z-30 w-full bg-white/80 backdrop-blur border-b border-slate-200/70">
//       <div className="h-16 px-4 sm:px-5 lg:px-6 flex items-center justify-between">
//         {/* Left */}
//         <div className="flex items-center gap-3 min-w-0">
//           <button
//             onClick={onMenuToggle}
//             className="w-10 h-10 rounded-2xl flex items-center justify-center
//               text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
//             aria-label="Toggle menu"
//           >
//             <I.Menu className="w-5 h-5" />
//           </button>

//           <span
//             className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold border"
//             style={{ background: rc.bg, color: rc.text, borderColor: rc.ring }}
//           >
//             <span
//               className="w-1.5 h-1.5 rounded-full"
//               style={{ background: rc.text }}
//             />
//             {rc.label}
//           </span>
//         </div>

//         {/* Right */}
//         <div className="flex items-center gap-2">
//           {user?.role === "superAdmin" && (
//             <Pill
//               active={pendingRecharges > 0}
//               label="Recharge"
//               count={pendingRecharges}
//               icon={I.Card}
//               onClick={() => navigate("/merchants/recharges")}
//               gradient="linear-gradient(135deg,#22c55e,#16a34a)"
//               shadow="0 10px 24px rgba(34,197,94,0.20)"
//             />
//           )}

//           {["superAdmin", "merchantAdmin"].includes(user?.role) && (
//             <Pill
//               active={pendingWithdrawals > 0}
//               label="Withdrawal"
//               count={pendingWithdrawals}
//               icon={I.CashOut}
//               onClick={() => navigate("/merchants/withdrawals")}
//               gradient="linear-gradient(135deg,#f02d65,#ff6035)"
//               shadow="0 10px 24px rgba(240,45,101,0.18)"
//             />
//           )}

//           <button
//             onClick={() => navigate("/")}
//             className="hidden sm:flex w-10 h-10 rounded-2xl items-center justify-center
//               text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
//             title="Dashboard"
//           >
//             <I.Home className="w-4 h-4" />
//           </button>

//           <button
//             onClick={handleWipeCache}
//             className="hidden sm:flex w-10 h-10 rounded-2xl items-center justify-center
//               text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
//             title="Wipe Cache"
//           >
//             <I.Refresh className="w-4 h-4" />
//           </button>

//           <div
//             className="w-10 h-10 rounded-2xl flex items-center justify-center text-white text-sm font-extrabold ml-1 select-none"
//             style={{
//               background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               boxShadow: "0 10px 24px rgba(240,45,101,0.16)",
//             }}
//             title={user?.username || "User"}
//           >
//             {user?.username?.[0]?.toUpperCase() || "A"}
//           </div>
//         </div>
//       </div>

//       {/* Mobile quick row */}
//       <div className="sm:hidden px-4 pb-3 flex gap-2">
//         <button
//           onClick={() => navigate("/")}
//           className="flex-1 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 transition
//             text-slate-800 text-xs font-semibold flex items-center justify-center gap-2"
//         >
//           <I.Home className="w-4 h-4" />
//           Dashboard
//         </button>
//         <button
//           onClick={handleWipeCache}
//           className="flex-1 h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 transition
//             text-slate-800 text-xs font-semibold flex items-center justify-center gap-2"
//         >
//           <I.Refresh className="w-4 h-4" />
//           Cache
//         </button>
//       </div>
//     </header>
//   );
// }

////////////////// ================================= third version ==================================////////////////////////

// import React, { useState, useEffect, useRef } from "react";
// import { useLocation, useNavigate } from "react-router-dom";

// export default function TopBar({
//   user,
//   isMobileOpen,
//   setIsMobileOpen,
//   onLogout,
// }) {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef(null);

//   // Close dropdown when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Map routes to tab names for the demo-style active tab
//   const getRouteName = (path) => {
//     const routeMap = {
//       "/dashboard": "Dashboard",
//       "/profile": "Profile",
//       "/merchants": "Merchant List",
//       "/merchants/funds": "Fund Details",
//       "/merchants/complaints": "Merchant complaints",
//       "/merchants/level-app": "Level application",
//       "/merchants/applications": "Merchant Application",
//       "/merchants/showcase": "Merchant Showcase",
//       "/merchants/levels": "Merchant Level",
//       "/merchants/notices": "Merchant Notice",
//       "/merchants/recharges": "Merchant Recharge Records",
//       "/merchants/withdrawals": "Merchant Withdrawal Manage",
//       "/merchants/traffic": "Traffic Task",
//       "/orders": "Order List",
//       "/refund-orders": "Refund Order",
//       "/attendance": "Attendance records",
//     };
//     return routeMap[path] || "Dashboard";
//   };

//   const currentTabName = getRouteName(location.pathname);

//   // Fullscreen toggle logic
//   const toggleFullScreen = () => {
//     if (!document.fullscreenElement) {
//       document.documentElement.requestFullscreen().catch((err) => {
//         console.log(`Error attempting to enable fullscreen: ${err.message}`);
//       });
//       setIsFullscreen(true);
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//         setIsFullscreen(false);
//       }
//     }
//   };

//   return (
//     <header
//       className="h-[56px] flex items-center justify-between px-4 text-white w-full z-50 shadow-sm"
//       style={{ backgroundColor: "#f39c12" }} // Exact demo orange color
//     >
//       {/* Left Section: Logo, Toggle, and Active Tab */}
//       <div className="flex items-center h-full">
//         {/* Logo block matches sidebar width */}
//         <div className="w-[200px] lg:w-[244px] flex items-center flex-shrink-0">
//           <span
//             className="text-[20px] font-bold tracking-wide cursor-pointer"
//             onClick={() => navigate("/dashboard")}
//           >
//             TikTok Shop
//           </span>
//         </div>

//         {/* Hamburger Menu Toggle */}
//         <button
//           onClick={() => setIsMobileOpen(!isMobileOpen)}
//           className="p-1.5 hover:bg-white/10 rounded-md transition-colors mr-6"
//         >
//           <svg
//             className="w-5 h-5 text-white"
//             fill="none"
//             stroke="currentColor"
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth="2"
//               d="M4 6h16M4 12h16M4 18h16"
//             />
//           </svg>
//         </button>

//         {/* Active Tab Visualization (Mimicking Demo's Tab System) */}
//         <div className="hidden md:flex h-full items-end pb-0">
//           <div className="bg-white/20 h-[38px] px-4 rounded-t-lg flex items-center gap-2 text-[13px] font-medium border-b-2 border-white cursor-default">
//             <svg
//               className="w-4 h-4"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth="2"
//                 d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
//               />
//             </svg>
//             {currentTabName}
//           </div>
//         </div>
//       </div>

//       {/* Right Section: Toolbar Actions */}
//       <div className="flex items-center gap-5 text-[13px]">
//         {/* Text Actions */}
//         <button className="hidden lg:block hover:text-white/80 transition-colors">
//           Recharge (2)
//         </button>
//         <button className="hidden lg:block hover:text-white/80 transition-colors">
//           Withdrawal (2)
//         </button>

//         {/* Home */}
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="hidden sm:flex items-center gap-1.5 hover:text-white/80 transition-colors"
//         >
//           <HomeIcon /> Home
//         </button>

//         {/* Wipe Cache */}
//         <button className="hidden sm:flex items-center gap-1.5 hover:text-white/80 transition-colors">
//           <TrashIcon /> Wipe cache
//         </button>

//         {/* Language Icon */}
//         <button
//           className="hover:text-white/80 transition-colors"
//           title="Language"
//         >
//           <GlobeIcon />
//         </button>

//         {/* Fullscreen Icon */}
//         <button
//           onClick={toggleFullScreen}
//           className="hidden md:block hover:text-white/80 transition-colors"
//           title="Fullscreen"
//         >
//           {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
//         </button>

//         {/* User Profile Dropdown */}
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={() => setShowDropdown(!showDropdown)}
//             className="flex items-center gap-2 hover:bg-white/10 py-1 px-2 rounded-md transition-colors"
//           >
//             <img
//               src={
//                 user?.avatar ||
//                 "https://ui-avatars.com/api/?name=" +
//                   (user?.username || "Admin") +
//                   "&background=ffffff&color=f39c12"
//               }
//               alt="User"
//               className="w-6 h-6 rounded-full object-cover bg-white"
//             />
//             <span className="font-medium hidden md:block">
//               {user?.nickname || user?.username || "Admin"}
//             </span>
//           </button>

//           {/* Dropdown Menu */}
//           {showDropdown && (
//             <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 text-gray-700 z-50 border border-gray-100">
//               <div className="px-4 py-2 border-b border-gray-100 mb-1">
//                 <p className="text-sm font-semibold text-gray-800">
//                   {user?.username || "Admin"}
//                 </p>
//                 <p className="text-xs text-gray-500 capitalize">
//                   {user?.role || "Super Admin"}
//                 </p>
//               </div>
//               <button
//                 onClick={() => {
//                   setShowDropdown(false);
//                   navigate("/profile");
//                 }}
//                 className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
//               >
//                 <ProfileIcon /> My Profile
//               </button>
//               <button
//                 onClick={() => {
//                   setShowDropdown(false);
//                   if (onLogout) onLogout();
//                 }}
//                 className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
//               >
//                 <LogoutIcon /> Logout
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Settings Icon */}
//         <button
//           onClick={() => navigate("/profile")}
//           className="hover:text-white/80 transition-colors"
//           title="Settings"
//         >
//           <SettingsIcon />
//         </button>
//       </div>
//     </header>
//   );
// }

// // ----------------------------------------------------------------------
// // SVG Icons to match the demo header
// // ----------------------------------------------------------------------
// const HomeIcon = () => (
//   <svg
//     className="w-[15px] h-[15px]"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//     />
//   </svg>
// );

// const TrashIcon = () => (
//   <svg
//     className="w-[15px] h-[15px]"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//     />
//   </svg>
// );

// const GlobeIcon = () => (
//   <svg
//     className="w-[17px] h-[17px]"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
//     />
//   </svg>
// );

// const FullscreenIcon = () => (
//   <svg
//     className="w-[16px] h-[16px]"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
//     />
//   </svg>
// );

// const ExitFullscreenIcon = () => (
//   <svg
//     className="w-[16px] h-[16px]"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M9 11V7m0 4H5m4 0L4 6m11 5V7m0 4h4m-4 0l5-6M9 13v4m0-4H5m4 0l-5 6m11-5v4m0-4h4m-4 0l5 6"
//     />
//   </svg>
// );

// const SettingsIcon = () => (
//   <svg
//     className="w-[17px] h-[17px]"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//     />
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="2"
//       d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//     />
//   </svg>
// );

// const ProfileIcon = () => (
//   <svg
//     className="w-4 h-4 text-gray-500"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="1.5"
//       d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//     />
//   </svg>
// );

// const LogoutIcon = () => (
//   <svg
//     className="w-4 h-4 text-red-500"
//     fill="none"
//     stroke="currentColor"
//     viewBox="0 0 24 24"
//   >
//     <path
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       strokeWidth="1.5"
//       d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//     />
//   </svg>
// );

///////////////////////////========================= latest version by (gemeni pro) ============================//////////////////
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

export default function TopBar({ onMenuToggle }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);

  // Pending recharge count
  const { data: rechargeData } = useQuery({
    queryKey: ["pendingRecharges"],
    queryFn: async () => {
      const { data } = await API.get("/recharge?status=pending&limit=1");
      return data;
    },
    enabled: user?.role === "superAdmin",
    refetchInterval: 30000,
  });

  // Pending withdrawal count
  const { data: withdrawalData } = useQuery({
    queryKey: ["pendingWithdrawals"],
    queryFn: async () => {
      const { data } = await API.get("/withdrawal?status=pending&limit=1");
      return data;
    },
    enabled: ["superAdmin", "merchantAdmin"].includes(user?.role),
    refetchInterval: 30000,
  });

  const pendingRecharges = rechargeData?.total || 0;
  const pendingWithdrawals = withdrawalData?.total || 0;

  const handleWipeCache = () => {
    queryClient.invalidateQueries();
    toast.success("Cache cleared!");
  };

  return (
    <header
      className="h-14 flex-shrink-0 flex items-center justify-between px-4 md:px-6 z-20"
      style={{ backgroundColor: "#f97316", color: "white" }} // TikTok Shop Orange
    >
      {/* Left: hamburger + Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="w-8 h-8 rounded flex items-center justify-center text-white/90 hover:bg-white/20 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className="text-white/80">Dashboard</span>
        </div>
      </div>

      {/* Right: action buttons (Matching Client Demo) */}
      <div className="flex items-center gap-4 text-sm font-medium">
        {user?.role === "superAdmin" && (
          <button
            onClick={() => navigate("/merchants/recharges")}
            className="hover:text-white/80 transition-colors"
          >
            Recharge ({pendingRecharges})
          </button>
        )}

        {["superAdmin", "merchantAdmin"].includes(user?.role) && (
          <button
            onClick={() => navigate("/merchants/withdrawals")}
            className="hover:text-white/80 transition-colors"
          >
            Withdrawal ({pendingWithdrawals})
          </button>
        )}

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1 hover:text-white/80 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Home
        </button>

        <button
          onClick={handleWipeCache}
          className="flex items-center gap-1 hover:text-white/80 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
          </svg>
          Wipe cache
        </button>

        {/* User Info / Avatar */}
        <div className="flex items-center gap-2 ml-4 border-l border-white/30 pl-4">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
            {user?.username?.[0]?.toUpperCase() || "A"}
          </div>
          <span className="hidden md:inline">
            {user?.role === "superAdmin" ? "Super Admin" : "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
