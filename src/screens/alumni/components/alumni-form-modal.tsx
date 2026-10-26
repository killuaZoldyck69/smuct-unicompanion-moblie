import React, { useState, useEffect, useMemo } from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

import { BENTO, fontFamily } from "../constants";
import { AlumniItem, CreateAlumniInput } from "../types";
import {
  SMUCT_PROGRAM_DEPARTMENTS,
  ProgramDepartmentOption,
  universityPrograms,
  AcademicProgram,
} from "@/data/programs";
import { getDeptTheme } from "../utils";

interface AlumniFormModalProps {
  visible: boolean;
  alumni: AlumniItem | null; // null for Create, non-null for Edit
  isSaving: boolean;
  onSave: (payload: CreateAlumniInput) => void;
  onClose: () => void;
}

export const AlumniFormModal: React.FC<AlumniFormModalProps> = ({
  visible,
  alumni,
  isSaving,
  onSave,
  onClose,
}) => {
  const insets = useSafeAreaInsets();
  const isEditing = Boolean(alumni);

  // Form Field States
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [department, setDepartment] = useState("");
  const [degree, setDegree] = useState("");
  const [batch, setBatch] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");
  const [skills, setSkills] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [personalWebsiteUrl, setPersonalWebsiteUrl] = useState("");
  const [image, setImage] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dropdown Picker Modal States
  const [isDeptPickerOpen, setIsDeptPickerOpen] = useState(false);
  const [deptSearchQuery, setDeptSearchQuery] = useState("");

  const [isDegreePickerOpen, setIsDegreePickerOpen] = useState(false);
  const [degreeSearchQuery, setDegreeSearchQuery] = useState("");

  // Initialize or Reset Form
  useEffect(() => {
    if (alumni) {
      setName(alumni.name || "");
      setStudentId(alumni.studentId ? String(alumni.studentId) : "");
      setDepartment(alumni.department || "");
      setDegree(alumni.degree || "");
      // Extract integer digits from existing batch
      const rawBatch = alumni.batch || alumni.graduationBatch || "";
      const batchDigits = String(rawBatch).replace(/[^0-9]/g, "");
      setBatch(batchDigits || rawBatch);
      setGraduationYear(
        alumni.graduationYear
          ? String(alumni.graduationYear)
          : alumni.passingYear
          ? String(alumni.passingYear)
          : "",
      );
      setCurrentCompany(alumni.currentCompany || "");
      setCurrentPosition(
        alumni.currentPosition ||
          alumni.designation ||
          alumni.currentRole ||
          "",
      );
      setSkills(Array.isArray(alumni.skills) ? alumni.skills.join(", ") : "");
      setEmail(alumni.email || "");
      setPhone(alumni.phone || "");
      setLinkedInUrl(alumni.linkedInUrl || alumni.linkedinUrl || "");
      setPersonalWebsiteUrl(alumni.personalWebsiteUrl || "");
      setImage(alumni.image || alumni.imageUrl || "");
    } else {
      setName("");
      setStudentId("");
      setDepartment("");
      setDegree("");
      setBatch("");
      setGraduationYear(new Date().getFullYear().toString());
      setCurrentCompany("");
      setCurrentPosition("");
      setSkills("");
      setEmail("");
      setPhone("");
      setLinkedInUrl("");
      setPersonalWebsiteUrl("");
      setImage("");
    }
    setErrors({});
  }, [alumni, visible]);

  // Filtered Departments for Dropdown
  const filteredDepartments = useMemo(() => {
    if (!deptSearchQuery.trim()) return SMUCT_PROGRAM_DEPARTMENTS;
    const q = deptSearchQuery.toLowerCase().trim();
    return SMUCT_PROGRAM_DEPARTMENTS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.faculty.toLowerCase().includes(q),
    );
  }, [deptSearchQuery]);

  // Filtered Programs for Degree Dropdown
  const filteredPrograms = useMemo(() => {
    let list = [...universityPrograms];
    if (degreeSearchQuery.trim()) {
      const q = degreeSearchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.shortName.toLowerCase().includes(q) ||
          p.department.toLowerCase().includes(q) ||
          p.faculty.toLowerCase().includes(q),
      );
    }
    return list;
  }, [degreeSearchQuery]);

  if (!visible) return null;

  // Sanitization & Validation
  const validate = () => {
    const errs: Record<string, string> = {};

    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      errs.name = "Full name is required";
    }

    if (!department.trim()) {
      errs.department = "Department is required";
    }

    const cleanBatch = batch.trim().replace(/[^0-9]/g, "");
    if (!cleanBatch) {
      errs.batch = "Batch is required (integer number e.g. 19)";
    } else if (Number(cleanBatch) <= 0 || Number(cleanBatch) > 200) {
      errs.batch = "Enter a valid batch number (1-200)";
    }

    const cleanYear = graduationYear.trim().replace(/[^0-9]/g, "");
    if (!cleanYear) {
      errs.graduationYear = "Graduation year is required (e.g. 2024)";
    } else {
      const yr = Number(cleanYear);
      if (isNaN(yr) || yr < 1990 || yr > 2035) {
        errs.graduationYear = "Enter a valid year (1990 - 2035)";
      }
    }

    if (studentId.trim()) {
      const cleanStudentId = studentId.trim().replace(/[^0-9]/g, "");
      if (!cleanStudentId || cleanStudentId !== studentId.trim()) {
        errs.studentId = "Student ID must only contain integer digits";
      }
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Enter a valid email address";
    }

    if (
      linkedInUrl.trim() &&
      !/^https?:\/\/.+/i.test(linkedInUrl.trim()) &&
      !linkedInUrl.trim().toLowerCase().includes("linkedin.com")
    ) {
      errs.linkedInUrl = "Enter a valid LinkedIn profile URL";
    }

    if (
      personalWebsiteUrl.trim() &&
      !/^https?:\/\/.+/i.test(personalWebsiteUrl.trim())
    ) {
      errs.personalWebsiteUrl = "URL must start with http:// or https://";
    }

    setErrors(errs);

    if (Object.keys(errs).length > 0) {
      const firstError = Object.values(errs)[0];
      Toast.show({
        type: "error",
        text1: "Form Validation Required",
        text2: firstError,
        visibilityTime: 4000,
      });
      return false;
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const parsedSkills = skills
      .split(/[,;]/)
      .map((s) => s.trim().replace(/\s+/g, " "))
      .filter(Boolean);

    // Sanitize URLs to ensure valid protocol
    let sanitizedLinkedIn = linkedInUrl.trim();
    if (
      sanitizedLinkedIn &&
      !sanitizedLinkedIn.startsWith("http://") &&
      !sanitizedLinkedIn.startsWith("https://")
    ) {
      sanitizedLinkedIn = `https://${sanitizedLinkedIn}`;
    }

    let sanitizedWebsite = personalWebsiteUrl.trim();
    if (
      sanitizedWebsite &&
      !sanitizedWebsite.startsWith("http://") &&
      !sanitizedWebsite.startsWith("https://")
    ) {
      sanitizedWebsite = `https://${sanitizedWebsite}`;
    }

    const cleanBatchInt = batch.trim().replace(/[^0-9]/g, "");
    const cleanYearInt = Number(graduationYear.trim().replace(/[^0-9]/g, ""));
    const cleanStudentId = studentId.trim().replace(/[^0-9]/g, "");

    const payload: CreateAlumniInput = {
      name: name.trim().replace(/\s+/g, " "),
      studentId: cleanStudentId || undefined,
      department: department.trim(),
      degree: degree.trim() || undefined,
      batch: cleanBatchInt,
      graduationBatch: cleanBatchInt,
      graduationYear: cleanYearInt,
      passingYear: cleanYearInt,
      currentCompany: currentCompany.trim().replace(/\s+/g, " ") || undefined,
      currentPosition: currentPosition.trim().replace(/\s+/g, " ") || undefined,
      currentRole: currentPosition.trim().replace(/\s+/g, " ") || undefined,
      designation: currentPosition.trim().replace(/\s+/g, " ") || undefined,
      skills: parsedSkills,
      email: email.trim().toLowerCase() || undefined,
      phone: phone.trim() || undefined,
      linkedInUrl: sanitizedLinkedIn || undefined,
      linkedinUrl: sanitizedLinkedIn || undefined,
      personalWebsiteUrl: sanitizedWebsite || undefined,
      image: image.trim() || undefined,
      imageUrl: image.trim() || undefined,
    };

    onSave(payload);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <SafeAreaView style={styles.fullScreen} edges={["top", "bottom"]}>
        {/* Full Screen Top App Bar */}
        <View style={styles.topAppBar}>
          <View style={styles.topAppBarCenter}>
            <Text style={styles.topAppBarTitle}>
              {isEditing ? "Edit Alumnus Profile" : "Add New Alumnus"}
            </Text>
            <Text style={styles.topAppBarSubtitle}>
              {isEditing
                ? "Update university directory credentials"
                : "Register a graduate to the network directory"}
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={styles.headerCloseBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close form"
            activeOpacity={0.7}
          >
            <Feather name="x" size={18} color={BENTO.navy} />
          </TouchableOpacity>
        </View>

        {/* Scrollable Form Body */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* ========================================== */}
            {/* SECTION 1: ACADEMIC & UNIVERSITY IDENTITY */}
            {/* ========================================== */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[styles.sectionIconBox, { backgroundColor: "#eff6ff" }]}
                >
                  <Feather name="award" size={16} color="#2563eb" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>ACADEMIC CREDENTIALS</Text>
                  <Text style={styles.sectionSubtitle}>
                    University degree, department, batch & ID
                  </Text>
                </View>
              </View>

              {/* Alumnus Student ID (Large Integer) */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>
                  ALUMNUS STUDENT ID (NUMBER)
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.studentId) && styles.inputError,
                  ]}
                >
                  <Feather
                    name="hash"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={studentId}
                    onChangeText={(t) => {
                      // Only allow integer digits
                      const sanitized = t.replace(/[^0-9]/g, "");
                      setStudentId(sanitized);
                      if (errors.studentId)
                        setErrors((prev) => ({ ...prev, studentId: "" }));
                    }}
                    placeholder="e.g. 210101050"
                    placeholderTextColor="#9ca3af"
                    keyboardType="number-pad"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessible={true}
                    accessibilityLabel="Alumnus student ID number"
                  />
                  {studentId.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setStudentId("")}
                      style={styles.inputClearBtn}
                    >
                      <Feather name="x" size={13} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                {errors.studentId ? (
                  <Text style={styles.errorText}>{errors.studentId}</Text>
                ) : (
                  <Text style={styles.helperText}>
                    Optional: Official integer ID number from university records
                  </Text>
                )}
              </View>

              {/* Department Dropdown Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>
                  DEPARTMENT <Text style={styles.requiredStar}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.dropdownTrigger,
                    Boolean(errors.department) && styles.inputError,
                  ]}
                  onPress={() => {
                    setDeptSearchQuery("");
                    setIsDeptPickerOpen(true);
                  }}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select department from dropdown"
                >
                  <View style={styles.dropdownTriggerLeft}>
                    <Feather
                      name="briefcase"
                      size={16}
                      color={department ? BENTO.navy : BENTO.slate}
                      style={styles.fieldIcon}
                    />
                    <Text
                      style={[
                        styles.dropdownTriggerText,
                        Boolean(department) && styles.dropdownTriggerTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {department || "Select academic department..."}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={18} color="#94a3b8" />
                </TouchableOpacity>
                {errors.department ? (
                  <Text style={styles.errorText}>{errors.department}</Text>
                ) : null}
              </View>

              {/* Degree Program Dropdown Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>ACADEMIC DEGREE PROGRAM</Text>
                <TouchableOpacity
                  style={styles.dropdownTrigger}
                  onPress={() => {
                    setDegreeSearchQuery("");
                    setIsDegreePickerOpen(true);
                  }}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select degree program from all programs dropdown"
                >
                  <View style={styles.dropdownTriggerLeft}>
                    <Feather
                      name="book-open"
                      size={16}
                      color={degree ? BENTO.navy : BENTO.slate}
                      style={styles.fieldIcon}
                    />
                    <Text
                      style={[
                        styles.dropdownTriggerText,
                        Boolean(degree) && styles.dropdownTriggerTextSelected,
                      ]}
                      numberOfLines={1}
                    >
                      {degree || "Select degree program (all programs)..."}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={18} color="#94a3b8" />
                </TouchableOpacity>
                <Text style={styles.helperText}>
                  Choose from SMUCT undergraduate and postgraduate programs
                </Text>
              </View>

              {/* Two Column Row: Batch (Integer) & Graduation Year (Integer) */}
              <View style={styles.twoColRow}>
                {/* Batch Number */}
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>
                    BATCH NUMBER <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      Boolean(errors.batch) && styles.inputError,
                    ]}
                  >
                    <Feather
                      name="layers"
                      size={16}
                      color={BENTO.slate}
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      value={batch}
                      onChangeText={(t) => {
                        // Strict integer sanitization
                        const sanitized = t.replace(/[^0-9]/g, "");
                        setBatch(sanitized);
                        if (errors.batch)
                          setErrors((prev) => ({ ...prev, batch: "" }));
                      }}
                      placeholder="e.g. 19"
                      placeholderTextColor="#9ca3af"
                      keyboardType="number-pad"
                      maxLength={3}
                      accessible={true}
                      accessibilityLabel="Batch integer number"
                    />
                  </View>
                  {errors.batch ? (
                    <Text style={styles.errorText}>{errors.batch}</Text>
                  ) : (
                    <Text style={styles.helperText}>Integer only (e.g. 19)</Text>
                  )}
                </View>

                {/* Graduation Year */}
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>
                    GRAD YEAR <Text style={styles.requiredStar}>*</Text>
                  </Text>
                  <View
                    style={[
                      styles.inputContainer,
                      Boolean(errors.graduationYear) && styles.inputError,
                    ]}
                  >
                    <Feather
                      name="calendar"
                      size={16}
                      color={BENTO.slate}
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      value={graduationYear}
                      onChangeText={(t) => {
                        // Strict integer sanitization
                        const sanitized = t.replace(/[^0-9]/g, "");
                        setGraduationYear(sanitized);
                        if (errors.graduationYear)
                          setErrors((prev) => ({
                            ...prev,
                            graduationYear: "",
                          }));
                      }}
                      placeholder="e.g. 2024"
                      placeholderTextColor="#9ca3af"
                      keyboardType="number-pad"
                      maxLength={4}
                      accessible={true}
                      accessibilityLabel="Graduation year integer"
                    />
                  </View>
                  {errors.graduationYear ? (
                    <Text style={styles.errorText}>{errors.graduationYear}</Text>
                  ) : (
                    <Text style={styles.helperText}>4-digit year</Text>
                  )}
                </View>
              </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 2: PERSONAL IDENTITY & CONTACT */}
            {/* ========================================== */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[styles.sectionIconBox, { backgroundColor: "#fdf2f8" }]}
                >
                  <Feather name="user" size={16} color="#db2777" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>PERSONAL DETAILS</Text>
                  <Text style={styles.sectionSubtitle}>
                    Full name, email and contact information
                  </Text>
                </View>
              </View>

              {/* Full Name */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>
                  FULL NAME <Text style={styles.requiredStar}>*</Text>
                </Text>
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.name) && styles.inputError,
                  ]}
                >
                  <Feather
                    name="user"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (errors.name)
                        setErrors((prev) => ({ ...prev, name: "" }));
                    }}
                    placeholder="e.g. Tanvir Hasan"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="words"
                    accessible={true}
                    accessibilityLabel="Alumnus full name"
                  />
                </View>
                {errors.name ? (
                  <Text style={styles.errorText}>{errors.name}</Text>
                ) : null}
              </View>

              {/* Email Address */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>EMAIL ADDRESS</Text>
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.email) && styles.inputError,
                  ]}
                >
                  <Feather
                    name="mail"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t.trim());
                      if (errors.email)
                        setErrors((prev) => ({ ...prev, email: "" }));
                    }}
                    placeholder="e.g. tanvir.hasan@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessible={true}
                    accessibilityLabel="Email address"
                  />
                </View>
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Phone Number */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="phone"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={phone}
                    onChangeText={(t) => setPhone(t.replace(/[^0-9+\-\s()]/g, ""))}
                    placeholder="e.g. +880 1712-345678"
                    placeholderTextColor="#9ca3af"
                    keyboardType="phone-pad"
                    accessible={true}
                    accessibilityLabel="Phone number"
                  />
                  {phone.length > 0 && (
                    <TouchableOpacity
                      onPress={() => setPhone("")}
                      style={styles.inputClearBtn}
                    >
                      <Feather name="x" size={13} color="#9ca3af" />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.helperText}>
                  Optional: Direct phone or mobile contact number
                </Text>
              </View>

              {/* Photo Image URL */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>PROFILE PHOTO URL</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="image"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={image}
                    onChangeText={setImage}
                    placeholder="https://example.com/avatar.jpg"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessible={true}
                    accessibilityLabel="Profile image URL"
                  />
                </View>
              </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 3: EMPLOYMENT & CAREER */}
            {/* ========================================== */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[styles.sectionIconBox, { backgroundColor: "#fef3c7" }]}
                >
                  <Feather name="briefcase" size={16} color="#d97706" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>CAREER & INDUSTRY</Text>
                  <Text style={styles.sectionSubtitle}>
                    Current company, designation and core skills
                  </Text>
                </View>
              </View>

              {/* Two Column Row: Company & Position */}
              <View style={styles.twoColRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>CURRENT COMPANY</Text>
                  <View style={styles.inputContainer}>
                    <Feather
                      name="home"
                      size={16}
                      color={BENTO.slate}
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      value={currentCompany}
                      onChangeText={setCurrentCompany}
                      placeholder="e.g. Brain Station 23"
                      placeholderTextColor="#9ca3af"
                      accessible={true}
                      accessibilityLabel="Current company"
                    />
                  </View>
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>POSITION / ROLE</Text>
                  <View style={styles.inputContainer}>
                    <Feather
                      name="user-check"
                      size={16}
                      color={BENTO.slate}
                      style={styles.fieldIcon}
                    />
                    <TextInput
                      style={styles.fieldInput}
                      value={currentPosition}
                      onChangeText={setCurrentPosition}
                      placeholder="e.g. Software Engineer"
                      placeholderTextColor="#9ca3af"
                      accessible={true}
                      accessibilityLabel="Current role"
                    />
                  </View>
                </View>
              </View>

              {/* Key Skills */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>KEY SKILLS (COMMA SEPARATED)</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="tag"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={skills}
                    onChangeText={setSkills}
                    placeholder="e.g. TypeScript, React Native, Node.js"
                    placeholderTextColor="#9ca3af"
                    accessible={true}
                    accessibilityLabel="Key professional skills"
                  />
                </View>
                <Text style={styles.helperText}>
                  Separate multiple skills using commas
                </Text>
              </View>
            </View>

            {/* ========================================== */}
            {/* SECTION 4: SOCIAL & PORTFOLIO LINKS */}
            {/* ========================================== */}
            <View style={styles.cardSection}>
              <View style={styles.sectionHeaderRow}>
                <View
                  style={[styles.sectionIconBox, { backgroundColor: "#f0fdf4" }]}
                >
                  <Feather name="globe" size={16} color="#16a34a" />
                </View>
                <View>
                  <Text style={styles.sectionTitle}>ONLINE PRESENCE</Text>
                  <Text style={styles.sectionSubtitle}>
                    LinkedIn profile and personal website
                  </Text>
                </View>
              </View>

              {/* LinkedIn URL */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>LINKEDIN PROFILE URL</Text>
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.linkedInUrl) && styles.inputError,
                  ]}
                >
                  <Feather
                    name="share-2"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={linkedInUrl}
                    onChangeText={(t) => {
                      setLinkedInUrl(t);
                      if (errors.linkedInUrl)
                        setErrors((prev) => ({ ...prev, linkedInUrl: "" }));
                    }}
                    placeholder="https://linkedin.com/in/username"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessible={true}
                    accessibilityLabel="LinkedIn profile link"
                  />
                </View>
                {errors.linkedInUrl ? (
                  <Text style={styles.errorText}>{errors.linkedInUrl}</Text>
                ) : null}
              </View>

              {/* Personal Website */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>PERSONAL WEBSITE / PORTFOLIO</Text>
                <View
                  style={[
                    styles.inputContainer,
                    Boolean(errors.personalWebsiteUrl) && styles.inputError,
                  ]}
                >
                  <Feather
                    name="link"
                    size={16}
                    color={BENTO.slate}
                    style={styles.fieldIcon}
                  />
                  <TextInput
                    style={styles.fieldInput}
                    value={personalWebsiteUrl}
                    onChangeText={(t) => {
                      setPersonalWebsiteUrl(t);
                      if (errors.personalWebsiteUrl)
                        setErrors((prev) => ({
                          ...prev,
                          personalWebsiteUrl: "",
                        }));
                    }}
                    placeholder="https://myportfolio.com"
                    placeholderTextColor="#9ca3af"
                    autoCapitalize="none"
                    autoCorrect={false}
                    accessible={true}
                    accessibilityLabel="Personal website link"
                  />
                </View>
                {errors.personalWebsiteUrl ? (
                  <Text style={styles.errorText}>{errors.personalWebsiteUrl}</Text>
                ) : null}
              </View>
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Sticky Bottom Form Action Bar */}
        <View
          style={[
            styles.bottomActionBar,
            {
              paddingBottom: Math.max(insets.bottom, 14),
            },
          ]}
        >
          <TouchableOpacity
            style={styles.cancelActionBtn}
            onPress={onClose}
            disabled={isSaving}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Cancel alumnus registration"
          >
            <Text style={styles.cancelActionText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitActionBtn,
              isSaving && styles.submitActionBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSaving}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isEditing ? "Save alumnus profile changes" : "Create new alumnus profile"
            }
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Feather
                  name={isEditing ? "check" : "user-plus"}
                  size={17}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
                <Text style={styles.submitActionText}>
                  {isEditing ? "Save Changes" : "Create Alumnus"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* PICKER MODAL 1: DEPARTMENT SELECTION (from programs.ts) */}
        {/* ======================================================== */}
        <Modal
          visible={isDeptPickerOpen}
          transparent={true}
          statusBarTranslucent={true}
          animationType="fade"
          onRequestClose={() => setIsDeptPickerOpen(false)}
        >
          <View style={styles.pickerBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsDeptPickerOpen(false)}
            />
            <View
              style={[
                styles.pickerSheet,
                { paddingBottom: Math.max(insets.bottom, 16) + 12 },
              ]}
            >
              <View style={styles.pickerDragHandle} />
              <View style={styles.pickerHeader}>
                <View>
                  <Text style={styles.pickerTitle}>Select Department</Text>
                  <Text style={styles.pickerSubtitle}>
                    Official academic departments from programs.ts
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsDeptPickerOpen(false)}
                  style={styles.pickerCloseBtn}
                >
                  <Feather name="x" size={18} color={BENTO.navy} />
                </TouchableOpacity>
              </View>

              {/* Search Inside Dropdown */}
              <View style={styles.pickerSearchWrap}>
                <Feather
                  name="search"
                  size={14}
                  color={BENTO.slate}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="Search department by name or code..."
                  placeholderTextColor={BENTO.slate}
                  value={deptSearchQuery}
                  onChangeText={setDeptSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {deptSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setDeptSearchQuery("")}>
                    <Feather name="x" size={13} color={BENTO.slate} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredDepartments.map((dept: ProgramDepartmentOption) => {
                  const isSelected =
                    department.toLowerCase() === dept.name.toLowerCase() ||
                    department.toLowerCase() === dept.code.toLowerCase();
                  const deptTheme = getDeptTheme(dept.code);

                  return (
                    <TouchableOpacity
                      key={dept.code}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemActive,
                      ]}
                      onPress={() => {
                        setDepartment(dept.name);
                        if (errors.department)
                          setErrors((prev) => ({ ...prev, department: "" }));
                        setIsDeptPickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pickerItemLeft}>
                        <View
                          style={[
                            styles.pickerDeptBadge,
                            {
                              backgroundColor: isSelected
                                ? BENTO.navy
                                : deptTheme.bg,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.pickerDeptBadgeText,
                              {
                                color: isSelected ? "#ffffff" : deptTheme.text,
                              },
                            ]}
                          >
                            {dept.code}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.pickerItemName,
                              isSelected && styles.pickerItemNameActive,
                            ]}
                            numberOfLines={1}
                          >
                            {dept.name}
                          </Text>
                          <Text style={styles.pickerItemSubtitle}>
                            {dept.faculty}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <Feather name="check" size={18} color={BENTO.navy} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* ======================================================== */}
        {/* PICKER MODAL 2: DEGREE SELECTION (from universityPrograms) */}
        {/* ======================================================== */}
        <Modal
          visible={isDegreePickerOpen}
          transparent={true}
          statusBarTranslucent={true}
          animationType="fade"
          onRequestClose={() => setIsDegreePickerOpen(false)}
        >
          <View style={styles.pickerBackdrop}>
            <TouchableOpacity
              style={StyleSheet.absoluteFill}
              activeOpacity={1}
              onPress={() => setIsDegreePickerOpen(false)}
            />
            <View
              style={[
                styles.pickerSheet,
                { paddingBottom: Math.max(insets.bottom, 16) + 12 },
              ]}
            >
              <View style={styles.pickerDragHandle} />
              <View style={styles.pickerHeader}>
                <View>
                  <Text style={styles.pickerTitle}>Select Degree Program</Text>
                  <Text style={styles.pickerSubtitle}>
                    All academic programs from university catalog
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setIsDegreePickerOpen(false)}
                  style={styles.pickerCloseBtn}
                >
                  <Feather name="x" size={18} color={BENTO.navy} />
                </TouchableOpacity>
              </View>

              {/* Search Inside Degree Dropdown */}
              <View style={styles.pickerSearchWrap}>
                <Feather
                  name="search"
                  size={14}
                  color={BENTO.slate}
                  style={{ marginRight: 8 }}
                />
                <TextInput
                  style={styles.pickerSearchInput}
                  placeholder="Search program by name or short code..."
                  placeholderTextColor={BENTO.slate}
                  value={degreeSearchQuery}
                  onChangeText={setDegreeSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {degreeSearchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setDegreeSearchQuery("")}>
                    <Feather name="x" size={13} color={BENTO.slate} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                style={styles.pickerList}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {filteredPrograms.map((prog: AcademicProgram) => {
                  const isSelected = degree === prog.name;

                  return (
                    <TouchableOpacity
                      key={prog.id}
                      style={[
                        styles.pickerItem,
                        isSelected && styles.pickerItemActive,
                      ]}
                      onPress={() => {
                        setDegree(prog.name);
                        // Auto-populate department if empty or mismatch
                        if (!department.trim() && prog.department) {
                          setDepartment(prog.department);
                          if (errors.department)
                            setErrors((prev) => ({ ...prev, department: "" }));
                        }
                        setIsDegreePickerOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.pickerItemLeft}>
                        <View style={styles.pickerProgramBadge}>
                          <Text style={styles.pickerProgramBadgeText}>
                            {prog.shortName}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.pickerItemName,
                              isSelected && styles.pickerItemNameActive,
                            ]}
                            numberOfLines={1}
                          >
                            {prog.name}
                          </Text>
                          <Text style={styles.pickerItemSubtitle}>
                            {prog.level} · {prog.department}
                          </Text>
                        </View>
                      </View>

                      {isSelected && (
                        <Feather name="check" size={18} color={BENTO.navy} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  topAppBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: BENTO.canvas,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
  },
  topAppBarCenter: {
    flex: 1,
    marginRight: 12,
  },
  topAppBarTitle: {
    fontFamily,
    fontSize: 20,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.4,
  },
  topAppBarSubtitle: {
    fontFamily,
    fontSize: 12.5,
    color: BENTO.slate,
    marginTop: 2,
    fontWeight: "500",
  },
  headerCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  cardSection: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO.slate,
    marginTop: 1,
  },
  formGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.4,
  },
  requiredStar: {
    color: "#ef4444",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 46,
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fff5f5",
  },
  fieldIcon: {
    marginRight: 10,
  },
  fieldInput: {
    flex: 1,
    fontFamily,
    fontSize: 13.5,
    color: BENTO.navy,
    padding: 0,
  },
  inputClearBtn: {
    padding: 4,
  },
  dropdownTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8fafc",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownTriggerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  dropdownTriggerText: {
    fontFamily,
    fontSize: 13.5,
    color: "#9ca3af",
  },
  dropdownTriggerTextSelected: {
    color: BENTO.navy,
    fontWeight: "600",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  errorText: {
    fontFamily,
    fontSize: 11.5,
    color: "#ef4444",
    fontWeight: "600",
  },
  helperText: {
    fontFamily,
    fontSize: 11,
    color: "#94a3b8",
  },
  bottomActionBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  cancelActionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  cancelActionText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
  },
  submitActionBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: 14,
    backgroundColor: BENTO.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: BENTO.navy,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  submitActionBtnDisabled: {
    opacity: 0.7,
  },
  submitActionText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },

  // Picker Sheet Styles
  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(19, 27, 46, 0.45)",
    justifyContent: "flex-end",
  },
  pickerSheet: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    paddingHorizontal: 20,
    paddingTop: 12,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  pickerDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
    marginBottom: 14,
  },
  pickerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  pickerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
  },
  pickerSubtitle: {
    fontFamily,
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
  },
  pickerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  pickerSearchWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
  },
  pickerSearchInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO.navy,
    padding: 0,
  },
  pickerList: {
    flexGrow: 0,
    marginBottom: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  pickerItemActive: {
    backgroundColor: "#f8fafc",
  },
  pickerItemLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginRight: 8,
  },
  pickerDeptBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerDeptBadgeText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
  },
  pickerProgramBadge: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 7,
    minWidth: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  pickerProgramBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: "#1e40af",
  },
  pickerItemName: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
  },
  pickerItemNameActive: {
    color: "#2563eb",
  },
  pickerItemSubtitle: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO.slate,
    marginTop: 1,
  },
});
