import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Loader2,
  Network,
  Users,
  ChevronRight,
  ChevronDown,
  UserCheck,
  Shield,
} from "lucide-react";
import API from "../../api/axios";

export default function TeamTree() {
  const { data, isLoading } = useQuery({
    queryKey: ["teamTree"],
    queryFn: async () => {
      const { data } = await API.get("/team");
      return data;
    },
  });

  const tree = data?.tree || [];
  const totalMerchants = data?.totalMerchants || 0;

  // Track which rows are expanded (using their User ID)
  const [expandedRows, setExpandedRows] = useState({});

  const toggleRow = (id) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Recursive component to render tree rows with proper indentation
  const TreeRow = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedRows[node.user?._id];

    // Calculate indentation based on tree depth
    const paddingLeft = `${level * 2}rem`;

    return (
      <>
        <tr className="border-b border-gray-100 hover:bg-slate-50/80 transition-colors bg-white group">
          <td
            style={{
              padding: "12px 20px",
              paddingLeft: `calc(20px + ${paddingLeft})`,
            }}
          >
            <div className="flex items-center gap-3">
              {/* Expand Toggle */}
              {hasChildren ? (
                <button
                  onClick={() => toggleRow(node.user?._id)}
                  className="w-6 h-6 flex items-center justify-center bg-gray-100 hover:bg-teal-100 text-gray-500 hover:text-teal-600 rounded-sm transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              ) : (
                <div className="w-6 h-6" /> // Placeholder for alignment
              )}

              {/* Merchant Info */}
              <div className="w-9 h-9 rounded-sm flex items-center justify-center text-white font-bold text-[13px] bg-slate-800 shadow-sm flex-shrink-0">
                {node.storeName?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-gray-800 truncate">
                  {node.storeName || "Unknown Store"}
                </p>
                <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                  ID: {node.merchantId}
                </p>
              </div>
            </div>
          </td>

          <td style={{ padding: "16px 20px" }}>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${node.user?.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}
              >
                {node.user?.status?.toUpperCase() || "ACTIVE"}
              </span>
              <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm flex items-center gap-1 border border-gray-200">
                Lvl {level + 1}
              </span>
            </div>
          </td>

          <td style={{ padding: "16px 20px" }} className="text-center">
            {node.referrer ? (
              <span className="text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-sm flex items-center justify-center gap-1 w-fit mx-auto">
                <UserCheck className="w-3 h-3" /> {node.referrer.username}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded-sm flex items-center justify-center gap-1 w-fit mx-auto">
                <Shield className="w-3 h-3" /> System Admin
              </span>
            )}
          </td>

          <td style={{ padding: "16px 20px" }} className="text-center">
            <span className="text-[14px] font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded-full border border-gray-200 shadow-inner">
              {node.teamSize}{" "}
              <span className="text-gray-400 text-[11px] font-normal ml-1">
                Subs
              </span>
            </span>
          </td>

          <td
            style={{ padding: "16px 20px" }}
            className="text-right text-[12px] font-medium text-gray-500"
          >
            {node.user?.createdAt
              ? new Date(node.user.createdAt).toLocaleDateString()
              : "—"}
          </td>
        </tr>

        {/* Render Children if expanded */}
        {isExpanded &&
          hasChildren &&
          node.children.map((child) => (
            <TreeRow key={child._id} node={child} level={level + 1} />
          ))}
      </>
    );
  };

  return (
    // 1. FIXED HEIGHT CONTAINER
    <div
      style={{ padding: "20px" }}
      className="p-4 md:p-6 bg-gray-50 flex flex-col h-[calc(100vh)] w-full overflow-hidden"
    >
      {/* ── HEADER ── */}
      <div className="mb-4 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Network className="text-teal-500 w-6 h-6" /> Affiliate Network
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            Track user invitations, agency hierarchies, and total team sizes.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-sm border border-gray-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Total Merchants
            </p>
            <p className="text-lg font-black text-gray-800 leading-none">
              {totalMerchants}
            </p>
          </div>
        </div>
      </div>

      {/* ── DATA TABLE CONTAINER (FLEX-1, OVERFLOW) ── */}
      <div
        style={{ marginTop: "16px" }}
        className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden"
      >
        {/* The Scrollable Table Wrapper */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 text-gray-800 text-[13px] font-bold bg-gray-50 whitespace-nowrap shadow-sm">
                <th style={{ padding: "16px 20px" }}>
                  Merchant Account (Click to Expand)
                </th>
                <th style={{ padding: "16px 20px" }}>Status & Level</th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Invited By
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Total Downline
                </th>
                <th style={{ padding: "16px 20px" }} className="text-right">
                  Join Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-24 text-center">
                    <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                    <p className="text-gray-500 text-[14px]">
                      Loading network tree...
                    </p>
                  </td>
                </tr>
              ) : tree.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-24 text-gray-500 text-[14px]"
                  >
                    No merchants found in the network.
                  </td>
                </tr>
              ) : (
                tree.map((node) => (
                  <TreeRow key={node._id} node={node} level={0} />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky Footer */}
        <div
          style={{ padding: "16px 20px" }}
          className="border-t border-gray-200 bg-gray-50 flex-shrink-0 z-10 text-center text-[12px] font-bold text-gray-400 uppercase tracking-wider"
        >
          Top Level Leaders: {tree.length} Root Nodes
        </div>
      </div>
    </div>
  );
}
