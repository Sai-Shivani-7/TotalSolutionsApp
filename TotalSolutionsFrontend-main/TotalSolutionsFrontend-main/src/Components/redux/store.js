import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice.js'
import adminReducer from './AdminSlice.js'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer
  },
});