import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";
import { Send, Loader2, Plus, Minus } from "lucide-react";

export default function DispatchOrders() {
  const queryClient = useQueryClient();
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [deadline, setDeadline] = useState(24);

  // Load approved merchants
  const { data: merchantsData } = useQuery({
    queryKey: ["dispatchMerchants"],
    queryFn: async () => {
      const { data } = await API.get("/merchants?status=approved&limit=100");
      return data;
    },
  });

  // Load products for selected merchant
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["merchantProducts", selectedMerchant],
    queryFn: async () => {
      const { data } = await API.get(
        `/products/merchant/${selectedMerchant}?onShelf=true`,
      );
      return data;
    },
    enabled: !!selectedMerchant,
  });

  const dispatchMutation = useMutation({
    mutationFn: (body) => API.post("/orders/dispatch", body),
    onSuccess: () => {
      toast.success("Order dispatched successfully!");
      setSelectedMerchant("");
      setSelectedProduct("");
      setQuantity(1);
      setDeadline(24);
      queryClient.invalidateQueries(["orders"]);
    },
    onError: (e) =>
      toast.error(e.response?.data?.message || "Failed to dispatch order"),
  });

  const handleDispatch = () => {
    if (!selectedMerchant) return toast.error("Please select a merchant");
    if (!selectedProduct) return toast.error("Please select a product");
    if (quantity < 1) return toast.error("Quantity must be at least 1");
    dispatchMutation.mutate({
      merchantId: selectedMerchant,
      products: [
        {
          productId: selectedProduct,
          quantity: quantity,
        },
      ],
      completionDays: deadline / 24 || 1, // Convert hours to days
    });
  };

  const merchants = merchantsData?.merchants || merchantsData || [];
  const products = productsData?.products || productsData || [];

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const estimatedCost = selectedProductData
    ? selectedProductData.costPrice * quantity
    : 0;
  const estimatedProfit = selectedProductData
    ? (selectedProductData.salesPrice - selectedProductData.costPrice) *
      quantity
    : 0;

  const selectCls =
    "w-full border border-gray-300 rounded-sm text-[13px] text-gray-700 focus:outline-none focus:border-teal-500";
  const selectStyle = { padding: "10px 14px" };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 className="text-xl font-bold text-gray-800">Dispatch Orders</h1>
        <p className="text-gray-500 text-[13px]" style={{ marginTop: "4px" }}>
          Push a virtual order to a merchant's store
        </p>
      </div>

      <div style={{ maxWidth: "600px" }}>
        <div
          className="bg-white border border-gray-200 rounded-sm shadow-sm"
          style={{ padding: "28px" }}
        >
          {/* Step 1 — Select Merchant */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Step 1 — Select Merchant
            </label>
            <select
              value={selectedMerchant}
              onChange={(e) => {
                setSelectedMerchant(e.target.value);
                setSelectedProduct("");
              }}
              className={selectCls}
              style={selectStyle}
            >
              <option value="">-- Choose a merchant --</option>
              {merchants.map((m) => (
                <option key={m._id} value={m._id}>
                  {m.storeName || m.user?.username} (ID: {m.merchantId})
                </option>
              ))}
            </select>
          </div>

          {/* Step 2 — Select Product */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Step 2 — Select Product (from merchant's shelf)
            </label>
            {!selectedMerchant ? (
              <p className="text-gray-400 text-[13px]">
                Select a merchant first
              </p>
            ) : productsLoading ? (
              <div className="flex items-center gap-2 text-gray-400 text-[13px]">
                <Loader2 size={14} className="animate-spin" /> Loading
                products...
              </div>
            ) : products.length === 0 ? (
              <p className="text-red-400 text-[13px]">
                This merchant has no products on shelf
              </p>
            ) : (
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className={selectCls}
                style={selectStyle}
              >
                <option value="">-- Choose a product --</option>
                {products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title} — Cost: ${p.costPrice} / Sell: ${p.salesPrice}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Step 3 — Quantity */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Step 3 — Quantity
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Minus size={14} />
              </button>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  minWidth: "30px",
                  textAlign: "center",
                }}
              >
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  background: "#f9fafb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Step 4 — Deadline */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "bold",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Step 4 — Pickup Deadline (hours)
            </label>
            <select
              value={deadline}
              onChange={(e) => setDeadline(Number(e.target.value))}
              className={selectCls}
              style={selectStyle}
            >
              {[12, 24, 48, 72].map((h) => (
                <option key={h} value={h}>
                  {h} hours
                </option>
              ))}
            </select>
          </div>

          {/* Order Summary */}
          {selectedProductData && (
            <div
              style={{
                backgroundColor: "#f0fdf4",
                border: "1px solid #bbf7d0",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "24px",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "bold",
                  color: "#166534",
                  marginBottom: "8px",
                }}
              >
                Order Summary
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#374151",
                  marginBottom: "4px",
                }}
              >
                <span>Merchant pays (cost):</span>
                <span style={{ fontWeight: "bold" }}>
                  ${estimatedCost.toFixed(2)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "13px",
                  color: "#16a34a",
                }}
              >
                <span>Merchant earns (profit):</span>
                <span style={{ fontWeight: "bold" }}>
                  +${estimatedProfit.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Dispatch Button */}
          <button
            onClick={handleDispatch}
            disabled={dispatchMutation.isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
            style={{ width: "100%", padding: "14px", fontSize: "14px" }}
          >
            {dispatchMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Dispatch Order
          </button>
        </div>
      </div>
    </div>
  );
}
