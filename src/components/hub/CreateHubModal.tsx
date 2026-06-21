import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 👈 New Import
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import SearchableTeacherSelect from "./SearchableTeacherSelect";

import { colors } from "../../theme/colors";
import { typography } from "../../theme/typography";
import { spacing, rounded } from "../../theme/layout";

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

interface ScheduleBlock {
  id: string;
  day: string;
  startTime: Date;
  endTime: Date;
  room: string;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isPending: boolean;
  teachers: any[];
  isLoadingTeachers: boolean;
  currentUser: any;
}

export default function CreateHubModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  teachers,
  isLoadingTeachers,
  currentUser,
}: Props) {
  const isTeacher = currentUser?.role === "TEACHER";
  const isCR = currentUser?.studentProfile?.isCR === true;

  const [form, setForm] = useState({
    courseName: "",
    courseCode: "",
    credit: "",
    department: "",
    batch: "",
    semesterNumber: "",
    termOffer: "",
    teacherId: "",
  });

  // Dynamic Array for Schedules
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([
    {
      id: "1",
      day: "Sunday",
      startTime: new Date(),
      endTime: new Date(),
      room: "",
    },
  ]);

  // Picker State
  const [activePicker, setActivePicker] = useState<{
    id: string;
    type: "start" | "end";
  } | null>(null);

  useEffect(() => {
    if (isVisible) {
      if (isTeacher)
        setForm((prev) => ({ ...prev, teacherId: currentUser.id }));
      else if (isCR) {
        setForm((prev) => ({
          ...prev,
          department: currentUser.studentProfile?.department || "",
          batch: currentUser.studentProfile?.batch || "",
          semesterNumber:
            currentUser.studentProfile?.currentSemester?.toString() || "",
        }));
      }
    }
  }, [isVisible, currentUser]);

  const addSchedule = () => {
    setSchedules([
      ...schedules,
      {
        id: Date.now().toString(),
        day: "Monday",
        startTime: new Date(),
        endTime: new Date(),
        room: "",
      },
    ]);
  };

  const removeSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const updateSchedule = (
    id: string,
    field: keyof ScheduleBlock,
    value: any,
  ) => {
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    if (activePicker && selectedDate) {
      const field = activePicker.type === "start" ? "startTime" : "endTime";
      updateSchedule(activePicker.id, field, selectedDate);
    }
    // Close picker automatically on Android, iOS needs explicit close if we added a done button,
    // but setting it to null handles both reasonably well in standard mode.
    setActivePicker(null);
  };

  const handleCreate = () => {
    if (
      !form.courseCode ||
      !form.courseName ||
      !form.credit ||
      !form.department ||
      !form.batch ||
      !form.semesterNumber ||
      !form.termOffer
    ) {
      return Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill out all required course details.",
      });
    }
    if (isCR && !form.teacherId) {
      return Toast.show({
        type: "error",
        text1: "Instructor Required",
        text2: "Please assign a teacher to this course.",
      });
    }

    // Format the Array of Schedules for the Backend JSON
    const formatTime = (d: Date) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const formattedSchedules = schedules.map((s) => ({
      day: s.day,
      startTime: formatTime(s.startTime),
      endTime: formatTime(s.endTime),
      room: s.room.trim() || "TBA",
    }));

    const payload = {
      ...form,
      credit: parseFloat(form.credit),
      semesterNumber: parseInt(form.semesterNumber, 10),
      weeklyClassSchedule: formattedSchedules, // 👈 Passing the JSON array!
    };

    onSubmit(payload);
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
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Course Hub</Text>
            <TouchableOpacity onPress={handleCreate} disabled={isPending}>
              {isPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryContainer}
                />
              ) : (
                <Text style={styles.postTextBtn}>Create</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.sectionHeaderBox}>
              <Feather
                name="book-open"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionHeader}>Course Information</Text>
            </View>

            <TextInput
              style={styles.input}
              value={form.courseName}
              onChangeText={(t) => setForm({ ...form, courseName: t })}
              placeholder="Course Name (e.g. Data Structures)"
            />
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={form.courseCode}
                onChangeText={(t) => setForm({ ...form, courseCode: t })}
                placeholder="Code (CSE201)"
                autoCapitalize="characters"
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={form.credit}
                onChangeText={(t) =>
                  setForm({ ...form, credit: t.replace(/[^0-9.]/g, "") })
                }
                placeholder="Credits (3.0)"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.sectionHeaderBox}>
              <Feather
                name="users"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionHeader}>Cohort Details</Text>
            </View>

            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={form.department}
                onChangeText={(t) => setForm({ ...form, department: t })}
                placeholder="Dept (CSE)"
                autoCapitalize="characters"
                editable={isTeacher}
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={form.batch}
                onChangeText={(t) => setForm({ ...form, batch: t })}
                placeholder="Batch (22nd)"
                editable={isTeacher}
              />
            </View>
            <View style={styles.rowInputs}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 8 }]}
                value={form.termOffer}
                onChangeText={(t) => setForm({ ...form, termOffer: t })}
                placeholder="Term (Fall 2026)"
              />
              <TextInput
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
                value={form.semesterNumber}
                onChangeText={(t) =>
                  setForm({ ...form, semesterNumber: t.replace(/[^0-9]/g, "") })
                }
                placeholder="Semester (5)"
                keyboardType="numeric"
                editable={isTeacher}
              />
            </View>

            {/* --- DYNAMIC CLASS SCHEDULE SECTION --- */}
            <View style={styles.sectionHeaderBox}>
              <Feather
                name="calendar"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionHeader}>Class Schedule & Rooms</Text>
            </View>

            {schedules.map((schedule, index) => (
              <View key={schedule.id} style={styles.scheduleBlock}>
                <View style={styles.scheduleBlockHeader}>
                  <Text style={styles.scheduleBlockTitle}>
                    Class #{index + 1}
                  </Text>
                  {schedules.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSchedule(schedule.id)}
                    >
                      <Feather name="trash-2" size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={schedule.day}
                    onValueChange={(val) =>
                      updateSchedule(schedule.id, "day", val)
                    }
                  >
                    {DAYS.map((d) => (
                      <Picker.Item key={d} label={d} value={d} />
                    ))}
                  </Picker>
                </View>

                <View style={styles.rowInputs}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.label}>Start Time</Text>
                    <TouchableOpacity
                      style={styles.timeBtn}
                      onPress={() =>
                        setActivePicker({ id: schedule.id, type: "start" })
                      }
                    >
                      <Text style={styles.timeBtnText}>
                        {schedule.startTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.label}>End Time</Text>
                    <TouchableOpacity
                      style={styles.timeBtn}
                      onPress={() =>
                        setActivePicker({ id: schedule.id, type: "end" })
                      }
                    >
                      <Text style={styles.timeBtnText}>
                        {schedule.endTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.label}>Room / Lab Number</Text>
                <TextInput
                  style={[styles.input, { marginBottom: 0 }]}
                  value={schedule.room}
                  onChangeText={(t) => updateSchedule(schedule.id, "room", t)}
                  placeholder="e.g. Room 402, Lab 2"
                />
              </View>
            ))}

            <TouchableOpacity
              style={styles.addScheduleBtn}
              onPress={addSchedule}
            >
              <Feather
                name="plus-circle"
                size={16}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.addScheduleText}>Add Another Class Time</Text>
            </TouchableOpacity>

            {/* Global DateTimePicker */}
            {activePicker && (
              <DateTimePicker
                value={
                  activePicker.type === "start"
                    ? schedules.find((s) => s.id === activePicker.id)!.startTime
                    : schedules.find((s) => s.id === activePicker.id)!.endTime
                }
                mode="time"
                is24Hour={false}
                display="default"
                onValueChange={handleTimeChange}
              />
            )}

            {isCR && (
              <>
                <View
                  style={[
                    styles.sectionHeaderBox,
                    { marginTop: spacing.sectionBreak },
                  ]}
                >
                  <Feather
                    name="award"
                    size={18}
                    color={colors.primary}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.sectionHeader}>
                    Instructor Assignment
                  </Text>
                </View>
                <SearchableTeacherSelect
                  teachers={teachers}
                  selectedId={form.teacherId}
                  onSelect={(id) => setForm({ ...form, teacherId: id })}
                  isLoading={isLoadingTeachers}
                />
              </>
            )}
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
  },
  cancelText: { ...typography.bodyLg, fontSize: 16, color: colors.outline },
  modalTitle: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.onSurface,
    fontWeight: "700",
  },
  postTextBtn: {
    ...typography.bodyLg,
    fontSize: 16,
    color: colors.primaryContainer,
    fontWeight: "700",
  },
  modalScrollContent: { padding: spacing.marginMobile, paddingBottom: 60 },

  sectionHeaderBox: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: spacing.stackLg,
    marginBottom: spacing.stackSm,
  },
  sectionHeader: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  label: {
    ...typography.labelSm,
    color: colors.onSurfaceVariant,
    marginBottom: 8,
    marginTop: 4,
  },

  input: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...typography.bodyMd,
    color: colors.onSurface,
    marginBottom: spacing.stackMd,
  },
  rowInputs: { flexDirection: "row", justifyContent: "space-between" },

  // Schedule Blocks
  scheduleBlock: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: spacing.stackLg,
    borderRadius: rounded.lg,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    marginBottom: spacing.stackMd,
  },
  scheduleBlockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.stackMd,
  },
  scheduleBlockTitle: {
    ...typography.labelMd,
    fontWeight: "700",
    color: colors.onSurface,
  },
  pickerContainer: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    overflow: "hidden",
    marginBottom: spacing.stackMd,
  },
  timeBtn: {
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    paddingVertical: 14,
    alignItems: "center",
  },
  timeBtnText: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
  },

  addScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 8,
    marginTop: 8,
  },
  addScheduleText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
});
