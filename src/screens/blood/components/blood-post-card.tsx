import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import Svg, { Defs, LinearGradient, Stop, Rect } from "react-native-svg";
import { useRouter } from "expo-router";
import { formatCardDateTime } from "@/utils/date-formatter";
import { BENTO_COLORS, fontFamily } from "../constants";
import { formatBloodGroupSymbol, getAuthorRoleAndDept } from "../utils";

interface BloodPostCardProps {
  item: any;
  isAdmin?: boolean;
  isAuthor?: boolean;
  onResolve?: (item: any) => void;
  onDelete?: (item: any) => void;
}

const getAuthorInitials = (name?: string): string => {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const BloodPostCard = React.memo(function BloodPostCard({
  item,
  isAdmin = false,
  isAuthor = false,
  onResolve,
  onDelete,
}: BloodPostCardProps) {
  const router = useRouter();
  const canManage = isAdmin || isAuthor;
  const bloodSymbol = formatBloodGroupSymbol(item.bloodGroup);
  const isUrgent = item.urgency === "High" && !item.isFulfilled;
  const isFulfilled = !!item.isFulfilled;
  const volunteerCount = item._count?.responses ?? item.responses?.length ?? 0;
  const bagsNeeded = item.bagsNeeded || 1;
  const authorSubtitle = getAuthorRoleAndDept(item.author);

  const handleCardPress = () => {
    const targetUrl = isAdmin
      ? `/blood/${item.id}?from=admin`
      : `/blood/${item.id}`;
    router.push(targetUrl as any);
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isUrgent && styles.cardUrgent,
        isFulfilled && styles.cardFulfilled,
      ]}
      onPress={handleCardPress}
      activeOpacity={0.88}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Blood request for ${bloodSymbol}, ${bagsNeeded} ${
        bagsNeeded === 1 ? "bag" : "bags"
      } needed, Patient: ${item.patientName}, ${
        item.patientCondition ? `Condition: ${item.patientCondition}, ` : ""
      }Location: ${item.location}. Tap to view details.`}
    >
      {/* Background Watermark Heart Outline */}
      <Feather
        name="heart"
        size={110}
        color={isFulfilled ? "#059669" : "#e11d48"}
        style={styles.watermarkHeart}
        pointerEvents="none"
      />

      {/* Top Accent Gradient Bar for Urgent Requests */}
      {isUrgent && (
        <View style={styles.urgentTopBar} pointerEvents="none">
          <Svg height="4" width="100%">
            <Defs>
              <LinearGradient id={`urgentTopGrad_${item.id}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor="#e11d48" />
                <Stop offset="40%" stopColor="#f43f5e" />
                <Stop offset="75%" stopColor="#f97316" />
                <Stop offset="100%" stopColor="#f59e0b" />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="4" fill={`url(#urgentTopGrad_${item.id})`} />
          </Svg>
        </View>
      )}

      {/* 1. TOP METADATA ROW */}
      <View style={styles.topRow}>
        <View style={styles.topLeftGroup}>
          {isUrgent ? (
            <View style={styles.urgentBadge}>
              <View style={styles.urgentDot} />
              <Text style={styles.urgentBadgeText}>URGENT</Text>
            </View>
          ) : isFulfilled ? (
            <View style={styles.fulfilledBadge}>
              <Feather
                name="check"
                size={11}
                color="#ffffff"
                style={{ marginRight: 3 }}
              />
              <Text style={styles.fulfilledBadgeText}>FULFILLED</Text>
            </View>
          ) : null}

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
              {bagsNeeded} {bagsNeeded === 1 ? "Bag Needed" : "Bags Needed"}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. PATIENT & BLOOD GROUP SECTION */}
      <View style={styles.patientRow}>
        {/* Prominent Blood Group Squircle */}
        <View
          style={[
            styles.bloodSquircle,
            isFulfilled && styles.bloodSquircleFulfilled,
          ]}
        >
          <Feather name="droplet" size={15} color="#ffffff" />
          <Text style={styles.bloodSquircleText}>{bloodSymbol}</Text>
        </View>

        {/* Patient Name, Condition, & Location */}
        <View style={styles.patientDetailsCol}>
          <View style={styles.patientTitleRow}>
            <Text style={styles.patientName} numberOfLines={1}>
              {item.patientName}
            </Text>

            {item.patientCondition || isUrgent ? (
              <View
                style={[
                  styles.conditionPill,
                  isFulfilled && styles.conditionPillFulfilled,
                ]}
              >
                <Text
                  style={[
                    styles.conditionPillText,
                    isFulfilled && styles.conditionPillTextFulfilled,
                  ]}
                  numberOfLines={1}
                >
                  {item.patientCondition
                    ? isUrgent
                      ? `${item.patientCondition} • Critical`
                      : item.patientCondition
                    : "Critical Case"}
                </Text>
              </View>
            ) : null}
          </View>

          {/* Hospital / Location */}
          <View style={styles.locationRow}>
            <Feather
              name="map-pin"
              size={13}
              color={isFulfilled ? "#059669" : "#e11d48"}
              style={styles.locationIcon}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.location}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. SUBTLE DIVIDER */}
      <View
        style={[styles.divider, isFulfilled && styles.dividerFulfilled]}
      />

      {/* 4. REQUESTER & VOLUNTEER PARTICIPATION */}
      <View style={styles.requesterRow}>
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
                {getAuthorInitials(item.author?.name)}
              </Text>
            </View>
          )}

          <View style={styles.authorMeta}>
            <Text style={styles.authorNameText} numberOfLines={1}>
              {item.author?.name || "Campus Member"}
            </Text>
            {authorSubtitle ? (
              <Text style={styles.authorSubtitleText} numberOfLines={1}>
                {authorSubtitle}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Volunteer Count Pill & Posted Time */}
        <View style={styles.volunteerCol}>
          <View
            style={[
              styles.volunteerPill,
              isFulfilled && styles.volunteerPillFulfilled,
            ]}
          >
            <Text
              style={[
                styles.volunteerPillText,
                isFulfilled && styles.volunteerPillTextFulfilled,
              ]}
            >
              {volunteerCount} {volunteerCount === 1 ? "Volunteer" : "Volunteers"}
            </Text>
          </View>
          {item.createdAt ? (
            <View style={styles.postedTimeRow}>
              <Feather name="clock" size={10} color="#8a95a5" style={{ marginRight: 3 }} />
              <Text style={styles.postedTimeText} numberOfLines={1}>
                {formatCardDateTime(item.createdAt)}
              </Text>
            </View>
          ) : null}
        </View>
      </View>



      {/* 6. ADMIN / AUTHOR ACTIONS BAR */}
      {canManage && (
        <View style={styles.adminActionBar}>
          {!isFulfilled && onResolve && (
            <TouchableOpacity
              style={styles.adminResolveBtn}
              onPress={() => onResolve(item)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Mark blood request as fulfilled"
            >
              <Feather
                name="check-circle"
                size={13}
                color="#ffffff"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.adminResolveBtnText}>Mark Fulfilled</Text>
            </TouchableOpacity>
          )}

          {onDelete && (
            <TouchableOpacity
              style={styles.adminDeleteBtn}
              onPress={() => onDelete(item)}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Delete blood request"
            >
              <Feather
                name="trash-2"
                size={13}
                color={BENTO_COLORS.crimson}
                style={{ marginRight: 5 }}
              />
              <Text style={styles.adminDeleteBtnText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff6f7",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: "#fecdd3",
    position: "relative",
    overflow: "hidden",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardUrgent: {
    borderWidth: 2,
    borderColor: "#fb7185",
    shadowColor: "#e11d48",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 3,
  },
  urgentTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    zIndex: 10,
  },
  cardFulfilled: {
    backgroundColor: "#f7fdf9",
    borderColor: "#bbf7d0",
  },
  watermarkHeart: {
    position: "absolute",
    right: -12,
    bottom: -15,
    opacity: 0.06,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  topLeftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  urgentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
  },
  urgentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    marginRight: 5,
  },
  urgentBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  fulfilledBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 14,
  },
  fulfilledBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
  },
  bagsBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.12)",
  },
  bagsBadgeFulfilled: {
    backgroundColor: "#dcfce7",
    borderColor: "rgba(5, 150, 105, 0.15)",
  },
  bagsBadgeText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#991b1b",
  },
  bagsBadgeTextFulfilled: {
    color: "#059669",
  },
  timestampText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#947880",
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 2,
  },
  bloodSquircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#d91b42",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#d91b42",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  bloodSquircleFulfilled: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
  },
  bloodSquircleText: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: "#ffffff",
    marginTop: 1,
    lineHeight: 18,
  },
  patientDetailsCol: {
    flex: 1,
    justifyContent: "center",
  },
  patientTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 3,
  },
  patientName: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
  },
  conditionPill: {
    backgroundColor: "#fce7ea",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
  },
  conditionPillFulfilled: {
    backgroundColor: "#dcfce7",
  },
  conditionPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#be123c",
  },
  conditionPillTextFulfilled: {
    color: "#059669",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  locationIcon: {
    marginRight: 4,
  },
  locationText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(225, 29, 72, 0.08)",
    marginVertical: 12,
  },
  dividerFulfilled: {
    backgroundColor: "rgba(5, 150, 105, 0.1)",
  },
  requesterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  authorSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    flex: 1,
    marginRight: 8,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a",
  },
  authorAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    alignItems: "center",
    justifyContent: "center",
  },
  authorAvatarFallbackText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: "#ffffff",
  },
  authorMeta: {
    flex: 1,
    justifyContent: "center",
  },
  authorNameText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0f172a",
  },
  authorSubtitleText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 1.5,
  },
  volunteerCol: {
    alignItems: "flex-end",
    gap: 3.5,
  },
  volunteerPill: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#fecdd3",
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 14,
  },
  volunteerPillFulfilled: {
    borderColor: "#a7f3d0",
  },
  volunteerPillText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "700",
    color: "#be123c",
  },
  volunteerPillTextFulfilled: {
    color: "#059669",
  },
  postedTimeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  postedTimeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: "#8a95a5",
    letterSpacing: -0.1,
  },
  actionButton: {
    backgroundColor: "#d91b42",
    borderRadius: 24,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    shadowColor: "#d91b42",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 3,
  },
  actionButtonFulfilled: {
    backgroundColor: "#059669",
    shadowColor: "#059669",
  },
  actionButtonText: {
    fontFamily,
    fontSize: 14.5,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  adminActionBar: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(225, 29, 72, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  adminResolveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#059669",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    ...BENTO_COLORS.shadow,
  },
  adminResolveBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  adminDeleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(190, 18, 60, 0.2)",
  },
  adminDeleteBtnText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
});
