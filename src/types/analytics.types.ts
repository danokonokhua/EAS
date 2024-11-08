export interface AnalyticsMetric {
  id: string;
  timestamp: number;
  type: 'RESPONSE_TIME' | 'PATIENT_OUTCOME' | 'RESOURCE_UTILIZATION' | 'COST_EFFICIENCY';
  value: number;
  metadata: Record<string, any>;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  metrics: AnalyticsMetric[];
  filters: {
    startDate: number;
    endDate: number;
    types: AnalyticsMetric['type'][];
    customFilters?: Record<string, any>;
  };
  visualizations: Array<{
    type: 'LINE' | 'BAR' | 'PIE' | 'MAP';
    config: Record<string, any>;
  }>;
}

export interface AnalyticsReport {
  id: string;
  dashboardId: string;
  generatedAt: number;
  data: AnalyticsMetric[];
  insights: Array<{
    type: string;
    description: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    recommendations?: string[];
  }>;
}

export interface Insight {
  id: string;
  message: string;
  // Add other insight properties as needed
}
