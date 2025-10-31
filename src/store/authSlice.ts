import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  userInfo: any | null;
  accessToken: string | null;
}

const initialState: UserState = {
  userInfo: null,
  accessToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<{ userInfo: any; accessToken: string }>) {
      state.userInfo = action.payload.userInfo;
      state.accessToken = action.payload.accessToken;
    },
    clearUser(state) {
      state.userInfo = null;
      state.accessToken = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;
