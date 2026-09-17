import React, { useState, createElement } from "react";
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
  canvas: "#f7f9fb",
  card: "#ffffff",
  navy: "#131b2e",
  slate: "#64748b",
  border: "rgba(19, 27, 46, 0.08)",
  borderActive: "#131b2e",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  default: "sans-serif",
});

interface Props {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isPending: boolean;
}

const toDateTimeLocalString = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function CreateCourseworkModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "ASSIGNMENT",
    submissionType: "ONLINE" as "ONLINE" | "HAND",
    totalMarks: "100",
  });

  // Default to tomorrow at 11:59 PM
  const getInitialDeadline = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    d.setHours(23, 59, 0, 0);
    return d;
  };

  const [deadline, setDeadline] = useState<Date>(getInitialDeadline);
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [nativePickerMode, setNativePickerMode] = useState<"date" | "time">("date");

  const handleSubmit = () => {
    if (!form.title.trim() || !form.totalMarks.trim()) return;

    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      type: form.type,
      submissionType: form.submissionType,
      totalMarks: parseFloat(form.totalMarks) || 100,
      deadline: deadline.toISOString(),
    });

    // Reset Form
    setForm({
      title: "",
      description: "",
      type: "ASSIGNMENT",
      submissionType: "ONLINE",
      totalMarks: "100",
    });
    setDeadline(getInitialDeadline());
  };

  // Quick Preset Handlers
  const applyPreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(23, 59, 0, 0);
    setDeadline(d);
  };

  // Native DatePicker sequence for Android / iOS
  const openNativePicker = () => {
    if (Platform.OS === "web") return;
    setNativePickerMode("date");
    setShowNativePicker(true);
  };

  const handleNativeDateChange = (event: any, selectedDate?: any) => {
    if (event?.type === "dismissed") {
      setShowNativePicker(false);
      return;
    }

    if (selectedDate) {
      const currentDate = new Date(selectedDate);
      setDeadline(currentDate);

      if (Platform.OS === "android" && nativePickerMode === "date") {
        setNativePickerMode("time");
        setShowNativePicker(true);
      } else {
        setShowNativePicker(false);
      }
    }
  };

  const isFormValid = form.title.trim().length > 0 && form.totalMarks.trim().length > 0;

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
          {/* Bento Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.cancelBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel coursework creation"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.headerCenterCol}>
              <Text style={styles.headerTitle}>New Coursework</Text>
              <Text style={styles.headerSubtitle}>Assign tasks to cohort</Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending || !isFormValid}
              style={[
                styles.publishBtn,
                (!isFormValid || isPending) && styles.publishBtnDisabled,
              ]}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Publish coursework"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="check" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.publishBtnText}>Publish</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Scroll Body */}
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Coursework Title */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>COURSEWORK TITLE</Text>
              <View style={styles.inputCard}>
                <Feather name="edit-3" size={16} color={BENTO.slate} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.title}
                  onChangeText={(t) => setForm({ ...form, title: t })}
                  placeholder="e.g. Midterm Lab Assignment, Chapter 4 Quiz"
                  placeholderTextColor="#94a3b8"
                  accessible={true}
                  accessibilityLabel="Coursework Title"
                />
              </View>
            </View>

            {/* 2. Assessment Type Tabs */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>ASSESSMENT TYPE</Text>
              <View style={styles.typeTabsContainer}>
                {[
                  {
                    id: "ASSIGNMENT",
                    label: "Assignment",
                    icon: "file-text",
                    activeBg: BENTO.blueSoft,
                    activeBorder: BENTO.blueBorder,
                    activeText: BENTO.blueText,
                  },
                  {
                    id: "QUIZ",
                    label: "Quiz",
                    icon: "help-circle",
                    activeBg: BENTO.purpleSoft,
                    activeBorder: BENTO.purpleBorder,
                    activeText: BENTO.purpleText,
                  },
                  {
                    id: "PRESENTATION",
                    label: "Presentation",
                    icon: "monitor",
                    activeBg: BENTO.amberSoft,
                    activeBorder: BENTO.amberBorder,
                    activeText: BENTO.amberText,
                  },
                ].map((t) => {
                  const isActive = form.type === t.id;
                  return (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setForm({ ...form, type: t.id })}
                      style={[
                        styles.typeTab,
                        isActive && {
                          backgroundColor: t.activeBg,
                          borderColor: t.activeBorder,
                        },
                      ]}
                      activeOpacity={0.8}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select ${t.label}`}
                    >
                      <Feather
                        name={t.icon as any}
                        size={14}
                        color={isActive ? t.activeText : BENTO.slate}
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={[
                          styles.typeTabText,
                          isActive && { color: t.activeText, fontWeight: "700" },
                        ]}
                      >
                        {t.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 3. Submission Method (Online vs In-Hand) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>SUBMISSION METHOD</Text>
              <View style={styles.submissionGrid}>
                {/* Option 1: Online Submission */}
                <TouchableOpacity
                  style={[
                    styles.submissionCard,
                    form.submissionType === "ONLINE" && styles.submissionCardActive,
                  ]}
                  onPress={() => setForm({ ...form, submissionType: "ONLINE" })}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Online digital link submission"
                >
                  <View style={styles.submissionCardHeader}>
                    <View
                      style={[
                        styles.submissionIconCircle,
                        form.submissionType === "ONLINE" && styles.submissionIconCircleActive,
                      ]}
                    >
                      <Feather
                        name="globe"
                        size={16}
                        color={form.submissionType === "ONLINE" ? "#ffffff" : BENTO.slate}
                      />
                    </View>
                    {form.submissionType === "ONLINE" ? (
                      <View style={styles.activeCheckPill}>
                        <Feather name="check" size={11} color={BENTO.mintText} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.submissionTitle}>Online Link</Text>
                  <Text style={styles.submissionSubtitle}>
                    Google Drive, GitHub or Docs
                  </Text>
                </TouchableOpacity>

                {/* Option 2: In-Hand / Physical Submission */}
                <TouchableOpacity
                  style={[
                    styles.submissionCard,
                    form.submissionType === "HAND" && styles.submissionCardActive,
                  ]}
                  onPress={() => setForm({ ...form, submissionType: "HAND" })}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Offline in-hand physical submission"
                >
                  <View style={styles.submissionCardHeader}>
                    <View
                      style={[
                        styles.submissionIconCircle,
                        form.submissionType === "HAND" && styles.submissionIconCircleActive,
                      ]}
                    >
                      <Feather
                        name="clipboard"
                        size={16}
                        color={form.submissionType === "HAND" ? "#ffffff" : BENTO.slate}
                      />
                    </View>
                    {form.submissionType === "HAND" ? (
                      <View style={styles.activeCheckPill}>
                        <Feather name="check" size={11} color={BENTO.mintText} />
                      </View>
                    ) : null}
                  </View>
                  <Text style={styles.submissionTitle}>In-Hand / Physical</Text>
                  <Text style={styles.submissionSubtitle}>
                    Submit hardcopy in class
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 4. Total Marks (Clean & spacious) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>TOTAL MARKS</Text>
              <View style={styles.inputCard}>
                <Feather name="award" size={16} color={BENTO.navy} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={form.totalMarks}
                  onChangeText={(t) =>
                    setForm({ ...form, totalMarks: t.replace(/[^0-9]/g, "") })
                  }
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor="#94a3b8"
                  maxLength={4}
                  accessible={true}
                  accessibilityLabel="Total marks"
                />
                <Text style={styles.unitSuffix}>Points</Text>
              </View>
            </View>

            {/* 5. Deadline & Time (Unified, Spacious Bento Card) */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>DEADLINE & TIME</Text>

              {/* Clickable Bento Card */}
              <TouchableOpacity
                style={styles.deadlineContainer}
                onPress={openNativePicker}
                activeOpacity={Platform.OS === "web" ? 1 : 0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Select deadline date and time"
              >
                <View style={styles.deadlineIconBox}>
                  <Feather name="calendar" size={18} color={BENTO.navy} />
                </View>
                <View style={styles.deadlinInfoCol}>
                  <Text style={styles.deadlineSubLabel}>Submission Closes</Text>
                  <Text style={styles.deadlineDateText}>
                    {deadline.toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
                <Feather name="edit-2" size={16} color={BENTO.slate} />

                {/* On Web: Invisible overlay input that opens native browser picker on click without crushing layout */}
                {Platform.OS === "web" && (
                  createElement("input", {
                    type: "datetime-local",
                    value: toDateTimeLocalString(deadline),
                    onChange: (e: any) => {
                      if (e?.target?.value) {
                        setDeadline(new Date(e.target.value));
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
                  })
                )}
              </TouchableOpacity>

              {/* Clean Quick Preset Pills */}
              <View style={styles.presetChipsRow}>
                <Text style={styles.presetHeading}>Quick Set:</Text>
                {[
                  { label: "Tomorrow", days: 1 },
                  { label: "In 3 Days", days: 3 },
                  { label: "1 Week", days: 7 },
                  { label: "2 Weeks", days: 14 },
                ].map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    onPress={() => applyPreset(p.days)}
                    style={styles.presetChip}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.presetChipText}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Native DateTimePicker for iOS & Android */}
              {showNativePicker && Platform.OS !== "web" && (
                <DateTimePicker
                  value={deadline}
                  mode={Platform.OS === "ios" ? "datetime" : nativePickerMode}
                  display="default"
                  onValueChange={(_event, date) => handleNativeDateChange({ type: "set" }, date)}
                  onDismiss={() => setShowNativePicker(false)}
                />
              )}
            </View>

            {/* 6. Instructions & Guidelines */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>INSTRUCTIONS & GUIDELINES (OPTIONAL)</Text>
              <View style={styles.textAreaCard}>
                <TextInput
                  style={styles.textArea}
                  value={form.description}
                  onChangeText={(t) => setForm({ ...form, description: t })}
                  placeholder="Provide clear instructions, rubrics, or submission requirements for students..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Instructions and Description"
                />
              </View>
            </View>
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
    paddingHorizontal: 6,
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
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 999,
  },
  publishBtnDisabled: {
    backgroundColor: "#cbd5e1",
    opacity: 0.7,
  },
  publishBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  // Input Card
  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
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
  },
  unitSuffix: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.slate,
    marginLeft: 8,
  },

  // Type Tabs
  typeTabsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  typeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 11,
    paddingHorizontal: 6,
  },
  typeTabText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },

  // Submission Grid
  submissionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  submissionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BENTO.border,
    padding: 14,
  },
  submissionCardActive: {
    borderColor: BENTO.navy,
    backgroundColor: "#fcfdfe",
  },
  submissionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  submissionIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  submissionIconCircleActive: {
    backgroundColor: BENTO.navy,
  },
  activeCheckPill: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: BENTO.mintSoft,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  submissionTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 2,
  },
  submissionSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 14,
  },

  // Deadline Card
  deadlineContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 14,
    marginBottom: 10,
  },
  deadlineIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BENTO.canvas,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deadlinInfoCol: {
    flex: 1,
  },
  deadlineSubLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slate,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  deadlineDateText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    marginTop: 2,
  },
  presetChipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  presetHeading: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
    marginRight: 2,
  },
  presetChip: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  presetChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.navy,
  },

  // Description / Textarea
  textAreaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 12,
  },
  textArea: {
    fontFamily,
    fontSize: 13,
    color: BENTO.navy,
    lineHeight: 20,
    minHeight: 90,
  },
});
