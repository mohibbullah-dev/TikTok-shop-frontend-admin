import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import API from "../../api/axios";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  // ── LOGIC REMAINS EXACTLY THE SAME ──
  const loginMutation = useMutation({
    mutationFn: async () => {
      const { data } = await API.post("/auth/login", form);
      return data;
    },
    onSuccess: (data) => {
      const adminRoles = ["superAdmin", "merchantAdmin", "dispatchAdmin"];
      if (!adminRoles.includes(data.user.role)) {
        toast.error("Access denied. Admin accounts only.");
        return;
      }
      dispatch(loginSuccess({ user: data.user, token: data.token }));
      toast.success(`Welcome back, ${data.user.username}!`);
      navigate("/");
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Login failed");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }
    loginMutation.mutate();
  };

  // ── STRICT INLINE CSS FOR GUARANTEED RENDERING ──
  const styles = {
    page: {
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      backgroundImage:
        "radial-gradient(circle at 50% 0%, #fff7ed 0%, #f8fafc 80%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "system-ui, -apple-system, sans-serif",
    },
    card: {
      backgroundColor: "#ffffff",
      width: "100%",
      maxWidth: "420px",
      padding: "40px 32px",
      borderRadius: "24px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)",
      border: "1px solid #f1f5f9",
      boxSizing: "border-box",
    },
    logoBox: {
      width: "64px",
      height: "64px",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      borderRadius: "16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      margin: "0 auto 20px auto",
      boxShadow: "0 8px 20px rgba(249, 115, 22, 0.25)",
    },
    title: {
      textAlign: "center",
      fontSize: "24px",
      fontWeight: "800",
      color: "#0f172a",
      margin: "0 0 8px 0",
      letterSpacing: "-0.5px",
    },
    subtitle: {
      textAlign: "center",
      fontSize: "14px",
      color: "#64748b",
      margin: "0 0 32px 0",
      fontWeight: "500",
    },
    label: {
      display: "block",
      fontSize: "12px",
      fontWeight: "700",
      color: "#475569",
      marginBottom: "8px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    inputWrapper: {
      position: "relative",
      marginBottom: "20px",
    },
    iconLeft: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#94a3b8",
      pointerEvents: "none",
    },
    input: {
      width: "100%",
      padding: "14px 16px 14px 44px",
      backgroundColor: "#f8fafc",
      border: "2px solid #e2e8f0",
      borderRadius: "12px",
      fontSize: "15px",
      color: "#0f172a",
      outline: "none",
      transition: "all 0.2s",
      boxSizing: "border-box",
      fontWeight: "500",
    },
    iconRight: {
      position: "absolute",
      right: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      padding: 0,
      cursor: "pointer",
      color: "#94a3b8",
      display: "flex",
      alignItems: "center",
    },
    button: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
      color: "#ffffff",
      border: "none",
      borderRadius: "12px",
      fontSize: "15px",
      fontWeight: "700",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
      boxShadow: "0 4px 15px rgba(249, 115, 22, 0.3)",
      transition: "transform 0.1s",
      marginTop: "12px",
    },
    footer: {
      marginTop: "32px",
      paddingTop: "24px",
      borderTop: "1px solid #f1f5f9",
      textAlign: "center",
    },
    tags: {
      display: "flex",
      justifyContent: "center",
      gap: "8px",
      flexWrap: "wrap",
      marginTop: "12px",
    },
    tag: {
      backgroundColor: "#f1f5f9",
      color: "#475569",
      padding: "4px 10px",
      borderRadius: "6px",
      fontSize: "11px",
      fontWeight: "600",
      border: "1px solid #e2e8f0",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo & Header */}
        <div style={styles.logoBox}>
          <ShieldCheck size={32} color="#fff" strokeWidth={2.5} />
        </div>
        <h1 style={styles.title}>Admin Portal</h1>
        <p style={styles.subtitle}>Secure access to the Management System</p>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Email Address</label>
            <div style={{ position: "relative" }}>
              <div style={styles.iconLeft}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@example.com"
                style={styles.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f97316";
                  e.target.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.backgroundColor = "#f8fafc";
                }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={styles.inputWrapper}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <div style={styles.iconLeft}>
                <Lock size={18} />
              </div>
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{ ...styles.input, paddingRight: "44px" }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#f97316";
                  e.target.style.backgroundColor = "#fff";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e2e8f0";
                  e.target.style.backgroundColor = "#f8fafc";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                style={styles.iconRight}
                onMouseOver={(e) => (e.currentTarget.style.color = "#475569")}
                onMouseOut={(e) => (e.currentTarget.style.color = "#94a3b8")}
              >
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            style={{
              ...styles.button,
              background: loginMutation.isPending
                ? "#cbd5e1"
                : styles.button.background,
              boxShadow: loginMutation.isPending
                ? "none"
                : styles.button.boxShadow,
              cursor: loginMutation.isPending ? "not-allowed" : "pointer",
            }}
            onMouseDown={(e) =>
              !loginMutation.isPending &&
              (e.currentTarget.style.transform = "scale(0.98)")
            }
            onMouseUp={(e) =>
              !loginMutation.isPending &&
              (e.currentTarget.style.transform = "scale(1)")
            }
          >
            {loginMutation.isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Authenticating...
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>

        {/* Footer Access Info */}
        <div style={styles.footer}>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
              margin: 0,
            }}
          >
            Authorized Roles
          </p>
          <div style={styles.tags}>
            <span style={styles.tag}>Super Admin</span>
            <span style={styles.tag}>Merchant Admin</span>
            <span style={styles.tag}>Dispatch Admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
