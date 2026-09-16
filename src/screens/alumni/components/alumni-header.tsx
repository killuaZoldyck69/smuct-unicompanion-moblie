import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO_COLORS, fontFamily } from "../constants";

interface AlumniHeaderProps {
  totalCount?: number;
  onBack: () => void;
}

export const AlumniHeader: React.FC<AlumniHeaderProps> = React.memo(
  ({ totalCount, onBack }) => {
    return (
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.headerIconButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          activeOpacity={0.7}
        >
          <Feather name="arrow-left" size={22} color={BENTO_COLORS.deepNavy} />
        </TouchableOpacity>

        <View style={styles.headerTitlesContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.screenTitle} numberOfLines={1}>
              Alumni Network
            </Text>
            {typeof totalCount === "number" && totalCount > 0 ? (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{totalCount}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.screenSubtitle} numberOfLines={1}>
            Connect with SMUCT graduates & industry leaders
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: BENTO_COLORS.background,
  },
  headerIconButton: {
    width: 42,
    height: 42,
    borderRadius: BENTO_COLORS.pillRadius,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerTitlesContainer: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: "#eff6ff",
    borderColor: "rgba(37, 99, 235, 0.2)",
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: BENTO_COLORS.pillRadius,
    marginLeft: 6,
  },
  countText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 1,
  },
  headerSpacer: {
    width: 42,
    height: 42,
  },
});
