import { useState, useEffect, useCallback } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import SearchableTeacherSelect from "./searchable-teacher-select";

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
  teachers?: any[];
  isLoadingTeachers?: boolean;
  currentUser: any;
}

export default function CreateHubModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  teachers = [],
  isLoadingTeachers = false,
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
    section: "",
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

  const populateInitialData = useCallback(() => {
    if (isTeacher) {
      setForm((prev) => ({ ...prev, teacherId: currentUser?.id || "" }));
    } else if (isCR) {
      setForm((prev) => ({
        ...prev,
        department: currentUser?.studentProfile?.department || "",
        batch: currentUser?.studentProfile?.batch || "",
        section: currentUser?.studentProfile?.section || "",
        semesterNumber:
          currentUser?.studentProfile?.currentSemester?.toString() || "",
      }));
    }
  }, [isTeacher, isCR, currentUser]);

  useEffect(() => {
    if (isVisible) {
      populateInitialData();
    }
  }, [isVisible, populateInitialData]);

  const handleResetForm = () => {
    setForm({
      courseName: "",
      courseCode: "",
      credit: "",
      department: "",
      batch: "",
      section: "",
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
    populateInitialData();
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
    setActivePicker(null);
  };

  const handleCreate = () => {
    const courseCode = form.courseCode.trim().toUpperCase();
    const courseName = form.courseName.trim();
    const creditNum = parseFloat(form.credit);
    const department = form.department.trim();
    const batch = form.batch.trim();
    const semesterNumber = parseInt(form.semesterNumber, 10);
    const termOffer = form.termOffer.trim();

    if (
      !courseCode ||
      !courseName ||
      isNaN(creditNum) ||
      creditNum <= 0 ||
      !department ||
      !batch ||
      isNaN(semesterNumber) ||
      semesterNumber <= 0 ||
      !termOffer
    ) {
      return Toast.show({
        type: "error",
        text1: "Invalid Form",
        text2: "Please fill out all required course details with valid values.",
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
      courseCode,
      courseName,
      credit: creditNum,
      department,
      batch,
      section: form.section.trim() || undefined,
      semesterNumber,
      termOffer,
      teacherId: form.teacherId || undefined,
      weeklyClassSchedule: formattedSchedules,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView
        style={styles.modalContainer}
        edges={["top", "bottom"]}
        accessibilityViewIsModal={true}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* TOP HEADER */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.iconBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close create hub modal"
            >
              <Feather name="x" size={24} color="#131b2e" />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>New Course Hub</Text>

            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            contentContainerStyle={styles.modalScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* SUBTITLE */}
            <View style={styles.pageTitleContainer}>
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
                    accessible={true}
                    accessibilityLabel="Course Name"
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
                      accessible={true}
                      accessibilityLabel="Course Code"
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
                      accessible={true}
                      accessibilityLabel="Credits"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* BENTO 2: COHORT DETAILS (Mint) */}
            <View style={[styles.bentoCard, styles.mintCard]}>
              <Text style={styles.bentoTitleMint}>COHORT DETAILS</Text>

              {/* Single Column: Department */}
              <View style={styles.inputGroup}>
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
                    placeholder="e.g. Computer Science and Engineering"
                    placeholderTextColor="#76777d"
                    autoCapitalize="characters"
                    editable={isTeacher}
                    accessible={true}
                    accessibilityLabel="Department"
                  />
                </View>
              </View>

              {/* 2 Columns: Batch & Section */}
              <View style={styles.gridRow}>
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
                      placeholder="e.g. 31"
                      placeholderTextColor="#76777d"
                      editable={isTeacher}
                      accessible={true}
                      accessibilityLabel="Batch"
                    />
                  </View>
                </View>

                <View style={styles.gridItem}>
                  <View style={styles.labelRow}>
                    <Feather
                      name="bookmark"
                      size={14}
                      color="#065f46"
                      style={styles.labelIcon}
                    />
                    <Text style={styles.inputLabel}>Section</Text>
                  </View>
                  <View style={styles.inputBox}>
                    <TextInput
                      style={styles.input}
                      value={form.section}
                      onChangeText={(t) => setForm({ ...form, section: t })}
                      placeholder="e.g. B"
                      placeholderTextColor="#76777d"
                      autoCapitalize="characters"
                      accessible={true}
                      accessibilityLabel="Section"
                    />
                  </View>
                </View>
              </View>

              {/* 2 Columns: Term / Offer & Semester */}
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
                      accessible={true}
                      accessibilityLabel="Term or Offer"
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
                      placeholder="e.g. 9"
                      placeholderTextColor="#76777d"
                      keyboardType="numeric"
                      editable={isTeacher}
                      accessible={true}
                      accessibilityLabel="Semester number"
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
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Delete class schedule ${index + 1}`}
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
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select day for class ${index + 1}`}
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
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Select start time for class ${index + 1}`}
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
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Select end time for class ${index + 1}`}
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
                        accessible={true}
                        accessibilityLabel={`Room or lab number for class ${index + 1}`}
                      />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addScheduleBtn}
                onPress={addSchedule}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add Another Class Time"
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

            {/* BOTTOM ACTIONS */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                style={[styles.bottomCreateBtn, isPending && { opacity: 0.7 }]}
                onPress={handleCreate}
                disabled={isPending}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Create course hub"
                activeOpacity={0.85}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name="plus-circle"
                      size={18}
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.bottomCreateBtnText}>Create Course Hub</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResetForm}
                style={styles.bottomResetBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Reset form fields"
                activeOpacity={0.7}
              >
                <Feather
                  name="refresh-cw"
                  size={16}
                  color="#45464d"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.bottomResetBtnText}>Reset Form</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <Modal
        visible={!!activeDayPickerId}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setActiveDayPickerId(null)}
      >
        <View style={styles.modalOverlay} accessibilityViewIsModal={true}>
          <TouchableOpacity
            style={styles.modalOverlayBackdrop}
            activeOpacity={1}
            onPress={() => setActiveDayPickerId(null)}
          />
          <View style={styles.modalDropdownSheet}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalSheetTitle}>Select Day</Text>
              <TouchableOpacity
                onPress={() => setActiveDayPickerId(null)}
                style={styles.iconBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close day selector"
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
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`Select ${item}`}
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
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#131b2e",
    letterSpacing: -0.3,
  },
  headerSpacer: {
    width: 36,
  },

  // Bottom Actions
  bottomActions: {
    marginTop: 14,
    marginBottom: 4,
    gap: 10,
  },
  bottomCreateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#131b2e",
    paddingVertical: 14,
    borderRadius: 9999,
    shadowColor: "#131b2e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  bottomCreateBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  bottomResetBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(19, 27, 46, 0.12)",
    paddingVertical: 12,
    borderRadius: 9999,
  },
  bottomResetBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#45464d",
  },

  // Typography
  pageTitleContainer: { marginTop: 14, marginBottom: 16 },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  modalScrollContent: { paddingHorizontal: 20, paddingBottom: 12 },

  // Bento Boxes
  bentoCard: { borderRadius: 32, padding: 24, marginBottom: 16 },
  blueCard: { backgroundColor: "#d0e4ff" },
  mintCard: { backgroundColor: "#c3f0d2" },
  yellowCard: { backgroundColor: "#fef08a" },
  pinkCard: { backgroundColor: "#ffdad6" },

  // Bento Titles
  bentoTitleBlue: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1e3a8a",
    letterSpacing: 1,
    marginBottom: 16,
  },
  bentoTitleMint: {
    fontSize: 12,
    fontWeight: "800",
    color: "#065f46",
    letterSpacing: 1,
    marginBottom: 16,
  },
  bentoTitleYellow: {
    fontSize: 12,
    fontWeight: "800",
    color: "#854d0e",
    letterSpacing: 1,
    marginBottom: 16,
  },
  bentoTitlePink: {
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
    fontSize: 14,
    fontWeight: "800",
    color: "#854d0e",
  },
  timeText: {
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
  modalOverlayBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    fontSize: 16,
    color: "#191c1e",
    fontWeight: "600",
  },
});
