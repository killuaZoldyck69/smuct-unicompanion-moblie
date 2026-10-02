import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { HubRole } from "@/types/member.types";
import { BENTO, fontFamily, ROLE_CONFIG } from "../constants";

interface RoleSelectorSectionProps {
  currentRole: HubRole;
  availableRoles: HubRole[];
  isPending: boolean;
  onSelectRole: (role: HubRole) => void;
}

export const RoleSelectorSection = React.memo(function RoleSelectorSection({
  currentRole,
  availableRoles,
  isPending,
  onSelectRole,
}: RoleSelectorSectionProps) {
  return (
    <View style={styles.sectionWrap}>
      <Text style={styles.sectionTitle}>MANAGE ROLE</Text>

      <View style={styles.roleList}>
        {availableRoles.map((role) => {
          const isCurrent = currentRole === role;
          const roleMeta = ROLE_CONFIG[role] || ROLE_CONFIG.STUDENT;

          return (
            <TouchableOpacity
              key={role}
              disabled={isPending || isCurrent}
              style={[styles.roleItem, isCurrent && styles.roleItemCurrent]}
              onPress={() => onSelectRole(role)}
              activeOpacity={0.7}
            >
              <View style={[styles.roleIconCircle, { backgroundColor: roleMeta.bg }]}>
                <Feather name={roleMeta.icon} size={15} color={roleMeta.color} />
              </View>

              <Text style={[styles.roleTitle, isCurrent && styles.roleTitleCurrent]}>
                {roleMeta.title}
              </Text>

              {isCurrent ? (
                <View style={styles.currentBadge}>
                  <Feather
                    name="check"
                    size={12}
                    color={BENTO.mintText}
                    style={styles.checkIcon}
                  />
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              ) : null}

              {isPending && isCurrent ? (
                <ActivityIndicator
                  size="small"
                  color={BENTO.navy}
                  style={styles.spinner}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  sectionWrap: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily,
    fontSize: 11,
    fontWeight: "800",
    color: BENTO.slateLight,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  roleList: {
    gap: 8,
  },
  roleItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BENTO.border,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  roleItemCurrent: {
    backgroundColor: BENTO.mintSoft,
    borderColor: BENTO.mintBorder,
  },
  roleIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  roleTitle: {
    flex: 1,
    fontFamily,
    fontSize: 13.5,
    fontWeight: "600",
    color: BENTO.navy,
  },
  roleTitleCurrent: {
    fontWeight: "700",
    color: BENTO.mintText,
  },
  currentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BENTO.card,
    borderWidth: 1,
    borderColor: BENTO.mintBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  checkIcon: {
    marginRight: 3,
  },
  currentBadgeText: {
    fontFamily,
    fontSize: 10.5,
    fontWeight: "700",
    color: BENTO.mintText,
  },
  spinner: {
    marginLeft: 6,
  },
});
