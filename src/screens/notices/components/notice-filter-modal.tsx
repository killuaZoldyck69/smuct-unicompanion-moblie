// src/screens/notices/components/notice-filter-modal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { NoticeCategoryKey } from "../types";
import { resolveNoticeVisualTheme } from "../theme/notice-visual-theme-resolver";

interface Props {
  visible: boolean;
  onClose: () => void;
  selectedCategory: NoticeCategoryKey;
  onApplyCategory: (category: NoticeCategoryKey) => void;
  categoryCounts: Record<string, number>;
  categories: Array<{ key: NoticeCategoryKey; label: string }>;
}

export const NoticeFilterModal = React.memo(function NoticeFilterModal({
  visible,
  onClose,
  selectedCategory,
  onApplyCategory,
  categoryCounts,
  categories,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [tempCategory, setTempCategory] = useState<NoticeCategoryKey>(selectedCategory);

  useEffect(() => {
    if (visible) {
      setTempCategory(selectedCategory);
    }
  }, [visible, selectedCategory]);

  const handleApply = () => {
    onApplyCategory(tempCategory);
    onClose();
  };

  const handleReset = () => {
    setTempCategory("ALL");
    onApplyCategory("ALL");
    onClose();
  };

  const bottomPadding = Math.max(insets.bottom, 16) + (Platform.OS === "android" ? 4 : 0);
  const maxSheetHeight = Math.min(windowHeight - insets.top - 24, 620);

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View
          style={[
            styles.sheetContainer,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: bottomPadding,
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTitleCol}>
                  <Text style={styles.title}>Filter Notices</Text>
                  <Text style={styles.subtitle}>
                    Select a category to filter announcements
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close filter modal"
                  activeOpacity={0.7}
                >
                  <Feather name="x" size={18} color={NOTICE_COLORS.deepNavy} />
                </TouchableOpacity>
              </View>

              {/* Category Options List */}
              <ScrollView
                style={styles.optionsList}
                showsVerticalScrollIndicator={false}
              >
                {categories.map((cat) => {
                  const isSelected = tempCategory === cat.key;
                  const theme =
                    cat.key === "ALL"
                      ? null
                      : resolveNoticeVisualTheme(cat.key);
                  const count = categoryCounts[cat.key] ?? 0;

                  return (
                    <TouchableOpacity
                      key={cat.key}
                      onPress={() => setTempCategory(cat.key)}
                      style={[
                        styles.optionRow,
                        isSelected && styles.optionRowSelected,
                      ]}
                      activeOpacity={0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`${cat.label}, ${count} notices`}
                    >
                      {/* Left Category Icon */}
                      <View
                        style={[
                          styles.iconBox,
                          isSelected
                            ? styles.iconBoxSelected
                            : theme
                              ? { backgroundColor: theme.badgeBg }
                              : styles.iconBoxDefault,
                        ]}
                      >
                        <Feather
                          name={theme ? theme.icon : "layers"}
                          size={16}
                          color={
                            isSelected
                              ? NOTICE_COLORS.white
                              : theme
                                ? theme.badgeText
                                : NOTICE_COLORS.deepNavy
                          }
                        />
                      </View>

                      {/* Label & Count text */}
                      <View style={styles.optionTextCol}>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        <Text style={styles.optionCountText}>
                          {count} {count === 1 ? "notice" : "notices"} available
                        </Text>
                      </View>

                      {/* Right Check / Radio Mark */}
                      <View
                        style={[
                          styles.checkCircle,
                          isSelected && styles.checkCircleSelected,
                        ]}
                      >
                        {isSelected && (
                          <Feather
                            name="check"
                            size={13}
                            color={NOTICE_COLORS.white}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Action Buttons */}
              <View style={styles.footerRow}>
                <TouchableOpacity
                  onPress={handleReset}
                  style={styles.resetBtn}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Reset all filters"
                >
                  <Text style={styles.resetBtnText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleApply}
                  style={styles.applyBtn}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Apply selected filter"
                >
                  <Text style={styles.applyBtnText}>Apply Filter</Text>
                </TouchableOpacity>
              </View>
        </View>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: NOTICE_COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...NOTICE_COLORS.heroShadow,
  },
  dragHandle: {
    width: 42,
    height: 4.5,
    borderRadius: 2.5,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: NOTICE_COLORS.divider,
  },
  headerTitleCol: {
    flex: 1,
  },
  title: {
    fontFamily,
    fontSize: 19,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: NOTICE_COLORS.subtleText,
    marginTop: 2,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    maxHeight: 340,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "transparent",
  },
  optionRowSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconBoxDefault: {
    backgroundColor: "#f1f5f9",
  },
  iconBoxSelected: {
    backgroundColor: NOTICE_COLORS.deepNavy,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
  },
  optionLabelSelected: {
    color: NOTICE_COLORS.deepNavy,
    fontWeight: "800",
  },
  optionCountText: {
    fontFamily,
    fontSize: 11.5,
    color: NOTICE_COLORS.subtleText,
    marginTop: 1,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: NOTICE_COLORS.white,
  },
  checkCircleSelected: {
    backgroundColor: NOTICE_COLORS.deepNavy,
    borderColor: NOTICE_COLORS.deepNavy,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  resetBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: NOTICE_COLORS.deepNavy,
  },
  applyBtn: {
    flex: 2,
    height: 48,
    borderRadius: 14,
    backgroundColor: NOTICE_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
    ...NOTICE_COLORS.shadow,
  },
  applyBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: NOTICE_COLORS.white,
  },
});
