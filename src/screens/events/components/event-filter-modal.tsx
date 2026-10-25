// src/screens/events/components/event-filter-modal.tsx
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
import {
  BENTO_COLORS,
  EVENT_CATEGORIES,
  fontFamily,
} from "../constants";

interface EventFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onApplyCategory: (category: string) => void;
}

export const EventFilterModal = React.memo(function EventFilterModal({
  visible,
  onClose,
  selectedCategory,
  onApplyCategory,
}: EventFilterModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [tempCategory, setTempCategory] = useState<string>(
    selectedCategory || "ALL",
  );

  useEffect(() => {
    if (visible) {
      setTempCategory(selectedCategory || "ALL");
    }
  }, [visible, selectedCategory]);

  const handleSelectOption = (catKey: string) => {
    setTempCategory(catKey);
  };

  const handleApply = () => {
    onApplyCategory(tempCategory);
    onClose();
  };

  const handleReset = () => {
    setTempCategory("ALL");
    onApplyCategory("ALL");
    onClose();
  };

  const categories = [
    {
      key: "ALL",
      label: "All Categories",
      icon: "layers",
      badgeBg: "#f1f5f9",
      badgeText: BENTO_COLORS.deepNavy,
      badgeBorder: "rgba(0,0,0,0.06)",
    },
    ...EVENT_CATEGORIES,
  ];

  const bottomPadding =
    Math.max(insets.bottom, 16) + (Platform.OS === "android" ? 6 : 0);
  const maxSheetHeight = Math.min(windowHeight - insets.top - 30, 620);

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
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
          {/* Top Drag Indicator */}
          <View style={styles.dragHandle} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleCol}>
              <Text style={styles.title}>Filter by Category</Text>
              <Text style={styles.subtitle}>
                Filter campus events by category or program
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
              <Feather name="x" size={18} color={BENTO_COLORS.deepNavy} />
            </TouchableOpacity>
          </View>

          {/* Category Items List */}
          <ScrollView
            style={styles.optionsList}
            contentContainerStyle={styles.optionsListContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {categories.map((cat) => {
              const isSelected =
                (tempCategory || "ALL").toUpperCase() === cat.key;
              const isAll = cat.key === "ALL";

              return (
                <TouchableOpacity
                  key={cat.key}
                  onPress={() => handleSelectOption(cat.key)}
                  style={[
                    styles.optionRow,
                    isSelected && styles.optionRowSelected,
                  ]}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={cat.label}
                >
                  {/* Category Colored Icon Pill */}
                  <View
                    style={[
                      styles.iconBox,
                      isSelected
                        ? isAll
                          ? styles.iconBoxSelectedAll
                          : { backgroundColor: cat.badgeBg }
                        : { backgroundColor: cat.badgeBg },
                    ]}
                  >
                    <Feather
                      name={cat.icon as any}
                      size={16}
                      color={
                        isSelected && isAll
                          ? "#ffffff"
                          : cat.badgeText
                      }
                    />
                  </View>

                  {/* Label */}
                  <View style={styles.optionTextCol}>
                    <Text
                      style={[
                        styles.optionLabel,
                        isSelected && styles.optionLabelSelected,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </View>

                  {/* Radio / Selection Indicator */}
                  <View
                    style={[
                      styles.checkCircle,
                      isSelected && styles.checkCircleSelected,
                    ]}
                  >
                    {isSelected && (
                      <Feather name="check" size={13} color="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Bottom Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Reset category filters"
            >
              <Text style={styles.resetBtnText}>Reset to All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleApply}
              style={styles.applyBtn}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Apply category filter"
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
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 12,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: {
        elevation: 16,
      },
    }),
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitleCol: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 12.5,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  optionsList: {
    marginTop: 8,
  },
  optionsListContent: {
    paddingVertical: 4,
    gap: 6,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "#fafafa",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  optionRowSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#86efac",
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxSelectedAll: {
    backgroundColor: BENTO_COLORS.deepNavy,
  },
  optionTextCol: {
    flex: 1,
  },
  optionLabel: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO_COLORS.neutralText,
  },
  optionLabelSelected: {
    color: BENTO_COLORS.deepNavy,
    fontWeight: "700",
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.8,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  checkCircleSelected: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  resetBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  resetBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  applyBtn: {
    flex: 1.6,
    height: 46,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: BENTO_COLORS.deepNavy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  applyBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
