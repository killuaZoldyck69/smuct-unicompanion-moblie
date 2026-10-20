import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AcademicCalendarItem, CalendarStatus } from "@/services/calendar-service";
import { BENTO_COLORS } from "../constants";

interface CalendarActionBarProps {
  calendar: AcademicCalendarItem;
  onAddEvent: () => void;
  onImportCsv: () => void;
  onExportCsv: () => void;
  onPreviewStudentView: () => void;
  onEditAudience: () => void;
  onStatusChange: (status: CalendarStatus) => void;
  onDeleteCalendar: () => void;
}

export const CalendarActionBar: React.FC<CalendarActionBarProps> = ({
  calendar,
  onAddEvent,
  onImportCsv,
  onExportCsv,
  onPreviewStudentView,
  onEditAudience,
  onStatusChange,
  onDeleteCalendar,
}) => {
  const insets = useSafeAreaInsets();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isPub = calendar.status === "PUBLISHED";
  const isDraft = calendar.status === "DRAFT";
  const isArchived = calendar.status === "ARCHIVED";

  const handleArchiveWithConfirmation = () => {
    setIsMenuOpen(false);
    Alert.alert(
      "Archive Academic Calendar",
      "Archiving this calendar will hide it from active student and teacher dashboards while preserving all historical schedule records for accreditation and audit. You can unarchive it anytime.\n\nDo you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Archive Calendar",
          style: "default",
          onPress: () => onStatusChange("ARCHIVED"),
        },
      ],
    );
  };

  return (
    <>
      <View style={styles.primaryBar}>
        {/* + Add Event */}
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={onAddEvent}
          activeOpacity={0.8}
        >
          <Feather name="plus" size={15} color="#ffffff" />
          <Text style={styles.primaryBtnText}>Add Event</Text>
        </TouchableOpacity>

        {/* Import CSV */}
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={onImportCsv}
          activeOpacity={0.8}
        >
          <Feather name="upload" size={14} color="#0f172a" />
          <Text style={styles.outlineBtnText}>Import CSV</Text>
        </TouchableOpacity>

        {/* Preview Student View */}
        <TouchableOpacity
          style={styles.iconActionBtn}
          onPress={onPreviewStudentView}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Preview student view"
        >
          <Feather name="eye" size={16} color="#0369a1" />
        </TouchableOpacity>

        {/* More Actions Overflow (•••) */}
        <TouchableOpacity
          style={styles.iconActionBtn}
          onPress={() => setIsMenuOpen(true)}
          activeOpacity={0.8}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="More calendar actions"
        >
          <Feather name="more-horizontal" size={18} color="#0f172a" />
        </TouchableOpacity>
      </View>

      {/* Overflow Action Sheet Modal */}
      <Modal
        visible={isMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuOpen(false)}
        statusBarTranslucent={true}
      >
        <TouchableOpacity
          style={[
            styles.modalOverlay,
            { paddingTop: Math.max(insets.top, 24) },
          ]}
          activeOpacity={1}
          onPress={() => setIsMenuOpen(false)}
        >
          <View
            style={[
              styles.sheetContainer,
              { paddingBottom: Math.max(insets.bottom + 16, 24) },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>Calendar Actions</Text>
                <Text style={styles.sheetSubtitle}>
                  {calendar.semester}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsMenuOpen(false)}
                style={styles.closeBtn}
              >
                <Feather name="x" size={18} color="#0f172a" />
              </TouchableOpacity>
            </View>

            <View style={styles.actionList}>
              {/* Export CSV */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  onExportCsv();
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "#f0fdf4" }]}>
                  <Feather name="download" size={16} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>Export Calendar (CSV)</Text>
                  <Text style={styles.actionDesc}>
                    Download complete semester schedule as RFC 4180 CSV
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              {/* Edit Target Scope */}
              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  setIsMenuOpen(false);
                  onEditAudience();
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "#f0f9ff" }]}>
                  <Feather name="sliders" size={16} color="#0284c7" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.actionLabel}>
                    Edit Target Programs & Duration
                  </Text>
                  <Text style={styles.actionDesc}>
                    Update faculties, 4/6 month term structure & batch note
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#94a3b8" />
              </TouchableOpacity>

              {/* Status Transitions */}
              {isDraft && (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    onStatusChange("PUBLISHED");
                  }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: "#d1fae5" }]}>
                    <Feather name="check-circle" size={16} color="#047857" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionLabel, { color: "#047857" }]}>
                      Publish to Students
                    </Text>
                    <Text style={styles.actionDesc}>
                      Make live on student & faculty academic calendars
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#047857" />
                </TouchableOpacity>
              )}

              {isPub && (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setIsMenuOpen(false);
                    onStatusChange("DRAFT");
                  }}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: "#fef3c7" }]}>
                    <Feather name="corner-up-left" size={16} color="#b45309" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.actionLabel, { color: "#b45309" }]}>
                      Revert to Draft
                    </Text>
                    <Text style={styles.actionDesc}>
                      Take offline for administrative edits
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#b45309" />
                </TouchableOpacity>
              )}

              {isArchived ? (
                <>
                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      onStatusChange("DRAFT");
                    }}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: "#e0f2fe" }]}>
                      <Feather name="rotate-ccw" size={16} color="#0369a1" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actionLabel, { color: "#0369a1" }]}>
                        Unarchive (Restore to Draft)
                      </Text>
                      <Text style={styles.actionDesc}>
                        Move back into Drafts for active modification
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#0369a1" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionItem}
                    onPress={() => {
                      setIsMenuOpen(false);
                      onStatusChange("PUBLISHED");
                    }}
                  >
                    <View style={[styles.actionIconBox, { backgroundColor: "#d1fae5" }]}>
                      <Feather name="send" size={16} color="#047857" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actionLabel, { color: "#047857" }]}>
                        Publish Live
                      </Text>
                      <Text style={styles.actionDesc}>
                        Unarchive and publish directly to active students
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={16} color="#047857" />
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={handleArchiveWithConfirmation}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: "#f1f5f9" }]}>
                    <Feather name="archive" size={16} color="#475569" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.actionLabel}>Archive Calendar</Text>
                    <Text style={styles.actionDesc}>
                      Retire term and hide from active dashboards
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={16} color="#94a3b8" />
                </TouchableOpacity>
              )}

              {/* Delete Calendar */}
              <TouchableOpacity
                style={[styles.actionItem, styles.deleteActionItem]}
                onPress={() => {
                  setIsMenuOpen(false);
                  onDeleteCalendar();
                }}
              >
                <View style={[styles.actionIconBox, { backgroundColor: "#fee2e2" }]}>
                  <Feather name="trash-2" size={16} color="#dc2626" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.actionLabel, { color: "#dc2626" }]}>
                    Delete Calendar
                  </Text>
                  <Text style={styles.actionDesc}>
                    Permanently delete calendar and all {calendar.events?.length || 0} events
                  </Text>
                </View>
                <Feather name="chevron-right" size={16} color="#dc2626" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  primaryBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  primaryBtn: {
    flex: 1.4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: BENTO_COLORS.deepNavy,
    paddingVertical: 12,
    borderRadius: 12,
    ...BENTO_COLORS.shadow,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  outlineBtn: {
    flex: 1.2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 12,
    borderRadius: 12,
    ...BENTO_COLORS.shadow,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  iconActionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "80%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  sheetSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  actionList: {
    paddingVertical: 6,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  deleteActionItem: {
    borderBottomWidth: 0,
    marginTop: 6,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 11,
    color: "#64748b",
  },
});
