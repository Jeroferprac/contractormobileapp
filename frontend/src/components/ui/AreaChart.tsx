import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Text,
  ViewStyle,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Rect, G, Line, Circle, Mask } from 'react-native-svg';

export type Point = {
  value: number;
  label?: string;
};

type Props = {
  data: Point[];
  height?: number;

  style?: ViewStyle;
  strokeColor?: string;
  gradientFrom?: string;
  gradientTo?: string;
  pointSpacing?: number; // px between points horizontally (used when scrollable)
  showGrid?: boolean;

  labelCount?: number; // how many labels to show evenly on the x axis
  minPointsToSample?: number; // sampling threshold for very large datasets
  maxPointsNoScroll?: number; // when data.length <= this, render compact without horizontal scroll
  onPointPress?: (index: number, point: Point) => void;
  showFooter?: boolean; // whether to show the internal footer
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function sampleData(data: Point[], target = 400) {
  if (data.length <= target) return data;
  const step = Math.ceil(data.length / target);
  return data.filter((_, i) => i % step === 0);
}

function buildSmoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return { area: '', line: '' };
  const first = points[0];
  let lineD = `M ${first.x} ${first.y}`;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const cpx = (prev.x + cur.x) / 2;
    const cpy = (prev.y + cur.y) / 2;
    lineD += ` Q ${prev.x} ${prev.y} ${cpx} ${cpy}`;
  }
  const last = points[points.length - 1];
  lineD += ` T ${last.x} ${last.y}`;

  return { area: lineD, line: lineD };
}

function approximateLength(points: { x: number; y: number }[]) {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    len += Math.sqrt(dx * dx + dy * dy);
  }
  return len;
}

