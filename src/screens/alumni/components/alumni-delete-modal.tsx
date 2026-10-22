import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { BENTO, fontFamily } from "../constants";
import { AlumniItem } from "../types";
import { getDeptTheme, getInitials } from "../utils";

interface AlumniDeleteModalProps {
  visible: boolean;
  alumni: AlumniItem | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const AlumniDeleteModal: React.FC<AlumniDeleteModalProps> = ({
  visible,
  alumni,
  isDeleting,
  onConfirm,
  onClose,
}) => {
  if (!visible || !alumni) return null;

  const deptTheme = getDeptTheme(alumni.department);
  const roleCompany = [
    alumni.currentPosition || alumni.designation,
    alumni.currentCompany,
  ]
    .filter(Boolean)
    .join(" at ");

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <View style={styles.overlay}>
        {/* Backdrop Dismiss */}
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessible={false}
        />

        <View style={styles.dialogCard}>
          {/* Warning Icon Box */}
          <View style={styles.iconCircle}>
            <Feather name="trash-2" size={24} color={BENTO.rose} />
          </View>

          <Text style={styles.dialogTitle}>Delete Alumni Profile</Text>
          <Text style={styles.dialogSubtitle}>
            Are you sure you want to permanently remove this alumnus from the university directory?
            This operation cannot be undone.
          </Text>

          {/* Profile Snapshot Card */}
          <View style={styles.snapshotCard}>
            <View
              style={[
                styles.avatarCircle,
                {
                  backgroundColor: deptTheme.bg,
                  borderColor: deptTheme.border,
                },
              ]}
            >
              <Text style={[styles.avatarText, { color: deptTheme.text }]}>
                {getInitials(alumni.name)}
              </Text>
            </View>

            <View style={styles.snapshotInfo}>
              <Text style={styles.snapshotName} numberOfLines={1}>
                {alumni.name}
              </Text>
              {roleCompany ? (
                <Text style={styles.snapshotRole} numberOfLines={1}>
                  {roleCompany}
                </Text>
              ) : null}
              <View style={styles.metaRow}>
                <View
                  style={[
                    styles.deptPill,
                    { backgroundColor: deptTheme.bg },
                  ]}
                >
                  <Text style={[styles.deptPillText, { color: deptTheme.text }]}>
                    {deptTheme.badge}
                  </Text>
                </View>
                {alumni.batch ? (
                  <Text style={styles.batchPillText}>{alumni.batch}</Text>
                ) : null}
                {alumni.graduationYear ? (
                  <Text style={styles.yearPillText}>
                    Class of {alumni.graduationYear}
                  </Text>
                ) : null}
              </View>
            </View>
          </View>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
              disabled={isDeleting}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Cancel deletion"
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.deleteBtn, isDeleting && styles.disabledBtn]}
              onPress={onConfirm}
              disabled={isDeleting}
              activeOpacity={0.85}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="Confirm delete alumni profile"
            >
              {isDeleting ? (
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
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  dialogCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: BENTO.card,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: BENTO.roseBg,
    borderWidth: 1,
    borderColor: BENTO.roseBorder,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  dialogTitle: {
    fontFamily,
    fontSize: 18,
    fontWeight: "800",
    color: BENTO.navy,
    marginBottom: 6,
    textAlign: "center",
  },
  dialogSubtitle: {
    fontFamily,
    fontSize: 13,
    color: BENTO.slate,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 6,
  },
  snapshotCard: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: BENTO.surfaceSecondary,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    marginBottom: 20,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  avatarText: {
    fontFamily,
    fontSize: 15,
    fontWeight: "800",
  },
  snapshotInfo: {
    flex: 1,
  },
  snapshotName: {
    fontFamily,
    fontSize: 15,
    fontWeight: "700",
    color: BENTO.navy,
    marginBottom: 2,
  },
  snapshotRole: {
    fontFamily,
    fontSize: 12,
    fontWeight: "500",
    color: BENTO.slate,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  deptPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  deptPillText: {
    fontFamily,
    fontSize: 10,
    fontWeight: "700",
  },
  batchPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO.slateLight,
  },
  yearPillText: {
    fontFamily,
    fontSize: 11,
    fontWeight: "500",
    color: BENTO.slateLight,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.slateSubtle,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "600",
    color: BENTO.navy,
  },
  deleteBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: BENTO.rose,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    fontFamily,
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  disabledBtn: {
    opacity: 0.65,
  },
});
