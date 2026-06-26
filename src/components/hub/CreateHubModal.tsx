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
  StatusBar,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import SearchableTeacherSelect from "./SearchableTeacherSelect";

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
  const insets = useSafeAreaInsets();
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

  // Picker States
  const [activePicker, setActivePicker] = useState<{
    id: string;
    type: "start" | "end";
  } | null>(null);

  const [activeDayPickerId, setActiveDayPickerId] = useState<string | null>(
    null,
  );

  const populateInitialData = () => {
    if (isTeacher) {
      setForm((prev) => ({ ...prev, teacherId: currentUser.id }));
    } else if (isCR) {
      setForm((prev) => ({
        ...prev,
        department: currentUser.studentProfile?.department || "",
        batch: currentUser.studentProfile?.batch || "",
        semesterNumber:
          currentUser.studentProfile?.currentSemester?.toString() || "",
      }));
    }
  };

  useEffect(() => {
    if (isVisible) {
      populateInitialData();
    }
  }, [isVisible, currentUser]);

  // FIX 5: Reset Form Logic
  const handleResetForm = () => {
    setForm({
      courseName: "",
      courseCode: "",
      credit: "",
      department: "",
      batch: "",
      semesterNumber: "",
      termOffer: "",
      teacherId: "",
    });
    setSchedules([
      {
        id: Date.now().toString(),
        day: "Sunday",
        startTime: new Date(),
        endTime: new Date(),
        room: "",
      },
    ]);
    populateInitialData(); // Re-apply default locked fields
    Toast.show({ type: "info", text1: "Form Cleared" });
  };

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
      weeklyClassSchedule: formattedSchedules,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      {/* FIX 1: Using standard View with dynamic insets fixes Android/iOS safe area padding bugs */}
      <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="#f7f9fb"
          translucent={true}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* TOP HEADER */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose} style={styles.iconBtn}>
              <Feather name="x" size={24} color="#131b2e" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>SMUCT Companion</Text>

            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={handleResetForm}
                style={styles.resetBtn}
              >
                <Feather name="refresh-cw" size={18} color="#45464d" />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.createBtn, isPending && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={isPending}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.createBtnText}>Create</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={[
              styles.modalScrollContent,
              { paddingBottom: insets.bottom + 100 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* PAGE TITLE */}
            <View style={styles.pageTitleContainer}>
              <Text style={styles.pageTitle}>New Course Hub</Text>
              <Text style={styles.pageSubtitle}>Set up a new class module</Text>
            </View>

            {/* BENTO 1: COURSE DETAILS (Blue) */}
            <View style={[styles.bentoCard, styles.blueCard]}>
              <Text style={styles.bentoTitleBlue}>COURSE DETAILS</Text>

              {/* FIX 2 & 3: Added descriptive labels and meaningful icons */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Feather
                    name="book"
                    size={14}
                    color="#1e3a8a"
                    style={styles.labelIcon}
                  />
                  <Text style={styles.inputLabel}>Course Name</Text>
                </View>
                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.input}
                    value={form.courseName}
                    onChangeText={(t) => setForm({ ...form, courseName: t })}
                    placeholder="e.g. Data Structures"
                    placeholderTextColor="#76777d"
                  />
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="hash"
                      size={14}
                      color="#1e3a8a"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Course Code</Text>
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      value={form.courseCode}
                      onChangeText={(t) => setForm({ ...form, courseCode: t })}
                      placeholder="e.g. CSE201"
                      placeholderTextColor="#76777d"
                      autoCapitalize="characters"
                    />
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="award"
                      size={14}
                      color="#1e3a8a"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Credits</Text>
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      value={form.credit}
                      onChangeText={(t) =>
                        setForm({ ...form, credit: t.replace(/[^0-9.]/g, "") })
                      }
                      placeholder="e.g. 3.0"
                      placeholderTextColor="#76777d"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* BENTO 2: COHORT DETAILS (Mint) */}
            <View style={[styles.bentoCard, styles.mintCard]}>
              <Text style={styles.bentoTitleMint}>COHORT DETAILS</Text>

              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="layers"
                      size={14}
                      color="#065f46"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Department</Text>
                  </View>
                  <View
                    style={[
                      styles.inputBox,
                      isTeacher && styles.disabledInputBox,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={form.department}
                      onChangeText={(t) => setForm({ ...form, department: t })}
                      placeholder="e.g. CSE"
                      placeholderTextColor="#76777d"
                      autoCapitalize="characters"
                      editable={isTeacher}
                    />
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="users"
                      size={14}
                      color="#065f46"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Batch</Text>
                  </View>
                  <View
                    style={[
                      styles.inputBox,
                      isTeacher && styles.disabledInputBox,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={form.batch}
                      onChangeText={(t) => setForm({ ...form, batch: t })}
                      placeholder="e.g. 21st"
                      placeholderTextColor="#76777d"
                      editable={isTeacher}
                    />
                  </View>
                </View>
              </View>

              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="map-pin"
                      size={14}
                      color="#065f46"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Term / Offer</Text>
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      value={form.termOffer}
                      onChangeText={(t) => setForm({ ...form, termOffer: t })}
                      placeholder="e.g. Fall 2026"
                      placeholderTextColor="#76777d"
                    />
                  </View>
                </View>
                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="calendar"
                      size={14}
                      color="#065f46"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Semester</Text>
                  </View>
                  <View
                    style={[
                      styles.inputBox,
                      isTeacher && styles.disabledInputBox,
                    ]}
                  >
                    <TextInput
                      style={styles.input}
                      value={form.semesterNumber}
                      onChangeText={(t) =>
                        setForm({
                          ...form,
                          semesterNumber: t.replace(/[^0-9]/g, ""),
                        })
                      }
                      placeholder="e.g. 5"
                      placeholderTextColor="#76777d"
                      keyboardType="numeric"
                      editable={isTeacher}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* BENTO 3: SCHEDULE (Yellow) */}
            <View style={[styles.bentoCard, styles.yellowCard]}>
              <Text style={styles.bentoTitleYellow}>CLASS SCHEDULE</Text>

              {schedules.map((schedule, index) => (
                <View
                  key={schedule.id}
                  style={
                    index > 0
                      ? {
                          marginTop: 24,
                          paddingTop: 24,
                          borderTopWidth: 1,
                          borderColor: "rgba(0,0,0,0.05)",
                        }
                      : {}
                  }
                >
                  {schedules.length > 1 && (
                    <View style={styles.scheduleHeaderRow}>
                      <Text style={styles.scheduleClassText}>
                        Class #{index + 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeSchedule(schedule.id)}
                      >
                        <Feather name="trash-2" size={18} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* FIX 4: Implemented a sleek, clickable button that opens a custom day modal */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Feather
                        name="calendar"
                        size={14}
                        color="#854d0e"
                        style={styles.labelIcon}
                      />
                      <Text style={styles.inputLabel}>Select Day</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.inputBox}
                      onPress={() => setActiveDayPickerId(schedule.id)}
                    >
                      <Text style={styles.input}>{schedule.day}</Text>
                      <Feather name="chevron-down" size={20} color="#76777d" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.gridRow}>
                    <View style={styles.gridItem}>
                      <View style={styles.labelRow}>
                        <Feather
                          name="clock"
                          size={14}
                          color="#854d0e"
                          style={styles.labelIcon}
                        />
                        <Text style={styles.inputLabel}>Start Time</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.inputBox, { justifyContent: "center" }]}
                        onPress={() =>
                          setActivePicker({ id: schedule.id, type: "start" })
                        }
                      >
                        <Text style={styles.timeText}>
                          {schedule.startTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.gridItem}>
                      <View style={styles.labelRow}>
                        <Feather
                          name="clock"
                          size={14}
                          color="#854d0e"
                          style={styles.labelIcon}
                        />
                        <Text style={styles.inputLabel}>End Time</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.inputBox, { justifyContent: "center" }]}
                        onPress={() =>
                          setActivePicker({ id: schedule.id, type: "end" })
                        }
                      >
                        <Text style={styles.timeText}>
                          {schedule.endTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <Feather
                        name="map"
                        size={14}
                        color="#854d0e"
                        style={styles.labelIcon}
                      />
                      <Text style={styles.inputLabel}>Room / Lab Number</Text>
                    </View>
                    <View style={styles.inputBox}>
                      <TextInput
                        style={styles.input}
                        value={schedule.room}
                        onChangeText={(t) =>
                          updateSchedule(schedule.id, "room", t)
                        }
                        placeholder="e.g. Room 402"
                        placeholderTextColor="#76777d"
                      />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addScheduleBtn}
                onPress={addSchedule}
              >
                <Feather name="plus" size={16} color="#854d0e" />
                <Text style={styles.addScheduleText}>
                  Add Another Class Time
                </Text>
              </TouchableOpacity>
            </View>

            {/* DateTimePicker Component */}
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

            {/* BENTO 4: INSTRUCTOR (Pink - CR ONLY) */}
            {isCR && (
              <View style={[styles.bentoCard, styles.pinkCard]}>
                <Text style={styles.bentoTitlePink}>INSTRUCTOR ASSIGNMENT</Text>

                <View style={styles.labelRow}>
                  <Feather
                    name="search"
                    size={14}
                    color="#9f1239"
                    style={styles.labelIcon}
                  />
                  <Text style={styles.inputLabel}>Search Teacher</Text>
                </View>
                <SearchableTeacherSelect
                  teachers={teachers}
                  selectedId={form.teacherId}
                  onSelect={(id) => setForm({ ...form, teacherId: id })}
                  isLoading={isLoadingTeachers}
                />
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* FIX 4: Custom Day Selector Modal */}
      <Modal
        visible={!!activeDayPickerId}
        animationType="fade"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDropdownSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalSheetTitle}>Select Day</Text>
              <TouchableOpacity
                onPress={() => setActiveDayPickerId(null)}
                style={styles.iconBtn}
              >
                <Feather name="x" size={24} color="#131b2e" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={DAYS}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              renderItem={({ item }) => {
                const isSelected =
                  schedules.find((s) => s.id === activeDayPickerId)?.day ===
                  item;
                return (
                  <TouchableOpacity
                    style={styles.modalListItem}
                    onPress={() => {
                      if (activeDayPickerId)
                        updateSchedule(activeDayPickerId, "day", item);
                      setActiveDayPickerId(null);
                    }}
                  >
                    <Text
                      style={[
                        styles.modalListItemText,
                        isSelected && { color: "#1e3a8a", fontWeight: "800" },
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={20} color="#1e3a8a" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

// --- ISOLATED NEW DESIGN THEME (Soft Campus Bento) ---
const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: "#f7f9fb" },

  // Header
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconBtn: { padding: 4 },
  headerTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 18,
    fontWeight: "800",
    color: "#131b2e",
  },
  headerActions: { flexDirection: "row", alignItems: "center" },
  resetBtn: {
    padding: 8,
    marginRight: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 9999,
  },
  createBtn: {
    backgroundColor: "#131b2e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
  },
  createBtnText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },

  // Typography
  pageTitleContainer: { marginTop: 24, marginBottom: 24 },
  pageTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 32,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.64,
  },
  pageSubtitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "500",
    color: "#45464d",
    marginTop: 4,
  },
  modalScrollContent: { paddingHorizontal: 20 },

  // Bento Boxes
  bentoCard: { borderRadius: 32, padding: 24, marginBottom: 16 },
  blueCard: { backgroundColor: "#d0e4ff" },
  mintCard: { backgroundColor: "#c3f0d2" },
  yellowCard: { backgroundColor: "#fef08a" },
  pinkCard: { backgroundColor: "#ffdad6" },

  // Bento Titles
  bentoTitleBlue: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#1e3a8a",
    letterSpacing: 1,
    marginBottom: 16,
  },
  bentoTitleMint: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#065f46",
    letterSpacing: 1,
    marginBottom: 16,
  },
  bentoTitleYellow: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#854d0e",
    letterSpacing: 1,
    marginBottom: 16,
  },
  bentoTitlePink: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "800",
    color: "#9f1239",
    letterSpacing: 1,
    marginBottom: 16,
  },

  // Inputs with Labels
  inputGroup: { marginBottom: 16 },
  gridRow: { flexDirection: "row", gap: 16, marginBottom: 16 },
  gridItem: { flex: 1 },
  labelRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  labelIcon: { marginRight: 6 },
  inputLabel: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 12,
    fontWeight: "700",
    color: "#131b2e",
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  disabledInputBox: { backgroundColor: "rgba(255,255,255,0.5)" },
  input: {
    flex: 1,
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#131b2e",
    fontWeight: "600",
  },

  // Schedule Specifics
  scheduleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  scheduleClassText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
    color: "#854d0e",
  },
  timeText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    fontWeight: "700",
    color: "#131b2e",
  },

  addScheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fef9c3", // Light yellow pill
    paddingVertical: 14,
    borderRadius: 9999,
    marginTop: 8,
  },
  addScheduleText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 14,
    fontWeight: "800",
    color: "#854d0e",
    marginLeft: 8,
  },

  // Custom Day Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.4)",
    justifyContent: "flex-end",
  },
  modalDropdownSheet: {
    backgroundColor: "#f7f9fb",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: "60%",
    paddingTop: 24,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  modalSheetTitle: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 20,
    fontWeight: "800",
    color: "#131b2e",
  },
  modalListItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e3e5",
  },
  modalListItemText: {
    fontFamily: "Plus Jakarta Sans",
    fontSize: 16,
    color: "#191c1e",
    fontWeight: "600",
  },
});
