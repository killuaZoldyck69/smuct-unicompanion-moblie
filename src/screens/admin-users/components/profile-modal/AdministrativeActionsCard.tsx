import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

import { AdminUser, RoleAction } from "../../types";

interface AdministrativeActionsCardProps {
  user: AdminUser;
  onUpdateRole: (userId: string, action: RoleAction) => void;
  onDelete: (userId: string, name: string) => void;
  isUpdatingRole: boolean;
  isDeletingUser: boolean;
}

export const AdministrativeActionsCard = React.memo(
  ({
    user,
    onUpdateRole,
    onDelete,
    isUpdatingRole,
    isDeletingUser,
  }: AdministrativeActionsCardProps) => {
    const isStudent = user.role === "STUDENT";
    const isCR = user.studentProfile?.isCR;

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

        {/* Student Special Roles (CR) */}
        {isStudent && (
          <TouchableOpacity
            style={styles.adminActionBtnNavy}
            activeOpacity={0.85}
            onPress={() =>
              onUpdateRole(user.id, isCR ? "REMOVE_ROLE" : "MAKE_CR")
            }
            disabled={isUpdatingRole}
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

        {/* Permanently Delete Account (Soft Rose) */}
        <TouchableOpacity
          style={styles.adminActionBtnRose}
          activeOpacity={0.85}
          onPress={() => onDelete(user.id, user.name)}
          disabled={isDeletingUser}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Permanently Delete Account"
        >
          <Feather
            name="trash-2"
            size={17}
            color="#E11D48"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.adminActionBtnRoseText}>
            Permanently Delete Account
          </Text>
        </TouchableOpacity>
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
});
