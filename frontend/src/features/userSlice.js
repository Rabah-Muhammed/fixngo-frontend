// src/store/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false, // Added isAuthenticated state
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    loginn: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true; // User is authenticated
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false; // User is logged out
    },
  },
});

export const { loginn, logout } = userSlice.actions;
export default userSlice.reducer;
