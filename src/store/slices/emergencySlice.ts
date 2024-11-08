import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { emergencyService } from '../../services/emergency/emergencyService';
import { RootState } from '../store';

export interface EmergencyState {
  activeEmergencies: Emergency[];
  currentEmergency: Emergency | null;
  loading: boolean;
  error: string | null;
}

const initialState: EmergencyState = {
  activeEmergencies: [],
  currentEmergency: null,
  loading: false,
  error: null,
};

export const createEmergency = createAsyncThunk(
  'emergency/create',
  async (emergency: EmergencyRequest) => {
    const response = await emergencyService.createEmergency(emergency);
    return response;
  }
);

export const updateEmergencyStatus = createAsyncThunk(
  'emergency/updateStatus',
  async ({ emergencyId, status }: { emergencyId: string; status: EmergencyStatus }) => {
    const response = await emergencyService.updateEmergencyStatus(emergencyId, status);
    return response;
  }
);

const emergencySlice = createSlice({
  name: 'emergency',
  initialState,
  reducers: {
    clearCurrentEmergency: (state) => {
      state.currentEmergency = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createEmergency.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createEmergency.fulfilled, (state, action) => {
        state.loading = false;
        state.currentEmergency = action.payload;
        state.activeEmergencies.push(action.payload);
      })
      .addCase(createEmergency.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create emergency';
      });
  },
});

export const { clearCurrentEmergency } = emergencySlice.actions;
export const selectCurrentEmergency = (state: RootState) => state.emergency.currentEmergency;
export default emergencySlice.reducer;
