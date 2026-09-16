import React, { useState, useEffect, createElement } from "react";
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

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  borderHover: "rgba(15, 23, 42, 0.16)",
  borderActive: "#0f172a",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

const DAYS = [
  { full: "Saturday", short: "Sat" },
  { full: "Sunday", short: "Sun" },
  { full: "Monday", short: "Mon" },
  { full: "Tuesday", short: "Tue" },
  { full: "Wednesday", short: "Wed" },
  { full: "Thursday", short: "Thu" },
  { full: "Friday", short: "Fri" },
];

// Safe Time Parser (e.g. "10:30 AM" -> Date object)
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

const toTimeString = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toDateString = (d: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDisplayTime = (d: Date) => {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDisplayDate = (d: Date) => {
  return d.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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
    section: "",
    termOffer: "",
    meetUrl: "",
  });

  // Schedule State
  const [schedules, setSchedules] = useState<ScheduleBlock[]>([]);

  // Exam States
  const [midtermDate, setMidtermDate] = useState<Date | null>(null);
  const [midtermRoom, setMidtermRoom] = useState("");
  const [finalDate, setFinalDate] = useState<Date | null>(null);
  const [finalRoom, setFinalRoom] = useState("");

  // Universal Picker State (Native)
  const [activePicker, setActivePicker] = useState<PickerConfig | null>(null);

  // Pre-fill the form when modal opens or hubDetails update
  useEffect(() => {
    if (isVisible && hubDetails) {
      setForm({
        courseName: hubDetails.courseName || "",
        department: hubDetails.department || "",
        batch: hubDetails.batch || "",
        section: hubDetails.section || "",
        termOffer: hubDetails.termOffer || "",
        meetUrl: hubDetails.meetUrl || "",
      });

      // Parse schedules
      if (Array.isArray(hubDetails.weeklyClassSchedule)) {
        setSchedules(
          hubDetails.weeklyClassSchedule.map((s: any, i: number) => ({
            id: String(Date.now() + i),
            day: s.day || "Saturday",
            startTime: parseTime(s.startTime),
            endTime: parseTime(s.endTime),
            room: s.room || "",
          })),
        );
      } else {
        setSchedules([]);
      }

      // Parse Term Exams
      if (Array.isArray(hubDetails.termExams)) {
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
        day: "Saturday",
        startTime: parseTime("10:00 AM"),
        endTime: parseTime("11:20 AM"),
        room: "",
      },
    ]);

  const removeSchedule = (id: string) =>
    setSchedules(schedules.filter((s) => s.id !== id));

  const updateSchedule = (id: string, field: keyof ScheduleBlock, value: any) =>
    setSchedules(
      schedules.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );

  // --- Native Picker Handler ---
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
    const formattedSchedules = schedules.map((s) => ({
      day: s.day,
      startTime: formatDisplayTime(s.startTime),
      endTime: formatDisplayTime(s.endTime),
      room: s.room.trim() || "TBA",
    }));

    const formattedTermExams = [];

    if (midtermDate || midtermRoom.trim()) {
      formattedTermExams.push({
        type: "Midterm",
        date: midtermDate ? toDateString(midtermDate) : undefined,
        time: midtermDate ? formatDisplayTime(midtermDate) : undefined,
        room: midtermRoom.trim() || undefined,
      });
    }

    if (finalDate || finalRoom.trim()) {
      formattedTermExams.push({
        type: "Final",
        date: finalDate ? toDateString(finalDate) : undefined,
        time: finalDate ? formatDisplayTime(finalDate) : undefined,
        room: finalRoom.trim() || undefined,
      });
    }

    const payload = {
      courseName: form.courseName.trim(),
      department: form.department.trim(),
      batch: form.batch.trim(),
      section: form.section.trim() || undefined,
      termOffer: form.termOffer.trim(),
      meetUrl: form.meetUrl.trim() ? form.meetUrl.trim() : null,
      weeklyClassSchedule: formattedSchedules,
      termExams: formattedTermExams.length > 0 ? formattedTermExams : undefined,
    };

    onSubmit(payload);
  };

  const isFormValid =
    form.courseName.trim().length > 0 &&
    form.department.trim().length > 0 &&
    form.batch.trim().length > 0;

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* Top Bento Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing hub details"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.headerCenterCol}>
              <Text style={styles.headerTitle}>Edit Course Hub</Text>
              <Text style={styles.headerSubtitle}>
                Update cohort, schedules & class link
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || !isFormValid}
              style={[
                styles.saveBtn,
                (!isFormValid || isPending) && styles.saveBtnDisabled,
              ]}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save hub details"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="check"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 5 }}
                  />
                  <Text style={styles.saveBtnText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Content */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. COURSE & COHORT INFORMATION */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionIconBox,
                    { backgroundColor: BENTO.blueSoft },
                  ]}
                >
                  <Feather
                    name="book-open"
                    size={14}
                    color={BENTO.blueText}
                  />
                </View>
                <Text style={styles.sectionTitle}>Course & Cohort</Text>
              </View>

              {/* Course Title */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>COURSE NAME</Text>
                <View style={styles.inputCard}>
                  <Feather
                    name="book"
                    size={16}
                    color={BENTO.slate}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={form.courseName}
                    onChangeText={(t) => setForm({ ...form, courseName: t })}
                    placeholder="e.g. Data Structures & Algorithms"
                    placeholderTextColor={BENTO.slateLight}
                    accessible={true}
                    accessibilityLabel="Course Name"
                  />
                </View>
              </View>

              {/* 2-Column Cohort Grid: Department & Batch */}
              <View style={styles.gridRow}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>DEPARTMENT</Text>
                  <View style={styles.inputCard}>
                    <Feather
                      name="briefcase"
                      size={15}
                      color={BENTO.slate}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={form.department}
                      onChangeText={(t) => setForm({ ...form, department: t })}
                      placeholder="e.g. CSE"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Department"
                    />
                  </View>
                </View>

                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>BATCH</Text>
                  <View style={styles.inputCard}>
                    <Feather
                      name="users"
                      size={15}
                      color={BENTO.slate}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={form.batch}
                      onChangeText={(t) => setForm({ ...form, batch: t })}
                      placeholder="e.g. 37"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Batch"
                    />
                  </View>
                </View>
              </View>

              {/* 2-Column Cohort Grid: Section & Term/Semester */}
              <View style={styles.gridRow}>
                <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.fieldLabel}>SECTION</Text>
                  <View style={styles.inputCard}>
                    <Feather
                      name="layers"
                      size={15}
                      color={BENTO.slate}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={form.section}
                      onChangeText={(t) => setForm({ ...form, section: t })}
                      placeholder="e.g. A or 6B"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Section"
                    />
                  </View>
                </View>

                <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.fieldLabel}>TERM / SEMESTER</Text>
                  <View style={styles.inputCard}>
                    <Feather
                      name="clock"
                      size={15}
                      color={BENTO.slate}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={form.termOffer}
                      onChangeText={(t) => setForm({ ...form, termOffer: t })}
                      placeholder="e.g. Spring 2026"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Term or Semester"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* 2. ONLINE CLASS (GOOGLE MEET) BENTO CARD */}
            <View style={styles.sectionBlock}>
              <View style={styles.bentoMeetCard}>
                <View style={styles.meetHeaderRow}>
                  <View style={styles.meetIconTitleBox}>
                    <View style={styles.meetIconCircle}>
                      <Feather name="video" size={16} color={BENTO.blueText} />
                    </View>
                    <View>
                      <Text style={styles.meetCardTitle}>
                        Online Classroom (Google Meet)
                      </Text>
                      <Text style={styles.meetCardSubtitle}>
                        Live video lecture deep link
                      </Text>
                    </View>
                  </View>

                  {form.meetUrl.trim() ? (
                    <View style={styles.configuredBadge}>
                      <Feather
                        name="check"
                        size={11}
                        color={BENTO.mintText}
                        style={{ marginRight: 3 }}
                      />
                      <Text style={styles.configuredBadgeText}>Active</Text>
                    </View>
                  ) : (
                    <View style={styles.optionalBadge}>
                      <Text style={styles.optionalBadgeText}>Optional</Text>
                    </View>
                  )}
                </View>

                <View style={styles.inputCard}>
                  <Feather
                    name="link"
                    size={16}
                    color={BENTO.slate}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={form.meetUrl}
                    onChangeText={(t) => setForm({ ...form, meetUrl: t })}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    placeholderTextColor={BENTO.slateLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    accessible={true}
                    accessibilityLabel="Google Meet Link"
                  />
                  {form.meetUrl.trim().length > 0 && (
                    <TouchableOpacity
                      onPress={() => setForm({ ...form, meetUrl: "" })}
                      style={styles.clearIconBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clear Meet URL"
                    >
                      <Feather name="x" size={14} color={BENTO.slate} />
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.meetHelperRow}>
                  <Feather
                    name="info"
                    size={13}
                    color={BENTO.slate}
                    style={{ marginRight: 6, marginTop: 1 }}
                  />
                  <Text style={styles.meetHelperText}>
                    Teachers can toggle live class from the hub banner. Students
                    and faculty can join lectures in 1 tap.
                  </Text>
                </View>
              </View>
            </View>

            {/* 3. CLASS SCHEDULE & ROUTINE */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionIconBox,
                    { backgroundColor: BENTO.purpleSoft },
                  ]}
                >
                  <Feather
                    name="calendar"
                    size={14}
                    color={BENTO.purpleText}
                  />
                </View>
                <Text style={styles.sectionTitle}>Weekly Schedule & Rooms</Text>
                <View style={styles.badgeCounter}>
                  <Text style={styles.badgeCounterText}>
                    {schedules.length}{" "}
                    {schedules.length === 1 ? "Session" : "Sessions"}
                  </Text>
                </View>
              </View>

              {schedules.map((schedule, index) => (
                <View key={schedule.id} style={styles.scheduleCard}>
                  {/* Schedule Card Top Bar */}
                  <View style={styles.scheduleCardHeader}>
                    <View style={styles.scheduleBadgePill}>
                      <Text style={styles.scheduleBadgePillText}>
                        Class #{index + 1}
                      </Text>
                    </View>

                    <TouchableOpacity
                      onPress={() => removeSchedule(schedule.id)}
                      style={styles.deleteScheduleBtn}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Delete class session ${index + 1}`}
                    >
                      <Feather
                        name="trash-2"
                        size={14}
                        color={BENTO.roseText}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Day of Week Selector (1-Tap Campus Bento Pills) */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.fieldLabel}>DAY OF WEEK</Text>
                    <View style={styles.dayPillsContainer}>
                      {DAYS.map((d) => {
                        const isSelected =
                          schedule.day.toLowerCase() === d.full.toLowerCase();
                        return (
                          <TouchableOpacity
                            key={d.full}
                            onPress={() =>
                              updateSchedule(schedule.id, "day", d.full)
                            }
                            style={[
                              styles.dayPill,
                              isSelected && styles.dayPillActive,
                            ]}
                            activeOpacity={0.75}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Select ${d.full}`}
                          >
                            <Text
                              style={[
                                styles.dayPillText,
                                isSelected && styles.dayPillTextActive,
                              ]}
                            >
                              {d.short}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Time Pickers Row */}
                  <View style={styles.gridRow}>
                    {/* Start Time Card */}
                    <View
                      style={[styles.fieldGroup, { flex: 1, marginRight: 6 }]}
                    >
                      <Text style={styles.fieldLabel}>START TIME</Text>
                      <TouchableOpacity
                        style={styles.timePickerCard}
                        onPress={() => {
                          if (Platform.OS !== "web") {
                            setActivePicker({
                              target: "schedule",
                              id: schedule.id,
                              type: "start",
                            });
                          }
                        }}
                        activeOpacity={Platform.OS === "web" ? 1 : 0.75}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Class ${index + 1} start time`}
                      >
                        <View
                          style={[
                            styles.timeIconBox,
                            { backgroundColor: BENTO.blueSoft },
                          ]}
                        >
                          <Feather
                            name="clock"
                            size={14}
                            color={BENTO.blueText}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timeValueText}>
                            {formatDisplayTime(schedule.startTime)}
                          </Text>
                        </View>

                        {/* On Web: Invisible overlay input for native browser picker */}
                        {Platform.OS === "web" &&
                          createElement("input", {
                            type: "time",
                            value: toTimeString(schedule.startTime),
                            onChange: (e: any) => {
                              if (e?.target?.value) {
                                const [h, m] = e.target.value
                                  .split(":")
                                  .map(Number);
                                const newD = new Date(schedule.startTime);
                                newD.setHours(h, m, 0, 0);
                                updateSchedule(schedule.id, "startTime", newD);
                              }
                            },
                            style: {
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                              cursor: "pointer",
                              zIndex: 10,
                            },
                          })}
                      </TouchableOpacity>
                    </View>

                    {/* End Time Card */}
                    <View
                      style={[styles.fieldGroup, { flex: 1, marginLeft: 6 }]}
                    >
                      <Text style={styles.fieldLabel}>END TIME</Text>
                      <TouchableOpacity
                        style={styles.timePickerCard}
                        onPress={() => {
                          if (Platform.OS !== "web") {
                            setActivePicker({
                              target: "schedule",
                              id: schedule.id,
                              type: "end",
                            });
                          }
                        }}
                        activeOpacity={Platform.OS === "web" ? 1 : 0.75}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Class ${index + 1} end time`}
                      >
                        <View
                          style={[
                            styles.timeIconBox,
                            { backgroundColor: BENTO.amberSoft },
                          ]}
                        >
                          <Feather
                            name="clock"
                            size={14}
                            color={BENTO.amberText}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.timeValueText}>
                            {formatDisplayTime(schedule.endTime)}
                          </Text>
                        </View>

                        {/* On Web: Invisible overlay input for native browser picker */}
                        {Platform.OS === "web" &&
                          createElement("input", {
                            type: "time",
                            value: toTimeString(schedule.endTime),
                            onChange: (e: any) => {
                              if (e?.target?.value) {
                                const [h, m] = e.target.value
                                  .split(":")
                                  .map(Number);
                                const newD = new Date(schedule.endTime);
                                newD.setHours(h, m, 0, 0);
                                updateSchedule(schedule.id, "endTime", newD);
                              }
                            },
                            style: {
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              opacity: 0,
                              cursor: "pointer",
                              zIndex: 10,
                            },
                          })}
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Room / Lab Input */}
                  <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
                    <Text style={styles.fieldLabel}>ROOM / LAB NUMBER</Text>
                    <View style={styles.inputCard}>
                      <Feather
                        name="map-pin"
                        size={15}
                        color={BENTO.slate}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={schedule.room}
                        onChangeText={(t) =>
                          updateSchedule(schedule.id, "room", t)
                        }
                        placeholder="e.g. 1501, Lab 402, Building 3"
                        placeholderTextColor={BENTO.slateLight}
                        accessible={true}
                        accessibilityLabel={`Class ${index + 1} Room or Lab`}
                      />
                    </View>
                  </View>
                </View>
              ))}

              {/* Add Session Button */}
              <TouchableOpacity
                style={styles.addScheduleBtn}
                onPress={addSchedule}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add another class schedule"
              >
                <View style={styles.addScheduleIconCircle}>
                  <Feather name="plus" size={14} color={BENTO.navy} />
                </View>
                <Text style={styles.addScheduleText}>Add Class Session</Text>
              </TouchableOpacity>
            </View>

            {/* 4. TERM EXAMINATIONS (MIDTERM & FINAL) */}
            <View style={styles.sectionBlock}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[
                    styles.sectionIconBox,
                    { backgroundColor: BENTO.amberSoft },
                  ]}
                >
                  <Feather
                    name="award"
                    size={14}
                    color={BENTO.amberText}
                  />
                </View>
                <Text style={styles.sectionTitle}>Term Examinations</Text>
              </View>

              {/* Midterm Card */}
              <View style={styles.examCard}>
                <View style={styles.examCardHeader}>
                  <View style={styles.examTitleRow}>
                    <Feather
                      name="edit-3"
                      size={15}
                      color={BENTO.blueText}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.examTitle}>Midterm Examination</Text>
                  </View>

                  {midtermDate && (
                    <TouchableOpacity
                      onPress={() => setMidtermDate(null)}
                      style={styles.clearExamBtn}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clear Midterm Date"
                    >
                      <Text style={styles.clearExamText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Date & Time Row */}
                <View style={styles.gridRow}>
                  {/* Date Picker */}
                  <View
                    style={[styles.fieldGroup, { flex: 1, marginRight: 6 }]}
                  >
                    <Text style={styles.fieldLabel}>EXAM DATE</Text>
                    <TouchableOpacity
                      style={styles.timePickerCard}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          setActivePicker({ target: "midterm", mode: "date" });
                        }
                      }}
                      activeOpacity={Platform.OS === "web" ? 1 : 0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Midterm Exam Date"
                    >
                      <View
                        style={[
                          styles.timeIconBox,
                          { backgroundColor: BENTO.blueSoft },
                        ]}
                      >
                        <Feather
                          name="calendar"
                          size={14}
                          color={BENTO.blueText}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.timeValueText}>
                          {midtermDate
                            ? formatDisplayDate(midtermDate)
                            : "Set Date"}
                        </Text>
                      </View>

                      {Platform.OS === "web" &&
                        createElement("input", {
                          type: "date",
                          value: midtermDate
                            ? toDateString(midtermDate)
                            : toDateString(new Date()),
                          onChange: (e: any) => {
                            if (e?.target?.value) {
                              const [y, m, d] = e.target.value
                                .split("-")
                                .map(Number);
                              const newD = midtermDate
                                ? new Date(midtermDate)
                                : new Date();
                              newD.setFullYear(y, m - 1, d);
                              setMidtermDate(newD);
                            }
                          },
                          style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          },
                        })}
                    </TouchableOpacity>
                  </View>

                  {/* Time Picker */}
                  <View
                    style={[styles.fieldGroup, { flex: 1, marginLeft: 6 }]}
                  >
                    <Text style={styles.fieldLabel}>START TIME</Text>
                    <TouchableOpacity
                      style={styles.timePickerCard}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          setActivePicker({ target: "midterm", mode: "time" });
                        }
                      }}
                      activeOpacity={Platform.OS === "web" ? 1 : 0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Midterm Exam Time"
                    >
                      <View
                        style={[
                          styles.timeIconBox,
                          { backgroundColor: BENTO.blueSoft },
                        ]}
                      >
                        <Feather
                          name="clock"
                          size={14}
                          color={BENTO.blueText}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.timeValueText}>
                          {midtermDate
                            ? formatDisplayTime(midtermDate)
                            : "Set Time"}
                        </Text>
                      </View>

                      {Platform.OS === "web" &&
                        createElement("input", {
                          type: "time",
                          value: midtermDate
                            ? toTimeString(midtermDate)
                            : "10:00",
                          onChange: (e: any) => {
                            if (e?.target?.value) {
                              const [h, m] = e.target.value
                                .split(":")
                                .map(Number);
                              const newD = midtermDate
                                ? new Date(midtermDate)
                                : new Date();
                              newD.setHours(h, m, 0, 0);
                              setMidtermDate(newD);
                            }
                          },
                          style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          },
                        })}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Exam Room Input */}
                <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
                  <Text style={styles.fieldLabel}>EXAM ROOM / HALL</Text>
                  <View style={styles.inputCard}>
                    <Feather
                      name="map-pin"
                      size={15}
                      color={BENTO.slate}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={midtermRoom}
                      onChangeText={setMidtermRoom}
                      placeholder="e.g. Exam Hall A, Room 402"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Midterm Exam Room"
                    />
                  </View>
                </View>
              </View>

              {/* Final Exam Card */}
              <View style={styles.examCard}>
                <View style={styles.examCardHeader}>
                  <View style={styles.examTitleRow}>
                    <Feather
                      name="award"
                      size={15}
                      color={BENTO.amberText}
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.examTitle}>Final Examination</Text>
                  </View>

                  {finalDate && (
                    <TouchableOpacity
                      onPress={() => setFinalDate(null)}
                      style={styles.clearExamBtn}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Clear Final Exam Date"
                    >
                      <Text style={styles.clearExamText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Date & Time Row */}
                <View style={styles.gridRow}>
                  {/* Date Picker */}
                  <View
                    style={[styles.fieldGroup, { flex: 1, marginRight: 6 }]}
                  >
                    <Text style={styles.fieldLabel}>EXAM DATE</Text>
                    <TouchableOpacity
                      style={styles.timePickerCard}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          setActivePicker({ target: "final", mode: "date" });
                        }
                      }}
                      activeOpacity={Platform.OS === "web" ? 1 : 0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Final Exam Date"
                    >
                      <View
                        style={[
                          styles.timeIconBox,
                          { backgroundColor: BENTO.amberSoft },
                        ]}
                      >
                        <Feather
                          name="calendar"
                          size={14}
                          color={BENTO.amberText}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.timeValueText}>
                          {finalDate
                            ? formatDisplayDate(finalDate)
                            : "Set Date"}
                        </Text>
                      </View>

                      {Platform.OS === "web" &&
                        createElement("input", {
                          type: "date",
                          value: finalDate
                            ? toDateString(finalDate)
                            : toDateString(new Date()),
                          onChange: (e: any) => {
                            if (e?.target?.value) {
                              const [y, m, d] = e.target.value
                                .split("-")
                                .map(Number);
                              const newD = finalDate
                                ? new Date(finalDate)
                                : new Date();
                              newD.setFullYear(y, m - 1, d);
                              setFinalDate(newD);
                            }
                          },
                          style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          },
                        })}
                    </TouchableOpacity>
                  </View>

                  {/* Time Picker */}
                  <View
                    style={[styles.fieldGroup, { flex: 1, marginLeft: 6 }]}
                  >
                    <Text style={styles.fieldLabel}>START TIME</Text>
                    <TouchableOpacity
                      style={styles.timePickerCard}
                      onPress={() => {
                        if (Platform.OS !== "web") {
                          setActivePicker({ target: "final", mode: "time" });
                        }
                      }}
                      activeOpacity={Platform.OS === "web" ? 1 : 0.75}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Final Exam Time"
                    >
                      <View
                        style={[
                          styles.timeIconBox,
                          { backgroundColor: BENTO.amberSoft },
                        ]}
                      >
                        <Feather
                          name="clock"
                          size={14}
                          color={BENTO.amberText}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.timeValueText}>
                          {finalDate
                            ? formatDisplayTime(finalDate)
                            : "Set Time"}
                        </Text>
                      </View>

                      {Platform.OS === "web" &&
                        createElement("input", {
                          type: "time",
                          value: finalDate
                            ? toTimeString(finalDate)
                            : "10:00",
                          onChange: (e: any) => {
                            if (e?.target?.value) {
                              const [h, m] = e.target.value
                                .split(":")
                                .map(Number);
                              const newD = finalDate
                                ? new Date(finalDate)
                                : new Date();
                              newD.setHours(h, m, 0, 0);
                              setFinalDate(newD);
                            }
                          },
                          style: {
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            opacity: 0,
                            cursor: "pointer",
                            zIndex: 10,
                          },
                        })}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Exam Room Input */}
                <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
                  <Text style={styles.fieldLabel}>EXAM ROOM / HALL</Text>
                  <View style={styles.inputCard}>
                    <Feather
                      name="map-pin"
                      size={15}
                      color={BENTO.slate}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={finalRoom}
                      onChangeText={setFinalRoom}
                      placeholder="e.g. Auditorium, Room 501"
                      placeholderTextColor={BENTO.slateLight}
                      accessible={true}
                      accessibilityLabel="Final Exam Room"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Global DateTimePicker for iOS & Android */}
            {Platform.OS !== "web" && activePicker && (
              <DateTimePicker
                value={getPickerValue()}
                mode={
                  activePicker.target === "schedule"
                    ? "time"
                    : activePicker.mode
                }
                is24Hour={false}
                display="default"
                onChange={handlePickerChange}
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO.canvas,
    maxWidth: 640,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  cancelText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.slate,
  },
  headerCenterCol: {
    alignItems: "center",
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
    marginTop: 1,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  saveBtnDisabled: {
    backgroundColor: "#cbd5e1",
    opacity: 0.7,
  },
  saveBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  scrollContent: {
    padding: 18,
    paddingBottom: 50,
  },

  sectionBlock: {
    marginBottom: 22,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.1,
  },
  badgeCounter: {
    backgroundColor: BENTO.purpleSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BENTO.purpleBorder,
    marginLeft: 8,
  },
  badgeCounterText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.purpleText,
  },

  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  gridRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
    padding: 0,
  },
  clearIconBtn: {
    padding: 4,
    marginLeft: 6,
  },

  // Bento Google Meet Card
  bentoMeetCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 16,
  },
  meetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  meetIconTitleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  meetIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BENTO.blueSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  meetCardTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
  },
  meetCardSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
    marginTop: 1,
  },
  configuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.mintSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
  },
  configuredBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.mintText,
  },
  optionalBadge: {
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  optionalBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
  },
  meetHelperRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 10,
    paddingHorizontal: 2,
  },
  meetHelperText: {
    flex: 1,
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 16,
  },

  // Schedule Card
  scheduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 16,
    marginBottom: 14,
  },
  scheduleCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  scheduleBadgePill: {
    backgroundColor: BENTO.canvas,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  scheduleBadgePillText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "800",
    color: BENTO.navy,
  },
  deleteScheduleBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: BENTO.roseSoft,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    alignItems: "center",
    justifyContent: "center",
  },

  // 1-Tap Day Pills
  dayPillsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 4,
  },
  dayPill: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 8,
  },
  dayPillActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  dayPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
  },
  dayPillTextActive: {
    color: "#ffffff",
  },

  // Time Picker Card
  timePickerCard: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  timeIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  timeValueText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },

  // Add Schedule Button
  addScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: BENTO.borderHover,
    paddingVertical: 12,
    marginTop: 4,
  },
  addScheduleIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  addScheduleText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },

  // Exam Card
  examCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 16,
    marginBottom: 14,
  },
  examCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  examTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  examTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
  },
  clearExamBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  clearExamText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.roseText,
  },
});
