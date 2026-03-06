import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

export default function AdminLayout() {
  // Desktop: sidebar open by default
  // Mobile: sidebar closed by default
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (window.innerWidth < 1024) setSidebarOpen(false);
  }, [location.pathname]);

  // Sync on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#f0f2f5" }}
    >
      {/* ── Mobile overlay ── */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* TopBar */}
        <TopBar
          onMenuToggle={() => {
            if (window.innerWidth >= 1024) {
              setSidebarCollapsed(!sidebarCollapsed);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

//////////////////////////// ================================= second version ================================///////////

// import { useState, useEffect } from "react";
// import { Outlet, useLocation } from "react-router-dom";
// import Sidebar from "./Sidebar";
// import TopBar from "./TopBar";

// export default function AdminLayout() {
//   // Desktop: sidebar open by default
//   // Mobile: sidebar closed by default
//   const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
//   const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
//   const location = useLocation();

//   // Close mobile sidebar on route change
//   useEffect(() => {
//     if (window.innerWidth < 1024) setSidebarOpen(false);
//   }, [location.pathname]);

//   // Sync on resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         setSidebarOpen(true);
//       } else {
//         setSidebarOpen(false);
//       }
//     };
//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   return (
//     <div
//       className="flex h-screen overflow-hidden"
//       style={{ background: "#f0f2f5" }}
//     >
//       {/* ── Mobile overlay ── */}
//       {sidebarOpen && window.innerWidth < 1024 && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}

//       {/* ── Sidebar ── */}
//       <Sidebar
//         open={sidebarOpen}
//         collapsed={sidebarCollapsed}
//         onCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
//         onClose={() => setSidebarOpen(false)}
//       />

//       {/* ── Main content ── */}
//       <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
//         {/* TopBar */}
//         <TopBar
//           onMenuToggle={() => {
//             if (window.innerWidth >= 1024) {
//               setSidebarCollapsed(!sidebarCollapsed);
//             } else {
//               setSidebarOpen(!sidebarOpen);
//             }
//           }}
//         />

//         {/* Page content */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

////////////////////////////// ========================= third verion ============================////////////////////
// import React, { useState } from "react";
// import { Outlet, Navigate, useNavigate } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import Sidebar from "./Sidebar";
// import TopBar from "./TopBar";
// // Adjust this import path if your authSlice is located elsewhere based on your store setup
// import { logout } from "../../store/authSlice";

// export default function AdminLayout() {
//   const { user } = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   // State to manage mobile sidebar visibility
//   const [isMobileOpen, setIsMobileOpen] = useState(false);

//   // Protect Admin Routes: Redirect to login if user is not authenticated
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }

//   // Handle Logout execution from TopBar
//   const handleLogout = () => {
//     dispatch(logout());
//     navigate("/login");
//   };

//   return (
//     <div className="h-screen w-full flex flex-col bg-[#f0f2f5] overflow-hidden font-sans">
//       {/*
//         1. TOP NAVIGATION BAR
//         Sits fixed at the top, spanning 100% width. Matches demo layout.
//       */}
//       <div className="flex-shrink-0 z-50">
//         <TopBar
//           user={user}
//           isMobileOpen={isMobileOpen}
//           setIsMobileOpen={setIsMobileOpen}
//           onLogout={handleLogout}
//         />
//       </div>

//       {/*
//         2. MAIN CONTENT WRAPPER
//         Sits below the TopBar. Flex row containing Sidebar (left) and Content (right).
//       */}
//       <div className="flex flex-1 overflow-hidden relative">
//         {/* Sidebar Component */}
//         <Sidebar
//           user={user}
//           isMobileOpen={isMobileOpen}
//           setIsMobileOpen={setIsMobileOpen}
//         />

//         {/* Dynamic Page Content Area */}
//         <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#f4f5f7]">
//           {/*
//              Padding wrapper for the main pages.
//              Demo uses a slight grey background to make the white cards pop.
//           */}
//           <div className="p-4 sm:p-5 min-h-full">
//             <Outlet />
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
