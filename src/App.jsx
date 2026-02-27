import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
// import AdminLayout from "./components/layout/AdminLayout";
// import Login from "./pages/auth/Login";

// Pages
// import Dashboard from "./pages/dashboard/Dashboard";
// import Profile from "./pages/general/Profile";
// import MerchantList from "./pages/merchants/MerchantList";
// import FundDetails from "./pages/merchants/FundDetails";
// import LevelApp from "./pages/merchants/LevelApplication";
// import MerchantApp from "./pages/merchants/MerchantApplication";
// import Showcase from "./pages/merchants/Showcase";
// import MerchantLevel from "./pages/merchants/MerchantLevel";
// import Notices from "./pages/merchants/Notices";
// import Recharges from "./pages/merchants/Recharges";
// import Withdrawals from "./pages/merchants/Withdrawals";
// import TrafficTask from "./pages/merchants/TrafficTask";
// import OrderList from "./pages/orders/OrderList";
// import Complaints from "./pages/merchants/Complaints";

// Role-based route guard
// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const { user, token } = useSelector((s) => s.auth);

//   if (!token || !user) return <Navigate to="/login" replace />;

//   const adminRoles = ["superAdmin", "merchantAdmin", "dispatchAdmin"];
//   if (!adminRoles.includes(user.role)) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

export default function App() {
  const { token } = useSelector((s) => s.auth);

  return (
    // <Routes>
    //   <Route
    //     path="/login"
    //     element={token ? <Navigate to="/" replace /> : <Login />}
    //   />

    //   <Route
    //     path="/"
    //     element={
    //       <ProtectedRoute>
    //         <AdminLayout />
    //       </ProtectedRoute>
    //     }
    //   >
    //     {/* Dashboard */}
    //     <Route index element={<Dashboard />} />

    //     {/* General */}
    //     <Route path="profile" element={<Profile />} />

    //     {/* Merchant Management — superAdmin + merchantAdmin */}
    //     <Route
    //       path="merchants"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin", "merchantAdmin"]}>
    //           <MerchantList />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/funds"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin", "merchantAdmin"]}>
    //           <FundDetails />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/complaints"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <Complaints />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/level-app"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <LevelApp />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/applications"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <MerchantApp />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/showcase"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <Showcase />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/levels"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <MerchantLevel />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/notices"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <Notices />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/recharges"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <Recharges />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/withdrawals"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin", "merchantAdmin"]}>
    //           <Withdrawals />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="merchants/traffic"
    //       element={
    //         <ProtectedRoute allowedRoles={["superAdmin"]}>
    //           <TrafficTask />
    //         </ProtectedRoute>
    //       }
    //     />

    //     {/* Orders */}
    //     <Route path="orders" element={<OrderList />} />
    //   </Route>

    //   <Route path="*" element={<Navigate to="/" replace />} />
    // </Routes>
    <h1>hello</h1>
  );
}
