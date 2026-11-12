import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTeacherProfile } from "@/features/profile/useTeacherProfile";
import { UpdateTeacherProfileInput } from "@/services/teacher-service";
import { PROFILE_COLORS, SPACING } from "../constants";
import { useTeacherProfileForm } from "../hooks/use-teacher-profile-form";

import { TeacherHeader } from "./teacher/teacher-header";
import { TeacherIdentityCard } from "./teacher/teacher-identity-card";
import { TeacherAcademicCard } from "./teacher/teacher-academic-card";
import { TeacherExpertiseCard } from "./teacher/teacher-expertise-card";
import { TeacherQualificationsCard } from "./teacher/teacher-qualifications-card";
import { ProfileContactCards } from "./shared/profile-contact-cards";
import { ProfileSocialCard } from "./shared/profile-social-card";
import { ProfileEditButton } from "./shared/profile-edit-button";
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { BloodGroupModal } from "./shared/blood-group-modal";
import {
  ProfileErrorState,
  ProfileOfflineBanner,
} from "./shared/profile-states";
import { ProfileLoadingSkeleton } from "./shared/profile-loading-skeleton";
import { ProfileAccountActions } from "./shared/profile-account-actions";
import { DeleteAccountModal } from "./shared/delete-account-modal";

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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false),
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const {
    profile,
    isLoading,
    isRefetching,
    isError,
    errorMessage,
    isOffline,
    refetch,
    updateProfile: updateTeacherProfile,
    isUpdating,
    pickAndUploadAvatar,
    isUploading,
  } = useTeacherProfile();

  const handleSaveMutation = useCallback(
    (payload: UpdateTeacherProfileInput, onSuccess: () => void) => {
      updateTeacherProfile(payload, { onSuccess });
    },
    [updateTeacherProfile],
  );

  const {
    isEditing,
    setIsEditing,
    formData,
    updateField,
    addConsultationSlot,
    updateConsultationSlot,
    removeConsultationSlot,
    addExpertise,
    removeExpertise,
    addQualification,
    removeQualification,
    handleCancel,
    handleSave,
  } = useTeacherProfileForm(profile, handleSaveMutation);

  if (isLoading) {
    return <ProfileLoadingSkeleton role="TEACHER" />;
  }

  if (isError || !profile) {
    return (
      <ProfileErrorState
        title={
          isError
            ? isOffline
              ? "You are offline"
              : "Failed to load faculty profile"
            : "No faculty profile found"
        }
        subtitle={errorMessage ?? undefined}
        isOffline={isOffline}
        onRetry={refetch}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* Screen Header matching Student Profile style */}
      <TeacherHeader
        insetsTop={insets.top}
        isEditing={isEditing}
        isUpdating={isUpdating}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom: isKeyboardVisible
              ? 20
              : Math.max(insets.bottom + 120, 132),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={PROFILE_COLORS.deepNavy}
            colors={[PROFILE_COLORS.deepNavy]}
          />
        }
      >
        <ProfileOfflineBanner visible={isOffline} />
        {/* 1. Hero Faculty Identity Card */}
        <TeacherIdentityCard
          profile={profile}
          sessionUser={sessionUser}
          isUploading={isUploading}
          onPickAvatar={pickAndUploadAvatar}
        />

        {/* 2. Academic Position Card */}
        <TeacherAcademicCard
          profile={profile}
          isEditing={isEditing}
          department={formData.department}
          officeRoom={formData.officeRoom}
          advisoryBatch={formData.advisoryBatch}
          dayOff={formData.dayOff}
          consultationSlots={formData.consultationSlots}
          onChangeDepartment={(val) => updateField("department", val)}
          onChangeOfficeRoom={(val) => updateField("officeRoom", val)}
          onChangeAdvisoryBatch={(val) => updateField("advisoryBatch", val)}
          onChangeDayOff={(val) => updateField("dayOff", val)}
          onAddConsultationSlot={addConsultationSlot}
          onUpdateConsultationSlot={updateConsultationSlot}
          onRemoveConsultationSlot={removeConsultationSlot}
        />

        {/* 3. Contact Information */}
        <ProfileContactCards
          phoneNumber={formData.phoneNumber}
          bloodGroup={formData.bloodGroup}
          dbBloodGroup={profile.bloodGroup}
          profilePhone={profile.phoneNumber || profile.phone}
          isEditing={isEditing}
          onOpenBloodModal={() => setBloodModalVisible(true)}
          onChangePhone={(digits) =>
            updateField("phoneNumber", digits ? `+880${digits}` : "")
          }
        />

        {/* 4. Professional Expertise Card */}
        <TeacherExpertiseCard
          expertiseFields={formData.expertiseFields}
          isEditing={isEditing}
          onAddExpertise={addExpertise}
          onRemoveExpertise={removeExpertise}
        />

        {/* 5. Academic Qualifications Timeline Card */}
        <TeacherQualificationsCard
          academicQualifications={formData.academicQualifications}
          isEditing={isEditing}
          onAddQualification={addQualification}
          onRemoveQualification={removeQualification}
        />

        {/* 6. Portfolio & Social Profiles */}
        <ProfileSocialCard
          isEditing={isEditing}
          linkedInUrl={formData.linkedInUrl}
          personalWebsiteUrl={formData.personalWebsiteUrl}
          onChangeLinkedIn={(url) => updateField("linkedInUrl", url)}
          onChangeWebsite={(url) => updateField("personalWebsiteUrl", url)}
        />

        {/* 7. Edit Profile Button */}
        <ProfileEditButton
          isEditing={isEditing}
          isUpdating={isUpdating}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
        />

        {/* 8. Account, Privacy & Restrained Log Out */}
        <ProfileAccountActions
          onPressDeleteAccount={() => setDeleteModalVisible(true)}
          isOffline={isOffline}
        />

        <ProfileLogoutButton />
      </ScrollView>

      {/* Modal for Selecting Blood Group */}
      <BloodGroupModal
        visible={bloodModalVisible}
        selectedGroup={formData.bloodGroup}
        onSelect={(bg) => updateField("bloodGroup", bg)}
        onClose={() => setBloodModalVisible(false)}
      />

      <DeleteAccountModal
        visible={deleteModalVisible}
        isOffline={isOffline}
        onClose={() => setDeleteModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PROFILE_COLORS.background,
  },
  scrollContent: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
  },
});
