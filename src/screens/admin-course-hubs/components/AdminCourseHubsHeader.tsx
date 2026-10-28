import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { getDepartmentShortName } from "@/data/programs";

interface AdminCourseHubsHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onOpenFilter: () => void;
  status: "ALL" | "ACTIVE" | "ARCHIVED";
  onStatusReset: () => void;
  department: string;
  onDepartmentReset: () => void;
  totalActive: number;
  totalArchived: number;
}

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

export const AdminCourseHubsHeader: React.FC<AdminCourseHubsHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenFilter,
  status,
  onStatusReset,
  department,
  onDepartmentReset,
}) => {
  const isStatusFiltered = status !== "ALL";
  const isDeptFiltered = Boolean(department && department !== "ALL");
  const filterCount = (isStatusFiltered ? 1 : 0) + (isDeptFiltered ? 1 : 0);

  return (
    <View style={styles.container}>
      {/* Background Soft Glow */}
      <View style={styles.decorativeLayer} pointerEvents="none">
        <View style={styles.glowCircle} />
      </View>

      {/* 1. Top Row: Title Column + Illustration */}
      <View style={styles.topRow}>
        <View style={styles.titleColumn}>
          <Text style={styles.screenTitle}>Course Hubs</Text>
          <Text style={styles.screenSubtitle}>
            Search & audit all university course hubs
          </Text>
        </View>

        <View style={styles.illustrationWrap} pointerEvents="none">
          <Image
            source={require("@/assets/icons/student-benefits.png")}
            style={styles.headerIllustration}
            resizeMode="contain"
            accessible={false}
          />
        </View>
      </View>

      {/* 2. Search Box & Filter Row */}
      <View style={styles.searchFilterRow}>
        {/* Search Input Box */}
        <View style={styles.searchInputContainer}>
          <Feather
            name="search"
            size={18}
            color="#64748b"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search course name or code..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="never"
          />
          {Boolean(searchQuery) && (
            <TouchableOpacity
              style={styles.clearSearchBtn}
              onPress={onClearSearch}
              activeOpacity={0.7}
              accessibilityLabel="Clear search text"
            >
              <Feather name="x" size={14} color="#64748b" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Option Button beside Search Box */}
        <TouchableOpacity
          style={[
            styles.filterTriggerBtn,
            filterCount > 0 && styles.filterTriggerBtnActive,
          ]}
          onPress={onOpenFilter}
          activeOpacity={0.8}
          accessibilityLabel={`Open course hub filters. ${filterCount} active`}
        >
          <Feather
            name="sliders"
            size={18}
            color={filterCount > 0 ? "#ffffff" : "#0f172a"}
          />
          {filterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* 3. Active Filter Pills (Dismissible shortcuts) */}
      {(isStatusFiltered || isDeptFiltered) && (
        <View style={styles.activePillsRow}>
          {isStatusFiltered && (
            <TouchableOpacity
              style={styles.activePill}
              onPress={onStatusReset}
              activeOpacity={0.7}
            >
              <Text style={styles.activePillText}>
                Status: {status === "ACTIVE" ? "Active" : "Archived"}
              </Text>
              <Feather
                name="x"
                size={12}
                color="#2563eb"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}

          {isDeptFiltered && (
            <TouchableOpacity
              style={styles.activePill}
              onPress={onDepartmentReset}
              activeOpacity={0.7}
            >
              <Ionicons
                name="school"
                size={11}
                color="#2563eb"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.activePillText}>
                {getDepartmentShortName(department) || department}
              </Text>
              <Feather
                name="x"
                size={12}
                color="#2563eb"
                style={{ marginLeft: 4 }}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f7f9fb",
  },
  decorativeLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  glowCircle: {
    position: "absolute",
    top: -40,
    right: -10,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(59, 91, 245, 0.06)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  titleColumn: {
    flex: 1,
    paddingTop: 4,
    marginRight: 8,
  },
  illustrationWrap: {
    width: 105,
    height: 68,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -4,
  },
  headerIllustration: {
    width: 125,
    height: 80,
    opacity: 0.95,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.6,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  searchFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: "#0f172a",
    paddingVertical: 0,
  },
  clearSearchBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  filterTriggerBtn: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  filterTriggerBtnActive: {
    backgroundColor: "#131b2e",
    borderColor: "#131b2e",
  },
  filterBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  filterBadgeText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#ffffff",
  },
  activePillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  activePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 9999,
  },
  activePillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb",
  },
});
