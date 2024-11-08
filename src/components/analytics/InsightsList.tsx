import React from 'react';
import { Card, Text } from '@ui-kitten/components';
import { Insight } from '../../types/analytics.types';

interface InsightsListProps {
  insights: Insight[];
}

export const InsightsList: React.FC<InsightsListProps> = ({ insights }) => {
  return (
    <Card>
      <Text category="h6">Key Insights</Text>
      {insights.map((insight, index) => (
        <Text key={index}>{insight.message}</Text>
      ))}
    </Card>
  );
};
