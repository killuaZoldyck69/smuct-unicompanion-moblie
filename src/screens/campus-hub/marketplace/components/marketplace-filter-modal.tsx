import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  Pressable,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import type {
  ListingType,
  MarketplaceCategory,
} from "@/services/marketplace-service";
import { colors } from "@/theme/colors";
import { CAMPUS_HUB_COLORS, fontFamily } from "../../shared/design-tokens";
import { MARKETPLACE_CATEGORIES } from "../marketplace-constants";

export type MarketplaceTypeFilter = "ALL" | ListingType;
export type MarketplaceStatusFilter = "ALL" | "ACTIVE" | "SOLD" | "CLOSED";
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

const TYPE_OPTIONS: {
  key: MarketplaceTypeFilter;
  label: string;
  icon?: keyof typeof Feather.glyphMap;
}[] = [
  { key: "ALL", label: "All Types" },
  { key: "SELLING", label: "For Sale", icon: "tag" },
  { key: "BUYING", label: "Wanted", icon: "bookmark" },
];

const STATUS_OPTIONS: { key: MarketplaceStatusFilter; label: string }[] = [
  { key: "ALL", label: "All Items" },
  { key: "ACTIVE", label: "Available" },
  { key: "SOLD", label: "Sold" },
  { key: "CLOSED", label: "Closed" },
];

const CATEGORY_OPTIONS: { key: MarketplaceCategoryFilter; label: string }[] = [
  { key: "ALL", label: "All Categories" },
  ...MARKETPLACE_CATEGORIES.map((cat) => ({
    key: cat.key as MarketplaceCategoryFilter,
    label: cat.label,
  })),
];

const ACCENT = CAMPUS_HUB_COLORS.marketplaceAccentText;

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
  const [localStatus, setLocalStatus] =
    useState<MarketplaceStatusFilter>(statusFilter);
  const [localCategory, setLocalCategory] =
    useState<MarketplaceCategoryFilter>(categoryFilter);

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
      navigationBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={StyleSheet.absoluteFill}
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
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.title}>Filter Marketplace</Text>
              <Text style={styles.subtitle}>
                Refine buy & sell campus listings
              </Text>
            </View>
            <View style={styles.headerActions}>
              {activeCount > 0 && (
                <Pressable
                  style={({ pressed }) => [
                    styles.resetHeaderBtn,
                    pressed && { opacity: 0.72 },
                  ]}
                  onPress={handleReset}
                  hitSlop={{ top: 4, bottom: 4, left: 6, right: 6 }}
                  android_ripple={{ color: CAMPUS_HUB_COLORS.androidRipple }}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text style={styles.resetHeaderBtnText}>Reset</Text>
                </Pressable>
              )}
              <Pressable
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.75 },
                ]}
                onPress={onClose}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                android_ripple={{
                  color: CAMPUS_HUB_COLORS.androidRipple,
                  borderless: true,
                }}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Close filter options"
              >
                <Feather
                  name="x"
                  size={20}
                  color={CAMPUS_HUB_COLORS.neutralText}
                />
              </Pressable>
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
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                        pressed && { opacity: 0.84 },
                      ]}
                      onPress={() => setLocalType(item.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Listing type: ${item.label}`}
                    >
                      {item.icon && (
                        <Feather
                          name={item.icon}
                          size={13}
                          color={
                            isSelected
                              ? CAMPUS_HUB_COLORS.white
                              : CAMPUS_HUB_COLORS.subtleText
                          }
                          style={{ marginRight: 6 }}
                        />
                      )}
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                        maxFontSizeMultiplier={1.25}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
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
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                        pressed && { opacity: 0.84 },
                      ]}
                      onPress={() => setLocalStatus(item.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Availability: ${item.label}`}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                        maxFontSizeMultiplier={1.25}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
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
                    <Pressable
                      key={item.key}
                      style={({ pressed }) => [
                        styles.choicePill,
                        isSelected && styles.choicePillSelected,
                        pressed && { opacity: 0.84 },
                      ]}
                      onPress={() => setLocalCategory(item.key)}
                      android_ripple={{
                        color: isSelected
                          ? CAMPUS_HUB_COLORS.androidRippleLight
                          : CAMPUS_HUB_COLORS.androidRipple,
                      }}
                      accessible
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                      accessibilityLabel={`Category: ${item.label}`}
                    >
                      <Text
                        style={[
                          styles.choicePillText,
                          isSelected && styles.choicePillTextSelected,
                        ]}
                        maxFontSizeMultiplier={1.25}
                      >
                        {item.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Docked Action Bar */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom + 16, 20) },
            ]}
          >
            <Pressable
              style={({ pressed }) => [
                styles.applyBtn,
                pressed && { opacity: 0.88 },
              ]}
              onPress={handleApply}
              android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Apply filters"
            >
              <Feather
                name="check"
                size={16}
                color={CAMPUS_HUB_COLORS.white}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.applyBtnText} maxFontSizeMultiplier={1.2}>
                {activeCount > 0
                  ? `Apply Filters (${activeCount})`
                  : "Apply Filters"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "flex-end",
  },
  sheetContainer: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    shadowColor: colors.navyDeep,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 2,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate300,
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
    borderBottomColor: CAMPUS_HUB_COLORS.subtleBorder,
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
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
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
    backgroundColor: colors.slate50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
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
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.cardBorder,
  },
  choicePillSelected: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  choicePillText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 16,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.neutralText,
    includeFontPadding: false,
  },
  choicePillTextSelected: {
    color: CAMPUS_HUB_COLORS.white,
    fontWeight: "700",
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  applyBtn: {
    flexDirection: "row",
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: ACCENT,
    borderRadius: 14,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  applyBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
  },
});
