import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  mintSoft: "#f0fdf4",
  mintBorder: "#bbf7d0",
  mintText: "#15803d",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  roseSoft: "#fff1f2",
  roseBorder: "#fecdd3",
  roseText: "#e11d48",
};

const fontFamily = Platform.select({
  ios: "Plus Jakarta Sans",
  android: "sans-serif",
  web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  default: "sans-serif",
});

interface Props {
  isVisible: boolean;
  onClose: () => void;
  currentMeetUrl?: string | null;
  courseName?: string;
  onSave: (meetUrl: string | null) => Promise<void> | void;
  isPending?: boolean;
}

export default function EditClassLinkModal({
  isVisible,
  onClose,
  currentMeetUrl,
  courseName,
  onSave,
  isPending = false,
}: Props) {
  const insets = useSafeAreaInsets();
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (isVisible) {
      setUrl(currentMeetUrl || "");
    }
  }, [isVisible, currentMeetUrl]);

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        setUrl(text.trim());
        Toast.show({ type: "info", text1: "Pasted from clipboard" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Could not paste from clipboard" });
    }
  };

  const handleClear = () => {
    setUrl("");
  };

  const handleTestLink = () => {
    if (!url.trim()) return;
    const target =
      url.trim().startsWith("http://") || url.trim().startsWith("https://")
        ? url.trim()
        : `https://${url.trim()}`;

    Linking.openURL(target).catch(() => {
      Toast.show({
        type: "error",
        text1: "Invalid URL",
        text2: "Unable to open the link. Please verify the URL.",
      });
    });
  };

  const handleSave = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      onSave(null);
      return;
    }

    const formatted =
      trimmed.startsWith("http://") || trimmed.startsWith("https://")
        ? trimmed
        : `https://${trimmed}`;

    onSave(formatted);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View
        style={[
          styles.overlay,
          {
            paddingTop: Math.max(insets.top + 16, 24),
            paddingBottom: Math.max(insets.bottom + 16, 24),
            paddingLeft: Math.max(insets.left + 16, 16),
            paddingRight: Math.max(insets.right + 16, 16),
          },
        ]}
        accessibilityViewIsModal={true}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={isPending ? undefined : onClose}
          accessible={false}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.headerLeftCol}>
                <Text style={styles.headerSubtitle}>ONLINE CLASSROOM</Text>
                <Text style={styles.headerTitle}>Edit Class Link</Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                disabled={isPending}
                style={styles.closeBtn}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Close modal"
              >
                <Feather name="x" size={18} color={BENTO.slate} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <View style={styles.body}>
              {/* Info Banner */}
              <View style={styles.infoBanner}>
                <View style={styles.infoIconBox}>
                  <Feather name="video" size={18} color={BENTO.mintText} />
                </View>
                <View style={styles.infoTextBox}>
                  <Text style={styles.infoTitle}>
                    {courseName || "Course"} Lecture Room
                  </Text>
                  <Text style={styles.infoDesc}>
                    Students will be able to 1-tap join Google Meet, Zoom, or Teams
                    from the course header.
                  </Text>
                </View>
              </View>

              {/* URL Input */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>MEETING / CLASSROOM URL</Text>
                <View style={styles.inputContainer}>
                  <Feather
                    name="link"
                    size={16}
                    color={BENTO.slate}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.textInput}
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://meet.google.com/abc-defg-hij"
                    placeholderTextColor={BENTO.slateLight}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    editable={!isPending}
                    accessible={true}
                    accessibilityLabel="Online class link input"
                  />
                  {url.length > 0 ? (
                    <TouchableOpacity
                      onPress={handleClear}
                      style={styles.inputActionBtn}
                      activeOpacity={0.7}
                    >
                      <Feather name="x-circle" size={16} color={BENTO.slate} />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      onPress={handlePaste}
                      style={styles.pasteBadge}
                      activeOpacity={0.7}
                    >
                      <Feather name="clipboard" size={11} color={BENTO.blueText} />
                      <Text style={styles.pasteText}>Paste</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Quick Action Helpers */}
              {url.trim().length > 0 && (
                <View style={styles.helpersRow}>
                  <TouchableOpacity
                    style={styles.helperBtn}
                    onPress={handleTestLink}
                    activeOpacity={0.7}
                  >
                    <Feather name="external-link" size={12} color={BENTO.blueText} />
                    <Text style={styles.helperText}>Test Link</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.helperBtn}
                    onPress={handleClear}
                    activeOpacity={0.7}
                  >
                    <Feather name="trash-2" size={12} color={BENTO.roseText} />
                    <Text style={[styles.helperText, { color: BENTO.roseText }]}>
                      Clear Link
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isPending}
                  activeOpacity={0.75}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.saveBtn,
                    isPending && { opacity: 0.7 },
                  ]}
                  onPress={handleSave}
                  disabled={isPending}
                  activeOpacity={0.85}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <>
                      <Feather
                        name="check"
                        size={15}
                        color="#ffffff"
                        style={{ marginRight: 6 }}
                      />
                      <Text style={styles.saveBtnText}>Save Link</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardWrap: {
    width: "100%",
    maxWidth: 420,
  },
  modalContent: {
    backgroundColor: BENTO.card,
    borderRadius: 24,
    width: "100%",
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.border,
  },
  headerLeftCol: {
    flex: 1,
  },
  headerSubtitle: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.canvas,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.mintSoft,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
    borderRadius: 16,
    padding: 12,
    marginBottom: 18,
    gap: 12,
  },
  infoIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoTextBox: {
    flex: 1,
  },
  infoTitle: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 2,
  },
  infoDesc: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 16,
  },
  inputSection: {
    marginBottom: 12,
  },
  inputLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderWidth: 1,
    borderColor: BENTO.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontFamily,
    fontSize: 13,
    color: BENTO.navy,
    paddingVertical: 0,
  },
  inputActionBtn: {
    padding: 4,
  },
  pasteBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.blueSoft,
    borderWidth: 1,
    borderColor: BENTO.blueBorder,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  pasteText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.blueText,
  },
  helpersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  helperBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  helperText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: BENTO.blueText,
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.canvas,
    borderWidth: 1,
    borderColor: BENTO.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.slate,
  },
  saveBtn: {
    flex: 1.4,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.navy,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
