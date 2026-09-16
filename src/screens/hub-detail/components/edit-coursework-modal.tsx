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
  assessment: any | null;
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

export default function EditCourseworkModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  assessment,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "ASSIGNMENT",
    submissionType: "ONLINE" as "ONLINE" | "HAND",
    totalMarks: "100",
  });

  const [deadline, setDeadline] = useState<Date>(() => new Date());
  const [showNativePicker, setShowNativePicker] = useState(false);
  const [nativePickerMode, setNativePickerMode] = useState<"date" | "time">("date");

  useEffect(() => {
    if (assessment && isVisible) {
      setForm({
        title: assessment.title || "",
        description: assessment.description || "",
        type: (assessment.type || "ASSIGNMENT").toUpperCase(),
        submissionType: (assessment.submissionType || "ONLINE").toUpperCase() as "ONLINE" | "HAND",
        totalMarks: assessment.totalMarks != null ? String(assessment.totalMarks) : "100",
      });

      if (assessment.deadline) {
        setDeadline(new Date(assessment.deadline));
      } else {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(23, 59, 0, 0);
        setDeadline(d);
      }
    }
  }, [assessment, isVisible]);

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
  };

  // Quick Preset Handlers
  const applyPreset = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(23, 59, 0, 0);
    setDeadline(d);
  };

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
              accessibilityLabel="Cancel coursework editing"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.headerCenterCol}>
              <Text style={styles.headerTitle}>Edit Coursework</Text>
              <Text style={styles.headerSubtitle}>Update assignment details</Text>
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
              accessibilityLabel="Save coursework changes"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather name="check" size={14} color="#ffffff" style={{ marginRight: 4 }} />
                  <Text style={styles.publishBtnText}>Save</Text>
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

            {/* 4. Total Marks */}
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

            {/* 5. Deadline & Time */}
            <View style={styles.sectionBlock}>
              <Text style={styles.fieldLabel}>DEADLINE & TIME</Text>

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

                {/* On Web: Invisible overlay input that opens native browser picker */}
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
                  onChange={handleNativeDateChange}
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
  },
  publishBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 9999,
  },
  publishBtnDisabled: {
    backgroundColor: "#cbd5e1",
  },
  publishBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },

  inputCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  unitSuffix: {
    fontFamily,
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.slate,
    marginLeft: 6,
  },

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
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  typeTabText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "600",
    color: BENTO.slate,
  },

  submissionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  submissionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: BENTO.border,
    padding: 14,
  },
  submissionCardActive: {
    backgroundColor: "#ffffff",
    borderColor: BENTO.navy,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  submissionCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  submissionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  submissionIconCircleActive: {
    backgroundColor: BENTO.navy,
  },
  activeCheckPill: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BENTO.mintSoft,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
  },
  submissionTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 2,
  },
  submissionSubtitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO.slate,
    lineHeight: 15,
  },

  deadlineContainer: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 14,
    marginBottom: 10,
  },
  deadlineIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  deadlinInfoCol: {
    flex: 1,
  },
  deadlineSubLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
    marginBottom: 2,
  },
  deadlineDateText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO.navy,
  },

  presetChipsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  presetHeading: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
    marginRight: 2,
  },
  presetChip: {
    backgroundColor: "#ffffff",
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  presetChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.navy,
  },

  textAreaCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 14,
  },
  textArea: {
    fontFamily,
    fontSize: 13,
    fontWeight: "500",
    color: BENTO.navy,
    minHeight: 90,
    lineHeight: 18,
    padding: 0,
  },
});
