import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO } from "../constants";
import { AlumniSortOption, DepartmentOption } from "../types";

interface AlumniFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalCount: number;
  filteredCount: number;
  sortBy: AlumniSortOption;
  onToggleSort: () => void;
  selectedDepartment: string | null;
  onSelectDepartment: (dept: string | null) => void;
  departments: DepartmentOption[];
  onResetFilters: () => void;
}

export const AlumniFilters: React.FC<AlumniFiltersProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    totalCount,
    filteredCount,
    sortBy,
    onToggleSort,
    selectedDepartment,
    onSelectDepartment,
    departments,
    onResetFilters,
  }) => {
    const isFiltered = searchQuery.trim().length > 0 || selectedDepartment !== null;

    return (
      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchSection}>
          <View style={styles.inputContainer}>
            <Feather
              name="search"
              size={18}
              color={BENTO.slate}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Search by name, company, position, or skill..."
              placeholderTextColor={BENTO.slateLight}
              value={searchQuery}
              onChangeText={onSearchChange}
              accessible={true}
              accessibilityLabel="Search alumni"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                style={styles.clearBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search text"
              >
                <Feather name="x-circle" size={16} color={BENTO.slate} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* Stats and Controls Row */}
          {totalCount > 0 ? (
            <View style={styles.statsRow}>
              <Text style={styles.statsText}>
                Showing{" "}
                <Text style={styles.statsHighlight}>{filteredCount}</Text> of{" "}
                {totalCount} alumni
              </Text>

              <View style={styles.statsActions}>
                <TouchableOpacity
                  style={styles.sortBtn}
                  onPress={onToggleSort}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`Sort by ${sortBy === "recent" ? "name" : "graduation year"}`}
                >
                  <Feather
                    name={sortBy === "recent" ? "clock" : "type"}
                    size={12}
                    color={BENTO.slate}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.sortText}>
                    {sortBy === "recent" ? "Graduation" : "Name A-Z"}
                  </Text>
                </TouchableOpacity>

                {isFiltered ? (
                  <TouchableOpacity
                    onPress={onResetFilters}
                    activeOpacity={0.7}
                    style={styles.resetBtn}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Reset all filters"
                  >
                    <Text style={styles.resetText}>Reset</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ) : null}
        </View>

        {/* Horizontal Department Filter Pills */}
        {departments.length > 1 ? (
          <View style={styles.pillWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillScroll}
            >
              {departments.map((item) => {
                const isActive = selectedDepartment === item.value;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.deptPill,
                      isActive && styles.deptPillActive,
                    ]}
                    onPress={() => onSelectDepartment(item.value)}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityLabel={`${item.label} department filter`}
                  >
                    <Text
                      style={[
                        styles.deptText,
                        isActive && styles.deptTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                    <View
                      style={[
                        styles.countChip,
                        isActive && styles.countChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.countText,
                          isActive && styles.countTextActive,
                        ]}
                      >
                        {item.count}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: BENTO.canvas,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 1px 4px rgba(15, 23, 42, 0.04)" }
      : { elevation: 1 }),
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: BENTO.navy,
    fontFamily: BENTO.fontBody,
    padding: 0,
  },
  clearBtn: {
    padding: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  statsText: {
    fontSize: 12,
    color: BENTO.slate,
  },
  statsHighlight: {
    fontWeight: "700",
    color: BENTO.navy,
  },
  statsActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sortBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  sortText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  resetBtn: {
    paddingVertical: 2,
  },
  resetText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  pillWrapper: {
    paddingVertical: 8,
  },
  pillScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  deptPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  deptPillActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  deptText: {
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },
  deptTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  countChip: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    marginLeft: 6,
  },
  countChipActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  countText: {
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
  },
  countTextActive: {
    color: "#ffffff",
  },
});
