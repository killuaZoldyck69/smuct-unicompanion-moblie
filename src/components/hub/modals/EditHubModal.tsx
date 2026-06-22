import React, { useState, useEffect } from "react";
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

const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Safe Time Parser for Cross-Platform React Native (e.g. "10:30 AM" -> Date object)
const parseTime = (timeStr: string) => {
  if (!timeStr) return new Date();
  try {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    let h = parseInt(hours, 10);
    if (modifier === "PM" && h < 12) h += 12;
    if (modifier === "AM" && h === 12) h = 0;
    const d = new Date();
    d.setHours(h, parseInt(minutes, 10), 0, 0);
    return d;
  } catch (e) {
    return new Date();
  }
};

interface ScheduleBlock {
  id: string;
  day: string;
  startTime: Date;
  endTime: Date;
  room: string;
}

type PickerConfig =
  | { target: "schedule"; id: string; type: "start" | "end" }
  | { target: "midterm"; mode: "date" | "time" }
  | { target: "final"; mode: "date" | "time" };

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isPending: boolean;
  hubDetails: any;
}

export default function EditHubModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  hubDetails,
}: Props) {
  // Core Info State
  const [form, setForm] = useState({
    courseName: "",
    department: "",
    batch: "",
    termOffer: "",
  });

  // Schedule State
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);

  // Exam States
  const [midtermDate, setMidtermDate] = useState<Date | null>(null);
  const [midtermRoom, setMidtermRoom] = useState("");
  const [finalDate, setFinalDate] = useState<Date | null>(null);
  const [finalRoom, setFinalRoom] = useState("");

  // Universal Picker State
  const [activePicker, setActivePicker] = useState<PickerConfig | null>(null);

  // Pre-fill the form when the modal opens
  useEffect(() => {
    if (isVisible && hubDetails) {
      setForm({
        courseName: hubDetails.courseName || "",
        department: hubDetails.department || "",
        batch: hubDetails.batch || "",
        termOffer: hubDetails.termOffer || "",
      });

      // Parse JSON schedules
      if (Array.isArray(hubDetails.weeklyClassSchedule)) {
        setSchedules(
          hubDetails.weeklyClassSchedule.map((s: any, i: number) => ({
            id: String(Date.now() + i),
            day: s.day || "Monday",
            startTime: parseTime(s.startTime),
            endTime: parseTime(s.endTime),
            room: s.room || "",
          })),
        );
      } else {
        setSchedules([]);
      }

      // 🔥 FIX: Parse the new JSON termExams array back into local React State
      if (Array.isArray(hubDetails.termExams)) {
        // Midterm Parsing
        const m = hubDetails.termExams.find((e: any) => e.type === "Midterm");
        if (m && m.date) {
          const md = new Date(m.date);
          if (m.time) {
            const mt = parseTime(m.time);
            md.setHours(mt.getHours(), mt.getMinutes());
          }
          setMidtermDate(md);
        } else {
          setMidtermDate(null);
        }
        setMidtermRoom(m?.room || "");

        // Final Parsing
        const f = hubDetails.termExams.find((e: any) => e.type === "Final");
        if (f && f.date) {
          const fd = new Date(f.date);
          if (f.time) {
            const ft = parseTime(f.time);
            fd.setHours(ft.getHours(), ft.getMinutes());
          }
          setFinalDate(fd);
        } else {
          setFinalDate(null);
        }
        setFinalRoom(f?.room || "");
      }
    }
  }, [isVisible, hubDetails]);

  // --- Schedule Handlers ---
  const addSchedule = () =>
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
  const removeSchedule = (id: string) =>
    setSchedules(schedules.filter((s) => s.id !== id));
  const updateSchedule = (id: string, field: keyof ScheduleBlock, value: any) =>
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  // --- Universal Picker Handler ---
  const handlePickerChange = (event: any, selectedDate?: Date) => {
    if (!selectedDate || !activePicker) {
      setActivePicker(null);
      return;
    }

    if (activePicker.target === "schedule") {
      const field = activePicker.type === "start" ? "startTime" : "endTime";
      updateSchedule(activePicker.id, field, selectedDate);
    } else if (activePicker.target === "midterm") {
      const current = midtermDate ? new Date(midtermDate) : new Date();
      if (activePicker.mode === "date") {
        current.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
      } else {
        current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      }
      setMidtermDate(current);
    } else if (activePicker.target === "final") {
      const current = finalDate ? new Date(finalDate) : new Date();
      if (activePicker.mode === "date") {
        current.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        );
      } else {
        current.setHours(selectedDate.getHours(), selectedDate.getMinutes());
      }
      setFinalDate(current);
    }

    setActivePicker(null);
  };

  const getPickerValue = () => {
    if (!activePicker) return new Date();
    if (activePicker.target === "schedule") {
      const s = schedules.find((sch) => sch.id === activePicker.id);
      return activePicker.type === "start"
        ? s?.startTime || new Date()
        : s?.endTime || new Date();
    }
    if (activePicker.target === "midterm") return midtermDate || new Date();
    if (activePicker.target === "final") return finalDate || new Date();
    return new Date();
  };

  // --- Submission ---
  const handleSubmit = () => {
    const formatTime = (d: Date) =>
      d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const formattedSchedules = schedules.map((s) => ({
      day: s.day,
      startTime: formatTime(s.startTime),
      endTime: formatTime(s.endTime),
      room: s.room.trim() || "TBA",
    }));

    // 🔥 FIX: Construct the `termExams` array perfectly formatted for your backend Schema
    const formattedTermExams = [];

    if (midtermDate || midtermRoom) {
      formattedTermExams.push({
        type: "Midterm",
        date: midtermDate ? midtermDate.toISOString().split("T")[0] : undefined, // Formats as YYYY-MM-DD
        time: midtermDate ? formatTime(midtermDate) : undefined, // Formats as HH:MM AM/PM
        room: midtermRoom.trim() || undefined,
      });
    }

    if (finalDate || finalRoom) {
      formattedTermExams.push({
        type: "Final",
        date: finalDate ? finalDate.toISOString().split("T")[0] : undefined, // Formats as YYYY-MM-DD
        time: finalDate ? formatTime(finalDate) : undefined, // Formats as HH:MM AM/PM
        room: finalRoom.trim() || undefined,
      });
    }

    const payload = {
      ...form,
      weeklyClassSchedule: formattedSchedules,
      // Pass the array directly to match your Zod Schema!
      termExams: formattedTermExams.length > 0 ? formattedTermExams : undefined,
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
            <Text style={styles.modalTitle}>Edit Hub Details</Text>
            <TouchableOpacity onPress={handleSubmit} disabled={isPending}>
              {isPending ? (
                <ActivityIndicator
                  size="small"
                  color={colors.primaryContainer}
                />
              ) : (
                <Text style={styles.postTextBtn}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {/* CORE INFO */}
            <View style={styles.sectionHeaderBox}>
              <Feather
                name="book-open"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionHeader}>Course Information</Text>
            </View>
            <Text style={styles.label}>Course Name</Text>
            <TextInput
              style={styles.input}
              value={form.courseName}
              onChangeText={(t) => setForm({ ...form, courseName: t })}
            />

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
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Department</Text>
                <TextInput
                  style={styles.input}
                  value={form.department}
                  onChangeText={(t) => setForm({ ...form, department: t })}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Batch</Text>
                <TextInput
                  style={styles.input}
                  value={form.batch}
                  onChangeText={(t) => setForm({ ...form, batch: t })}
                />
              </View>
            </View>
            <Text style={styles.label}>Term / Semester</Text>
            <TextInput
              style={styles.input}
              value={form.termOffer}
              onChangeText={(t) => setForm({ ...form, termOffer: t })}
            />

            {/* CLASS SCHEDULES */}
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
                  <TouchableOpacity onPress={() => removeSchedule(schedule.id)}>
                    <Feather name="trash-2" size={18} color={colors.error} />
                  </TouchableOpacity>
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
                        setActivePicker({
                          target: "schedule",
                          id: schedule.id,
                          type: "start",
                        })
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
                        setActivePicker({
                          target: "schedule",
                          id: schedule.id,
                          type: "end",
                        })
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
              <Text style={styles.addScheduleText}>Add Class Time</Text>
            </TouchableOpacity>

            {/* MIDTERM EXAM */}
            <View
              style={[
                styles.sectionHeaderBox,
                { marginTop: spacing.sectionBreak },
              ]}
            >
              <Feather
                name="edit-3"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionHeader}>Midterm Exam</Text>
            </View>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() =>
                    setActivePicker({ target: "midterm", mode: "date" })
                  }
                >
                  <Text style={styles.timeBtnText}>
                    {midtermDate
                      ? midtermDate.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      : "Set Date"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() =>
                    setActivePicker({ target: "midterm", mode: "time" })
                  }
                >
                  <Text style={styles.timeBtnText}>
                    {midtermDate
                      ? midtermDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Set Time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.label}>Room Number</Text>
            <TextInput
              style={styles.input}
              value={midtermRoom}
              onChangeText={setMidtermRoom}
              placeholder="e.g. 402"
            />

            {/* FINAL EXAM */}
            <View style={styles.sectionHeaderBox}>
              <Feather
                name="award"
                size={18}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.sectionHeader}>Final Exam</Text>
            </View>
            <View style={styles.rowInputs}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.label}>Date</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() =>
                    setActivePicker({ target: "final", mode: "date" })
                  }
                >
                  <Text style={styles.timeBtnText}>
                    {finalDate
                      ? finalDate.toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                        })
                      : "Set Date"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.label}>Time</Text>
                <TouchableOpacity
                  style={styles.timeBtn}
                  onPress={() =>
                    setActivePicker({ target: "final", mode: "time" })
                  }
                >
                  <Text style={styles.timeBtnText}>
                    {finalDate
                      ? finalDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Set Time"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text style={styles.label}>Room Number</Text>
            <TextInput
              style={styles.input}
              value={finalRoom}
              onChangeText={setFinalRoom}
              placeholder="e.g. 402"
            />

            {/* Global DateTimePicker */}
            {activePicker && (
              <DateTimePicker
                value={getPickerValue()}
                mode={
                  activePicker.target === "schedule"
                    ? "time"
                    : activePicker.mode
                }
                is24Hour={false}
                display="default"
                onValueChange={handlePickerChange}
              />
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
