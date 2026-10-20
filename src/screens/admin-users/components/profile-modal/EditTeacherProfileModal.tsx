import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather, FontAwesome5, Ionicons } from "@expo/vector-icons";

import Toast from "react-native-toast-message";

import { AdminUser, UpdateAdminTeacherProfilePayload } from "../../types";
import {
  DESIGNATION_OPTIONS,
  TEACHER_ADMIN_ROLE_OPTIONS,
  DEPARTMENT_CHIPS,
  BLOOD_GROUP_OPTIONS,
  BLOOD_GROUP_UI_TO_API,
  BLOOD_GROUP_API_TO_UI,
  DAY_OFF_OPTIONS,
  FACULTY_OPTIONS,
} from "../../constants";
import { sortQualifications } from "@/utils/qualification-order";
import { SelectionModal } from "@/screens/admin-add-faculty/components/selection-modal";
import { AddSlotModal } from "@/screens/admin-add-faculty/components/modals/add-slot-modal";
import { universityPrograms, getDepartmentShortName } from "@/data/programs";

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

interface EditTeacherProfileModalProps {
  visible: boolean;
  user: AdminUser;
  onClose: () => void;
  onSave: (
    userId: string,
    data: UpdateAdminTeacherProfilePayload,
  ) => Promise<any> | void;
  isSaving?: boolean;
}

interface EditableConsultationSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
}

interface EditableQualification {
  id: string;
  degree: string;
  field: string;
  institution: string;
}

