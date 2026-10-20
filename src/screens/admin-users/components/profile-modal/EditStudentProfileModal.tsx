import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Switch,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AdminUser, UpdateAdminStudentProfilePayload } from "../../types";
import {
  BLOOD_GROUP_OPTIONS,
  BLOOD_GROUP_UI_TO_API,
  BLOOD_GROUP_API_TO_UI,
} from "../../constants";
import { SelectionModal } from "@/screens/admin-add-faculty/components/selection-modal";
import { universityPrograms } from "@/data/programs";

// Helper to extract unique faculties from official university programs
const UNIQUE_FACULTIES = Array.from(
  new Set(universityPrograms.map((p) => p.faculty)),
).sort();

// Helper to clean department names
const cleanDepartmentName = (name: string) => {
  return name
    .replace(
      /^(Bachelor|Masters|Master|B\.Sc|BSS|BA|MA|MSS|MBA)\s*(\(Hons\))?\s*(of|in)?\s*/i,
      "",
    )
    .replace(/\s*\(.*\)\s*$/, "")
    .trim();
};

// Helper to capitalize the first letter of each word
const capitalizeWords = (str: string): string => {
  return str.replace(/(^|\s+)([a-z])/g, (_, space, char) => space + char.toUpperCase());
};

// Helper to normalize and ensure Bangladesh phone number starts with +880
const normalizeBangladeshPhone = (phone?: string | null): string => {
  if (!phone) return "+880";
  const clean = phone.trim();
  if (!clean) return "+880";
  if (clean.startsWith("+880")) return clean;
  if (clean.startsWith("880")) return `+${clean}`;
  if (clean.startsWith("0")) return `+880${clean.slice(1)}`;
  return `+880${clean}`;
};

// Ordinal suffix helper for semester display
const getSemesterOrdinalSuffix = (sem: number): string => {
  if (sem === 1) return "st";
  if (sem === 2) return "nd";
  if (sem === 3) return "rd";
  return "th";
};

interface EditStudentProfileModalProps {
  visible: boolean;
  user: AdminUser;
  onClose: () => void;
  onSave: (
    userId: string,
    data: UpdateAdminStudentProfilePayload,
  ) => Promise<any> | void;
  isSaving?: boolean;
}

