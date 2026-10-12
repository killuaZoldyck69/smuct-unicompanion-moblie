import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { CampusLogoSvg } from "./campus-logo-svg";
import { SPLASH_COLORS, SPLASH_STRINGS } from "../constants";

interface BrandHeaderProps {
  title?: string;
  subtitle?: string;
}

export const BrandHeader = React.memo(function BrandHeader({
  title = SPLASH_STRINGS.TITLE,
  subtitle = SPLASH_STRINGS.SUBTITLE,
}: BrandHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <CampusLogoSvg size={92} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    marginTop: 4,
  },
  logoContainer: {
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.6,
    color: SPLASH_COLORS.titleText,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16.5,
    fontWeight: "500",
    color: SPLASH_COLORS.subtitleText,
    textAlign: "center",
    lineHeight: 23,
  },
});
