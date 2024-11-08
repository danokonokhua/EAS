import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useLocation } from '../../hooks/useLocation';
import { CustomButton, LoadingSpinner } from '../common';
import { colors } from '../../config/theme';
import { emergencyService } from '../../services/emergency/emergencyService';
import * as Location from 'expo-location';
import { Socket } from 'socket.io-client';
import { socketService } from '../../services/socket/socketService';

class TrackingService {
  // Real-time location tracking
  private socket: Socket | null = null;
  private locationSubscription: any = null;

  async startTracking(userId: string, role: 'DRIVER' | 'PATIENT') {
    try {
      // Initialize location tracking
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      this.locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10
        },
        (location) => {
          this.updateLocation(userId, location, role);
        }
      );
    } catch (error) {
      throw new Error('Failed to start tracking');
    }
  }

  private updateLocation(userId: string, location: Location.LocationObject, role: string) {
    socketService.emitLocation({
      userId,
      role,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      timestamp: new Date().toISOString()
    });
  }
}
