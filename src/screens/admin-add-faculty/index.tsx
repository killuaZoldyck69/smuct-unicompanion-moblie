import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Keyboard,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useCurrentUser } from "@/hooks/use-current-user";
import { FACULTY_COLORS } from "./constants";
import { useAddFacultyForm } from "./hooks/use-add-faculty-form";
import { FacultyHeader } from "./components/faculty-header";
import { AccountDetailsSection } from "./components/account-details-section";
import { AcademicPositionSection } from "./components/academic-position-section";
import { OfficeAvailabilitySection } from "./components/office-availability-section";
import { AcademicProfileSection } from "./components/academic-profile-section";
import { SelectionModal } from "./components/selection-modal";
import { AddSlotModal } from "./components/modals/add-slot-modal";
import { AddQualificationModal } from "./components/modals/add-qualification-modal";
import { AddExpertiseModal } from "./components/modals/add-expertise-modal";

export function AdminAddFacultyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { role, isPending, isAuthenticated } = useCurrentUser();
  const form = useAddFacultyForm();

  const scrollViewRef = useRef<ScrollView>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const isBottomInputFocusedRef = useRef(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      const height = e.endCoordinates.height;
      setKeyboardHeight(height);
      if (isBottomInputFocusedRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 80);
      }
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleFocusLink = useCallback(() => {
    isBottomInputFocusedRef.current = true;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 300);
  }, []);

  const handleBlurLink = useCallback(() => {
    isBottomInputFocusedRef.current = false;
  }, []);

  const handleFocusBatch = useCallback(() => {
    isBottomInputFocusedRef.current = true;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, []);

  const handleBlurBatch = useCallback(() => {
    isBottomInputFocusedRef.current = false;
  }, []);

  // Admin authorization guard
  useEffect(() => {
    if (!isPending && (!isAuthenticated || role !== "ADMIN")) {
      router.replace("/(tabs)");
    }
  }, [isPending, isAuthenticated, role, router]);

  if (isPending || role !== "ADMIN") {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={FACULTY_COLORS.bannerIconBg} />
        <Text style={styles.loadingText}>Verifying admin credentials...</Text>
      </View>
    );
  }

  // Get currently selected value for the active selector
  const currentSelectorValue = (() => {
    switch (form.activeSelector) {
      case "faculty":
        return form.formData.faculty;
      case "department":
        return form.formData.department;
      case "designation":
        return form.formData.designation;
      case "dayOff":
        return form.formData.dayOff;
      default:
        return "";
    }
  })();

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={FACULTY_COLORS.background}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                keyboardHeight > 0
                  ? keyboardHeight + 120
                  : Math.max(insets.bottom + 120, 140),
            },
          ]}
        >
          {/* 1. Header & Onboarding Banner */}
          <FacultyHeader />

          {/* 2. Account Details Card (Required) */}
          <AccountDetailsSection
            formData={form.formData}
            updateField={form.updateField}
            showPassword={form.showPassword}
            setShowPassword={form.setShowPassword}
            onRegeneratePassword={form.regeneratePassword}
          />

          {/* 3. Academic Position Card (Required) */}
          <AcademicPositionSection
            formData={form.formData}
            setActiveSelector={form.setActiveSelector}
          />

          {/* 4. Office & Availability Card (Optional) */}
          <OfficeAvailabilitySection
            formData={form.formData}
            updateField={form.updateField}
            setActiveSelector={form.setActiveSelector}
            isExpanded={form.isAvailabilityExpanded}
            setIsExpanded={form.setIsAvailabilityExpanded}
            onOpenSlotModal={() => form.setIsSlotModalOpen(true)}
            onRemoveSlot={form.removeConsultationSlot}
            onFocusBatch={handleFocusBatch}
            onBlurBatch={handleBlurBatch}
          />

          {/* 5. Academic Profile Card (Optional) */}
          <AcademicProfileSection
            formData={form.formData}
            updateField={form.updateField}
            isExpanded={form.isProfileExpanded}
            setIsExpanded={form.setIsProfileExpanded}
            onOpenExpertiseModal={() => form.setIsExpertiseModalOpen(true)}
            onRemoveExpertise={form.removeExpertiseField}
            onOpenQualModal={() => form.setIsQualModalOpen(true)}
            onRemoveQual={form.removeQualification}
            onFocusLink={handleFocusLink}
            onBlurLink={handleBlurLink}
          />

          {/* 6. Primary Action Button: Create Faculty Account */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              form.isLoading && styles.submitButtonDisabled,
            ]}
            onPress={form.handleSubmit}
            disabled={form.isLoading}
            activeOpacity={0.85}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Create Faculty Account"
          >
            {form.isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="user-plus" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>
                  Create Faculty Account
                </Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Dynamic Dropdown / Selection Bottom Sheet */}
      <SelectionModal
        visible={form.selectorModalVisible}
        title={form.selectorTitle}
        options={form.selectorOptions}
        selectedValue={currentSelectorValue}
        onSelect={form.handleSelectOption}
        onClose={form.closeSelectorModal}
        hideSearch={form.activeSelector === "dayOff" || form.activeSelector === "designation"}
      />

      {/* Add Consultation Slot Modal */}
      <AddSlotModal
        visible={form.isSlotModalOpen}
        onAdd={form.addConsultationSlot}
        onClose={() => form.setIsSlotModalOpen(false)}
      />

      {/* Add Qualification Modal */}
      <AddQualificationModal
        visible={form.isQualModalOpen}
        onAdd={form.addQualification}
        onClose={() => form.setIsQualModalOpen(false)}
      />

      {/* Add Expertise Modal */}
      <AddExpertiseModal
        visible={form.isExpertiseModalOpen}
        onAdd={form.addExpertiseField}
        onClose={() => form.setIsExpertiseModalOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: FACULTY_COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: FACULTY_COLORS.background,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: FACULTY_COLORS.textSecondary,
    fontWeight: "500",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: FACULTY_COLORS.submitBtn,
    borderRadius: 20,
    height: 56,
    marginTop: 24,
    gap: 10,
    shadowColor: FACULTY_COLORS.submitBtn,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.65,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: FACULTY_COLORS.submitBtnText,
    letterSpacing: 0.2,
  },
});
