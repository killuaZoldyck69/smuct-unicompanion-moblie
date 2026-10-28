import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

interface AdminCourseHubsFilterModalProps {
  isVisible: boolean;
  onClose: () => void;
  status: "ALL" | "ACTIVE" | "ARCHIVED";
  onStatusChange: (status: "ALL" | "ACTIVE" | "ARCHIVED") => void;
  department: string;
  onDepartmentChange: (dept: string) => void;
  availableDepartments: string[];
  totalActive: number;
  totalArchived: number;
  onReset: () => void;
}

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const AdminCourseHubsFilterModal: React.FC<
  AdminCourseHubsFilterModalProps
> = ({
  isVisible,
  onClose,
  status,
  onStatusChange,
  department,
  onDepartmentChange,
  availableDepartments,
  totalActive,
  totalArchived,
  onReset,
}) => {
  const insets = useSafeAreaInsets();

  const isFiltered = status !== "ALL" || (department && department !== "ALL");

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.sheetContent,
                { paddingBottom: Math.max(insets.bottom + 16, 28) },
              ]}
            >
              {/* Header Handle */}
              <View style={styles.handleBar} />

              {/* Title & Close Row */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleGroup}>
                  <Text style={styles.headerTitle}>Filter Course Hubs</Text>
                  <Text style={styles.headerSubtitle}>
                    Refine by status and academic department
                  </Text>
                </View>

                {isFiltered && (
                  <TouchableOpacity
                    style={styles.resetButton}
                    onPress={onReset}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resetButtonText}>Reset</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                  accessibilityLabel="Close filter"
                >
                  <Feather name="x" size={18} color="#0f172a" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollBody}
              >
                {/* 1. Status Filter Section (Moved under Filter option as requested) */}
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>COURSE STATUS</Text>
                  <View style={styles.chipRow}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        status === "ALL" && styles.chipActive,
                      ]}
                      onPress={() => onStatusChange("ALL")}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          status === "ALL" && styles.chipTextActive,
                        ]}
                      >
                        All Classes
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.chip,
                        status === "ACTIVE" && styles.chipActive,
                      ]}
                      onPress={() => onStatusChange("ACTIVE")}
                      activeOpacity={0.75}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              status === "ACTIVE" ? "#ffffff" : "#10b981",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          status === "ACTIVE" && styles.chipTextActive,
                        ]}
                      >
                        Active ({totalActive})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.chip,
                        status === "ARCHIVED" && styles.chipActive,
                      ]}
                      onPress={() => onStatusChange("ARCHIVED")}
                      activeOpacity={0.75}
                    >
                      <Feather
                        name="archive"
                        size={12}
                        color={status === "ARCHIVED" ? "#ffffff" : "#64748b"}
                        style={{ marginRight: 5 }}
                      />
                      <Text
                        style={[
                          styles.chipText,
                          status === "ARCHIVED" && styles.chipTextActive,
                        ]}
                      >
                        Archived ({totalArchived})
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* 2. Department Filter Section */}
                <View style={styles.sectionBlock}>
                  <Text style={styles.sectionLabel}>ACADEMIC DEPARTMENT</Text>
                  <View style={styles.chipWrap}>
                    <TouchableOpacity
                      style={[
                        styles.chip,
                        (!department || department === "ALL") &&
                          styles.chipActive,
                      ]}
                      onPress={() => onDepartmentChange("ALL")}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          (!department || department === "ALL") &&
                            styles.chipTextActive,
                        ]}
                      >
                        All Departments
                      </Text>
                    </TouchableOpacity>

                    {availableDepartments.map((dept) => {
                      const isSelected =
                        department.toUpperCase() === dept.toUpperCase();
                      return (
                        <TouchableOpacity
                          key={dept}
                          style={[
                            styles.chip,
                            isSelected && styles.chipActive,
                          ]}
                          onPress={() =>
                            onDepartmentChange(isSelected ? "ALL" : dept)
                          }
                          activeOpacity={0.75}
                        >
                          <Ionicons
                            name="school-outline"
                            size={13}
                            color={isSelected ? "#ffffff" : "#64748b"}
                            style={{ marginRight: 5 }}
                          />
                          <Text
                            style={[
                              styles.chipText,
                              isSelected && styles.chipTextActive,
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

              {/* Apply Button */}
              <View style={styles.footerActionRow}>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={onClose}
                  activeOpacity={0.85}
                >
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  resetButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  resetButtonText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    maxHeight: 380,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#94a3b8",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  chipActive: {
    backgroundColor: "#131b2e",
    borderColor: "#131b2e",
  },
  chipText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  chipTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 6,
  },
  footerActionRow: {
    marginTop: 14,
    paddingTop: 10,
  },
  applyButton: {
    backgroundColor: "#131b2e",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  applyButtonText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});

