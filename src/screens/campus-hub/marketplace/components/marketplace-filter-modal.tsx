import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type {
  ListingType,
  ListingStatus,
  MarketplaceCategory,
} from "@/services/marketplace-service";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";

export type MarketplaceTypeFilter = "ALL" | ListingType;
export type MarketplaceStatusFilter = "ALL" | "ACTIVE" | "SOLD";
export type MarketplaceCategoryFilter = "ALL" | MarketplaceCategory;

export interface MarketplaceFilterModalProps {
  visible: boolean;
  onClose: () => void;
  typeFilter: MarketplaceTypeFilter;
  statusFilter: MarketplaceStatusFilter;
  categoryFilter: MarketplaceCategoryFilter;
  onApply: (filters: {
    type: MarketplaceTypeFilter;
    status: MarketplaceStatusFilter;
    category: MarketplaceCategoryFilter;
  }) => void;
  onReset: () => void;
}

const TYPE_OPTIONS: { key: MarketplaceTypeFilter; label: string; icon?: keyof typeof Feather.glyphMap }[] = [
  { key: "ALL", label: "All Types" },
  { key: "SELLING", label: "For Sale", icon: "tag" },
  { key: "BUYING", label: "Wanted", icon: "bookmark" },
];

const STATUS_OPTIONS: { key: MarketplaceStatusFilter; label: string }[] = [
  { key: "ALL", label: "All Items" },
  { key: "ACTIVE", label: "Available" },
  { key: "SOLD", label: "Sold" },
];

const CATEGORY_OPTIONS: { key: MarketplaceCategoryFilter; label: string }[] = [
  { key: "ALL", label: "All Categories" },
  { key: "TEXTBOOKS", label: "Textbooks" },
  { key: "ELECTRONICS", label: "Electronics" },
  { key: "STATIONERY", label: "Stationery" },
  { key: "CLOTHING", label: "Clothing" },
  { key: "OTHER", label: "Other" },
];

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccent;

export function MarketplaceFilterModal({
  visible,
  onClose,
  typeFilter,
  statusFilter,
  categoryFilter,
  onApply,
  onReset,
}: MarketplaceFilterModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [localType, setLocalType] = useState<MarketplaceTypeFilter>(typeFilter);
  const [localStatus, setLocalStatus] = useState<MarketplaceStatusFilter>(statusFilter);
  const [localCategory, setLocalCategory] = useState<MarketplaceCategoryFilter>(categoryFilter);

  useEffect(() => {
    if (visible) {
      setLocalType(typeFilter);
      setLocalStatus(statusFilter);
      setLocalCategory(categoryFilter);
    }
  }, [visible, typeFilter, statusFilter, categoryFilter]);

  const activeCount =
    (localType !== "ALL" ? 1 : 0) +
    (localStatus !== "ALL" ? 1 : 0) +
    (localCategory !== "ALL" ? 1 : 0);

  const handleReset = () => {
    setLocalType("ALL");
    setLocalStatus("ALL");
    setLocalCategory("ALL");
    onReset();
    onClose();
  };

  const handleApply = () => {
    onApply({
      type: localType,
      status: localStatus,
      category: localCategory,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheetContainer,
            { maxHeight: Math.min(windowHeight * 0.88, 700) },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Marketplace</Text>
              <Text style={styles.subtitle}>Refine buy & sell campus listings</Text>
            </View>
            <View style={styles.headerActions}>
              {activeCount > 0 && (
                <TouchableOpacity
                  style={styles.resetHeaderBtn}
                  onPress={handleReset}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resetHeaderBtnText}>Reset</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Close filter options"
              >
                <Feather name="x" size={20} color={CAMPUS_HUB_COLORS.neutralText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Scrollable Filters */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {/* Section 1: Listing Type */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Listing Type</Text>
              <View style={styles.pillsRow}>
                {TYPE_OPTIONS.map((item) => {
                  const isSelected = localType === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                      ]}
                      onPress={() => setLocalType(item.key)}
                      activeOpacity={0.8}
                    >
                      {item.icon && (
                        <Feather
                          name={item.icon}
                          size={13}
                          color={isSelected ? "#ffffff" : CAMPUS_HUB_COLORS.subtleText}
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 2: Availability / Status */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.pillsRow}>
                {STATUS_OPTIONS.map((item) => {
                  const isSelected = localStatus === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                      ]}
                      onPress={() => setLocalStatus(item.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Section 3: Categories */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <View style={styles.pillsRow}>
                {CATEGORY_OPTIONS.map((item) => {
                  const isSelected = localCategory === item.key;
                  return (
                    <TouchableOpacity
                      key={item.key}
                      style={[
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                      ]}
                      onPress={() => setLocalCategory(item.key)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Docked Action Bar */}
          <View
            style={[
              styles.footer,
              { paddingBottom: insets.bottom > 0 ? insets.bottom + 12 : 20 },
            ]}
          >
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
            >
              <Feather
                name="check"
                size={16}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.applyBtnText}>
                {activeCount > 0 ? `Apply Filters (${activeCount})` : "Apply Filters"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resetHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  resetHeaderBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 0.2,
  },
  pillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  choicePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  choicePillSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  choicePillText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
  },
  choicePillTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  applyBtn: {
    flexDirection: "row",
    height: 48,
    backgroundColor: ACCENT,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  applyBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});
