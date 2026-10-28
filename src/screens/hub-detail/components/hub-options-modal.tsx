import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import HubConfirmView, { HubConfirmAction } from "./hub-confirm-view";

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
  isAdmin?: boolean;
  isArchived?: boolean;
  hubDetails?: any;
  isPending?: boolean;
  onEditHub: () => void;
  onArchiveHub: () => void | Promise<void>;
  onDeleteHub: () => void | Promise<void>;
  onLeaveHub: () => void | Promise<void>;
  onViewMembers: () => void;
}

export default function HubOptionsModal({
  isVisible,
  onClose,
  canManage,
  isTeacher,
  isAdmin = false,
  isArchived = false,
  hubDetails,
  isPending = false,
  onEditHub,
  onArchiveHub,
  onDeleteHub,
  onLeaveHub,
  onViewMembers,
}: Props) {
  const insets = useSafeAreaInsets();
  const [confirmAction, setConfirmAction] = useState<HubConfirmAction | null>(null);

  // Reset internal confirm state whenever modal opens or closes
  useEffect(() => {
    if (!isVisible) {
      setConfirmAction(null);
    }
  }, [isVisible]);

  // Allow archive and delete for managers and admins
  const canArchive = isAdmin || canManage;
  const canDelete = isAdmin || (isTeacher !== undefined ? isTeacher : canManage);

  const handleArchive = () => {
    setConfirmAction(isArchived ? "unarchive" : "archive");
  };

  const handleDelete = () => {
    setConfirmAction("delete");
  };

  const handleLeave = () => {
    setConfirmAction("leave");
  };

  const handleConfirmExecution = async () => {
    try {
      if (confirmAction === "archive" || confirmAction === "unarchive") {
        await onArchiveHub();
      } else if (confirmAction === "delete") {
        await onDeleteHub();
      } else if (confirmAction === "leave") {
        await onLeaveHub();
      }
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => {
        if (confirmAction) {
          setConfirmAction(null);
        } else {
          onClose();
        }
      }}
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
          onPress={() => {
            if (isPending) return;
            if (confirmAction) {
              setConfirmAction(null);
            } else {
              onClose();
            }
          }}
          accessible={false}
        />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            {confirmAction && (
              <TouchableOpacity
                onPress={() => setConfirmAction(null)}
                style={styles.backBtn}
                disabled={isPending}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Back to Options"
              >
                <Feather name="arrow-left" size={17} color={BENTO.navy} />
              </TouchableOpacity>
            )}

            <View style={styles.headerLeftGroup}>
              <View
                style={[
                  styles.pillTag,
                  confirmAction && {
                    backgroundColor:
                      confirmAction === "delete"
                        ? "#fee2e2"
                        : confirmAction === "unarchive"
                        ? "#dcfce7"
                        : "#fef3c7",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.pillTagText,
                    confirmAction && {
                      color:
                        confirmAction === "delete"
                          ? "#991b1b"
                          : confirmAction === "unarchive"
                          ? "#166534"
                          : "#92400e",
                    },
                  ]}
                >
                  {confirmAction ? "CONFIRM ACTION" : "COURSE HUB"}
                </Text>
              </View>
              <Text style={styles.headerTitle}>
                {confirmAction === "delete"
                  ? "Delete Hub"
                  : confirmAction === "leave"
                  ? "Leave Hub"
                  : confirmAction === "unarchive"
                  ? "Restore Hub"
                  : confirmAction === "archive"
                  ? "Archive Hub"
                  : "Hub Options"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              disabled={isPending}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Feather name="x" size={16} color={BENTO.slateMuted} />
            </TouchableOpacity>
          </View>

          {/* Body Content */}
          {confirmAction ? (
            <HubConfirmView
              action={confirmAction}
              hubDetails={hubDetails}
              isPending={isPending}
              onCancel={() => setConfirmAction(null)}
              onConfirm={handleConfirmExecution}
            />
          ) : (
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

                  {/* Admin Audit Mode Banner */}
                  {isAdmin && (
                    <View
                      style={[
                        styles.bentoTile,
                        { backgroundColor: "#f0fdf4", borderColor: "#bbf7d0" },
                      ]}
                    >
                      <View
                        style={[
                          styles.iconBox,
                          { backgroundColor: "#dcfce7" },
                        ]}
                      >
                        <Feather name="shield" size={17} color="#16a34a" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.tileTitle,
                            { color: "#166534", fontWeight: "700" },
                          ]}
                        >
                          Admin Audit Access
                        </Text>
                        <Text
                          style={{
                            fontSize: 11,
                            color: "#15803d",
                            marginTop: 2,
                          }}
                        >
                          Global read-only observation mode.
                        </Text>
                      </View>
                    </View>
                  )}

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

                  {/* 3. Archive Hub (Managers & Admins) */}
                  {canArchive && (
                    <TouchableOpacity
                      style={styles.bentoTile}
                      onPress={handleArchive}
                      activeOpacity={0.7}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={
                        isArchived ? "Unarchive Course Hub" : "Archive Course Hub"
                      }
                    >
                      <View
                        style={[
                          styles.iconBox,
                          { backgroundColor: BENTO.amberSoft },
                        ]}
                      >
                        <Feather
                          name={isArchived ? "rotate-ccw" : "archive"}
                          size={17}
                          color={BENTO.amberIcon}
                        />
                      </View>
                      <Text style={styles.tileTitle}>
                        {isArchived ? "Unarchive Course Hub" : "Archive Course Hub"}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Section 2: Danger Zone Bento Tiles */}
              {(!isAdmin || canDelete) && (
                <View style={styles.sectionBlock}>
                  <Text style={[styles.sectionLabel, styles.dangerSectionLabel]}>
                    DANGER ZONE
                  </Text>

                  <View style={styles.bentoStack}>
                    {/* Leave Hub (Only for enrolled students/teachers, not global admin) */}
                    {!isAdmin && (
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
                    )}

                    {/* Delete Hub (Lead Teacher, Manager & Admin) */}
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
              )}

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
          )}
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
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BENTO.neutralSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
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
