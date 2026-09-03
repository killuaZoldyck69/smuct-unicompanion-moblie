import React from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onClose}
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

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Patient Name */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Patient Full Name</Text>
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
              <Text style={styles.formLabel}>Medical Condition / Reason</Text>
              <TextInput
                style={styles.formInput}
                value={form.patientCondition}
                onChangeText={(text) =>
                  onChangeForm((prev) => ({ ...prev, patientCondition: text }))
                }
                placeholder="e.g. Emergency Surgery, Dengue, Accident"
                placeholderTextColor={BENTO_COLORS.subtleText}
                accessible={true}
                accessibilityLabel="Patient Condition or Reason"
              />
            </View>

            {/* Blood Group Selector (1-Tap Bento Chips) */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Blood Group Needed</Text>
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

            {/* Location / Hospital */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Hospital / Location</Text>
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
              <Text style={styles.formLabel}>Urgency Priority</Text>
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
              <Text style={styles.formLabel}>Emergency Contact Phone</Text>
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

            {/* Submit Button */}
            <TouchableOpacity
              style={styles.submitBtn}
              onPress={onSubmit}
              disabled={isSubmitting}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Publish blood request"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.submitBtnText}>Publish Blood Request</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BENTO_COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO_COLORS.subtleBorder,
    backgroundColor: BENTO_COLORS.background,
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
    paddingBottom: 40,
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
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BENTO_COLORS.crimson,
    paddingVertical: 16,
    borderRadius: BENTO_COLORS.pillRadius,
    marginTop: 10,
    ...BENTO_COLORS.heroShadow,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
