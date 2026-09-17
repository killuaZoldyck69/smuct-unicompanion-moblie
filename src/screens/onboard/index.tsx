import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ONBOARD_COLORS } from "./constants";
import { useOnboardForm } from "./hooks/use-onboard-form";
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
    setStudentId,
    program,
    batch,
    setBatch,
    currentSemester,
    setCurrentSemester,
    section,
    setSection,
    bloodGroup,
    imageUri,
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
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>Tell us more about yourself</Text>
          </View>

          <OnboardAvatarPicker imageUri={imageUri} onPickImage={pickImage} />

          <OnboardAcademicBox
            studentId={studentId}
            onChangeStudentId={setStudentId}
            program={program}
            onOpenProgramModal={() => setProgramModalVisible(true)}
          />

          <OnboardClassBox
            currentSemester={currentSemester}
            onChangeSemester={setCurrentSemester}
            section={section}
            onChangeSection={setSection}
            batch={batch}
            onChangeBatch={setBatch}
          />

          <OnboardPersonalBox
            bloodGroup={bloodGroup}
            onOpenBloodGroupModal={() => setBloodGroupModalVisible(true)}
          />

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
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? "Saving Profile..." : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <ProgramSelectModal
        visible={isProgramModalVisible}
        onClose={() => setProgramModalVisible(false)}
        onSelectProgram={handleSelectProgram}
      />

      <BloodGroupModal
        visible={isBloodGroupModalVisible}
        onClose={() => setBloodGroupModalVisible(false)}
        onSelectBloodGroup={handleSelectBloodGroup}
        selectedBloodGroup={bloodGroup}
      />
    </View>
  );
}

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
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: ONBOARD_COLORS.deepNavy,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: ONBOARD_COLORS.mutedText,
  },
  submitButton: {
    backgroundColor: ONBOARD_COLORS.deepNavy,
    borderRadius: 9999,
    height: 56,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: ONBOARD_COLORS.white,
  },
});
