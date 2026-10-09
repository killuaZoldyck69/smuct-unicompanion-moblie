import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { FieldBookingItem } from "@/services/field-service";
import { BENTO } from "../../constants";
import {
  formatDate,
  formatTime,
  getBookingDuration,
  formatPurposeWithEmoji,
  isPastBooking,
} from "../../utils";
import { BookingStatusBadge } from "../booking-status-badge";

interface AdminBookingCardProps {
  item: FieldBookingItem;
  onApprove: (item: FieldBookingItem) => void;
  onReject: (item: FieldBookingItem) => void;
  onDelete: (item: FieldBookingItem) => void;
  onViewProfile: (item: FieldBookingItem) => void;
  isUpdatingStatus?: boolean;
  isDeleting?: boolean;
}

export const AdminBookingCard = memo(function AdminBookingCard({
  item,
  onApprove,
  onReject,
  onDelete,
  onViewProfile,
  isUpdatingStatus = false,
  isDeleting = false,
}: AdminBookingCardProps) {
  const duration = getBookingDuration(item);
  const dateDisplay = formatDate(item.bookingDate || item.startTime);
  const titleDisplay = formatPurposeWithEmoji(item.purpose);

  const user = item.user;
  const userName = user?.name || "University Member";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";
  const sp = user?.studentProfile;
  const tp = user?.teacherProfile;

  const isTeacher = Boolean(tp || user?.role === "TEACHER");
  const isAdminUser = user?.role === "ADMIN";
  const roleLabel = isAdminUser
    ? "Admin"
    : isTeacher
      ? "Faculty"
      : "Student";

  const memberId = sp?.studentId || tp?.teacherId || null;
  const department = sp?.department || tp?.department || null;
  const subMeta = [memberId, department].filter(Boolean).join(" • ");

  const statusNorm = (item.status || "").toUpperCase();
  const leftAccentColor =
    statusNorm === "APPROVED"
      ? BENTO.emerald
      : statusNorm === "REJECTED"
        ? BENTO.rose
        : BENTO.amber;

  const isPending = statusNorm === "PENDING";
  const isPast = isPastBooking(item);

  return (
    <View
      style={[
        styles.card,
        { borderLeftColor: leftAccentColor },
        isPast && styles.cardPast,
      ]}
    >
      {/* Top Row: Date, Duration & Status Badge */}
      <View style={styles.cardHeader}>
        <View style={styles.dateWrap}>
          <Feather
            name="calendar"
            size={13}
            color={isPast ? BENTO.slateLight : BENTO.navy}
            style={styles.calIcon}
          />
          <Text style={[styles.dateText, isPast && styles.dateTextPast]}>
            {dateDisplay}
          </Text>
        </View>

        <BookingStatusBadge status={item.status} />
      </View>

      {/* Time Slot Row */}
      <View style={styles.timeRow}>
        <View style={styles.timePill}>
          <Feather
            name="clock"
            size={12}
            color={BENTO.indigo}
            style={styles.clockIcon}
          />
          <Text style={styles.timeText}>
            {formatTime(item.startTime)} – {formatTime(item.endTime)}
          </Text>
        </View>

        {duration ? (
          <View style={styles.durationPill}>
            <Text style={styles.durationText}>{duration}</Text>
          </View>
        ) : null}
      </View>

      {/* Purpose Title */}
      <View style={styles.titleRow}>
        <Text style={styles.purposeTitle} numberOfLines={2}>
          {titleDisplay}
        </Text>
      </View>

      {/* Reserver Profile Banner (Interactive) */}
      <TouchableOpacity
        style={styles.reserverBox}
        onPress={() => onViewProfile(item)}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`View profile of ${userName}`}
      >
        <View style={styles.avatarWrap}>
          {user?.image ? (
            <Image source={{ uri: user.image }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarText}>{userInitial}</Text>
          )}
        </View>

        <View style={styles.reserverInfo}>
          <View style={styles.reserverNameRow}>
            <Text style={styles.reserverName} numberOfLines={1}>
              {userName}
            </Text>
            <View
              style={[
                styles.rolePill,
                isTeacher ? styles.rolePillTeacher : styles.rolePillStudent,
              ]}
            >
              <Text
                style={[
                  styles.rolePillText,
                  isTeacher ? styles.roleTextTeacher : styles.roleTextStudent,
                ]}
              >
                {roleLabel}
              </Text>
            </View>
          </View>

          {subMeta ? (
            <Text style={styles.reserverSubMeta} numberOfLines={1}>
              {subMeta}
            </Text>
          ) : null}
        </View>

        <View style={styles.viewProfileTrigger}>
          <Feather name="chevron-right" size={16} color={BENTO.slate} />
        </View>
      </TouchableOpacity>

      {/* Admin Action Buttons */}
      <View style={[styles.actionsFooter, isPast && styles.actionsFooterPast]}>
        {!isPast ? (
          isPending ? (
            <View style={styles.decisionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => onReject(item)}
                disabled={isUpdatingStatus || isDeleting}
                activeOpacity={0.75}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color={BENTO.rose} />
                ) : (
                  <>
                    <Feather
                      name="x-circle"
                      size={14}
                      color={BENTO.rose}
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.rejectBtnText}>Reject</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.approveBtn]}
                onPress={() => onApprove(item)}
                disabled={isUpdatingStatus || isDeleting}
                activeOpacity={0.8}
              >
                {isUpdatingStatus ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name="check-circle"
                      size={14}
                      color="#ffffff"
                      style={{ marginRight: 5 }}
                    />
                    <Text style={styles.approveBtnText}>Approve</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.secondaryActionsRow}>
              {statusNorm === "APPROVED" && (
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => onReject(item)}
                  disabled={isUpdatingStatus || isDeleting}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="slash"
                    size={12}
                    color={BENTO.rose}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.secondaryActionRejectText}>
                    Change to Reject
                  </Text>
                </TouchableOpacity>
              )}

              {statusNorm === "REJECTED" && (
                <TouchableOpacity
                  style={styles.secondaryActionBtn}
                  onPress={() => onApprove(item)}
                  disabled={isUpdatingStatus || isDeleting}
                  activeOpacity={0.7}
                >
                  <Feather
                    name="check"
                    size={12}
                    color={BENTO.emerald}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.secondaryActionApproveText}>
                    Re-Approve
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )
        ) : (
          <View style={styles.pastNoticeRow}>
            <Feather
              name="clock"
              size={12.5}
              color={BENTO.slate}
              style={{ marginRight: 5 }}
            />
            <Text style={styles.pastNoticeText}>The Date Passed</Text>
          </View>
        )}

        {/* Delete button (Always available) */}
        <TouchableOpacity
          style={[styles.deleteBtn, isPast && styles.deleteBtnPast]}
          onPress={() => onDelete(item)}
          disabled={isUpdatingStatus || isDeleting}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`Delete request by ${userName}`}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color={BENTO.rose} />
          ) : (
            <>
              <Feather
                name="trash-2"
                size={14}
                color={BENTO.rose}
                style={isPast ? { marginRight: 5 } : undefined}
              />
              {isPast && <Text style={styles.deleteBtnPastText}>Delete</Text>}
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: BENTO.card,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: BENTO.border,
    ...Platform.select({
      web: {
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
        elevation: 1,
      },
    }),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  calIcon: {
    marginRight: 6,
  },
  dateText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  timePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.indigoBg,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  clockIcon: {
    marginRight: 5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.indigo,
  },
  durationPill: {
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  durationText: {
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  titleRow: {
    marginBottom: 10,
  },
  purposeTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  reserverBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 12,
  },
  avatarWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
  },
  reserverInfo: {
    flex: 1,
    marginRight: 8,
  },
  reserverNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  reserverName: {
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO.navy,
  },
  rolePill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  rolePillStudent: {
    backgroundColor: BENTO.indigoBg,
  },
  rolePillTeacher: {
    backgroundColor: BENTO.emeraldBg,
  },
  rolePillText: {
    fontSize: 9.5,
    fontWeight: "800",
  },
  roleTextStudent: {
    color: BENTO.indigo,
  },
  roleTextTeacher: {
    color: BENTO.emerald,
  },
  reserverSubMeta: {
    fontSize: 11.5,
    color: BENTO.slate,
    fontWeight: "500",
  },
  viewProfileTrigger: {
    paddingLeft: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.04)",
  },
  decisionRow: {
    flexDirection: "row",
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 10,
  },
  rejectBtn: {
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  rejectBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: BENTO.rose,
  },
  approveBtn: {
    backgroundColor: BENTO.emerald,
  },
  approveBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#ffffff",
  },
  secondaryActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  secondaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.slateSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  secondaryActionRejectText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.rose,
  },
  secondaryActionApproveText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: BENTO.emerald,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#fff1f2",
    alignItems: "center",
    justifyContent: "center",
  },
  cardPast: {
    opacity: 0.52,
  },
  dateTextPast: {
    color: BENTO.slate,
  },
  pastBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    marginLeft: 6,
  },
  pastBadgeText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.4,
  },
  actionsFooterPast: {
    justifyContent: "space-between",
  },
  pastNoticeRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pastNoticeText: {
    fontSize: 12,
    color: BENTO.slate,
    fontWeight: "600",
  },
  deleteBtnPast: {
    flexDirection: "row",
    alignItems: "center",
    width: "auto",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  deleteBtnPastText: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.rose,
  },
});
