import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Star,
  Eye,
  EyeOff,
} from "lucide-react";

export default function ProductPool() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // ── States ──────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    salesPrice: "",
    costPrice: "",
    category: "General",
    image: "",
  });

  // ── Fetch Logic ─────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["productsAdmin", page, limit, search],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit });
      if (search) p.set("title", search);
      const { data } = await API.get(`/products/admin?${p.toString()}`);
      return data;
    },
    keepPreviousData: true,
  });

  const products = data?.products || [];
  const total = data?.total || 0;
  const totalPages = data?.pages || 1;

  // ── Mutations ───────────────────────────────────────────────
  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editId
        ? API.put(`/products/admin/${editId}`, payload)
        : API.post("/products/admin", payload),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["productsAdmin"]);
      closeModal();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Operation failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/products/admin/${id}`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["productsAdmin"]);
    },
  });

  const toggleShelfMutation = useMutation({
    mutationFn: (id) => API.put(`/products/${id}/toggle-admin`),
    onSuccess: () => queryClient.invalidateQueries(["productsAdmin"]),
  });

  const toggleRecommendMutation = useMutation({
    mutationFn: (id) => API.put(`/products/${id}/recommend`),
    onSuccess: () => queryClient.invalidateQueries(["productsAdmin"]),
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await API.post("/upload/single?folder=products", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData({ ...formData, image: data.url });
    } catch {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditId(product._id);
      setFormData({
        title: product.title,
        salesPrice: product.salesPrice,
        costPrice: product.costPrice,
        category: product.category,
        image: product.image || "",
      });
    } else {
      setEditId(null);
      setFormData({
        title: "",
        salesPrice: "",
        costPrice: "",
        category: "General",
        image: "",
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.salesPrice || !formData.costPrice) {
      return toast.warning("Title, Sales Price, and Cost Price are required.");
    }
    saveMutation.mutate({
      ...formData,
      salesPrice: Number(formData.salesPrice),
      costPrice: Number(formData.costPrice),
    });
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
    // 1. FIXED HEIGHT CONTAINER

    <div
      style={{ padding: "16px" }}
      className="p-4 md:p-6 bg-gray-50 flex flex-col h-[calc(100vh)] w-full overflow-hidden"
    >
      {/* ── HEADER ── */}
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <Package className="text-teal-500 w-6 h-6" /> Distribution Center
        </h1>
        <p className="text-[13px] text-gray-500 mt-1">
          {total.toLocaleString()} items · Manage the platform's global product
          pool.
        </p>
      </div>

      {/* ── VISUAL FILTER BAR ── */}
      <div
        style={{ paddingTop: "10px", paddingBottom: "10px" }}
        className=" mb-4 w-full shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0"
      >
        <div className="relative w-full sm:w-auto sm:max-w-sm flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            style={{ padding: "10px 14px 10px 36px" }}
            type="text"
            placeholder="Search product title..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-sm border border-gray-300 text-gray-800 text-[13px] outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all bg-white"
          />
        </div>
        <button
          onClick={() => openModal()}
          style={{ padding: "10px 24px" }}
          className="w-full sm:w-auto bg-teal-500 hover:bg-teal-600 text-white text-[13px] font-bold rounded-sm transition-colors shadow-sm flex items-center justify-center gap-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add New Product
        </button>
      </div>

      {/* ── DATA TABLE CONTAINER (FLEX-1, OVERFLOW) ── */}
      <div className="bg-white border border-gray-200 rounded-sm shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* The Scrollable Table Wrapper */}
        <div className="flex-1 overflow-auto custom-scrollbar relative">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            {/* Sticky Header Row inside the table */}
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-gray-200 text-gray-800 text-[13px] font-bold bg-gray-50 whitespace-nowrap shadow-sm">
                <th
                  style={{ padding: "16px 20px" }}
                  className="text-center w-20"
                >
                  Image
                </th>
                <th style={{ padding: "16px 20px" }}>Product Title</th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Origin
                </th>
                <th style={{ padding: "16px 20px" }} className="text-right">
                  Cost Price
                </th>
                <th style={{ padding: "16px 20px" }} className="text-right">
                  Sales Price
                </th>
                <th style={{ padding: "16px 20px" }} className="text-right">
                  Est. Profit
                </th>
                <th style={{ padding: "16px 20px" }} className="text-center">
                  Status
                </th>
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
                        Loading product pool...
                      </p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-24 text-gray-500 text-[14px]"
                  >
                    No matching records found.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr
                    key={p._id}
                    className={`border-b border-gray-100 hover:bg-slate-50/80 transition-colors ${p.isDistribution ? "bg-white" : "bg-amber-50/30"}`}
                  >
                    <td
                      style={{ padding: "12px 20px" }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 bg-gray-50 rounded-sm border border-gray-200 flex items-center justify-center overflow-hidden mx-auto shadow-sm">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt="img"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px 20px" }}>
                      <p
                        className="text-[14px] font-bold text-gray-800 mb-1 max-w-[250px] truncate pr-4"
                        title={p.title}
                      >
                        {p.title}
                      </p>
                      <span className="text-[11px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-sm border border-gray-200">
                        {p.category}
                      </span>
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <span
                        className={`px-2.5 py-1 rounded-sm text-[11px] font-bold border ${p.isDistribution ? "bg-indigo-50 text-indigo-700 border-indigo-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}
                      >
                        {p.isDistribution ? "Platform" : `Merchant`}
                      </span>
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-right text-[14px] text-gray-500 font-mono"
                    >
                      ${p.costPrice?.toFixed(2)}
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-right text-[14px] font-bold text-gray-800 font-mono"
                    >
                      ${p.salesPrice?.toFixed(2)}
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-right text-[14px] font-black text-emerald-600 font-mono"
                    >
                      + ${(p.salesPrice - p.costPrice).toFixed(2)}
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <div className="flex flex-col items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${p.isActive ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}
                        >
                          {p.isActive ? "ON SHELF" : "OFF SHELF"}
                        </span>
                        {p.isRecommended && (
                          <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-500" />{" "}
                            Recommended
                          </span>
                        )}
                      </div>
                    </td>
                    <td
                      style={{ padding: "16px 20px" }}
                      className="text-center"
                    >
                      <div className="flex justify-center flex-wrap gap-2 max-w-[160px] mx-auto">
                        {p.isDistribution && (
                          <button
                            style={{
                              paddingTop: "5px",
                              paddingBottom: "5px",
                              paddingLeft: "8px",
                              paddingRight: "8px",
                            }}
                            onClick={() => openModal(p)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-[3px] text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Edit className="w-3 h-3" /> Edit
                          </button>
                        )}
                        <button
                          style={{
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            paddingLeft: "8px",
                            paddingRight: "8px",
                          }}
                          onClick={() => toggleShelfMutation.mutate(p._id)}
                          disabled={toggleShelfMutation.isPending}
                          className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 rounded-[3px] text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                        >
                          {p.isActive ? (
                            <>
                              <EyeOff className="w-3 h-3" /> Hide
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" /> Show
                            </>
                          )}
                        </button>
                        <button
                          style={{
                            paddingTop: "5px",
                            paddingBottom: "5px",
                            paddingLeft: "8px",
                            paddingRight: "8px",
                          }}
                          onClick={() => toggleRecommendMutation.mutate(p._id)}
                          disabled={toggleRecommendMutation.isPending}
                          className={`px-2 py-1 rounded-[3px] text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50 border ${p.isRecommended ? "bg-amber-50 hover:bg-amber-100 text-amber-600 border-amber-200" : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"}`}
                        >
                          <Star className="w-3 h-3" />{" "}
                          {p.isRecommended ? "Un-Rec" : "Rec"}
                        </button>
                        {p.isDistribution && (
                          <button
                            style={{
                              paddingTop: "5px",
                              paddingBottom: "5px",
                              paddingLeft: "8px",
                              paddingRight: "8px",
                            }}
                            onClick={() =>
                              window.confirm("Delete this product?") &&
                              deleteMutation.mutate(p._id)
                            }
                            className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-[3px] text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sticky Footer Pagination */}
        <div
          style={{ padding: "16px 20px" }}
          className="flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 z-10"
        >
          <div className="text-[13px] text-gray-500 font-medium flex items-center gap-2 flex-wrap">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)}{" "}
            of {total} items
            <select
              style={{ padding: "4px 8px" }}
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="border border-gray-300 rounded-sm outline-none focus:border-teal-500 bg-white font-semibold text-gray-700 ml-2 shadow-sm"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              style={{ padding: "6px 12px" }}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="border border-gray-300 rounded-sm text-[12px] font-bold bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-colors text-gray-700"
            >
              Prev
            </button>
            {getPageNums().map((n, idx) =>
              n === "..." ? (
                <span
                  key={`dots-${idx}`}
                  className="px-2 text-gray-400 font-bold"
                >
                  ...
                </span>
              ) : (
                <button
                  style={{ padding: "6px 12px" }}
                  key={n}
                  onClick={() => setPage(n)}
                  className={`min-w-[36px] border rounded-sm text-[12px] font-bold shadow-sm transition-colors ${n === page ? "bg-slate-800 text-white border-slate-800" : "bg-white border-gray-300 hover:bg-gray-50 text-gray-700"}`}
                >
                  {n}
                </button>
              ),
            )}
            <button
              style={{ padding: "6px 12px" }}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
              className="border border-gray-300 rounded-sm text-[12px] font-bold bg-white hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-colors text-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ════════════ RESPONSIVE MODAL ════════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm pointer-events-auto overflow-y-auto">
          <div className="relative bg-white rounded-sm flex flex-col shadow-2xl w-full max-w-[500px] max-h-[95vh] my-auto overflow-hidden">
            <div
              style={{ padding: "16px 24px" }}
              className="flex items-center justify-between bg-slate-800 text-white flex-shrink-0"
            >
              <h3 className="font-bold text-[16px]">
                {editId ? "Edit Platform Product" : "Add New Platform Product"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-300 hover:text-white transition-colors cursor-pointer text-xl"
              >
                ✕
              </button>
            </div>
            <form
              onSubmit={handleSubmit}
              style={{ padding: "24px" }}
              className="flex flex-col gap-5 overflow-y-auto custom-scrollbar bg-gray-50/30"
            >
              <div className="flex gap-4 items-center bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
                <div className="w-16 h-16 border border-dashed border-gray-300 rounded-sm bg-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {uploading ? (
                    <Loader2 className="w-6 h-6 text-teal-500 animate-spin" />
                  ) : formData.image ? (
                    <img
                      src={formData.image}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    style={{
                      paddingTop: "5px",
                      paddingBottom: "5px",
                      paddingLeft: "8px",
                      paddingRight: "8px",
                    }}
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2 bg-slate-800 text-white border-none rounded-sm text-[12px] font-bold cursor-pointer shadow-sm hover:bg-slate-900 transition-colors"
                  >
                    {uploading ? "Uploading..." : "Upload Image"}
                  </button>
                  <p className="text-[11px] text-gray-500 mt-1.5 font-medium">
                    Recommended: Square format (JPG, PNG)
                  </p>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  style={{ padding: "10px 14px" }}
                  className="w-full border border-gray-300 rounded-sm text-[13px] outline-none focus:border-teal-500 bg-white shadow-sm transition-colors"
                  placeholder="e.g. Wireless Noise-Cancelling Headphones"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-full sm:flex-1">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                    Cost Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.costPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, costPrice: e.target.value })
                    }
                    style={{ padding: "10px 14px" }}
                    className="w-full border border-gray-300 rounded-sm text-[14px] font-mono outline-none focus:border-red-400 bg-red-50 shadow-sm transition-colors text-gray-800"
                    placeholder="0.00"
                  />
                </div>
                <div className="w-full sm:flex-1">
                  <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                    Sales Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.salesPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, salesPrice: e.target.value })
                    }
                    style={{ padding: "10px 14px" }}
                    className="w-full border border-gray-300 rounded-sm text-[14px] font-mono outline-none focus:border-emerald-400 bg-emerald-50 shadow-sm transition-colors text-gray-800"
                    placeholder="0.00"
                  />
                </div>
              </div>
              {formData.salesPrice && formData.costPrice && (
                <div className="bg-emerald-50 border border-dashed border-emerald-300 p-3 rounded-sm text-center shadow-sm">
                  <p className="text-[12px] text-emerald-700 m-0 font-medium">
                    Estimated Merchant Profit per Order:{" "}
                    <span className="font-bold text-[14px] font-mono ml-1">
                      + $
                      {(
                        Number(formData.salesPrice) - Number(formData.costPrice)
                      ).toFixed(2)}
                    </span>
                  </p>
                </div>
              )}
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-1.5">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  style={{ padding: "10px 14px" }}
                  className="w-full border border-gray-300 rounded-sm text-[13px] outline-none focus:border-teal-500 bg-white shadow-sm transition-colors cursor-pointer text-gray-800"
                >
                  <option value="General">General</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Living">Home & Living</option>
                  <option value="Beauty">Beauty</option>
                </select>
              </div>
              <div
                style={{ paddingTop: "20px", marginTop: "8px" }}
                className="flex justify-end gap-3 mt-2 pt-5  border-t border-gray-200"
              >
                <button
                  style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-sm font-bold text-[13px] cursor-pointer hover:bg-gray-50 transition-colors shadow-sm w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  style={{
                    paddingTop: "5px",
                    paddingBottom: "5px",
                    paddingLeft: "8px",
                    paddingRight: "8px",
                  }}
                  type="submit"
                  disabled={saveMutation.isPending || uploading}
                  className="px-6 py-2.5 bg-teal-500 border-none text-white rounded-sm font-bold text-[13px] cursor-pointer flex items-center justify-center gap-2 hover:bg-teal-600 transition-colors shadow-sm disabled:opacity-50 w-full sm:w-auto"
                >
                  {saveMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editId ? (
                    "Update Product"
                  ) : (
                    "Save to Pool"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
