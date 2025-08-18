import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface LineChartWithGradientProps {
  data: number[];
  labels?: string[];
  width?: number;
  height?: number;
  color?: string;
  showGrid?: boolean;
  showPoints?: boolean;
  showArea?: boolean;
}

const LineChartWithGradient: React.FC<LineChartWithGradientProps> = ({
  data,
  labels,
  width = Dimensions.get('window').width - 40,
  height = 200,
  color = COLORS.primary,
  showGrid = true,
  showPoints = true,
  showArea = true,
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
  const areaPathData = `${pathData} L ${width},${height} L 0,${height} Z`;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </LinearGradient>
        </Defs>
        
        {/* Grid lines */}
        {showGrid && (
          <>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
              <Path
                key={`grid-${index}`}
                d={`M 0,${height * ratio} L ${width},${height * ratio}`}
                stroke={COLORS.border.light}
                strokeWidth="1"
                strokeDasharray="5,5"
              />
            ))}
          </>
        )}
        
        {/* Area fill with gradient */}
        {showArea && (
          <Path
            d={areaPathData}
            fill={color + '20'}
          />
        )}
        
        {/* Line */}
        <Path
          d={pathData}
          stroke={color}
          strokeWidth="3"
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

export default LineChartWithGradient;
