import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
  formatDateTime,
  formatCampusUserSubtitle,
} from "@/screens/campus-hub/shared/design-tokens";
import { AvatarChip } from "@/screens/campus-hub/shared/avatar-chip";
import {
  TypeBadge,
  StatusBadge,
  CategoryBadge,
} from "@/screens/campus-hub/lost-found/components/status-badge";
import type { LostFoundPost } from "@/services/lost-found-service";
import type { AuthorProfileModalData } from "@/screens/campus-hub/shared/author-modal";

interface LFInfoCardProps {
  post: LostFoundPost;
  isAuthor: boolean;
  isAdmin?: boolean;
  isEdited: boolean;
  onViewAuthor: (author: AuthorProfileModalData) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LFInfoCard({
  post,
  isAuthor,
  isAdmin = false,
  isEdited,
  onViewAuthor,
  onEdit,
  onDelete,
}: LFInfoCardProps) {
  const isResolved = post.status === "RESOLVED" || post.status === "CLAIMED";
  const canManage = isAuthor || isAdmin;

  return (
    <View style={styles.card}>
      {/* Resolved banner */}
      {isResolved && (
        <View style={styles.resolvedBanner}>
          <Feather name="check-circle" size={16} color="#047857" />
          <Text style={styles.resolvedBannerText}>Item Successfully Handed Over</Text>
        </View>
      )}

      {/* Badges */}
      <View style={styles.badgeRow}>
        <TypeBadge type={post.type} />
        {post.category && <CategoryBadge category={post.category} />}
        <StatusBadge status={post.status} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{post.title}</Text>

      {/* Key Facts & Timestamps */}
      <View style={styles.metaCard}>
        {/* Dedicated Single Row for Location without trailing dot */}
        {!!post.location && (
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={13} color="#dc2626" />
            <Text style={styles.locationText} numberOfLines={1}>
              {post.location}
            </Text>
          </View>
        )}

        {/* Date & Time Row */}
        <View style={styles.dateTimeRow}>
          <View style={styles.factItem}>
            <Feather name="calendar" size={12} color={CAMPUS_HUB_COLORS.subtleText} />
            <Text style={styles.factText}>{formatDateTime(post.createdAt)}</Text>
          </View>
          <Text style={styles.factDot}>•</Text>
          <Text style={styles.factText}>{timeAgo(post.createdAt)}</Text>
        </View>

        {isEdited && post.updatedAt && (
          <View style={styles.editedRow}>
            <View style={styles.editedPill}>
              <Feather
                name="edit-2"
                size={9.5}
                color={CAMPUS_HUB_COLORS.lostFoundAccentText}
              />
              <Text style={styles.editedPillText}>EDITED</Text>
            </View>
            <Text style={styles.editedDate}>
              Last edited {formatDateTime(post.updatedAt)} ({timeAgo(post.updatedAt)})
            </Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Author chip */}
      <AvatarChip
        name={post.author?.name ?? "SMUCT Member"}
        image={post.author?.image}
        subtitle={formatCampusUserSubtitle(post.author, "Campus Hub")}
        onPress={() => onViewAuthor(post.author as AuthorProfileModalData)}
      />

      <View style={styles.divider} />

      {/* Description */}
      {!!post.description?.trim() && (
        <>
          <Text style={styles.sectionLabel}>DESCRIPTION</Text>
          <Text style={styles.description}>{post.description}</Text>
        </>
      )}

      {/* Verification question */}
      {!!post.verificationQuestion && (
        <View style={styles.verificationCard}>
          <View style={styles.verificationHeader}>
            <Feather name="shield" size={14} color="#0284c7" />
            <Text style={styles.verificationLabel}>
              {isAuthor ? "YOUR VERIFICATION QUESTION" : "OWNERSHIP VERIFICATION QUESTION"}
            </Text>
          </View>
          <Text style={styles.verificationQuestion}>{post.verificationQuestion}</Text>
          {isAuthor && !!post.verificationAnswer && (
            <View style={styles.secretAnswerBox}>
              <Text style={styles.secretAnswerLabel}>EXPECTED ANSWER (PRIVATE TO YOU):</Text>
              <Text style={styles.secretAnswer}>{post.verificationAnswer}</Text>
            </View>
          )}
        </View>
      )}

      {/* Owner / Admin Management Section */}
      {canManage && (
        <View style={styles.managementContainer}>
          {isAdmin && !isAuthor && (
            <View style={styles.adminIndicator}>
              <Feather name="shield" size={12} color="#4338ca" />
              <Text style={styles.adminIndicatorText}>ADMIN MODERATION CONTROLS</Text>
            </View>
          )}

          <View style={styles.ownerActions}>
            {!isResolved && (
              <TouchableOpacity
                style={styles.editBtn}
                onPress={onEdit}
                activeOpacity={0.8}
                accessible
                accessibilityRole="button"
                accessibilityLabel="Edit listing"
              >
                <Feather name="edit-3" size={14} color={CAMPUS_HUB_COLORS.deepNavy} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={onDelete}
              activeOpacity={0.8}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Delete listing"
            >
              <Feather name="trash-2" size={14} color={CAMPUS_HUB_COLORS.dangerText} />
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: CAMPUS_HUB_COLORS.subtleBorder,
    ...CAMPUS_HUB_COLORS.shadow,
  },
  resolvedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 12,
  },
  resolvedBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#047857",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    lineHeight: 26,
    marginBottom: 8,
  },
  metaCard: {
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 7,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.04)",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  editedRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    flexWrap: "wrap",
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
  },
  editedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  editedPillText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.4,
  },
  editedDate: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  factItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  factText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  factDot: {
    fontSize: 12,
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  divider: {
    height: 1,
    backgroundColor: CAMPUS_HUB_COLORS.subtleBorder,
    marginVertical: 12,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  description: {
    fontFamily,
    fontSize: 14,
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 22,
    marginBottom: 10,
  },
  verificationCard: {
    backgroundColor: "#f0f9ff",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 6,
  },
  verificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verificationLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#0284c7",
    letterSpacing: 0.5,
  },
  verificationQuestion: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    lineHeight: 18,
  },
  secretAnswerBox: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#e0f2fe",
  },
  secretAnswerLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: "#64748b",
    marginBottom: 2,
  },
  secretAnswer: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: "#0369a1",
  },
  managementContainer: {
    marginTop: 14,
    gap: 8,
  },
  adminIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#eef2ff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  adminIndicatorText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#4338ca",
    letterSpacing: 0.5,
  },
  ownerActions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 2,
  },
  editBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  editBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.deepNavy,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 11,
    backgroundColor: CAMPUS_HUB_COLORS.dangerBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.15)",
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.dangerText,
  },
});
