// import { useState, useEffect } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import API from "../../api/axios";
// import { Save, Loader2, Settings, Wallet, Globe, Percent } from "lucide-react";

// export default function SystemSettings() {
//   const queryClient = useQueryClient();
//   const [formData, setFormData] = useState({});

//   const { data, isLoading } = useQuery({
//     queryKey: ["systemSettings"],
//     queryFn: async () => {
//       const { data } = await API.get("/settings");
//       return data;
//     },
//   });

//   useEffect(() => {
//     if (data) setFormData(data);
//   }, [data]);

//   const updateMutation = useMutation({
//     mutationFn: (newData) => API.put("/settings", newData),
//     onSuccess: (res) => {
//       toast.success(res.data.message);
//       queryClient.invalidateQueries(["systemSettings"]);
//     },
//     onError: () => toast.error("Failed to update settings"),
//   });

//   const handleChange = (e) => {
//     const { name, value, type } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === "number" ? Number(value) : value,
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     updateMutation.mutate(formData);
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center p-20">
//         <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen w-full" style={{ padding: "24px" }}>
//       <div style={{ marginBottom: "24px" }}>
//         <h1 className="text-xl font-bold text-gray-800">
//           System Configuration
//         </h1>
//         <p className="text-gray-500 text-[13px]" style={{ marginTop: "4px" }}>
//           Manage global platform rules, wallet addresses, and app information.
//         </p>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         style={{
//           display: "flex",
//           flexDirection: "column",
//           gap: "24px",
//           maxWidth: "900px",
//         }}
//       >
//         {/* Wallet Settings */}
//         <div
//           className="bg-white border border-gray-200 rounded-sm shadow-sm"
//           style={{ padding: "24px" }}
//         >
//           <h2
//             className="font-bold text-gray-800 flex items-center gap-2"
//             style={{
//               fontSize: "15px",
//               marginBottom: "20px",
//               borderBottom: "1px solid #f3f4f6",
//               paddingBottom: "12px",
//             }}
//           >
//             <Wallet className="w-5 h-5 text-teal-500" /> Receiving Wallets
//           </h2>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "16px" }}
//           >
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 USDT (TRC20) Address
//               </label>
//               <input
//                 type="text"
//                 name="usdtTrc20Address"
//                 value={formData.usdtTrc20Address || ""}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//                 placeholder="T..."
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 USDT (ERC20) Address
//               </label>
//               <input
//                 type="text"
//                 name="usdtErc20Address"
//                 value={formData.usdtErc20Address || ""}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//                 placeholder="0x..."
//               />
//             </div>
//           </div>
//         </div>

//         {/* Financial Rules */}
//         <div
//           className="bg-white border border-gray-200 rounded-sm shadow-sm"
//           style={{ padding: "24px" }}
//         >
//           <h2
//             className="font-bold text-gray-800 flex items-center gap-2"
//             style={{
//               fontSize: "15px",
//               marginBottom: "20px",
//               borderBottom: "1px solid #f3f4f6",
//               paddingBottom: "12px",
//             }}
//           >
//             <Percent className="w-5 h-5 text-blue-500" /> Financial Rules
//           </h2>
//           <div
//             style={{
//               display: "grid",
//               gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
//               gap: "20px",
//             }}
//           >
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 Min. Recharge Amount ($)
//               </label>
//               <input
//                 type="number"
//                 name="minRechargeAmount"
//                 value={formData.minRechargeAmount || 0}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 Min. Withdrawal Amount ($)
//               </label>
//               <input
//                 type="number"
//                 name="minWithdrawalAmount"
//                 value={formData.minWithdrawalAmount || 0}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 Withdrawal Fee (%)
//               </label>
//               <input
//                 type="number"
//                 name="withdrawalFeePercent"
//                 value={formData.withdrawalFeePercent || 0}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//               />
//             </div>
//           </div>
//         </div>

