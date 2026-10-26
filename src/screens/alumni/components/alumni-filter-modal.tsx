import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  useWindowDimensions,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

import { BENTO, fontFamily } from "../constants";
import {
  SMUCT_PROGRAM_DEPARTMENTS,
  ProgramDepartmentOption,
  getDepartmentFullName,
} from "@/data/programs";
import { getDeptTheme } from "../utils";

export interface AlumniFilterModalProps {
  visible: boolean;
  onClose: () => void;
  selectedDepartment: string | null;
  onApplyDepartment: (dept: string | null) => void;
}

export const AlumniFilterModal: React.FC<AlumniFilterModalProps> = React.memo(
  ({ visible, onClose, selectedDepartment, onApplyDepartment }) => {
    const insets = useSafeAreaInsets();
    const { height: windowHeight } = useWindowDimensions();

    const [tempDepartment, setTempDepartment] = useState<string | null>(
      selectedDepartment,
    );
    const [searchFilter, setSearchFilter] = useState("");

    // Sync temporary selection when modal opens
    useEffect(() => {
      if (visible) {
        setTempDepartment(selectedDepartment);
        setSearchFilter("");
      }
    }, [visible, selectedDepartment]);

    // Filter departments from programs.ts by search input
    const filteredDepartments = useMemo(() => {
      if (!searchFilter.trim()) return SMUCT_PROGRAM_DEPARTMENTS;
      const q = searchFilter.toLowerCase().trim();
      return SMUCT_PROGRAM_DEPARTMENTS.filter(
        (dept) =>
          dept.name.toLowerCase().includes(q) ||
          dept.code.toLowerCase().includes(q) ||
          dept.faculty.toLowerCase().includes(q),
      );
    }, [searchFilter]);

    const handleSelectOption = (deptCode: string | null) => {
      setTempDepartment(deptCode);
    };

    const handleApply = () => {
      onApplyDepartment(tempDepartment);
      onClose();
    };

    const handleReset = () => {
      setTempDepartment(null);
      onApplyDepartment(null);
      onClose();
    };

    const bottomPadding =
      Math.max(insets.bottom, 16) + (Platform.OS === "android" ? 12 : 6);
    const maxSheetHeight = Math.min(windowHeight - insets.top - 20, 680);

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
          {/* Backdrop tap to dismiss */}
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
                <Text style={styles.title}>Filter by Department</Text>
                <Text style={styles.subtitle}>
                  Official SMUCT academic programs
                </Text>
              </View>

              <View style={styles.headerRightActions}>
                {tempDepartment !== null && (
                  <TouchableOpacity
                    onPress={handleReset}
                    style={styles.resetBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Reset department filter"
                  >
                    <Text style={styles.resetBtnText}>Reset</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity
                  onPress={onClose}
                  style={styles.closeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Close modal"
                >
                  <Feather name="x" size={20} color={BENTO.navy} />
                </TouchableOpacity>
              </View>
            </View>

            {/* In-Modal Search Input */}
            <View style={styles.searchWrap}>
              <View style={styles.searchBar}>
                <Feather
                  name="search"
                  size={15}
                  color={BENTO.slate}
                  style={styles.searchIcon}
                />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search department by name or code..."
                  placeholderTextColor={BENTO.slate}
                  value={searchFilter}
                  onChangeText={setSearchFilter}
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessible={true}
                  accessibilityLabel="Search academic departments"
                />
                {searchFilter.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchFilter("")}
                    style={styles.clearSearchBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="x" size={13} color={BENTO.slate} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Department Options List */}
            <ScrollView
              style={styles.optionsList}
              contentContainerStyle={styles.optionsListContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Option: All Departments */}
              {!searchFilter.trim() && (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    tempDepartment === null && styles.optionItemActive,
                  ]}
                  onPress={() => handleSelectOption(null)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: tempDepartment === null }}
                  accessibilityLabel="All Departments"
                >
                  <View style={styles.optionLeftCol}>
                    <View
                      style={[
                        styles.deptBadge,
                        {
                          backgroundColor:
                            tempDepartment === null ? BENTO.navy : "#e2e8f0",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.deptBadgeText,
                          {
                            color:
                              tempDepartment === null ? "#ffffff" : BENTO.navy,
                          },
                        ]}
                      >
                        ALL
                      </Text>
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text
                        style={[
                          styles.optionName,
                          tempDepartment === null && styles.optionNameActive,
                        ]}
                      >
                        All Departments
                      </Text>
                      <Text style={styles.optionFaculty}>
                        View alumni from all university programs
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.radioCircle,
                      tempDepartment === null && styles.radioCircleActive,
                    ]}
                  >
                    {tempDepartment === null && (
                      <Feather name="check" size={13} color="#ffffff" />
                    )}
                  </View>
                </TouchableOpacity>
              )}

              {/* Department Items from programs.ts */}
              {filteredDepartments.map((dept: ProgramDepartmentOption) => {
                const isSelected =
                  tempDepartment?.toLowerCase() === dept.code.toLowerCase() ||
                  tempDepartment?.toLowerCase() === dept.name.toLowerCase();
                const deptTheme = getDeptTheme(dept.code);

                return (
                  <TouchableOpacity
                    key={dept.code}
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemActive,
                    ]}
                    onPress={() => handleSelectOption(dept.code)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    accessibilityLabel={`${dept.name} (${dept.code})`}
                  >
                    <View style={styles.optionLeftCol}>
                      <View
                        style={[
                          styles.deptBadge,
                          {
                            backgroundColor: isSelected
                              ? BENTO.navy
                              : deptTheme.bg,
                            borderColor: isSelected
                              ? BENTO.navy
                              : deptTheme.border,
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.deptBadgeText,
                            {
                              color: isSelected ? "#ffffff" : deptTheme.text,
                            },
                          ]}
                        >
                          {dept.code}
                        </Text>
                      </View>
                      <View style={styles.optionTextCol}>
                        <Text
                          style={[
                            styles.optionName,
                            isSelected && styles.optionNameActive,
                          ]}
                          numberOfLines={1}
                        >
                          {dept.name}
                        </Text>
                        <Text style={styles.optionFaculty} numberOfLines={1}>
                          {dept.faculty}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleActive,
                      ]}
                    >
                      {isSelected && (
                        <Feather name="check" size={13} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}

              {filteredDepartments.length === 0 && (
                <View style={styles.emptyResults}>
                  <Feather name="search" size={24} color={BENTO.slate} />
                  <Text style={styles.emptyResultsText}>
                    No departments match "{searchFilter}"
                  </Text>
                </View>
              )}
            </ScrollView>

            {/* Bottom Action Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.applyBtn}
                onPress={handleApply}
                activeOpacity={0.85}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Apply department filter"
              >
                <Text style={styles.applyBtnText}>Apply Filter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  headerTextCol: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily,
    fontSize: 12.5,
    color: BENTO.slate,
    marginTop: 2,
  },
  headerRightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  resetBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  resetBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#6366f1",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  searchWrap: {
    marginBottom: 12,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO.navy,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  optionsList: {
    flexGrow: 0,
    marginBottom: 12,
  },
  optionsListContent: {
    gap: 8,
    paddingBottom: 4,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionItemActive: {
    borderColor: BENTO.navy,
    backgroundColor: "#f8fafc",
  },
  optionLeftCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  deptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  deptBadgeText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
  },
  optionTextCol: {
    flex: 1,
  },
  optionName: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 2,
  },
  optionNameActive: {
    color: BENTO.navy,
    fontWeight: "800",
  },
  optionFaculty: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO.slate,
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "#cbd5e1",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleActive: {
    borderColor: BENTO.navy,
    backgroundColor: BENTO.navy,
  },
  emptyResults: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    gap: 8,
  },
  emptyResultsText: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
  },
  footer: {
    paddingTop: 8,
  },
  applyBtn: {
    backgroundColor: BENTO.navy,
    borderRadius: 14,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: BENTO.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  applyBtnText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});
