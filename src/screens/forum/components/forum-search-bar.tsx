import React, { memo } from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface ForumSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}

export const ForumSearchBar = memo(function ForumSearchBar({
  value,
  onChangeText,
  onClear,
}: ForumSearchBarProps) {
  return (
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
  );
});

const styles = StyleSheet.create({
  searchBarWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.pillRadius,
    paddingHorizontal: 16,
    height: 48,
    marginBottom: 14,
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
});
