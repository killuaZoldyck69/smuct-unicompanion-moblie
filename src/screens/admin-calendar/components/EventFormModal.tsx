import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AcademicEventItem,
  CreateEventInput,
  EventCategory,
  UpdateEventInput,
} from "@/services/calendar-service";
import {
  ALL_EVENT_CATEGORIES,
  BENTO_COLORS,
  CATEGORY_VISUALS,
} from "../constants";
import { cleanDateYmd } from "../utils/date-helpers";
import { AdminConfirmModal } from "./AdminConfirmModal";

interface EventFormModalProps {
  visible: boolean;
  editingEvent: AcademicEventItem | null;
  defaultWeekNumber?: number | null;
  onClose: () => void;
  onSave: (payload: CreateEventInput | UpdateEventInput) => Promise<void>;
  onDelete?: (eventId: string, title: string) => void;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  visible,
  editingEvent,
  defaultWeekNumber,
  onClose,
  onSave,
  onDelete,
}) => {
  const insets = useSafeAreaInsets();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("CLASS");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekNumber, setWeekNumber] = useState("");
  const [isHoliday, setIsHoliday] = useState(false);
  const [isAllDay, setIsAllDay] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingEvent) {
        setTitle(editingEvent.title || "");
        setDescription(editingEvent.description || "");
        setCategory(editingEvent.category || "CLASS");
        // Sanitize raw ISO timestamps to clean YYYY-MM-DD
        setStartDate(cleanDateYmd(editingEvent.startDate));
        setEndDate(cleanDateYmd(editingEvent.endDate));
        setWeekNumber(
          editingEvent.weekNumber !== null && editingEvent.weekNumber !== undefined
            ? String(editingEvent.weekNumber)
            : "",
        );
        setIsHoliday(editingEvent.isHoliday || false);
        setIsAllDay(editingEvent.isAllDay !== false);
        setRemarks(editingEvent.remarks || "");
      } else {
        // Add Mode
        setTitle("");
        setDescription("");
        setCategory("CLASS");
        setStartDate(new Date().toISOString().split("T")[0]);
        setEndDate("");
        setWeekNumber(
          defaultWeekNumber !== null && defaultWeekNumber !== undefined
            ? String(defaultWeekNumber)
            : "1",
        );
        setIsHoliday(false);
        setIsAllDay(true);
        setRemarks("");
      }
    }
  }, [visible, editingEvent, defaultWeekNumber]);

  const handleSubmit = async () => {
    if (!title.trim() || !startDate.trim()) {
      Alert.alert(
        "Required Fields",
        "Please enter an event title and start date (YYYY-MM-DD).",
      );
      return;
    }

    const payload: CreateEventInput = {
      title: title.trim(),
      description: description.trim() || null,
      category,
      startDate: cleanDateYmd(startDate.trim()),
      endDate: endDate.trim() ? cleanDateYmd(endDate.trim()) : null,
      weekNumber: weekNumber.trim() ? parseInt(weekNumber.trim(), 10) : null,
      isHoliday,
      isAllDay,
      remarks: remarks.trim() || null,
    };

    try {
      setIsSubmitting(true);
      await onSave(payload);
      onClose();
    } catch (err: any) {
      Alert.alert("Save Failed", err.message || "Failed to save calendar event.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = () => {
    if (!editingEvent || !onDelete) return;
    setIsDeleteConfirmOpen(true);
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
          {/* Top Sheet Header */}
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.sheetHeading}>
                {editingEvent ? "Edit Calendar Event" : "Add Calendar Event"}
              </Text>
              <Text style={styles.sheetSubheading}>
                {editingEvent
                  ? "Update timeline schedule details"
                  : "Insert a new academic milestone into this semester"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={18} color="#0f172a" />
            </TouchableOpacity>
          </View>

          {/* Scrollable Form Fields */}
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={styles.formScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* 1. EVENT TITLE (ALWAYS VISIBLE AT TOP) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>
                Event Title <Text style={styles.requiredAsterisk}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Mid-term Examination or Classes Start"
                placeholderTextColor="#94a3b8"
                value={title}
                onChangeText={setTitle}
                autoFocus={!editingEvent}
              />
            </View>

            {/* 2. CATEGORY CHIP SELECTOR (SUPPORTING ALL 8 CATEGORIES) */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Event Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {ALL_EVENT_CATEGORIES.map((cat) => {
                  const visual = CATEGORY_VISUALS[cat];
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: isSelected
                            ? BENTO_COLORS.deepNavy
                            : visual.bg,
                          borderColor: isSelected
                            ? BENTO_COLORS.deepNavy
                            : visual.border,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={visual.icon}
                        size={12}
                        color={isSelected ? "#ffffff" : visual.text}
                      />
                      <Text
                        style={[
                          styles.categoryChipText,
                          { color: isSelected ? "#ffffff" : visual.text },
                        ]}
                      >
                        {visual.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* 3. DATES ROW */}
            <View style={styles.twoColRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>
                  Start Date (YYYY-MM-DD){" "}
                  <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="2026-08-22"
                  placeholderTextColor="#94a3b8"
                  value={startDate}
                  onChangeText={setStartDate}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>End Date (Optional)</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="2026-08-28"
                  placeholderTextColor="#94a3b8"
                  value={endDate}
                  onChangeText={setEndDate}
                />
              </View>
            </View>

            {/* 4. WEEK NUMBER & OFFICIAL REMARKS */}
            <View style={styles.twoColRow}>
              <View style={{ width: 100 }}>
                <Text style={styles.fieldLabel}>Week #</Text>
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
                <Text style={styles.fieldLabel}>Official Remarks</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 06 class days, Offline Mode"
                  placeholderTextColor="#94a3b8"
                  value={remarks}
                  onChangeText={setRemarks}
                />
              </View>
            </View>

            {/* 5. DESCRIPTION */}
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Description (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Additional details, schedule notes, guidelines..."
                placeholderTextColor="#94a3b8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* 6. SWITCHES */}
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Is Holiday / Recess</Text>
                <Text style={styles.switchSub}>
                  Highlights as official university holiday
                </Text>
              </View>
              <Switch
                value={isHoliday}
                onValueChange={setIsHoliday}
                trackColor={{ false: "#cbd5e1", true: "#10b981" }}
                thumbColor="#ffffff"
              />
            </View>

            <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>All-Day Event</Text>
                <Text style={styles.switchSub}>
                  Applies full day across all class schedules
                </Text>
              </View>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: "#cbd5e1", true: BENTO_COLORS.deepNavy }}
                thumbColor="#ffffff"
              />
            </View>
          </ScrollView>

          {/* PINNED STICKY BOTTOM ACTIONS FOOTER */}
          <View
            style={[
              styles.stickyFooter,
              { paddingBottom: Math.max(insets.bottom + 14, 22) },
            ]}
          >
            {editingEvent && onDelete ? (
              <View style={styles.editFooterRow}>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={handleDelete}
                  activeOpacity={0.8}
                >
                  <Feather name="trash-2" size={16} color="#dc2626" />
                  <Text style={styles.deleteBtnText}>Delete Event</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    isSubmitting && { opacity: 0.6 },
                  ]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.saveBtnFull,
                  isSubmitting && { opacity: 0.6 },
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Text style={styles.saveBtnText}>
                  {isSubmitting ? "Adding..." : "Add Event"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <AdminConfirmModal
        visible={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        variant="delete"
        title="Delete Calendar Event"
        targetBadge={editingEvent?.title}
        message={`Are you sure you want to permanently remove "${editingEvent?.title}"?`}
        confirmLabel="Delete Event"
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
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sheetHeading: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },
  sheetSubheading: {
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
  formScroll: {
    paddingHorizontal: 20,
  },
  formScrollContent: {
    paddingVertical: 16,
    paddingBottom: 24,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  requiredAsterisk: {
    color: "#dc2626",
    fontWeight: "800",
  },
  textInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  categoryScroll: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0f172a",
  },
  switchSub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 1,
  },
  stickyFooter: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    backgroundColor: "#ffffff",
  },
  editFooterRow: {
    flexDirection: "row",
    gap: 10,
  },
  deleteBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    paddingVertical: 13,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#dc2626",
  },
  saveBtn: {
    flex: 1.5,
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnFull: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
