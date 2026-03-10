// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../../store/authSlice";
// import API from "../../api/axios";

// export default function Login() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPw, setShowPw] = useState(false);

//   const loginMutation = useMutation({
//     mutationFn: async () => {
//       const { data } = await API.post("/auth/login", form);
//       return data;
//     },
//     onSuccess: (data) => {
//       const adminRoles = ["superAdmin", "merchantAdmin", "dispatchAdmin"];
//       if (!adminRoles.includes(data.user.role)) {
//         toast.error("Access denied. Admin accounts only.");
//         return;
//       }
//       dispatch(loginSuccess({ user: data.user, token: data.token }));
//       toast.success(`Welcome back, ${data.user.username}!`);
//       navigate("/");
//     },
//     onError: (err) => {
//       toast.error(err.response?.data?.message || "Login failed");
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.email || !form.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }
//     loginMutation.mutate();
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center
//       relative overflow-hidden"
//       style={{
//         background:
//           "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
//       }}
//     >
//       {/* Decorative blobs */}
//       <div
//         className="absolute top-0 left-0 w-96 h-96 rounded-full
//         opacity-20 blur-3xl pointer-events-none"
//         style={{ background: "radial-gradient(circle,#6366f1,transparent)" }}
//       />
//       <div
//         className="absolute bottom-0 right-0 w-96 h-96 rounded-full
//         opacity-20 blur-3xl pointer-events-none"
//         style={{ background: "radial-gradient(circle,#f02d65,transparent)" }}
//       />

//       <div className="relative w-full max-w-md mx-4">
//         {/* Card */}
//         <div
//           className="bg-white/5 backdrop-blur-xl rounded-3xl p-8
//           border border-white/10"
//           style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
//         >
//           {/* Logo */}
//           <div className="flex flex-col items-center mb-8">
//             <div
//               className="w-16 h-16 rounded-2xl flex items-center
//               justify-center mb-4"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               }}
//             >
//               <span className="text-3xl">🛍️</span>
//             </div>
//             <h1 className="text-white text-2xl font-bold">TikTok Shop</h1>
//             <p className="text-white/40 text-sm mt-1">
//               Admin Management System
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Email */}
//             <div>
//               <label
//                 className="text-white/60 text-xs font-medium
//                 block mb-1.5"
//               >
//                 Email Address
//               </label>
//               <div className="relative">
//                 <span
//                   className="absolute left-4 top-1/2 -translate-y-1/2
//                   text-white/30 text-sm"
//                 >
//                   ✉️
//                 </span>
//                 <input
//                   type="email"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   placeholder="admin@example.com"
//                   className="w-full pl-10 pr-4 py-3.5 rounded-xl
//                     text-white text-sm outline-none transition-all
//                     placeholder:text-white/20"
//                   style={{
//                     background: "rgba(255,255,255,0.07)",
//                     border: "1px solid rgba(255,255,255,0.1)",
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.border = "1px solid rgba(240,45,101,0.6)";
//                     e.target.style.background = "rgba(255,255,255,0.1)";
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.border = "1px solid rgba(255,255,255,0.1)";
//                     e.target.style.background = "rgba(255,255,255,0.07)";
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 className="text-white/60 text-xs font-medium
//                 block mb-1.5"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <span
//                   className="absolute left-4 top-1/2 -translate-y-1/2
//                   text-white/30 text-sm"
//                 >
//                   🔒
//                 </span>
//                 <input
//                   type={showPw ? "text" : "password"}
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm({ ...form, password: e.target.value })
//                   }
//                   placeholder="••••••••"
//                   className="w-full pl-10 pr-12 py-3.5 rounded-xl
//                     text-white text-sm outline-none transition-all
//                     placeholder:text-white/20"
//                   style={{
//                     background: "rgba(255,255,255,0.07)",
//                     border: "1px solid rgba(255,255,255,0.1)",
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.border = "1px solid rgba(240,45,101,0.6)";
//                     e.target.style.background = "rgba(255,255,255,0.1)";
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.border = "1px solid rgba(255,255,255,0.1)";
//                     e.target.style.background = "rgba(255,255,255,0.07)";
//                   }}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPw(!showPw)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2
//                     text-white/30 hover:text-white/60 transition-all"
//                 >
//                   {showPw ? "🙈" : "👁️"}
//                 </button>
//               </div>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loginMutation.isPending}
//               className="w-full py-4 rounded-xl text-white font-bold
//                 text-sm transition-all active:scale-95 mt-2
//                 disabled:opacity-60"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65 0%,#ff6035 100%)",
//                 boxShadow: "0 8px 24px rgba(240,45,101,0.35)",
//               }}
//             >
//               {loginMutation.isPending ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg
//                     className="animate-spin h-4 w-4"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8v8H4z"
//                     />
//                   </svg>
//                   Signing in...
//                 </span>
//               ) : (
//                 "Sign In →"
//               )}
//             </button>
//           </form>

