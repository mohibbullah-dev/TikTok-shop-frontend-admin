/////////////////////////// ===================== latest version (by gemeni) =====================//////////////////

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons for forms/modals ────────────────────────────────────
import { RefreshCcw, Loader2, CheckCircle, XCircle, Info } from "lucide-react";

// ── Reusable UI components ────────────────────────────────────
const ActionBtn = ({ onClick, color, label, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center gap-1.5"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
    {Icon && <Icon className="w-3.5 h-3.5" />}
    {label}
  </button>
);

const FormInput = ({ label, ...props }) => (
  <div
    style={{ marginTop: "10px", marginBottom: "10px" }}
    className="flex flex-col gap-1.5"
  >
    {label && (
      <label className="text-gray-600 text-[13px] font-medium ml-1">
        {label}
      </label>
    )}
    <input
      style={{ padding: "5px" }}
      className="w-full rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white"
      {...props}
    />
  </div>
);

const FormSelect = ({ label, children, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-gray-600 text-[13px] font-medium ml-1">
        {label}
      </label>
    )}
    <select
      style={{ padding: "5px" }}
      className="w-full rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
      {...props}
    >
      {children}
    </select>
  </div>
);

const Field = ({ label, value }) => (
  <div className="py-3 flex items-start justify-between gap-4 border-b border-gray-100 last:border-0">
    <span className="text-gray-500 text-[13px] font-medium flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-900 text-[13px] font-semibold text-right break-all">
      {value || "—"}
    </span>
  </div>
);

