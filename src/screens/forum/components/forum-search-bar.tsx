import React, { memo } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface ForumSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onPressFilter?: () => void;
  activeFilterCount?: number;
}

export const ForumSearchBar = memo(function ForumSearchBar({
  value,
  onChangeText,
  onClear,
  onPressFilter,
  activeFilterCount = 0,
}: ForumSearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.searchBarWrapper}>
        <Feather
          name="search"
          size={16}
          color={BENTO_COLORS.subtleText}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search discussions by keyword..."
          placeholderTextColor={BENTO_COLORS.subtleText}
          value={value}
          onChangeText={onChangeText}
          accessible={true}
          accessibilityLabel="Search discussions"
          returnKeyType="search"
          clearButtonMode="never"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearBtn}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            activeOpacity={0.7}
          >
            <Feather name="x-circle" size={16} color={BENTO_COLORS.subtleText} />
          </TouchableOpacity>
        )}
      </View>

      {onPressFilter && (
        <TouchableOpacity
          style={[
            styles.filterIconButton,
            activeFilterCount > 0 && styles.filterIconButtonActive,
          ]}
          onPress={onPressFilter}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Filter discussions. ${activeFilterCount} active filters`}
        >
          <Feather
            name="sliders"
            size={18}
            color={activeFilterCount > 0 ? "#ffffff" : BENTO_COLORS.neutralText}
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.neutralText,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  filterIconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    ...BENTO_COLORS.shadow,
  },
  filterIconButtonActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  filterBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: "#ffffff",
  },
  filterBadgeText: {
    fontSize: 10,
    fontFamily,
    fontWeight: "800",
    color: "#ffffff",
  },
});
