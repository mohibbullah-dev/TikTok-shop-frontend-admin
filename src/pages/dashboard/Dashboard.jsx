import { useSelector } from "react-redux";
// import axios from "../../axios";
import { Loader2, RefreshCcw } from "lucide-react";
// import axios from "axios";
import API from "../../api/axios";
import { useState, useEffect } from "react";

// ── Reusable Metric Card Component (SaaS Styled) ──
const MetricBlock = ({ title, bgColor, children }) => (
  <div
    style={{ padding: "15px" }}
    className={`rounded-sm text-white text-lg ${bgColor} flex flex-col h-[140px] relative overflow-hidden shadow-sm transition-transform hover:-translate-y-1`}
  >
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-[14px] font-bold tracking-wide opacity-95">
        {title}
      </h3>
      <span
        style={{ padding: "2px 6px" }}
        className="bg-black/20 text-[10px] font-bold rounded-sm tracking-wider uppercase"
      >
        Real-time
      </span>
    </div>
    <div className="mt-auto flex items-end gap-6 overflow-x-auto custom-scrollbar no-scrollbar">
      {children}
    </div>
  </div>
);

// Helpers
const formatNum = (num) => Number(num || 0).toLocaleString();
const formatCur = (num) => Number(num || 0).toFixed(2);

export default function Dashboard() {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  // const fetchStats = async () => {
  //   setLoading(true);
  //   try {
  //     // NOTE: Ensure your backend auth.route.js is saved and server restarted!
  //     const endpoint =
  //       user?.role === "merchantAdmin"
  //         ? "/merchants/my-stats"
  //         : "/auth/admin/stats";
  //     const res = await axios.get(endpoint);
  //     setStats(res.data);
  //   } catch (err) {
  //     console.error("Failed to fetch dashboard stats", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const endpoint =
        user?.role === "merchantAdmin"
          ? "/merchants/my-stats"
          : "/auth/admin/stats";
      const res = await API.get(endpoint);
      // const res = await API.get(endpoint)
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
      // TEMPORARY FIX: Provide empty stats instead of crashing
      setStats({});
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStats();
  }, [user]);

  // Demo colors explicitly matched to screenshot
  const colors = {
    blue: "bg-blue-500",
    teal: "bg-teal-400",
    purple: "bg-indigo-400",
    green: "bg-emerald-400",
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
        <p className="text-gray-500 text-[13px] font-medium">
          Loading platform statistics...
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }} className="w-full bg-gray-50 min-h-screen">
      {/* ── HEADER SECTION ── */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Platform Dashboard
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Real-time statistical data, reports, and system overviews.
          </p>
        </div>
        <button
          style={{ padding: "8px 16px" }}
          onClick={fetchStats}
          className="bg-white border border-gray-200 text-gray-700 rounded-sm text-[13px] font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2"
        >
          <RefreshCcw className="w-3.5 h-3.5" /> Refresh Data
        </button>
      </div>

      {/* ── TABS ── */}
      <div
        style={{ marginTop: "10px", marginBottom: "10px" }}
        className="flex gap-2  mb-6"
      >
        <div
          style={{ padding: "8px 24px" }}
          className="bg-slate-800 text-white text-[13px] font-bold rounded-t-sm shadow-sm cursor-default"
        >
          Overview
        </div>
        <div
          style={{ padding: "8px 24px" }}
          className="bg-white border-t border-l border-r border-gray-200 text-gray-500 text-[13px] font-bold hover:bg-gray-50 cursor-pointer rounded-t-sm transition-colors"
        >
          Custom Reports
        </div>
      </div>

      {/* ── DATA BLOCKS GRID ── */}
      {user?.role !== "merchantAdmin" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* ROW 1: Registrations & Stores */}
          <MetricBlock title="Total Registrations" bgColor={colors.blue}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              {formatNum(
                stats?.registrations?.total || stats?.registrations?.month,
              )}
            </div>
          </MetricBlock>

          <MetricBlock title="User Registration" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.registrations?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.registrations?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yesterday
              </div>
            </div>
          </MetricBlock>

          <MetricBlock
            title="Total Store Registrations"
            bgColor={colors.purple}
          >
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              {formatNum(stats?.stores?.total || stats?.stores?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Store Registration" bgColor={colors.green}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.stores?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.stores?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.stores?.month)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Month
              </div>
            </div>
          </MetricBlock>

          {/* ROW 2: Financials */}
          <MetricBlock title="Total Recharge" bgColor={colors.blue}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.recharge?.total || stats?.recharge?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Recharge Volumes" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.recharge?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black leading-none mb-1">
                ${formatCur(stats?.recharge?.yesterday)}
              </div>
              <div className="text-[10px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
            <div>
              <div className="text-[20px] font-black leading-none mb-1">
                ${formatCur(stats?.recharge?.month)}
              </div>
              <div className="text-[10px] font-medium opacity-90 uppercase tracking-wider">
                Month
              </div>
            </div>
          </MetricBlock>

          <MetricBlock title="Total Withdrawals" bgColor={colors.purple}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.withdrawal?.total || stats?.withdrawal?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Withdrawal Volumes" bgColor={colors.green}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.withdrawal?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.withdrawal?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.withdrawal?.month)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Month
              </div>
            </div>
          </MetricBlock>

          {/* ROW 3: Counts & Profits */}
          <MetricBlock title="Recharge Frequency" bgColor={colors.blue}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.rechargeCount?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Recharge
                <br />
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.rechargeCount?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Recharge
                <br />
                Yest.
              </div>
            </div>
          </MetricBlock>

          <MetricBlock title="User Activity" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.rechargeCount?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Rechargers
                <br />
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                0
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider leading-tight">
                Withdrawers
                <br />
                Today
              </div>
            </div>
          </MetricBlock>

          <MetricBlock title="Total Profit" bgColor={colors.purple}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.profit?.total || stats?.profit?.month)}
            </div>
          </MetricBlock>

          <MetricBlock title="Profit Breakdown" bgColor={colors.green}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.profit?.today)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Today
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                ${formatCur(stats?.profit?.yesterday)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Yest.
              </div>
            </div>
          </MetricBlock>
        </div>
      ) : (
        /* ── Merchant Admin Fallback View ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricBlock title="Total Referred Merchants" bgColor={colors.blue}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              {formatNum(stats?.totalMerchants)}
            </div>
          </MetricBlock>
          <MetricBlock title="Store Statuses" bgColor={colors.teal}>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.activeMerchants)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Active
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.pendingMerchants)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Pending
              </div>
            </div>
            <div>
              <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
                {formatNum(stats?.frozenMerchants)}
              </div>
              <div className="text-[11px] font-medium opacity-90 uppercase tracking-wider">
                Frozen
              </div>
            </div>
          </MetricBlock>
          <MetricBlock title="Total Store Balance" bgColor={colors.purple}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.totalBalance)}
            </div>
          </MetricBlock>
          <MetricBlock title="Total Earned Profit" bgColor={colors.green}>
            <div className="text-[32px] font-black leading-none overflow-hidden tracking-tight">
              ${formatCur(stats?.totalProfit)}
            </div>
          </MetricBlock>
        </div>
      )}
    </div>
  );
}
