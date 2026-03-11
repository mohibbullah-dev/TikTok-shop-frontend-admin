import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import API from "../../api/axios";

import {
  RefreshCcw,
  Loader2,
  Wallet,
  CreditCard,
  Banknote,
  Edit,
  Building2,
} from "lucide-react";

const ActionBtn = ({ onClick, color, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="rounded text-[12px] font-medium transition-all hover:opacity-90 hover:-translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
    style={{ backgroundColor: color, color: "white", padding: "6px 10px" }}
  >
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
      className="w-full px-3.5 py-2 rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white"
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
      className="w-full px-3.5 py-2 rounded-sm border border-gray-200 text-gray-800 text-[13px] focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all bg-gray-50/50 focus:bg-white appearance-none"
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
    <span className="text-gray-900 text-[13px] font-semibold text-right">
      {value || "—"}
    </span>
  </div>
);

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

export default function MerchantList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const isSuperAdmin = user?.role === "superAdmin";
  const isMerchantAdmin = user?.role === "merchantAdmin";

  // Filter input states
  const [idInput, setIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [vipInput, setVipInput] = useState("");

  // Active filter states
  const [activeFilters, setActiveFilters] = useState({
    merchantId: "",
    storeName: "",
    status: "",
    vipLevel: "",
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal states
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [fundAmount, setFundAmount] = useState("");
  const [fundType, setFundType] = useState("add");
  const [fundNote, setFundNote] = useState("");
  const [rcAmount, setRcAmount] = useState("");
  const [editForm, setEditForm] = useState({});

  const openModal = (type, merchant) => {
    setSelected(merchant);
    setModal(type);
    if (type === "edit") {
      setEditForm({
        storeName: merchant.storeName || "",
        storePhone: merchant.storePhone || "",
        creditScore: merchant.creditScore ?? 100,
        vipLevel: merchant.vipLevel ?? 0,
      });
    }
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    setFundAmount("");
    setRcAmount("");
    setFundNote("");
  };

  const handleSubmitFilters = () => {
    setActiveFilters({
      merchantId: idInput.trim(),
      storeName: nameInput.trim(),
      status: statusInput,
      vipLevel: vipInput,
    });
    setPage(1);
  };

  const handleResetFilters = () => {
    setIdInput("");
    setNameInput("");
    setStatusInput("");
    setVipInput("");
    setActiveFilters({
      merchantId: "",
      storeName: "",
      status: "",
      vipLevel: "",
    });
    setPage(1);
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["merchants", page, limit, activeFilters],
    queryFn: async () => {
      const params = { page, limit };
      if (activeFilters.merchantId)
        params.merchantId = activeFilters.merchantId;
      if (activeFilters.storeName) params.storeName = activeFilters.storeName;
      if (activeFilters.status) params.status = activeFilters.status;
      if (activeFilters.vipLevel !== "")
        params.vipLevel = activeFilters.vipLevel;

      const p = new URLSearchParams(params);
      const { data } = await API.get(`/merchants?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const merchants = data?.merchants || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const invalidate = () => queryClient.invalidateQueries(["merchants"]);

  const toggleWithdrawal = useMutation({
    mutationFn: (m) => API.put(`/merchants/${m._id}/withdrawal-status`),
    onSuccess: (res) => {
      invalidate();
      toast.success(
        res.data?.isWithdrawalForbidden
          ? "Withdrawal forbidden for this merchant"
          : "Withdrawal allowed for this merchant",
      );
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const adjustFunds = useMutation({
    mutationFn: () =>
      API.post(
        `/merchants/${selected._id}/${fundType === "add" ? "add-funds" : "deduct-funds"}`,
        { amount: parseFloat(fundAmount), note: fundNote },
      ),
    onSuccess: () => {
      invalidate();
      toast.success(`Funds ${fundType === "add" ? "added" : "deducted"}!`);
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const manualRecharge = useMutation({
    mutationFn: () =>
      API.post(`/merchants/${selected._id}/manual-recharge`, {
        amount: parseFloat(rcAmount),
      }),
    onSuccess: () => {
      invalidate();
      toast.success("Recharge successful!");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const editMerchant = useMutation({
    mutationFn: () => API.put(`/merchants/${selected._id}`, editForm),
    onSuccess: () => {
      invalidate();
      toast.success("Saved!");
      closeModal();
    },
    onError: (e) => toast.error(e.response?.data?.message || "Failed"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }) =>
      API.put(`/merchants/${id}/status`, { status }),
    onSuccess: () => {
      invalidate();
      toast.success("Merchant status updated successfully!");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to update status"),
  });

  const deleteMerchant = useMutation({
    mutationFn: (id) => API.delete(`/merchants/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success("Merchant deleted completely.");
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to delete"),
  });

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
      className="bg-gray-50 min-h-screen w-full max-w-full overflow-hidden"
    >
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">Merchant List</h1>
        <p className="text-[13px] text-gray-500 mt-1">
          Manage all store accounts, funds, and permissions.
        </p>
      </div>

      {/* ── Filter Grid ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white rounded-md border border-gray-100 mb-6 w-full"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 p-4">
          <FormInput
            label="Merchant ID"
            placeholder="Enter ID"
            value={idInput}
            onChange={(e) => setIdInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitFilters()}
          />
          <FormInput
            label="Merchant Name"
            placeholder="Enter Name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmitFilters()}
          />
          <FormSelect
            label="Status"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="frozen">Frozen</option>
          </FormSelect>
          <FormSelect
            label="VIP Level"
            value={vipInput}
            onChange={(e) => setVipInput(e.target.value)}
          >
            <option value="">All Levels</option>
            {[0, 1, 2, 3, 4, 5, 6].map((v) => (
              <option key={v} value={v}>
                VIP {v}
              </option>
            ))}
          </FormSelect>
        </div>
        <div
          style={{ paddingTop: "5px", paddingBottom: "5px" }}
          className="flex justify-end gap-3 pt-4 border-t border-gray-100 px-4"
        >
          <button
            style={{ padding: "5px" }}
            onClick={handleResetFilters}
            className="px-6 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-semibold rounded-sm transition-colors"
          >
            Reset
          </button>
          <button
            style={{ padding: "5px" }}
            onClick={handleSubmitFilters}
            className="px-6 py-2 bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-semibold rounded-sm transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div
        style={{ padding: "5px" }}
        className="bg-white border border-gray-100 rounded-md flex flex-col w-full overflow-hidden"
      >
        <div
          style={{ padding: "10px" }}
          className="px-5 py-4 border-b border-gray-100 bg-white flex justify-between gap-3 items-center"
        >
          <h2 className="text-[14px] font-bold text-gray-800">
            Merchant Directory
          </h2>
          <button
            onClick={() => invalidate()}
            className="p-2 rounded-sm bg-gray-50 hover:bg-gray-100 text-teal-600 transition-colors border border-gray-200"
            title="Refresh"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="w-full overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1400px]">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-[12px] uppercase tracking-wider bg-gray-50/50">
                <th className="py-4 px-5 text-center w-10">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="py-4 px-0 font-bold">Merchant ID</th>
                <th className="py-4 px-0 font-bold">Merchant Name</th>
                <th className="py-4 px-5 font-bold">Merchant Level</th>
                <th className="py-4 px-5 font-bold text-center">Logo</th>
                <th className="py-4 px-5 font-bold text-center">Status</th>
                <th className="py-4 px-5 font-bold">Referrer</th>
                <th
                  style={{ marginLeft: "10px", marginRight: "10px" }}
                  className="py-4 px-5 font-bold"
                >
                  Creation Time
                </th>
                <th
                  style={{ marginLeft: "10px", marginRight: "10px" }}
                  className="py-4 px-5 font-bold text-center"
                >
                  Operations
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" className="py-24">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
                      <p className="text-gray-500 text-[13px] font-medium">
                        Loading merchant data...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : merchants.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-20 text-gray-500 text-[13px]"
                  >
                    No merchants found matching your filters.
                  </td>
                </tr>
              ) : (
                merchants.map((m) => (
                  <tr
                    key={m._id}
                    className="border-8 border-gray-50 hover:bg-teal-50/30 transition-colors group"
                  >
                    <td className="py-3 px-5 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600 font-medium">
                      {m.merchantId}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-900 font-bold">
                      {m.storeName}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-900 font-bold">
                      {m.vipLevel}
                    </td>
                    <td className="py-3 px-5">
                      <div className="w-9 h-9 rounded-sm mx-auto overflow-hidden bg-gray-50 flex items-center justify-center border border-gray-200">
                        {m.storeLogo ? (
                          <img
                            src={m.storeLogo}
                            alt="logo"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-400 text-[10px] font-bold">
                            IMG
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-5 text-center">
                      <span
                        style={{ padding: "5px" }}
                        className={`text-[12px] px-2.5 py-1 rounded-sm font-bold ${m.status === "approved" ? "bg-emerald-100 text-emerald-700" : m.status === "pending" ? "bg-yellow-100 text-yellow-700" : m.status === "frozen" ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"}`}
                      >
                        {m.status === "approved"
                          ? "Active"
                          : m.status === "pending"
                            ? "Pending"
                            : m.status === "frozen"
                              ? "Frozen"
                              : "Rejected"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">
                      {m.referrer?.username || "Direct"}
                    </td>
                    <td className="py-3 px-5 text-[13px] text-gray-600">
                      {m.referrer?.username || "Direct"}
                    </td>

                    <td className="py-3 px-5 text-[13px] text-gray-500">
                      <span className="text-gray-800 font-medium">
                        {new Date(m.createdAt).toLocaleDateString("en-CA")}
                      </span>
                      <br />
                      {new Date(m.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-5">
                      {/* ✅ UI FIX: Removed max-w, w-max, mx-auto and set justify-start */}
                      <div className="flex flex-wrap items-center justify-center gap-2 min-w-[300px]">
                        <ActionBtn
                          color="#059669"
                          label="Details"
                          onClick={() => openModal("detail", m)}
                        />

                        {m.status === "pending" && (
                          <>
                            <ActionBtn
                              color="#10b981"
                              label="Approve"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                window.confirm("Approve this store?") &&
                                updateStatus.mutate({
                                  id: m._id,
                                  status: "approved",
                                })
                              }
                            />
                            <ActionBtn
                              color="#ef4444"
                              label="Reject"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                window.confirm("Reject this store?") &&
                                updateStatus.mutate({
                                  id: m._id,
                                  status: "rejected",
                                })
                              }
                            />
                          </>
                        )}
                        {m.status === "approved" && (
                          <>
                            <ActionBtn
                              color="#f59e0b"
                              label="Unapprove"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                window.confirm("Set back to pending?") &&
                                updateStatus.mutate({
                                  id: m._id,
                                  status: "pending",
                                })
                              }
                            />
                            <ActionBtn
                              color="#3b82f6"
                              label="Freeze"
                              disabled={updateStatus.isPending}
                              onClick={() =>
                                window.confirm("Freeze this account?") &&
                                updateStatus.mutate({
                                  id: m._id,
                                  status: "frozen",
                                })
                              }
                            />
                          </>
                        )}
                        {m.status === "frozen" && (
                          <ActionBtn
                            color="#10b981"
                            label="Unfreeze"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              window.confirm("Unfreeze and reactivate?") &&
                              updateStatus.mutate({
                                id: m._id,
                                status: "approved",
                              })
                            }
                          />
                        )}
                        {m.status === "rejected" && (
                          <ActionBtn
                            color="#10b981"
                            label="Approve"
                            disabled={updateStatus.isPending}
                            onClick={() =>
                              window.confirm("Approve this store?") &&
                              updateStatus.mutate({
                                id: m._id,
                                status: "approved",
                              })
                            }
                          />
                        )}

                        {(isSuperAdmin || isMerchantAdmin) && (
                          <ActionBtn
                            color={
                              m.isWithdrawalForbidden ? "#dc2626" : "#2563eb"
                            }
                            label={
                              m.isWithdrawalForbidden
                                ? "Withdrawal Forbidden"
                                : "Allow Withdrawal"
                            }
                            onClick={() => toggleWithdrawal.mutate(m)}
                            disabled={toggleWithdrawal.isPending}
                          />
                        )}

                        {isSuperAdmin && (
                          <>
                            <ActionBtn
                              color="#475569"
                              label="Add Funds"
                              onClick={() => {
                                setFundType("add");
                                openModal("funds", m);
                              }}
                            />
                            <ActionBtn
                              color="#2563eb"
                              label="Recharge"
                              onClick={() => openModal("recharge", m)}
                            />
                            <ActionBtn
                              color="#dc2626"
                              label="Deduction"
                              onClick={() => {
                                setFundType("deduct");
                                openModal("funds", m);
                              }}
                            />
                            <ActionBtn
                              color="#059669"
                              label="Edit"
                              onClick={() => openModal("edit", m)}
                            />
                            <ActionBtn
                              color="#7f1d1d"
                              label="Delete"
                              disabled={deleteMerchant.isPending}
                              onClick={() =>
                                window.confirm(
                                  `Permanently delete ${m.storeName}? This cannot be undone!`,
                                ) && deleteMerchant.mutate(m._id)
                              }
                            />
                          </>
                        )}

                        <ActionBtn
                          color="#2563eb"
                          label="Fund Details"
                          onClick={() =>
                            navigate(
                              `/merchants/funds?merchantId=${m._id}&name=${encodeURIComponent(m.storeName)}`,
                            )
                          }
                        />
                        <ActionBtn
                          color="#475569"
                          label="Bank Card"
                          onClick={() => openModal("bankcard", m)}
                        />
                      </div>
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
          <div className="text-[13px] text-gray-500 mb-3 sm:mb-0 flex items-center gap-2 font-medium">
            Showing {total === 0 ? 0 : (page - 1) * limit + 1} to{" "}
            {Math.min(page * limit, total)} of {total} rows
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
            {getPageNums().map((n) => (
              <button
                style={{ padding: "5px" }}
                key={n}
                onClick={() => setPage(n)}
                className={`min-w-[36px] px-2 py-1.5 rounded-sm text-[13px] font-bold transition-colors ${n === page ? "bg-slate-800 text-white border border-slate-800" : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"}`}
              >
                {n}
              </button>
            ))}
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

      {/* ════════ MODALS ════════ */}
      {/* 1. Detail Modal */}
      <Modal
        open={modal === "detail"}
        onClose={closeModal}
        title="Merchant Details"
        icon={Building2}
        width="max-w-lg"
      >
        <div className="bg-white rounded-md border border-gray-100 p-1">
          <Field label="Store Name" value={selected?.storeName} />
          <Field label="Merchant ID" value={selected?.merchantId} />
          <Field label="Email" value={selected?.user?.email} />
          <Field label="Phone" value={selected?.storePhone} />
          <Field label="VIP Level" value={`VIP ${selected?.vipLevel ?? 0}`} />
          <Field
            label="Balance"
            value={`$${(selected?.balance || 0).toFixed(2)}`}
          />
          <Field
            label="Total Profit"
            value={`$${(selected?.totalProfit || 0).toFixed(2)}`}
          />
          <Field
            label="Credit Score"
            value={`${selected?.creditScore ?? 100} / 100`}
          />
          <Field label="Status" value={selected?.status} />
          <Field
            label="Withdrawal"
            value={selected?.isWithdrawalForbidden ? "Forbidden" : "Allowed"}
          />
          <Field
            label="Joined"
            value={
              selected?.createdAt
                ? new Date(selected.createdAt).toLocaleString()
                : ""
            }
          />
        </div>
        <button
          style={{ padding: "5px" }}
          onClick={closeModal}
          className="w-full mt-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-[13px] rounded-md transition-colors shadow-md"
        >
          Close Window
        </button>
      </Modal>

      {/* 2. Add/Deduct Funds Modal */}
      <Modal
        open={modal === "funds"}
        onClose={closeModal}
        title={`${fundType === "add" ? "Add" : "Deduct"} Funds`}
        icon={Wallet}
      >
        <div className="space-y-5">
          <div
            style={{
              paddingTop: "10px",
              paddingBottom: "10px",
              paddingLeft: "10px",
            }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 p-5 rounded-md shadow-inner text-white"
          >
            <p className="text-[12px] text-slate-300 font-medium mb-1">
              Current Balance for {selected?.storeName}
            </p>
            <p className="text-3xl font-black tracking-tight">
              ${(selected?.balance || 0).toFixed(2)}
            </p>
          </div>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            label="Amount (USD)"
            value={fundAmount}
            onChange={(e) => setFundAmount(e.target.value)}
            placeholder="0.00"
          />
          <FormInput
            type="text"
            label="Internal Note (Optional)"
            value={fundNote}
            onChange={(e) => setFundNote(e.target.value)}
            placeholder="Reason for adjustment..."
          />
          <div className="flex gap-3 pt-2">
            <button
              style={{ padding: "5px" }}
              onClick={closeModal}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{ padding: "5px" }}
              onClick={() => adjustFunds.mutate()}
              disabled={!fundAmount || adjustFunds.isPending}
              className={`flex-1 py-2.5 text-white rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md ${fundType === "add" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"}`}
            >
              {adjustFunds.isPending
                ? "Processing..."
                : `Confirm ${fundType === "add" ? "Addition" : "Deduction"}`}
            </button>
          </div>
        </div>
      </Modal>

      {/* 3. Manual Recharge Modal */}
      <Modal
        open={modal === "recharge"}
        onClose={closeModal}
        title="Manual Recharge"
        icon={CreditCard}
      >
        <div className="space-y-5">
          <div
            style={{ padding: "5px" }}
            className="bg-gradient-to-br from-teal-500 to-emerald-500 p-5 rounded-md shadow-inner text-white"
          >
            <p className="text-[12px] text-teal-100 font-medium mb-1">
              Current Balance for {selected?.storeName}
            </p>
            <p className="text-3xl font-black tracking-tight">
              ${(selected?.balance || 0).toFixed(2)}
            </p>
          </div>
          <FormInput
            type="number"
            min="0.01"
            step="0.01"
            label="Recharge Amount (USD)"
            value={rcAmount}
            onChange={(e) => setRcAmount(e.target.value)}
            placeholder="0.00"
          />
          <div className="flex gap-3 pt-2">
            <button
              style={{ padding: "5px" }}
              onClick={closeModal}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{ padding: "5px" }}
              onClick={() => manualRecharge.mutate()}
              disabled={!rcAmount || manualRecharge.isPending}
              className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md"
            >
              {manualRecharge.isPending ? "Processing..." : "Confirm Recharge"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Edit Merchant Modal */}
      <Modal
        open={modal === "edit"}
        onClose={closeModal}
        title="Edit Merchant"
        icon={Edit}
      >
        <div className="space-y-4">
          <FormInput
            label="Store Name"
            value={editForm.storeName || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, storeName: e.target.value })
            }
          />
          <FormInput
            label="Store Phone"
            value={editForm.storePhone || ""}
            onChange={(e) =>
              setEditForm({ ...editForm, storePhone: e.target.value })
            }
          />
          <FormInput
            type="number"
            min="0"
            max="100"
            label="Credit Score (0-100)"
            value={editForm.creditScore ?? 100}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                creditScore: parseInt(e.target.value),
              })
            }
          />
          <FormInput
            type="number"
            min="0"
            max="6"
            label="VIP Level (0-6)"
            value={editForm.vipLevel ?? 0}
            onChange={(e) =>
              setEditForm({ ...editForm, vipLevel: parseInt(e.target.value) })
            }
          />
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              style={{ padding: "5px" }}
              onClick={closeModal}
              className="flex-1 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              style={{ padding: "5px" }}
              onClick={() => editMerchant.mutate()}
              disabled={editMerchant.isPending}
              className="flex-1 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-md font-bold text-[13px] disabled:opacity-50 transition-colors shadow-md"
            >
              {editMerchant.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </Modal>

      {/* 5. Bank Card Modal */}
      <Modal
        open={modal === "bankcard"}
        onClose={closeModal}
        title="Bank Card / Withdrawal Info"
        icon={Banknote}
      >
        <div className="space-y-4">
          {selected?.bankCard ? (
            <div className="p-5 border border-gray-200 rounded-md bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
              <p className="text-gray-900 font-black text-[15px] relative z-10">
                {selected.bankName || "Bank / Wallet"}
              </p>
              <p className="text-gray-800 text-[14px] font-mono mt-3 tracking-widest relative z-10 bg-white p-2 rounded inline-block border border-gray-100">
                {selected.bankCard}
              </p>
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-md border border-dashed border-gray-200">
              <Banknote className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-[13px] font-medium">
                No bank card / USDT address linked.
              </p>
              <p className="text-gray-400 text-[12px] mt-1">
                Merchant adds this in their profile settings.
              </p>
            </div>
          )}
          <button
            style={{ padding: "5px" }}
            onClick={closeModal}
            className="w-full mt-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-[13px] rounded-md transition-colors shadow-md"
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
}
