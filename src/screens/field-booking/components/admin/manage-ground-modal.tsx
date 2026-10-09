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

          <View style={styles.modalCard}>
            {/* Top Close Button */}
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              disabled={isSaving}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close ground settings"
            >
              <Feather name="x" size={18} color={BENTO.navy} />
            </TouchableOpacity>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollBody}
            >
              {/* Header */}
              <View style={styles.headerBox}>
                <View style={styles.iconCircle}>
                  <Feather name="sliders" size={20} color={BENTO.navy} />
                </View>
                <Text style={styles.titleText}>Manage Ground Status</Text>
                <Text style={styles.subtitleText}>
                  Control university field reservation availability and broadcast notices.
                </Text>
              </View>

              {/* Status Toggle Card */}
              <View style={[styles.statusCard, !isOpen && styles.statusCardClosed]}>
                <View style={styles.statusCardLeft}>
                  <View
                    style={[
                      styles.indicatorDot,
                      { backgroundColor: isOpen ? BENTO.emerald : BENTO.rose },
                    ]}
                  />
                  <View style={styles.statusTextWrap}>
                    <Text
                      style={[
                        styles.statusMainLabel,
                        { color: isOpen ? BENTO.emerald : BENTO.rose },
                      ]}
                    >
                      {isOpen ? "GROUND IS OPEN" : "GROUND IS CLOSED"}
                    </Text>
                    <Text style={styles.statusSubLabel}>
                      {isOpen
                        ? "Students & staff can request reservations"
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
                    {isOpen ? "Optional Note" : "Displayed to Users"}
                  </Text>
                </View>

                <TextInput
                  style={styles.textInput}
                  multiline
                  numberOfLines={3}
                  value={notice}
                  onChangeText={setNotice}
                  placeholder="e.g. Campus ground closed for maintenance and annual sports tournament relawning."
                  placeholderTextColor={BENTO.slateLight}
                  editable={!isSaving}
                  textAlignVertical="top"
                />

                {/* Quick Presets */}
                <Text style={styles.presetsLabel}>Quick Presets</Text>
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

              {/* Action Buttons */}
              <View style={styles.btnRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.85}
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
            </ScrollView>
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
    maxHeight: "92%",
    backgroundColor: BENTO.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    overflow: "hidden",
    position: "relative",
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
    top: 16,
    right: 16,
    zIndex: 10,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollBody: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  headerBox: {
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
    marginBottom: 4,
    textAlign: "center",
  },
  subtitleText: {
    fontSize: 12.5,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 290,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: BENTO.emeraldBg,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: BENTO.emeraldBorder,
    marginBottom: 16,
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
    fontSize: 13,
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
    marginBottom: 20,
  },
  inputHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 12.5,
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
    minHeight: 74,
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
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: BENTO.border,
  },
  presetChipText: {
    fontSize: 11.5,
    color: BENTO.navySecondary,
    fontWeight: "500",
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: BENTO.slateSubtle,
    paddingVertical: 12,
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
    paddingVertical: 12,
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