//         {/* App Info */}
//         <div
//           className="bg-white border border-gray-200 rounded-sm shadow-sm"
//           style={{ padding: "24px" }}
//         >
//           <h2
//             className="font-bold text-gray-800 flex items-center gap-2"
//             style={{
//               fontSize: "15px",
//               marginBottom: "20px",
//               borderBottom: "1px solid #f3f4f6",
//               paddingBottom: "12px",
//             }}
//           >
//             <Globe className="w-5 h-5 text-purple-500" /> Platform Info
//           </h2>
//           <div
//             style={{ display: "flex", flexDirection: "column", gap: "16px" }}
//           >
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 App Download Link
//               </label>
//               <input
//                 type="text"
//                 name="appDownloadLink"
//                 value={formData.appDownloadLink || ""}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 Home Marquee Announcement
//               </label>
//               <input
//                 type="text"
//                 name="announcementMarquee"
//                 value={formData.announcementMarquee || ""}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//               />
//             </div>
//             <div>
//               <label
//                 className="block text-[13px] font-bold text-gray-700"
//                 style={{ marginBottom: "8px" }}
//               >
//                 Working Hours
//               </label>
//               <input
//                 type="text"
//                 name="workingHours"
//                 value={formData.workingHours || ""}
//                 onChange={handleChange}
//                 className="w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500"
//                 style={{ padding: "10px 14px", fontSize: "13px" }}
//                 placeholder="e.g., 09:00 - 18:00"
//               />
//             </div>
//           </div>
//         </div>

//         <button
//           type="submit"
//           disabled={updateMutation.isPending}
//           className="bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-sm shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
//           style={{ padding: "14px 24px", fontSize: "14px", width: "200px" }}
//         >
//           {updateMutation.isPending ? (
//             <Loader2 className="w-4 h-4 animate-spin" />
//           ) : (
//             <Save className="w-4 h-4" />
//           )}
//           Save Settings
//         </button>
//       </form>
//     </div>
//   );
// }

