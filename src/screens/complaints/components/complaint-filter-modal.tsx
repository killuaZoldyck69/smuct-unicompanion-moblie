// src/screens/complaints/components/complaint-filter-modal.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
} from "@/screens/campus-hub/shared/design-tokens";

export const COMPLAINT_CATEGORY_OPTIONS = [
  {
    key: "ALL",
    label: "All Categories",
    description: "Display all submitted student grievances",
    icon: "layers" as const,
  },
  {
    key: "Facilities",
    label: "Facilities",
    description: "Campus maintenance, classrooms & physical spaces",
    icon: "tool" as const,
  },
  {
    key: "Academic",
    label: "Academic",
    description: "Courses, examinations, grading & scheduling",
    icon: "book-open" as const,
  },
  {
    key: "Hostel",
    label: "Hostel",
    description: "Accommodation, dormitory & residential affairs",
    icon: "home" as const,
  },
  {
    key: "IT Support",
    label: "IT Support",
    description: "Lab PCs, network, portal & campus technology",
    icon: "monitor" as const,
  },
  {
    key: "Administrative",
    label: "Administrative",
    description: "Accounts, admissions, registrar & official campus offices",
    icon: "briefcase" as const,
  },
  {
    key: "Other",
    label: "Other",
    description: "General campus concerns & inquiries",
    icon: "help-circle" as const,
  },
] as const;

export interface ComplaintFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCategory: string;
  onApplyCategory: (category: string) => void;
  categoryCounts?: Record<string, number>;
}

export const ComplaintFilterModal = React.memo(function ComplaintFilterModal({
  visible,
  onClose,
  selectedCategory,
  onApplyCategory,
  categoryCounts = {},
}: ComplaintFilterModalProps) {
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

  const bottomPadding =
    Math.max(insets.bottom, 16) + (Platform.OS === "android" ? 10 : 4);
  const maxSheetHeight = Math.min(windowHeight - insets.top - 20, 620);

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.backdrop}>
        {/* Backdrop tap dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        {/* Bottom Sheet Container */}
        <View
          style={[
            styles.sheetContainer,
            {
              maxHeight: maxSheetHeight,
              paddingBottom: bottomPadding,
            },
          ]}
        >
          {/* Grab Handle */}
          <View style={styles.dragHandle} />

          {/* Modal Header */}
          <View style={styles.header}>
            <View style={styles.headerTextCol}>
              <Text style={styles.title}>Filter by Category</Text>
              <Text style={styles.subtitle}>
                Narrow grievances by campus department
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleReset}
              style={styles.resetButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Reset category filter to all"
              activeOpacity={0.7}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {/* Category List */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {COMPLAINT_CATEGORY_OPTIONS.map((item) => {
              const isSelected = tempCategory === item.key;
              const count = categoryCounts[item.key];

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.categoryCard,
                    isSelected && styles.categoryCardSelected,
                  ]}
                  onPress={() => handleSelectOption(item.key)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${item.label} category filter`}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      isSelected && styles.iconCircleSelected,
                    ]}
                  >
                    <Feather
                      name={item.icon}
                      size={18}
                      color={
                        isSelected
                          ? "#ffffff"
                          : CAMPUS_HUB_COLORS.deepNavy
                      }
                    />
                  </View>

                  <View style={styles.categoryInfoCol}>
                    <View style={styles.categoryNameRow}>
                      <Text
                        style={[
                          styles.categoryName,
                          isSelected && styles.categoryNameSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {count !== undefined && (
                        <View
                          style={[
                            styles.countBadge,
                            isSelected && styles.countBadgeSelected,
                          ]}
                        >
                          <Text
                            style={[
                              styles.countBadgeText,
                              isSelected && styles.countBadgeTextSelected,
                            ]}
                          >
                            {count}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.categoryDesc} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </View>

                  {/* Radio Indicator */}
                  <View
                    style={[
                      styles.radioCircle,
                      isSelected && styles.radioCircleSelected,
                    ]}
                  >
                    {isSelected && <View style={styles.radioInnerDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Action Row */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel category selection"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.applyBtn}
              onPress={handleApply}
              activeOpacity={0.8}
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
    backgroundColor: "rgba(11, 21, 40, 0.55)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingHorizontal: 20,
    ...CAMPUS_HUB_COLORS.heroShadow,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
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
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
    fontWeight: "500",
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  resetButtonText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  scrollView: {
    flexGrow: 0,
    marginVertical: 12,
  },
  scrollContent: {
    gap: 8,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
  },
  categoryCardSelected: {
    backgroundColor: "#f0f9ff",
    borderColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    marginRight: 12,
  },
  iconCircleSelected: {
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    borderColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  categoryInfoCol: {
    flex: 1,
    marginRight: 8,
  },
  categoryNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  categoryName: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  categoryNameSelected: {
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  countBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  countBadgeSelected: {
    backgroundColor: "#bae6fd",
  },
  countBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  countBadgeTextSelected: {
    color: "#0369a1",
  },
  categoryDesc: {
    fontFamily,
    fontSize: 11.5,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  radioInnerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  applyBtn: {
    flex: 1.4,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  applyBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
