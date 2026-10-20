import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AcademicCalendarItem, CalendarStatus } from "@/services/calendar-service";
import { BENTO_COLORS, SMUCT_FACULTIES } from "../constants";
import { AdminConfirmModal, ConfirmModalVariant } from "./AdminConfirmModal";

interface CalendarListCardProps {
  calendar: AcademicCalendarItem;
  onOpenDetail: (id: string) => void;
  onStatusChange: (id: string, status: CalendarStatus) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string, title: string) => void;
}

export const CalendarListCard: React.FC<CalendarListCardProps> = ({
  calendar,
  onOpenDetail,
  onStatusChange,
  onDuplicate,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    variant: ConfirmModalVariant;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  } | null>(null);

  const isPub = calendar.status === "PUBLISHED";
  const isDraft = calendar.status === "DRAFT";
  const isArchived = calendar.status === "ARCHIVED";
  const eventCount = calendar.events?.length || 0;

  // Compute targeted faculty breakdown
  const targetedFacultyChips = React.useMemo(() => {
    const isAudienceGlobal =
      calendar.isGlobal ??
      (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length);
    if (isAudienceGlobal) return [];

    const chips: Array<{ name: string; count: number }> = [];
    SMUCT_FACULTIES.forEach((fac) => {
      const matchCount = fac.programs.filter((p) =>
        calendar.targetPrograms?.includes(p),
      ).length;
      if (matchCount > 0) {
        chips.push({ name: fac.shortName, count: matchCount });
      }
    });
    return chips;
  }, [calendar.isGlobal, calendar.targetPrograms, calendar.targetFaculties]);

  const handleArchive = () => {
    setIsMenuVisible(false);
    setConfirmModal({
      visible: true,
      variant: "archive",
      title: "Archive Academic Calendar",
      message: `Archiving "${calendar.title}" will hide it from active student and faculty dashboards while keeping historical archives. You can unarchive it anytime.`,
      confirmLabel: "Archive Calendar",
      onConfirm: () => {
        setConfirmModal(null);
        onStatusChange(calendar.id, "ARCHIVED");
      },
    });
  };

  const handleDelete = () => {
    setIsMenuVisible(false);
    setConfirmModal({
      visible: true,
      variant: "delete",
      title: "Delete Academic Calendar",
      message: `Permanently delete "${calendar.title}" and its ${eventCount} events? This action cannot be undone.`,
      confirmLabel: "Delete Calendar",
      onConfirm: () => {
        setConfirmModal(null);
        onDelete(calendar.id, calendar.title);
      },
    });
  };

  const handlePublish = () => {
    setIsMenuVisible(false);
    setConfirmModal({
      visible: true,
      variant: "publish",
      title: "Publish Academic Calendar",
      message: `Publishing "${calendar.title}" will immediately make this calendar LIVE across all targeted student and faculty dashboards.`,
      confirmLabel: "Publish Live",
      onConfirm: () => {
        setConfirmModal(null);
        onStatusChange(calendar.id, "PUBLISHED");
      },
    });
  };

  const handleRevert = () => {
    setIsMenuVisible(false);
    setConfirmModal({
      visible: true,
      variant: "revert",
      title: "Revert Calendar to Draft",
      message: `Reverting "${calendar.title}" will temporarily hide it from students while you make administrative updates.`,
      confirmLabel: "Revert to Draft",
      onConfirm: () => {
        setConfirmModal(null);
        onStatusChange(calendar.id, "DRAFT");
      },
    });
  };

  return (
    <>
      <TouchableOpacity
        style={styles.card}
        onPress={() => onOpenDetail(calendar.id)}
        activeOpacity={0.85}
      >
        {/* Top Status & Count */}
        <View style={styles.topRow}>
          <View
            style={[
              styles.statusPill,
              isPub && styles.statusPublished,
              isDraft && styles.statusDraft,
              isArchived && styles.statusArchived,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isPub && { backgroundColor: "#059669" },
                isDraft && { backgroundColor: "#d97706" },
                isArchived && { backgroundColor: "#64748b" },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                isPub && { color: "#047857" },
                isDraft && { color: "#b45309" },
                isArchived && { color: "#475569" },
              ]}
            >
              {calendar.status}
            </Text>
          </View>

          <View style={styles.topRightRow}>
            <View style={styles.eventCountBadge}>
              <Text style={styles.eventCountText}>{eventCount} Events</Text>
            </View>

            {/* Quick Action ••• Button */}
            <TouchableOpacity
              style={styles.quickMenuBtn}
              onPress={(e) => {
                e.stopPropagation?.();
                setIsMenuVisible(true);
              }}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Calendar quick actions"
            >
              <Feather name="more-vertical" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title & Semester */}
        <Text style={styles.title}>{calendar.title}</Text>
        <Text style={styles.semester}>
          {calendar.semester} {calendar.academicYear ? `${calendar.academicYear}` : ""}
          {calendar.semesterDuration ? ` • ${calendar.semesterDuration}` : ""}
          {calendar.targetBatch ? ` • ${calendar.targetBatch}` : ""}
        </Text>

        {/* Audience Chips */}
        <View style={styles.bottomRow}>
          {calendar.isGlobal || (!calendar.targetPrograms?.length && !calendar.targetFaculties?.length) ? (
            <View style={styles.audienceTag}>
              <Feather name="globe" size={12} color="#0369a1" />
              <Text style={styles.audienceTagText}>All Faculties & Programs</Text>
            </View>
          ) : targetedFacultyChips.length > 0 ? (
            <View style={styles.targetChipsWrap}>
              {targetedFacultyChips.map((chip, idx) => (
                <View key={idx} style={styles.targetChip}>
                  <Text style={styles.targetChipText}>
                    {chip.name} ({chip.count})
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.audienceTag}>
              <Feather name="users" size={12} color="#475569" />
              <Text style={styles.audienceTagText}>Targeted Audience</Text>
            </View>
          )}

          <View style={styles.manageBtn}>
            <Text style={styles.manageText}>Manage</Text>
            <Feather name="chevron-right" size={15} color="#0f172a" />
          </View>
        </View>
      </TouchableOpacity>

      {/* Quick Action Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            { paddingTop: Math.max(insets.top, 24) },
          ]}
          activeOpacity={1}
          onPress={() => setIsMenuVisible(false)}
        >
          <View
            style={[
              styles.menuSheet,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>{calendar.title}</Text>
              <TouchableOpacity
                onPress={() => setIsMenuVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={16} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                onOpenDetail(calendar.id);
              }}
            >
              <Feather name="eye" size={16} color="#0f172a" />
              <Text style={styles.menuItemText}>Open & Manage Events</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                onDuplicate(calendar.id);
              }}
            >
              <Feather name="copy" size={16} color="#0f172a" />
              <Text style={styles.menuItemText}>Clone to New Draft</Text>
            </TouchableOpacity>

            {isDraft && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handlePublish}
              >
                <Feather name="check-circle" size={16} color="#047857" />
                <Text style={[styles.menuItemText, { color: "#047857" }]}>
                  Publish to Students
                </Text>
              </TouchableOpacity>
            )}

            {isPub && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={handleRevert}
              >
                <Feather name="corner-up-left" size={16} color="#b45309" />
                <Text style={[styles.menuItemText, { color: "#b45309" }]}>
                  Revert to Draft
                </Text>
              </TouchableOpacity>
            )}

            {isArchived ? (
              <>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleRevert}
                >
                  <Feather name="rotate-ccw" size={16} color="#0369a1" />
                  <Text style={[styles.menuItemText, { color: "#0369a1" }]}>
                    Unarchive (Restore to Draft)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handlePublish}
                >
                  <Feather name="send" size={16} color="#047857" />
                  <Text style={[styles.menuItemText, { color: "#047857" }]}>
                    Publish Directly
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.menuItem} onPress={handleArchive}>
                <Feather name="archive" size={16} color="#475569" />
                <Text style={styles.menuItemText}>Archive Calendar</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={handleDelete}
            >
              <Feather name="trash-2" size={16} color="#dc2626" />
              <Text style={[styles.menuItemText, { color: "#dc2626" }]}>
                Delete Calendar
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confirmation Modal */}
      {confirmModal && (
        <AdminConfirmModal
          visible={confirmModal.visible}
          onClose={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
          variant={confirmModal.variant}
          title={confirmModal.title}
          targetBadge={calendar.title}
          message={confirmModal.message}
          confirmLabel={confirmModal.confirmLabel}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: BENTO_COLORS.cardRadius,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.border,
    ...BENTO_COLORS.shadow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  statusPublished: {
    backgroundColor: "#ecfdf5",
  },
  statusDraft: {
    backgroundColor: "#fffbeb",
  },
  statusArchived: {
    backgroundColor: "#f1f5f9",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  topRightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  eventCountBadge: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  eventCountText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  quickMenuBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
    lineHeight: 22,
  },
  semester: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    gap: 8,
  },
  audienceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#f0f9ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  audienceTagText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369a1",
  },
  targetChipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    flex: 1,
  },
  targetChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },
  targetChipText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  manageText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 6,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0f172a",
    flex: 1,
    marginRight: 8,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
});