export default function AreaLineChart({
  data,

  height = 220,
  style,
  strokeColor = '#ff7a18',
  gradientFrom = '#ffb07a',
  gradientTo = '#fff2ea',
  pointSpacing = 36,
  showGrid = true,

  labelCount = 5,
  minPointsToSample = 800,
  maxPointsNoScroll = 27,
  onPointPress,
  showFooter = true,
}: Props) {
  const animated = useRef(new Animated.Value(0)).current;
  const drawAnim = useRef(new Animated.Value(0)).current;
  const areaAnim = useRef(new Animated.Value(0)).current;
  const AnimatedPath = (Animated as any).createAnimatedComponent(Path);
  const AnimatedRect = (Animated as any).createAnimatedComponent(Rect);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState<number>(SCREEN_WIDTH);
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; index: number }>(null);

  const processed = useMemo(() => {
    if (!data || data.length === 0) return [] as Point[];
    // Don't sample data - show all data points
    return data;
  }, [data]);

  // layout constants
  const leftLabelWidth = 30; // fixed column for Y labels (does not scroll)
  const innerPadding = 15; // minimal padding inside svg

  const isScrollable = processed.length > maxPointsNoScroll;

  // inner width available for svg chart area (excluding left labels)
  const innerAvailableWidth = Math.max(0, containerWidth - leftLabelWidth);

  // decide spacing: if not scrollable, compute spacing to fit all points nicely in innerAvailableWidth
  const usedPointSpacing = useMemo(() => {
    if (!processed.length) return pointSpacing;
    if (!isScrollable) {
      // fit evenly across available width (spread points)
      const steps = Math.max(1, processed.length - 1);
      const spacing = (innerAvailableWidth - innerPadding * 2) / steps;
      return Math.max(18, spacing); // ensure a minimum spacing so points don't overlap
    }
    return pointSpacing;
  }, [processed.length, isScrollable, innerAvailableWidth, pointSpacing]);

  const contentWidth = Math.max(innerAvailableWidth, innerPadding * 2 + Math.max(1, processed.length - 1) * usedPointSpacing);
  const svgW = contentWidth;
  const svgH = height;

  const values = processed.map((d) => d.value);
  const minY = Math.min(...values, 0);
  const maxY = Math.max(...values, 1);
  const yRange = maxY - minY || 1;

  const toY = (v: number) => {
    const pct = (v - minY) / yRange;
    const innerH = svgH - innerPadding * 2;
    // center the area a bit by leaving equal top/bottom padding -> already handled by innerPadding
    return innerPadding + (1 - pct) * innerH;
  };

  const points = processed.map((d, i) => ({ x: 2 + i * usedPointSpacing, y: toY(d.value), label: d.label, raw: d.value }));

  const { area: areaRawPath, line: lineRawPath } = useMemo(() => buildSmoothPath(points), [points]);
  const baselineY = svgH - innerPadding;
  const areaPath = points.length > 0 
    ? `${areaRawPath} L ${points[points.length - 1].x} ${baselineY} L ${points[0]?.x ?? 2} ${baselineY} Z`
    : '';
  const linePath = lineRawPath;

  const approxLen = useMemo(() => approximateLength(points), [points]);

  useEffect(() => {
    // run animations in parallel: container fade-in, stroke draw, and area reveal
    Animated.parallel([
      Animated.timing(animated, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(drawAnim, { toValue: 1, duration: 1100, useNativeDriver: false }),
      Animated.timing(areaAnim, { toValue: 1, duration: 900, delay: 180, useNativeDriver: false }),
    ]).start();
  }, [animated, drawAnim, areaAnim, data]);

  const handleTouchStart = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (!points.length) return;

    // Find nearest point
    let nearest = 0;
    let best = Math.abs(points[0].x - locationX);
    for (let i = 1; i < points.length; i++) {
      const d = Math.abs(points[i].x - locationX);
      if (d < best) {
        best = d;
        nearest = i;
      }
    }

    const p = points[nearest];
    setTooltip({ x: p.x, y: p.y, index: nearest });
  };

  const handleTouchEnd = () => {
    // Hide tooltip after a delay like bar chart
    setTimeout(() => setTooltip(null), 1500);
  };

  // Calculate smart tooltip positioning
  const getTooltipPosition = (tooltip: { x: number; y: number; index: number }) => {
    const tooltipHeight = 60; // Approximate tooltip height
    const tooltipWidth = 120; // Approximate tooltip width
    const margin = 10;
    
    // Calculate horizontal position (center on point)
    let left = tooltip.x - (tooltipWidth / 2);
    left = Math.max(margin, Math.min(left, containerWidth - tooltipWidth - margin));
    
    // Calculate vertical position (smart positioning)
    let top;
    const isNearTop = tooltip.y < tooltipHeight + margin;
    const isNearBottom = tooltip.y > height - tooltipHeight - margin;
    
    if (isNearTop) {
      // Point is near top, show tooltip below
      top = tooltip.y + 20;
    } else if (isNearBottom) {
      // Point is near bottom, show tooltip above
      top = tooltip.y - tooltipHeight - 20;
    } else {
      // Point is in middle, show tooltip above
      top = tooltip.y - tooltipHeight - 20;
    }
    
    return { left, top, isAbove: !isNearTop };
  };

  const strokeDashoffset = drawAnim.interpolate({ inputRange: [0, 1], outputRange: [approxLen, 0] });

  const yLabels = useMemo(() => {
    // create 5 labels (including 0 and max)
    const steps = 4;
    const out: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const v = Math.round(minY + ((steps - i) / steps) * yRange);
      out.push(v);
    }
    return out;
  }, [minY, yRange]);

  const xLabels = useMemo(() => {
    if (!processed.length) return [] as string[];
    
    // Show all labels for all datasets
    return processed.map((item, idx) => ({ idx, label: item.label || '' }));
  }, [processed]);

  // Debug logging
  console.log('AreaChart Debug:', {
    dataLength: data.length,
    processedLength: processed.length,
    containerWidth,
    innerAvailableWidth,
    isScrollable,
    maxPointsNoScroll,
    pointSpacing,
    usedPointSpacing,
    contentWidth,
    svgW,
    shouldShowScrollView: isScrollable,
    firstFewLabels: xLabels?.slice(0, 5)?.map(l => l.label) || []
  });

  // Early return if no data
  if (!processed.length) {
    return (
      <View style={[styles.container, style]}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#999', fontSize: 14 }}>No data available</Text>
        </View>
      </View>
    );
  }

  return (

    <Animated.View
      style={[styles.container, style, { opacity: animated }]}
      onLayout={(e: any) => {
        // measure available width for the whole container
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <View style={styles.chartCard}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Left fixed Y axis labels */}
          <View style={{ width: leftLabelWidth, paddingLeft: 0, paddingRight: 0, justifyContent: 'space-between', height: height - 20 }}>
            {yLabels.map((v, i) => (
              <Text key={i} style={styles.yLabel}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()}</Text>
            ))}
          </View>

          {/* Scrollable Chart or static chart depending on data length */}
          {isScrollable ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ width: svgW }}
            >
              <TouchableOpacity 
                style={{ width: svgW }} 
                onPress={handleTouchStart}
                onPressOut={handleTouchEnd}
                activeOpacity={1}
              >
                <Svg width={svgW} height={svgH}>
        <Defs>

                    <LinearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor={gradientFrom} stopOpacity="0.38" />
                      <Stop offset="1" stopColor={gradientTo} stopOpacity="0.02" />
          </LinearGradient>


                    <Mask id="areaMask">
                      <AnimatedRect
                        x={0}
                        y={areaAnim.interpolate({ inputRange: [0, 1], outputRange: [svgH, 0] }) as any}
                        width={svgW}
                        height={areaAnim.interpolate({ inputRange: [0, 1], outputRange: [0, svgH] }) as any}
                        fill="#fff"
                      />
                    </Mask>
        </Defs>
        

                  <Rect x={0} y={0} width={svgW} height={svgH} rx={10} fill="transparent" />

        {showGrid && (

                    <G>
                      {yLabels.map((_, i) => {
                        const y = innerPadding + (i / (yLabels.length - 1)) * (svgH - innerPadding * 2);
                        return (
                          <Line
                            key={`g${i}`}
                            x1={2}
                            x2={svgW - 2}
                            y1={y}
                            y2={y}
                            stroke="#ECECEC"
                            strokeWidth={1}
                            strokeDasharray={[4, 6]}
                          />
                        );
                      })}
                    </G>
                  )}

                  <G mask="url(#areaMask)">
                    <Path d={areaPath} fill="url(#gradArea)" />
                  </G>

                  <AnimatedPath
                    d={linePath}
                    stroke={strokeColor}
                    strokeWidth={3}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={approxLen}
                    strokeDashoffset={strokeDashoffset as any}
                  />

                  {points.map((p, i) => (
                    <Circle 
                      key={i} 
                      cx={p.x} 
                      cy={p.y} 
                      r={2.5} 
                      fill={'#fff'} 
                      stroke={strokeColor} 
                      strokeWidth={1} 
              />
            ))}

                </Svg>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginTop: 10 }}>
                  {xLabels.map((l, idx) => (
                    <Text key={idx} style={styles.xLabel}>{l.label}</Text>
                  ))}
                </View>

                {tooltip && (() => {
                  const position = getTooltipPosition(tooltip);
                  return (
                    <View style={[styles.tooltipContainer, { left: position.left, top: position.top }]}>
                      <View style={styles.tooltipBubble}>
                        <Text style={styles.tooltipDate}>{processed[tooltip.index]?.label}</Text>
                        <Text style={styles.tooltipValue}>{processed[tooltip.index]?.value?.toString()}</Text>
                      </View>
                      <View style={[styles.tooltipArrow, position.isAbove ? styles.tooltipArrowDown : styles.tooltipArrowUp]} />
                    </View>
                  );
                })()}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <TouchableOpacity 
              style={{ width: svgW }} 
              onPress={handleTouchStart}
              onPressOut={handleTouchEnd}
              activeOpacity={1}
            >
              <Svg width={svgW} height={svgH}>
                <Defs>
                  <LinearGradient id="gradArea" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={gradientFrom} stopOpacity="0.38" />
                    <Stop offset="1" stopColor={gradientTo} stopOpacity="0.02" />
                  </LinearGradient>

                  <Mask id="areaMask">
                    <AnimatedRect
                      x={0}
                      y={areaAnim.interpolate({ inputRange: [0, 1], outputRange: [svgH, 0] }) as any}
                      width={svgW}
                      height={areaAnim.interpolate({ inputRange: [0, 1], outputRange: [0, svgH] }) as any}
                      fill="#fff"
                    />
                  </Mask>
                </Defs>

                <Rect x={0} y={0} width={svgW} height={svgH} rx={10} fill="transparent" />

                {showGrid && (
                  <G>
                    {yLabels.map((_, i) => {
                      const y = innerPadding + (i / (yLabels.length - 1)) * (svgH - innerPadding * 2);
                      return (
                        <Line
                          key={`g${i}`}
                          x1={2}
                          x2={svgW - 2}
                          y1={y}
                          y2={y}
                          stroke="#ECECEC"
                          strokeWidth={1}
                          strokeDasharray={[4, 6]}
                        />
                      );
                    })}
                  </G>
                )}

                <G mask="url(#areaMask)">
                  <Path d={areaPath} fill="url(#gradArea)" />
                </G>

                <AnimatedPath
                  d={linePath}
                  stroke={strokeColor}
                  strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"

                  strokeDasharray={approxLen}
                  strokeDashoffset={strokeDashoffset as any}
        />

                {points.map((p, i) => (
                  <Circle 
                    key={i} 
                    cx={p.x} 
                    cy={p.y} 
                    r={2.5} 
                    fill={'#fff'} 
                    stroke={strokeColor} 
                    strokeWidth={1} 
                  />
                ))}
      </Svg>


              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 2, marginTop: 10 }}>
                {xLabels.map((l, idx) => (
                  <Text key={idx} style={styles.xLabel}>{l.label}</Text>
                ))}
              </View>

              {tooltip && (() => {
                const position = getTooltipPosition(tooltip);
                return (
                  <View style={[styles.tooltipContainer, { left: position.left, top: position.top }]}>
                    <View style={styles.tooltipBubble}>
                      <Text style={styles.tooltipDate}>{processed[tooltip.index]?.label}</Text>
                      <Text style={styles.tooltipValue}>{processed[tooltip.index]?.value?.toString()}</Text>
                    </View>
                    <View style={[styles.tooltipArrow, position.isAbove ? styles.tooltipArrowDown : styles.tooltipArrowUp]} />
    </View>
  );
              })()}
            </TouchableOpacity>
          )}
        </View>
    </View>

  
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {

    width: '100%',
  },
  chartCard: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    padding: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  // Chart-specific styles
  xLabel: { fontSize: 12, color: '#9a9a9a' },
  yLabel: { fontSize: 10, color: '#b2b2b2', textAlign: 'right', paddingRight: 2 },
  tooltipContainer: {
    position: 'absolute',
    alignItems: 'center',

  },
  tooltipBubble: {
    backgroundColor: '#222',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 110,
  },
  tooltipDate: { color: '#fff', fontSize: 12, fontWeight: '600' },
  tooltipValue: { color: '#ffd271', fontSize: 13, fontWeight: '700', marginTop: 2 },
  tooltipArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#222',
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  tooltipArrowUp: {
    transform: [{ rotate: '180deg' }],
    marginTop: -2,
  },
  tooltipArrowDown: {
    transform: [{ rotate: '0deg' }],
    marginTop: 2,
  },
});
