import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "@/theme/colors";
import {
  CAMPUS_HUB_COLORS,
  fontFamily,
  titleFontFamily,
} from "../../shared/design-tokens";

interface LostFoundModalHeaderProps {
  title: string;
  closeLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
}

export function LostFoundModalHeader({
  title,
  closeLabel,
  isSubmitting,
  onClose,
}: LostFoundModalHeaderProps) {
  return (
    <View style={styles.topHeader}>
      <View style={styles.topHeaderInner}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.hubBadge}>
            <Text style={styles.hubBadgeText} maxFontSizeMultiplier={1.25}>
              CAMPUS HUB
            </Text>
          </View>
        </View>

        <Pressable
          onPress={onClose}
          disabled={isSubmitting}
          style={({ pressed }) => [
            styles.circleBtn,
            isSubmitting && { opacity: 0.45 },
            pressed && !isSubmitting && { opacity: 0.75 },
          ]}
          android_ripple={{
            color: CAMPUS_HUB_COLORS.androidRipple,
            borderless: true,
          }}
          accessible
          accessibilityRole="button"
          accessibilityState={{ disabled: isSubmitting }}
          accessibilityLabel={closeLabel}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="x" size={18} color={CAMPUS_HUB_COLORS.deepNavy} />
        </Pressable>
      </View>
    </View>
  );
}

interface LostFoundModalFooterProps {
  label: string;
  accessibilityLabel: string;
  iconName: keyof typeof Feather.glyphMap;
  canSubmit: boolean;
  isSubmitting: boolean;
  paddingBottom: number;
  accentFillColor: string;
  onSubmit: () => void;
}

export function LostFoundModalFooter({
  label,
  accessibilityLabel,
  iconName,
  canSubmit,
  isSubmitting,
  paddingBottom,
  accentFillColor,
  onSubmit,
}: LostFoundModalFooterProps) {
  const isDisabled = !canSubmit || isSubmitting;

  return (
    <View style={[styles.modalFooter, { paddingBottom }]}>
      <View style={styles.modalFooterInner}>
        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: accentFillColor },
            isDisabled && styles.submitBtnDisabled,
            pressed && !isDisabled && { opacity: 0.88 },
          ]}
          onPress={onSubmit}
          disabled={isDisabled}
          android_ripple={{ color: CAMPUS_HUB_COLORS.androidRippleLight }}
          accessible
          accessibilityRole="button"
          accessibilityState={{ disabled: isDisabled, busy: isSubmitting }}
          accessibilityLabel={accessibilityLabel}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={CAMPUS_HUB_COLORS.white} />
          ) : (
            <>
              <Feather
                name={iconName}
                size={16}
                color={
                  !canSubmit && !isSubmitting
                    ? CAMPUS_HUB_COLORS.mutedInk
                    : CAMPUS_HUB_COLORS.white
                }
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.submitBtnText,
                  !canSubmit && !isSubmitting && styles.submitBtnTextDisabled,
                ]}
                maxFontSizeMultiplier={1.25}
              >
                {label}
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    borderBottomWidth: 1,
    borderBottomColor: CAMPUS_HUB_COLORS.cardBorder,
    backgroundColor: CAMPUS_HUB_COLORS.white,
  },
  topHeaderInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  headerTitleGroup: {
    flex: 1,
    alignItems: "flex-start",
    marginRight: 12,
  },
  headerTitle: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.deepNavy,
    letterSpacing: -0.3,
  },
  hubBadge: {
    backgroundColor: CAMPUS_HUB_COLORS.lostFoundAccentLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  hubBadgeText: {
    fontFamily,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.lostFoundAccentText,
    letterSpacing: 0.6,
    includeFontPadding: false,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.slate100,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modalFooter: {
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: CAMPUS_HUB_COLORS.white,
    borderTopWidth: 1,
    borderTopColor: CAMPUS_HUB_COLORS.cardBorder,
    ...CAMPUS_HUB_COLORS.footerShadow,
  },
  modalFooterInner: {
    width: "100%",
    maxWidth: CAMPUS_HUB_COLORS.contentMaxWidth,
    alignSelf: "center",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: CAMPUS_HUB_COLORS.pillRadius,
    overflow: "hidden",
    ...CAMPUS_HUB_COLORS.shadow,
  },
  submitBtnDisabled: {
    backgroundColor: colors.slate200,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitBtnText: {
    fontFamily,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "800",
    color: CAMPUS_HUB_COLORS.white,
    includeFontPadding: false,
  },
  submitBtnTextDisabled: {
    color: CAMPUS_HUB_COLORS.mutedInk,
  },
});
