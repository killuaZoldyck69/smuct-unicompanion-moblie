import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CAMPUS_HUB_COLORS, fontFamily, timeAgo } from "@/screens/campus-hub/shared/design-tokens";
import { TypeBadge } from "@/screens/campus-hub/lost-found/components/status-badge";
import type { LostFoundPost } from "@/services/lost-found-service";

interface LFPossibleMatchesProps {
  matches: LostFoundPost[];
  isLost: boolean;
  onPressMatch: (id: string) => void;
}

export function LFPossibleMatches({
  matches,
  isLost,
  onPressMatch,
}: LFPossibleMatchesProps) {
  if (!matches.length) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Feather name="zap" size={16} color="#d97706" />
        </View>
        <View style={styles.textCol}>
          <Text style={styles.title}>Possible Matching Listings</Text>
          <Text style={styles.subtitle}>
            Could this be the counterpart {isLost ? "found" : "lost"} on campus?
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {matches.slice(0, 2).map((match) => (
          <TouchableOpacity
            key={match.id}
            style={styles.matchItem}
            onPress={() => onPressMatch(match.id)}
            activeOpacity={0.8}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`View possible match: ${match.title}`}
          >
            {match.images?.[0] ? (
              <Image source={{ uri: match.images[0] }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Feather name="tag" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
              </View>
            )}

            <View style={styles.info}>
              <View style={styles.infoTop}>
                <TypeBadge type={match.type} />
                <Text style={styles.time}>{timeAgo(match.createdAt)}</Text>
              </View>
              <Text style={styles.matchTitle} numberOfLines={1}>{match.title}</Text>
              <View style={styles.locRow}>
                <Feather name="map-pin" size={10} color={CAMPUS_HUB_COLORS.subtleText} />
                <Text style={styles.loc} numberOfLines={1}>{match.location}</Text>
              </View>
            </View>

            <Feather name="chevron-right" size={16} color={CAMPUS_HUB_COLORS.subtleText} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
  },
  title: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  list: {
    gap: 8,
  },
  matchItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CAMPUS_HUB_COLORS.surfaceMuted,
    borderRadius: 14,
    padding: 10,
    gap: 10,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
  },
  thumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  infoTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  matchTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loc: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  time: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
});
