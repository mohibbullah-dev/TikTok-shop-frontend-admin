import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { logout } from "../../store/authSlice";
import API from "../../api/axios";

// ── Nav item component ────────────────────────────────────────
const NavItem = ({ to, icon, label, collapsed, badge }) => (
  <NavLink
    to={to}
    end={to === "/"}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl
      transition-all duration-150 group relative
      ${
        isActive
          ? "text-white"
          : "text-white/50 hover:text-white hover:bg-white/8"
      }`
    }
    style={({ isActive }) =>
      isActive
        ? {
            background: "linear-gradient(135deg,#f02d65,#ff6035)",
            boxShadow: "0 4px 12px rgba(240,45,101,0.35)",
          }
        : {}
    }
  >
    {/* Icon */}
    <span className="text-lg flex-shrink-0 w-5 text-center">{icon}</span>

    {/* Label — hidden when collapsed */}
    {!collapsed && (
      <span className="text-sm font-medium flex-1 truncate">{label}</span>
    )}

    {/* Badge */}
    {!collapsed && badge > 0 && (
      <span
        className="min-w-[18px] h-[18px] rounded-full
        bg-yellow-400 text-[9px] font-bold text-gray-900
        flex items-center justify-center px-1"
      >
        {badge > 99 ? "99+" : badge}
      </span>
    )}

    {/* Tooltip when collapsed */}
    {collapsed && (
      <div
        className="absolute left-full ml-2 px-2 py-1 bg-gray-900
        text-white text-xs rounded-lg opacity-0 pointer-events-none
        group-hover:opacity-100 transition-opacity whitespace-nowrap
        z-50"
      >
        {label}
      </div>
    )}
  </NavLink>
);

// ── Section header ────────────────────────────────────────────
const SectionHeader = ({ label, collapsed }) =>
  collapsed ? (
    <div className="mx-3 my-2 h-px bg-white/10" />
  ) : (
    <p
      className="px-3 pt-4 pb-1 text-white/25 text-[10px]
      font-bold tracking-widest uppercase"
    >
      {label}
    </p>
  );

export default function Sidebar({ open, collapsed, onCollapse, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const role = user?.role;

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await API.post("/auth/logout");
    },
    onSuccess: () => {
      dispatch(logout());
      navigate("/login");
    },
    onError: () => {
      dispatch(logout());
      navigate("/login");
    },
  });

  const isSuperAdmin = role === "superAdmin";
  const isMerchantAdmin = role === "merchantAdmin";
  const isDispatchAdmin = role === "dispatchAdmin";

  // Sidebar width
  const sidebarW = collapsed ? 64 : 240;

  return (
    <aside
      className="flex-shrink-0 h-screen flex flex-col
        transition-all duration-300 z-40
        fixed lg:relative
        lg:translate-x-0"
      style={{
        width: sidebarW,
        background: "linear-gradient(180deg,#0f172a 0%,#1a1035 100%)",
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease, width 0.3s ease",
        boxShadow: "4px 0 24px rgba(0,0,0,0.3)",
      }}
    >
      {/* ── Logo / Header ── */}
      <div
        className={`flex items-center h-16 flex-shrink-0
        border-b border-white/8 ${collapsed ? "justify-center px-2" : "px-4 gap-3"}`}
      >
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center
          justify-center"
          style={{
            background: "linear-gradient(135deg,#f02d65,#ff6035)",
          }}
        >
          <span className="text-lg">🛍️</span>
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-white font-bold text-sm truncate">TikTok Shop</p>
            <p className="text-white/30 text-[10px]">Admin Panel</p>
          </div>
        )}
        {/* Collapse button — desktop only */}
        {!collapsed && (
          <button
            onClick={onCollapse}
            className="hidden lg:flex w-6 h-6 rounded-lg items-center
              justify-center text-white/30 hover:text-white
              hover:bg-white/10 transition-all flex-shrink-0"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}
        {/* Mobile close */}
        <button
          onClick={onClose}
          className="lg:hidden w-6 h-6 flex items-center justify-center
            text-white/40 hover:text-white flex-shrink-0"
        >
          ×
        </button>
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={onCollapse}
          className="hidden lg:flex mx-auto mt-2 w-8 h-8 rounded-lg
            items-center justify-center text-white/30 hover:text-white
            hover:bg-white/10 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      )}

      {/* ── Nav Links ── */}
      <nav
        className="flex-1 overflow-y-auto overflow-x-hidden
        py-2 px-2 space-y-0.5"
      >
        {/* DASHBOARD */}
        <NavItem to="/" icon="📊" label="Dashboard" collapsed={collapsed} />

        {/* GENERAL */}
        {(isSuperAdmin || isMerchantAdmin) && (
          <>
            <SectionHeader label="General" collapsed={collapsed} />
            <NavItem
              to="/profile"
              icon="👤"
              label="Profile"
              collapsed={collapsed}
            />
          </>
        )}

        {/* MERCHANT MANAGEMENT */}
        {(isSuperAdmin || isMerchantAdmin) && (
          <>
            <SectionHeader label="Merchants" collapsed={collapsed} />
            <NavItem
              to="/merchants"
              icon="🏪"
              label="Merchant List"
              collapsed={collapsed}
            />
            <NavItem
              to="/merchants/funds"
              icon="💰"
              label="Fund Details"
              collapsed={collapsed}
            />
            {isSuperAdmin && (
              <>
                <NavItem
                  to="/merchants/recharges"
                  icon="💳"
                  label="Recharge Records"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/withdrawals"
                  icon="💸"
                  label="Withdrawals"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/level-app"
                  icon="👑"
                  label="Level Applications"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/applications"
                  icon="📋"
                  label="Applications"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/showcase"
                  icon="🛍️"
                  label="Showcase"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/levels"
                  icon="⭐"
                  label="VIP Levels"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/notices"
                  icon="📢"
                  label="Notices"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/traffic"
                  icon="🚦"
                  label="Traffic Tasks"
                  collapsed={collapsed}
                />
                <NavItem
                  to="/merchants/complaints"
                  icon="🚨"
                  label="Complaints"
                  collapsed={collapsed}
                />
              </>
            )}
            {isMerchantAdmin && (
              <NavItem
                to="/merchants/withdrawals"
                icon="💸"
                label="Withdrawals"
                collapsed={collapsed}
              />
            )}
          </>
        )}

        {/* ORDER MANAGEMENT */}
        <SectionHeader label="Orders" collapsed={collapsed} />
        <NavItem
          to="/orders"
          icon="📦"
          label="Order List"
          collapsed={collapsed}
        />
        {isSuperAdmin && (
          <NavItem
            to="/orders/refunds"
            icon="↩️"
            label="Refund Orders"
            collapsed={collapsed}
          />
        )}
      </nav>

      {/* ── User footer ── */}
      <div
        className={`flex-shrink-0 border-t border-white/8 p-3
        ${collapsed ? "flex justify-center" : ""}`}
      >
        {collapsed ? (
          <button
            onClick={() => logoutMutation.mutate()}
            className="w-9 h-9 rounded-xl bg-white/8 flex items-center
              justify-center text-white/50 hover:text-red-400
              hover:bg-red-500/10 transition-all"
            title="Logout"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div
              className="w-8 h-8 rounded-full flex-shrink-0
              flex items-center justify-center text-white text-xs
              font-bold"
              style={{
                background: "linear-gradient(135deg,#f02d65,#ff6035)",
              }}
            >
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.username}
              </p>
              <p className="text-white/30 text-[10px] truncate">{user?.role}</p>
            </div>
            {/* Logout */}
            <button
              onClick={() => logoutMutation.mutate()}
              className="w-7 h-7 rounded-lg flex items-center justify-center
                text-white/30 hover:text-red-400 hover:bg-red-500/10
                transition-all flex-shrink-0"
              title="Logout"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
