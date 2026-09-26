import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const BENTO = {
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  redSoft: "#fef2f2",
  redBorder: "#fee2e2",
  redPrimary: "#dc2626",
  redHover: "#b91c1c",
  canvas: "#f8fafc",
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
  onConfirm: () => void;
  announcementContent?: string;
  isPending?: boolean;
}

export default function DeleteAnnouncementModal({
  isVisible,
  onClose,
  onConfirm,
  announcementContent,
  isPending = false,
}: Props) {
  const insets = useSafeAreaInsets();

  const previewSnippet =
    announcementContent && announcementContent.trim().length > 0
      ? announcementContent.trim().length > 120
        ? `${announcementContent.trim().substring(0, 120)}...`
        : announcementContent.trim()
      : null;

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
        <View style={styles.modalContent}>
          {/* Top Decorative Alert Icon */}
          <View style={styles.iconCircle}>
            <View style={styles.iconInnerCircle}>
              <Feather name="trash-2" size={22} color={BENTO.redPrimary} />
            </View>
          </View>

          {/* Title & Warning Subtitle */}
          <Text style={styles.titleText}>Delete Announcement?</Text>
          <Text style={styles.subtitleText}>
            Are you sure you want to delete this announcement? This action cannot be
            undone.
          </Text>

          {/* Optional Content Preview Snippet */}
          {previewSnippet && (
            <View style={styles.previewBox}>
              <View style={styles.previewHeader}>
                <Feather
                  name="file-text"
                  size={12}
                  color={BENTO.slate}
                  style={{ marginRight: 5 }}
                />
                <Text style={styles.previewLabel}>ANNOUNCEMENT PREVIEW</Text>
              </View>
              <Text style={styles.previewContent} numberOfLines={3}>
                "{previewSnippet}"
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isPending}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel announcement deletion"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.deleteBtn,
                isPending && { opacity: 0.75 },
              ]}
              onPress={onConfirm}
              disabled={isPending}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete announcement"
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Feather
                    name="trash-2"
                    size={14}
                    color="#ffffff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: BENTO.card,
    borderRadius: 24,
    width: "100%",
    maxWidth: 340,
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 28,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.06)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: BENTO.redSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BENTO.redBorder,
  },
  iconInnerCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO.redPrimary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 2,
  },
  titleText: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 16,
  },
  previewBox: {
    width: "100%",
    backgroundColor: BENTO.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    borderLeftWidth: 3.5,
    borderLeftColor: BENTO.redPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
  },
  previewHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  previewLabel: {
    fontFamily,
    fontSize: 9,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.6,
  },
  previewContent: {
    fontFamily,
    fontSize: 12,
    color: "#334155",
    lineHeight: 17,
    fontStyle: "italic",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
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
  deleteBtn: {
    flex: 1.2,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.redPrimary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: BENTO.redPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
});
