import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DIRECTORY_COLORS, fontFamily } from "../constants";

interface DepartmentFilterChipsProps {
  departments: string[];
  selectedDepartment: string | null;
  onSelectDepartment: (dept: string | null) => void;
  totalTeachersCount?: number;
}

export const DepartmentFilterChips = React.memo(
  function DepartmentFilterChips({
    departments,
    selectedDepartment,
    onSelectDepartment,
    totalTeachersCount,
  }: DepartmentFilterChipsProps) {
    if (departments.length === 0) return null;

    return (
      <View style={styles.container}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ALL DEPARTMENTS PILL */}
          <TouchableOpacity
            style={[
              styles.pill,
              selectedDepartment === null && styles.pillActive,
            ]}
            onPress={() => onSelectDepartment(null)}
            activeOpacity={0.75}
            accessible={true}
            accessibilityRole="tab"
            accessibilityLabel="Filter All Departments"
            accessibilityState={{ selected: selectedDepartment === null }}
          >
            <Feather
              name="layers"
              size={12}
              color={
                selectedDepartment === null
                  ? "#ffffff"
                  : DIRECTORY_COLORS.textSecondary
              }
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.pillText,
                selectedDepartment === null && styles.pillTextActive,
              ]}
            >
              All Departments
            </Text>
            {typeof totalTeachersCount === "number" && totalTeachersCount > 0 ? (
              <View
                style={[
                  styles.countBadge,
                  selectedDepartment === null && styles.countBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.countBadgeText,
                    selectedDepartment === null && styles.countBadgeTextActive,
                  ]}
                >
                  {totalTeachersCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>

          {/* INDIVIDUAL DEPARTMENTS */}
          {departments.map((dept) => {
            const isSelected = selectedDepartment === dept;

            return (
              <TouchableOpacity
                key={dept}
                style={[styles.pill, isSelected && styles.pillActive]}
                onPress={() => onSelectDepartment(isSelected ? null : dept)}
                activeOpacity={0.75}
                accessible={true}
                accessibilityRole="tab"
                accessibilityLabel={`Filter by ${dept} department`}
                accessibilityState={{ selected: isSelected }}
              >
                <Text
                  style={[styles.pillText, isSelected && styles.pillTextActive]}
                  numberOfLines={1}
                >
                  {dept}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: DIRECTORY_COLORS.surface,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: DIRECTORY_COLORS.divider,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DIRECTORY_COLORS.pillRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
  },
  pillActive: {
    backgroundColor: DIRECTORY_COLORS.deepNavy,
    borderColor: DIRECTORY_COLORS.deepNavy,
  },
  pillText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "600",
    color: DIRECTORY_COLORS.textSecondary,
  },
  pillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  countBadge: {
    backgroundColor: "rgba(0, 0, 0, 0.06)",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: DIRECTORY_COLORS.pillRadius,
    marginLeft: 6,
  },
  countBadgeActive: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  countBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: DIRECTORY_COLORS.textSecondary,
  },
  countBadgeTextActive: {
    color: "#ffffff",
  },
});
