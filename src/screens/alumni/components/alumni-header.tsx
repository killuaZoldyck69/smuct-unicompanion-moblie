import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";

interface AlumniHeaderProps {
  totalCount?: number;
  filteredCount?: number;
  onBack: () => void;
}

export const AlumniHeader: React.FC<AlumniHeaderProps> = React.memo(
  ({ totalCount = 0, filteredCount, onBack }) => {
    const displayCount =
      typeof filteredCount === "number" ? filteredCount : totalCount;

    return (
      <View style={styles.header}>
        {/* Squircle Back Button */}
        <TouchableOpacity
          onPress={onBack}
          style={styles.squircleButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back to all features"
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="chevron-left" size={20} color={BENTO.navy} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.screenTitle}>Alumni Network</Text>

        {/* Right Section: Count */}
        <View style={styles.headerRight}>
          <Text style={styles.countText}>{displayCount} alumni</Text>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: BENTO.canvas,
  },
  squircleButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
    ...Platform.select({
      web: {
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
      } as any,
      default: {
        elevation: 1,
      },
    }),
  },
  screenTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
    marginLeft: 10,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  countText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: BENTO.slateLight,
  },
});


