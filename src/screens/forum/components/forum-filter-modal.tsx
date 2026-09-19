import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";
import type { FilterType, ForumCounts } from "../types";

export interface ForumFilterModalProps {
  visible: boolean;
  onClose: () => void;
  activeFilter: FilterType;
  onSelectFilter: (filter: FilterType) => void;
  counts: ForumCounts;
}

interface FilterOptionConfig {
  key: FilterType;
  label: string;
  description: string;
  count: number;
  iconName: keyof typeof Feather.glyphMap;
  iconBg: string;
  iconColor: string;
}

export function ForumFilterModal({
  visible,
  onClose,
  activeFilter,
  onSelectFilter,
  counts,
}: ForumFilterModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [selectedFilter, setSelectedFilter] = useState<FilterType>(activeFilter);

  useEffect(() => {
    if (visible) {
      setSelectedFilter(activeFilter);
    }
  }, [visible, activeFilter]);

  const options: FilterOptionConfig[] = [
    {
      key: "ALL",
      label: "All Discussions",
      description: "Browse all questions and community posts",
      count: counts.total,
      iconName: "message-square",
      iconBg: "#f1f5f9",
      iconColor: BENTO_COLORS.deepNavy,
    },
    {
      key: "UNRESOLVED",
      label: "Needs Help",
      description: "Open questions waiting for answers",
      count: counts.open,
      iconName: "help-circle",
      iconBg: "#fffbeb",
      iconColor: "#d97706",
    },
    {
      key: "RESOLVED",
      label: "Resolved",
      description: "Answered discussions with verified solutions",
      count: counts.resolved,
      iconName: "check-circle",
      iconBg: BENTO_COLORS.emeraldBg,
      iconColor: BENTO_COLORS.emerald,
    },
    {
      key: "MY_POSTS",
      label: "My Discussions",
      description: "Discussions created by your account",
      count: counts.myPosts,
      iconName: "user",
      iconBg: BENTO_COLORS.skyBg,
      iconColor: BENTO_COLORS.primaryBlue,
    },
  ];

  const isFiltered = selectedFilter !== "ALL";

  const handleReset = () => {
    setSelectedFilter("ALL");
  };

  const handleApply = () => {
    onSelectFilter(selectedFilter);
    onClose();
  };

  const bottomPadding =
    Math.max(insets.bottom, 20) + (Platform.OS === "android" ? 12 : 6);

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheet,
            { maxHeight: Math.min(windowHeight * 0.85, 620) },
          ]}
        >
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Filter Discussions</Text>
              <Text style={styles.subtitle}>Refine campus forum feed</Text>
            </View>

            <View style={styles.headerActions}>
              {isFiltered && (
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
                accessibilityLabel="Close filters"
              >
                <Feather name="x" size={18} color={BENTO_COLORS.neutralText} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Options List */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <View style={styles.optionsList}>
              {options.map((item) => {
                const isSelected = selectedFilter === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                    onPress={() => setSelectedFilter(item.key)}
                    activeOpacity={0.8}
                    accessible
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${item.label}, ${item.count} items`}
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: item.iconBg },
                      ]}
                    >
                      <Feather
                        name={item.iconName}
                        size={18}
                        color={item.iconColor}
                      />
                    </View>

                    <View style={styles.optionMeta}>
                      <View style={styles.optionTitleRow}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                        <View
                          style={[
                            styles.countPill,
                            isSelected && styles.countPillSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.countText,
                              isSelected && styles.countTextSelected,
                            ]}
                          >
                            {item.count}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.optionDesc}>{item.description}</Text>
                    </View>

                    <View
                      style={[
                        styles.radioIndicator,
                        isSelected && styles.radioIndicatorSelected,
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={13} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.footer, { paddingBottom: bottomPadding }]}>
            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Apply selected filter"
            >
              <Text style={styles.applyBtnText}>
                {selectedFilter !== "ALL"
                  ? "Apply Filter"
                  : "Show All Discussions"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  title: {
    fontSize: 18,
    fontFamily,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  subtitle: {
    fontSize: 12,
    fontFamily,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resetHeaderBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  resetHeaderBtnText: {
    fontSize: 13,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 18,
    padding: 14,
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  optionMeta: {
    flex: 1,
    gap: 2,
  },
  optionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  optionLabel: {
    fontSize: 14,
    fontFamily,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  optionLabelSelected: {
    color: BENTO_COLORS.primaryBlue,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  countPillSelected: {
    backgroundColor: "#dbeafe",
  },
  countText: {
    fontSize: 11,
    fontFamily,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
  },
  countTextSelected: {
    color: BENTO_COLORS.primaryBlue,
  },
  optionDesc: {
    fontSize: 11,
    fontFamily,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
  },
  radioIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioIndicatorSelected: {
    backgroundColor: BENTO_COLORS.primaryBlue,
    borderColor: BENTO_COLORS.primaryBlue,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
    backgroundColor: BENTO_COLORS.white,
  },
  applyBtn: {
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  applyBtnText: {
    fontSize: 15,
    fontFamily,
    fontWeight: "800",
    color: "#ffffff",
  },
});
