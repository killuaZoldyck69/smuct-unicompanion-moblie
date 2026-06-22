import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { spacing, rounded } from "../../../theme/layout";

export default function CreateCourseworkModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
}: any) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "ASSIGNMENT",
    totalMarks: "100",
  });

  const [deadline, setDeadline] = useState<Date>(
    new Date(Date.now() + 86400000),
  ); // Default +1 day
  const [showPicker, setShowPicker] = useState(false);

  // 👇 NEW: Tracks whether the Android picker is currently asking for Date or Time
  const [pickerMode, setPickerMode] = useState<"date" | "time">("date");

  const handleSubmit = () => {
    const safeDate = new Date(deadline);

    onSubmit({
      ...form,
      totalMarks: parseFloat(form.totalMarks) || 0,
      deadline: safeDate.toISOString(),
    });

    setForm({
      title: "",
      description: "",
      type: "ASSIGNMENT",
      totalMarks: "100",
    });
    setDeadline(new Date(Date.now() + 86400000));
  };

  const openPicker = () => {
    setPickerMode("date"); // Always start with the Date calendar
    setShowPicker(true);
  };

  // 👇 The Magic Sequence: Handle Date -> then Time for Android
  const handleDateChange = (event: any, selectedDate?: any) => {
    if (event?.type === "dismissed") {
      setShowPicker(false);
      return;
    }

    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      setDeadline(currentDate);

      // If we are on Android and just finished picking the DATE, instantly open the TIME picker
      if (Platform.OS === "android" && pickerMode === "date") {
        setPickerMode("time");
        setShowPicker(true); // Keep it open, but now it shows the clock!
      } else {
        // We finished picking Time (or we are on iOS), so close the picker
        setShowPicker(false);
      }
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer} edges={["top"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Coursework</Text>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={
                isPending || !form.title.trim() || !form.totalMarks.trim()
              }
            >
              {isPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryContainer}
                />
              ) : (
                <Text
                  style={[
                    styles.postTextBtn,
                    (!form.title.trim() || !form.totalMarks.trim()) && {
                      opacity: 0.5,
                    },
                  ]}
                >
                  Publish
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Title</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={form.title}
                onChangeText={(t) => setForm({ ...form, title: t })}
                placeholder="e.g. Midterm Assignment, Chapter 4 Quiz"
                placeholderTextColor={colors.outline}
              />
            </View>

            <View style={styles.rowGroup}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={form.type}
                    onValueChange={(val) => setForm({ ...form, type: val })}
                    style={{ color: colors.onSurface }}
                    dropdownIconColor={colors.primary}
                  >
                    <Picker.Item label="Assignment" value="ASSIGNMENT" />
                    <Picker.Item label="Quiz" value="QUIZ" />
                    <Picker.Item label="Presentation" value="PRESENTATION" />
                  </Picker>
                </View>
              </View>

              <View style={{ flex: 0.6, marginLeft: 8 }}>
                <Text style={styles.label}>Total Marks</Text>
                <View style={styles.marksInputWrapper}>
                  <Feather
                    name="award"
                    size={16}
                    color={colors.primary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.marksInput}
                    value={form.totalMarks}
                    onChangeText={(t) =>
                      setForm({ ...form, totalMarks: t.replace(/[^0-9]/g, "") })
                    }
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor={colors.outline}
                    maxLength={4}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.label}>Deadline & Time</Text>
            {/* 👇 Triggers the openPicker function */}
            <TouchableOpacity
              style={styles.dateBtn}
              onPress={openPicker}
              activeOpacity={0.7}
            >
              <View style={styles.dateIconWrapper}>
                <Feather name="calendar" size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.dateBtnTitle}>Select Date & Time</Text>
                <Text style={styles.dateBtnText}>
                  {new Date(deadline).toLocaleString([], {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.outline} />
            </TouchableOpacity>

            {/* 👇 iOS uses "datetime" (combines them natively). Android uses the dynamic pickerMode state. */}
            {showPicker && Platform.OS !== "web" && (
              <DateTimePicker
                value={new Date(deadline)}
                mode={Platform.OS === "ios" ? "datetime" : pickerMode}
                display="default"
                onChange={handleDateChange}
              />
            )}

            {showPicker && Platform.OS === "web" && (
              <Text style={styles.webWarning}>
                Note: Date Picker requires a physical device or emulator.
              </Text>
            )}

            <Text style={styles.label}>
              Instructions / Description (Optional)
            </Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholder="Provide clear instructions or requirements for the students..."
                placeholderTextColor={colors.outline}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: colors.surfaceContainerLowest },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.marginMobile,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceContainerHighest,
    backgroundColor: colors.surfaceContainerLowest,
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "800",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "800",
  },

  content: { padding: spacing.marginMobile, paddingBottom: 60 },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  rowGroup: { flexDirection: "row", alignItems: "flex-start", marginTop: 8 },

  inputWrapper: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  textArea: {
    height: 140,
    paddingTop: 16,
  },

  pickerContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    height: 50,
    justifyContent: "center",
  },

  marksInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    height: 50,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  marksInput: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "700",
  },

  dateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.lg,
    padding: 16,
    marginTop: 4,
  },
  dateIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryContainer + "20",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dateBtnTitle: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 2,
  },
  dateBtnText: {
    ...typography.bodyMd,
    color: colors.primary,
    fontWeight: "700",
  },

  webWarning: { color: colors.error, marginTop: 8, ...typography.labelSm },
});
