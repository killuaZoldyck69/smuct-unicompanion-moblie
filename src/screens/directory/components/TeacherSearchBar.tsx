import React from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { DIRECTORY_COLORS, fontFamily } from "../constants";

interface TeacherSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  isSearching?: boolean;
  placeholder?: string;
}

export const TeacherSearchBar = React.memo(function TeacherSearchBar({
  value,
  onChangeText,
  onClear,
  isSearching = false,
  placeholder = "Search by name, teacher ID, email...",
}: TeacherSearchBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Feather
          name="search"
          size={18}
          color={DIRECTORY_COLORS.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={DIRECTORY_COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="never"
          accessible={true}
          accessibilityRole="search"
          accessibilityLabel="Search faculty members"
          accessibilityHint="Type to filter teachers by name, ID, or email"
        />

        {isSearching ? (
          <ActivityIndicator
            size="small"
            color={DIRECTORY_COLORS.blueBadge}
            style={styles.loader}
          />
        ) : value.length > 0 ? (
          <TouchableOpacity
            onPress={onClear}
            style={styles.clearBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Clear search input"
          >
            <Feather
              name="x-circle"
              size={18}
              color={DIRECTORY_COLORS.textSecondary}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: DIRECTORY_COLORS.surface,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: DIRECTORY_COLORS.surfaceMuted,
    borderRadius: DIRECTORY_COLORS.innerRadius,
    borderWidth: 1,
    borderColor: DIRECTORY_COLORS.cardBorder,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: DIRECTORY_COLORS.textPrimary,
    paddingVertical: 8,
  },
  loader: {
    marginLeft: 6,
  },
  clearBtn: {
    padding: 2,
    marginLeft: 6,
  },
});
