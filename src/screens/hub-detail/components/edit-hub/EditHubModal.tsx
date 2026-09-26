import React from "react";
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView style={s.container} edges={["top", "bottom"]}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

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
      </SafeAreaView>

      {/* ── Native DateTimePicker (iOS / Android) ── */}
      {Platform.OS !== "web" && activePicker && (
        <DateTimePicker
          value={pickerDateValue}
          mode={activePicker.target === "schedule" ? "time" : activePicker.mode}
          is24Hour={false}
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={handlePickerChange}
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
