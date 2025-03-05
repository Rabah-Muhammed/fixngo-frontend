import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  worker: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const workerSlice = createSlice({
  name: "worker",
  initialState,
  reducers: {
    workerLogin: (state, action) => {
      state.worker = action.payload.worker;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    workerLogout: (state) => {
      state.worker = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { workerLogin, workerLogout } = workerSlice.actions;
export default workerSlice.reducer;