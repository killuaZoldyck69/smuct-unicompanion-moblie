// src/screens/notices/components/notice-summary-card.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { NOTICE_COLORS, fontFamily } from "../constants";
import { MegaphoneHeroSvg } from "./illustrations/megaphone-hero-svg";

interface Props {
  totalCount: number;
}

export const NoticeSummaryCard = React.memo(function NoticeSummaryCard({
  totalCount,
}: Props) {
  const countLabel =
    totalCount === 1 ? "1 Official Notice" : `${totalCount} Official Notices`;

  return (
    <View style={styles.card}>
      <View style={styles.contentLeft}>
        <View style={styles.badgeRow}>
          <View style={styles.megaphoneIconCircle}>
            <Feather name="volume-2" size={15} color="#0284c7" />
          </View>
          <Text style={styles.countText}>{countLabel}</Text>
        </View>

        <Text style={styles.descriptionText}>
          Stay updated with the latest university announcements.
        </Text>
      </View>

      <View style={styles.illustrationWrap} pointerEvents="none">
        <MegaphoneHeroSvg width={96} height={78} />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: NOTICE_COLORS.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(186, 230, 253, 0.45)",
    paddingLeft: 18,
    paddingRight: 12,
    paddingVertical: 14,
    marginBottom: 16,
    overflow: "hidden",
    position: "relative",
    ...NOTICE_COLORS.shadow,
  },
  contentLeft: {
    flex: 1,
    paddingRight: 10,
    zIndex: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  megaphoneIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  countText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: NOTICE_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  descriptionText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "500",
    color: NOTICE_COLORS.subtleText,
    lineHeight: 18,
  },
  illustrationWrap: {
    width: 96,
    height: 78,
    alignItems: "center",
    justifyContent: "center",
  },
});
