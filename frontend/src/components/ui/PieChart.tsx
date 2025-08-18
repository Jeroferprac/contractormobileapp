import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { COLORS } from '../../constants/colors';

interface PieChartProps {
  data: { label: string; value: number; color?: string }[];
  width?: number;
  height?: number;
  showLabels?: boolean;
  showValues?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  width = 200,
  height = 200,
  showLabels = true,
  showValues = true,
}) => {
  if (!data || data.length === 0) {
    return <View style={[styles.container, { width, height }]} />;
  }

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = Math.min(width, height) / 2 - 20;
  const centerX = width / 2;
  const centerY = height / 2;

  let currentAngle = 0;
  const paths = data.map((item, index) => {
    const percentage = item.value / total;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    currentAngle = endAngle;

    return {
      pathData,
      color: item.color || COLORS.primary,
      label: item.label,
      value: item.value,
      percentage,
      centerAngle: startAngle + angle / 2,
    };
  });

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        <Defs>
          {paths.map((path, index) => (
            <LinearGradient key={index} id={`pieGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={path.color} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={path.color} stopOpacity="0.4" />
            </LinearGradient>
          ))}
        </Defs>
        
                 {paths.map((path, index) => (
           <Path
             key={index}
             d={path.pathData}
             fill={path.color + '80'}
             stroke={COLORS.background}
             strokeWidth="2"
           />
         ))}
        
        {/* Labels */}
        {showLabels && paths.map((path, index) => {
          const labelRadius = radius * 0.7;
          const labelX = centerX + labelRadius * Math.cos(path.centerAngle);
          const labelY = centerY + labelRadius * Math.sin(path.centerAngle);

          return (
            <SvgText
              key={`label-${index}`}
              x={labelX}
              y={labelY}
              fontSize="10"
              fill={COLORS.text.primary}
              textAnchor="middle"
              fontFamily="System"
              fontWeight="600"
            >
              {path.label}
            </SvgText>
          );
        })}
        
        {/* Values */}
        {showValues && paths.map((path, index) => {
          const valueRadius = radius * 0.5;
          const valueX = centerX + valueRadius * Math.cos(path.centerAngle);
          const valueY = centerY + valueRadius * Math.sin(path.centerAngle);

          return (
            <SvgText
              key={`value-${index}`}
              x={valueX}
              y={valueY}
              fontSize="12"
              fill={COLORS.text.light}
              textAnchor="middle"
              fontFamily="System"
              fontWeight="700"
            >
              {path.value}
            </SvgText>
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

export default PieChart;
