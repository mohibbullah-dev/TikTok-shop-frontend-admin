import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import {
  RefreshCcw,
  Loader2,
  CalendarCheck,
  Search,
  Trash2,
} from "lucide-react";

export default function AttendanceRecords() {
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [merchantIdFilter, setMerchantIdFilter] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [activeFilters, setActiveFilters] = useState({});

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["attendance", page, limit, activeFilters],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (activeFilters.merchantId)
        p.set("merchantId", activeFilters.merchantId);
      const { data } = await API.get(`/attendance?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const records = data?.records || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  // ── Merchant Search API ──────────
  const { data: searchResults } = useQuery({
    queryKey: ["merchantSearch", searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      // 👇 WE ADDED &status=approved TO THIS LINE 👇
      const { data } = await API.get(
        `/merchants?storeName=${searchQuery}&status=approved&limit=10`,
      );

      return data.merchants || [];
    },
    enabled: !!searchQuery && showDropdown,
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const invalidate = () => {
    queryClient.invalidateQueries(["attendance"]);
    toast.success("Attendance ledger refreshed.");
  };

  // ── Revoke Mutation ─────────────────────────────────────────
  const revokeRecord = useMutation({
    mutationFn: (id) => API.delete(`/attendance/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Record revoked! Funds deducted from merchant balance.");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to revoke"),
  });

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = () => {
    setActiveFilters({ merchantId: merchantIdFilter.trim() });
    setPage(1);
    setShowDropdown(false);
  };

  const handleReset = () => {
    setSearchQuery("");
    setMerchantIdFilter("");
    setActiveFilters({});
    setPage(1);
  };

  const getPageNums = () => {
    if (totalPages <= 5) return [...Array(totalPages)].map((_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [page - 2, page - 1, page, page + 1, page + 2];
  };

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      {/* ── HEADER ── */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Attendance Records</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} records · Monitor merchant daily sign-ins and
          revoke fraudulent rewards.
        </p>
      </div>

      {/* ── Smart Visual Filter Grid ── */}
      <div
        style={{ padding: "15px" }}
        className="bg-white rounded-sm border border-gray-100 mb-4 w-full shadow-sm flex flex-wrap items-end gap-4"
      >
        <div
          className="flex flex-col gap-1.5 flex-1 min-w-[300px] max-w-md relative"
          ref={dropdownRef}
        >
          <label className="text-gray-600 text-[12px] font-bold uppercase tracking-wider">
            Search Merchant (Name or ID)
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              style={{ padding: "8px 12px 8px 32px" }}
              type="text"
              placeholder="Type Store Name or Merchant ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setMerchantIdFilter(e.target.value); // fallback if they type raw ID
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full rounded-sm border border-gray-300 text-gray-800 text-[13px] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
            />

            {/* Auto-Complete Dropdown */}
            {showDropdown && searchResults && searchResults.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-sm shadow-xl max-h-48 overflow-y-auto">
                {searchResults.map((m) => (
                  <div
                    key={m._id}
                    onClick={() => {
                      setMerchantIdFilter(m.merchantId);
                      setSearchQuery(`${m.storeName} (${m.merchantId})`);
                      setShowDropdown(false);
                    }}
                    className="p-2.5 hover:bg-teal-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <p className="text-[13px] font-bold text-gray-800">
                      {m.storeName}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      ID: {m.merchantId}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            style={{ padding: "9px 24px" }}
            onClick={handleSearch}
            className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-bold rounded-sm transition-colors shadow-sm"
          >
            Search
          </button>
          <button
            style={{ padding: "9px 24px" }}
            onClick={handleReset}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-sm transition-colors shadow-sm"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ── ACTION BAR ── */}
      <div
        style={{ padding: "10px" }}
        className="bg-white border border-gray-100 rounded-sm mb-4 w-full flex gap-2 shadow-sm"
      >
        <button
          onClick={invalidate}
          style={{ padding: "8px 14px" }}
          className="bg-slate-700 hover:bg-slate-800 text-white rounded-sm transition-colors flex items-center justify-center shadow-sm"
        >
          <RefreshCcw
            className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
          />
        </button>
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-sm flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-200 text-gray-800 text-[13px] font-bold bg-gray-50/50 whitespace-nowrap">
                <th
                  style={{ padding: "16px 20px" }}
                  className="text-center w-10"
                >
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 w-4 h-4"
                  />
                </th>
                <th style={{ padding: "16px 20px" }}>Record ID</th>
                <th style={{ padding: "16px 20px" }}>Merchant Name</th>
                <th style={{ padding: "16px 20px" }}>Merchant ID</th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Sign-In Date
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Reward Earned
                </th>
                <th style={{ padding: "16px 20px" }}>System Timestamp</th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[14px]">
                        Loading attendance ledger...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-20 text-gray-500 text-[14px]"
                  >
                    No sign-in records found.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r._id}
                    className="border-b border-gray-50 hover:bg-slate-50/80 transition-colors group"
                  >
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 w-4 h-4"
                      />
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-[13px] text-gray-500 font-mono"
                    >
                      ATD-{r._id.slice(-6).toUpperCase()}
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-[14px] text-gray-800 font-bold"
                    >
                      {r.merchant?.storeName || "—"}
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-[13px] text-blue-600 font-mono font-bold"
                    >
                      {r.merchant?.merchantId || "—"}
                    </td>

                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-sm text-[13px] font-bold border border-blue-100">
                        <CalendarCheck className="w-4 h-4" />
                        {r.signInDate}
                      </span>
                    </td>

                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <span className="text-[15px] font-black text-emerald-600 font-mono bg-emerald-50 px-3 py-1 rounded-sm border border-emerald-100">
                        + ${r.reward?.toFixed(2)}
                      </span>
                    </td>

                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-[13px] text-gray-500"
                    >
                      {new Date(r.createdAt).toLocaleString()}
                    </td>

                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <button
                        onClick={() =>
                          window.confirm(
                            "Are you sure you want to revoke this? The reward money will be instantly deducted from the merchant's balance.",
                          ) && revokeRecord.mutate(r._id)
                        }
                        disabled={revokeRecord.isPending}
                        style={{ padding: "6px 12px" }}
                        className="bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 hover:border-red-500 rounded-[3px] text-[12px] font-bold transition-all shadow-sm flex items-center justify-center gap-1 mx-auto disabled:opacity-50"
                        title="Revoke & Deduct Funds"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div
          style={{ padding: "5px" }}
          className="flex flex-col sm:flex-row items-center justify-between p-5 border-t border-gray-100 bg-gray-50/50"
        >
          <div className="text-[13px] text-gray-500 flex items-center gap-2 font-medium">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} rows
            <select
              style={{ padding: "5px" }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="ml-2 border border-gray-200 rounded-sm px-2 py-1 focus:outline-none focus:border-teal-500 bg-white font-semibold text-gray-700"
            >
              <option value={15}>15</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Prev
            </button>
            {getPageNums().map((n, idx) =>
              n === "..." ? (
                <span key={`dots-${idx}`} className="px-2 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  style={{ padding: "5px" }}
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors shadow-sm ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
