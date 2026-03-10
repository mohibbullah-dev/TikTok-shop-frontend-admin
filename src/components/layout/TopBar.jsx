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
      const { data } = await API.get("/recharge?status=0&limit=1");
      return data;
    },
    enabled: user?.role === "superAdmin",
    refetchInterval: 30000,
  });

  // Pending withdrawal count
  const { data: withdrawalData } = useQuery({
    queryKey: ["pendingWithdrawals"],
    queryFn: async () => {
      const { data } = await API.get("/withdrawal?status=underReview&limit=1");
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
