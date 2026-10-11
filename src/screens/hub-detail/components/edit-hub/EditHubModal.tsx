import React, { useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar as ExpoStatusBar } from "expo-status-bar";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BENTO_THEME, DayPickerModal } from "@/screens/hubs/components/create-hub";

import { useEditHub } from "./use-edit-hub";
import { editHubStyles as s } from "./styles";
import {
  CourseDetailsSection,
  CohortTermSection,
  ScheduleSection,
  OnlineClassroomSection,
  ExamsSection,
  FooterActions,
} from "./components";
import type { EditHubModalProps, ExamState } from "./types";

export function EditHubModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  hubDetails,
}: EditHubModalProps) {
  const insets = useSafeAreaInsets();

  const topPadding =
    Platform.OS === "android"
      ? Math.max(insets.top, StatusBar.currentHeight ?? 0, 24)
      : 0;

  const applyDarkStatusBar = useCallback(() => {
    StatusBar.setBarStyle("dark-content", true);
    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor("transparent", true);
      StatusBar.setTranslucent(true);
    }
  }, []);

  // Ensure status bar icons/text are dark and visible on Android & iOS
  useEffect(() => {
    if (isVisible) {
      applyDarkStatusBar();
      const t1 = setTimeout(applyDarkStatusBar, 100);
      const t2 = setTimeout(applyDarkStatusBar, 250);
      const t3 = setTimeout(applyDarkStatusBar, 500);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isVisible, applyDarkStatusBar]);

  const {
    form,
    updateField,
    schedules,
    addSchedule,
    removeSchedule,
    updateScheduleField,
    midterm,
    setMidterm,
    final,
    setFinal,
    activePicker,
    setActivePicker,
    activeDayPickerId,
    setActiveDayPickerId,
    selectedDayForPicker,
    handleSelectDay,
    handlePickerChange,
    handlePickerDismiss,
    pickerDateValue,
    handleSubmit,
    isFormValid,
  } = useEditHub({ isVisible, hubDetails, onSubmit });

  const handleMidtermChange = (patch: Partial<ExamState>) =>
    setMidterm((prev) => ({ ...prev, ...patch }));

  const handleFinalChange = (patch: Partial<ExamState>) =>
    setFinal((prev) => ({ ...prev, ...patch }));

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle={Platform.OS === "ios" ? "pageSheet" : "fullScreen"}
      onRequestClose={onClose}
      statusBarTranslucent={true}
      onShow={applyDarkStatusBar}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <ExpoStatusBar style="dark" />

      <View style={[s.container, { paddingTop: topPadding }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* ── Header ── */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={s.headerTitle}>Edit Course Hub</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={s.closeBtn}
              activeOpacity={0.7}
              accessible
              accessibilityRole="button"
              accessibilityLabel="Close edit hub modal"
            >
              <Feather name="x" size={18} color={BENTO_THEME.navy} />
            </TouchableOpacity>
          </View>

          {/* ── Scrollable Form ── */}
          <ScrollView
            contentContainerStyle={[
              s.scrollContent,
              { paddingBottom: Math.max(insets.bottom + 24, 32) },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.subtitle}>
              Update course metadata, schedule, cohort parameters &amp; exams
            </Text>

            <CourseDetailsSection form={form} onFieldChange={updateField} />

            <CohortTermSection form={form} onFieldChange={updateField} />

            <ScheduleSection
              schedules={schedules}
              onAddSchedule={addSchedule}
              onRemoveSchedule={removeSchedule}
              onUpdateField={updateScheduleField}
              onOpenDayPicker={setActiveDayPickerId}
              onOpenTimePicker={setActivePicker}
            />

            <OnlineClassroomSection
              meetUrl={form.meetUrl}
              onMeetUrlChange={(v) => updateField("meetUrl", v)}
            />

            <ExamsSection
              midterm={midterm}
              final={final}
              onMidtermChange={handleMidtermChange}
              onFinalChange={handleFinalChange}
              onOpenPicker={setActivePicker}
            />

            <FooterActions
              isFormValid={isFormValid}
              isPending={isPending}
              onSave={handleSubmit}
              onCancel={onClose}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </View>

      {/* ── Native DateTimePicker (iOS / Android) ── */}
      {Platform.OS !== "web" && activePicker && (
        <DateTimePicker
          value={pickerDateValue}
          mode={activePicker.target === "schedule" ? "time" : activePicker.mode}
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onValueChange={handlePickerChange}
          onDismiss={handlePickerDismiss}
          onNeutralButtonPress={handlePickerDismiss}
        />
      )}

      {/* ── Day Picker Bottom Sheet ── */}
      <DayPickerModal
        visible={!!activeDayPickerId}
        selectedDay={selectedDayForPicker}
        bottomInset={insets.bottom}
        onSelectDay={handleSelectDay}
        onClose={() => setActiveDayPickerId(null)}
      />
    </Modal>
  );
}
