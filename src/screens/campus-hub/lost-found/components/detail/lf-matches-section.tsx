import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
} from "@/screens/campus-hub/shared/design-tokens";
import type { LostFoundPost } from "@/services/lost-found-service";

interface LFMatchesSectionProps {
  matches: LostFoundPost[];
  isLoading: boolean;
  onSelectMatch: (id: string) => void;
  postType: "LOST" | "FOUND";
}

const ACCENT = CAMPUS_HUB_COLORS.lostFoundAccent;

export function LFMatchesSection({
  matches,
  isLoading,
  onSelectMatch,
  postType,
}: LFMatchesSectionProps) {
  if (isLoading || matches.length === 0) {
    return null;
  }

  const isLost = postType === "LOST";
  const title = isLost
    ? "Potential Matches Found on Campus"
    : "Potential Owners Searching for This";

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircle}>
          <Feather name="zap" size={14} color="#b45309" />
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countBadgeText}>{matches.length}</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollList}
      >
        {matches.map((item) => {
          const hasImage = Boolean(item.images?.[0]);
          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => onSelectMatch(item.id)}
              activeOpacity={0.85}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Potential match: ${item.title}`}
            >
              <View style={styles.thumbWrapper}>
                {hasImage ? (
                  <Image source={{ uri: item.images[0] }} style={styles.thumb} />
                ) : (
                  <View style={styles.thumbPlaceholder}>
                    <Feather
                      name={item.type === "LOST" ? "search" : "gift"}
                      size={20}
                      color={CAMPUS_HUB_COLORS.subtleText}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.typeTag,
                    {
                      backgroundColor:
                        item.type === "LOST"
                          ? CAMPUS_HUB_COLORS.lostRoseBg
                          : CAMPUS_HUB_COLORS.foundTealBg,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.typeTagText,
                      {
                        color:
                          item.type === "LOST"
                            ? CAMPUS_HUB_COLORS.lostRoseText
                            : CAMPUS_HUB_COLORS.foundTealText,
                      },
                    ]}
                  >
                    {item.type}
                  </Text>
                </View>
              </View>

              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                {!!item.location && (
                  <View style={styles.locationRow}>
                    <Feather name="map-pin" size={11} color="#dc2626" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {item.location}
                    </Text>
                  </View>
                )}

                <View style={styles.footerRow}>
                  <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
                  <View style={styles.viewLink}>
                    <Text style={styles.viewLinkText}>View</Text>
                    <Feather name="chevron-right" size={12} color={ACCENT} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  countBadge: {
    backgroundColor: "#fde68a",
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#92400e",
  },
  scrollList: {
    gap: 12,
    paddingRight: 16,
  },
  card: {
    width: 200,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  thumbWrapper: {
    width: "100%",
    height: 110,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  thumb: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  typeTag: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeTagText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
  },
  cardInfo: {
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 17,
    minHeight: 34,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    flex: 1,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
  },
  timeText: {
    fontFamily,
    fontSize: 10,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  viewLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewLinkText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: ACCENT,
  },
});

