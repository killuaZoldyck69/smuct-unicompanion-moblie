import React from "react";
import { View, Text, StyleSheet, Image, Platform } from "react-native";
import { BENTO, fontFamily, titleFontFamily } from "../constants";

interface AlumniHeaderProps {
  totalCount?: number;
  filteredCount?: number;
  hasBackButton?: boolean;
  onBackPress?: () => void;
  isAdmin?: boolean;
  title?: string;
  subtitle?: string;
  onAddPress?: () => void;
  onCsvPress?: () => void;
}

export const AlumniHeader: React.FC<AlumniHeaderProps> = React.memo(
  ({
    totalCount = 0,
    filteredCount,
    title = "Alumni Network",
    subtitle,
  }) => {
    const displayCount =
      typeof filteredCount === "number" ? filteredCount : totalCount;

    const defaultSubtitle =
      displayCount > 0
        ? `${displayCount} verified graduates`
        : "Connect with SMUCT graduates";

    return (
      <View style={styles.header}>
        {/* Left: Standard Header Titles */}
        <View style={styles.headerLeftCol}>
          <Text style={styles.screenTitle}>{title}</Text>
          <Text style={styles.screenSubtitle}>
            {subtitle || defaultSubtitle}
          </Text>
        </View>

        {/* Right: Header Illustration */}
        <View style={styles.headerIllustrationWrap} pointerEvents="none">
          <Image
            source={require("@/assets/header-bg-images/alumni-screen-bg.png")}
            style={styles.headerIllustration}
            resizeMode="contain"
            accessible={false}
          />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: BENTO.canvas,
  },
  headerLeftCol: {
    flex: 1,
    alignItems: "flex-start",
  },
  screenTitle: {
    fontFamily: Platform.select({
      web: "'Bricolage Grotesque', sans-serif",
      android: "BricolageGrotesque_800ExtraBold",
      default: "BricolageGrotesque_800ExtraBold",
    }),
    fontSize: 24,
    fontWeight: "800",
    color: BENTO.navy,
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
    color: BENTO.navy,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  screenSubtitle: {
    fontFamily: Platform.select({
      web: "'Onest', sans-serif",
      android: "Onest_500Medium",
      default: "Onest_500Medium",
    }),
    fontSize: 13,
    color: BENTO.slate,
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
    color: BENTO.slate,
    marginTop: 4,
    fontWeight: "500",
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  headerIllustrationWrap: {
    width: 100,
    height: 70,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIllustration: {
    width: 160,
    height: 90,
    opacity: 0.85,
  },
});
