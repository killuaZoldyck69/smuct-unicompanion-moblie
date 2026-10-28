import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { getDepartmentShortName } from "@/data/programs";
import { splitOrdinal } from "@/screens/hubs/constants";

export type HubConfirmAction = "archive" | "unarchive" | "delete" | "leave";

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

const ACTION_CONFIG = {
  archive: {
    icon: "archive" as const,
    iconColor: "#d97706",
    haloBg: "#fffbeb",
    haloBorder: "#fde68a",
    innerBg: "#fef3c7",
    badgeLabel: "READ-ONLY ARCHIVE",
    badgeBg: "#fef3c7",
    badgeText: "#92400e",
    title: "Archive Course Hub?",
    message:
      "Archiving will lock new announcements, assignments, and coursework submissions. The hub will remain read-only for future reference. You can restore it anytime.",
    confirmLabel: "Archive Hub",
    confirmBg: "#d97706",
  },
  unarchive: {
    icon: "rotate-ccw" as const,
    iconColor: "#059669",
    haloBg: "#ecfdf5",
    haloBorder: "#a7f3d0",
    innerBg: "#d1fae5",
    badgeLabel: "RESTORE ACTIVE STATUS",
    badgeBg: "#d1fae5",
    badgeText: "#065f46",
    title: "Restore Course Hub?",
    message:
      "Restoring this course hub will re-enable active announcements, coursework submissions, and student discussions.",
    confirmLabel: "Restore Hub",
    confirmBg: "#059669",
  },
  delete: {
    icon: "trash-2" as const,
    iconColor: "#dc2626",
    haloBg: "#fef2f2",
    haloBorder: "#fecaca",
    innerBg: "#fee2e2",
    badgeLabel: "PERMANENT REMOVAL",
    badgeBg: "#fee2e2",
    badgeText: "#991b1b",
    title: "Delete Course Hub?",
    message:
      "This will permanently erase this course hub along with all members, announcements, classwork, and coursework submissions. This action cannot be undone.",
    confirmLabel: "Delete Permanently",
    confirmBg: "#dc2626",
  },
  leave: {
    icon: "log-out" as const,
    iconColor: "#ea580c",
    haloBg: "#fff7ed",
    haloBorder: "#fed7aa",
    innerBg: "#ffedd5",
    badgeLabel: "LEAVE MEMBERSHIP",
    badgeBg: "#ffedd5",
    badgeText: "#9a3412",
    title: "Leave Course Hub?",
    message:
      "Are you sure you want to leave this hub? You will lose access to course materials and will need the course invite code to rejoin later.",
    confirmLabel: "Leave Hub",
    confirmBg: "#ea580c",
  },
};

function getOrdinalSuffix(n: number | string | undefined | null): string {
  if (!n) return "";
  const num = typeof n === "number" ? n : parseInt(String(n), 10);
  if (isNaN(num)) return "";
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return `${num}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export interface HubConfirmViewProps {
  action: HubConfirmAction;
  hubDetails?: any;
  isPending?: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export default function HubConfirmView({
  action,
  hubDetails,
  isPending = false,
  onCancel,
  onConfirm,
}: HubConfirmViewProps) {
  const config = ACTION_CONFIG[action] || ACTION_CONFIG.archive;

  const courseTitle =
    hubDetails?.courseName ||
    hubDetails?.course?.name ||
    hubDetails?.name ||
    "Course Hub";

  const courseCode =
    hubDetails?.courseCode ||
    hubDetails?.course?.code ||
    hubDetails?.code ||
    null;

  const semesterOrdinal = splitOrdinal(
    hubDetails?.semesterNumber || hubDetails?.semester || hubDetails?.termOffer
  );

  const sectionText = hubDetails?.section
    ? `Sec ${hubDetails.section}`
    : null;

  const deptText = hubDetails?.department
    ? getDepartmentShortName(hubDetails.department)
    : null;

  return (
    <View style={styles.container}>
      {/* Visual Halo Ring */}
      <View
        style={[
          styles.haloOuter,
          {
            backgroundColor: config.haloBg,
            borderColor: config.haloBorder,
          },
        ]}
      >
        <View style={[styles.haloInner, { backgroundColor: config.innerBg }]}>
          <Feather name={config.icon} size={24} color={config.iconColor} />
        </View>
      </View>

      {/* Pill Badge */}
      <View style={[styles.pillBadge, { backgroundColor: config.badgeBg }]}>
        <Text style={[styles.pillBadgeText, { color: config.badgeText }]}>
          {config.badgeLabel}
        </Text>
      </View>

      {/* Title */}
      <Text style={styles.titleText}>{config.title}</Text>

      {/* Hub Context Preview Box */}
      <View style={styles.contextBox}>
        <Text style={styles.contextCourseTitle} numberOfLines={1}>
          {courseTitle}
        </Text>
        <View style={styles.chipsRow}>
          {courseCode && (
            <View style={styles.metaChip}>
              <Feather
                name="book"
                size={11}
                color="#2563eb"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaChipText}>{courseCode}</Text>
            </View>
          )}

          {semesterOrdinal.number ? (
            <View style={styles.metaChip}>
              <Feather
                name="calendar"
                size={11}
                color="#0284c7"
                style={{ marginRight: 4 }}
              />
              <View style={styles.semInlineWrapper}>
                <Text style={styles.metaChipText}>{semesterOrdinal.number}</Text>
                {semesterOrdinal.suffix ? (
                  <Text style={styles.semSuperscript}>
                    {semesterOrdinal.suffix}
                  </Text>
                ) : null}
                <Text style={styles.metaChipText}> Sem</Text>
              </View>
            </View>
          ) : null}

          {sectionText && (
            <View style={styles.metaChip}>
              <Feather
                name="users"
                size={11}
                color="#7c3aed"
                style={{ marginRight: 4 }}
              />
              <Text style={styles.metaChipText}>{sectionText}</Text>
            </View>
          )}

          {deptText && (
            <View style={styles.metaChip}>
              <Text style={styles.metaChipText}>{deptText}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Explanatory Message */}
      <Text style={styles.messageText}>{config.message}</Text>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={onCancel}
          disabled={isPending}
          activeOpacity={0.7}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Cancel action"
        >
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmBtn,
            { backgroundColor: config.confirmBg },
            isPending && styles.confirmBtnDisabled,
          ]}
          onPress={onConfirm}
          disabled={isPending}
          activeOpacity={0.85}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={config.confirmLabel}
        >
          {isPending ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <View style={styles.btnContent}>
              <Feather
                name={config.icon}
                size={15}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.confirmBtnText}>{config.confirmLabel}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 20,
  },
  haloOuter: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  haloInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  pillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
    marginBottom: 8,
  },
  pillBadgeText: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 12,
  },
  contextBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    alignItems: "center",
  },
  contextCourseTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    letterSpacing: -0.1,
    marginBottom: 6,
    textAlign: "center",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.07)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
  },
  metaChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#334155",
  },
  semInlineWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  semSuperscript: {
    fontFamily,
    fontSize: 8,
    fontWeight: "700",
    color: "#334155",
    lineHeight: 10,
    marginTop: -2,
    marginLeft: 0.5,
    marginRight: 1,
  },
  messageText: {
    fontFamily,
    fontSize: 12.5,
    color: "#64748b",
    lineHeight: 18.5,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
  confirmBtn: {
    flex: 1.35,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnDisabled: {
    opacity: 0.65,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});

