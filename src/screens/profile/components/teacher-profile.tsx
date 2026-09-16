/**
 * FACULTY PROFILE REDESIGN & REFACTORING RATIONALE:
 *
 * 1. ACADEMIC POSITION HUE PRESERVATION:
 *    The Amber/Yellow palette (#854d0e on #fefce8 / #fffbeb) for "Academic Position"
 *    is strictly preserved. It serves as the visual anchor for official university
 *    post details (Designation, Department, Office Room, Consultation Hours).
 *
 * 2. ROLE-BASED HUE SEPARATION RULE:
 *    Color in this application expresses ROLE at the top level (Faculty Academic = Amber #854d0e,
 *    Student Academic = Blue #1d4ed8), while functional CONTENT CATEGORIES remain unified
 *    across all roles (Contact/Safety = Crimson #be123c, External Links = Cyan #0284c7).
 *    This rule is formally documented and codified in `src/screens/profile/constants.ts`.
 *
 * 3. CREDENTIALS CONTRAST DECISION (STEP 2 - OPTION A):
 *    "Professional Expertise" and "Qualifications" are unified inside a pristine, elevated
 *    neutral white Bento card with dedicated sub-sections. This establishes a clear visual hierarchy:
 *    the official university appointment (Amber) commands primary attention, while personal
 *    credentials sit cleanly in high-contrast neutral space, preventing "color soup".
 *
 * 4. CONTACT & SAFETY HUE REUSE (STEP 3):
 *    Blood Group and Emergency Phone Number reuse the Crimson/Rose theme (#be123c on #fff1f2)
 *    established on the student profile. Emergency medical identification is universally
 *    recognized and not role-specific.
 *
 * 5. ARCHITECTURAL DECOUPLING:
 *    Decomposed the 951-line monolith into dedicated, memoized sub-components and an isolated
 *    form hook (`useTeacherProfileForm`), achieving isolated re-renders and full type safety.
 */

import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTeacherProfile } from "@/features/profile/useTeacherProfile";
import { UpdateTeacherProfileInput } from "@/services/teacher-service";
import { PROFILE_COLORS, SPACING } from "../constants";
import { useTeacherProfileForm } from "../hooks/use-teacher-profile-form";

import { TeacherHeader } from "./teacher/teacher-header";
import { TeacherIdentityCard } from "./teacher/teacher-identity-card";
import { TeacherAcademicCard } from "./teacher/teacher-academic-card";
import { TeacherCredentialsCard } from "./teacher/teacher-credentials-card";
import { TeacherContactCard } from "./teacher/teacher-contact-card";
import { ProfileSocialCard } from "./shared/profile-social-card";
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { BloodGroupModal } from "./shared/blood-group-modal";
import { ProfileErrorState } from "./shared/profile-states";

interface TeacherProfileProps {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export default function TeacherProfile({ sessionUser }: TeacherProfileProps) {
  const insets = useSafeAreaInsets();
  const [bloodModalVisible, setBloodModalVisible] = useState(false);

  const {
    profile,
    isLoading,
    isError,
    refetch,
    updateProfile: updateTeacherProfile,
    isUpdating,
    pickAndUploadAvatar,
    isUploading,
  } = useTeacherProfile();

  const handleSaveMutation = useCallback(
    (payload: UpdateTeacherProfileInput, onSuccess: () => void) => {
      updateTeacherProfile(payload as any, { onSuccess });
    },
    [updateTeacherProfile]
  );

  const {
    isEditing,
    setIsEditing,
    formData,
    updateField,
    addExpertise,
    removeExpertise,
    addQualification,
    removeQualification,
    handleCancel,
    handleSave,
  } = useTeacherProfileForm(profile, handleSaveMutation);

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PROFILE_COLORS.deepNavy} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <ProfileErrorState
        title={!profile ? "No faculty profile found" : "Failed to load faculty profile"}
        onRetry={refetch}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={true} />

      <TeacherHeader
        insetsTop={insets.top}
        isEditing={isEditing}
        isUpdating={isUpdating}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom > 0 ? insets.bottom + 110 : 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TeacherIdentityCard
          profile={profile}
          sessionUser={sessionUser}
          isUploading={isUploading}
          onPickAvatar={pickAndUploadAvatar}
        />

        <TeacherAcademicCard
          profile={profile}
          isEditing={isEditing}
          designation={formData.designation}
          department={formData.department}
          officeRoom={formData.officeRoom}
          consultationHours={formData.consultationHours}
          onChangeDesignation={(val) => updateField("designation", val)}
          onChangeDepartment={(val) => updateField("department", val)}
          onChangeOfficeRoom={(val) => updateField("officeRoom", val)}
          onChangeConsultationHours={(val) => updateField("consultationHours", val)}
        />

        <TeacherCredentialsCard
          expertiseFields={formData.expertiseFields}
          academicQualifications={formData.academicQualifications}
          isEditing={isEditing}
          onAddExpertise={addExpertise}
          onRemoveExpertise={removeExpertise}
          onAddQualification={addQualification}
          onRemoveQualification={removeQualification}
        />

        <TeacherContactCard
          phoneNumber={formData.phoneNumber}
          bloodGroup={formData.bloodGroup}
          dbBloodGroup={profile.bloodGroup}
          profilePhone={profile.phoneNumber || profile.phone}
          isEditing={isEditing}
          onOpenBloodModal={() => setBloodModalVisible(true)}
          onChangePhone={(val) => updateField("phoneNumber", val)}
        />

        <ProfileSocialCard
          isEditing={isEditing}
          linkedInUrl={formData.linkedInUrl}
          personalWebsiteUrl={formData.personalWebsiteUrl}
          userName={profile.name || sessionUser.name}
          onChangeLinkedIn={(url) => updateField("linkedInUrl", url)}
          onChangeWebsite={(url) => updateField("personalWebsiteUrl", url)}
        />

        {/* Spatial separation for destructive Logout action */}
        <View style={styles.logoutWrapper}>
          <ProfileLogoutButton />
        </View>
      </ScrollView>

      <BloodGroupModal
        visible={bloodModalVisible}
        selectedGroup={formData.bloodGroup}
        onSelect={(bg) => updateField("bloodGroup", bg)}
        onClose={() => setBloodModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PROFILE_COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
  logoutWrapper: {
    marginTop: SPACING.md,
  },
});
