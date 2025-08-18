import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface BarChartProps {
  data: { label: string; value: number }[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
  showValues?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  width = Dimensions.get('window').width - 40,
  height = 200,
  color = COLORS.primary,
  showLabels = true,
  showValues = true,
}) => {
  if (!data || data.length === 0) {
    return <View style={[styles.container, { width, height }]} />;
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = (width - 40) / data.length;
  const chartHeight = height - 60; // Space for labels and values

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.4" />
          </LinearGradient>
        </Defs>
        
        {data.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartHeight;
          const x = 20 + (index * barWidth) + (barWidth * 0.1);
          const y = height - 40 - barHeight;
          const barWidthFinal = barWidth * 0.8;

          return (
            <View key={index}>
              {/* Bar */}
                             <Rect
                 x={x}
                 y={y}
                 width={barWidthFinal}
                 height={barHeight}
                 fill={color + '80'}
                 rx={4}
               />
              
              {/* Value label */}
              {showValues && (
                <SvgText
                  x={x + barWidthFinal / 2}
                  y={y - 10}
                  fontSize="12"
                  fill={COLORS.text.primary}
                  textAnchor="middle"
                  fontFamily="System"
                >
                  {item.value}
                </SvgText>
              )}
              
              {/* X-axis label */}
              {showLabels && (
                <SvgText
                  x={x + barWidthFinal / 2}
                  y={height - 10}
                  fontSize="10"
                  fill={COLORS.text.secondary}
                  textAnchor="middle"
                  fontFamily="System"
                >
                  {item.label}
                </SvgText>
              )}
            </View>
          );
        })}
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

export default BarChart;
