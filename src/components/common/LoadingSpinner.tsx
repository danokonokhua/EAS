import React from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  style?: StyleProp<ViewStyle>;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'large',
  color = '#000',
  style,
  overlay = true,
}) => {
  if (!overlay) {
    return (
      <ActivityIndicator
        size={size}
        color={color}
        style={[styles.spinner, style]}
      />
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.overlayBackground}>
        <ActivityIndicator
          size={size}
          color={color}
          style={styles.spinner}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  overlayBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    width: 100,
    height: 100,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    alignSelf: 'center',
  },
});

export default LoadingSpinner;
