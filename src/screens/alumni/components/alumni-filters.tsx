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
import { BENTO, fontFamily } from "../constants";
import { DepartmentOption } from "../types";

interface AlumniFiltersProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedDepartment: string | null;
  onSelectDepartment: (dept: string | null) => void;
  departments: DepartmentOption[];
}

export const AlumniFilters: React.FC<AlumniFiltersProps> = React.memo(
  ({
    searchQuery,
    onSearchChange,
    selectedDepartment,
    onSelectDepartment,
    departments,
  }) => {
    return (
      <View style={styles.container}>
        {/* Full-width Search Input matching Screenshot 1 */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
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
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => onSearchChange("")}
                style={styles.clearBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Clear search input"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="x" size={14} color="#9ca3af" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Horizontal Department Filter Pills without counts */}
        {departments.length > 1 ? (
          <View style={styles.departmentScrollWrap}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.departmentScroll}
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
                        styles.deptPillText,
                        isActive && styles.deptPillTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
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
    paddingBottom: 6,
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.03)",
      } as any,
      default: {
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
  clearBtn: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  departmentScrollWrap: {
    paddingBottom: 6,
  },
  departmentScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  deptPill: {
    backgroundColor: BENTO.card,
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: BENTO.border,
    justifyContent: "center",
    alignItems: "center",
  },
  deptPillActive: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  deptPillText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  deptPillTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
});


