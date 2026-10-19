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

interface EditableQualification {
  id: string;
  degree: string;
  field: string;
  institution: string;
  passingYear: string;
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
    const [phoneNumber, setPhoneNumber] = useState("");
    const [bloodGroup, setBloodGroup] = useState<string | null>(null);

    // Academic & Position
    const [designation, setDesignation] = useState("Lecturer");
    const [administrativeRole, setAdministrativeRole] = useState<string | null>(
      null,
    );
    const [department, setDepartment] = useState("CSE");
    const [faculty, setFaculty] = useState("");
    const [advisoryBatch, setAdvisoryBatch] = useState("");

    // Office & Availability
    const [officeRoom, setOfficeRoom] = useState("");
    const [dayOff, setDayOff] = useState("");
    const [consultationHours, setConsultationHours] = useState("");

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
    const [newQualPassingYear, setNewQualPassingYear] = useState("");
    const [isAddingQual, setIsAddingQual] = useState(false);

    // Sync initial state when modal opens or user changes
    useEffect(() => {
      if (!visible) return;

      setName(user.name || "");
      setPhoneNumber(user.phoneNumber || "");

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
        profile?.faculty || "Faculty of Science and Information Technology",
      );
      setAdvisoryBatch(
        profile?.advisoryBatch !== null && profile?.advisoryBatch !== undefined
          ? String(profile.advisoryBatch)
          : "",
      );

      setOfficeRoom(profile?.officeRoom || "");
      setDayOff(profile?.dayOff || "");
      setConsultationHours(profile?.consultationHours || "");

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
              passingYear: "",
            });
          } else if (typeof q === "object") {
            parsedQuals.push({
              id: q.id || `q_${idx}_${Date.now()}`,
              degree: q.degree || "",
              field: q.field || "",
              institution: q.institution || q.institute || "",
              passingYear: q.passingYear ? String(q.passingYear) : q.year ? String(q.year) : "",
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
            passingYear: "",
          });
        });
      }
      setQualifications(
        sortQualifications(parsedQuals, (q) => q.degree, (q) => q.passingYear)
      );
      setIsAddingQual(false);
      setNewQualDegree("");
      setNewQualInstitution("");
      setNewQualPassingYear("");
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
      const cleanYear = newQualPassingYear.trim();

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
              passingYear: cleanYear,
            },
          ],
          (q) => q.degree,
          (q) => q.passingYear,
        )
      );

      setNewQualDegree("");
      setNewQualInstitution("");
      setNewQualPassingYear("");
      setIsAddingQual(false);
    }, [newQualDegree, newQualInstitution, newQualPassingYear]);

    // Remove qualification
    const handleRemoveQualification = useCallback((id: string) => {
      setQualifications((prev) => prev.filter((q) => q.id !== id));
    }, []);

    // Handle Save
    const handleSave = useCallback(async () => {
      const cleanName = name.trim();
      if (!cleanName) {
        Alert.alert("Invalid Name", "Faculty name cannot be empty.");
        return;
      }

      const cleanPhone = phoneNumber.trim();
      const cleanDesignation = designation.trim();
      const cleanDept = department.trim();
      const cleanFaculty = faculty.trim();
      const cleanRoom = officeRoom.trim();
      const cleanDayOff = dayOff.trim();
      const cleanConsultation = consultationHours.trim();

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
        (q) => q.passingYear,
      );
      const formattedQuals = sortedValidQuals.map((q) => ({
        degree: q.degree.trim() || "Degree",
        field: q.field.trim() || q.degree.trim() || "Academics",
        institution: q.institution.trim() || "University",
        passingYear: q.passingYear.trim() || undefined,
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
        consultationHours: cleanConsultation || null,
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
      consultationHours,
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
                  onChangeText={setName}
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
                    onChangeText={setPhoneNumber}
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
                <Text style={styles.fieldLabel}>Academic Designation *</Text>
                <View style={styles.chipsRow}>
                  {DESIGNATION_OPTIONS.map((desig) => {
                    const isSelected = designation === desig;
                    return (
                      <TouchableOpacity
                        key={desig}
                        style={[
                          styles.chip,
                          isSelected && styles.chipDesignationSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setDesignation(desig)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            isSelected && styles.chipDesignationTextSelected,
                          ]}
                        >
                          {desig}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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

              {/* Department Chips */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Department *</Text>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.deptScroll}
                >
                  {DEPARTMENT_CHIPS.filter((d) => d !== "All").map((dept) => {
                    const isSelected = department.toUpperCase() === dept;
                    return (
                      <TouchableOpacity
                        key={dept}
                        style={[
                          styles.chipSmall,
                          isSelected && styles.chipDeptSelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setDepartment(dept)}
                      >
                        <Text
                          style={[
                            styles.chipTextSmall,
                            isSelected && styles.chipDeptTextSelected,
                          ]}
                        >
                          {dept}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                <TextInput
                  style={[styles.input, { marginTop: 8 }]}
                  value={department}
                  onChangeText={setDepartment}
                  placeholder="e.g. CSE, Computer Science..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              {/* Faculty */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Faculty Division</Text>
                <TextInput
                  style={styles.input}
                  value={faculty}
                  onChangeText={setFaculty}
                  placeholder="e.g. Faculty of Science and Information Technology"
                  placeholderTextColor="#94A3B8"
                />
                <View style={[styles.chipsRow, { marginTop: 6 }]}>
                  {FACULTY_OPTIONS.map((fac) => {
                    const isSelected = faculty === fac;
                    const shortName = fac.replace("Faculty of ", "");
                    return (
                      <TouchableOpacity
                        key={fac}
                        style={[
                          styles.chipTiny,
                          isSelected && styles.chipTinySelected,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setFaculty(fac)}
                      >
                        <Text
                          style={[
                            styles.chipTinyText,
                            isSelected && styles.chipTinyTextSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {shortName}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Consultation Hours</Text>
                <View style={styles.inputWithIcon}>
                  <Feather
                    name="clock"
                    size={15}
                    color="#64748B"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.inputInner}
                    value={consultationHours}
                    onChangeText={setConsultationHours}
                    placeholder="e.g. 10:00 AM - 01:00 PM"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
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
                        {[qual.institution, qual.passingYear]
                          .filter(Boolean)
                          .join(" — ")}
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
                    style={[styles.input, { marginBottom: 8 }]}
                    value={newQualInstitution}
                    onChangeText={setNewQualInstitution}
                    placeholder="Institution / University"
                    placeholderTextColor="#94A3B8"
                  />
                  <TextInput
                    style={[styles.input, { marginBottom: 12 }]}
                    value={newQualPassingYear}
                    onChangeText={setNewQualPassingYear}
                    placeholder="Passing Year (e.g. 2020)"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    maxLength={4}
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
});
