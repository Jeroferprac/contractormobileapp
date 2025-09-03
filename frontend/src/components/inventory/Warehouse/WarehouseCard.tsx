import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Feather";
import { Warehouse } from "../../../types/inventory";

interface WarehouseCardProps {
  warehouse: Warehouse & {
    imageUrl?: string;
    totalItems?: number;
    totalQuantity?: number;
    utilization?: number;
    activeItems?: number;
  };
  onPress?: (warehouse: Warehouse) => void;
}

const WarehouseCard: React.FC<WarehouseCardProps> = ({
  warehouse,
  onPress,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress?.(warehouse)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* True Gradient Background */}
        <LinearGradient
          colors={["#FF8C42", "#FF6B00", "#FF4500"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconBox}>
              <Icon name="home" size={22} color="#fff" />
            </View>
            <Text style={styles.title} numberOfLines={1}>
              {warehouse.name}
            </Text>
            <TouchableOpacity style={styles.iconBoxSmall}>
              <Icon name="more-horizontal" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View>
              <View style={styles.statItem}>
                <View style={styles.iconBoxSmall}>
                  <Icon name="eye" size={16} color="#fff" />
                </View>
                <Text style={styles.statText}>
                  {warehouse.activeItems || 0} Active
                </Text>
              </View>
              <View style={styles.statItem}>
                <View style={styles.iconBoxSmall}>
                  <Icon name="list" size={16} color="#fff" />
                </View>
                <Text style={styles.statText}>
                  {warehouse.totalItems || 0} Items
                </Text>
              </View>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.subLabel}>Utilization</Text>
              <Text style={styles.utilizationValue}>
                {warehouse.utilization || 80}%
              </Text>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={["#FFD580", "#FFB347"]}
                  style={[
                    styles.progressFill,
                    {
                      width: `${warehouse.utilization || 80}%`,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {["home", "shopping-bag", "globe"].map((icon, i) => (
              <TouchableOpacity key={i} style={styles.iconBoxSmall}>
                <Icon name={icon} size={18} color="#fff" />
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 220,
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  iconBoxSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
  subLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  utilizationValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  progressTrack: {
    height: 6,
    width: 100,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginTop: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
});

export default WarehouseCard;
