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

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import API from "../../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

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

  return (
    <div
      className="min-h-screen flex items-center justify-center
      relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#0f172a 0%,#1e1b4b 50%,#0f172a 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full
        opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#6366f1,transparent)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full
        opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle,#f02d65,transparent)" }}
      />

      <div className="relative w-full max-w-md mx-4">
        {/* Card */}
        <div
          className="bg-white/5 backdrop-blur-xl rounded-3xl p-8
          border border-white/10"
          style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.5)" }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center
              justify-center mb-4"
              style={{
                background: "linear-gradient(135deg,#f02d65,#ff6035)",
              }}
            >
              <span className="text-3xl">🛍️</span>
            </div>
            <h1 className="text-white text-2xl font-bold">TikTok Shop</h1>
            <p className="text-white/40 text-sm mt-1">
              Admin Management System
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                className="text-white/60 text-xs font-medium
                block mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2
                  text-white/30 text-sm"
                >
                  ✉️
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="admin@example.com"
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl
                    text-white text-sm outline-none transition-all
                    placeholder:text-white/20"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(240,45,101,0.6)";
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.07)";
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                className="text-white/60 text-xs font-medium
                block mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <span
                  className="absolute left-4 top-1/2 -translate-y-1/2
                  text-white/30 text-sm"
                >
                  🔒
                </span>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3.5 rounded-xl
                    text-white text-sm outline-none transition-all
                    placeholder:text-white/20"
                  style={{
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid rgba(240,45,101,0.6)";
                    e.target.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.07)";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-4 top-1/2 -translate-y-1/2
                    text-white/30 hover:text-white/60 transition-all"
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-4 rounded-xl text-white font-bold
                text-sm transition-all active:scale-95 mt-2
                disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg,#f02d65 0%,#ff6035 100%)",
                boxShadow: "0 8px 24px rgba(240,45,101,0.35)",
              }}
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Role hint */}
          <div
            className="mt-6 p-3 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <p className="text-white/30 text-xs text-center">
              For: superAdmin · merchantAdmin · dispatchAdmin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
