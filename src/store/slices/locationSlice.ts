import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  currentLocation: Location | null;
  locationHistory: Location[];
  isTracking: boolean;
  error: string | null;
}

interface Location {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
  speed: number | null;
  heading: number | null;
}

const initialState: LocationState = {
  currentLocation: null,
  locationHistory: [],
  isTracking: false,
  error: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    updateLocation: (state, action: PayloadAction<Location>) => {
      state.currentLocation = action.payload;
      state.locationHistory.push(action.payload);
      state.error = null;
    },
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearLocationHistory: (state) => {
      state.locationHistory = [];
    },
  },
});

export const { 
  updateLocation, 
  setTracking, 
  setError, 
  clearLocationHistory 
} = locationSlice.actions;
export default locationSlice.reducer;
