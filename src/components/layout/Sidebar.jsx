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
  Send,
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

          {(isSuperAdmin || role === "dispatchAdmin") && (
            <NavItem
              to="/orders/dispatch"
              icon={Send}
              label="Dispatch Orders"
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
