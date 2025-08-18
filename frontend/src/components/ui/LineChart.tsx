import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  showGradient?: boolean;
  showPoints?: boolean;
  strokeWidth?: number;
  animated?: boolean;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  width = Dimensions.get('window').width - 40,
  height = 200,
  color = COLORS.primary,
  showGradient = true,
  showPoints = true,
  strokeWidth = 3,
  animated = true,
}) => {
  if (!data || data.length < 2) {
    return <View style={[styles.container, { width, height }]} />;
  }

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return { x, y, value };
  });

  const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        
        {/* Gradient fill area */}
        {showGradient && (
          <Path
            d={`${pathData} L ${width},${height} L 0,${height} Z`}
            fill={color + '20'}
          />
        )}
        
        {/* Line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Data points */}
        {showPoints && points.map((point, index) => (
          <Circle
            key={index}
            cx={point.x}
            cy={point.y}
            r="4"
            fill={color}
            stroke={COLORS.background}
            strokeWidth="2"
          />
        ))}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default LineChart;
