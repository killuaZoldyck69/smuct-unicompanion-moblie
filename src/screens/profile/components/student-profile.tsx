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

import { useStudentProfile } from "@/features/profile/useStudentProfile";
import { UpdateStudentProfileInput } from "@/services/student-service";
import { PROFILE_COLORS, SPACING } from "../constants";
import { useStudentProfileForm } from "../hooks/use-student-profile-form";

import { StudentHeader } from "./student/student-header";
import { StudentIdentityCard } from "./student/student-identity-card";
import { StudentAcademicCard } from "./student/student-academic-card";
import { StudentSkillsCard } from "./student/student-skills-card";
import { StudentContactCard } from "./student/student-contact-card";
import { ProfileSocialCard } from "./shared/profile-social-card";
import { ProfileEditButton } from "./shared/profile-edit-button";
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { BloodGroupModal } from "./shared/blood-group-modal";
import { ProfileErrorState, ProfileOfflineBanner } from "./shared/profile-states";
import { ProfileLoadingSkeleton } from "./shared/profile-loading-skeleton";
import { ProfileAccountActions } from "./shared/profile-account-actions";
import { DeleteAccountModal } from "./shared/delete-account-modal";

interface StudentProfileProps {
  sessionUser: {
    id: string;
    name: string;
    email: string;
    role?: string;
    image?: string | null;
  };
}

export default function StudentProfile({ sessionUser }: StudentProfileProps) {
  const insets = useSafeAreaInsets();
  const [bloodModalVisible, setBloodModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setIsKeyboardVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setIsKeyboardVisible(false)
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
    updateProfile: updateStudentProfile,
    isUpdating,
    pickAndUploadAvatar,
    isUploading,
  } = useStudentProfile();

  const handleSaveMutation = useCallback(
    (payload: UpdateStudentProfileInput, onSuccess: () => void) => {
      updateStudentProfile(payload, { onSuccess });
    },
    [updateStudentProfile],
  );

  const {
    isEditing,
    setIsEditing,
    formData,
    updateField,
    addSkill,
    removeSkill,
    handleCancel,
    handleSave,
  } = useStudentProfileForm(profile, handleSaveMutation);

  if (isLoading) {
    return <ProfileLoadingSkeleton role="STUDENT" />;
  }

  if (isError || !profile) {
    return (
      <ProfileErrorState
        title={
          isError
            ? isOffline
              ? "You are offline"
              : "Failed to load student profile"
            : "No student profile found"
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

      <StudentHeader
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
              : insets.bottom > 0
                ? insets.bottom + 128
                : 132,
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
        <StudentIdentityCard
          profile={profile}
          sessionUser={sessionUser}
          isUploading={isUploading}
          onPickAvatar={pickAndUploadAvatar}
        />

        <StudentAcademicCard
          profile={profile}
          isEditing={isEditing}
          currentSemester={formData.currentSemester}
          section={formData.section}
          currentTerm={formData.currentTerm}
          onChangeSemester={(val) => updateField("currentSemester", val)}
          onChangeSection={(val) => updateField("section", val)}
          onChangeTerm={(val) => updateField("currentTerm", val)}
        />

        <StudentSkillsCard
          skills={formData.skills}
          isEditing={isEditing}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
        />

        <StudentContactCard
          phoneNumber={formData.phoneNumber}
          bloodGroup={formData.bloodGroup}
          dbBloodGroup={profile.bloodGroup}
          profilePhone={profile.phoneNumber}
          isEditing={isEditing}
          onOpenBloodModal={() => setBloodModalVisible(true)}
          onChangePhone={(val) => updateField("phoneNumber", val)}
        />

        <ProfileSocialCard
          variant="student"
          isEditing={isEditing}
          linkedInUrl={formData.linkedInUrl}
          personalWebsiteUrl={formData.personalWebsiteUrl}
          onChangeLinkedIn={(url) => updateField("linkedInUrl", url)}
          onChangeWebsite={(url) => updateField("personalWebsiteUrl", url)}
        />

        <ProfileEditButton
          variant="student"
          isEditing={isEditing}
          isUpdating={isUpdating}
          onEdit={() => setIsEditing(true)}
          onCancel={handleCancel}
          onSave={handleSave}
        />

        <ProfileAccountActions
          onPressDeleteAccount={() => setDeleteModalVisible(true)}
          isOffline={isOffline}
        />

        <ProfileLogoutButton variant="student" />
      </ScrollView>

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