// ── Premium Modal Component ───────────────────────────────────
const Modal = ({
  open,
  onClose,
  title,
  icon: Icon,
  children,
  width = "max-w-md",
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        style={{ padding: "10px" }}
        className={`relative bg-white rounded-lg w-full ${width} max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transform transition-all`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 bg-teal-50 rounded-sm text-teal-600">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
          >
            ✕
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/30">
          {children}
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────
export default function LevelApplication() {
  const queryClient = useQueryClient();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  const [tab, setTab] = useState(""); // "" = All, pendingReview, approved, rejected
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Visual Filters (Matches demo, backend currently filters only by status, but we send them just in case)
  const [idInput, setIdInput] = useState("");
  const [merchantIdInput, setMerchantIdInput] = useState("");
  const [merchantNameInput, setMerchantNameInput] = useState("");
  const [statusInput, setStatusInput] = useState("");

  const [modal, setModal] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => setPage(1), [tab]);

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["vipApplications", tab, page, limit],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (tab) p.set("status", tab);
      const { data } = await API.get(`/vip/applications?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const apps = data?.applications || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || Math.ceil(total / limit) || 1;

  const invalidate = () => queryClient.invalidateQueries(["vipApplications"]);

  // ── Approve/Reject Mutation ──────────────────────────────────
  const review = useMutation({
    mutationFn: ({ id, status }) =>
      API.put(`/vip/applications/${id}/review`, { status }),
    onSuccess: (_, { status }) => {
      invalidate();
      queryClient.invalidateQueries(["merchants"]);
      toast.success(
        status === "approved"
          ? "VIP upgrade approved!"
          : "Application rejected",
      );
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Review failed"),
  });

  const openReview = (app) => {
    setSelected(app);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setSelected(null);
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

  const tabs = [
    { key: "", label: "All" },
    { key: "pendingReview", label: "Under Review" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ];

  return (
    <div
      style={{ padding: "20px" }}
      className="p-20 md:p-6 bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4 flex justify-between items-end">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Level Applications
          </h1>
          <p className="text-[13px] text-gray-500 mt-1">
            {total.toLocaleString()} applications found.
          </p>
        </div>
      </div>

      {isMerchantAdmin && (
        <div
          style={{ padding: "10px", marginBottom: "15px" }}
          className="bg-blue-50 border border-blue-200 rounded-md flex items-start gap-3"
        >
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-blue-800">
            You can <strong>view</strong> applications from your assigned
            merchants. Only <strong>Super Admins</strong> can approve/reject.
          </p>
        </div>
      )}

      {/* ── Top Tabs (Demo Style) ── */}
      <div
        style={{ padding: "5px", marginBottom: "15px" }}
        className="bg-white rounded-md p-4 border border-gray-100 w-full shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-x-auto w-full">
          {tabs.map((t) => (
            <button
              key={t.key}
              style={{ padding: "8px 24px" }}
              onClick={() => setTab(t.key)}
              className={`rounded-sm text-[13px] font-semibold transition-all whitespace-nowrap ${
                tab === t.key
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Visual Filter Grid (Matches Demo) ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md p-6 border border-gray-100 mb-6 w-full shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
          <FormInput
            label="ID"
            placeholder="Application ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant ID"
            placeholder="Merchant ID"
            value={merchantIdInput}
            onChange={(e) => setMerchantIdInput(e.target.value)}
          />
          <FormInput
            label="Merchant Name"
            placeholder="Search Merchant"
            value={merchantNameInput}
            onChange={(e) => setMerchantNameInput(e.target.value)}
          />
          {/* <FormSelect
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">Choose</option>
            <option value="pendingReview">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </FormSelect> */}
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            style={{ padding: "5px 20px" }}
            onClick={() => {
              setIdInput("");
              setMerchantIdInput("");
              setMerchantNameInput("");
              setStatusInput("");
              setPage(1);
            }}
            className="bg-white border border-gray-200 text-gray-700 text-[13px] font-semibold rounded-sm hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
          <button
            style={{ padding: "5px 20px" }}
            onClick={() => invalidate()}
            className="bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors shadow-sm"
          >
            Submit
          </button>
        </div>
      </div>

      {/* ── Data Table Container ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden shadow-sm"
      >
        <div
          style={{ padding: "10px" }}
          className="border-b border-gray-100 bg-gray-50/50 flex justify-between items-center"
        >
          <button
            style={{ padding: "8px" }}
            onClick={() => invalidate()}
            className="rounded-sm bg-slate-700 hover:bg-slate-800 text-white transition-colors flex items-center justify-center shadow-sm"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] font-bold bg-white">
                <th
                  style={{ padding: "12px 15px" }}
                  className="text-center w-10"
                >
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th style={{ padding: "12px 15px" }}>ID</th>
                <th style={{ padding: "12px 15px" }}>Merchant ID</th>
                <th style={{ padding: "12px 15px" }}>Merchant Name</th>
                <th style={{ padding: "12px 15px" }}>Level</th>
                <th style={{ padding: "12px 15px" }}>Price</th>
                <th style={{ padding: "12px 15px" }}>Status</th>
                <th style={{ padding: "12px 15px" }}>Creation Time</th>
                <th style={{ padding: "12px 15px" }}>Audit Time</th>
                <th style={{ padding: "12px 15px" }} className="text-center">
                  Operate
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" className="py-24 text-center">
                    <div className="flex flex-col py-10 items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500 text-[13px]">
                        Loading applications...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : apps.length === 0 ? (
                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No applications found.
                  </td>
                </tr>
              ) : (
                apps.map((app) => {
                  let dotColor = "bg-gray-400";
                  let statusText = "Pending Review";
                  if (app.status === "approved") {
                    dotColor = "bg-emerald-500";
                    statusText = "Approved";
                  } else if (app.status === "rejected") {
                    dotColor = "bg-red-500";
                    statusText = "Rejected";
                  } else if (app.status === "pendingReview") {
                    dotColor = "bg-slate-700";
                    statusText = "Pending Review";
                  }

                  return (
                    <tr
                      key={app._id}
                      className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors group"
                    >
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500 font-mono"
                      >
                        {app._id.slice(-4).toUpperCase()}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-600 font-medium"
                      >
                        {app.merchant?.merchantId || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-800 font-bold"
                      >
                        {app.merchant?.storeName || "—"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] font-bold text-teal-600"
                      >
                        VIP {app.requestedLevel}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] font-bold text-gray-800"
                      >
                        ${(app.price || 0).toFixed(2)}
                      </td>
                      <td style={{ padding: "12px 15px" }}>
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2.5 h-2.5 rounded-full ${dotColor}`}
                          ></span>
                          <span
                            className={`text-[12px] font-bold ${app.status === "rejected" ? "text-red-600" : "text-slate-700"}`}
                          >
                            {statusText}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {new Date(app.createdAt).toLocaleString("en-CA")}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-[13px] text-gray-500"
                      >
                        {app.reviewedAt
                          ? new Date(app.reviewedAt).toLocaleString("en-CA")
                          : "None"}
                      </td>
                      <td
                        style={{ padding: "12px 15px" }}
                        className="text-center"
                      >
                        <div className="flex items-center justify-center w-full">
                          {app.status === "pendingReview" && isSuperAdmin ? (
                            <ActionBtn
                              color="#334155"
                              label="Review"
                              onClick={() => openReview(app)}
                            />
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">
                              Processed
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
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
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
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
                  className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              style={{ padding: "5px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="px-4 py-1.5 border border-gray-200 rounded-sm text-[13px] font-semibold bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ REVIEW MODAL ════════════ */}
      <Modal
        open={modal}
        onClose={closeModal}
        title="Review VIP Application"
        icon={CheckCircle}
      >
        {selected && (
          <div className="space-y-4">
            <div className="bg-white rounded-md border border-gray-200 p-2 shadow-sm mb-4">
              <Field label="Merchant" value={selected.merchant?.storeName} />
              <Field
                label="Merchant ID"
                value={selected.merchant?.merchantId}
              />
              <Field
                label="Current Level"
                value={`VIP ${selected.merchant?.vipLevel ?? 0}`}
              />
              <Field
                label="Requested Level"
                value={`VIP ${selected.requestedLevel}`}
                highlight
              />
              <Field
                label="Upgrade Price"
                value={`$${(selected.price || 0).toLocaleString()}`}
              />
              <Field
                label="Applied On"
                value={new Date(selected.createdAt).toLocaleString()}
              />
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm mb-4">
              <p className="text-amber-800 text-[12px] font-medium leading-tight">
                ⚠️ Approving will immediately deduct{" "}
                <strong>${(selected.price || 0).toLocaleString()}</strong> from
                the merchant's balance and upgrade their VIP tier.
              </p>
            </div>

            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button
                style={{ padding: "8px" }}
                onClick={() =>
                  review.mutate({ id: selected._id, status: "rejected" })
                }
                disabled={review.isPending}
                className="flex-1 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" /> Reject
              </button>

              <button
                style={{ padding: "8px" }}
                onClick={() =>
                  review.mutate({ id: selected._id, status: "approved" })
                }
                disabled={review.isPending}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-sm font-bold text-[13px] disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-md"
              >
                <CheckCircle className="w-4 h-4" /> Approve Upgrade
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
