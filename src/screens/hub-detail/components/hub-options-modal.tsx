import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#0f172a",
  slate: "#64748b",
  slateLight: "#94a3b8",
  border: "rgba(15, 23, 42, 0.08)",
  blueSoft: "#eff6ff",
  blueBorder: "#bfdbfe",
  blueText: "#1d4ed8",
  purpleSoft: "#faf5ff",
  purpleBorder: "#e9d5ff",
  purpleText: "#7e22ce",
  amberSoft: "#fffbeb",
  amberBorder: "#fde68a",
  amberText: "#b45309",
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
  canManage: boolean;
  isTeacher?: boolean;
  onEditHub: () => void;
  onArchiveHub: () => void;
  onDeleteHub: () => void;
  onLeaveHub: () => void;
  onViewMembers: () => void;
}

export default function HubOptionsModal({
  isVisible,
  onClose,
  canManage,
  isTeacher,
  onEditHub,
  onArchiveHub,
  onDeleteHub,
  onLeaveHub,
  onViewMembers,
}: Props) {
  // Show delete option only to lead teachers (or managers if isTeacher isn't explicitly passed)
  const canDelete = isTeacher !== undefined ? isTeacher : canManage;

  const handleArchive = () => {
    const title = "Archive Course Hub?";
    const message =
      "Archiving will lock new announcements and coursework submissions. The hub will remain read-only for future reference.";

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm(`${title}\n\n${message}`)) {
          onArchiveHub();
        }
      } else {
        onArchiveHub();
      }
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Archive", style: "default", onPress: onArchiveHub },
      ]);
    }
  };

  const handleDelete = () => {
    const title = "Delete Course Hub?";
    const message =
      "This will permanently erase this hub, including all discussions, announcements, and coursework submissions. This action cannot be undone.";

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm(`${title}\n\n${message}`)) {
          onDeleteHub();
        }
      } else {
        onDeleteHub();
      }
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Hub", style: "destructive", onPress: onDeleteHub },
      ]);
    }
  };

  const handleLeave = () => {
    const title = "Leave Course Hub?";
    const message =
      "Are you sure you want to leave this hub? You will need the course invite code to rejoin.";

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm(`${title}\n\n${message}`)) {
          onLeaveHub();
        }
      } else {
        onLeaveHub();
      }
    } else {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Leave Hub", style: "destructive", onPress: onLeaveHub },
      ]);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay} accessibilityViewIsModal={true}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.headerSubtitle}>COURSE HUB MENU</Text>
              <Text style={styles.headerTitle}>Hub Options</Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close Hub Options"
            >
              <Feather name="x" size={18} color={BENTO.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
          >
            {/* Section 1: Navigation & Management */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>ACTIONS & NAVIGATION</Text>

              <View style={styles.optionsList}>
                {/* 1. See Members */}
                <TouchableOpacity
                  style={styles.optionCard}
                  onPress={onViewMembers}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="See All Members"
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: BENTO.blueSoft },
                    ]}
                  >
                    <Feather name="users" size={16} color={BENTO.blueText} />
                  </View>
                  <View style={styles.optionTextCol}>
                    <Text style={styles.optionTitle}>See All Members</Text>
                    <Text style={styles.optionSubtitle}>
                      View students, faculty & class representatives
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={BENTO.slateLight}
                  />
                </TouchableOpacity>

                {/* 2. Edit Hub Info */}
                {canManage && (
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={onEditHub}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Update Course Hub Info"
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: BENTO.purpleSoft },
                      ]}
                    >
                      <Feather
                        name="edit-3"
                        size={16}
                        color={BENTO.purpleText}
                      />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>
                        Update Course Hub Info
                      </Text>
                      <Text style={styles.optionSubtitle}>
                        Edit routine, rooms, Google Meet link & cohort
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={BENTO.slateLight}
                    />
                  </TouchableOpacity>
                )}

                {/* 3. Archive Hub */}
                {canManage && (
                  <TouchableOpacity
                    style={styles.optionCard}
                    onPress={handleArchive}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Archive Course Hub"
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: BENTO.amberSoft },
                      ]}
                    >
                      <Feather
                        name="archive"
                        size={16}
                        color={BENTO.amberText}
                      />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={styles.optionTitle}>Archive Course Hub</Text>
                      <Text style={styles.optionSubtitle}>
                        Lock hub as read-only after term ends
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={BENTO.slateLight}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section 2: Danger Zone */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>DANGER ZONE</Text>

              <View style={styles.optionsList}>
                {/* Delete Hub (Only Lead Teacher / Manager) */}
                {canDelete && (
                  <TouchableOpacity
                    style={[styles.optionCard, styles.dangerCard]}
                    onPress={handleDelete}
                    activeOpacity={0.75}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Delete Course Hub"
                  >
                    <View
                      style={[
                        styles.iconCircle,
                        { backgroundColor: "#ffffff" },
                      ]}
                    >
                      <Feather
                        name="trash-2"
                        size={16}
                        color={BENTO.roseText}
                      />
                    </View>
                    <View style={styles.optionTextCol}>
                      <Text style={[styles.optionTitle, { color: BENTO.roseText }]}>
                        Delete Course Hub
                      </Text>
                      <Text style={styles.dangerSubtitle}>
                        Permanently destroy this hub and all student submissions
                      </Text>
                    </View>
                    <Feather
                      name="chevron-right"
                      size={16}
                      color={BENTO.roseText}
                    />
                  </TouchableOpacity>
                )}

                {/* Leave Hub */}
                <TouchableOpacity
                  style={[styles.optionCard, styles.dangerCard]}
                  onPress={handleLeave}
                  activeOpacity={0.75}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Leave Hub"
                >
                  <View
                    style={[
                      styles.iconCircle,
                      { backgroundColor: "#ffffff" },
                    ]}
                  >
                    <Feather
                      name="log-out"
                      size={16}
                      color={BENTO.roseText}
                    />
                  </View>
                  <View style={styles.optionTextCol}>
                    <Text style={[styles.optionTitle, { color: BENTO.roseText }]}>
                      Leave Hub
                    </Text>
                    <Text style={styles.dangerSubtitle}>
                      Exit this course hub and revoke your membership
                    </Text>
                  </View>
                  <Feather
                    name="chevron-right"
                    size={16}
                    color={BENTO.roseText}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeActionBtn}
              onPress={onClose}
              activeOpacity={0.8}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close options"
            >
              <Text style={styles.closeActionBtnText}>Close</Text>
            </TouchableOpacity>
          </ScrollView>
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
    padding: 18,
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    maxWidth: 440,
    width: "100%",
    maxHeight: "88%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 8,
    overflow: "hidden",
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

  scrollBody: {
    padding: 18,
    paddingBottom: 22,
  },

  sectionBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "800",
    color: BENTO.slate,
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  optionsList: {
    gap: 8,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BENTO.border,
    padding: 12,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontFamily,
    fontSize: 11,
    color: BENTO.slate,
    lineHeight: 15,
  },

  dangerCard: {
    backgroundColor: BENTO.roseSoft,
    borderColor: BENTO.roseBorder,
  },
  dangerSubtitle: {
    fontFamily,
    fontSize: 11,
    color: "#9f1239",
    lineHeight: 14,
  },

  closeActionBtn: {
    backgroundColor: BENTO.canvas,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  closeActionBtnText: {
    fontFamily,
    fontSize: 13,
    fontWeight: "700",
    color: BENTO.slate,
  },
});
