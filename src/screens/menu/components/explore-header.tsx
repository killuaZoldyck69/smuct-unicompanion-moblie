import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { ElimysHeroEducationSvg } from "@/assets/icons/elimys-hero-education";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const deepNavy = "#131b2e";

interface ExploreHeaderProps {
  roleBadgeText: string;
}

export const ExploreHeader = React.memo(function ExploreHeader({
  roleBadgeText,
}: ExploreHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Left: Title + role badge */}
        <View style={styles.titleGroup}>
          <Text style={styles.title}>Explore Features</Text>
          <View style={styles.badgeRow}>
            <View style={styles.greenDot} />
            <Text style={styles.badgeText}>{roleBadgeText}</Text>
          </View>
        </View>

        {/* Right: Elimys hero education SVG illustration */}
        <View style={styles.illustrationWrap} pointerEvents="none">
          <ElimysHeroEducationSvg width={200} height={90} />
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    backgroundColor: "#f7f9fb",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
    paddingTop: 6,
  },
  title: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: deepNavy,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 7,
    gap: 6,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  badgeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "#64748b",
  },

  // ── Illustration ──────────────────────────────────────────
  illustrationWrap: {
    width: 116,
    height: 66,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -4,
  },
});
