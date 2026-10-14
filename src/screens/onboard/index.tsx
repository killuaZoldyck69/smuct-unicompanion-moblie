import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ONBOARD_COLORS } from "./constants";
import { useOnboardForm } from "./hooks/use-onboard-form";
import { OnboardBackgroundDecorations } from "./components/onboard-background-decorations";
import { OnboardAvatarPicker } from "./components/onboard-avatar-picker";
import { OnboardAcademicBox } from "./components/onboard-academic-box";
import { OnboardClassBox } from "./components/onboard-class-box";
import { OnboardPersonalBox } from "./components/onboard-personal-box";
import { ProgramSelectModal } from "./components/program-select-modal";
import { BloodGroupModal } from "./components/blood-group-modal";

export function Onboard() {
  const insets = useSafeAreaInsets();

  const {
    studentId,
    handleStudentIdChange,
    program,
    batch,
    handleBatchChange,
    currentSemester,
    handleSemesterChange,
    section,
    handleSectionChange,
    phoneNumber,
    handlePhoneNumberChange,
    bloodGroup,
    imageUri,
    errorField,
    isSubmitting,
    isProgramModalVisible,
    setProgramModalVisible,
    isBloodGroupModalVisible,
    setBloodGroupModalVisible,
    pickImage,
    handleSelectProgram,
    handleSelectBloodGroup,
    handleCompleteProfile,
  } = useOnboardForm();

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      {/* 1. BACKGROUND DECORATIONS (Pastel wave corners & sprout motifs) */}
      <OnboardBackgroundDecorations />

      {/* 2. SCROLLABLE CONTENT */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: insets.top + (Platform.OS === "ios" ? 18 : 24),
              paddingBottom: Math.max(insets.bottom + 20, 36),
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          bounces={Platform.OS === "ios"}
        >
          {/* Header Title & Subtitle */}
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Tell us more about yourself</Text>
          </View>

          {/* Profile Picture Avatar Picker */}
          <OnboardAvatarPicker
            imageUri={imageUri}
            onPickImage={pickImage}
            hasError={errorField === "image"}
          />

          {/* 1. SKY BLUE CARD: Student ID, Academic Program, Batch Number & Warning */}
          <OnboardAcademicBox
            studentId={studentId}
            onChangeStudentId={handleStudentIdChange}
            hasStudentIdError={errorField === "studentId"}
            program={program}
            onOpenProgramModal={() => setProgramModalVisible(true)}
            hasProgramError={errorField === "program"}
            batch={batch}
            onChangeBatch={handleBatchChange}
            hasBatchError={errorField === "batch"}
          />

          {/* 2. GREEN CARD: Semester, Section & Phone Number */}
          <OnboardClassBox
            currentSemester={currentSemester}
            onChangeSemester={handleSemesterChange}
            hasSemesterError={errorField === "currentSemester"}
            section={section}
            onChangeSection={handleSectionChange}
            hasSectionError={errorField === "section"}
            phoneNumber={phoneNumber}
            onChangePhoneNumber={handlePhoneNumberChange}
            hasPhoneError={errorField === "phoneNumber"}
          />

          {/* 3. PEACH/ROSE CARD: Blood Group Selection */}
          <OnboardPersonalBox
            bloodGroup={bloodGroup}
            onOpenBloodGroupModal={() => setBloodGroupModalVisible(true)}
            hasBloodGroupError={errorField === "bloodGroup"}
          />

          {/* 4. SUBMIT BUTTON (Complete Profile) */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={handleCompleteProfile}
            disabled={isSubmitting}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Complete Profile"
            activeOpacity={0.85}
          >
            {isSubmitting ? (
              <View style={styles.buttonContent}>
                <ActivityIndicator
                  color={ONBOARD_COLORS.white}
                  size="small"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.submitButtonText}>Saving Profile...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>Complete Profile</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Program Selection Modal */}
      <ProgramSelectModal
        visible={isProgramModalVisible}
        onClose={() => setProgramModalVisible(false)}
        onSelectProgram={handleSelectProgram}
      />

      {/* Blood Group Modal */}
      <BloodGroupModal
        visible={isBloodGroupModalVisible}
        onClose={() => setBloodGroupModalVisible(false)}
        onSelectBloodGroup={handleSelectBloodGroup}
        selectedBloodGroup={bloodGroup}
      />
    </View>
  );
}

export default Onboard;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ONBOARD_COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ONBOARD_COLORS.deepNavy,
    letterSpacing: -0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15.5,
    fontWeight: "500",
    color: ONBOARD_COLORS.mutedText,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: ONBOARD_COLORS.deepNavy,
    borderRadius: 9999,
    height: 54,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
    shadowColor: ONBOARD_COLORS.deepNavy,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: ONBOARD_COLORS.white,
    letterSpacing: -0.2,
  },
});
