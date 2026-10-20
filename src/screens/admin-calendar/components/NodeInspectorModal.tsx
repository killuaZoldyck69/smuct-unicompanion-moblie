import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  AcademicEventItem,
  CreateEventInput,
  EventCategory,
  UpdateEventInput,
} from "@/services/calendar-service";
import { cleanDateYmd } from "../utils/date-helpers";
import { BENTO_COLORS } from "../constants";
import { AdminConfirmModal } from "./AdminConfirmModal";

interface NodeInspectorModalProps {
  visible: boolean;
  editingEvent: AcademicEventItem | null;
  defaultWeekNumber?: number | null;
  onClose: () => void;
  onSave: (payload: CreateEventInput | UpdateEventInput) => Promise<void>;
  onDelete?: (eventId: string, title: string) => void;
}

const CATEGORY_TAGS: Array<{ key: EventCategory; label: string; color: string; bg: string; border: string }> = [
  { key: "CLASS", label: "Class", color: "#0369a1", bg: "#f0f9ff", border: "#bae6fd" },
  { key: "REGISTRATION", label: "Registration", color: "#7e22ce", bg: "#faf5ff", border: "#e9d5ff" },
  { key: "EXAM", label: "Exam", color: "#b45309", bg: "#fef3c7", border: "#fde68a" },
  { key: "DEADLINE", label: "Deadline", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" },
  { key: "HOLIDAY", label: "Holiday", color: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  { key: "MAKEUP_CLASS", label: "Makeup", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" },
  { key: "RESULT", label: "Result", color: "#6d28d9", bg: "#f5f3ff", border: "#ddd6fe" },
  { key: "ACADEMIC", label: "Academic", color: "#475569", bg: "#f8fafc", border: "#e2e8f0" },
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function formatDisplayDate(dateStr?: string | null): string {
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

export const NodeInspectorModal: React.FC<NodeInspectorModalProps> = ({
  visible,
  editingEvent,
  defaultWeekNumber,
  onClose,
  onSave,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<EventCategory>("CLASS");
  const [startDateStr, setStartDateStr] = useState("");
  const [endDateStr, setEndDateStr] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // Native Picker States
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setTitle(editingEvent.title || "");
        setCategory(editingEvent.category || "CLASS");
        setStartDateStr(cleanDateYmd(editingEvent.startDate));
        setEndDateStr(cleanDateYmd(editingEvent.endDate));
        setWeekNumber(
          editingEvent.weekNumber !== null && editingEvent.weekNumber !== undefined
            ? String(editingEvent.weekNumber)
            : "",
        );
        setRemarks(editingEvent.remarks || editingEvent.description || "");
      } else {
        setTitle("");
        setCategory("CLASS");
        setStartDateStr(cleanDateYmd(new Date().toISOString()));
        setEndDateStr("");
        setWeekNumber(
          defaultWeekNumber !== null && defaultWeekNumber !== undefined
            ? String(defaultWeekNumber)
            : "1",
        );
        setRemarks("");
      }
    }
  }, [visible, editingEvent, defaultWeekNumber]);

  const handleSubmit = async () => {
    if (!title.trim() || !startDateStr.trim()) {
      Alert.alert("Required Fields", "Node title and start date are required.");
      return;
    }

    const payload: CreateEventInput = {
      title: title.trim(),
      category,
      startDate: cleanDateYmd(startDateStr),
      endDate: endDateStr.trim() ? cleanDateYmd(endDateStr) : null,
      weekNumber: weekNumber.trim() ? parseInt(weekNumber.trim(), 10) : null,
      isHoliday: category === "HOLIDAY",
      isAllDay: true,
      remarks: remarks.trim() || null,
      description: remarks.trim() || null,
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      onClose();
    } catch (err: any) {
      Alert.alert("Save Failed", err.message || "Failed to update node.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!editingEvent || !onDelete) return;
    setIsDeleteConfirmOpen(true);
  };

  const getStartDateObj = () => {
    if (!startDateStr) return new Date();
    const parts = startDateStr.split("-");
    if (parts.length >= 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  };

  const getEndDateObj = () => {
    if (!endDateStr) return getStartDateObj();
    const parts = endDateStr.split("-");
    if (parts.length >= 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <KeyboardAvoidingView
        style={[
          styles.modalOverlay,
          { paddingTop: Math.max(insets.top, 24) },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Backdrop tap to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={styles.sheetContainer}>
          {/* Drag Handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View>
              <View style={styles.headerTitleRow}>
                <View style={styles.purpleDot} />
                <Text style={styles.sheetTitle}>Node Inspector</Text>
              </View>
              <Text style={styles.sheetSubtitle}>
                Edit calendar nodes & cohort schedules
              </Text>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={17} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Form Scroll */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* NODE TITLE */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>NODE TITLE</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Mid-term Examination - Summer 2026"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
                autoFocus={!editingEvent}
              />
            </View>

            {/* CATEGORY TAG */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>CATEGORY TAG</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {CATEGORY_TAGS.map((tag) => {
                  const isSel = category === tag.key;
                  return (
                    <TouchableOpacity
                      key={tag.key}
                      style={[
                        styles.catTag,
                        {
                          backgroundColor: isSel ? tag.bg : "#ffffff",
                          borderColor: isSel ? tag.border : "#e2e8f0",
                        },
                      ]}
                      onPress={() => setCategory(tag.key)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.catTagText,
                          { color: isSel ? tag.color : "#64748b" },
                        ]}
                      >
                        {tag.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* START DATE & END DATE ROW */}
            <View style={styles.twoColRow}>
              {/* Start Date */}
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>START DATE</Text>
                <TouchableOpacity
                  style={styles.datePickerInput}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.datePickerText}>
                    {formatDisplayDate(startDateStr) || "Select Start Date"}
                  </Text>
                  <Feather name="calendar" size={15} color="#0284c7" />
                </TouchableOpacity>
              </View>

              {/* End Date */}
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>END DATE</Text>
                <TouchableOpacity
                  style={styles.datePickerInput}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.datePickerText}>
                    {formatDisplayDate(endDateStr) || "Single Day"}
                  </Text>
                  <Feather name="calendar" size={15} color="#9333ea" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Week & Remarks Row */}
            <View style={styles.twoColRow}>
              <View style={{ width: 90 }}>
                <Text style={styles.fieldLabel}>WEEK #</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 1"
                  placeholderTextColor="#94a3b8"
                  value={weekNumber}
                  onChangeText={setWeekNumber}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>SCHEDULE NOTES / REMARKS</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Offline on campus • Multi-shift"
                  placeholderTextColor="#94a3b8"
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>
            </View>

            {/* Native Pickers */}
            {showStartPicker && (
              <DateTimePicker
                value={getStartDateObj()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  setShowStartPicker(false);
                  if (selectedDate) {
                    setStartDateStr(cleanDateYmd(selectedDate.toISOString()));
                  }
                }}
              />
            )}

            {showEndPicker && (
              <DateTimePicker
                value={getEndDateObj()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, selectedDate) => {
                  setShowEndPicker(false);
                  if (selectedDate) {
                    setEndDateStr(cleanDateYmd(selectedDate.toISOString()));
                  }
                }}
              />
            )}
          </ScrollView>

          {/* Sticky Footer */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom + 14, 22) },
            ]}
          >
            {editingEvent && onDelete ? (
              <TouchableOpacity
                style={styles.deleteSquircleBtn}
                onPress={handleDelete}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Delete event node"
              >
                <Feather name="trash-2" size={18} color="#e11d48" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[
                styles.commitBtn,
                isSubmitting && { opacity: 0.6 },
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.commitBtnText}>
                {isSubmitting
                  ? "COMMITTING..."
                  : editingEvent
                    ? "COMMIT NODE UPDATES"
                    : "CREATE CALENDAR NODE"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>

      <AdminConfirmModal
        visible={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        variant="delete"
        title="Delete Calendar Node"
        targetBadge={editingEvent?.title}
        message={`Are you sure you want to permanently remove "${editingEvent?.title}" from this schedule stream?`}
        confirmLabel="Delete Node"
        onConfirm={() => {
          setIsDeleteConfirmOpen(false);
          if (editingEvent && onDelete) {
            onDelete(editingEvent.id, editingEvent.title);
            onClose();
          }
        }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: "88%",
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#cbd5e1",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  purpleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366f1",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.2,
  },
  sheetSubtitle: {
    fontSize: 11,
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
  formScroll: {
    paddingHorizontal: 20,
  },
  formScrollContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  categoryScroll: {
    flexDirection: "row",
    gap: 8,
  },
  catTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  catTagText: {
    fontSize: 12,
    fontWeight: "700",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  datePickerInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  datePickerText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0f172a",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  deleteSquircleBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecdd3",
    justifyContent: "center",
    alignItems: "center",
  },
  commitBtn: {
    flex: 1,
    backgroundColor: "#0b1329",
    borderRadius: 24,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  commitBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.6,
  },
});
