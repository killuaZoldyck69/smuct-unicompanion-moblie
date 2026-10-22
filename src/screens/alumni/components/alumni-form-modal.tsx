import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";
import { AlumniItem, CreateAlumniInput } from "../types";

interface AlumniFormModalProps {
  visible: boolean;
  alumni: AlumniItem | null; // null for Create, non-null for Edit
  isSaving: boolean;
  onSave: (payload: CreateAlumniInput) => void;
  onClose: () => void;
}

const COMMON_DEPARTMENTS = [
  "Computer Science & Engineering",
  "Fashion Design & Technology",
  "Business Administration",
  "Apparel Manufacture & Technology",
  "Graphic Design & Multimedia",
  "Architecture",
  "English",
  "Law",
];

export const AlumniFormModal: React.FC<AlumniFormModalProps> = ({
  visible,
  alumni,
  isSaving,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(alumni);

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [batch, setBatch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [degree, setDegree] = useState("");
  const [skills, setSkills] = useState("");
  const [email, setEmail] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [personalWebsiteUrl, setPersonalWebsiteUrl] = useState("");
  const [image, setImage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (alumni) {
      setName(alumni.name || "");
      setDepartment(alumni.department || "");
      setBatch(alumni.batch || alumni.graduationBatch || "");
      setGraduationYear(
        alumni.graduationYear ? String(alumni.graduationYear) : alumni.passingYear ? String(alumni.passingYear) : "",
      );
      setCurrentCompany(alumni.currentCompany || "");
      setCurrentPosition(alumni.currentPosition || alumni.designation || alumni.currentRole || "");
      setDegree(alumni.degree || "");
      setSkills(Array.isArray(alumni.skills) ? alumni.skills.join(", ") : "");
      setEmail(alumni.email || "");
      setLinkedInUrl(alumni.linkedInUrl || alumni.linkedinUrl || "");
      setPersonalWebsiteUrl(alumni.personalWebsiteUrl || "");
      setImage(alumni.image || alumni.imageUrl || "");
    } else {
      setName("");
      setDepartment("");
      setBatch("");
      setGraduationYear(new Date().getFullYear().toString());
      setCurrentCompany("");
      setCurrentPosition("");
      setDegree("");
      setSkills("");
      setEmail("");
      setLinkedInUrl("");
      setPersonalWebsiteUrl("");
      setImage("");
    }
    setErrors({});
  }, [alumni, visible]);

  if (!visible) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Full name is required";
    if (!department.trim()) errs.department = "Department is required";
    if (!batch.trim()) errs.batch = "Batch is required (e.g. 19th)";
    if (!graduationYear.trim()) {
      errs.graduationYear = "Graduation year is required";
    } else {
      const yr = Number(graduationYear);
      if (isNaN(yr) || yr < 1990 || yr > 2035) {
        errs.graduationYear = "Enter a valid year (1990-2035)";
      }
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const parsedSkills = skills
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const payload: CreateAlumniInput = {
      name: name.trim(),
      department: department.trim(),
      batch: batch.trim(),
      graduationBatch: batch.trim(),
      graduationYear: Number(graduationYear.trim()),
      passingYear: Number(graduationYear.trim()),
      currentCompany: currentCompany.trim() || undefined,
      currentPosition: currentPosition.trim() || undefined,
      currentRole: currentPosition.trim() || undefined,
      designation: currentPosition.trim() || undefined,
      degree: degree.trim() || undefined,
      skills: parsedSkills,
      email: email.trim() || undefined,
      linkedInUrl: linkedInUrl.trim() || undefined,
      linkedinUrl: linkedInUrl.trim() || undefined,
      personalWebsiteUrl: personalWebsiteUrl.trim() || undefined,
      image: image.trim() || undefined,
      imageUrl: image.trim() || undefined,
    };

    onSave(payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={styles.sheetContainer}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.headerTitle}>
                  {isEditing ? "Edit Alumni Profile" : "Add New Alumnus"}
                </Text>
                <Text style={styles.headerSubtitle}>
                  {isEditing
                    ? "Update existing graduate information and career records"
                    : "Register an individual graduate to the network directory"}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close form"
              >
                <Feather name="x" size={20} color={BENTO.navy} />
              </TouchableOpacity>
            </View>

            {/* Scrollable Form Fields */}
            <ScrollView
              style={styles.formScroll}
              contentContainerStyle={styles.formContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Name */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  FULL NAME <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  value={name}
                  onChangeText={(t) => {
                    setName(t);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Tanvir Hasan"
                  placeholderTextColor={BENTO.textMuted}
                />
                {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
              </View>

              {/* Department */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  DEPARTMENT <Text style={styles.requiredMark}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.department && styles.inputError]}
                  value={department}
                  onChangeText={(t) => {
                    setDepartment(t);
                    if (errors.department)
                      setErrors((prev) => ({ ...prev, department: "" }));
                  }}
                  placeholder="e.g. Computer Science & Engineering"
                  placeholderTextColor={BENTO.textMuted}
                />
                {errors.department ? (
                  <Text style={styles.errorText}>{errors.department}</Text>
                ) : null}

                {/* Quick department chip selection */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.chipsRow}
                >
                  {COMMON_DEPARTMENTS.map((dept) => (
                    <TouchableOpacity
                      key={dept}
                      style={[
                        styles.deptChip,
                        department === dept && styles.deptChipActive,
                      ]}
                      onPress={() => {
                        setDepartment(dept);
                        if (errors.department)
                          setErrors((prev) => ({ ...prev, department: "" }));
                      }}
                    >
                      <Text
                        style={[
                          styles.deptChipText,
                          department === dept && styles.deptChipTextActive,
                        ]}
                      >
                        {dept}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Two Column Row: Batch & Graduation Year */}
              <View style={styles.rowTwoCols}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    BATCH <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.batch && styles.inputError]}
                    value={batch}
                    onChangeText={(t) => {
                      setBatch(t);
                      if (errors.batch) setErrors((prev) => ({ ...prev, batch: "" }));
                    }}
                    placeholder="e.g. 19th Batch"
                    placeholderTextColor={BENTO.textMuted}
                  />
                  {errors.batch ? <Text style={styles.errorText}>{errors.batch}</Text> : null}
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>
                    GRAD YEAR <Text style={styles.requiredMark}>*</Text>
                  </Text>
                  <TextInput
                    style={[styles.input, errors.graduationYear && styles.inputError]}
                    value={graduationYear}
                    onChangeText={(t) => {
                      setGraduationYear(t);
                      if (errors.graduationYear)
                        setErrors((prev) => ({ ...prev, graduationYear: "" }));
                    }}
                    keyboardType="number-pad"
                    placeholder="e.g. 2024"
                    placeholderTextColor={BENTO.textMuted}
                  />
                  {errors.graduationYear ? (
                    <Text style={styles.errorText}>{errors.graduationYear}</Text>
                  ) : null}
                </View>
              </View>

              {/* Company & Position */}
              <View style={styles.rowTwoCols}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>CURRENT COMPANY</Text>
                  <TextInput
                    style={styles.input}
                    value={currentCompany}
                    onChangeText={setCurrentCompany}
                    placeholder="e.g. Brain Station 23"
                    placeholderTextColor={BENTO.textMuted}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>POSITION / ROLE</Text>
                  <TextInput
                    style={styles.input}
                    value={currentPosition}
                    onChangeText={setCurrentPosition}
                    placeholder="e.g. Software Engineer"
                    placeholderTextColor={BENTO.textMuted}
                  />
                </View>
              </View>

              {/* Degree */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>DEGREE</Text>
                <TextInput
                  style={styles.input}
                  value={degree}
                  onChangeText={setDegree}
                  placeholder="e.g. B.Sc. in Computer Science & Engineering"
                  placeholderTextColor={BENTO.textMuted}
                />
              </View>

              {/* Skills */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>SKILLS (COMMA SEPARATED)</Text>
                <TextInput
                  style={styles.input}
                  value={skills}
                  onChangeText={setSkills}
                  placeholder="e.g. React Native, Node.js, UI/UX, Docker"
                  placeholderTextColor={BENTO.textMuted}
                />
              </View>

              {/* Email */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholder="e.g. alumnus@example.com"
                  placeholderTextColor={BENTO.textMuted}
                />
                {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
              </View>

              {/* LinkedIn URL */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>LINKEDIN PROFILE URL</Text>
                <TextInput
                  style={styles.input}
                  value={linkedInUrl}
                  onChangeText={setLinkedInUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholder="https://linkedin.com/in/username"
                  placeholderTextColor={BENTO.textMuted}
                />
              </View>

              {/* Website */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>PORTFOLIO / WEBSITE URL</Text>
                <TextInput
                  style={styles.input}
                  value={personalWebsiteUrl}
                  onChangeText={setPersonalWebsiteUrl}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholder="https://portfolio.dev"
                  placeholderTextColor={BENTO.textMuted}
                />
              </View>

              {/* Image URL */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>AVATAR / PHOTO IMAGE URL</Text>
                <TextInput
                  style={styles.input}
                  value={image}
                  onChangeText={setImage}
                  autoCapitalize="none"
                  keyboardType="url"
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor={BENTO.textMuted}
                />
              </View>

              {/* Bottom spacing */}
              <View style={{ height: 20 }} />
            </ScrollView>

            {/* Sticky Actions Footer */}
            <View style={styles.footerActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={onClose}
                disabled={isSaving}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, isSaving && styles.disabledBtn]}
                onPress={handleSubmit}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name={isEditing ? "check" : "user-plus"}
                      size={15}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.submitBtnText}>
                      {isEditing ? "Save Changes" : "Create Alumnus"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
  },
  sheetContainer: {
    backgroundColor: BENTO.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(15, 23, 42, 0.15)",
    alignSelf: "center",
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
    maxWidth: 280,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  formScroll: {
    maxHeight: 520,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 14,
  },
  formGroup: {
    width: "100%",
  },
  rowTwoCols: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.navySecondary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  requiredMark: {
    color: BENTO.rose,
  },
  input: {
    height: 46,
    backgroundColor: BENTO.surfaceSecondary,
    borderWidth: 1,
    borderColor: BENTO.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontFamily,
    fontSize: 13.5,
    color: BENTO.navy,
  },
  inputError: {
    borderColor: BENTO.rose,
    backgroundColor: BENTO.roseBg,
  },
  errorText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.rose,
    marginTop: 4,
  },
  chipsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
    paddingVertical: 2,
  },
  deptChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: BENTO.slateSubtle,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  deptChipActive: {
    backgroundColor: BENTO.navy,
    borderColor: BENTO.navy,
  },
  deptChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.slate,
  },
  deptChipTextActive: {
    color: "#ffffff",
  },
  footerActions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    backgroundColor: BENTO.card,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
  },
  submitBtn: {
    flex: 2,
    height: 46,
    borderRadius: 14,
    backgroundColor: BENTO.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  disabledBtn: {
    opacity: 0.65,
  },
});
