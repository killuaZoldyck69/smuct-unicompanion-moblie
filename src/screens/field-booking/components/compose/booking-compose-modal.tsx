import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { BENTO } from "../../constants";
import { useFieldBookingForm } from "../../hooks/use-field-booking-form";
import { PurposeSection } from "./purpose-section";
import { DateSection } from "./date-section";
import { TimeSection } from "./time-section";
import { GuidelinesCard } from "./guidelines-card";

interface BookingComposeModalProps {
  visible: boolean;
  onClose: () => void;
}

export const BookingComposeModal = memo(function BookingComposeModal({
  visible,
  onClose,
}: BookingComposeModalProps) {
  const {
    purpose,
    setPurpose,
    selectedDate,
    selectedDateStr,
    setSelectedDate,
    startTime,
    endTime,
    nativePickerMode,
    setNativePickerMode,
    durationInfo,
    isPending,
    applyDateOffset,
    applyUpcomingWeekend,
    selectPreset,
    handleNativePickerChange,
    handleSubmit,
    setStartTime,
    setEndTime,
  } = useFieldBookingForm({ onSuccess: onClose });

  const pickerDateValue =
    nativePickerMode === "date"
      ? selectedDate
      : new Date(
          2026,
          0,
          1,
          nativePickerMode === "start"
            ? parseInt(startTime.split(":")[0], 10)
            : parseInt(endTime.split(":")[0], 10),
          nativePickerMode === "start"
            ? parseInt(startTime.split(":")[1] || "0", 10)
            : parseInt(endTime.split(":")[1] || "0", 10),
        );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView
        style={styles.modalSafeArea}
        accessibilityViewIsModal={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flexOne}
        >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel booking request"
            >
              <Feather name="x" size={20} color={BENTO.navy} />
            </TouchableOpacity>

            <View style={styles.titleWrap}>
              <Text style={styles.modalTitle}>Request Sports Ground</Text>
              <Text style={styles.modalSub}>SMUCT Main Campus Field</Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              style={[styles.modalSubmitBtn, isPending && styles.btnDisabled]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Submit booking request"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.modalSubmitBtnText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Form Scroll Container */}
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <PurposeSection purpose={purpose} onChangePurpose={setPurpose} />

            <DateSection
              selectedDate={selectedDate}
              selectedDateStr={selectedDateStr}
              onDateChange={setSelectedDate}
              onOpenNativePicker={() => setNativePickerMode("date")}
              applyDateOffset={applyDateOffset}
              applyUpcomingWeekend={applyUpcomingWeekend}
            />

            <TimeSection
              startTime={startTime}
              endTime={endTime}
              durationInfo={durationInfo}
              onSelectPreset={selectPreset}
              onChangeStartTime={setStartTime}
              onChangeEndTime={setEndTime}
              onOpenNativePicker={setNativePickerMode}
            />

            <GuidelinesCard />
          </ScrollView>

          {/* Native iOS / Android Picker */}
          {nativePickerMode && Platform.OS !== "web" && (
            <DateTimePicker
              value={pickerDateValue}
              mode={nativePickerMode === "date" ? "date" : "time"}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={
                nativePickerMode === "date" ? new Date() : undefined
              }
              onChange={handleNativePickerChange}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: BENTO.card,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  titleWrap: {
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: BENTO.navy,
  },
  modalSub: {
    fontSize: 11,
    color: BENTO.slate,
    marginTop: 1,
  },
  modalSubmitBtn: {
    backgroundColor: BENTO.navy,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  modalSubmitBtnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 18,
    paddingBottom: 40,
  },
});
