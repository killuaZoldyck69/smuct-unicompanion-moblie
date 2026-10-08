// src/screens/notices/components/notice-search-bar.tsx
import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";

interface Props {
  searchQuery: string;
  onChangeSearchQuery: (query: string) => void;
  isFiltersVisible: boolean;
  onToggleFilters: () => void;
  hasActiveFilter: boolean;
}

export const NoticeSearchBar = React.memo(function NoticeSearchBar({
  searchQuery,
  onChangeSearchQuery,
  isFiltersVisible,
  onToggleFilters,
  hasActiveFilter,
}: Props) {
  return (
    <View style={styles.container}>
      {/* 1. Main Search Input Box */}
      <View style={styles.inputWrapper}>
        <Feather
          name="search"
          size={16}
          color={NOTICE_COLORS.subtleText}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Search notices by keyword, title..."
          placeholderTextColor={NOTICE_COLORS.subtleText}
          value={searchQuery}
          onChangeText={onChangeSearchQuery}
          returnKeyType="search"
          accessible={true}
          accessibilityLabel="Search notices input"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeSearchQuery("")}
            style={styles.clearBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search text"
            activeOpacity={0.7}
          >
            <Feather
              name="x-circle"
              size={16}
              color={NOTICE_COLORS.subtleText}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* 2. Filter Icon Button */}
      <TouchableOpacity
        onPress={onToggleFilters}
        style={[
          styles.filterBtn,
          hasActiveFilter && styles.filterBtnActive,
          !hasActiveFilter && isFiltersVisible && styles.filterBtnToggled,
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Filter notices by category"
        activeOpacity={0.8}
      >
        <Feather
          name="filter"
          size={18}
          color={
            hasActiveFilter
              ? NOTICE_COLORS.white
              : isFiltersVisible
                ? NOTICE_COLORS.deepNavy
                : NOTICE_COLORS.subtleText
          }
        />
        {hasActiveFilter && <View style={styles.activeDot} />}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: NOTICE_COLORS.white,
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    ...NOTICE_COLORS.shadow,
  },
  searchIcon: {
    marginRight: 9,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 13.5,
    color: NOTICE_COLORS.neutralText,
    padding: 0,
    height: "100%",
  },
  clearBtn: {
    padding: 4,
    marginLeft: 6,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: NOTICE_COLORS.white,
    borderWidth: 1,
    borderColor: NOTICE_COLORS.mutedBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...NOTICE_COLORS.shadow,
  },
  filterBtnActive: {
    backgroundColor: NOTICE_COLORS.deepNavy,
    borderColor: NOTICE_COLORS.deepNavy,
  },
  filterBtnToggled: {
    borderColor: "rgba(19, 27, 46, 0.2)",
    backgroundColor: "#f8fafc",
  },
  activeDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#38bdf8",
  },
});
