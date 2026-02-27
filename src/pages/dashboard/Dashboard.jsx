import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import API from "../../api/axios";

// ─── Reusable stat card ───────────────────────────────────────
const StatCard = ({
  label,
  icon,
  color,
  today,
  yesterday,
  month,
  lastMonth,
}) => (
  <div
    className="bg-white rounded-2xl p-5 flex flex-col gap-3"
    style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
  >
    {/* Header */}
    <div className="flex items-center justify-between">
      <p
        className="text-gray-500 text-xs font-semibold uppercase
        tracking-wide"
      >
        {label}
      </p>
      <div
        className="w-9 h-9 rounded-xl flex items-center
        justify-center text-lg"
        style={{ background: color + "18" }}
      >
        {icon}
      </div>
    </div>

    {/* Today big number */}
    <div>
      <p className="text-gray-400 text-[10px] mb-0.5">Today</p>
      <p
        className="text-2xl font-extrabold text-gray-800
        leading-none tracking-tight"
      >
        {today}
      </p>
    </div>

    {/* Divider */}
    <div className="h-px bg-gray-100" />

    {/* 3 sub-stats */}
    <div className="grid grid-cols-3 gap-2">
      {[
        { lbl: "Yesterday", val: yesterday },
        { lbl: "This Month", val: month },
        { lbl: "Last Month", val: lastMonth },
      ].map((s, i) => (
        <div key={i}>
          <p className="text-gray-400 text-[9px] mb-0.5">{s.lbl}</p>
          <p className="text-gray-700 text-xs font-bold">{s.val}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Tiny trend badge ─────────────────────────────────────────
const Trend = ({ value }) => {
  const up = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[10px]
      font-bold px-1.5 py-0.5 rounded-full"
      style={{
        background: up ? "#dcfce7" : "#fee2e2",
        color: up ? "#16a34a" : "#dc2626",
      }}
    >
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
};

// ─── Chart tooltip ────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, prefix = "$" }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white px-3 py-2 rounded-xl text-xs"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}
    >
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold" style={{ color: p.color }}>
          {p.name}: {prefix}
          {typeof p.value === "number" ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  // ── Stats ──────────────────────────────────────────────────
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const { data } = await API.get("/auth/admin/stats");
      return data;
    },
    refetchInterval: 60000,
  });

  // ── Finance chart data ─────────────────────────────────────
  const { data: financeChart } = useQuery({
    queryKey: ["financeChart"],
    queryFn: async () => {
      const { data } = await API.get("/transactions/admin-statements?days=7");
      return data;
    },
  });

  // ── Recent recharges ───────────────────────────────────────
  const { data: recentRecharges } = useQuery({
    queryKey: ["recentRecharges"],
    queryFn: async () => {
      const { data } = await API.get("/recharge?limit=5&sort=-createdAt");
      return data;
    },
    enabled: user?.role === "superAdmin",
  });

  // ── Recent withdrawals ─────────────────────────────────────
  const { data: recentWithdrawals } = useQuery({
    queryKey: ["recentWithdrawals"],
    queryFn: async () => {
      const { data } = await API.get("/withdrawal?limit=5&sort=-createdAt");
      return data;
    },
    enabled: ["superAdmin", "merchantAdmin"].includes(user?.role),
  });

  // ── Recent orders ──────────────────────────────────────────
  const { data: recentOrders } = useQuery({
    queryKey: ["recentOrdersAdmin"],
    queryFn: async () => {
      const { data } = await API.get("/orders?limit=5&sort=-createdAt");
      return data;
    },
  });

  // ── Fallback chart data if API not ready ───────────────────
  const chartData = financeChart?.data || [
    { date: "Mon", recharge: 0, withdrawal: 0, profit: 0 },
    { date: "Tue", recharge: 0, withdrawal: 0, profit: 0 },
    { date: "Wed", recharge: 0, withdrawal: 0, profit: 0 },
    { date: "Thu", recharge: 0, withdrawal: 0, profit: 0 },
    { date: "Fri", recharge: 0, withdrawal: 0, profit: 0 },
    { date: "Sat", recharge: 0, withdrawal: 0, profit: 0 },
    { date: "Sun", recharge: 0, withdrawal: 0, profit: 0 },
  ];

  // Pie chart for order statuses
  const orderPieData = [
    {
      name: "Completed",
      value: statsData?.orders?.completed || 0,
      color: "#22c55e",
    },
    {
      name: "Pending",
      value: statsData?.orders?.pending || 0,
      color: "#f59e0b",
    },
    {
      name: "Shipped",
      value: statsData?.orders?.shipped || 0,
      color: "#6366f1",
    },
    {
      name: "Cancelled",
      value: statsData?.orders?.cancelled || 0,
      color: "#ef4444",
    },
  ];

  // ── Stat cards config ──────────────────────────────────────
  const stats = statsData || {};
  const cards = [
    {
      label: "Total Registrations",
      icon: "👥",
      color: "#6366f1",
      today: stats.registrations?.today ?? 0,
      yesterday: stats.registrations?.yesterday ?? 0,
      month: stats.registrations?.month ?? 0,
      lastMonth: stats.registrations?.lastMonth ?? 0,
    },
    {
      label: "Store Registrations",
      icon: "🏪",
      color: "#f02d65",
      today: stats.stores?.today ?? 0,
      yesterday: stats.stores?.yesterday ?? 0,
      month: stats.stores?.month ?? 0,
      lastMonth: stats.stores?.lastMonth ?? 0,
    },
    {
      label: "Total Recharge",
      icon: "💳",
      color: "#22c55e",
      today: `$${(stats.recharge?.today || 0).toFixed(2)}`,
      yesterday: `$${(stats.recharge?.yesterday || 0).toFixed(2)}`,
      month: `$${(stats.recharge?.month || 0).toFixed(2)}`,
      lastMonth: `$${(stats.recharge?.lastMonth || 0).toFixed(2)}`,
    },
    {
      label: "Total Withdrawals",
      icon: "💸",
      color: "#f59e0b",
      today: `$${(stats.withdrawal?.today || 0).toFixed(2)}`,
      yesterday: `$${(stats.withdrawal?.yesterday || 0).toFixed(2)}`,
      month: `$${(stats.withdrawal?.month || 0).toFixed(2)}`,
      lastMonth: `$${(stats.withdrawal?.lastMonth || 0).toFixed(2)}`,
    },
    {
      label: "Number of Recharges",
      icon: "🔢",
      color: "#06b6d4",
      today: stats.rechargeCount?.today ?? 0,
      yesterday: stats.rechargeCount?.yesterday ?? 0,
      month: stats.rechargeCount?.month ?? 0,
      lastMonth: stats.rechargeCount?.lastMonth ?? 0,
    },
    {
      label: "Total Profit",
      icon: "📈",
      color: "#8b5cf6",
      today: `$${(stats.profit?.today || 0).toFixed(2)}`,
      yesterday: `$${(stats.profit?.yesterday || 0).toFixed(2)}`,
      month: `$${(stats.profit?.month || 0).toFixed(2)}`,
      lastMonth: `$${(stats.profit?.lastMonth || 0).toFixed(2)}`,
    },
  ];

  // ── Status helpers ─────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      pending: { bg: "#fef3c7", text: "#92400e", label: "Pending" },
      approved: { bg: "#dcfce7", text: "#166534", label: "Approved" },
      rejected: { bg: "#fee2e2", text: "#991b1b", label: "Rejected" },
      completed: { bg: "#dbeafe", text: "#1e40af", label: "Completed" },
      withdrawn: { bg: "#dcfce7", text: "#166534", label: "Withdrawn" },
    };
    const s = map[status] || { bg: "#f3f4f6", text: "#6b7280", label: status };
    return (
      <span
        className="px-2 py-0.5 rounded-full text-[10px] font-bold"
        style={{ background: s.bg, color: s.text }}
      >
        {s.label}
      </span>
    );
  };

  if (statsLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <svg
          className="animate-spin h-8 w-8"
          style={{ color: "#f02d65" }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          />
        </svg>
      </div>
    );

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-xl font-extrabold text-gray-800
            tracking-tight"
          >
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Welcome back, {user?.username} 👋
          </p>
        </div>
        <div className="text-xs text-gray-400">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ── STAT CARDS — 2 cols mobile, 3 cols lg ── */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
        gap-4"
      >
        {cards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* ── CHARTS ROW ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Area chart — spans 2 cols */}
        <div
          className="xl:col-span-2 bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-gray-800 font-bold text-sm">
                Financial Overview
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Last 7 days — Recharge vs Withdrawal vs Profit
              </p>
            </div>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4">
              {[
                { color: "#22c55e", label: "Recharge" },
                { color: "#f02d65", label: "Withdrawal" },
                { color: "#6366f1", label: "Profit" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: l.color }}
                  />
                  <span className="text-gray-500 text-[11px]">{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="gRecharge" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gWithdrawal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f02d65" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#f02d65" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#9ca3af" }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="recharge"
                name="Recharge"
                stroke="#22c55e"
                strokeWidth={2}
                fill="url(#gRecharge)"
                dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="withdrawal"
                name="Withdrawal"
                stroke="#f02d65"
                strokeWidth={2}
                fill="url(#gWithdrawal)"
                dot={{ fill: "#f02d65", r: 3, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="profit"
                name="Profit"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gProfit)"
                dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — 1 col */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
        >
          <p className="text-gray-800 font-bold text-sm mb-1">Order Status</p>
          <p className="text-gray-400 text-xs mb-4">Distribution overview</p>

          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={orderPieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {orderPieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, n) => [v, n]}
                contentStyle={{
                  background: "white",
                  border: "none",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                  fontSize: 11,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-y-2 mt-3">
            {orderPieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: d.color }}
                />
                <span className="text-gray-500 text-[11px]">{d.name}</span>
                <span
                  className="text-gray-800 text-[11px] font-bold
                  ml-auto"
                >
                  {d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: 3 activity tables ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Recharges */}
        {user?.role === "superAdmin" && (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
          >
            <div
              className="flex items-center justify-between
              px-5 py-4 border-b border-gray-100"
            >
              <p className="font-bold text-sm text-gray-800">
                Recent Recharges
              </p>
              <button
                onClick={() => navigate("/merchants/recharges")}
                className="text-xs font-semibold"
                style={{ color: "#f02d65" }}
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentRecharges?.recharges?.length > 0 ? (
                recentRecharges.recharges.map((r, i) => (
                  <div
                    key={r._id || i}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      className="w-8 h-8 rounded-full
                      flex items-center justify-center flex-shrink-0
                      text-sm"
                      style={{ background: "#dcfce7" }}
                    >
                      💳
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-gray-700 text-xs font-semibold
                        truncate"
                      >
                        {r.merchant?.storeName || "Unknown"}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {r.rechargeType} · {r.currencyType}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-green-600 text-xs font-bold">
                        +${r.price?.toFixed(2)}
                      </p>
                      {statusBadge(r.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex flex-col items-center py-8
                    gap-2"
                >
                  <span className="text-3xl">💳</span>
                  <p className="text-gray-300 text-xs">No recharges yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Withdrawals */}
        {["superAdmin", "merchantAdmin"].includes(user?.role) && (
          <div
            className="bg-white rounded-2xl overflow-hidden"
            style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
          >
            <div
              className="flex items-center justify-between
              px-5 py-4 border-b border-gray-100"
            >
              <p className="font-bold text-sm text-gray-800">
                Recent Withdrawals
              </p>
              <button
                onClick={() => navigate("/merchants/withdrawals")}
                className="text-xs font-semibold"
                style={{ color: "#f02d65" }}
              >
                View All →
              </button>
            </div>
            <div className="divide-y divide-gray-50">
              {recentWithdrawals?.withdrawals?.length > 0 ? (
                recentWithdrawals.withdrawals.map((w, i) => (
                  <div
                    key={w._id || i}
                    className="flex items-center gap-3 px-5 py-3"
                  >
                    <div
                      className="w-8 h-8 rounded-full
                      flex items-center justify-center flex-shrink-0
                      text-sm"
                      style={{ background: "#fee2e2" }}
                    >
                      💸
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-gray-700 text-xs font-semibold
                        truncate"
                      >
                        {w.merchant?.storeName || "Unknown"}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {w.extractType}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-red-500 text-xs font-bold">
                        -${w.extractPrice?.toFixed(2)}
                      </p>
                      {statusBadge(w.status)}
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="flex flex-col items-center py-8
                    gap-2"
                >
                  <span className="text-3xl">💸</span>
                  <p className="text-gray-300 text-xs">No withdrawals yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Orders */}
        <div
          className="bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: "0 1px 12px rgba(0,0,0,0.07)" }}
        >
          <div
            className="flex items-center justify-between
            px-5 py-4 border-b border-gray-100"
          >
            <p className="font-bold text-sm text-gray-800">Recent Orders</p>
            <button
              onClick={() => navigate("/orders")}
              className="text-xs font-semibold"
              style={{ color: "#f02d65" }}
            >
              View All →
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentOrders?.orders?.length > 0 ? (
              recentOrders.orders.map((o, i) => (
                <div
                  key={o._id || i}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div
                    className="w-8 h-8 rounded-lg bg-gray-100
                    overflow-hidden flex-shrink-0 flex items-center
                    justify-center text-sm"
                  >
                    {o.products?.[0]?.image ? (
                      <img
                        src={o.products[0].image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-gray-700 text-xs font-semibold
                      truncate"
                    >
                      {o.products?.[0]?.title || "Product"}
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      #{o.orderSn?.slice(-8)}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-gray-700 text-xs font-bold">
                      ${o.totalAmount?.toFixed(2)}
                    </p>
                    {statusBadge(o.status)}
                  </div>
                </div>
              ))
            ) : (
              <div
                className="flex flex-col items-center py-8
                  gap-2"
              >
                <span className="text-3xl">📦</span>
                <p className="text-gray-300 text-xs">No orders yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
