import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

import { AdminUser, RoleAction, UpdateAdminStudentProfilePayload } from "../../types";
import { EditStudentProfileModal } from "./EditStudentProfileModal";

interface AdministrativeActionsCardProps {
  user: AdminUser;
  onUpdateRole: (userId: string, action: RoleAction) => void;
  onUpdateStudentProfile?: (
    userId: string,
    data: UpdateAdminStudentProfilePayload,
  ) => Promise<any> | void;
  isUpdatingProfile?: boolean;
  onDelete?: (userId: string, name: string, isRestricted?: boolean) => void;
  onToggleRestrict?: (userId: string, name: string, isRestricted?: boolean) => void;
  isUpdatingRole: boolean;
  isDeletingUser?: boolean;
  isRestrictingUser?: boolean;
}

export const AdministrativeActionsCard = React.memo(
  ({
    user,
    onUpdateRole,
    onUpdateStudentProfile,
    isUpdatingProfile = false,
    onDelete,
    onToggleRestrict,
    isUpdatingRole,
    isDeletingUser,
    isRestrictingUser,
  }: AdministrativeActionsCardProps) => {
    const isStudent = user.role === "STUDENT";
    const isCR = user.studentProfile?.isCR;
    const handleRestrict = onToggleRestrict || onDelete;
    const isBusy = isRestrictingUser ?? isDeletingUser;

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    return (
      <View style={styles.detailSectionCard}>
        {/* Section Header */}
        <View style={styles.detailSectionHeader}>
          <View style={styles.detailSectionHeaderLeft}>
            <View style={styles.detailSectionIconBoxDark}>
              <Ionicons name="shield" size={13} color="#0F172A" />
            </View>
            <Text style={styles.detailSectionTitle}>
              ADMINISTRATIVE ACTIONS
            </Text>
          </View>
        </View>

        {/* 1. Edit Student Profile Button (Primary Dark Slate with emerald/cyan accent) */}
        {isStudent && (
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            activeOpacity={0.85}
            onPress={() => setIsEditModalOpen(true)}
            disabled={isBusy || isUpdatingProfile || isUpdatingRole}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Edit Student Profile"
          >
            <View style={styles.btnContentRow}>
              <View style={styles.btnIconTextGroup}>
                <View style={styles.primaryIconCircle}>
                  <Feather name="edit-3" size={15} color="#34D399" />
                </View>
                <View style={{ flexShrink: 1 }}>
                  <Text style={styles.btnTextWhite}>Edit Student Profile</Text>
                  <Text style={styles.btnSubtextMuted}>
                    Personal, Academic, Roles & Links
                  </Text>
                </View>
              </View>
              <View style={styles.actionArrowBadge}>
                <Feather name="chevron-right" size={15} color="#94A3B8" />
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* 2. Student Special Roles (CR) */}
        {isStudent && (
          <TouchableOpacity
            style={styles.adminActionBtnNavy}
            activeOpacity={0.85}
            onPress={() =>
              onUpdateRole(user.id, isCR ? "REMOVE_ROLE" : "MAKE_CR")
            }
            disabled={isUpdatingRole || isUpdatingProfile}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={
              isCR ? "Remove Class Representative" : "Make Class Representative"
            }
          >
            <Ionicons
              name="ribbon"
              size={18}
              color="#FBBF24"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.adminActionBtnNavyText}>
              {isCR
                ? "Remove Class Representative"
                : "Make Class Representative"}
            </Text>
          </TouchableOpacity>
        )}

        {/* 3. Restrict / Unrestrict Account */}
        {user.isRestricted ? (
          <TouchableOpacity
            style={styles.adminActionBtnEmerald}
            activeOpacity={0.85}
            onPress={() => handleRestrict?.(user.id, user.name, user.isRestricted)}
            disabled={isBusy || isUpdatingRole || isUpdatingProfile}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Unrestrict Account"
          >
            <Feather
              name="check-circle"
              size={17}
              color="#059669"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.adminActionBtnEmeraldText}>
              Unrestrict Account
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.adminActionBtnRose}
            activeOpacity={0.85}
            onPress={() => handleRestrict?.(user.id, user.name, user.isRestricted)}
            disabled={isBusy || isUpdatingRole || isUpdatingProfile}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Restrict Account"
          >
            <Feather
              name="slash"
              size={17}
              color="#E11D48"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.adminActionBtnRoseText}>
              Restrict Account
            </Text>
          </TouchableOpacity>
        )}

        {/* Edit Student Profile Modal */}
        {isStudent && (
          <EditStudentProfileModal
            visible={isEditModalOpen}
            user={user}
            onClose={() => setIsEditModalOpen(false)}
            onSave={onUpdateStudentProfile || (() => {})}
            isSaving={isUpdatingProfile}
          />
        )}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  detailSectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#64748B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  detailSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  detailSectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailSectionIconBoxDark: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  detailSectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
    letterSpacing: 0.8,
  },
  adminActionBtnNavy: {
    backgroundColor: "#1E222B",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  adminActionBtnNavyText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  adminActionBtnRose: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  adminActionBtnRoseText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#E11D48",
  },
  adminActionBtnEmerald: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  adminActionBtnEmeraldText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#059669",
  },
  actionBtnPrimary: {
    backgroundColor: "#0F172A",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(52, 211, 153, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  btnContentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  btnIconTextGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  btnTextWhite: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  btnSubtextMuted: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
    marginTop: 2,
  },
  actionArrowBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
