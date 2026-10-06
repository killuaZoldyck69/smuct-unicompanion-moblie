import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { BENTO, fontFamily } from "../constants";

interface AlumniHeaderProps {
  totalCount?: number;
  filteredCount?: number;
}

export const AlumniHeader: React.FC<AlumniHeaderProps> = React.memo(
  ({ totalCount = 0, filteredCount }) => {
    const displayCount =
      typeof filteredCount === "number" ? filteredCount : totalCount;

    return (
      <View style={styles.header}>
        {/* Left: Titles */}
        <View style={styles.headerTitleGroup}>
          <Text style={styles.screenTitle}>Alumni Network</Text>
          <Text style={styles.screenSubtitle}>
            {displayCount > 0
              ? `${displayCount} verified graduates`
              : "Connect with SMUCT graduates"}
          </Text>
        </View>

        {/* Right: Illustration */}
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: BENTO.canvas,
  },
  headerTitleGroup: {
    flex: 1,
    paddingTop: 6,
  },
  headerIllustrationWrap: {
    width: 120,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -12,
  },
  headerIllustration: {
    width: 200,
    height: 100,
    opacity: 0.8,
  },
  screenTitle: {
    fontFamily,
    fontSize: 24,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  screenSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    marginTop: 7,
    fontWeight: "500",
  },
});
