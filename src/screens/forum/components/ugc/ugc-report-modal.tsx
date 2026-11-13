import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type {
  UgcReportReason,
  UgcReportTargetType,
} from "@/services/ugc-service";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily } from "../../constants";

interface UgcReportModalProps {
  visible: boolean;
  targetType: UgcReportTargetType;
  targetTitle?: string;
  onClose: () => void;
  onSubmit: (payload: { reason: UgcReportReason; details?: string }) => void;
  isSubmitting?: boolean;
}

const REPORT_REASONS: Array<{
  value: UgcReportReason;
  label: string;
  description: string;
}> = [
  {
    value: "SPAM",
    label: "Spam or Self-Promotion",
    description: "Irrelevant ads, repetitive posts, or commercial spam.",
  },
  {
    value: "HARASSMENT",
    label: "Harassment or Bullying",
    description: "Targeted insults, intimidation, or personal attacks.",
  },
  {
    value: "HATE_SPEECH",
    label: "Hate Speech or Discrimination",
    description: "Slurs or abusive remarks based on identity or background.",
  },
  {
    value: "INAPPROPRIATE",
    label: "Inappropriate Content",
    description:
      "Explicit, offensive, or unsafe university community material.",
  },
  {
    value: "ACADEMIC_MISCONDUCT",
    label: "Academic Misconduct",
    description: "Cheating material, leaked assessments, or exam dishonesty.",
  },
  {
    value: "OTHER",
    label: "Other Concern",
    description: "Any other issue moderators should review.",
  },
];

export const UgcReportModal = memo(function UgcReportModal({
  visible,
  targetType,
  targetTitle,
  onClose,
  onSubmit,
  isSubmitting = false,
}: UgcReportModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, 20) + 12;
  const [reason, setReason] = useState<UgcReportReason>("HARASSMENT");
  const [details, setDetails] = useState("");

  useEffect(() => {
    if (visible) {
      setReason("HARASSMENT");
      setDetails("");
    }
  }, [visible]);

  const handleConfirm = () => {
    if (isSubmitting) return;
    const cleanDetails = details.trim();
    onSubmit({
      reason,
      ...(cleanDetails ? { details: cleanDetails } : {}),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="slide"
      onRequestClose={() => !isSubmitting && onClose()}
    >
      <KeyboardAvoidingView behavior="padding" style={styles.overlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={() => !isSubmitting && onClose()}
          accessible={false}
        />

        <View
          style={[
            styles.sheet,
            {
              maxHeight: Math.round(windowHeight * 0.88),
              paddingBottom: bottomPadding,
            },
          ]}
        >
          <View style={styles.dragHandle} />

          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.dangerHalo}>
                <Feather name="flag" size={18} color={BENTO_COLORS.danger} />
              </View>
              <View>
                <Text style={styles.title}>
                  Report{" "}
                  {targetType === "FORUM_POST"
                    ? "Discussion"
                    : targetType === "LOST_FOUND_POST"
                      ? "Lost & Found Post"
                      : "Response"}
                </Text>
                {targetTitle ? (
                  <Text style={styles.targetPreview} numberOfLines={1}>
                    {targetTitle}
                  </Text>
                ) : null}
              </View>
            </View>

            <TouchableOpacity
              onPress={() => !isSubmitting && onClose()}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close report modal"
            >
              <Feather name="x" size={18} color={BENTO_COLORS.subtleText} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionLabel}>SELECT A REASON</Text>
            {REPORT_REASONS.map((option) => {
              const selected = reason === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.reasonRow,
                    selected && styles.reasonRowSelected,
                  ]}
                  onPress={() => setReason(option.value)}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selected && styles.radioOuterSelected,
                    ]}
                  >
                    {selected && <View style={styles.radioInner} />}
                  </View>
                  <View style={styles.reasonTextCol}>
                    <Text
                      style={[
                        styles.reasonLabel,
                        selected && styles.reasonLabelSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.reasonDesc}>{option.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}

            <Text style={[styles.sectionLabel, { marginTop: 8 }]}>
              ADDITIONAL DETAILS (OPTIONAL)
            </Text>
            <TextInput
              style={styles.detailsInput}
              placeholder="Provide any context for moderators..."
              placeholderTextColor={BENTO_COLORS.subtleText}
              value={details}
              onChangeText={setDetails}
              multiline={true}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.privacyHint}>
              Submitting a report immediately hides this content from your view
              and queues it for moderator review.
            </Text>
          </ScrollView>

          <View style={styles.footerRow}>
            <Pressable
              style={({ pressed }) => [
                styles.cancelBtn,
                pressed && Platform.OS === "ios" && { opacity: 0.75 },
              ]}
              android_ripple={{ color: colors.navyAlpha08 }}
              onPress={onClose}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              accessibilityLabel="Cancel report"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                isSubmitting && styles.submitBtnDisabled,
                pressed && Platform.OS === "ios" && { opacity: 0.8 },
              ]}
              android_ripple={{ color: colors.whiteAlpha20 }}
              onPress={handleConfirm}
              disabled={isSubmitting}
              accessible={true}
              accessibilityRole="button"
              accessibilityState={{ disabled: isSubmitting }}
              accessibilityLabel="Submit Report"
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Report</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 10,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.heroShadow,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.slate200,
    alignSelf: "center",
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  dangerHalo: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: BENTO_COLORS.dangerBg,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  targetPreview: {
    fontFamily,
    fontSize: 11,
    color: BENTO_COLORS.subtleText,
    maxWidth: 230,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO_COLORS.slateBg,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    flexShrink: 1,
    marginBottom: 14,
  },
  scrollContent: {
    gap: 8,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 11,
    fontWeight: "700",
    color: BENTO_COLORS.subtleText,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
    backgroundColor: BENTO_COLORS.slateBg,
  },
  reasonRowSelected: {
    backgroundColor: colors.semantic.rose.tint,
    borderColor: colors.semantic.rose.border,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.slate400,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: BENTO_COLORS.danger,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BENTO_COLORS.danger,
  },
  reasonTextCol: {
    flex: 1,
  },
  reasonLabel: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
  },
  reasonLabelSelected: {
    color: BENTO_COLORS.danger,
  },
  reasonDesc: {
    fontFamily,
    fontSize: 11.5,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  detailsInput: {
    minHeight: 74,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.slate300,
    backgroundColor: colors.slate50,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily,
    fontSize: 13,
    color: BENTO_COLORS.neutralText,
  },
  privacyHint: {
    fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.slateBg,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    includeFontPadding: false,
  },
  submitBtn: {
    flex: 1.4,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.danger,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.white,
    includeFontPadding: false,
  },
});
