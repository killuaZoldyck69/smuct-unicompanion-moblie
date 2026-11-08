import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { THEME, fontFamily, titleFontFamily } from "../constants";

interface DirectoryHeaderProps {
  searchQuery: string;
  debouncedSearch: string;
  onSearchChange: (text: string) => void;
  onClearSearch: () => void;
  onOpenFilter: () => void;
  hasActiveFilters: boolean;
  totalCount?: number;
  onBack?: () => void;
  isModal?: boolean;
}

export const DirectoryHeader = React.memo(
  ({
    searchQuery,
    debouncedSearch,
    onSearchChange,
    onClearSearch,
    onOpenFilter,
    hasActiveFilters,
    totalCount,
  }: DirectoryHeaderProps) => {
    return (
      <View style={styles.header}>
        {/* Top Titles Block without Back Button */}
        <View style={styles.headerTitlesContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle}>Faculty Directory</Text>
            {typeof totalCount === "number" && totalCount > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>{totalCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.screenSubtitle}>
            Find and connect with professors at SMUCT
          </Text>
        </View>

        {/* Integrated Search & Sliders Filter Bar */}
        <View style={styles.searchBarContainer}>
          <Feather
            name="search"
            size={19}
            color={THEME.textMuted}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, or email..."
            placeholderTextColor={THEME.textMuted}
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCorrect={false}
            autoCapitalize="none"
            accessible={true}
            accessibilityLabel="Search faculty members by name, teacher ID, or email"
          />

          {searchQuery !== debouncedSearch ? (
            <ActivityIndicator
              size="small"
              color={THEME.primary}
              style={{ marginRight: 6 }}
            />
          ) : searchQuery.length > 0 ? (
            <TouchableOpacity
              onPress={onClearSearch}
              style={styles.clearSearchBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Clear search text"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name="x-circle" size={17} color={THEME.textMuted} />
            </TouchableOpacity>
          ) : null}

          <TouchableOpacity
            onPress={onOpenFilter}
            style={styles.slidersButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Filter faculty by department"
            activeOpacity={0.75}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather
              name="sliders"
              size={18}
              color={hasActiveFilters ? THEME.primary : THEME.textSecondary}
            />
            {hasActiveFilters && (
              <View
                style={[
                  styles.filterBadgeDot,
                  { backgroundColor: THEME.primary },
                ]}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitlesContainer: {
    alignItems: "flex-start",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  screenTitle: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  headerTitle: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: THEME.textPrimary,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  countBadge: {
    backgroundColor: THEME.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DDD6FE",
  },
  countBadgeText: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_700Bold",
      default: "Onest_700Bold",
    }),
    fontSize: 11,
    fontWeight: "800",
    color: THEME.primary,
  },
  screenSubtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  headerSubtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    color: THEME.textSecondary,
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  searchBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: THEME.inputBg,
    borderRadius: 18,
    paddingHorizontal: 14,
    height: 52,
    marginTop: 14,
    borderWidth: 1,
    borderColor: THEME.inputBorder,
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: THEME.textPrimary,
    fontWeight: "500",
  },
  clearSearchBtn: {
    padding: 6,
    marginRight: 2,
  },
  slidersButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    position: "relative",
  },
  filterBadgeDot: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
