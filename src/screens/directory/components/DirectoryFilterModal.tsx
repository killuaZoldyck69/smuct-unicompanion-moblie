import React, { useMemo } from "react";
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
import {
  DEPARTMENT_SHORT_NAMES,
  getDepartmentFullName,
  getDepartmentShortName,
} from "@/data/programs";
import { THEME, fontFamily } from "../constants";

interface DirectoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDepartment: string | null;
  onSelectDepartment: (dept: string | null) => void;
  onResetAll: () => void;
  topInset: number;
  bottomInset: number;
}

export const DirectoryFilterModal = React.memo(
  ({
    visible,
    onClose,
    selectedDepartment,
    onSelectDepartment,
    onResetAll,
    topInset,
    bottomInset,
  }: DirectoryFilterModalProps) => {
    // Keep every department listed in programs.ts, even if it has no current faculty.
    const departmentList = useMemo(() => {
      return Object.entries(DEPARTMENT_SHORT_NAMES).map(([value, label]) => ({
        value,
        label,
      }));
    }, []);

    const isAllSelected =
      !selectedDepartment || selectedDepartment.toLowerCase() === "all";

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
          {/* Backdrop tap to dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close filter sheet"
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
            {/* Sheet Handle */}
            <View style={styles.sheetHandleContainer}>
              <View style={styles.sheetHandle} />
            </View>

            {/* Filter Sheet Header */}
            <View style={styles.filterSheetHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.filterSheetTitle}>Filter Directory</Text>
                <Text style={styles.filterSheetSubtitle}>
                  Filter faculty members by academic department
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                style={styles.filterSheetClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close filter modal"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={20} color={THEME.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Department Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.filterScrollView}
              contentContainerStyle={styles.filterScrollContent}
              bounces={false}
            >
              <View style={styles.filterSection}>
                <View style={styles.filterSectionHeaderRow}>
                  <Text style={styles.filterSectionLabel}>SMUCT DEPARTMENTS</Text>
                  {selectedDepartment && selectedDepartment !== "All" && (
                    <Text
                      style={styles.filterSelectedDeptHint}
                      numberOfLines={1}
                    >
                      {getDepartmentFullName(selectedDepartment)}
                    </Text>
                  )}
                </View>

                <View style={styles.filterAllRow}>
                  <TouchableOpacity
                    style={[
                      styles.filterAllItem,
                      isAllSelected && styles.filterGridItemSelected,
                    ]}
                    onPress={() => onSelectDepartment(null)}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="All Departments"
                  >
                    <Text
                      style={[
                        styles.filterGridText,
                        isAllSelected && styles.filterGridTextSelected,
                      ]}
                    >
                      All Departments
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.filterGrid}>
                  {departmentList.map((dept) => {
                    const selected = selectedDepartment?.trim().toLowerCase();
                    const isSelected =
                      selected === dept.value.toLowerCase() ||
                      selected === getDepartmentShortName(dept.value).toLowerCase();

                    return (
                      <TouchableOpacity
                        key={dept.value}
                        style={[
                          styles.filterGridItem,
                          isSelected && styles.filterGridItemSelected,
                        ]}
                        onPress={() => onSelectDepartment(dept.value)}
                        activeOpacity={0.75}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Department ${dept.label}`}
                      >
                        <Text
                          style={[
                            styles.filterGridText,
                            isSelected && styles.filterGridTextSelected,
                          ]}
                        >
                          {dept.label}
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
                activeOpacity={0.75}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Reset all filters"
              >
                <Text style={styles.filterResetText}>Reset All</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.filterApplyAction}
                onPress={onClose}
                activeOpacity={0.8}
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
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: THEME.textPrimary,
  },
  filterSheetSubtitle: {
    fontFamily,
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
    marginBottom: 16,
  },
  filterSectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  filterSectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMuted,
    letterSpacing: 0.8,
  },
  filterSelectedDeptHint: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: THEME.primary,
    maxWidth: "60%",
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  filterAllRow: {
    alignItems: "center",
    marginBottom: 8,
  },
  filterAllItem: {
    width: "48%",
    minHeight: 48,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterGridItem: {
    width: "31%",
    minHeight: 48,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterGridItemSelected: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  filterGridText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: THEME.textPrimary,
    textAlign: "center",
  },
  filterGridTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
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
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: THEME.textSecondary,
  },
  filterApplyAction: {
    flex: 2,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: THEME.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: THEME.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  filterApplyText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