//           {/* Role hint */}
//           <div
//             className="mt-6 p-3 rounded-xl"
//             style={{
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.06)",
//             }}
//           >
//             <p className="text-white/30 text-xs text-center">
//               For: superAdmin · merchantAdmin · dispatchAdmin
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

/////////////////////// ================== second version ==================== ///////////////

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMutation } from "@tanstack/react-query";
// import { toast } from "react-toastify";
// import { useDispatch } from "react-redux";
// import { loginSuccess } from "../../store/authSlice";
// import API from "../../api/axios";

// export default function Login() {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const [form, setForm] = useState({ email: "", password: "" });
//   const [showPw, setShowPw] = useState(false);

//   const loginMutation = useMutation({
//     mutationFn: async () => {
//       const { data } = await API.post("/auth/login", form);
//       return data;
//     },
//     onSuccess: (data) => {
//       const adminRoles = ["superAdmin", "merchantAdmin", "dispatchAdmin"];
//       if (!adminRoles.includes(data.user.role)) {
//         toast.error("Access denied. Admin accounts only.");
//         return;
//       }
//       dispatch(loginSuccess({ user: data.user, token: data.token }));
//       toast.success(`Welcome back, ${data.user.username}!`);
//       navigate("/");
//     },
//     onError: (err) => {
//       toast.error(err.response?.data?.message || "Login failed");
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!form.email || !form.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }
//     loginMutation.mutate();
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center
//       relative overflow-hidden"
//       style={{
//         background:
//           "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
//       }}
//     >
//       {/* Decorative blobs */}
//       <div
//         className="absolute top-0 left-0 w-96 h-96 rounded-full
//         opacity-20 blur-3xl pointer-events-none"
//         style={{ background: "radial-gradient(circle,#6366f1,transparent)" }}
//       />
//       <div
//         className="absolute bottom-0 right-0 w-96 h-96 rounded-full
//         opacity-20 blur-3xl pointer-events-none"
//         style={{ background: "radial-gradient(circle,#f02d65,transparent)" }}
//       />

