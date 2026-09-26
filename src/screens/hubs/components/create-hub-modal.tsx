import React, { useCallback, useMemo } from "react";
import {
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Text,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  CreateHubModalProps,
  useCreateHub,
  styles,
  CreateHubHeader,
  CourseDetailsSection,
  CohortSection,
  ScheduleSection,
  InstructorSection,
  CreateHubFooter,
  DayPickerModal,
} from "./create-hub";

export default function CreateHubModal({
  isVisible,
  onClose,
  onSubmit,
  isPending,
  teachers = [],
  isLoadingTeachers = false,
  currentUser,
}: CreateHubModalProps) {
  const insets = useSafeAreaInsets();

  const {
    form,
    updateFormField,
    schedules,
    addSchedule,
    removeSchedule,
    updateScheduleField,
    activePicker,
    setActivePicker,
    activeDayPickerId,
    setActiveDayPickerId,
    handleTimeChange,
    handleResetForm,
    handleCreate,
    isTeacher,
    isCR,
    pickerDateValue,
  } = useCreateHub({
    isVisible,
    currentUser,
    onSubmit,
  });

  const selectedDayForPicker = useMemo(() => {
    return schedules.find((s) => s.id === activeDayPickerId)?.day;
  }, [schedules, activeDayPickerId]);

  const handleSelectDay = useCallback(
    (day: string) => {
      if (activeDayPickerId) {
        updateScheduleField(activeDayPickerId, "day", day);
      }
      setActiveDayPickerId(null);
    },
    [activeDayPickerId, updateScheduleField, setActiveDayPickerId]
  );

  const handleCloseDayPicker = useCallback(() => {
    setActiveDayPickerId(null);
  }, [setActiveDayPickerId]);

  const handleOpenDayPicker = useCallback(
    (id: string) => {
      setActiveDayPickerId(id);
    },
    [setActiveDayPickerId]
  );

  const handleOpenTimePicker = useCallback(
    (id: string, type: "start" | "end") => {
      setActivePicker({ id, type });
    },
    [setActivePicker]
  );

  const handleUpdateRoom = useCallback(
    (id: string, room: string) => {
      updateScheduleField(id, "room", room);
    },
    [updateScheduleField]
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <SafeAreaView
        style={styles.modalContainer}
        edges={["top", "bottom"]}
        accessibilityViewIsModal={true}
      >
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent={true}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {/* 1. Header */}
          <CreateHubHeader onClose={onClose} />

          <ScrollView
            contentContainerStyle={[
              styles.modalScrollContent,
              { paddingBottom: Math.max(insets.bottom + 24, 32) },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Subtitle */}
            <Text style={styles.pageSubtitle}>
              Configure course metadata, schedule, and cohort parameters
            </Text>

            {/* 2. Bento 1: Course Details (Soft Blue) */}
            <CourseDetailsSection
              courseName={form.courseName}
              courseCode={form.courseCode}
              credit={form.credit}
              onChangeName={(val) => updateFormField("courseName", val)}
              onChangeCode={(val) => updateFormField("courseCode", val)}
              onChangeCredit={(val) => updateFormField("credit", val)}
            />

            {/* 3. Bento 2: Cohort Details (Soft Mint) */}
            <CohortSection
              isCR={isCR}
              department={form.department}
              batch={form.batch}
              section={form.section}
              semesterNumber={form.semesterNumber}
              termOffer={form.termOffer}
              userDepartment={currentUser?.studentProfile?.department}
              userBatch={currentUser?.studentProfile?.batch}
              userSection={currentUser?.studentProfile?.section}
              userSemester={currentUser?.studentProfile?.currentSemester}
              userTerm={currentUser?.studentProfile?.currentTerm}
              onChangeDepartment={(val) => updateFormField("department", val)}
              onChangeBatch={(val) => updateFormField("batch", val)}
              onChangeSection={(val) => updateFormField("section", val)}
              onChangeSemester={(val) => updateFormField("semesterNumber", val)}
              onChangeTerm={(val) => updateFormField("termOffer", val)}
            />

            {/* 4. Bento 3: Weekly Class Schedule (Soft Amber) */}
            <ScheduleSection
              schedules={schedules}
              onOpenDayPicker={handleOpenDayPicker}
              onOpenTimePicker={handleOpenTimePicker}
              onUpdateRoom={handleUpdateRoom}
              onRemoveSchedule={removeSchedule}
              onAddSchedule={addSchedule}
            />

            {/* 5. Bento 4: Instructor Assignment (Soft Purple) */}
            <InstructorSection
              isCR={isCR}
              isTeacher={isTeacher}
              selectedTeacherId={form.teacherId}
              teachers={teachers}
              isLoadingTeachers={isLoadingTeachers}
              currentUser={currentUser}
              onSelectTeacher={(id) => updateFormField("teacherId", id)}
            />

            {/* 6. Bottom Actions */}
            <CreateHubFooter
              isPending={isPending}
              onCreate={handleCreate}
              onReset={handleResetForm}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Time Picker Dialog */}
      {activePicker && (
        <DateTimePicker
          value={pickerDateValue}
          mode="time"
          is24Hour={false}
          display="default"
          onValueChange={handleTimeChange}
          onDismiss={() => setActivePicker(null)}
        />
      )}

      {/* Day Picker Bottom Sheet */}
      <DayPickerModal
        visible={!!activeDayPickerId}
        selectedDay={selectedDayForPicker}
        bottomInset={insets.bottom}
        onSelectDay={handleSelectDay}
        onClose={handleCloseDayPicker}
      />
    </Modal>
  );
}