////////////////////////////////============== latest version //////////////////////// =====================

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { Image as ImageIcon } from "lucide-react";
import {
  Save,
  Loader2,
  Wallet,
  Globe,
  Percent,
  Megaphone,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

export default function SystemSettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({});
  const [offerForm, setOfferForm] = useState({
    title: "",
    description: "",
    discountPercent: "",
    badgeText: "LIMITED OFFER",
    startTime: "",
    endTime: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["systemSettings"],
    queryFn: async () => {
      const { data } = await API.get("/settings");
      return data;
    },
  });

  const { data: offersData, isLoading: offersLoading } = useQuery({
    queryKey: ["adminOffers"],
    queryFn: async () => {
      const { data } = await API.get("/offers");
      return data.offers || [];
    },
  });

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (newData) => API.put("/settings", newData),
    onSuccess: (res) => {
      toast.success(res.data?.message || "Settings saved");
      queryClient.invalidateQueries(["systemSettings"]);
    },
    onError: () => toast.error("Failed to update settings"),
  });

  const createOfferMutation = useMutation({
    mutationFn: (body) => API.post("/offers", body),
    onSuccess: () => {
      toast.success("Offer created!");
      queryClient.invalidateQueries(["adminOffers"]);
      setOfferForm({
        title: "",
        description: "",
        discountPercent: "",
        badgeText: "LIMITED OFFER",
        startTime: "",
        endTime: "",
      });
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to create offer"),
  });

  const toggleOfferMutation = useMutation({
    mutationFn: (id) => API.put(`/offers/${id}/toggle`),
    onSuccess: () => queryClient.invalidateQueries(["adminOffers"]),
  });

  const deleteOfferMutation = useMutation({
    mutationFn: (id) => API.delete(`/offers/${id}`),
    onSuccess: () => {
      toast.success("Offer deleted");
      queryClient.invalidateQueries(["adminOffers"]);
    },
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

  const handleCreateOffer = () => {
    if (!offerForm.title || !offerForm.startTime || !offerForm.endTime)
      return toast.error("Title, start time and end time are required");
    createOfferMutation.mutate({
      ...offerForm,
      discountPercent: Number(offerForm.discountPercent || 0),
    });
  };

  const inputCls =
    "w-full border border-gray-300 rounded-sm outline-none focus:border-teal-500";
  const inputStyle = { padding: "10px 14px", fontSize: "13px" };
  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "bold",
    color: "#374151",
    marginBottom: "8px",
  };

  if (isLoading)
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
      </div>
    );

  return (
    <div className="bg-gray-50 min-h-screen w-full" style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="text-xl font-bold text-gray-800">
          System Configuration
        </h1>
        <p className="text-gray-500 text-[13px]" style={{ marginTop: "4px" }}>
          Manage global platform rules, wallet addresses, offers, and app
          information.
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
              <label style={labelStyle}>USDT (TRC20) Address</label>
              <input
                type="text"
                name="usdtTrc20Address"
                value={formData.usdtTrc20Address || ""}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
                placeholder="T..."
              />
            </div>
            <div>
              <label style={labelStyle}>USDT (ERC20) Address</label>
              <input
                type="text"
                name="usdtErc20Address"
                value={formData.usdtErc20Address || ""}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
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
              <label style={labelStyle}>Min. Recharge Amount ($)</label>
              <input
                type="number"
                name="minRechargeAmount"
                value={formData.minRechargeAmount || 0}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Min. Withdrawal Amount ($)</label>
              <input
                type="number"
                name="minWithdrawalAmount"
                value={formData.minWithdrawalAmount || 0}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Withdrawal Fee (%)</label>
              <input
                type="number"
                name="withdrawalFeePercent"
                value={formData.withdrawalFeePercent || 0}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Platform Info */}
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
              <label style={labelStyle}>App Download Link</label>
              <input
                type="text"
                name="appDownloadLink"
                value={formData.appDownloadLink || ""}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Home Marquee Announcement</label>
              <input
                type="text"
                name="announcementMarquee"
                value={formData.announcementMarquee || ""}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Working Hours</label>
              <input
                type="text"
                name="workingHours"
                value={formData.workingHours || ""}
                onChange={handleChange}
                className={inputCls}
                style={inputStyle}
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

      {/* ══════════════════════════════════════════════
          PROMOTIONAL OFFERS SECTION
      ══════════════════════════════════════════════ */}
      <div style={{ maxWidth: "900px", marginTop: "32px" }}>
        <div
          className="bg-white border border-gray-200 rounded-sm shadow-sm"
          style={{ padding: "24px" }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "20px",
              borderBottom: "1px solid #f3f4f6",
              paddingBottom: "12px",
            }}
          >
            <h2
              className="font-bold text-gray-800 flex items-center gap-2"
              style={{ fontSize: "15px" }}
            >
              <Megaphone className="w-5 h-5 text-rose-500" /> Promotional Offers
            </h2>
            <span style={{ fontSize: "12px", color: "#6b7280" }}>
              Active offers appear as banners on merchant home screen
            </span>
          </div>

          {/* Create Offer Form */}
          <div
            style={{
              backgroundColor: "#f8fafc",
              border: "1px dashed #e2e8f0",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <p
              style={{
                fontSize: "13px",
                fontWeight: "bold",
                color: "#374151",
                marginBottom: "16px",
              }}
            >
              Create New Offer
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "16px",
              }}
            >
              <div>
                <label style={labelStyle}>Offer Title *</label>
                <input
                  type="text"
                  value={offerForm.title}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, title: e.target.value })
                  }
                  placeholder="e.g. Double Commission Weekend!"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Badge Text</label>
                <input
                  type="text"
                  value={offerForm.badgeText}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, badgeText: e.target.value })
                  }
                  placeholder="LIMITED OFFER"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Description</label>
                <input
                  type="text"
                  value={offerForm.description}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, description: e.target.value })
                  }
                  placeholder="e.g. Earn 2x commission on all orders this weekend only!"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              // Replace the Banner Image URL div with this:
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Banner Image</label>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "12px" }}
                >
                  {offerForm.bannerImage && (
                    <img
                      src={offerForm.bannerImage}
                      alt="preview"
                      style={{
                        width: "80px",
                        height: "50px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  )}
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "8px",
                      backgroundColor: "#f1f5f9",
                      border: "1px dashed #cbd5e1",
                      borderRadius: "6px",
                      padding: "10px 16px",
                      cursor: "pointer",
                      fontSize: "13px",
                      color: "#475569",
                      fontWeight: "600",
                    }}
                  >
                    {uploadingImage ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />{" "}
                        Uploading...
                      </>
                    ) : (
                      <>
                        <ImageIcon size={14} />{" "}
                        {offerForm.bannerImage
                          ? "Change Image"
                          : "Upload Banner Image"}
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const fd = new FormData();
                          fd.append("file", file); // ← "file" not "image"
                          const { data } = await API.post(
                            "/upload/single?folder=offers",
                            fd,
                            {
                              // ← /upload/single
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            },
                          );
                          setOfferForm((prev) => ({
                            ...prev,
                            bannerImage: data.url,
                          })); // ← data.url directly
                        } catch {
                          toast.error("Image upload failed");
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                  {offerForm.bannerImage && (
                    <button
                      onClick={() =>
                        setOfferForm((prev) => ({ ...prev, bannerImage: "" }))
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        cursor: "pointer",
                        fontSize: "12px",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Bonus %</label>
                <input
                  type="number"
                  value={offerForm.discountPercent}
                  onChange={(e) =>
                    setOfferForm({
                      ...offerForm,
                      discountPercent: e.target.value,
                    })
                  }
                  placeholder="e.g. 20"
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div />
              <div>
                <label style={labelStyle}>Start Time *</label>
                <input
                  type="datetime-local"
                  value={offerForm.startTime}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, startTime: e.target.value })
                  }
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>End Time *</label>
                <input
                  type="datetime-local"
                  value={offerForm.endTime}
                  onChange={(e) =>
                    setOfferForm({ ...offerForm, endTime: e.target.value })
                  }
                  className={inputCls}
                  style={inputStyle}
                />
              </div>
            </div>
            <button
              onClick={handleCreateOffer}
              disabled={createOfferMutation.isPending}
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-sm font-bold text-[13px] flex items-center gap-2 disabled:opacity-50 transition-colors"
              style={{ padding: "10px 20px" }}
            >
              {createOfferMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Offer
            </button>
          </div>

          {/* Offers List */}
          {offersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          ) : !offersData || offersData.length === 0 ? (
            <p className="text-center text-gray-400 text-[13px] py-8">
              No offers created yet.
            </p>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {offersData.map((offer) => {
                const now = new Date();
                const isLive =
                  offer.isActive &&
                  new Date(offer.startTime) <= now &&
                  new Date(offer.endTime) >= now;
                const isExpired = new Date(offer.endTime) < now;
                return (
                  <div
                    key={offer._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      padding: "16px",
                      backgroundColor: isLive ? "#f0fdf4" : "#f8fafc",
                      border: `1px solid ${isLive ? "#bbf7d0" : "#e5e7eb"}`,
                      borderRadius: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: "bold",
                            color: "#1f2937",
                          }}
                        >
                          {offer.title}
                        </span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "bold",
                            padding: "2px 8px",
                            borderRadius: "20px",
                            backgroundColor: isLive
                              ? "#dcfce7"
                              : isExpired
                                ? "#fee2e2"
                                : "#fef3c7",
                            color: isLive
                              ? "#16a34a"
                              : isExpired
                                ? "#dc2626"
                                : "#d97706",
                          }}
                        >
                          {isLive
                            ? "● LIVE"
                            : isExpired
                              ? "EXPIRED"
                              : "SCHEDULED"}
                        </span>
                        {offer.discountPercent > 0 && (
                          <span
                            style={{
                              fontSize: "11px",
                              fontWeight: "bold",
                              color: "#f02d65",
                              backgroundColor: "#fff1f2",
                              padding: "2px 8px",
                              borderRadius: "20px",
                            }}
                          >
                            +{offer.discountPercent}%
                          </span>
                        )}
                      </div>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#6b7280",
                          margin: "0 0 4px 0",
                        }}
                      >
                        {offer.description}
                      </p>
                      <p
                        style={{
                          fontSize: "11px",
                          color: "#9ca3af",
                          margin: 0,
                          fontFamily: "monospace",
                        }}
                      >
                        {new Date(offer.startTime).toLocaleString()} →{" "}
                        {new Date(offer.endTime).toLocaleString()}
                      </p>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        onClick={() => toggleOfferMutation.mutate(offer._id)}
                        title={offer.isActive ? "Deactivate" : "Activate"}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: offer.isActive ? "#10b981" : "#9ca3af",
                        }}
                      >
                        {offer.isActive ? (
                          <ToggleRight size={28} />
                        ) : (
                          <ToggleLeft size={28} />
                        )}
                      </button>
                      <button
                        onClick={() =>
                          window.confirm("Delete this offer?") &&
                          deleteOfferMutation.mutate(offer._id)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ef4444",
                        }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
