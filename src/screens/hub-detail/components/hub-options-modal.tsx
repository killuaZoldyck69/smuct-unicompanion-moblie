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
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";

const BENTO = {
  canvas: "#f8fafc",
  card: "#ffffff",
  navy: "#131b2e",
  slate: "#475569",
  slateMuted: "#64748b",
  border: "rgba(19, 27, 46, 0.08)",
  borderSubtle: "rgba(19, 27, 46, 0.05)",
  neutralSoft: "#f1f5f9",
  pillRadius: 9999,
  cardRadius: 16,

  // Campus Bento Accent Tints
  blueSoft: "#eff6ff",
  blueIcon: "#2563eb",
  purpleSoft: "#f5f3ff",
  purpleIcon: "#7c3aed",
  amberSoft: "#fffbeb",
  amberIcon: "#d97706",
  roseSoft: "#fff5f5",
  roseIconBg: "#fee2e2",
  roseBorder: "rgba(225, 29, 72, 0.16)",
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
  const insets = useSafeAreaInsets();

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
        { text: "Archive Hub", style: "default", onPress: onArchiveHub },
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
        {/* Backdrop tap to close */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={styles.headerLeftGroup}>
              <View style={styles.pillTag}>
                <Text style={styles.pillTagText}>COURSE HUB</Text>
              </View>
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
              <Feather name="x" size={16} color={BENTO.slateMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Section 1: Actions & Navigation Bento Tiles */}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>ACTIONS & NAVIGATION</Text>

              <View style={styles.bentoStack}>
                {/* 1. See Members */}
                <TouchableOpacity
                  style={styles.bentoTile}
                  onPress={onViewMembers}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="See All Members"
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: BENTO.blueSoft },
                    ]}
                  >
                    <Feather name="users" size={17} color={BENTO.blueIcon} />
                  </View>
                  <Text style={styles.tileTitle}>See All Members</Text>
                </TouchableOpacity>

                {/* 2. Edit Hub Info */}
                {canManage && (
                  <TouchableOpacity
                    style={styles.bentoTile}
                    onPress={onEditHub}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Update Course Hub Info"
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: BENTO.purpleSoft },
                      ]}
                    >
                      <Feather
                        name="edit-3"
                        size={17}
                        color={BENTO.purpleIcon}
                      />
                    </View>
                    <Text style={styles.tileTitle}>Update Course Hub Info</Text>
                  </TouchableOpacity>
                )}

                {/* 3. Archive Hub */}
                {canManage && (
                  <TouchableOpacity
                    style={styles.bentoTile}
                    onPress={handleArchive}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Archive Course Hub"
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: BENTO.amberSoft },
                      ]}
                    >
                      <Feather
                        name="archive"
                        size={17}
                        color={BENTO.amberIcon}
                      />
                    </View>
                    <Text style={styles.tileTitle}>Archive Course Hub</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Section 2: Danger Zone Bento Tiles */}
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionLabel, styles.dangerSectionLabel]}>
                DANGER ZONE
              </Text>

              <View style={styles.bentoStack}>
                {/* Leave Hub */}
                <TouchableOpacity
                  style={[styles.bentoTile, styles.dangerBentoTile]}
                  onPress={handleLeave}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Leave Hub"
                >
                  <View
                    style={[
                      styles.iconBox,
                      { backgroundColor: BENTO.roseIconBg },
                    ]}
                  >
                    <Feather
                      name="log-out"
                      size={17}
                      color={BENTO.roseText}
                    />
                  </View>
                  <Text style={[styles.tileTitle, styles.dangerTileTitle]}>
                    Leave Course Hub
                  </Text>
                </TouchableOpacity>

                {/* Delete Hub (Only Lead Teacher / Manager) */}
                {canDelete && (
                  <TouchableOpacity
                    style={[styles.bentoTile, styles.dangerBentoTile]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Delete Course Hub"
                  >
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: BENTO.roseIconBg },
                      ]}
                    >
                      <Feather
                        name="trash-2"
                        size={17}
                        color={BENTO.roseText}
                      />
                    </View>
                    <Text style={[styles.tileTitle, styles.dangerTileTitle]}>
                      Delete Course Hub
                    </Text>
                  </TouchableOpacity>
                )}
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
    backgroundColor: "rgba(19, 27, 46, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: BENTO.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: BENTO.border,
    maxWidth: 400,
    width: "100%",
    maxHeight: "88%",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 8,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: BENTO.borderSubtle,
    backgroundColor: "#ffffff",
  },
  headerLeftGroup: {
    flex: 1,
  },
  pillTag: {
    alignSelf: "flex-start",
    backgroundColor: BENTO.neutralSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BENTO.pillRadius,
    marginBottom: 4,
  },
  pillTagText: {
    fontFamily,
    fontSize: 9,
    fontWeight: "700",
    color: BENTO.slateMuted,
    letterSpacing: 0.7,
  },
  headerTitle: {
    fontFamily,
    fontSize: 17,
    fontWeight: "800",
    color: BENTO.navy,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  scrollBody: {
    padding: 16,
    paddingBottom: 18,
  },

  sectionBlock: {
    marginBottom: 14,
  },
  sectionLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
    color: BENTO.slateMuted,
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  dangerSectionLabel: {
    color: BENTO.roseText,
  },

  bentoStack: {
    gap: 8,
  },

  bentoTile: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.canvas,
    borderRadius: BENTO.cardRadius,
    borderWidth: 1,
    borderColor: BENTO.borderSubtle,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dangerBentoTile: {
    backgroundColor: BENTO.roseSoft,
    borderColor: BENTO.roseBorder,
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  tileTitle: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: BENTO.navy,
    letterSpacing: -0.1,
    flex: 1,
  },
  dangerTileTitle: {
    color: BENTO.roseText,
  },

  closeActionBtn: {
    backgroundColor: BENTO.neutralSoft,
    borderRadius: BENTO.pillRadius,
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

