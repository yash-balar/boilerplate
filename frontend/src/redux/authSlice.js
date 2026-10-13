import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  permissions: [],
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      const { user = null, permissions = [], isAuthenticated = false } =
        action.payload;
      state.user = user;
      state.permissions = Array.isArray(permissions) ? permissions : [];
      state.isAuthenticated = isAuthenticated;
    },
    updateUser(state, action) {
      state.user = action.payload;
    },
    clearAuth() {
      return initialState;
    },
  },
});

export const { setCredentials, updateUser, clearAuth } = authSlice.actions;

export default authSlice.reducer;
