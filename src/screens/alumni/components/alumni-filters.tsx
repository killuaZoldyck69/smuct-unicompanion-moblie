import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";
import { getDepartmentFullName } from "@/data/programs";

interface AlumniFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDepartment: string | null;
  onClearDepartment: () => void;
  onOpenFilterModal: () => void;
}

export const AlumniFilters: React.FC<AlumniFiltersProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    selectedDepartment,
    onClearDepartment,
    onOpenFilterModal,
  }) => {
    const isFilterActive = selectedDepartment !== null;
    const deptFullName = selectedDepartment
      ? getDepartmentFullName(selectedDepartment)
      : "";
    const displayLabel = deptFullName
      ? `${selectedDepartment} (${deptFullName})`
      : selectedDepartment || "";

    return (
      <View style={styles.container}>
        {/* Search Bar & Filter Button in Single Row */}
        <View style={styles.searchRow}>
          {/* Search Box on Left */}
          <View style={styles.searchBar}>
            <Feather
              name="search"
              size={16}
              color="#9ca3af"
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, company, or skill"
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={onSearchChange}
              accessible={true}
              accessibilityLabel="Search alumni by name, company, or skill"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                style={styles.clearSearchBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Button Beside Search Box */}
          <TouchableOpacity
            style={[
              styles.filterBtn,
              isFilterActive && styles.filterBtnActive,
            ]}
            onPress={onOpenFilterModal}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Filter alumni by department. Currently ${selectedDepartment || "All"}`}
          >
            <Feather
              name="filter"
              size={18}
              color={isFilterActive ? "#ffffff" : BENTO.navy}
            />
            {isFilterActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        </View>

        {/* Active Department Filter Badge Pill */}
        {isFilterActive && (
          <View style={styles.activeFiltersRow}>
            <View style={styles.activeDeptChip}>
              <Text style={styles.activeDeptChipText} numberOfLines={1}>
                Department: {displayLabel}
              </Text>
              <TouchableOpacity
                onPress={onClearDepartment}
                style={styles.clearDeptBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear department filter"
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Feather name="x" size={12} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    color: BENTO.navy,
    fontFamily,
    padding: 0,
  },
  clearSearchBtn: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  filterBtnActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  activeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#6366f1",
    borderWidth: 1,
    borderColor: "#ffffff",
  },
  activeFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  activeDeptChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    borderRadius: 20,
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 5,
    maxWidth: "100%",
  },
  activeDeptChipText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
    marginRight: 6,
    flexShrink: 1,
  },
  clearDeptBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
});
