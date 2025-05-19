import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  role: null, // 'admin' or 'user'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token, role } = action.payload;
      state.user = user;
      state.token = token;
      state.role = role?.toLowerCase() || null; // Normalize role for consistency
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
    },
  },
});

// Selectors
export const selectIsAuthenticated = (state) => Boolean(state.auth.token);
export const selectUser = (state) => state.auth.user;
export const selectUserRole = (state) => state.auth.role;

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;