//       <div className="relative w-full max-w-md mx-4">
//         {/* Card */}
//         <div
//           className="bg-white/5 backdrop-blur-xl rounded-3xl p-8
//           border border-white/10"
//           style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
//         >
//           {/* Logo */}
//           <div className="flex flex-col items-center mb-8">
//             <div
//               className="w-16 h-16 rounded-2xl flex items-center
//               justify-center mb-4"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65,#ff6035)",
//               }}
//             >
//               <span className="text-3xl">🛍️</span>
//             </div>
//             <h1 className="text-white text-2xl font-bold">TikTok Shop</h1>
//             <p className="text-white/40 text-sm mt-1">
//               Admin Management System
//             </p>
//           </div>

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Email */}
//             <div>
//               <label
//                 className="text-white/60 text-xs font-medium
//                 block mb-1.5"
//               >
//                 Email Address
//               </label>
//               <div className="relative">
//                 <span
//                   className="absolute left-4 top-1/2 -translate-y-1/2
//                   text-white/30 text-sm"
//                 >
//                   ✉️
//                 </span>
//                 <input
//                   type="email"
//                   value={form.email}
//                   onChange={(e) => setForm({ ...form, email: e.target.value })}
//                   placeholder="admin@example.com"
//                   className="w-full pl-10 pr-4 py-3.5 rounded-xl
//                     text-white text-sm outline-none transition-all
//                     placeholder:text-white/20"
//                   style={{
//                     background: "rgba(255,255,255,0.07)",
//                     border: "1px solid rgba(255,255,255,0.1)",
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.border = "1px solid rgba(240,45,101,0.6)";
//                     e.target.style.background = "rgba(255,255,255,0.1)";
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.border = "1px solid rgba(255,255,255,0.1)";
//                     e.target.style.background = "rgba(255,255,255,0.07)";
//                   }}
//                 />
//               </div>
//             </div>

//             {/* Password */}
//             <div>
//               <label
//                 className="text-white/60 text-xs font-medium
//                 block mb-1.5"
//               >
//                 Password
//               </label>
//               <div className="relative">
//                 <span
//                   className="absolute left-4 top-1/2 -translate-y-1/2
//                   text-white/30 text-sm"
//                 >
//                   🔒
//                 </span>
//                 <input
//                   type={showPw ? "text" : "password"}
//                   value={form.password}
//                   onChange={(e) =>
//                     setForm({ ...form, password: e.target.value })
//                   }
//                   placeholder="••••••••"
//                   className="w-full pl-10 pr-12 py-3.5 rounded-xl
//                     text-white text-sm outline-none transition-all
//                     placeholder:text-white/20"
//                   style={{
//                     background: "rgba(255,255,255,0.07)",
//                     border: "1px solid rgba(255,255,255,0.1)",
//                   }}
//                   onFocus={(e) => {
//                     e.target.style.border = "1px solid rgba(240,45,101,0.6)";
//                     e.target.style.background = "rgba(255,255,255,0.1)";
//                   }}
//                   onBlur={(e) => {
//                     e.target.style.border = "1px solid rgba(255,255,255,0.1)";
//                     e.target.style.background = "rgba(255,255,255,0.07)";
//                   }}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPw(!showPw)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2
//                     text-white/30 hover:text-white/60 transition-all"
//                 >
//                   {showPw ? "🙈" : "👁️"}
//                 </button>
//               </div>
//             </div>

//             {/* Submit */}
//             <button
//               type="submit"
//               disabled={loginMutation.isPending}
//               className="w-full py-4 rounded-xl text-white font-bold
//                 text-sm transition-all active:scale-95 mt-2
//                 disabled:opacity-60"
//               style={{
//                 background: "linear-gradient(135deg,#f02d65 0%,#ff6035 100%)",
//                 boxShadow: "0 8px 24px rgba(240,45,101,0.35)",
//               }}
//             >
//               {loginMutation.isPending ? (
//                 <span className="flex items-center justify-center gap-2">
//                   <svg
//                     className="animate-spin h-4 w-4"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     />
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8v8H4z"
//                     />
//                   </svg>
//                   Signing in...
//                 </span>
//               ) : (
//                 "Sign In →"
//               )}
//             </button>
//           </form>

//           {/* Role hint */}
//           <div
//             className="mt-6 p-3 rounded-xl"
//             style={{
//               background: "rgba(255,255,255,0.04)",
//               border: "1px solid rgba(255,255,255,0.06)",
//             }}
//           >
//             <p className="text-white/30 text-xs text-center">
//               For: superAdmin · merchantAdmin · dispatchAdmin
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

//////////////////////// ============= third version ================== ////////////////
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
