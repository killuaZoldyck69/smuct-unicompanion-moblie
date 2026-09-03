import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { format12HourTime } from "@/utils/date-formatter";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatBloodGroup } from "../utils";

interface BloodPostCardProps {
  item: any;
}

export const BloodPostCard = React.memo(function BloodPostCard({
  item,
}: BloodPostCardProps) {
  const router = useRouter();
  const formattedGroup = formatBloodGroup(item.bloodGroup);
  const isUrgent = item.urgency === "High" && !item.isFulfilled;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/blood/${item.id}`)}
      activeOpacity={0.85}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Blood request for ${formattedGroup}, Patient: ${
        item.patientName
      }, Location: ${item.location}. Tap to view details.`}
    >
      <View style={styles.headerRow}>
        <View style={styles.bloodBadgePill}>
          <Feather
            name="droplet"
            size={12}
            color="#ffffff"
            style={{ marginRight: 4 }}
          />
          <Text style={styles.bloodBadgeText}>{formattedGroup}</Text>
        </View>

        <View style={styles.statusPillsRow}>
          {isUrgent ? (
            <View style={styles.urgentChip}>
              <View style={styles.pulseDot} />
              <Text style={styles.urgentChipText}>URGENT</Text>
            </View>
          ) : item.isFulfilled ? (
            <View style={styles.fulfilledChip}>
              <Text style={styles.fulfilledChipText}>FULFILLED</Text>
            </View>
          ) : null}

          <Text style={styles.timeText}>
            {format12HourTime(item.createdAt)}
          </Text>
        </View>
      </View>

      <Text style={styles.patientNameText} numberOfLines={1}>
        Patient: {item.patientName}
      </Text>

      {item.patientCondition ? (
        <Text style={styles.conditionText} numberOfLines={1}>
          Condition: {item.patientCondition}
        </Text>
      ) : null}

      <View style={styles.locationPillRow}>
        <Feather
          name="map-pin"
          size={12}
          color={BENTO_COLORS.subtleText}
          style={{ marginRight: 5 }}
        />
        <Text style={styles.locationPillText} numberOfLines={1}>
          {item.location}
        </Text>
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.footerRow}>
        <View style={styles.authorBox}>
          {item.author?.image ? (
            <Image
              source={{ uri: item.author.image }}
              style={styles.authorAvatar}
              accessible={true}
              accessibilityLabel={`${item.author.name || "Author"}'s avatar`}
            />
          ) : (
            <View style={styles.authorAvatarFallback}>
              <Text style={styles.authorAvatarText}>
                {item.author?.name?.charAt(0) || "U"}
              </Text>
            </View>
          )}
          <Text style={styles.authorNameText} numberOfLines={1}>
            Posted by {item.author?.name?.split(" ")[0] || "Member"}
          </Text>
        </View>

        <View style={styles.donorsCountPill}>
          <Feather
            name="users"
            size={11}
            color={BENTO_COLORS.crimson}
            style={{ marginRight: 4 }}
          />
          <Text style={styles.donorsCountText}>
            {item._count?.responses || 0} Volunteer
            {(item._count?.responses || 0) === 1 ? "" : "s"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  bloodBadgePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.crimson,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  bloodBadgeText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  statusPillsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urgentChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BENTO_COLORS.crimson,
    marginRight: 5,
  },
  urgentChipText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
    letterSpacing: 0.5,
  },
  fulfilledChip: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  fulfilledChipText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
  },
  patientNameText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    marginBottom: 4,
  },
  conditionText: {
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.subtleText,
    marginBottom: 8,
  },
  locationPillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 12,
  },
  locationPillText: {
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.subtleText,
    flex: 1,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  authorAvatarFallback: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
  },
  authorNameText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO_COLORS.subtleText,
    flex: 1,
  },
  donorsCountPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  donorsCountText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
});
