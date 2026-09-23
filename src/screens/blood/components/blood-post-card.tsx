import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { formatCardDateTime } from "@/utils/date-formatter";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatBloodGroupSymbol, getUserAcademicSubtitle } from "../utils";

interface BloodPostCardProps {
  item: any;
}

export const BloodPostCard = React.memo(function BloodPostCard({
  item,
}: BloodPostCardProps) {
  const router = useRouter();
  const bloodSymbol = formatBloodGroupSymbol(item.bloodGroup);
  const isUrgent = item.urgency === "High" && !item.isFulfilled;
  const isFulfilled = !!item.isFulfilled;
  const authorSubtitle = getUserAcademicSubtitle(item.author);
  const volunteerCount = item._count?.responses ?? item.responses?.length ?? 0;
  const bagsNeeded = item.bagsNeeded || 1;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isUrgent && styles.cardUrgent,
        isFulfilled && styles.cardFulfilled,
      ]}
      onPress={() => router.push(`/blood/${item.id}`)}
      activeOpacity={0.88}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Blood request for ${bloodSymbol}, ${bagsNeeded} ${
        bagsNeeded === 1 ? "bag" : "bags"
      } needed, Patient: ${item.patientName}, ${
        item.patientCondition ? `Condition: ${item.patientCondition}, ` : ""
      }Location: ${item.location}. Tap to view details.`}
    >
      {/* 1. TOP METADATA ROW */}
      <View style={styles.topRow}>
        <View style={styles.topLeftGroup}>
          <View
            style={[
              styles.bloodBadge,
              isFulfilled
                ? styles.bloodBadgeFulfilled
                : isUrgent
                ? styles.bloodBadgeUrgent
                : styles.bloodBadgeNormal,
            ]}
          >
            <Feather
              name="droplet"
              size={12}
              color="#ffffff"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.bloodBadgeText}>{bloodSymbol}</Text>
          </View>

          <View
            style={[
              styles.bagsBadge,
              isFulfilled && styles.bagsBadgeFulfilled,
            ]}
          >
            <Text
              style={[
                styles.bagsBadgeText,
                isFulfilled && styles.bagsBadgeTextFulfilled,
              ]}
            >
              {bagsNeeded} {bagsNeeded === 1 ? "Bag" : "Bags"}
            </Text>
          </View>
        </View>

        <View style={styles.topRightGroup}>
          {isUrgent ? (
            <View style={styles.urgentPill}>
              <View style={styles.urgentDot} />
              <Text style={styles.urgentPillText}>URGENT</Text>
            </View>
          ) : isFulfilled ? (
            <View style={styles.fulfilledPill}>
              <Feather
                name="check"
                size={11}
                color="#059669"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.fulfilledPillText}>FULFILLED</Text>
            </View>
          ) : null}

          <Text style={styles.timestampText}>
            {formatCardDateTime(item.createdAt)}
          </Text>
        </View>
      </View>

      {/* 2. PATIENT INFORMATION */}
      <View style={styles.patientSection}>
        <Text style={styles.patientName} numberOfLines={1}>
          {item.patientName}
        </Text>
        {item.patientCondition ? (
          <Text style={styles.conditionText} numberOfLines={1}>
            {item.patientCondition}
          </Text>
        ) : null}
      </View>

      {/* 3. LOCATION */}
      <View style={styles.locationRow}>
        <Feather
          name="map-pin"
          size={13}
          color={BENTO_COLORS.subtleText}
          style={styles.locationIcon}
        />
        <Text style={styles.locationText} numberOfLines={1}>
          {item.location}
        </Text>
      </View>

      {/* 4. SUBTLE DIVIDER */}
      <View style={styles.divider} />

      {/* 5. REQUESTER AREA & VOLUNTEER PARTICIPATION */}
      <View style={styles.footerRow}>
        <View style={styles.authorSection}>
          {item.author?.image ? (
            <Image
              source={{ uri: item.author.image }}
              style={styles.authorAvatar}
              accessible={true}
              accessibilityLabel={`${item.author.name || "Requester"}'s avatar`}
            />
          ) : (
            <View style={styles.authorAvatarFallback}>
              <Text style={styles.authorAvatarFallbackText}>
                {item.author?.name?.trim()?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View style={styles.authorMeta}>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author?.name || "Campus Member"}
            </Text>
            {authorSubtitle ? (
              <Text style={styles.authorDept} numberOfLines={1}>
                {authorSubtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* VOLUNTEER STATUS - Distinct from Urgent Red */}
        <View
          style={[
            styles.volunteerPill,
            isFulfilled && styles.volunteerPillFulfilled,
          ]}
        >
          <Feather
            name="users"
            size={12}
            color={isFulfilled ? "#059669" : "#475569"}
            style={{ marginRight: 5 }}
          />
          <Text
            style={[
              styles.volunteerPillText,
              isFulfilled && styles.volunteerPillTextFulfilled,
            ]}
          >
            {volunteerCount} {volunteerCount === 1 ? "Volunteer" : "Volunteers"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...BENTO_COLORS.shadow,
  },
  cardUrgent: {
    borderColor: "rgba(190, 18, 60, 0.16)",
    borderLeftWidth: 3.5,
    borderLeftColor: BENTO_COLORS.crimson,
  },
  cardFulfilled: {
    backgroundColor: "#fafdfb",
    borderColor: "#bbf7d0",
    borderLeftWidth: 3.5,
    borderLeftColor: "#10b981",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 8,
  },
  topLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  bloodBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 10,
  },
  bloodBadgeNormal: {
    backgroundColor: "#e11d48",
  },
  bloodBadgeUrgent: {
    backgroundColor: BENTO_COLORS.crimson,
  },
  bloodBadgeFulfilled: {
    backgroundColor: "#059669",
  },
  bloodBadgeText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  bagsBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  bagsBadgeFulfilled: {
    backgroundColor: "#dcfce7",
    borderColor: "rgba(5, 150, 105, 0.15)",
  },
  bagsBadgeText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  bagsBadgeTextFulfilled: {
    color: "#059669",
  },
  topRightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urgentPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BENTO_COLORS.crimson,
    marginRight: 5,
  },
  urgentPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
    letterSpacing: 0.5,
  },
  fulfilledPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    borderWidth: 1,
    borderColor: "rgba(5, 150, 105, 0.15)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  fulfilledPillText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#059669",
    letterSpacing: 0.5,
  },
  timestampText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#94a3b8",
  },
  patientSection: {
    marginBottom: 8,
  },
  patientName: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
    letterSpacing: -0.2,
  },
  conditionText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "500",
    color: "#475569",
    marginTop: 3,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 5,
  },
  locationText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    marginVertical: 14,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
    marginRight: 10,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
  },
  authorAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarFallbackText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },
  authorMeta: {
    flex: 1,
  },
  authorName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  authorDept: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginTop: 1,
  },
  volunteerPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: BENTO_COLORS.pillRadius,
  },
  volunteerPillFulfilled: {
    backgroundColor: "#dcfce7",
  },
  volunteerPillText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
  },
  volunteerPillTextFulfilled: {
    color: "#059669",
  },
});
