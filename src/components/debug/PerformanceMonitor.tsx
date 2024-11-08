import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

interface PerformanceData {
  timestamp: number;
  fps: number;
  memory: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const screenWidth = Dimensions.get('window').width;

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ffa726',
    },
  };

  const data = {
    labels: performanceData.slice(-6).map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        data: performanceData.slice(-6).map(d => d.fps),
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
    legend: ['FPS'],
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate performance data collection
      const newData: PerformanceData = {
        timestamp: Date.now(),
        fps: Math.floor(Math.random() * 60) + 30, // Simulate FPS between 30-90
        memory: Math.floor(Math.random() * 1000), // Simulate memory usage
      };

      setPerformanceData(prev => [...prev.slice(-5), newData]);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Monitor</Text>
      <LineChart
        data={data}
        width={screenWidth - 32}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={styles.chart}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
