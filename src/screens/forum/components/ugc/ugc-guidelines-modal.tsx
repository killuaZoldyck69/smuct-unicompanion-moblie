import React, { memo, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  BackHandler,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/colors";
import { BENTO_COLORS, fontFamily, titleFontFamily } from "../../constants";

interface UgcGuidelinesModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  isSubmitting?: boolean;
  isOffline?: boolean;
  renderInline?: boolean;
}

const GUIDELINES = [
  {
    icon: "shield" as const,
    title: "Respectful Academic Discourse",
    body: "Zero tolerance for harassment, hate speech, personal attacks, bullying, or discriminatory remarks against students or faculty.",
  },
  {
    icon: "check-circle" as const,
    title: "Academic Integrity",
    body: "Ask for explanations and guidance rather than sharing leaked exams, plagiarism, or facilitating academic misconduct.",
  },
  {
    icon: "flag" as const,
    title: "Reporting & Moderation Controls",
    body: "Flagging a post or reply hides it immediately from your feed and queues it for administrator review.",
  },
];

export const UgcGuidelinesModal = memo(function UgcGuidelinesModal({
  visible,
  onClose,
  onAccept,
  isSubmitting = false,
  isOffline = false,
  renderInline = false,
}: UgcGuidelinesModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const bottomPadding = Math.max(insets.bottom, 20) + 12;

  useEffect(() => {
    if (!renderInline || !visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (!isSubmitting) onClose();
      return true;
    });
    return () => sub.remove();
  }, [renderInline, visible, isSubmitting, onClose]);

  const modalBody = (
    <View style={[styles.overlay, renderInline && styles.inlineOverlay]}>
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
            maxHeight: Math.round(windowHeight * 0.86),
            paddingBottom: bottomPadding,
          },
        ]}
      >
        <View style={styles.dragHandle} />

        <View style={styles.header}>
          <View style={styles.iconHalo}>
            <Feather
              name="file-text"
              size={22}
              color={BENTO_COLORS.primaryBlue}
            />
          </View>
          <View style={styles.headerTextCol}>
            <Text style={styles.title}>Community Guidelines</Text>
            <Text style={styles.subtitle}>
              Required before posting or replying in Campus Hub
            </Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollBody}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {GUIDELINES.map((item) => (
            <View key={item.title} style={styles.ruleCard}>
              <View style={styles.ruleIconBox}>
                <Feather
                  name={item.icon}
                  size={16}
                  color={BENTO_COLORS.primaryBlue}
                />
              </View>
              <View style={styles.ruleTextCol}>
                <Text style={styles.ruleTitle}>{item.title}</Text>
                <Text style={styles.ruleBody}>{item.body}</Text>
              </View>
            </View>
          ))}

          <Text style={styles.footerNote}>
            Violations may result in immediate content removal and account
            restriction by university administrators.
          </Text>
        </ScrollView>

        <View style={styles.actionsRow}>
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
            accessibilityLabel="Cancel guidelines"
          >
            <Text style={styles.cancelBtnText}>Not Now</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.acceptBtn,
              (isSubmitting || isOffline) && styles.acceptBtnDisabled,
              pressed && Platform.OS === "ios" && { opacity: 0.8 },
            ]}
            android_ripple={{ color: colors.whiteAlpha20 }}
            onPress={onAccept}
            disabled={isSubmitting || isOffline}
            accessible={true}
            accessibilityRole="button"
            accessibilityState={{ disabled: isSubmitting || isOffline }}
            accessibilityLabel="Accept Community Guidelines"
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.acceptBtnText}>Agree & Continue</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );

  if (renderInline) {
    return visible ? modalBody : null;
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      statusBarTranslucent={true}
      animationType="slide"
      onRequestClose={() => !isSubmitting && onClose()}
    >
      {modalBody}
    </Modal>
  );
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.scrimDark,
    justifyContent: "flex-end",
  },
  inlineOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 200,
    elevation: 6,
  },
  sheet: {
    backgroundColor: BENTO_COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: BENTO_COLORS.subtleBorder,
    ...BENTO_COLORS.heroShadow,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.slate300,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },
  iconHalo: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.semantic.blue.alpha08,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextCol: {
    flex: 1,
  },
  title: {
    fontFamily: titleFontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO_COLORS.deepNavy,
  },
  subtitle: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO_COLORS.subtleText,
    marginTop: 2,
  },
  scrollBody: {
    flexShrink: 1,
    marginBottom: 16,
  },
  scrollContent: {
    gap: 10,
  },
  ruleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: BENTO_COLORS.slateBg,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: BENTO_COLORS.subtleBorder,
  },
  ruleIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: BENTO_COLORS.white,
    alignItems: "center",
    justifyContent: "center",
  },
  ruleTextCol: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    marginBottom: 2,
  },
  ruleBody: {
    fontFamily,
    fontSize: 12,
    lineHeight: 17,
    color: colors.slate600,
  },
  footerNote: {
    fontFamily,
    fontSize: 11,
    lineHeight: 16,
    color: BENTO_COLORS.subtleText,
    textAlign: "center",
    marginTop: 4,
  },
  actionsRow: {
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
    fontSize: 14,
    fontWeight: "700",
    color: BENTO_COLORS.deepNavy,
    includeFontPadding: false,
  },
  acceptBtn: {
    flex: 1.5,
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: BENTO_COLORS.primaryBlue,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  acceptBtnDisabled: {
    opacity: 0.55,
  },
  acceptBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
