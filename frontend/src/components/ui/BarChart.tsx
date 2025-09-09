import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient as SvgLinearGradient, Stop, Line } from 'react-native-svg';

const AnimatedRect = (Animated as any).createAnimatedComponent(Rect);

// Import the type from the types file
import { BarChartData } from '../../types/inventory';

// Re-export for other components
export type { BarChartData };

export type BarChartProps = {
  data: BarChartData[];
  height?: number;
  padding?: number;
  gap?: number;
  cornerRadius?: number;
  animationDuration?: number;
  loading?: boolean;
  onBarPress?: (index: number, item: BarChartData) => void;
};

const DEFAULT_GRADIENT_START = '#EDA071';
const DEFAULT_GRADIENT_END = '#F5F5F7';
const TOP_BORDER_COLOR = '#E7600E';
const HIGHLIGHT_COLOR = '#2E8BFF';

export default function BarChart({
  data,
  height = 220,
  padding = 8, // Reduced padding to fit more bars
  gap = 6, // Smaller gap to fit more bars
  cornerRadius = 10,
  animationDuration = 600,
  loading = false,
  onBarPress,
}: BarChartProps) {
  // Layout & sizing
  const [containerWidth, setContainerWidth] = useState(0);
  const [chartWidth, setChartWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  const scrollRef = useRef<any>(null);
  const yAxisWidth = 52;
  const minBarWidth = 30; // Smaller minimum width to fit more bars
  const maxVisibleBarsFit = 7; // Show 7 bars visible without scroll

  // Tooltip
  const [selected, setSelected] = useState<null | { index: number; x: number; absoluteX: number }>(null);
  const [tooltipOpacity] = useState(new Animated.Value(0));
  const lastClickedBarRef = useRef<number | null>(null);

  // Animated values per bar
  const animatedValuesRef = useRef<any[]>([]);
  useEffect(() => {
    animatedValuesRef.current = data.map(() => new Animated.Value(0));
  }, [data.length]);

  // Smooth loading animation for bars
  useEffect(() => {
    if (loading) {
      // Reset all bars to 0 when loading
      animatedValuesRef.current.forEach((v) => {
        v.setValue(0);
      });
    } else {
      // Animate bars in sequence with smooth timing when not loading
      const animations = animatedValuesRef.current.map((v, index) =>
        Animated.timing(v, {
          toValue: 1,
          duration: animationDuration,
          delay: index * 100, // Stagger each bar by 100ms
          useNativeDriver: false,
        })
      );
      
      Animated.parallel(animations).start();
    }
  }, [data, animationDuration, loading]);

  // compute max value
  const max = useMemo(() => Math.max(...data.map((d) => d.value), 1), [data]);

  function onLayout(e: any) {
    const w = e.nativeEvent.layout.width;
    setContainerWidth(w);
    setChartWidth(Math.max(w - yAxisWidth - padding * 2, 0));
  }

  // calculate widths - show all data but limit visible bars to 7
  const barCount = data.length;
  const totalGap = Math.max(0, (barCount - 1) * gap);
  const fitBarWidth = barCount > 0 ? (chartWidth - totalGap) / barCount : 0;
  const willFit = barCount <= maxVisibleBarsFit && fitBarWidth >= minBarWidth;
  const barWidth = willFit ? Math.max(fitBarWidth, minBarWidth) : minBarWidth;
  const totalContentWidth = Math.max(chartWidth, barCount * barWidth + totalGap);

  // Debug: Log scroll information
  console.log('BarChart Debug:', {
    dataLength: data.length,
    maxVisibleBarsFit,
    willShowControls: data.length > maxVisibleBarsFit,
    totalContentWidth,
    chartWidth,
    barWidth,
    willFit,
    sampleLabels: data.slice(0, 3).map(d => d.label), // Show first 3 labels
    behavior: data.length <= maxVisibleBarsFit ? 'NO SCROLL - Show all bars' : 'SCROLL ENABLED - Show controls'
  });

  // Y-axis labels for time display
  const gridLabels = ['24:00', '18:00', '12:00', '06:00', '00:00'];

  // Scroll controls
  const scrollBy = chartWidth * 0.7;
  function scrollToOffset(newOffset: number) {
    const capped = Math.max(0, Math.min(newOffset, totalContentWidth - chartWidth));
    scrollRef.current?.scrollTo({ x: capped, animated: true });
    setScrollX(capped);
  }
  function onNext() {
    scrollToOffset(scrollX + scrollBy);
  }
  function onPrev() {
    scrollToOffset(scrollX - scrollBy);
  }

  // Tooltip animation functions
  const showTooltip = (index: number, x: number, absoluteX: number) => {
    setSelected({ index, x, absoluteX });
    Animated.timing(tooltipOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const hideTooltip = () => {
    Animated.timing(tooltipOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelected(null);
    });
  };

  // compute some handy dims
  const svgHeight = Math.max(0, height - padding * 2);
  const maxBarHeight = Math.max(0, svgHeight - 8);

  return (
    <TouchableOpacity 
      {...({ onLayout } as any)} 
      style={[styles.container, { height }]}
      activeOpacity={1}
      onPress={() => {
        // Use setTimeout to ensure bar click is processed first
        setTimeout(() => {
          // Close tooltip when clicking outside bars
          if (selected !== null && lastClickedBarRef.current === null) {
            hideTooltip();
          }
          // Reset the last clicked bar
          lastClickedBarRef.current = null;
        }, 10);
      }}
    >      
      <View style={styles.chartCard}>
        {/* left Y axis labels */}
        <View style={[styles.yAxisColumn, { paddingLeft: padding, paddingRight: 6 }]}> 
          {gridLabels.map((label) => (
            <View key={label} style={{ flex: 1, justifyContent: 'center' }}>
              <Text style={styles.yLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* chart area with scroll */}
        <View style={{ flex: 1, paddingVertical: padding }}>
          {/* Controls Logic:
              - If data.length <= 7: Hide controls, show all bars without scroll
              - If data.length > 7: Show controls, enable scroll/swipe */}
          {data.length > maxVisibleBarsFit && (
            <View style={styles.controlsTopRightWrapper}>
              <View style={styles.controlsTopRight}>
                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={onPrev} 
                  style={styles.ControlButton}
                >
                  <View style={styles.ControlIcon}>
                    <Text style={styles.ControlText}>‹</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7} 
                  onPress={onNext} 
                  style={[styles.ControlButton, styles.ControlButtonActive]}
                >
                  <View style={styles.ControlIcon}>
                    <Text style={[styles.ControlText, styles.ControlTextActive]}>›</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={{ position: 'relative' }}>
            <ScrollView
              ref={(r) => (scrollRef.current = r)}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ 
                width: totalContentWidth, 
                paddingRight: 6
              }}
              {...({ onScroll: (event: any) => setScrollX(event.nativeEvent.contentOffset.x) } as any)}
              scrollEventThrottle={16}
              overScrollMode="never"
              bounces={true}
            >
            <Svg width={totalContentWidth} height={svgHeight}>

        <Defs>
                <SvgLinearGradient id={`defaultGrad`} x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0%" stopColor={DEFAULT_GRADIENT_START} stopOpacity={1} />
                  <Stop offset="100%" stopColor={DEFAULT_GRADIENT_END} stopOpacity={1} />
                </SvgLinearGradient>
        </Defs>

        {data.map((item, i) => {
                const x = i * (barWidth + gap);
          const valueRatio = Math.max(0, Math.min(1, item.value / max));
                const barHeightNumeric = valueRatio * maxBarHeight;
                
                // Use animated height and y position for smooth bottom-to-top loading
                const animatedHeight = animatedValuesRef.current[i]?.interpolate
                  ? animatedValuesRef.current[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, barHeightNumeric],
                    })
                  : new Animated.Value(barHeightNumeric);

                // Animate y position to grow from bottom to top
                const animatedY = animatedValuesRef.current[i]?.interpolate
                  ? animatedValuesRef.current[i].interpolate({
                      inputRange: [0, 1],
                      outputRange: [svgHeight, svgHeight - barHeightNumeric],
                    })
                  : new Animated.Value(svgHeight - barHeightNumeric);

                const gradId = `barGrad-${i}`;
                const start = item.colorStart ?? DEFAULT_GRADIENT_START;
                const end = item.colorEnd ?? DEFAULT_GRADIENT_END;

          return (
                  <React.Fragment key={`bar-frag-${i}`}>
                    <Defs>
                      <SvgLinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0%" stopColor={start} stopOpacity={1} />
                        <Stop offset="100%" stopColor={end} stopOpacity={1} />
                      </SvgLinearGradient>
                    </Defs>

                    {/* main rounded bar with animation */}
                    <AnimatedRect
              x={x}
                      y={animatedY as any}
              rx={cornerRadius}
              ry={cornerRadius}
              width={barWidth}
                      height={animatedHeight as any}
                      fill={`url(#${gradId})`}
                    />

                    {/* thin top border with animation */}
                    <AnimatedRect
                      x={x}
                      y={animatedY as any}
                      width={barWidth}
                      height={2}
                      fill={TOP_BORDER_COLOR}
                    />
                  </React.Fragment>
          );
        })}
      </Svg>
            </ScrollView>
          </View>

          {/* Labels row beneath bars - positioned to scroll with bars */}
          <View style={{ 
            flexDirection: 'row', 
            marginTop: 8, 
            paddingLeft: 2,
            transform: [{ translateX: -scrollX }] // Move labels with scroll
          }}>
            {data.map((item, i) => {
              const widthStyle = { width: barWidth, marginRight: i === data.length - 1 ? 0 : gap };
              const absoluteX = i * (barWidth + gap) + barWidth / 2 + yAxisWidth - scrollX;
              return (
                <TouchableOpacity
                  key={`press-${i}`}
                  style={[widthStyle, { alignItems: 'center' }]}
                  onPress={() => {
                    lastClickedBarRef.current = i;
                    const x = i * (barWidth + gap) + barWidth / 2;
                    showTooltip(i, x, absoluteX);
                    onBarPress && onBarPress(i, item);
                  }}
                >
                  <Text numberOfLines={1} style={styles.labelText}>{item.label ?? ''}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* Tooltip positioned above the selected bar */}
      {selected !== null && data[selected.index] && (() => {
        const idx = selected.index;
        const valueRatio = Math.max(0, Math.min(1, data[idx].value / max));
        const barHeightNumeric = valueRatio * maxBarHeight;
        const svgY = svgHeight - barHeightNumeric;
        const tooltipTop = Math.max(8, padding + svgY - 52);

        return (
        <Tooltip
          containerWidth={containerWidth}
          index={selected.index}
            x={selected.absoluteX}
            top={tooltipTop}
          value={data[selected.index].value}
            label={data[selected.index].fullLabel || data[selected.index].label}
            opacity={tooltipOpacity}
            onClose={hideTooltip}
        />
        );
      })()}
    </TouchableOpacity>
  );
}

function Tooltip({
  x,
  top = 8,
  value,
  label,
  onClose,
  containerWidth,
  index,
  opacity,
}: {
  x: number;
  top?: number;
  value: number;
  label?: string;
  onClose: () => void;
  containerWidth: number;
  index: number;
  opacity: any;
}) {
  const tooltipWidth = 160;
  const left = Math.max(8, Math.min(containerWidth - tooltipWidth - 8, x - tooltipWidth / 2));

  return (
    <Animated.View style={[styles.tooltipWrapper, { left, top, opacity }]}>
      <View style={[styles.tooltipCard, { backgroundColor: '#363231' }]}>
        <Text style={[styles.tooltipTitle, { color: '#FFD36A' }]}>{label ?? 'Value'}</Text>
        <Text style={styles.tooltipValue}>{value.toLocaleString()}</Text>
      </View>
      <View style={[styles.tooltipArrow, { borderTopColor: '#363231' }]} />
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
  yAxisColumn: {
    width: 52,
    justifyContent: 'space-between',
  },
  yLabel: {
    color: '#9b9b9b',
    fontSize: 12,
  },
  labelText: {
    fontSize: 12,
    color: '#6b6b6b',
    marginTop: 0,
  },
  tooltipWrapper: {
    position: 'absolute',
    width: 160,
    alignItems: 'center',
  },
  tooltipCard: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  tooltipTitle: {
    fontWeight: '700',
    fontSize: 12,
    marginBottom: 4,
  },
  tooltipValue: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  tooltipArrow: {
    width: 14,
    height: 8,
    backgroundColor: 'transparent',
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  controlsTopRightWrapper: {
    position: 'absolute',
    right: 5,
    top: 0,
    zIndex: 10,
  },
  controlsTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ControlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: '#e1e5e9',
  },
  ControlButtonActive: {
    backgroundColor: '#FF7A18',
    borderColor: '#FF7A18',
    shadowColor: '#FF7A18',
    shadowOpacity: 0.3,
  },
  ControlIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ControlText: {
    fontSize: 18,
    fontWeight: '300',
    color: '#6c757d',
    lineHeight: 18,
  },
  ControlTextActive: {
    color: '#ffffff',
    fontWeight: '400',
  },
});