import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
  Keyboard,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import {
  BENTO_COLORS,
  BLOOD_GROUPS,
  fontFamily,
  NewBloodPostForm,
  URGENCY_LEVELS,
} from "../constants";

interface ComposeBloodModalProps {
  visible: boolean;
  form: NewBloodPostForm;
  onChangeForm: React.Dispatch<React.SetStateAction<NewBloodPostForm>>;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export const ComposeBloodModal = React.memo(function ComposeBloodModal({
  visible,
  form,
  onChangeForm,
  onSubmit,
  onClose,
  isSubmitting,
}: ComposeBloodModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Listen to keyboard show/hide events to dynamically adapt modal height
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Compute responsive sheet height that NEVER exceeds the safe area below the status bar
  const defaultHeight = Math.round(windowHeight * 0.88);
  const maxAllowedWithKeyboard =
    windowHeight - keyboardHeight - Math.max(insets.top, 24) - 12;
  const sheetHeight =
    keyboardHeight > 0
      ? Math.max(280, Math.min(defaultHeight, maxAllowedWithKeyboard))
      : Math.min(defaultHeight, windowHeight - Math.max(insets.top, 24) - 16);

  const canSubmit =
    form.patientName.trim().length > 0 &&
    form.patientCondition.trim().length > 0 &&
    (form.bagsNeeded || 1) >= 1 &&
    form.location.trim().length > 0 &&
    form.contactPhone.trim().length > 0;

  const handleClose = () => {
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Tap outside backdrop to dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
          accessible={false}
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <View style={[styles.sheet, { height: sheetHeight }]}>
            {/* Drag Handle */}
            <View style={styles.dragHandle} />

            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.closeBtn}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Cancel blood request"
              >
                <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>New Blood Request</Text>
              <View style={{ width: 36 }} />
            </View>

            {/* Scrollable Form Content */}
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >
              {/* Patient Name */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>PATIENT FULL NAME</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.patientName}
                  onChangeText={(text) =>
                    onChangeForm((prev) => ({ ...prev, patientName: text }))
                  }
                  placeholder="e.g. Md. Shafiqul Islam"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Patient Name"
                />
              </View>

              {/* Patient Condition */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>MEDICAL CONDITION / REASON</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.patientCondition}
                  onChangeText={(text) =>
                    onChangeForm((prev) => ({
                      ...prev,
                      patientCondition: text,
                    }))
                  }
                  placeholder="e.g. Emergency Surgery, Dengue, Accident"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Patient Condition or Reason"
                />
              </View>

              {/* Blood Group Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>BLOOD GROUP NEEDED</Text>
                <View style={styles.bloodGroupsGrid}>
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = form.bloodGroup === bg.value;
                    return (
                      <TouchableOpacity
                        key={bg.value}
                        style={[
                          styles.bloodGroupChip,
                          isSelected && styles.bloodGroupChipActive,
                        ]}
                        onPress={() =>
                          onChangeForm((prev) => ({
                            ...prev,
                            bloodGroup: bg.value,
                          }))
                        }
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Select blood group ${bg.label}`}
                      >
                        <Text
                          style={[
                            styles.bloodGroupChipText,
                            isSelected && styles.bloodGroupChipTextActive,
                          ]}
                        >
                          {bg.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Blood Bags Needed Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>BLOOD BAGS NEEDED</Text>
                <View style={styles.bagsSelectorRow}>
                  <View style={styles.bagsStepperBox}>
                    <TouchableOpacity
                      style={[
                        styles.stepperActionBtn,
                        (form.bagsNeeded || 1) <= 1 &&
                          styles.stepperActionBtnDisabled,
                      ]}
                      onPress={() =>
                        onChangeForm((prev) => ({
                          ...prev,
                          bagsNeeded: Math.max(1, (prev.bagsNeeded || 1) - 1),
                        }))
                      }
                      disabled={(form.bagsNeeded || 1) <= 1}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Decrease bag count"
                    >
                      <Feather
                        name="minus"
                        size={15}
                        color={
                          (form.bagsNeeded || 1) <= 1
                            ? "#94a3b8"
                            : BENTO_COLORS.deepNavy
                        }
                      />
                    </TouchableOpacity>

                    <View style={styles.stepperValueContainer}>
                      <Text style={styles.stepperValueNumber}>
                        {form.bagsNeeded || 1}
                      </Text>
                      <Text style={styles.stepperValueUnit}>
                        {(form.bagsNeeded || 1) === 1 ? "Bag" : "Bags"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.stepperActionBtn,
                        (form.bagsNeeded || 1) >= 10 &&
                          styles.stepperActionBtnDisabled,
                      ]}
                      onPress={() =>
                        onChangeForm((prev) => ({
                          ...prev,
                          bagsNeeded: Math.min(10, (prev.bagsNeeded || 1) + 1),
                        }))
                      }
                      disabled={(form.bagsNeeded || 1) >= 10}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Increase bag count"
                    >
                      <Feather
                        name="plus"
                        size={15}
                        color={
                          (form.bagsNeeded || 1) >= 10
                            ? "#94a3b8"
                            : BENTO_COLORS.deepNavy
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Quick count presets */}
                  <View style={styles.bagsPresetsRow}>
                    {[1, 2, 3, 4].map((count) => {
                      const isSelected = (form.bagsNeeded || 1) === count;
                      return (
                        <TouchableOpacity
                          key={count}
                          style={[
                            styles.bagPresetChip,
                            isSelected && styles.bagPresetChipActive,
                          ]}
                          onPress={() =>
                            onChangeForm((prev) => ({
                              ...prev,
                              bagsNeeded: count,
                            }))
                          }
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel={`${count} bags`}
                        >
                          <Text
                            style={[
                              styles.bagPresetChipText,
                              isSelected && styles.bagPresetChipTextActive,
                            ]}
                          >
                            {count}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              {/* Location / Hospital */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>HOSPITAL / LOCATION</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.location}
                  onChangeText={(text) =>
                    onChangeForm((prev) => ({ ...prev, location: text }))
                  }
                  placeholder="e.g. Uttara Adhunik Hospital, Ward 4"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Hospital or Location"
                />
              </View>

              {/* Urgency Selector */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>URGENCY PRIORITY</Text>
                <View style={styles.urgencyRow}>
                  {URGENCY_LEVELS.map((level) => {
                    const isSelected = form.urgency === level;
                    return (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.urgencyChip,
                          isSelected && styles.urgencyChipActive,
                        ]}
                        onPress={() =>
                          onChangeForm((prev) => ({ ...prev, urgency: level }))
                        }
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={`Priority ${level}`}
                      >
                        <Text
                          style={[
                            styles.urgencyChipText,
                            isSelected && styles.urgencyChipTextActive,
                          ]}
                        >
                          {level}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Contact Phone */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>EMERGENCY CONTACT PHONE</Text>
                <TextInput
                  style={styles.formInput}
                  value={form.contactPhone}
                  onChangeText={(text) =>
                    onChangeForm((prev) => ({ ...prev, contactPhone: text }))
                  }
                  placeholder="e.g. +880 1700-000000"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  keyboardType="phone-pad"
                  accessible={true}
                  accessibilityLabel="Emergency contact phone number"
                />
              </View>
            </ScrollView>

            {/* Bottom Docked Action Footer with Safe Area */}
            <View
              style={[
                styles.modalFooter,
                {
                  paddingBottom:
                    keyboardHeight > 0
                      ? 14
                      : Math.max(insets.bottom, 16),
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!canSubmit || isSubmitting) && styles.submitBtnDisabled,
                ]}
                onPress={onSubmit}
                disabled={!canSubmit || isSubmitting}
                activeOpacity={0.85}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Publish blood request"
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <Feather
                      name="droplet"
                      size={16}
                      color="#ffffff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.submitBtnText}>
                      Publish Blood Request
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 15, 29, 0.65)",
    justifyContent: "flex-end",
  },
  keyboardAvoid: {
    width: "100%",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: "hidden",
    maxHeight: "100%",
  },
  scrollView: {
    flex: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  formInput: {
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.neutralText,
    backgroundColor: BENTO_COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  bloodGroupsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodGroupChip: {
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    minWidth: 64,
    alignItems: "center",
    ...BENTO_COLORS.shadow,
  },
  bloodGroupChipActive: {
    backgroundColor: BENTO_COLORS.crimson,
    borderColor: BENTO_COLORS.crimson,
  },
  bloodGroupChipText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  bloodGroupChipTextActive: {
    color: "#ffffff",
  },
  bagsSelectorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bagsStepperBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 6,
    paddingVertical: 4,
    ...BENTO_COLORS.shadow,
  },
  stepperActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperActionBtnDisabled: {
    opacity: 0.35,
  },
  stepperValueContainer: {
    paddingHorizontal: 12,
    alignItems: "center",
    minWidth: 58,
  },
  stepperValueNumber: {
    fontFamily,
    fontSize: 16,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  stepperValueUnit: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginTop: -1,
  },
  bagsPresetsRow: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
  },
  bagPresetChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: BENTO_COLORS.white,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  bagPresetChipActive: {
    backgroundColor: BENTO_COLORS.crimson,
    borderColor: BENTO_COLORS.crimson,
  },
  bagPresetChipText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "800",
    color: BENTO_COLORS.neutralText,
  },
  bagPresetChipTextActive: {
    color: "#ffffff",
  },
  urgencyRow: {
    flexDirection: "row",
    gap: 10,
  },
  urgencyChip: {
    flex: 1,
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  urgencyChipActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  urgencyChipText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.neutralText,
  },
  urgencyChipTextActive: {
    color: "#ffffff",
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: BENTO_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.crimson,
    height: 48,
    borderRadius: BENTO_COLORS.pillRadius,
    ...BENTO_COLORS.shadow,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
