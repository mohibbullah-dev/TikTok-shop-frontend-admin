import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import API from "../../api/axios";

// ── Icons ─────────────────────────────────────────────────────
import { Shield, UserPlus, Trash2, Loader2, RefreshCcw } from "lucide-react";

export default function AdminManagement() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "merchantAdmin",
  });

  // ── Fetch Logic ────────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      const { data } = await API.get("/admins");
      return data.admins || [];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries(["admins"]);
    toast.success("List refreshed");
  };

  // ── Mutations ───────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (newAdmin) => API.post("/admins", newAdmin),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["admins"]);
      setIsModalOpen(false);
      setFormData({ username: "", password: "", role: "merchantAdmin" }); // Reset
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Creation failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => API.delete(`/admins/${id}`),
    onSuccess: (res) => {
      toast.success(res.data.message);
      queryClient.invalidateQueries(["admins"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Deletion failed"),
  });

  // ── Handlers ────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#f9fafb",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── HEADER & ACTION BAR ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1f2937",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <Shield className="text-teal-500" size={28} /> System Administrators
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280", marginTop: "4px" }}>
            Create and manage internal employee accounts (Agents & Dispatchers).
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={invalidate}
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#4b5563",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <RefreshCcw
              size={18}
              className={isFetching ? "animate-spin" : ""}
            />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              padding: "0 20px",
              height: "40px",
              backgroundColor: "#14b8a6",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontWeight: "bold",
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          >
            <UserPlus size={18} /> Add New Admin
          </button>
        </div>
      </div>

      {/* ── DATA TABLE ── */}
      <div
        style={{
          backgroundColor: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          overflowX: "auto",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "700px",
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: "#f8fafc",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <th
                style={{
                  padding: "16px 20px",
                  textAlign: "left",
                  fontSize: "13px",
                  color: "#4b5563",
                  fontWeight: "bold",
                }}
              >
                Username
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  textAlign: "left",
                  fontSize: "13px",
                  color: "#4b5563",
                  fontWeight: "bold",
                }}
              >
                Role Permission
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#4b5563",
                  fontWeight: "bold",
                }}
              >
                Creation Date
              </th>
              <th
                style={{
                  padding: "16px 20px",
                  textAlign: "center",
                  fontSize: "13px",
                  color: "#4b5563",
                  fontWeight: "bold",
                }}
              >
                Operate
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan="4"
                  style={{ padding: "40px", textAlign: "center" }}
                >
                  <Loader2
                    size={24}
                    color="#14b8a6"
                    className="animate-spin"
                    style={{ margin: "0 auto" }}
                  />
                </td>
              </tr>
            ) : data?.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  style={{
                    padding: "40px",
                    textAlign: "center",
                    color: "#6b7280",
                    fontSize: "14px",
                  }}
                >
                  No internal admins found.
                </td>
              </tr>
            ) : (
              data?.map((admin) => (
                <tr
                  key={admin._id}
                  style={{ borderBottom: "1px solid #f3f4f6" }}
                >
                  <td
                    style={{
                      padding: "16px 20px",
                      fontSize: "14px",
                      fontWeight: "bold",
                      color: "#1f2937",
                    }}
                  >
                    {admin.username}
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        backgroundColor:
                          admin.role === "merchantAdmin"
                            ? "#e0e7ff"
                            : "#fce7f3",
                        color:
                          admin.role === "merchantAdmin"
                            ? "#3730a3"
                            : "#9d174d",
                      }}
                    >
                      {admin.role === "merchantAdmin"
                        ? "Agent (Merchant Admin)"
                        : "Dispatcher (Dispatch Admin)"}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "16px 20px",
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#6b7280",
                    }}
                  >
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "16px 20px", textAlign: "center" }}>
                    <button
                      onClick={() =>
                        window.confirm(`Delete account ${admin.username}?`) &&
                        deleteMutation.mutate(admin._id)
                      }
                      disabled={deleteMutation.isPending}
                      style={{
                        padding: "6px 12px",
                        backgroundColor: "#fee2e2",
                        color: "#b91c1c",
                        border: "none",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ════════════ MODAL: CREATE ADMIN ════════════ */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              borderRadius: "6px",
              width: "100%",
              maxWidth: "450px",
              boxShadow:
                "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid #e5e7eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#f8fafc",
                borderRadius: "6px 6px 0 0",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#1f2937",
                }}
              >
                Create New Admin
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9ca3af",
                }}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder="e.g. agent_john"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Password
                </label>
                <input
                  type="text"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder="Enter a secure password"
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: "bold",
                    color: "#374151",
                    marginBottom: "8px",
                  }}
                >
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "#fff",
                  }}
                >
                  <option value="merchantAdmin">Merchant Admin (Agent)</option>
                  <option value="dispatchAdmin">
                    Dispatch Admin (Operator)
                  </option>
                </select>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#6b7280",
                    marginTop: "8px",
                  }}
                >
                  * Merchant Admins handle user invites and chat. Dispatch
                  Admins handle orders and pools.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                  marginTop: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#fff",
                    border: "1px solid #d1d5db",
                    color: "#374151",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#0f172a",
                    border: "none",
                    color: "#fff",
                    borderRadius: "4px",
                    fontWeight: "bold",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {createMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    "Create Account"
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
