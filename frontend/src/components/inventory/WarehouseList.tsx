import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";

import { FadeSlideInView } from "../ui";
import WarehouseCard from "./WarehouseCard";
import type { Warehouse } from "../../types/inventory";
import { SPACING, BORDER_RADIUS } from "../../constants/spacing";
import { COLORS } from "../../constants/colors";

interface Props {
  warehouses: Warehouse[];
  loading?: boolean;
  onWarehousePress: (warehouse: Warehouse) => void;
  onViewAll: () => void;
}

const CARD_SPACING = SPACING.md;

const WarehouseList: React.FC<Props> = ({
  warehouses,
  loading = false,
  onWarehousePress,
  onViewAll,
}) => {
  return (
    <View>
      {/* Header */}
      {/* <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Warehouses</Text>
        <TouchableOpacity onPress={onViewAll} activeOpacity={0.7}>
          <View style={styles.viewAllBtn}>
            <Text style={styles.viewAllText}>View All</Text>
          </View>
        </TouchableOpacity>
      </View> */}
      {/* <Text style={styles.subtitle}>
        Organize and manage your storage facilities
      </Text> */}

      {/* Content */}
      {loading ? (
        <FlatList
          horizontal
          data={[...Array(3)]} // Render 3 skeleton cards
          keyExtractor={(_, i) => i.toString()}
          renderItem={({index}) => (
            <FadeSlideInView delay={index * 100}>
              <WarehouseCard
                warehouse={{
                  id: `skeleton-${index}`,
                  name: 'Loading...',
                  code: '',
                  address: '',
                  contact_person: '',
                  phone: '',
                  email: '',
                  is_active: true,
                  created_at: new Date().toISOString()
                }}
                isLoading={true}
              />
            </FadeSlideInView>
          )}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        />
      ) : (
        <FlatList
          horizontal
          data={warehouses}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <FadeSlideInView delay={index * 100}>
              <WarehouseCard
                warehouse={item}
                onPress={() => onWarehousePress(item)}
                isLoading={false}
              />
            </FadeSlideInView>
          )}
          contentContainerStyle={styles.listContent}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: CARD_SPACING }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.text.primary,
  },
  viewAllBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  viewAllText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 10, // Add some bottom padding for shadow
  }
});

export default React.memo(WarehouseList);
