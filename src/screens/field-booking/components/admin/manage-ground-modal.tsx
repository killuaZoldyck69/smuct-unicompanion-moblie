import React, { useState, useEffect, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  TextInput,
  ScrollView,
  Platform,
  ActivityIndicator,
  StatusBar,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BENTO } from "../../constants";
import type { FieldBookingSettings } from "@/services/field-service";

interface ManageGroundModalProps {
  visible: boolean;
  settings?: FieldBookingSettings | null;
  onClose: () => void;
  onSave: (payload: { isBookingOpen: boolean; closedNotice?: string | null }) => void;
  isSaving?: boolean;
}

const PRESET_NOTICES = [
  "🌱 Field maintenance & lawn recovery in progress.",
  "🏆 Ground reserved for Annual University Sports Fest.",
  "🌧️ Ground temporarily closed due to rain and wet field conditions.",
  "🎓 Closed for University Convocation & Graduation setup.",
  "🏛️ Campus sports grounds closed for official university holiday.",
];

export const ManageGroundModal = memo(function ManageGroundModal({
  visible,
  settings,
  onClose,
  onSave,
  isSaving = false,
}: ManageGroundModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  // Explicit, responsive bounded height so the scrollable middle never collapses
  const modalHeight = Math.min(
    Math.max(Math.round(windowHeight * 0.78), 480),
    630,
  );

  const [isOpen, setIsOpen] = useState(true);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (visible && settings) {
      setIsOpen(settings.isBookingOpen ?? true);
      const existingNotice =
        (settings as any)?.closedNotice ||
        settings?.closureReason ||
        "";
      setNotice(existingNotice);
    }
  }, [visible, settings]);

  const handleSave = () => {
    onSave({
      isBookingOpen: isOpen,
      closedNotice: notice.trim() ? notice.trim() : null,
    });
  };

  const handleApplyPreset = (presetText: string) => {
    setNotice(presetText);
    setIsOpen(false); // Applying a closure preset intuitively sets ground to closed
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={isSaving ? undefined : onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardWrap}
      >
        <View
          style={[
            styles.overlay,
            {
              paddingTop: Math.max(insets.top + 12, 20),
              paddingBottom: Math.max(insets.bottom + 12, 20),
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={isSaving ? undefined : onClose}
            accessible={false}
          />

          <View style={[styles.modalCard, { height: modalHeight }]}>
            {/* Top Close Button (Fixed Top-Right) */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={isSaving}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close ground settings"
            >
              <Feather name="x" size={17} color={BENTO.navy} />
            </TouchableOpacity>

            {/* 1. FIXED HEADER: Title, Subtitle */}
            <View style={styles.fixedHeader}>
              <Text style={styles.titleText}>Manage Ground Status</Text>
              <Text style={styles.subtitleText} numberOfLines={2}>
                Control university field reservation availability & notices.
              </Text>
            </View>

            {/* 2. SCROLLABLE MIDDLE: Status Toggle, Notice Input, Quick Presets */}
            <ScrollView
              style={styles.scrollArea}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={styles.scrollBody}
              nestedScrollEnabled={true}
              keyboardShouldPersistTaps="handled"
              bounces={true}
            >
              {/* Status Toggle Card */}
              <View
                style={[
                  styles.statusCard,
                  !isOpen && styles.statusCardClosed,
                ]}
              >
                <View style={styles.statusCardLeft}>
                  <View
                    style={[
                      styles.indicatorDot,
                      {
                        backgroundColor: isOpen
                          ? BENTO.emerald
                          : BENTO.rose,
                      },
                    ]}
                  />
                  <View style={styles.statusTextWrap}>
                    <Text
                      style={[
                        styles.statusMainLabel,
                        {
                          color: isOpen
                            ? BENTO.emerald
                            : BENTO.rose,
                        },
                      ]}
                    >
                      {isOpen ? "GROUND IS OPEN" : "GROUND IS CLOSED"}
                    </Text>
                    <Text style={styles.statusSubLabel}>
                      {isOpen
                        ? "Students & faculty can request slots"
                        : "New reservations are currently paused"}
                    </Text>
                  </View>
                </View>

                <Switch
                  value={isOpen}
                  onValueChange={setIsOpen}
                  trackColor={{ false: "#fecdd3", true: "#a7f3d0" }}
                  thumbColor={isOpen ? BENTO.emerald : BENTO.rose}
                  disabled={isSaving}
                />
              </View>

              {/* Closure Notice & Message Area */}
              <View style={styles.inputSection}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputLabel}>
                    Closure Notice / Reason
                  </Text>
                  <Text style={styles.optionalBadge}>
                    {isOpen ? "Optional Note" : "Broadcasted to Users"}
                  </Text>
                </View>

                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  value={notice}
                  onChangeText={setNotice}
                  placeholder="e.g. Ground closed for annual lawn maintenance and sports setup."
                  placeholderTextColor={BENTO.slateLight}
                  editable={!isSaving}
                  textAlignVertical="top"
                />

                {/* Quick Presets */}
                <Text style={styles.presetsLabel}>Quick Notice Presets</Text>
                <View style={styles.presetsWrap}>
                  {PRESET_NOTICES.map((preset, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.presetChip}
                      onPress={() => handleApplyPreset(preset)}
                      activeOpacity={0.7}
                      disabled={isSaving}
                    >
                      <Text style={styles.presetChipText} numberOfLines={1}>
                        {preset}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* 3. FIXED FOOTER: Cancel and Save Action Buttons */}
            <View style={styles.fixedFooter}>
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isSaving}
                  activeOpacity={0.8}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel ground settings"
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Save ground settings"
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Feather
                        name="check"
                        size={15}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.saveBtnText}>Save Settings</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
});

const styles = StyleSheet.create({
  keyboardWrap: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: BENTO.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    overflow: "hidden",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    ...Platform.select({
      web: {
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.2)",
      } as any,
      default: {
        shadowColor: "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 8,
      },
    }),
  },
  closeBtn: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  fixedHeader: {
    alignItems: "center",
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: BENTO.card,
  },
  titleText: {
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: "center",
    paddingHorizontal: 28,
  },
  subtitleText: {
    fontSize: 12,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 16,
    maxWidth: 290,
  },
  scrollArea: {
    flex: 1,
  },
  scrollBody: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BENTO.emeraldBg,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: BENTO.emeraldBorder,
    marginBottom: 14,
  },
  statusCardClosed: {
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
  },
  statusCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  indicatorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusTextWrap: {
    flex: 1,
  },
  statusMainLabel: {
    fontSize: 12.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  statusSubLabel: {
    fontSize: 11,
    color: BENTO.slate,
    fontWeight: "500",
  },
  inputSection: {
    backgroundColor: BENTO.canvas,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 6,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: BENTO.navy,
  },
  optionalBadge: {
    fontSize: 10.5,
    fontWeight: "600",
    color: BENTO.slate,
  },
  textInput: {
    backgroundColor: BENTO.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: BENTO.navy,
    minHeight: 70,
    marginBottom: 12,
  },
  presetsLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: BENTO.slate,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  presetsWrap: {
    gap: 6,
  },
  presetChip: {
    backgroundColor: BENTO.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  presetChipText: {
    fontSize: 11.5,
    color: BENTO.navySecondary,
    fontWeight: "500",
  },
  fixedFooter: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.05)",
    backgroundColor: BENTO.card,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: BENTO.slateSubtle,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navySecondary,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: BENTO.navy,
    paddingVertical: 11,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  saveBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
