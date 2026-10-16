import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { FACULTY_COLORS } from "../../constants";
import { ConsultationSlot } from "../../types";
import { formatTimeAmPm } from "../../utils";

interface AddSlotModalProps {
  visible: boolean;
  onAdd: (slot: Omit<ConsultationSlot, "id">) => void;
  onClose: () => void;
}

// 7 individual days of the week (no dual day selectors)
const COMMON_DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const AddSlotModal = React.memo(function AddSlotModal({
  visible,
  onAdd,
  onClose,
}: AddSlotModalProps) {
  const insets = useSafeAreaInsets();
  const [day, setDay] = useState("");

  // Default times: 10:00 AM start, 11:00 AM end
  const getInitialTimes = () => {
    const start = new Date();
    start.setHours(10, 0, 0, 0);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1 hour
    return {
      startDate: start,
      endDate: end,
      startTimeStr: formatTimeAmPm(start),
      endTimeStr: formatTimeAmPm(end),
    };
  };

  const initial = getInitialTimes();
  const [startDate, setStartDate] = useState<Date>(initial.startDate);
  const [endDate, setEndDate] = useState<Date>(initial.endDate);
  const [startTime, setStartTime] = useState<string>(initial.startTimeStr);
  const [endTime, setEndTime] = useState<string>(initial.endTimeStr);

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // When start time changes, update start time and auto-fill end time to +1 hour
  const handleStartTimeChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date,
  ) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartDate(selectedDate);
      setStartTime(formatTimeAmPm(selectedDate));

      // Auto-fill end time exactly 1 hour from start time
      const autoEnd = new Date(selectedDate.getTime() + 60 * 60 * 1000);
      setEndDate(autoEnd);
      setEndTime(formatTimeAmPm(autoEnd));
    }
  };

  // When end time is manually adjusted
  const handleEndTimeChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate?: Date,
  ) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndDate(selectedDate);
      setEndTime(formatTimeAmPm(selectedDate));
    }
  };

  const handleSave = () => {
    if (!day.trim() || !startTime.trim() || !endTime.trim()) {
      return;
    }
    onAdd({
      day: day.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
    });
    setDay("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
      >
        {/* Backdrop touch to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardContainer}
          pointerEvents="box-none"
        >
          <View style={styles.dialog}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Add Consultation Hours</Text>
              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close consultation hours modal"
              >
                <Feather
                  name="x"
                  size={20}
                  color={FACULTY_COLORS.textPrimary}
                />
              </TouchableOpacity>
            </View>

            {/* Day Input Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Day</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Sunday or Monday"
                placeholderTextColor={FACULTY_COLORS.textMuted}
                value={day}
                onChangeText={setDay}
                accessible={true}
                accessibilityLabel="Consultation day input"
              />
            </View>

            {/* Auto Filler Tags for Quick Day Selection */}
            <View style={styles.tagsContainer}>
              <Text style={styles.subLabel}>Quick Select Day:</Text>
              <View style={styles.chipsRow}>
                {COMMON_DAYS.map((tag) => {
                  const isSelected = day === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.dayChip,
                        isSelected && styles.dayChipSelected,
                      ]}
                      onPress={() => setDay(tag)}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${tag}`}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          isSelected && styles.dayChipTextSelected,
                        ]}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Time Pickers (Start Time & End Time) */}
            <View style={styles.timeRow}>
              {/* Start Time */}
              <View style={styles.timeColumn}>
                <View style={styles.timeLabelRow}>
                  <Text style={styles.timeLabel}>Start Time</Text>
                </View>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowStartPicker(true)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Pick start time"
                >
                  <Feather
                    name="clock"
                    size={15}
                    color={FACULTY_COLORS.officeIconColor}
                  />
                  <Text style={styles.timePickerText}>{startTime}</Text>
                  <Feather
                    name="chevron-down"
                    size={14}
                    color={FACULTY_COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* End Time (Auto-filled +1 hr, adjustable) */}
              <View style={styles.timeColumn}>
                <View style={styles.timeLabelRow}>
                  <Text style={styles.timeLabel}>End Time</Text>
                  <Text style={styles.autoTag}>(+1 hr)</Text>
                </View>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowEndPicker(true)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Pick or adjust end time"
                >
                  <Feather
                    name="clock"
                    size={15}
                    color={FACULTY_COLORS.officeIconColor}
                  />
                  <Text style={styles.timePickerText}>{endTime}</Text>
                  <Feather
                    name="chevron-down"
                    size={14}
                    color={FACULTY_COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Modal Actions */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel consultation hours"
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  (!day.trim() || !startTime.trim() || !endTime.trim()) &&
                    styles.saveBtnDisabled,
                ]}
                onPress={handleSave}
                disabled={!day.trim() || !startTime.trim() || !endTime.trim()}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add consultation slot"
              >
                <Text style={styles.saveBtnText}>Add Slot</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* DateTimePicker instances for Android & iOS */}
        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={handleStartTimeChange}
            onDismiss={() => setShowStartPicker(false)}
            onNeutralButtonPress={() => setShowStartPicker(false)}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="time"
            is24Hour={false}
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onValueChange={handleEndTimeChange}
            onDismiss={() => setShowEndPicker(false)}
            onNeutralButtonPress={() => setShowEndPicker(false)}
          />
        )}
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  keyboardContainer: {
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    justifyContent: "center",
  },
  dialog: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: FACULTY_COLORS.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: FACULTY_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.inputBorder,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
    fontSize: 14,
    color: FACULTY_COLORS.textPrimary,
  },
  tagsContainer: {
    marginBottom: 14,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: FACULTY_COLORS.textSecondary,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  dayChip: {
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dayChipSelected: {
    backgroundColor: FACULTY_COLORS.officeBadgeBg,
    borderColor: FACULTY_COLORS.officeIconColor,
  },
  dayChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: FACULTY_COLORS.textSecondary,
  },
  dayChipTextSelected: {
    color: FACULTY_COLORS.officeIconColor,
    fontWeight: "700",
  },
  timeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 18,
  },
  timeColumn: {
    flex: 1,
  },
  timeLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    height: 18,
    marginBottom: 6,
  },
  timeLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
  },
  autoTag: {
    fontSize: 11,
    fontWeight: "600",
    color: FACULTY_COLORS.officeIconColor,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: FACULTY_COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: FACULTY_COLORS.inputBorder,
    borderRadius: 12,
    height: 46,
    paddingHorizontal: 12,
  },
  timePickerText: {
    fontSize: 13,
    fontWeight: "600",
    color: FACULTY_COLORS.textPrimary,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: FACULTY_COLORS.textSecondary,
  },
  saveBtn: {
    backgroundColor: FACULTY_COLORS.submitBtn,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
