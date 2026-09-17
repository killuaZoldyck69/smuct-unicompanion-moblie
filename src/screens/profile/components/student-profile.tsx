import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  RefreshControl,
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
import { ProfileLogoutButton } from "./shared/profile-logout-button";
import { BloodGroupModal } from "./shared/blood-group-modal";
import { ProfileErrorState } from "./shared/profile-states";

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

  const {
    profile,
    isLoading,
    isRefetching,
    isError,
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
    [updateStudentProfile]
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
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={PROFILE_COLORS.deepNavy} />
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <ProfileErrorState
        title={!profile ? "No student profile found" : "Failed to load student profile"}
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

      <StudentHeader
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
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={PROFILE_COLORS.deepNavy}
            colors={[PROFILE_COLORS.deepNavy]}
          />
        }
      >
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
          onChangeSemester={(val) => updateField("currentSemester", val)}
          onChangeSection={(val) => updateField("section", val)}
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
          isEditing={isEditing}
          linkedInUrl={formData.linkedInUrl}
          personalWebsiteUrl={formData.personalWebsiteUrl}
          userName={profile.name || sessionUser.name}
          onChangeLinkedIn={(url) => updateField("linkedInUrl", url)}
          onChangeWebsite={(url) => updateField("personalWebsiteUrl", url)}
        />

        <ProfileLogoutButton />
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
});
