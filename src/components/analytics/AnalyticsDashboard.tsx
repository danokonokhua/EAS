import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Text, Button, Spinner } from '@ui-kitten/components';
import { AnalyticsDashboard as DashboardType, AnalyticsReport } from '../../types/analytics.types';
import { AnalyticsService } from '../../services/analytics/analyticsService';
import { LineChart } from 'react-native-chart-kit';
// TODO: Import correct chart components once available
// import { BarChart, PieChart } from 'react-native-chart-kit';
// TODO: Create MetricCard and InsightsList components
import { MetricCard } from './MetricCard';
// import { InsightsList } from './InsightsList';

interface AnalyticsDashboardProps {
  dashboardId: string;
  onError: (error: Error) => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  dashboardId,
  onError,
}) => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardType | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);

  useEffect(() => {
    loadDashboard();
  }, [dashboardId]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashboardData = await AnalyticsService.getDashboard(dashboardId);
      setDashboard(dashboardData);
      
      const reportData = await AnalyticsService.generateReport(dashboardId);
      setReport(reportData);
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Spinner size="large" />
      </View>
    );
  }

  if (!dashboard || !report) {
    return (
      <View style={styles.errorContainer}>
        <Text category="h6">Dashboard not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text category="h5" style={styles.title}>{dashboard.name}</Text>
      
      <View style={styles.metricsContainer}>
        {dashboard.metrics.map(metric => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </View>

      <View style={styles.visualizationsContainer}>
        {dashboard.visualizations.map((viz, index) => (
          <Card key={index} style={styles.vizCard}>
            {renderVisualization(viz, report.data)}
          </Card>
        ))}
      </View>

      {report.insights && report.insights.length > 0 && (
        <View style={styles.insightsContainer}>
          {report.insights.map((insight, index) => (
            <Card key={index} style={styles.insightCard}>
              <Text>{insight.description}</Text>
            </Card>
          ))}
        </View>
      )}

      <Button
        onPress={loadDashboard}
        style={styles.refreshButton}
      >
        Refresh Dashboard
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: 16,
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  visualizationsContainer: {
    marginBottom: 16,
  },
  vizCard: {
    marginBottom: 16,
  },
  refreshButton: {
    marginTop: 16,
  },
  insightCard: {
    marginBottom: 8,
    padding: 12,
  },
  insightsContainer: {
    marginBottom: 16,
  },
});
