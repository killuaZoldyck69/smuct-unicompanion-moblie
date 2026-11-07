import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialItem } from "./types";
import { fontFamily, titleFontFamily } from "@/theme/typography";

export interface DeleteMaterialModalProps {
  isVisible: boolean;
  item: MaterialItem | null;
  isDeleting?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
}

export const DeleteMaterialModal: React.FC<DeleteMaterialModalProps> = React.memo(
  ({ isVisible, item, isDeleting = false, onClose, onConfirm }) => {
    const insets = useSafeAreaInsets();

    if (!item) return null;

    const attachmentsCount = Array.isArray(item.attachments)
      ? item.attachments.length
      : 0;
    const linksCount = Array.isArray(item.links) ? item.links.length : 0;
    const totalFiles = attachmentsCount + (item.driveUrl && item.driveUrl !== "https://drive.google.com" ? 1 : 0);

    return (
      <Modal
        visible={isVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={isDeleting ? undefined : onClose}
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
          {/* Backdrop dismiss */}
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={isDeleting ? undefined : onClose}
            accessible={false}
          />

          {/* Centered Modal Card */}
          <View style={styles.modalContent}>
            <View style={styles.container}>
              {/* Visual Danger Halo Icon */}
              <View style={styles.haloOuter}>
                <View style={styles.haloInner}>
                  <Feather name="trash-2" size={24} color="#dc2626" />
                </View>
              </View>

              {/* Status Pill Badge */}
              <View style={styles.pillBadge}>
                <Text style={styles.pillBadgeText}>PERMANENT REMOVAL</Text>
              </View>

              {/* Title */}
              <Text style={styles.titleText}>Delete Material?</Text>

              {/* Material Context Preview Box */}
              <View style={styles.contextBox}>
                <Text style={styles.contextTitle} numberOfLines={2}>
                  {item.title}
                </Text>

                <View style={styles.chipsRow}>
                  {/* Type Badge */}
                  <View
                    style={[
                      styles.metaChip,
                      item.isStudentNote ? styles.chipStudentNote : styles.chipOfficial,
                    ]}
                  >
                    <Feather
                      name={item.isStudentNote ? "book-open" : "award"}
                      size={11}
                      color={item.isStudentNote ? "#b45309" : "#1d4ed8"}
                      style={{ marginRight: 4 }}
                    />
                    <Text
                      style={[
                        styles.metaChipText,
                        { color: item.isStudentNote ? "#92400e" : "#1e40af" },
                      ]}
                    >
                      {item.isStudentNote ? "Student Resource" : "Course Material"}
                    </Text>
                  </View>

                  {/* Category Chip */}
                  {item.category ? (
                    <View style={styles.metaChip}>
                      <Feather
                        name="tag"
                        size={11}
                        color="#64748b"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.metaChipText}>{item.category}</Text>
                    </View>
                  ) : null}

                  {/* Attachments Count Chip */}
                  {totalFiles > 0 && (
                    <View style={styles.metaChip}>
                      <Feather
                        name="paperclip"
                        size={11}
                        color="#64748b"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.metaChipText}>
                        {totalFiles} file{totalFiles > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}

                  {/* Links Count Chip */}
                  {linksCount > 0 && (
                    <View style={styles.metaChip}>
                      <Feather
                        name="link-2"
                        size={11}
                        color="#64748b"
                        style={{ marginRight: 4 }}
                      />
                      <Text style={styles.metaChipText}>
                        {linksCount} link{linksCount > 1 ? "s" : ""}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Explanatory Message */}
              <Text style={styles.messageText}>
                This material and its attached files will be permanently deleted from this course hub. Students and enrolled members will no longer have access. This cannot be undone.
              </Text>

              {/* Action Buttons Row */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  disabled={isDeleting}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Cancel material deletion"
                >
                  <Text style={styles.cancelBtnText}>Keep Material</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.confirmBtn,
                    isDeleting && styles.confirmBtnDisabled,
                  ]}
                  onPress={onConfirm}
                  disabled={isDeleting}
                  activeOpacity={0.85}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Confirm permanent deletion"
                >
                  {isDeleting ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Feather
                      name="trash-2"
                      size={15}
                      color="#ffffff"
                      style={{ marginRight: 6 }}
                    />
                  )}
                  <Text style={styles.confirmBtnText}>
                    {isDeleting ? "Deleting..." : "Delete"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(15, 23, 42, 0.08)",
    maxWidth: 360,
    width: "100%",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 10,
    overflow: "hidden",
  },
  container: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 20,
    alignItems: "center",
  },
  haloOuter: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    justifyContent: "center",
    alignItems: "center",
  },
  haloInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
  },
  pillBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 9999,
    marginTop: 12,
    marginBottom: 8,
  },
  pillBadgeText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: "#991b1b",
    letterSpacing: 0.8,
  },
  titleText: {
    fontFamily,
    fontSize: 18.5,
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: -0.4,
    marginBottom: 12,
    textAlign: "center",
  },
  contextBox: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  contextTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: 19,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  chipOfficial: {
    backgroundColor: "#eff6ff",
  },
  chipStudentNote: {
    backgroundColor: "#fef3c7",
  },
  metaChipText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },
  messageText: {
    fontFamily,
    fontSize: 12.5,
    lineHeight: 18,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#475569",
  },
  confirmBtn: {
    flex: 1,
    height: 44,
    borderRadius: 13,
    backgroundColor: "#dc2626",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmBtnDisabled: {
    opacity: 0.65,
  },
  confirmBtnText: {
    fontFamily,
    fontSize: 13.5,
    fontWeight: "700",
    color: "#ffffff",
  },
});

