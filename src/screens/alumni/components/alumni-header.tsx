import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";

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
    hasBackButton = false,
    onBackPress,
    isAdmin = false,
    title = "Alumni Network",
    subtitle,
    onAddPress,
    onCsvPress,
  }) => {
    const displayCount =
      typeof filteredCount === "number" ? filteredCount : totalCount;

    const defaultSubtitle =
      displayCount > 0
        ? `${displayCount} verified graduates`
        : "Connect with SMUCT graduates";

    return (
      <View style={styles.header}>
        {/* Left: Titles without back button & without admin badge tag */}
        <View style={styles.headerLeftCol}>
          <View style={styles.headerTitleGroup}>
            <Text style={styles.screenTitle}>{title}</Text>
            <Text style={styles.screenSubtitle}>
              {subtitle || defaultSubtitle}
            </Text>
          </View>
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
    paddingBottom: 8,
    backgroundColor: BENTO.canvas,
  },
  headerLeftCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleGroup: {
    flex: 1,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 4,
    fontWeight: "500",
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
