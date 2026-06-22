import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { typography } from "../../../theme/typography";
import { rounded, spacing } from "../../../theme/layout";

interface Props {
  isVisible: boolean;
  onClose: () => void;
  selectedMember: any;
  myRole: string;
  myUserId: string;
  onUpdateRole: (role: string) => void;
  onRemoveMember: () => void;
  isPending: boolean;
}

export default function ManageMemberModal({
  isVisible,
  onClose,
  selectedMember,
  myRole,
  myUserId,
  onUpdateRole,
  onRemoveMember,
  isPending,
}: Props) {
  if (!selectedMember) return null;

  const isSelf = selectedMember.user.id === myUserId;
  const isTargetTeacher = selectedMember.role === "TEACHER";
  const isManager = ["TEACHER", "CR", "TA"].includes(myRole);

  // Security Lock UI: Only a TEACHER can modify a TEACHER.
  // Blocks CRs and TAs from touching the instructor.
  const isBlocked = !isSelf && isTargetTeacher && myRole !== "TEACHER";

  // Failsafe: If a regular STUDENT somehow opens the modal on someone else
  const hasNoPermission = !isManager && !isSelf;

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {isSelf
              ? "My Hub Settings"
              : `Manage: ${selectedMember?.user?.name}`}
          </Text>

          {hasNoPermission ? (
            <View style={styles.blockedWarning}>
              <Feather
                name="info"
                size={24}
                color={colors.outline}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.blockedText}>
                You do not have administrative permissions to manage members.
              </Text>
            </View>
          ) : isBlocked ? (
            <View style={styles.blockedWarning}>
              <Feather
                name="shield"
                size={24}
                color={colors.outline}
                style={{ marginBottom: 8 }}
              />
              <Text style={styles.blockedText}>
                As a{" "}
                {myRole === "TA"
                  ? "Teaching Assistant"
                  : "Class Representative"}
                , you do not have permission to modify or remove course
                instructors.
              </Text>
            </View>
          ) : (
            <>
              {/* Only show Role assignment if not modifying yourself */}
              {!isSelf && (
                <View style={styles.rolesContainer}>
                  {["STUDENT", "TA", "CR"].map((role) => {
                    const isSelected = selectedMember?.role === role;
                    return (
                      <TouchableOpacity
                        key={role}
                        disabled={isPending}
                        style={[
                          styles.roleBtn,
                          isSelected && styles.roleBtnSelected,
                        ]}
                        onPress={() => onUpdateRole(role)}
                      >
                        <Text
                          style={[
                            styles.roleText,
                            isSelected && styles.roleTextSelected,
                          ]}
                        >
                          Make {role}
                        </Text>
                        {isSelected && isPending && (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {/* Destructive Action (Leave or Remove) */}
              <TouchableOpacity
                style={styles.destructiveBtn}
                onPress={onRemoveMember}
                disabled={isPending}
              >
                <Feather
                  name={isSelf ? "log-out" : "user-x"}
                  size={18}
                  color={colors.error}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.destructiveText}>
                  {isSelf ? "Leave this Class" : "Remove from Class"}
                </Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={onClose}
            disabled={isPending}
          >
            <Text style={styles.cancelBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surfaceContainerLowest,
    padding: 24,
    borderRadius: rounded.xl,
  },
  modalTitle: {
    ...typography.titleLg,
    fontWeight: "700",
    marginBottom: 16,
    color: colors.onSurface,
  },

  blockedWarning: {
    padding: 16,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
    alignItems: "center",
  },
  blockedText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
  },

  rolesContainer: { gap: 12, marginBottom: spacing.stackLg },
  roleBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: rounded.md,
    borderWidth: 1,
    borderColor: colors.surfaceContainerHighest,
    backgroundColor: "transparent",
  },
  roleBtnSelected: {
    borderColor: colors.primaryContainer,
    backgroundColor: colors.primaryContainer + "10",
  },
  roleText: { ...typography.labelMd, color: colors.onSurface },
  roleTextSelected: { color: colors.primary, fontWeight: "700" },

  destructiveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: rounded.md,
    backgroundColor: colors.error + "15",
    borderWidth: 1,
    borderColor: colors.error + "30",
  },
  destructiveText: {
    ...typography.labelMd,
    fontWeight: "700",
    color: colors.error,
  },

  cancelBtn: {
    marginTop: 12,
    padding: 16,
    alignItems: "center",
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: rounded.md,
  },
  cancelBtnText: {
    ...typography.labelMd,
    fontWeight: "700",
    color: colors.onSurface,
  },
});
