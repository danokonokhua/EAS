import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { locationService } from '../services/location/LocationService';
import { setTracking, setError } from '../store/slices/locationSlice';
import { RootState } from '../store';

export const useLocation = () => {
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentLocation, locationHistory, isTracking, error } = useSelector(
    (state: RootState) => state.location
  );

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const hasPermission = await locationService.requestPermissions();
        if (hasPermission) {
          setIsInitialized(true);
        } else {
          dispatch(setError('Location permissions not granted'));
        }
      } catch (err) {
        dispatch(setError('Failed to initialize location service'));
      }
    };

    if (!isInitialized) {
      initializeLocation();
    }
  }, [dispatch, isInitialized]);

  const startTracking = async () => {
    try {
      await locationService.startTracking();
      dispatch(setTracking(true));
    } catch (err) {
      dispatch(setError('Failed to start location tracking'));
    }
  };

  const stopTracking = () => {
    locationService.stopTracking();
    dispatch(setTracking(false));
  };

  const getCurrentLocation = async () => {
    try {
      return await locationService.getCurrentLocation();
    } catch (err) {
      dispatch(setError('Failed to get current location'));
      throw err;
    }
  };

  return {
    currentLocation,
    locationHistory,
    isTracking,
    error,
    isInitialized,
    startTracking,
    stopTracking,
    getCurrentLocation,
  };
};
