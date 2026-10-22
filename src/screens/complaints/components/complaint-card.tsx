import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  timeAgo,
} from "@/screens/campus-hub/shared/design-tokens";
import { formatCardDateTime } from "@/utils/date-formatter";
import type { ComplaintItem } from "@/services/complaint-service";

export interface ComplaintCardProps {
  item: ComplaintItem;
  // Student actions
  onEdit?: (item: ComplaintItem) => void;
  onDelete?: (item: ComplaintItem) => void;
  // Admin actions
  isAdmin?: boolean;
  onAccept?: (item: ComplaintItem) => void;
  onReject?: (item: ComplaintItem) => void;
  onResolve?: (item: ComplaintItem) => void;
  isActionLoading?: boolean;
  activeActionId?: string | null;
}

export const ComplaintCard = React.memo(function ComplaintCard({
  item,
  onEdit,
  onDelete,
  isAdmin = false,
  onAccept,
  onReject,
  onResolve,
  isActionLoading = false,
  activeActionId = null,
}: ComplaintCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const isPending = item.status === "PENDING";
  const isAccepted = item.status === "ACCEPTED";
  const isResolved = item.status === "RESOLVED";
  const isRejected = item.status === "REJECTED";

  const isCurrentItemLoading = isActionLoading && activeActionId === item.id;

  return (
    <View style={styles.card}>
      {/* Top Header Row: Category, Anonymous badge, Status badge */}
      <View style={styles.headerRow}>
        <View style={styles.leftTags}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>

          {item.isAnonymous ? (
            <View style={styles.anonymousBadge}>
              <Feather name="eye-off" size={11} color="#6366f1" />
              <Text style={styles.anonymousText}>Anonymous</Text>
            </View>
          ) : (
            <View style={styles.publicBadge}>
              <Feather
                name="user-check"
                size={11}
                color={CAMPUS_HUB_COLORS.subtleText}
              />
              <Text style={styles.publicText}>Standard</Text>
            </View>
          )}
        </View>

        {/* Status Badge */}
        {isResolved && (
          <View style={[styles.statusBadge, styles.statusResolved]}>
            <Feather name="check-circle" size={12} color="#047857" />
            <Text style={[styles.statusText, styles.statusResolvedText]}>
              Resolved
            </Text>
          </View>
        )}
        {isAccepted && (
          <View style={[styles.statusBadge, styles.statusAccepted]}>
            <Feather name="check" size={12} color="#0284c7" />
            <Text style={[styles.statusText, styles.statusAcceptedText]}>
              Accepted
            </Text>
          </View>
        )}
        {isRejected && (
          <View style={[styles.statusBadge, styles.statusRejected]}>
            <Feather name="x-circle" size={12} color="#b91c1c" />
            <Text style={[styles.statusText, styles.statusRejectedText]}>
              Rejected
            </Text>
          </View>
        )}
        {isPending && (
          <View style={[styles.statusBadge, styles.statusPending]}>
            <Feather name="clock" size={12} color="#b45309" />
            <Text style={[styles.statusText, styles.statusPendingText]}>
              Pending
            </Text>
          </View>
        )}
      </View>

      {/* Admin Mode: Complainant Identity Block */}
      {isAdmin && (
        <View style={styles.complainantSection}>
          {item.isAnonymous ? (
            <View style={styles.anonymousBanner}>
              <View style={styles.anonymousIconCircle}>
                <Feather name="eye-off" size={13} color="#6366f1" />
              </View>
              <View style={styles.anonymousTextCol}>
                <Text style={styles.anonymousBannerTitle}>
                  Anonymous Submission
                </Text>
                <Text style={styles.anonymousBannerDesc}>
                  Identity protected by university privacy policy
                </Text>
              </View>
            </View>
          ) : (
            <View style={styles.userBanner}>
              {item.user?.image ? (
                <Image
                  source={{ uri: item.user.image }}
                  style={styles.userAvatar}
                />
              ) : (
                <View style={styles.userAvatarFallback}>
                  <Text style={styles.userAvatarText}>
                    {item.user?.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              )}
              <View style={styles.userInfoCol}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {item.user?.name || "Complainant"}
                  </Text>
                  {item.user?.role && (
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>
                        {item.user.role}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userMeta} numberOfLines={1}>
                  {item.user?.studentProfile?.studentId
                    ? `ID: ${item.user.studentProfile.studentId} • `
                    : ""}
                  {item.user?.studentProfile?.department ||
                  item.user?.teacherProfile?.department
                    ? `${item.user?.studentProfile?.department || item.user?.teacherProfile?.department} • `
                    : ""}
                  {formatCardDateTime(item.createdAt)}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Complaint Title */}
      <Text style={styles.title}>{item.title}</Text>

      {/* Description Body (Collapsible / Expandable) */}
      <Text
        style={styles.description}
        numberOfLines={isExpanded ? undefined : 2}
      >
        {item.description}
      </Text>

      {/* Expanded Details: Official Admin Response & Status Context */}
      {isExpanded && (
        <View style={styles.expandedContent}>
          {item.adminRemarks ? (
            <View style={styles.adminRemarksBox}>
              <View style={styles.adminRemarksHeader}>
                <View style={styles.adminIconCircle}>
                  <Feather name="shield" size={13} color="#0369a1" />
                </View>
                <Text style={styles.adminRemarksTitle}>
                  Official Administration Response
                </Text>
              </View>
              <Text style={styles.adminRemarksText}>{item.adminRemarks}</Text>
            </View>
          ) : isAccepted ? (
            <View style={styles.acceptedNoticeBox}>
              <Feather
                name="check-circle"
                size={13}
                color="#0284c7"
                style={{ marginTop: 2 }}
              />
              <Text style={styles.acceptedNoticeText}>
                This grievance has been accepted by administration and is actively
                queued for resolution.
              </Text>
            </View>
          ) : (
            isPending && (
              <View style={styles.pendingNoticeBox}>
                <Feather
                  name="info"
                  size={13}
                  color="#b45309"
                  style={{ marginTop: 2 }}
                />
                <Text style={styles.pendingNoticeText}>
                  This grievance has been queued for review by the campus affairs
                  committee.
                </Text>
              </View>
            )
          )}
        </View>
      )}

      {/* Collapse / Expand Toggle Button */}
      <TouchableOpacity
        style={styles.expandToggleBtn}
        onPress={toggleExpand}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={
          isExpanded ? "Collapse complaint details" : "Expand complaint details"
        }
      >
        <Text style={styles.expandToggleText}>
          {isExpanded ? "Show Less" : "Show Details"}
        </Text>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={CAMPUS_HUB_COLORS.complaintAccent}
        />
      </TouchableOpacity>

      {/* Footer: Tracking ID, Timeline & Action Buttons */}
      <View style={styles.cardFooter}>
        <View style={styles.metaRow}>
          <View style={styles.idPill}>
            <Text style={styles.idText}>
              #{item.id.slice(0, 8).toUpperCase()}
            </Text>
          </View>
          <View style={styles.timeRow}>
            <Feather
              name="calendar"
              size={12}
              color={CAMPUS_HUB_COLORS.subtleText}
            />
            <Text style={styles.timeText}>{timeAgo(item.createdAt)}</Text>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.actionButtonsRow}>
          {isAdmin ? (
            /* Admin Mode Actions */
            <View style={styles.adminActionsContainer}>
              {isCurrentItemLoading ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator
                    size="small"
                    color={CAMPUS_HUB_COLORS.deepNavy}
                  />
                </View>
              ) : (
                <>
                  {/* Contextual Action: Pending -> Accept & Reject */}
                  {isPending && (
                    <>
                      <TouchableOpacity
                        style={[styles.adminBtn, styles.acceptBtn]}
                        onPress={() => onAccept?.(item)}
                        disabled={isActionLoading}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Accept complaint: ${item.title}`}
                      >
                        <Feather name="check" size={12} color="#ffffff" />
                        <Text style={styles.adminBtnText}>Accept</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.adminBtn, styles.rejectBtn]}
                        onPress={() => onReject?.(item)}
                        disabled={isActionLoading}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Reject complaint: ${item.title}`}
                      >
                        <Feather name="x" size={12} color="#ffffff" />
                        <Text style={styles.adminBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Contextual Action: Accepted -> Resolve & Reject */}
                  {isAccepted && (
                    <>
                      <TouchableOpacity
                        style={[styles.adminBtn, styles.resolveBtn]}
                        onPress={() => onResolve?.(item)}
                        disabled={isActionLoading}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Resolve complaint: ${item.title}`}
                      >
                        <Feather name="check-circle" size={12} color="#ffffff" />
                        <Text style={styles.adminBtnText}>Resolve</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.adminBtn, styles.rejectBtn]}
                        onPress={() => onReject?.(item)}
                        disabled={isActionLoading}
                        activeOpacity={0.8}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Reject complaint: ${item.title}`}
                      >
                        <Feather name="x" size={12} color="#ffffff" />
                        <Text style={styles.adminBtnText}>Reject</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  {/* Delete Button (Available for all statuses per retention strategy) */}
                  {onDelete && (
                    <TouchableOpacity
                      style={[styles.actionIconBtn, styles.deleteBtn]}
                      onPress={() => onDelete(item)}
                      disabled={isActionLoading}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete complaint: ${item.title}`}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={13} color="#e11d48" />
                    </TouchableOpacity>
                  )}
                </>
              )}
            </View>
          ) : (
            /* Student / Teacher Mode Actions */
            <>
              {isPending && onEdit && (
                <TouchableOpacity
                  style={styles.actionIconBtn}
                  onPress={() => onEdit(item)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Edit complaint"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather
                    name="edit-2"
                    size={14}
                    color={CAMPUS_HUB_COLORS.deepNavy}
                  />
                </TouchableOpacity>
              )}

              {onDelete && (
                <TouchableOpacity
                  style={[styles.actionIconBtn, styles.deleteBtn]}
                  onPress={() => onDelete(item)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Delete complaint"
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="trash-2" size={14} color="#e11d48" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...CAMPUS_HUB_COLORS.shadow,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },
  leftTags: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flexShrink: 1,
  },
  categoryPill: {
    backgroundColor: CAMPUS_HUB_COLORS.complaintAccentLight,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.complaintAccentText,
    letterSpacing: 0.2,
  },
  anonymousBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#eef2ff",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e7ff",
  },
  anonymousText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: "#6366f1",
  },
  publicBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  publicText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "600",
    color: CAMPUS_HUB_COLORS.subtleText,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusPendingText: {
    color: "#b45309",
  },
  statusAccepted: {
    backgroundColor: "#e0f2fe",
  },
  statusAcceptedText: {
    color: "#0284c7",
  },
  statusResolved: {
    backgroundColor: "#d1fae5",
  },
  statusResolvedText: {
    color: "#047857",
  },
  statusRejected: {
    backgroundColor: "#fee2e2",
  },
  statusRejectedText: {
    color: "#b91c1c",
  },
  statusText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
  },

  // Admin Complainant Identity Block
  complainantSection: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  anonymousBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f5f3ff",
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ede9fe",
  },
  anonymousIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ede9fe",
    alignItems: "center",
    justifyContent: "center",
  },
  anonymousTextCol: {
    flex: 1,
  },
  anonymousBannerTitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: "#5b21b6",
  },
  anonymousBannerDesc: {
    fontFamily,
    fontSize: 10.5,
    color: "#7c3aed",
    fontWeight: "500",
  },
  userBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f8fafc",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#e2e8f0",
  },
  userAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CAMPUS_HUB_COLORS.deepNavy,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  userInfoCol: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    flexShrink: 1,
  },
  roleBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: 0.3,
  },
  userMeta: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    marginTop: 1,
  },

  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    marginBottom: 6,
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  description: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "400",
    color: CAMPUS_HUB_COLORS.neutralText,
    lineHeight: 20,
    marginBottom: 8,
  },
  expandedContent: {
    marginTop: 6,
    marginBottom: 8,
    gap: 8,
  },
  adminRemarksBox: {
    backgroundColor: "#f0f9ff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    gap: 6,
  },
  adminRemarksHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  adminIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#e0f2fe",
    alignItems: "center",
    justifyContent: "center",
  },
  adminRemarksTitle: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: "#0369a1",
    letterSpacing: 0.2,
  },
  adminRemarksText: {
    fontFamily,
    fontSize: 13,
    color: "#0c4a6e",
    lineHeight: 18,
    fontWeight: "500",
  },
  acceptedNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  acceptedNoticeText: {
    fontFamily,
    fontSize: 11.5,
    color: "#0369a1",
    flex: 1,
    lineHeight: 16,
    fontWeight: "500",
  },
  pendingNoticeBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#fffbeb",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  pendingNoticeText: {
    fontFamily,
    fontSize: 11.5,
    color: "#92400e",
    flex: 1,
    lineHeight: 16,
  },
  expandToggleBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  expandToggleText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: CAMPUS_HUB_COLORS.complaintAccent,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.subtleBorder,
    flexWrap: "wrap",
    gap: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  idPill: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.subtleText,
    letterSpacing: 0.4,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timeText: {
    fontFamily,
    fontSize: 11,
    color: CAMPUS_HUB_COLORS.subtleText,
    fontWeight: "500",
  },
  actionButtonsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f8fafc",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  deleteBtn: {
    backgroundColor: "#fff1f2",
    borderColor: "#ffe4e6",
  },

  // Admin Actions Styles
  adminActionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  inlineLoading: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  adminBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptBtn: {
    backgroundColor: "#0284c7",
  },
  resolveBtn: {
    backgroundColor: "#059669",
  },
  rejectBtn: {
    backgroundColor: "#dc2626",
  },
  adminBtnText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
});