export const EditTeacherProfileModal = React.memo(
  ({
    visible,
    user,
    onClose,
    onSave,
    isSaving = false,
  }: EditTeacherProfileModalProps) => {
    const insets = useSafeAreaInsets();
    const profile = user.teacherProfile;

    // --- Form State ---
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("+880");
    const [bloodGroup, setBloodGroup] = useState<string | null>(null);

    // Handlers to enforce Title Case for name and +880 prefix for phone
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

    // Academic & Position
    const [designation, setDesignation] = useState("Lecturer");
    const [administrativeRole, setAdministrativeRole] = useState<string | null>(
      null,
    );
    const [department, setDepartment] = useState("CSE");
    const [faculty, setFaculty] = useState("");
    const [advisoryBatch, setAdvisoryBatch] = useState("");

    // Active selector state for Designation, Faculty, Department modal
    const [activeSelector, setActiveSelector] = useState<
      "designation" | "faculty" | "department" | null
    >(null);

    // Filtered faculties and departments
    const facultyOptions = React.useMemo(() => {
      const set = new Set(UNIQUE_FACULTIES);
      if (
        faculty &&
        !Array.from(set).some((f) => f.toLowerCase() === faculty.toLowerCase())
      ) {
        set.add(faculty);
      }
      return Array.from(set).sort();
    }, [faculty]);

    const departmentOptions = React.useMemo(() => {
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
        const allDeps = universityPrograms.map(
          (p) => p.department || cleanDepartmentName(p.name),
        );
        deps = allDeps;
      }
      const set = new Set(deps);
      if (
        department &&
        !Array.from(set).some((d) => d.toLowerCase() === department.toLowerCase())
      ) {
        set.add(department);
      }
      return Array.from(set).filter(Boolean).sort();
    }, [faculty, department]);

    const selectorTitle = React.useMemo(() => {
      switch (activeSelector) {
        case "designation":
          return "Select Academic Designation";
        case "faculty":
          return "Select Faculty Division";
        case "department":
          return "Select Department";
        default:
          return "";
      }
    }, [activeSelector]);

    const selectorOptions = React.useMemo(() => {
      switch (activeSelector) {
        case "designation":
          return [...DESIGNATION_OPTIONS];
        case "faculty":
          return facultyOptions;
        case "department":
          return departmentOptions;
        default:
          return [];
      }
    }, [activeSelector, facultyOptions, departmentOptions]);

    const currentSelectorValue = React.useMemo(() => {
      if (activeSelector === "designation") {
        return designation;
      }
      if (activeSelector === "faculty") {
        return (
          facultyOptions.find((f) => f.toLowerCase() === faculty.toLowerCase()) ||
          faculty
        );
      }
      if (activeSelector === "department") {
        return (
          departmentOptions.find(
            (d) =>
              d.toLowerCase() === department.toLowerCase() ||
              getDepartmentShortName(d).toLowerCase() === department.toLowerCase(),
          ) || department
        );
      }
      return "";
    }, [activeSelector, designation, faculty, department, facultyOptions, departmentOptions]);

    const handleSelectOption = useCallback(
      (value: string) => {
        if (!activeSelector) return;
        if (activeSelector === "designation") {
          setDesignation(value);
        } else if (activeSelector === "faculty") {
          if (faculty !== value) {
            setFaculty(value);
            // If current department is not in the new faculty's departments, reset it
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

    const handleDepartmentPress = useCallback(() => {
      if (!faculty) {
        Toast.show({
          type: "info",
          text1: "Faculty Required",
          text2: "Please select a faculty first to choose its department.",
        });
        return;
      }
      setActiveSelector("department");
    }, [faculty]);

    // Office & Availability
    const [officeRoom, setOfficeRoom] = useState("");
    const [dayOff, setDayOff] = useState("");
    const [consultationSlots, setConsultationSlots] = useState<
      EditableConsultationSlot[]
    >([]);
    const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);

    // Professional & Social
    const [linkedInUrl, setLinkedInUrl] = useState("");
    const [personalWebsiteUrl, setPersonalWebsiteUrl] = useState("");
    const [expertiseFields, setExpertiseFields] = useState<string[]>([]);
    const [newExpertiseInput, setNewExpertiseInput] = useState("");

    // Qualifications
    const [qualifications, setQualifications] = useState<
      EditableQualification[]
    >([]);
    const [newQualDegree, setNewQualDegree] = useState("");
    const [newQualInstitution, setNewQualInstitution] = useState("");
    const [isAddingQual, setIsAddingQual] = useState(false);

    // Sync initial state when modal opens or user changes
    useEffect(() => {
      if (!visible) {
        setActiveSelector(null);
        setIsSlotModalOpen(false);
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

      setDesignation(profile?.designation || "Lecturer");
      setAdministrativeRole(profile?.administrativeRole || null);
      setDepartment(profile?.department || "CSE");
      setFaculty(
        profile?.faculty || "",
      );
      setAdvisoryBatch(
        profile?.advisoryBatch !== null && profile?.advisoryBatch !== undefined
          ? String(profile.advisoryBatch)
          : "",
      );

      setOfficeRoom(profile?.officeRoom || "");
      setDayOff(profile?.dayOff || "");

      // Parse Consultation Slots
      const rawSlots = profile?.consultationSlots;
      let parsedSlots: EditableConsultationSlot[] = [];
      if (Array.isArray(rawSlots) && rawSlots.length > 0) {
        parsedSlots = rawSlots.map((s: any, idx: number) => ({
          id: s.id || `slot_${idx}_${Date.now()}`,
          day: s.day || s.days || "Monday",
          startTime:
            s.startTime ||
            (s.time ? s.time.split(/[-–—]/)[0]?.trim() : "10:00 AM"),
          endTime:
            s.endTime ||
            (s.time ? s.time.split(/[-–—]/)[1]?.trim() : "11:00 AM"),
        }));
      }
      setConsultationSlots(parsedSlots);
      setIsSlotModalOpen(false);

      setLinkedInUrl(profile?.linkedInUrl || "");
      setPersonalWebsiteUrl(profile?.personalWebsiteUrl || "");

      // Parse Expertise
      let expList: string[] = [];
      const rawExp = profile?.expertiseFields;
      if (Array.isArray(rawExp)) {
        expList = rawExp.filter((e) => typeof e === "string" && e.trim());
      } else if (typeof rawExp === "string" && rawExp.trim()) {
        try {
          const parsed = JSON.parse(rawExp);
          if (Array.isArray(parsed)) expList = parsed;
        } catch {
          expList = rawExp.split(",").map((s) => s.trim()).filter(Boolean);
        }
      }
      setExpertiseFields(expList);
      setNewExpertiseInput("");

      // Parse Qualifications
      const rawQual = profile?.academicQualifications;
      const parsedQuals: EditableQualification[] = [];
      if (Array.isArray(rawQual)) {
        rawQual.forEach((q, idx) => {
          if (!q) return;
          if (typeof q === "string") {
            const parts = q.split(" - ");
            parsedQuals.push({
              id: `q_${idx}_${Date.now()}`,
              degree: parts[0]?.trim() || "",
              field: "",
              institution: parts.slice(1).join(" - ").trim() || "",
            });
          } else if (typeof q === "object") {
            parsedQuals.push({
              id: q.id || `q_${idx}_${Date.now()}`,
              degree: q.degree || "",
              field: q.field || "",
              institution: q.institution || q.institute || "",
            });
          }
        });
      } else if (typeof rawQual === "object" && rawQual !== null) {
        Object.entries(rawQual).forEach(([key, val], idx) => {
          parsedQuals.push({
            id: `q_${idx}_${Date.now()}`,
            degree: key,
            field: "",
            institution: typeof val === "string" ? val : "",
          });
        });
      }
      setQualifications(
        sortQualifications(parsedQuals, (q) => q.degree)
      );
      setIsAddingQual(false);
      setNewQualDegree("");
      setNewQualInstitution("");
    }, [visible, user, profile]);

    // Add expertise chip
    const handleAddExpertise = useCallback(() => {
      const trimmed = newExpertiseInput.trim();
      if (!trimmed) return;
      if (expertiseFields.some((e) => e.toLowerCase() === trimmed.toLowerCase())) {
        Alert.alert("Already Added", `"${trimmed}" is already in the expertise list.`);
        return;
      }
      setExpertiseFields((prev) => [...prev, trimmed]);
      setNewExpertiseInput("");
    }, [newExpertiseInput, expertiseFields]);

    // Remove expertise chip
    const handleRemoveExpertise = useCallback((item: string) => {
      setExpertiseFields((prev) => prev.filter((e) => e !== item));
    }, []);

    // Add qualification
    const handleAddQualification = useCallback(() => {
      const cleanDegree = newQualDegree.trim();
      const cleanInst = newQualInstitution.trim();

      if (!cleanDegree && !cleanInst) {
        Alert.alert("Missing Details", "Please enter at least a degree or institution name.");
        return;
      }

      setQualifications((prev) =>
        sortQualifications(
          [
            ...prev,
            {
              id: `q_new_${Date.now()}`,
              degree: cleanDegree,
              field: "",
              institution: cleanInst,
            },
          ],
          (q) => q.degree,
        )
      );

      setNewQualDegree("");
      setNewQualInstitution("");
      setIsAddingQual(false);
    }, [newQualDegree, newQualInstitution]);

    // Remove qualification
    const handleRemoveQualification = useCallback((id: string) => {
      setQualifications((prev) => prev.filter((q) => q.id !== id));
    }, []);

    // Add consultation slot
    const handleAddSlot = useCallback(
      (newSlot: Omit<EditableConsultationSlot, "id">) => {
        setConsultationSlots((prev) => [
          ...prev,
          {
            ...newSlot,
            id: `slot_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          },
        ]);
        setIsSlotModalOpen(false);
      },
      [],
    );

    // Remove consultation slot
    const handleRemoveSlot = useCallback((id: string) => {
      setConsultationSlots((prev) => prev.filter((s) => s.id !== id));
    }, []);

    // Handle Save
    const handleSave = useCallback(async () => {
      const cleanName = capitalizeWords(name.trim());
      if (!cleanName) {
        Alert.alert("Invalid Name", "Faculty name cannot be empty.");
        return;
      }

      const rawPhone = phoneNumber.trim();
      const cleanPhone =
        rawPhone === "+880" || rawPhone.length <= 4 ? null : rawPhone;
      const cleanDesignation = designation.trim();
      const cleanDept = department.trim();
      const cleanFaculty = faculty.trim();
      const cleanRoom = officeRoom.trim();
      const cleanDayOff = dayOff.trim();


      const cleanSlots =
        consultationSlots.length > 0
          ? consultationSlots.map((s) => ({
              day: s.day,
              startTime: s.startTime,
              endTime: s.endTime,
            }))
          : null;

      const batchNum = advisoryBatch.trim() ? parseInt(advisoryBatch.trim(), 10) : null;

      // Map blood group to DB enum
      let dbBloodGroup: string | null = null;
      if (bloodGroup && BLOOD_GROUP_UI_TO_API[bloodGroup]) {
        dbBloodGroup = BLOOD_GROUP_UI_TO_API[bloodGroup];
      }

      // Format qualifications for backend in exact reverse-chronological hierarchy
      const sortedValidQuals = sortQualifications(
        qualifications.filter((q) => q.degree.trim() || q.institution.trim()),
        (q) => q.degree,
      );
      const formattedQuals = sortedValidQuals.map((q) => ({
        degree: q.degree.trim() || "Degree",
        field: q.field.trim() || q.degree.trim() || "Academics",
        institution: q.institution.trim() || "University",
      }));

      const payload: UpdateAdminTeacherProfilePayload = {
        name: cleanName,
        phoneNumber: cleanPhone || null,
        bloodGroup: dbBloodGroup,
        designation: cleanDesignation || "Lecturer",
        administrativeRole: administrativeRole ? administrativeRole.trim() : null,
        department: cleanDept || "CSE",
        faculty: cleanFaculty || "Faculty of Science and Information Technology",
        officeRoom: cleanRoom || null,
        dayOff: cleanDayOff || null,
        consultationSlots: cleanSlots,
        advisoryBatch: isNaN(batchNum as number) ? null : batchNum,
        expertiseFields: expertiseFields.length > 0 ? expertiseFields : [],
        academicQualifications: formattedQuals.length > 0 ? formattedQuals : null,
        linkedInUrl: linkedInUrl.trim() || null,
        personalWebsiteUrl: personalWebsiteUrl.trim() || null,
      };

      try {
        await onSave(user.id, payload);
        onClose();
      } catch {
        // Error toast handled in mutation
      }
    }, [
      name,
      phoneNumber,
      bloodGroup,
      designation,
      administrativeRole,
      department,
      faculty,
      officeRoom,
      dayOff,
      consultationSlots,
      advisoryBatch,
      expertiseFields,
      qualifications,
      linkedInUrl,
      personalWebsiteUrl,
      user.id,
      onSave,
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
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalContainer}
        >
          {/* Sticky Header */}
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
              <Text style={styles.headerTitle}>Edit Faculty Profile</Text>
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
            style={styles.scroll}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(insets.bottom, 24) + 40 },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Identity Banner */}
            <View style={styles.identityBanner}>
              <View style={styles.bannerAvatarCircle}>
                <Feather name="user-check" size={20} color="#4338CA" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerName} numberOfLines={1}>
                  {user.name}
                </Text>
                <View style={styles.bannerBadgesRow}>
                  {profile?.teacherId && (
                    <View style={styles.badgeId}>
                      <Text style={styles.badgeIdText}>
                        ID: {profile.teacherId}
                      </Text>
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

            {/* ======================================================== */}
            {/* SECTION 1: PERSONAL & CONTACT INFORMATION                */}
            {/* ======================================================== */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: "#EEF2FF" }]}>
                  <Feather name="user" size={15} color="#4338CA" />
                </View>
                <Text style={styles.cardTitle}>PERSONAL & CONTACT</Text>
              </View>

              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={handleNameChange}
                  placeholder="Faculty member full name"
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
                        style={[
                          styles.chip,
                          isSelected && styles.chipBloodSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setBloodGroup(isSelected ? null : bg)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipBloodTextSelected,
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

            {/* ======================================================== */}
            {/* SECTION 2: ACADEMIC POSITION & LEADERSHIP                */}
            {/* ======================================================== */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="school-outline" size={16} color="#B45309" />
                </View>
                <Text style={[styles.cardTitle, { color: "#92400E" }]}>
                  ACADEMIC POSITION & LEADERSHIP
                </Text>
              </View>

              {/* Designation Selector */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Academic Designation <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.selectorWrapper}
                  onPress={() => setActiveSelector("designation")}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select Academic Designation"
                  activeOpacity={0.7}
                >
                  <Feather
                    name="award"
                    size={18}
                    color="#D97706"
                    style={styles.fieldIcon}
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      !designation && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {designation || "Select Designation"}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={18}
                    color="#D97706"
                  />
                </TouchableOpacity>
              </View>

              {/* Leadership Role Selector */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Administrative Leadership Role</Text>
                  {administrativeRole && (
                    <TouchableOpacity
                      onPress={() => setAdministrativeRole(null)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.clearBadgeText}>None</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <View style={styles.chipsRow}>
                  {TEACHER_ADMIN_ROLE_OPTIONS.map((item) => {
                    const isSelected =
                      (item.value === null && !administrativeRole) ||
                      (item.value !== null && administrativeRole === item.value);

                    return (
                      <TouchableOpacity
                        key={item.label}
                        style={[
                          styles.chip,
                          isSelected && styles.chipRoleSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setAdministrativeRole(item.value)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipRoleTextSelected,
                          ]}
                        >
                          {item.value ? item.value : "None"}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Faculty Division */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Faculty Division <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={styles.selectorWrapper}
                  onPress={() => setActiveSelector("faculty")}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select Faculty Division"
                  activeOpacity={0.7}
                >
                  <Feather
                    name="book"
                    size={18}
                    color="#D97706"
                    style={styles.fieldIcon}
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      !faculty && styles.placeholderText,
                    ]}
                    numberOfLines={1}
                  >
                    {faculty || "Select Faculty"}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={18}
                    color="#D97706"
                  />
                </TouchableOpacity>
              </View>

              {/* Department */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>
                  Department <Text style={styles.requiredAsterisk}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[
                    styles.selectorWrapper,
                    !faculty && styles.selectorWrapperDisabled,
                  ]}
                  onPress={handleDepartmentPress}
                  activeOpacity={faculty ? 0.7 : 0.9}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Select Department"
                >
                  <Feather
                    name="home"
                    size={18}
                    color={faculty ? "#D97706" : "#94A3B8"}
                    style={styles.fieldIcon}
                  />
                  <Text
                    style={[
                      styles.selectorText,
                      !department && styles.placeholderText,
                      !faculty && styles.disabledText,
                    ]}
                    numberOfLines={1}
                  >
                    {department ||
                      (faculty ? "Select Department" : "Select Faculty first")}
                  </Text>
                  <Feather
                    name="chevron-down"
                    size={18}
                    color={faculty ? "#D97706" : "#94A3B8"}
                  />
                </TouchableOpacity>
                {!faculty && (
                  <View style={styles.helperRow}>
                    <Feather
                      name="info"
                      size={13}
                      color="#B45309"
                    />
                    <Text style={styles.helperText}>
                      Please select a faculty first to choose a department
                    </Text>
                  </View>
                )}
              </View>

              {/* Advisory Batch */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Advisory Batch</Text>
                <TextInput
                  style={styles.input}
                  value={advisoryBatch}
                  onChangeText={setAdvisoryBatch}
                  placeholder="e.g. 30"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
            </View>

            {/* ======================================================== */}
            {/* SECTION 3: OFFICE & AVAILABILITY                         */}
            {/* ======================================================== */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: "#ECFDF5" }]}>
                  <Feather name="calendar" size={15} color="#059669" />
                </View>
                <Text style={[styles.cardTitle, { color: "#065F46" }]}>
                  OFFICE & AVAILABILITY
                </Text>
              </View>

              {/* Office Room */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Office Room Number</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="map-pin"
                    size={15}
                    color="#64748B"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={officeRoom}
                    onChangeText={setOfficeRoom}
                    placeholder="e.g. 1803"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              {/* Day Off */}
              <View style={styles.fieldGroup}>
                <View style={styles.fieldLabelRow}>
                  <Text style={styles.fieldLabel}>Weekly Day Off</Text>
                  {dayOff ? (
                    <TouchableOpacity
                      onPress={() => setDayOff("")}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.clearBadgeText}>Clear</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
                <View style={styles.chipsRow}>
                  {DAY_OFF_OPTIONS.map((day) => {
                    const isSelected =
                      dayOff.toLowerCase() === day.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.chip,
                          isSelected && styles.chipDayOffSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setDayOff(isSelected ? "" : day)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipDayOffTextSelected,
                          ]}
                        >
                          {day}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Consultation Hours */}
              <View style={styles.consultationCard}>
                <View style={styles.consultationHeaderRow}>
                  <View style={styles.consultationTitleGroup}>
                    <Feather name="clock" size={14} color="#059669" />
                    <Text style={styles.consultationHeaderTitle}>
                      CONSULTATION HOURS
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setIsSlotModalOpen(true)}
                    style={styles.addSlotBtn}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Add consultation slot"
                  >
                    <Feather name="plus" size={13} color="#059669" />
                    <Text style={styles.addSlotBtnText}>Add Slot</Text>
                  </TouchableOpacity>
                </View>

                {consultationSlots.length === 0 ? (
                  <TouchableOpacity
                    onPress={() => setIsSlotModalOpen(true)}
                    style={styles.emptySlotContainer}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emptySlotText}>
                      No consultation hours added yet. Tap to add.
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.slotsList}>
                    {consultationSlots.map((slot) => (
                      <View key={slot.id} style={styles.slotChip}>
                        <View style={styles.slotDot} />
                        <Text style={styles.slotChipText} numberOfLines={1}>
                          {slot.day}: {slot.startTime} – {slot.endTime}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleRemoveSlot(slot.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={styles.slotRemoveBtn}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`Remove slot for ${slot.day}`}
                        >
                          <Feather name="x" size={14} color="#059669" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            {/* ======================================================== */}
            {/* SECTION 4: PROFESSIONAL & WEB LINKS                      */}
            {/* ======================================================== */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: "#F3E8FF" }]}>
                  <FontAwesome5 name="globe" size={14} color="#7C3AED" />
                </View>
                <Text style={[styles.cardTitle, { color: "#6B21A8" }]}>
                  WEB LINKS & RESEARCH
                </Text>
              </View>

              {/* LinkedIn URL */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>LinkedIn Profile URL</Text>
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
                <Text style={styles.fieldLabel}>Personal / Portfolio URL</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="globe"
                    size={15}
                    color="#0D9488"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={personalWebsiteUrl}
                    onChangeText={setPersonalWebsiteUrl}
                    placeholder="https://faculty-portfolio.com"
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                </View>
              </View>

              {/* Areas of Expertise / Research */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Areas of Expertise</Text>
                <View style={styles.chipsRow}>
                  {expertiseFields.map((item) => (
                    <View key={item} style={styles.tagChip}>
                      <Text style={styles.tagChipText}>{item}</Text>
                      <TouchableOpacity
                        onPress={() => handleRemoveExpertise(item)}
                        style={styles.tagChipRemove}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Feather name="x" size={12} color="#7C3AED" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
                {/* Add new expertise */}
                <View style={[styles.inputWithIcon, { marginTop: 8 }]}>
                  <Feather
                    name="plus"
                    size={16}
                    color="#64748B"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={newExpertiseInput}
                    onChangeText={setNewExpertiseInput}
                    placeholder="Add area (e.g. AI, Cyber Security)..."
                    placeholderTextColor="#94A3B8"
                    onSubmitEditing={handleAddExpertise}
                    returnKeyType="done"
                  />
                  {Boolean(newExpertiseInput.trim()) && (
                    <TouchableOpacity
                      onPress={handleAddExpertise}
                      style={styles.tagAddBtn}
                    >
                      <Text style={styles.tagAddBtnText}>Add</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>

            {/* ======================================================== */}
            {/* SECTION 5: ACADEMIC QUALIFICATIONS                       */}
            {/* ======================================================== */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardHeaderIcon, { backgroundColor: "#EDE9FE" }]}>
                  <FontAwesome5 name="graduation-cap" size={13} color="#7C3AED" />
                </View>
                <View style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={[styles.cardTitle, { color: "#5B21B6" }]}>
                    ACADEMIC QUALIFICATIONS
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsAddingQual(!isAddingQual)}
                    style={styles.addQualHeaderBtn}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name={isAddingQual ? "minus" : "plus"}
                      size={14}
                      color="#6366F1"
                    />
                    <Text style={styles.addQualHeaderBtnText}>
                      {isAddingQual ? "Close" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Existing Qualifications List */}
              {qualifications.map((qual, index) => (
                <View key={qual.id || index} style={styles.qualItem}>
                  <View style={styles.qualLeft}>
                    <View style={styles.qualBullet}>
                      <FontAwesome5
                        name="graduation-cap"
                        size={10}
                        color="#7C3AED"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.qualDegree}>{qual.degree}</Text>
                      <Text style={styles.qualInst}>
                        {qual.institution}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveQualification(qual.id)}
                    style={styles.qualRemoveBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Feather name="trash-2" size={14} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Add Qualification Form */}
              {isAddingQual && (
                <View style={styles.addQualBox}>
                  <Text style={styles.addQualTitle}>New Qualification</Text>
                  <TextInput
                    style={[styles.input, { marginBottom: 8 }]}
                    value={newQualDegree}
                    onChangeText={setNewQualDegree}
                    placeholder="Degree (e.g. M.Sc. in CSE)"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.input, { marginBottom: 12 }]}
                    value={newQualInstitution}
                    onChangeText={setNewQualInstitution}
                    placeholder="Institution / University"
                    placeholderTextColor="#94A3B8"
                  />
                  <View style={styles.addQualActions}>
                    <TouchableOpacity
                      onPress={() => setIsAddingQual(false)}
                      style={styles.addQualCancelBtn}
                    >
                      <Text style={styles.addQualCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleAddQualification}
                      style={styles.addQualSubmitBtn}
                    >
                      <Text style={styles.addQualSubmitText}>Add to List</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Dynamic Dropdown / Selection Bottom Sheet Modal */}
        <SelectionModal
          visible={activeSelector !== null}
          title={selectorTitle}
          options={selectorOptions}
          selectedValue={currentSelectorValue}
          onSelect={handleSelectOption}
          onClose={() => setActiveSelector(null)}
          hideSearch={activeSelector === "designation" || activeSelector === "faculty"}
        />

        {/* Add Consultation Slot Modal */}
        <AddSlotModal
          visible={isSlotModalOpen}
          onAdd={handleAddSlot}
          onClose={() => setIsSlotModalOpen(false)}
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
    backgroundColor: "#1E222B",
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  identityBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bannerAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#EEF2FF",
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
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  cardHeaderIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 0.8,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: "700",
    color: "#334155",
    marginBottom: 7,
  },
  fieldLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 7,
  },
  clearBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputInner: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "500",
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
  },
  chipBloodSelected: {
    backgroundColor: "#FFF1F2",
    borderColor: "#F43F5E",
  },
  chipBloodTextSelected: {
    color: "#E11D48",
    fontWeight: "700",
  },
  chipDesignationSelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#6366F1",
  },
  chipDesignationTextSelected: {
    color: "#4338CA",
    fontWeight: "700",
  },
  chipRoleSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#F59E0B",
  },
  chipRoleTextSelected: {
    color: "#B45309",
    fontWeight: "700",
  },
  chipDayOffSelected: {
    backgroundColor: "#ECFDF5",
    borderColor: "#10B981",
  },
  chipDayOffTextSelected: {
    color: "#059669",
    fontWeight: "700",
  },
  deptScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  chipSmall: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipTextSmall: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },
  chipDeptSelected: {
    backgroundColor: "#1E222B",
    borderColor: "#1E222B",
  },
  chipDeptTextSelected: {
    color: "#FFFFFF",
  },
  chipTiny: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipTinySelected: {
    backgroundColor: "#EEF2FF",
    borderColor: "#818CF8",
  },
  chipTinyText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  chipTinyTextSelected: {
    color: "#4338CA",
    fontWeight: "700",
  },
  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    borderWidth: 1,
    borderColor: "#DDD6FE",
    borderRadius: 14,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 5,
    gap: 6,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6D28D9",
  },
  tagChipRemove: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
  },
  tagAddBtn: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 6,
  },
  tagAddBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  addQualHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#EEF2FF",
  },
  addQualHeaderBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6366F1",
  },
  qualItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAF5FF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },
  qualLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  qualBullet: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  qualDegree: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },
  qualInst: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  qualRemoveBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: "#FEE2E2",
  },
  addQualBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addQualTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 10,
  },
  addQualActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  addQualCancelBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addQualCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  addQualSubmitBtn: {
    backgroundColor: "#1E222B",
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  addQualSubmitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  requiredAsterisk: {
    color: "#EF4444",
    fontWeight: "700",
  },
  selectorWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#FDE68A",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
  },
  fieldIcon: {
    marginRight: 10,
  },
  selectorText: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: "500",
    color: "#0F172A",
  },
  placeholderText: {
    color: "#94A3B8",
    fontWeight: "400",
  },
  selectorWrapperDisabled: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
    opacity: 0.8,
  },
  disabledText: {
    color: "#94A3B8",
  },
  helperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    marginLeft: 2,
  },
  helperText: {
    fontSize: 12,
    color: "#B45309",
    fontWeight: "500",
  },
  consultationCard: {
    backgroundColor: "#F0FDF8",
    borderWidth: 1.5,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    padding: 14,
    marginTop: 4,
  },
  consultationHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  consultationTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  consultationHeaderTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#065F46",
    letterSpacing: 0.5,
  },
  addSlotBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#D1FAE5",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addSlotBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
  },
  emptySlotContainer: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 10,
    borderStyle: "dashed",
    backgroundColor: "#FFFFFF",
  },
  emptySlotText: {
    fontSize: 12.5,
    color: "#059669",
    fontStyle: "italic",
    fontWeight: "500",
  },
  slotsList: {
    gap: 8,
  },
  slotChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#86EFAC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  slotDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#10B981",
  },
  slotChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#047857",
  },
  slotRemoveBtn: {
    padding: 2,
  },
});
