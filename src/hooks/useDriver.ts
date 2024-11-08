import { useState, useEffect } from 'react';
import { Driver, DriverStatus } from '../types/driver.types';
import { driverService } from '../services/driver/driverService';

export const useDriver = (driverId: string) => {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDriver = async () => {
      try {
        await driverService.initializeDriver(driverId);
        setLoading(false);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    const unsubscribe = driverService.onDriverUpdate((updatedDriver) => {
      setDriver(updatedDriver);
    });

    initDriver();

    return () => {
      unsubscribe();
      driverService.stopLocationUpdates();
    };
  }, [driverId]);

  const updateStatus = async (status: DriverStatus) => {
    try {
      await driverService.updateDriverStatus(status);
    } catch (err) {
      setError(err as Error);
    }
  };

  const acceptEmergency = async (emergencyId: string) => {
    try {
      await driverService.acceptEmergencyRequest(emergencyId);
    } catch (err) {
      setError(err as Error);
    }
  };

  return {
    driver,
    loading,
    error,
    updateStatus,
    acceptEmergency
  };
};
