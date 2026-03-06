import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { Save, Loader2, Settings, Wallet, Globe, Percent } from "lucide-react";

export default function SystemSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data } = await API.get("/settings");
      return data;
    },
  });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newData) => API.put("/settings", newData),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["systemSettings"]);
    },
    onError: () => toast.error("Failed to update settings"),
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen w-full" style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="text-xl font-bold text-gray-800">
          System Configuration
        </h1>
        <p className="text-gray-500 text-[13px]" style={{ marginTop: "4px" }}>
          Manage global platform rules, wallet addresses, and app information.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          maxWidth: "900px",
        }}
      >
        {/* Wallet Settings */}
        <div
          className="bg-white border border-gray-200 rounded-sm shadow-sm"
          style={{ padding: "24px" }}
        >
          <h2
            className="font-bold text-gray-800 flex items-center gap-2"
            style={{
              fontSize: "15px",
              marginBottom: "20px",
              borderBottom: "1px solid #f3f4f6",
              paddingBottom: "12px",
            }}
          >
            <Wallet className="w-5 h-5 text-teal-500" /> Receiving Wallets
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                USDT (TRC20) Address
              </label>
              <input
                type="text"
                name="usdtTrc20Address"
                value={formData.usdtTrc20Address || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
                placeholder="T..."
              />
            </div>
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                USDT (ERC20) Address
              </label>
              <input
                type="text"
                name="usdtErc20Address"
                value={formData.usdtErc20Address || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
                placeholder="0x..."
              />
            </div>
          </div>
        </div>

        {/* Financial Rules */}
        <div
          className="bg-white border border-gray-200 rounded-sm shadow-sm"
          style={{ padding: "24px" }}
        >
          <h2
            className="font-bold text-gray-800 flex items-center gap-2"
            style={{
              fontSize: "15px",
              marginBottom: "20px",
              borderBottom: "1px solid #f3f4f6",
              paddingBottom: "12px",
            }}
          >
            <Percent className="w-5 h-5 text-blue-500" /> Financial Rules
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "20px",
            }}
          >
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                Min. Recharge Amount ($)
              </label>
              <input
                type="number"
                name="minRechargeAmount"
                value={formData.minRechargeAmount || 0}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                Min. Withdrawal Amount ($)
              </label>
              <input
                type="number"
                name="minWithdrawalAmount"
                value={formData.minWithdrawalAmount || 0}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                Withdrawal Fee (%)
              </label>
              <input
                type="number"
                name="withdrawalFeePercent"
                value={formData.withdrawalFeePercent || 0}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
              />
            </div>
          </div>
        </div>

        {/* App Info */}
        <div
          className="bg-white border border-gray-200 rounded-sm shadow-sm"
          style={{ padding: "24px" }}
        >
          <h2
            className="font-bold text-gray-800 flex items-center gap-2"
            style={{
              fontSize: "15px",
              marginBottom: "20px",
              borderBottom: "1px solid #f3f4f6",
              paddingBottom: "12px",
            }}
          >
            <Globe className="w-5 h-5 text-purple-500" /> Platform Info
          </h2>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                App Download Link
              </label>
              <input
                type="text"
                name="appDownloadLink"
                value={formData.appDownloadLink || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                Home Marquee Announcement
              </label>
              <input
                type="text"
                name="announcementMarquee"
                value={formData.announcementMarquee || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
              />
            </div>
            <div>
              <label
                className="block text-[13px] font-bold text-gray-700"
                style={{ marginBottom: "8px" }}
              >
                Working Hours
              </label>
              <input
                type="text"
                name="workingHours"
                value={formData.workingHours || ""}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
                style={{ padding: "10px 14px", fontSize: "13px" }}
                placeholder="e.g., 09:00 - 18:00"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          style={{ padding: "14px 24px", fontSize: "14px", width: "200px" }}
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Settings
        </button>
      </form>
    </div>
  );
}