export const EditStudentProfileModal = React.memo(
  ({
    visible,
    user,
    onClose,
    onSave,
    isSaving = false,
  }: EditStudentProfileModalProps) => {
    const insets = useSafeAreaInsets();
    const profile = user.studentProfile;

    // --- Form State ---
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("+880");
    const [bloodGroup, setBloodGroup] = useState<string | null>(null);

    // Handlers for name and phone
    const handleNameChange = useCallback((val: string) => {
      setName(capitalizeWords(val));
    }, []);

    const handlePhoneChange = useCallback((val: string) => {
      if (!val.startsWith("+880")) {
        const digits = val.replace(/[^\d]/g, "");
        if (digits.startsWith("880")) {
          setPhoneNumber(`+${digits}`);
        } else if (digits.startsWith("0")) {
          setPhoneNumber(`+880${digits.slice(1)}`);
        } else if (digits.length > 0) {
          setPhoneNumber(`+880${digits}`);
        } else {
          setPhoneNumber("+880");
        }
      } else {
        const suffix = val.slice(4).replace(/[^\d\s]/g, "");
        setPhoneNumber(`+880${suffix}`);
      }
    }, []);

    // Academic Profile
    const [studentId, setStudentId] = useState("");
    const [program, setProgram] = useState("");
    const [department, setDepartment] = useState("");
    const [faculty, setFaculty] = useState("");
    const [batch, setBatch] = useState("");
    const [currentSemester, setCurrentSemester] = useState<number>(1);
    const [section, setSection] = useState("A");
    const [currentTerm, setCurrentTerm] = useState("");

    // Leadership
    const [isCR, setIsCR] = useState(false);

    // Skills
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkillInput, setNewSkillInput] = useState("");

    // Social & Professional
    const [linkedInUrl, setLinkedInUrl] = useState("");
    const [personalWebsiteUrl, setPersonalWebsiteUrl] = useState("");

    // Active Selection Modal state
    const [activeSelector, setActiveSelector] = useState<
      "program" | "faculty" | "department" | null
    >(null);

    // Filtered lists for dropdowns
    const programOptions = useMemo(() => {
      return universityPrograms.map((p) => p.name).sort();
    }, []);

    const facultyOptions = useMemo(() => {
      const set = new Set(UNIQUE_FACULTIES);
      if (
        faculty &&
        !Array.from(set).some((f) => f.toLowerCase() === faculty.toLowerCase())
      ) {
        set.add(faculty);
      }
      return Array.from(set).sort();
    }, [faculty]);

    const departmentOptions = useMemo(() => {
      if (!faculty) {
        const allDeps = universityPrograms.map(
          (p) => p.department || cleanDepartmentName(p.name),
        );
        return Array.from(new Set(allDeps)).filter(Boolean).sort();
      }
      const cleanFac = faculty.toLowerCase();
      const progs = universityPrograms.filter((p) => {
        const pFac = p.faculty.toLowerCase();
        return (
          pFac === cleanFac ||
          pFac.includes(cleanFac) ||
          cleanFac.includes(pFac)
        );
      });
      let deps = progs.map((p) => p.department || cleanDepartmentName(p.name));
      if (deps.length === 0) {
        deps = universityPrograms.map(
          (p) => p.department || cleanDepartmentName(p.name),
        );
      }
      return Array.from(new Set(deps)).filter(Boolean).sort();
    }, [faculty]);

    // Handle Selector Selection
    const handleSelectorSelect = useCallback(
      (value: string) => {
        if (!activeSelector) return;

        if (activeSelector === "program") {
          setProgram(value);
          const matched = universityPrograms.find(
            (p) => p.name.toLowerCase() === value.toLowerCase(),
          );
          if (matched) {
            setDepartment(matched.department || cleanDepartmentName(matched.name));
            setFaculty(matched.faculty);
          }
        } else if (activeSelector === "faculty") {
          if (faculty !== value) {
            setFaculty(value);
            const progs = universityPrograms.filter((p) => {
              const pFac = p.faculty.toLowerCase();
              const valFac = value.toLowerCase();
              return (
                pFac === valFac ||
                pFac.includes(valFac) ||
                valFac.includes(pFac)
              );
            });
            const deps = progs.map((p) =>
              (p.department || cleanDepartmentName(p.name)).toLowerCase(),
            );
            if (department && !deps.includes(department.toLowerCase())) {
              setDepartment("");
            }
          }
        } else if (activeSelector === "department") {
          setDepartment(value);
        }

        setActiveSelector(null);
      },
      [activeSelector, faculty, department],
    );

    // Sync Initial State
    useEffect(() => {
      if (!visible) {
        setActiveSelector(null);
        return;
      }

      setName(capitalizeWords(user.name || ""));
      setPhoneNumber(normalizeBangladeshPhone(user.phoneNumber));

      const rawBlood = user.bloodGroup || null;
      if (rawBlood) {
        setBloodGroup(BLOOD_GROUP_API_TO_UI[rawBlood] || rawBlood);
      } else {
        setBloodGroup(null);
      }

      setStudentId(profile?.studentId || "");
      setProgram(profile?.program || "");
      setDepartment(profile?.department || "CSE");
      setFaculty(profile?.faculty || "Faculty of Science and Information Technology");
      setBatch(profile?.batch ? String(profile.batch) : "");
      setCurrentSemester(
        profile?.currentSemester ? Number(profile.currentSemester) : 1,
      );
      setSection(profile?.section || "A");
      setCurrentTerm((profile as any)?.currentTerm || "");

      setIsCR(Boolean(profile?.isCR));

      // Skills
      const rawSkills = (profile as any)?.skills;
      if (Array.isArray(rawSkills)) {
        setSkills(rawSkills.filter((s) => typeof s === "string" && s.trim()));
      } else {
        setSkills([]);
      }
      setNewSkillInput("");

      setLinkedInUrl(profile?.linkedInUrl || "");
      setPersonalWebsiteUrl(profile?.personalWebsiteUrl || "");
    }, [visible, user, profile]);

    // Add Skill
    const handleAddSkill = useCallback(() => {
      const trimmed = newSkillInput.trim();
      if (!trimmed) return;
      if (skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
        Alert.alert("Already Added", `"${trimmed}" is already in the skills list.`);
        return;
      }
      setSkills((prev) => [...prev, trimmed]);
      setNewSkillInput("");
    }, [newSkillInput, skills]);

    // Remove Skill
    const handleRemoveSkill = useCallback((skillToRemove: string) => {
      setSkills((prev) => prev.filter((s) => s !== skillToRemove));
    }, []);

    // Save Action
    const handleSave = useCallback(async () => {
      const cleanName = capitalizeWords(name.trim());
      if (!cleanName) {
        Alert.alert("Invalid Name", "Student name cannot be empty.");
        return;
      }

      const cleanStudentId = studentId.trim();
      if (!cleanStudentId) {
        Alert.alert("Missing Student ID", "Student ID is required.");
        return;
      }

      const rawPhone = phoneNumber.trim();
      const cleanPhone =
        rawPhone === "+880" || rawPhone.length <= 4 ? null : rawPhone;

      // Map blood group to DB enum
      let dbBloodGroup: string | null = null;
      if (bloodGroup && BLOOD_GROUP_UI_TO_API[bloodGroup]) {
        dbBloodGroup = BLOOD_GROUP_UI_TO_API[bloodGroup];
      }

      const payload: UpdateAdminStudentProfilePayload = {
        name: cleanName,
        phoneNumber: cleanPhone || null,
        bloodGroup: dbBloodGroup,
        studentId: cleanStudentId,
        faculty: faculty.trim() || undefined,
        department: department.trim() || undefined,
        program: program.trim() || undefined,
        batch: batch.trim() || undefined,
        currentSemester: Number(currentSemester) || 1,
        section: section.trim() || "A",
        currentTerm: currentTerm.trim() || null,
        isCR: isCR,
        skills: skills.length > 0 ? skills : [],
        linkedInUrl: linkedInUrl.trim() || null,
        personalWebsiteUrl: personalWebsiteUrl.trim() || null,
      };

      try {
        await onSave(user.id, payload);
        onClose();
      } catch (err: any) {
        const errorMsg =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.response?.data?.errorSources?.[0]?.message ||
          err?.message ||
          "Failed to save student profile changes. Please try again.";
        Alert.alert("Update Failed", errorMsg);
      }
    }, [
      name,
      phoneNumber,
      bloodGroup,
      studentId,
      faculty,
      department,
      program,
      batch,
      currentSemester,
      section,
      currentTerm,
      isCR,
      skills,
      linkedInUrl,
      personalWebsiteUrl,
      onSave,
      user.id,
      onClose,
    ]);

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
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Top Sticky Header */}
          <View
            style={[
              styles.header,
              { paddingTop: Math.max(insets.top, 24) + 8 },
            ]}
          >
            <TouchableOpacity
              onPress={onClose}
              style={styles.headerBtn}
              activeOpacity={0.7}
              disabled={isSaving}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel edit"
            >
              <Text style={styles.headerCancelText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Edit Student Profile</Text>
            </View>

            <TouchableOpacity
              onPress={handleSave}
              style={[styles.headerSaveBtn, isSaving && styles.headerSaveBtnDisabled]}
              activeOpacity={0.8}
              disabled={isSaving}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Save profile changes"
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.headerSaveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Scroll Area */}
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 40 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Identity Banner */}
            <View style={styles.identityBanner}>
              <View style={styles.bannerAvatarCircle}>
                <Ionicons name="school" size={22} color="#00875A" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerName}>{user.name || "Student"}</Text>
                <View style={styles.bannerBadgesRow}>
                  {Boolean(profile?.studentId) && (
                    <View style={styles.badgeId}>
                      <Text style={styles.badgeIdText}>#{profile?.studentId}</Text>
                    </View>
                  )}
                  <View style={styles.badgeEmail}>
                    <Text style={styles.badgeEmailText} numberOfLines={1}>
                      {user.email}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
            {/* 1. BASIC INFORMATION */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBoxEmerald}>
                  <Feather name="user" size={13} color="#00875A" />
                </View>
                <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>
              </View>

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Student full name"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="words"
                />
              </View>

              {/* Phone Number */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Phone Number</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="phone"
                    size={15}
                    color="#64748B"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={phoneNumber}
                    onChangeText={handlePhoneChange}
                    placeholder="+880 1XXXXXXXXX"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Blood Group */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Blood Group</Text>
                  {bloodGroup && (
                    <TouchableOpacity
                      onPress={() => setBloodGroup(null)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.clearBadgeText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.chipsRow}>
                  {BLOOD_GROUP_OPTIONS.map((bg) => {
                    const isSelected = bloodGroup === bg;
                    return (
                      <TouchableOpacity
                        key={bg}
                        onPress={() => setBloodGroup(isSelected ? null : bg)}
                        style={[
                          styles.chip,
                          isSelected && styles.chipSelectedEmerald,
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipTextSelectedEmerald,
                          ]}
                        >
                          {bg}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 2. ACADEMIC PROGRAM & AFFILIATION */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBoxAmber}>
                  <Ionicons name="school" size={13} color="#D97706" />
                </View>
                <Text style={styles.sectionTitle}>ACADEMIC PROGRAM & AFFILIATION</Text>
              </View>

              {/* Student ID */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Student ID *</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="hash"
                    size={15}
                    color="#D97706"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={studentId}
                    onChangeText={setStudentId}
                    placeholder="e.g. 212071001"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Program Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Academic Program</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setActiveSelector("program")}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.selectorBtnText,
                        !program && styles.selectorBtnPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {program || "Select Academic Program"}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Faculty Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Faculty</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setActiveSelector("faculty")}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.selectorBtnText,
                        !faculty && styles.selectorBtnPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {faculty || "Select Faculty"}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Department Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Department</Text>
                <TouchableOpacity
                  style={styles.selectorBtn}
                  onPress={() => setActiveSelector("department")}
                  activeOpacity={0.75}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.selectorBtnText,
                        !department && styles.selectorBtnPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {department || "Select Department"}
                    </Text>
                  </View>
                  <Feather name="chevron-down" size={16} color="#64748B" />
                </TouchableOpacity>
              </View>

              {/* Batch & Section Row */}
              <View style={styles.twoColRow}>
                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Batch</Text>
                  <TextInput
                    style={styles.input}
                    value={batch}
                    onChangeText={setBatch}
                    placeholder="e.g. 21"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                <View style={[styles.fieldGroup, { flex: 1 }]}>
                  <Text style={styles.fieldLabel}>Section</Text>
                  <TextInput
                    style={styles.input}
                    value={section}
                    onChangeText={setSection}
                    placeholder="e.g. A"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="characters"
                  />
                </View>
              </View>

              {/* Current Semester (1-12 Selector) */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Current Semester</Text>
                  <View style={styles.semesterBadgeRow}>
                    <Text style={styles.semesterBadgeNumber}>{currentSemester}</Text>
                    <Text style={styles.semesterBadgeSuperscript}>
                      {getSemesterOrdinalSuffix(currentSemester)}
                    </Text>
                    <Text style={styles.semesterBadgeWord}> Semester</Text>
                  </View>
                </View>
                <View style={styles.semesterGrid}>
                  <View style={styles.semesterRow}>
                    {[1, 2, 3, 4, 5, 6].map((sem) => {
                      const isSelected = currentSemester === sem;
                      return (
                        <TouchableOpacity
                          key={sem}
                          onPress={() => setCurrentSemester(sem)}
                          style={[
                            styles.semesterPill,
                            isSelected && styles.semesterPillActive,
                          ]}
                          activeOpacity={0.7}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Semester ${sem}`}
                        >
                          <Text
                            style={[
                              styles.semesterPillText,
                              isSelected && styles.semesterPillTextActive,
                            ]}
                          >
                            {sem}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.semesterRow}>
                    {[7, 8, 9, 10, 11, 12].map((sem) => {
                      const isSelected = currentSemester === sem;
                      return (
                        <TouchableOpacity
                          key={sem}
                          onPress={() => setCurrentSemester(sem)}
                          style={[
                            styles.semesterPill,
                            isSelected && styles.semesterPillActive,
                          ]}
                          activeOpacity={0.7}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Semester ${sem}`}
                        >
                          <Text
                            style={[
                              styles.semesterPillText,
                              isSelected && styles.semesterPillTextActive,
                            ]}
                          >
                            {sem}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Current Term */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Current Term / Academic Session</Text>
                <TextInput
                  style={styles.input}
                  value={currentTerm}
                  onChangeText={setCurrentTerm}
                  placeholder="e.g. Spring 2026, Fall 2026"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {/* 3. CLASS REPRESENTATIVE STATUS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBoxGold}>
                  <Ionicons name="ribbon" size={14} color="#B45309" />
                </View>
                <Text style={styles.sectionTitle}>CLASS LEADERSHIP</Text>
              </View>

              <View style={styles.switchRowCard}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={styles.switchTitle}>Class Representative (CR)</Text>
                  <Text style={styles.switchDescription}>
                    Designate this student as a Class Representative with leadership badge and privileges.
                  </Text>
                </View>
                <Switch
                  value={isCR}
                  onValueChange={setIsCR}
                  trackColor={{ false: "#E2E8F0", true: "#FEF08A" }}
                  thumbColor={isCR ? "#D97706" : "#FFFFFF"}
                />
              </View>
            </View>

            {/* 4. SKILLS & EXPERTISE */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBoxPurple}>
                  <Feather name="code" size={13} color="#7C3AED" />
                </View>
                <Text style={styles.sectionTitle}>SKILLS & INTERESTS</Text>
              </View>

              {/* Skills Chips */}
              <View style={styles.chipsRow}>
                {skills.map((skill) => (
                  <View key={skill} style={styles.skillTag}>
                    <Text style={styles.skillTagText}>{skill}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSkill(skill)}
                      style={styles.skillTagRemove}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Feather name="x" size={12} color="#7C3AED" />
                    </TouchableOpacity>
                  </View>
                ))}
                {skills.length === 0 && (
                  <Text style={styles.emptySkillsText}>
                    No skills added yet. Add relevant competencies below.
                  </Text>
                )}
              </View>

              {/* Add Skill Input Row */}
              <View style={styles.addSkillRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: 8 }]}
                  value={newSkillInput}
                  onChangeText={setNewSkillInput}
                  placeholder="e.g. React Native, Python, UI Design"
                  placeholderTextColor="#94A3B8"
                  onSubmitEditing={handleAddSkill}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={handleAddSkill}
                  style={styles.addSkillBtn}
                  activeOpacity={0.7}
                >
                  <Feather name="plus" size={14} color="#FFFFFF" />
                  <Text style={styles.addSkillBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 5. PORTFOLIO & SOCIAL LINKS */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBoxSky}>
                  <Feather name="link" size={13} color="#0284C7" />
                </View>
                <Text style={styles.sectionTitle}>PORTFOLIO & SOCIAL LINKS</Text>
              </View>

              {/* LinkedIn URL */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>LinkedIn Profile</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="linkedin"
                    size={15}
                    color="#0A66C2"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={linkedInUrl}
                    onChangeText={setLinkedInUrl}
                    placeholder="https://linkedin.com/in/username"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* Personal Website */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Personal Website / Portfolio</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="globe"
                    size={15}
                    color="#0284C7"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={personalWebsiteUrl}
                    onChangeText={setPersonalWebsiteUrl}
                    placeholder="https://yourportfolio.com"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Dynamic Selection Bottom Sheet Modal */}
        <SelectionModal
          visible={activeSelector !== null}
          title={
            activeSelector === "program"
              ? "Select Academic Program"
              : activeSelector === "faculty"
                ? "Select Faculty"
                : "Select Department"
          }
          options={
            activeSelector === "program"
              ? programOptions
              : activeSelector === "faculty"
                ? facultyOptions
                : departmentOptions
          }
          selectedValue={
            activeSelector === "program"
              ? program
              : activeSelector === "faculty"
                ? faculty
                : department
          }
          onSelect={handleSelectorSelect}
          onClose={() => setActiveSelector(null)}
        />
      </Modal>
    );
  },
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#64748B",
  },
  headerCenter: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  headerSaveBtn: {
    backgroundColor: "#00875A",
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSaveBtnDisabled: {
    opacity: 0.6,
  },
  headerSaveText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  identityBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bannerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bannerName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },
  bannerBadgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  badgeId: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },
  badgeEmail: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    maxWidth: 180,
  },
  badgeEmailText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconBoxEmerald: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionIconBoxAmber: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionIconBoxGold: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#FEF08A",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionIconBoxPurple: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#F5F3FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionIconBoxSky: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    letterSpacing: 0.5,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  clearBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  semesterBadgeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  semesterBadgeNumber: {
    fontSize: 12,
    fontWeight: "800",
    color: "#00875A",
    includeFontPadding: false,
    lineHeight: 14,
  },
  semesterBadgeSuperscript: {
    fontSize: 8.5,
    fontWeight: "800",
    color: "#00875A",
    includeFontPadding: false,
    lineHeight: 10,
    marginTop: -1,
    marginLeft: 0.5,
  },
  semesterBadgeWord: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#00875A",
    includeFontPadding: false,
    lineHeight: 14,
    marginLeft: 2,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: "#0F172A",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 9,
    fontSize: 13.5,
    color: "#0F172A",
  },
  selectorBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectorBtnText: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0F172A",
  },
  selectorBtnPlaceholder: {
    fontWeight: "400",
    color: "#94A3B8",
  },
  twoColRow: {
    flexDirection: "row",
    gap: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipSelectedEmerald: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  chipTextSelectedEmerald: {
    color: "#047857",
    fontWeight: "700",
  },
  semesterGrid: {
    gap: 7,
  },
  semesterRow: {
    flexDirection: "row",
    gap: 6,
  },
  semesterPill: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  semesterPillActive: {
    backgroundColor: "#ECFDF5",
    borderColor: "#059669",
    borderWidth: 1.8,
  },
  semesterPillText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
    textAlignVertical: "center",
    includeFontPadding: false,
  },
  semesterPillTextActive: {
    color: "#059669",
    fontWeight: "800",
  },
  switchRowCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFBEB",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    padding: 12,
  },
  switchTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 11,
    color: "#B45309",
    lineHeight: 15,
  },
  skillTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 8,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
    gap: 6,
  },
  skillTagText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6D28D9",
  },
  skillTagRemove: {
    padding: 2,
  },
  emptySkillsText: {
    fontSize: 12,
    color: "#94A3B8",
    fontStyle: "italic",
    paddingVertical: 4,
  },
  addSkillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  addSkillBtn: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 4,
  },
  addSkillBtnText: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
