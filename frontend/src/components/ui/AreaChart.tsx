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
}: Props) {
  const animated = useRef(new Animated.Value(0)).current;
  const drawAnim = useRef(new Animated.Value(0)).current;
  const areaAnim = useRef(new Animated.Value(0)).current;
  const AnimatedPath = (Animated as any).createAnimatedComponent(Path);
  const AnimatedRect = (Animated as any).createAnimatedComponent(Rect);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState<number>(SCREEN_WIDTH - 32);
  const [tooltip, setTooltip] = useState<null | { x: number; y: number; index: number }>(null);

  const processed = useMemo(() => {
    if (!data || data.length === 0) return [] as Point[];
    if (data.length > minPointsToSample) return sampleData(data, minPointsToSample);
    return data;
  }, [data, minPointsToSample]);

  // layout constants
  const leftLabelWidth = 56; // fixed column for Y labels (does not scroll)
  const innerPadding = 12; // padding inside svg

  const isScrollable = processed.length > maxPointsNoScroll;

  // inner width available for svg chart area (excluding left labels)
  const innerAvailableWidth = Math.max(0, containerWidth - leftLabelWidth - 16);

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

  const points = processed.map((d, i) => ({ x: innerPadding + i * usedPointSpacing, y: toY(d.value), label: d.label, raw: d.value }));

  const { area: areaRawPath, line: lineRawPath } = useMemo(() => buildSmoothPath(points), [points]);
  const baselineY = svgH - innerPadding;
  const areaPath = points.length > 0 
    ? `${areaRawPath} L ${points[points.length - 1].x} ${baselineY} L ${points[0]?.x ?? innerPadding} ${baselineY} Z`
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

  const handleTouchStart = () => {
    // Simple touch handling - show tooltip for first point
    if (points.length > 0) {
      const firstPoint = points[0];
      setTooltip({ x: firstPoint.x, y: firstPoint.y, index: 0 });
    }
  };

  const handleTouchEnd = () => {
    setTimeout(() => setTooltip(null), 1200);
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
    const step = Math.max(1, Math.floor(processed.length / (labelCount - 1 || 1)));
    const out: { idx: number; label: string }[] = [];
    for (let i = 0; i < processed.length; i += step) out.push({ idx: i, label: processed[i].label || '' });
    if (out[out.length - 1].idx !== processed.length - 1) out.push({ idx: processed.length - 1, label: processed[processed.length - 1].label || '' });
    return out;
  }, [processed, labelCount]);

  // Early return if no data
  if (!processed.length) {
    return (
      <View style={[styles.card, style]}>
        <View style={{ padding: 20, alignItems: 'center' }}>
          <Text style={{ color: '#999', fontSize: 14 }}>No data available</Text>
        </View>
      </View>
    );
  }

  return (
    <Animated.View
      style={[styles.card, style, { opacity: animated }]}
      onLayout={(e: any) => {
        // measure available width for the whole card
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <View style={styles.chartContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Left fixed Y axis labels */}
          <View style={{ width: leftLabelWidth, paddingLeft: 6 }}>
            {yLabels.map((v, i) => (
              <Text key={i} style={[styles.yLabel, { marginTop: i === 0 ? 6 : 0 }]}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}</Text>
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
                  
                  <Rect x={0} y={0} width={svgW} height={svgH} rx={10} fill="#fff" />

                  {showGrid && (
                    <G>
                      {yLabels.map((_, i) => {
                        const y = innerPadding + (i / (yLabels.length - 1)) * (svgH - innerPadding * 2);
                        return (
                          <Line
                            key={`g${i}`}
                            x1={innerPadding}
                            x2={svgW - innerPadding}
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

                  {points.map((p, i) => (i % Math.ceil(points.length / 40) === 0 ? <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={'#fff'} stroke={strokeColor} strokeWidth={1} /> : null))}
                </Svg>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: innerPadding, marginTop: 10 }}>
                  {xLabels.map((l, idx) => (
                    <Text key={idx} style={styles.xLabel}>{l.label}</Text>
                  ))}
                </View>

                {tooltip && (
                  <View style={[styles.tooltipContainer, { left: Math.max(6, tooltip.x - 56), top: tooltip.y - 60 }]}>
                    <View style={styles.tooltipBubble}>
                      <Text style={styles.tooltipDate}>{processed[tooltip.index]?.label}</Text>
                      <Text style={styles.tooltipValue}>{processed[tooltip.index]?.value}</Text>
                    </View>
                    <View style={styles.tooltipArrow} />
                  </View>
                )}
              </TouchableOpacity>
            </ScrollView>
          ) : (
            <TouchableOpacity 
              style={{ width: svgW }} 
              onPress={handleTouchStart}
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

                <Rect x={0} y={0} width={svgW} height={svgH} rx={10} fill="#fff" />

                {showGrid && (
                  <G>
                    {yLabels.map((_, i) => {
                      const y = innerPadding + (i / (yLabels.length - 1)) * (svgH - innerPadding * 2);
                      return (
                        <Line
                          key={`g${i}`}
                          x1={innerPadding}
                          x2={svgW - innerPadding}
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

                {points.map((p, i) => (i % Math.ceil(points.length / 40) === 0 ? <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={'#fff'} stroke={strokeColor} strokeWidth={1} /> : null))}
              </Svg>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: innerPadding, marginTop: 10 }}>
                {xLabels.map((l, idx) => (
                  <Text key={idx} style={styles.xLabel}>{l.label}</Text>
                ))}
              </View>

              {tooltip && (
                <View style={[styles.tooltipContainer, { left: Math.max(6, tooltip.x - 56), top: tooltip.y - 60 }]}>
                  <View style={styles.tooltipBubble}>
                    <Text style={styles.tooltipDate}>{processed[tooltip.index]?.label}</Text>
                    <Text style={styles.tooltipValue}>{processed[tooltip.index]?.value}</Text>
                  </View>
                  <View style={styles.tooltipArrow} />
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Footer with legend description only (no total) */}
      <View style={styles.footerContainer}>
        <View style={styles.footerLeft}>
          <Text style={styles.summaryText}>
            Monthly stock level trends over the last 30 days.
          </Text>
        </View>

        <View style={styles.footerRight}>
          <View style={styles.totalItemsContainer}>
            <View style={[styles.legendDot, { backgroundColor: '#FFD36A' }]} />
            <Text style={styles.legendText}>Stock Trends</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Same card styling as StockByWarehouseChart
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e9ecef',
    overflow: 'hidden',
  },
  chartContainer: {
    marginBottom: 16,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 5,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  footerLeft: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  footerRight: {
    minWidth: 100,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  totalItemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 1,
  },
  legendDot: {
    width: 5,
    height: 5,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '400',
    marginLeft: 6,
  },
  summaryText: {
    color: '#666',
    fontSize: 13,
    flexShrink: 1,
    textAlign: 'left',
  },
  // Chart-specific styles
  xLabel: { fontSize: 12, color: '#9a9a9a' },
  yLabel: { fontSize: 12, color: '#b2b2b2', height: 28, textAlign: 'left' },
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
});
