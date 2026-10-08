import React, { memo } from "react";
import {
  View,
  Text,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

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
    handleNativePickerChange,
    handleSubmit,
    setStartTime,
    setEndTime,
  } = useFieldBookingForm({ onSuccess: onClose });

  const topPadding = Platform.OS === "android" ? Math.max(insets.top, 24) : insets.top;
  const bottomPadding = Math.max(insets.bottom, 16);

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
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[styles.modalContainer, { paddingTop: topPadding }]}
        accessibilityViewIsModal={true}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.flexOne}
        >
          {/* Modal Header: Left Title, Right Close Button */}
          <View style={styles.modalHeader}>
            <View style={styles.titleWrapLeft}>
              <Text style={styles.modalTitle}>Request Sports Ground</Text>
              <Text style={styles.modalSub}>SMUCT Main Campus Field</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.modalCloseBtn}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close request form"
              activeOpacity={0.7}
            >
              <Feather name="x" size={20} color={BENTO.navy} />
            </TouchableOpacity>
          </View>

          {/* Form Scroll Container */}
          <ScrollView
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
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
              onChangeStartTime={setStartTime}
              onChangeEndTime={setEndTime}
              onOpenNativePicker={setNativePickerMode}
            />

            <GuidelinesCard />
          </ScrollView>

          {/* Bottom Docked Submit Action with Safe Area */}
          <View style={[styles.bottomBar, { paddingBottom: bottomPadding }]}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isPending}
              style={[styles.modalSubmitBtn, isPending && styles.btnDisabled]}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Submit booking request"
              activeOpacity={0.85}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="check-circle"
                    size={16}
                    color="#ffffff"
                    style={styles.submitBtnIcon}
                  />
                  <Text style={styles.modalSubmitBtnText}>
                    Submit Booking Request
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Native iOS / Android Picker */}
          {nativePickerMode && Platform.OS !== "web" && (
            <DateTimePicker
              value={pickerDateValue}
              mode={nativePickerMode === "date" ? "date" : "time"}
              display={Platform.OS === "ios" ? "spinner" : "default"}
              minimumDate={
                nativePickerMode === "date" ? new Date() : undefined
              }
              onValueChange={handleNativePickerChange}
              onDismiss={() => setNativePickerMode(null)}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  flexOne: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: BENTO.canvas,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: BENTO.canvas,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(15, 23, 42, 0.06)",
  },
  titleWrapLeft: {
    flex: 1,
    paddingRight: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 12,
    color: BENTO.slate,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: BENTO.card,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  bottomBar: {
    backgroundColor: BENTO.card,
    borderTopWidth: 1,
    borderTopColor: BENTO.border,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  modalSubmitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO.navy,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: BENTO.navy,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  submitBtnIcon: {
    marginRight: 6,
  },
  modalSubmitBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
});
