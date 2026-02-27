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

  const roleColors = {
    superAdmin: { bg: "#fef3c7", text: "#92400e", label: "Super Admin" },
    merchantAdmin: { bg: "#dbeafe", text: "#1e40af", label: "Merchant Admin" },
    dispatchAdmin: { bg: "#d1fae5", text: "#065f46", label: "Dispatch Admin" },
  };
  const rc = roleColors[user?.role] || roleColors.superAdmin;

  return (
    <header
      className="h-16 flex-shrink-0 flex items-center
      justify-between px-4 md:px-6 border-b border-gray-200 bg-white"
      style={{ boxShadow: "0 1px 0 rgba(0,0,0,0.06)" }}
    >
      {/* Left: hamburger + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Menu toggle */}
        <button
          onClick={onMenuToggle}
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-gray-500 hover:text-gray-800 hover:bg-gray-100
            transition-all"
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

        {/* Role badge — md+ */}
        <span
          className="hidden md:inline-flex items-center px-3 py-1
          rounded-full text-xs font-bold"
          style={{ background: rc.bg, color: rc.text }}
        >
          {rc.label}
        </span>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2">
        {/* Recharge badge */}
        {user?.role === "superAdmin" && (
          <button
            onClick={() => navigate("/merchants/recharges")}
            className="relative flex items-center gap-1.5 px-3 py-2
              rounded-xl text-xs font-semibold transition-all
              hover:scale-105 active:scale-95"
            style={{
              background:
                pendingRecharges > 0
                  ? "linear-gradient(135deg,#22c55e,#16a34a)"
                  : "#f3f4f6",
              color: pendingRecharges > 0 ? "white" : "#6b7280",
              boxShadow:
                pendingRecharges > 0
                  ? "0 4px 12px rgba(34,197,94,0.35)"
                  : "none",
            }}
          >
            <span>💳</span>
            <span className="hidden sm:inline">Recharge</span>
            {pendingRecharges > 0 && (
              <span
                className="min-w-[18px] h-[18px] rounded-full
                bg-yellow-400 text-gray-900 text-[9px] font-bold
                flex items-center justify-center px-1"
              >
                {pendingRecharges}
              </span>
            )}
          </button>
        )}

        {/* Withdrawal badge */}
        {["superAdmin", "merchantAdmin"].includes(user?.role) && (
          <button
            onClick={() => navigate("/merchants/withdrawals")}
            className="relative flex items-center gap-1.5 px-3 py-2
              rounded-xl text-xs font-semibold transition-all
              hover:scale-105 active:scale-95"
            style={{
              background:
                pendingWithdrawals > 0
                  ? "linear-gradient(135deg,#f02d65,#ff6035)"
                  : "#f3f4f6",
              color: pendingWithdrawals > 0 ? "white" : "#6b7280",
              boxShadow:
                pendingWithdrawals > 0
                  ? "0 4px 12px rgba(240,45,101,0.35)"
                  : "none",
            }}
          >
            <span>💸</span>
            <span className="hidden sm:inline">Withdrawal</span>
            {pendingWithdrawals > 0 && (
              <span
                className="min-w-[18px] h-[18px] rounded-full
                bg-yellow-400 text-gray-900 text-[9px] font-bold
                flex items-center justify-center px-1"
              >
                {pendingWithdrawals}
              </span>
            )}
          </button>
        )}

        {/* Home */}
        <button
          onClick={() => navigate("/")}
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-gray-500 hover:text-gray-800 hover:bg-gray-100
            transition-all"
          title="Dashboard"
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
        </button>

        {/* Wipe Cache */}
        <button
          onClick={handleWipeCache}
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-gray-500 hover:text-gray-800 hover:bg-gray-100
            transition-all"
          title="Wipe Cache"
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
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center
          justify-center text-white text-sm font-bold ml-1"
          style={{
            background: "linear-gradient(135deg,#f02d65,#ff6035)",
          }}
        >
          {user?.username?.[0]?.toUpperCase() || "A"}
        </div>
      </div>
    </header>
  );
}
