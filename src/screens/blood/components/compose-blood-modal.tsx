import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Keyboard,
  StatusBar,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { toastConfig } from "@/components/ui/toast-config";
import {
  BENTO_COLORS,
  BLOOD_GROUPS,
  fontFamily,
  NewBloodPostForm,
  POPULAR_HOSPITALS,
  URGENCY_LEVELS,
} from "../constants";
import { validateBloodPostInput } from "../utils";
import {
  HospitalMapPickerModal,
  SelectedHospitalLocation,
} from "./hospital-map-picker-modal";

export const buildCompiledLocation = (
  hospitalName?: string,
  floor?: string,
  ward?: string,
  bed?: string,
  notes?: string,
  address?: string,
): string => {
  const parts: string[] = [];
  if (hospitalName?.trim()) {
    parts.push(hospitalName.trim());
  }
  if (
    address?.trim() &&
    !hospitalName?.trim().toLowerCase().includes(address.trim().toLowerCase())
  ) {
    parts.push(address.trim());
  }
  if (floor?.trim()) {
    const f = floor.trim();
    parts.push(
      f.toLowerCase().includes("floor") || f.toLowerCase().includes("level")
        ? f
        : `${f} Floor`,
    );
  }
  if (ward?.trim()) {
    const w = ward.trim();
    parts.push(
      w.toLowerCase().includes("ward") ||
        w.toLowerCase().includes("icu") ||
        w.toLowerCase().includes("ccu") ||
        w.toLowerCase().includes("cabin") ||
        w.toLowerCase().includes("unit")
        ? w
        : `Ward ${w}`,
    );
  }
  if (bed?.trim()) {
    const b = bed.trim();
    parts.push(b.toLowerCase().includes("bed") ? b : `Bed ${b}`);
  }
  if (notes?.trim()) {
    parts.push(`(${notes.trim()})`);
  }
  return parts.join(", ");
};

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
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isMapPickerVisible, setIsMapPickerVisible] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitErrorBanner, setSubmitErrorBanner] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible) {
      setFieldErrors({});
      setSubmitErrorBanner(null);
    }
  }, [visible]);

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

  const clearFieldError = useCallback((field: keyof NewBloodPostForm) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setSubmitErrorBanner(null);
  }, []);

  const handleSelectHospitalFromMap = useCallback(
    (hospital: SelectedHospitalLocation) => {
      clearFieldError("location");
      const fullAddress = hospital.address || hospital.area || "";
      onChangeForm((prev) => {
        const compiled = buildCompiledLocation(
          hospital.name,
          prev.floor,
          prev.ward,
          prev.bed,
          prev.additionalLocationNotes,
          fullAddress,
        );
        return {
          ...prev,
          hospitalName: hospital.name,
          hospitalAddress: fullAddress,
          latitude: hospital.latitude,
          longitude: hospital.longitude,
          location: compiled,
        };
      });
    },
    [clearFieldError, onChangeForm],
  );

  const handlePublishPress = useCallback(() => {
    Keyboard.dismiss();
    const validation = validateBloodPostInput(form);
    if (!validation.isValid) {
      setFieldErrors(validation.fieldErrors);
      setSubmitErrorBanner(
        validation.error || "Please complete all required fields."
      );
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: validation.error || "Please correct the highlighted fields.",
        visibilityTime: 4000,
      });
      return;
    }

    setFieldErrors({});
    setSubmitErrorBanner(null);
    onSubmit();
  }, [form, onSubmit]);

  const handleClose = () => {
    Keyboard.dismiss();
    setFieldErrors({});
    setSubmitErrorBanner(null);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={BENTO_COLORS.background}
        translucent={true}
      />
      <SafeAreaView style={styles.fullScreenContainer} edges={["top", "bottom"]}>
        {/* Full Screen Top Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconCircle}>
              <Feather name="droplet" size={20} color={BENTO_COLORS.crimson} />
            </View>
            <View style={styles.headerTextCol}>
              <Text style={styles.headerTitle}>New Blood Request</Text>
              <Text style={styles.headerSubtitle}>
                Emergency donor coordination for campus
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeBtn}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Close request form"
          >
            <Feather name="x" size={20} color={BENTO_COLORS.deepNavy} />
          </TouchableOpacity>
        </View>

        {/* Form Body with Keyboard Avoiding */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardAvoid}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
          >
            {/* Top Error Alert Banner if validation failed */}
            {submitErrorBanner ? (
              <View style={styles.errorBannerContainer}>
                <Feather
                  name="alert-triangle"
                  size={18}
                  color={BENTO_COLORS.crimson}
                  style={{ marginRight: 10, marginTop: 1 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.errorBannerTitle}>
                    Please check the form
                  </Text>
                  <Text style={styles.errorBannerText}>
                    {submitErrorBanner}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSubmitErrorBanner(null)}
                  style={styles.errorBannerCloseBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Feather name="x" size={14} color={BENTO_COLORS.crimson} />
                </TouchableOpacity>
              </View>
            ) : null}

            {/* 1. Patient Name */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="user"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>PATIENT FULL NAME *</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  !!fieldErrors.patientName && styles.inputWrapperError,
                ]}
              >
                <Feather
                  name="user"
                  size={16}
                  color={
                    fieldErrors.patientName
                      ? BENTO_COLORS.crimson
                      : BENTO_COLORS.subtleText
                  }
                  style={styles.fieldLeadingIcon}
                />
                <TextInput
                  style={styles.formInput}
                  value={form.patientName}
                  onChangeText={(text) => {
                    clearFieldError("patientName");
                    onChangeForm((prev) => ({ ...prev, patientName: text }));
                  }}
                  placeholder="e.g. Md. Shafiqul Islam"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Patient full name"
                />
                {form.patientName.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      clearFieldError("patientName");
                      onChangeForm((prev) => ({ ...prev, patientName: "" }));
                    }}
                    style={styles.clearBtn}
                  >
                    <Feather
                      name="x-circle"
                      size={15}
                      color={BENTO_COLORS.subtleText}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {fieldErrors.patientName ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.patientName}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 2. Patient Condition */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="activity"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>MEDICAL CONDITION / REASON *</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  !!fieldErrors.patientCondition && styles.inputWrapperError,
                ]}
              >
                <Feather
                  name="activity"
                  size={16}
                  color={
                    fieldErrors.patientCondition
                      ? BENTO_COLORS.crimson
                      : BENTO_COLORS.subtleText
                  }
                  style={styles.fieldLeadingIcon}
                />
                <TextInput
                  style={styles.formInput}
                  value={form.patientCondition}
                  onChangeText={(text) => {
                    clearFieldError("patientCondition");
                    onChangeForm((prev) => ({
                      ...prev,
                      patientCondition: text,
                    }));
                  }}
                  placeholder="e.g. Emergency Surgery, Dengue, Accident"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Patient medical condition or reason"
                />
                {form.patientCondition.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      clearFieldError("patientCondition");
                      onChangeForm((prev) => ({
                        ...prev,
                        patientCondition: "",
                      }));
                    }}
                    style={styles.clearBtn}
                  >
                    <Feather
                      name="x-circle"
                      size={15}
                      color={BENTO_COLORS.subtleText}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {fieldErrors.patientCondition ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.patientCondition}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 3. Details About Patient / Medical Condition / Notes */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="file-text"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>
                  DETAILS & MEDICAL NOTES (OPTIONAL)
                </Text>
              </View>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <Feather
                  name="file-text"
                  size={16}
                  color={BENTO_COLORS.subtleText}
                  style={[styles.fieldLeadingIcon, { marginTop: 2 }]}
                />
                <TextInput
                  style={[styles.formInput, styles.textAreaInput]}
                  value={form.details || ""}
                  onChangeText={(text) =>
                    onChangeForm((prev) => ({
                      ...prev,
                      details: text,
                    }))
                  }
                  placeholder="Details about the patient, medical condition, donor requirements or special instructions..."
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  multiline={true}
                  numberOfLines={4}
                  textAlignVertical="top"
                  accessible={true}
                  accessibilityLabel="Details about the patient and medical condition"
                />
                {(form.details || "").length > 0 && (
                  <TouchableOpacity
                    onPress={() =>
                      onChangeForm((prev) => ({ ...prev, details: "" }))
                    }
                    style={styles.textAreaClearBtn}
                  >
                    <Feather
                      name="x-circle"
                      size={15}
                      color={BENTO_COLORS.subtleText}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* 4. Blood Group Selector */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="droplet"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>BLOOD GROUP NEEDED *</Text>
              </View>
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
                      onPress={() => {
                        clearFieldError("bloodGroup");
                        onChangeForm((prev) => ({
                          ...prev,
                          bloodGroup: bg.value,
                        }));
                      }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Select blood group ${bg.label}`}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <Feather
                          name="droplet"
                          size={11}
                          color="#ffffff"
                          style={{ marginRight: 4 }}
                        />
                      )}
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
              {fieldErrors.bloodGroup ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.bloodGroup}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* 4. Blood Bags Needed Selector */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="package"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>BLOOD BAGS NEEDED</Text>
              </View>
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
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="minus"
                      size={15}
                      color={
                        (form.bagsNeeded || 1) <= 1
                          ? "#cbd5e1"
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
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="plus"
                      size={15}
                      color={
                        (form.bagsNeeded || 1) >= 10
                          ? "#cbd5e1"
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
                        activeOpacity={0.7}
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

            {/* 5. Hospital Location & Patient Room Bento Box */}
            <View style={styles.formGroup}>
              <View style={styles.sectionHeaderRow}>
                <View style={styles.labelRowNoMargin}>
                  <Feather
                    name="map-pin"
                    size={13}
                    color={BENTO_COLORS.crimson}
                    style={styles.labelIcon}
                  />
                  <Text style={styles.formLabel} numberOfLines={1}>
                    HOSPITAL LOCATION *
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.mapPickerTriggerBtn}
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsMapPickerVisible(true);
                  }}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Choose hospital location on map"
                >
                  <Feather
                    name="map"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.mapPickerTriggerText}>Select on Map</Text>
                </TouchableOpacity>
              </View>

              {/* Hospital Name Input with Quick Map Button */}
              <View
                style={[
                  styles.inputWrapper,
                  !!fieldErrors.location && styles.inputWrapperError,
                ]}
              >
                <Feather
                  name="plus-circle"
                  size={16}
                  color={
                    fieldErrors.location
                      ? BENTO_COLORS.crimson
                      : BENTO_COLORS.crimson
                  }
                  style={styles.fieldLeadingIcon}
                />
                <TextInput
                  style={styles.formInput}
                  value={form.hospitalName ?? (form.location ? form.location.split(",")[0] : "")}
                  onChangeText={(text) => {
                    clearFieldError("location");
                    const matchedPop = POPULAR_HOSPITALS.find(
                      (h) => h.name.toLowerCase() === text.trim().toLowerCase(),
                    );
                    onChangeForm((prev) => {
                      const newAddress = matchedPop?.address || prev.hospitalAddress || "";
                      const compiled = buildCompiledLocation(
                        text,
                        prev.floor,
                        prev.ward,
                        prev.bed,
                        prev.additionalLocationNotes,
                        newAddress,
                      );
                      return {
                        ...prev,
                        hospitalName: text,
                        hospitalAddress: newAddress,
                        location: compiled,
                        latitude: matchedPop ? matchedPop.latitude : prev.latitude,
                        longitude: matchedPop ? matchedPop.longitude : prev.longitude,
                      };
                    });
                  }}
                  placeholder="Hospital name (or tap Select on Map)"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  accessible={true}
                  accessibilityLabel="Hospital name"
                />
                <TouchableOpacity
                  onPress={() => {
                    Keyboard.dismiss();
                    setIsMapPickerVisible(true);
                  }}
                  style={styles.inlineMapBtn}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Open map picker"
                >
                  <Feather name="navigation" size={14} color={BENTO_COLORS.crimson} />
                </TouchableOpacity>
              </View>
              {!!form.hospitalAddress && (
                <View style={styles.confirmedAddressBanner}>
                  <Feather
                    name="map-pin"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 6, marginTop: 1 }}
                  />
                  <Text style={styles.confirmedAddressBannerText} numberOfLines={2}>
                    {form.hospitalAddress}
                  </Text>
                </View>
              )}
              {fieldErrors.location ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.location}
                  </Text>
                </View>
              ) : null}

              {/* Structured Patient Room Details: Floor, Ward, Bed in a 3-column Bento grid */}
              <View style={styles.roomDetailsCard}>
                <View style={styles.roomCardHeader}>
                  <Feather
                    name="layers"
                    size={12}
                    color={BENTO_COLORS.subtleText}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.roomCardTitle}>
                    PATIENT ROOM, BED & WARD DETAILS
                  </Text>
                </View>

                <View style={styles.roomGridRow}>
                  {/* Floor */}
                  <View style={styles.roomCol}>
                    <Text style={styles.roomInputLabel}>FLOOR</Text>
                    <View style={styles.roomInputWrapper}>
                      <TextInput
                        style={styles.roomInput}
                        value={form.floor || ""}
                        onChangeText={(text) => {
                          onChangeForm((prev) => {
                            const currentHosp =
                              prev.hospitalName ||
                              (prev.location ? prev.location.split(",")[0] : "");
                            const compiled = buildCompiledLocation(
                              currentHosp,
                              text,
                              prev.ward,
                              prev.bed,
                              prev.additionalLocationNotes,
                              prev.hospitalAddress,
                            );
                            return { ...prev, floor: text, location: compiled };
                          });
                        }}
                        placeholder="e.g. 3rd"
                        placeholderTextColor={BENTO_COLORS.subtleText}
                        accessible={true}
                        accessibilityLabel="Hospital floor number"
                      />
                    </View>
                  </View>

                  {/* Ward */}
                  <View style={styles.roomCol}>
                    <Text style={styles.roomInputLabel}>WARD / UNIT</Text>
                    <View style={styles.roomInputWrapper}>
                      <TextInput
                        style={styles.roomInput}
                        value={form.ward || ""}
                        onChangeText={(text) => {
                          onChangeForm((prev) => {
                            const currentHosp =
                              prev.hospitalName ||
                              (prev.location ? prev.location.split(",")[0] : "");
                            const compiled = buildCompiledLocation(
                              currentHosp,
                              prev.floor,
                              text,
                              prev.bed,
                              prev.additionalLocationNotes,
                              prev.hospitalAddress,
                            );
                            return { ...prev, ward: text, location: compiled };
                          });
                        }}
                        placeholder="Ward 4 / ICU"
                        placeholderTextColor={BENTO_COLORS.subtleText}
                        accessible={true}
                        accessibilityLabel="Hospital ward or unit"
                      />
                    </View>
                  </View>

                  {/* Bed */}
                  <View style={styles.roomCol}>
                    <Text style={styles.roomInputLabel}>BED NO.</Text>
                    <View style={styles.roomInputWrapper}>
                      <TextInput
                        style={styles.roomInput}
                        value={form.bed || ""}
                        onChangeText={(text) => {
                          onChangeForm((prev) => {
                            const currentHosp =
                              prev.hospitalName ||
                              (prev.location ? prev.location.split(",")[0] : "");
                            const compiled = buildCompiledLocation(
                              currentHosp,
                              prev.floor,
                              prev.ward,
                              text,
                              prev.additionalLocationNotes,
                              prev.hospitalAddress,
                            );
                            return { ...prev, bed: text, location: compiled };
                          });
                        }}
                        placeholder="Bed 12"
                        placeholderTextColor={BENTO_COLORS.subtleText}
                        accessible={true}
                        accessibilityLabel="Patient bed number"
                      />
                    </View>
                  </View>
                </View>

                {/* Additional Room Notes */}
                <View style={styles.roomNotesWrapper}>
                  <Feather
                    name="info"
                    size={12}
                    color={BENTO_COLORS.subtleText}
                    style={{ marginRight: 6 }}
                  />
                  <TextInput
                    style={styles.roomNotesInput}
                    value={form.additionalLocationNotes || ""}
                    onChangeText={(text) => {
                      onChangeForm((prev) => {
                        const currentHosp =
                          prev.hospitalName ||
                          (prev.location ? prev.location.split(",")[0] : "");
                        const compiled = buildCompiledLocation(
                          currentHosp,
                          prev.floor,
                          prev.ward,
                          prev.bed,
                          text,
                          prev.hospitalAddress,
                        );
                        return {
                          ...prev,
                          additionalLocationNotes: text,
                          location: compiled,
                        };
                      });
                    }}
                    placeholder="Directions (e.g. Cabin 201, Near Nurse Station)"
                    placeholderTextColor={BENTO_COLORS.subtleText}
                    accessible={true}
                    accessibilityLabel="Additional room directions"
                  />
                </View>
              </View>

              {/* Live Donor Location Preview Banner */}
              {form.location.trim().length > 0 && (
                <View style={styles.locationPreviewBanner}>
                  <Feather
                    name="navigation"
                    size={13}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 8, marginTop: 2 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.locationPreviewLabel}>
                      DONOR LOCATION PREVIEW
                    </Text>
                    <Text style={styles.locationPreviewText} numberOfLines={2}>
                      {form.location}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* 6. Urgency Selector */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="alert-triangle"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>URGENCY PRIORITY</Text>
              </View>
              <View style={styles.urgencyRow}>
                {URGENCY_LEVELS.map((level) => {
                  const isSelected = form.urgency === level;
                  const isHigh = level === "High";
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyChip,
                        isSelected &&
                          (isHigh
                            ? styles.urgencyChipHighActive
                            : styles.urgencyChipActive),
                      ]}
                      onPress={() =>
                        onChangeForm((prev) => ({ ...prev, urgency: level }))
                      }
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={`Priority ${level}`}
                      activeOpacity={0.7}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.urgencyDot,
                            isHigh && styles.urgencyDotHigh,
                          ]}
                        />
                      )}
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

            {/* 7. Emergency Contact Phone */}
            <View style={styles.formGroup}>
              <View style={styles.labelRow}>
                <Feather
                  name="phone"
                  size={13}
                  color={BENTO_COLORS.crimson}
                  style={styles.labelIcon}
                />
                <Text style={styles.formLabel}>EMERGENCY CONTACT PHONE *</Text>
              </View>
              <View
                style={[
                  styles.inputWrapper,
                  !!fieldErrors.contactPhone && styles.inputWrapperError,
                ]}
              >
                <Feather
                  name="phone"
                  size={16}
                  color={
                    fieldErrors.contactPhone
                      ? BENTO_COLORS.crimson
                      : BENTO_COLORS.subtleText
                  }
                  style={styles.fieldLeadingIcon}
                />
                <TextInput
                  style={styles.formInput}
                  value={form.contactPhone}
                  onChangeText={(text) => {
                    clearFieldError("contactPhone");
                    onChangeForm((prev) => ({ ...prev, contactPhone: text }));
                  }}
                  placeholder="e.g. +880 1700-000000"
                  placeholderTextColor={BENTO_COLORS.subtleText}
                  keyboardType="phone-pad"
                  accessible={true}
                  accessibilityLabel="Emergency contact phone number"
                />
                {form.contactPhone.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      clearFieldError("contactPhone");
                      onChangeForm((prev) => ({ ...prev, contactPhone: "" }));
                    }}
                    style={styles.clearBtn}
                  >
                    <Feather
                      name="x-circle"
                      size={15}
                      color={BENTO_COLORS.subtleText}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {fieldErrors.contactPhone ? (
                <View style={styles.fieldErrorRow}>
                  <Feather
                    name="alert-circle"
                    size={12}
                    color={BENTO_COLORS.crimson}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={styles.fieldErrorText}>
                    {fieldErrors.contactPhone}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Bottom Docked Action Footer */}
          <View
            style={[
              styles.modalFooter,
              {
                paddingBottom:
                  keyboardHeight > 0 ? 12 : Math.max(insets.bottom, 16),
              },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
              ]}
              onPress={handlePublishPress}
              disabled={isSubmitting}
              activeOpacity={0.88}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Publish blood request"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="send"
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
        </KeyboardAvoidingView>

        {/* Hospital Map Location Picker Modal */}
        <HospitalMapPickerModal
          visible={isMapPickerVisible}
          initialHospitalName={
            form.hospitalName ||
            (form.location ? form.location.split(",")[0] : undefined)
          }
          initialLatitude={form.latitude}
          initialLongitude={form.longitude}
          onSelectHospital={handleSelectHospitalFromMap}
          onClose={() => setIsMapPickerVisible(false)}
        />

        {/* Toast Notification Container mounted inside Modal Window */}
        <Toast config={toastConfig} />
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: BENTO_COLORS.background,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: BENTO_COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  formGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 6,
  },
  formLabel: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 14,
    height: 52,
    ...BENTO_COLORS.shadow,
  },
  inputWrapperError: {
    borderColor: "#e11d48",
    backgroundColor: "#fff1f2",
  },
  fieldErrorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    paddingHorizontal: 4,
  },
  fieldErrorText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#be123c",
    flex: 1,
  },
  errorBannerContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff1f2",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.25)",
    padding: 12,
    marginBottom: 20,
  },
  errorBannerTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#9f1239",
    marginBottom: 2,
  },
  errorBannerText: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: "#be123c",
    lineHeight: 16,
  },
  errorBannerCloseBtn: {
    padding: 4,
    marginLeft: 6,
  },
  fieldLeadingIcon: {
    marginRight: 10,
  },
  formInput: {
    flex: 1,
    fontFamily,
    fontSize: 14,
    color: BENTO_COLORS.neutralText,
    paddingVertical: 0,
    height: "100%",
  },
  clearBtn: {
    padding: 4,
  },
  textAreaWrapper: {
    height: 104,
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  textAreaInput: {
    height: "100%",
    paddingTop: 0,
    paddingBottom: 0,
    textAlignVertical: "top",
    lineHeight: 20,
  },
  textAreaClearBtn: {
    padding: 4,
    alignSelf: "flex-start",
  },
  bloodGroupsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  bloodGroupChip: {
    backgroundColor: BENTO_COLORS.white,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    minWidth: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    ...BENTO_COLORS.shadow,
  },
  bloodGroupChipActive: {
    backgroundColor: BENTO_COLORS.crimson,
    borderColor: BENTO_COLORS.crimson,
    shadowColor: BENTO_COLORS.crimson,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 6,
    paddingVertical: 5,
    ...BENTO_COLORS.shadow,
  },
  stepperActionBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    minWidth: 54,
  },
  stepperValueNumber: {
    fontFamily,
    fontSize: 17,
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
    gap: 8,
  },
  bagPresetChip: {
    flex: 1,
    height: 48,
    borderRadius: 14,
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
    shadowColor: BENTO_COLORS.crimson,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  bagPresetChipText: {
    fontFamily,
    fontSize: 14.5,
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
    paddingVertical: 13,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.shadow,
  },
  urgencyChipActive: {
    backgroundColor: BENTO_COLORS.deepNavy,
    borderColor: BENTO_COLORS.deepNavy,
  },
  urgencyChipHighActive: {
    backgroundColor: "#dc2626",
    borderColor: "#dc2626",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    marginRight: 6,
  },
  urgencyDotHigh: {
    backgroundColor: "#ffffff",
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
    paddingTop: 12,
    backgroundColor: BENTO_COLORS.background,
    borderTopWidth: 1,
    borderTopColor: BENTO_COLORS.subtleBorder,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.crimson,
    height: 52,
    borderRadius: 26,
    shadowColor: BENTO_COLORS.crimson,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitBtnDisabled: {
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: -0.2,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  labelRowNoMargin: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  mapPickerTriggerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(225, 29, 72, 0.08)",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.2)",
    flexShrink: 0,
  },
  mapPickerTriggerText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.crimson,
  },
  inlineMapBtn: {
    padding: 6,
    backgroundColor: "rgba(225, 29, 72, 0.08)",
    borderRadius: 10,
  },
  roomDetailsCard: {
    backgroundColor: BENTO_COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    marginTop: 10,
    ...BENTO_COLORS.shadow,
  },
  roomCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  roomCardTitle: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "800",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.5,
  },
  roomGridRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  roomCol: {
    flex: 1,
  },
  roomInputLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    marginBottom: 4,
  },
  roomInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 8,
    height: 42,
  },
  roomInput: {
    flex: 1,
    fontFamily,
    fontSize: 12.5,
    color: BENTO_COLORS.neutralText,
    paddingVertical: 0,
    height: "100%",
  },
  roomNotesWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    paddingHorizontal: 10,
    height: 42,
  },
  roomNotesInput: {
    flex: 1,
    fontFamily,
    fontSize: 12,
    color: BENTO_COLORS.neutralText,
    paddingVertical: 0,
    height: "100%",
  },
  locationPreviewBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(225, 29, 72, 0.05)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(225, 29, 72, 0.15)",
    padding: 10,
    marginTop: 10,
  },
  locationPreviewLabel: {
    fontFamily,
    fontSize: 9.5,
    fontWeight: "800",
    color: BENTO_COLORS.crimson,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  locationPreviewText: {
    fontFamily,
    fontSize: 12.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    lineHeight: 16,
  },
  confirmedAddressBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff1f2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#fecdd3",
  },
  confirmedAddressBannerText: {
    fontFamily,
    fontSize: 11.5,
    fontWeight: "600",
    color: "#be123c",
    flex: 1,
    lineHeight: 16,
  },
});
