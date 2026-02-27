import { createSlice } from "@reduxjs/toolkit";

const stored = {
  user: JSON.parse(localStorage.getItem("adminUser") || "null"),
  token: localStorage.getItem("adminToken") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: stored.user,
    token: stored.token,
    isLoading: false,
  },
  reducers: {
    loginSuccess(state, { payload }) {
      state.user = payload.user;
      state.token = payload.token;
      localStorage.setItem("adminUser", JSON.stringify(payload.user));
      localStorage.setItem("adminToken", payload.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
    },
    setLoading(state, { payload }) {
      state.isLoading = payload;
    },
  },
});

export const { loginSuccess, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;
