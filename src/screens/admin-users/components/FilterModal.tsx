import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { getDepartmentFullName } from "@/data/programs";

import { THEME, DEPARTMENT_CHIPS } from "../constants";
import { RoleStatusTag } from "../types";

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  isStudentTab: boolean;
  filterRoleTag: RoleStatusTag;
  onSelectRoleTag: (tag: RoleStatusTag) => void;
  selectedDepartment: string | null;
  onSelectDepartment: (dept: string | null) => void;
  onResetAll: () => void;
  primaryThemeColor: string;
  topInset: number;
  bottomInset: number;
}

export const FilterModal = React.memo(
  ({
    visible,
    onClose,
    isStudentTab,
    filterRoleTag,
    onSelectRoleTag,
    selectedDepartment,
    onSelectDepartment,
    onResetAll,
    primaryThemeColor,
    topInset,
    bottomInset,
  }: FilterModalProps) => {
    return (
      <Modal
        visible={visible}
        transparent={true}
        animationType="slide"
        statusBarTranslucent={true}
        onRequestClose={onClose}
      >
        <View
          style={[
            styles.modalBackdrop,
            { paddingTop: Math.max(topInset, 24) + 16 },
          ]}
        >
          {/* Sibling touchable backdrop to dismiss on tap outside */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close filter modal"
          />

          {/* Bottom Sheet Container */}
          <View
            style={[
              styles.filterSheet,
              {
                paddingBottom:
                  Math.max(bottomInset, Platform.OS === "android" ? 24 : 16) +
                  12,
              },
            ]}
          >
            {/* Top Sheet Handle Bar */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Filter Sheet Header */}
            <View style={styles.filterSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterSheetTitle}>Filter Directory</Text>
                <Text style={styles.filterSheetSubtitle}>
                  Filter members by department and role
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.filterSheetClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close filter modal"
              >
                <Feather name="x" size={20} color={THEME.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Filter Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterScrollContent}
              bounces={false}
            >
              {/* Role Tag Filter for Students */}
              {isStudentTab && (
                <View style={styles.filterSection}>
                  <Text style={styles.filterSectionLabel}>ROLE STATUS</Text>
                  <View style={styles.filterOptionsRow}>
                    {(["ALL", "CR"] as const).map((tag) => {
                      const isActive = filterRoleTag === tag;
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[
                            styles.filterOptionBtn,
                            isActive && {
                              backgroundColor: primaryThemeColor,
                              borderColor: primaryThemeColor,
                            },
                          ]}
                          onPress={() => onSelectRoleTag(tag)}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Filter by ${tag}`}
                        >
                          <Text
                            style={[
                              styles.filterOptionText,
                              isActive && {
                                color: "#FFFFFF",
                                fontWeight: "700",
                              },
                            ]}
                          >
                            {tag === "ALL"
                              ? "All Students"
                              : "Class Reps (CR)"}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {/* Department Picker in Filter Modal */}
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeaderRow}>
                  <Text style={styles.filterSectionLabel}>SMUCT DEPARTMENTS</Text>
                  {selectedDepartment && selectedDepartment !== "All" && (
                    <Text
                      style={[
                        styles.filterSelectedDeptHint,
                        { color: primaryThemeColor },
                      ]}
                      numberOfLines={1}
                    >
                      {getDepartmentFullName(selectedDepartment)}
                    </Text>
                  )}
                </View>

                <View style={styles.filterGrid}>
                  {DEPARTMENT_CHIPS.map((dept) => {
                    const isSelected =
                      dept === "All"
                        ? selectedDepartment === null ||
                          selectedDepartment === "All"
                        : selectedDepartment === dept;

                    return (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.filterGridItem,
                          isSelected && {
                            backgroundColor: primaryThemeColor,
                            borderColor: primaryThemeColor,
                          },
                        ]}
                        onPress={() =>
                          onSelectDepartment(dept === "All" ? null : dept)
                        }
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Department ${dept}`}
                      >
                        <Text
                          style={[
                            styles.filterGridText,
                            isSelected && {
                              color: "#FFFFFF",
                              fontWeight: "700",
                            },
                          ]}
                        >
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Actions */}
            <View style={styles.filterModalActions}>
              <TouchableOpacity
                style={styles.filterResetAction}
                onPress={onResetAll}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters"
              >
                <Text style={styles.filterResetText}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterApplyAction,
                  { backgroundColor: primaryThemeColor },
                ]}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Apply filters"
              >
                <Text style={styles.filterApplyText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  sheetHandleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
  },
  filterSheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  filterSheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textPrimary,
  },
  filterSheetSubtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 2,
  },
  filterSheetClose: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
  },
  filterScrollView: {
    paddingHorizontal: 20,
  },
  filterScrollContent: {
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMuted,
    letterSpacing: 0.8,
  },
  filterSelectedDeptHint: {
    fontSize: 12,
    fontWeight: "700",
    maxWidth: "60%",
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
  },
  filterOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterOptionText: {
    fontSize: 13,
    fontWeight: "600",
    color: THEME.textPrimary,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterGridItem: {
    width: "22.8%",
    aspectRatio: 1.6,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterGridText: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textPrimary,
  },
  filterModalActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  filterResetAction: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  filterResetText: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textSecondary,
  },
  filterApplyAction: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
