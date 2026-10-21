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
import { cleanDateYmd } from "../utils/date-helpers";
import { AdminConfirmModal, ConfirmModalVariant } from "./AdminConfirmModal";
import { getProgramShortName, universityPrograms } from "@/data/programs";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatMilestoneDate(dateStr?: string | null): string {
  if (!dateStr) return "";
  const cleaned = cleanDateYmd(dateStr);
  const parts = cleaned.split("-");
  if (parts.length >= 3) {
    const y = parts[0];
    const m = MONTH_NAMES[parseInt(parts[1], 10) - 1] || parts[1];
    const d = parseInt(parts[2], 10);
    return `${m} ${d}, ${y}`;
  }
  return dateStr;
}

function formatMilestoneRange(startStr?: string | null, endStr?: string | null): string {
  if (!startStr) return "";
  if (!endStr || cleanDateYmd(startStr) === cleanDateYmd(endStr)) {
    return formatMilestoneDate(startStr);
  }
  const sParts = cleanDateYmd(startStr).split("-");
  const eParts = cleanDateYmd(endStr).split("-");
  if (sParts.length >= 3 && eParts.length >= 3) {
    const sM = MONTH_NAMES[parseInt(sParts[1], 10) - 1] || sParts[1];
    const sD = parseInt(sParts[2], 10);
    const eM = MONTH_NAMES[parseInt(eParts[1], 10) - 1] || eParts[1];
    const eD = parseInt(eParts[2], 10);
    const eY = eParts[0];
    if (sM === eM) {
      return `${sM} ${sD}–${eD}, ${eY}`;
    }
    return `${sM} ${sD} – ${eM} ${eD}, ${eY}`;
  }
  return formatMilestoneDate(startStr);
}

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

  const eventCount =
    calendar.events?.length ??
    calendar._count?.events ??
    0;

  // Total Weeks
  const totalWeeks = React.useMemo(() => {
    if (calendar.events && calendar.events.length > 0) {
      const weeks = calendar.events
        .map((e) => e.weekNumber)
        .filter((w): w is number => typeof w === "number" && w > 0);
      if (weeks.length > 0) return Math.max(...weeks);
    }
    return 0;
  }, [calendar.events]);

  // Targeted Programs resolved with official short names
  const targetedPrograms = React.useMemo(() => {
    // 1. If explicit programs targeted
    if (calendar.targetPrograms && calendar.targetPrograms.length > 0) {
      return calendar.targetPrograms.map((p) => ({
        fullName: p,
        shortName: getProgramShortName(p) || p,
      }));
    }

    // 2. If faculties targeted, gather their constituent programs
    if (calendar.targetFaculties && calendar.targetFaculties.length > 0) {
      const matched = universityPrograms.filter((up) =>
        calendar.targetFaculties.some(
          (fac) =>
            fac.toLowerCase().includes(up.faculty.toLowerCase()) ||
            up.faculty.toLowerCase().includes(fac.toLowerCase()),
        ),
      );
      if (matched.length > 0) {
        return matched.map((p) => ({
          fullName: p.name,
          shortName: p.shortName || getProgramShortName(p.name),
        }));
      }
    }

    // 3. Fallback: core university programs
    const defaults = [
      "B.Sc (Hons) in Computer Science and Engineering",
      "B.Sc (Hons) in Computer Science and Information Technology",
      "Bachelor of Business Administration (BBA)",
      "Bachelor of Architecture",
      "BA (Hons) in Fashion Design and Technology",
      "BA (Hons) in Graphic Design and Multimedia",
      "Bachelor of Laws (LLB)",
    ];
    return defaults.map((p) => ({
      fullName: p,
      shortName: getProgramShortName(p) || p,
    }));
  }, [calendar.targetPrograms, calendar.targetFaculties]);

  // Two-row display limit: show up to 4 programs, then "+ X more"
  const visiblePrograms = React.useMemo(() => {
    if (targetedPrograms.length > 4) {
      return targetedPrograms.slice(0, 4);
    }
    return targetedPrograms;
  }, [targetedPrograms]);

  const remainingProgramsCount = targetedPrograms.length - visiblePrograms.length;

  // Key Milestones (Commencement, Midterm Window, Finalterm Window, Term End)
  const milestones = React.useMemo(() => {
    const events = calendar.events || [];
    const year = calendar.academicYear || 2026;
    const sem = calendar.semester || "Summer";

    let commencement = "";
    let midtermWindow = "";
    let finaltermWindow = "";
    let termEnd = "";

    if (events.length > 0) {
      const sorted = [...events].sort(
        (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
      commencement = formatMilestoneDate(sorted[0].startDate);
      termEnd = formatMilestoneDate(
        sorted[sorted.length - 1].endDate || sorted[sorted.length - 1].startDate,
      );

      // Midterm event
      const midEvent = sorted.find((e) => {
        const t = e.title.toLowerCase();
        return (
          t.includes("mid-term") ||
          t.includes("midterm") ||
          t.includes("mid term")
        );
      });
      if (midEvent) {
        midtermWindow = formatMilestoneRange(midEvent.startDate, midEvent.endDate);
      } else {
        const nonFinalExam = sorted.find(
          (e) =>
            e.category === "EXAM" &&
            !e.title.toLowerCase().includes("final") &&
            !e.title.toLowerCase().includes("preparation"),
        );
        if (nonFinalExam) {
          midtermWindow = formatMilestoneRange(
            nonFinalExam.startDate,
            nonFinalExam.endDate,
          );
        }
      }

      // Finalterm event
      const finalEvent = sorted.find((e) => {
        const t = e.title.toLowerCase();
        return (
          t.includes("final examination") ||
          t.includes("final exam") ||
          t.includes("finalterm") ||
          t.includes("final-term") ||
          t.includes("final term") ||
          (t.includes("final") && e.category === "EXAM")
        );
      });
      if (finalEvent) {
        finaltermWindow = formatMilestoneRange(
          finalEvent.startDate,
          finalEvent.endDate,
        );
      }
    }

    if (!commencement) {
      commencement = "Not scheduled yet";
    }
    if (!midtermWindow) {
      midtermWindow = "Not scheduled";
    }
    if (!finaltermWindow) {
      finaltermWindow = "Not scheduled";
    }
    if (!termEnd) {
      termEnd = "Not scheduled yet";
    }

    return { commencement, midtermWindow, finaltermWindow, termEnd };
  }, [calendar.events, calendar.academicYear, calendar.semester]);

  // Exact Semester title (as stored in DB or fallback)
  const displayTitle = React.useMemo(() => {
    if (calendar.title && calendar.title.trim().length > 0) {
      return calendar.title.trim();
    }
    return `${calendar.semester} ${calendar.academicYear || 2026}`;
  }, [calendar.title, calendar.semester, calendar.academicYear]);

  // Exact Academic Year text e.g. "AY 2026" (no 2027)
  const academicYearText = `AY ${calendar.academicYear || 2026}`;
  const semesterDurationText = calendar.semesterDuration || "6 Months";

  // Handlers for menu actions
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
      {/* ─────────────────────────────────────────────────────────────
          1. ACTIVE / FEATURED CARD (Summer Semester 2026)
         ───────────────────────────────────────────────────────────── */}
      {isPub ? (
        <View style={styles.featuredCardWrapper}>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => onOpenDetail(calendar.id)}
            activeOpacity={0.92}
          >
            {/* Top Black Accent Strip */}
            <View style={styles.topAccentBar} />

            <View style={styles.featuredCardBody}>
              {/* Header Row: [📅 Summer • AY 2026] [6 Months] [• LIVE] ... (•••) */}
              <View style={styles.featuredHeaderRow}>
                <View style={styles.topChipsRow}>
                  {/* 1. Semester & AY Chip */}
                  <View style={styles.ayChip}>
                    <Feather name="calendar" size={11} color="#0284c7" />
                    <Text style={styles.ayChipText}>
                      {calendar.semester} • AY {calendar.academicYear || 2026}
                    </Text>
                  </View>

                  {/* 2. Duration Chip */}
                  <View style={styles.durationChip}>
                    <Text style={styles.durationChipText}>
                      {calendar.semesterDuration || "6 Months"}
                    </Text>
                  </View>

                  {/* 2b. Batch Chip */}
                  {Boolean(calendar.targetBatch) && (
                    <View style={styles.batchChip}>
                      <Text style={styles.batchChipText}>
                        Batch {calendar.targetBatch}
                      </Text>
                    </View>
                  )}

                  {/* 3. Status Badge (LIVE / DRAFT / ARCHIVED) */}
                  <View
                    style={[
                      styles.statusChip,
                      isPub
                        ? styles.statusChipLive
                        : isDraft
                          ? styles.statusChipDraft
                          : styles.statusChipArchived,
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        isPub && { backgroundColor: "#059669" },
                        isDraft && { backgroundColor: "#d97706" },
                        !isPub && !isDraft && { backgroundColor: "#64748b" },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusChipText,
                        isPub && { color: "#047857" },
                        isDraft && { color: "#b45309" },
                        !isPub && !isDraft && { color: "#475569" },
                      ]}
                    >
                      {isPub ? "Active" : isDraft ? "Draft" : "Archived"}
                    </Text>
                  </View>
                </View>

                {/* 3-dots Quick Action Button */}
                <TouchableOpacity
                  style={styles.moreBtn}
                  onPress={(e) => {
                    e.stopPropagation?.();
                    setIsMenuVisible(true);
                  }}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Calendar quick actions"
                >
                  <Feather name="more-vertical" size={17} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Title */}
              <Text style={styles.featuredTitle}>{displayTitle}</Text>

              {/* KEY MILESTONES BOX */}
              <View style={styles.milestonesBox}>
                <Text style={styles.milestonesHeader}>KEY MILESTONES</Text>

                <View style={styles.milestoneRow}>
                  <Text style={styles.milestoneLabel}>Commencement:</Text>
                  <Text style={styles.milestoneValue}>{milestones.commencement}</Text>
                </View>

                <View style={styles.milestoneRow}>
                  <Text style={styles.milestoneLabel}>Midterm Window:</Text>
                  <Text style={styles.milestoneValue}>{milestones.midtermWindow}</Text>
                </View>

                <View style={styles.milestoneRow}>
                  <Text style={styles.milestoneLabel}>Finalterm Window:</Text>
                  <Text style={styles.milestoneValue}>{milestones.finaltermWindow}</Text>
                </View>

                <View style={styles.milestoneRow}>
                  <Text style={styles.milestoneLabel}>Term End:</Text>
                  <Text style={styles.milestoneValue}>{milestones.termEnd}</Text>
                </View>
              </View>

              {/* 3 STAT BOXES ROW */}
              <View style={styles.statsRow}>
                {/* Weeks */}
                <View style={[styles.statBox, styles.statBoxBlue]}>
                  <Text style={[styles.statNumber, { color: "#0284c7" }]}>
                    {totalWeeks}
                  </Text>
                  <Text style={styles.statLabel}>Weeks</Text>
                </View>

                {/* Events */}
                <View style={[styles.statBox, styles.statBoxPurple]}>
                  <Text style={[styles.statNumber, { color: "#7c3aed" }]}>
                    {eventCount}
                  </Text>
                  <Text style={[styles.statLabel, { color: "#7c3aed" }]}>
                    Events
                  </Text>
                </View>

                {/* Programs */}
                <View style={[styles.statBox, styles.statBoxAmber]}>
                  <Text style={[styles.statNumber, { color: "#d97706" }]}>
                    {targetedPrograms.length}
                  </Text>
                  <Text style={[styles.statLabel, { color: "#b45309" }]}>
                    Programs
                  </Text>
                </View>
              </View>

              {/* Targeted Programs Chips (at most 2 rows + '+ X more') */}
              <View style={styles.programsSection}>
                <Text style={styles.programsLabel}>Targeted Programs:</Text>
                <View style={styles.programsWrap}>
                  {visiblePrograms.map((prog, idx) => (
                    <View key={idx} style={styles.programChip}>
                      <Text style={styles.programChipText}>{prog.shortName}</Text>
                    </View>
                  ))}
                  {remainingProgramsCount > 0 && (
                    <View style={[styles.programChip, styles.moreProgramsChip]}>
                      <Text style={styles.moreProgramsChipText}>
                        + {remainingProgramsCount} more
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Open Master Timeline & Schedule Button */}
              <TouchableOpacity
                style={styles.openMasterBtn}
                onPress={() => onOpenDetail(calendar.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.openMasterBtnText}>
                  Open Master Timeline & Schedule
                </Text>
                <Feather name="arrow-right" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      ) : isDraft ? (
        /* ─────────────────────────────────────────────────────────────
            2. STAGED DRAFT CARD (Fall Semester 2026)
           ───────────────────────────────────────────────────────────── */
        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => onOpenDetail(calendar.id)}
          activeOpacity={0.88}
        >
          {/* Top row */}
          <View style={styles.compactTopRow}>
            <View style={styles.draftBadge}>
              <Text style={styles.draftBadgeText}>Staged Draft</Text>
            </View>

            <View style={styles.compactTopRight}>
              <Text style={styles.compactDateMeta}>
                {academicYearText} • {calendar.semester}
                {Boolean(semesterDurationText) ? ` • ${semesterDurationText}` : ""}
                {Boolean(calendar.targetBatch) ? ` • Batch ${calendar.targetBatch}` : ""}
              </Text>

              <TouchableOpacity
                style={styles.moreBtnCompact}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setIsMenuVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="more-vertical" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.compactTitle}>{displayTitle}</Text>

          {/* Subtitle */}
          <Text style={styles.compactDesc}>
            Curriculum outline and preliminary schedule validation.
          </Text>

          {/* Divider */}
          <View style={styles.compactDivider} />

          {/* Bottom row */}
          <View style={styles.compactBottomRow}>
            <Text style={styles.compactLeftMeta}>
              {eventCount > 0 ? `${eventCount} Events Scheduled` : "No events scheduled"}
            </Text>

            <View style={styles.compactRightAction}>
              <Text style={styles.compactActionText}>Setup Events</Text>
              <Feather name="chevron-right" size={14} color="#0f172a" />
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        /* ─────────────────────────────────────────────────────────────
            3. ARCHIVED CARD (Summer Semester 2025)
           ───────────────────────────────────────────────────────────── */
        <TouchableOpacity
          style={styles.compactCard}
          onPress={() => onOpenDetail(calendar.id)}
          activeOpacity={0.88}
        >
          {/* Top row */}
          <View style={styles.compactTopRow}>
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedBadgeText}>Archived</Text>
            </View>

            <View style={styles.compactTopRight}>
              <Text style={styles.compactDateMeta}>
                Concluded {academicYearText} • {calendar.semester}
              </Text>

              <TouchableOpacity
                style={styles.moreBtnCompact}
                onPress={(e) => {
                  e.stopPropagation?.();
                  setIsMenuVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather name="more-vertical" size={16} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.compactTitle}>{displayTitle}</Text>

          {/* Subtitle */}
          <Text style={styles.compactDesc}>
            Archived records and finalized examination grades.
          </Text>

          {/* Divider */}
          <View style={styles.compactDivider} />

          {/* Bottom row */}
          <View style={styles.compactBottomRow}>
            <Text style={styles.compactLeftMeta}>
              {eventCount > 0 ? `${eventCount} Events Recorded` : "0 Events"}
            </Text>

            <View style={styles.compactRightAction}>
              <Text style={styles.compactActionText}>View Records</Text>
              <Feather name="chevron-right" size={14} color="#0f172a" />
            </View>
          </View>
        </TouchableOpacity>
      )}

      {/* ─────────────────────────────────────────────────────────────
          QUICK ACTIONS 3-DOTS BOTTOM SHEET MENU
         ───────────────────────────────────────────────────────────── */}
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
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.menuTitle} numberOfLines={1}>
                  {calendar.title}
                </Text>
                <Text style={styles.menuSubtitle}>
                  {calendar.semester} {calendar.academicYear || ""} • {calendar.status}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsMenuVisible(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>

            {/* Menu Items */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setIsMenuVisible(false);
                onOpenDetail(calendar.id);
              }}
            >
              <Feather name="calendar" size={16} color="#0f172a" />
              <Text style={styles.menuItemText}>Open Timeline & Schedule</Text>
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
                    Restore to Draft
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
  // ── FEATURED CARD (Summer Semester 2026) ───────────────────────────
  featuredCardWrapper: {
    marginBottom: 16,
  },
  featuredCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  topAccentBar: {
    height: 5,
    backgroundColor: "#0f172a",
  },
  featuredCardBody: {
    padding: 18,
  },
  featuredHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  topChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    flex: 1,
  },
  ayChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#e0f2fe",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  ayChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#0369a1",
  },
  durationChip: {
    backgroundColor: "#f3e8ff",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  durationChipText: {
    fontSize: 10.5,
    fontWeight: "800",
    color: "#7e22ce",
  },
  batchChip: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  batchChipText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#1d4ed8",
    letterSpacing: 0.2,
  },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusChipLive: {
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
  },
  statusChipDraft: {
    backgroundColor: "#fffbeb",
    borderColor: "#fde68a",
  },
  statusChipArchived: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  moreBtn: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.3,
    marginBottom: 14,
  },

  // KEY MILESTONES BOX
  milestonesBox: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  milestonesHeader: {
    fontSize: 10,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  milestoneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 3,
  },
  milestoneLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  milestoneValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },

  // 3 STAT BOXES
  statsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  statBoxBlue: {
    backgroundColor: "#f0f9ff",
    borderColor: "#e0f2fe",
  },
  statBoxPurple: {
    backgroundColor: "#f5f3ff",
    borderColor: "#ede9fe",
  },
  statBoxAmber: {
    backgroundColor: "#fffbeb",
    borderColor: "#fef3c7",
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 1,
  },

  // TARGETED PROGRAMS
  programsSection: {
    marginBottom: 16,
  },
  programsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
    marginBottom: 8,
  },
  programsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  programChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    paddingVertical: 5.5,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  programChipText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#334155",
  },
  moreProgramsChip: {
    backgroundColor: "#e0f2fe",
    borderColor: "#bae6fd",
  },
  moreProgramsChipText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#0369a1",
  },

  // PRIMARY BUTTON
  openMasterBtn: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  openMasterBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  // ── COMPACT CARDS (Staged Draft & Archived) ───────────────────────
  compactCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 16,
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  compactTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  draftBadge: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  draftBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  archivedBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  archivedBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  compactTopRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  compactDateMeta: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "#64748b",
  },
  moreBtnCompact: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
    marginTop: 2,
    marginBottom: 4,
  },
  compactDesc: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 16,
  },
  compactDivider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginVertical: 12,
  },
  compactBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactLeftMeta: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  compactRightAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  compactActionText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },

  // ── QUICK ACTION MODAL SHEET ──────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
    gap: 12,
  },
  menuItemText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
});
