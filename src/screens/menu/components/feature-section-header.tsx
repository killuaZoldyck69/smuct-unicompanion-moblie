import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

const SECTION_META: Record<
  string,
  { label: string; subtitle: string; accentColor: string; accentBg: string }
> = {
  ACADEMIC: {
    label: "ACADEMIC",
    subtitle: "Tools for your semester & studies",
    accentColor: "#3b63d9",
    accentBg: "rgba(59, 99, 217, 0.08)",
  },
  CAMPUS: {
    label: "CAMPUS",
    subtitle: "Services happening around campus",
    accentColor: "#0e9f7e",
    accentBg: "rgba(14, 159, 126, 0.08)",
  },
  SUPPORT: {
    label: "SUPPORT",
    subtitle: "Community, aid & grievances",
    accentColor: "#e25c5c",
    accentBg: "rgba(226, 92, 92, 0.08)",
  },
  ADMIN: {
    label: "ADMINISTRATION",
    subtitle: "Management & moderation tools",
    accentColor: "#6d4fc2",
    accentBg: "rgba(109, 79, 194, 0.08)",
  },
};

const FALLBACK = {
  label: "SERVICES",
  subtitle: "Campus services",
  accentColor: "#64748b",
  accentBg: "rgba(100, 116, 139, 0.08)",
};

interface FeatureSectionHeaderProps {
  category: string;
  isFirst?: boolean;
}

export const FeatureSectionHeader = React.memo(function FeatureSectionHeader({
  category,
  isFirst = false,
}: FeatureSectionHeaderProps) {
  const meta = SECTION_META[category] ?? FALLBACK;

  return (
    <View style={[styles.container, isFirst && styles.containerFirst]}>
      {/* Pill tag + label row */}
      <View style={styles.labelRow}>
        <View style={[styles.pill, { backgroundColor: meta.accentBg }]}>
          <View
            style={[styles.pillDot, { backgroundColor: meta.accentColor }]}
          />
          <Text style={[styles.label, { color: meta.accentColor }]}>
            {meta.label}
          </Text>
        </View>
      </View>
      <Text style={styles.subtitle}>{meta.subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 10,
  },
  containerFirst: {
    paddingTop: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 6,
  },
  pillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
  },
  subtitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "400",
    color: "#64748b",
    lineHeight: 18,
    marginTop: 1,
  },
});
