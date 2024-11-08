import { configureStore } from '@reduxjs/toolkit';
import emergencyReducer from './slices/emergencySlice';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    emergency: emergencyReducer,
    auth: authReducer,
    location: locationReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
