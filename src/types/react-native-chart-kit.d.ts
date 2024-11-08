declare module 'react-native-chart-kit' {
  import { ViewStyle } from 'react-native';
  
  interface ChartConfig {
    backgroundColor?: string;
    backgroundGradientFrom?: string;
    backgroundGradientTo?: string;
    decimalPlaces?: number;
    color?: (opacity: number) => string;
    labelColor?: (opacity: number) => string;
    style?: ViewStyle;
    propsForDots?: {
      r?: string;
      strokeWidth?: string;
      stroke?: string;
    };
  }

  interface LineChartData {
    labels: string[];
    datasets: Array<{
      data: number[];
      color?: (opacity: number) => string;
      strokeWidth?: number;
    }>;
    legend?: string[];
  }

  interface LineChartProps {
    data: LineChartData;
    width: number;
    height: number;
    chartConfig: ChartConfig;
    bezier?: boolean;
    style?: ViewStyle;
  }

  export class LineChart extends React.Component<LineChartProps> {}
}
