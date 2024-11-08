import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MetricProps {
  metric: {
    id: string;
    title: string;
    value: string | number;
    trend?: {
      value: number;
      isUpward: boolean;
    };
  };
}

export const MetricCard: React.FC<MetricProps> = ({ metric }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{metric.title}</Text>
      <Text style={styles.value}>{metric.value}</Text>
      {metric.trend && (
        <View style={styles.trendContainer}>
          <Text style={[
            styles.trendValue,
            { color: metric.trend.isUpward ? '#22c55e' : '#ef4444' }
          ]}>
            {metric.trend.isUpward ? '↑' : '↓'} {Math.abs(metric.trend.value)}%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
  },
  trendContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
